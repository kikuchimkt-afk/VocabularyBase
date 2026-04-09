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

        {/* 画面構成 */}
        <Section icon="🗂️" title="3つのタブ">
          <p style={{ lineHeight: '1.7' }}>
            画面下部の3つのタブで切り替えて使います。
          </p>
          <FeatureList items={[
            { icon: '📝', text: '登録 — 自分で英単語を検索してAIが意味と例文を自動生成。好きな単語を追加できる' },
            { icon: '📚', text: '一覧 — 登録済みの全単語を確認・検索・音声再生・ダウンロード' },
            { icon: '🎮', text: 'テスト — フラッシュカード形式で記憶チェック。覚えた/まだで自動判定' },
          ]} />
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
          <Tip text="出典欄（📍）に教科書やページ番号を入れておくと、後で復習する時に便利です。" />
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
          <Step num={4}>
            フィルターで絞り込み：<br/>
            • 「すべて」— 全単語を表示<br/>
            • 「📋 HW」— 先生から配信された宿題だけ<br/>
            • 「👤 自分」— 自分で登録した単語だけ<br/>
            • 「📅 日付」— 宿題日ごとに表示。出典情報（例：🏷️ シス単5訂版 No.1〜50）も確認できます
          </Step>
          <Step num={5}>
            📥 CSV / Excel ボタンで単語リストをダウンロード。印刷してノートに書いて覚えるのにも◎
          </Step>
          <Tip text="🔊 が表示されない単語は「🔊 一括音声生成」ボタンで音声を自動生成できます。" />
        </Section>

        <Hr />

        {/* テスト */}
        <Section icon="🃏" title="テストで覚える">
          <Step num={1}>
            「🎮 テスト」タブを開く。📅 日付フィルターで「今日の宿題」だけに絞り込みもOK
          </Step>
          <Step num={2}>
            並び順（出現順 / ランダム）を選択。デフォルトは「出現順」（出典番号の若い順）です
          </Step>
          <Step num={3}>
            「全単語」または「残りのみ」を選択。「残りのみ」でまだ覚えていない単語だけに絞って演習できます
          </Step>
          <Step num={4}>
            「START」をタップ。英単語が表示されたら意味を思い出そう。🔊 ボタンで発音を確認できます
          </Step>
          <Step num={5}>
            わからない時は「🔈 ヒント」ボタンで例文の音声を再生。文脈から推測してみよう
          </Step>
          <Step num={6}>
            カードをタップ（または「答えを見る」）で和訳・例文・日本語訳・出典情報を表示
          </Step>
          <Step num={7}>
            「✓ 覚えた」か「✕ まだ」で判定。間違えた単語だけやり直し可能！
          </Step>
          <Tip text="「🔊 自動音声再生」をONにすると、カードが表示されるたびにネイティブの発音が自動で流れます。裏面表示時には例文の音声も流れます。" />
          <div style={{
            marginTop: '0.75rem', padding: '0.5rem 0.75rem',
            background: 'var(--primary-light)', borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600',
          }}>
            📊 テスト結果は自動保存！スタート画面の「全単語」「残り」「覚えた」で学習進捗を確認できます。<br/>
            🔄 「リセット」ボタンで学習記録をゼロに戻して最初からやり直すこともできます（日付ごとのリセットも可能）。
          </div>
        </Section>

        <Hr />

        {/* ホーム画面 */}
        <Section icon="📱" title="ホーム画面に追加">
          <p style={{ lineHeight: '1.7' }}>
            <b>iPhone:</b> Safari のメニュー → 「ホーム画面に追加」<br/>
            <b>Android:</b> Chrome のメニュー → 「ホーム画面に追加」
          </p>
          <Tip text="ホーム画面からワンタップで自分の単語帳を開けるようになります！毎回URLを入力する必要はありません。" />
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
