import './globals.css';

export const metadata = {
  title: 'VocabularyBase - 生徒個別英単語帳',
  description: 'AIを活用して自分だけの英単語帳を作れる学習アプリ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
