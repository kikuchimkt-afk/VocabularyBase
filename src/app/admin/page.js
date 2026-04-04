'use client';

import { useState, useEffect } from 'react';
import TeacherWordRegister from './TeacherWordRegister';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentWords, setStudentWords] = useState([]);
  const [wordsLoading, setWordsLoading] = useState(false);

  // QRコードモーダル
  const [qrStudent, setQrStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'register'

  // Excel一括登録
  const [showImport, setShowImport] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsLoggedIn(true);
        fetchStudents();
      } else {
        const data = await res.json();
        setLoginError(data.error || 'Login failed.');
      }
    } catch {
      setLoginError('Network error.');
    } finally {
      setLoginLoading(false);
    }
  };

  // 学年を数値化（高3=15, 高2=14, ..., 中3=9, 中2=8, 中1=7, 小6=6, ..., 小1=1）
  const gradeToNumber = (grade) => {
    if (!grade) return 0;
    const g = grade.toString().trim();
    const match = g.match(/^(高|中|小|Kou|Chu|Sho)?(\d+)$/i);
    if (!match) return 0;
    const prefix = (match[1] || '').toLowerCase();
    const num = parseInt(match[2]) || 0;
    if (prefix === '高' || prefix === 'kou') return 12 + num;
    if (prefix === '中' || prefix === 'chu') return 6 + num;
    if (prefix === '小' || prefix === 'sho') return num;
    return num;
  };

  const sortByGrade = (list) =>
    [...list].sort((a, b) => gradeToNumber(b.grade) - gradeToNumber(a.grade));

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students');
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setStudents(sortByGrade(data.students || []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAddLoading(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), grade: newGrade.trim() }),
      });
      if (!res.ok) throw new Error('Add failed');
      setNewName('');
      setNewGrade('');
      setShowAddForm(false);
      fetchStudents();
    } catch (e) {
      console.error(e);
      alert('Failed to add student.');
    } finally {
      setAddLoading(false);
    }
  };

  const deleteStudent = async (id, name) => {
    if (!confirm(`${name} を削除しますか？\n登録した単語もすべて削除されます。`)) return;
    try {
      const res = await fetch(`/api/students?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchStudents();
    } catch (e) {
      console.error(e);
    }
  };

  const viewStudentWords = async (student) => {
    setSelectedStudent(student);
    setWordsLoading(true);
    try {
      const res = await fetch(`/api/students/words?studentId=${student.id}`);
      if (!res.ok) throw new Error('Fetch words failed');
      const data = await res.json();
      setStudentWords(data.words || []);
    } catch (e) {
      console.error(e);
      setStudentWords([]);
    } finally {
      setWordsLoading(false);
    }
  };

  const getAppUrl = () => {
    if (typeof window !== 'undefined') return window.location.origin;
    return '';
  };

  // サンプルExcelダウンロード
  const downloadSample = () => {
    const header = '名前,学年';
    const rows = ['田中 太郎,中2', '鈴木 花子,高1', '山田 次郎,中3'];
    const csv = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VocabularyBase_生徒一括登録サンプル.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Excel/CSVインポート
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportLoading(true);
    setImportResults(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/students/import', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Import failed');
      }
      const data = await res.json();
      setImportResults(data);
      fetchStudents();
    } catch (err) {
      setImportResults({ error: err.message });
    } finally {
      setImportLoading(false);
      e.target.value = '';
    }
  };

  const getStudentUrl = (token) => `${getAppUrl()}/s/${token}`;

  const getQrImageUrl = (url) => 
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('URLをコピーしました');
    });
  };

  // ===== LOGIN =====
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--header-gradient)' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
              📚 VocabularyBase
            </h1>
            <p className="text-muted">講師ダッシュボード</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">パスワード</label>
              <input
                className="input-text"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                autoFocus
              />
            </div>
            {loginError && (
              <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>{loginError}</p>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
              disabled={loginLoading}
            >
              {loginLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ===== DASHBOARD =====
  const totalWords = students.reduce((sum, s) => sum + (s.word_count || 0), 0);
  const activeStudents = students.filter(s => s.word_count > 0).length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      {/* Header */}
      <header style={{ background: 'var(--header-gradient)', color: 'white', padding: '1.5rem 0' }}>
        <div className="container">
          <div className="flex justify-between items-center">
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>📚 VocabularyBase</h1>
              <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>講師ダッシュボード</p>
            </div>
            <button className="btn" style={{ color: 'white', opacity: 0.8 }} onClick={() => setIsLoggedIn(false)}>
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex', gap: '0', marginBottom: '1.5rem',
          background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', overflow: 'hidden',
        }}>
          <button
            onClick={() => setActiveTab('students')}
            style={{
              flex: 1, padding: '0.75rem', border: 'none', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.9rem', fontFamily: 'inherit',
              background: activeTab === 'students' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'students' ? 'white' : 'var(--text-muted)',
              transition: '0.2s',
            }}
          >
            👥 生徒管理
          </button>
          <button
            onClick={() => setActiveTab('register')}
            style={{
              flex: 1, padding: '0.75rem', border: 'none', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.9rem', fontFamily: 'inherit',
              background: activeTab === 'register' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'register' ? 'white' : 'var(--text-muted)',
              transition: '0.2s',
            }}
          >
            📝 単語配信
          </button>
        </div>

        {activeTab === 'register' ? (
          <TeacherWordRegister students={students} onRegistered={fetchStudents} />
        ) : (
        <>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p className="text-muted">生徒数</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>{students.length}</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p className="text-muted">総登録単語数</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--secondary)' }}>{totalWords}</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p className="text-muted">アクティブ生徒</p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#f97316' }}>{activeStudents}/{students.length}</p>
          </div>
        </div>

        {/* Student list header */}
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <h2 className="title-2" style={{ margin: 0 }}>生徒一覧</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => { setShowImport(!showImport); setShowAddForm(false); }}>
              📄 一括登録
            </button>
            <button className="btn btn-primary" onClick={() => { setShowAddForm(true); setShowImport(false); }}>
              ＋ 生徒を追加
            </button>
          </div>
        </div>

        {/* Excel一括登録 */}
        {showImport && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem' }}>📄 Excel / CSV で一括登録</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              「名前」「学年」の2列を含むExcel (.xlsx) または CSV ファイルをアップロードしてください。
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <label
                className="btn btn-primary"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                📤 ファイルを選択
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                  disabled={importLoading}
                />
              </label>
              <button className="btn btn-outline" onClick={downloadSample}>
                📥 サンプルをダウンロード
              </button>
              <button className="btn btn-secondary" onClick={() => { setShowImport(false); setImportResults(null); }}>
                閉じる
              </button>
            </div>
            {importLoading && (
              <p style={{ marginTop: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>📤 インポート中...</p>
            )}
            {importResults && (
              <div style={{ marginTop: '1rem' }}>
                {importResults.error ? (
                  <p style={{ color: 'var(--danger)', fontWeight: '600' }}>❌ {importResults.error}</p>
                ) : (
                  <>
                    <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                      ✅ {importResults.summary.success}名登録完了
                      {importResults.summary.skip > 0 && ` / ${importResults.summary.skip}件スキップ`}
                      {importResults.summary.error > 0 && ` / ${importResults.summary.error}件エラー`}
                    </p>
                    <div style={{ fontSize: '0.8rem', maxHeight: '150px', overflowY: 'auto' }}>
                      {importResults.results.map((r, i) => (
                        <div key={i} style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ fontWeight: '600' }}>{r.name}</span>
                          {r.grade && <span className="text-muted"> ({r.grade})</span>}
                          <span style={{ marginLeft: '0.5rem' }}>{r.status}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Add form */}
        {showAddForm && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <form onSubmit={addStudent}>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="input-group" style={{ flex: '2', minWidth: '150px', marginBottom: 0 }}>
                  <label className="input-label">名前</label>
                  <input className="input-text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="田中 太郎" autoFocus />
                </div>
                <div className="input-group" style={{ flex: '1', minWidth: '80px', marginBottom: 0 }}>
                  <label className="input-label">学年</label>
                  <input className="input-text" value={newGrade} onChange={e => setNewGrade(e.target.value)} placeholder="中2" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={addLoading || !newName.trim()}>
                    {addLoading ? '追加中...' : '追加'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                    キャンセル
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-muted">読み込み中...</p>
        ) : students.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="text-muted">まだ生徒が登録されていません。<br/>「＋ 生徒を追加」ボタンから追加してください。</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {students.map(student => (
              <div key={student.id} className="card">
                {/* Name and avatar */}
                <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: 'var(--radius-full)',
                    backgroundColor: student.avatar_color || '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '700', fontSize: '1rem', flexShrink: 0
                  }}>
                    {student.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', fontSize: '1rem' }}>{student.name}</p>
                    {student.grade && <span className="badge badge-blue">{student.grade}</span>}
                  </div>
                  <button
                    className="text-muted"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => deleteStudent(student.id, student.name)}
                  >
                    削除
                  </button>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span className="text-muted">登録語数</span>
                    <p style={{ fontWeight: '600' }}>{student.word_count || 0}語</p>
                  </div>
                  <div>
                    <span className="text-muted">正答率</span>
                    <p style={{ fontWeight: '600' }}>{student.accuracy !== null ? `${student.accuracy}%` : '—'}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <a
                    href={getStudentUrl(student.token)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                  >
                    🔗 開く
                  </a>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                    onClick={() => copyToClipboard(getStudentUrl(student.token))}
                  >
                    📋 URLコピー
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                    onClick={(e) => { e.stopPropagation(); setQrStudent(student); }}
                  >
                    📱 QRコード
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                    onClick={() => viewStudentWords(student)}
                  >
                    📖 単語帳
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </>
        )}
      </div>

      {/* QR Code Modal */}
      {qrStudent && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={() => setQrStudent(null)}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {qrStudent.name} のQRコード
            </h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              このQRコードを生徒に配布してください
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <img
                src={getQrImageUrl(getStudentUrl(qrStudent.token))}
                alt={`QR Code for ${qrStudent.name}`}
                width={250}
                height={250}
                style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
              />
            </div>
            <p className="text-muted" style={{ fontSize: '0.7rem', wordBreak: 'break-all', marginBottom: '1rem' }}>
              {getStudentUrl(qrStudent.token)}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = getQrImageUrl(getStudentUrl(qrStudent.token));
                  link.download = `QR_${qrStudent.name}.png`;
                  link.click();
                }}
              >
                💾 画像保存
              </button>
              <button className="btn btn-secondary" onClick={() => setQrStudent(null)}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Word Detail Modal */}
      {selectedStudent && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={() => setSelectedStudent(null)}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <h2 className="title-2" style={{ margin: 0 }}>{selectedStudent.name} の単語帳</h2>
              <button className="btn btn-secondary" onClick={() => setSelectedStudent(null)}>✕</button>
            </div>
            {wordsLoading ? (
              <p className="text-muted">読み込み中...</p>
            ) : studentWords.length === 0 ? (
              <p className="text-muted">まだ単語が登録されていません。</p>
            ) : (
              <div>
                <p className="text-muted" style={{ marginBottom: '0.75rem' }}>登録数: {studentWords.length}語</p>
                {studentWords.map(word => (
                  <div key={word.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div className="flex justify-between items-center">
                      <span style={{ fontWeight: '600' }}>{word.english}</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {word.correct_count}✓ / {word.wrong_count}✗
                      </span>
                    </div>
                    <div className="flex gap-2" style={{ marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      {word.meanings?.map((m, i) => (
                        <span key={i} className="badge badge-green">{m}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
