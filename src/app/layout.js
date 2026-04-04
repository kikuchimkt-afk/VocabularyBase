import './globals.css';
import ThemeToggle from './ThemeToggle';

export const metadata = {
  title: 'VocabularyBase - 生徒個別英単語帳',
  description: 'AIを活用して自分だけの英単語帳を作れる学習アプリ',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  themeColor: '#6366f1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VocabBase',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <main>
          {children}
        </main>
        <ThemeToggle />
      </body>
    </html>
  );
}
