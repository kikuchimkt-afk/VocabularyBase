import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the API - use KEY_2 (for single word lookups) with fallback to original
const apiKey = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(request) {
  try {
    if (!ai) {
      return NextResponse.json({ error: 'Gemini APIキーが設定されていません。' }, { status: 500 });
    }

    const body = await request.json();
    const { word } = body;

    if (!word) {
      return NextResponse.json({ error: '英単語が提供されていません。' }, { status: 400 });
    }

    const prompt = `
以下の英単語について、中学生・高校生向けの学習アプリとして適切な情報をJSON形式で返してください。

英単語: "${word}"

返却するJSONフォーマット:
{
  "meanings": ["意味1", "意味2", "意味3"], // 最もよく使われる日本語訳を2〜4つ程度
  "example_sentence": "英語の例文", // この単語を使った自然でわかりやすい英語の例文
  "example_sentence_ja": "例文の日本語訳"
}

注意事項:
- JSON以外のテキストは一切含めないでください。
- 例文は中高生の教科書レベルの適切な難易度にしてください。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    const resultJson = JSON.parse(resultText);

    return NextResponse.json(resultJson);
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: '意味と例文の生成に失敗しました。' }, { status: 500 });
  }
}
