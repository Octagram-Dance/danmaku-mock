// 自機 (動作・自動弾発射・被弾・描画)

function powerRank() { return Math.min(3, Math.floor(power / 3)); }

function updatePlayer() {
  const slowMode = isSlowMode();
  const speed = slowMode ? player.slowSpeed : player.speed;
  if (!touchActive) {
    if (keys['ArrowLeft']) player.x -= speed;
    if (keys['ArrowRight']) player.x += speed;
    if (keys['ArrowUp']) player.y -= speed;
    if (keys['ArrowDown']) player.y += speed;
  }
  player.x = clamp(player.x, PX+10, PX+PW-10);
  player.y = clamp(player.y, PY+10, PY+PH-10);
  if (player.invuln > 0) player.invuln--;
}

function firePlayerBullets() {
  // 自機弾自動発射
  if (frame % 5 === 0) {
    const r = powerRank();
    playerBullets.push({ x: player.x - 6, y: player.y - 10, vx: 0, vy: -10, r: 3 });
    playerBullets.push({ x: player.x + 6, y: player.y - 10, vx: 0, vy: -10, r: 3 });
    if (r >= 1) playerBullets.push({ x: player.x, y: player.y - 14, vx: 0, vy: -11, r: 3 });
    if (r >= 2) {
      playerBullets.push({ x: player.x - 12, y: player.y - 6, vx: -1.5, vy: -9, r: 3 });
      playerBullets.push({ x: player.x + 12, y: player.y - 6, vx:  1.5, vy: -9, r: 3 });
    }
  }
  // ホーミング弾は別頻度で発射 (15Fごと = 1秒4発)
  if (powerRank() >= 3 && frame % 15 === 0) {
    homingBullets.push({ x: player.x, y: player.y - 14, vx: 0, vy: -6, r: 4, life: 90 });
  }
}

function hit() {
  if (player.invuln > 0) return;
  if (bombActive) return; // ボム発動中は無敵
  life--;
  explode(player.x, player.y, '#ffffff', 24);
  screenFlash = 30; // 被弾フラッシュ
  if (life <= 0) {
    state = 'gameOver';
    saveHiScore(selectedDifficulty, score);
  }
  else {
    // 失うパワー分のPアイテムを画面上方向に撒く (回収しやすく)
    const lostPower = Math.min(power, 3);
    for (let i = 0; i < lostPower; i++) {
      // 上向きを基本に左右に少しばらつかせる: 角度は -2π/3 (左上) 〜 -π/3 (右上) 付近
      const a = -Math.PI/2 + (Math.random() - 0.5) * (Math.PI / 1.5);
      const speed = 5 + Math.random() * 2; // 強めに発射
      items.push({
        x: player.x,
        y: player.y - 10,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        type: 'power',
        life: 900,
        age: 0
      });
    }
    player.x = PX + PW/2;
    player.y = PY + PH - 80;
    player.invuln = 120;
    enemyBullets = [];
    power = Math.max(0, power - 3);
    bombs = 3; // ボム復活 (初期値に戻す)
  }
}

function drawPlayer() {
  // 自機 (無敵中は点滅)
  const slowMode = isSlowMode();
  // ボム発動中のオーラ
  if (bombActive) {
    const auraR = 20 + Math.sin(frame * 0.3) * 6;
    const auraGrad = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, auraR + 20);
    auraGrad.addColorStop(0, 'rgba(180, 220, 255, 0.6)');
    auraGrad.addColorStop(1, 'rgba(180, 220, 255, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(player.x, player.y, auraR + 20, 0, Math.PI*2);
    ctx.fill();
  }
  if (player.invuln === 0 || frame % 4 < 2) {
    // 機体本体: 画像 (後ろ向き)。読み込み未完了/失敗時は三角ポリゴンにフォールバック
    if (!drawImageCentered('player', player.x, player.y, 40)) {
      ctx.fillStyle = '#88ccff';
      ctx.beginPath();
      ctx.moveTo(player.x, player.y - 14);
      ctx.lineTo(player.x - 12, player.y + 10);
      ctx.lineTo(player.x + 12, player.y + 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 当たり判定の表示 (低速時は中央の白い点を強調)
    if (slowMode) {
      // 外側のリング (回転)
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(frame * 0.1);
      ctx.strokeStyle = 'rgba(255, 100, 200, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        const r1 = 8;
        ctx.moveTo(Math.cos(a)*r1, Math.sin(a)*r1);
        ctx.lineTo(Math.cos(a)*(r1+3), Math.sin(a)*(r1+3));
      }
      ctx.stroke();
      ctx.restore();
      // 中心の白点 (くっきり)
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.hitR + 1, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#ff66cc';
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.hitR - 0.5, 0, Math.PI*2);
      ctx.fill();
    } else {
      // 通常時は小さな白点
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.hitR, 0, Math.PI*2);
      ctx.fill();
    }
  }
}
