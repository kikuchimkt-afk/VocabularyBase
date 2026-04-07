import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || '';

  const manifest = {
    name: 'VocabularyBase',
    short_name: 'VocabBase',
    description: '生徒個別英単語帳',
    start_url: token ? `/s/${token}` : '/',
    display: 'standalone',
    background_color: '#e8e5ff',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}
