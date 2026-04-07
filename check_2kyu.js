const xlsx = require('xlsx');
const fs = require('fs');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語_updated.xlsx`;
const wb = xlsx.readFile(filePath);

// Check 2級 sheet structure
const ws = wb.Sheets['2級'];
const aoa = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });
console.log('2級 Header:', JSON.stringify(aoa[0]));
console.log('2級 Row 1:', JSON.stringify(aoa[1]));
console.log('2級 Row 2:', JSON.stringify(aoa[2]));
console.log('2級 Total rows:', aoa.length);
console.log('2級 Col count:', aoa[0].length);
