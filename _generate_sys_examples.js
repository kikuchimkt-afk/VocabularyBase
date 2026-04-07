const fs = require('fs');

const API_KEY = 'AIzaSyCMWrbgxcApqsA-8EorrvwPRCfC-_LayVs';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// CSV読み込み
const csv = fs.readFileSync('C:\\Users\\makoto\\Documents\\アプリ開発\\VocabularyBase\\単語リスト\\単語テスト作成_システム英単語_5訂版.csv', 'utf8');
const lines = csv.trim().split('\n');
const allWords = lines.map(l => {
  const cleaned = l.replace(/^\uFEFF/, '');
  const idx = cleaned.indexOf(',');
  const rest = cleaned.slice(idx + 1);
  const idx2 = rest.indexOf(',');
  return {
    rank: parseInt(cleaned.slice(0, idx)),
    word: rest.slice(0, idx2),
    meaning: rest.slice(idx2 + 1).trim()
  };
});

console.log(`Total words: ${allWords.length}`);

// 出力ファイル（途中経過を保存）
const OUTPUT_FILE = 'C:\\Users\\makoto\\Documents\\アプリ開発\\VocabularyBase\\public\\wordlist_sys5th.json';

// 既存の進捗を読み込む
let existing = [];
if (fs.existsSync(OUTPUT_FILE)) {
  try {
    existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    console.log(`Resuming from ${existing.length} words already processed`);
  } catch (e) {
    existing = [];
  }
}
const doneRanks = new Set(existing.map(w => w.rank));

const BATCH_SIZE = 50;
const DELAY_MS = 5000; // API制限回避
const MAX_RETRIES = 3;

async function generateBatch(words) {
  const wordList = words.map(w => `${w.rank}. ${w.word} (${w.meaning})`).join('\n');

  const prompt = `以下の英単語リストに対して、日本の大学入学共通テストレベルの英語例文と日本語訳を生成してください。

ルール:
- 例文は1文で、15語以内
- 共通テストで出そうな自然な文脈（社会、科学、日常生活、環境、文化など）
- 日本語訳は自然な日本語で
- JSON配列で返してください。各要素は {"rank": 番号, "word": "単語", "meaning": "意味", "example": "英語例文", "translation": "日本語訳"} の形式

単語リスト:
${wordList}

JSON配列のみを返してください（マークダウンの\`\`\`は不要です）。`;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // JSON抽出（```json ... ``` の場合も対応）
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('JSON parse error, raw text:', text.slice(0, 200));
    throw e;
  }
}

async function main() {
  // 未処理の単語をフィルタ
  const remaining = allWords.filter(w => !doneRanks.has(w.rank));
  console.log(`Remaining: ${remaining.length} words`);

  if (remaining.length === 0) {
    console.log('All words processed!');
    return;
  }

  const totalBatches = Math.ceil(remaining.length / BATCH_SIZE);
  let results = [...existing];

  for (let i = 0; i < totalBatches; i++) {
    const batch = remaining.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    const batchStart = batch[0].rank;
    const batchEnd = batch[batch.length - 1].rank;

    console.log(`Batch ${i + 1}/${totalBatches}: words ${batchStart}-${batchEnd} (${batch.length} words)...`);

    let success = false;
    for (let retry = 0; retry < MAX_RETRIES; retry++) {
      try {
        const generated = await generateBatch(batch);
        results.push(...generated);

        // 途中経過保存
        results.sort((a, b) => a.rank - b.rank);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
        console.log(`  ✅ Done. Total: ${results.length} words saved.`);
        success = true;
        break;
      } catch (err) {
        console.error(`  ⚠️ Attempt ${retry + 1}/${MAX_RETRIES} failed:`, err.message.slice(0, 80));
        if (retry < MAX_RETRIES - 1) {
          const wait = DELAY_MS * (retry + 2);
          console.log(`  Waiting ${wait/1000}s before retry...`);
          await new Promise(r => setTimeout(r, wait));
        }
      }
    }
    if (!success) {
      console.error(`  ❌ Failed after ${MAX_RETRIES} retries. Saving progress...`);
      results.sort((a, b) => a.rank - b.rank);
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
      break;
    }

    // APIレート制限を避ける
    if (i < totalBatches - 1) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\nFinal: ${results.length} words saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);
