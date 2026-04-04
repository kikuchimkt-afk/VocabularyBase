import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function POST(request) {
  const session = request.cookies.get('admin_session');
  if (!session) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const studentIds = JSON.parse(formData.get('studentIds') || '[]');
    const assignedDate = formData.get('assignedDate') || new Date().toISOString().split('T')[0];

    if (!file) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 });
    }
    if (studentIds.length === 0) {
      return NextResponse.json({ error: '配信先の生徒を選択してください' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rows.length === 0) {
      return NextResponse.json({ error: 'データが空です' }, { status: 400 });
    }

    const supabase = createServerClient();

    // 生徒一覧を取得
    const { data: students } = await supabase
      .from('vb_students')
      .select('id, name')
      .in('id', studentIds);

    const results = [];
    let totalSuccess = 0;

    for (const row of rows) {
      const english = (row['english'] || row['英単語'] || row['English'] || row['word'] || '').toString().trim();
      const meaningsRaw = (row['meanings'] || row['意味'] || row['訳'] || '').toString().trim();
      const exampleSentence = (row['example'] || row['例文'] || row['example_sentence'] || '').toString().trim();

      if (!english) {
        results.push({ word: '(空行)', status: 'スキップ', detail: '' });
        continue;
      }

      const meanings = meaningsRaw
        ? meaningsRaw.split(/[,、，]/).map(m => m.trim()).filter(Boolean)
        : [];

      if (meanings.length === 0) {
        results.push({ word: english, status: '⚠️ 意味が空', detail: 'スキップ' });
        continue;
      }

      // Gemini APIで例文生成・翻訳
      let finalExampleSentence = exampleSentence;
      let exampleSentenceJa = '';

      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        if (!exampleSentence) {
          // 例文なし → 英語例文＋日本語訳を両方生成
          const prompt = `英単語「${english}」（意味: ${meanings.join(', ')}）を使った自然な英語の例文を1つ作成し、その日本語訳も付けてください。
以下のJSON形式のみで返してください（他のテキストは不要）:
{"en":"英語例文","ja":"日本語訳"}`;
          const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.5, maxOutputTokens: 300 },
            }),
          });
          if (geminiRes.ok) {
            const d = await geminiRes.json();
            const raw = d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              finalExampleSentence = parsed.en || '';
              exampleSentenceJa = parsed.ja || '';
            }
          }
        } else {
          // 例文あり → 日本語訳のみ生成
          const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `以下の英文を自然な日本語に翻訳してください。翻訳文のみを返してください。\n\n${exampleSentence}` }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 200 },
            }),
          });
          if (geminiRes.ok) {
            const d = await geminiRes.json();
            exampleSentenceJa = d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          }
        }
      } catch (e) {
        console.error('Gemini error for', english, e);
      }

      // TTS音声生成
      let wordAudioUrl = null;
      let sentenceAudioUrl = null;

      try {
        const origin = request.headers.get('origin') || request.headers.get('host');
        const baseUrl = origin?.startsWith('http') ? origin : `http://${origin}`;
        
        const wordRes = await fetch(`${baseUrl}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: english }),
        });
        if (wordRes.ok) {
          const d = await wordRes.json();
          wordAudioUrl = d.url;
        }
      } catch {}

      if (finalExampleSentence) {
        try {
          const origin = request.headers.get('origin') || request.headers.get('host');
          const baseUrl = origin?.startsWith('http') ? origin : `http://${origin}`;
          
          const senRes = await fetch(`${baseUrl}/api/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: finalExampleSentence }),
          });
          if (senRes.ok) {
            const d = await senRes.json();
            sentenceAudioUrl = d.url;
          }
        } catch {}
      }

      // 各生徒に登録
      let wordSuccess = 0;
      for (const student of students) {
        // 重複チェック
        const { data: existing } = await supabase
          .from('vb_words')
          .select('id')
          .eq('student_id', student.id)
          .ilike('english', english)
          .limit(1);

        if (existing && existing.length > 0) continue;

        const { error } = await supabase.from('vb_words').insert({
          student_id: student.id,
          english,
          meanings,
          example_sentence: finalExampleSentence,
          example_sentence_ja: exampleSentenceJa,
          word_audio_url: wordAudioUrl,
          sentence_audio_url: sentenceAudioUrl,
          assigned_date: assignedDate,
          assigned_by: 'teacher',
        });

        if (!error) wordSuccess++;
      }

      totalSuccess += wordSuccess > 0 ? 1 : 0;
      results.push({
        word: english,
        meanings: meanings.join(', '),
        status: wordSuccess > 0 ? `✅ ${wordSuccess}名に登録` : '⚠️ 全員登録済み',
        detail: exampleSentenceJa ? `訳: ${exampleSentenceJa.substring(0, 50)}` : (finalExampleSentence ? `例: ${finalExampleSentence.substring(0, 50)}` : ''),
      });
    }

    return NextResponse.json({
      results,
      summary: { total: rows.length, success: totalSuccess, students: students.length },
    });
  } catch (error) {
    console.error('Word import error:', error);
    return NextResponse.json({ error: `処理エラー: ${error.message}` }, { status: 500 });
  }
}
