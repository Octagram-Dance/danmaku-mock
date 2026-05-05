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

// ── ステージ4: 雷の少女 ──

// 4-0 通常攻撃: 自機狙い 5way 高速雷玉 + ランダム方向の小弾
function shoot_s4_0(boss, t, speedMul, bulletMul) {
  if (t % 14 === 0) {
    const dx = player.x - boss.x, dy = player.y - boss.y;
    const baseA = Math.atan2(dy, dx);
    const n = Math.max(3, Math.round(5 * bulletMul));
    for (let i = 0; i < n; i++) {
      const a = baseA + (i - (n-1)/2) * 0.15;
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * 2.6 * speedMul,
        vy: Math.sin(a) * 2.6 * speedMul,
        r: 5, color: '#ffdd44'
      });
    }
  }
  if (t % 28 === 14) {
    const n = Math.max(3, Math.round(4 * bulletMul));
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * 1.6 * speedMul,
        vy: Math.sin(a) * 1.6 * speedMul,
        r: 4, color: '#ffeeaa'
      });
    }
  }
}

// 4-1 雷符「迅雷の閃光」: 8方向の高速雷射 (二連弾でビーム感) + 60Fごとに極太ボルト
function shoot_s4_1(boss, t, speedMul, bulletMul) {
  if (t % 12 === 0) {
    const arms = Math.max(6, Math.round(8 * bulletMul));
    const off = t * 0.05;
    for (let i = 0; i < arms; i++) {
      const a = off + i * Math.PI * 2 / arms;
      for (let j = 0; j < 2; j++) {
        enemyBullets.push({
          x: boss.x, y: boss.y,
          vx: Math.cos(a) * (2.8 + j * 0.6) * speedMul,
          vy: Math.sin(a) * (2.8 + j * 0.6) * speedMul,
          r: 4, color: '#ffeebb'
        });
      }
    }
  }
  if (t > 0 && t % 60 === 0) {
    const dx = player.x - boss.x, dy = player.y - boss.y;
    const a = Math.atan2(dy, dx);
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * 4.5 * speedMul,
      vy: Math.sin(a) * 4.5 * speedMul,
      r: 6, color: '#ffffff'
    });
  }
}

// 4-2 稲妻「ジグザグ・ライトニング」:
// 弾の発射方向を周期的に振って画面に階段状の弾列を作る + 自機狙いの細針バースト
function shoot_s4_2(boss, t, speedMul, bulletMul) {
  if (t % 6 === 0) {
    // 30Fごとに左右が反転、omegaで軽く曲げて稲妻のキレを演出
    const zig = (Math.floor(t / 30) % 2 === 0) ? 1 : -1;
    const baseA = Math.PI / 2 + zig * 0.55;
    enemyBullets.push({
      x: boss.x + (Math.random() - 0.5) * 60,
      y: boss.y,
      vx: Math.cos(baseA) * 1.7 * speedMul,
      vy: Math.sin(baseA) * 1.7 * speedMul,
      r: 4, color: '#aabbff',
      omega: -zig * 0.045,
      omegaDecay: 0.96
    });
  }
  if (t % 60 === 30) {
    const dx = player.x - boss.x, dy = player.y - boss.y;
    const a = Math.atan2(dy, dx);
    for (let i = -1; i <= 1; i++) {
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a + i * 0.08) * 3.5 * speedMul,
        vy: Math.sin(a + i * 0.08) * 3.5 * speedMul,
        r: 4, color: '#ddeeff'
      });
    }
  }
}

// 4-3 雷神「天鼓の咆哮」:
// 90Fごとに二重の衝撃波 (太鼓の二度打ち) + 自機狙いの単発雷
function shoot_s4_3(boss, t, speedMul, bulletMul) {
  if (t % 90 === 30) {
    explode(boss.x, boss.y, '#ffcc44', 30);
    const N = Math.max(20, Math.round(32 * bulletMul));
    for (let i = 0; i < N; i++) {
      const a = i * Math.PI * 2 / N;
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * 1.7 * speedMul,
        vy: Math.sin(a) * 1.7 * speedMul,
        r: 5, color: '#ffcc44'
      });
    }
  }
  if (t % 90 === 60) {
    const N = Math.max(16, Math.round(24 * bulletMul));
    for (let i = 0; i < N; i++) {
      const a = i * Math.PI * 2 / N + 0.13;
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * 2.4 * speedMul,
        vy: Math.sin(a) * 2.4 * speedMul,
        r: 4, color: '#ffeeaa'
      });
    }
  }
  if (t % 18 === 0) {
    const dx = player.x - boss.x, dy = player.y - boss.y;
    const a = Math.atan2(dy, dx);
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * 2.2 * speedMul,
      vy: Math.sin(a) * 2.2 * speedMul,
      r: 4, color: '#ffdd66'
    });
  }
}

// 4-4 終焉「神霹靂」: 螺旋連射 + 120Fごとに全方位高速バースト + 自機狙い針
function shoot_s4_4(boss, t, speedMul, bulletMul) {
  if (t % 3 === 0) {
    const arms = Math.max(3, Math.round(4 * bulletMul));
    const off = t * 0.13;
    for (let i = 0; i < arms; i++) {
      const a = off + i * Math.PI * 2 / arms;
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * 2.1 * speedMul,
        vy: Math.sin(a) * 2.1 * speedMul,
        r: 4, color: '#ffffff'
      });
    }
  }
  if (t > 0 && t % 120 === 0) {
    const N = Math.max(14, Math.round(20 * bulletMul));
    for (let i = 0; i < N; i++) {
      const a = i * Math.PI * 2 / N;
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * 4.0 * speedMul,
        vy: Math.sin(a) * 4.0 * speedMul,
        r: 5, color: '#ffeebb'
      });
    }
  }
  if (t % 22 === 11) {
    const dx = player.x - boss.x, dy = player.y - boss.y;
    const a = Math.atan2(dy, dx);
    for (let i = -2; i <= 2; i++) {
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a + i * 0.06) * 3.2 * speedMul,
        vy: Math.sin(a + i * 0.06) * 3.2 * speedMul,
        r: 3, color: '#ffffff'
      });
    }
  }
}

// ── ステージ5: 星界の女神 (ラスボス、10枚スペル) ──
// フェーズ1 (通常 → 流星): 1〜5
// フェーズ2 (覚醒 → ラスト): 6〜10

// 5-0 通常攻撃: 全方位星弾、ゆっくり広がる
function shoot_s5_0(boss, t, speedMul, bulletMul) {
  if (t % 18 !== 0) return;
  const arms = Math.max(8, Math.round(12 * bulletMul));
  const off = t * 0.04;
  for (let i = 0; i < arms; i++) {
    const a = off + i * Math.PI * 2 / arms;
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * 1.3 * speedMul,
      vy: Math.sin(a) * 1.3 * speedMul,
      r: 5, color: '#aaccff'
    });
  }
}

// 5-1 星符「銀河の旋律」: 螺旋連射 (omega + decay で銀河の腕風)
function shoot_s5_1(boss, t, speedMul, bulletMul) {
  if (t % 4 !== 0) return;
  const arms = Math.max(2, Math.round(3 * bulletMul));
  const off = t * 0.10;
  for (let i = 0; i < arms; i++) {
    const a = off + i * Math.PI * 2 / arms;
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * 1.6 * speedMul,
      vy: Math.sin(a) * 1.6 * speedMul,
      r: 4, color: '#ddccff',
      omega: 0.025,
      omegaDecay: 0.985
    });
  }
}

// 5-2 月符「冷たい光輪」: 円形 → 50F後に各弾が4子弾を生成 (2段階)
function shoot_s5_2(boss, t, speedMul, bulletMul) {
  if (t % 80 !== 0) return;
  const N = Math.max(10, Math.round(14 * bulletMul));
  const childSpeed = 1.0 * speedMul;
  for (let i = 0; i < N; i++) {
    const a = i * Math.PI * 2 / N;
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * 1.5 * speedMul,
      vy: Math.sin(a) * 1.5 * speedMul,
      r: 6, color: '#ccddff',
      _splitTimer: 50,
      _splitFn: (parent, pending) => {
        // 親の進行方向を基準に ±90° と ±180° の 4 子弾を生成
        // 子弾は pending に push (filter 中の enemyBullets 直接 push は最後の代入で消滅するため)
        const baseA = Math.atan2(parent.vy, parent.vx);
        for (let k = 0; k < 4; k++) {
          const angle = baseA + Math.PI / 2 + k * Math.PI / 2;
          pending.push({
            x: parent.x, y: parent.y,
            vx: Math.cos(angle) * childSpeed,
            vy: Math.sin(angle) * childSpeed,
            r: 4, color: '#aabbee'
          });
        }
        explode(parent.x, parent.y, '#ddeeff', 6);
      }
    });
  }
}

// 5-3 重力「ブラックホール」: 渦巻きながら自機に弱く引き寄せられる
function shoot_s5_3(boss, t, speedMul, bulletMul) {
  if (t % 6 !== 0) return;
  const arms = Math.max(2, Math.round(3 * bulletMul));
  const off = t * 0.13;
  for (let i = 0; i < arms; i++) {
    const a = off + i * Math.PI * 2 / arms;
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * 1.4 * speedMul,
      vy: Math.sin(a) * 1.4 * speedMul,
      r: 5, color: '#553388',
      omega: 0.04,
      omegaDecay: 0.98,
      _gravityToPlayer: 0.012
    });
  }
}

// 5-4 流星「彗星の雨」: 上空からランダムに高速降下、軌跡付き
function shoot_s5_4(boss, t, speedMul, bulletMul) {
  if (t % 4 !== 0) return;
  const n = Math.max(1, Math.round(2 * bulletMul));
  for (let i = 0; i < n; i++) {
    const x = PX + Math.random() * PW;
    const angleDown = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    enemyBullets.push({
      x, y: PY - 10,
      vx: Math.cos(angleDown) * 4.5 * speedMul,
      vy: Math.sin(angleDown) * 4.5 * speedMul,
      r: 5, color: '#ffeecc',
      _trail: [], _trailLen: 10
    });
  }
}

// 5-5 真・通常攻撃: 全方位高速白弾、密度倍
function shoot_s5_5(boss, t, speedMul, bulletMul) {
  if (t % 10 !== 0) return;
  const arms = Math.max(12, Math.round(20 * bulletMul));
  const off = t * 0.03;
  for (let i = 0; i < arms; i++) {
    const a = off + i * Math.PI * 2 / arms;
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * 2.5 * speedMul,
      vy: Math.sin(a) * 2.5 * speedMul,
      r: 4, color: '#ffffff'
    });
  }
}

// 5-6 神星「コスミック・コラプス」: 4辺から中央に収束 → 中央で爆発 → 全方位拡散 (120Fサイクル)
function shoot_s5_6(boss, t, speedMul, bulletMul) {
  const phase = t % 120;
  // 0..40F: 4辺から中央へ収束する弾を毎4Fごとに発射
  if (phase < 40 && phase % 4 === 0) {
    const N = Math.max(2, Math.round(3 * bulletMul));
    for (let i = 0; i < N; i++) {
      const side = Math.floor(Math.random() * 4);
      let sx, sy;
      if (side === 0)      { sx = PX + Math.random() * PW;     sy = PY - 5; }
      else if (side === 1) { sx = PX + PW + 5;                  sy = PY + Math.random() * PH; }
      else if (side === 2) { sx = PX + Math.random() * PW;     sy = PY + PH + 5; }
      else                  { sx = PX - 5;                       sy = PY + Math.random() * PH; }
      const dx = boss.x - sx, dy = boss.y - sy;
      const d = Math.hypot(dx, dy);
      enemyBullets.push({
        x: sx, y: sy,
        vx: dx / d * 2.0 * speedMul,
        vy: dy / d * 2.0 * speedMul,
        r: 4, color: '#ff44ff',
        _trail: [], _trailLen: 6
      });
    }
  }
  // 40F: 中央で爆発、全方位拡散
  if (phase === 40) {
    explode(boss.x, boss.y, '#ff44ff', 30);
    const M = Math.max(20, Math.round(28 * bulletMul));
    for (let i = 0; i < M; i++) {
      const a = i * Math.PI * 2 / M;
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * 2.6 * speedMul,
        vy: Math.sin(a) * 2.6 * speedMul,
        r: 5, color: '#ff88ff'
      });
    }
  }
}

// 5-7 時空「歪んだ宇宙」: 弾が周期的にワープする
function shoot_s5_7(boss, t, speedMul, bulletMul) {
  if (t % 12 !== 0) return;
  const arms = Math.max(6, Math.round(8 * bulletMul));
  const off = t * 0.06;
  for (let i = 0; i < arms; i++) {
    const a = off + i * Math.PI * 2 / arms;
    enemyBullets.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * 1.5 * speedMul,
      vy: Math.sin(a) * 1.5 * speedMul,
      r: 5, color: '#88ffff',
      _warpInterval: 60 + Math.floor(Math.random() * 40),
      _warpRange: 60
    });
  }
}

// 5-8 終焉「ヘリオパウズ」: 3波連続の巨大弾幕 (180Fサイクル)
function shoot_s5_8(boss, t, speedMul, bulletMul) {
  const phase = t % 180;
  const N = Math.max(20, Math.round(28 * bulletMul));
  const wave = (count, off, color, speed) => {
    for (let i = 0; i < count; i++) {
      const a = off + i * Math.PI * 2 / count;
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * speed * speedMul,
        vy: Math.sin(a) * speed * speedMul,
        r: 5, color
      });
    }
  };
  if (phase === 30) wave(N, 0,            '#ffaa44', 1.7);
  if (phase === 60) wave(N, Math.PI / N,  '#ffcc66', 1.9);
  if (phase === 90) wave(N, 0.13,         '#ff8822', 2.1);
}

// 5-9 ラスト「宇宙の終わり」: 螺旋 + 全方位バースト + 流星雨 + 弱重力
// このゲーム最難関スペル
function shoot_s5_9(boss, t, speedMul, bulletMul) {
  // 高密度螺旋連射 (常時)
  if (t % 4 === 0) {
    const arms = Math.max(3, Math.round(4 * bulletMul));
    const off = t * 0.16;
    for (let i = 0; i < arms; i++) {
      const a = off + i * Math.PI * 2 / arms;
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * 2.2 * speedMul,
        vy: Math.sin(a) * 2.2 * speedMul,
        r: 4, color: '#ffffff',
        _gravityToPlayer: 0.005
      });
    }
  }
  // 90F毎に高速全方位バースト
  if (t > 0 && t % 90 === 0) {
    const N = Math.max(16, Math.round(22 * bulletMul));
    for (let i = 0; i < N; i++) {
      const a = i * Math.PI * 2 / N;
      enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * 3.5 * speedMul,
        vy: Math.sin(a) * 3.5 * speedMul,
        r: 5, color: '#ddccff'
      });
    }
  }
  // 180F毎に上空からの流星雨
  if (t > 0 && t % 180 === 60) {
    for (let i = 0; i < 8; i++) {
      const x = PX + Math.random() * PW;
      const angleDown = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      enemyBullets.push({
        x, y: PY - 10,
        vx: Math.cos(angleDown) * 4.5 * speedMul,
        vy: Math.sin(angleDown) * 4.5 * speedMul,
        r: 5, color: '#ffeecc',
        _trail: [], _trailLen: 10
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
  ],
  4: [
    { name: '通常攻撃',                    color: '#ffdd44', hp: 0.18, shoot: shoot_s4_0 },
    { name: '雷符「迅雷の閃光」',           color: '#ffeebb', hp: 0.18, shoot: shoot_s4_1 },
    { name: '稲妻「ジグザグ・ライトニング」', color: '#aabbff', hp: 0.20, shoot: shoot_s4_2 },
    { name: '雷神「天鼓の咆哮」',           color: '#ffcc44', hp: 0.20, shoot: shoot_s4_3 },
    { name: '終焉「神霹靂」',              color: '#ffffff', hp: 0.24, shoot: shoot_s4_4 }
  ],
  // ステージ5 (ラスボス): 10枚スペル、フェーズ1 (5枚) + フェーズ2 (5枚)、HP合計 1.0
  5: [
    // ── フェーズ1 ──
    { name: '通常攻撃',                       color: '#aaccff', hp: 0.05, shoot: shoot_s5_0 },
    { name: '星符「銀河の旋律」',              color: '#ddccff', hp: 0.10, shoot: shoot_s5_1 },
    { name: '月符「冷たい光輪」',              color: '#ccddff', hp: 0.10, shoot: shoot_s5_2 },
    { name: '重力「ブラックホール」',          color: '#553388', hp: 0.12, shoot: shoot_s5_3 },
    { name: '流星「彗星の雨」',                color: '#ffeecc', hp: 0.13, shoot: shoot_s5_4 },
    // ── フェーズ2 (覚醒後) ──
    { name: '真・通常攻撃',                    color: '#ffffff', hp: 0.08, shoot: shoot_s5_5 },
    { name: '神星「コスミック・コラプス」',     color: '#ff44ff', hp: 0.12, shoot: shoot_s5_6 },
    { name: '時空「歪んだ宇宙」',              color: '#88ffff', hp: 0.10, shoot: shoot_s5_7 },
    { name: '終焉「ヘリオパウズ」',            color: '#ffaa44', hp: 0.10, shoot: shoot_s5_8 },
    // 耐久スペル: ボス無敵、60 秒生き延びると撃破トリガー (startFinalBossDeath)
    { name: 'ラスト「宇宙の終わり」',           color: '#ffffff', hp: 0.10, shoot: shoot_s5_9, invulnerable: true }
  ]
};

// 後方互換: 旧 SPELL_CARDS への参照は SPELL_CARDS_BY_STAGE[1] を指す。
// 新規コードは可能なら boss.spellCards を使うこと。
const SPELL_CARDS = SPELL_CARDS_BY_STAGE[1];

// ボス名 (ステージ別、ja+en)
const BOSS_NAMES = {
  1: { ja: '紫雨',     en: 'Lady of the Violet Veil' },
  2: { ja: '雪舞',     en: 'Maiden of the Winter Frost' },
  3: { ja: '紅葉姫',   en: 'Princess of Autumn Leaves' },
  4: { ja: '神鳴',     en: 'Mistress of Roaring Thunder' },
  5: { ja: '星詠',     en: 'The Cosmic Sovereign' }
};

// 移動パターン (ステージ別の動き方)
//   cycle:            moveTimer のリセット周期 (大きいほどゆっくり)
//   lerp:             targetX/Y への近づき速度 (小さいほどゆっくり)
//   teleportInterval: テレポート発動周期F、0 で無効
const BOSS_MOVE_BY_STAGE = {
  1: { cycle: 90,  lerp: 0.03,  teleportInterval: 300 }, // 紫: 中央付近、5秒ごとにテレポート
  2: { cycle: 180, lerp: 0.015, teleportInterval: 0   }, // 氷: 浮遊・ゆったり
  3: { cycle: 60,  lerp: 0.05,  teleportInterval: 0   }, // 紅葉: 高速・広範囲
  4: { cycle: 80,  lerp: 0.04,  teleportInterval: 240 }, // 雷: 4秒ごとに雷鳴ワープ
  5: { cycle: 150, lerp: 0.025, teleportInterval: 360 }  // 星界: 荘厳・低速、6秒ごとに静かなワープ
};

// ─────────────────────────────────────────────────────────
// ボス出現カットインを開始: state='bossIntro' に遷移し、画面の弾をフェードアウトに切替。
// 180F (3秒) 経過 or スキップで spawnBoss() が呼ばれて通常のボス戦が開始される。
// ─────────────────────────────────────────────────────────
function startBossIntro() {
  state = 'bossIntro';
  // ステージ5 のラスボスは特別カットイン (240F)、それ以外は通常 (180F)
  bossIntroTimer = (selectedStage === 5) ? 240 : 180;
  enemyBullets.forEach(b => { b.fading = true; });
}

function spawnBoss() {
  bossActive = true;
  const dm = DIFF_HP[selectedDifficulty];
  // ラスボス (ステージ5) は 2 倍 HP
  const totalHp = Math.floor((selectedStage === 5 ? 1600 : 800) * dm);
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
    afterimages: [],  // { x, y, life, maxLife } の配列
    // ラスボス専用: フェーズ2 突入後に true、オーラ強化に使う
    phase2: false
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
  // ラスボスのフェーズ2 (カード 5 → 6) 突入時は専用カットインに置き換え
  if (selectedStage === 5 && boss.pattern === 5) {
    boss.phase2 = true;
    boss.moveLerp = 0.04; // 動きが少し激しくなる
    startPhase2Intro();
  } else {
    startSpellCutin();
  }
}

// ─────────────────────────────────────────────────────────
// フェーズ2 突入カットイン (ラスボス専用、state='phase2Intro')
// 150F 構成:
//   0-30  : 暗転 + ホワイトフラッシュ (一瞬白)
//  30-120 : 「Phase 2: Awakened」表示
// 120-150 : フェードアウト
// ─────────────────────────────────────────────────────────
function startPhase2Intro() {
  state = 'phase2Intro';
  phase2IntroTimer = 150;
  hitStopFrames = 0;
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
  // 耐久スペルではスペル開始演出中タイマーを止める (60 秒のうち 1.5 秒が削れるのを防ぐ)
  // 通常スペルでは既存挙動を維持 (常時 -1)
  const _curCard = boss.spellCards[boss.pattern];
  if (_curCard && _curCard.invulnerable) {
    if (boss.spellAnnounceTimer <= 0) boss.spellTimer--;
  } else {
    boss.spellTimer--;
  }

  // 耐久スペル: タイマー満了 = 撃破トリガー (ステージ5 ラスト想定)
  if (_curCard && _curCard.invulnerable && boss.spellTimer <= 0
      && boss.pattern >= boss.spellCards.length - 1) {
    if (selectedStage === 5) {
      // 撃破ボーナスはここで加算 (通常ルートと同じ加点)
      score += 100000;
      spawnScoreText(boss.x, boss.y, '+100000', '#ffcc44');
      saveHiScore(selectedDifficulty, score);
      saveGrazeRecord(selectedDifficulty, grazeCount);
      startFinalBossDeath();
    } else {
      // 汎用フォールバック: HP を 0 にして次フレームの bullet handler で撃破処理
      boss.hp = 0;
    }
    return;
  }

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
      // 旧位置を保持 (drawBoss で雷ジグザグ描画に使う)
      boss._warpFromX = oldX;
      boss._warpFromY = oldY;
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

// ジグザグ雷光: (x1,y1)→(x2,y2) の間を分割して左右にジッタを入れた折れ線で描画。
// 毎フレーム呼ぶと jitter が変わるので雷が暴れている感が出る。
function drawLightningZigzag(x1, y1, x2, y2, color, width, segments, jitter) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.shadowBlur = 14;
  ctx.shadowColor = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const px = x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter;
    const py = y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter;
    ctx.lineTo(px, py);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawBoss() {
  if (!boss) return;
  // ラスボス撃破演出中は drawFinalBossDeath が画像を担当するので drawBoss は描画しない。
  if (state === 'finalBossDeath') return;
  // ステージ別ワープ色 (RGB) — テレポート系視覚効果に共通で使う
  const warpRgb = selectedStage === 4 ? '255, 220, 120' : '170, 102, 255';
  const warpInnerRgb = selectedStage === 4 ? '255, 250, 220' : '220, 180, 255';
  // ── 残像 (ワープ直後) ──
  // 旧位置と新位置を結ぶ線上にボス画像の半透明コピーが残り、20F でフェード。
  if (boss.afterimages && boss.afterimages.length > 0) {
    boss.afterimages.forEach(a => {
      const alpha = (a.life / a.maxLife) * 0.45;
      ctx.save();
      ctx.globalAlpha = alpha;
      // ステージ4は青白い色合わせで残像が「電気的」に見えるよう加算合成
      if (selectedStage === 4) ctx.globalCompositeOperation = 'lighter';
      if (!drawImageCentered(`boss_stage${selectedStage}`, a.x, a.y, 88)) {
        ctx.fillStyle = selectedStage === 4 ? '#bbccff' : '#aa66ff';
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
    ctx.strokeStyle = `rgba(${warpRgb}, ${Math.min(1, alpha)})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgba(${warpRgb}, 0.85)`;
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
    ctx.fillStyle = `rgba(${warpInnerRgb}, ${0.6 * pulse + t * 0.4})`;
    ctx.beginPath();
    ctx.arc(boss.nextWarpX, boss.nextWarpY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // ── 収束光 (旧位置でボスを包む) ──
  // 残り 15F〜0F で現在位置の周りに光が集まる。
  if (boss.teleportInterval > 0 && boss.teleportTimer > 0 && boss.teleportTimer <= 15) {
    const t = (15 - boss.teleportTimer) / 15; // 0→1
    const auraR = 60 - 40 * t;                // 60 → 20 へ収縮
    const grad = ctx.createRadialGradient(boss.x, boss.y, 0, boss.x, boss.y, auraR);
    grad.addColorStop(0, `rgba(${warpRgb}, ${t * 0.7})`);
    grad.addColorStop(0.6, `rgba(${warpRgb}, ${t * 0.3})`);
    grad.addColorStop(1, `rgba(${warpRgb}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, auraR, 0, Math.PI * 2);
    ctx.fill();
  }
  // ── ステージ5 フェーズ2: 強烈な多色オーラ (脈動+回転)、最も外側のレイヤー ──
  if (selectedStage === 5 && boss.phase2) {
    const ph2Pulse = (Math.sin(frame * 0.08) + 1) / 2;
    const phR = boss.r * 4.5 + ph2Pulse * 18;
    const phGrad = ctx.createRadialGradient(boss.x, boss.y, boss.r * 1.2, boss.x, boss.y, phR);
    phGrad.addColorStop(0, 'rgba(255, 240, 255, 0.45)');
    phGrad.addColorStop(0.4, 'rgba(220, 180, 255, 0.22)');
    phGrad.addColorStop(0.75, 'rgba(255, 100, 220, 0.10)');
    phGrad.addColorStop(1, 'rgba(180, 80, 255, 0)');
    ctx.fillStyle = phGrad;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, phR, 0, Math.PI * 2);
    ctx.fill();
    // 回転する光の筋 (8方向)
    ctx.save();
    ctx.translate(boss.x, boss.y);
    ctx.rotate(frame * 0.03);
    ctx.strokeStyle = `rgba(255, 220, 255, ${0.35 + ph2Pulse * 0.25})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(boss.r * 1.3, 0);
      ctx.lineTo(boss.r * 1.3 + 36 + ph2Pulse * 12, 0);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  // 外側の柔らかい発光層 (ゆっくり脈動) — ステージ別に色切替
  const softR = boss.r * 2.6 + Math.sin(frame*0.05)*6;
  const softGrad = ctx.createRadialGradient(boss.x, boss.y, boss.r * 0.8, boss.x, boss.y, softR);
  if (selectedStage === 4) {
    softGrad.addColorStop(0, 'rgba(255, 240, 180, 0.30)');
    softGrad.addColorStop(0.6, 'rgba(255, 220, 120, 0.14)');
    softGrad.addColorStop(1, 'rgba(255, 220, 120, 0)');
  } else if (selectedStage === 5) {
    softGrad.addColorStop(0, 'rgba(220, 220, 255, 0.32)');
    softGrad.addColorStop(0.6, 'rgba(180, 180, 255, 0.14)');
    softGrad.addColorStop(1, 'rgba(180, 180, 255, 0)');
  } else {
    softGrad.addColorStop(0, 'rgba(255, 200, 230, 0.25)');
    softGrad.addColorStop(0.6, 'rgba(255, 150, 210, 0.12)');
    softGrad.addColorStop(1, 'rgba(255, 150, 210, 0)');
  }
  ctx.fillStyle = softGrad;
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, softR, 0, Math.PI*2);
  ctx.fill();
  // 内側オーラ — ステージ別
  const auraR = boss.r + 8 + Math.sin(frame*0.1)*4;
  const grad2 = ctx.createRadialGradient(boss.x, boss.y, boss.r, boss.x, boss.y, auraR);
  if (selectedStage === 4) {
    grad2.addColorStop(0, 'rgba(255, 230, 120, 0.65)');
    grad2.addColorStop(1, 'rgba(255, 230, 120, 0)');
  } else if (selectedStage === 5) {
    grad2.addColorStop(0, 'rgba(230, 220, 255, 0.65)');
    grad2.addColorStop(1, 'rgba(230, 220, 255, 0)');
  } else {
    grad2.addColorStop(0, 'rgba(255,100,200,0.6)');
    grad2.addColorStop(1, 'rgba(255,100,200,0)');
  }
  ctx.fillStyle = grad2;
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, auraR, 0, Math.PI*2);
  ctx.fill();
  // テレポート閃光リング (発動直後のみ、外側に広がる)
  if (boss.teleportFlash > 0) {
    const tt = boss.teleportFlash / 30; // 1→0
    const flashR = boss.r + 40 * (1 - tt);
    ctx.save();
    ctx.strokeStyle = `rgba(${warpRgb}, ${tt * 0.85})`;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 14;
    ctx.shadowColor = `rgba(${warpRgb}, 0.9)`;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, flashR, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }
  // ── ステージ4: 雷ジグザグ (旧→新位置を結ぶ稲妻) ──
  // 発動直後 5F だけ強いジグザグを描き、その後 5F は薄いものに切替。
  if (selectedStage === 4 && boss.teleportFlash > 20 &&
      typeof boss._warpFromX === 'number' && typeof boss._warpFromY === 'number') {
    const fromX = boss._warpFromX, fromY = boss._warpFromY;
    const dist = Math.hypot(boss.x - fromX, boss.y - fromY);
    const segs = Math.max(8, Math.floor(dist / 14));
    const jitter = 22;
    // 太い白い本体 + 細い金色のサイドストライク 2 本
    drawLightningZigzag(fromX, fromY, boss.x, boss.y, '#ffffff', 3.5, segs, jitter);
    drawLightningZigzag(fromX, fromY, boss.x, boss.y, '#ffeebb', 1.8, segs, jitter * 1.4);
    drawLightningZigzag(fromX, fromY, boss.x, boss.y, '#ffcc44', 1.2, segs, jitter * 1.8);
  }
  // ── ステージ4: 画面フラッシュ (テレポート直後 3F のみ) ──
  if (selectedStage === 4 && boss.teleportFlash > 27) {
    const fa = (boss.teleportFlash - 27) / 3 * 0.35;
    ctx.fillStyle = `rgba(255, 250, 220, ${fa})`;
    ctx.fillRect(PX, PY, PW, PH);
  }
  // ── ステージ4: 本体周りの電気スパーク (常時、3F毎に小さな雷) ──
  if (selectedStage === 4 && frame % 3 === 0) {
    for (let i = 0; i < 2; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r0 = boss.r + 4 + Math.random() * 6;
      const r1 = boss.r + 22 + Math.random() * 14;
      const x0 = boss.x + Math.cos(ang) * r0;
      const y0 = boss.y + Math.sin(ang) * r0;
      const x1 = boss.x + Math.cos(ang) * r1;
      const y1 = boss.y + Math.sin(ang) * r1;
      const c = Math.random() < 0.5 ? '#ffffff' : '#ffeebb';
      drawLightningZigzag(x0, y0, x1, y1, c, 1.2, 4, 6);
    }
  }
  // 本体: ステージ別画像、未ロード時はピンクの円+白輪郭にフォールバック
  if (!drawImageCentered(`boss_stage${selectedStage}`, boss.x, boss.y, 88)) {
    ctx.fillStyle = selectedStage === 4 ? '#ffcc44' : '#ff6699';
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
  // 撃破演出中は HP バーを隠す
  if (state === 'finalBossDeath') return;
  const w = PW - 40;
  const card = boss.spellCards[boss.pattern];
  // 耐久スペル中は HP バー (=0% で固定) を出さず、スペル名だけを赤金で表示
  const endurance = !!card.invulnerable;
  if (!endurance) {
    // 現スペルカードのHP範囲内での残量
    const cardHpRange = boss.patternHpStart - boss.patternHpMin;
    const cardHpRemain = Math.max(0, boss.hp - boss.patternHpMin);
    const ratio = cardHpRange > 0 ? cardHpRemain / cardHpRange : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(PX + 20, PY + 4, w, 6);
    ctx.fillStyle = card.color;
    ctx.fillRect(PX + 20, PY + 4, w * ratio, 6);
  } else {
    // 耐久スペル: HP バー領域は時間バーに転用 (full → empty で残り時間を示す)
    const tRatio = Math.max(0, boss.spellTimer) / boss.spellTimeLimit;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(PX + 20, PY + 4, w, 6);
    // 残時間に応じて色を変える (>30s 白、>10s 黄、それ以下 赤)
    const sec = Math.ceil(boss.spellTimer / 60);
    const barColor = sec > 30 ? '#ddccff' : (sec > 10 ? '#ffcc44' : '#ff4444');
    ctx.fillStyle = barColor;
    ctx.fillRect(PX + 20, PY + 4, w * tRatio, 6);
  }
  // 残スペル数の星
  for (let i = 0; i < boss.spellCards.length; i++) {
    const sx = PX + 20 + i * 14;
    ctx.fillStyle = i <= boss.pattern ? 'rgba(255,255,255,0.3)' : '#ffcc44';
    ctx.beginPath();
    ctx.arc(sx, PY + 16, 3, 0, Math.PI*2);
    ctx.fill();
  }
  // スペルカード名 (右上、耐久時は赤金強調)
  ctx.fillStyle = endurance ? '#ffcc44' : '#fff';
  ctx.font = 'bold 13px "Hiragino Mincho ProN", serif';
  ctx.textAlign = 'right';
  if (endurance) {
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff4422';
  }
  ctx.fillText(card.name, PX + PW - 8, PY + 18);
  ctx.shadowBlur = 0;
  // 残時間
  if (!endurance && boss.spellAnnounceTimer <= 0) {
    const sec = Math.ceil(boss.spellTimer / 60);
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = sec <= 10 ? '#ff4444' : '#ffcc44';
    ctx.textAlign = 'left';
    ctx.fillText(`${sec}`, PX + 20, PY + 26);
  }
}

// ─────────────────────────────────────────────────────────
// 耐久スペル時の大きなカウントダウン表示
// 上部中央に「ENDURANCE」ラベル + 大きな秒数 + 進捗ドット。
// 残り 30 秒で黄、10 秒以下で赤+脈動して可視性を最大化。
// ─────────────────────────────────────────────────────────
function drawEnduranceOverlay() {
  if (!boss) return;
  if (state === 'finalBossDeath' || state === 'phase2Intro') return;
  const card = boss.spellCards[boss.pattern];
  if (!card || !card.invulnerable) return;
  if (boss.spellAnnounceTimer > 0) return;

  const sec = Math.max(0, Math.ceil(boss.spellTimer / 60));
  const cx = PX + PW / 2;
  // パネルを上端寄り・小型化 (旧 78×360 → 42×220) してボスの視認性を確保。
  // boss は通常 PY+60〜PY+180 を漂うので、PY+30〜PY+72 に収めればほぼ重ならない。
  const top = PY + 30;
  const panelW = 220;
  const panelH = 42;
  const left = cx - panelW / 2;

  // 色階調 (>30s 白寄り、>10s 黄、<=10s 赤)
  let color, glow;
  if (sec > 30)      { color = '#ffffff'; glow = '#aaccff'; }
  else if (sec > 10) { color = '#ffcc44'; glow = '#ff8844'; }
  else               { color = '#ff5566'; glow = '#ff2244'; }
  // 残り 10 秒以下は脈動 (1秒周期)
  const pulse = sec <= 10 ? 1 + 0.14 * Math.sin(frame * 0.5) : 1;

  ctx.save();
  // 背景パネル (半透明黒)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(left, top, panelW, panelH);
  // 上下細枠
  ctx.strokeStyle = `rgba(${sec <= 10 ? '255, 80, 100' : '255, 220, 120'}, 0.7)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, top); ctx.lineTo(left + panelW, top);
  ctx.moveTo(left, top + panelH); ctx.lineTo(left + panelW, top + panelH);
  ctx.stroke();

  // 上段ラベル
  ctx.textAlign = 'center';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillStyle = 'rgba(255, 220, 160, 0.9)';
  ctx.shadowBlur = 5;
  ctx.shadowColor = '#ffaa44';
  ctx.fillText('— ENDURANCE / 耐久 —', cx, top + 12);

  // 秒数 (中央)
  ctx.font = `bold ${24 * pulse}px monospace`;
  ctx.fillStyle = color;
  ctx.shadowBlur = 12;
  ctx.shadowColor = glow;
  ctx.fillText(`${sec} s`, cx, top + 33);
  ctx.shadowBlur = 0;

  // 進捗バー (パネル下端、細め)
  const barW = panelW - 16;
  const barX = left + 8;
  const barY = top + panelH - 4;
  const tRatio = Math.max(0, boss.spellTimer) / boss.spellTimeLimit;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(barX, barY, barW, 2);
  ctx.fillStyle = color;
  ctx.fillRect(barX, barY, barW * tRatio, 2);

  ctx.restore();
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
  // ラスボスは専用の長尺カットインへ
  if (selectedStage === 5) { drawFinalBossIntro(); return; }
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
    // ステージ4 は雷の金色グロウ、それ以外は妖魔のピンク
    const glow = selectedStage === 4 ? '#ffcc44' : '#ff66cc';
    const nameFill = selectedStage === 4 ? '255, 245, 200' : '255, 220, 240';
    const subFill  = selectedStage === 4 ? '255, 230, 160' : '255, 200, 220';
    ctx.textAlign = 'left';
    ctx.font = 'bold 38px "Hiragino Mincho ProN", "Yu Mincho", serif';
    ctx.shadowBlur = 18;
    ctx.shadowColor = glow;
    ctx.fillStyle = `rgba(${nameFill}, ${fadeT})`;
    ctx.fillText(naming.ja, nameX, nameY);
    ctx.font = 'bold 14px sans-serif';
    ctx.shadowBlur = 8;
    ctx.fillStyle = `rgba(${subFill}, ${fadeT * 0.85})`;
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

// ─────────────────────────────────────────────────────────
// ラスボス出現カットイン (state='bossIntro' && selectedStage === 5、240F)
// 構成:
//   0-30   : 完全暗転
//   0-90   : 中央から白い光が放射状に広がる粒子 (3F毎にスポーン)
//   30-150 : ボス画像フェードイン + ゆっくり拡大 (80→240px)
//   60-210 : ボス名 (左から) + 英名 (右から) スライドイン
//   90-220 : "!! THE FINAL BOSS !!" 赤金色で点滅
//  220-240 : ホールド (フェードは短め)
// ─────────────────────────────────────────────────────────
function drawFinalBossIntro() {
  const TOTAL = 240;
  const t = TOTAL - bossIntroTimer;
  const naming = BOSS_NAMES[5];

  ctx.save();
  ctx.beginPath();
  ctx.rect(PX, PY, PW, PH);
  ctx.clip();

  // 1. 完全暗転 (0-30 でフェードイン、その後ホールド、220-240 でほんの少しフェード)
  let bgAlpha;
  if (t < 30) bgAlpha = (t / 30);
  else if (t < 220) bgAlpha = 1;
  else bgAlpha = (TOTAL - t) / 20;
  ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
  ctx.fillRect(PX, PY, PW, PH);

  // 2. 中央から放射状の白い粒子 (3F毎、t<90 の間)
  if (t > 0 && t < 90 && t % 3 === 0) {
    const cx = PX + PW / 2, cy = PY + PH * 0.5;
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 4 + Math.random() * 4;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 50,
        color: i % 2 === 0 ? '#ffffff' : '#ddccff'
      });
    }
  }

  // 3. ボス画像 (30-150 でフェードイン+拡大、150 以降はホールド、220+ で軽くフェード)
  if (t >= 30) {
    let scaleT, alpha;
    if (t < 150) {
      const raw = (t - 30) / 120;
      scaleT = raw;                     // 線形拡大
      alpha = Math.min(1, raw * 1.2);   // フェード少し早め
    } else if (t < 220) {
      scaleT = 1;
      alpha = 1;
    } else {
      scaleT = 1;
      alpha = (TOTAL - t) / 20;
    }
    const size = 80 + (240 - 80) * scaleT;
    const bossX = PX + PW / 2;
    const bossY = PY + PH * 0.5;
    ctx.globalAlpha = alpha;
    if (!drawImageCentered('boss_stage5', bossX, bossY, size)) {
      ctx.fillStyle = '#ddccff';
      ctx.beginPath();
      ctx.arc(bossX, bossY, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // 4. ボス名 (左から) + 英名 (右から) スライドイン
  if (t >= 60 && t < 220) {
    const fadeT = Math.min(1, (t - 60) / 30);
    // 和名: 上部、左からスライド
    const slideOffJa = -120 * (1 - fadeT);
    ctx.textAlign = 'center';
    ctx.font = 'bold 56px "Hiragino Mincho ProN", "Yu Mincho", serif';
    ctx.shadowBlur = 22;
    ctx.shadowColor = '#aabbff';
    ctx.fillStyle = `rgba(245, 240, 255, ${fadeT})`;
    ctx.fillText(naming.ja, PX + PW / 2 + slideOffJa, PY + 110);
    // 英名: 下部、右からスライド
    const slideOffEn = 120 * (1 - fadeT);
    ctx.font = 'bold 18px sans-serif';
    ctx.shadowBlur = 10;
    ctx.fillStyle = `rgba(220, 220, 255, ${fadeT * 0.9})`;
    ctx.fillText(`— ${naming.en} —`, PX + PW / 2 + slideOffEn, PY + 138);
    ctx.shadowBlur = 0;
  }

  // 5. "!! THE FINAL BOSS !!" 赤金色で点滅
  if (t >= 90 && t < 220) {
    const blink = Math.floor(t / 8) % 2 === 0;
    const bannerY = PY + PH - 90;
    ctx.fillStyle = `rgba(180, 30, 50, ${blink ? 0.55 : 0.35})`;
    ctx.fillRect(PX, bannerY - 26, PW, 52);
    ctx.strokeStyle = `rgba(255, 200, 80, ${blink ? 0.95 : 0.7})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PX, bannerY - 26); ctx.lineTo(PX + PW, bannerY - 26);
    ctx.moveTo(PX, bannerY + 26); ctx.lineTo(PX + PW, bannerY + 26);
    ctx.stroke();
    ctx.fillStyle = blink ? '#fff8d8' : '#ffcc44';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#ff4422';
    ctx.fillText('!! THE FINAL BOSS !!', PX + PW / 2, bannerY + 8);
    ctx.shadowBlur = 0;
  }

  // 6. スキップヒント
  if (t >= 60 && t < 230) {
    ctx.textAlign = 'center';
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('(Z でスキップ)', PX + PW/2, PY + PH - 14);
  }

  ctx.restore();
}

// ─────────────────────────────────────────────────────────
// フェーズ2 突入カットイン描画 (state='phase2Intro')
// ─────────────────────────────────────────────────────────
function drawPhase2Intro() {
  if (state !== 'phase2Intro' || !boss) return;
  const TOTAL = 150;
  const t = TOTAL - phase2IntroTimer;

  ctx.save();
  ctx.beginPath();
  ctx.rect(PX, PY, PW, PH);
  ctx.clip();

  // 1. 短い真白フラッシュ (0-30) → 暗転キープ (30-120) → フェード (120-150)
  if (t < 30) {
    const fa = (30 - t) / 30;        // 1→0
    ctx.fillStyle = `rgba(255, 255, 255, ${fa * 0.85})`;
    ctx.fillRect(PX, PY, PW, PH);
  }
  let darkA;
  if (t < 30) darkA = t / 30 * 0.55;
  else if (t < 120) darkA = 0.55;
  else darkA = 0.55 * (TOTAL - t) / 30;
  ctx.fillStyle = `rgba(20, 0, 30, ${darkA})`;
  ctx.fillRect(PX, PY, PW, PH);

  // 2. "Phase 2: Awakened" 表示 (30-120)
  if (t >= 25 && t < 130) {
    const fadeT = Math.min(1, (t - 25) / 18);
    const outT = t > 110 ? Math.max(0, (130 - t) / 20) : 1;
    const alpha = fadeT * outT;
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = `rgba(255, 220, 255, ${alpha * 0.9})`;
    ctx.fillText('— Phase 2 —', PX + PW / 2, PY + PH / 2 - 30);
    ctx.font = 'bold 48px "Hiragino Mincho ProN", serif';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ff44ff';
    ctx.fillStyle = `rgba(255, 245, 255, ${alpha})`;
    ctx.fillText('Awakened', PX + PW / 2, PY + PH / 2 + 18);
    ctx.shadowBlur = 0;
    // サブ
    ctx.font = 'bold 14px "Hiragino Mincho ProN", serif';
    ctx.fillStyle = `rgba(220, 200, 255, ${alpha * 0.85})`;
    ctx.fillText('星詠、覚醒', PX + PW / 2, PY + PH / 2 + 44);
  }

  // 3. スキップヒント
  if (t >= 30 && t < 140) {
    ctx.textAlign = 'center';
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('(Z でスキップ)', PX + PW / 2, PY + PH - 14);
  }

  ctx.restore();
}

// ─────────────────────────────────────────────────────────
// ラスボス撃破: 専用の死亡演出 → allClear へ。
// state='finalBossDeath' に遷移し、180F の演出後に allClear へ。
// 演出中は boss.x/y を保持して画像を残し、徐々にフェードアウトさせる。
// ─────────────────────────────────────────────────────────
function startFinalBossDeath() {
  state = 'finalBossDeath';
  finalBossDeathTimer = 180;
  hitStopFrames = 60; // 1秒の完全停止
  bombFlash = 90;     // ボムフラッシュより強く長い白フラッシュ
  // 多色パーティクル爆散 (200個)
  const colors = ['#ffffff', '#ddccff', '#ff44ff', '#aabbee', '#ffcc44', '#88ffff'];
  for (let i = 0; i < 200; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1 + Math.random() * 6;
    particles.push({
      x: boss.x, y: boss.y,
      vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 90 + Math.random() * 60,
      color: colors[i % colors.length]
    });
  }
  // 残しておく: drawFinalBossDeath で boss 画像をフェードアウト描画したい
  bossActive = false;
  stageCleared = true;
}

function drawFinalBossDeath() {
  if (state !== 'finalBossDeath') return;
  const TOTAL = 180;
  const t = TOTAL - finalBossDeathTimer;

  ctx.save();
  ctx.beginPath();
  ctx.rect(PX, PY, PW, PH);
  ctx.clip();

  // 強い白フラッシュ (0-60 で 1→0、60-180 はホールドで薄い暗転)
  if (t < 60) {
    const fa = (60 - t) / 60;
    ctx.fillStyle = `rgba(255, 255, 255, ${fa * 0.85})`;
    ctx.fillRect(PX, PY, PW, PH);
  }
  if (t >= 30) {
    const dimT = Math.min(1, (t - 30) / 60);
    ctx.fillStyle = `rgba(0, 0, 0, ${dimT * 0.55})`;
    ctx.fillRect(PX, PY, PW, PH);
  }

  // ボス画像を残しつつフェードアウト + 拡大
  if (boss) {
    const fade = Math.max(0, 1 - t / 120);
    const scale = 1 + t / 360;
    ctx.globalAlpha = fade;
    if (!drawImageCentered('boss_stage5', boss.x, boss.y, 88 * scale)) {
      ctx.fillStyle = '#ddccff';
      ctx.beginPath();
      ctx.arc(boss.x, boss.y, boss.r * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // 中央テロップ "勝利" + サブ "宇宙の終焉"
  if (t >= 90 && t < TOTAL) {
    const fadeT = Math.min(1, (t - 90) / 30);
    const outT = t > 160 ? Math.max(0, (TOTAL - t) / 20) : 1;
    const alpha = fadeT * outT;
    ctx.textAlign = 'center';
    ctx.font = 'bold 56px "Hiragino Mincho ProN", serif';
    ctx.shadowBlur = 22;
    ctx.shadowColor = '#ffcc44';
    ctx.fillStyle = `rgba(255, 245, 200, ${alpha})`;
    ctx.fillText('勝利', PX + PW / 2, PY + PH / 2 - 10);
    ctx.font = 'bold 18px "Hiragino Mincho ProN", serif';
    ctx.shadowBlur = 12;
    ctx.fillStyle = `rgba(255, 230, 200, ${alpha * 0.9})`;
    ctx.fillText('— Cosmos Conquered —', PX + PW / 2, PY + PH / 2 + 26);
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}
