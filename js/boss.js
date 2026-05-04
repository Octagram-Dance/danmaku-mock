// ボス (スペルカード・生成・動作・描画)

// ボスのスペルカード定義
const SPELL_CARDS = [
  { name: '通常攻撃',           color: '#ff66cc', hp: 0.18 },
  { name: '幻光「螺旋幻想曲」',    color: '#88ff88', hp: 0.18 },
  { name: '凍符「永久凍土の檻」', color: '#88ddff', hp: 0.20 },
  { name: '紅葉「秋風の刃」',    color: '#ff8844', hp: 0.20 },
  { name: '結界「弾幕鳳凰陣」',  color: '#ffcc44', hp: 0.24 }
];

// ボス出現カットインを開始: state='bossIntro' に遷移し、画面の弾をフェードアウトに切替。
// 180F (3秒) 経過 or スキップで spawnBoss() が呼ばれて通常のボス戦が開始される。
function startBossIntro() {
  state = 'bossIntro';
  bossIntroTimer = 180;
  // 既存の敵弾はフェードアウト (スペル切替と同じ仕組みを再利用)
  enemyBullets.forEach(b => { b.fading = true; });
}

function spawnBoss() {
  bossActive = true;
  const dm = DIFF_HP[selectedDifficulty];
  const totalHp = Math.floor(800 * dm);
  boss = {
    x: PX + PW/2, y: PY + 100,
    r: 22,
    totalHp,
    hp: totalHp,
    pattern: 0,
    patternHpStart: totalHp,        // 現スペル開始時のHP
    patternHpMin: totalHp - Math.floor(totalHp * SPELL_CARDS[0].hp), // 現スペル終了HP
    patternTimer: 0,
    moveTimer: 0,
    targetX: PX + PW/2, targetY: PY + 100,
    name: '幻想郷の主',
    spellTimeLimit: 60 * 60,        // 60秒
    spellTimer: 60 * 60,
    spellAnnounceTimer: 90,         // 開始時の演出90F
    invulnAfterSpell: 0             // スペル切替時の無敵
  };
}

function nextSpellCard() {
  if (!boss) return;
  if (boss.pattern >= SPELL_CARDS.length - 1) return; // 最後のカード
  boss.pattern++;
  const card = SPELL_CARDS[boss.pattern];
  boss.patternHpStart = boss.hp;
  boss.patternHpMin = boss.hp - Math.floor(boss.totalHp * card.hp);
  boss.patternTimer = 0;
  boss.spellTimer = boss.spellTimeLimit;
  boss.spellAnnounceTimer = 90;
  boss.invulnAfterSpell = 60;
  // 弾をフェードアウト
  enemyBullets.forEach(b => { b.fading = true; });
  // 撃破ボーナス
  score += 30000;
  // 2-5枚目: ミニカットイン演出に突入 (90F、内部でヒットストップ相当の停止)
  startSpellCutin();
}

// スペルカード突入カットインを開始 (state='spellCutin'、90F)。
// 既存の hitStopFrames は cutin 終了後に二重停止しないようゼロにする。
function startSpellCutin() {
  state = 'spellCutin';
  spellCutinTimer = 90;
  hitStopFrames = 0;
}

function bossShoot() {
  if (!boss) return;
  const speedMul = DIFF_SPEED[selectedDifficulty];
  const bulletMul = DIFF_BULLET[selectedDifficulty];
  const p = boss.pattern, t = boss.patternTimer;
  if (p === 0) {
    // 通常攻撃: 円形連射
    if (t % 8 === 0) {
      const n = Math.max(8, Math.round(16 * bulletMul));
      const offset = t * 0.05;
      for (let i = 0; i < n; i++) {
        const a = offset + i * Math.PI * 2 / n;
        enemyBullets.push({
          x: boss.x, y: boss.y,
          vx: Math.cos(a) * 1.7 * speedMul,
          vy: Math.sin(a) * 1.7 * speedMul,
          r: 5, color: '#ff66cc'
        });
      }
    }
  } else if (p === 1) {
    // 幻光「螺旋幻想曲」: 自機狙い扇形
    if (t % 30 === 0) {
      const dx = player.x - boss.x, dy = player.y - boss.y;
      const baseA = Math.atan2(dy, dx);
      const n = Math.max(3, Math.round(6 * bulletMul));
      const spread = 0.5;
      for (let i = 0; i < n; i++) {
        const a = baseA + (i - (n-1)/2) * (spread / n);
        enemyBullets.push({
          x: boss.x, y: boss.y,
          vx: Math.cos(a) * 2.2 * speedMul,
          vy: Math.sin(a) * 2.2 * speedMul,
          r: 5, color: '#88ff88'
        });
      }
    }
  } else if (p === 2) {
    // 凍符「永久凍土の檻」: 4方向の十字＋徐々に回転
    if (t % 12 === 0) {
      const arms = Math.max(4, Math.round(6 * bulletMul));
      const rot = t * 0.012;
      for (let i = 0; i < arms; i++) {
        const a = rot + i * Math.PI * 2 / arms;
        for (let j = 0; j < 3; j++) {
          enemyBullets.push({
            x: boss.x, y: boss.y,
            vx: Math.cos(a) * (1.0 + j*0.4) * speedMul,
            vy: Math.sin(a) * (1.0 + j*0.4) * speedMul,
            r: 4, color: '#88ddff'
          });
        }
      }
    }
  } else if (p === 3) {
    // 紅葉「秋風の刃」: 横一線に流れる弾＋自機狙い針弾
    if (t % 6 === 0) {
      // 上から左右に流れる弾の波
      const dir = (Math.floor(t / 90) % 2 === 0) ? 1 : -1;
      const y0 = PY + 30 + ((t * 1.2) % (PH * 0.5));
      enemyBullets.push({
        x: dir > 0 ? PX : PX + PW,
        y: y0,
        vx: dir * 2.5 * speedMul,
        vy: 0.3 * speedMul,
        r: 5, color: '#ff8844'
      });
    }
    if (t % 40 === 0) {
      // 自機狙いの針
      const dx = player.x - boss.x, dy = player.y - boss.y;
      const baseA = Math.atan2(dy, dx);
      const n = Math.max(3, Math.round(5 * bulletMul));
      for (let i = 0; i < n; i++) {
        const a = baseA + (i - (n-1)/2) * 0.08;
        enemyBullets.push({
          x: boss.x, y: boss.y,
          vx: Math.cos(a) * 3 * speedMul,
          vy: Math.sin(a) * 3 * speedMul,
          r: 4, color: '#ffaa66'
        });
      }
    }
  } else {
    // 結界「弾幕鳳凰陣」(最終): 螺旋＋ランダム拡散
    if (t % 4 === 0) {
      const arms = Math.max(3, Math.round(4 * bulletMul));
      for (let i = 0; i < arms; i++) {
        const a = t * 0.08 + i * Math.PI * 2 / arms;
        enemyBullets.push({
          x: boss.x, y: boss.y,
          vx: Math.cos(a) * 1.9 * speedMul,
          vy: Math.sin(a) * 1.9 * speedMul,
          r: 5, color: '#ffcc44'
        });
      }
    }
    // 追加: 周期的に全方位拡散
    if (t > 0 && t % 90 === 0) {
      const n = Math.max(12, Math.round(20 * bulletMul));
      for (let i = 0; i < n; i++) {
        const a = i * Math.PI * 2 / n;
        enemyBullets.push({
          x: boss.x, y: boss.y,
          vx: Math.cos(a) * 1.5 * speedMul,
          vy: Math.sin(a) * 1.5 * speedMul,
          r: 5, color: '#ffaa66'
        });
      }
    }
  }
}

function updateBoss() {
  if (bossActive && boss) {
    boss.patternTimer++;
    if (boss.spellAnnounceTimer > 0) boss.spellAnnounceTimer--;
    if (boss.invulnAfterSpell > 0) boss.invulnAfterSpell--;
    boss.spellTimer--;
    boss.moveTimer--;
    if (boss.moveTimer <= 0) {
      boss.targetX = PX + 80 + Math.random() * (PW - 160);
      boss.targetY = PY + 60 + Math.random() * 120;
      boss.moveTimer = 90;
    }
    boss.x += (boss.targetX - boss.x) * 0.03;
    boss.y += (boss.targetY - boss.y) * 0.03;
    // 現スペルのHPが尽きたら次のスペルへ
    if (boss.hp <= boss.patternHpMin && boss.pattern < SPELL_CARDS.length - 1) {
      nextSpellCard();
    }
    // スペル開始演出中は弾撃たない
    if (boss.spellAnnounceTimer <= 0) bossShoot();
  }
}

function checkBossPlayerCollision() {
  if (boss && Math.hypot(boss.x - player.x, boss.y - player.y) < boss.r + player.hitR) hit();
}

function drawBoss() {
  if (boss) {
    // 外側の柔らかい発光層 (大きく薄く、ゆっくり脈動)
    const softR = boss.r * 2.6 + Math.sin(frame*0.05)*6;
    const softGrad = ctx.createRadialGradient(boss.x, boss.y, boss.r * 0.8, boss.x, boss.y, softR);
    softGrad.addColorStop(0, 'rgba(255, 200, 230, 0.25)');
    softGrad.addColorStop(0.6, 'rgba(255, 150, 210, 0.12)');
    softGrad.addColorStop(1, 'rgba(255, 150, 210, 0)');
    ctx.fillStyle = softGrad;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, softR, 0, Math.PI*2);
    ctx.fill();
    // 既存のピンクオーラ (画像の下に維持)
    const auraR = boss.r + 8 + Math.sin(frame*0.1)*4;
    const grad2 = ctx.createRadialGradient(boss.x, boss.y, boss.r, boss.x, boss.y, auraR);
    grad2.addColorStop(0, 'rgba(255,100,200,0.6)');
    grad2.addColorStop(1, 'rgba(255,100,200,0)');
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, auraR, 0, Math.PI*2);
    ctx.fill();
    // 本体: ステージ別画像、未ロード時はピンクの円+白輪郭にフォールバック
    if (!drawImageCentered(`boss_stage${selectedStage}`, boss.x, boss.y, 88)) {
      ctx.fillStyle = '#ff6699';
      ctx.beginPath();
      ctx.arc(boss.x, boss.y, boss.r, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

function drawBossHpBar() {
  // ボスHPバー (スペルカード単位で表示)
  if (boss) {
    const w = PW - 40;
    const card = SPELL_CARDS[boss.pattern];
    // 現在のスペルカードのHP範囲内での残量
    const cardHpRange = boss.patternHpStart - boss.patternHpMin;
    const cardHpRemain = Math.max(0, boss.hp - boss.patternHpMin);
    const ratio = cardHpRange > 0 ? cardHpRemain / cardHpRange : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(PX + 20, PY + 4, w, 6);
    ctx.fillStyle = card.color;
    ctx.fillRect(PX + 20, PY + 4, w * ratio, 6);
    // 残スペル数の星
    for (let i = 0; i < SPELL_CARDS.length; i++) {
      const sx = PX + 20 + i * 14;
      ctx.fillStyle = i <= boss.pattern ? 'rgba(255,255,255,0.3)' : '#ffcc44';
      ctx.beginPath();
      ctx.arc(sx, PY + 16, 3, 0, Math.PI*2);
      ctx.fill();
    }
    // スペルカード名 (右上)
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px "Hiragino Mincho ProN", serif';
    ctx.textAlign = 'right';
    ctx.fillText(card.name, PX + PW - 8, PY + 18);
    // 残時間
    if (boss.spellAnnounceTimer <= 0) {
      const sec = Math.ceil(boss.spellTimer / 60);
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = sec <= 10 ? '#ff4444' : '#ffcc44';
      ctx.textAlign = 'left';
      ctx.fillText(`${sec}`, PX + 20, PY + 26);
    }
  }
}

// 詠唱マナ円: ボスの周りに魔法陣 (多重円・五芒星・ルーン) が回転しながら広がる
function drawManaCircle(cx, cy, t, color) {
  // t: 0→1 (90F のスペル開始演出進行度)
  const baseScale = Math.min(1, t * 1.4);  // 67%地点でフルサイズ
  const baseR = 200 * baseScale;
  const alpha = Math.sin(t * Math.PI) * 0.85; // 真ん中で最大、両端で0

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;

  // ── 外側の輪 ──
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
  ctx.stroke();

  // ── 内側の輪 ──
  ctx.beginPath();
  ctx.arc(cx, cy, baseR * 0.78, 0, Math.PI * 2);
  ctx.stroke();

  // ── 最内輪 ──
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, baseR * 0.5, 0, Math.PI * 2);
  ctx.stroke();

  // ── 五芒星 (時計回り回転、内輪に内接) ──
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(frame * 0.04);
  ctx.lineWidth = 2;
  const starR = baseR * 0.78;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    // 飛ばし頂点で星型を作る
    const a = -Math.PI/2 + i * (Math.PI * 4 / 5);
    const px = Math.cos(a) * starR;
    const py = Math.sin(a) * starR;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // ── ルーン文字風ティック (12本、外輪の外に放射、反時計回り回転) ──
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(frame * -0.025);
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI * 2 / 12;
    const r1 = baseR;
    const r2 = baseR + 14;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
    ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
    ctx.stroke();
    // 端点に小さな丸 (ルーン記号風)
    const cxr = Math.cos(a) * (r2 + 5);
    const cyr = Math.sin(a) * (r2 + 5);
    ctx.beginPath();
    ctx.arc(cxr, cyr, 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // ── 4方位のダイヤ装飾 (ゆっくり回転、塗り) ──
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(frame * 0.015);
  ctx.fillStyle = color;
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    const x = Math.cos(a) * baseR;
    const y = Math.sin(a) * baseR;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();
  }
  ctx.restore();

  ctx.restore();
}

function drawSpellAnnounce() {
  // スペルカード開始演出
  if (boss && boss.spellAnnounceTimer > 0) {
    const t = 1 - (boss.spellAnnounceTimer / 90); // 0→1
    const cardColor = SPELL_CARDS[boss.pattern].color;
    ctx.save();
    ctx.beginPath();
    ctx.rect(PX, PY, PW, PH);
    ctx.clip();
    // 背景暗転
    ctx.fillStyle = `rgba(0, 0, 0, ${0.5 * Math.sin(t * Math.PI)})`;
    ctx.fillRect(PX, PY, PW, PH);
    // 詠唱マナ円
    drawManaCircle(boss.x, boss.y, t, cardColor);
    // カード名表示 (フェードイン)
    const slideX = PX + PW/2 - (1 - t) * 200;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(t * Math.PI)})`;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('～ Spell Card ～', slideX, PY + PH/2 - 30);
    ctx.font = 'bold 28px "Hiragino Mincho ProN", serif';
    ctx.fillStyle = `rgba(255, 220, 240, ${Math.sin(t * Math.PI)})`;
    ctx.shadowColor = cardColor;
    ctx.shadowBlur = 16;
    ctx.fillText(SPELL_CARDS[boss.pattern].name, slideX, PY + PH/2 + 10);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

// ─────────────────────────────────────────────────────────
// ボス出現カットイン (state='bossIntro')
// 180F 構成:
//   0- 30: 全画面が黒オーバーレイへフェードイン (alpha 0→0.75)
//  30- 90: ボス画像が画面右からスライドイン (中央やや右に着地)
//  30-150: 上部の赤帯 + 「!! WARNING !!」点滅
//  60-150: ボス画像の左に縦書き風で「幻想郷の主」(明朝、shadowBlur)
// 150-180: 全体フェードアウト (alpha 0.75→0)、ボス画像も同時にフェード
// 60-165: 画面下に小さく「(Z でスキップ)」
// ─────────────────────────────────────────────────────────
function drawBossIntro() {
  if (state !== 'bossIntro') return;
  const TOTAL = 180;
  const t = TOTAL - bossIntroTimer; // 0 → 180

  ctx.save();
  ctx.beginPath();
  ctx.rect(PX, PY, PW, PH);
  ctx.clip();

  // 1. 黒オーバーレイ
  let bgAlpha;
  if (t < 30) bgAlpha = (t / 30) * 0.78;
  else if (t < 150) bgAlpha = 0.78;
  else bgAlpha = 0.78 * (TOTAL - t) / 30;
  ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
  ctx.fillRect(PX, PY, PW, PH);

  // 2. ボス画像 (右からスライドイン → 保持 → フェードアウト)
  if (t >= 30) {
    let slideT, alpha;
    if (t < 90) {
      const raw = (t - 30) / 60;
      slideT = 1 - Math.pow(1 - raw, 3); // ease-out cubic
      alpha = slideT;
    } else if (t < 150) {
      slideT = 1;
      alpha = 1;
    } else {
      slideT = 1;
      alpha = (TOTAL - t) / 30;
    }
    const startX = PX + PW + 220;
    const endX = PX + PW * 0.62;
    const bossX = startX + (endX - startX) * slideT;
    const bossY = PY + PH * 0.5;
    ctx.globalAlpha = alpha;
    if (!drawImageCentered(`boss_stage${selectedStage}`, bossX, bossY, 320)) {
      // 画像未ロード時のフォールバック (ピンクの円)
      ctx.fillStyle = '#ff6699';
      ctx.beginPath();
      ctx.arc(bossX, bossY, 80, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // 3. 赤い WARNING 帯 (点滅)
  if (t >= 30 && t < 150) {
    const bannerY = PY + 80;
    const blink = Math.floor(t / 6) % 2 === 0;
    ctx.fillStyle = `rgba(220, 30, 50, ${0.55 + (blink ? 0.18 : 0)})`;
    ctx.fillRect(PX, bannerY - 28, PW, 56);
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PX, bannerY - 28); ctx.lineTo(PX + PW, bannerY - 28);
    ctx.moveTo(PX, bannerY + 28); ctx.lineTo(PX + PW, bannerY + 28);
    ctx.stroke();
    ctx.fillStyle = blink ? '#ffffff' : '#ffe0e0';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff0000';
    ctx.fillText('!! WARNING !!', PX + PW/2, bannerY + 8);
    ctx.shadowBlur = 0;
  }

  // 4. ボス名 (左側、フェード+スライドイン)
  if (t >= 60 && t < 150) {
    const fadeT = Math.min(1, (t - 60) / 20);
    const slideOff = -36 * (1 - fadeT);
    const nameX = PX + 28 + slideOff;
    const nameY = PY + PH * 0.5 - 6;
    ctx.textAlign = 'left';
    ctx.font = 'bold 38px "Hiragino Mincho ProN", "Yu Mincho", serif';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ff66cc';
    ctx.fillStyle = `rgba(255, 220, 240, ${fadeT})`;
    ctx.fillText('幻想郷の主', nameX, nameY);
    ctx.font = 'bold 14px sans-serif';
    ctx.shadowBlur = 8;
    ctx.fillStyle = `rgba(255, 200, 220, ${fadeT * 0.85})`;
    ctx.fillText('— Master of Gensokyo —', nameX, nameY + 28);
    ctx.shadowBlur = 0;
  }

  // 5. スキップヒント (下部)
  if (t >= 60 && t < 165) {
    ctx.textAlign = 'center';
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('(Z でスキップ)', PX + PW/2, PY + PH - 14);
  }

  ctx.restore();
}

// "凍符「永久凍土の檻」" → { prefix: "凍符", body: "永久凍土の檻" }
// "通常攻撃" → { prefix: null, body: "通常攻撃" }
function parseSpellName(name) {
  const m = name.match(/^(.+?)「(.+)」$/);
  if (m) return { prefix: m[1], body: m[2] };
  return { prefix: null, body: name };
}

// ─────────────────────────────────────────────────────────
// スペルカード突入カットイン (state='spellCutin')
// 90F 構成 (2-5枚目のスペルカード切替時のみ発動):
//   0-15: 薄い暗転 (α 0→0.5) + カード枠が画面右からスライドイン
//  15-60: カード枠が中央保持。ボス画像 / フレーバー / スペル名 / Spell Card N/5 表示
//          背景の魔法陣 (同心円+8方放射) が回転
//  60-90: カード+暗転がフェードアウト → state='play' で既存マナ円演出に繋がる
// ─────────────────────────────────────────────────────────
function drawSpellCutin() {
  if (state !== 'spellCutin' || !boss) return;
  const TOTAL = 90;
  const t = TOTAL - spellCutinTimer; // 0 → 90
  const card = SPELL_CARDS[boss.pattern];
  const cardColor = card.color;

  ctx.save();
  ctx.beginPath();
  ctx.rect(PX, PY, PW, PH);
  ctx.clip();

  // 1. 薄い暗転
  let bgAlpha;
  if (t < 15) bgAlpha = (t / 15) * 0.5;
  else if (t < 60) bgAlpha = 0.5;
  else bgAlpha = 0.5 * (TOTAL - t) / 30;
  ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
  ctx.fillRect(PX, PY, PW, PH);

  // 2. カード枠 (右からスライドイン → 保持 → フェード)
  let slideT, cardAlpha;
  if (t < 15) {
    const raw = t / 15;
    slideT = 1 - Math.pow(1 - raw, 3);
    cardAlpha = slideT;
  } else if (t < 60) {
    slideT = 1;
    cardAlpha = 1;
  } else {
    slideT = 1;
    cardAlpha = (TOTAL - t) / 30;
  }
  const cardW = 320, cardH = 380;
  const startX = PX + PW + 80;
  const endX = PX + PW/2 - cardW/2;
  const cardX = startX + (endX - startX) * slideT;
  const cardY = PY + PH/2 - cardH/2;

  ctx.globalAlpha = cardAlpha;

  // カード背景
  ctx.fillStyle = 'rgba(20, 8, 30, 0.88)';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  // カード外枠 (cardColor + glow)
  ctx.strokeStyle = cardColor;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 18;
  ctx.shadowColor = cardColor;
  ctx.strokeRect(cardX, cardY, cardW, cardH);
  ctx.shadowBlur = 0;
  // 内側の細い枠
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(cardX + 8, cardY + 8, cardW - 16, cardH - 16);

  // 3. 中央の魔法陣風背景 (15F 経過後にじわっと出現、回転)
  if (t > 10) {
    const mandalaAlpha = Math.min(1, (t - 10) / 20);
    const cx0 = cardX + cardW/2;
    const cy0 = cardY + cardH/2;
    ctx.save();
    ctx.translate(cx0, cy0);
    ctx.rotate(frame * 0.022);
    ctx.strokeStyle = cardColor;
    ctx.globalAlpha = cardAlpha * mandalaAlpha * 0.3;
    ctx.lineWidth = 1.5;
    // 同心円
    for (let r = 35; r < 150; r += 25) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    // 8方放射線
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      ctx.moveTo(Math.cos(a) * 30, Math.sin(a) * 30);
      ctx.lineTo(Math.cos(a) * 145, Math.sin(a) * 145);
    }
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = cardAlpha;
  }

  // 4. ボス画像 (上部、円クリップ + cardColor の輪)
  const bossThumbY = cardY + 80;
  const bossR = 56;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cardX + cardW/2, bossThumbY, bossR, 0, Math.PI * 2);
  ctx.clip();
  if (!drawImageCentered(`boss_stage${selectedStage}`, cardX + cardW/2, bossThumbY, 130)) {
    ctx.fillStyle = '#ff6699';
    ctx.beginPath();
    ctx.arc(cardX + cardW/2, bossThumbY, bossR - 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = cardColor;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.shadowColor = cardColor;
  ctx.beginPath();
  ctx.arc(cardX + cardW/2, bossThumbY, bossR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 5. フレーバー "!! Spell Card !!"
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe0f0';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('!! Spell Card !!', cardX + cardW/2, cardY + 170);

  // 6. スペル名 (前置詞「○符」+ 本体「○○○」を2段表示)
  const nameParts = parseSpellName(card.name);
  ctx.shadowBlur = 14;
  ctx.shadowColor = cardColor;
  if (nameParts.prefix) {
    ctx.font = 'bold 22px "Hiragino Mincho ProN", "Yu Mincho", serif';
    ctx.fillStyle = cardColor;
    ctx.fillText(nameParts.prefix, cardX + cardW/2, cardY + 215);
    ctx.font = 'bold 26px "Hiragino Mincho ProN", "Yu Mincho", serif';
    ctx.fillStyle = '#fff5fa';
    ctx.fillText(nameParts.body, cardX + cardW/2, cardY + 255);
  } else {
    // 「通常攻撃」等、prefix なしのカード
    ctx.font = 'bold 28px "Hiragino Mincho ProN", "Yu Mincho", serif';
    ctx.fillStyle = '#fff5fa';
    ctx.fillText(card.name, cardX + cardW/2, cardY + 235);
  }
  ctx.shadowBlur = 0;

  // 7. "Spell Card N / 5"
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`Spell Card ${boss.pattern + 1} / ${SPELL_CARDS.length}`, cardX + cardW/2, cardY + cardH - 42);

  // 8. スキップヒント
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '11px sans-serif';
  ctx.fillText('(Z でスキップ)', cardX + cardW/2, cardY + cardH - 18);

  ctx.globalAlpha = 1;
  ctx.restore();
}
