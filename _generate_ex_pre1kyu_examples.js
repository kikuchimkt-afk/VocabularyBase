const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error('Error: GEMINI_API_KEY environment variable is not set'); process.exit(1); }
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

const DIR = path.join(__dirname, '単語リスト', 'EX準一級');
const BATCH_SIZE = 25;
const DELAY_MS = 10000;
const MAX_RETRIES = 8;

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const lines = content.trim().split(/\r?\n/);
  // header: word,meaning
  const words = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Handle quoted fields
    let word, meaning, example, translation;
    const quotedMatch = line.match(/^"?([^",]+)"?,(.+)$/);
    if (quotedMatch) {
      word = quotedMatch[1].trim();
      const rest = quotedMatch[2];
      // Check if there are already example and translation columns
      // Expected: word,meaning  OR  word,meaning,example,translation
      const parts = rest.split(',');
      meaning = parts[0] ? parts[0].replace(/^"|"$/g, '').trim() : '';
      example = parts[1] ? parts[1].replace(/^"|"$/g, '').trim() : '';
      translation = parts[2] ? parts[2].replace(/^"|"$/g, '').trim() : '';
    } else {
      const parts = line.split(',');
      word = (parts[0] || '').trim();
      meaning = (parts[1] || '').trim();
      example = (parts[2] || '').trim();
      translation = (parts[3] || '').trim();
    }
    if (!word) continue;
    words.push({ word, meaning, example, translation, lineIndex: i });
  }
  return words;
}

async function generateBatch(words) {
  const wordList = words.map((w, i) => `${i + 1}. ${w.word} (${w.meaning})`).join('\n');
  const prompt = `以下の英単語リストに対して、日本の大学入学共通テストレベルの文法と構文を使った英語例文と日本語訳を生成してください。

ルール:
- 例文は1文で、15語以内
- 共通テストで出そうな自然な文脈（社会、科学、日常生活、環境、文化など）
- 単語の意味がわかる文脈で使用すること
- 文法・構文は共通テストレベル（関係代名詞、分詞構文、仮定法、比較など高校で学ぶ範囲）
- 日本語訳は自然な日本語で
- JSON配列で返してください。各要素は {"word": "単語", "example": "英語例文", "translation": "日本語訳"} の形式

単語リスト:
${wordList}

JSON配列のみを返してください（マークダウンの\`\`\`は不要です）。`;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 16384 }
    })
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`API error ${res.status}: ${err.slice(0, 200)}`); }
  const data = await res.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(text);
}

async function processFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n📄 Processing: ${fileName}`);

  const words = parseCSV(filePath);
  console.log(`   Total words: ${words.length}`);

  // Check which words already have examples
  const needExamples = words.filter(w => !w.example);
  console.log(`   Need examples: ${needExamples.length}`);
  if (needExamples.length === 0) { console.log('   ⏭️ All done, skipping.'); return; }

  const totalBatches = Math.ceil(needExamples.length / BATCH_SIZE);

  for (let i = 0; i < totalBatches; i++) {
    const batch = needExamples.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    console.log(`   Batch ${i + 1}/${totalBatches}: ${batch.length} words...`);
    let success = false;
    for (let retry = 0; retry < MAX_RETRIES; retry++) {
      try {
        const generated = await generateBatch(batch);
        // Merge results back
        for (const gen of generated) {
          const match = words.find(w => w.word.toLowerCase() === gen.word.toLowerCase());
          if (match) {
            match.example = gen.example;
            match.translation = gen.translation;
          }
        }
        success = true;
        console.log(`   ✅ Done.`);
        break;
      } catch (err) {
        console.error(`   ⚠️ Attempt ${retry + 1}/${MAX_RETRIES}: ${err.message.slice(0, 100)}`);
        if (retry < MAX_RETRIES - 1) { await new Promise(r => setTimeout(r, DELAY_MS * (retry + 2))); }
      }
    }
    if (!success) { console.error(`   ❌ Failed batch after ${MAX_RETRIES} retries.`); }
    if (i < totalBatches - 1) await new Promise(r => setTimeout(r, DELAY_MS));
  }

  // Write back CSV with examples
  const header = 'word,meaning,example,translation';
  const lines = words.map(w => {
    const esc = (s) => s && s.includes(',') ? `"${s.replace(/"/g, '""')}"` : (s || '');
    return `${esc(w.word)},${esc(w.meaning)},${esc(w.example)},${esc(w.translation)}`;
  });
  fs.writeFileSync(filePath, header + '\n' + lines.join('\n') + '\n', 'utf8');
  const done = words.filter(w => w.example).length;
  console.log(`   💾 Saved: ${done}/${words.length} with examples`);
}

async function main() {
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.csv')).sort();
  console.log(`📚 Found ${files.length} CSV files in EX準一級`);
  let total = 0;
  for (const f of files) {
    const words = parseCSV(path.join(DIR, f));
    total += words.length;
  }
  console.log(`📝 Total words across all files: ${total}`);

  for (const f of files) {
    await processFile(path.join(DIR, f));
  }
  console.log('\n🎉 All files processed!');
}

main().catch(console.error);
