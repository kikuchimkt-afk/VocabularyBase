'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createBrowserClient } from '@/lib/supabase';

function shuffleArray(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Quiz({ token, studentId }) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizState, setQuizState] = useState('start');
  const [deck, setDeck] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownSet, setKnownSet] = useState(new Set());
  const [againSet, setAgainSet] = useState(new Set());
  const [order, setOrder] = useState('rand');
  const [autoplay, setAutoplay] = useState(true);
  const [dateFilter, setDateFilter] = useState('all'); // 'all' or specific date string
  const [scope, setScope] = useState('all'); // 'all' or 'remaining'
  const audioRef = useRef(null);
  const [cardFading, setCardFading] = useState(false);

  const supabase = createBrowserClient();

  useEffect(() => {
    if (!studentId) return;
    fetchWords();
  }, [studentId]);

  const fetchWords = async () => {
    try {
      const { data, error } = await supabase
        .from('vb_words')
        .select('*')
        .eq('student_id', studentId);
      if (error) throw error;
      setWords(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 日付一覧を取得（新しい順）
  const availableDates = [...new Set(
    words
      .filter(w => w.assigned_date)
      .map(w => w.assigned_date)
  )].sort((a, b) => b.localeCompare(a));

  // 選択中の日付の出典サマリーを生成（WordListと同じロジック）
  const getSourceSummary = (date) => {
    const dateWords = words.filter(w => w.assigned_date === date && w.source);
    if (dateWords.length === 0) return null;

    const groups = {};
    dateWords.forEach(w => {
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
        nums.sort((a, b) => a - b);
        const min = nums[0];
        const max = nums[nums.length - 1];
        if (min === max) summaries.push(`${name} No.${min}`);
        else summaries.push(`${name} No.${min}〜${max}`);
      } else {
        summaries.push(name);
      }
    }
    return summaries.join(', ');
  };

  // フィルター適用後の単語
  const filteredWords = dateFilter === 'all'
    ? words
    : words.filter(w => w.assigned_date === dateFilter);

  // 各単語の最新テスト結果から「覚えた」数を計算
  // correct_count > wrong_count なら覚えた判定
  const isMastered = (w) => (w.correct_count || 0) > (w.wrong_count || 0);
  const masteredCount = filteredWords.filter(isMastered).length;
  const remainingCount = filteredWords.length - masteredCount;

  // スコープ適用後の単語（出題範囲）
  const scopedWords = scope === 'remaining'
    ? filteredWords.filter(w => !isMastered(w))
    : filteredWords;

  const playAudio = useCallback((url) => {
    if (!url) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(() => {});
  }, []);

  const startQuiz = () => {
    if (scopedWords.length === 0) return;
    let cards = scopedWords.map((w, i) => ({ ...w, origIdx: i }));
    if (order === 'rand') cards = shuffleArray(cards);
    setDeck(cards);
    setCurrentIdx(0);
    setIsFlipped(false);
    setKnownSet(new Set());
    setAgainSet(new Set());
    setQuizState('playing');

    // Auto-play first card
    if (autoplay && cards[0]?.word_audio_url) {
      setTimeout(() => playAudio(cards[0].word_audio_url), 300);
    }
  };

  const flipCard = () => {
    if (isFlipped) return;
    setIsFlipped(true);
    const card = deck[currentIdx];
    if (autoplay && card?.sentence_audio_url) {
      setTimeout(() => playAudio(card.sentence_audio_url), 500);
    }
  };

  const judgeCard = async (isKnown) => {
    const card = deck[currentIdx];
    const newKnown = new Set(knownSet);
    const newAgain = new Set(againSet);

    if (isKnown) {
      newKnown.add(currentIdx);
    } else {
      newAgain.add(currentIdx);
    }
    setKnownSet(newKnown);
    setAgainSet(newAgain);

    // Save to DB: quiz_results テーブル + vb_words のカウンター更新
    try {
      await supabase.from('vb_quiz_results').insert({
        student_id: studentId,
        word_id: card.id,
        quiz_type: 'flashcard',
        is_correct: isKnown,
      });

      // vb_words の correct_count / wrong_count を更新
      const field = isKnown ? 'correct_count' : 'wrong_count';
      const currentVal = card[field] || 0;
      await supabase
        .from('vb_words')
        .update({
          [field]: currentVal + 1,
          last_tested: new Date().toISOString(),
        })
        .eq('id', card.id);

      // ローカルの deck データも更新（結果画面用）
      const updatedDeck = [...deck];
      updatedDeck[currentIdx] = { ...card, [field]: currentVal + 1 };
      setDeck(updatedDeck);
    } catch (e) {
      console.error('Quiz save error:', e);
    }

    const nextIdx = currentIdx + 1;
    if (nextIdx >= deck.length) {
      // テスト終了時に最新の単語データを再取得（覚えた/残りを正しく反映するため）
      fetchWords();
      setQuizState('result');
    } else {
      // フェードアウト → 内容切り替え → フェードインで残像を防止
      setCardFading(true);
      setTimeout(() => {
        setIsFlipped(false);
        setCurrentIdx(nextIdx);
        // フェードイン
        requestAnimationFrame(() => {
          setCardFading(false);
          if (autoplay && deck[nextIdx]?.word_audio_url) {
            setTimeout(() => playAudio(deck[nextIdx].word_audio_url), 300);
          }
        });
      }, 250); // フェードアウト完了を待つ
    }
  };

  const retryMissed = () => {
    const missed = [...againSet].map(i => deck[i]);
    if (missed.length === 0) return;
    let cards = order === 'rand' ? shuffleArray(missed) : missed;
    setDeck(cards);
    setCurrentIdx(0);
    setIsFlipped(false);
    setKnownSet(new Set());
    setAgainSet(new Set());
    setQuizState('playing');
    if (autoplay && cards[0]?.word_audio_url) {
      setTimeout(() => playAudio(cards[0].word_audio_url), 300);
    }
  };

  const retryAll = () => {
    startQuiz();
  };

  // 日付フォーマット (YYYY-MM-DD → M/D)
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  if (loading) {
    return <div className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>読み込み中...</div>;
  }

  // === START SCREEN ===
  if (quizState === 'start') {
    return (
      <div style={{ padding: '1rem' }}>
        {/* Date filter */}
        {availableDates.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              📅 日付で絞り込む
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <button
                onClick={() => setDateFilter('all')}
                style={{
                  padding: '6px 14px', border: 'none', borderRadius: 20,
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  background: dateFilter === 'all' ? 'var(--primary)' : 'var(--bg-card)',
                  color: dateFilter === 'all' ? 'white' : 'var(--text-muted)',
                  border: `1px solid ${dateFilter === 'all' ? 'var(--primary)' : 'var(--border)'}`,
                  transition: '0.2s',
                }}
              >
                すべて ({words.length})
              </button>
              {availableDates.map(date => {
                const count = words.filter(w => w.assigned_date === date).length;
                return (
                  <button
                    key={date}
                    onClick={() => setDateFilter(date)}
                    style={{
                      padding: '6px 14px', border: 'none', borderRadius: 20,
                      fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                      background: dateFilter === date ? 'var(--primary)' : 'var(--bg-card)',
                      color: dateFilter === date ? 'white' : 'var(--text-muted)',
                      border: `1px solid ${dateFilter === date ? 'var(--primary)' : 'var(--border)'}`,
                      transition: '0.2s',
                    }}
                  >
                    {formatDate(date)} ({count})
                  </button>
                );
              })}
            </div>
            {dateFilter !== 'all' && (() => {
              const sum = getSourceSummary(dateFilter);
              return sum ? (
                <div style={{
                  marginTop: '0.5rem',
                  background: '#fff3e0', color: '#e65100', padding: '0.25rem 0.7rem',
                  borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                  border: '1px solid #ffe0b2', display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  🏷️ 出典: {sum}
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <StatCard value={filteredWords.length} label="全単語" color="var(--primary)" />
          <StatCard value={remainingCount} label="残り" color="#fbbf24" />
          <StatCard value={masteredCount} label="覚えた" color="var(--secondary)" />
        </div>

        {/* Order toggle */}
        <div style={{
          display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem',
          background: 'var(--bg-card)', borderRadius: 'var(--radius-full)', padding: '4px',
          border: '1px solid var(--border)',
        }}>
          <OrderBtn active={order === 'seq'} onClick={() => setOrder('seq')}>出現順</OrderBtn>
          <OrderBtn active={order === 'rand'} onClick={() => setOrder('rand')}>ランダム</OrderBtn>
        </div>

        {/* Scope toggle */}
        <div style={{
          display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem',
          background: 'var(--bg-card)', borderRadius: 'var(--radius-full)', padding: '4px',
          border: '1px solid var(--border)',
        }}>
          <OrderBtn active={scope === 'all'} onClick={() => setScope('all')}>全単語</OrderBtn>
          <OrderBtn active={scope === 'remaining'} onClick={() => setScope('remaining')}>
            残りのみ{scope === 'remaining' ? ` (${scopedWords.length})` : ''}
          </OrderBtn>
        </div>

        {/* Autoplay */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <label style={{
            fontSize: '0.85rem', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
            />
            🔊 自動音声再生
          </label>
        </div>

        {/* Start button */}
        <div style={{ textAlign: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={startQuiz}
            disabled={scopedWords.length === 0}
            style={{
              fontSize: '1.1rem', fontWeight: '800', padding: '1rem 3rem',
              borderRadius: 'var(--radius-full)', letterSpacing: '2px',
              boxShadow: '0 6px 24px rgba(79, 70, 229, 0.4)',
            }}
          >
            START{scope === 'remaining' ? ` (${scopedWords.length}語)` : ''}
          </button>
          {scopedWords.length === 0 && (
            <p className="text-muted" style={{ marginTop: '1rem', color: 'var(--danger)' }}>
              {scope === 'remaining' ? 'すべて覚えました！🎉' : dateFilter !== 'all' ? 'この日付の単語はありません' : '単語を登録してから開始してください'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // === RESULT SCREEN ===
  if (quizState === 'result') {
    const knownCount = knownSet.size;
    const againCount = againSet.size;
    const isPerfect = againCount === 0;

    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
          {isPerfect ? '🎉' : '💪'}
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem' }}>
          {isPerfect ? 'パーフェクト！すべて覚えました！' : 'お疲れ様でした！'}
        </h2>

        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary)' }}>{knownCount}</div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>覚えた</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--danger)' }}>{againCount}</div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>もう一度</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {againCount > 0 && (
            <button
              onClick={retryMissed}
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', fontWeight: '700' }}
            >
              まだの単語をやり直す
            </button>
          )}
          <button
            onClick={retryAll}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', fontWeight: '700' }}
          >
            最初からやり直す
          </button>
        </div>
      </div>
    );
  }

  // === CARD SCREEN ===
  const card = deck[currentIdx];
  const progress = ((currentIdx) / deck.length) * 100;

  return (
    <div style={{ padding: '0.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
          {currentIdx + 1} / {deck.length}
        </span>
        <button
          onClick={() => setQuizState('result')}
          className="text-muted"
          style={{
            padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', background: 'transparent',
          }}
        >
          終了
        </button>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 4, background: 'var(--border)', borderRadius: 2,
        marginBottom: '1.25rem', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', background: 'var(--primary)', borderRadius: 2,
          transition: 'width 0.4s ease', width: `${progress}%`,
        }} />
      </div>

      {/* Flip Card */}
      <div
        onClick={flipCard}
        style={{
          perspective: '1000px', cursor: 'pointer',
          display: 'flex', justifyContent: 'center', marginBottom: '1rem',
        }}
      >
        <div style={{
          width: '100%', maxWidth: 420, height: 300, position: 'relative',
          transformStyle: 'preserve-3d',
          transition: cardFading ? 'opacity 0.2s ease' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'none',
          opacity: cardFading ? 0 : 1,
        }}>
          {/* Front */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
            background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}>
            <div className="text-muted" style={{ position: 'absolute', top: 14, left: 18, fontSize: '0.72rem', fontWeight: 700 }}>
              No.{currentIdx + 1}
            </div>
            {card.word_audio_url && (
              <button
                onClick={(e) => { e.stopPropagation(); playAudio(card.word_audio_url); }}
                style={{
                  position: 'absolute', top: 14, right: 18,
                  width: 36, height: 36, borderRadius: '50%',
                  border: '1.5px solid var(--primary)',
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', transition: '0.2s',
                }}
                title="発音を聞く"
              >
                🔊
              </button>
            )}
            {(card.assign_count || 1) >= 2 && (
              <div style={{
                position: 'absolute', bottom: 14, left: 18,
                fontSize: '0.68rem', fontWeight: 700,
                color: '#e65100', background: '#fff3e0',
                padding: '2px 8px', borderRadius: 10,
                border: '1px solid #ffcc80',
              }}>
                🔥 出題{card.assign_count}回目
              </div>
            )}
            <div style={{ fontSize: '2.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem' }}>
              {card.english}
            </div>
            <div className="text-muted" style={{ fontSize: '0.78rem', opacity: 0.6 }}>
              タップで和訳を表示
            </div>
          </div>

          {/* Back */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            borderRadius: 'var(--radius-lg)', border: '1px solid var(--primary)',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--primary-light) 100%)',
            boxShadow: 'var(--shadow-lg)',
            transform: 'rotateY(180deg)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}>
            <div className="text-muted" style={{ position: 'absolute', top: 14, left: 18, fontSize: '0.72rem', fontWeight: 700 }}>
              No.{currentIdx + 1}
            </div>
            {card.sentence_audio_url && (
              <button
                onClick={(e) => { e.stopPropagation(); playAudio(card.sentence_audio_url); }}
                style={{
                  position: 'absolute', top: 14, right: 18,
                  width: 36, height: 36, borderRadius: '50%',
                  border: '1.5px solid var(--primary)',
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', transition: '0.2s',
                }}
                title="例文を聞く"
              >
                🔊
              </button>
            )}
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', textAlign: 'center', marginBottom: '0.5rem' }}>
              {card.meanings?.join('、')}
            </div>
            <div className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              {card.english}
            </div>
            {card.example_sentence && (
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text-main)', opacity: 0.8 }}>
                  {card.example_sentence}
                </div>
                {card.example_sentence_ja && (
                  <div className="text-muted" style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                    {card.example_sentence_ja}
                  </div>
                )}
              </div>
            )}
            {card.source && (
              <div style={{
                position: 'absolute', bottom: 14, left: 18, right: 18,
                fontSize: '0.68rem', fontWeight: 600,
                color: 'var(--text-muted)', opacity: 0.7,
                textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                📍 {card.source}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        {!isFlipped ? (
          <>
            {card.sentence_audio_url && (
              <button
                onClick={(e) => { e.stopPropagation(); playAudio(card.sentence_audio_url); }}
                style={{
                  padding: '0.9rem 1rem',
                  fontSize: '0.85rem', fontWeight: 700,
                  border: '2px solid #f59e0b', borderRadius: 14,
                  background: '#fffbeb', color: '#b45309',
                  cursor: 'pointer', transition: '0.2s',
                  whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
                title="例文の音声をヒントとして再生"
              >
                🔈 ヒント
              </button>
            )}
            <button
              onClick={flipCard}
              style={{
                flex: 1, maxWidth: 300, padding: '0.9rem',
                fontSize: '0.95rem', fontWeight: 700,
                border: '2px solid var(--primary)', borderRadius: 14,
                background: 'var(--primary-light)', color: 'var(--primary)',
                cursor: 'pointer', transition: '0.2s',
              }}
            >
              答えを見る
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => judgeCard(false)}
              style={{
                flex: 1, padding: '0.9rem',
                fontSize: '0.95rem', fontWeight: 700,
                border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 14,
                background: 'var(--danger-light)', color: 'var(--danger)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: '0.2s',
              }}
            >
              ✕ まだ
            </button>
            <button
              onClick={() => judgeCard(true)}
              style={{
                flex: 1, padding: '0.9rem',
                fontSize: '0.95rem', fontWeight: 700,
                border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 14,
                background: 'var(--secondary-light)', color: 'var(--secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: '0.2s',
              }}
            >
              ✓ 覚えた
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ value, label, color }) {
  return (
    <div style={{
      flex: 1, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
      padding: '1rem', textAlign: 'center', border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
      <div className="text-muted" style={{ fontSize: '0.72rem', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// Order Button Component
function OrderBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 20px', border: 'none', borderRadius: 26,
        fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
        background: active ? 'var(--primary)' : 'transparent',
        color: active ? 'white' : 'var(--text-muted)',
        transition: '0.2s',
      }}
    >
      {children}
    </button>
  );
}
