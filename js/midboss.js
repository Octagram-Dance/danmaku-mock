// 中ボス (Phase B)
// ステージ序盤の進行 (雑魚20体到達) で出現する、本ボスの簡易版。
// 1 種類のスペル + 単発戦闘 (HP バーは 1 本)。撃破で +10000 + Pアイテム5個。

// ステージ別の中ボス情報 + shoot 関数
//   shoot は (mb, t, speedMul, bulletMul) を取り、boss と同じ呼び出し規約。

// 1-1 妖精「魔法の輪舞」: 円形に弾を放出、弾が螺旋を描きながら広がる
function midShoot_s1(mb, t, speedMul, bulletMul) {
  if (t % 12 !== 0) return;
  const arms = Math.max(6, Math.round(8 * bulletMul));
  const baseRot = t * 0.04;
  for (let i = 0; i < arms; i++) {
    const a = baseRot + i * Math.PI * 2 / arms;
    enemyBullets.push({
      x: mb.x, y: mb.y,
      vx: Math.cos(a) * 1.3 * speedMul,
      vy: Math.sin(a) * 1.3 * speedMul,
      r: 5, color: '#88aaff',
      omega: 0.025,
      omegaDecay: 0.96
    });
  }
}

// 2-1 雪魔「凍りつく嘲笑」: 大粒の遅い自機狙い + 横から流れる小弾
function midShoot_s2(mb, t, speedMul, bulletMul) {
  // 大粒の自機狙い扇 (24F ごと)
  if (t % 24 === 0) {
    const dx = player.x - mb.x, dy = player.y - mb.y;
    const baseA = Math.atan2(dy, dx);
    const n = Math.max(2, Math.round(3 * bulletMul));
    for (let i = 0; i < n; i++) {
      const a = baseA + (i - (n - 1) / 2) * 0.18;
      enemyBullets.push({
        x: mb.x, y: mb.y,
        vx: Math.cos(a) * 1.4 * speedMul,
        vy: Math.sin(a) * 1.4 * speedMul,
        r: 7, color: '#88ddff'
      });
    }
  }
  // 横方向から小弾の波 (60F ごと、左右交互)
  if (t > 0 && t % 60 === 30) {
    const fromLeft = (Math.floor(t / 60) % 2) === 0;
    const startX = fromLeft ? PX - 10 : PX + PW + 10;
    const vx = (fromLeft ? 2.6 : -2.6) * speedMul;
    const baseY = clamp(player.y - 80, PY + 80, PY + PH - 100);
    const n = 4;
    for (let i = 0; i < n; i++) {
      enemyBullets.push({
        x: startX,
        y: baseY + i * 30,
        vx, vy: 0.2 * speedMul,
        r: 4, color: '#bbeeff'
      });
    }
  }
}

// 3-1 狐火「九尾の幻惑」: 9 方向に火の玉を放射、各弾が緩やかに回転
function midShoot_s3(mb, t, speedMul, bulletMul) {
  if (t % 30 !== 0) return;
  const arms = 9;
  const baseRot = t * 0.03;
  for (let i = 0; i < arms; i++) {
    const a = baseRot + i * Math.PI * 2 / arms;
    enemyBullets.push({
      x: mb.x, y: mb.y,
      vx: Math.cos(a) * 1.5 * speedMul,
      vy: Math.sin(a) * 1.5 * speedMul,
      r: 5, color: '#ffaa44',
      omega: 0.018,
      omegaDecay: 0.97
    });
  }
}

// 4-1 雷符「太鼓の波動」: 太鼓を打って円形衝撃波 + 縦の線雷
//   サイクル 90F:
//     +24F: 「打つ」予兆 — 太鼓中心へ粒子が収束
//     +30F: ドン! — 24方向 shockwave + 上空からプレイヤー周辺に縦雷 3本
//     +60F: 二度打ち — 16方向の少しオフセットした波
//     その他: 24Fごとに自機狙いの単発
function midShoot_s4(mb, t, speedMul, bulletMul) {
  // 予兆: 6F前にドラムへ粒子が寄ってくる
  if (t % 90 === 24) {
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 22;
      particles.push({
        x: mb.x + Math.cos(a) * dist,
        y: mb.y + Math.sin(a) * dist,
        vx: -Math.cos(a) * (dist / 6),
        vy: -Math.sin(a) * (dist / 6),
        life: 6,
        color: '#ffcc44'
      });
    }
  }
  // ドン! — 円形 shockwave + 縦雷
  if (t % 90 === 30) {
    explode(mb.x, mb.y, '#ffcc44', 28);
    const N = Math.max(18, Math.round(24 * bulletMul));
    for (let i = 0; i < N; i++) {
      const a = i * Math.PI * 2 / N;
      enemyBullets.push({
        x: mb.x, y: mb.y,
        vx: Math.cos(a) * 1.8 * speedMul,
        vy: Math.sin(a) * 1.8 * speedMul,
        r: 5, color: '#ffcc44'
      });
    }
    // 上空から落ちる縦雷 (プレイヤー周辺3本)
    for (let i = -1; i <= 1; i++) {
      const xx = clamp(player.x + i * 80, PX + 20, PX + PW - 20);
      enemyBullets.push({
        x: xx, y: PY - 10,
        vx: 0,
        vy: 4.4 * speedMul,
        r: 5, color: '#ffffff'
      });
    }
  }
  // 二度打ち
  if (t % 90 === 60) {
    const N = Math.max(12, Math.round(16 * bulletMul));
    for (let i = 0; i < N; i++) {
      const a = i * Math.PI * 2 / N + 0.196; // 11°オフセットで隙間を埋める
      enemyBullets.push({
        x: mb.x, y: mb.y,
        vx: Math.cos(a) * 2.4 * speedMul,
        vy: Math.sin(a) * 2.4 * speedMul,
        r: 4, color: '#aabbff'
      });
    }
  }
  // 通常時の自機狙い単発
  if (t % 24 === 0) {
    const phase = t % 90;
    if (phase < 24 || phase > 65) {
      const dx = player.x - mb.x, dy = player.y - mb.y;
      const a = Math.atan2(dy, dx);
      enemyBullets.push({
        x: mb.x, y: mb.y,
        vx: Math.cos(a) * 1.6 * speedMul,
        vy: Math.sin(a) * 1.6 * speedMul,
        r: 4, color: '#ffeeaa'
      });
    }
  }
}

const MID_BOSS_BY_STAGE = {
  1: { name: '青妖精',   spellName: '妖精「魔法の輪舞」',   color: '#88aaff', shoot: midShoot_s1 },
  2: { name: '雪魔',     spellName: '雪魔「凍りつく嘲笑」', color: '#88ddff', shoot: midShoot_s2 },
  3: { name: '九尾狐',   spellName: '狐火「九尾の幻惑」',   color: '#ffaa44', shoot: midShoot_s3 },
  4: { name: '雷童子',   spellName: '雷符「太鼓の波動」',   color: '#ffcc44', shoot: midShoot_s4 }
};
// ステージ 5 のプレースホルダ (本実装まではステージ 3 の中ボスを流用)
MID_BOSS_BY_STAGE[5] = MID_BOSS_BY_STAGE[3];

// state='midBossIntro' に遷移し、90F の出現演出後に通常戦闘へ。
// 中ボス本体はこの瞬間に上画面外に生成され、state='play' 復帰後にスライドダウンする。
function startMidBossIntro() {
  spawnMidBoss();
  state = 'midBossIntro';
  midBossIntroTimer = 90;
  midBossSpawned = true;
}

function spawnMidBoss() {
  const cfg = MID_BOSS_BY_STAGE[selectedStage] || MID_BOSS_BY_STAGE[1];
  const dm = DIFF_HP[selectedDifficulty];
  midBoss = {
    x: PX + PW / 2,
    y: PY - 60,                           // 画面外 (上方) からスタート
    r: 28,
    hp: Math.floor(120 * dm),     // 旧 40*dm から 3 倍
    maxHp: Math.floor(120 * dm),
    name: cfg.name,
    spellName: cfg.spellName,
    color: cfg.color,
    shoot: cfg.shoot,
    patternTimer: 0,
    moveTimer: 0,
    targetX: PX + PW / 2,
    targetY: PY + 100,                    // 着地点 (上部 1/3)
    entering: true                        // 入場中はターゲットへ向かってスライド
  };
  midBossActive = true;
}

function updateMidBoss() {
  if (!midBossActive || !midBoss) return;
  midBoss.patternTimer++;
  // 入場中: ターゲットへスライド
  if (midBoss.entering) {
    midBoss.x += (midBoss.targetX - midBoss.x) * 0.05;
    midBoss.y += (midBoss.targetY - midBoss.y) * 0.04;
    if (Math.abs(midBoss.y - midBoss.targetY) < 2 && Math.abs(midBoss.x - midBoss.targetX) < 2) {
      midBoss.entering = false;
      midBoss.patternTimer = 0; // 入場後にパターン開始
    }
    return; // 入場中は弾を撃たない
  }
  // 通常移動: 上部 1/3 をゆっくり左右に
  midBoss.moveTimer--;
  if (midBoss.moveTimer <= 0) {
    midBoss.targetX = PX + 80 + Math.random() * (PW - 160);
    midBoss.targetY = PY + 60 + Math.random() * (PH * 0.25);
    midBoss.moveTimer = 120;
  }
  midBoss.x += (midBoss.targetX - midBoss.x) * 0.025;
  midBoss.y += (midBoss.targetY - midBoss.y) * 0.025;
  // 弾発射
  const speedMul = DIFF_SPEED[selectedDifficulty];
  const bulletMul = DIFF_BULLET[selectedDifficulty];
  midBoss.shoot(midBoss, midBoss.patternTimer, speedMul, bulletMul);
}

function checkMidBossPlayerCollision() {
  if (midBoss && Math.hypot(midBoss.x - player.x, midBoss.y - player.y) < midBoss.r + player.hitR) hit();
}

// 撃破処理: スコア + Pアイテム5個 + ヒットストップ短く
function killMidBoss() {
  if (!midBoss) return;
  explode(midBoss.x, midBoss.y, midBoss.color, 32);
  score += 10000;
  spawnScoreText(midBoss.x, midBoss.y, '+10000', '#ffcc44');
  for (let i = 0; i < 5; i++) {
    spawnItem(midBoss.x + (Math.random() - 0.5) * 30, midBoss.y + (Math.random() - 0.5) * 20, 'power');
  }
  midBoss = null;
  midBossActive = false;
  hitStopFrames = 6;
}

function drawMidBoss() {
  if (!midBoss) return;
  // ライト・オーラ
  const auraR = midBoss.r + 6 + Math.sin(frame * 0.1) * 3;
  const grad = ctx.createRadialGradient(midBoss.x, midBoss.y, midBoss.r * 0.5, midBoss.x, midBoss.y, auraR);
  grad.addColorStop(0, midBoss.color + '99'); // alpha付き hex
  grad.addColorStop(1, midBoss.color + '00');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(midBoss.x, midBoss.y, auraR, 0, Math.PI * 2);
  ctx.fill();
  // 本体: ステージ別画像、未ロード時は色付き円にフォールバック
  if (!drawImageCentered(`midboss_stage${selectedStage}`, midBoss.x, midBoss.y, 96)) {
    ctx.fillStyle = midBoss.color;
    ctx.beginPath();
    ctx.arc(midBoss.x, midBoss.y, midBoss.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawMidBossHpBar() {
  if (!midBoss || midBoss.entering) return;
  const w = PW - 40;
  const ratio = Math.max(0, midBoss.hp / midBoss.maxHp);
  // 細めのバー (ボスの spell-card バーよりさらに細い)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(PX + 20, PY + 4, w, 4);
  ctx.fillStyle = midBoss.color;
  ctx.fillRect(PX + 20, PY + 4, w * ratio, 4);
  // スペル名
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px "Hiragino Mincho ProN", serif';
  ctx.textAlign = 'right';
  ctx.fillText(midBoss.spellName, PX + PW - 8, PY + 18);
  // "MID-BOSS" ラベル左
  ctx.fillStyle = midBoss.color;
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('MID-BOSS', PX + 20, PY + 18);
}

// ─────────────────────────────────────────────────────────
// 中ボス出現カットイン (state='midBossIntro')
// 90F 構成 (ボス出現の半分):
//   0-30 (薄暗転 0→0.5)
//  15-60 (中ボス画像が左からスライドイン)
//  30-60 (黄色の "!! Mid-Boss !!" 警告)
//  30-75 (中ボス名 + スペル名)
//  60-90 (フェードアウト)
// ─────────────────────────────────────────────────────────
function drawMidBossIntro() {
  if (state !== 'midBossIntro' || !midBoss) return;
  const TOTAL = 90;
  const t = TOTAL - midBossIntroTimer;

  ctx.save();
  ctx.beginPath();
  ctx.rect(PX, PY, PW, PH);
  ctx.clip();

  // 1. 暗転
  let bgAlpha;
  if (t < 30) bgAlpha = (t / 30) * 0.55;
  else if (t < 60) bgAlpha = 0.55;
  else bgAlpha = 0.55 * (TOTAL - t) / 30;
  ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
  ctx.fillRect(PX, PY, PW, PH);

  // 2. 中ボス画像 (左からスライドイン)
  if (t >= 15) {
    let slideT, alpha;
    if (t < 60) {
      const raw = (t - 15) / 45;
      slideT = 1 - Math.pow(1 - raw, 3);
      alpha = slideT;
    } else {
      slideT = 1;
      alpha = (TOTAL - t) / 30;
    }
    const startX = PX - 200;
    const endX = PX + PW * 0.32;
    const mbX = startX + (endX - startX) * slideT;
    const mbY = PY + PH * 0.5;
    ctx.globalAlpha = alpha;
    if (!drawImageCentered(`midboss_stage${selectedStage}`, mbX, mbY, 200)) {
      ctx.fillStyle = midBoss.color;
      ctx.beginPath();
      ctx.arc(mbX, mbY, 60, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // 3. !! Mid-Boss !! (黄色警告、点滅)
  if (t >= 30 && t < 60) {
    const blink = Math.floor(t / 6) % 2 === 0;
    const bannerY = PY + 90;
    ctx.fillStyle = blink ? '#ffe060' : '#ffd040';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ffaa00';
    ctx.fillText('!! Mid-Boss !!', PX + PW * 0.65, bannerY);
    ctx.shadowBlur = 0;
  }

  // 4. 名前 + スペル名 (右側)
  if (t >= 30 && t < 75) {
    const fadeT = Math.min(1, (t - 30) / 15);
    const nameX = PX + PW * 0.65;
    const nameY = PY + PH * 0.5 - 6;
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(255, 255, 255, ${fadeT})`;
    ctx.font = 'bold 26px "Hiragino Mincho ProN", "Yu Mincho", serif';
    ctx.shadowBlur = 12;
    ctx.shadowColor = midBoss.color;
    ctx.fillText(midBoss.name, nameX, nameY);
    ctx.font = 'bold 16px "Hiragino Mincho ProN", serif';
    ctx.fillStyle = midBoss.color;
    ctx.globalAlpha = fadeT * 0.95;
    ctx.fillText(midBoss.spellName, nameX, nameY + 30);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // 5. スキップヒント
  if (t >= 30 && t < 80) {
    ctx.textAlign = 'center';
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('(Z でスキップ)', PX + PW / 2, PY + PH - 14);
  }

  ctx.restore();
}
