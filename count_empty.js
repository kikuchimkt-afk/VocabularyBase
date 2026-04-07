const xlsx = require('xlsx');
const f = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語_updated.xlsx`;
const wb = xlsx.readFile(f);
const aoa = xlsx.utils.sheet_to_json(wb.Sheets['準2級'], { header: 1, defval: '' });
let empty = 0, total = 0;
for (let i = 1; i < aoa.length; i++) {
  if (aoa[i][0]) { total++; if (!aoa[i][3]) empty++; }
}
console.log('Total words:', total, 'Empty:', empty, 'Filled:', (total - empty));
