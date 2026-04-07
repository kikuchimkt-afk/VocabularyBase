const fs = require('fs');

const API_KEY = 'AIzaSyCMWrbgxcApqsA-8EorrvwPRCfC-_LayVs';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// CSV読み込み
const csv = fs.readFileSync('C:\\Users\\makoto\\Documents\\アプリ開発\\VocabularyBase\\単語リスト\\単語テスト作成_LEAP.csv', 'utf8');
const lines = csv.trim().split('\n');

// 意味をクリーニング: [自][他][名][形][副][接][前]等の品詞表記、①②③等の番号を削除し、2つの訳に絞る
function cleanMeaning(raw) {
  let m = raw.trim();
  // 品詞タグ除去: [自] [他] [名] [形] [副] [接] [前] [動] [代] など
  m = m.replace(/\[自\]|\[他\]|\[名\]|\[形\]|\[副\]|\[接\]|\[前\]|\[動\]|\[代\]|\[助\]/g, '');
  // ①②③等の番号除去
  m = m.replace(/[①②③④⑤⑥⑦⑧⑨⑩]/g, '');
  // 括弧内の補足を除去: （...）
  m = m.replace(/（[^）]*）/g, '');
  // 連続スペース・先頭末尾の空白
  m = m.replace(/\s+/g, ' ').trim();

  // カンマや「，」で分割し、最初の2つに絞る
  const parts = m.split(/[,，、]/).map(s => s.trim()).filter(s => s.length > 0);
  return parts.slice(0, 2).join('、');
}

const allWords = [];
for (const line of lines) {
  const cleaned = line.replace(/^\uFEFF/, '');
  const idx = cleaned.indexOf(',');
  if (idx < 0) continue;
  const rank = parseInt(cleaned.slice(0, idx));
  if (isNaN(rank)) continue;
  const rest = cleaned.slice(idx + 1);
  const idx2 = rest.indexOf(',');
  if (idx2 < 0) continue;
  const word = rest.slice(0, idx2).trim();
  const rawMeaning = rest.slice(idx2 + 1).trim();
  allWords.push({ rank, word, meaning: cleanMeaning(rawMeaning) });
}

console.log(`Total words: ${allWords.length}`);
console.log('Sample cleaned meanings:');
for (let i = 0; i < 5; i++) {
  console.log(`  ${allWords[i].rank}. ${allWords[i].word} → ${allWords[i].meaning}`);
}

// 出力ファイル
const OUTPUT_FILE = 'C:\\Users\\makoto\\Documents\\アプリ開発\\VocabularyBase\\public\\wordlist_leap.json';

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
const DELAY_MS = 5000;
const MAX_RETRIES = 3;

async function generateBatch(words) {
  const wordList = words.map(w => `${w.rank}. ${w.word} (${w.meaning})`).join('\n');

  const prompt = `以下の英単語リストに対して、日本の大学入学共通テストレベルの英語例文と日本語訳を生成してください。

ルール:
- 例文は1文で、15語以内
- 共通テストで出そうな自然な文脈（社会、科学、日常生活、環境、文化など）
- 日本語訳は自然な日本語で
- meaningフィールドには提供された意味をそのまま使ってください
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
    throw new Error(`API error ${res.status}: ${err.slice(0, 150)}`);
  }

  const data = await res.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('JSON parse error, raw text:', text.slice(0, 200));
    throw e;
  }
}

async function main() {
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

    if (i < totalBatches - 1) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\nFinal: ${results.length} words saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);
