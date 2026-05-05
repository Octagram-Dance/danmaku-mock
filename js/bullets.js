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
      // 耐久スペル中はボス無敵: 弾は素通り (spellAnnounce/invulnAfterSpell と同じ挙動)
      if (e === boss && boss.spellCards[boss.pattern] && boss.spellCards[boss.pattern].invulnerable) return;
      // 中ボスは入場中は無敵 (スライドダウン中)
      if (e === midBoss && midBoss.entering) return;
      if (Math.hypot(b.x - e.x, b.y - e.y) < e.r + b.r) {
        // 弾自身の damage (キャラの bulletPower 由来) を反映、未指定は 1.0 (旧挙動)
        e.hp -= (typeof b.damage === 'number' ? b.damage : 1);
        b._consumed = true;
        // ボス完全撃破
        if (e === boss && boss.hp <= 0 && boss.pattern >= boss.spellCards.length - 1) {
          if (selectedStage === 5) {
            // ラスボス: 専用エンディング演出 (boss 変数は death 描画のため残す)
            score += 100000;
            spawnScoreText(boss.x, boss.y, '+100000', '#ffcc44');
            saveHiScore(selectedDifficulty, score);
            saveGrazeRecord(selectedDifficulty, grazeCount);
            startFinalBossDeath();
          } else {
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
          }
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
  // 子弾の一時格納先。filter 中に enemyBullets を直接 push すると、
  // filter() がイテレーション開始時に長さをスナップショットしているため
  // 新しく push された要素は filter 結果に含まれず、最後の代入で消滅する。
  // _splitFn には pending を渡し、filter 完了後にまとめて append する。
  const pending = [];
  enemyBullets = enemyBullets.filter(b => {
    // グレイズ閃光のフェードは凍結状態とは独立して常に減衰
    if (b._grazeFlash > 0) b._grazeFlash--;

    // _splitTimer: タイマー満了で _splitFn(b, pending) を呼んで子弾を生成、親弾は消滅。
    // ステージ5「冷たい光輪」のような 2 段階弾幕用。
    if (b._splitTimer !== undefined) {
      b._splitTimer--;
      if (b._splitTimer <= 0) {
        if (b._splitFn) b._splitFn(b, pending);
        return false;
      }
    }

    // 凍結中: 移動しない (画面端判定のみ通過)
    if (b.freezeTimer > 0) {
      b.freezeTimer--;
      return true;
    }

    // _warpInterval: 一定間隔でランダム転移 (ステージ5「歪んだ宇宙」用)
    // 転移前後にパーティクルでフラッシュ。
    if (b._warpInterval > 0) {
      b._warpTimer = (b._warpTimer || 0) + 1;
      if (b._warpTimer >= b._warpInterval) {
        b._warpTimer = 0;
        const r = b._warpRange || 80;
        for (let i = 0; i < 4; i++) {
          const a = Math.random() * Math.PI * 2;
          particles.push({ x: b.x, y: b.y, vx: Math.cos(a)*1.5, vy: Math.sin(a)*1.5, life: 18, color: b.color });
        }
        b.x += (Math.random() - 0.5) * r * 2;
        b.y += (Math.random() - 0.5) * r * 2;
        for (let i = 0; i < 4; i++) {
          const a = Math.random() * Math.PI * 2;
          particles.push({ x: b.x, y: b.y, vx: Math.cos(a)*1.5, vy: Math.sin(a)*1.5, life: 18, color: b.color });
        }
      }
    }

    // _gravityToPlayer: 自機方向への弱い重力加速 (ステージ5「ブラックホール」用)
    if (b._gravityToPlayer) {
      const dx = player.x - b.x, dy = player.y - b.y;
      const d = Math.hypot(dx, dy);
      if (d > 1) {
        b.vx += (dx / d) * b._gravityToPlayer;
        b.vy += (dy / d) * b._gravityToPlayer;
      }
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

    // _trail: 過去位置を最新 _trailLen 個保持 (ステージ5「彗星の雨」用)
    if (b._trail) {
      b._trail.unshift({ x: b.x, y: b.y });
      if (b._trail.length > (b._trailLen || 8)) b._trail.pop();
    }

    b.x += b.vx; b.y += b.vy;
    return b.x > PX-10 && b.x < PX+PW+10 && b.y > PY-10 && b.y < PY+PH+10;
  });
  // _splitFn が pending に積んだ子弾を反映 (filter 後の新しい配列に追加)
  if (pending.length) enemyBullets.push(...pending);
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
      // フィードバック (主張は弱めだが確実に伝わる演出):
      //  - 弾そのものを 12F 白く閃光させる (_grazeFlash)
      //  - HUD の Graze カウンタを 15F フラッシュ
      //  - 緑の +50 を控えめに表示 (8px、半透明、40F、敵弾の視認性を阻害しない)
      b._grazeFlash = 12;
      grazeFlashTimer = 15;
      spawnScoreText(b.x, b.y, '+50', '#88ff88', 8, 40, 0.5);
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
    // _trail: 弾の過去位置を結ぶ淡いストローク (彗星のしっぽ)
    if (b._trail && b._trail.length > 1) {
      const baseAlpha = ctx.globalAlpha;
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.lineWidth = b.r * 0.9;
      ctx.lineCap = 'round';
      ctx.strokeStyle = b.color;
      for (let i = 0; i < b._trail.length - 1; i++) {
        ctx.globalAlpha = baseAlpha * (1 - i / b._trail.length) * 0.55;
        ctx.beginPath();
        ctx.moveTo(b._trail[i].x, b._trail[i].y);
        ctx.lineTo(b._trail[i + 1].x, b._trail[i + 1].y);
        ctx.stroke();
      }
      ctx.restore();
      ctx.globalAlpha = baseAlpha;
    }
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
    // グレイズ閃光: 弾の上に白い半透明ハロー (12F でフェード)
    // 中心は透明にして弾本体の視認性を保ち、弾の縁付近で最大 → 外側へフェード
    if (b._grazeFlash > 0) {
      const t = b._grazeFlash / 12;
      const flashR = b.r * 2.5;
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, flashR);
      grad.addColorStop(0, `rgba(255, 255, 255, ${t * 0.35})`);  // 中心は控えめ (弾を隠さない)
      grad.addColorStop(0.4, `rgba(255, 255, 255, ${t * 0.85})`); // 弾の縁付近で最大
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');             // 外側で透明
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, flashR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  });
  ctx.restore();
}
