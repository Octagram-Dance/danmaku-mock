// 敵 (生成・動作・撃破処理・描画)

function spawnEnemy() {
  // ステージによって出現する敵の種類を変える
  const r = Math.random();
  let type;
  if (selectedStage === 1) {
    if (r < 0.55) type = 'normal';
    else if (r < 0.8) type = 'spread';
    else type = 'fast';
  } else if (selectedStage === 2) {
    if (r < 0.4) type = 'normal';
    else if (r < 0.6) type = 'spread';
    else if (r < 0.8) type = 'fast';
    else type = 'swayer';
  } else {
    if (r < 0.3) type = 'normal';
    else if (r < 0.5) type = 'spread';
    else if (r < 0.7) type = 'fast';
    else if (r < 0.9) type = 'swayer';
    else type = 'tank';
  }

  const baseX = PX + 30 + Math.random() * (PW - 60);
  const enemy = {
    x: baseX, y: PY - 20,
    type,
    shootTimer: 50 + Math.random() * 30,
  };

  if (type === 'normal') {
    enemy.r = 14; enemy.hp = 2; enemy.vy = 0.8 + Math.random()*0.6;
    enemy.color = '#44aaff';
  } else if (type === 'spread') {
    enemy.r = 14; enemy.hp = 4; enemy.vy = 0.7 + Math.random()*0.5;
    enemy.color = '#ff4488';
  } else if (type === 'fast') {
    enemy.r = 10; enemy.hp = 1; enemy.vy = 2.5 + Math.random()*0.8;
    enemy.color = '#ffdd44';
    enemy.shootTimer = 999999; // 撃たない
  } else if (type === 'swayer') {
    enemy.r = 13; enemy.hp = 3; enemy.vy = 0.6 + Math.random()*0.4;
    enemy.color = '#bb88ff';
    enemy.swayBaseX = baseX;
    enemy.swayPhase = Math.random() * Math.PI * 2;
  } else if (type === 'tank') {
    enemy.r = 22; enemy.hp = 12; enemy.vy = 0.3;
    enemy.color = '#666688';
    enemy.shootTimer = 80; // やや早めに撃ち始める
  }
  enemies.push(enemy);
  stageEnemiesSpawned++;
}

function enemyShoot(e) {
  const speedMul = DIFF_SPEED[selectedDifficulty];
  const bulletMul = DIFF_BULLET[selectedDifficulty];
  if (e.type === 'normal') {
    const dx = player.x - e.x, dy = player.y - e.y;
    const baseA = Math.atan2(dy, dx);
    const ways = selectedDifficulty === 'Hard' ? 3 : 1;
    const spread = 0.2;
    for (let i = 0; i < ways; i++) {
      const a = baseA + (i - (ways-1)/2) * spread;
      enemyBullets.push({
        x: e.x, y: e.y,
        vx: Math.cos(a) * 1.8 * speedMul,
        vy: Math.sin(a) * 1.8 * speedMul,
        r: 5, color: '#ffaa00'
      });
    }
  } else if (e.type === 'spread') {
    const baseN = selectedDifficulty === 'Hard' ? 14 : selectedDifficulty === 'Normal' ? 8 : 5;
    const offset = Math.random() * Math.PI * 2;
    for (let i = 0; i < baseN; i++) {
      const a = offset + i * Math.PI * 2 / baseN;
      enemyBullets.push({
        x: e.x, y: e.y,
        vx: Math.cos(a) * 1.5 * speedMul,
        vy: Math.sin(a) * 1.5 * speedMul,
        r: 5, color: '#ff66cc'
      });
    }
  } else if (e.type === 'swayer') {
    // 左右斜め下方向に2本ずつ撃つ
    const angles = [-Math.PI*0.25, -Math.PI*0.5 + Math.PI*0.25];
    const sets = [Math.PI*0.75, Math.PI*0.5 + Math.PI*0.25]; // 右下, 左下
    sets.forEach(a => {
      enemyBullets.push({
        x: e.x, y: e.y,
        vx: Math.cos(a) * 1.6 * speedMul,
        vy: Math.sin(a) * 1.6 * speedMul,
        r: 5, color: '#cc88ff'
      });
    });
  } else if (e.type === 'tank') {
    // タンクは大きな弾を3way + 自機狙いの太いショット
    const dx = player.x - e.x, dy = player.y - e.y;
    const baseA = Math.atan2(dy, dx);
    const n = selectedDifficulty === 'Hard' ? 5 : selectedDifficulty === 'Normal' ? 3 : 3;
    const spread = 0.4;
    for (let i = 0; i < n; i++) {
      const a = baseA + (i - (n-1)/2) * spread / (n-1 || 1);
      enemyBullets.push({
        x: e.x, y: e.y,
        vx: Math.cos(a) * 1.6 * speedMul,
        vy: Math.sin(a) * 1.6 * speedMul,
        r: 7, color: '#aaaadd' // 大きい弾
      });
    }
  }
}

// 敵を撃破: スコア・カウント・アイテムドロップを一括処理
function killEnemy(e) {
  if (e._killed) return;
  e._killed = true;
  explode(e.x, e.y, e.color, e.type === 'tank' ? 24 : 12);
  // タイプ別スコア
  const scoreTable = { normal: 100, spread: 200, fast: 80, swayer: 250, tank: 800 };
  const gained = scoreTable[e.type] || 100;
  score += gained;
  spawnScoreText(e.x, e.y, '+' + gained, e.type === 'tank' ? '#ffcc44' : '#ffffff');
  stageEnemiesKilled++;
  // タイプ別ドロップ
  const r = Math.random();
  if (e.type === 'tank') {
    // 大物はP4個 + 1UP2個確定
    for (let i = 0; i < 4; i++) spawnItem(e.x + (Math.random()-0.5)*30, e.y + (Math.random()-0.5)*20, 'power');
    for (let i = 0; i < 2; i++) spawnItem(e.x + (Math.random()-0.5)*30, e.y + (Math.random()-0.5)*20, 'life');
  } else if (e.type === 'spread') {
    if (r < 0.55) spawnItem(e.x, e.y, 'power');
    else spawnItem(e.x, e.y, 'life');
    if (Math.random() < 0.3) spawnItem(e.x + 8, e.y, Math.random() < 0.5 ? 'power' : 'life');
  } else if (e.type === 'swayer') {
    if (r < 0.6) spawnItem(e.x, e.y, 'power');
    else spawnItem(e.x, e.y, 'life');
  } else if (e.type === 'fast') {
    // fast はドロップ率低め
    if (r < 0.4) spawnItem(e.x, e.y, 'power');
    else if (r < 0.6) spawnItem(e.x, e.y, 'life');
  } else {
    if (r < 0.55) spawnItem(e.x, e.y, 'power');
    else if (r < 0.9) spawnItem(e.x, e.y, 'life');
  }
}

function maybeSpawnEnemy() {
  // 中ボス出現中・本ボス中・クリア済みは雑魚 spawn を停止
  if (!bossActive && !midBossActive && !stageCleared && stageEnemiesSpawned < stageEnemyTotal) {
    spawnTimer--;
    if (spawnTimer <= 0) {
      spawnEnemy();
      spawnTimer = selectedDifficulty === 'Hard' ? 25 : selectedDifficulty === 'Easy' ? 42 : 32;
    }
  }
}

function updateEnemies() {
  enemies.forEach(e => {
    // タイプごとの動き
    if (e.type === 'swayer') {
      e.swayPhase += 0.04;
      e.x = e.swayBaseX + Math.sin(e.swayPhase) * 60;
    }
    e.y += e.vy;
    e.shootTimer--;
    if (e.shootTimer <= 0 && e.y > PY+10 && e.y < PY+PH*0.7) {
      enemyShoot(e);
      // タイプ別発射間隔
      if (e.type === 'spread') {
        e.shootTimer = selectedDifficulty==='Hard'? 90 : selectedDifficulty==='Easy'? 160 : 130;
      } else if (e.type === 'tank') {
        e.shootTimer = selectedDifficulty==='Hard'? 60 : selectedDifficulty==='Easy'? 110 : 85;
      } else if (e.type === 'swayer') {
        e.shootTimer = selectedDifficulty==='Hard'? 70 : selectedDifficulty==='Easy'? 120 : 95;
      } else {
        e.shootTimer = selectedDifficulty==='Hard'? 50 : selectedDifficulty==='Easy'? 90 : 70;
      }
    }
  });
}

function countAndFilterEnemies() {
  // 画面外に逃げた敵を検出してカウントを進める (取りこぼし対応)
  enemies.forEach(e => {
    if (e.y >= PY+PH+30 && !e._counted) {
      e._counted = true;
      stageEnemiesPassed++;
    }
  });
  enemies = enemies.filter(e => !e._killed && e.hp > 0 && e.y < PY+PH+30);
}

function checkEnemyPlayerCollision() {
  enemies.forEach(e => {
    if (Math.hypot(e.x - player.x, e.y - player.y) < e.r + player.hitR) hit();
  });
}

// 画像未ロード時の図形フォールバック (元コードそのまま)
function drawEnemyFallback(e) {
  if (e.type === 'fast') {
    // 黄色い小さな菱形 (高速感)
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(Math.PI/4);
    ctx.fillStyle = e.color;
    ctx.fillRect(-e.r, -e.r, e.r*2, e.r*2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(-e.r, -e.r, e.r*2, e.r*2);
    ctx.restore();
  } else if (e.type === 'tank') {
    // 大型: 装甲っぽい六角形
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.fillStyle = e.color;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      const x = Math.cos(a) * e.r;
      const y = Math.sin(a) * e.r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 内側
    ctx.fillStyle = '#3a3a55';
    ctx.beginPath();
    ctx.arc(0, 0, e.r * 0.5, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  } else if (e.type === 'swayer') {
    // 紫の星型
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(frame * 0.02);
    ctx.fillStyle = e.color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5;
      const r = i % 2 === 0 ? e.r : e.r * 0.5;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  } else {
    // normal / spread: 円
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// タイプ別の画像表示サイズ (ゲーム内 px、縦横比保持)
function enemyImageSize(type) {
  if (type === 'fast') return 28;
  if (type === 'tank') return 64;
  return 36; // normal / spread / swayer
}

function drawEnemies() {
  enemies.forEach(e => {
    // タイプ色を継承したうっすらオーラ (画像/形状の下に描画)
    const r1 = e.r * 1.9;
    const g = ctx.createRadialGradient(e.x, e.y, e.r * 0.4, e.x, e.y, r1);
    g.addColorStop(0, e.color + '66'); // alpha約40%
    g.addColorStop(1, e.color + '00'); // 透明
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(e.x, e.y, r1, 0, Math.PI*2);
    ctx.fill();
    // 本体
    if (drawImageCentered(`enemy_${e.type}`, e.x, e.y, enemyImageSize(e.type))) return;
    drawEnemyFallback(e);
  });
}
