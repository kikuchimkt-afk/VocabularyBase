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

  // 一括音声生成
  const [bulkAudioGenerating, setBulkAudioGenerating] = useState(false);
  const [bulkAudioProgress, setBulkAudioProgress] = useState('');
  const [bulkAudioCancelRef] = useState({ current: false });

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

  // 一括音声生成
  const bulkGenerateAudio = async () => {
    const needAudio = words.filter(w =>
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

  // 検索フィルター（部分一致）
  const filteredWords = words.filter(w => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const english = (w.english || '').toLowerCase();
    const meanings = (w.meanings || []).join(' ').toLowerCase();
    const example = (w.example_sentence || '').toLowerCase();
    const exampleJa = (w.example_sentence_ja || '').toLowerCase();
    return english.includes(q) || meanings.includes(q) || example.includes(q) || exampleJa.includes(q);
  });

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
      {searchQuery && (
        <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
          {filteredWords.length}件見つかりました
        </p>
      )}
      {/* ダウンロードボタン */}
      {words.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* 一括音声生成ボタン */}
          {(() => {
            const needAudioCount = words.filter(w =>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{word.english}</h3>
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
