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
          maxWidth: 720, width: '100%', maxHeight: '85vh', overflowY: 'auto',
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
            { icon: '📚', text: 'マスターリスト — シス単・LEAP・ターゲット・英検単語帳、さらに中学教科書（開隆堂サンシャイン1〜3年生）からも一括登録。' },
            { icon: '📅', text: '宿題配信 — 日付を指定して単語を配信。生徒は日付ごとに演習可能。' },
            { icon: '📱', text: 'スマホ最適化 — ホーム画面に追加すればアプリのように使える。インストール不要。' },
            { icon: '🃏', text: 'フラッシュカード — 「覚えた」「まだ」で判定。間違えた単語だけをやり直し。' },
            { icon: '📊', text: '学習データ — 生徒ごとの登録語数・正答率をリアルタイムで把握。' },
          ]} />
          <Highlight text="既存の単語帳アプリとの違い：講師が「その生徒に必要な単語」を選び、AIが瞬時にリッチなコンテンツ（音声・例文・訳）を付けて届けます。市販テキストに縛られない、完全カスタムの学習体験。" />
        </Section>

        <Hr />

        {/* ダッシュボード概要 */}
        <Section icon="🏠" title="ダッシュボード">
          <p>ログイン後のホーム画面では、2つのタブで操作します。</p>
          <FeatureList items={[
            { icon: '👥', text: '生徒管理 — 生徒の追加・編集・削除・QR配布・単語帳閲覧・メモ。学年フィルターで素早く絞り込み。' },
            { icon: '📝', text: '単語配信 — 3つの方法（マスターリスト・1語ずつ検索・Excel一括）で生徒に単語を配信。学年ボタンで配信先を素早く選択。' },
          ]} />
        </Section>

        <Hr />

        {/* 生徒管理 */}
        <Section icon="👥" title="生徒管理">
          <Step num={1} title="生徒を追加">
            「＋ 生徒を追加」ボタンを押して、名前と学年を入力します。
          </Step>
          <Step num={2} title="Excel一括登録">
            「📄 一括登録」→「📥 サンプル」でCSVテンプレートを取得。名前と学年を記入してアップロード。大量の生徒を一度に登録できます。
          </Step>
          <Step num={3} title="QRコード配布">
            生徒カードの「📱 QR」をクリックし、QR画像をダウンロード・印刷して配布。生徒はスマホでスキャンするだけで自分の単語帳にアクセスできます。
          </Step>
          <Step num={4} title="生徒カードの操作">
            各生徒カードには以下のボタンがあります：<br/>
            • 🔗 開く — 生徒の画面を新しいタブで表示<br/>
            • 📋 URL — 生徒ページのURLをコピー<br/>
            • 📱 QR — QRコードを表示・ダウンロード<br/>
            • 📖 単語帳 — 登録済み単語の一覧を閲覧<br/>
            • 📝 メモ — 生徒ごとの自由メモを保存<br/>
            • 📊 達成率 — 宿題日ごとの正答率・習得状況をプログレスバー付きで確認。<b>🟢 初回学習日</b>と<b>📝 最終学習日</b>も表示されるので、初回と最終が同じ日なら「直前一気」、離れていれば「コツコツ学習」と判断できます
          </Step>
          <Tip text="学年フィルターボタンで学年ごとに生徒を絞り込めます。検索バーと併用可能です。" />
        </Section>

        <Hr />

        {/* 単語配信 */}
        <Section icon="📝" title="単語配信">
          <p style={{ marginBottom: '0.75rem', fontWeight: '600', color: 'var(--danger)' }}>
            ⚠️ まず赤枠の「📅 配信日」を必ず確認・設定してから、「👥 配信先の生徒」を選択し、以下の3つの方法で単語を登録します。学年ボタンで配信先を素早く絞り込めます。
          </p>

          <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>📚 マスターリスト登録（おすすめ）</h4>
          <Step num={1} title="単語帳を選択">
            「📚 単語リスト」タブで市販教材を選択します。対応教材：<br/>
            • 英検（5級〜2級）<br/>
            • 英検準1級パス単 (1900語)<br/>
            • EX準1級 (2434語)<br/>
            • シス単5訂版 (2027語)<br/>
            • LEAP (1935語)<br/>
            • ターゲット1900 (1900語)<br/>
            • ターゲット1400extra (600語)<br/>
            • 高校生になったらすぐに覚える368語<br/>
            • 英熟語ターゲット1000 (1000語)<br/>
            • <b>開隆堂サンシャイン中学1年生 (1309語)</b><br/>
            • <b>開隆堂サンシャイン中学2年生 (1149語)</b><br/>
            • <b>開隆堂サンシャイン中学3年生 (1062語)</b>
          </Step>
          <Step num={2} title="番号範囲を指定（一般教材の場合）">
            「1-50」「51-100」のように範囲を入力して「🔍 プレビュー」。単語一覧が表示されます。
          </Step>
          <Step num={2} title="抽出方法を選択（教科書の場合）">
            教科書を選択すると、専用の抽出条件UIが表示されます：<br/>
            • <b>Program単位</b> — ドロップダウンから「Program 3」「Let's Talk 2」などセクション単位で選択<br/>
            • <b>ページ範囲</b> — 教科書のページ番号で範囲指定（例: p.30〜p.50）。ページの境目にまたがるデータも自動で含まれます<br/>
            該当語数がリアルタイムで表示されるので、確認しながら範囲を調整できます。
          </Step>
          <Step num={3} title="プレビュー＆編集">
            プレビュー画面で内容を確認。各行の「✏️」で意味や例文を編集、「🗑️」で除外、「＋ 単語を追加」で手動追加も可能。「再出題」チェックボックスで既登録単語の再出題を制御できます。
          </Step>
          <Step num={4} title="配信">
            「📤 〇語を〇名に登録する」で一括配信。<b>高品質な静的音声が自動的に紐付け</b>されるため、AI生成を待つ必要がありません。教科書の音声は学年に応じた速度（中1:ゆっくり → 中3:自然速度）で生成されています。
          </Step>
          <Tip text="マスターリストから登録すると、出典情報（例:『シス単5訂版 No.1〜50』『サンシャイン中2 No.15』）が自動的に記録され、生徒の一覧画面で確認できます。" />

          <h4 style={{ fontWeight: '700', margin: '1rem 0 0.5rem' }}>📝 1語ずつ検索登録</h4>
          <Step num={1} title="単語を検索">
            英単語を入力して「🔍 検索」。AIが意味候補と例文を自動生成します。
          </Step>
          <Step num={2} title="意味を選択・カスタム追加">
            AIが提案した意味から選択、または「カスタム意味を追加」で任意の訳を追加できます。
          </Step>
          <Step num={3} title="配信">
            「📤 〇名の生徒に登録する」で一括配信。音声も自動生成されます。既に登録済みの単語は自動的に<b>再出題</b>として処理されます。
          </Step>

          <h4 style={{ fontWeight: '700', margin: '1rem 0 0.5rem' }}>📄 Excel一括登録</h4>
          <Step num={1} title="サンプルをダウンロード">
            「📤 ファイルを選択」の横にある「📥 サンプルをダウンロード」でCSVテンプレートを取得。
          </Step>
          <Step num={2} title="記入">
            「英単語」「意味（カンマ区切り）」「例文」の3列を記入。<b>例文が空の場合はAIが自動生成</b>します。
          </Step>
          <Step num={3} title="プレビュー＆配信">
            ファイルを選択するとプレビュー画面が表示されます。内容を確認・編集してから登録ボタンで配信。
          </Step>
          <Tip text="例文欄を空にしておけば、AIが単語に合った自然な例文を自動生成します。" />

          <h4 style={{ fontWeight: '700', margin: '1rem 0 0.5rem' }}>🔥 毎日特訓</h4>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            マスターリストから、指定期間にわたって毎日自動的に単語を配信するスケジュール機能です。
          </p>
          <Step num={1} title="モーダルを開く">
            マスターリストの「🔥 毎日特訓」ボタンをクリック。選択中の単語帳と抽出条件が引き継がれます。
          </Step>
          <Step num={2} title="設定を入力">
            📚 対象リスト、🔢 開始番号、📦 1日あたりの語数、📅 開始日〜終了日を設定。「⏭️ 土日スキップ」で平日のみ配信も可能。
          </Step>
          <Step num={2} title="教科書の抽出条件（教科書選択時）">
            モーダル内で直接抽出条件を変更できます。Program単位 or ページ範囲を切り替え、対象語数をリアルタイムで確認しながら調整できます。
          </Step>
          <Step num={3} title="繰り返し出題オプション">
            教科書モードでは「🔄 単語が足りない場合、最初から繰り返し出題する」オプションが表示されます。<br/>
            • <b>OFF</b>: 対象単語を超えるとスケジュールが打ち切られ、⚠️警告が表示されます<br/>
            • <b>ON</b>: 単語が尽きたら先頭に戻り、スケジュール表に「🔄2回目」バッジが表示されます。前回配信した単語の再出題として処理されます
          </Step>
          <Step num={4} title="プレビュー確認">
            リアルタイムで日数・合計語数が表示され、スケジュール表で各日の配信範囲を確認できます。合計語数は端数も正確に計算されます。
          </Step>
          <Step num={5} title="一括配信">
            「📤 N日分をM名に配信する」ボタンで実行。確認ダイアログ後、各日付ごとに自動配信されます。
          </Step>
          <Tip text="配信先は上部の「👥 配信先」で選択済みの生徒がそのまま使われます。学年ボタンで絞り込んでから実行すると便利です。" />
        </Section>

        <Hr />

        {/* 生徒の単語帳を確認 */}
        <Section icon="📋" title="生徒の単語帳を確認・管理">
          <p>生徒カードの「📖 単語帳」ボタンで、その生徒に配信済みの全単語を確認・管理できます。</p>
          <FeatureList items={[
            { icon: '📅', text: '日付フィルター — 配信日ごとに単語を絞り込み表示' },
            { icon: '📥', text: 'CSV / Excel ダウンロード — 単語帳をファイルに書き出し' },
            { icon: '🔄', text: '例文一括生成 — 例文がない単語にAI例文を一括生成' },
            { icon: '✏️', text: '単語編集 — 英単語・意味・例文・日本語訳を個別に編集' },
            { icon: '⭐', text: 'お気に入り＆一括削除 — 日付フィルター時に★で残す単語を選び、★以外を一括削除。残った単語は「👤 自分」に移行' },
            { icon: '📊', text: '正答率 — 各単語の正解数/不正解数を確認' },
          ]} />
          <Tip text="「🔗 開く」で生徒と同じ画面を閲覧可能。日付フィルターを選択すると出典情報（🏷️ シス単5訂版 No.1〜50）が表示されます。" />
        </Section>

        <Hr />

        {/* 生徒検索＆学年フィルター */}
        <Section icon="🔍" title="生徒の検索＆学年フィルター">
          <p>生徒一覧の上にある<b>学年ボタン</b>で学年ごとに素早く絞り込みが可能です。検索バーとの併用もできます。</p>
          <FeatureList items={[
            { icon: '🏷️', text: '学年ボタン — 「全て」「高3」「高2」「中3」…をワンタップで切替。人数も表示。' },
            { icon: '🔍', text: '検索バー — 名前・学年をテキストで部分一致検索。学年フィルターと併用可能。' },
          ]} />
        </Section>

        <Hr />

        {/* メモ機能 */}
        <Section icon="📝" title="生徒メモ">
          <p>各生徒カードの「📝 メモ」ボタンで、配信方針や進捗メモなどを自由に記録・保存できます。講師の引き継ぎや振り返りに便利です。</p>
        </Section>

        <Hr />

        {/* テスト結果 */}
        <Section icon="🎯" title="テスト結果メッセージ">
          <p>生徒がクイズを完了すると、正答率に応じたメッセージが表示されます：</p>
          <FeatureList items={[
            { icon: '🎉', text: '100% — 「パーフェクト！完璧です！」' },
            { icon: '🌟', text: '80%以上 — 「素晴らしい！」' },
            { icon: '💪', text: '60%以上 — 「いい調子！」' },
            { icon: '📚', text: '60%未満 — 「もう少し頑張ろう！」' },
          ]} />
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
