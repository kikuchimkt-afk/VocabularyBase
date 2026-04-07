'use client';

export default function StudentManual({ onClose }) {
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
          maxWidth: 600, width: '100%', maxHeight: '85vh', overflowY: 'auto',
          padding: '2rem', boxShadow: 'var(--shadow-lg)',
          color: 'var(--text-main)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>📖 使い方ガイド</h2>
          <button onClick={onClose} style={{
            border: 'none', background: 'var(--bg-page)', borderRadius: '50%',
            width: 36, height: 36, cursor: 'pointer', fontSize: '1.1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
          }}>✕</button>
        </div>

        {/* コンセプト */}
        <Section icon="✨" title="VocabularyBase とは">
          <p style={{ lineHeight: '1.7', marginBottom: '0.75rem' }}>
            あなた<b>だけ</b>のために先生が選んだ英単語を、<b>AIの力</b>で楽しく効率的に学べる英単語帳アプリです。
          </p>
          <FeatureList items={[
            { icon: '🎯', text: '先生があなたに合った単語を厳選して配信してくれます' },
            { icon: '🔊', text: 'ネイティブ品質の発音・例文音声付き。耳からも覚えられる！' },
            { icon: '🃏', text: 'フラッシュカード形式のテストで楽しく記憶チェック' },
            { icon: '📅', text: '宿題は日付ごとに整理。「今日の分」だけ練習もOK' },
            { icon: '📱', text: 'ホーム画面に追加すればアプリのように使える' },
            { icon: '🔍', text: '英語・日本語どちらからでも単語を検索できる' },
          ]} />
          <Highlight text="市販の単語帳では見つからない、あなたの弱点にピッタリ合った単語を、音声と例文付きで学べます。世界にひとつだけの単語帳です。" />
        </Section>

        <Hr />

        {/* 単語を登録 */}
        <Section icon="📝" title="自分で単語を登録する">
          <Step num={1}>
            「📝 登録」タブで英単語を入力し、「意味を検索」をタップ
          </Step>
          <Step num={2}>
            AIが意味と例文を自動生成。好きな意味を選んで「登録」
          </Step>
          <Step num={3}>
            音声付きの単語カードが自動的に作成されます！
          </Step>
        </Section>

        <Hr />

        {/* 一覧 */}
        <Section icon="📚" title="単語一覧を見る">
          <Step num={1}>
            「📚 一覧」タブで登録済みの全単語を確認
          </Step>
          <Step num={2}>
            🔍 検索バーで英語・日本語どちらでも部分一致検索
          </Step>
          <Step num={3}>
            🔊 ボタンで発音・例文の音声を再生
          </Step>
        </Section>

        <Hr />

        {/* テスト */}
        <Section icon="🃏" title="テストで覚える">
          <Step num={1}>
            「🎓 テスト」タブを開く。📅 日付フィルターで「今日の宿題」だけに絞り込みもOK
          </Step>
          <Step num={2}>
            「START」をタップ。英単語が表示されるので、意味を思い出そう
          </Step>
          <Step num={3}>
            カードをタップ（または「答えを見る」）で和訳を表示
          </Step>
          <Step num={4}>
            「✓ 覚えた」か「✕ まだ」で判定。間違えた単語だけやり直し可能！
          </Step>
          <Tip text="「🔊 自動音声再生」をONにすると、カードが表示されるたびにネイティブの発音が流れます。" />
        </Section>

        <Hr />

        {/* ホーム画面 */}
        <Section icon="📱" title="ホーム画面に追加">
          <p style={{ lineHeight: '1.7' }}>
            <b>iPhone:</b> Safari のメニュー → 「ホーム画面に追加」<br/>
            <b>Android:</b> Chrome のメニュー → 「ホーム画面に追加」
          </p>
          <Tip text="ホーム画面からワンタップで自分の単語帳を開けるようになります！" />
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.75rem' }}>
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function Step({ num, children }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        background: 'var(--primary)', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: '700',
      }}>{num}</div>
      <div style={{ fontSize: '0.9rem', lineHeight: '1.6', paddingTop: 2 }}>{children}</div>
    </div>
  );
}

function FeatureList({ items }) {
  return (
    <div style={{ display: 'grid', gap: '0.4rem', marginTop: '0.5rem' }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', gap: '0.6rem', alignItems: 'center',
          padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)',
          background: 'var(--bg-page)', fontSize: '0.85rem',
        }}>
          <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

function Highlight({ text }) {
  return (
    <div style={{
      marginTop: '0.75rem', padding: '0.75rem 1rem',
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
      💡 {text}
    </div>
  );
}

function Hr() {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />;
}
