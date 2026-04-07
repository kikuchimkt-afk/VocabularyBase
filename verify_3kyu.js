// Verify that each word appears in its example sentence for 3級
const xlsx = require('xlsx');
const filePath = String.raw`C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語_updated.xlsx`;
const wb = xlsx.readFile(filePath);
const ws = wb.Sheets['3級'];
const aoa = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });

let mismatches = [];
let emptyExamples = [];
let total = 0;

for (let i = 1; i < aoa.length; i++) {
  const rank = aoa[i][0];
  const word = String(aoa[i][1] || '').trim();
  const meaning = String(aoa[i][2] || '').trim();
  const example = String(aoa[i][3] || '').trim();
  const translation = String(aoa[i][4] || '').trim();
  
  if (!word) continue;
  total++;
  
  if (!example) {
    emptyExamples.push({ rank, word });
    continue;
  }
  
  // Check if the word (or a key part of multi-word phrases) appears in the example
  const exampleLower = example.toLowerCase();
  const wordLower = word.toLowerCase();
  
  // For multi-word phrases like "look forward to", check parts
  const wordParts = wordLower.split(/\s+/);
  let found = false;
  
  if (exampleLower.includes(wordLower)) {
    found = true;
  } else {
    // Check if key words (excluding common particles) appear
    const stopWords = ['a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'for', 'is', 'be', 'it', 'do', 'if', 'as', 'or', 'no', 'up', 'by', 'so'];
    const keyParts = wordParts.filter(p => !stopWords.includes(p) && p.length > 1);
    
    if (keyParts.length > 0) {
      // Check if at least one key part appears (handles conjugation, plural, etc.)
      found = keyParts.some(part => {
        // Check stems (remove common suffixes)
        const stem = part.replace(/(ing|ed|s|ly|er|est|tion|ment|ness|ful|less|ous|ive|able|ible)$/, '');
        return exampleLower.includes(part) || (stem.length >= 3 && exampleLower.includes(stem));
      });
    } else {
      // For very short/common words, just check direct inclusion
      found = exampleLower.includes(wordLower);
    }
  }
  
  if (!found) {
    mismatches.push({ rank, word, example: example.substring(0, 60) });
  }
}

console.log(`\n=== 3級 Word-Example Verification ===`);
console.log(`Total words: ${total}`);
console.log(`Words with examples: ${total - emptyExamples.length}`);
console.log(`Words without examples: ${emptyExamples.length}`);

if (emptyExamples.length > 0) {
  console.log(`\n--- Words without examples (first 20) ---`);
  emptyExamples.slice(0, 20).forEach(m => console.log(`  Rank ${m.rank}: ${m.word}`));
}

console.log(`\n--- Potential mismatches (${mismatches.length}) ---`);
if (mismatches.length > 0) {
  mismatches.forEach(m => console.log(`  Rank ${m.rank}: "${m.word}" → "${m.example}"`));
} else {
  console.log('  All words match their examples! ✅');
}
