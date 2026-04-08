---
description: edge-ttsで各単語リストの音声ファイルを一括生成するワークフロー
---

# edge-TTS 音声一括生成ワークフロー

## スクリプト
`_generate_audio.py` - レジューム対応（既存ファイルをスキップ）

## コマンド書式
```
python _generate_audio.py "<JSONファイル>" "<出力ディレクトリ>" "<速度>"
```

## 音声生成の完了状況

| # | リスト | JSON | 出力先 | 速度 | 状態 |
|---|---|---|---|---|---|
| 1 | 英検5級 (439語) | `public/wordlist_5kyu.json` | `public/audio/5kyu/` | `-30%` | ✅ 完了 (878ファイル) |
| 2 | 英検4級 (726語) | `public/wordlist_4kyu.json` | `public/audio/4kyu/` | `-25%` | ✅ 完了 (1452ファイル) |
| 3 | 英検3級 (996語) | `public/wordlist_3kyu.json` | `public/audio/3kyu/` | `-15%` | ❌ 未完了（JSONキー修正済み、再実行必要） |
| 4 | 英検準2級 (1222語) | `public/wordlist_pre2kyu.json` | `public/audio/pre2kyu/` | `-10%` | ⬜ 未開始 |
| 5 | 英検2級 (2000語) | `public/wordlist_2kyu.json` | `public/audio/2kyu/` | `-5%` | ⬜ 未開始 |
| 6 | シス単5訂版 (2027語) | `public/wordlist_sys5th.json` | `public/audio/sys5th/` | `+0%` | ⬜ 未開始 |
| 7 | LEAP (1935語) | `public/wordlist_leap.json` | `public/audio/leap/` | `+0%` | ⬜ 未開始 |
| 8 | ターゲット1900 (1900語) | `public/wordlist_target1900.json` | `public/audio/target1900/` | `+0%` | ⬜ 未開始 |
| 9 | 368語 (1400extra) | `public/wordlist_target1400extra.json` | `public/audio/target1400extra/` | `+0%` | ⬜ 未開始 |
| 10 | 熟語1000 | `public/wordlist_idiom1000.json` | `public/audio/idiom1000/` | `+0%` | ⬜ 未開始 |

## 速度設定の方針
- 英検5級: `-30%`（初級・ゆっくり）
- 英検4級: `-25%`
- 英検3級: `-15%`（中級）
- 英検準2級: `-10%`
- 英検2級: `-5%`（上級・ほぼ通常速度）
- シス単/LEAP/ターゲット/熟語: `+0%`（共通テストレベル・通常速度）

## 例文・翻訳生成の完了状況

| リスト | スクリプト | 出力 | 状態 |
|---|---|---|---|
| T1400extra (368語) | `_generate_t1400_examples.js` | `public/wordlist_target1400extra.json` | ✅ 完了 |
| 熟語1000 | `_generate_idiom_examples.js` | `public/wordlist_idiom1000.json` | ✅ 完了 |

## ドロップダウン実装状況 (TeacherWordRegister.js)

追加済み:
- ✅ シス単5訂版 (2027語)
- ✅ LEAP (1935語)
- ✅ ターゲット1900 (1900語)
- ✅ 高校生になったらすぐに覚える368語
- ✅ 英熟語ターゲット1000 (1000語)

## 次ステップ: 音声スキップ仕様

一括登録時に`public/audio/{list}/{rank}_word.mp3`が存在する場合、TTS API呼び出しをスキップして静的URLを使用する修正が必要。対象: `/api/words/import/route.js`

## 注意事項
- JSONのキー名は `word` または `english`（3級/準2級/2級は`english`を使用）
- `_generate_audio.py`は両方のキーに対応済み
- レジューム対応：既存ファイルはスキップされる
- GEMINI_API_KEYは`.env.local`から読み込み
