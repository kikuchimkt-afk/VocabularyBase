'use client';

import { useState, useEffect } from 'react';
import TeacherWordRegister from './TeacherWordRegister';
import ManualModal from './ManualModal';

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
  const [activeTab, setActiveTab] = useState('students');

  // Excel一括登録
  const [showImport, setShowImport] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResults, setImportResults] = useState(null);

  // マニュアル
  const [showManual, setShowManual] = useState(false);

  // 生徒編集
  const [editStudent, setEditStudent] = useState(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editLoading, setEditLoading] = useState(false);

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

  const updateStudent = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editStudent) return;
    setEditLoading(true);
    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editStudent.id, name: editName.trim(), grade: editGrade.trim() }),
      });
      if (!res.ok) throw new Error('Update failed');
      setEditStudent(null);
      fetchStudents();
    } catch (e) {
      console.error(e);
      alert('更新に失敗しました。');
    } finally {
      setEditLoading(false);
    }
  };

  const openEditModal = (student) => {
    setEditStudent(student);
    setEditName(student.name);
    setEditGrade(student.grade || '');
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
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #a855f7 80%, #ec4899 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', filter: 'blur(50px)' }} />

        <div style={{
          width: '100%', maxWidth: '420px', padding: '2.5rem',
          background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)', borderRadius: '1.25rem',
          boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' }}>
              📚 VocabularyBase
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: '0.25rem' }}>講師ダッシュボード</p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                autoFocus
                style={{
                  width: '100%', padding: '0.75rem 1rem', fontSize: '1rem',
                  border: '1px solid rgba(255,255,255,0.25)', borderRadius: '0.75rem',
                  background: 'rgba(255,255,255,0.1)', color: 'white',
                  outline: 'none', transition: '0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.25)'}
              />
            </div>
            {loginError && (
              <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: '600',
                background: 'rgba(255,255,255,0.2)', color: 'white',
                border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0.75rem',
                cursor: 'pointer', transition: '0.2s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.2)'; }}
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
      <header style={{
        background: 'var(--header-gradient)', color: 'white', padding: '1.25rem 0',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div className="container">
          <div className="flex justify-between items-center">
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>📚 VocabularyBase</h1>
              <p style={{ opacity: 0.7, fontSize: '0.8rem' }}>講師ダッシュボード</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button style={{ color: 'white', opacity: 0.8, fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontFamily: 'inherit', border: 'none', cursor: 'pointer', transition: '0.2s' }} onClick={() => setShowManual(true)}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >📖 マニュアル</button>
              <button style={{ color: 'white', opacity: 0.8, fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontFamily: 'inherit', border: 'none', cursor: 'pointer', transition: '0.2s' }} onClick={() => setIsLoggedIn(false)}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >ログアウト</button>
            </div>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        {/* Tab Navigation */}
        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          <button
            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >👥 生徒管理</button>
          <button
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >📝 単語配信</button>
        </div>

        {activeTab === 'register' ? (
          <TeacherWordRegister students={students} onRegistered={fetchStudents} />
        ) : (
        <>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="stat-card purple">
            <p className="stat-label">生徒数</p>
            <p className="stat-value purple">{students.length}</p>
          </div>
          <div className="stat-card green">
            <p className="stat-label">総登録単語数</p>
            <p className="stat-value green">{totalWords}</p>
          </div>
          <div className="stat-card orange">
            <p className="stat-label">アクティブ生徒</p>
            <p className="stat-value orange">{activeStudents}/{students.length}</p>
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
              <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                📤 ファイルを選択
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} style={{ display: 'none' }} disabled={importLoading} />
              </label>
              <button className="btn btn-outline" onClick={downloadSample}>📥 サンプル</button>
              <button className="btn btn-secondary" onClick={() => { setShowImport(false); setImportResults(null); }}>閉じる</button>
            </div>
            {importLoading && <p style={{ marginTop: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>📤 インポート中...</p>}
            {importResults && (
              <div style={{ marginTop: '1rem' }}>
                {importResults.error ? (
                  <p style={{ color: 'var(--danger)', fontWeight: '600' }}>❌ {importResults.error}</p>
                ) : (
                  <p style={{ fontWeight: '600', color: 'var(--secondary)' }}>
                    ✅ {importResults.summary.success}名登録完了
                    {importResults.summary.skip > 0 && ` / ${importResults.summary.skip}件スキップ`}
                    {importResults.summary.error > 0 && ` / ${importResults.summary.error}件エラー`}
                  </p>
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
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>キャンセル</button>
                </div>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>読み込み中...</p>
        ) : students.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="text-muted">まだ生徒が登録されていません。<br/>「＋ 生徒を追加」ボタンから追加してください。</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
            {students.map(student => (
              <div key={student.id} className="card" style={{ padding: '1.25rem' }}>
                {/* Name */}
                <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: '600', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</p>
                    {student.grade && <span className="badge badge-blue">{student.grade}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'none', color: 'var(--text-muted)', transition: '0.2s' }}
                      onClick={() => openEditModal(student)}
                      onMouseEnter={e => { e.target.style.color = 'var(--primary)'; e.target.style.background = 'var(--primary-light)'; }}
                      onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.background = 'none'; }}
                    >✏️ 編集</button>
                    <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'none', color: 'var(--text-muted)', transition: '0.2s' }}
                      onClick={() => deleteStudent(student.id, student.name)}
                      onMouseEnter={e => { e.target.style.color = 'var(--danger)'; e.target.style.background = 'var(--danger-light)'; }}
                      onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.background = 'none'; }}
                    >🗑️</button>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.75rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>登録語数</span>
                    <p style={{ fontWeight: '700', color: 'var(--primary)' }}>{student.word_count || 0}語</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>正答率</span>
                    <p style={{ fontWeight: '700', color: 'var(--secondary)' }}>{student.accuracy !== null ? `${student.accuracy}%` : '—'}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="action-row">
                  <a href={getStudentUrl(student.token)} target="_blank" rel="noopener noreferrer" className="action-btn primary">
                    🔗 開く
                  </a>
                  <button className="action-btn ghost" onClick={() => copyToClipboard(getStudentUrl(student.token))}>
                    📋 URL
                  </button>
                  <button className="action-btn ghost" onClick={() => setQrStudent(student)}>
                    📱 QR
                  </button>
                  <button className="action-btn ghost" onClick={() => viewStudentWords(student)}>
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

      {/* Edit Student Modal */}
      {editStudent && (
        <div className="modal-overlay" onClick={() => setEditStudent(null)}>
          <div className="modal-card" style={{ maxWidth: '440px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>✏️ 生徒情報の編集</h2>
              <button className="btn btn-ghost" onClick={() => setEditStudent(null)} style={{ fontSize: '1.2rem', padding: '0.25rem 0.5rem' }}>✕</button>
            </div>
            <form onSubmit={updateStudent}>
              <div className="input-group">
                <label className="input-label">名前</label>
                <input className="input-text" value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
              </div>
              <div className="input-group">
                <label className="input-label">学年</label>
                <input className="input-text" value={editGrade} onChange={e => setEditGrade(e.target.value)} placeholder="例: 中2, 高1" />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditStudent(null)}>キャンセル</button>
                <button type="submit" className="btn btn-primary" disabled={editLoading || !editName.trim()}>
                  {editLoading ? '保存中...' : '💾 保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrStudent && (
        <div className="modal-overlay" onClick={() => setQrStudent(null)}>
          <div className="modal-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
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
                width={240}
                height={240}
                style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}
              />
            </div>
            <p className="text-muted" style={{ fontSize: '0.7rem', wordBreak: 'break-all', marginBottom: '1rem' }}>
              {getStudentUrl(qrStudent.token)}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => {
                const link = document.createElement('a');
                link.href = getQrImageUrl(getStudentUrl(qrStudent.token));
                link.download = `QR_${qrStudent.name}.png`;
                link.click();
              }}>💾 画像保存</button>
              <button className="btn btn-secondary" onClick={() => setQrStudent(null)}>閉じる</button>
            </div>
          </div>
        </div>
      )}

      {/* Word Detail Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>{selectedStudent.name} の単語帳</h2>
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

      {/* マニュアルモーダル */}
      {showManual && <ManualModal onClose={() => setShowManual(false)} />}
    </div>
  );
}
