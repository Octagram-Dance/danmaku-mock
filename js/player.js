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
  const char = getCharacter(selectedCharacter);
  const dmg = char.bulletPower;
  // 自機弾自動発射 — bulletSpread によって配置パターンを切替
  if (frame % 5 === 0) {
    const r = powerRank();
    if (char.bulletSpread === 'concentrated') {
      // 巫女: 中央 2 列、左右の広がりなし、威力高 (damage で吸収)
      playerBullets.push({ x: player.x - 3, y: player.y - 10, vx: 0, vy: -10, r: 3, damage: dmg });
      playerBullets.push({ x: player.x + 3, y: player.y - 10, vx: 0, vy: -10, r: 3, damage: dmg });
      if (r >= 1) playerBullets.push({ x: player.x, y: player.y - 14, vx: 0, vy: -11, r: 3, damage: dmg });
      if (r >= 2) {
        // 中央寄りの 2 列を追加 (横は広げず威力で押す方向性)
        playerBullets.push({ x: player.x - 6, y: player.y - 8, vx: 0, vy: -10, r: 3, damage: dmg });
        playerBullets.push({ x: player.x + 6, y: player.y - 8, vx: 0, vy: -10, r: 3, damage: dmg });
      }
      if (r >= 3) {
        // Power 9 (MAX) — さらに 2 列追加 (合計 7 列) + 中央の強化弾 (大きめ・高速・1.5x ダメージ)
        // 火力特化の最終形として、ホーミングなしの代わりに圧倒的な中央火力を持たせる
        playerBullets.push({ x: player.x - 9, y: player.y - 6, vx: 0, vy: -10, r: 3, damage: dmg });
        playerBullets.push({ x: player.x + 9, y: player.y - 6, vx: 0, vy: -10, r: 3, damage: dmg });
        playerBullets.push({ x: player.x, y: player.y - 18, vx: 0, vy: -12, r: 4, damage: dmg * 1.5 });
      }
    } else if (char.bulletSpread === 'wide') {
      // メイド: 既存の前方 3 列 + 左右斜めの 2 列で扇状 (合計 5 方向 @ Power3)
      playerBullets.push({ x: player.x - 6, y: player.y - 10, vx: 0, vy: -10, r: 3, damage: dmg });
      playerBullets.push({ x: player.x + 6, y: player.y - 10, vx: 0, vy: -10, r: 3, damage: dmg });
      if (r >= 1) playerBullets.push({ x: player.x, y: player.y - 14, vx: 0, vy: -11, r: 3, damage: dmg });
      // wide は Power0 から左右の斜めを軽めに撒く (機動キャラの広範囲性)
      playerBullets.push({ x: player.x - 14, y: player.y - 4, vx: -1.0, vy: -9, r: 3, damage: dmg });
      playerBullets.push({ x: player.x + 14, y: player.y - 4, vx:  1.0, vy: -9, r: 3, damage: dmg });
      if (r >= 2) {
        // Power2 以降は更に広い角度の 2 列を追加
        playerBullets.push({ x: player.x - 16, y: player.y - 2, vx: -2.2, vy: -8.5, r: 3, damage: dmg });
        playerBullets.push({ x: player.x + 16, y: player.y - 2, vx:  2.2, vy: -8.5, r: 3, damage: dmg });
      }
    } else {
      // 魔女 (standard): 既存挙動
      playerBullets.push({ x: player.x - 6, y: player.y - 10, vx: 0, vy: -10, r: 3, damage: dmg });
      playerBullets.push({ x: player.x + 6, y: player.y - 10, vx: 0, vy: -10, r: 3, damage: dmg });
      if (r >= 1) playerBullets.push({ x: player.x, y: player.y - 14, vx: 0, vy: -11, r: 3, damage: dmg });
      if (r >= 2) {
        playerBullets.push({ x: player.x - 12, y: player.y - 6, vx: -1.5, vy: -9, r: 3, damage: dmg });
        playerBullets.push({ x: player.x + 12, y: player.y - 6, vx:  1.5, vy: -9, r: 3, damage: dmg });
      }
    }
  }
  // ホーミング弾: homingEnabled が false の巫女は発射しない。
  // homingRate でレートを倍率調整 (15 / rate F に 1 発)。
  if (char.homingEnabled && char.homingRate > 0 && powerRank() >= 3) {
    const interval = Math.max(4, Math.round(15 / char.homingRate));
    if (frame % interval === 0) {
      homingBullets.push({ x: player.x, y: player.y - 14, vx: 0, vy: -6, r: 4, life: 90, damage: dmg });
    }
  }
}

function hit() {
  if (player.invuln > 0) return;
  if (bombActive) return; // ボム発動中は無敵
  life--;
  explode(player.x, player.y, '#ffffff', 24);
  screenFlash = 30; // 被弾フラッシュ
  hitStopFrames = 8; // 被弾の手応え (8F ≒ 130ms 停止)
  if (life <= 0) {
    state = 'gameOver';
    saveHiScore(selectedDifficulty, score);
    saveGrazeRecord(selectedDifficulty, grazeCount);
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
  // 常時うっすら漂うオーラ (通常: 青白、低速時: ピンク)
  // 無敵中の点滅と連動させて、機体非表示時はオーラも非表示
  if (player.invuln === 0 || frame % 4 < 2) {
    const ambR0 = 6, ambR1 = 30;
    const ambGrad = ctx.createRadialGradient(player.x, player.y, ambR0, player.x, player.y, ambR1);
    if (slowMode) {
      ambGrad.addColorStop(0, 'rgba(255, 100, 200, 0.45)');
      ambGrad.addColorStop(1, 'rgba(255, 100, 200, 0)');
    } else {
      ambGrad.addColorStop(0, 'rgba(170, 230, 255, 0.28)');
      ambGrad.addColorStop(1, 'rgba(170, 230, 255, 0)');
    }
    ctx.fillStyle = ambGrad;
    ctx.beginPath();
    ctx.arc(player.x, player.y, ambR1, 0, Math.PI*2);
    ctx.fill();
  }
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
    // 機体本体: 選択中キャラの後ろ向き画像。未ロード/失敗時は三角ポリゴンにフォールバック
    const _char = getCharacter(selectedCharacter);
    const _drewBack = drawImageCentered(_char.backImage, player.x, player.y, 40);
    // フォールバックチェーン: char back → 旧 'player' → 三角
    if (!_drewBack && !drawImageCentered('player', player.x, player.y, 40)) {
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
      // 中心の白点 (くっきり) — 脈動 (呼吸するイメージ)
      // 当たり判定半径 (player.hitR) は変更せず、見た目だけ ±20% で拡縮
      const pulseT = Math.sin(frame * 0.15);
      const pulse = 1 + pulseT * 0.2; // 0.8 〜 1.2
      const intensity = 0.85 + pulseT * 0.15; // 0.7 〜 1.0
      ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
      ctx.beginPath();
      ctx.arc(player.x, player.y, (player.hitR + 1) * pulse, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 102, 204, ${intensity})`; // #ff66cc + alpha
      ctx.beginPath();
      ctx.arc(player.x, player.y, (player.hitR - 0.5) * pulse, 0, Math.PI*2);
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
