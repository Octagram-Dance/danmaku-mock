// ステージ進行・背景描画

function checkBossSpawnTrigger() {
  // ステージ進行: 倒した数 + 逃げた数 が総数に達したらボス出現カットインへ
  // state==='play' の間だけトリガー (bossIntro 中の再トリガー防止)
  const stageProgress = stageEnemiesKilled + stageEnemiesPassed;
  if (state === 'play' && !bossActive && !midBossActive && !stageCleared && stageProgress >= stageEnemyTotal) {
    startBossIntro();
  }
}

// 中ボスは雑魚 20 体到達時点で 1 度だけ出現。撃破まで雑魚 spawn は停止。
function checkMidBossSpawnTrigger() {
  if (state !== 'play') return;
  if (midBossSpawned || midBossActive || bossActive || stageCleared) return;
  const stageProgress = stageEnemiesKilled + stageEnemiesPassed;
  if (stageProgress >= 20) {
    startMidBossIntro();
  }
}

// ─────────────────────────────────────────────────────────
// ステージ1: 紫の夜空 (4層パララックス)
// ─────────────────────────────────────────────────────────
function drawBgStage1() {
  // Layer 0 (最奥): 静的グラデーション
  const grad = ctx.createLinearGradient(0, PY, 0, PY+PH);
  grad.addColorStop(0, '#1a0030');
  grad.addColorStop(0.5, '#3a0050');
  grad.addColorStop(1, '#1a0030');
  ctx.fillStyle = grad;
  ctx.fillRect(PX, PY, PW, PH);

  // Layer 1 (奥): 遠い小さな星 (ゆっくりスクロール frame * 0.3)
  ctx.fillStyle = 'rgba(200, 200, 255, 0.4)';
  for (let i = 0; i < 60; i++) {
    const y = PY + ((i * 47 + frame * 0.3) % PH);
    const x = PX + ((i * 113) % PW);
    ctx.fillRect(x, y, 1, 1);
  }

  // Layer 2 (中): 中サイズの星 (frame * 0.7)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  for (let i = 0; i < 35; i++) {
    const y = PY + ((i * 73 + frame * 0.7) % PH);
    const x = PX + ((i * 137) % PW);
    ctx.fillRect(x, y, 2, 2);
  }

  // Layer 3 (手前): 大きな星 + 流れ星 (frame * 1.2)
  // 弾と見分けやすいよう、縦に伸びた淡い streak で「流れる星」感を出す
  ctx.fillStyle = 'rgba(255, 255, 220, 0.55)';
  for (let i = 0; i < 18; i++) {
    const y = PY + ((i * 91 + frame * 1.2) % PH);
    const x = PX + ((i * 167) % PW);
    ctx.fillRect(x, y, 1, 4);
  }
  // たまに流れ星 (既存ロジック)
  for (let i = 0; i < 3; i++) {
    const t = (frame * 2 + i * 200) % 600;
    if (t < 60) {
      const startX = PX + ((i * 173) % PW);
      ctx.strokeStyle = `rgba(255,255,200,${(60-t)/60})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX + t*2, PY + t*4);
      ctx.lineTo(startX + t*2 - 30, PY + t*4 - 60);
      ctx.stroke();
    }
  }
}

// ─────────────────────────────────────────────────────────
// ステージ2: 雪山 (4層パララックス)
// ─────────────────────────────────────────────────────────
function drawBgStage2() {
  // Layer 0: 暗い夜空グラデ
  const grad = ctx.createLinearGradient(0, PY, 0, PY+PH);
  grad.addColorStop(0, '#0a1a2a');
  grad.addColorStop(0.5, '#1a3050');
  grad.addColorStop(1, '#5070a0');
  ctx.fillStyle = grad;
  ctx.fillRect(PX, PY, PW, PH);

  // Layer 1: 遠い山のシルエット (極めて遅い、frame * 0.1)
  ctx.fillStyle = 'rgba(40, 60, 100, 0.45)';
  ctx.beginPath();
  ctx.moveTo(PX, PY + PH);
  const offFar = (frame * 0.1) % 80;
  // 6点のジグザグ稜線
  const farPts = [[0, 200], [110, 130], [200, 180], [290, 110], [380, 170], [PW, 140]];
  farPts.forEach(([dx, h]) => {
    ctx.lineTo(PX + dx + offFar*0.1, PY + PH - h);
  });
  ctx.lineTo(PX + PW, PY + PH);
  ctx.closePath();
  ctx.fill();

  // Layer 2: 中景の山影 (既存) — 変更なし
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.moveTo(PX, PY + PH);
  ctx.lineTo(PX + 80, PY + PH - 200);
  ctx.lineTo(PX + 160, PY + PH - 100);
  ctx.lineTo(PX + 250, PY + PH - 280);
  ctx.lineTo(PX + 350, PY + PH - 150);
  ctx.lineTo(PX + 480, PY + PH - 250);
  ctx.lineTo(PX + PW, PY + PH);
  ctx.closePath();
  ctx.fill();

  // Layer 3: 雪の小粒 (中速、サイズ小、わずかなsway) - アルファ低めで奥行き感
  ctx.fillStyle = 'rgba(220, 230, 255, 0.45)';
  for (let i = 0; i < 60; i++) {
    const speed = 0.45 + (i % 2) * 0.15;
    const sway = Math.sin((frame + i*23) * 0.025) * 4;
    const y = PY + ((i * 53 + frame * speed) % PH);
    const x = PX + ((i * 97 + sway) % PW);
    ctx.fillRect(x, y, 1, 1);
  }

  // Layer 4 (手前): 雪の大粒 - 弾(円形・実心)と区別するため
  // 縦方向に伸びた streak (落下感を強調) + アルファを抑える
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  for (let i = 0; i < 35; i++) {
    const speed = 1.1 + (i % 3) * 0.35;
    const sway = Math.sin((frame + i*30) * 0.04) * 14;
    const y = PY + ((i * 91 + frame * speed) % PH);
    const x = PX + ((i * 73 + sway) % PW);
    const len = 4 + (i % 2);  // 4〜5px の縦線で「降っている」感
    ctx.fillRect(x, y, 1, len);
  }
}

// ─────────────────────────────────────────────────────────
// ステージ3: 紅葉 (4層パララックス)
// ─────────────────────────────────────────────────────────
function drawBgStage3() {
  // Layer 0: 夕焼けグラデ
  const grad = ctx.createLinearGradient(0, PY, 0, PY+PH);
  grad.addColorStop(0, '#3a1010');
  grad.addColorStop(0.4, '#7a2818');
  grad.addColorStop(0.7, '#5a1810');
  grad.addColorStop(1, '#2a0808');
  ctx.fillStyle = grad;
  ctx.fillRect(PX, PY, PW, PH);

  // Layer 1: 遠い木のシルエット (frame * 0.15)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  const offFar3 = (frame * 0.15) % 90;
  for (let i = 0; i < 4; i++) {
    const x = PX + ((i * 110 - offFar3 + PW + 90) % (PW + 90)) - 30;
    ctx.fillRect(x, PY + 200, 3, PH - 200);
    ctx.fillRect(x - 14, PY + 240 + i * 25, 28, 1);
  }

  // Layer 2: 中景の木 (既存、frame * 0.4 で軽くスクロール)
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  const offMid = (frame * 0.4) % 90;
  for (let i = 0; i < 5; i++) {
    const x = PX + 60 + ((i * 90 - offMid + PW + 90) % (PW + 90)) - 90;
    ctx.fillRect(x, PY + 100, 4, PH - 100);
    // 枝
    ctx.fillRect(x - 20, PY + 150 + i * 30, 40, 2);
  }

  // Layer 3: 落ち葉 中サイズ (中速、回転) - 既存色は暗めなのでそのまま、アルファだけ抑える
  for (let i = 0; i < 20; i++) {
    const speed = 0.5 + (i % 3) * 0.25;
    const sway = Math.sin((frame + i*40) * 0.04) * 12;
    const y = PY + ((i * 71 + frame * speed) % PH);
    const x = PX + ((i * 109 + sway) % PW);
    const rot = (frame + i * 50) * 0.04;
    const colors = ['#cc4422', '#aa3318', '#bb5530', '#993311'];
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = colors[i % 4];
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(2, 0);
    ctx.lineTo(0, 3);
    ctx.lineTo(-2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Layer 4 (手前): 大きな落ち葉 (速い・大きく回転)
  // 弾(明るい橙系)との混同を避けるため、アルファ低下 + 一段暗めの色に変更
  for (let i = 0; i < 18; i++) {
    const speed = 1.0 + (i % 4) * 0.4;
    const sway = Math.sin((frame + i*40) * 0.05) * 18;
    const y = PY + ((i * 67 + frame * speed) % PH);
    const x = PX + ((i * 113 + sway) % PW);
    const rot = (frame + i * 50) * 0.08;
    // 旧: ['#ff6622', '#ffaa44', '#ee4422', '#cc6633'] (明る過ぎて弾と混同)
    // 新: ややくすんだ落ち着いた紅葉色
    const colors = ['#cc4418', '#dd7722', '#bb3318', '#aa5522'];
    ctx.save();
    ctx.globalAlpha = 0.65;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = colors[i % 4];
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(4, 0);
    ctx.lineTo(0, 5);
    ctx.lineTo(-4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawStageBackground(stage) {
  if (stage === 1) drawBgStage1();
  else if (stage === 2) drawBgStage2();
  else if (stage === 3) drawBgStage3();
}
