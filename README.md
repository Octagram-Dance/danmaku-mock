# 幻想弾幕遊（Gensou Danmaku Yuu）

> 東方 Project にインスパイアされた、ブラウザで遊べる縦スクロール弾幕シューティングのファンメイド作品。

## 🎮 プレイする

**👉 https://Octagram-Dance.github.io/danmaku-mock/**

ブラウザで上記 URL を開くだけで遊べます。PC・スマホ両対応。

## 📸 Screenshots

> スクリーンショットは順次追加予定。

| タイトル | ゲームプレイ | ボス戦 |
|:---:|:---:|:---:|
| ![Title](screenshots/title.png) | ![Gameplay](screenshots/gameplay.png) | ![Boss](screenshots/boss.png) |

## ⌨ 操作

### PC

| キー | 動作 |
|---|---|
| `↑` `↓` `←` `→` | 自機の移動 |
| `Shift` | 低速移動(当たり判定表示) |
| `X` | ボム発動 |
| `Z` / `Enter` | 決定・スキップ |
| `P` / `Esc` | ポーズ |

### スマホ・タブレット

| 操作 | 動作 |
|---|---|
| 画面ドラッグ | 自機の移動 |
| 2 本指タッチ | 低速移動 |
| 右下 B ボタン | ボム発動 |
| 右上 II ボタン | ポーズ |
| メニュータップ | 決定 |

## ✨ 主な機能

- 🌸 **3 ステージ**(夜空 / 雪山 / 紅葉)、各ステージ専用の 4 層パララックス背景とボス
- 🎯 **3 段階の難易度**(Easy / Normal / Hard) — 弾速・弾数・ボス HP が変動
- 💥 **ボム**(`X`) — 画面の弾を消す + ショックウェーブ + 短時間無敵
- ⚡ **グレイズシステム** — 敵弾を寸前でかすめると `+50` 点 + 緑のリング演出
- 🧩 **5 種の敵**(通常 / 拡散 / 高速 / 揺れ / 大型武者)+ **3 体のボス**(紫の妖怪少女 / 氷の少女 / 紅葉の少女)
- 📜 **スペルカード** — ボスの HP 段階ごとに弾幕パターン切替 + 詠唱マナ円(多重円・五芒星・ルーン)
- 🎬 **演出強化** — ボス出現カットイン、ステージ遷移テロップ、被弾ヒットストップ
- 🎨 **発光エフェクト** — 弾グロー、被弾フラッシュ、ボム波紋、フローティングスコア
- 📊 **クリア集計画面** — 撃破数 / グレイズ / ボム使用数 / 取得 P アイテムを表示
- 💾 **ハイスコア / グレイズ記録** — `localStorage` に難易度別保存
- 📱 **タッチ完全対応** — スマホ・タブレットでもドラッグ操作で快適にプレイ可能

## 🛠 技術スタック

- **Vanilla JavaScript**(ES2020+)— 外部フレームワーク不使用
- **HTML5 Canvas 2D** — 全描画は単一の `<canvas>` 上で実装
- **GitHub Pages** — 静的ホスティング、サーバ処理なし

外部ライブラリ依存なし。`<script>` タグを並べるだけで動く構成です。

## 📁 ファイル構成

```
danmaku-mock/
├── index.html              # エントリポイント (HTML/CSS のみ、JS は外部)
├── index.original.html     # ファイル分割前のバックアップ
├── README.md
├── assets/                 # キャラクター画像 (PNG, アルファ付き)
│   ├── player.png          # 自機 (後ろ向き)
│   ├── player_front.png    # 自機 (正面 — 将来のキャラ選択用)
│   ├── enemies/
│   │   ├── normal.png      # 通常敵 (青)
│   │   ├── spread.png      # 拡散弾敵 (ピンク)
│   │   ├── fast.png        # 高速敵 (黄)
│   │   ├── swayer.png      # 揺れ敵 (紫)
│   │   └── tank.png        # 大型敵 (装甲武者)
│   └── bosses/
│       ├── stage1.png      # 紫の妖怪少女
│       ├── stage2.png      # 氷の少女
│       └── stage3.png      # 紅葉の少女
└── js/                     # JavaScript モジュール群 (14 ファイル)
    ├── utils.js            # clamp, drawStar 等の共通ヘルパー
    ├── storage.js          # ハイスコア / グレイズ記録 (localStorage)
    ├── assets.js           # 画像ローダー (drawImageCentered)
    ├── main.js             # 共有状態・定数・メインループ
    ├── input.js            # キーボード / タッチ / クリック
    ├── effects.js          # 爆発・パーティクル・ボム・グレイズ・スコア演出
    ├── items.js            # アイテムドロップ・吸引・回収
    ├── player.js           # 自機の動作・描画・被弾
    ├── bullets.js          # 弾管理・当たり判定・グレイズ判定
    ├── enemy.js            # 敵生成・動作・描画
    ├── boss.js             # ボス・スペルカード・マナ円・カットイン
    ├── stage.js            # ステージ進行・パララックス背景
    ├── hud.js              # HUD・タイトル・メニュー・集計画面
    └── boot.js             # ゲームループ起動 (全モジュール読み込み後)
```

## 🚀 開発履歴

| Phase | 内容 | PR |
|---|---|---|
| 0 | 単一 HTML としてモック作成 | - |
| 1 | JS を 14 ファイルに分割、保守性向上 | [#1](https://github.com/Octagram-Dance/danmaku-mock/pull/1) |
| 2 | キャラクター画像導入(rembg で背景透過) | [#2](https://github.com/Octagram-Dance/danmaku-mock/pull/2) |
| 3 | Visual Phase 1 — 弾グロー / スコア演出 / ボム強化 | [#3](https://github.com/Octagram-Dance/danmaku-mock/pull/3) |
| 4 | Visual Phase 2 — パララックス / ヒットストップ / マナ円 / ステージ遷移 | [#4](https://github.com/Octagram-Dance/danmaku-mock/pull/4) |
| 5 | グレイズシステム実装 | [#5](https://github.com/Octagram-Dance/danmaku-mock/pull/5) |
| 6 | 仕上げ — ボス出現カットイン / クリア集計画面 / README 整備 | (本 PR) |

## 🎨 素材の出典・クレジット

- **キャラクター画像**: ChatGPT (DALL-E) で生成した素材を、[rembg](https://github.com/danielgatis/rembg)(u2net)で背景透過処理
- **コード**: すべて手書き(Claude Code 支援)
- **着想元**: 東方 Project のゲームデザイン・演出

本作は東方 Project にインスパイアされた **二次創作的なファンメイド作品** です。原作とは無関係です。

## 📝 ライセンス

個人利用 OK。転載・商用利用は要相談。

東方 Project の世界観に着想を得た非公式ファンメイド作品であり、原作と無関係です。問題があればお知らせください。

## 🤝 コントリビュート

issues / pull requests 歓迎です。
