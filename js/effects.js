// エフェクト (爆発・パーティクル・ボム演出・画面フラッシュ)

function explode(x, y, color, n=12) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1 + Math.random() * 3;
    particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: 30, color });
  }
}

function useBomb() {
  if (bombs <= 0 || bombActive) return;
  bombs--;
  bombActive = true;
  bombTimer = 180; // 3秒間 (ボム演出+無敵)
  bombFlash = 30; // 発動瞬間の全画面フラッシュ
  // 画面の弾をすべて消す (派手にエフェクト)
  enemyBullets.forEach(b => {
    for (let i = 0; i < 2; i++) {
      const a = Math.random() * Math.PI * 2;
      particles.push({ x: b.x, y: b.y, vx: Math.cos(a)*4, vy: Math.sin(a)*4, life: 25, color: b.color });
    }
  });
  enemyBullets = [];
  // 自機周辺から放射状の発光パーティクル (波紋の縁を彩る)
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2 + Math.random() * 0.1;
    const s = 5 + Math.random() * 3;
    particles.push({
      x: player.x, y: player.y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 35,
      color: i % 2 === 0 ? '#aaddff' : '#ffffff'
    });
  }
  // ボムによるダメージ
  enemies.forEach(e => {
    e.hp -= 4;
    if (e.hp <= 0) killEnemy(e);
  });
  if (boss && boss.spellAnnounceTimer <= 0 && boss.invulnAfterSpell <= 0) {
    boss.hp -= 80;
  }
}

function updateBomb() {
  // ボム発動 (Xキー)
  if (justPressed['x'] || justPressed['X']) useBomb();
  // ボムタイマー
  if (bombActive) {
    bombTimer--;
    // ボム発動中は弾を追加で吸収/消去 (継続的に画面をクリア)
    if (bombTimer % 6 === 0) {
      enemyBullets.forEach(b => {
        for (let i = 0; i < 1; i++) {
          const a = Math.random() * Math.PI * 2;
          particles.push({ x: b.x, y: b.y, vx: Math.cos(a)*3, vy: Math.sin(a)*3, life: 20, color: b.color });
        }
      });
      enemyBullets = [];
    }
    // ボム中も少しずつボスにダメージ
    if (boss && bombTimer % 10 === 0 && boss.spellAnnounceTimer <= 0 && boss.invulnAfterSpell <= 0) {
      boss.hp -= 5;
    }
    if (bombTimer <= 0) bombActive = false;
  }
  if (bombFlash > 0) bombFlash--;
}

function updateScreenFlash() {
  // 画面フラッシュ減衰
  if (screenFlash > 0) screenFlash--;
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    p.vx *= 0.95; p.vy *= 0.95;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);
}

function drawParticles() {
  particles.forEach(p => {
    ctx.globalAlpha = p.life / 30;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  });
  ctx.globalAlpha = 1;
}

function drawBombShockwave() {
  // ボムエフェクト (画面全体の白い波)
  if (bombActive) {
    const t = 1 - (bombTimer / 180);
    const ringR = t * Math.max(PW, PH) * 1.2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(PX, PY, PW, PH);
    ctx.clip();
    ctx.strokeStyle = `rgba(180, 220, 255, ${1 - t})`;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(player.x, player.y, ringR, 0, Math.PI*2);
    ctx.stroke();
    // 内側の光
    ctx.fillStyle = `rgba(200, 230, 255, ${0.15 * (1 - t)})`;
    ctx.fillRect(PX, PY, PW, PH);
    ctx.restore();
  }
}

function drawScreenFlash() {
  // 被弾フラッシュ
  if (screenFlash > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(PX, PY, PW, PH);
    ctx.clip();
    ctx.fillStyle = `rgba(255, 80, 100, ${screenFlash / 30 * 0.4})`;
    ctx.fillRect(PX, PY, PW, PH);
    ctx.restore();
  }
}

function drawBombFlash() {
  // ボム発動瞬間の全画面フラッシュ (青白)
  if (bombFlash > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(PX, PY, PW, PH);
    ctx.clip();
    ctx.fillStyle = `rgba(220, 240, 255, ${(bombFlash / 30) * 0.5})`;
    ctx.fillRect(PX, PY, PW, PH);
    ctx.restore();
  }
}

// スコア取得時のフローティングテキスト
// size 省略時は 13px (敵撃破やボス用)。グレイズ等は 10px を渡してサイズダウン。
function spawnScoreText(x, y, text, color, size) {
  // 同時発生時に重ならないよう少しランダムにずらす
  const ox = (Math.random() - 0.5) * 18;
  const oy = (Math.random() - 0.5) * 8;
  floatTexts.push({
    x: x + ox,
    y: y + oy,
    text,
    color: color || '#ffffff',
    size: size || 13,
    life: 60,    // 1秒 @60fps
    maxLife: 60,
    vy: -0.9     // ふわっと上昇
  });
}

function updateFloatTexts() {
  floatTexts.forEach(t => {
    t.y += t.vy;
    t.vy *= 0.96; // 徐々に減速
    t.life--;
  });
  floatTexts = floatTexts.filter(t => t.life > 0);
}

function drawFloatTexts() {
  if (floatTexts.length === 0) return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.shadowBlur = 4;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  floatTexts.forEach(t => {
    // 後半30フレームでフェードアウト
    const alpha = Math.min(1, t.life / 30);
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${t.size || 13}px sans-serif`;
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y);
  });
  ctx.restore();
}

// グレイズ時の緑の輪 (短命: 20F で半径15→30、α 1→0)
function spawnGrazeRing(x, y) {
  grazeRings.push({ x, y, life: 20, maxLife: 20 });
}

function updateGrazeRings() {
  grazeRings.forEach(g => g.life--);
  grazeRings = grazeRings.filter(g => g.life > 0);
}

function drawGrazeRings() {
  if (grazeRings.length === 0) return;
  ctx.save();
  ctx.lineWidth = 2;
  ctx.shadowBlur = 8;
  grazeRings.forEach(g => {
    const t = 1 - g.life / g.maxLife; // 0→1
    const r = 15 + t * 15;             // 15→30
    const alpha = 1 - t;               // 1→0
    ctx.strokeStyle = `rgba(136, 255, 136, ${alpha})`;
    ctx.shadowColor = `rgba(136, 255, 136, ${alpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(g.x, g.y, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();
}
