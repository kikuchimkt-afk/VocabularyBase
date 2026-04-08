'use client';

import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import RegisterForm from './RegisterForm';
import WordList from './WordList';
import Quiz from './Quiz';
import StudentManual from './StudentManual';

export default function StudentDashboard({ token }) {
  const [activeTab, setActiveTab] = useState('register');
  const [studentId, setStudentId] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data, error } = await supabase
          .from('vb_students')
          .select('id, name')
          .eq('token', token)
          .single();

        if (error || !data) {
          setNotFound(true);
        } else {
          setStudentId(data.id);
          setStudentName(data.name);
          // PWAホーム画面追加対応: トークンを記憶
          try { localStorage.setItem('vb_student_token', token); } catch {}

          // 単語数も取得
          const { count } = await supabase
            .from('vb_words')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', data.id);
          setWordCount(count || 0);
        }
      } catch (err) {
        console.error('Error fetching student:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [token, supabase]);

  const refreshWordCount = async () => {
    if (!studentId) return;
    const { count } = await supabase
      .from('vb_words')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId);
    setWordCount(count || 0);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-muted" style={{ fontSize: '1.2rem' }}>読み込み中...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem', maxWidth: '400px' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</p>
          <h2 className="title-2">ページが見つかりません</h2>
          <p className="text-muted">このURLは無効です。<br/>講師から配布された正しいURLまたはQRコードをご使用ください。</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 生徒名ヘッダー */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>📖 {studentName} の単語帳</h2>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>登録語数: {wordCount}語</p>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowManual(true)}
            style={{
              border: '1px solid var(--border)', background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)', padding: '0.4rem 0.75rem',
              fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-muted)',
              fontWeight: '600',
            }}
          >
            ❓ 使い方
          </button>
          <a
            href="/admin"
            style={{
              border: 'none', background: 'transparent',
              padding: '0.4rem', fontSize: '0.85rem', cursor: 'pointer',
              color: 'var(--text-muted)', opacity: 0.35, textDecoration: 'none',
            }}
            title="管理画面"
          >
            ⚙️
          </a>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="tabs mb-4">
        <button
          className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          📝 登録
        </button>
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📚 一覧
        </button>
        <button
          className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiz')}
        >
          🎮 テスト
        </button>
      </div>

      {/* タブコンテンツ */}
      <div>
        {activeTab === 'register' && (
          <RegisterForm
            token={token}
            studentId={studentId}
            onSaved={() => {
              refreshWordCount();
              setActiveTab('list');
            }}
          />
        )}

        {activeTab === 'list' && (
          <WordList studentId={studentId} studentName={studentName} />
        )}

        {activeTab === 'quiz' && (
          <Quiz studentId={studentId} />
        )}
      </div>

      {/* マニュアル */}
      {showManual && <StudentManual onClose={() => setShowManual(false)} />}
    </div>
  );
}
