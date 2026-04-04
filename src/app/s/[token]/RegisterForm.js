'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';

// 単語登録フォーム部分のコンポーネント
export default function RegisterForm({ token, studentId, onSaved }) {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState(null);
  
  const [selectedMeanings, setSelectedMeanings] = useState([]);
  const [exampleSentence, setExampleSentence] = useState('');
  const [exampleSentenceJa, setExampleSentenceJa] = useState('');
  const [source, setSource] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createBrowserClient();

  const handleSearch = async () => {
    if (!word.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.trim() }),
      });
      if (!res.ok) throw new Error('API呼び出しに失敗しました');
      const data = await res.json();
      setCandidates(data);
      setExampleSentence(data.example_sentence || '');
      setExampleSentenceJa(data.example_sentence_ja || '');
      setSelectedMeanings([]);
    } catch (err) {
      console.error(err);
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

  const saveWord = async () => {
    if (!word.trim() || selectedMeanings.length === 0) {
      setMessage('英単語と、少なくとも1つの意味を選択してください。');
      return;
    }
    
    if (!studentId) {
      setMessage('生徒情報の読み込みに失敗しました。');
      return;
    }

    setIsSaving(true);
    setMessage('音声を生成して保存中...');
    
    try {
      // 1. 音声生成 (英単語)
      const wordAudioRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: word.trim() }),
      });
      const wordAudioData = wordAudioRes.ok ? await wordAudioRes.json() : { url: null };
      
      // 2. 音声生成 (例文)
      let sentenceAudioUrl = null;
      if (exampleSentence) {
        const sentenceAudioRes = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: exampleSentence }),
        });
        const sentenceAudioData = sentenceAudioRes.ok ? await sentenceAudioRes.json() : { url: null };
        sentenceAudioUrl = sentenceAudioData.url;
      }
      
      // 3. Supabase DBに保存
      const { error: insertError } = await supabase
        .from('vb_words')
        .insert({
          student_id: studentId,
          english: word.trim(),
          meanings: selectedMeanings,
          example_sentence: exampleSentence,
          example_sentence_ja: exampleSentenceJa,
          source: source,
          word_audio_url: wordAudioData.url,
          sentence_audio_url: sentenceAudioUrl
        });
        
      if (insertError) throw insertError;
      
      setMessage('登録が完了しました！');
      setWord('');
      setCandidates(null);
      setSelectedMeanings([]);
      setExampleSentence('');
      setExampleSentenceJa('');
      setSource('');
      
      if (onSaved) onSaved(); // 一覧の再読み込みなどをトリガー
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <h2 className="title-2">新しい単語を登録</h2>
      <div className="input-group">
        <label className="input-label">英単語</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            className="input-text" 
            type="text" 
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="例: inevitable"
            disabled={loading || isSaving}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            className="btn btn-primary" 
            onClick={handleSearch}
            disabled={!word.trim() || loading || isSaving}
          >
            {loading ? '検索中...' : '意味を検索'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{ margin: '1rem 0', padding: '0.75rem', backgroundColor: 'var(--bg-page)', borderRadius: 'var(--radius-md)', color: message.includes('失敗') ? 'var(--danger)' : 'var(--primary)' }}>
          {message}
        </div>
      )}

      {candidates && (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">📝 日本語訳の候補（必要なものを複数選択）</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {candidates.meanings?.map((meaning, i) => (
                <button
                  key={i}
                  className={`btn ${selectedMeanings.includes(meaning) ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => toggleMeaning(meaning)}
                >
                  {selectedMeanings.includes(meaning) ? '✓ ' : '+ '}{meaning}
                </button>
              ))}
            </div>
          </div>
          
          <div className="input-group" style={{ marginTop: '1.5rem' }}>
            <label className="input-label">📖 例文（AI生成 または 自由編集）</label>
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
              placeholder="例文の日本語訳"
              style={{ marginTop: '0.5rem' }}
            />
          </div>

          <div className="input-group">
            <label className="input-label">📍 出典（教科書・ページなど / 任意）</label>
            <input 
              className="input-text" 
              type="text" 
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Lesson 5 p.42"
            />
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', fontSize: '1rem' }}
            onClick={saveWord}
            disabled={selectedMeanings.length === 0 || isSaving}
          >
            {isSaving ? '音声生成 ＆ 保存中...' : '📱 この内容で単語帳に登録する'}
          </button>
        </div>
      )}
    </div>
  );
}
