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

let player, playerBullets, homingBullets, enemies, enemyBullets, items, particles;
let floatTexts; // スコア取得時のフローティングテキスト
let bombs, bombActive, bombTimer; // ボム機能用
let bombFlash; // ボム発動瞬間の全画面フラッシュ強度 (0〜30)
let screenFlash; // 被弾時など画面演出用
let hitStopFrames; // ヒットストップ残フレーム数 (>0 中はゲームロジック停止)
let transitionTimer; // ステージ遷移演出の残フレーム (>0 中は state='transition')
let collectPhase, collectPhaseTimer; // ボス撃破後のアイテム回収フェーズ
let score, life, power, lifeItemCount, frame;
let stageEnemiesKilled, stageEnemiesSpawned, stageEnemiesPassed, stageEnemyTotal, boss, bossActive, stageCleared;
let spawnTimer;

const DIFFS = ['Easy', 'Normal', 'Hard'];
// 弾数倍率と弾速倍率を分離
const DIFF_BULLET = { Easy: 0.5, Normal: 0.75, Hard: 1.2 };  // 弾数倍率
const DIFF_SPEED  = { Easy: 0.75, Normal: 0.85, Hard: 1.0 }; // 弾速倍率
const DIFF_HP     = { Easy: 0.6, Normal: 1.0, Hard: 1.5 };   // ボスHP倍率

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
  collectPhase = false;
  collectPhaseTimer = 0;
  frame = 0;
  stageEnemiesKilled = 0;
  stageEnemiesSpawned = 0;
  stageEnemiesPassed = 0;
  stageEnemyTotal = 40; // 40体
  boss = null;
  bossActive = false;
  stageCleared = false;
  spawnTimer = 60;
  if (bossOnlyMode) {
    stageEnemiesSpawned = stageEnemyTotal;
    stageEnemiesKilled = stageEnemyTotal;
    spawnBoss();
  }
  state = 'play';
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
  floatTexts = [];
  bombActive = false;
  bombTimer = 0;
  bombFlash = 0;
  screenFlash = 0;
  hitStopFrames = 0;
  // ステージ進行カウンタリセット
  stageEnemiesKilled = 0;
  stageEnemiesSpawned = 0;
  stageEnemiesPassed = 0;
  boss = null;
  bossActive = false;
  stageCleared = false;
  collectPhase = false;
  collectPhaseTimer = 0;
  spawnTimer = 60;
  state = 'play';
}

function selectMenu() {
  if (state === 'title') {
    if (menuIndex === 0) { state = 'difficulty'; menuIndex = 1; selectedStage = 1; bossOnlyMode = false; }
    else if (menuIndex === 1) { state = 'stageSelect'; menuIndex = 0; bossOnlyMode = false; }
    else if (menuIndex === 2) { state = 'stageSelect'; menuIndex = 0; bossOnlyMode = true; }
  } else if (state === 'stageSelect') {
    selectedStage = menuIndex + 1;
    state = 'difficulty';
    menuIndex = 1;
  } else if (state === 'difficulty') {
    selectedDifficulty = DIFFS[menuIndex];
    startGame(selectedStage, bossOnlyMode);
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
    for (let i = 0; i < 3; i++) {
      const y = 280 + i * 70;
      if (p.y > y - 30 && p.y < y + 30 && p.x > 200 && p.x < 600) {
        menuIndex = i; selectMenu(); return;
      }
    }
  } else if (state === 'gameOver' || state === 'allClear') {
    state = 'title'; menuIndex = 0;
  } else if (state === 'clear') {
    if (bossOnlyMode) {
      state = 'title'; menuIndex = 0;
    } else if (selectedStage < 3) {
      startStageTransition();
    } else {
      state = 'allClear';
      saveHiScore(selectedDifficulty, score);
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
    updateBoss();
    fadeOutEnemyBullets();
    checkPlayerBulletHits();
    countAndFilterEnemies();
    checkBossSpawnTrigger();
    moveAndFilterEnemyBullets();
    checkEnemyBulletPlayerCollision();
    checkEnemyPlayerCollision();
    checkBossPlayerCollision();
    updateItems();
    updateCollectPhase();
    updateParticles();
    updateFloatTexts();
  }

  if (state === 'title' || state === 'stageSelect' || state === 'difficulty') {
    if (justPressed['ArrowUp']) menuIndex--;
    if (justPressed['ArrowDown']) menuIndex++;
    menuIndex = (menuIndex + 3) % 3;
    if (justPressed['z'] || justPressed['Z'] || justPressed['Enter'] || justPressed[' ']) selectMenu();
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
      } else if (selectedStage < 3) {
        // 次ステージへ遷移演出を挟む (スコア・残機・パワー・ボムは nextStage で引き継ぎ)
        startStageTransition();
      } else {
        // 3クリア = 全クリア
        state = 'allClear';
        saveHiScore(selectedDifficulty, score);
      }
    }
  }
  if (state === 'transition') {
    // transition 中は入力受付なし、自動進行
    transitionTimer--;
    if (transitionTimer <= 0) {
      state = 'play';
    }
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

  drawBossHpBar();
  drawSpellAnnounce();
  drawSlowModeLabel();
  drawMobileBombButton();
  drawMobilePauseButton();
  drawHUD();
  drawStateOverlays();
}

function loop() { update(); draw(); requestAnimationFrame(loop); }
