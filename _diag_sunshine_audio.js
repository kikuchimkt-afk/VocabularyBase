const fs = require('fs');
const path = require('path');

// Load sunshine1 word list
const d = JSON.parse(fs.readFileSync('public/wordlist_sunshine1.json', 'utf-8'));
const words = d.words;

console.log('=== Sunshine1 Audio Diagnostics ===');
console.log('Total words in JSON:', words.length);

// Check 1: rank vs index alignment
let mismatches = 0;
words.forEach((w, i) => {
  if (w.rank !== (i + 1)) {
    mismatches++;
    if (mismatches <= 5) {
      console.log('  MISMATCH idx=' + i + ' rank=' + w.rank + ' word=' + w.word);
    }
  }
});
console.log('Rank mismatches:', mismatches);

// Check 2: audio file count
const audioDir = 'public/audio/sunshine1';
const files = fs.readdirSync(audioDir);
const wordFiles = files.filter(f => f.endsWith('_word.mp3'));
const exFiles = files.filter(f => f.endsWith('_example.mp3'));
console.log('Audio word files:', wordFiles.length);
console.log('Audio example files:', exFiles.length);

// Check 3: file size analysis for first 10 words (to detect wrong audio)
console.log('\n=== First 10 words: rank, word, word_audio_size, example_audio_size ===');
for (let i = 0; i < 10; i++) {
  const w = words[i];
  const wFile = path.join(audioDir, w.rank + '_word.mp3');
  const eFile = path.join(audioDir, w.rank + '_example.mp3');
  const wSize = fs.existsSync(wFile) ? fs.statSync(wFile).size : 'MISSING';
  const eSize = fs.existsSync(eFile) ? fs.statSync(eFile).size : 'MISSING';
  console.log('  rank=' + w.rank + ' "' + w.word + '" word_size=' + wSize + ' ex_size=' + eSize);
}

// Check 4: How audio generation script reads the data
// The script does: words = json.load(f) then iterates words
// For sunshine, json.load returns { meta: {...}, words: [...] }
// iterating a dict in Python gives keys: "meta", "words"
// So it would try word["rank"] on "meta" and "words" strings -> crash
// Unless the script was modified to handle wrapped format
console.log('\n=== Checking if _generate_audio.py handles wrapped format ===');
const pyScript = fs.readFileSync('_generate_audio.py', 'utf-8');
if (pyScript.includes('.words') || pyScript.includes('["words"]') || pyScript.includes("['words']")) {
  console.log('  Script HAS handling for wrapped format');
} else {
  console.log('  Script DOES NOT handle wrapped format!');
  console.log('  It expects a flat array, but sunshine JSON is { meta, words }');
}

// Check 5: What the import route does with rank
console.log('\n=== Import route rank handling ===');
console.log('Route maps: listType=sunshine1, rank=w.rank -> /audio/sunshine1/{rank}_word.mp3');
console.log('TeacherWordRegister maps: rank = w.rank || (idx + 1)');

// Check 6: Verify specific words to test audio alignment
console.log('\n=== Words to manually verify audio ===');
const testRanks = [1, 5, 10, 50, 100, 140, 500, 949];
testRanks.forEach(r => {
  const w = words.find(x => x.rank === r);
  if (w) {
    console.log('  rank=' + r + ': word="' + w.word + '" example="' + (w.example || '').substring(0, 60) + '"');
  }
});

// Check 7: Look for a secondary/modified script that might have been used
console.log('\n=== Checking for other audio generation scripts ===');
const rootFiles = fs.readdirSync('.');
const audioScripts = rootFiles.filter(f => 
  (f.includes('audio') || f.includes('tts') || f.includes('speech')) && 
  (f.endsWith('.py') || f.endsWith('.js') || f.endsWith('.ps1'))
);
console.log('  Found:', audioScripts.join(', ') || 'none');

// Check 8: Git - check if _generate_audio.py was modified for sunshine
console.log('\n=== Audio generation workflow ===');
const workflowPath = '.agents/workflows/generate-audio.md';
if (fs.existsSync(workflowPath)) {
  const wf = fs.readFileSync(workflowPath, 'utf-8');
  // Check if workflow mentions sunshine or wrapped format
  if (wf.includes('sunshine') || wf.includes('wrapped') || wf.includes('meta')) {
    console.log('  Workflow mentions sunshine/wrapped format handling');
  } else {
    console.log('  Workflow does NOT mention sunshine-specific handling');
  }
}
