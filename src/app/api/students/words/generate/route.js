import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// レート制限対応: リトライ付きGemini呼び出し
async function callGeminiWithRetry(prompt, maxRetries = 3) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      // 指数的バックオフ: 2秒, 4秒, 8秒...
      await new Promise(r => setTimeout(r, 2000 * Math.pow(2, attempt)));
    }

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 400 },
      }),
    });

    if (res.status === 429) {
      console.log(`Gemini 429, retry ${attempt + 1}/${maxRetries}...`);
      continue;
    }

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const d = await res.json();
    return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  }

  throw new Error('Gemini API rate limit - しばらく待ってから再試行してください');
}

export async function POST(request) {
  const session = request.cookies.get('admin_session');
  if (!session) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const { wordId } = await request.json();
    if (!wordId) {
      return NextResponse.json({ error: 'Word ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: word, error: fetchErr } = await supabase
      .from('vb_words')
      .select('id, english, meanings')
      .eq('id', wordId)
      .single();

    if (fetchErr || !word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    const meanings = (word.meanings || []).join(', ');

    const prompt = `英単語「${word.english}」（意味: ${meanings}）を使った自然な英語の例文を1つ作成し、その日本語訳も付けてください。
- 中高生が理解できるレベルの例文にしてください
以下のJSON形式のみで返してください（他のテキストは不要）:
{"en":"英語例文","ja":"日本語訳"}`;

    const raw = await callGeminiWithRetry(prompt);

    let exampleEn = '';
    let exampleJa = '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      exampleEn = parsed.en || '';
      exampleJa = parsed.ja || '';
    }

    if (!exampleEn) {
      return NextResponse.json({ error: '例文の生成に失敗しました' }, { status: 500 });
    }

    // TTS音声を生成
    let sentenceAudioUrl = null;
    try {
      const origin = request.headers.get('origin') || request.headers.get('host');
      const baseUrl = origin?.startsWith('http') ? origin : `https://${origin}`;
      const ttsRes = await fetch(`${baseUrl}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: exampleEn }),
      });
      if (ttsRes.ok) {
        const ttsData = await ttsRes.json();
        sentenceAudioUrl = ttsData.url;
      }
    } catch {}

    const updateData = {
      example_sentence: exampleEn,
      example_sentence_ja: exampleJa,
    };
    if (sentenceAudioUrl) updateData.sentence_audio_url = sentenceAudioUrl;

    const { data: updated, error: updateErr } = await supabase
      .from('vb_words')
      .update(updateData)
      .eq('id', wordId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({ word: updated });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: `${error.message}` }, { status: 500 });
  }
}
