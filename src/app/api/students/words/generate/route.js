import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// 使用可能なGeminiモデル（優先順）
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

// 利用可能な全APIキーを取得（テキスト生成用 - 有料キー）
function getApiKeys() {
  const keys = [];
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
  return keys;
}

// 複数APIキー × 複数モデル で順次試行
async function callGeminiWithFallback(prompt) {
  const apiKeys = getApiKeys();
  if (apiKeys.length === 0) throw new Error('GEMINI_API_KEY が設定されていません');

  // キー × モデルの全組み合わせを試行
  for (const apiKey of apiKeys) {
    for (const model of GEMINI_MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const keyLabel = apiKey.slice(-4);

      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt > 0) {
          await new Promise(r => setTimeout(r, 2000));
        }

        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.5, maxOutputTokens: 400 },
            }),
          });

          if (res.status === 429) {
            console.log(`[key:...${keyLabel}][${model}] 429 rate limit, attempt ${attempt + 1}`);
            continue;
          }

          if (res.status === 404 || res.status === 400) {
            console.log(`[key:...${keyLabel}][${model}] ${res.status}, skipping model`);
            break; // 次のモデルへ
          }

          if (!res.ok) {
            console.log(`[key:...${keyLabel}][${model}] error ${res.status}`);
            break;
          }

          const d = await res.json();
          const text = d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          if (text) {
            console.log(`Generated with key:...${keyLabel} model:${model}`);
            return text;
          }
        } catch (e) {
          console.error(`[key:...${keyLabel}][${model}] fetch error`, e.message);
          break;
        }
      }
    }
  }

  throw new Error('すべてのキー・モデルでレート制限に達しました。しばらく待ってから再試行してください。');
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

    const raw = await callGeminiWithFallback(prompt);

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
