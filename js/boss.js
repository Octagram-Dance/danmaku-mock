// ボス (スペルカード・生成・動作・描画)
//
// ステージ別データ構造:
//   SPELL_CARDS_BY_STAGE[stage] = [ { name, color, hp, shoot }, ... 5枚 ]
//   BOSS_NAMES[stage]           = { ja, en }
//   BOSS_MOVE_BY_STAGE[stage]   = { cycle, lerp, teleportInterval }
//
// ボス生成時に boss.spellCards / boss.name / 移動パラメータを selectedStage で焼き付ける。
// HP範囲・色・弾幕パターンはすべて boss.spellCards 経由でアクセス。

// ─────────────────────────────────────────────────────────
// 弾幕パターン関数 (15通り = 3 ステージ × 5 カード)
// 引数: (boss, t, speedMul, bulletMul) — t は boss.patternTimer
// ─────────────────────────────────────────────────────────

// ── ステージ1: 紫の妖怪少女 ──

// 1-0 通常攻撃: 全方位ばらまき (ランダム角度・速度)
function shoot_s1_0(boss, t, speedMul, bulletMul) {
  if (t % 10 !== 0) return;
  const n = Math.max(6, Math.round(12 * bulletMul));
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 1.4 + Math.random() * 0.8;
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * sp * speedMul,
      vy: Math.sin(a) * sp * speedMul,
      r: 5, color: '#ff66cc'
    });
  }
}

// 1-1 幻光「螺旋幻想曲」: 自機狙い扇形 (旧パターンを継承)
function shoot_s1_1(boss, t, speedMul, bulletMul) {
  if (t % 30 !== 0) return;
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

// 1-2 魔星「七色の星雨」: 上端から色とりどりの弾が降る
function shoot_s1_2(boss, t, speedMul, bulletMul) {
  if (t % 6 !== 0) return;
  const colors = ['#ff66cc', '#88ddff', '#ffcc44', '#88ff88', '#aa66ff', '#ff8844'];
  const n = Math.max(2, Math.round(3 * bulletMul));
  for (let i = 0; i < n; i++) {
    const x = PX + 20 + Math.random() * (PW - 40);
    const c = colors[Math.floor(Math.random() * colors.length)];
    enemyBullets.push({
      x, y: PY - 10,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (1.5 + Math.random()) * speedMul,
      r: 5, color: c
    });
  }
}

// 1-3 幻象「鏡の世界」: 自機狙い5way (テレポートはステージ1の移動特性で実現)
function shoot_s1_3(boss, t, speedMul, bulletMul) {
  if (t % 30 !== 0) return;
  const dx = player.x - boss.x, dy = player.y - boss.y;
  const baseA = Math.atan2(dy, dx);
  const n = Math.max(5, Math.round(7 * bulletMul));
  for (let i = 0; i < n; i++) {
    const a = baseA + (i - (n-1)/2) * 0.16;
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * 2.4 * speedMul,
      vy: Math.sin(a) * 2.4 * speedMul,
      r: 5, color: '#aa66ff'
    });
  }
}

// 1-4 幻想「ラスト・ファンタズム」: 12方向の高速直線弾 (レーザー風の連弾)
function shoot_s1_4(boss, t, speedMul, bulletMul) {
  if (t % 18 === 0) {
    const arms = Math.max(8, Math.round(12 * bulletMul));
    const offset = (t / 18) * 0.25;
    for (let i = 0; i < arms; i++) {
      const a = offset + i * Math.PI * 2 / arms;
      // 1方向あたり3連弾で「線」を構成
      for (let j = 0; j < 3; j++) {
        enemyBullets.push({
          x: boss.x, y: boss.y,
          vx: Math.cos(a) * (3.0 + j * 0.6) * speedMul,
          vy: Math.sin(a) * (3.0 + j * 0.6) * speedMul,
          r: 4, color: '#ffcc44'
        });
      }
    }
  }
  // 中継ぎの全方位拡散 (たまに)
  if (t > 0 && t % 90 === 0) {
    const n = Math.max(10, Math.round(16 * bulletMul));
    for (let i = 0; i < n; i++) {
      const a = i * Math.PI * 2 / n;
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * 1.6 * speedMul,
        vy: Math.sin(a) * 1.6 * speedMul,
        r: 5, color: '#ffaa66'
      });
    }
  }
}

// ── ステージ2: 氷の少女 ──

// 2-0 通常攻撃: 大粒の青い弾、自機狙い扇形・低速
function shoot_s2_0(boss, t, speedMul, bulletMul) {
  if (t % 24 !== 0) return;
  const dx = player.x - boss.x, dy = player.y - boss.y;
  const baseA = Math.atan2(dy, dx);
  const n = Math.max(3, Math.round(5 * bulletMul));
  for (let i = 0; i < n; i++) {
    const a = baseA + (i - (n-1)/2) * 0.22;
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * 1.4 * speedMul,
      vy: Math.sin(a) * 1.4 * speedMul,
      r: 7, color: '#88ddff'
    });
  }
}

// 2-1 氷符「凍る花畑」: 円形展開 → 60F 凍結 → 動き出す
function shoot_s2_1(boss, t, speedMul, bulletMul) {
  if (t % 90 !== 0) return;
  const n = Math.max(10, Math.round(16 * bulletMul));
  for (let i = 0; i < n; i++) {
    const a = i * Math.PI * 2 / n + Math.random() * 0.05;
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * 1.4 * speedMul,
      vy: Math.sin(a) * 1.4 * speedMul,
      r: 5, color: '#aaeeff',
      freezeTimer: 60  // 1秒固まる
    });
  }
}

// 2-2 凍符「永久凍土の檻」: 既存の十字+徐々に回転
function shoot_s2_2(boss, t, speedMul, bulletMul) {
  if (t % 12 !== 0) return;
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

// 2-3 雪符「雪の華吹雪」: 結晶状の6方向放射、ゆっくり回転
function shoot_s2_3(boss, t, speedMul, bulletMul) {
  if (t % 8 !== 0) return;
  const arms = 6;
  const rot = t * 0.018;
  for (let i = 0; i < arms; i++) {
    const a = rot + i * Math.PI * 2 / arms;
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * 0.95 * speedMul,
      vy: Math.sin(a) * 0.95 * speedMul,
      r: 4, color: '#ddffff'
    });
  }
  // 副: 自機狙いの細い針 (たまに)
  if (t % 60 === 30) {
    const dx = player.x - boss.x, dy = player.y - boss.y;
    const baseA = Math.atan2(dy, dx);
    const n = Math.max(2, Math.round(3 * bulletMul));
    for (let i = 0; i < n; i++) {
      const a = baseA + (i - (n-1)/2) * 0.1;
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * 2.4 * speedMul,
        vy: Math.sin(a) * 2.4 * speedMul,
        r: 4, color: '#bbeeff'
      });
    }
  }
}

// 2-4 絶氷「アブソリュート・ゼロ」: 螺旋連射 + 240F ごとに全弾フリーズ
function shoot_s2_4(boss, t, speedMul, bulletMul) {
  if (t % 4 === 0) {
    const arms = Math.max(2, Math.round(3 * bulletMul));
    const off = t * 0.07;
    for (let i = 0; i < arms; i++) {
      const a = off + i * Math.PI * 2 / arms;
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * 1.7 * speedMul,
        vy: Math.sin(a) * 1.7 * speedMul,
        r: 4, color: '#ffffff'
      });
    }
  }
  // 240Fごとに画面の弾を一瞬フリーズ (絶氷)
  if (t > 0 && t % 240 === 0) {
    enemyBullets.forEach(b => {
      if (!b.freezeTimer) b.freezeTimer = 36;
    });
  }
}

// ── ステージ3: 紅葉の少女 ──

// 3-0 通常攻撃: 扇形に弾撒き
function shoot_s3_0(boss, t, speedMul, bulletMul) {
  if (t % 24 !== 0) return;
  const dx = player.x - boss.x, dy = player.y - boss.y;
  const baseA = Math.atan2(dy, dx);
  const n = Math.max(5, Math.round(8 * bulletMul));
  const spread = 0.7;
  for (let i = 0; i < n; i++) {
    const a = baseA + (i - (n-1)/2) * spread / Math.max(1, n-1);
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * 1.9 * speedMul,
      vy: Math.sin(a) * 1.9 * speedMul,
      r: 5, color: '#ff8844'
    });
  }
}

// 3-1 秋符「紅葉散らし」: 下半周に扇形展開、弾は軽くカーブして葉が落ちるように飛ぶ
// omegaDecay で旋回が減衰するため、弾はボス周りに留まらず素直に画面下に落ちる
function shoot_s3_1(boss, t, speedMul, bulletMul) {
  if (t % 8 !== 0) return;
  const arms = Math.max(3, Math.round(5 * bulletMul));
  const baseRot = Math.sin(t * 0.04) * 0.4; // 扇全体が左右に揺れる (葉が舞う風感)
  for (let i = 0; i < arms; i++) {
    // 下向き(PI/2)を中心に ±50° 程度に扇展開
    const a = Math.PI / 2 + (i - (arms - 1) / 2) * 0.45 + baseRot;
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * 1.8 * speedMul,
      vy: Math.sin(a) * 1.8 * speedMul,
      r: 5, color: '#ffaa55',
      omega: 0.025,      // 初期は軽くカーブ
      omegaDecay: 0.95   // ~60F で omega ≈ 0 → ほぼ直進落下
    });
  }
}

// 3-2 紅葉「秋風の刃」: 既存の横一線+自機狙い針
function shoot_s3_2(boss, t, speedMul, bulletMul) {
  if (t % 6 === 0) {
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
}

// 3-3 楓符「燃える葉の舞」: 自機上空に火球の円が出現 + 通常自機狙い
// 突然弾が出るのを避けるため、30F 前にパーティクルが中心に収束する予兆 (テレグラフ) を出す
function shoot_s3_3(boss, t, speedMul, bulletMul) {
  // ── 予兆 (発射 30F 前) ──
  // 火球発生位置を確定し、周囲のパーティクルが中心に集まる演出を出す
  if (t % 60 === 0) {
    const fx = clamp(player.x + (Math.random() - 0.5) * 80, PX + 40, PX + PW - 40);
    const fy = Math.max(PY + 60, player.y - 80 - Math.random() * 40);
    boss.fireballX = fx;
    boss.fireballY = fy;
    // 中心に向かって粒子を寄せる (30F で中心に到達するように速度調整)
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 25;
      const spd = dist / 16; // updateParticles の摩擦 0.95 を考慮した収束速度
      particles.push({
        x: fx + Math.cos(a) * dist,
        y: fy + Math.sin(a) * dist,
        vx: -Math.cos(a) * spd,
        vy: -Math.sin(a) * spd,
        life: 30,
        color: '#ff8844'
      });
    }
  }
  // ── 火球発射 (予兆完了時) ──
  if (t % 60 === 30 && boss.fireballX !== undefined) {
    const fx = boss.fireballX;
    const fy = boss.fireballY;
    explode(fx, fy, '#ffaa44', 18); // 着火フラッシュ
    const n = Math.max(6, Math.round(9 * bulletMul));
    for (let i = 0; i < n; i++) {
      const a = i * Math.PI * 2 / n;
      enemyBullets.push({
        x: fx, y: fy,
        vx: Math.cos(a) * 1.7 * speedMul,
        vy: Math.sin(a) * 1.7 * speedMul,
        r: 5, color: '#ff6644'
      });
    }
  }
  // 副: 自機狙いの単発を時々
  if (t % 24 === 0) {
    const dx = player.x - boss.x, dy = player.y - boss.y;
    const baseA = Math.atan2(dy, dx);
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(baseA) * 2.2 * speedMul,
      vy: Math.sin(baseA) * 2.2 * speedMul,
      r: 5, color: '#ffaa66'
    });
  }
}

// 3-4 神風「天狗の旋風」: 渦巻く弾幕 (omega) + 90F ごとに全方位高速直線弾
// omegaDecay でしばらくは渦巻くがやがて直進化、画面に弾が溜まりすぎない
function shoot_s3_4(boss, t, speedMul, bulletMul) {
  if (t % 4 === 0) {
    const arms = Math.max(3, Math.round(4 * bulletMul));
    const off = t * 0.08;
    for (let i = 0; i < arms; i++) {
      const a = off + i * Math.PI * 2 / arms;
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * 1.9 * speedMul,
        vy: Math.sin(a) * 1.9 * speedMul,
        r: 5, color: '#ffcc66',
        omega: 0.04,       // 渦巻く軌道
        omegaDecay: 0.97   // ~110F で実質直進、ボス周りに溜まらない
      });
    }
  }
  if (t > 0 && t % 90 === 0) {
    const n = Math.max(8, Math.round(14 * bulletMul));
    for (let i = 0; i < n; i++) {
      const a = i * Math.PI * 2 / n + (t / 90) * 0.2;
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * 3.4 * speedMul,
        vy: Math.sin(a) * 3.4 * speedMul,
        r: 4, color: '#ffaa66'
      });
    }
  }
}

// ─────────────────────────────────────────────────────────
// ステージ別データ
// ─────────────────────────────────────────────────────────

const SPELL_CARDS_BY_STAGE = {
  1: [
    { name: '通常攻撃',                color: '#ff66cc', hp: 0.18, shoot: shoot_s1_0 },
    { name: '幻光「螺旋幻想曲」',         color: '#88ff88', hp: 0.18, shoot: shoot_s1_1 },
    { name: '魔星「七色の星雨」',         color: '#ff88ee', hp: 0.20, shoot: shoot_s1_2 },
    { name: '幻象「鏡の世界」',          color: '#aa66ff', hp: 0.20, shoot: shoot_s1_3 },
    { name: '幻想「ラスト・ファンタズム」', color: '#ffcc44', hp: 0.24, shoot: shoot_s1_4 }
  ],
  2: [
    { name: '通常攻撃',                color: '#88ddff', hp: 0.18, shoot: shoot_s2_0 },
    { name: '氷符「凍る花畑」',          color: '#aaeeff', hp: 0.18, shoot: shoot_s2_1 },
    { name: '凍符「永久凍土の檻」',       color: '#88ddff', hp: 0.20, shoot: shoot_s2_2 },
    { name: '雪符「雪の華吹雪」',        color: '#ddffff', hp: 0.20, shoot: shoot_s2_3 },
    { name: '絶氷「アブソリュート・ゼロ」', color: '#ffffff', hp: 0.24, shoot: shoot_s2_4 }
  ],
  3: [
    { name: '通常攻撃',                color: '#ff8844', hp: 0.18, shoot: shoot_s3_0 },
    { name: '秋符「紅葉散らし」',        color: '#ffaa55', hp: 0.18, shoot: shoot_s3_1 },
    { name: '紅葉「秋風の刃」',          color: '#ff8844', hp: 0.20, shoot: shoot_s3_2 },
    { name: '楓符「燃える葉の舞」',       color: '#ff6644', hp: 0.20, shoot: shoot_s3_3 },
    { name: '神風「天狗の旋風」',        color: '#ffcc66', hp: 0.24, shoot: shoot_s3_4 }
  ]
};

// 後方互換: 旧 SPELL_CARDS への参照は SPELL_CARDS_BY_STAGE[1] を指す。
// 新規コードは可能なら boss.spellCards を使うこと。
const SPELL_CARDS = SPELL_CARDS_BY_STAGE[1];

// ボス名 (ステージ別、ja+en)
const BOSS_NAMES = {
  1: { ja: '紫雨',   en: 'Lady of the Violet Veil' },
  2: { ja: '雪舞',   en: 'Maiden of the Winter Frost' },
  3: { ja: '紅葉姫', en: 'Princess of Autumn Leaves' }
};

// 移動パターン (ステージ別の動き方)
//   cycle:            moveTimer のリセット周期 (大きいほどゆっくり)
//   lerp:             targetX/Y への近づき速度 (小さいほどゆっくり)
//   teleportInterval: テレポート発動周期F、0 で無効
const BOSS_MOVE_BY_STAGE = {
  1: { cycle: 90,  lerp: 0.03,  teleportInterval: 300 }, // 紫: 中央付近、5秒ごとにテレポート
  2: { cycle: 180, lerp: 0.015, teleportInterval: 0   }, // 氷: 浮遊・ゆったり
  3: { cycle: 60,  lerp: 0.05,  teleportInterval: 0   }  // 紅葉: 高速・広範囲
};

// ─────────────────────────────────────────────────────────
// ボス出現カットインを開始: state='bossIntro' に遷移し、画面の弾をフェードアウトに切替。
// 180F (3秒) 経過 or スキップで spawnBoss() が呼ばれて通常のボス戦が開始される。
// ─────────────────────────────────────────────────────────
function startBossIntro() {
  state = 'bossIntro';
  bossIntroTimer = 180;
  enemyBullets.forEach(b => { b.fading = true; });
}

function spawnBoss() {
  bossActive = true;
  const dm = DIFF_HP[selectedDifficulty];
  const totalHp = Math.floor(800 * dm);
  const cards = SPELL_CARDS_BY_STAGE[selectedStage] || SPELL_CARDS_BY_STAGE[1];
  const move = BOSS_MOVE_BY_STAGE[selectedStage] || BOSS_MOVE_BY_STAGE[1];
  const naming = BOSS_NAMES[selectedStage] || BOSS_NAMES[1];
  boss = {
    x: PX + PW/2, y: PY + 100,
    r: 22,
    totalHp,
    hp: totalHp,
    pattern: 0,
    patternHpStart: totalHp,
    patternHpMin: totalHp - Math.floor(totalHp * cards[0].hp),
    patternTimer: 0,
    moveTimer: 0,
    targetX: PX + PW/2, targetY: PY + 100,
    name: naming.ja,
    spellTimeLimit: 60 * 60,
    spellTimer: 60 * 60,
    spellAnnounceTimer: 90,
    invulnAfterSpell: 0,
    // ステージ別の特性
    spellCards: cards,
    moveCycle: move.cycle,
    moveLerp: move.lerp,
    teleportInterval: move.teleportInterval,
    teleportTimer: move.teleportInterval || 0,
    teleportFlash: 0,
    // ワープ演出強化用
    nextWarpX: 0,
    nextWarpY: 0,
    afterimages: []  // { x, y, life, maxLife } の配列
  };
}

function nextSpellCard() {
  if (!boss) return;
  if (boss.pattern >= boss.spellCards.length - 1) return; // 最後のカード
  boss.pattern++;
  const card = boss.spellCards[boss.pattern];
  boss.patternHpStart = boss.hp;
  boss.patternHpMin = boss.hp - Math.floor(boss.totalHp * card.hp);
  boss.patternTimer = 0;
  boss.spellTimer = boss.spellTimeLimit;
  boss.spellAnnounceTimer = 90;
  boss.invulnAfterSpell = 60;
  enemyBullets.forEach(b => { b.fading = true; });
  score += 30000;
  startSpellCutin();
}

// スペルカード突入カットインを開始 (state='spellCutin'、90F)。
function startSpellCutin() {
  state = 'spellCutin';
  spellCutinTimer = 90;
  hitStopFrames = 0;
}

// 各カードの shoot 関数にディスパッチ
function bossShoot() {
  if (!boss) return;
  const speedMul = DIFF_SPEED[selectedDifficulty];
  const bulletMul = DIFF_BULLET[selectedDifficulty];
  const card = boss.spellCards[boss.pattern];
  if (card && typeof card.shoot === 'function') {
    card.shoot(boss, boss.patternTimer, speedMul, bulletMul);
  }
}

function updateBoss() {
  if (!bossActive || !boss) return;
  boss.patternTimer++;
  if (boss.spellAnnounceTimer > 0) boss.spellAnnounceTimer--;
  if (boss.invulnAfterSpell > 0) boss.invulnAfterSpell--;
  boss.spellTimer--;

  // 通常移動 (ステージ別 cycle/lerp)
  boss.moveTimer--;
  if (boss.moveTimer <= 0) {
    boss.targetX = PX + 80 + Math.random() * (PW - 160);
    boss.targetY = PY + 60 + Math.random() * 120;
    boss.moveTimer = boss.moveCycle;
  }
  boss.x += (boss.targetX - boss.x) * boss.moveLerp;
  boss.y += (boss.targetY - boss.y) * boss.moveLerp;

  // テレポート (ステージ1のみ teleportInterval > 0)
  // タイマーが残り 30F になった瞬間に「次の移動先」を決定し予告マーカーを表示開始。
  // 残り 15F から旧位置に紫の収束光が走り、0F でワープ実行+残像生成。
  if (boss.teleportInterval > 0) {
    boss.teleportTimer--;
    if (boss.teleportTimer === 30) {
      // 移動先を決定 (この瞬間から drawBoss が予告マーカーを描画)
      boss.nextWarpX = PX + 60 + Math.random() * (PW - 120);
      boss.nextWarpY = PY + 60 + Math.random() * 100;
    }
    if (boss.teleportTimer <= 0) {
      // ワープ実行
      const oldX = boss.x, oldY = boss.y;
      const newX = boss.nextWarpX, newY = boss.nextWarpY;
      // 旧位置→新位置を結ぶ線上に残像を生成 (4個、20F でフェードアウト)
      const N = 4;
      for (let i = 1; i <= N; i++) {
        const tt = i / (N + 1);
        boss.afterimages.push({
          x: oldX + (newX - oldX) * tt,
          y: oldY + (newY - oldY) * tt,
          life: 20,
          maxLife: 20
        });
      }
      boss.x = newX;
      boss.y = newY;
      boss.targetX = newX;
      boss.targetY = newY;
      boss.teleportFlash = 30;
      boss.teleportTimer = boss.teleportInterval;
      boss.invulnAfterSpell = Math.max(boss.invulnAfterSpell, 20); // 約 1/3 秒の保護
    }
  }
  if (boss.teleportFlash > 0) boss.teleportFlash--;
  // 残像のフェード更新
  if (boss.afterimages && boss.afterimages.length > 0) {
    boss.afterimages.forEach(a => a.life--);
    boss.afterimages = boss.afterimages.filter(a => a.life > 0);
  }

  // HP しきい値で次のスペルへ
  if (boss.hp <= boss.patternHpMin && boss.pattern < boss.spellCards.length - 1) {
    nextSpellCard();
  }
  // スペル開始演出中は弾撃たない
  if (boss.spellAnnounceTimer <= 0) bossShoot();
}

function checkBossPlayerCollision() {
  if (boss && Math.hypot(boss.x - player.x, boss.y - player.y) < boss.r + player.hitR) hit();
}

function drawBoss() {
  if (!boss) return;
  // ── 残像 (ワープ直後) ──
  // 旧位置と新位置を結ぶ線上にボス画像の半透明コピーが残り、20F でフェード。
  if (boss.afterimages && boss.afterimages.length > 0) {
    boss.afterimages.forEach(a => {
      const alpha = (a.life / a.maxLife) * 0.45;
      ctx.save();
      ctx.globalAlpha = alpha;
      if (!drawImageCentered(`boss_stage${selectedStage}`, a.x, a.y, 88)) {
        ctx.fillStyle = '#aa66ff';
        ctx.beginPath();
        ctx.arc(a.x, a.y, boss.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }
  // ── ワープ予告マーカー (移動先) ──
  // 残り 30F → 0F の間に脈動する同心円 (二重リング) を移動先に表示。
  if (boss.teleportInterval > 0 && boss.teleportTimer > 0 && boss.teleportTimer <= 30) {
    const t = (30 - boss.teleportTimer) / 30; // 0→1
    const pulse = (Math.sin(frame * 0.45) + 1) / 2; // 0..1 の脈動
    const baseR = 16 + 14 * pulse;
    const alpha = 0.45 + 0.35 * pulse + t * 0.2; // 時間が経つほど目立つ
    ctx.save();
    ctx.strokeStyle = `rgba(170, 102, 255, ${Math.min(1, alpha)})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(170, 102, 255, 0.85)';
    // 外側リング
    ctx.beginPath();
    ctx.arc(boss.nextWarpX, boss.nextWarpY, baseR, 0, Math.PI * 2);
    ctx.stroke();
    // 内側リング
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(boss.nextWarpX, boss.nextWarpY, baseR * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    // 中心点
    ctx.fillStyle = `rgba(220, 180, 255, ${0.6 * pulse + t * 0.4})`;
    ctx.beginPath();
    ctx.arc(boss.nextWarpX, boss.nextWarpY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // ── 収束光 (旧位置でボスを包む紫) ──
  // 残り 15F〜0F で現在位置の周りに紫光が集まる。
  if (boss.teleportInterval > 0 && boss.teleportTimer > 0 && boss.teleportTimer <= 15) {
    const t = (15 - boss.teleportTimer) / 15; // 0→1
    const auraR = 60 - 40 * t;                // 60 → 20 へ収縮
    const grad = ctx.createRadialGradient(boss.x, boss.y, 0, boss.x, boss.y, auraR);
    grad.addColorStop(0, `rgba(170, 102, 255, ${t * 0.7})`);
    grad.addColorStop(0.6, `rgba(170, 102, 255, ${t * 0.3})`);
    grad.addColorStop(1, 'rgba(170, 102, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, auraR, 0, Math.PI * 2);
    ctx.fill();
  }
  // 外側の柔らかい発光層 (ゆっくり脈動)
  const softR = boss.r * 2.6 + Math.sin(frame*0.05)*6;
  const softGrad = ctx.createRadialGradient(boss.x, boss.y, boss.r * 0.8, boss.x, boss.y, softR);
  softGrad.addColorStop(0, 'rgba(255, 200, 230, 0.25)');
  softGrad.addColorStop(0.6, 'rgba(255, 150, 210, 0.12)');
  softGrad.addColorStop(1, 'rgba(255, 150, 210, 0)');
  ctx.fillStyle = softGrad;
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, softR, 0, Math.PI*2);
  ctx.fill();
  // 既存のピンクオーラ
  const auraR = boss.r + 8 + Math.sin(frame*0.1)*4;
  const grad2 = ctx.createRadialGradient(boss.x, boss.y, boss.r, boss.x, boss.y, auraR);
  grad2.addColorStop(0, 'rgba(255,100,200,0.6)');
  grad2.addColorStop(1, 'rgba(255,100,200,0)');
  ctx.fillStyle = grad2;
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, auraR, 0, Math.PI*2);
  ctx.fill();
  // テレポート閃光リング (発動直後のみ、外側に広がる)
  if (boss.teleportFlash > 0) {
    const tt = boss.teleportFlash / 30; // 1→0
    const flashR = boss.r + 40 * (1 - tt);
    ctx.save();
    ctx.strokeStyle = `rgba(170, 102, 255, ${tt * 0.85})`;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 14;
    ctx.shadowColor = 'rgba(170, 102, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, flashR, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }
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

function drawBossHpBar() {
  if (!boss) return;
  const w = PW - 40;
  const card = boss.spellCards[boss.pattern];
  // 現スペルカードのHP範囲内での残量
  const cardHpRange = boss.patternHpStart - boss.patternHpMin;
  const cardHpRemain = Math.max(0, boss.hp - boss.patternHpMin);
  const ratio = cardHpRange > 0 ? cardHpRemain / cardHpRange : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(PX + 20, PY + 4, w, 6);
  ctx.fillStyle = card.color;
  ctx.fillRect(PX + 20, PY + 4, w * ratio, 6);
  // 残スペル数の星
  for (let i = 0; i < boss.spellCards.length; i++) {
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

// 詠唱マナ円: ボスの周りに魔法陣が回転しながら広がる
function drawManaCircle(cx, cy, t, color) {
  const baseScale = Math.min(1, t * 1.4);
  const baseR = 200 * baseScale;
  const alpha = Math.sin(t * Math.PI) * 0.85;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;

  // 外側の輪
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
  ctx.stroke();
  // 内側の輪
  ctx.beginPath();
  ctx.arc(cx, cy, baseR * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  // 最内輪
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, baseR * 0.5, 0, Math.PI * 2);
  ctx.stroke();

  // 五芒星
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(frame * 0.04);
  ctx.lineWidth = 2;
  const starR = baseR * 0.78;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI/2 + i * (Math.PI * 4 / 5);
    const px = Math.cos(a) * starR;
    const py = Math.sin(a) * starR;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // ルーン文字風ティック
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
    const cxr = Math.cos(a) * (r2 + 5);
    const cyr = Math.sin(a) * (r2 + 5);
    ctx.beginPath();
    ctx.arc(cxr, cyr, 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // 4方位のダイヤ装飾
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
  if (!boss || boss.spellAnnounceTimer <= 0) return;
  const t = 1 - (boss.spellAnnounceTimer / 90);
  const card = boss.spellCards[boss.pattern];
  const cardColor = card.color;
  ctx.save();
  ctx.beginPath();
  ctx.rect(PX, PY, PW, PH);
  ctx.clip();
  ctx.fillStyle = `rgba(0, 0, 0, ${0.5 * Math.sin(t * Math.PI)})`;
  ctx.fillRect(PX, PY, PW, PH);
  drawManaCircle(boss.x, boss.y, t, cardColor);
  const slideX = PX + PW/2 - (1 - t) * 200;
  ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(t * Math.PI)})`;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('～ Spell Card ～', slideX, PY + PH/2 - 30);
  ctx.font = 'bold 28px "Hiragino Mincho ProN", serif';
  ctx.fillStyle = `rgba(255, 220, 240, ${Math.sin(t * Math.PI)})`;
  ctx.shadowColor = cardColor;
  ctx.shadowBlur = 16;
  ctx.fillText(card.name, slideX, PY + PH/2 + 10);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ─────────────────────────────────────────────────────────
// ボス出現カットイン (state='bossIntro')
// ─────────────────────────────────────────────────────────
function drawBossIntro() {
  if (state !== 'bossIntro') return;
  const TOTAL = 180;
  const t = TOTAL - bossIntroTimer;

  const naming = BOSS_NAMES[selectedStage] || BOSS_NAMES[1];

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
      slideT = 1 - Math.pow(1 - raw, 3);
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

  // 4. ボス名 (左側、フェード+スライドイン) — ステージ別
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
    ctx.fillText(naming.ja, nameX, nameY);
    ctx.font = 'bold 14px sans-serif';
    ctx.shadowBlur = 8;
    ctx.fillStyle = `rgba(255, 200, 220, ${fadeT * 0.85})`;
    ctx.fillText(`— ${naming.en} —`, nameX, nameY + 28);
    ctx.shadowBlur = 0;
  }

  // 5. スキップヒント
  if (t >= 60 && t < 165) {
    ctx.textAlign = 'center';
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('(Z でスキップ)', PX + PW/2, PY + PH - 14);
  }

  ctx.restore();
}

// "凍符「永久凍土の檻」" → { prefix: "凍符", body: "永久凍土の檻" }
function parseSpellName(name) {
  const m = name.match(/^(.+?)「(.+)」$/);
  if (m) return { prefix: m[1], body: m[2] };
  return { prefix: null, body: name };
}

// ─────────────────────────────────────────────────────────
// スペルカード突入カットイン (state='spellCutin')
// ─────────────────────────────────────────────────────────
function drawSpellCutin() {
  if (state !== 'spellCutin' || !boss) return;
  const TOTAL = 90;
  const t = TOTAL - spellCutinTimer;
  const card = boss.spellCards[boss.pattern];
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
  ctx.fillStyle = 'rgba(20, 8, 30, 0.88)';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = cardColor;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 18;
  ctx.shadowColor = cardColor;
  ctx.strokeRect(cardX, cardY, cardW, cardH);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(cardX + 8, cardY + 8, cardW - 16, cardH - 16);

  // 3. 中央の魔法陣風背景
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
    for (let r = 35; r < 150; r += 25) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
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

  // 5. フレーバー
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
    ctx.font = 'bold 28px "Hiragino Mincho ProN", "Yu Mincho", serif';
    ctx.fillStyle = '#fff5fa';
    ctx.fillText(card.name, cardX + cardW/2, cardY + 235);
  }
  ctx.shadowBlur = 0;

  // 7. "Spell Card N / 5"
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`Spell Card ${boss.pattern + 1} / ${boss.spellCards.length}`, cardX + cardW/2, cardY + cardH - 42);

  // 8. スキップヒント
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '11px sans-serif';
  ctx.fillText('(Z でスキップ)', cardX + cardW/2, cardY + cardH - 18);

  ctx.globalAlpha = 1;
  ctx.restore();
}
