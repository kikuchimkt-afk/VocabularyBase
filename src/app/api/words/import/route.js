import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// 意味が空の場合のみGeminiで意味を生成（軽量な呼び出し）
async function generateMeanings(english) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  try {
    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `英単語「${english}」の主な日本語の意味を2〜3個、JSON配列のみで返してください。例: ["意味する","〜を意味する"]` }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
      }),
    });
    if (res.ok) {
      const d = await res.json();
      const raw = d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const arrMatch = raw.match(/\[[\s\S]*\]/);
      if (arrMatch) return JSON.parse(arrMatch[0]);
    }
  } catch (e) {
    console.error('Gemini meaning gen error:', e);
  }
  return null;
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

    // ===== Phase 1: 単語をパース =====
    const parsedWords = [];
    for (const wordData of words) {
      const english = (wordData.english || '').trim();
      const meaningsRaw = (wordData.meanings || '').trim();
      const exampleSentence = (wordData.example || '').trim();
      const allowReassign = wordData.reassign !== false;

      if (!english) continue;

      let meanings = meaningsRaw
        ? meaningsRaw.split(/[,、，]/).map(m => m.trim()).filter(Boolean)
        : [];

      // 意味が空の場合のみGeminiで意味を生成
      if (meanings.length === 0) {
        const generated = await generateMeanings(english);
        if (generated && generated.length > 0) {
          meanings = generated;
        }
      }

      if (meanings.length === 0) {
        // 意味を生成できなかった場合はスキップ
        continue;
      }

      parsedWords.push({ english, meanings, example: exampleSentence, allowReassign });
    }

    // ===== Phase 2: TTS音声を並列生成（単語音声のみ） =====
    const origin = request.headers.get('origin') || request.headers.get('host');
    const baseUrl = origin?.startsWith('http') ? origin : `https://${origin}`;

    await Promise.all(parsedWords.map(async (pw) => {
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
    }));

    // ===== Phase 3: DB登録 =====
    const results = [];
    let totalSuccess = 0;
    const registeredWordIds = []; // 後で例文生成するためにIDを収集

    for (const pw of parsedWords) {
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
          if (pw.example) updateData.example_sentence = pw.example;
          if (pw.wordAudioUrl) updateData.word_audio_url = pw.wordAudioUrl;

          const { error } = await supabase
            .from('vb_words')
            .update(updateData)
            .eq('id', existing[0].id);

          if (!error) {
            wordUpdated++;
            if (!pw.example) registeredWordIds.push(existing[0].id);
          }
          continue;
        }

        const { data: inserted, error } = await supabase.from('vb_words').insert({
          student_id: student.id,
          english: pw.english,
          meanings: pw.meanings,
          example_sentence: pw.example || null,
          example_sentence_ja: null,
          word_audio_url: pw.wordAudioUrl || null,
          sentence_audio_url: null,
          assigned_date: assignedDate,
          assigned_by: 'teacher',
          assign_count: 1,
        }).select('id').single();

        if (!error) {
          wordSuccess++;
          if (!pw.example && inserted) registeredWordIds.push(inserted.id);
        }
      }

      totalSuccess += (wordSuccess > 0 || wordUpdated > 0) ? 1 : 0;
      let statusText = '';
      if (wordSuccess > 0 && wordUpdated > 0) {
        statusText = `✅ ${wordSuccess}名に新規, ${wordUpdated}名に再出題`;
      } else if (wordSuccess > 0) {
        statusText = `✅ ${wordSuccess}名に登録`;
      } else if (wordUpdated > 0) {
        statusText = `🔄 ${wordUpdated}名に再出題`;
      } else if (wordSkipped > 0) {
        statusText = `⏭️ スキップ（再出題OFF）`;
      } else {
        statusText = '⚠️ 処理なし';
      }

      results.push({
        word: pw.english,
        meanings: pw.meanings.join(', '),
        status: statusText,
        hasExample: !!pw.example,
      });
    }

    return NextResponse.json({
      results,
      summary: { total: words.length, success: totalSuccess, students: students.length },
      wordIdsNeedingExamples: registeredWordIds, // 例文生成が必要なWord IDリスト
    });
  } catch (error) {
    console.error('Word import error:', error);
    return NextResponse.json({ error: `処理エラー: ${error.message}` }, { status: 500 });
  }
}
