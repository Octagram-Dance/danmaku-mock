// アイテム (ドロップ・吸引・回収)

function spawnItem(x, y, type) {
  // ゆっくり浮いてからゆっくり落ちる
  items.push({
    x, y,
    vx: (Math.random()-0.5)*0.8,
    vy: -1.5,    // ゆっくり上に飛び出す
    type,
    life: 900,
    age: 0
  });
}

function collectItem(it) {
  if (it.type === 'power') {
    if (powerRank() < 3) power = Math.min(9, power + 1);
    score += 50;
  } else if (it.type === 'life') {
    lifeItemCount++;
    score += 100;
    if (lifeItemCount >= 5) {
      lifeItemCount = 0;
      life++;
      explode(player.x, player.y, '#ffaaff', 30);
    }
  }
}

function updateItems() {
  // POC ライン: 自機がこれより上にいるとき、画面上のアイテムを一斉吸引開始
  const POC_LINE = PY + PH * 0.35;
  const playerAbovePOC = player.y < POC_LINE;

  items.forEach(it => {
    it.age++;

    if (it.homing) {
      // ホーミング中: 自機にまっすぐ飛んでくる
      const dx = player.x - it.x, dy = player.y - it.y;
      const d = Math.hypot(dx, dy) || 1;
      // 加速していく
      it.homingSpeed = Math.min((it.homingSpeed || 4) + 0.3, 12);
      it.vx = dx/d * it.homingSpeed;
      it.vy = dy/d * it.homingSpeed;
    } else {
      // 通常の動き: 最初少し上に飛ぶ→ゆっくり落ちる
      if (it.age < 30) {
        it.vy *= 0.93;
        it.vx *= 0.95;
      } else {
        it.vy += 0.015;
        it.vy = clamp(it.vy, -2, 1.2);
        it.vx *= 0.98;
      }
      // 自機がPOCライン超え、またはcollectPhase中で一斉ホーミング開始
      if ((playerAbovePOC || collectPhase) && it.age > 5) {
        it.homing = true;
        it.homingSpeed = 4;
      }
    }

    it.x += it.vx; it.y += it.vy;
    it.life--;
    // 取得判定 (大きめ)
    if (Math.hypot(it.x - player.x, it.y - player.y) < 20) {
      collectItem(it);
      it._consumed = true;
    }
  });
  items = items.filter(it => !it._consumed && it.life > 0 && it.y < PY+PH+20);
}

function updateCollectPhase() {
  // collectPhase: アイテム全回収か時間切れでクリア画面へ
  if (collectPhase) {
    collectPhaseTimer--;
    if (items.length === 0 || collectPhaseTimer <= 0) {
      collectPhase = false;
      state = 'clear';
    }
  }
}

function drawPOCLine() {
  // POC ライン (薄く点線で表示)
  const pocY = PY + PH * 0.35;
  ctx.strokeStyle = 'rgba(255, 220, 140, 0.25)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(PX + 4, pocY);
  ctx.lineTo(PX + PW - 4, pocY);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawItems() {
  // アイテム描画 (大きく・はっきり・特徴的な形に)
  items.forEach(it => {
    const blink = it.life < 120 && Math.floor(it.life / 8) % 2 === 0;
    if (blink) ctx.globalAlpha = 0.4;

    if (it.type === 'power') {
      // パワーアイテム: 赤い菱形 + 白枠 + P文字
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(Math.PI / 4);
      // 外枠 (白)
      ctx.fillStyle = '#fff';
      ctx.fillRect(-11, -11, 22, 22);
      // 内側 (赤)
      ctx.fillStyle = '#ff2244';
      ctx.fillRect(-9, -9, 18, 18);
      // ハイライト
      ctx.fillStyle = '#ffaaaa';
      ctx.fillRect(-9, -9, 18, 5);
      ctx.restore();
      // P文字 (回転後に書く)
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('P', it.x, it.y + 5);
    } else {
      // 1UPアイテム: 緑の星型
      ctx.save();
      ctx.translate(it.x, it.y);
      // 外枠 (白)
      drawStar(0, 0, 12, '#fff');
      drawStar(0, 0, 10, '#22cc44');
      // ハイライト
      drawStar(0, -1, 6, '#aaffaa');
      ctx.restore();
      // 1UP文字
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('1UP', it.x, it.y + 3);
    }
    ctx.globalAlpha = 1;
  });
}
