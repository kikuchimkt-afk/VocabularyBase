/**
 * Generate app.js and style.css for PassTan Marathon  
 * Writes to PassTan directory
 */
const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..');
const dirs = fs.readdirSync(appDir);
const ptDirName = dirs.find(d => d.includes('Marathon') && d.includes('PassTan'));
const ptDir = path.join(appDir, ptDirName);

// ==================== app.js ====================
const appJs = `/**
 * パス単マラソン - 出る順パス単4択空所補充クイズ
 */
'use strict';

const state = {
  quizData: {},
  grade: null,
  idStart: null,
  idEnd: null,
  questions: [],
  current: 0,
  correct: 0,
  wrong: 0,
  mistakes: [],
  answered: false,
  hintStage: 0,
  todayAnswered: 0,
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const on = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };

// ====== Storage Keys ======
const CLEARED_KEY = 'passtan_cleared';
const STATS_KEY = 'passtan_stats';
const STREAK_KEY = 'passtan_streak';
const MISTAKES_KEY = 'passtan_mistakes';
const MIN_ANSWERS = 10;
const MILESTONES = [20, 40, 60, 80, 100, 150, 200, 365];

// ====== Grade Config ======
const GRADES = [
  { key: '5kyu',    label: '5級',  icon: '🟢', file: 'pass5_quiz.json',     audioDir: '5kyu_pass' },
  { key: '4kyu',    label: '4級',  icon: '🔵', file: 'pass4_quiz.json',     audioDir: '4kyu_pass' },
  { key: '3kyu',    label: '3級',  icon: '🟡', file: 'pass3_quiz.json',     audioDir: '3kyu_pass' },
  { key: 'pre2kyu', label: '準2級', icon: '🟠', file: 'pass_pre2_quiz.json', audioDir: 'pre2kyu_pass' },
];

// ====== Cleared / Stats ======
function getClearedSet(grade) {
  try { const r = localStorage.getItem(CLEARED_KEY + '_' + grade); if (r) return new Set(JSON.parse(r)); } catch(e) {}
  return new Set();
}
function saveClearedSet(grade, s) {
  try { localStorage.setItem(CLEARED_KEY + '_' + grade, JSON.stringify([...s])); } catch(e) {}
}
function markCleared(grade, qId) { const s = getClearedSet(grade); s.add(qId); saveClearedSet(grade, s); }

function getStats(grade) {
  try { const r = localStorage.getItem(STATS_KEY + '_' + grade); if (r) return JSON.parse(r); } catch(e) {}
  return { totalAttempts: 0, correctAttempts: 0 };
}
function saveStats(grade, s) { try { localStorage.setItem(STATS_KEY + '_' + grade, JSON.stringify(s)); } catch(e) {} }
function recordStats(grade, ok) { const s = getStats(grade); s.totalAttempts++; if (ok) s.correctAttempts++; saveStats(grade, s); }

// ====== Mistake History ======
function getMistakeHistory() {
  try { const r = localStorage.getItem(MISTAKES_KEY); if (r) return JSON.parse(r); } catch(e) {}
  return [];
}
function saveMistakeHistory(arr) {
  try { localStorage.setItem(MISTAKES_KEY, JSON.stringify(arr.slice(-500))); } catch(e) {}
}
function addMistakeToHistory(q, grade) {
  const h = getMistakeHistory();
  if (h.some(x => x.id === q.id)) return;
  h.push({ id: q.id, grade, sentence: q.question, sentence_ja: q.questionJa || '', answer: q.answer, meanings: q.meanings, choices: q.choices, rank: q.rank, audioKey: q.audioKey, date: getTodayStr() });
  saveMistakeHistory(h);
}
function removeMistakeFromHistory(id) { saveMistakeHistory(getMistakeHistory().filter(x => x.id !== id)); }

// ====== Streak ======
function getStreakData() {
  try { const r = localStorage.getItem(STREAK_KEY); if (r) return JSON.parse(r); } catch(e) {}
  return { streak: 0, lastDate: null, totalDays: 0, shownMilestones: [] };
}
function saveStreakData(d) { try { localStorage.setItem(STREAK_KEY, JSON.stringify(d)); } catch(e) {} }
function getTodayStr() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }

function checkStreak() {
  const d = getStreakData(); const today = getTodayStr();
  if (d.lastDate === today) return d;
  const y = new Date(); y.setDate(y.getDate()-1);
  const ys = y.getFullYear() + '-' + String(y.getMonth()+1).padStart(2,'0') + '-' + String(y.getDate()).padStart(2,'0');
  if (d.lastDate !== ys && d.lastDate && d.lastDate !== today) { d.streak = 0; saveStreakData(d); }
  return d;
}

function recordTraining() {
  const d = getStreakData(); const today = getTodayStr();
  if (d.lastDate === today) return d;
  if (state.todayAnswered < MIN_ANSWERS) return d;
  const y = new Date(); y.setDate(y.getDate()-1);
  const ys = y.getFullYear() + '-' + String(y.getMonth()+1).padStart(2,'0') + '-' + String(y.getDate()).padStart(2,'0');
  d.streak = (d.lastDate === ys) ? d.streak + 1 : 1;
  d.lastDate = today; d.totalDays = (d.totalDays || 0) + 1;
  if (!d.shownMilestones) d.shownMilestones = [];
  saveStreakData(d); return d;
}

function trackAnswer() {
  state.todayAnswered++;
  if (state.todayAnswered === MIN_ANSWERS) { const sd = recordTraining(); renderStreakBadge(); return sd; }
  return null;
}

function renderStreakBadge() {
  const badge = $('#streakBadge'); if (!badge) return;
  const d = checkStreak(); const today = getTodayStr(); const trained = d.lastDate === today;
  if (d.streak === 0 && !trained) {
    badge.innerHTML = '<div class="streak-content"><span class="streak-icon">🌱</span><span class="streak-text">今日からトレーニングを始めよう！</span></div>';
  } else {
    const flame = d.streak >= 30 ? '🔥🔥🔥' : d.streak >= 10 ? '🔥🔥' : d.streak >= 3 ? '🔥' : '✨';
    badge.innerHTML = '<div class="streak-content"><span class="streak-icon">' + flame + '</span><div class="streak-info"><span class="streak-days">連続 <strong>' + d.streak + '</strong> 日継続中！</span>' + (trained ? '<span class="streak-done">✅ 今日のトレーニング完了</span>' : '<span class="streak-todo">📌 今日まだトレーニングしていません</span>') + '</div></div><div class="streak-total">累計 ' + (d.totalDays || d.streak) + ' 日</div>';
  }
}

function checkMilestone(sd) {
  if (!sd) return;
  const shown = sd.shownMilestones || [];
  for (const m of MILESTONES) {
    if (sd.streak >= m && !shown.includes(m)) {
      sd.shownMilestones.push(m); saveStreakData(sd); showCelebration(m, sd.streak); return;
    }
  }
}

function showCelebration(milestone, streak) {
  const emoji = milestone >= 100 ? '👑' : milestone >= 60 ? '🏆' : milestone >= 40 ? '🎖️' : '🥇';
  const title = milestone >= 100 ? '伝説の努力家！' : milestone >= 60 ? '素晴らしい継続力！' : milestone >= 40 ? '驚異的な集中力！' : 'すごい！よく頑張った！';
  const modal = document.createElement('div');
  modal.className = 'celebration-overlay'; modal.id = 'celebrationModal';
  modal.innerHTML = '<div class="celebration-modal slide-up"><div class="celebration-confetti">🎊</div><div class="celebration-emoji">' + emoji + '</div><h2 class="celebration-title">🎉 ' + milestone + '日連続達成！ 🎉</h2><p class="celebration-subtitle">' + title + '</p><div class="celebration-streak"><div class="celebration-days">' + streak + '</div><div class="celebration-label">日連続トレーニング</div></div><button class="celebration-close" onclick="closeCelebration()">閉じる</button></div>';
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('show'));
}
function closeCelebration() { const m = $('#celebrationModal'); if (m) { m.classList.remove('show'); setTimeout(() => m.remove(), 300); } }

// ====== Audio ======
let currentAudio = null;
function playAudio(grade, rank) {
  const gc = GRADES.find(g => g.key === grade);
  if (!gc) return;
  const url = 'audio/' + gc.audioDir + '/' + rank + '_example.mp3';
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  currentAudio = new Audio(url);
  currentAudio.play().catch(e => console.warn('Audio error:', e));
}

// ====== Data Loading ======
async function loadData() {
  for (const g of GRADES) {
    try {
      const res = await fetch(g.file);
      state.quizData[g.key] = await res.json();
    } catch(e) { console.warn('Failed to load ' + g.file, e); state.quizData[g.key] = []; }
  }
}

// ====== Setup ======
function initSetup() {
  const gradeBtns = $('#gradeBtns');
  gradeBtns.innerHTML = GRADES.map(g => {
    const count = (state.quizData[g.key] || []).length;
    return '<button class="grade-btn" data-grade="' + g.key + '">' + g.icon + ' ' + g.label + '<span class="count">' + count + '問</span></button>';
  }).join('');

  gradeBtns.querySelectorAll('.grade-btn').forEach(btn => {
    on(btn, 'click', () => {
      gradeBtns.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.grade = btn.dataset.grade;
      state.idStart = null; state.idEnd = null;
      const s = $('#wordIdStart'); const e = $('#wordIdEnd');
      if (s) s.value = ''; if (e) e.value = '';
      renderMarathonProgress(); updateIdRangeInfo(); updateSummary();
    });
  });

  on($('#questionCount'), 'change', updateSummary);
  on($('#wordIdStart'), 'input', () => { state.idStart = parseInt($('#wordIdStart').value) || null; updateSummary(); });
  on($('#wordIdEnd'), 'input', () => { state.idEnd = parseInt($('#wordIdEnd').value) || null; updateSummary(); });
  on($('#startBtn'), 'click', startQuiz);
  on($('#nextBtn'), 'click', nextQuestion);
  on($('#helpBtn'), 'click', () => { const c = $('#helpContent'); c.classList.toggle('hidden'); });
  updateMistakeBtn();
}

function renderMarathonProgress() {
  const c = $('#marathonProgress'); if (!c || !state.grade) { if(c) c.innerHTML = ''; return; }
  const allQs = state.quizData[state.grade] || [];
  const cleared = getClearedSet(state.grade);
  const clearedCount = [...cleared].filter(id => allQs.some(q => q.id === id)).length;
  const clearPct = allQs.length > 0 ? Math.round(clearedCount / allQs.length * 100) : 0;
  const stats = getStats(state.grade);
  const accPct = stats.totalAttempts > 0 ? Math.round(stats.correctAttempts / stats.totalAttempts * 100) : 0;

  c.innerHTML = '<div class="marathon-bar-group"><div class="marathon-label"><span>🏃 マラソン達成率</span><span class="marathon-value">' + clearedCount + ' / ' + allQs.length + ' (' + clearPct + '%)</span></div><div class="marathon-track"><div class="marathon-fill marathon-fill-clear" style="width:' + clearPct + '%"></div></div></div><div class="marathon-bar-group"><div class="marathon-label"><span>🎯 累計正答率</span><span class="marathon-value">' + (stats.totalAttempts > 0 ? accPct + '%' : '--') + ' (' + stats.correctAttempts + '/' + stats.totalAttempts + ')</span></div><div class="marathon-track"><div class="marathon-fill marathon-fill-acc" style="width:' + accPct + '%"></div></div></div>';
}

function updateIdRangeInfo() {
  const info = $('#wordRangeInfo'); if (!info || !state.grade) { if(info) info.textContent = ''; return; }
  const allQs = state.quizData[state.grade] || [];
  const ranks = allQs.map(q => q.rank);
  if (ranks.length > 0) info.textContent = '(#' + Math.min(...ranks) + '〜#' + Math.max(...ranks) + ')';
}

function getFilteredQuestions() {
  if (!state.grade) return [];
  let qs = state.quizData[state.grade] || [];
  if (state.idStart !== null) qs = qs.filter(q => q.rank >= state.idStart);
  if (state.idEnd !== null) qs = qs.filter(q => q.rank <= state.idEnd);
  return qs;
}

function updateSummary() {
  const box = $('#summary'); if (!box) return;
  const btn = $('#startBtn');
  if (!state.grade) { box.innerHTML = '<p class="summary-hint">級を選択してください</p>'; btn.disabled = true; return; }
  const qs = getFilteredQuestions();
  const n = parseInt($('#questionCount').value) || 0;
  const actual = n === 0 ? qs.length : Math.min(n, qs.length);
  const gc = GRADES.find(g => g.key === state.grade);
  box.innerHTML = '<p class="summary-text">' + gc.icon + ' ' + gc.label + '｜<strong>' + actual + '問</strong>（対象 ' + qs.length + '問中）</p>';
  btn.disabled = actual === 0;
}

function updateMistakeBtn() {
  const btn = $('#mistakeBtn'); if (!btn) return;
  const h = getMistakeHistory();
  btn.style.display = h.length > 0 ? 'block' : 'none';
  btn.textContent = '📝 ミスした問題を復習 (' + h.length + '問)';
  btn.onclick = () => startMistakeReview();
}

// ====== Quiz Start ======
function startQuiz() {
  const qs = getFilteredQuestions();
  const n = parseInt($('#questionCount').value) || 0;
  let pool = [...qs];
  // シャッフル
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  state.questions = n === 0 ? pool : pool.slice(0, n);
  state.current = 0; state.correct = 0; state.wrong = 0; state.mistakes = []; state.answered = false; state.hintStage = 0;
  showScreen('quizScreen');
  renderQuestion();
}

function startMistakeReview() {
  const h = getMistakeHistory();
  if (h.length === 0) return;
  state.grade = h[0].grade;
  state.questions = h.map(m => ({ id: m.id, rank: m.rank, question: m.sentence, questionJa: m.sentence_ja, answer: m.answer, choices: m.choices, meanings: m.meanings, audioKey: m.audioKey }));
  for (let i = state.questions.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [state.questions[i], state.questions[j]] = [state.questions[j], state.questions[i]]; }
  state.current = 0; state.correct = 0; state.wrong = 0; state.mistakes = []; state.answered = false; state.hintStage = 0;
  showScreen('quizScreen');
  renderQuestion();
}

// ====== Render Question ======
function renderQuestion() {
  const q = state.questions[state.current];
  if (!q) return;
  state.answered = false; state.hintStage = 0;

  $('#quizCounter').textContent = (state.current + 1) + ' / ' + state.questions.length;
  $('#scoreCorrect').textContent = '⭕ ' + state.correct;
  $('#scoreWrong').textContent = '❌ ' + state.wrong;
  const pct = ((state.current) / state.questions.length * 100);
  $('#progressFill').style.width = pct + '%';

  $('#questionRank').textContent = '#' + q.rank;
  const meaningStr = Array.isArray(q.meanings) ? q.meanings.join(', ') : (q.meanings || '');
  $('#questionMeaning').textContent = meaningStr;

  // Highlight blank
  const qText = q.question.replace(/_+/g, '<span class="blank">_______</span>');
  $('#questionText').innerHTML = qText;
  $('#questionJa').textContent = q.questionJa || '';
  $('#questionJa').classList.add('hidden');

  // Choices - reshuffle each time
  const shuffled = [...q.choices];
  for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }

  const area = $('#choicesArea');
  area.innerHTML = shuffled.map((c, i) =>
    '<button class="choice-btn" data-choice="' + c + '"><span class="choice-num">' + (i+1) + '</span> ' + c + '</button>'
  ).join('');

  area.querySelectorAll('.choice-btn').forEach(btn => {
    on(btn, 'click', () => handleAnswer(btn.dataset.choice));
  });

  $('#feedbackArea').classList.add('hidden');
  $('#nextBtn').style.display = 'none';
  $('#audioBtn').style.display = 'none';
  $('#hintBtn').style.display = 'inline-flex';
  $('#hintBtn').onclick = showHint;
}

function showHint() {
  state.hintStage++;
  if (state.hintStage >= 1) {
    $('#questionJa').classList.remove('hidden');
    $('#questionJa').classList.add('fade-in');
  }
}

// ====== Handle Answer ======
function handleAnswer(choice) {
  if (state.answered) return;
  state.answered = true;
  const q = state.questions[state.current];
  const isCorrect = choice.toLowerCase() === q.answer.toLowerCase();

  // Mark buttons
  $$('.choice-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.choice === q.answer) btn.classList.add('correct');
    if (btn.dataset.choice === choice && !isCorrect) btn.classList.add('wrong');
  });

  // Feedback
  const fb = $('#feedbackArea'); fb.classList.remove('hidden');
  if (isCorrect) {
    state.correct++;
    $('#feedbackIcon').textContent = '🎉';
    $('#feedbackDetails').innerHTML = '<span class="fb-correct">正解！</span>';
    markCleared(state.grade, q.id);
    removeMistakeFromHistory(q.id);
    playAudio(state.grade, q.rank);
  } else {
    state.wrong++;
    $('#feedbackIcon').textContent = '😢';
    $('#feedbackDetails').innerHTML = '<span class="fb-wrong">正解: <strong>' + q.answer + '</strong></span>';
    state.mistakes.push({ question: q, yourAnswer: choice });
    addMistakeToHistory(q, state.grade);
  }

  // Show Japanese
  $('#questionJa').classList.remove('hidden');

  recordStats(state.grade, isCorrect);
  const sd = trackAnswer();
  if (sd) checkMilestone(sd);

  $('#scoreCorrect').textContent = '⭕ ' + state.correct;
  $('#scoreWrong').textContent = '❌ ' + state.wrong;
  $('#nextBtn').style.display = 'inline-flex';
  $('#audioBtn').style.display = 'inline-flex';
  $('#audioBtn').onclick = () => playAudio(state.grade, q.rank);
  $('#hintBtn').style.display = 'none';

  // Auto next after 2s on correct
  if (isCorrect) { setTimeout(() => { if (state.answered) nextQuestion(); }, 2000); }
}

// ====== Next Question ======
function nextQuestion() {
  state.current++;
  if (state.current >= state.questions.length) {
    showResults();
  } else {
    renderQuestion();
  }
}

// ====== Results ======
function showResults() {
  showScreen('resultScreen');
  const total = state.correct + state.wrong;
  const pct = total > 0 ? Math.round(state.correct / total * 100) : 0;
  $('#scorePct').textContent = pct;
  $('#resultCorrect').textContent = state.correct;
  $('#resultWrong').textContent = state.wrong;
  $('#resultTotal').textContent = total;

  const circle = $('#scoreCircle');
  if (pct >= 80) circle.className = 'score-circle excellent';
  else if (pct >= 60) circle.className = 'score-circle good';
  else circle.className = 'score-circle needs-work';

  // Mistakes list
  const mc = $('#resultMistakes');
  if (state.mistakes.length > 0) {
    mc.innerHTML = '<h3 class="mistakes-title">❌ 間違えた問題</h3>' + state.mistakes.map(m => {
      const q = m.question;
      return '<div class="mistake-item glass-card"><p class="mistake-q">' + q.question + '</p><p class="mistake-ans">正解: <strong>' + q.answer + '</strong> ／ あなた: <span class="wrong-ans">' + m.yourAnswer + '</span></p></div>';
    }).join('');
  } else {
    mc.innerHTML = '<div class="perfect-score glass-card"><p>🎉 全問正解！素晴らしい！</p></div>';
  }

  on($('#retryBtn'), 'click', () => startQuiz());
  on($('#homeBtn'), 'click', () => { showScreen('setupScreen'); renderStreakBadge(); renderMarathonProgress(); updateMistakeBtn(); });

  renderMarathonProgress();
}

// ====== Screen Management ======
function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $('#' + id).classList.add('active');
  window.scrollTo(0, 0);
}

// ====== Init ======
async function init() {
  await loadData();
  initSetup();
  renderStreakBadge();
}

document.addEventListener('DOMContentLoaded', init);
`;

// ==================== style.css ====================
const styleCss = `/* === パス単マラソン === */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@400;500;700&display=swap');

:root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-card: rgba(15, 23, 42, 0.7);
  --glass: rgba(255,255,255,0.06);
  --glass-border: rgba(255,255,255,0.12);
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --accent: #06b6d4;
  --accent-glow: rgba(6,182,212,0.3);
  --accent2: #22d3ee;
  --correct: #34d399;
  --correct-bg: rgba(52,211,153,0.15);
  --wrong: #f87171;
  --wrong-bg: rgba(248,113,113,0.15);
  --radius: 16px;
  --radius-sm: 10px;
  --shadow: 0 8px 32px rgba(0,0,0,0.4);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', 'Noto Sans JP', sans-serif;
  background: var(--bg-primary);
  background-image: 
    radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(34,211,238,0.06) 0%, transparent 50%);
  color: var(--text-primary);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.screen { display: none; max-width: 480px; margin: 0 auto; padding: 20px 16px 40px; }
.screen.active { display: block; animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* === Header === */
.app-header { text-align: center; padding: 24px 0 16px; }
.app-title { font-size: 1.8rem; font-weight: 800; background: linear-gradient(135deg, #06b6d4, #22d3ee, #67e8f9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: none; }
.app-subtitle { color: var(--text-secondary); font-size: 0.85rem; margin-top: 4px; letter-spacing: 0.5px; }

/* === Glass Card === */
.glass-card {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 16px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* === Streak Badge === */
.streak-badge { margin-bottom: 16px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius); padding: 14px 16px; }
.streak-content { display: flex; align-items: center; gap: 12px; }
.streak-icon { font-size: 1.6rem; }
.streak-info { display: flex; flex-direction: column; gap: 2px; }
.streak-days { font-size: 0.9rem; color: var(--text-primary); }
.streak-done { font-size: 0.75rem; color: var(--correct); }
.streak-todo { font-size: 0.75rem; color: var(--accent); }
.streak-total { text-align: right; font-size: 0.75rem; color: var(--text-muted); margin-top: 6px; }
.streak-text { font-size: 0.85rem; color: var(--text-secondary); }

/* === Setup === */
.setup-heading { font-size: 1rem; font-weight: 700; margin-bottom: 12px; color: var(--accent2); }
.grade-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.grade-btn {
  background: var(--bg-secondary);
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: 14px 10px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.grade-btn:hover { border-color: var(--accent); background: rgba(6,182,212,0.1); }
.grade-btn.active { border-color: var(--accent); background: rgba(6,182,212,0.15); box-shadow: 0 0 20px var(--accent-glow); }
.grade-btn .count { display: block; font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; font-weight: 400; }

/* === Range Inputs === */
.range-group { margin-bottom: 8px; }
.range-label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px; }
.range-info { color: var(--text-muted); font-size: 0.75rem; }
.range-inputs { display: flex; align-items: center; gap: 8px; }
.range-input { flex: 1; background: var(--bg-secondary); border: 1px solid var(--glass-border); border-radius: 8px; padding: 10px 12px; color: var(--text-primary); font-size: 0.9rem; }
.range-input:focus { outline: none; border-color: var(--accent); }
.range-sep { color: var(--text-muted); }

/* === Select === */
.select-input { width: 100%; background: var(--bg-secondary); border: 1px solid var(--glass-border); border-radius: 8px; padding: 10px 12px; color: var(--text-primary); font-size: 0.9rem; }
.select-input:focus { outline: none; border-color: var(--accent); }

/* === Summary === */
.summary-box { text-align: center; }
.summary-text { font-size: 0.9rem; color: var(--text-secondary); }
.summary-hint { font-size: 0.85rem; color: var(--text-muted); }

/* === Buttons === */
.start-area { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
.start-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: white;
  box-shadow: 0 4px 15px var(--accent-glow);
}
.start-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 25px var(--accent-glow); }
.start-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.start-btn.secondary { background: var(--bg-secondary); border: 1px solid var(--glass-border); box-shadow: none; }
.mistake-review-btn {
  width: 100%; padding: 12px; border: 1px solid var(--wrong); border-radius: var(--radius-sm);
  background: var(--wrong-bg); color: var(--wrong); font-size: 0.9rem; font-weight: 600; cursor: pointer;
}

/* === Help === */
.help-section { text-align: center; margin-top: 16px; }
.help-toggle { background: none; border: none; color: var(--text-muted); font-size: 0.85rem; cursor: pointer; }
.help-content { text-align: left; margin-top: 12px; background: var(--glass); border-radius: var(--radius-sm); padding: 16px; }
.help-content h3 { color: var(--accent2); font-size: 0.9rem; margin: 12px 0 6px; }
.help-content h3:first-child { margin-top: 0; }
.help-content p { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px; }
.hidden { display: none !important; }

/* === Marathon Progress === */
.marathon-progress { margin-bottom: 16px; }
.marathon-bar-group { background: var(--glass); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 8px; }
.marathon-label { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; margin-bottom: 8px; }
.marathon-value { color: var(--accent); font-weight: 600; }
.marathon-track { height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden; }
.marathon-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
.marathon-fill-clear { background: linear-gradient(90deg, #06b6d4, #22d3ee); }
.marathon-fill-acc { background: linear-gradient(90deg, #34d399, #6ee7b7); }

/* === Quiz === */
.quiz-header { margin-bottom: 20px; }
.quiz-progress { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.counter { font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); }
.score-display { display: flex; gap: 12px; }
.score-correct { color: var(--correct); font-size: 0.85rem; font-weight: 600; }
.score-wrong { color: var(--wrong); font-size: 0.85rem; font-weight: 600; }
.progress-bar { height: 6px; background: var(--bg-secondary); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #06b6d4, #22d3ee); border-radius: 3px; transition: width 0.3s; }

/* === Question Card === */
.question-card { margin-bottom: 16px; }
.question-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.q-rank { font-size: 0.75rem; color: var(--accent); font-weight: 700; background: rgba(6,182,212,0.15); padding: 3px 10px; border-radius: 20px; }
.q-meaning { font-size: 0.75rem; color: var(--text-muted); max-width: 60%; text-align: right; }
.question-text { font-size: 1.15rem; line-height: 1.7; color: var(--text-primary); font-weight: 500; }
.question-text .blank { color: var(--accent); font-weight: 700; border-bottom: 2px dashed var(--accent); padding: 0 2px; }
.question-ja { font-size: 0.8rem; color: var(--text-muted); margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--glass-border); }
.fade-in { animation: fadeIn 0.3s ease; }

/* === Choices === */
.choices-area { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.choice-btn {
  width: 100%;
  padding: 14px 16px;
  background: var(--bg-secondary);
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 10px;
}
.choice-btn:hover:not(:disabled) { border-color: var(--accent); background: rgba(6,182,212,0.08); }
.choice-btn:active:not(:disabled) { transform: scale(0.98); }
.choice-num { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; min-width: 20px; }
.choice-btn.correct { border-color: var(--correct); background: var(--correct-bg); animation: pulse 0.3s; }
.choice-btn.wrong { border-color: var(--wrong); background: var(--wrong-bg); }
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }

/* === Feedback === */
.feedback-area { text-align: center; margin-bottom: 16px; animation: fadeIn 0.3s; }
.feedback-icon { font-size: 2rem; margin-bottom: 4px; }
.fb-correct { color: var(--correct); font-weight: 700; font-size: 1.1rem; }
.fb-wrong { color: var(--wrong); font-size: 0.95rem; }

/* === Actions === */
.quiz-actions { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.action-btn {
  padding: 10px 20px;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.action-btn:hover { border-color: var(--accent); }
.next-btn { background: linear-gradient(135deg, #06b6d4, #0891b2); border: none; color: white; }

/* === Results === */
.result-card { text-align: center; margin-bottom: 16px; }
.result-title { font-size: 1.3rem; font-weight: 800; color: var(--accent2); margin-bottom: 20px; }
.result-score { margin-bottom: 20px; }
.score-circle { width: 120px; height: 120px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 2.2rem; font-weight: 800; border: 4px solid var(--glass-border); }
.score-circle.excellent { border-color: var(--correct); color: var(--correct); background: var(--correct-bg); }
.score-circle.good { border-color: var(--accent); color: var(--accent); background: rgba(6,182,212,0.1); }
.score-circle.needs-work { border-color: var(--wrong); color: var(--wrong); background: var(--wrong-bg); }
.pct { font-size: 1rem; font-weight: 600; }
.result-stats { display: flex; justify-content: space-around; }
.stat { text-align: center; }
.stat-label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px; }
.stat-value { font-size: 1.3rem; font-weight: 700; }
.result-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }

/* === Mistakes List === */
.mistakes-title { font-size: 1rem; font-weight: 700; color: var(--wrong); margin-bottom: 12px; }
.mistake-item { margin-bottom: 8px; padding: 12px !important; }
.mistake-q { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px; }
.mistake-ans { font-size: 0.8rem; color: var(--text-muted); }
.wrong-ans { color: var(--wrong); }
.perfect-score { text-align: center; padding: 20px !important; font-size: 1.1rem; color: var(--correct); }

/* === Celebration === */
.celebration-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; opacity: 0; transition: opacity 0.3s; }
.celebration-overlay.show { opacity: 1; }
.celebration-modal { background: var(--bg-secondary); border: 1px solid var(--glass-border); border-radius: var(--radius); padding: 32px 24px; text-align: center; max-width: 360px; width: 90%; }
.celebration-confetti { font-size: 2rem; }
.celebration-emoji { font-size: 3rem; margin: 12px 0; }
.celebration-title { font-size: 1.2rem; color: var(--accent2); margin-bottom: 8px; }
.celebration-subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px; }
.celebration-days { font-size: 3rem; font-weight: 800; color: var(--accent); }
.celebration-label { font-size: 0.8rem; color: var(--text-muted); }
.celebration-close { margin-top: 20px; padding: 10px 30px; background: var(--accent); color: white; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
.slide-up { animation: slideUp 0.4s ease; }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

/* === Scrollbar === */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 2px; }
`;

// Write files
fs.writeFileSync(path.join(ptDir, 'app.js'), appJs, 'utf8');
console.log('Created: app.js (' + appJs.length + ' bytes)');

fs.writeFileSync(path.join(ptDir, 'style.css'), styleCss, 'utf8');
console.log('Created: style.css (' + styleCss.length + ' bytes)');

console.log('\\nAll app files generated in:', ptDir);
