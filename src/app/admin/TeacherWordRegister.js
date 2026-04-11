'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function TeacherWordRegister({ students, onRegistered }) {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState(null);

  const [selectedMeanings, setSelectedMeanings] = useState([]);
  const [customMeaning, setCustomMeaning] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [exampleSentenceJa, setExampleSentenceJa] = useState('');
  const [source, setSource] = useState('');
  const [assignedDate, setAssignedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveProgress, setSaveProgress] = useState('');
  const [history, setHistory] = useState([]);
  const [deliveryGradeFilter, setDeliveryGradeFilter] = useState('all');

  // Excel一括登録
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState('');
  const [bulkResults, setBulkResults] = useState(null);

  // 一括プレビュー＆編集
  const [bulkPreviewWords, setBulkPreviewWords] = useState(null);
  const [editingRowIndex, setEditingRowIndex] = useState(null);

  // AI意味一括生成
  const [aiMeaningLoading, setAiMeaningLoading] = useState(false);
  const [aiMeaningProgress, setAiMeaningProgress] = useState('');

  // 英検マスターリスト
  const [showMasterList, setShowMasterList] = useState(false);
  const [masterGrade, setMasterGrade] = useState('5kyu');
  const [masterRange, setMasterRange] = useState('1-50');
  const [masterLoading, setMasterLoading] = useState(false);

  // 教科書モード
  const isTextbook = masterGrade.startsWith('sunshine');
  const [textbookMode, setTextbookMode] = useState('section'); // 'section' or 'page'
  const [textbookSection, setTextbookSection] = useState('');
  const [textbookSections, setTextbookSections] = useState([]);
  const [textbookPageFrom, setTextbookPageFrom] = useState('');
  const [textbookPageTo, setTextbookPageTo] = useState('');
  const [textbookWordCache, setTextbookWordCache] = useState([]); // キャッシュ用

  // 毎日特訓
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailyGrade, setDailyGrade] = useState('sys5th');
  const [dailyStart, setDailyStart] = useState(1);
  const [dailyPerDay, setDailyPerDay] = useState(10);
  const [dailyStartDate, setDailyStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyEndDate, setDailyEndDate] = useState('');
  const [dailySkipWeekend, setDailySkipWeekend] = useState(true);
  const [dailyRunning, setDailyRunning] = useState(false);
  const [dailyProgress, setDailyProgress] = useState('');

  // 教科書選択時にセクション情報 + 単語データをロード
  useEffect(() => {
    if (!masterGrade.startsWith('sunshine')) {
      setTextbookSections([]);
      setTextbookWordCache([]);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/wordlist_${masterGrade}.json`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.meta && data.meta.sections) {
          setTextbookSections(data.meta.sections);
          setTextbookSection('');
        }
        if (data.words) {
          setTextbookWordCache(data.words);
        }
      } catch {}
    })();
  }, [masterGrade]);

  // 教科書のリアルタイム該当語数
  const textbookMatchCount = (() => {
    if (!isTextbook || textbookWordCache.length === 0) return null;
    if (textbookMode === 'section') {
      if (!textbookSection) return textbookWordCache.length;
      return textbookWordCache.filter(w => w.section === textbookSection).length;
    }
    if (textbookMode === 'page') {
      if (!textbookPageFrom && !textbookPageTo) return textbookWordCache.length;
      const pFrom = parseInt(textbookPageFrom) || 0;
      const pTo = parseInt(textbookPageTo) || 999;
      return textbookWordCache.filter(w => {
        if (!w.page) return false;
        const m = w.page.match(/p\.(\d+)(?:-(\d+))?/);
        if (!m) return false;
        const ps = parseInt(m[1]);
        const pe = m[2] ? parseInt(m[2]) : ps;
        return ps <= pTo && pFrom <= pe;
      }).length;
    }
    return null;
  })();

  // 前回の選択を記憶
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vb_teacher_selected_students');
      if (saved) {
        const ids = JSON.parse(saved);
        setSelectedStudents(new Set(ids));
      } else {
        // デフォルト: 全員選択
        setSelectedStudents(new Set(students.map(s => s.id)));
      }
    } catch {}
  }, [students]);

  const saveSelectedStudents = (ids) => {
    localStorage.setItem('vb_teacher_selected_students', JSON.stringify([...ids]));
  };

  const handleSearch = async () => {
    if (!word.trim()) return;
    setLoading(true);
    setMessage('');
    setCandidates(null);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.trim() }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setCandidates(data);
      setExampleSentence(data.example_sentence || '');
      setExampleSentenceJa(data.example_sentence_ja || '');
      setSelectedMeanings([]);
      setCustomMeaning('');
    } catch (err) {
      setMessage('意味の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const toggleMeaning = (meaning) => {
    if (selectedMeanings.includes(meaning)) {
      setSelectedMeanings(selectedMeanings.filter(m => m !== meaning));
    } else {
      setSelectedMeanings([...selectedMeanings, meaning]);
    }
  };

  const addCustomMeaning = () => {
    const m = customMeaning.trim();
    if (!m || selectedMeanings.includes(m)) return;
    setSelectedMeanings([...selectedMeanings, m]);
    setCustomMeaning('');
  };

  const toggleStudent = (id) => {
    const next = new Set(selectedStudents);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudents(next);
    saveSelectedStudents(next);
  };

  const toggleAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
      saveSelectedStudents(new Set());
    } else {
      const all = new Set(students.map(s => s.id));
      setSelectedStudents(all);
      saveSelectedStudents(all);
    }
  };

  const saveWord = async () => {
    if (!word.trim() || selectedMeanings.length === 0) {
      setMessage('英単語と意味を入力してください。');
      return;
    }
    if (selectedStudents.size === 0) {
      setMessage('配信先の生徒を選択してください。');
      return;
    }

    setIsSaving(true);
    setMessage('');
    const targetStudents = students.filter(s => selectedStudents.has(s.id));

    try {
      // 1. 音声生成（1回だけ）
      setSaveProgress('🔊 音声を生成中...');
      let wordAudioUrl = null;
      let sentenceAudioUrl = null;

      try {
        const wordRes = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: word.trim() }),
        });
        if (wordRes.ok) {
          const d = await wordRes.json();
          wordAudioUrl = d.url;
        }
      } catch {}

      if (exampleSentence) {
        try {
          const senRes = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: exampleSentence }),
          });
          if (senRes.ok) {
            const d = await senRes.json();
            sentenceAudioUrl = d.url;
          }
        } catch {}
      }

      // 2. 各生徒に登録
      let successCount = 0;
      let updatedCount = 0;
      for (let i = 0; i < targetStudents.length; i++) {
        const student = targetStudents[i];
        setSaveProgress(`📤 ${student.name} に登録中... (${i + 1}/${targetStudents.length})`);

        // 重複チェック
        const checkRes = await fetch(`/api/students/words?studentId=${student.id}`);
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          const exists = (checkData.words || []).find(
            w => w.english.toLowerCase() === word.trim().toLowerCase()
          );
          if (exists) {
            // 既存の単語 → 再出題（assign_count+1, assigned_date更新）
            setSaveProgress(`🔄 ${student.name}: "${word.trim()}" を再出題に更新中...`);
            const res = await fetch('/api/students/words/reassign', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                wordId: exists.id,
                assignedDate: assignedDate,
              }),
            });
            if (res.ok) updatedCount++;
            continue;
          }
        }

        const res = await fetch('/api/students/words', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: student.id,
            english: word.trim(),
            meanings: selectedMeanings,
            example_sentence: exampleSentence,
            example_sentence_ja: exampleSentenceJa,
            source: source,
            word_audio_url: wordAudioUrl,
            sentence_audio_url: sentenceAudioUrl,
            assigned_date: assignedDate,
            assigned_by: 'teacher',
          }),
        });

        if (res.ok) successCount++;
      }

      const totalAffected = successCount + updatedCount;
      let resultMsg = '';
      if (successCount > 0 && updatedCount > 0) {
        resultMsg = `✅ ${successCount}名に新規配信, ${updatedCount}名に再出題しました！`;
      } else if (updatedCount > 0) {
        resultMsg = `🔄 ${updatedCount}名に「${word.trim()}」を再出題しました！`;
      } else {
        resultMsg = `✅ ${successCount}名の生徒に「${word.trim()}」を配信しました！`;
      }

      setHistory(prev => [{
        word: word.trim(),
        meanings: [...selectedMeanings],
        count: totalAffected,
        date: assignedDate,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      }, ...prev]);

      setMessage(resultMsg);
      setSaveProgress('');
      setWord('');
      setCandidates(null);
      setSelectedMeanings([]);
      setExampleSentence('');
      setExampleSentenceJa('');
      setSource('');

      if (onRegistered) onRegistered();
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error(err);
      setMessage('保存中にエラーが発生しました。');
      setSaveProgress('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* 配信設定（常に表示） */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem',
          padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)',
          border: '2px solid var(--danger)', background: 'var(--danger-light)',
        }}>
          <span style={{ fontWeight: '700', color: 'var(--danger)' }}>📅 配信日（宿題日）</span>
          <input
            type="date"
            className="input-text"
            value={assignedDate}
            onChange={(e) => setAssignedDate(e.target.value)}
            style={{ width: 'auto', flex: 'unset', fontWeight: 600, border: '2px solid var(--danger)' }}
          />
        </div>
        {/* 配信先選択（常に表示） */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
              👥 配信先（{selectedStudents.size}名選択中）
            </span>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
              onClick={toggleAll}
            >
              {selectedStudents.size === students.length ? '☐ 全員解除' : '☑ 全員選択'}
            </button>
          </div>
          {/* 学年フィルター */}
          {(() => {
            const grades = [...new Set(students.map(s => s.grade).filter(Boolean))]
              .sort((a, b) => {
                const gradeOrder = (g) => {
                  const m = g.match(/(\D+)(\d+)/);
                  if (!m) return 0;
                  const base = m[1] === '高' ? 100 : m[1] === '中' ? 50 : m[1] === '小' ? 10 : 0;
                  return base + parseInt(m[2]);
                };
                return gradeOrder(b) - gradeOrder(a);
              });
            if (grades.length <= 1) return null;
            return (
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <button
                  onClick={() => setDeliveryGradeFilter('all')}
                  style={{
                    padding: '0.2rem 0.5rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
                    border: deliveryGradeFilter === 'all' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: deliveryGradeFilter === 'all' ? 'var(--primary)' : 'var(--bg-card)',
                    color: deliveryGradeFilter === 'all' ? 'white' : 'var(--text-muted)', cursor: 'pointer',
                  }}
                >全て</button>
                {grades.map(g => (
                  <button
                    key={g}
                    onClick={() => setDeliveryGradeFilter(deliveryGradeFilter === g ? 'all' : g)}
                    style={{
                      padding: '0.2rem 0.5rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
                      border: deliveryGradeFilter === g ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: deliveryGradeFilter === g ? 'var(--primary)' : 'var(--bg-card)',
                      color: deliveryGradeFilter === g ? 'white' : 'var(--text-muted)', cursor: 'pointer',
                    }}
                  >{g}</button>
                ))}
              </div>
            );
          })()}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {students.filter(s => deliveryGradeFilter === 'all' || s.grade === deliveryGradeFilter).map(s => (
              <label
                key={s.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)',
                  border: `1px solid ${selectedStudents.has(s.id) ? 'var(--primary)' : 'var(--border)'}`,
                  background: selectedStudents.has(s.id) ? 'var(--primary-light)' : 'transparent',
                  cursor: 'pointer', fontSize: '0.85rem', transition: '0.2s',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.has(s.id)}
                  onChange={() => toggleStudent(s.id)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span style={{ fontWeight: '600' }}>{s.name}</span>
                {s.grade && <span className="text-muted" style={{ fontSize: '0.75rem' }}>({s.grade})</span>}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 登録方法の切替 */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          className={`btn ${!showBulkImport ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setShowBulkImport(false)}
          style={{ flex: 1, fontSize: '0.85rem' }}
        >
          📝 1語ずつ登録
        </button>
        <button
          className={`btn ${showBulkImport && !showMasterList ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setShowBulkImport(true); setShowMasterList(false); }}
          style={{ flex: 1, fontSize: '0.85rem' }}
        >
          📄 Excel一括登録
        </button>
        <button
          className={`btn ${showMasterList ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setShowMasterList(true); setShowBulkImport(true); }}
          style={{ flex: 1, fontSize: '0.85rem' }}
        >
          📚 単語リスト
        </button>
      </div>

      {/* マスターリストから登録 */}
      {showMasterList && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem' }}>📚 マスターリストから登録</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            単語帳と番号範囲を指定して、単語を一括登録できます。
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>単語帳</label>
              <select
                value={masterGrade}
                onChange={e => setMasterGrade(e.target.value)}
                className="input-text"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: 'auto' }}
              >
                <option value="5kyu">英検5級 (439語)</option>
                <option value="4kyu">英検4級 (726語)</option>
                <option value="3kyu">英検3級 (996語)</option>
                <option value="準2kyu">英検準2級 (1222語)</option>
                <option value="2kyu">英検2級 (2000語)</option>
                <option value="pre1kyu">英検準1級パス単 (1900語)</option>
                <option value="ex_pre1kyu">EX準1級 (2434語)</option>
                <option disabled>──── 単語帳 ────</option>
                <option value="sys5th">シス単5訂版 (2027語)</option>
                <option value="leap">LEAP (1935語)</option>
                <option value="target1900">ターゲット1900 (1900語)</option>
                <option value="target1400extra">高校生になったらすぐに覚える368語</option>
                <option disabled>──── 熟語 ────</option>
                <option value="idiom1000">英熟語ターゲット1000 (1000語)</option>
                <option disabled>──── 中学教科書 ────</option>
                <option value="sunshine1">開隆堂サンシャイン中学1年生 (1309語)</option>
                <option value="sunshine2">開隆堂サンシャイン中学2年生 (1149語)</option>
                <option value="sunshine3">開隆堂サンシャイン中学3年生 (1062語)</option>
              </select>
            </div>

            {/* 教科書モード: セクション or ページ範囲 */}
            {isTextbook ? (
              <>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>抽出方法</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="radio" name="tbMode" checked={textbookMode === 'section'} onChange={() => setTextbookMode('section')} style={{ accentColor: 'var(--primary)' }} />
                      Program単位
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="radio" name="tbMode" checked={textbookMode === 'page'} onChange={() => setTextbookMode('page')} style={{ accentColor: 'var(--primary)' }} />
                      ページ範囲
                    </label>
                  </div>
                </div>
                {textbookMode === 'section' ? (
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>セクション</label>
                    <select
                      value={textbookSection}
                      onChange={e => setTextbookSection(e.target.value)}
                      className="input-text"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: 'auto', minWidth: '200px' }}
                    >
                      <option value="">全セクション</option>
                      {textbookSections.map(s => (
                        <option key={s.key} value={s.key}>{s.label} ({s.count}語)</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>ページ範囲</label>
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>p.</span>
                        <input
                          type="number"
                          value={textbookPageFrom}
                          onChange={e => setTextbookPageFrom(e.target.value)}
                          placeholder="開始"
                          className="input-text"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '70px' }}
                        />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>～ p.</span>
                        <input
                          type="number"
                          value={textbookPageTo}
                          onChange={e => setTextbookPageTo(e.target.value)}
                          placeholder="終了"
                          className="input-text"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '70px' }}
                        />
                        {textbookMatchCount !== null && (
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginLeft: '0.3rem', whiteSpace: 'nowrap' }}>
                            → {textbookMatchCount}語
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>番号範囲</label>
                <input
                  type="text"
                  value={masterRange}
                  onChange={e => setMasterRange(e.target.value)}
                  placeholder="例: 1-50, 51-100"
                  className="input-text"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '120px' }}
                />
              </div>
            )}

            <button
              className="btn btn-primary"
              disabled={masterLoading}
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              onClick={async () => {
                setMasterLoading(true);
                try {
                  const res = await fetch(`/wordlist_${masterGrade}.json`);
                  if (!res.ok) throw new Error('Failed to load word list');
                  const rawData = await res.json();

                  // 教科書の場合: wrapped format { meta, words }
                  const isTextbookData = rawData.meta && rawData.words;
                  const allWords = isTextbookData ? rawData.words : rawData;

                  let selected;
                  if (isTextbookData) {
                    if (textbookMode === 'section' && textbookSection) {
                      selected = allWords.filter(w => w.section === textbookSection);
                    } else if (textbookMode === 'page' && textbookPageFrom) {
                      const pFrom = parseInt(textbookPageFrom) || 0;
                      const pTo = parseInt(textbookPageTo) || 999;
                      selected = allWords.filter(w => {
                        if (!w.page) return false;
                        // Parse page range like "p.71-73" or "p.30"
                        const pageMatch = w.page.match(/p\.(\d+)(?:-(\d+))?/);
                        if (!pageMatch) return false;
                        const pageStart = parseInt(pageMatch[1]);
                        const pageEnd = pageMatch[2] ? parseInt(pageMatch[2]) : pageStart;
                        // Range overlap: [pageStart, pageEnd] ∩ [pFrom, pTo]
                        return pageStart <= pTo && pFrom <= pageEnd;
                      });
                    } else {
                      selected = allWords;
                    }
                  } else {
                    const [startStr, endStr] = masterRange.split('-').map(s => s.trim());
                    const start = parseInt(startStr) || 1;
                    const end = parseInt(endStr) || start;
                    selected = allWords.filter(w => w.rank >= start && w.rank <= end);
                  }

                  if (selected.length === 0) {
                    alert('指定した条件に該当する単語が見つかりません');
                    return;
                  }
                  const parsed = selected.map((w, idx) => ({
                    id: idx,
                    english: w.word || w.english,
                    meanings: Array.isArray(w.meanings) ? w.meanings.join('、') : (w.meanings || w.meaning || ''),
                    example: w.example || '',
                    exampleJa: w.exampleJa || w.translation || '',
                    removed: false,
                    reassign: true,
                    listType: masterGrade,
                    rank: w.rank || (idx + 1),
                  }));
                  setBulkPreviewWords(parsed);
                  setBulkResults(null);
                  setEditingRowIndex(null);
                  setShowMasterList(false);
                  setShowBulkImport(true);
                } catch (err) {
                  alert(`リストの読み込みに失敗: ${err.message}`);
                } finally {
                  setMasterLoading(false);
                }
              }}
            >
              {masterLoading ? '読み込み中...' : '🔍 プレビュー'}
            </button>
          </div>
          {!isTextbook && (
            <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>
              ※ 番号は出題頻度順のランクです。例: 「1-50」で最頻出50語を登録
            </div>
          )}
          <button
            className="btn"
            onClick={() => { setDailyGrade(masterGrade); setShowDailyModal(true); }}
            style={{
              padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            🔥 毎日特訓
          </button>
        </div>
      )}

      {/* Excel一括登録 */}
      {showBulkImport && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem' }}>📄 Excel / CSV で単語一括登録</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            「英単語」「意味」「例文」の3列を含むファイルをアップロード。例文の和訳と音声は自動生成されます。
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <label
              className="btn btn-primary"
              style={{ cursor: bulkImporting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: bulkImporting ? 0.6 : 1 }}
            >
              {bulkImporting ? '📤 処理中...' : '📤 ファイルを選択'}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    try {
                      const data = new Uint8Array(evt.target.result);
                      const workbook = XLSX.read(data, { type: 'array' });
                      const sheet = workbook.Sheets[workbook.SheetNames[0]];
                      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
                      if (rows.length === 0) {
                        setBulkResults({ error: 'データが空です' });
                        return;
                      }
                      const parsed = rows.map((row, idx) => {
                        const english = (row['english'] || row['英単語'] || row['English'] || row['word'] || '').toString().trim();
                        const meaningsRaw = (row['meanings'] || row['意味'] || row['訳'] || '').toString().trim();
                        const example = (row['example'] || row['例文'] || row['example_sentence'] || '').toString().trim();
                        return {
                          id: idx,
                          english,
                          meanings: meaningsRaw,
                          example,
                          removed: false,
                          reassign: true,
                        };
                      }).filter(w => w.english); // 空行を除外
                      if (parsed.length === 0) {
                        setBulkResults({ error: '有効な単語が見つかりませんでした' });
                        return;
                      }
                      setBulkPreviewWords(parsed);
                      setBulkResults(null);
                      setEditingRowIndex(null);
                    } catch (err) {
                      setBulkResults({ error: `ファイル読み込みエラー: ${err.message}` });
                    }
                  };
                  reader.readAsArrayBuffer(file);
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
                disabled={bulkImporting}
              />
            </label>
            <button
              className="btn btn-outline"
              onClick={() => {
                const header = '英単語,意味,例文';
                const rows = [
                  'determine,決定する、特定する,We need to determine the best approach.',
                  'purchase,購入する、買う,She decided to purchase a new laptop.',
                  'significant,重要な、意味のある,The results showed a significant improvement.',
                ];
                const csv = '\uFEFF' + [header, ...rows].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'VocabularyBase_単語一括登録サンプル.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              📥 サンプルをダウンロード
            </button>
          </div>

          {/* ===== プレビュー＆編集エリア ===== */}
          {bulkPreviewWords && !bulkResults && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <p style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary)', margin: 0 }}>
                  📋 {bulkPreviewWords.filter(w => !w.removed).length}語をプレビュー中
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                    onClick={() => {
                      const nextId = bulkPreviewWords.length > 0 ? Math.max(...bulkPreviewWords.map(w => w.id)) + 1 : 0;
                      setBulkPreviewWords([...bulkPreviewWords, {
                        id: nextId,
                        english: '',
                        meanings: '',
                        example: '',
                        removed: false,
                        reassign: true,
                      }]);
                      setEditingRowIndex(nextId);
                    }}
                  >＋ 単語を追加</button>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                    onClick={() => {
                      setBulkPreviewWords(null);
                      setEditingRowIndex(null);
                    }}
                  >🗑️ クリア</button>
                </div>
              </div>

              {/* AI意味一括生成ボタン */}
              {bulkPreviewWords.some(w => !w.removed && !w.meanings.trim()) && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                    disabled={aiMeaningLoading}
                    onClick={async () => {
                      setAiMeaningLoading(true);
                      const emptyWords = bulkPreviewWords.filter(w => !w.removed && !w.meanings.trim() && w.english.trim());
                      let updated = [...bulkPreviewWords];
                      for (let i = 0; i < emptyWords.length; i++) {
                        const pw = emptyWords[i];
                        setAiMeaningProgress(`${i + 1}/${emptyWords.length}: ${pw.english}`);
                        if (i > 0) await new Promise(r => setTimeout(r, 1000));
                        try {
                          const res = await fetch('/api/gemini', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ word: pw.english.trim() }),
                          });
                          if (res.ok) {
                            const data = await res.json();
                            const allMeanings = data.meanings || [];
                            updated = updated.map(w =>
                              w.id === pw.id ? {
                                ...w,
                                aiCandidates: allMeanings,
                                aiSelected: new Set(allMeanings),
                                meanings: allMeanings.join('、'),
                                example: w.example || data.example_sentence || '',
                                exampleJa: data.example_sentence_ja || '',
                              } : w
                            );
                            setBulkPreviewWords([...updated]);
                          }
                        } catch {}
                      }
                      setAiMeaningLoading(false);
                      setAiMeaningProgress('');
                    }}
                  >
                    {aiMeaningLoading ? `⏳ ${aiMeaningProgress}` : `🤖 意味を一括生成（${bulkPreviewWords.filter(w => !w.removed && !w.meanings.trim() && w.english.trim()).length}語）`}
                  </button>
                </div>
              )}

              <div style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                maxHeight: '400px',
                overflowY: 'auto',
              }}>
                {/* ヘッダー */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.5fr 2fr 50px auto',
                  gap: '0.5rem',
                  padding: '0.6rem 0.75rem',
                  background: 'var(--primary-light)',
                  borderBottom: '2px solid var(--border)',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}>
                  <span>英単語</span>
                  <span>意味</span>
                  <span>例文</span>
                  <span style={{ textAlign: 'center', fontSize: '0.65rem' }}>再出題</span>
                  <span style={{ width: '60px', textAlign: 'center' }}>操作</span>
                </div>

                {/* 各行 */}
                {bulkPreviewWords.map((pw) => (
                  <div
                    key={pw.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1.5fr 2fr 50px auto',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderBottom: '1px solid var(--border)',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      opacity: pw.removed ? 0.4 : 1,
                      textDecoration: pw.removed ? 'line-through' : 'none',
                      background: pw.removed ? 'var(--danger-light)' : (editingRowIndex === pw.id ? 'var(--secondary-light)' : 'transparent'),
                      transition: 'background 0.15s',
                    }}
                  >
                    {editingRowIndex === pw.id && !pw.removed ? (
                      <>
                        <input
                          className="input-text"
                          value={pw.english}
                          onChange={(e) => {
                            setBulkPreviewWords(bulkPreviewWords.map(w =>
                              w.id === pw.id ? { ...w, english: e.target.value } : w
                            ));
                          }}
                          placeholder="英単語"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', margin: 0 }}
                          autoFocus
                        />
                        <input
                          className="input-text"
                          value={pw.meanings}
                          onChange={(e) => {
                            setBulkPreviewWords(bulkPreviewWords.map(w =>
                              w.id === pw.id ? { ...w, meanings: e.target.value } : w
                            ));
                          }}
                          placeholder="意味（カンマ区切り）"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', margin: 0 }}
                        />
                        <input
                          className="input-text"
                          value={pw.example}
                          onChange={(e) => {
                            setBulkPreviewWords(bulkPreviewWords.map(w =>
                              w.id === pw.id ? { ...w, example: e.target.value } : w
                            ));
                          }}
                          placeholder="例文（空欄で自動生成）"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', margin: 0 }}
                        />
                        <div style={{ display: 'flex', gap: '0.25rem', width: '60px', justifyContent: 'center' }}>
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: '0.2rem' }}
                            title="確定"
                            onClick={() => setEditingRowIndex(null)}
                          >✅</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pw.english || <span className="text-muted" style={{ fontStyle: 'italic' }}>(空)</span>}
                        </span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pw.meanings || <span className="text-muted" style={{ fontStyle: 'italic' }}>(空)</span>}
                        </span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }} className="text-muted">
                          {pw.example || <span style={{ fontStyle: 'italic' }}>(自動生成)</span>}
                        </span>
                        <div style={{ display: 'flex', gap: '0.25rem', width: '60px', justifyContent: 'center' }}>
                          {pw.removed ? (
                            <button
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '0.2rem', color: 'var(--secondary)' }}
                              title="復元"
                              onClick={() => {
                                setBulkPreviewWords(bulkPreviewWords.map(w =>
                                  w.id === pw.id ? { ...w, removed: false } : w
                                ));
                              }}
                            >↩️</button>
                          ) : (
                            <>
                              <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '0.2rem' }}
                                title="編集"
                                onClick={() => setEditingRowIndex(pw.id)}
                              >✏️</button>
                              <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '0.2rem', color: 'var(--danger)' }}
                                title="削除"
                                onClick={() => {
                                  setBulkPreviewWords(bulkPreviewWords.map(w =>
                                    w.id === pw.id ? { ...w, removed: true } : w
                                  ));
                                  if (editingRowIndex === pw.id) setEditingRowIndex(null);
                                }}
                              >🗑️</button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                    {/* 再出題トグル（編集モード時も削除時も表示） */}
                    {!pw.removed && (
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <input
                          type="checkbox"
                          checked={pw.reassign !== false}
                          onChange={(e) => {
                            setBulkPreviewWords(bulkPreviewWords.map(w =>
                              w.id === pw.id ? { ...w, reassign: e.target.checked } : w
                            ));
                          }}
                          style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
                          title="登録済みの場合に再出題する"
                        />
                      </div>
                    )}
                    {pw.removed && <div />}
                    {/* AI意味候補の選択チップ */}
                    {!pw.removed && pw.aiCandidates && pw.aiCandidates.length > 0 && editingRowIndex !== pw.id && (
                      <div style={{
                        gridColumn: '1 / -1',
                        display: 'flex', flexWrap: 'wrap', gap: '0.3rem',
                        padding: '0.25rem 0.5rem 0.5rem',
                      }}>
                        {pw.aiCandidates.map((m, mi) => {
                          const isSelected = pw.aiSelected?.has(m);
                          return (
                            <button
                              key={mi}
                              onClick={() => {
                                const next = new Set(pw.aiSelected || []);
                                if (isSelected) next.delete(m); else next.add(m);
                                const newMeanings = pw.aiCandidates.filter(c => next.has(c)).join('、');
                                setBulkPreviewWords(bulkPreviewWords.map(w =>
                                  w.id === pw.id ? { ...w, aiSelected: next, meanings: newMeanings } : w
                                ));
                              }}
                              style={{
                                padding: '0.2rem 0.5rem', borderRadius: 20, fontSize: '0.7rem',
                                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                background: isSelected ? 'var(--primary-light)' : 'transparent',
                                color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer', fontFamily: 'inherit', fontWeight: isSelected ? 600 : 400,
                                transition: '0.15s',
                              }}
                            >
                              {isSelected ? '✓ ' : ''}{m}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 登録ボタン */}
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.75rem', fontWeight: '700' }}
                  disabled={bulkImporting || selectedStudents.size === 0 || bulkPreviewWords.filter(w => !w.removed && w.english.trim() && w.meanings.trim()).length === 0}
                  onClick={async () => {
                    if (selectedStudents.size === 0) {
                      setBulkResults({ error: '配信先の生徒を選択してください' });
                      return;
                    }
                    const wordsToRegister = bulkPreviewWords
                      .filter(w => !w.removed && w.english.trim() && w.meanings.trim())
                      .map(w => {
                        const sourceMap = {
                          '5kyu': '英検5級', '4kyu': '英検4級', '3kyu': '英検3級', '準2kyu': '英検準2級', '2kyu': '英検2級', 'pre1kyu': '英検準1級パス単', 'ex_pre1kyu': 'EX準1級',
                          'sys5th': 'シス単5訂版', 'leap': 'LEAP', 'target1900': 'ターゲット1900', 'target1400extra': 'ターゲット1400extra', 'idiom1000': '熟語ターゲット1000'
                        };
                        const sourceName = (w.listType && w.rank) ? `${sourceMap[w.listType]} No.${w.rank}` : '';
                        return {
                          english: w.english.trim(),
                          meanings: w.meanings.trim(),
                          example: w.example.trim(),
                          exampleJa: w.exampleJa ? w.exampleJa.trim() : '',
                          reassign: w.reassign !== false,
                          listType: w.listType,
                          rank: w.rank,
                          source: sourceName
                        };
                      });
                    if (wordsToRegister.length === 0) {
                      setBulkResults({ error: '登録する単語がありません' });
                      return;
                    }
                    setBulkImporting(true);
                    setBulkProgress('🔄 音声生成・翻訳・登録中（数分かかる場合があります）...');
                    try {
                      const res = await fetch('/api/words/import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          words: wordsToRegister,
                          studentIds: [...selectedStudents],
                          assignedDate,
                        }),
                      });
                      if (!res.ok) {
                        const err = await res.json();
                        throw new Error(err.error || 'Import failed');
                      }
                      const data = await res.json();
                      setBulkResults(data);
                      setBulkPreviewWords(null);
                      setEditingRowIndex(null);
                      if (onRegistered) onRegistered();

                      // 例文が必要な単語があれば自動生成開始
                      const needIds = data.wordIdsNeedingExamples || [];
                      if (needIds.length > 0) {
                        setBulkProgress(`🔄 例文生成中... (0/${needIds.length})`);
                        let done = 0;
                        for (const wid of needIds) {
                          if (done > 0) await new Promise(r => setTimeout(r, 2000));
                          try {
                            await fetch('/api/students/words/generate', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ wordId: wid }),
                            });
                          } catch {}
                          done++;
                          setBulkProgress(`🔄 例文生成中... (${done}/${needIds.length})`);
                        }
                        setBulkProgress(`✅ 例文生成完了 (${done}語)`);
                      } else {
                        setBulkProgress('');
                      }
                    } catch (err) {
                      setBulkResults({ error: err.message });
                      setBulkProgress('');
                    } finally {
                      setBulkImporting(false);
                    }
                  }}
                >
                  {bulkImporting
                    ? '📤 登録中...'
                    : `📤 ${bulkPreviewWords.filter(w => !w.removed && w.english.trim() && w.meanings.trim()).length}語を${selectedStudents.size}名に登録する`}
                </button>
              </div>
            </div>
          )}

          {bulkProgress && (
            <p style={{ marginTop: '0.75rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem' }}>
              {bulkProgress}
            </p>
          )}

          {bulkResults && (
            <div style={{ marginTop: '1rem' }}>
              {bulkResults.error ? (
                <p style={{ color: 'var(--danger)', fontWeight: '600' }}>❌ {bulkResults.error}</p>
              ) : (
                <>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                    ✅ {bulkResults.summary.success}語登録完了 · {bulkResults.summary.students}名の生徒に配信
                  </p>
                  <div style={{ fontSize: '0.8rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
                    {bulkResults.results.map((r, i) => (
                      <div key={i} style={{ padding: '0.3rem 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: '600' }}>{r.word}</span>
                        {r.meanings && <span className="text-muted"> ({r.meanings})</span>}
                        <span style={{ marginLeft: '0.5rem' }}>{r.status}</span>
                        {r.detail && <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginLeft: '1rem' }}>{r.detail}</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* 単語検索（1語ずつ） */}
      {!showBulkImport && (
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>📝 単語を登録</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            className="input-text"
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="英単語を入力（例: inevitable）"
            disabled={loading || isSaving}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={!word.trim() || loading || isSaving}
            style={{ whiteSpace: 'nowrap' }}
          >
            {loading ? '検索中...' : '🔍 検索'}
          </button>
        </div>

        {message && (
          <div style={{
            margin: '1rem 0', padding: '0.75rem',
            backgroundColor: message.includes('失敗') || message.includes('エラー') ? 'var(--danger-light)' : 'var(--secondary-light)',
            borderRadius: 'var(--radius-md)',
            color: message.includes('失敗') || message.includes('エラー') ? 'var(--danger)' : 'var(--secondary)',
            fontWeight: '600',
          }}>
            {message}
          </div>
        )}

        {saveProgress && (
          <div style={{
            margin: '0.5rem 0', padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)',
            color: 'var(--primary)', fontSize: '0.85rem',
          }}>
            {saveProgress}
          </div>
        )}

        {/* 検索結果 */}
        {candidates && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            {/* 意味の選択 */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontWeight: '600', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                📝 日本語訳（タップで選択・複数OK）
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {candidates.meanings?.map((meaning, i) => (
                  <button
                    key={i}
                    className={`btn ${selectedMeanings.includes(meaning) ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => toggleMeaning(meaning)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    {selectedMeanings.includes(meaning) ? '✓ ' : '+ '}{meaning}
                  </button>
                ))}
              </div>
              {/* カスタム意味入力 */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input
                  className="input-text"
                  type="text"
                  value={customMeaning}
                  onChange={(e) => setCustomMeaning(e.target.value)}
                  placeholder="任意の意味を追加..."
                  onKeyDown={(e) => e.key === 'Enter' && addCustomMeaning()}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn-secondary"
                  onClick={addCustomMeaning}
                  disabled={!customMeaning.trim()}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  ＋ 追加
                </button>
              </div>
              {/* 選択された意味の表示 */}
              {selectedMeanings.length > 0 && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {selectedMeanings.map((m, i) => (
                    <span key={i} className="badge badge-green" style={{ cursor: 'pointer' }} onClick={() => toggleMeaning(m)}>
                      {m} ✕
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 例文 */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontWeight: '600', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                📖 例文（編集可能）
              </label>
              <input
                className="input-text"
                type="text"
                value={exampleSentence}
                onChange={(e) => setExampleSentence(e.target.value)}
                placeholder="English sentence"
              />
              <input
                className="input-text"
                type="text"
                value={exampleSentenceJa}
                onChange={(e) => setExampleSentenceJa(e.target.value)}
                placeholder="日本語訳"
                style={{ marginTop: '0.5rem' }}
              />
            </div>

            {/* 出典 */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontWeight: '600', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                📍 出典（任意）
              </label>
              <input
                className="input-text"
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Lesson 5 p.42"
              />
            </div>

            {/* 登録ボタン */}
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: '700' }}
              onClick={saveWord}
              disabled={selectedMeanings.length === 0 || selectedStudents.size === 0 || isSaving}
            >
              {isSaving
                ? '登録中...'
                : `📤 ${selectedStudents.size}名の生徒に登録する`}
            </button>
          </div>
        )}
      </div>
      )}

      {/* 配信履歴 */}
      {history.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem' }}>📋 配信履歴（今回のセッション）</h3>
          {history.map((h, i) => (
            <div key={i} style={{
              padding: '0.5rem 0', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem',
            }}>
              <div>
                <span style={{ fontWeight: '600' }}>{h.word}</span>
                <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                  ({h.meanings.join(', ')})
                </span>
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                {h.date} · {h.count}名 · {h.time}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* 毎日特訓モーダル */}
      {showDailyModal && (() => {
        // スケジュール計算
        const calcSchedule = () => {
          if (!dailyStartDate || !dailyEndDate || dailyPerDay < 1) return [];
          const schedule = [];
          let current = new Date(dailyStartDate + 'T00:00:00');
          const end = new Date(dailyEndDate + 'T00:00:00');
          let wordIdx = dailyStart;
          while (current <= end) {
            const dow = current.getDay();
            if (!dailySkipWeekend || (dow !== 0 && dow !== 6)) {
              const from = wordIdx;
              const to = wordIdx + dailyPerDay - 1;
              schedule.push({
                date: current.toISOString().split('T')[0],
                label: `${current.getMonth()+1}/${current.getDate()}`,
                dow: ['日','月','火','水','木','金','土'][dow],
                from, to,
              });
              wordIdx = to + 1;
            }
            current.setDate(current.getDate() + 1);
          }
          return schedule;
        };
        const schedule = calcSchedule();
        const totalWords = schedule.length * dailyPerDay;

        const isDailyTextbook = dailyGrade.startsWith('sunshine');
        const listOptions = [
          { value: '5kyu', label: '英検5級 (439語)' },
          { value: '4kyu', label: '英検4級 (726語)' },
          { value: '3kyu', label: '英検3級 (996語)' },
          { value: '準2kyu', label: '英検準2級 (1222語)' },
          { value: '2kyu', label: '英検2級 (2000語)' },
          { value: 'pre1kyu', label: '英検準1級パス単 (1900語)' },
          { value: 'ex_pre1kyu', label: 'EX準1級 (2434語)' },
          { value: 'sys5th', label: 'シス単5訂版 (2027語)' },
          { value: 'leap', label: 'LEAP (1935語)' },
          { value: 'target1900', label: 'ターゲット1900 (1900語)' },
          { value: 'target1400extra', label: '高校生368語' },
          { value: 'idiom1000', label: '熟語ターゲット1000 (1000語)' },
          { value: 'sunshine1', label: '開隆堂サンシャイン中学1年生 (1309語)' },
          { value: 'sunshine2', label: '開隆堂サンシャイン中学2年生 (1149語)' },
          { value: 'sunshine3', label: '開隆堂サンシャイン中学3年生 (1062語)' },
        ];

        const sourceMap = {
          '5kyu': '英検5級', '4kyu': '英検4級', '3kyu': '英検3級', '準2kyu': '英検準2級', '2kyu': '英検2級',
          'pre1kyu': '英検準1級パス単', 'ex_pre1kyu': 'EX準1級', 'sys5th': 'シス単5訂版',
          'leap': 'LEAP', 'target1900': 'ターゲット1900', 'target1400extra': 'ターゲット1400extra', 'idiom1000': '熟語ターゲット1000',
          'sunshine1': 'サンシャイン中1', 'sunshine2': 'サンシャイン中2', 'sunshine3': 'サンシャイン中3',
        };

        const runDaily = async () => {
          if (selectedStudents.size === 0) { alert('配信先の生徒を選択してください'); return; }
          if (schedule.length === 0) { alert('スケジュールが空です'); return; }
          if (!confirm(`${schedule.length}日間 × ${dailyPerDay}語/日 = 合計${totalWords}語 を ${selectedStudents.size}名に配信します。\nよろしいですか？`)) return;

          setDailyRunning(true);
          try {
            const res = await fetch(`/wordlist_${dailyGrade}.json`);
            if (!res.ok) throw new Error('リスト読み込み失敗');
            const rawData = await res.json();
            const isTextbookList = rawData.meta && rawData.words;
            let allWords = isTextbookList ? rawData.words : rawData;

            // 教科書の場合: セクション/ページ範囲でフィルタ
            if (isTextbookList) {
              if (textbookMode === 'section' && textbookSection) {
                allWords = allWords.filter(w => w.section === textbookSection);
              } else if (textbookMode === 'page' && (textbookPageFrom || textbookPageTo)) {
                const pFrom = parseInt(textbookPageFrom) || 0;
                const pTo = parseInt(textbookPageTo) || 999;
                allWords = allWords.filter(w => {
                  if (!w.page) return false;
                  const m = w.page.match(/p\.(\d+)(?:-(\d+))?/);
                  if (!m) return false;
                  const ps = parseInt(m[1]);
                  const pe = m[2] ? parseInt(m[2]) : ps;
                  return ps <= pTo && pFrom <= pe;
                });
              }
              // Re-assign rank based on filtered list
              allWords = allWords.map((w, i) => ({ ...w, rank: i + 1 }));
            }

            for (let i = 0; i < schedule.length; i++) {
              const s = schedule[i];
              setDailyProgress(`📤 ${s.label} (${i+1}/${schedule.length}) No.${s.from}-${s.to}`);
              const selected = allWords.filter(w => w.rank >= s.from && w.rank <= s.to);
              if (selected.length === 0) continue;

              const words = selected.map(w => ({
                english: w.word || w.english,
                meanings: Array.isArray(w.meanings) ? w.meanings.join('、') : (w.meanings || w.meaning || ''),
                example: w.example || '',
                exampleJa: w.exampleJa || w.translation || '',
                reassign: true,
                listType: dailyGrade,
                rank: w.rank,
                source: `${sourceMap[dailyGrade] || dailyGrade} No.${w.rank}`,
              }));

              await fetch('/api/words/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  words, studentIds: [...selectedStudents], assignedDate: s.date,
                }),
              });
            }
            setDailyProgress('');
            setShowDailyModal(false);
            alert(`✅ ${schedule.length}日分の配信が完了しました！`);
            if (onRegistered) onRegistered();
          } catch (err) {
            console.error(err);
            alert('配信中にエラーが発生しました: ' + err.message);
          } finally {
            setDailyRunning(false);
            setDailyProgress('');
          }
        };

        return (
          <div className="modal-overlay" onClick={() => !dailyRunning && setShowDailyModal(false)}>
            <div className="modal-card" style={{ maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>🔥 毎日特訓</h2>
                <button className="btn btn-ghost" onClick={() => !dailyRunning && setShowDailyModal(false)} style={{ fontSize: '1.2rem', padding: '0.25rem 0.5rem' }}>✕</button>
              </div>

              {/* 設定フォーム */}
              <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
                {/* 対象リスト */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>📚 対象リスト</label>
                  <select value={dailyGrade} onChange={e => setDailyGrade(e.target.value)} className="input-text" style={{ width: '100%' }}>
                    {listOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* 教科書の場合: 現在の抽出条件を表示 */}
                {isDailyTextbook && (
                  <div style={{
                    padding: '0.5rem 0.75rem', background: 'var(--secondary-light)',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                    fontSize: '0.8rem',
                  }}>
                    <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>📖 抽出条件: </span>
                    {textbookMode === 'section'
                      ? (textbookSection
                        ? `${textbookSections.find(s => s.key === textbookSection)?.label || textbookSection}`
                        : '全セクション')
                      : `p.${textbookPageFrom || '?'} ～ p.${textbookPageTo || '?'}`
                    }
                    {textbookMatchCount !== null && (
                      <span style={{ marginLeft: '0.5rem', fontWeight: 700, color: 'var(--primary)' }}>({textbookMatchCount}語)</span>
                    )}
                  </div>
                )}

                {/* 開始番号 & 1日あたり */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>🔢 開始番号</label>
                    <input type="number" min={1} value={dailyStart} onChange={e => setDailyStart(e.target.value === '' ? '' : parseInt(e.target.value) || '')} onBlur={() => setDailyStart(prev => { const n = parseInt(prev); return (!n || n < 1) ? 1 : n; })} className="input-text" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>📦 1日あたり</label>
                    <input type="number" min={1} max={100} value={dailyPerDay} onChange={e => setDailyPerDay(e.target.value === '' ? '' : parseInt(e.target.value) || '')} onBlur={() => setDailyPerDay(prev => { const n = parseInt(prev); return (!n || n < 1) ? 1 : Math.min(100, n); })} className="input-text" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* 期間 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>📅 開始日</label>
                    <input type="date" value={dailyStartDate} onChange={e => setDailyStartDate(e.target.value)} className="input-text" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>📅 終了日</label>
                    <input type="date" value={dailyEndDate} onChange={e => setDailyEndDate(e.target.value)} className="input-text" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* 土日スキップ */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={dailySkipWeekend} onChange={e => setDailySkipWeekend(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                  <span style={{ fontWeight: 600 }}>⏭️ 土日をスキップ（平日のみ配信）</span>
                </label>
              </div>

              {/* サマリー */}
              <div style={{
                display: 'flex', justifyContent: 'space-around', padding: '0.6rem',
                background: 'var(--primary-light)', borderRadius: 'var(--radius-md)',
                marginBottom: '0.75rem', textAlign: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>{schedule.length}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>日数</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>{dailyPerDay}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>語/日</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--secondary)' }}>{totalWords}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>合計</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>{selectedStudents.size}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>名</div>
                </div>
              </div>

              {/* スケジュールプレビュー */}
              {schedule.length > 0 && (
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                  <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-page)', position: 'sticky', top: 0 }}>
                        <th style={{ padding: '0.4rem', textAlign: 'left', fontWeight: 700 }}>日付</th>
                        <th style={{ padding: '0.4rem', textAlign: 'left', fontWeight: 700 }}>曜日</th>
                        <th style={{ padding: '0.4rem', textAlign: 'left', fontWeight: 700 }}>範囲</th>
                        <th style={{ padding: '0.4rem', textAlign: 'right', fontWeight: 700 }}>語数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((s, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.35rem 0.4rem' }}>{s.label}</td>
                          <td style={{ padding: '0.35rem 0.4rem', color: s.dow === '土' ? '#3b82f6' : s.dow === '日' ? 'var(--danger)' : 'inherit' }}>{s.dow}</td>
                          <td style={{ padding: '0.35rem 0.4rem' }}>No.{s.from}–{s.to}</td>
                          <td style={{ padding: '0.35rem 0.4rem', textAlign: 'right' }}>{s.to - s.from + 1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 進捗 */}
              {dailyProgress && (
                <div style={{ padding: '0.5rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem', textAlign: 'center' }}>
                  {dailyProgress}
                </div>
              )}

              {/* 実行ボタン */}
              <button
                className="btn btn-primary"
                disabled={dailyRunning || schedule.length === 0 || selectedStudents.size === 0}
                onClick={runDaily}
                style={{ width: '100%', padding: '0.75rem', fontWeight: 700, fontSize: '0.95rem' }}
              >
                {dailyRunning ? '🔄 配信中...' : `📤 ${schedule.length}日分を${selectedStudents.size}名に配信する`}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
