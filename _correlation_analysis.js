/**
 * 音声ファイルサイズとテキスト長の相関分析
 * 
 * 正しく生成されていれば、テキストが長い→ファイルサイズが大きいはず
 * ランダムにずれていたら相関が崩れる
 */
const fs = require('fs');
const path = require('path');

function correlationAnalysis(grade) {
  const data = JSON.parse(fs.readFileSync('public/wordlist_sunshine' + grade + '.json', 'utf-8'));
  const words = data.words;
  const dir = 'public/audio/sunshine' + grade;
  
  console.log('\n=== Sunshine ' + grade + ' 相関分析 ===');
  
  // 単語テキスト長 vs ファイルサイズ
  let wordPairs = [];
  let exPairs = [];
  
  for (const w of words) {
    const wFile = path.join(dir, w.rank + '_word.mp3');
    const eFile = path.join(dir, w.rank + '_example.mp3');
    
    if (fs.existsSync(wFile)) {
      wordPairs.push({
        rank: w.rank,
        text: w.word,
        textLen: w.word.length,
        size: fs.statSync(wFile).size
      });
    }
    if (fs.existsSync(eFile) && w.example) {
      exPairs.push({
        rank: w.rank,
        text: w.example,
        textLen: w.example.length,
        size: fs.statSync(eFile).size
      });
    }
  }
  
  // ピアソン相関係数を計算
  function pearson(pairs) {
    const n = pairs.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (const p of pairs) {
      sumX += p.textLen;
      sumY += p.size;
      sumXY += p.textLen * p.size;
      sumX2 += p.textLen * p.textLen;
      sumY2 += p.size * p.size;
    }
    const denom = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    if (denom === 0) return 0;
    return (n * sumXY - sumX * sumY) / denom;
  }
  
  const wordCorr = pearson(wordPairs);
  const exCorr = pearson(exPairs);
  
  console.log('  単語: テキスト長 vs ファイルサイズの相関 r = ' + wordCorr.toFixed(4));
  console.log('  例文: テキスト長 vs ファイルサイズの相関 r = ' + exCorr.toFixed(4));
  
  // 相関が0.5以上なら概ね正しい（TTS出力なので完全な線形ではない）
  if (wordCorr > 0.4) {
    console.log('  ✅ 単語音声はテキスト長と適度に相関あり（正常）');
  } else {
    console.log('  ⚠️ 単語音声の相関が低い → 音声がずれている可能性');
  }
  if (exCorr > 0.5) {
    console.log('  ✅ 例文音声はテキスト長と高い相関あり（正常）');
  } else {
    console.log('  ⚠️ 例文音声の相関が低い → 音声がずれている可能性');
  }
  
  // 外れ値検出: 残差分析
  // 例文の方が検出しやすい
  const avgRatio = exPairs.reduce((sum, p) => sum + p.size / p.textLen, 0) / exPairs.length;
  let outliers = [];
  for (const p of exPairs) {
    const expectedSize = avgRatio * p.textLen;
    const deviation = Math.abs(p.size - expectedSize) / expectedSize;
    if (deviation > 0.8) { // 80%以上乖離
      outliers.push({
        rank: p.rank,
        text: p.text.substring(0, 60),
        textLen: p.textLen,
        size: p.size,
        expected: Math.round(expectedSize),
        deviation: (deviation * 100).toFixed(1) + '%'
      });
    }
  }
  
  if (outliers.length > 0) {
    console.log('  ⚠️ 大きな乖離のある例文 (' + outliers.length + '件):');
    outliers.slice(0, 10).forEach(o => {
      console.log('    rank=' + o.rank + ' dev=' + o.deviation + 
                  ' size=' + o.size + ' expected=' + o.expected + 
                  ' "' + o.text + '"');
    });
  } else {
    console.log('  ✅ 例文音声に大きな外れ値なし');
  }
  
  // 隣接rank間の比較（同じくらいの長さの単語が隣接していれば、サイズも近いはず）
  // ただし、これは参考程度
  
  return { grade, wordCorr, exCorr, outliers: outliers.length };
}

const r2 = correlationAnalysis(2);
const r3 = correlationAnalysis(3);

// Sunshine 1 も比較用に分析
const r1 = correlationAnalysis(1);

console.log('\n=== 比較結果 ===');
console.log('  S1 word_r=' + r1.wordCorr.toFixed(4) + ' ex_r=' + r1.exCorr.toFixed(4) + ' outliers=' + r1.outliers);
console.log('  S2 word_r=' + r2.wordCorr.toFixed(4) + ' ex_r=' + r2.exCorr.toFixed(4) + ' outliers=' + r2.outliers);
console.log('  S3 word_r=' + r3.wordCorr.toFixed(4) + ' ex_r=' + r3.exCorr.toFixed(4) + ' outliers=' + r3.outliers);

console.log('\n中1（修正済み）と中2・中3の相関が同程度であれば、');
console.log('中2・中3も正常に音声が生成されていると考えられます。');
