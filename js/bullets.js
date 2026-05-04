// 弾管理 (自機弾・ホーミング弾・敵弾) と当たり判定

function updatePlayerBullets() {
  playerBullets = playerBullets.filter(b => {
    b.x += b.vx; b.y += b.vy;
    return b.y > PY - 10 && b.x > PX - 10 && b.x < PX+PW+10;
  });
}

function updateHomingBullets() {
  homingBullets.forEach(b => {
    let target = null, td = Infinity;
    const list = bossActive && boss ? [boss, ...enemies] : enemies;
    list.forEach(e => {
      const d = Math.hypot(e.x - b.x, e.y - b.y);
      if (d < td) { td = d; target = e; }
    });
    if (target) {
      const dx = target.x - b.x, dy = target.y - b.y;
      const d = Math.hypot(dx, dy);
      b.vx = b.vx * 0.85 + (dx/d * 7) * 0.15;
      b.vy = b.vy * 0.85 + (dy/d * 7) * 0.15;
    }
    b.x += b.vx; b.y += b.vy;
    b.life--;
  });
  homingBullets = homingBullets.filter(b =>
    b.life > 0 && b.x > PX-20 && b.x < PX+PW+20 && b.y > PY-20 && b.y < PY+PH+20);
}

function fadeOutEnemyBullets() {
  // フェードアウト中の弾を徐々に消す
  enemyBullets.forEach(b => {
    if (b.fading) {
      b.fadeTimer = (b.fadeTimer || 0) + 1;
      if (b.fadeTimer > 30) b._consumed = true;
    }
  });
  enemyBullets = enemyBullets.filter(b => !b._consumed);
}

function checkPlayerBulletHits() {
  // ボス・中ボス・雑魚を統合した hit 候補リスト
  const allHittable = enemies.slice();
  if (midBossActive && midBoss) allHittable.unshift(midBoss);
  if (bossActive && boss) allHittable.unshift(boss);
  [...playerBullets, ...homingBullets].forEach(b => {
    allHittable.forEach(e => {
      if (b._consumed) return;
      // ボスはスペル開始演出中・スペル切替直後は無敵
      if (e === boss && (boss.spellAnnounceTimer > 0 || boss.invulnAfterSpell > 0)) return;
      // 中ボスは入場中は無敵 (スライドダウン中)
      if (e === midBoss && midBoss.entering) return;
      if (Math.hypot(b.x - e.x, b.y - e.y) < e.r + b.r) {
        e.hp -= 1; // ホーミングも通常弾も同じ1ダメージ
        b._consumed = true;
        // ボス完全撃破
        if (e === boss && boss.hp <= 0 && boss.pattern >= boss.spellCards.length - 1) {
          explode(boss.x, boss.y, '#ffccff', 60);
          score += 50000;
          spawnScoreText(boss.x, boss.y, '+50000', '#ffcc44');
          hitStopFrames = 6;
          for (let i = 0; i < 8; i++) spawnItem(boss.x + (Math.random()-0.5)*40, boss.y, 'power');
          for (let i = 0; i < 5; i++) spawnItem(boss.x + (Math.random()-0.5)*40, boss.y, 'life');
          boss = null;
          bossActive = false;
          stageCleared = true;
          collectPhase = true;
          collectPhaseTimer = 240;
        } else if (e === midBoss && midBoss.hp <= 0) {
          killMidBoss();
        } else if (e !== boss && e !== midBoss && e.hp <= 0) {
          killEnemy(e);
        }
      }
    });
  });
  playerBullets = playerBullets.filter(b => !b._consumed);
  homingBullets = homingBullets.filter(b => !b._consumed);
}

function moveAndFilterEnemyBullets() {
  enemyBullets = enemyBullets.filter(b => {
    // 凍結中: 移動しない (画面端判定のみ通過)
    if (b.freezeTimer > 0) {
      b.freezeTimer--;
      return true;
    }
    // 弾自体が回転: vx,vy を omega ラジアンずつ回す (葉舞・渦巻き用)
    // omegaDecay 指定時は毎F omega *= omegaDecay で減衰 (永続軌道になって弾がボス周りに閉じ込められるのを防ぐ)
    if (b.omega) {
      const cs = Math.cos(b.omega);
      const sn = Math.sin(b.omega);
      const nvx = b.vx * cs - b.vy * sn;
      const nvy = b.vx * sn + b.vy * cs;
      b.vx = nvx; b.vy = nvy;
      if (b.omegaDecay) {
        b.omega *= b.omegaDecay;
        if (Math.abs(b.omega) < 0.0001) b.omega = 0;
      }
    }
    b.x += b.vx; b.y += b.vy;
    return b.x > PX-10 && b.x < PX+PW+10 && b.y > PY-10 && b.y < PY+PH+10;
  });
}

// グレイズ判定の半径 (player 中心からの距離)。
// player.hitR=2 より十分大きく、機体本体より少し外側。
const GRAZE_R = 18;

function checkEnemyBulletPlayerCollision() {
  // ボム発動中・無敵中はグレイズしない (被弾もしないので妥当)
  const canGraze = !bombActive && player.invuln <= 0;
  enemyBullets.forEach((b, i) => {
    const dist = Math.hypot(b.x - player.x, b.y - player.y);
    // 被弾チェック (既存のまま)
    if (dist < b.r * 0.7 + player.hitR) {
      enemyBullets.splice(i, 1);
      hit();
      return;
    }
    // グレイズ: 同じ弾は1回だけカウント (_grazed で記録)
    if (canGraze && !b._grazed && dist < GRAZE_R + b.r) {
      b._grazed = true;
      grazeCount++;
      score += 50;
      spawnGrazeRing(b.x, b.y);
      // 緑の +50 テキスト (10px、控えめ)
      spawnScoreText(b.x, b.y, '+50', '#88ff88', 10);
    }
  });
}

function drawPlayerBullets() {
  // 自機弾 (青白色の細い矢) + 淡い青白グロー
  ctx.save();
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#aaffff';
  ctx.fillStyle = '#aaffff';
  playerBullets.forEach(b => {
    ctx.fillRect(b.x - 2, b.y - 6, 4, 12);
  });
  ctx.restore();
}

function drawHomingBullets() {
  // ホーミング弾は強めの黄色グロー
  ctx.save();
  ctx.shadowBlur = 12;
  ctx.shadowColor = '#ffff88';
  homingBullets.forEach(b => {
    ctx.fillStyle = '#ffff88';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(b.x-1, b.y-1, b.r/2, 0, Math.PI*2);
    ctx.fill();
  });
  ctx.restore();
}

function drawEnemyBullets() {
  // 敵弾 (アイテムと差別化: 円形・色のみ・小さめ) + 弾色を継承したグロー
  ctx.save();
  ctx.shadowBlur = 6;
  enemyBullets.forEach(b => {
    if (b.fading) ctx.globalAlpha = Math.max(0, 1 - (b.fadeTimer || 0) / 30);
    ctx.shadowColor = b.color;
    // 弾の縁
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    ctx.fill();
    // 弾の中心ハイライト
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(b.x - 1.5, b.y - 1.5, b.r * 0.45, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
  ctx.restore();
}
