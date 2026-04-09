/**
 * EX準一級 CSV → JSON 変換スクリプト
 * 13個のCSVファイルを結合して wordlist_ex_pre1kyu.json を生成
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '単語リスト', 'EX準一級');
const OUTPUT = path.join(__dirname, 'public', 'wordlist_ex_pre1kyu.json');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.csv') && !f.includes('_Ori')).sort((a, b) => {
  // ex204.csv, ex408.csv, ... の番号順にソート
  const numA = parseInt(a.match(/\d+/)?.[0] || 0);
  const numB = parseInt(b.match(/\d+/)?.[0] || 0);
  return numA - numB;
});

const allWords = [];
let rank = 1;

for (const f of files) {
  const filePath = path.join(DIR, f);
  const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const lines = content.trim().split(/\r?\n/);
  // header: word,meaning[,example,translation]
  const header = parseCSVLine(lines[0]);
  const hasExample = header.length >= 3;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // CSVパース（常にクォートを考慮）
    const parts = parseCSVLine(line);
    const word = (parts[0] || '').trim();
    const meaning = (parts[1] || '').trim();
    const example = hasExample ? (parts[2] || '').trim() : '';
    const translation = hasExample ? (parts[3] || '').trim() : '';

    if (!word) continue;

    // meaning から品詞タグを除去して clean に
    const cleanMeaning = meaning.replace(/^[\s（\(]*[名動形副自他]*[\s）\)]*\s*/, '').trim() || meaning;

    allWords.push({
      rank,
      word,
      meaning: cleanMeaning,
      example: example || '',
      translation: translation || '',
    });
    rank++;
  }
  console.log(`  ${f}: ${lines.length - 1} words`);
}

// CSVの1行をパース（クォート対応）
function parseCSVLine(line) {
  const results = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      results.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  results.push(current);
  return results;
}

fs.writeFileSync(OUTPUT, JSON.stringify(allWords, null, 2), 'utf8');
console.log(`\n✅ Total: ${allWords.length} words saved to ${OUTPUT}`);

// 例文なしの数を確認
const noExample = allWords.filter(w => !w.example).length;
if (noExample > 0) {
  console.log(`⚠️ ${noExample} words without examples`);
} else {
  console.log('🎉 All words have examples!');
}
