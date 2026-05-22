'use client';
import { useState, useCallback, useRef, useMemo } from 'react';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SelfTraining({ words, onClose }) {
  const [phase, setPhase] = useState('settings');
  // settings
  const [sourceText, setSourceText] = useState('all');
  const [idFrom, setIdFrom] = useState('');
  const [idTo, setIdTo] = useState('');
  const [order, setOrder] = useState('seq');
  const [count, setCount] = useState(0);
  const [diffScope, setDiffScope] = useState('all');
  // playing
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownSet, setKnownSet] = useState(new Set());
  const [againSet, setAgainSet] = useState(new Set());
  const [fading, setFading] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const audioRef = useRef(null);

  // 出典元のグループ一覧
  const sourceGroups = useMemo(() => {
    const map = {};
    words.forEach(w => {
      if (!w.source) return;
      const prefix = w.source.replace(/\s*No\.\d+$/, '').trim();
      if (!prefix) return;
      if (!map[prefix]) map[prefix] = 0;
      map[prefix]++;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [words]);

  // 設定に基づいてフィルタリング
  const candidateWords = useMemo(() => {
    let list = [...words];
    // 出典元フィルター
    if (sourceText !== 'all') {
      list = list.filter(w => w.source && w.source.replace(/\s*No\.\d+$/, '').trim() === sourceText);
    }
    // ID範囲
    if (idFrom || idTo) {
      const from = parseInt(idFrom) || 0;
      const to = parseInt(idTo) || 99999;
      list = list.filter(w => {
        const m = (w.source || '').match(/No\.(\d+)/);
        if (!m) return !idFrom && !idTo;
        const n = parseInt(m[1]);
        return n >= from && n <= to;
      });
    }
    // 習熟度フィルター
    if (diffScope === 'remaining') {
      list = list.filter(w => !((w.correct_count || 0) > (w.wrong_count || 0)));
    } else if (diffScope === 'untested') {
      list = list.filter(w => !w.first_tested);
    } else if (diffScope === 'weak') {
      list = list.filter(w => (w.wrong_count || 0) > (w.correct_count || 0));
    }
    return list;
  }, [words, sourceText, idFrom, idTo, diffScope]);

  const playAudio = useCallback((url) => {
    if (!url) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const a = new Audio(url);
    audioRef.current = a;
    a.play().catch(() => {});
  }, []);

  const startTraining = () => {
    if (candidateWords.length === 0) return;
    let cards = candidateWords.map((w, i) => ({ ...w, origIdx: i }));
    // ソート
    if (order === 'rand') {
      cards = shuffleArray(cards);
    } else if (order === 'weak') {
      cards.sort((a, b) => {
        const ra = (a.wrong_count || 0) - (a.correct_count || 0);
        const rb = (b.wrong_count || 0) - (b.correct_count || 0);
        return rb - ra;
      });
    } else {
      cards.sort((a, b) => {
        const nA = parseInt((a.source || '').match(/No\.(\d+)/)?.[1] || '99999');
        const nB = parseInt((b.source || '').match(/No\.(\d+)/)?.[1] || '99999');
        return nA !== nB ? nA - nB : a.origIdx - b.origIdx;
      });
    }
    // 出題数制限
    if (count > 0 && count < cards.length) cards = cards.slice(0, count);
    setDeck(cards);
    setIdx(0);
    setFlipped(false);
    setKnownSet(new Set());
    setAgainSet(new Set());
    setPhase('playing');
    if (autoplay && cards[0]?.word_audio_url) setTimeout(() => playAudio(cards[0].word_audio_url), 300);
  };

  const flipCard = () => {
    if (flipped) return;
    setFlipped(true);
    const c = deck[idx];
    if (autoplay && c?.sentence_audio_url) setTimeout(() => playAudio(c.sentence_audio_url), 400);
  };

  const judge = (known) => {
    const ns = known ? new Set(knownSet) : new Set(knownSet);
    const na = known ? new Set(againSet) : new Set(againSet);
    if (known) ns.add(idx); else na.add(idx);
    setKnownSet(ns); setAgainSet(na);
    const next = idx + 1;
    if (next >= deck.length) { setPhase('result'); return; }
    setFading(true);
    setTimeout(() => {
      setFlipped(false); setIdx(next);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setTimeout(() => {
          setFading(false);
          if (autoplay && deck[next]?.word_audio_url) setTimeout(() => playAudio(deck[next].word_audio_url), 300);
        }, 50);
      }));
    }, 250);
  };

  const retryMissed = () => {
    const missed = [...againSet].map(i => deck[i]).filter(Boolean);
    if (!missed.length) return;
    const cards = order === 'rand' ? shuffleArray(missed) : missed;
    setDeck(cards); setIdx(0); setFlipped(false);
    setKnownSet(new Set()); setAgainSet(new Set()); setPhase('playing');
    if (autoplay && cards[0]?.word_audio_url) setTimeout(() => playAudio(cards[0].word_audio_url), 300);
  };

  const Pill = ({ active, onClick, children, color }) => (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
      background: active ? (color || 'var(--primary)') : 'var(--bg-card)',
      color: active ? 'white' : 'var(--text-muted)',
      border: `1px solid ${active ? (color || 'var(--primary)') : 'var(--border)'}`, transition: '0.2s',
    }}>{children}</button>
  );

  // === SETTINGS ===
  if (phase === 'settings') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}
        onClick={onClose}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', maxHeight: '85vh', overflow: 'auto' }}
          onClick={e => e.stopPropagation()}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>🏋️ 自主トレーニング</h3>

          {/* 出典元 */}
          {sourceGroups.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>📍 出典元</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                <Pill active={sourceText === 'all'} onClick={() => setSourceText('all')}>すべて</Pill>
                {sourceGroups.map(([name, cnt]) => (
                  <Pill key={name} active={sourceText === name} onClick={() => setSourceText(name)}>{name} ({cnt})</Pill>
                ))}
              </div>
            </div>
          )}

          {/* 番号範囲 */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>🔢 番号範囲（No.）</label>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input type="number" value={idFrom} onChange={e => setIdFrom(e.target.value)} placeholder="開始" className="input-text" style={{ width: 80, padding: '0.35rem 0.5rem', fontSize: '0.85rem' }} />
              <span className="text-muted">〜</span>
              <input type="number" value={idTo} onChange={e => setIdTo(e.target.value)} placeholder="終了" className="input-text" style={{ width: 80, padding: '0.35rem 0.5rem', fontSize: '0.85rem' }} />
              {(idFrom || idTo) && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>→ {candidateWords.length}語</span>}
            </div>
          </div>

          {/* 習熟度 */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>📊 習熟度</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              <Pill active={diffScope === 'all'} onClick={() => setDiffScope('all')}>全単語</Pill>
              <Pill active={diffScope === 'remaining'} onClick={() => setDiffScope('remaining')} color="#fbbf24">残りのみ</Pill>
              <Pill active={diffScope === 'untested'} onClick={() => setDiffScope('untested')} color="#8b5cf6">未テスト</Pill>
              <Pill active={diffScope === 'weak'} onClick={() => setDiffScope('weak')} color="var(--danger)">苦手のみ</Pill>
            </div>
          </div>

          {/* 順序 */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>🔀 出題順</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              <Pill active={order === 'seq'} onClick={() => setOrder('seq')}>ID順</Pill>
              <Pill active={order === 'rand'} onClick={() => setOrder('rand')}>ランダム</Pill>
              <Pill active={order === 'weak'} onClick={() => setOrder('weak')} color="var(--danger)">苦手順</Pill>
            </div>
          </div>

          {/* 出題数 */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>📝 出題数</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {[0, 10, 20, 50].map(n => (
                <Pill key={n} active={count === n} onClick={() => setCount(n)}>{n === 0 ? `全部 (${candidateWords.length})` : `${n}語`}</Pill>
              ))}
            </div>
          </div>

          {/* 自動音声 */}
          <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.25rem' }}>
            <input type="checkbox" checked={autoplay} onChange={e => setAutoplay(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
            🔊 自動音声再生
          </label>

          {/* START */}
          <button className="btn btn-primary" onClick={startTraining} disabled={candidateWords.length === 0}
            style={{ width: '100%', fontSize: '1.05rem', fontWeight: 800, padding: '0.9rem', borderRadius: 'var(--radius-full)', letterSpacing: '2px', boxShadow: '0 6px 24px rgba(79,70,229,0.4)' }}>
            START ({count > 0 ? Math.min(count, candidateWords.length) : candidateWords.length}語)
          </button>
          {candidateWords.length === 0 && <p className="text-muted" style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--danger)' }}>条件に合う単語がありません</p>}

          <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
            <button className="text-muted" onClick={onClose} style={{ fontSize: '0.85rem', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}>キャンセル</button>
          </div>
        </div>
      </div>
    );
  }

  // === PLAYING ===
  if (phase === 'playing') {
    const card = deck[idx];
    const progress = (idx / deck.length) * 100;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-page)', zIndex: 9999, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div style={{ maxWidth: 520, width: '100%', margin: '0 auto', padding: '1rem', flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{idx + 1} / {deck.length}</span>
            <button onClick={() => setPhase('result')} className="text-muted"
              style={{ padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', background: 'transparent' }}>終了</button>
          </div>
          {/* Progress */}
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginBottom: '1.25rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 2, transition: 'width 0.4s', width: `${progress}%` }} />
          </div>
          {/* Card */}
          <div onClick={flipCard} style={{ perspective: 1000, cursor: 'pointer', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: '100%', maxWidth: 420, height: 300, position: 'relative', transformStyle: 'preserve-3d',
              transition: fading ? 'opacity 0.25s' : 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
              transform: fading ? 'none' : (flipped ? 'rotateY(180deg)' : 'none'),
              opacity: fading ? 0 : 1, visibility: fading ? 'hidden' : 'visible',
            }}>
              {/* Front */}
              <div style={{
                position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
              }}>
                <div className="text-muted" style={{ position: 'absolute', top: 14, left: 18, fontSize: '0.72rem', fontWeight: 700 }}>No.{idx + 1}</div>
                {card.word_audio_url && (
                  <button onClick={e => { e.stopPropagation(); playAudio(card.word_audio_url); }}
                    style={{ position: 'absolute', top: 14, right: 18, width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--primary)', background: 'var(--primary-light)', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🔊</button>
                )}
                <div style={{ fontSize: '2.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem' }}>{card.english}</div>
                <div className="text-muted" style={{ fontSize: '0.78rem', opacity: 0.6 }}>タップで和訳を表示</div>
              </div>
              {/* Back */}
              <div style={{
                position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--primary)', background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--primary-light) 100%)',
                boxShadow: 'var(--shadow-lg)', transform: 'rotateY(180deg)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
              }}>
                <div className="text-muted" style={{ position: 'absolute', top: 14, left: 18, fontSize: '0.72rem', fontWeight: 700 }}>No.{idx + 1}</div>
                {card.sentence_audio_url && (
                  <button onClick={e => { e.stopPropagation(); playAudio(card.sentence_audio_url); }}
                    style={{ position: 'absolute', top: 14, right: 18, width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--primary)', background: 'var(--primary-light)', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🔊</button>
                )}
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', textAlign: 'center', marginBottom: '0.5rem' }}>{card.meanings?.join('、')}</div>
                <div className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>{card.english}</div>
                {card.example_sentence && (
                  <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text-main)', opacity: 0.8 }}>{card.example_sentence}</div>
                    {card.example_sentence_ja && <div className="text-muted" style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>{card.example_sentence_ja}</div>}
                  </div>
                )}
                {card.source && <div style={{ position: 'absolute', bottom: 14, left: 18, right: 18, fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', opacity: 0.7, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {card.source}</div>}
              </div>
            </div>
          </div>
          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            {!flipped ? (
              <>
                {card.sentence_audio_url && (
                  <button onClick={e => { e.stopPropagation(); playAudio(card.sentence_audio_url); }}
                    style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', fontWeight: 700, border: '2px solid #f59e0b', borderRadius: 14, background: '#fffbeb', color: '#b45309', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>🔈 ヒント</button>
                )}
                <button onClick={flipCard} style={{ flex: 1, maxWidth: 300, padding: '0.9rem', fontSize: '0.95rem', fontWeight: 700, border: '2px solid var(--primary)', borderRadius: 14, background: 'var(--primary-light)', color: 'var(--primary)', cursor: 'pointer' }}>答えを見る</button>
              </>
            ) : (
              <>
                <button onClick={() => judge(false)} style={{ flex: 1, padding: '0.9rem', fontSize: '0.95rem', fontWeight: 700, border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, background: 'var(--danger-light)', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>✕ まだ</button>
                <button onClick={() => judge(true)} style={{ flex: 1, padding: '0.9rem', fontSize: '0.95rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, background: 'var(--secondary-light)', color: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>✓ 覚えた</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === RESULT ===
  const knownCount = knownSet.size;
  const againCount = againSet.size;
  const total = knownCount + againCount;
  const pct = total > 0 ? Math.round((knownCount / total) * 100) : 0;
  const resultInfo = pct === 100 ? { emoji: '🎉', msg: 'パーフェクト！', color: 'var(--secondary)' }
    : pct >= 80 ? { emoji: '🌟', msg: '素晴らしい！', color: '#f59e0b' }
    : pct >= 50 ? { emoji: '💪', msg: 'いい調子！', color: 'var(--primary)' }
    : { emoji: '📚', msg: 'もう少し頑張ろう！', color: 'var(--danger)' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-page)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '2rem 1rem', maxWidth: 400 }}>
        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{resultInfo.emoji}</div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>{resultInfo.msg}</h2>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: resultInfo.color, marginBottom: '1.5rem' }}>{pct}%</div>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <div><div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>{knownCount}</div><div className="text-muted" style={{ fontSize: '0.75rem' }}>覚えた</div></div>
          <div><div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>{againCount}</div><div className="text-muted" style={{ fontSize: '0.75rem' }}>もう一度</div></div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {againCount > 0 && <button onClick={retryMissed} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>まだの単語をやり直す</button>}
          <button onClick={() => { setPhase('settings'); }} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>設定に戻る</button>
          <button onClick={onClose} className="text-muted" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}>閉じる</button>
        </div>
      </div>
    </div>
  );
}
