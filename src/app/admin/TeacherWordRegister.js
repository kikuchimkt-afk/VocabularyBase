'use client';

import { useState, useEffect } from 'react';

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
            setSaveProgress(`⚠️ ${student.name}: "${word.trim()}" は既に登録済み（スキップ）`);
            await new Promise(r => setTimeout(r, 500));
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

      setHistory(prev => [{
        word: word.trim(),
        meanings: [...selectedMeanings],
        count: successCount,
        date: assignedDate,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      }, ...prev]);

      setMessage(`✅ ${successCount}名の生徒に「${word.trim()}」を配信しました！`);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <span style={{ fontWeight: '600' }}>📅 配信日（宿題日）</span>
          <input
            type="date"
            className="input-text"
            value={assignedDate}
            onChange={(e) => setAssignedDate(e.target.value)}
            style={{ width: 'auto', flex: 'unset' }}
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {students.map(s => (
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

      {/* 単語検索 */}
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
    </div>
  );
}
