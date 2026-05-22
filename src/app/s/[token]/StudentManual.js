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
            { icon: '⭐', text: '覚えるべき単語をお気に入り登録。リロードしても消えない！' },
            { icon: '🏋️', text: '自分で登録した単語で自主トレーニングも可能' },
            { icon: '📅', text: '宿題は日付ごとに整理。不要な日付は一括削除' },
            { icon: '📱', text: 'ホーム画面に追加すればアプリのように使える' },
          ]} />
          <Highlight text="先生の宿題も、自分で登録した苦手単語も、⭐お気に入りで管理して重点トレーニング。世界にひとつだけの単語帳です。" />
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
            • 「⭐ お気に入り」— ⭐を付けた単語だけ<br/>
            • 「📅 日付」— 宿題日ごとに表示
          </Step>
          <Step num={5}>
            ⭐ お気に入り機能：各単語の ☆ ボタンでお気に入り登録（全フィルターで常時表示）。<br/>
            リロードしても消えません（データベースに保存されます）。覚えたい重要な単語にマークしよう！
          </Step>
          <Step num={6}>
            🗑️ 日付で整理：「🗑️ 日付で整理」ボタンで不要なHW日付を一括削除。<br/>
            ⭐付き単語は必ず保護され「👤 自分」に移動します
          </Step>
          <Step num={7}>
            🏋️ トレーニング：一覧画面から直接フラッシュカード練習が可能（詳しくは下のセクション参照）
          </Step>
          <Tip text="📥 CSV / Excel ボタンで単語リストをダウンロード。印刷してノートに書いて覚えるのにも◎" />
        </Section>

        <Hr />

        {/* テスト */}
        <Section icon="🃏" title="テストで覚える（宿題）">
          <Step num={1}>
            「🎮 テスト」タブを開く。📅 日付フィルターで「今日の宿題」だけに絞り込みもOK
          </Step>
          <Step num={2}>
            並び順（出現順 / ランダム）、スコープ（全単語 / 残りのみ / ⭐お気に入りのみ）を選択
          </Step>
          <Step num={3}>
            「START」をタップ。英単語が表示されたら意味を思い出そう
          </Step>
          <Step num={4}>
            カードをタップで和訳を表示。「✓ 覚えた」か「✕ まだ」で判定
          </Step>
          <Step num={5}>
            テスト結果画面で「⭐ もう一度の単語をお気に入りに追加」で苦手な単語を一括ブックマーク！
          </Step>
          <Tip text="テスト結果は自動保存。🔄リセットで学習記録をゼロに戻すことも可能。" />
        </Section>

        <Hr />

        {/* 自主トレーニング */}
        <Section icon="🏋️" title="自主トレーニング">
          <p style={{ lineHeight: '1.7', marginBottom: '0.75rem' }}>
            一覧画面から「🏋️ トレーニング」ボタンをタップすると、<b>自分で登録した単語やお気に入り</b>でフラッシュカード練習ができます。
          </p>
          <Step num={1}>
            「📚 一覧」タブの右上にある「🏋️ トレーニング」ボタンをタップ
          </Step>
          <Step num={2}>
            設定画面で以下をカスタマイズ：<br/>
            • 📂 <b>対象</b>：👤自分 / ⭐お気に入り / すべて<br/>
            • 📍 <b>出典元</b>：教科書・単語帳ごとに絞り込み<br/>
            • 🔢 <b>番号範囲</b>：No.○〜No.○の範囲指定<br/>
            • 📊 <b>習熟度</b>：全単語 / 残りのみ / 未テスト / 苦手のみ<br/>
            • 🔀 <b>出題順</b>：ID順 / ランダム / 苦手順<br/>
            • 📝 <b>出題数</b>：全部 / 10語 / 20語 / 50語
          </Step>
          <Step num={3}>
            「START」で練習開始！テストと同じフラッシュカード形式です
          </Step>
          <Highlight text="自分が苦手だと感じた単語を登録 → ⭐お気に入りに追加 → 自主トレで重点練習。これが最も効率的な学習サイクルです！" />
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
