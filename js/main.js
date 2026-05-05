// 共有状態・定数・メインループ

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const PX = 20, PY = 20, PW = 480, PH = 660;
const HX = 520, HY = 20, HW = 260, HH = 660;

function resize() {
  const ratio = W / H;
  const wRatio = window.innerWidth / window.innerHeight;
  const wrap = document.getElementById('wrap');
  if (wRatio > ratio) {
    wrap.style.height = '100vh';
    wrap.style.width  = (window.innerHeight * ratio) + 'px';
  } else {
    wrap.style.width  = '100vw';
    wrap.style.height = (window.innerWidth / ratio) + 'px';
  }
  canvas.style.width = '100%';
  canvas.style.height = '100%';
}
window.addEventListener('resize', resize);
resize();

let state = 'title';
let menuIndex = 0;
let pauseMenuIndex = 0;

let selectedStage = 1;
let selectedDifficulty = 'Normal';
let bossOnlyMode = false;
// 'difficulty' state に到達した経路。true なら stageSelect 経由 (戻り先 = stageSelect)、
// false なら title から「はじめから遊ぶ」直行 (戻り先 = title)。
let cameViaStageSelect = false;

let player, playerBullets, homingBullets, enemies, enemyBullets, items, particles;
let floatTexts; // スコア取得時のフローティングテキスト
let grazeCount; // ステージを跨いで累積するグレイズ回数 (startGame でのみリセット)
let grazeFlashTimer; // グレイズ発生瞬間に HUD カウンターを光らせる残フレーム (15F)
let bombs, bombActive, bombTimer; // ボム機能用
let bombFlash; // ボム発動瞬間の全画面フラッシュ強度 (0〜30)
let screenFlash; // 被弾時など画面演出用
let hitStopFrames; // ヒットストップ残フレーム数 (>0 中はゲームロジック停止)
let transitionTimer; // ステージ遷移演出の残フレーム (>0 中は state='transition')
let bossIntroTimer; // ボス出現カットインの残フレーム (>0 中は state='bossIntro')
let spellCutinTimer; // スペルカード突入カットインの残フレーム (>0 中は state='spellCutin')
let summaryTimer; // クリア集計画面の経過フレーム (state='clear' 突入で 0 リセット)
let finalStageIntroTimer; // 最終ステージ導入演出 (state='finalStageIntro') の残フレーム (360F)
let phase2IntroTimer;     // フェーズ2 突入カットイン (state='phase2Intro') の残フレーム (150F)
let finalBossDeathTimer;  // ラスボス撃破演出 (state='finalBossDeath') の残フレーム (180F)
// ステージ集計用 (startGame で 0、nextStage で更新)
let stageStartScore;
let stageStartGraze;
let bombsUsed;
let powerItemsCollected;
let collectPhase, collectPhaseTimer; // ボス撃破後のアイテム回収フェーズ
let score, life, power, lifeItemCount;
let frame = 0;                       // 初回タイトル描画時の NaN 化を避けるため明示的に 0 で初期化
let titleFirstFadeDone = false;      // タイトル初回表示時のメニューフェードインを 1 度だけ走らせるフラグ
let stageEnemiesKilled, stageEnemiesSpawned, stageEnemiesPassed, stageEnemyTotal, boss, bossActive, stageCleared;
let spawnTimer;
// 中ボス (Phase B)
let midBoss;          // オブジェクト or null
let midBossActive;    // 戦闘中フラグ
let midBossSpawned;   // このステージで既に出現したか (再トリガー防止)
let midBossIntroTimer; // state='midBossIntro' の残フレーム

const DIFFS = ['Easy', 'Normal', 'Hard'];
// 弾数倍率と弾速倍率を分離
const DIFF_BULLET = { Easy: 0.5, Normal: 0.75, Hard: 1.2 };  // 弾数倍率
const DIFF_SPEED  = { Easy: 0.75, Normal: 0.85, Hard: 1.0 }; // 弾速倍率
const DIFF_HP     = { Easy: 0.6, Normal: 1.0, Hard: 1.5 };   // ボスHP倍率

// ステージ数の枠 (MAX) と現在実装済みのステージ数 (IMPLEMENTED)。
// 全 5 ステージ実装済み。ステージ 5 (星詠) はラスボス、撃破で allClear へ。
const MAX_STAGES = 5;
const IMPLEMENTED_STAGES = 5;

function startGame(stage, fromBossOnly) {
  selectedStage = stage;
  bossOnlyMode = !!fromBossOnly;
  player = { x: PX + PW/2, y: PY + PH - 80, r: 6, hitR: 2, speed: 4, slowSpeed: 1.5, invuln: 0 };
  playerBullets = [];
  homingBullets = [];
  enemies = [];
  enemyBullets = [];
  items = [];
  particles = [];
  floatTexts = [];
  grazeCount = 0;
  grazeFlashTimer = 0;
  score = 0;
  life = 5;
  power = 0;
  lifeItemCount = 0;
  bombs = 3;             // ボム所持数
  bombActive = false;    // ボム発動中フラグ
  bombTimer = 0;         // ボム発動残り時間
  bombFlash = 0;         // ボム発動瞬間のフラッシュ強度
  screenFlash = 0;       // 画面フラッシュ強度
  hitStopFrames = 0;
  transitionTimer = 0;
  bossIntroTimer = 0;
  spellCutinTimer = 0;
  summaryTimer = 0;
  finalStageIntroTimer = 0;
  phase2IntroTimer = 0;
  finalBossDeathTimer = 0;
  stageStartScore = 0;
  stageStartGraze = 0;
  bombsUsed = 0;
  powerItemsCollected = 0;
  collectPhase = false;
  collectPhaseTimer = 0;
  frame = 0;
  stageEnemiesKilled = 0;
  stageEnemiesSpawned = 0;
  stageEnemiesPassed = 0;
  // ステージ5 (ラスボス) は雑魚なし → 0 体クリアで即ボス出現条件を満たす
  stageEnemyTotal = (stage === 5) ? 0 : 40;
  boss = null;
  bossActive = false;
  stageCleared = false;
  spawnTimer = 60;
  midBoss = null;
  midBossActive = false;
  midBossSpawned = false;
  midBossIntroTimer = 0;
  if (bossOnlyMode) {
    stageEnemiesSpawned = stageEnemyTotal;
    stageEnemiesKilled = stageEnemyTotal;
    startBossIntro();  // bossIntro 経由でボスを呼び出す (state='bossIntro' になる)
  } else if (stage === 5) {
    // ステージ5: 6秒の導入演出 → ラスボスカットインへ
    state = 'finalStageIntro';
    finalStageIntroTimer = 360;
  } else {
    state = 'play';
  }
}

// 次ステージ開始 (ステータス引き継ぎ)
function nextStage() {
  selectedStage++;
  // プレイヤー位置リセットだが残機・パワー・ボム・スコアは引き継ぎ
  player.x = PX + PW/2;
  player.y = PY + PH - 80;
  player.invuln = 60;
  // 戦場をクリア
  playerBullets = [];
  homingBullets = [];
  enemies = [];
  enemyBullets = [];
  items = [];
  particles = [];
  floatTexts = []; // grazeCount は引き継ぎ
  bombActive = false;
  bombTimer = 0;
  bombFlash = 0;
  screenFlash = 0;
  hitStopFrames = 0;
  bossIntroTimer = 0;
  spellCutinTimer = 0;
  summaryTimer = 0;
  // ステージ集計の起点を現在値に更新
  stageStartScore = score;
  stageStartGraze = grazeCount;
  bombsUsed = 0;
  powerItemsCollected = 0;
  // ステージ進行カウンタリセット
  stageEnemiesKilled = 0;
  stageEnemiesSpawned = 0;
  stageEnemiesPassed = 0;
  // ステージ5 は雑魚 0 体に切替
  stageEnemyTotal = (selectedStage === 5) ? 0 : 40;
  boss = null;
  bossActive = false;
  stageCleared = false;
  collectPhase = false;
  collectPhaseTimer = 0;
  spawnTimer = 60;
  // 中ボス: ステージごとに再出現 (ステージ5 は中ボスなし、stageEnemyTotal=0 で natural にスポーン条件外)
  midBoss = null;
  midBossActive = false;
  midBossSpawned = false;
  midBossIntroTimer = 0;
  finalStageIntroTimer = 0;
  phase2IntroTimer = 0;
  finalBossDeathTimer = 0;
  if (selectedStage === 5) {
    state = 'finalStageIntro';
    finalStageIntroTimer = 360;
  } else {
    state = 'play';
  }
}

function selectMenu() {
  if (state === 'title') {
    if (menuIndex === 0) {
      state = 'difficulty'; menuIndex = 1;
      selectedStage = 1; bossOnlyMode = false;
      cameViaStageSelect = false; // title 直行
    } else if (menuIndex === 1) { state = 'stageSelect'; menuIndex = 0; bossOnlyMode = false; }
    else if (menuIndex === 2) { state = 'stageSelect'; menuIndex = 0; bossOnlyMode = true; }
  } else if (state === 'stageSelect') {
    // 未実装ステージ (4, 5 など) は選択不可: 黙って何もしない
    if (menuIndex >= IMPLEMENTED_STAGES) return;
    selectedStage = menuIndex + 1;
    state = 'difficulty';
    menuIndex = 1;
    cameViaStageSelect = true; // stageSelect 経由
  } else if (state === 'difficulty') {
    selectedDifficulty = DIFFS[menuIndex];
    startGame(selectedStage, bossOnlyMode);
  }
}

// Esc / X / 左上タップでメニューを 1 つ前に戻す
function goBackFromMenu() {
  if (state === 'stageSelect') {
    state = 'title';
    // どの title 項目から来たかでカーソル位置を復元 (1=ステージ選択 / 2=ボスから遊ぶ)
    menuIndex = bossOnlyMode ? 2 : 1;
  } else if (state === 'difficulty') {
    if (cameViaStageSelect) {
      state = 'stageSelect';
      menuIndex = Math.max(0, Math.min(MAX_STAGES - 1, selectedStage - 1)); // ステージ番号 → menuIndex
    } else {
      state = 'title';
      menuIndex = 0; // "はじめから遊ぶ" にカーソル復帰
    }
  }
}

function handleClick(p) {
  if (state === 'title') {
    for (let i = 0; i < 3; i++) {
      const y = 360 + i * 60;
      if (p.y > y - 25 && p.y < y + 25 && p.x > 200 && p.x < 600) {
        menuIndex = i; selectMenu(); return;
      }
    }
  } else if (state === 'stageSelect' || state === 'difficulty') {
    // 左上の「← 戻る」ボタンタップ判定
    if (p.x >= 20 && p.x <= 160 && p.y >= 20 && p.y <= 80) {
      goBackFromMenu();
      return;
    }
    if (state === 'stageSelect') {
      // ステージ選択は MAX_STAGES 項目 (未実装は selectMenu 側でガード)
      for (let i = 0; i < MAX_STAGES; i++) {
        const y = 220 + i * 55;
        if (p.y > y - 27 && p.y < y + 27 && p.x > 200 && p.x < 600) {
          menuIndex = i; selectMenu(); return;
        }
      }
    } else { // difficulty: 3 項目固定
      for (let i = 0; i < 3; i++) {
        const y = 280 + i * 70;
        if (p.y > y - 30 && p.y < y + 30 && p.x > 200 && p.x < 600) {
          menuIndex = i; selectMenu(); return;
        }
      }
    }
  } else if (state === 'gameOver' || state === 'allClear') {
    state = 'title'; menuIndex = 0;
  } else if (state === 'clear') {
    if (bossOnlyMode) {
      state = 'title'; menuIndex = 0;
    } else if (selectedStage < IMPLEMENTED_STAGES) {
      startStageTransition();
    } else {
      state = 'allClear';
      saveHiScore(selectedDifficulty, score);
      saveGrazeRecord(selectedDifficulty, grazeCount);
    }
  }
  // 'transition' 中はクリック/タップを無視
}

// ステージ遷移演出を開始 (黒フェードイン → タイトルテロップ → フェードアウト)
function startStageTransition() {
  nextStage();             // ゲーム状態を次ステージにリセット (内部で state='play')
  state = 'transition';    // transition 状態で上書き
  transitionTimer = 150;   // 30フェードイン + 90タイトル + 30フェードアウト = 2.5s
}

function update() {
  frame++;
  // グレイズ時の HUD フラッシュ用 (visual-only、state に関係なく毎F減衰)
  if (grazeFlashTimer > 0) grazeFlashTimer--;

  if (state === 'play') {
    // ポーズ切替
    if (justPressed['p'] || justPressed['P'] || justPressed['Escape']) {
      state = 'paused';
      pauseMenuIndex = 0;
      for (const k in justPressed) justPressed[k] = false;
      return;
    }
    // ヒットストップ中: ゲームロジックは止めるが、視覚演出は継続
    if (hitStopFrames > 0) {
      hitStopFrames--;
      updateScreenFlash();
      updateParticles();
      updateFloatTexts();
      if (bombFlash > 0) bombFlash--;
      for (const k in justPressed) justPressed[k] = false;
      return;
    }
    updatePlayer();
    updateBomb();
    updateScreenFlash();
    firePlayerBullets();
    updatePlayerBullets();
    updateHomingBullets();
    maybeSpawnEnemy();
    updateEnemies();
    updateMidBoss();
    updateBoss();
    fadeOutEnemyBullets();
    checkPlayerBulletHits();
    countAndFilterEnemies();
    checkMidBossSpawnTrigger();
    checkBossSpawnTrigger();
    moveAndFilterEnemyBullets();
    checkEnemyBulletPlayerCollision();
    checkEnemyPlayerCollision();
    checkMidBossPlayerCollision();
    checkBossPlayerCollision();
    updateItems();
    updateCollectPhase();
    updateParticles();
    updateFloatTexts();
  }

  if (state === 'title' || state === 'stageSelect' || state === 'difficulty') {
    if (justPressed['ArrowUp']) menuIndex--;
    if (justPressed['ArrowDown']) menuIndex++;
    // 項目数は state ごと: stageSelect は MAX_STAGES、それ以外は 3
    const itemCount = state === 'stageSelect' ? MAX_STAGES : 3;
    menuIndex = (menuIndex + itemCount) % itemCount;
    if (justPressed['z'] || justPressed['Z'] || justPressed['Enter'] || justPressed[' ']) selectMenu();
    // Esc / X で 1つ前に戻る (title はルートなので除外)
    if ((justPressed['Escape'] || justPressed['x'] || justPressed['X']) && state !== 'title') {
      goBackFromMenu();
    }
  }
  if (state === 'paused') {
    if (justPressed['ArrowUp']) pauseMenuIndex--;
    if (justPressed['ArrowDown']) pauseMenuIndex++;
    pauseMenuIndex = (pauseMenuIndex + 2) % 2;
    if (justPressed['p'] || justPressed['P'] || justPressed['Escape']) {
      state = 'play'; // ポーズキー再押下で再開
    } else if (justPressed['z'] || justPressed['Z'] || justPressed['Enter']) {
      if (pauseMenuIndex === 0) state = 'play';
      else { state = 'title'; menuIndex = 0; }
    }
  }
  if (state === 'gameOver' || state === 'allClear') {
    if (justPressed['z'] || justPressed['Z'] || justPressed['Enter']) {
      state = 'title'; menuIndex = 0;
    }
  }
  if (state === 'clear') {
    if (justPressed['z'] || justPressed['Z'] || justPressed['Enter']) {
      // ボスのみモードならタイトルへ
      if (bossOnlyMode) {
        state = 'title'; menuIndex = 0;
      } else if (selectedStage < IMPLEMENTED_STAGES) {
        // 次ステージへ遷移演出を挟む (スコア・残機・パワー・ボムは nextStage で引き継ぎ)
        startStageTransition();
      } else {
        // 最終実装ステージクリア = 全クリア
        state = 'allClear';
        saveHiScore(selectedDifficulty, score);
        saveGrazeRecord(selectedDifficulty, grazeCount);
      }
    }
  }
  if (state === 'transition') {
    // transition 中は入力受付なし、自動進行
    transitionTimer--;
    if (transitionTimer <= 0) {
      if (selectedStage === 5) {
        // ステージ5 はラスボス前の 6 秒導入演出へ
        state = 'finalStageIntro';
        finalStageIntroTimer = 360;
      } else {
        state = 'play';
      }
    }
  }
  if (state === 'bossIntro') {
    // Z/Enter/space/タップでスキップ可
    if (justPressed['z'] || justPressed['Z'] || justPressed['Enter'] || justPressed[' ']) {
      bossIntroTimer = 0;
    }
    bossIntroTimer--;
    // 自機の移動のみ受け付ける (発射・無敵減衰なし、衝突判定なし)
    const slowMode = isSlowMode();
    const speed = slowMode ? player.slowSpeed : player.speed;
    if (!touchActive) {
      if (keys['ArrowLeft']) player.x -= speed;
      if (keys['ArrowRight']) player.x += speed;
      if (keys['ArrowUp']) player.y -= speed;
      if (keys['ArrowDown']) player.y += speed;
    }
    player.x = clamp(player.x, PX+10, PX+PW-10);
    player.y = clamp(player.y, PY+10, PY+PH-10);
    // 弾は徐々にフェードアウトしつつ慣性で動く (衝突判定はしない)
    fadeOutEnemyBullets();
    moveAndFilterEnemyBullets();
    updatePlayerBullets();
    updateHomingBullets();
    // 視覚演出は継続
    updateScreenFlash();
    updateParticles();
    updateFloatTexts();
    if (bombFlash > 0) bombFlash--;
    if (bossIntroTimer <= 0) {
      spawnBoss();
      state = 'play';
    }
  }
  if (state === 'spellCutin') {
    // Z/Enter/space/タップでスキップ可
    if (justPressed['z'] || justPressed['Z'] || justPressed['Enter'] || justPressed[' ']) {
      spellCutinTimer = 0;
    }
    spellCutinTimer--;
    // ヒットストップ準拠: 弾と自機は完全停止、視覚演出のみ継続
    fadeOutEnemyBullets(); // フェードアウト処理 (動きはなし)
    updateScreenFlash();
    updateParticles();
    updateFloatTexts();
    if (bombFlash > 0) bombFlash--;
    if (spellCutinTimer <= 0) {
      state = 'play';
    }
  }
  if (state === 'midBossIntro') {
    // Z/Enter/space/タップでスキップ可
    if (justPressed['z'] || justPressed['Z'] || justPressed['Enter'] || justPressed[' ']) {
      midBossIntroTimer = 0;
    }
    midBossIntroTimer--;
    // bossIntro と同じ振る舞い: 自機は移動可、弾は慣性+フェード、衝突判定なし
    const slowMode = isSlowMode();
    const speed = slowMode ? player.slowSpeed : player.speed;
    if (!touchActive) {
      if (keys['ArrowLeft']) player.x -= speed;
      if (keys['ArrowRight']) player.x += speed;
      if (keys['ArrowUp']) player.y -= speed;
      if (keys['ArrowDown']) player.y += speed;
    }
    player.x = clamp(player.x, PX+10, PX+PW-10);
    player.y = clamp(player.y, PY+10, PY+PH-10);
    fadeOutEnemyBullets();
    moveAndFilterEnemyBullets();
    updatePlayerBullets();
    updateHomingBullets();
    updateScreenFlash();
    updateParticles();
    updateFloatTexts();
    if (bombFlash > 0) bombFlash--;
    if (midBossIntroTimer <= 0) {
      state = 'play';
    }
  }
  if (state === 'finalStageIntro') {
    // ラスボス前の 6 秒導入: 自機は移動・弾発射可、敵なし、被弾なし。
    // タイマー満了で startBossIntro() (state='bossIntro' は 240F 化される) へ。
    if (justPressed['p'] || justPressed['P'] || justPressed['Escape']) {
      state = 'paused'; pauseMenuIndex = 0;
      for (const k in justPressed) justPressed[k] = false;
      return;
    }
    finalStageIntroTimer--;
    updatePlayer();
    firePlayerBullets();
    updatePlayerBullets();
    updateHomingBullets();
    updateScreenFlash();
    updateParticles();
    updateFloatTexts();
    if (bombFlash > 0) bombFlash--;
    if (finalStageIntroTimer <= 0) {
      // 弾を全クリアしてからボス出現カットインへ
      enemyBullets = [];
      startBossIntro();
    }
  }
  if (state === 'phase2Intro') {
    // フェーズ2 突入カットイン: hitstop 同等、入力受付はスキップのみ。
    if (justPressed['z'] || justPressed['Z'] || justPressed['Enter'] || justPressed[' ']) {
      phase2IntroTimer = 0;
    }
    phase2IntroTimer--;
    fadeOutEnemyBullets();
    updateScreenFlash();
    updateParticles();
    updateFloatTexts();
    if (bombFlash > 0) bombFlash--;
    if (phase2IntroTimer <= 0) {
      state = 'play';
    }
  }
  if (state === 'finalBossDeath') {
    // ラスボス撃破演出: 入力一切無視、180F 後に allClear へ。
    // hitStopFrames が startFinalBossDeath で 60 セットされているので最初の 1 秒は完全停止。
    if (hitStopFrames > 0) {
      hitStopFrames--;
      updateScreenFlash();
      updateParticles();
      updateFloatTexts();
      if (bombFlash > 0) bombFlash--;
      finalBossDeathTimer--;
      if (finalBossDeathTimer <= 0) {
        state = 'allClear';
      }
      for (const k in justPressed) justPressed[k] = false;
      return;
    }
    finalBossDeathTimer--;
    updateScreenFlash();
    updateParticles();
    updateFloatTexts();
    if (bombFlash > 0) bombFlash--;
    if (finalBossDeathTimer <= 0) {
      boss = null; // 描画レイヤーから外す (drawAllClear が背景画像を担当)
      state = 'allClear';
    }
  }
  if (state === 'clear') {
    summaryTimer++;
  }
  for (const k in justPressed) justPressed[k] = false;
}

function draw() {
  ctx.fillStyle = '#1a0010';
  ctx.fillRect(0, 0, W, H);
  if (state === 'title') drawTitle();
  else if (state === 'stageSelect') drawStageSelect();
  else if (state === 'difficulty') drawDifficulty();
  else drawGame();
  drawFpsCounter();
}

// ── FPS 計測 + 表示 ──
// 0.5 秒ごとにサンプル更新、HUD 領域右下に表示 (デフォルト ON、F3 で切替)。
let _fpsLast = (typeof performance !== 'undefined') ? performance.now() : Date.now();
let _fpsFrames = 0;
let fpsValue = 60;
let fpsVisible = loadFpsVisible(); // 初期値は localStorage から復元 (storage.js)

function updateFpsCounter() {
  _fpsFrames++;
  const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
  const elapsed = now - _fpsLast;
  if (elapsed >= 500) {
    fpsValue = (_fpsFrames * 1000) / elapsed;
    _fpsFrames = 0;
    _fpsLast = now;
  }
}

function drawFpsCounter() {
  if (!fpsVisible) return;
  ctx.save();
  ctx.fillStyle = '#888';
  ctx.font = '12px monospace';
  ctx.textAlign = 'right';
  // HUD 領域の右下、操作説明の下
  ctx.fillText(`FPS: ${fpsValue.toFixed(1)}`, HX + HW - 8, HY + HH - 8);
  ctx.restore();
}

function drawGame() {
  ctx.save();
  ctx.beginPath();
  ctx.rect(PX, PY, PW, PH);
  ctx.clip();

  drawStageBackground(selectedStage);
  drawPOCLine();
  drawPlayerBullets();
  drawHomingBullets();
  drawItems();
  drawEnemies();
  drawMidBoss();
  drawBoss();
  drawEnemyBullets();
  drawParticles();
  drawPlayer();
  drawFloatTexts();
  drawBombShockwave();
  drawBombFlash();
  drawScreenFlash();

  ctx.restore();

  ctx.strokeStyle = '#aa66aa';
  ctx.lineWidth = 2;
  ctx.strokeRect(PX, PY, PW, PH);

  drawMidBossHpBar();
  drawBossHpBar();
  drawEnduranceOverlay();
  drawSpellAnnounce();
  drawSlowModeLabel();
  drawMobileBombButton();
  drawMobilePauseButton();
  drawHUD();
  drawStateOverlays();
}

// 60fps 固定キャップ: 高リフレッシュレート (120Hz の ProMotion 等) でも update が
// 約 60Hz で回るように、前回 update から 16.67ms 経つまでは新しい update をスキップする。
// 描画は update が走った時だけ呼ぶ (60Hz 表示と同等。120Hz 上では 1フレーム置きに描画)。
const FIXED_DT_MS = 1000 / 60;
const UPDATE_THRESHOLD_MS = FIXED_DT_MS - 1; // 60Hz の僅かな揺れも吸収するためのトレランス
let _loopLastUpdateMs = 0;

function loop() {
  const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
  if (_loopLastUpdateMs === 0) _loopLastUpdateMs = now - FIXED_DT_MS; // 初回は即 update
  if (now - _loopLastUpdateMs >= UPDATE_THRESHOLD_MS) {
    _loopLastUpdateMs = now;
    updateFpsCounter();
    update();
    draw();
  }
  requestAnimationFrame(loop);
}
