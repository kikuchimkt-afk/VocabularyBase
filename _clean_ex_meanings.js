/**
 * EX準一級 CSV 意味のクリーニングスクリプト
 * - ① ② ③ などの丸囲み数字を除去
 * - ? を ～ に置換（Shift-JIS変換の残骸）
 * - （名）（動）（形）（副）などの品詞タグを除去
 * - 余分な空白を整理
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '単語リスト', 'EX準一級');

function cleanMeaning(m) {
  let cleaned = m;

  // ? → ～ に置換 (Shift-JIS由来の文字化け)
  cleaned = cleaned.replace(/\?/g, '～');

  // 丸囲み数字 ①②③④⑤⑥⑦⑧⑨⑩⑪⑫ を除去
  cleaned = cleaned.replace(/[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]/g, '');

  // （名）（動）（形）（副）（自）（他）（前）（接）（代）等の品詞タグを除去（先頭のみ）
  cleaned = cleaned.replace(/^\s*（[名動形副自他前接代間助感冠]）\s*/, '');

  // 全角スペースを半角に
  cleaned = cleaned.replace(/\u3000/g, ' ');

  // 連続空白を1つに
  cleaned = cleaned.replace(/\s{2,}/g, ' ');

  // 先頭末尾の空白・句読点整理
  cleaned = cleaned.trim();

  // 先頭の、を除去
  cleaned = cleaned.replace(/^[、，,]\s*/, '');

  return cleaned;
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.csv') && !f.includes('_Ori'));
let totalCleaned = 0;

for (const f of files) {
  const filePath = path.join(DIR, f);
  const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const lines = content.split(/\r?\n/);

  let changed = 0;
  const newLines = lines.map((line, idx) => {
    if (idx === 0) return line; // ヘッダーはそのまま
    if (!line.trim()) return line;

    const cols = line.split(',');
    if (cols.length < 2) return line;

    const original = cols[1];
    const cleaned = cleanMeaning(original);
    if (cleaned !== original) {
      changed++;
      cols[1] = cleaned;
    }
    return cols.join(',');
  });

  if (changed > 0) {
    fs.writeFileSync(filePath, newLines.join('\r\n'), 'utf8');
    console.log(`✅ ${f}: ${changed} meanings cleaned`);
    totalCleaned += changed;
  } else {
    console.log(`  ${f}: no changes`);
  }
}

console.log(`\n🧹 Total: ${totalCleaned} meanings cleaned across all files`);

// JSON も再生成
console.log('\n📦 Regenerating JSON...');
require('./_merge_ex_pre1kyu.js');
