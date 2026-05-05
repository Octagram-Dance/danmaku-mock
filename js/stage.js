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

// ─────────────────────────────────────────────────────────
// ステージ4: 雷雲 (4層パララックス)
// ─────────────────────────────────────────────────────────
function drawBgStage4() {
  // Layer 0: 雷雲グラデ (濃紺→青紫→暗紫)
  const grad = ctx.createLinearGradient(0, PY, 0, PY + PH);
  grad.addColorStop(0, '#08081a');
  grad.addColorStop(0.4, '#181838');
  grad.addColorStop(0.7, '#0c142a');
  grad.addColorStop(1, '#04040c');
  ctx.fillStyle = grad;
  ctx.fillRect(PX, PY, PW, PH);

  // Layer 1: 雲のシルエット (奥、frame * 0.2 でゆっくり横スクロール)
  // 大小ふたつの楕円ブロブを左右に流して重く垂れ込めた雲を表現
  ctx.fillStyle = 'rgba(40, 40, 70, 0.55)';
  const cloudOff = (frame * 0.2) % (PW + 200);
  for (let i = 0; i < 3; i++) {
    const cx = PX + ((i * 220 - cloudOff + (PW + 200) * 2) % (PW + 200)) - 100;
    const cy = PY + 70 + i * 40;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 130, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 60, cy + 18, 90, 24, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Layer 2: 遠い雷光 (3秒周期でぼんやり光る)
  const farCyc = 180;
  const farT = frame % farCyc;
  if (farT < 14) {
    const fa = (14 - farT) / 14 * 0.22;
    const seed = Math.floor(frame / farCyc);
    const fx = PX + ((seed * 113) % PW);
    const fy = PY + 50 + ((seed * 47) % 90);
    const g2 = ctx.createRadialGradient(fx, fy, 0, fx, fy, 220);
    g2.addColorStop(0, `rgba(180, 200, 255, ${fa})`);
    g2.addColorStop(1, 'rgba(180, 200, 255, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(PX, PY, PW, PH);
  }

  // Layer 3: 雨粒 (斜めに落ちる細い線、弾と区別するため彩度低め+ストローク)
  ctx.strokeStyle = 'rgba(180, 200, 240, 0.35)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 80; i++) {
    const speed = 5 + (i % 3) * 1.5;
    const y = PY + ((i * 53 + frame * speed) % (PH + 30)) - 20;
    const x = PX + ((i * 73 - frame * 1.5 + PW * 4) % PW);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y - 10);
    ctx.stroke();
  }

  // Layer 4 (手前): 巨大稲妻 (8秒周期で 10F だけ画面を白く照らす)
  // ジグザグの折れ線は seed ベースで疑似乱数化、点滅期間中は形が固定的に見える
  const bigCyc = 480;
  const bigT = frame % bigCyc;
  if (bigT < 10) {
    const fa = (10 - bigT) / 10;
    // 画面全体のフラッシュ
    ctx.fillStyle = `rgba(220, 230, 255, ${fa * 0.4})`;
    ctx.fillRect(PX, PY, PW, PH);
    // 稲妻本体 (上から下、ジグザグ)
    const seed = Math.floor(frame / bigCyc);
    const startX = PX + 50 + ((seed * 191) % (PW - 100));
    const segs = 8;
    ctx.save();
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#bbccff';
    // 太い白いコア + 細い金枝
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.85 * fa})`;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    let curX = startX;
    ctx.moveTo(curX, PY);
    for (let i = 1; i <= segs; i++) {
      // sin ベースの疑似乱数で seed 内では一貫した形
      const off = Math.sin((seed * 13 + i * 53) * 0.91) * 40;
      curX = startX + off + (i - 1) * 6;
      const cy = PY + (PH * i / segs);
      ctx.lineTo(curX, cy);
    }
    ctx.stroke();
    // 金色の薄い枝雷
    ctx.strokeStyle = `rgba(255, 220, 140, ${0.6 * fa})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    curX = startX;
    ctx.moveTo(curX + 6, PY + 10);
    for (let i = 1; i <= segs; i++) {
      const off = Math.sin((seed * 13 + i * 53) * 0.91) * 40;
      curX = startX + off + (i - 1) * 6;
      const cy = PY + (PH * i / segs);
      ctx.lineTo(curX + 4, cy);
    }
    ctx.stroke();
    ctx.restore();
  }
}

// ─────────────────────────────────────────────────────────
// ステージ5: 星界 / 宇宙 (4層パララックス)
// 最終ステージ。深宇宙・星雲・流れる星々のレイヤード。
// ─────────────────────────────────────────────────────────
function drawBgStage5() {
  // Layer 0: 深宇宙グラデ
  const grad = ctx.createLinearGradient(0, PY, 0, PY + PH);
  grad.addColorStop(0, '#000010');
  grad.addColorStop(0.5, '#100020');
  grad.addColorStop(1, '#000008');
  ctx.fillStyle = grad;
  ctx.fillRect(PX, PY, PW, PH);

  // Layer 1: 遠い銀河のシルエット (ほぼ静止、薄い円弧)
  // 中央上部に大きな銀河、中央下部に小さな銀河を配置
  ctx.save();
  ctx.translate(PX + PW * 0.35, PY + PH * 0.32);
  ctx.rotate(-0.45);
  const galGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 220);
  galGrad.addColorStop(0, 'rgba(180, 160, 220, 0.30)');
  galGrad.addColorStop(0.4, 'rgba(120, 100, 180, 0.15)');
  galGrad.addColorStop(1, 'rgba(60, 40, 120, 0)');
  ctx.fillStyle = galGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 220, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(PX + PW * 0.78, PY + PH * 0.78);
  ctx.rotate(0.6);
  const galGrad2 = ctx.createRadialGradient(0, 0, 10, 0, 0, 130);
  galGrad2.addColorStop(0, 'rgba(150, 200, 230, 0.22)');
  galGrad2.addColorStop(0.5, 'rgba(80, 130, 180, 0.10)');
  galGrad2.addColorStop(1, 'rgba(40, 60, 100, 0)');
  ctx.fillStyle = galGrad2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 130, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Layer 2: 星雲 (紫・青・ピンクの薄い雲、ゆっくりスクロール)
  const nebOff = (frame * 0.4) % (PH + 200);
  const nebulae = [
    { ox: 0.15, oy: 0.20, c: 'rgba(180, 100, 220, 0.18)', rx: 110, ry: 60 },
    { ox: 0.65, oy: 0.45, c: 'rgba(100, 130, 220, 0.15)', rx: 130, ry: 50 },
    { ox: 0.30, oy: 0.70, c: 'rgba(220, 130, 180, 0.13)', rx: 90,  ry: 50 },
    { ox: 0.80, oy: 0.10, c: 'rgba(130, 200, 220, 0.13)', rx: 100, ry: 45 }
  ];
  nebulae.forEach((n, idx) => {
    const baseY = PY + PH * n.oy + (frame * 0.4 + idx * 90) % (PH + 200) - 100;
    const cy = ((baseY - PY) % (PH + 200)) + PY - 50;
    const cx = PX + PW * n.ox;
    ctx.fillStyle = n.c;
    ctx.beginPath();
    ctx.ellipse(cx, cy, n.rx, n.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Layer 3: 中サイズの星 (frame * 0.6 でゆっくりスクロール)
  ctx.fillStyle = 'rgba(200, 200, 255, 0.55)';
  for (let i = 0; i < 60; i++) {
    const y = PY + ((i * 47 + frame * 0.6) % PH);
    const x = PX + ((i * 113) % PW);
    ctx.fillRect(x, y, 1, 1);
  }
  // 中: 中サイズの星
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  for (let i = 0; i < 35; i++) {
    const y = PY + ((i * 73 + frame * 0.9) % PH);
    const x = PX + ((i * 137) % PW);
    ctx.fillRect(x, y, 2, 2);
  }

  // Layer 4 (手前): 大きな星 + 流れ星 (10秒に1回程度)
  ctx.fillStyle = 'rgba(255, 255, 240, 0.85)';
  for (let i = 0; i < 20; i++) {
    const y = PY + ((i * 91 + frame * 1.4) % PH);
    const x = PX + ((i * 167) % PW);
    // 大きな星は十字状
    ctx.fillRect(x, y, 2, 2);
    ctx.fillRect(x - 1, y, 4, 1);
    ctx.fillRect(x, y - 1, 1, 4);
  }
  // 流れ星 (600F = 10秒周期で 60F だけ出現)
  for (let i = 0; i < 2; i++) {
    const t = (frame * 2 + i * 320) % 1200;
    if (t < 60) {
      const startX = PX + ((i * 211) % PW);
      ctx.strokeStyle = `rgba(255, 240, 220, ${(60 - t) / 60})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX + t * 2, PY + t * 4);
      ctx.lineTo(startX + t * 2 - 35, PY + t * 4 - 70);
      ctx.stroke();
    }
  }
}

function drawStageBackground(stage) {
  if (stage === 1) drawBgStage1();
  else if (stage === 2) drawBgStage2();
  else if (stage === 3) drawBgStage3();
  else if (stage === 4) drawBgStage4();
  else if (stage === 5) drawBgStage5();
  else drawBgStage3();
}
