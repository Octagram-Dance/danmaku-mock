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
  // 画面の弾をすべて消す (派手にエフェクト)
  enemyBullets.forEach(b => {
    for (let i = 0; i < 2; i++) {
      const a = Math.random() * Math.PI * 2;
      particles.push({ x: b.x, y: b.y, vx: Math.cos(a)*4, vy: Math.sin(a)*4, life: 25, color: b.color });
    }
  });
  enemyBullets = [];
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
