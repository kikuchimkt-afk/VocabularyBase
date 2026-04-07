'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // PWAスタンドアロンモード（ホーム画面から開いた場合）のみリダイレクト
    // 動的マニフェストにより start_url が /s/[token] に設定されるので
    // 通常はこのページに到達しないが、フォールバックとして残す
    try {
      const isPWA = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;
      if (isPWA) {
        const token = localStorage.getItem('vb_student_token');
        if (token) {
          router.replace(`/s/${token}`);
          return;
        }
      }
    } catch {}
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: '600' }}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
        📚 VocabularyBase
      </h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '500px', marginBottom: '3rem', lineHeight: '1.8' }}>
        AIが日本語訳と例文を自動生成。<br/>
        高品位な音声付きの、あなただけの英単語帳。
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/admin" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.875rem 2rem', borderRadius: '0.5rem',
          backgroundColor: 'white', color: '#4f46e5',
          fontWeight: '600', fontSize: '1rem',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
        }}>
          🏫 講師ダッシュボード
        </Link>
      </div>
      
      <p style={{ marginTop: '4rem', fontSize: '0.8rem', opacity: 0.6 }}>
        生徒の方は、講師から配布されたURLまたはQRコードからアクセスしてください。
      </p>
    </div>
  );
}
