const d = require('./public/wordlist_5kyu_pass.json');
const w = d.filter(x => x.example && /[^\x00-\x7F]/.test(x.example));
console.log(JSON.stringify(w.map(x => ({rank: x.rank, example: x.example})), null, 2));
