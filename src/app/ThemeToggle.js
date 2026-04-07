'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    const saved = localStorage.getItem('vb-theme');
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    }
  }, []);

  const applyTheme = (mode) => {
    const root = document.documentElement;
    if (mode === 'light') {
      root.setAttribute('data-theme', 'light');
    } else if (mode === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  };

  const cycleTheme = () => {
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
    applyTheme(next);
    localStorage.setItem('vb-theme', next);
  };

  const icon = theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻';
  const label = theme === 'light' ? 'ライト' : theme === 'dark' ? 'ダーク' : '自動';

  return (
    <button
      onClick={cycleTheme}
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 9999,
        padding: '0.5rem 0.75rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-main)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
      }}
      title={`テーマ: ${label}`}
    >
      {icon} {label}
    </button>
  );
}
