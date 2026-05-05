// 入力処理 (キーボード・マウス・タッチ)

const keys = {};
const justPressed = {};
window.addEventListener('keydown', e => {
  if (!keys[e.key]) justPressed[e.key] = true;
  keys[e.key] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter','z','Z','x','X','p','P','Escape','Shift'].includes(e.key)) e.preventDefault();
  // F3: FPS 表示切替 (ブラウザ既定の検索バー起動を抑制)
  if (e.key === 'F3') {
    e.preventDefault();
    fpsVisible = !fpsVisible;
    saveFpsVisible(fpsVisible);
  }
});
window.addEventListener('keyup', e => keys[e.key] = false);
// Shift特別対応 (左右どちらも)
window.addEventListener('keydown', e => {
  if (e.key === 'Shift') keys['Shift'] = true;
});
window.addEventListener('keyup', e => {
  if (e.key === 'Shift') keys['Shift'] = false;
});

// 相対ドラッグ方式: 画面のどこに触れても、その瞬間のポインタ位置 (anchor) と
// 自機位置 (playerAnchor) を起点に、移動分 (delta) を自機位置に加算する。
// canvas 上ならプレイ領域外 (HUD 領域、上下左右の余白) でもドラッグ開始可能。
// touch / mouse の両方で同じ動作。
let touchActive = false;
let touchAnchorX = 0, touchAnchorY = 0;   // ドラッグ開始時のポインタ位置 (canvas 座標)
let playerAnchorX = 0, playerAnchorY = 0; // ドラッグ開始時の自機位置
let touchSlowMode = false;
let touchStartTime = 0;
let mouseDragActive = false;              // マウスドラッグ用 (touch とは独立に管理)

function getCanvasPos(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (W / rect.width),
    y: (clientY - rect.top) * (H / rect.height)
  };
}

// state='play' で canvas 内のどこを始点にしても自機ドラッグを開始するヘルパー。
// ※プレイ領域内かどうかの座標判定は意図的に持たない (canvas 内ならどこでも OK)。
function startPlayerDrag(p) {
  touchAnchorX = p.x;
  touchAnchorY = p.y;
  playerAnchorX = player.x;
  playerAnchorY = player.y;
  touchActive = true;
  touchStartTime = Date.now();
}

// 相対ドラッグの自機位置更新 (touchmove / mousemove 共通)
function updatePlayerFromDrag(p) {
  const dx = p.x - touchAnchorX;
  const dy = p.y - touchAnchorY;
  player.x = clamp(playerAnchorX + dx, PX+10, PX+PW-10);
  player.y = clamp(playerAnchorY + dy, PY+10, PY+PH-10);
}

// touchstart / mousedown 共通の入力ディスパッチ。
//   1. state='play' のボム / ポーズボタン (canvas 内、判定は座標限定)
//   2. カットイン系の state はタップでスキップ
//   3. paused のメニュー項目タップ
//   4. それ以外で state='play' なら → どこでもドラッグ開始
//   5. それ以外なら handleClick (タイトル/ステージ選択/難易度等のメニュー)
// 返値 true は「ボタン/メニュー扱いで処理済み (ドラッグ開始しない)」、
// false は「ドラッグ開始した or 何もしなかった」。
function handlePointerDown(p) {
  // ボム / ポーズボタンは canvas 内の特定座標限定 (state='play' のみ)
  if (state === 'play') {
    const bx = PX + PW - 50, by = PY + PH - 50;
    if (Math.hypot(p.x - bx, p.y - by) < 38) { useBomb(); return true; }
    const px2 = PX + PW - 30, py2 = PY + 30;
    if (Math.hypot(p.x - px2, p.y - py2) < 28) {
      state = 'paused'; pauseMenuIndex = 0; return true;
    }
  }
  // カットインスキップ
  if (state === 'bossIntro')   { bossIntroTimer = 0;    return true; }
  if (state === 'spellCutin')  { spellCutinTimer = 0;   return true; }
  if (state === 'midBossIntro'){ midBossIntroTimer = 0; return true; }
  // ポーズ画面のメニュー項目タップ
  if (state === 'paused') {
    const cx = PX + PW/2;
    const cyBase = PY + PH/2;
    for (let i = 0; i < 2; i++) {
      const yy = cyBase + i * 50;
      if (p.y > yy - 25 && p.y < yy + 25 && p.x > cx - 120 && p.x < cx + 120) {
        pauseMenuIndex = i;
        if (i === 0) state = 'play';
        else { state = 'title'; menuIndex = 0; }
        return true;
      }
    }
    // メニュー項目外のタップは何もしない (paused ではドラッグ開始もさせない)
    return true;
  }
  // ↑ ここまで早期 return しなかった場合:
  //   - state='play' なら canvas のどこを触っても OK でドラッグ開始
  //   - その他 (title / stageSelect / difficulty / clear / gameOver / allClear / transition)
  //     は handleClick へ
  if (state === 'play') {
    startPlayerDrag(p);
    return false;
  }
  handleClick(p);
  return false;
}

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (e.touches.length >= 2) touchSlowMode = true;
  const t = e.touches[0];
  const p = getCanvasPos(t.clientX, t.clientY);
  handlePointerDown(p);
}, { passive: false });

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (!touchActive) return;
  if (e.touches.length >= 2) touchSlowMode = true;
  const t = e.touches[0];
  const p = getCanvasPos(t.clientX, t.clientY);
  updatePlayerFromDrag(p);
}, { passive: false });

canvas.addEventListener('touchend', e => {
  e.preventDefault();
  if (e.touches.length === 0) {
    touchActive = false;
    touchSlowMode = false;
  }
}, { passive: false });

// マウスでも touch と同じ相対ドラッグを実装 (PC でも動作確認しやすく、
// DevTools のモバイルエミュレーションでも touchstart 相当が反応する)。
canvas.addEventListener('mousedown', e => {
  // 左ボタンのみ
  if (e.button !== 0) return;
  const p = getCanvasPos(e.clientX, e.clientY);
  const handledByButton = handlePointerDown(p);
  // touchActive が立った場合 (state='play' のドラッグ開始) はマウス用フラグもセット
  if (!handledByButton && touchActive) {
    mouseDragActive = true;
  }
});

window.addEventListener('mousemove', e => {
  if (!mouseDragActive || !touchActive) return;
  const p = getCanvasPos(e.clientX, e.clientY);
  updatePlayerFromDrag(p);
});

window.addEventListener('mouseup', e => {
  if (!mouseDragActive) return;
  mouseDragActive = false;
  touchActive = false;
});

// click は menu 用 (title / stageSelect / difficulty 等)。
// state='play' で mousedown→mouseup の単発クリックの場合、touchActive が立った後に
// mouseup で false に戻るのでドラッグ自体は無害。click は handleClick に流れるが、
// handleClick は 'play' を扱わないので何もしない。
canvas.addEventListener('click', e => {
  const p = getCanvasPos(e.clientX, e.clientY);
  if (state !== 'play') handleClick(p);
});

function isSlowMode() {
  return keys['Shift'] || touchSlowMode;
}
