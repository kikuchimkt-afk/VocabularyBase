'use client';

export default function ManualModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
          maxWidth: 700, width: '100%', maxHeight: '85vh', overflowY: 'auto',
          padding: '2rem', boxShadow: 'var(--shadow-lg)',
          color: 'var(--text-main)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>📖 講師マニュアル</h2>
          <button onClick={onClose} style={{
            border: 'none', background: 'var(--bg-page)', borderRadius: '50%',
            width: 36, height: 36, cursor: 'pointer', fontSize: '1.1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
          }}>✕</button>
        </div>

        {/* コンセプト */}
        <Section icon="✨" title="VocabularyBase とは">
          <p>VocabularyBase は、<b>講師が生徒一人ひとりに最適な単語帳を届ける</b>ための、AI搭載型パーソナル英単語学習プラットフォームです。</p>
          <FeatureList items={[
            { icon: '🤖', text: 'AI自動生成 — 意味・例文・日本語訳をGemini AIが瞬時に生成。講師の手間を大幅削減。' },
            { icon: '🔊', text: '高品位音声 — Edge TTSによるネイティブ品質の発音・例文音声を自動付与。' },
            { icon: '📅', text: '宿題配信 — 日付を指定して単語を配信。生徒は日付ごとに演習可能。' },
            { icon: '📱', text: 'スマホ最適化 — ホーム画面に追加すればアプリのように使える。インストール不要。' },
            { icon: '🃏', text: 'フラッシュカード — 「覚えた」「まだ」で判定。間違えた単語だけをやり直し。' },
            { icon: '📊', text: '学習データ — 生徒ごとの登録語数・正答率をリアルタイムで把握。' },
          ]} />
          <Highlight text="既存の単語帳アプリとの違い：講師が「その生徒に必要な単語」を選び、AIが瞬時にリッチなコンテンツ（音声・例文・訳）を付けて届けます。市販テキストに縛られない、完全カスタムの学習体験。" />
        </Section>

        <Hr />

        {/* 生徒管理 */}
        <Section icon="👥" title="生徒管理">
          <Step num={1} title="生徒を追加">
            「＋ 生徒を追加」ボタンを押して、名前と学年を入力します。
          </Step>
          <Step num={2} title="Excel一括登録">
            「📄 一括登録」→「📥 サンプルをダウンロード」でCSVテンプレートを取得。名前と学年を記入してアップロード。大量の生徒を一度に登録できます。
          </Step>
          <Step num={3} title="QRコード配布">
            生徒カードの「📱 QRコード」をクリックし、QR画像を印刷・配布。生徒はスマホでスキャンするだけで自分の単語帳にアクセスできます。
          </Step>
          <Tip text="生徒がQRからアクセスした後「ホーム画面に追加」すると、次回からワンタップで開けます。" />
        </Section>

        <Hr />

        {/* 単語配信 */}
        <Section icon="📝" title="単語配信">
          <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>1語ずつ登録</h4>
          <Step num={1} title="配信日・配信先を設定">
            配信日（宿題日）を選択し、配信先の生徒にチェックを入れます。セッション中は選択が維持されます。
          </Step>
          <Step num={2} title="単語を検索">
            英単語を入力して「🔍 検索」。AIが意味候補と例文を自動生成します。
          </Step>
          <Step num={3} title="意味を選択・カスタム追加">
            AIが提案した意味から選択、または「カスタム意味を追加」で任意の訳を追加できます。
          </Step>
          <Step num={4} title="配信">
            「📤 〇名の生徒に登録する」で一括配信。音声も自動生成されます。
          </Step>

          <h4 style={{ fontWeight: '700', margin: '1rem 0 0.5rem' }}>Excel一括登録</h4>
          <Step num={1} title="サンプルをダウンロード">
            「📥 サンプルをダウンロード」でCSVテンプレートを取得。
          </Step>
          <Step num={2} title="記入">
            「英単語」「意味（カンマ区切り）」「例文」の3列を記入。<b>例文が空の場合はAIが自動生成</b>します。
          </Step>
          <Step num={3} title="アップロード">
            ファイルを選択すると、音声生成・翻訳・登録が自動で実行されます。
          </Step>
          <Tip text="例文欄を空にしておけば、AIが単語に合った自然な例文を自動生成します。" />
        </Section>

        <Hr />

        {/* 単語帳の確認 */}
        <Section icon="📋" title="生徒の単語帳を確認">
          <p>生徒カードの「📋 単語帳」ボタンで、その生徒に配信済みの全単語を確認できます。「🔗 開く」で生徒と同じ画面を閲覧可能。</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem' }}>
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function Step({ num, title, children }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: 'var(--primary)', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.8rem', fontWeight: '700',
      }}>{num}</div>
      <div>
        <div style={{ fontWeight: '600', marginBottom: '0.2rem' }}>{title}</div>
        <div className="text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>{children}</div>
      </div>
    </div>
  );
}

function FeatureList({ items }) {
  return (
    <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.75rem' }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
          padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
          background: 'var(--bg-page)', fontSize: '0.85rem',
        }}>
          <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.icon}</span>
          <span style={{ lineHeight: '1.5' }}>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

function Highlight({ text }) {
  return (
    <div style={{
      marginTop: '1rem', padding: '0.75rem 1rem',
      borderLeft: '4px solid var(--primary)',
      background: 'var(--primary-light)',
      borderRadius: '0 var(--radius-md) var(--radius-md) 0',
      fontSize: '0.85rem', lineHeight: '1.6', fontWeight: '500',
    }}>
      💡 {text}
    </div>
  );
}

function Tip({ text }) {
  return (
    <div style={{
      marginTop: '0.5rem', padding: '0.5rem 0.75rem',
      background: 'var(--secondary-light)', borderRadius: 'var(--radius-md)',
      fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: '600',
    }}>
      💡 ヒント: {text}
    </div>
  );
}

function Hr() {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />;
}
