/**
 * パス単マラソン用クイズデータ生成スクリプト
 * 
 * - VocabularyBaseの各級パス単JSONを読み込み
 * - 例文から対象単語を空欄化
 * - 高品質な4択ディストラクターを生成
 *   スペル類似度・語長・語頭一致・語尾パターンを考慮
 * - 各級のクイズJSONを出力
 */
const fs = require('fs');
const path = require('path');

// ========== 設定 ==========
const GRADES = [
  { key: '5kyu',    label: '5級',  file: 'wordlist_5kyu_pass.json',     output: 'pass5_quiz.json' },
  { key: '4kyu',    label: '4級',  file: 'wordlist_4kyu_pass.json',     output: 'pass4_quiz.json' },
  { key: '3kyu',    label: '3級',  file: 'wordlist_3kyu_pass.json',     output: 'pass3_quiz.json' },
  { key: 'pre2kyu', label: '準2級', file: 'wordlist_pre2kyu_pass.json',  output: 'pass_pre2_quiz.json' },
];

const OUTPUT_DIR = path.join(__dirname, 'passtan_output');

// ========== ユーティリティ ==========
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// レーベンシュタイン距離
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0)
      );
  return dp[m][n];
}

// 不規則活用マッピング
const IRREGULAR = {
  'be': ['am','is','are','was','were','been','being'],
  'have': ['has','had','having'],
  'do': ['does','did','done','doing'],
  'get': ['gets','got','getting','gotten'],
  'go': ['goes','went','going','gone'],
  'come': ['comes','came','coming'],
  'run': ['runs','ran','running'],
  'take': ['takes','took','taking','taken'],
  'make': ['makes','made','making'],
  'give': ['gives','gave','giving','given'],
  'put': ['puts','putting'],
  'keep': ['keeps','kept','keeping'],
  'let': ['lets','letting'],
  'tell': ['tells','told','telling'],
  'say': ['says','said','saying'],
  'see': ['sees','saw','seeing','seen'],
  'find': ['finds','found','finding'],
  'think': ['thinks','thought','thinking'],
  'know': ['knows','knew','knowing','known'],
  'stand': ['stands','stood','standing'],
  'hold': ['holds','held','holding'],
  'fall': ['falls','fell','falling','fallen'],
  'leave': ['leaves','left','leaving'],
  'break': ['breaks','broke','breaking','broken'],
  'speak': ['speaks','spoke','speaking','spoken'],
  'write': ['writes','wrote','writing','written'],
  'read': ['reads','reading'],
  'lose': ['loses','lost','losing'],
  'pay': ['pays','paid','paying'],
  'sell': ['sells','sold','selling'],
  'catch': ['catches','caught','catching'],
  'throw': ['throws','threw','throwing','thrown'],
  'win': ['wins','won','winning'],
  'build': ['builds','built','building'],
  'buy': ['buys','bought','buying'],
  'bring': ['brings','brought','bringing'],
  'sit': ['sits','sat','sitting'],
  'send': ['sends','sent','sending'],
  'spend': ['spends','spent','spending'],
  'teach': ['teaches','taught','teaching'],
  'learn': ['learns','learned','learnt','learning'],
  'grow': ['grows','grew','growing','grown'],
  'show': ['shows','showed','showing','shown'],
  'draw': ['draws','drew','drawing','drawn'],
  'drive': ['drives','drove','driving','driven'],
  'ride': ['rides','rode','riding','ridden'],
  'wear': ['wears','wore','wearing','worn'],
  'eat': ['eats','ate','eating','eaten'],
  'drink': ['drinks','drank','drinking','drunk'],
  'swim': ['swims','swam','swimming','swum'],
  'sing': ['sings','sang','singing','sung'],
  'begin': ['begins','began','beginning','begun'],
  'feel': ['feels','felt','feeling'],
  'meet': ['meets','met','meeting'],
  'sleep': ['sleeps','slept','sleeping'],
  'hear': ['hears','heard','hearing'],
  'lead': ['leads','led','leading'],
  'set': ['sets','setting'],
  'cut': ['cuts','cutting'],
  'hurt': ['hurts','hurting'],
  'cost': ['costs','costing'],
  'hit': ['hits','hitting'],
  'choose': ['chooses','chose','choosing','chosen'],
  'forget': ['forgets','forgot','forgetting','forgotten'],
  'rise': ['rises','rose','rising','risen'],
  'fly': ['flies','flew','flying','flown'],
  'die': ['dies','died','dying'],
  'carry': ['carries','carried','carrying'],
  'try': ['tries','tried','trying'],
  'study': ['studies','studied','studying'],
  'worry': ['worries','worried','worrying'],
  'cry': ['cries','cried','crying'],
  'play': ['plays','played','playing'],
  'enjoy': ['enjoys','enjoyed','enjoying'],
  'stay': ['stays','stayed','staying'],
  'stop': ['stops','stopped','stopping'],
  'plan': ['plans','planned','planning'],
  'happen': ['happens','happened','happening'],
  'move': ['moves','moved','moving'],
  'live': ['lives','lived','living'],
  'practice': ['practices','practiced','practicing'],
  'close': ['closes','closed','closing'],
  'change': ['changes','changed','changing'],
  'dance': ['dances','danced','dancing'],
  'arrive': ['arrives','arrived','arriving'],
  'decide': ['decides','decided','deciding'],
  'invite': ['invites','invited','inviting'],
  'use': ['uses','used','using'],
  'hope': ['hopes','hoped','hoping'],
  'like': ['likes','liked','liking'],
  'love': ['loves','loved','loving'],
  'look': ['looks','looked','looking'],
  'work': ['works','worked','working'],
  'call': ['calls','called','calling'],
  'clean': ['cleans','cleaned','cleaning'],
  'cook': ['cooks','cooked','cooking'],
  'walk': ['walks','walked','walking'],
  'start': ['starts','started','starting'],
  'finish': ['finishes','finished','finishing'],
  'need': ['needs','needed','needing'],
  'want': ['wants','wanted','wanting'],
  'wait': ['waits','waited','waiting'],
  'join': ['joins','joined','joining'],
  'travel': ['travels','traveled','travelling','traveling'],
  'rain': ['rains','rained','raining'],
  'sound': ['sounds','sounded','sounding'],
  'taste': ['tastes','tasted','tasting'],
  'smell': ['smells','smelled','smelling'],
  'seem': ['seems','seemed','seeming'],
  'appear': ['appears','appeared','appearing'],
  'improve': ['improves','improved','improving'],
  'increase': ['increases','increased','increasing'],
  'share': ['shares','shared','sharing'],
  'prepare': ['prepares','prepared','preparing'],
  'borrow': ['borrows','borrowed','borrowing'],
  'brush': ['brushes','brushed','brushing'],
};

/**
 * 例文から対象単語を空欄化する
 * 活用形も含めてマッチさせる
 */
function replaceBlank(example, english) {
  const lw = english.toLowerCase();
  
  // 1. 不規則活用がある場合
  if (IRREGULAR[lw]) {
    const forms = [lw, ...IRREGULAR[lw]];
    // 長い形から順にマッチ（"swimming" before "swim"）
    forms.sort((a, b) => b.length - a.length);
    for (const form of forms) {
      const re = new RegExp(`\\b${escapeRegExp(form)}\\b`, 'gi');
      if (re.test(example)) {
        const matched = example.match(re)[0];
        return {
          sentence: example.replace(re, '_______'),
          matchedForm: matched
        };
      }
    }
  }
  
  // 2. 拡張規則活用パターン（子音重複・y→i変換・e脱落を含む）
  const patterns = [];
  // 基本形
  patterns.push(`\\b${escapeRegExp(lw)}(?:s|es|ed|d|ing|ly|er|est)?\\b`);
  // y→i変換 (carry→carries, study→studies)
  if (lw.endsWith('y')) {
    const stem = lw.slice(0, -1);
    patterns.push(`\\b${escapeRegExp(stem)}(?:ies|ied|ying)\\b`);
  }
  // e脱落 (stare→staring, dance→dancing)
  if (lw.endsWith('e')) {
    const stem = lw.slice(0, -1);
    patterns.push(`\\b${escapeRegExp(stem)}(?:ing|ed|er|est)\\b`);
  }
  // 子音重複 (admit→admitted, trap→trapped, stop→stopped)
  const lastChar = lw.slice(-1);
  if (/[bcdfgklmnprst]/.test(lastChar) && !lw.endsWith('ss')) {
    patterns.push(`\\b${escapeRegExp(lw)}${escapeRegExp(lastChar)}(?:ed|ing|er|est)\\b`);
  }
  // 複数形特殊 (comedy→comedies, cherry→cherries)
  if (lw.endsWith('y')) {
    const stem = lw.slice(0, -1);
    patterns.push(`\\b${escapeRegExp(stem)}ies\\b`);
  }
  // memory→memories
  if (lw.endsWith('ry') || lw.endsWith('ty') || lw.endsWith('ny')) {
    const stem = lw.slice(0, -1);
    patterns.push(`\\b${escapeRegExp(stem)}ies\\b`);
  }
  // century→centuries
  if (lw.endsWith('ury')) {
    const stem = lw.slice(0, -1);
    patterns.push(`\\b${escapeRegExp(stem)}ies\\b`);
  }
  
  for (const pat of patterns) {
    const re = new RegExp(pat, 'gi');
    if (re.test(example)) {
      const re2 = new RegExp(pat, 'gi');
      const matched = example.match(re2)[0];
      return {
        sentence: example.replace(new RegExp(pat, 'gi'), '_______'),
        matchedForm: matched
      };
    }
  }
  
  // 3. 単純な部分一致（大文字小文字無視）
  const re3 = new RegExp(`\\b${escapeRegExp(english)}\\b`, 'gi');
  if (re3.test(example)) {
    const matched = example.match(re3)[0];
    return {
      sentence: example.replace(re3, '_______'),
      matchedForm: matched
    };
  }
  
  // 4. 例文にそのまま含まれているか（正規表現なし）
  const idx = example.toLowerCase().indexOf(lw);
  if (idx !== -1) {
    const matched = example.substring(idx, idx + lw.length);
    return {
      sentence: example.substring(0, idx) + '_______' + example.substring(idx + lw.length),
      matchedForm: matched
    };
  }
  
  // 5. フォールバック: そのまま使用（空欄化できなかった）
  return { sentence: null, matchedForm: null };
}

// ========== ディストラクター生成 ==========

/**
 * 単語間の「紛らわしさスコア」を計算
 * 低いほど紛らわしい（類似度が高い）
 */
function confusionScore(target, candidate) {
  const t = target.toLowerCase();
  const c = candidate.toLowerCase();
  
  if (t === c) return Infinity; // 同じ単語は除外
  
  const editDist = levenshtein(t, c);
  let score = editDist;
  
  // 語頭一致ボーナス（最大-2.0）
  let prefixLen = 0;
  for (let i = 0; i < Math.min(t.length, c.length); i++) {
    if (t[i] === c[i]) prefixLen++;
    else break;
  }
  score -= prefixLen * 0.5;
  
  // 語長類似ボーナス
  const lenDiff = Math.abs(t.length - c.length);
  if (lenDiff === 0) score -= 0.5;
  else if (lenDiff === 1) score -= 0.3;
  
  // 語尾パターン一致ボーナス
  const suffixes = ['tion','ment','ness','able','ible','ful','less','ous','ive','ent','ant','ure','ary','ory','ing','ity','ence','ance'];
  for (const suf of suffixes) {
    if (t.endsWith(suf) && c.endsWith(suf)) {
      score -= 1.0;
      break;
    }
  }
  
  // 母音パターン類似ボーナス
  const vowelPattern = s => s.replace(/[^aeiou]/gi, '');
  if (vowelPattern(t) === vowelPattern(c)) score -= 0.5;
  
  return score;
}

/**
 * 高品質なディストラクター3つを選択（重複なし保証）
 */
function selectDistractors(targetWord, wordPool, count = 3) {
  const target = targetWord.toLowerCase();
  
  // ユニークな単語プール作成（重複除去）
  const uniquePool = [...new Set(wordPool.map(w => w.toLowerCase()))]
    .filter(w => w !== target);
  
  // スコア計算してソート
  const scored = uniquePool
    .map(w => ({ word: w, score: confusionScore(target, w) }))
    .sort((a, b) => a.score - b.score);
  
  // 上位から選択（重複なし・多様性確保）
  const selected = [];
  const usedWords = new Set();
  
  for (const item of scored) {
    if (selected.length >= count) break;
    const w = item.word.toLowerCase();
    if (usedWords.has(w)) continue;
    
    // 同じ頭文字が2つ以上にならないよう制限
    const firstLetter = w[0];
    const sameLetterCount = selected.filter(s => s[0].toLowerCase() === firstLetter).length;
    if (sameLetterCount < 2) {
      selected.push(item.word);
      usedWords.add(w);
    }
  }
  
  // 足りなければ補充（頭文字制限なし）
  for (const item of scored) {
    if (selected.length >= count) break;
    const w = item.word.toLowerCase();
    if (!usedWords.has(w)) {
      selected.push(item.word);
      usedWords.add(w);
    }
  }
  
  return selected.slice(0, count);
}

/**
 * 選択肢をシャッフルして返す
 */
function shuffleChoices(answer, distractors) {
  const all = [answer, ...distractors];
  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

// ========== メイン処理 ==========
function processGrade(grade) {
  const inputPath = path.join(__dirname, 'public', grade.file);
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`処理中: ${grade.label} (${data.length}語)`);
  console.log(`${'='.repeat(50)}`);
  
  // 全単語プール（ディストラクター候補）
  const wordPool = data.map(d => d.english);
  
  const quizItems = [];
  let blankFailCount = 0;
  
  for (const item of data) {
    const { rank, english, meanings, example, exampleJa } = item;
    
    // 空欄化
    const result = replaceBlank(example, english);
    
    if (!result.sentence) {
      blankFailCount++;
      if (blankFailCount <= 5) {
        console.log(`  ⚠ 空欄化失敗 rank=${rank} "${english}" in "${example}"`);
      }
      continue;
    }
    
    // ディストラクター生成
    const distractors = selectDistractors(english, wordPool);
    
    // 選択肢シャッフル
    const choices = shuffleChoices(english, distractors);
    
    quizItems.push({
      id: `${grade.key}_${rank}`,
      rank,
      question: result.sentence,
      questionJa: exampleJa,
      answer: english,
      matchedForm: result.matchedForm,
      choices,
      meanings,
      audioKey: `${grade.key}_pass`
    });
  }
  
  console.log(`  ✅ 生成: ${quizItems.length}問`);
  if (blankFailCount > 0) {
    console.log(`  ⚠ 空欄化失敗: ${blankFailCount}問`);
  }
  
  // サンプル表示
  console.log(`\n  --- サンプル ---`);
  for (let i = 0; i < Math.min(5, quizItems.length); i++) {
    const q = quizItems[i];
    console.log(`  [${q.rank}] ${q.question}`);
    console.log(`       → ${q.choices.join(' / ')} (答: ${q.answer})`);
  }
  
  return quizItems;
}

// 出力ディレクトリ作成
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const allResults = {};
for (const grade of GRADES) {
  const items = processGrade(grade);
  allResults[grade.key] = items;
  
  // 個別ファイル出力
  const outPath = path.join(OUTPUT_DIR, grade.output);
  fs.writeFileSync(outPath, JSON.stringify(items, null, 2), 'utf8');
  console.log(`  📁 出力: ${outPath}`);
}

// 統合ファイル出力
const combined = {};
for (const grade of GRADES) {
  combined[grade.key] = {
    label: grade.label,
    count: allResults[grade.key].length,
    items: allResults[grade.key]
  };
}
fs.writeFileSync(path.join(OUTPUT_DIR, 'passtan_all_quiz.json'), JSON.stringify(combined, null, 2), 'utf8');

console.log(`\n\n========== 完了 ==========`);
for (const grade of GRADES) {
  console.log(`${grade.label}: ${allResults[grade.key].length}問 → ${grade.output}`);
}
console.log(`出力先: ${OUTPUT_DIR}`);
