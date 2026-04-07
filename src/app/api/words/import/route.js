import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request) {
  const session = request.cookies.get('admin_session');
  if (!session) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    // JSON形式で受信（クライアント側でパース済み）
    const body = await request.json();
    const { words, studentIds, assignedDate: rawDate } = body;
    const assignedDate = rawDate || new Date().toISOString().split('T')[0];

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ error: '登録する単語がありません' }, { status: 400 });
    }
    if (!studentIds || studentIds.length === 0) {
      return NextResponse.json({ error: '配信先の生徒を選択してください' }, { status: 400 });
    }

    const supabase = createServerClient();

    // 生徒一覧を取得
    const { data: students } = await supabase
      .from('vb_students')
      .select('id, name')
      .in('id', studentIds);

    const results = [];
    let totalSuccess = 0;

    for (const wordData of words) {
      const english = (wordData.english || '').trim();
      const meaningsRaw = (wordData.meanings || '').trim();
      const exampleSentence = (wordData.example || '').trim();
      const allowReassign = wordData.reassign !== false;

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
      let wordUpdated = 0;
      let wordSkipped = 0;
      for (const student of students) {
        // 重複チェック
        const { data: existing } = await supabase
          .from('vb_words')
          .select('id, assign_count')
          .eq('student_id', student.id)
          .ilike('english', english)
          .limit(1);

        if (existing && existing.length > 0) {
          if (!allowReassign) {
            // 再出題無効 → スキップ
            wordSkipped++;
            continue;
          }
          // 既存の単語 → assign_count をインクリメント + assigned_date を更新
          const currentCount = existing[0].assign_count || 1;
          const updateData = {
            assigned_date: assignedDate,
            assign_count: currentCount + 1,
          };
          // 意味や例文が新しく提供されていれば更新
          if (meanings.length > 0) updateData.meanings = meanings;
          if (finalExampleSentence) {
            updateData.example_sentence = finalExampleSentence;
            updateData.example_sentence_ja = exampleSentenceJa;
          }
          if (wordAudioUrl) updateData.word_audio_url = wordAudioUrl;
          if (sentenceAudioUrl) updateData.sentence_audio_url = sentenceAudioUrl;

          const { error } = await supabase
            .from('vb_words')
            .update(updateData)
            .eq('id', existing[0].id);

          if (!error) wordUpdated++;
          continue;
        }

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
          assign_count: 1,
        });

        if (!error) wordSuccess++;
      }

      totalSuccess += (wordSuccess > 0 || wordUpdated > 0) ? 1 : 0;
      let statusText = '';
      if (wordSuccess > 0 && wordUpdated > 0) {
        statusText = `✅ ${wordSuccess}名に新規登録, ${wordUpdated}名に再出題`;
      } else if (wordSuccess > 0) {
        statusText = `✅ ${wordSuccess}名に登録`;
      } else if (wordUpdated > 0) {
        statusText = `🔄 ${wordUpdated}名に再出題`;
      } else if (wordSkipped > 0) {
        statusText = `⏭️ ${wordSkipped}名でスキップ（再出題OFF）`;
      } else {
        statusText = '⚠️ 処理なし';
      }

      results.push({
        word: english,
        meanings: meanings.join(', '),
        status: statusText,
        detail: exampleSentenceJa ? `訳: ${exampleSentenceJa.substring(0, 50)}` : (finalExampleSentence ? `例: ${finalExampleSentence.substring(0, 50)}` : ''),
      });
    }

    return NextResponse.json({
      results,
      summary: { total: words.length, success: totalSuccess, students: students.length },
    });
  } catch (error) {
    console.error('Word import error:', error);
    return NextResponse.json({ error: `処理エラー: ${error.message}` }, { status: 500 });
  }
}
