import { NextResponse } from 'next/server';

// Collect all available API keys for fallback
function getApiKeys() {
  const keys = [];
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
  if (process.env.GEMINI_API_KEY_2) keys.push(process.env.GEMINI_API_KEY_2);
  if (process.env.GEMINI_API_KEY_3) keys.push(process.env.GEMINI_API_KEY_3);
  return [...new Set(keys)]; // deduplicate
}

export async function POST(request) {
  try {
    const keys = getApiKeys();
    if (keys.length === 0) {
      return NextResponse.json({ error: 'Gemini APIキーが設定されていません。' }, { status: 500 });
    }

    const body = await request.json();
    const { word } = body;

    if (!word) {
      return NextResponse.json({ error: '英単語が提供されていません。' }, { status: 400 });
    }

    const prompt = `以下の英単語について、中学生・高校生向けの学習アプリとして適切な情報をJSON形式で返してください。

英単語: "${word}"

返却するJSONフォーマット:
{
  "meanings": ["意味1", "意味2", "意味3"],
  "example_sentence": "英語の例文",
  "example_sentence_ja": "例文の日本語訳"
}

注意事項:
- JSON以外のテキストは一切含めないでください。
- 例文は中高生の教科書レベルの適切な難易度にしてください。`;

    // Try each key until one succeeds (using REST API directly)
    let lastError = null;
    for (const key of keys) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
            }
          })
        });

        if (!res.ok) {
          const errData = await res.text();
          throw new Error(`API ${res.status}: ${errData.substring(0, 200)}`);
        }

        const data = await res.json();
        const resultText = data.candidates[0].content.parts[0].text;
        const resultJson = JSON.parse(resultText);
        return NextResponse.json(resultJson);
      } catch (keyError) {
        console.error(`Gemini API Error (key ${key.substring(0, 10)}...):`, keyError.message);
        lastError = keyError;
      }
    }

    return NextResponse.json({ 
      error: '意味と例文の生成に失敗しました。',
      detail: lastError?.message || 'All API keys failed'
    }, { status: 500 });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ 
      error: '意味と例文の生成に失敗しました。',
      detail: error?.message || String(error)
    }, { status: 500 });
  }
}
