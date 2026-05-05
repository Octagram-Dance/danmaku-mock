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
  bombsUsed++; // 集計用
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
  // 耐久スペル中はボムダメージも通らない
  if (boss && boss.spellAnnounceTimer <= 0 && boss.invulnAfterSpell <= 0
      && !(boss.spellCards[boss.pattern] && boss.spellCards[boss.pattern].invulnerable)) {
    boss.hp -= 80;
  }
  // 中ボスにもボムダメージ (入場中は無敵)
  if (midBossActive && midBoss && !midBoss.entering) {
    midBoss.hp -= 12;
    if (midBoss.hp <= 0) killMidBoss();
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
    // ボム中も少しずつボスにダメージ (耐久スペル中は無効)
    if (boss && bombTimer % 10 === 0 && boss.spellAnnounceTimer <= 0 && boss.invulnAfterSpell <= 0
        && !(boss.spellCards[boss.pattern] && boss.spellCards[boss.pattern].invulnerable)) {
      boss.hp -= 5;
    }
    if (midBossActive && midBoss && !midBoss.entering && bombTimer % 10 === 0) {
      midBoss.hp -= 1;
      if (midBoss.hp <= 0) killMidBoss();
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
// オプション引数:
//   size      = フォントサイズ (px、デフォルト 13)
//   life      = 寿命フレーム数 (デフォルト 60)、後半 life/2 フレームでフェードアウト
//   baseAlpha = 最大不透明度 (デフォルト 1.0、控えめに見せたい時に 0.5 などを指定)
function spawnScoreText(x, y, text, color, size, life, baseAlpha) {
  const ox = (Math.random() - 0.5) * 18;
  const oy = (Math.random() - 0.5) * 8;
  const lifeF = life || 60;
  floatTexts.push({
    x: x + ox,
    y: y + oy,
    text,
    color: color || '#ffffff',
    size: size || 13,
    life: lifeF,
    maxLife: lifeF,
    baseAlpha: baseAlpha != null ? baseAlpha : 1,
    vy: -0.9
  });
}

function updateFloatTexts() {
  floatTexts.forEach(t => {
    t.y += t.vy;
    t.vy *= 0.96;
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
    // フェードアウト範囲: maxLife/2 で 1→0、それ以前は baseAlpha 一定
    const fadeWindow = Math.max(1, (t.maxLife || 60) / 2);
    const fadeFactor = Math.min(1, t.life / fadeWindow);
    const alpha = fadeFactor * (t.baseAlpha != null ? t.baseAlpha : 1);
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${t.size || 13}px sans-serif`;
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y);
  });
  ctx.restore();
}
