// 画像アセット管理
// 各画像は読み込み完了まで ready=false のためフォールバック描画される
// 読み込み失敗時 (404 等) は failed=true で永続的にフォールバック

const IMAGES = {};

function loadImage(key, src) {
  const img = new Image();
  const entry = { img, ready: false, failed: false };
  img.onload = () => { entry.ready = true; };
  img.onerror = () => {
    entry.failed = true;
    console.warn('Image load failed, fallback to shape rendering:', src);
  };
  img.src = src;
  IMAGES[key] = entry;
}

// 中心 (cx, cy) に size x size の矩形でフィット描画 (縦横比保持)
// 描画できたら true、未ロード/失敗なら false (呼び出し側がフォールバック描画)
function drawImageCentered(key, cx, cy, size) {
  const e = IMAGES[key];
  if (!e || !e.ready || e.failed) return false;
  const img = e.img;
  const ratio = Math.min(size / img.width, size / img.height);
  const w = img.width * ratio;
  const h = img.height * ratio;
  ctx.drawImage(img, cx - w/2, cy - h/2, w, h);
  return true;
}

// 全アセットの読み込みを開始 (script ロード時に並列で開始)
loadImage('player',        'assets/player.png');
loadImage('enemy_normal',  'assets/enemies/normal.png');
loadImage('enemy_spread',  'assets/enemies/spread.png');
loadImage('enemy_fast',    'assets/enemies/fast.png');
loadImage('enemy_swayer',  'assets/enemies/swayer.png');
loadImage('enemy_tank',    'assets/enemies/tank.png');
loadImage('boss_stage1',   'assets/bosses/stage1.png');
loadImage('boss_stage2',   'assets/bosses/stage2.png');
loadImage('boss_stage3',   'assets/bosses/stage3.png');
