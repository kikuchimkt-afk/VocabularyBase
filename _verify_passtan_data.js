/**
 * RTFファイルのクイズデータとJSONの例文・音声データの整合性を検証するスクリプト
 * RTFのquestionフィールド（空欄あり）とJSONのexample（空欄なし）を比較
 */
const fs = require('fs');
const path = require('path');

// RTFからプレーンテキストを抽出（簡易版）
function stripRtf(rtfContent) {
  // Remove RTF control words and groups, keep text
  let text = rtfContent;
  // Remove RTF header/font tables etc (everything before first \par)
  // Remove Shift-JIS encoded Japanese (\'XX patterns) - we'll handle meaning separately
  // Keep ASCII text
  
  // Split by \par to get lines
  const lines = text.split('\\par ');
  const cleanLines = [];
  for (const line of lines) {
    // Remove RTF formatting commands
    let clean = line
      .replace(/\\hich\\af\d+\\dbch\\af\d+\\loch\\f\d+\s*/g, '')
      .replace(/\\rtlch\\fcs1\s*\\af\d+\s*\\ltrch\\fcs0\s*\\insrsid\d+\s*/g, '')
      .replace(/\\loch\\af\d+\\hich\\af\d+\\dbch\\f\d+\s*/g, '')
      .replace(/\{[^}]*\}/g, '') // Remove groups with encoded Japanese
      .replace(/\\\w+\d*\s?/g, '') // Remove remaining control words
      .replace(/[{}]/g, '')
      .trim();
    if (clean) cleanLines.push(clean);
  }
  return cleanLines.join('\n');
}

// RTFからクイズデータを正規表現で抽出
function extractQuizFromRtf(rtfContent) {
  const quizItems = [];
  // Extract rank
  const rankMatches = [...rtfContent.matchAll(/"rank":\s*(\d+)/g)];
  const questionMatches = [...rtfContent.matchAll(/"question":\s*"([^"]+)"/g)];
  const answerMatches = [...rtfContent.matchAll(/"answer":\s*"([^"]+)"/g)];
  const choicesMatches = [...rtfContent.matchAll(/"choices":\s*\[([^\]]+)\]/g)];
  
  for (let i = 0; i < rankMatches.length; i++) {
    const rank = parseInt(rankMatches[i][1]);
    
    // Clean question - RTF may split words across lines
    let question = questionMatches[i] ? questionMatches[i][1] : '';
    // Fix RTF line breaks within strings (e.g., "ques\nhich...tion")
    
    const answer = answerMatches[i] ? answerMatches[i][1] : '';
    
    // Parse choices
    let choicesStr = choicesMatches[i] ? choicesMatches[i][1] : '';
    const choices = choicesStr.match(/"([^"]+)"/g)?.map(c => c.replace(/"/g, '')) || [];
    
    quizItems.push({ rank, question, answer, choices });
  }
  return quizItems;
}

// メイン検証
function verify(grade, rtfPath, jsonPath) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`検証: ${grade}`);
  console.log(`${'='.repeat(60)}`);
  
  const rtfContent = fs.readFileSync(rtfPath, 'utf8');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  const rtfQuiz = extractQuizFromRtf(rtfContent);
  
  console.log(`RTF問題数: ${rtfQuiz.length}`);
  console.log(`JSON単語数: ${jsonData.length}`);
  
  let matchCount = 0;
  let mismatchCount = 0;
  const mismatches = [];
  
  for (const rtfItem of rtfQuiz) {
    const jsonItem = jsonData.find(j => j.rank === rtfItem.rank);
    if (!jsonItem) {
      mismatches.push({ rank: rtfItem.rank, issue: 'JSONに対応するrankがない' });
      mismatchCount++;
      continue;
    }
    
    // RTFのquestionから空欄を正解で埋めて、JSONのexampleと比較
    const reconstructed = rtfItem.question.replace(/_+/g, rtfItem.answer);
    const jsonExample = jsonItem.example;
    
    // 正規化して比較（スペース等の微妙な差異を許容）
    const norm = s => s.replace(/\s+/g, ' ').trim().toLowerCase();
    
    if (norm(reconstructed) !== norm(jsonExample)) {
      if (mismatchCount < 20) { // 最初の20件だけ詳細表示
        mismatches.push({
          rank: rtfItem.rank,
          rtfReconstructed: reconstructed,
          jsonExample: jsonExample,
          issue: '例文不一致'
        });
      }
      mismatchCount++;
    } else {
      matchCount++;
    }
  }
  
  console.log(`\n✅ 一致: ${matchCount}問`);
  console.log(`❌ 不一致: ${mismatchCount}問`);
  
  if (mismatches.length > 0) {
    console.log('\n--- 不一致の詳細 (先頭20件) ---');
    for (const m of mismatches.slice(0, 20)) {
      console.log(`  rank ${m.rank}: ${m.issue}`);
      if (m.rtfReconstructed) {
        console.log(`    RTF: ${m.rtfReconstructed}`);
        console.log(`    JSON: ${m.jsonExample}`);
      }
    }
  }
  
  // 最初の5件を表示
  console.log('\n--- サンプル (先頭5件) ---');
  for (let i = 0; i < Math.min(5, rtfQuiz.length); i++) {
    const r = rtfQuiz[i];
    const j = jsonData.find(d => d.rank === r.rank);
    console.log(`  rank ${r.rank}:`);
    console.log(`    RTF question: ${r.question}`);
    console.log(`    RTF answer:   ${r.answer}`);
    console.log(`    RTF choices:  ${JSON.stringify(r.choices)}`);
    console.log(`    JSON example: ${j ? j.example : 'N/A'}`);
    console.log(`    JSON english: ${j ? j.english : 'N/A'}`);
  }
  
  return { matchCount, mismatchCount, rtfCount: rtfQuiz.length, jsonCount: jsonData.length };
}

const basePT = path.join(__dirname, '..', 'Vocabraly\u200BMarathon PassTan');
const baseVB = path.join(__dirname, 'public');

const grades = [
  { grade: '5級', rtf: path.join(basePT, 'パス単5級問題.rtf'), json: path.join(baseVB, 'wordlist_5kyu_pass.json') },
  { grade: '4級', rtf: path.join(basePT, 'パス単4級問題.rtf'), json: path.join(baseVB, 'wordlist_4kyu_pass.json') },
  { grade: '3級', rtf: path.join(basePT, 'パス単3級問題.rtf'), json: path.join(baseVB, 'wordlist_3kyu_pass.json') },
  { grade: '準2級', rtf: path.join(basePT, 'パス単準2級問題.rtf'), json: path.join(baseVB, 'wordlist_pre2kyu_pass.json') },
];

const results = [];
for (const g of grades) {
  if (!fs.existsSync(g.rtf)) {
    console.log(`\n⚠️ RTFファイルが見つかりません: ${g.rtf}`);
    continue;
  }
  if (!fs.existsSync(g.json)) {
    console.log(`\n⚠️ JSONファイルが見つかりません: ${g.json}`);
    continue;
  }
  results.push({ grade: g.grade, ...verify(g.grade, g.rtf, g.json) });
}

console.log('\n\n========== 総合結果 ==========');
for (const r of results) {
  console.log(`${r.grade}: RTF ${r.rtfCount}問 / JSON ${r.jsonCount}語 | 一致 ${r.matchCount} / 不一致 ${r.mismatchCount}`);
}
