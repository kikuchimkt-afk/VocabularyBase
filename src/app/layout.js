import './globals.css';
import ThemeToggle from './ThemeToggle';

export const metadata = {
  title: 'VocabularyBase - 生徒個別英単語帳',
  description: 'AIを活用して自分だけの英単語帳を作れる学習アプリ',
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
