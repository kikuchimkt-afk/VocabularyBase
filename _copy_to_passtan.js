const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find PassTan directory
const appDir = path.join(__dirname, '..');
const dirs = fs.readdirSync(appDir);
const ptDirName = dirs.find(d => d.includes('Marathon') && d.includes('PassTan'));
if (!ptDirName) { console.error('PassTan dir not found!'); process.exit(1); }
const ptDir = path.join(appDir, ptDirName);
console.log('PassTan dir:', ptDir);

// 1. Copy quiz JSONs
const quizFiles = ['pass5_quiz.json', 'pass4_quiz.json', 'pass3_quiz.json', 'pass_pre2_quiz.json'];
for (const f of quizFiles) {
  const src = path.join(__dirname, 'passtan_output', f);
  const dest = path.join(ptDir, f);
  fs.copyFileSync(src, dest);
  console.log('Copied:', f);
}

// 2. Copy audio directories
const audioSrc = path.join(__dirname, 'public', 'audio');
const audioDirs = ['5kyu_pass', '4kyu_pass', '3kyu_pass', 'pre2kyu_pass'];
for (const d of audioDirs) {
  const srcDir = path.join(audioSrc, d);
  const destDir = path.join(ptDir, 'audio', d);
  fs.mkdirSync(destDir, { recursive: true });
  const files = fs.readdirSync(srcDir);
  for (const f of files) {
    fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
  }
  console.log(`Audio ${d}: ${files.length} files copied`);
}

// 3. Copy source word JSONs
const wordFiles = [
  'wordlist_5kyu_pass.json', 'wordlist_4kyu_pass.json',
  'wordlist_3kyu_pass.json', 'wordlist_pre2kyu_pass.json'
];
for (const f of wordFiles) {
  const src = path.join(__dirname, 'public', f);
  const dest = path.join(ptDir, f);
  fs.copyFileSync(src, dest);
  console.log('Copied:', f);
}

console.log('\nAll files copied to:', ptDir);
