# 幻想弾幕遊（Gensou Danmaku Yuu）

> Claude Code でのゲーム開発練習として作っている、ブラウザで遊べる縦スクロール弾幕シューティング。

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

- 🌸 **5 ステージ**(夜空 / 雪山 / 紅葉 / 雷雲 / 星界)、各ステージ専用の 4 層パララックス背景とボス
- 🧙 **キャラクター選択** — 魔女 / 巫女 / メイドの 3 種、速度・弾威力・ホーミング・ボム威力・弾配置が差別化
- 🎯 **3 段階の難易度**(Easy / Normal / Hard) — 弾速・弾数・ボス HP が変動
- 💥 **ボム**(`X`) — 画面の弾を消す + ショックウェーブ + 短時間無敵(キャラ別に威力 / 範囲倍率)
- ⚡ **グレイズシステム** — 敵弾を寸前でかすめると `+50` 点 + 弾の閃光と HUD カウンター演出
- 🧩 **5 種の敵**(通常 / 拡散 / 高速 / 揺れ / 大型武者)+ **5 体のボス** + **4 体の中ボス**
- 📜 **スペルカード** — ステージ 1〜4 は 5 枚 / ステージ 5 は 10 枚 + フェーズ 2 覚醒、最終スペルは 60 秒耐久
- 🎬 **演出強化** — ボス出現カットイン(ラスボスは 240F 専用版)、フェーズ 2 突入カットイン、ラスボス撃破演出、ステージ遷移テロップ、被弾ヒットストップ
- 🎨 **発光エフェクト** — 弾グロー、被弾フラッシュ、ボム波紋、彗星の尾、ワープ転移、重力弾、フローティングスコア
- 📊 **クリア集計画面** — 撃破数 / グレイズ / ボム使用数 / 取得 P アイテムを表示、全クリア時は専用エンディング画面
- 💾 **ハイスコア / グレイズ記録 / 選択キャラ** — `localStorage` に難易度別保存
- 📱 **タッチ完全対応** — スマホ・タブレットでもドラッグ操作で快適にプレイ可能、60fps キャップで ProMotion 端末でも安定

## 🛠 技術スタック

- **Vanilla JavaScript**(ES2020+)— 外部フレームワーク不使用
- **HTML5 Canvas 2D** — 全描画は単一の `<canvas>` 上で実装
- **GitHub Pages** — 静的ホスティング、サーバ処理なし

外部ライブラリ依存なし。`<script>` タグを並べるだけで動く構成です。

## 📁 ファイル構成

```
danmaku-mock/
├── index.html              # エントリポイント (HTML/CSS のみ、JS は外部)
├── README.md
├── assets/                 # 画像アセット (PNG, アルファ付き)
│   ├── player.png          # 自機 (後ろ向き、魔女キャラの旧/共通画像)
│   ├── enemies/            # 雑魚 5 種 (通常 / 拡散 / 高速 / 揺れ / 大型武者)
│   ├── bosses/             # ボス 5 体 (stage1 紫雨 〜 stage5 星詠)
│   ├── midbosses/          # 中ボス 4 体 (stage1 〜 4、stage5 は中ボスなし)
│   └── players/            # 自機キャラ 3 種 × 表 (選択画面) と裏 (ゲーム中)
│       ├── witch_front.png / witch_back.png
│       ├── miko_front.png  / miko_back.png
│       └── maid_front.png  / maid_back.png
└── js/                     # JavaScript モジュール群 (16 ファイル、~6000 行)
    ├── utils.js            # clamp, drawStar 等の共通ヘルパー
    ├── storage.js          # ハイスコア / グレイズ / FPS 表示 / 選択キャラ (localStorage)
    ├── characters.js       # CHARACTERS データ (witch / miko / maid) と性能定義
    ├── assets.js           # 画像ローダー (drawImageCentered)
    ├── main.js             # 共有状態・定数・メインループ・state 遷移
    ├── input.js            # キーボード / タッチ / マウス (相対ドラッグ)
    ├── effects.js          # 爆発・パーティクル・ボム・グレイズ・スコア演出
    ├── items.js            # アイテムドロップ・吸引・回収
    ├── player.js           # 自機の動作・描画・被弾・キャラ別弾配置
    ├── bullets.js          # 弾管理・当たり判定・グレイズ・特殊フィールド (重力 / ワープ / 軌跡 / 2 段階)
    ├── enemy.js            # 雑魚生成・動作・描画
    ├── midboss.js          # 中ボス・出現演出
    ├── boss.js             # ボス・スペルカード・カットイン・耐久・撃破演出
    ├── stage.js            # ステージ進行・5 種のパララックス背景
    ├── hud.js              # HUD・タイトル・メニュー・キャラ選択・集計画面・全クリア画面
    └── boot.js             # ゲームループ起動 (全モジュール読み込み後)
```

## 🚀 開発履歴

| # | 内容 | PR |
|---|---|---|
| 0 | 単一 HTML としてモック作成 | - |
| 1 | JS を 14 ファイルに分割、保守性向上 | [#1](https://github.com/Octagram-Dance/danmaku-mock/pull/1) |
| 2 | キャラクター画像導入(rembg で背景透過) | [#2](https://github.com/Octagram-Dance/danmaku-mock/pull/2) |
| 3 | Visual Phase 1 — 弾グロー / スコア演出 / ボム強化 | [#3](https://github.com/Octagram-Dance/danmaku-mock/pull/3) |
| 4 | Visual Phase 2 — パララックス / ヒットストップ / マナ円 / ステージ遷移 | [#4](https://github.com/Octagram-Dance/danmaku-mock/pull/4) |
| 5 | グレイズシステム実装 | [#5](https://github.com/Octagram-Dance/danmaku-mock/pull/5) |
| 6 | 仕上げ — ボス出現カットイン / クリア集計画面 | [#6](https://github.com/Octagram-Dance/danmaku-mock/pull/6) |
| 7 | スペルカード突入カットイン | [#7](https://github.com/Octagram-Dance/danmaku-mock/pull/7) |
| 8 | ステージ別ボス差別化(15 スペル / 名前 / 動き方) | [#8](https://github.com/Octagram-Dance/danmaku-mock/pull/8) |
| 9 | 中ボス導入 / ステージ 1 ボスのワープ強化 / FPS カウンター | [#9](https://github.com/Octagram-Dance/danmaku-mock/pull/9) |
| 10 | 60fps キャップ / 相対ドラッグ操作 / グレイズ演出調整 | [#10](https://github.com/Octagram-Dance/danmaku-mock/pull/10) |
| 11 | README を「Claude Code 練習プロジェクト」基調に整理 | [#11](https://github.com/Octagram-Dance/danmaku-mock/pull/11) |
| 12 | ステージ選択 / 難易度メニューに戻るナビゲーション | [#12](https://github.com/Octagram-Dance/danmaku-mock/pull/12) |
| 13 | canvas のどこをタップしてもドラッグ開始できるように修正 | [#13](https://github.com/Octagram-Dance/danmaku-mock/pull/13) |
| 14 | タイトル画面リッチ化(パララックス / ロゴ脈動 / メニューフェードイン) | [#14](https://github.com/Octagram-Dance/danmaku-mock/pull/14) |
| 15 | ステージ 4・5 の基盤整備(プレースホルダ、IMPLEMENTED_STAGES 化) | [#15](https://github.com/Octagram-Dance/danmaku-mock/pull/15) |
| 16 | ステージ 4 実装 — 神鳴(雷神)、4 層雷雲背景、雷童子 | [#16](https://github.com/Octagram-Dance/danmaku-mock/pull/16) |
| 17 | ステージ 5 (最終) 実装 — 星詠、10 枚スペル、フェーズ 2、専用エンディング | [#17](https://github.com/Octagram-Dance/danmaku-mock/pull/17) |
| 18 | 最終スペル「宇宙の終わり」を 60 秒耐久化、専用カウントダウン UI | [#18](https://github.com/Octagram-Dance/danmaku-mock/pull/18) |
| 19 | 自機キャラ選択(魔女 / 巫女 / メイドの 3 種、性能差別化) | [#19](https://github.com/Octagram-Dance/danmaku-mock/pull/19) |
| 20 | キャラ選択画面が Z で 1 フレーム多重発火する不具合を修正 | [#20](https://github.com/Octagram-Dance/danmaku-mock/pull/20) |
| 21 | 巫女キャラ正面イラストの透過抜けを isnet-anime で修正 | [#21](https://github.com/Octagram-Dance/danmaku-mock/pull/21) |
| 22 | クリック多重発火 + メニュー入力の cascade 防止(clear-and-return パターン) | [#22](https://github.com/Octagram-Dance/danmaku-mock/pull/22) |
| 23 | ラスボス「冷たい光輪」の子弾消失修正 + 耐久 UI 縮小 | [#23](https://github.com/Octagram-Dance/danmaku-mock/pull/23) |

## 🎨 クレジット

- **コード**: Claude Code 支援で作成
- **キャラクター画像**: ChatGPT (DALL-E) で生成、[rembg](https://github.com/danielgatis/rembg) (u2net) で背景透過処理

---

Claude Code でのゲーム開発練習として個人で作っているプロジェクトです。
