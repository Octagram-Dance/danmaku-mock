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

let touchActive = false, touchOffsetX = 0, touchOffsetY = 0;
let touchSlowMode = false;
let touchStartTime = 0;
function getCanvasPos(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (W / rect.width),
    y: (clientY - rect.top) * (H / rect.height)
  };
}
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  // 2本指で低速モード
  if (e.touches.length >= 2) {
    touchSlowMode = true;
  }
  const t = e.touches[0];
  const p = getCanvasPos(t.clientX, t.clientY);
  // ボムボタン判定 (右下)
  if (state === 'play') {
    const bx = PX + PW - 50, by = PY + PH - 50;
    if (Math.hypot(p.x - bx, p.y - by) < 32) {
      useBomb();
      return;
    }
    // ポーズボタン判定 (右上)
    const px2 = PX + PW - 30, py2 = PY + 30;
    if (Math.hypot(p.x - px2, p.y - py2) < 22) {
      state = 'paused';
      pauseMenuIndex = 0;
      return;
    }
  }
  // ボス出現カットイン中: タップでスキップ
  if (state === 'bossIntro') {
    bossIntroTimer = 0;
    return;
  }
  // スペルカード突入カットイン中: タップでスキップ
  if (state === 'spellCutin') {
    spellCutinTimer = 0;
    return;
  }
  // 中ボス出現カットイン中: タップでスキップ
  if (state === 'midBossIntro') {
    midBossIntroTimer = 0;
    return;
  }
  // ポーズ画面のメニュータップ
  if (state === 'paused') {
    const cx = PX + PW/2;
    const cyBase = PY + PH/2;
    for (let i = 0; i < 2; i++) {
      const yy = cyBase + i * 50;
      if (p.y > yy - 25 && p.y < yy + 25 && p.x > cx - 120 && p.x < cx + 120) {
        pauseMenuIndex = i;
        if (i === 0) state = 'play';
        else { state = 'title'; menuIndex = 0; }
        return;
      }
    }
  }
  if (state === 'play' && p.x >= PX && p.x <= PX+PW && p.y >= PY && p.y <= PY+PH) {
    touchOffsetX = player.x - p.x;
    touchOffsetY = player.y - p.y;
    touchActive = true;
    touchStartTime = Date.now();
  } else {
    handleClick(p);
  }
}, { passive: false });
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (!touchActive) return;
  if (e.touches.length >= 2) touchSlowMode = true;
  const t = e.touches[0];
  const p = getCanvasPos(t.clientX, t.clientY);
  player.x = clamp(p.x + touchOffsetX, PX+10, PX+PW-10);
  player.y = clamp(p.y + touchOffsetY, PY+10, PY+PH-10);
}, { passive: false });
canvas.addEventListener('touchend', e => {
  e.preventDefault();
  if (e.touches.length === 0) {
    touchActive = false;
    touchSlowMode = false;
  }
}, { passive: false });
canvas.addEventListener('click', e => {
  const p = getCanvasPos(e.clientX, e.clientY);
  handleClick(p);
});

function isSlowMode() {
  return keys['Shift'] || touchSlowMode;
}
