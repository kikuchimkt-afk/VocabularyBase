'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import SelfTraining from './SelfTraining';

export default function WordList({ studentId, studentName }) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'teacher' | 'self' | 'hw:YYYY-MM-DD'

  // 一括音声生成
  const [bulkAudioGenerating, setBulkAudioGenerating] = useState(false);
  const [bulkAudioProgress, setBulkAudioProgress] = useState('');
  const [bulkAudioCancelRef] = useState({ current: false });

  // ブックマーク＆一括削除
  const [bookmarkTogglingId, setBookmarkTogglingId] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // 日付指定一括整理
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupSelectedDates, setCleanupSelectedDates] = useState(new Set());
  const [cleanupRunning, setCleanupRunning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);
  const [showTraining, setShowTraining] = useState(false);

  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    if (!studentId) return;
    fetchWords();
  }, [studentId]);

  const fetchWords = async () => {
    try {
      const { data, error } = await supabase
        .from('vb_words')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWords(data || []);
    } catch (err) {
      console.error('Error fetching words:', err);
    } finally {
      setLoading(false);
    }
  };

  // ブックマークトグル（DB永続化）
  const toggleBookmark = async (wordId) => {
    const word = words.find(w => w.id === wordId);
    if (!word) return;
    const newState = !word.is_bookmarked;
    setBookmarkTogglingId(wordId);
    try {
      const { error } = await supabase
        .from('vb_words')
        .update({ is_bookmarked: newState })
        .eq('id', wordId);
      if (error) throw error;
      setWords(prev => prev.map(w =>
        w.id === wordId ? { ...w, is_bookmarked: newState } : w
      ));
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    } finally {
      setBookmarkTogglingId(null);
    }
  };

  const playAudio = useCallback((url, id) => {
    if (!url) return;

    setPlayingId(id);
    const audio = new Audio(url);
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => setPlayingId(null);
    audio.play().catch(() => setPlayingId(null));
  }, []);

  // 音声が未生成の単語に対して音声を再生成する
  const regenerateAudio = async (word) => {
    setGeneratingId(word.id);
    try {
      let wordAudioUrl = word.word_audio_url;
      let sentenceAudioUrl = word.sentence_audio_url;

      // 単語音声が未生成の場合
      if (!wordAudioUrl) {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: word.english }),
        });
        if (res.ok) {
          const data = await res.json();
          wordAudioUrl = data.url;
        }
      }

      // 例文音声が未生成の場合
      if (!sentenceAudioUrl && word.example_sentence) {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: word.example_sentence }),
        });
        if (res.ok) {
          const data = await res.json();
          sentenceAudioUrl = data.url;
        }
      }

      // DB更新
      const { error } = await supabase
        .from('vb_words')
        .update({
          word_audio_url: wordAudioUrl,
          sentence_audio_url: sentenceAudioUrl,
        })
        .eq('id', word.id);

      if (error) throw error;

      // ローカルステート更新
      setWords(prev => prev.map(w =>
        w.id === word.id
          ? { ...w, word_audio_url: wordAudioUrl, sentence_audio_url: sentenceAudioUrl }
          : w
      ));
    } catch (err) {
      console.error('Audio regeneration error:', err);
      alert('音声の生成に失敗しました');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDelete = async (wordId) => {
    if (!confirm('この単語を削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('vb_words')
        .delete()
        .eq('id', wordId);

      if (error) throw error;
      setWords(words.filter(w => w.id !== wordId));
    } catch (err) {
      console.error('Error deleting word:', err);
    }
  };

  // ⭐以外を一括削除（is_bookmarkedベース）
  const bulkDeleteNonFavorites = async () => {
    const targets = filteredWords.filter(w => !w.is_bookmarked);
    const kept = filteredWords.filter(w => w.is_bookmarked);
    if (targets.length === 0) { alert('削除対象がありません'); return; }
    if (!confirm(`⭐以外の ${targets.length}語 を削除し、⭐付き ${kept.length}語 を「自分」に移動します。よろしいですか？`)) return;

    setBulkDeleting(true);
    try {
      // 非ブックマークを削除
      const deleteIds = targets.map(w => w.id);
      for (let i = 0; i < deleteIds.length; i += 50) {
        const batch = deleteIds.slice(i, i + 50);
        await supabase.from('vb_words').delete().in('id', batch);
      }
      // ブックマーク済みを「自分」に変更
      const keepIds = kept.map(w => w.id);
      for (let i = 0; i < keepIds.length; i += 50) {
        const batch = keepIds.slice(i, i + 50);
        await supabase.from('vb_words').update({ assigned_by: 'student' }).in('id', batch);
      }
      await fetchWords();
      setSourceFilter('self');
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('一括削除中にエラーが発生しました');
    } finally {
      setBulkDeleting(false);
    }
  };

  // 日付指定一括整理の集計情報
  const cleanupDateStats = useMemo(() => {
    const map = new Map();
    words.forEach(w => {
      if (w.assigned_by === 'teacher' && w.assigned_date) {
        const key = w.assigned_date;
        if (!map.has(key)) map.set(key, { date: key, total: 0, bookmarked: 0, teachers: new Set() });
        const entry = map.get(key);
        entry.total++;
        if (w.is_bookmarked) entry.bookmarked++;
        if (w.teacher_name) entry.teachers.add(w.teacher_name);
      }
    });
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [words]);

  // 日付指定一括整理の実行
  const executeCleanup = async () => {
    if (cleanupSelectedDates.size === 0) return;

    // 対象の単語を収集
    const targetWords = words.filter(w =>
      w.assigned_by === 'teacher' &&
      w.assigned_date &&
      cleanupSelectedDates.has(w.assigned_date)
    );
    const toDelete = targetWords.filter(w => !w.is_bookmarked);
    const toKeep = targetWords.filter(w => w.is_bookmarked);

    if (toDelete.length === 0 && toKeep.length === 0) {
      alert('対象の単語がありません');
      return;
    }

    setCleanupRunning(true);
    try {
      // 非ブックマークを削除
      if (toDelete.length > 0) {
        const deleteIds = toDelete.map(w => w.id);
        for (let i = 0; i < deleteIds.length; i += 50) {
          const batch = deleteIds.slice(i, i + 50);
          await supabase.from('vb_words').delete().in('id', batch);
        }
      }
      // ブックマーク済みを「自分」に変更（HWから解放）
      if (toKeep.length > 0) {
        const keepIds = toKeep.map(w => w.id);
        for (let i = 0; i < keepIds.length; i += 50) {
          const batch = keepIds.slice(i, i + 50);
          await supabase.from('vb_words').update({ assigned_by: 'student' }).in('id', batch);
        }
      }

      setCleanupResult({ deleted: toDelete.length, kept: toKeep.length });
      await fetchWords();
    } catch (err) {
      console.error('Cleanup error:', err);
      alert('整理中にエラーが発生しました');
    } finally {
      setCleanupRunning(false);
    }
  };

  // 一括音声生成
  const bulkGenerateAudio = async () => {
    const needAudio = filteredWords.filter(w =>
      !w.word_audio_url || (!w.sentence_audio_url && w.example_sentence)
    );
    if (needAudio.length === 0) return;

    setBulkAudioGenerating(true);
    bulkAudioCancelRef.current = false;
    let done = 0;
    let failed = 0;
    const updatedWords = [...words];

    for (const word of needAudio) {
      if (bulkAudioCancelRef.current) break;

      setBulkAudioProgress(`🔊 音声生成中... (${done + 1}/${needAudio.length}) — ${word.english}`);

      try {
        let wordAudioUrl = word.word_audio_url;
        let sentenceAudioUrl = word.sentence_audio_url;

        if (!wordAudioUrl) {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: word.english }),
          });
          if (res.ok) {
            const data = await res.json();
            wordAudioUrl = data.url;
          }
        }

        if (!sentenceAudioUrl && word.example_sentence) {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: word.example_sentence }),
          });
          if (res.ok) {
            const data = await res.json();
            sentenceAudioUrl = data.url;
          }
        }

        // DB更新
        await supabase
          .from('vb_words')
          .update({
            word_audio_url: wordAudioUrl,
            sentence_audio_url: sentenceAudioUrl,
          })
          .eq('id', word.id);

        // ローカルステート更新
        const idx = updatedWords.findIndex(w => w.id === word.id);
        if (idx !== -1) {
          updatedWords[idx] = { ...updatedWords[idx], word_audio_url: wordAudioUrl, sentence_audio_url: sentenceAudioUrl };
        }
        done++;
      } catch (err) {
        console.error(`Audio generation failed for ${word.english}:`, err);
        failed++;
      }

      // レート制限回避のため少し待機
      if (!bulkAudioCancelRef.current) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    setWords(updatedWords);
    setBulkAudioGenerating(false);

    if (bulkAudioCancelRef.current) {
      setBulkAudioProgress(`⏹️ 中断しました (${done}語完了, ${failed}語失敗)`);
    } else {
      setBulkAudioProgress(`✅ 一括音声生成完了！ (${done}語成功${failed > 0 ? `, ${failed}語失敗` : ''})`);
    }
    setTimeout(() => setBulkAudioProgress(''), 8000);
  };

  // HWの日付+講師名一覧を取得
  const hwDateTeachers = useMemo(() => {
    const map = new Map();
    words.forEach(w => {
      if (w.assigned_by === 'teacher' && w.assigned_date) {
        const tn = w.teacher_name || '';
        const key = `${w.assigned_date}::${tn}`;
        if (!map.has(key)) map.set(key, { date: w.assigned_date, teacher: tn, count: 0 });
        map.get(key).count++;
      }
    });
    return [...map.values()].sort((a, b) => {
      const dc = a.date.localeCompare(b.date);
      if (dc !== 0) return dc;
      return a.teacher.localeCompare(b.teacher);
    });
  }, [words]);

  const teacherColors = useMemo(() => {
    const colors = ['#e65100', '#6366f1', '#0891b2', '#059669', '#d946ef', '#ea580c', '#2563eb', '#dc2626'];
    const names = [...new Set(words.filter(w => w.teacher_name).map(w => w.teacher_name))];
    const map = {};
    names.forEach((n, i) => { map[n] = colors[i % colors.length]; });
    return map;
  }, [words]);

  const selfCount = useMemo(() => words.filter(w => w.assigned_by !== 'teacher').length, [words]);
  const hwCount = useMemo(() => words.filter(w => w.assigned_by === 'teacher').length, [words]);
  const bookmarkedCount = useMemo(() => words.filter(w => w.is_bookmarked).length, [words]);

  const getHwSourceSummary = useCallback((date, teacher) => {
    const hwWords = words.filter(w => w.assigned_by === 'teacher' && w.assigned_date === date && (teacher === undefined || (w.teacher_name || '') === teacher) && w.source);
    if (hwWords.length === 0) return null;

    const groups = {};
    hwWords.forEach(w => {
      const match = w.source.match(/^(.*?) No\.(\d+)$/);
      if (match) {
        const name = match[1].trim();
        const num = parseInt(match[2], 10);
        if (!groups[name]) groups[name] = [];
        groups[name].push(num);
      } else {
        // 教科書セクション名形式（「サンシャイン中1 Program 3」等）もそのまま収集
        if (!groups[w.source]) groups[w.source] = [];
      }
    });

    const summaries = [];
    // 同じセクション名のものを重複排除してまとめる
    const sectionNames = new Set();
    for (const [name, nums] of Object.entries(groups)) {
      if (nums.length > 0) {
        nums.sort((a,b)=>a-b);
        const min = nums[0];
        const max = nums[nums.length - 1];
        if (min === max) summaries.push(`${name} No.${min}`);
        else summaries.push(`${name} No.${min}〜${max}`);
      } else {
        if (!sectionNames.has(name)) {
          sectionNames.add(name);
          summaries.push(name);
        }
      }
    }
    return summaries.join(', ');
  }, [words]);

  const filteredWords = useMemo(() => words.filter(w => {
    if (sourceFilter === 'bookmarked') {
      if (!w.is_bookmarked) return false;
    } else if (sourceFilter === 'teacher') {
      if (w.assigned_by !== 'teacher') return false;
    } else if (sourceFilter === 'self') {
      if (w.assigned_by === 'teacher') return false;
    } else if (sourceFilter.startsWith('hw:')) {
      const parts = sourceFilter.replace('hw:', '').split('::');
      const date = parts[0];
      const teacher = parts.length > 1 ? parts[1] : null;
      if (w.assigned_by !== 'teacher' || w.assigned_date !== date) return false;
      if (teacher !== null && (w.teacher_name || '') !== teacher) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const english = (w.english || '').toLowerCase();
    const meanings = (w.meanings || []).join(' ').toLowerCase();
    const example = (w.example_sentence || '').toLowerCase();
    const exampleJa = (w.example_sentence_ja || '').toLowerCase();
    return english.includes(q) || meanings.includes(q) || example.includes(q) || exampleJa.includes(q);
  }), [words, sourceFilter, searchQuery]);

  if (loading) {
    return <div className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>読み込み中...</div>;
  }

  if (words.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</p>
        <p className="text-muted">まだ単語が登録されていません。<br/>「登録」タブから新しい単語を追加しましょう。</p>
      </div>
    );
  }

  return (
    <div>
      {/* 検索バー */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <input
          className="input-text"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 英語・日本語で検索..."
          style={{ paddingRight: '4rem' }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: '0.8rem', color: 'var(--text-muted)',
            }}
          >
            ✕ クリア
          </button>
        )}
      </div>

      {/* ソースフィルタータブ */}
      {words.length > 0 && (
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <button
            onClick={() => setSourceFilter('all')}
            style={{
              padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
              border: sourceFilter === 'all' ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: sourceFilter === 'all' ? 'var(--primary)' : 'var(--bg-card)',
              color: sourceFilter === 'all' ? 'white' : 'var(--text-muted)', cursor: 'pointer',
            }}
          >すべて ({words.length})</button>
          {hwCount > 0 && (
            <button
              onClick={() => setSourceFilter('teacher')}
              style={{
                padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                border: sourceFilter === 'teacher' ? '2px solid #e65100' : '1px solid var(--border)',
                background: sourceFilter === 'teacher' ? '#e65100' : 'var(--bg-card)',
                color: sourceFilter === 'teacher' ? 'white' : 'var(--text-muted)', cursor: 'pointer',
              }}
            >📋 HW ({hwCount})</button>
          )}
          {selfCount > 0 && (
            <button
              onClick={() => setSourceFilter('self')}
              style={{
                padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                border: sourceFilter === 'self' ? '2px solid var(--secondary)' : '1px solid var(--border)',
                background: sourceFilter === 'self' ? 'var(--secondary)' : 'var(--bg-card)',
                color: sourceFilter === 'self' ? 'white' : 'var(--text-muted)', cursor: 'pointer',
              }}
            >👤 自分 ({selfCount})</button>
          )}
          {bookmarkedCount > 0 && (
            <button
              onClick={() => setSourceFilter('bookmarked')}
              style={{
                padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                border: sourceFilter === 'bookmarked' ? '2px solid #f59e0b' : '1px solid var(--border)',
                background: sourceFilter === 'bookmarked' ? '#f59e0b' : 'var(--bg-card)',
                color: sourceFilter === 'bookmarked' ? 'white' : 'var(--text-muted)', cursor: 'pointer',
              }}
            >⭐ お気に入り ({bookmarkedCount})</button>
          )}
          {hwDateTeachers.map(({ date, teacher, count }) => {
            const filterKey = `hw:${date}::${teacher}`;
            const label = date.slice(5).replace('-', '/');
            const color = teacher ? (teacherColors[teacher] || '#e65100') : '#e65100';
            return (
              <button
                key={filterKey}
                onClick={() => setSourceFilter(filterKey)}
                style={{
                  padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
                  border: sourceFilter === filterKey ? `2px solid ${color}` : '1px solid var(--border)',
                  background: sourceFilter === filterKey ? `${color}15` : 'var(--bg-card)',
                  color: sourceFilter === filterKey ? color : 'var(--text-muted)', cursor: 'pointer',
                }}
              >{`\u{1F4C5}`} {label}{teacher ? ` ${teacher}` : ''} ({count})</button>
            );
          })}
        </div>
      )}

      {(searchQuery || sourceFilter !== 'all') && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
            {filteredWords.length}件表示中
          </p>
          {sourceFilter.startsWith('hw:') && (() => {
            const parts = sourceFilter.replace('hw:', '').split('::');
            const date = parts[0];
            const teacher = parts.length > 1 ? parts[1] : null;
            const sum = getHwSourceSummary(date, teacher !== null ? teacher : undefined);
            const color = teacher ? (teacherColors[teacher] || '#e65100') : '#e65100';
            return sum ? (
              <div style={{
                background: `${color}15`, color: color, padding: '0.2rem 0.6rem',
                borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                border: `1px solid ${color}30`, display: 'inline-flex', alignItems: 'center', gap: 4
              }}>
                {`\u{1F3F7}\u{FE0F}`} {teacher ? `${teacher}：` : '出典: '}{sum}
              </div>
            ) : null;
          })()}
        </div>
      )}
      {/* ⭐以外を一括削除ボタン（日付フィルター選択時） */}
      {sourceFilter.startsWith('hw:') && filteredWords.some(w => w.is_bookmarked) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '0.5rem', gap: '0.5rem', flexWrap: 'wrap',
          padding: '0.5rem 0.75rem', background: 'var(--danger-light)',
          borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600 }}>
            ⭐ {filteredWords.filter(w => w.is_bookmarked).length}語をキープ / {filteredWords.filter(w => !w.is_bookmarked).length}語を削除
          </span>
          <button
            className="btn"
            disabled={bulkDeleting || filteredWords.every(w => w.is_bookmarked)}
            onClick={bulkDeleteNonFavorites}
            style={{
              fontSize: '0.7rem', padding: '0.3rem 0.6rem',
              backgroundColor: 'var(--danger)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-md)',
              fontWeight: 700, cursor: 'pointer', opacity: (bulkDeleting || filteredWords.every(w => w.is_bookmarked)) ? 0.5 : 1,
            }}
          >
            {bulkDeleting ? '処理中...' : '🗑️ ⭐以外を一括削除'}
          </button>
        </div>
      )}
      {/* ダウンロードボタン */}
      {words.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* 自主トレーニングボタン */}
          {filteredWords.length > 0 && (
            <button
              className="btn"
              onClick={() => setShowTraining(true)}
              style={{
                fontSize: '0.75rem', padding: '0.35rem 0.7rem',
                backgroundColor: '#fef3c7', color: '#b45309',
                border: '1px solid #f59e0b', borderRadius: 'var(--radius-md)',
                fontWeight: 600,
              }}
            >🏋️ トレーニング</button>
          )}
          {/* 一括音声生成ボタン */}
          {(() => {
            const needAudioCount = filteredWords.filter(w =>
              !w.word_audio_url || (!w.sentence_audio_url && w.example_sentence)
            ).length;
            if (needAudioCount > 0 || bulkAudioGenerating) return (
              bulkAudioGenerating ? (
                <button
                  className="btn"
                  onClick={() => { bulkAudioCancelRef.current = true; }}
                  style={{
                    fontSize: '0.75rem', padding: '0.35rem 0.7rem',
                    backgroundColor: 'var(--danger-light)', color: 'var(--danger)',
                    border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)',
                  }}
                >⏹ 中断</button>
              ) : (
                <button
                  className="btn"
                  onClick={bulkGenerateAudio}
                  style={{
                    fontSize: '0.75rem', padding: '0.35rem 0.7rem',
                    backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                    border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                  }}
                >🔊 一括音声生成 ({needAudioCount}語)</button>
              )
            );
            return null;
          })()}
          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }} onClick={() => {
            const rows = (searchQuery ? filteredWords : words).map(w => ({
              英単語: w.english,
              意味: (w.meanings || []).join('、'),
              例文: w.example_sentence || '',
              例文訳: w.example_sentence_ja || '',
            }));
            const header = '英単語,意味,例文,例文訳';
            const csv = '\uFEFF' + header + '\n' + rows.map(r =>
              [r.英単語, r.意味, r.例文, r.例文訳].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
            ).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${studentName || '単語帳'}.csv`; a.click();
            URL.revokeObjectURL(url);
          }}>📥 CSV</button>
          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }} onClick={() => {
            const rows = (searchQuery ? filteredWords : words).map(w => ({
              英単語: w.english,
              意味: (w.meanings || []).join('、'),
              例文: w.example_sentence || '',
              例文訳: w.example_sentence_ja || '',
            }));
            const ws = XLSX.utils.json_to_sheet(rows);
            ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 40 }, { wch: 40 }];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, '単語帳');
            XLSX.writeFile(wb, `${studentName || '単語帳'}.xlsx`);
          }}>📥 Excel</button>
          {/* 日付指定一括整理ボタン */}
          {hwCount > 0 && (
            <button
              className="btn"
              onClick={() => {
                setCleanupSelectedDates(new Set());
                setCleanupResult(null);
                setShowCleanupModal(true);
              }}
              style={{
                fontSize: '0.75rem', padding: '0.35rem 0.7rem',
                backgroundColor: 'var(--danger-light)', color: 'var(--danger)',
                border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)',
                fontWeight: 600,
              }}
            >🗑️ 日付で整理</button>
          )}
        </div>
      )}
      {/* 一括音声生成の進捗表示 */}
      {bulkAudioProgress && (
        <div style={{
          marginBottom: '1rem', padding: '0.6rem 0.75rem',
          backgroundColor: bulkAudioProgress.includes('✅') ? 'var(--secondary-light)' : bulkAudioProgress.includes('⏹') ? 'var(--danger-light)' : 'var(--primary-light)',
          borderRadius: 'var(--radius-md)',
          color: bulkAudioProgress.includes('✅') ? 'var(--secondary)' : bulkAudioProgress.includes('⏹') ? 'var(--danger)' : 'var(--primary)',
          fontSize: '0.85rem', fontWeight: '600',
        }}>
          {bulkAudioProgress}
        </div>
      )}
      {filteredWords.map((word) => {
        const needsAudio = !word.word_audio_url || (!word.sentence_audio_url && word.example_sentence);
        const isGenerating = generatingId === word.id;

        return (
          <div key={word.id} className="card" style={{ marginBottom: '1rem' }}>
            {/* Word header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{word.english}</h3>
                {word.assigned_by === 'teacher' ? (
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700,
                    color: '#e65100', background: '#fff3e0',
                    padding: '2px 7px', borderRadius: 10,
                    border: '1px solid #ffcc80', whiteSpace: 'nowrap',
                  }}>📋 HW</span>
                ) : (
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700,
                    color: 'var(--secondary)', background: 'var(--secondary-light)',
                    padding: '2px 7px', borderRadius: 10,
                    border: '1px solid var(--secondary)', whiteSpace: 'nowrap',
                  }}>👤 自分</span>
                )}
                {(word.assign_count || 1) >= 2 && (
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700,
                    color: '#e65100', background: '#fff3e0',
                    padding: '2px 8px', borderRadius: 10,
                    border: '1px solid #ffcc80',
                    whiteSpace: 'nowrap',
                  }}>
                    🔥 出題{word.assign_count}回目
                  </span>
                )}
                {word.word_audio_url && (
                  <button
                    onClick={() => playAudio(word.word_audio_url, `word-${word.id}`)}
                    style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '999px',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      backgroundColor: playingId === `word-${word.id}` ? 'var(--primary)' : 'var(--bg-page)',
                      color: playingId === `word-${word.id}` ? 'white' : 'var(--text-main)',
                      border: '1px solid var(--border)',
                      transition: 'all 0.2s',
                    }}
                    title="発音を再生"
                  >
                    🔊
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {/* ⭐ ブックマークトグル（常時表示） */}
                <button
                  onClick={() => toggleBookmark(word.id)}
                  disabled={bookmarkTogglingId === word.id}
                  style={{
                    padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)',
                    fontSize: '1.2rem', cursor: bookmarkTogglingId === word.id ? 'wait' : 'pointer',
                    border: word.is_bookmarked ? '2px solid #f59e0b' : '1px solid var(--border)',
                    background: word.is_bookmarked ? '#fef3c7' : 'var(--bg-page)',
                    color: word.is_bookmarked ? '#f59e0b' : 'var(--text-muted)',
                    transition: 'all 0.2s', lineHeight: 1,
                    opacity: bookmarkTogglingId === word.id ? 0.5 : 1,
                  }}
                  title={word.is_bookmarked ? 'お気に入り解除' : 'お気に入りに追加'}
                >
                  {word.is_bookmarked ? '★' : '☆'}
                </button>
                {needsAudio && (
                  <button
                    onClick={() => regenerateAudio(word)}
                    disabled={isGenerating}
                    className="btn"
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    {isGenerating ? '生成中...' : '🔄 音声生成'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(word.id)}
                  className="text-muted"
                  style={{ fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  削除
                </button>
              </div>
            </div>

            {/* Meanings */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {word.meanings?.map((meaning, i) => (
                <span key={i} className="badge badge-green">{meaning}</span>
              ))}
            </div>

            {/* Example sentence */}
            {word.example_sentence && (
              <div style={{ backgroundColor: 'var(--bg-page)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontWeight: '500', marginBottom: '0.25rem', flex: 1 }}>{word.example_sentence}</p>
                  {word.sentence_audio_url && (
                    <button
                      onClick={() => playAudio(word.sentence_audio_url, `sent-${word.id}`)}
                      style={{
                        padding: '0.2rem 0.4rem',
                        borderRadius: '999px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        backgroundColor: playingId === `sent-${word.id}` ? 'var(--primary)' : 'transparent',
                        color: playingId === `sent-${word.id}` ? 'white' : 'var(--text-main)',
                        border: '1px solid var(--border)',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                        marginLeft: '0.5rem',
                      }}
                      title="例文を再生"
                    >
                      🔊
                    </button>
                  )}
                </div>
                <p className="text-muted">{word.example_sentence_ja}</p>
              </div>
            )}

            {/* Source */}
            {word.source && (
              <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                📍 出典: {word.source}
              </div>
            )}
          </div>
        );
      })}
      {filteredWords.length === 0 && searchQuery && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="text-muted">「{searchQuery}」に一致する単語が見つかりません</p>
        </div>
      )}

      {/* === 日付指定一括整理モーダル === */}
      {showCleanupModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '1rem',
          }}
          onClick={() => !cleanupRunning && setShowCleanupModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
              padding: '1.5rem', maxWidth: 480, width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)', maxHeight: '85vh', overflow: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* 完了画面 */}
            {cleanupResult ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✨</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>整理が完了しました</h3>
                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)' }}>{cleanupResult.deleted}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>削除</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>{cleanupResult.kept}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>⭐ 保存</div>
                  </div>
                </div>
                {cleanupResult.kept > 0 && (
                  <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
                    ⭐付きの{cleanupResult.kept}語は「👤 自分」に移動しました
                  </p>
                )}
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowCleanupModal(false);
                    setSourceFilter('all');
                  }}
                  style={{ padding: '0.6rem 2rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}
                >閉じる</button>
              </div>
            ) : (
              /* 選択画面 */
              <>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🗑️ 日付指定で一括整理
                </h3>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
                  削除する日付を選択してください。<strong style={{ color: '#f59e0b' }}>⭐お気に入りの単語は必ず保護</strong>されます。
                </p>

                {cleanupDateStats.length === 0 ? (
                  <p className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>HW配信の単語がありません</p>
                ) : (
                  <>
                    {/* 全選択 / 全解除 */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                      <button
                        className="text-muted"
                        style={{ fontSize: '0.75rem', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}
                        onClick={() => {
                          if (cleanupSelectedDates.size === cleanupDateStats.length) {
                            setCleanupSelectedDates(new Set());
                          } else {
                            setCleanupSelectedDates(new Set(cleanupDateStats.map(d => d.date)));
                          }
                        }}
                      >
                        {cleanupSelectedDates.size === cleanupDateStats.length ? '☐ 全解除' : '☑ 全選択'}
                      </button>
                    </div>

                    {/* 日付一覧 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                      {cleanupDateStats.map(({ date, total, bookmarked, teachers }) => {
                        const toDelete = total - bookmarked;
                        const isSelected = cleanupSelectedDates.has(date);
                        const dateLabel = (() => {
                          const d = new Date(date + 'T00:00:00');
                          return `${d.getMonth() + 1}/${d.getDate()}`;
                        })();
                        const teacherList = [...teachers].join(', ');

                        return (
                          <label
                            key={date}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.6rem',
                              padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)',
                              border: `1.5px solid ${isSelected ? 'var(--danger)' : 'var(--border)'}`,
                              background: isSelected ? 'var(--danger-light)' : 'transparent',
                              cursor: 'pointer', transition: 'all 0.15s',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const next = new Set(cleanupSelectedDates);
                                if (next.has(date)) next.delete(date); else next.add(date);
                                setCleanupSelectedDates(next);
                              }}
                              style={{ width: 18, height: 18, accentColor: 'var(--danger)', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>📅 {dateLabel}</span>
                                {teacherList && (
                                  <span className="text-muted" style={{ fontSize: '0.7rem' }}>{teacherList}</span>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                                <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                                  全{total}語
                                </span>
                                {bookmarked > 0 && (
                                  <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 600 }}>
                                    ⭐{bookmarked}語 保護
                                  </span>
                                )}
                                <span style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 600 }}>
                                  🗑️{toDelete}語 削除
                                </span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* サマリー＆実行ボタン */}
                    {cleanupSelectedDates.size > 0 && (() => {
                      const selectedStats = cleanupDateStats.filter(d => cleanupSelectedDates.has(d.date));
                      const totalAll = selectedStats.reduce((sum, d) => sum + d.total, 0);
                      const totalBookmarked = selectedStats.reduce((sum, d) => sum + d.bookmarked, 0);
                      const totalDelete = totalAll - totalBookmarked;
                      return (
                        <div style={{
                          padding: '0.75rem', borderRadius: 'var(--radius-md)',
                          border: '2px solid var(--danger)', background: 'var(--danger-light)',
                          marginBottom: '0.75rem',
                        }}>
                          <div style={{
                            display: 'flex', justifyContent: 'center', gap: '1.5rem',
                            marginBottom: '0.5rem',
                          }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>{totalDelete}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 600 }}>削除</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{totalBookmarked}</div>
                              <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>⭐ 保護</div>
                            </div>
                          </div>
                          {totalBookmarked > 0 && (
                            <p className="text-muted" style={{ fontSize: '0.72rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                              ⭐付き{totalBookmarked}語は「👤 自分」に自動移動
                            </p>
                          )}
                          <button
                            className="btn"
                            disabled={cleanupRunning || totalDelete === 0}
                            onClick={() => {
                              if (!confirm(`${cleanupSelectedDates.size}日分の ${totalDelete}語 を削除します。⭐付き${totalBookmarked}語は保護されます。実行しますか？`)) return;
                              executeCleanup();
                            }}
                            style={{
                              width: '100%', padding: '0.7rem',
                              fontSize: '0.95rem', fontWeight: 700,
                              backgroundColor: totalDelete === 0 ? 'var(--text-muted)' : 'var(--danger)',
                              color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
                              cursor: cleanupRunning || totalDelete === 0 ? 'not-allowed' : 'pointer',
                              opacity: cleanupRunning || totalDelete === 0 ? 0.5 : 1,
                              fontFamily: 'inherit',
                            }}
                          >
                            {cleanupRunning ? '処理中...' : totalDelete === 0 ? 'すべてお気に入り済み' : `🗑️ ${totalDelete}語を削除する`}
                          </button>
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* キャンセル */}
                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <button
                    className="text-muted"
                    onClick={() => setShowCleanupModal(false)}
                    disabled={cleanupRunning}
                    style={{ fontSize: '0.85rem', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}
                  >キャンセル</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* 自主トレーニングオーバーレイ */}
      {showTraining && (
        <SelfTraining
          words={words}
          onClose={() => setShowTraining(false)}
        />
      )}
    </div>
  );
}
