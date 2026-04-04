'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase';

export default function WordList({ studentId }) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);

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
      {words.map((word) => (
        <div key={word.id} className="card" style={{ marginBottom: '1rem' }}>
          {/* Word header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{word.english}</h3>
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
            <button
              onClick={() => handleDelete(word.id)}
              className="text-muted"
              style={{ fontSize: '0.8rem', cursor: 'pointer' }}
            >
              削除
            </button>
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
      ))}
    </div>
  );
}
