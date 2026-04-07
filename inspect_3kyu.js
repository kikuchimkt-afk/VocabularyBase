const xlsx = require('xlsx');
const f = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語_updated.xlsx`;
const wb = xlsx.readFile(f);
console.log('Sheets:', wb.SheetNames);
const ws = wb.Sheets['3級'];
if (!ws) { console.log('3級 sheet not found'); process.exit(1); }
const aoa = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });
console.log('Header:', JSON.stringify(aoa[0]));
console.log('Row 1:', JSON.stringify(aoa[1]));
console.log('Row 2:', JSON.stringify(aoa[2]));
console.log('Total rows:', aoa.length);
// Count empty examples
let empty = 0, total = 0;
for (let i = 1; i < aoa.length; i++) {
  if (aoa[i][0]) { total++; if (!aoa[i][3]) empty++; }
}
console.log('Total words:', total, 'Empty examples:', empty);
