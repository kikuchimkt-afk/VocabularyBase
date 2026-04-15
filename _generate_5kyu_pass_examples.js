const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error('Error: GEMINI_API_KEY environment variable is not set'); process.exit(1); }
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const INPUT_FILE = path.join(__dirname, '単語リスト', '英検5kyuパス単_raw.json');
const OUTPUT_FILE = path.join(__dirname, 'public', 'wordlist_5kyu_pass.json');

if (!fs.existsSync(INPUT_FILE)) { console.error(`入力ファイルが見つかりません: ${INPUT_FILE}`); process.exit(1); }

const allWords = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
console.log(`Total words: ${allWords.length}`);
for (let i = 0; i < Math.min(5, allWords.length); i++) console.log(`  ${allWords[i].rank}. ${allWords[i].word} → ${allWords[i].meaning}`);

let existing = [];
if (fs.existsSync(OUTPUT_FILE)) { try { existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8')); console.log(`Resuming from ${existing.length} words`); } catch (e) { existing = []; } }
const doneRanks = new Set(existing.map(w => w.rank));
const BATCH_SIZE = 25, DELAY_MS = 5000, MAX_RETRIES = 8;

async function generateBatch(words) {
  const wordList = words.map(w => `${w.rank}. ${w.word} (${w.meaning})`).join('\n');
  const prompt = `以下の英単語リストに対して、英検5級レベルの文法と構文を使った英語例文と日本語訳を生成してください。

ルール:
- 例文は1文で、8語以内
- 英検5級で出そうな自然な文脈（自己紹介、家族、学校、食べ物、天気、曜日、趣味など小学生〜中1の日常）
- 単語の意味がわかる文脈で使用すること
- 文法は英検5級レベル（be動詞、一般動詞、can、現在形、疑問文、命令文など基礎的な範囲）
- 日本語訳は自然な日本語で
- meaningフィールドには提供された意味をそのまま使ってください
- JSON配列で返してください。各要素は {"rank": 番号, "word": "単語", "meaning": "意味", "example": "英語例文", "translation": "日本語訳"} の形式

単語リスト:
${wordList}

JSON配列のみを返してください（マークダウンの\`\`\`は不要です）。`;
  const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 16384 } }) });
  if (!res.ok) { const err = await res.text(); throw new Error(`API error ${res.status}: ${err.slice(0, 200)}`); }
  const data = await res.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(text);
}

async function main() {
  const remaining = allWords.filter(w => !doneRanks.has(w.rank));
  console.log(`Remaining: ${remaining.length} words`);
  if (remaining.length === 0) { console.log('All done!'); return; }
  const totalBatches = Math.ceil(remaining.length / BATCH_SIZE);
  let results = [...existing];
  for (let i = 0; i < totalBatches; i++) {
    const batch = remaining.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    console.log(`Batch ${i + 1}/${totalBatches}: ${batch.length} words (rank ${batch[0].rank}-${batch[batch.length-1].rank})...`);
    let success = false;
    for (let retry = 0; retry < MAX_RETRIES; retry++) {
      try {
        const generated = await generateBatch(batch);
        const converted = generated.map(g => ({ rank: g.rank, english: g.word, meanings: g.meaning, example: g.example, exampleJa: g.translation }));
        results.push(...converted);
        results.sort((a, b) => a.rank - b.rank);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
        console.log(`  ✅ Done. Total: ${results.length} words saved.`);
        success = true; break;
      } catch (err) {
        console.error(`  ⚠️ Attempt ${retry + 1}/${MAX_RETRIES}: ${err.message.slice(0, 100)}`);
        if (retry < MAX_RETRIES - 1) { const wait = DELAY_MS * (retry + 2); await new Promise(r => setTimeout(r, wait)); }
      }
    }
    if (!success) { fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results.sort((a, b) => a.rank - b.rank), null, 2)); console.error('Stopping due to repeated failures.'); break; }
    if (i < totalBatches - 1) await new Promise(r => setTimeout(r, DELAY_MS));
  }
  console.log(`\nFinal: ${results.length} words saved to ${OUTPUT_FILE}`);
}
main().catch(console.error);
