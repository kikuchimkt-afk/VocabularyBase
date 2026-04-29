/**
 * サンシャイン中2・中3の音声ファイル検証スクリプト
 * 
 * 検証内容:
 * 1. rankの連番整合性
 * 2. 音声ファイルの存在チェック
 * 3. 音声ファイル数とwords数の一致
 * 4. 音声生成スクリプトのデータ読み込み方式を確認
 *    - _generate_audio.py は json.load(f) で読み込み、直接イテレート
 *    - sunshineのJSONは { meta, words } 形式 => 辞書イテレートで "meta", "words" キーのみ
 *    - つまり正常に動かないはず -> 別途 words[] を抽出して渡した可能性
 */
const fs = require('fs');
const path = require('path');

function verify(grade) {
  const jsonPath = `public/wordlist_sunshine${grade}.json`;
  const audioDir = `public/audio/sunshine${grade}`;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  サンシャイン中${grade}  音声検証`);
  console.log(`${'='.repeat(60)}`);
  
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const words = data.words;
  
  console.log(`\n📚 単語数: ${words.length}`);
  console.log(`📄 meta.totalWords: ${data.meta.totalWords}`);
  
  // 1. rank 連番チェック
  let rankMismatches = [];
  words.forEach((w, i) => {
    if (w.rank !== (i + 1)) {
      rankMismatches.push({ idx: i, rank: w.rank, word: w.word });
    }
  });
  
  if (rankMismatches.length === 0) {
    console.log(`\n✅ rank連番: すべて一致 (1 ~ ${words.length})`);
  } else {
    console.log(`\n❌ rank連番: ${rankMismatches.length} 件のミスマッチ`);
    rankMismatches.slice(0, 10).forEach(m => {
      console.log(`   idx=${m.idx} rank=${m.rank} word="${m.word}"`);
    });
  }
  
  // 2. 音声ファイル存在チェック
  let missingWord = [];
  let missingExample = [];
  let extraWordFiles = [];
  
  const audioFiles = fs.readdirSync(audioDir);
  const wordFiles = audioFiles.filter(f => f.endsWith('_word.mp3'));
  const exampleFiles = audioFiles.filter(f => f.endsWith('_example.mp3'));
  
  console.log(`\n🔊 音声ファイル数: word=${wordFiles.length}, example=${exampleFiles.length}`);
  
  words.forEach(w => {
    const wFile = path.join(audioDir, `${w.rank}_word.mp3`);
    const eFile = path.join(audioDir, `${w.rank}_example.mp3`);
    
    if (!fs.existsSync(wFile)) {
      missingWord.push({ rank: w.rank, word: w.word });
    }
    if (!fs.existsSync(eFile)) {
      missingExample.push({ rank: w.rank, word: w.word, example: w.example });
    }
  });
  
  // 余分な音声ファイルチェック
  const expectedRanks = new Set(words.map(w => w.rank));
  wordFiles.forEach(f => {
    const rank = parseInt(f.split('_')[0]);
    if (!expectedRanks.has(rank)) {
      extraWordFiles.push(f);
    }
  });
  
  if (missingWord.length === 0) {
    console.log(`✅ 単語音声: すべて存在`);
  } else {
    console.log(`❌ 欠落する単語音声: ${missingWord.length} 件`);
    missingWord.slice(0, 5).forEach(m => console.log(`   rank=${m.rank} "${m.word}"`));
  }
  
  if (missingExample.length === 0) {
    console.log(`✅ 例文音声: すべて存在`);
  } else {
    console.log(`❌ 欠落する例文音声: ${missingExample.length} 件`);
    missingExample.slice(0, 5).forEach(m => console.log(`   rank=${m.rank} "${m.word}"`));
  }
  
  if (extraWordFiles.length > 0) {
    console.log(`⚠️ 余分な音声ファイル: ${extraWordFiles.length} 件`);
    extraWordFiles.slice(0, 5).forEach(f => console.log(`   ${f}`));
  }
  
  // 3. 例文が空の単語チェック
  let emptyExamples = words.filter(w => !w.example || w.example.trim() === '');
  if (emptyExamples.length > 0) {
    console.log(`\n⚠️ 例文なし: ${emptyExamples.length} 件`);
    emptyExamples.slice(0, 5).forEach(w => console.log(`   rank=${w.rank} "${w.word}"`));
  }
  
  // 4. ファイルサイズ分析（異常に小さいファイルの検出）
  let tinyFiles = [];
  words.forEach(w => {
    const wFile = path.join(audioDir, `${w.rank}_word.mp3`);
    const eFile = path.join(audioDir, `${w.rank}_example.mp3`);
    
    if (fs.existsSync(wFile)) {
      const size = fs.statSync(wFile).size;
      if (size < 500) {
        tinyFiles.push({ rank: w.rank, word: w.word, type: 'word', size });
      }
    }
    if (fs.existsSync(eFile)) {
      const size = fs.statSync(eFile).size;
      if (size < 500) {
        tinyFiles.push({ rank: w.rank, word: w.word, type: 'example', size });
      }
    }
  });
  
  if (tinyFiles.length > 0) {
    console.log(`\n❌ 異常に小さいファイル (< 500 bytes): ${tinyFiles.length} 件`);
    tinyFiles.forEach(f => console.log(`   rank=${f.rank} ${f.type} size=${f.size} "${f.word}"`));
  } else {
    console.log(`\n✅ ファイルサイズ: すべて正常`);
  }
  
  // 5. サンプルデータ表示（手動検証用）
  console.log(`\n📋 手動検証用サンプル (rank → word → example):`);
  const sampleRanks = [1, 10, 50, 100, 200, 500, words.length];
  sampleRanks.forEach(r => {
    const w = words.find(x => x.rank === r);
    if (w) {
      const wFile = path.join(audioDir, `${w.rank}_word.mp3`);
      const eFile = path.join(audioDir, `${w.rank}_example.mp3`);
      const wSize = fs.existsSync(wFile) ? fs.statSync(wFile).size : 'MISSING';
      const eSize = fs.existsSync(eFile) ? fs.statSync(eFile).size : 'MISSING';
      console.log(`   rank=${r}: "${w.word}" wSize=${wSize} eSize=${eSize}`);
      console.log(`     例文: "${(w.example || '').substring(0, 70)}"`);
    }
  });
  
  // 6. セクション別統計
  console.log(`\n📊 セクション別統計:`);
  const sections = {};
  words.forEach(w => {
    if (!sections[w.section]) sections[w.section] = { count: 0, label: '' };
    sections[w.section].count++;
  });
  data.meta.sections.forEach(s => {
    const actual = sections[s.key] ? sections[s.key].count : 0;
    const match = actual === s.count ? '✅' : '❌';
    console.log(`   ${match} ${s.label} (key=${s.key}): meta=${s.count}, actual=${actual}`);
  });
  
  return {
    grade,
    wordsCount: words.length,
    rankMismatches: rankMismatches.length,
    missingWord: missingWord.length,
    missingExample: missingExample.length,
    tinyFiles: tinyFiles.length,
    extraFiles: extraWordFiles.length
  };
}

const r2 = verify(2);
const r3 = verify(3);

console.log(`\n${'='.repeat(60)}`);
console.log('  総合結果');
console.log(`${'='.repeat(60)}`);

const issues = [];
[r2, r3].forEach(r => {
  if (r.rankMismatches > 0) issues.push(`S${r.grade}: rank ${r.rankMismatches}件`);
  if (r.missingWord > 0) issues.push(`S${r.grade}: 欠落word ${r.missingWord}件`);
  if (r.missingExample > 0) issues.push(`S${r.grade}: 欠落example ${r.missingExample}件`);
  if (r.tinyFiles > 0) issues.push(`S${r.grade}: 異常サイズ ${r.tinyFiles}件`);
  if (r.extraFiles > 0) issues.push(`S${r.grade}: 余分ファイル ${r.extraFiles}件`);
});

if (issues.length === 0) {
  console.log('\n✅ 構造上の問題なし（rankと音声ファイルの対応は正常）');
  console.log('\n⚠️ ただし、音声ファイルの内容（読み上げテキスト）が正しいかは');
  console.log('   実際にブラウザで聴いて確認する必要があります。');
} else {
  console.log('\n❌ 検出された問題:');
  issues.forEach(i => console.log(`   - ${i}`));
}
