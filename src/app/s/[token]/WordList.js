'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import * as XLSX from 'xlsx';

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

  // お気に入り＆一括削除
  const [favorites, setFavorites] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

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

  // お気に入り以外を一括削除
  const bulkDeleteNonFavorites = async () => {
    const date = sourceFilter.replace('hw:', '');
    const targets = filteredWords.filter(w => !favorites.has(w.id));
    const kept = filteredWords.filter(w => favorites.has(w.id));
    if (targets.length === 0) { alert('削除対象がありません'); return; }
    if (!confirm(`★以外の ${targets.length}語 を削除し、★付き ${kept.length}語 を「自分」に移動します。よろしいですか？`)) return;

    setBulkDeleting(true);
    try {
      // 非お気に入りを削除
      const deleteIds = targets.map(w => w.id);
      for (let i = 0; i < deleteIds.length; i += 50) {
        const batch = deleteIds.slice(i, i + 50);
        await supabase.from('vb_words').delete().in('id', batch);
      }
      // お気に入りを「自分」に変更
      const keepIds = kept.map(w => w.id);
      for (let i = 0; i < keepIds.length; i += 50) {
        const batch = keepIds.slice(i, i + 50);
        await supabase.from('vb_words').update({ assigned_by: 'student' }).in('id', batch);
      }
      setFavorites(new Set());
      await fetchWords();
      setSourceFilter('self');
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('一括削除中にエラーが発生しました');
    } finally {
      setBulkDeleting(false);
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
        if (!groups[w.source]) groups[w.source] = [];
      }
    });

    const summaries = [];
    for (const [name, nums] of Object.entries(groups)) {
      if (nums.length > 0) {
        nums.sort((a,b)=>a-b);
        const min = nums[0];
        const max = nums[nums.length - 1];
        if (min === max) summaries.push(`${name} No.${min}`);
        else summaries.push(`${name} No.${min}〜${max}`);
      } else {
        summaries.push(name);
      }
    }
    return summaries.join(', ');
  }, [words]);

  const filteredWords = useMemo(() => words.filter(w => {
    if (sourceFilter === 'teacher') {
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
      {/* お気に入り一括削除ボタン（日付フィルター選択時） */}
      {sourceFilter.startsWith('hw:') && favorites.size > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '0.5rem', gap: '0.5rem', flexWrap: 'wrap',
          padding: '0.5rem 0.75rem', background: 'var(--danger-light)',
          borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600 }}>
            ★ {favorites.size}語をキープ / {filteredWords.length - favorites.size}語を削除
          </span>
          <button
            className="btn"
            disabled={bulkDeleting || favorites.size === filteredWords.length}
            onClick={bulkDeleteNonFavorites}
            style={{
              fontSize: '0.7rem', padding: '0.3rem 0.6rem',
              backgroundColor: 'var(--danger)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-md)',
              fontWeight: 700, cursor: 'pointer', opacity: (bulkDeleting || favorites.size === filteredWords.length) ? 0.5 : 1,
            }}
          >
            {bulkDeleting ? '処理中...' : '🗑️ ★以外を一括削除'}
          </button>
        </div>
      )}
      {/* ダウンロードボタン */}
      {words.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
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
                {/* お気に入りトグル（日付フィルター時のみ） */}
                {sourceFilter.startsWith('hw:') && (
                  <button
                    onClick={() => {
                      const next = new Set(favorites);
                      if (next.has(word.id)) next.delete(word.id); else next.add(word.id);
                      setFavorites(next);
                    }}
                    style={{
                      padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)',
                      fontSize: '1.2rem', cursor: 'pointer',
                      border: favorites.has(word.id) ? '2px solid #f59e0b' : '1px solid var(--border)',
                      background: favorites.has(word.id) ? '#fef3c7' : 'var(--bg-page)',
                      color: favorites.has(word.id) ? '#f59e0b' : 'var(--text-muted)',
                      transition: 'all 0.2s', lineHeight: 1,
                    }}
                    title={favorites.has(word.id) ? 'お気に入り解除' : 'お気に入りに追加'}
                  >
                    {favorites.has(word.id) ? '★' : '☆'}
                  </button>
                )}
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
    </div>
  );
}
