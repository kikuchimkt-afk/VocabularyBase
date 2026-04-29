const fs = require('fs');
const d = JSON.parse(fs.readFileSync('public/wordlist_sunshine1.json', 'utf-8'));
const words = d.words;

// 教科書の順序（画像から読み取り）
const textbook = {
  'Get Ready 1,2 (p.7-11)': [
    'Bob', 'Kate', 'Mike', 'I see.', 'great', 'Lucy', 'really', 'I', 'me', 'see', 'too'
  ],
  'Get Ready 3 (p.12-13)': [
    'are', 'can', 'do', 'food', 'get', 'like', 'Ms.', 'subject', 'up', 'when', 'you',
    'be', 'Daniel', 'Emily', 'from', 'have', 'Miller', 'time', 'want', 'where',
    'birthday', 'is', 'play', 'to', 'what', 'your'
  ],
  'Program 1 Scenes 1 (p.22-23)': [
    "I'm", 'shy', 'am', 'not', 'thirty', 'kind', 'junior', 'at', 'firefighter', 'goodbye',
    'Felipe', 'hi', 'sorry', 'oh', 'teacher', 'fifteen', 'student'
  ]
};

console.log('=== JSON vs 教科書 照合 ===\n');

let jsonIdx = 0;
for (const [section, expected] of Object.entries(textbook)) {
  console.log(`--- ${section} ---`);
  let allMatch = true;
  for (let i = 0; i < expected.length; i++) {
    const w = words[jsonIdx];
    const match = w && w.word === expected[i];
    if (!match) {
      console.log(`  MISMATCH idx=${jsonIdx} rank=${w ? w.rank : '?'} JSON="${w ? w.word : '?'}" 教科書="${expected[i]}"`);
      allMatch = false;
    }
    jsonIdx++;
  }
  if (allMatch) {
    console.log(`  ✅ 全${expected.length}語一致 (rank ${words[jsonIdx - expected.length].rank}~${words[jsonIdx - 1].rank})`);
  }
}

// Program 1 のrank確認
console.log('\n=== Program 1 セクション詳細 ===');
const p1 = words.filter(w => w.section === '1');
console.log(`Program 1: ${p1.length}語, rank ${p1[0].rank}~${p1[p1.length-1].rank}`);
console.log('最初の10語:');
p1.slice(0, 10).forEach(w => {
  const audioFile = `public/audio/sunshine1/${w.rank}_word.mp3`;
  const exists = fs.existsSync(audioFile);
  const size = exists ? fs.statSync(audioFile).size : 0;
  console.log(`  rank=${w.rank} "${w.word}" -> ${w.rank}_word.mp3 (${exists ? size + 'B' : 'MISSING'})`);
});

// 音声ファイルの中身をファイルサイズで推定
// Bob (3文字) vs I'm (3文字) は区別困難なので、例文の長さで検証
console.log('\n=== 例文の長さ vs 音声ファイルサイズ（相関チェック）===');
console.log('正しければ: 長い例文 → 大きいファイル');
const check = [
  {rank: 1, word: 'Bob'},    // example: "His name is Bob." (16 chars)
  {rank: 140, word: "I'm"},  // example: "I'm a junior high school student." (33 chars)
  {rank: 5, word: 'great'},  // example: "That's great!" (14 chars)
  {rank: 144, word: 'thirty'}, // example longer
];
check.forEach(c => {
  const w = words.find(x => x.rank === c.rank);
  if (!w) return;
  const exFile = `public/audio/sunshine1/${w.rank}_example.mp3`;
  const exSize = fs.existsSync(exFile) ? fs.statSync(exFile).size : 0;
  console.log(`  rank=${w.rank} "${w.word}" example="${w.example}" (${w.example.length}文字) -> ${exSize}B`);
});

// rank 1 の例文 (16文字: "His name is Bob.") のファイルサイズ
// rank 140 の例文 (33文字: "I'm a junior high school student.") のファイルサイズ  
// もしrank=140の音声が実際にはBobの例文なら、140_example.mp3 のサイズが小さいはず
console.log('\nもし音声がズレていたら:');
const r1ExSize = fs.statSync('public/audio/sunshine1/1_example.mp3').size;
const r140ExSize = fs.statSync('public/audio/sunshine1/140_example.mp3').size;
console.log(`  1_example.mp3 = ${r1ExSize}B (期待: Bob例文 "His name is Bob." 16文字 → 小さい)`);
console.log(`  140_example.mp3 = ${r140ExSize}B (期待: I'm例文 "I'm a junior high school student." 33文字 → 大きい)`);
if (r140ExSize > r1ExSize) {
  console.log('  ✅ ファイルサイズ的に正しい順序 (音声ファイル自体は正しい可能性大)');
  console.log('  → 問題はDB側のaudio URLが間違っている可能性');
} else {
  console.log('  ❌ ファイルサイズが逆 → 音声ファイル自体がズレている');
}
