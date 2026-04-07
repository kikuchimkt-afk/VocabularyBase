const xlsx = require('xlsx');

const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx`;
const outPath = filePath.replace('.xlsx', '_updated.xlsx');
const fs = require('fs');
const targetFile = fs.existsSync(outPath) ? outPath : filePath;

const wb = xlsx.readFile(targetFile);
const ws = wb.Sheets["準2級"];
const aoa = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "" });

let wordsToTranslate = [];
for (let i = 1; i < aoa.length; i++) {
  const row = aoa[i];
  const number = row[0];
  const english = row[1];
  const meaning = row[2];
  const example = row[3];
  
  if (english && (!example || example.trim() === '')) {
    wordsToTranslate.push({ idx: i, english, meaning });
  }
  if (wordsToTranslate.length >= 200) break;
}

fs.writeFileSync('words_200.json', JSON.stringify(wordsToTranslate, null, 2), 'utf8');
console.log('Saved words_200.json');
