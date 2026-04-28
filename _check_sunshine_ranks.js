const fs = require('fs');
const d = JSON.parse(fs.readFileSync('public/wordlist_sunshine1.json', 'utf-8'));
const words = d.words;

console.log('Total words:', words.length);
console.log('First 5:');
words.slice(0, 5).forEach(w => {
  console.log('  rank=' + w.rank + " word='" + w.word + "' id='" + w.id + "' section='" + w.section + "'");
});
console.log('Last 5:');
words.slice(-5).forEach(w => {
  console.log('  rank=' + w.rank + " word='" + w.word + "' id='" + w.id + "' section='" + w.section + "'");
});

// Check rank uniqueness
console.log('---');
console.log('Rank uniqueness check:');
const ranks = words.map(w => w.rank);
const unique = new Set(ranks);
console.log('  Total:', ranks.length, 'Unique:', unique.size);
if (ranks.length !== unique.size) {
  const seen = {};
  ranks.forEach((r, i) => {
    if (seen[r] !== undefined) {
      console.log('  DUPLICATE rank=' + r + ' at index ' + seen[r] + ' and ' + i);
    }
    seen[r] = i;
  });
}

// Check if ranks are sequential
console.log('---');
console.log('Sequential check:');
let sequential = true;
for (let i = 0; i < words.length; i++) {
  if (words[i].rank !== i + 1) {
    console.log('  MISMATCH at index ' + i + ': rank=' + words[i].rank + ' expected=' + (i + 1) + " word='" + words[i].word + "'");
    sequential = false;
    if (i > 20) {
      console.log('  ... (truncated)');
      break;
    }
  }
}
if (sequential) console.log('  All ranks are sequential 1..N');

// Check audio file existence for first 10 words
console.log('---');
console.log('Audio file check (first 10):');
for (let i = 0; i < Math.min(10, words.length); i++) {
  const w = words[i];
  const wordFile = 'public/audio/sunshine1/' + w.rank + '_word.mp3';
  const exFile = 'public/audio/sunshine1/' + w.rank + '_example.mp3';
  const wExists = fs.existsSync(wordFile);
  const eExists = fs.existsSync(exFile);
  console.log('  rank=' + w.rank + " '" + w.word + "' word.mp3=" + wExists + ' example.mp3=' + eExists);
}
