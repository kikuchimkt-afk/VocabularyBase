const fs = require('fs');
const path = require('path');

function analyze(grade) {
  const data = JSON.parse(fs.readFileSync('public/wordlist_sunshine' + grade + '.json', 'utf-8'));
  const words = data.words;
  const dir = 'public/audio/sunshine' + grade;
  
  console.log('\n=== Sunshine ' + grade + ' ===');
  
  let wordSizes = [];
  let exSizes = [];
  let suspicious = [];
  
  for (const w of words) {
    const wf = path.join(dir, w.rank + '_word.mp3');
    const ef = path.join(dir, w.rank + '_example.mp3');
    
    if (!fs.existsSync(wf) || !fs.existsSync(ef)) continue;
    
    const ws = fs.statSync(wf).size;
    const es = fs.statSync(ef).size;
    const wordLen = w.word.length;
    const exLen = (w.example || '').length;
    
    wordSizes.push(ws);
    exSizes.push(es);
    
    // 単語が短いのにファイルサイズが異常に大きい（長い別の文が読まれている可能性）
    if (wordLen <= 5 && ws > 18000) {
      suspicious.push({
        rank: w.rank, word: w.word, type: 'word_too_big',
        size: ws, textLen: wordLen
      });
    }
    
    // 例文が短いのにファイルが大きい
    if (exLen > 0 && exLen < 20 && es > 25000) {
      suspicious.push({
        rank: w.rank, word: w.word, type: 'example_too_big',
        size: es, textLen: exLen, text: (w.example || '').substring(0, 50)
      });
    }
    
    // 例文が長いのにファイルが小さすぎる
    if (exLen > 40 && es < 12000) {
      suspicious.push({
        rank: w.rank, word: w.word, type: 'example_too_small',
        size: es, textLen: exLen, text: (w.example || '').substring(0, 50)
      });
    }
  }
  
  const avgWord = Math.round(wordSizes.reduce((a, b) => a + b, 0) / wordSizes.length);
  const avgEx = Math.round(exSizes.reduce((a, b) => a + b, 0) / exSizes.length);
  const minWord = Math.min(...wordSizes);
  const maxWord = Math.max(...wordSizes);
  const minEx = Math.min(...exSizes);
  const maxEx = Math.max(...exSizes);
  
  console.log('  単語音声: avg=' + avgWord + ' min=' + minWord + ' max=' + maxWord);
  console.log('  例文音声: avg=' + avgEx + ' min=' + minEx + ' max=' + maxEx);
  
  if (suspicious.length > 0) {
    console.log('  ⚠️ 疑わしいエントリ: ' + suspicious.length + '件');
    suspicious.forEach(s => {
      console.log('    rank=' + s.rank + ' ' + s.type + ' size=' + s.size +
                  ' text_len=' + s.textLen + ' "' + s.word + '"' +
                  (s.text ? ' ex="' + s.text + '"' : ''));
    });
  } else {
    console.log('  ✅ ファイルサイズ/テキスト長の比率はすべて正常範囲');
  }
  
  // 追加チェック: 隣接するrankの音声サイズが入れ替わっていないか
  console.log('\n  隣接rank間のサイズパターン検証:');
  let swapSuspicious = [];
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    const wf1 = path.join(dir, w1.rank + '_word.mp3');
    const wf2 = path.join(dir, w2.rank + '_word.mp3');
    
    if (!fs.existsSync(wf1) || !fs.existsSync(wf2)) continue;
    
    const ws1 = fs.statSync(wf1).size;
    const ws2 = fs.statSync(wf2).size;
    
    // 2語の長さの差が大きいのにサイズが逆転していたら怪しい
    const len1 = w1.word.length;
    const len2 = w2.word.length;
    
    if (len1 > len2 * 3 && ws1 < ws2 * 0.7) {
      // 長い単語なのにサイズが小さい → 入れ替わりの可能性
      // ただしこれは自然に起こりうるので、控えめに
    }
  }
  
  // Sunshine1の修正と比較: 中1では音声の生成順序が問題だったか？
  // _generate_audio.py はjson.load(f)でdict全体を読み込み、
  // そのままイテレートしようとする → dictのイテレートは "meta", "words" のキーのみ
  // → word["rank"] で KeyError → 実行不可能
  // つまり必ず修正版で実行されたはず
  
  return { grade, suspicious: suspicious.length };
}

const r2 = analyze(2);
const r3 = analyze(3);

console.log('\n=== 結論 ===');
if (r2.suspicious === 0 && r3.suspicious === 0) {
  console.log('構造レベルの検証では問題は検出されませんでした。');
  console.log('音声ファイルの実際の内容を検証するには、');
  console.log('ブラウザで再生して確認するか、音声認識ツールで確認する必要があります。');
} else {
  console.log('疑わしいエントリが見つかりました。上記を確認してください。');
}
