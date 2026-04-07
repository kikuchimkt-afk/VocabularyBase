'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function StudentManifestInjector() {
  const pathname = usePathname();

  useEffect(() => {
    // /s/[token] からトークンを抽出
    const match = pathname.match(/^\/s\/([a-zA-Z0-9]+)/);
    if (!match) return;
    const token = match[1];

    // 既存のmanifestリンクを動的マニフェストに差し替え
    const existingLink = document.querySelector('link[rel="manifest"]');
    if (existingLink) {
      existingLink.setAttribute('href', `/api/manifest?token=${token}`);
    } else {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = `/api/manifest?token=${token}`;
      document.head.appendChild(link);
    }
  }, [pathname]);

  return null;
}
