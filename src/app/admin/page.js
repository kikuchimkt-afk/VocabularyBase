'use client';

import { useState, useEffect } from 'react';
import TeacherWordRegister from './TeacherWordRegister';
import ManualModal from './ManualModal';
import * as XLSX from 'xlsx';

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

  // メモ
  const [notesStudent, setNotesStudent] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);

  // 生徒編集
  const [editStudent, setEditStudent] = useState(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // 単語編集
  const [editWord, setEditWord] = useState(null);
  const [editWordData, setEditWordData] = useState({ english: '', meanings: '', example: '', exampleJa: '' });
  const [editWordLoading, setEditWordLoading] = useState(false);
  const [generatingWordId, setGeneratingWordId] = useState(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [selectedWordIds, setSelectedWordIds] = useState(new Set());
  const [deletingWords, setDeletingWords] = useState(false);
  const [dateFilter, setDateFilter] = useState('all'); // 'all' or 'YYYY-MM-DD'
  
  // 検索
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');

  // 達成率詳細ポップアップ
  const [achieveStudent, setAchieveStudent] = useState(null);
  const [achieveWords, setAchieveWords] = useState([]);
  const [achieveLoading, setAchieveLoading] = useState(false);

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
    // 全角→半角変換、スペース除去
    let g = grade.toString().trim()
      .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
      .replace(/\s+/g, '')
      .replace(/年$/, '')
      .replace(/年生$/, '')
      .replace(/校/g, '');
    // 高3, 高校3, 中2, 中学2, 小5, 小学5 などに対応
    const match = g.match(/^(高|中|小)?\s*(\d+)$/);
    if (!match) return 0;
    const prefix = match[1] || '';
    const num = parseInt(match[2]) || 0;
    if (prefix === '高') return 12 + num;
    if (prefix === '中') return 6 + num;
    if (prefix === '小') return num;
    // プレフィックスなし: 数字が大きければそのまま
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

        {/* 検索バー */}
        {students.length > 0 && (
          <div style={{ position: 'relative', marginBottom: '1.25rem', maxWidth: '350px' }}>
            <input
              className="input-text"
              type="text"
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              placeholder="🔍 名前・学年で検索..."
              style={{ width: '100%', paddingRight: '2.5rem' }}
            />
            {studentSearchQuery && (
              <button
                onClick={() => setStudentSearchQuery('')}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* 学年フィルター */}
        {students.length > 0 && (() => {
          const grades = [...new Set(students.map(s => s.grade).filter(Boolean))]
            .sort((a, b) => gradeToNumber(b) - gradeToNumber(a));
          if (grades.length <= 1) return null;
          return (
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <button
                onClick={() => setGradeFilter('all')}
                style={{
                  padding: '0.25rem 0.6rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                  border: gradeFilter === 'all' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: gradeFilter === 'all' ? 'var(--primary)' : 'var(--bg-card)',
                  color: gradeFilter === 'all' ? 'white' : 'var(--text-muted)', cursor: 'pointer',
                }}
              >全て ({students.length})</button>
              {grades.map(g => {
                const cnt = students.filter(s => s.grade === g).length;
                return (
                  <button
                    key={g}
                    onClick={() => setGradeFilter(gradeFilter === g ? 'all' : g)}
                    style={{
                      padding: '0.25rem 0.6rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                      border: gradeFilter === g ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: gradeFilter === g ? 'var(--primary)' : 'var(--bg-card)',
                      color: gradeFilter === g ? 'white' : 'var(--text-muted)', cursor: 'pointer',
                    }}
                  >{g} ({cnt})</button>
                );
              })}
            </div>
          );
        })()}

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
          (() => {
            const filteredStudents = students.filter(s => {
              if (gradeFilter !== 'all' && s.grade !== gradeFilter) return false;
              if (!studentSearchQuery.trim()) return true;
              const q = studentSearchQuery.toLowerCase();
              const name = (s.name || '').toLowerCase();
              const grade = (s.grade || '').toLowerCase();
              return name.includes(q) || grade.includes(q);
            });
            return (
              <>
                {studentSearchQuery && filteredStudents.length === 0 && (
                  <p className="text-muted" style={{ textAlign: 'center', padding: '1rem' }}>一致する生徒が見つかりません。</p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
                  {filteredStudents.map(student => (
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
                    <p style={{ fontWeight: '700', color: 'var(--secondary)' }}>
                      {student.accuracy !== null ? `${student.accuracy}%` : '—'}
                    </p>
                    {student.quiz_total > 0 && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        ({student.quiz_correct}/{student.quiz_total}問)
                      </span>
                    )}
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
                  <button className="action-btn ghost" onClick={() => { setNotesStudent(student); setNotesText(student.notes || ''); }}>
                    📝 メモ
                  </button>
                  <button className="action-btn ghost" onClick={async () => {
                    setAchieveStudent(student);
                    setAchieveLoading(true);
                    try {
                      const res = await fetch(`/api/students/words?studentId=${student.id}`);
                      if (!res.ok) throw new Error('Fetch failed');
                      const data = await res.json();
                      setAchieveWords(data.words || []);
                    } catch { setAchieveWords([]); }
                    finally { setAchieveLoading(false); }
                  }}>
                    📊 達成率
                  </button>
                </div>
              </div>
            ))}
          </div>
              </>
            );
          })()
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
        <div className="modal-overlay" onClick={() => { setSelectedStudent(null); setSelectedWordIds(new Set()); }}>
          <div className="modal-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>{selectedStudent.name} の単語帳</h2>
              <button className="btn btn-secondary" onClick={() => { setSelectedStudent(null); setSelectedWordIds(new Set()); }}>✕</button>
            </div>
            {wordsLoading ? (
              <p className="text-muted">読み込み中...</p>
            ) : studentWords.length === 0 ? (
              <p className="text-muted">まだ単語が登録されていません。</p>
            ) : (
              <div>
                {(() => {
                  // 登録日+講師名リストを生成
                  const dateTeacherMap = new Map();
                  studentWords.forEach(w => {
                    const d = w.assigned_date || '未設定';
                    const tn = w.teacher_name || '';
                    const key = `${d}::${tn}`;
                    if (!dateTeacherMap.has(key)) dateTeacherMap.set(key, { date: d, teacher: tn, count: 0 });
                    dateTeacherMap.get(key).count++;
                  });
                  const dateTeachers = [...dateTeacherMap.values()].sort((a, b) => {
                    const dc = b.date.localeCompare(a.date); if (dc !== 0) return dc;
                    return a.teacher.localeCompare(b.teacher);
                  });
                  const teacherColors = (() => {
                    const colors = ['#e65100', '#6366f1', '#0891b2', '#059669', '#d946ef', '#ea580c', '#2563eb', '#dc2626'];
                    const names = [...new Set(studentWords.filter(w => w.teacher_name).map(w => w.teacher_name))];
                    const map = {}; names.forEach((n, i) => { map[n] = colors[i % colors.length]; }); return map;
                  })();
                  const filteredWords = dateFilter === 'all'
                    ? studentWords
                    : (() => {
                        const parts = dateFilter.split('::');
                        const date = parts[0]; const teacher = parts.length > 1 ? parts[1] : null;
                        return studentWords.filter(w => {
                          if ((w.assigned_date || '未設定') !== date) return false;
                          if (teacher !== null && (w.teacher_name || '') !== teacher) return false;
                          return true;
                        });
                      })();
                  const filteredCount = filteredWords.length;

                  return (<>
                <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <p className="text-muted" style={{ margin: 0 }}>全{studentWords.length}語{dateFilter !== 'all' ? ` / 表示: ${filteredCount}語` : ''}</p>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {filteredWords.some(w => !w.example_sentence) && (
                      <button className="action-btn ghost" style={{ color: 'var(--primary)', fontWeight: '600' }}
                        disabled={bulkGenerating}
                        onClick={async () => {
                          const missing = filteredWords.filter(w => !w.example_sentence);
                          if (!confirm(`例文がない${missing.length}語の例文を自動生成しますか？\n（1語ずつ2秒間隔で処理）`)) return;
                          setBulkGenerating(true);
                          let updated = [...studentWords];
                          let done = 0;
                          for (const word of missing) {
                            if (done > 0) await new Promise(r => setTimeout(r, 2000));
                            try {
                              setGeneratingWordId(word.id);
                              const res = await fetch('/api/students/words/generate', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ wordId: word.id }),
                              });
                              if (res.ok) {
                                const data = await res.json();
                                updated = updated.map(w => w.id === word.id ? data.word : w);
                                setStudentWords([...updated]);
                              }
                            } catch {}
                            done++;
                          }
                          setGeneratingWordId(null);
                          setBulkGenerating(false);
                          alert(`${done}語の例文生成が完了しました`);
                        }}
                      >{bulkGenerating ? '⏳ 生成中...' : '🔄 例文一括生成'}</button>
                    )}
                    <button className="action-btn ghost" onClick={() => {
                      const rows = filteredWords.map(w => ({
                        英単語: w.english,
                        意味: (w.meanings || []).join('、'),
                        例文: w.example_sentence || '',
                        例文訳: w.example_sentence_ja || '',
                        登録日: w.assigned_date || '',
                        正解数: w.correct_count || 0,
                        不正解数: w.wrong_count || 0,
                      }));
                      const header = '英単語,意味,例文,例文訳,登録日,正解数,不正解数';
                      const csv = '\uFEFF' + header + '\n' + rows.map(r =>
                        [r.英単語, r.意味, r.例文, r.例文訳, r.登録日, r.正解数, r.不正解数].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
                      ).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${selectedStudent.name}_単語帳.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}>📥 CSV</button>
                    <button className="action-btn ghost" onClick={() => {
                      const rows = filteredWords.map(w => ({
                        英単語: w.english,
                        意味: (w.meanings || []).join('、'),
                        例文: w.example_sentence || '',
                        例文訳: w.example_sentence_ja || '',
                        登録日: w.assigned_date || '',
                        正解数: w.correct_count || 0,
                        不正解数: w.wrong_count || 0,
                      }));
                      const ws = XLSX.utils.json_to_sheet(rows);
                      ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 40 }, { wch: 40 }, { wch: 12 }, { wch: 8 }, { wch: 8 }];
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, '単語帳');
                      XLSX.writeFile(wb, `${selectedStudent.name}_単語帳.xlsx`);
                    }}>📥 Excel</button>
                  </div>
                </div>

                {/* 登録日フィルター */}
                {dateTeachers.length > 1 && (
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <button
                      className={`btn ${dateFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '20px' }}
                      onClick={() => { setDateFilter('all'); setSelectedWordIds(new Set()); }}
                    >すべて ({studentWords.length})</button>
                    {dateTeachers.map(({ date, teacher, count }) => {
                      const filterKey = `${date}::${teacher}`;
                      const label = date === '未設定' ? '未設定' : date.replace(/^\d{4}-/, '');
                      const color = teacher ? (teacherColors[teacher] || '#e65100') : 'var(--primary)';
                      return (
                        <button key={filterKey}
                          className={`btn ${dateFilter === filterKey ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '20px',
                            background: dateFilter === filterKey ? color : undefined,
                            borderColor: dateFilter === filterKey ? color : undefined,
                            color: dateFilter === filterKey ? 'white' : undefined,
                          }}
                          onClick={() => { setDateFilter(filterKey); setSelectedWordIds(new Set()); }}
                        >{'\u{1F4C5}'} {label}{teacher ? ` ${teacher}` : ''} ({count})</button>
                      );
                    })}
                  </div>
                )}

                {/* 選択・削除バー */}
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input type="checkbox"
                      checked={selectedWordIds.size === filteredCount && filteredCount > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedWordIds(new Set(filteredWords.map(w => w.id)));
                        } else {
                          setSelectedWordIds(new Set());
                        }
                      }}
                      style={{ width: 14, height: 14, accentColor: 'var(--primary)' }}
                    /> 表示中を全選択
                  </label>
                  {selectedWordIds.size > 0 && (
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      disabled={deletingWords}
                      onClick={async () => {
                        if (!confirm(`${selectedWordIds.size}語を削除しますか？\n生徒のテスト・単語帳からも削除されます。`)) return;
                        setDeletingWords(true);
                        try {
                          const res = await fetch(`/api/students/words?ids=${[...selectedWordIds].join(',')}`, {
                            method: 'DELETE',
                          });
                          if (!res.ok) throw new Error('Delete failed');
                          setStudentWords(studentWords.filter(w => !selectedWordIds.has(w.id)));
                          setSelectedWordIds(new Set());
                        } catch (e) {
                          console.error(e);
                          alert('削除に失敗しました');
                        } finally {
                          setDeletingWords(false);
                        }
                      }}
                    >{deletingWords ? '削除中...' : `🗑️ ${selectedWordIds.size}語を削除`}</button>
                  )}
                </div>
                {filteredWords.map(word => (
                  <div key={word.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <input type="checkbox"
                      checked={selectedWordIds.has(word.id)}
                      onChange={(e) => {
                        const next = new Set(selectedWordIds);
                        if (e.target.checked) next.add(word.id); else next.delete(word.id);
                        setSelectedWordIds(next);
                      }}
                      style={{ width: 14, height: 14, marginTop: '0.2rem', accentColor: 'var(--primary)', flexShrink: 0, cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                    {editWord?.id === word.id ? (
                      /* --- 編集モード --- */
                      <div style={{ background: 'var(--secondary-light)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                        <div className="input-group" style={{ marginBottom: '0.5rem' }}>
                          <label className="input-label" style={{ fontSize: '0.7rem' }}>英単語</label>
                          <input className="input-text" value={editWordData.english}
                            onChange={e => setEditWordData({ ...editWordData, english: e.target.value })}
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} />
                        </div>
                        <div className="input-group" style={{ marginBottom: '0.5rem' }}>
                          <label className="input-label" style={{ fontSize: '0.7rem' }}>意味（カンマ区切り）</label>
                          <input className="input-text" value={editWordData.meanings}
                            onChange={e => setEditWordData({ ...editWordData, meanings: e.target.value })}
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} />
                        </div>
                        <div className="input-group" style={{ marginBottom: '0.5rem' }}>
                          <label className="input-label" style={{ fontSize: '0.7rem' }}>例文（英語）</label>
                          <input className="input-text" value={editWordData.example}
                            onChange={e => setEditWordData({ ...editWordData, example: e.target.value })}
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} />
                        </div>
                        <div className="input-group" style={{ marginBottom: '0.5rem' }}>
                          <label className="input-label" style={{ fontSize: '0.7rem' }}>例文（日本語訳）</label>
                          <input className="input-text" value={editWordData.exampleJa}
                            onChange={e => setEditWordData({ ...editWordData, exampleJa: e.target.value })}
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => setEditWord(null)}>キャンセル</button>
                          <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                            disabled={editWordLoading || !editWordData.english.trim()}
                            onClick={async () => {
                              setEditWordLoading(true);
                              try {
                                const newMeanings = editWordData.meanings.split(/[,、，]/).map(m => m.trim()).filter(Boolean);
                                const res = await fetch('/api/students/words', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    id: word.id,
                                    english: editWordData.english.trim(),
                                    meanings: newMeanings,
                                    example_sentence: editWordData.example.trim(),
                                    example_sentence_ja: editWordData.exampleJa.trim(),
                                  }),
                                });
                                if (!res.ok) throw new Error('Update failed');
                                const data = await res.json();
                                setStudentWords(studentWords.map(w => w.id === word.id ? data.word : w));
                                setEditWord(null);
                              } catch (e) {
                                console.error(e);
                                alert('更新に失敗しました');
                              } finally {
                                setEditWordLoading(false);
                              }
                            }}
                          >{editWordLoading ? '保存中...' : '💾 保存'}</button>
                        </div>
                      </div>
                    ) : (
                      /* --- 表示モード --- */
                      <>
                        <div className="flex justify-between items-center">
                          <span style={{ fontWeight: '600' }}>{word.english}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {word.correct_count}✓ / {word.wrong_count}✗
                            </span>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '0.15rem' }}
                              title="編集" onClick={() => {
                                setEditWord(word);
                                setEditWordData({
                                  english: word.english || '',
                                  meanings: (word.meanings || []).join('、'),
                                  example: word.example_sentence || '',
                                  exampleJa: word.example_sentence_ja || '',
                                });
                              }}>✏️</button>
                          </div>
                        </div>
                        <div className="flex gap-2" style={{ marginTop: '0.25rem', flexWrap: 'wrap' }}>
                          {word.meanings?.map((m, i) => (
                            <span key={i} className="badge badge-green">{m}</span>
                          ))}
                        </div>
                        {word.example_sentence && (
                          <div style={{ marginTop: '0.35rem', fontSize: '0.8rem' }} className="text-muted">
                            📝 {word.example_sentence}
                          </div>
                        )}
                        {!word.example_sentence && (
                          <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>⚠️ 例文なし</span>
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '20px' }}
                              disabled={generatingWordId === word.id}
                              onClick={async () => {
                                setGeneratingWordId(word.id);
                                try {
                                  const res = await fetch('/api/students/words/generate', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ wordId: word.id }),
                                  });
                                  if (!res.ok) {
                                    const err = await res.json();
                                    throw new Error(err.error || 'Failed');
                                  }
                                  const data = await res.json();
                                  setStudentWords(studentWords.map(w => w.id === word.id ? data.word : w));
                                } catch (e) {
                                  console.error(e);
                                  alert(`生成失敗: ${e.message}`);
                                } finally {
                                  setGeneratingWordId(null);
                                }
                              }}
                            >
                              {generatingWordId === word.id ? '⏳ 生成中...' : '🔄 生成'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    </div>{/* flex:1 wrapper end */}
                  </div>
                ))}
                </>); /* IIFE end */
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* メモモーダル */}
      {notesStudent && (
        <div className="modal-overlay" onClick={() => setNotesStudent(null)}>
          <div className="modal-card" style={{ maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>📝 {notesStudent.name} のメモ</h2>
              <button className="btn btn-ghost" onClick={() => setNotesStudent(null)} style={{ fontSize: '1.2rem', padding: '0.25rem 0.5rem' }}>✕</button>
            </div>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="登録履歴やメモを入力..."
              rows={8}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', fontSize: '0.9rem',
                fontFamily: 'inherit', resize: 'vertical', marginBottom: '1rem',
                background: 'var(--bg-page)', color: 'var(--text-main)',
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setNotesStudent(null)} style={{ padding: '0.5rem 1rem' }}>
                キャンセル
              </button>
              <button
                className="btn btn-primary"
                disabled={notesSaving}
                style={{ padding: '0.5rem 1.5rem' }}
                onClick={async () => {
                  setNotesSaving(true);
                  try {
                    const res = await fetch('/api/students', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: notesStudent.id, name: notesStudent.name, grade: notesStudent.grade, notes: notesText }),
                    });
                    if (res.ok) {
                      setStudents(prev => prev.map(s =>
                        s.id === notesStudent.id ? { ...s, notes: notesText } : s
                      ));
                      setNotesStudent(null);
                    } else {
                      alert('保存に失敗しました');
                    }
                  } catch {
                    alert('保存に失敗しました');
                  } finally {
                    setNotesSaving(false);
                  }
                }}
              >
                {notesSaving ? '保存中...' : '💾 保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 達成率詳細モーダル */}
      {achieveStudent && (
        <div className="modal-overlay" onClick={() => setAchieveStudent(null)}>
          <div className="modal-card" style={{ maxWidth: '500px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>📊 {achieveStudent.name} の達成率</h2>
              <button className="btn btn-ghost" onClick={() => setAchieveStudent(null)} style={{ fontSize: '1.2rem', padding: '0.25rem 0.5rem' }}>✕</button>
            </div>
            {achieveLoading ? (
              <p className="text-muted">読み込み中...</p>
            ) : achieveWords.length === 0 ? (
              <p className="text-muted">単語が登録されていません。</p>
            ) : (() => {
              const MIN_QUESTIONS_FOR_STUDIED = 10; // 10問以上回答で「学習済み」と判定
              const isMastered = w => (w.correct_count || 0) > (w.wrong_count || 0);
              const isTested = w => ((w.correct_count || 0) + (w.wrong_count || 0)) > 0;
              const totalAll = achieveWords.length;
              const masteredAll = achieveWords.filter(isMastered).length;
              const testedAll = achieveWords.filter(isTested).length;
              const pctAll = totalAll > 0 ? Math.round(masteredAll / totalAll * 100) : 0;

              // 全体の最終学習日・初回学習日
              let globalLastTested = null;
              let globalFirstTested = null;
              achieveWords.forEach(w => {
                if (w.last_tested && (!globalLastTested || w.last_tested > globalLastTested)) {
                  globalLastTested = w.last_tested;
                }
                if (w.first_tested && (!globalFirstTested || w.first_tested < globalFirstTested)) {
                  globalFirstTested = w.first_tested;
                }
              });

              // 日付+講師名ごとに集計
              const dateTeacherMap2 = {};
              achieveWords.forEach(w => {
                const d = w.assigned_date || '未設定';
                const tn = w.teacher_name || '';
                const key = `${d}::${tn}`;
                if (!dateTeacherMap2[key]) dateTeacherMap2[key] = { date: d, teacher: tn, total: 0, mastered: 0, tested: 0, lastTested: null, firstTested: null };
                dateTeacherMap2[key].total++;
                if (isMastered(w)) dateTeacherMap2[key].mastered++;
                if (isTested(w)) dateTeacherMap2[key].tested++;
                if (w.last_tested && (!dateTeacherMap2[key].lastTested || w.last_tested > dateTeacherMap2[key].lastTested)) {
                  dateTeacherMap2[key].lastTested = w.last_tested;
                }
                if (w.first_tested && (!dateTeacherMap2[key].firstTested || w.first_tested < dateTeacherMap2[key].firstTested)) {
                  dateTeacherMap2[key].firstTested = w.first_tested;
                }
              });
              const dtKeys = Object.keys(dateTeacherMap2).sort((a, b) => b.localeCompare(a));
              const achieveTeacherColors = (() => {
                const colors = ['#e65100', '#6366f1', '#0891b2', '#059669', '#d946ef', '#ea580c', '#2563eb', '#dc2626'];
                const names = [...new Set(achieveWords.filter(w => w.teacher_name).map(w => w.teacher_name))];
                const map = {}; names.forEach((n, i) => { map[n] = colors[i % colors.length]; }); return map;
              })();

              const barColor = pct => pct >= 80 ? 'var(--secondary)' : pct >= 50 ? '#f59e0b' : 'var(--danger)';
              const isStudied = tested => tested >= MIN_QUESTIONS_FOR_STUDIED;

              return (
                <>
                  {/* 全体サマリー */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gap: '0.5rem', marginBottom: '0.75rem',
                    background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', padding: '0.75rem',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{totalAll}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>全単語</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>{testedAll}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>テスト済</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>{masteredAll}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>覚えた</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: barColor(pctAll) }}>{pctAll}%</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>達成率</div>
                    </div>
                  </div>

                  {/* 全体の学習日情報 */}
                  {(globalFirstTested || globalLastTested) && (
                    <div style={{
                      display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem',
                      color: 'var(--text-muted)', marginBottom: '1.25rem', flexWrap: 'wrap',
                    }}>
                      {globalFirstTested && (
                        <span>🟢 初回学習日: {(() => { const dt = new Date(globalFirstTested); return `${dt.getFullYear()}/${dt.getMonth()+1}/${dt.getDate()}`; })()}</span>
                      )}
                      {globalLastTested && (
                        <span>📝 最終学習日: {(() => { const dt = new Date(globalLastTested); return `${dt.getFullYear()}/${dt.getMonth()+1}/${dt.getDate()}`; })()}</span>
                      )}
                    </div>
                  )}

                  {/* 日付ごとの詳細 */}
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>📅 宿題日ごとの達成率</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {dtKeys.map(key => {
                      const info = dateTeacherMap2[key];
                      const pct = info.total > 0 ? Math.round(info.mastered / info.total * 100) : 0;
                      const studied = isStudied(info.tested);
                      const dateLabel = info.date === '未設定' ? '未設定' : (() => {
                        const dt = new Date(info.date + 'T00:00:00');
                        return `${dt.getMonth() + 1}/${dt.getDate()}`;
                      })();
                      const tColor = info.teacher ? (achieveTeacherColors[info.teacher] || '#e65100') : 'var(--primary)';
                      return (
                        <div key={key} style={{
                          background: 'var(--bg-card)', border: `1px solid ${studied ? 'var(--secondary)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-md)', padding: '0.6rem 0.75rem',
                          borderLeft: info.teacher ? `3px solid ${tColor}` : undefined,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{'\u{1F4C5}'} {dateLabel}{info.teacher ? ` ${info.teacher}` : ''}</span>
                              {studied ? (
                                <span style={{
                                  fontSize: '0.6rem', fontWeight: 700, color: 'white',
                                  background: 'var(--secondary)', padding: '1px 6px', borderRadius: 8,
                                }}>✅ 学習済み</span>
                              ) : info.tested > 0 ? (
                                <span style={{
                                  fontSize: '0.6rem', fontWeight: 700, color: '#f59e0b',
                                  background: '#fef3c7', padding: '1px 6px', borderRadius: 8,
                                  border: '1px solid #fde68a',
                                }}>学習中 ({info.tested}/{MIN_QUESTIONS_FOR_STUDIED}問)</span>
                              ) : null}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {info.mastered}/{info.total}語
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden',
                            }}>
                              <div style={{
                                height: '100%', width: `${pct}%`, borderRadius: 4,
                                background: barColor(pct), transition: 'width 0.5s ease',
                              }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: barColor(pct), minWidth: '36px', textAlign: 'right' }}>
                              {pct}%
                            </span>
                          </div>
                          {(info.firstTested || info.lastTested) && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              {info.firstTested && (
                                <span>🟢 初回: {(() => { const dt = new Date(info.firstTested); return `${dt.getMonth()+1}/${dt.getDate()}`; })()}</span>
                              )}
                              {info.lastTested && (
                                <span>📝 最終: {(() => { const dt = new Date(info.lastTested); return `${dt.getMonth()+1}/${dt.getDate()}`; })()}</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setAchieveStudent(null)}>閉じる</button>
            </div>
          </div>
        </div>
      )}

      {/* マニュアルモーダル */}
      {showManual && <ManualModal onClose={() => setShowManual(false)} />}
    </div>
  );
}
