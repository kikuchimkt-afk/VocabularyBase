import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Gemini API一括呼び出し: 複数単語の意味・例文を一度に生成
async function batchGenerateWithGemini(wordsToGenerate) {
  if (wordsToGenerate.length === 0) return {};

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  
  const wordsList = wordsToGenerate.map((w, i) => {
    let desc = `${i + 1}. "${w.english}"`;
    if (w.meanings.length > 0) desc += `（意味: ${w.meanings.join(', ')}）`;
    if (w.example) desc += `（例文: ${w.example}）`;
    return desc;
  }).join('\n');

  const prompt = `以下の英単語リストについて、不足している情報を補完してください。

${wordsList}

各単語について以下を生成してください：
- meanings: 意味が未指定の場合、主な日本語訳を2〜3個の配列で
- en: 英語例文が未指定の場合、中高生向けの自然な英語例文を1つ
- ja: 例文の日本語訳
- 既に意味が指定されている場合はそれをそのまま使用してください

以下のJSON配列形式のみで返してください（他のテキストは絶対に不要）:
[{"word":"英単語","meanings":["意味1","意味2"],"en":"英語例文","ja":"日本語訳"},...]`;

  try {
    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 4000 },
      }),
    });

    if (!res.ok) {
      console.error('Gemini batch API error:', res.status, await res.text());
      return {};
    }

    const d = await res.json();
    const raw = d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    
    // JSON配列を抽出
    const arrMatch = raw.match(/\[[\s\S]*\]/);
    if (!arrMatch) {
      console.error('Gemini batch: no JSON array found in response');
      return {};
    }

    const parsed = JSON.parse(arrMatch[0]);
    const resultMap = {};
    for (const item of parsed) {
      const key = (item.word || '').toLowerCase().trim();
      if (key) {
        resultMap[key] = {
          meanings: item.meanings || [],
          example: item.en || '',
          exampleJa: item.ja || '',
        };
      }
    }
    return resultMap;
  } catch (e) {
    console.error('Gemini batch error:', e);
    return {};
  }
}

export async function POST(request) {
  const session = request.cookies.get('admin_session');
  if (!session) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
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

    const { data: students } = await supabase
      .from('vb_students')
      .select('id, name')
      .in('id', studentIds);

    // ===== Phase 1: 全単語をパースし、Gemini生成が必要な単語を収集 =====
    const parsedWords = [];
    const wordsNeedingGeneration = [];

    for (const wordData of words) {
      const english = (wordData.english || '').trim();
      const meaningsRaw = (wordData.meanings || '').trim();
      const exampleSentence = (wordData.example || '').trim();
      const allowReassign = wordData.reassign !== false;

      if (!english) continue;

      const meanings = meaningsRaw
        ? meaningsRaw.split(/[,、，]/).map(m => m.trim()).filter(Boolean)
        : [];

      const pw = { english, meanings, example: exampleSentence, allowReassign };
      parsedWords.push(pw);

      // 意味または例文が不足している単語をGemini生成対象に
      if (meanings.length === 0 || !exampleSentence) {
        wordsNeedingGeneration.push(pw);
      }
    }

    // ===== Phase 2: Geminiで一括生成 =====
    const geminiResults = await batchGenerateWithGemini(wordsNeedingGeneration);

    // Gemini結果をマージ
    for (const pw of parsedWords) {
      const gen = geminiResults[pw.english.toLowerCase()];
      if (!gen) continue;

      if (pw.meanings.length === 0 && gen.meanings?.length > 0) {
        pw.meanings = gen.meanings;
      }
      if (!pw.example && gen.example) {
        pw.example = gen.example;
        pw.exampleJa = gen.exampleJa || '';
      } else if (pw.example && !pw.exampleJa) {
        pw.exampleJa = gen.exampleJa || '';
      }
    }

    // 例文のあるが日本語訳がない単語の翻訳（Gemini一括で対応済みなのでスキップ可能な場合が多い）

    // ===== Phase 3: TTS音声を並列生成 =====
    const origin = request.headers.get('origin') || request.headers.get('host');
    const baseUrl = origin?.startsWith('http') ? origin : `https://${origin}`;

    const ttsPromises = parsedWords.map(async (pw) => {
      if (pw.meanings.length === 0) return; // 意味のない単語はスキップ

      // 単語音声
      try {
        const res = await fetch(`${baseUrl}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: pw.english }),
        });
        if (res.ok) {
          const d = await res.json();
          pw.wordAudioUrl = d.url;
        }
      } catch {}

      // 例文音声
      if (pw.example) {
        try {
          const res = await fetch(`${baseUrl}/api/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: pw.example }),
          });
          if (res.ok) {
            const d = await res.json();
            pw.sentenceAudioUrl = d.url;
          }
        } catch {}
      }
    });

    await Promise.all(ttsPromises);

    // ===== Phase 4: DB登録 =====
    const results = [];
    let totalSuccess = 0;

    for (const pw of parsedWords) {
      if (pw.meanings.length === 0) {
        results.push({ word: pw.english, status: '⚠️ 意味の生成に失敗', detail: 'スキップ' });
        continue;
      }

      let wordSuccess = 0;
      let wordUpdated = 0;
      let wordSkipped = 0;

      for (const student of students) {
        const { data: existing } = await supabase
          .from('vb_words')
          .select('id, assign_count')
          .eq('student_id', student.id)
          .ilike('english', pw.english)
          .limit(1);

        if (existing && existing.length > 0) {
          if (!pw.allowReassign) {
            wordSkipped++;
            continue;
          }
          const currentCount = existing[0].assign_count || 1;
          const updateData = {
            assigned_date: assignedDate,
            assign_count: currentCount + 1,
          };
          if (pw.meanings.length > 0) updateData.meanings = pw.meanings;
          if (pw.example) {
            updateData.example_sentence = pw.example;
            updateData.example_sentence_ja = pw.exampleJa || '';
          }
          if (pw.wordAudioUrl) updateData.word_audio_url = pw.wordAudioUrl;
          if (pw.sentenceAudioUrl) updateData.sentence_audio_url = pw.sentenceAudioUrl;

          const { error } = await supabase
            .from('vb_words')
            .update(updateData)
            .eq('id', existing[0].id);

          if (!error) wordUpdated++;
          continue;
        }

        const { error } = await supabase.from('vb_words').insert({
          student_id: student.id,
          english: pw.english,
          meanings: pw.meanings,
          example_sentence: pw.example || null,
          example_sentence_ja: pw.exampleJa || null,
          word_audio_url: pw.wordAudioUrl || null,
          sentence_audio_url: pw.sentenceAudioUrl || null,
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
        word: pw.english,
        meanings: pw.meanings.join(', '),
        status: statusText,
        detail: pw.exampleJa ? `訳: ${pw.exampleJa.substring(0, 50)}` : (pw.example ? `例: ${pw.example.substring(0, 50)}` : ''),
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
