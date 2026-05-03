// ステージ進行・背景描画

function checkBossSpawnTrigger() {
  // ステージ進行: 倒した数 + 逃げた数 が総数に達したらボス
  const stageProgress = stageEnemiesKilled + stageEnemiesPassed;
  if (!bossActive && !stageCleared && stageProgress >= stageEnemyTotal) spawnBoss();
}

function drawStageBackground(stage) {
  if (stage === 1) {
    // ステージ1: 紫の夜空 + 流れ星
    const grad = ctx.createLinearGradient(0, PY, 0, PY+PH);
    grad.addColorStop(0, '#1a0030');
    grad.addColorStop(0.5, '#3a0050');
    grad.addColorStop(1, '#1a0030');
    ctx.fillStyle = grad;
    ctx.fillRect(PX, PY, PW, PH);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 50; i++) {
      const speed = 1 + (i % 3) * 0.7;
      const y = PY + ((i * 73 + frame * speed) % PH);
      const x = PX + ((i * 137) % PW);
      ctx.fillRect(x, y, 1, 2);
    }
    // たまに大きな流れ星
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
  } else if (stage === 2) {
    // ステージ2: 雪山 - 白っぽい寒色 + 雪
    const grad = ctx.createLinearGradient(0, PY, 0, PY+PH);
    grad.addColorStop(0, '#0a1a2a');
    grad.addColorStop(0.5, '#1a3050');
    grad.addColorStop(1, '#5070a0');
    ctx.fillStyle = grad;
    ctx.fillRect(PX, PY, PW, PH);
    // 山影
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
    // 雪
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 80; i++) {
      const speed = 0.5 + (i % 4) * 0.4;
      const sway = Math.sin((frame + i*30) * 0.03) * 8;
      const y = PY + ((i * 53 + frame * speed) % PH);
      const x = PX + ((i * 91 + sway) % PW);
      const r = (i % 3) + 1;
      ctx.fillRect(x, y, r, r);
    }
  } else if (stage === 3) {
    // ステージ3: 紅葉 - 赤茶色のグラデ + 落ち葉
    const grad = ctx.createLinearGradient(0, PY, 0, PY+PH);
    grad.addColorStop(0, '#3a1010');
    grad.addColorStop(0.5, '#6a2020');
    grad.addColorStop(1, '#2a0808');
    ctx.fillStyle = grad;
    ctx.fillRect(PX, PY, PW, PH);
    // 暗い木のシルエット
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    for (let i = 0; i < 5; i++) {
      const x = PX + 60 + i * 90;
      ctx.fillRect(x, PY + 100, 4, PH - 100);
      // 枝
      ctx.fillRect(x - 20, PY + 150 + i * 30, 40, 2);
    }
    // 落ち葉 (回転しながら落下)
    for (let i = 0; i < 30; i++) {
      const speed = 0.6 + (i % 4) * 0.3;
      const sway = Math.sin((frame + i*40) * 0.04) * 15;
      const y = PY + ((i * 67 + frame * speed) % PH);
      const x = PX + ((i * 113 + sway) % PW);
      const rot = (frame + i * 50) * 0.05;
      const colors = ['#ff6622', '#ffaa44', '#ee4422', '#cc6633'];
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = colors[i % 4];
      // シンプルな葉っぱの形 (菱形)
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(3, 0);
      ctx.lineTo(0, 4);
      ctx.lineTo(-3, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
}
