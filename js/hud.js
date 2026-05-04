// HUD・タイトル・メニュー・ポーズ・ゲームオーバー画面・スマホUI

function drawTitle() {
  ctx.fillStyle = 'rgba(255, 200, 220, 0.3)';
  for (let i = 0; i < 40; i++) {
    const x = (i * 173 + frame * 0.5) % W;
    const y = (i * 91 + frame * (1 + i % 3 * 0.3)) % H;
    ctx.fillRect(x, y, 3, 3);
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffccdd';
  ctx.font = 'bold 72px "Hiragino Mincho ProN", "Yu Mincho", serif';
  ctx.shadowColor = '#ff6699';
  ctx.shadowBlur = 20;
  ctx.fillText('幻想弾幕遊', W/2, 200);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '18px serif';
  ctx.fillText('～ Gensou Danmaku Yuu ～', W/2, 240);

  const opts = ['はじめから遊ぶ', 'ステージ選択', 'ボスから遊ぶ'];
  ctx.font = '32px "Hiragino Mincho ProN", serif';
  opts.forEach((label, i) => {
    const y = 360 + i * 60;
    if (i === menuIndex) {
      ctx.fillStyle = '#ffaa00';
      ctx.fillText('▶ ' + label + ' ◀', W/2, y);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(label, W/2, y);
    }
  });

  // ハイスコア表示
  const scores = loadHiScores();
  ctx.fillStyle = 'rgba(255, 220, 180, 0.7)';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('— HIGH SCORE —', W/2, H - 130);
  ctx.font = 'bold 14px monospace';
  const diffColors = { Easy: '#88ff88', Normal: '#ffcc44', Hard: '#ff4488' };
  ['Easy', 'Normal', 'Hard'].forEach((d, i) => {
    const sx = W/2 - 200 + i * 200;
    ctx.fillStyle = diffColors[d];
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(d, sx, H - 105);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText((scores[d] || 0).toString().padStart(8, '0'), sx, H - 85);
  });

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '12px sans-serif';
  ctx.fillText('PC: 矢印キー / Z 決定 / Shift 低速 / X ボム / P ポーズ', W/2, H - 60);
  ctx.fillText('Touch: ドラッグで移動 / 2本指で低速 / 右下B = ボム / 右上 II = ポーズ', W/2, H - 42);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = 'rgba(255,200,220,0.6)';
  ctx.fillText('↑↓で選択 / Z または Enter で決定', W/2, H - 18);
}

function drawStageSelect() {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffccdd';
  ctx.font = 'bold 48px "Hiragino Mincho ProN", serif';
  ctx.fillText(bossOnlyMode ? 'ボス選択' : 'ステージ選択', W/2, 180);
  ctx.font = '28px serif';
  for (let i = 0; i < 3; i++) {
    const y = 280 + i * 70;
    const label = bossOnlyMode ? `ステージ ${i+1} ボス` : `ステージ ${i+1}`;
    if (i === menuIndex) {
      ctx.fillStyle = '#ffaa00';
      ctx.fillText('▶ ' + label + ' ◀', W/2, y);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(label, W/2, y);
    }
  }
}

function drawDifficulty() {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffccdd';
  ctx.font = 'bold 48px "Hiragino Mincho ProN", serif';
  ctx.fillText('難易度選択', W/2, 180);
  ctx.font = '32px serif';
  const colors = ['#88ff88', '#ffcc44', '#ff4488'];
  for (let i = 0; i < 3; i++) {
    const y = 280 + i * 70;
    if (i === menuIndex) {
      ctx.fillStyle = '#ffaa00';
      ctx.fillText('▶ ' + DIFFS[i] + ' ◀', W/2, y);
    } else {
      ctx.fillStyle = colors[i];
      ctx.globalAlpha = 0.7;
      ctx.fillText(DIFFS[i], W/2, y);
      ctx.globalAlpha = 1;
    }
  }
}

function drawSlowModeLabel() {
  // 低速モード表示
  if (isSlowMode() && state === 'play') {
    ctx.fillStyle = 'rgba(255, 200, 100, 0.8)';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('◆ 低速モード', PX + 8, PY + PH - 8);
  }
}

function drawMobileBombButton() {
  // スマホ用ボムボタン (画面右下)
  if (state === 'play') {
    const bx = PX + PW - 50, by = PY + PH - 50;
    ctx.fillStyle = bombs > 0 ? 'rgba(100, 180, 255, 0.5)' : 'rgba(80, 80, 80, 0.4)';
    ctx.beginPath();
    ctx.arc(bx, by, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = bombs > 0 ? '#aaddff' : '#666';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('B', bx, by - 2);
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`×${bombs}`, bx, by + 14);
  }
}

function drawMobilePauseButton() {
  // スマホ用ポーズボタン (画面右上)
  if (state === 'play') {
    const px = PX + PW - 30, py = PY + 30;
    ctx.fillStyle = 'rgba(180, 180, 220, 0.4)';
    ctx.beginPath();
    ctx.arc(px, py, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // ||アイコン
    ctx.fillStyle = '#fff';
    ctx.fillRect(px - 5, py - 6, 3, 12);
    ctx.fillRect(px + 2, py - 6, 3, 12);
  }
}

function drawHUD() {
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(60, 20, 40, 0.6)';
  ctx.fillRect(HX, HY, HW, HH);
  ctx.strokeStyle = '#aa66aa';
  ctx.lineWidth = 1;
  ctx.strokeRect(HX, HY, HW, HH);

  let y = HY + 30;
  const x = HX + 20;

  ctx.fillStyle = '#ffccdd';
  ctx.font = 'bold 18px "Hiragino Mincho ProN", serif';
  ctx.fillText('幻想弾幕遊', x, y);
  y += 24;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Stage ${selectedStage} - ${selectedDifficulty}`, x, y);
  y += 30;

  ctx.fillStyle = '#aaffff';
  ctx.font = '14px sans-serif';
  ctx.fillText('HiScore', x, y);
  ctx.fillStyle = '#ffcc99';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(getHiScore(selectedDifficulty).toString().padStart(8, '0'), x + 70, y + 2);
  y += 24;

  ctx.fillStyle = '#aaffff';
  ctx.font = '14px sans-serif';
  ctx.fillText('Score', x, y);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(score.toString().padStart(8, '0'), x + 70, y + 2);
  y += 26;

  // Graze (累計グレイズ数、緑、6桁ゼロパディング)
  ctx.fillStyle = '#aaffff';
  ctx.font = '14px sans-serif';
  ctx.fillText('Graze', x, y);
  ctx.fillStyle = '#88ff88';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(grazeCount.toString().padStart(6, '0'), x + 70, y + 2);
  y += 26;

  ctx.fillStyle = '#aaffff';
  ctx.font = '14px sans-serif';
  ctx.fillText('Player', x, y);
  for (let i = 0; i < life; i++) drawStar(x + 70 + i * 18, y - 4, 6, '#ff4488');
  y += 26;

  ctx.fillStyle = '#aaffff';
  ctx.fillText('Bomb', x, y);
  for (let i = 0; i < bombs; i++) {
    // 雪の結晶っぽいアイコン
    ctx.save();
    ctx.translate(x + 70 + i * 18, y - 4);
    ctx.strokeStyle = '#88ccff';
    ctx.lineWidth = 1.5;
    for (let j = 0; j < 6; j++) {
      ctx.save();
      ctx.rotate(j * Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -6);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#aaddff';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
  y += 28;

  ctx.fillStyle = '#aaffff';
  ctx.fillText('Power', x, y);
  const r = powerRank();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px monospace';
  if (r >= 3) ctx.fillText('MAX', x + 70, y + 2);
  else ctx.fillText(`${power}/9`, x + 70, y + 2);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(x, y + 8, 220, 6);
  ctx.fillStyle = '#ff66cc';
  ctx.fillRect(x, y + 8, 220 * (power / 9), 6);
  y += 28;

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '12px sans-serif';
  const rankLabels = ['弾2列', '弾3列', '弾3列+斜め', '弾3列+斜め+ホーミング'];
  ctx.fillText('装備: ' + rankLabels[r], x, y);
  y += 24;

  ctx.fillStyle = '#aaffff';
  ctx.font = '14px sans-serif';
  ctx.fillText('1UP', x, y);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`${lifeItemCount}/5`, x + 70, y + 2);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(x, y + 8, 220, 6);
  ctx.fillStyle = '#44ff44';
  ctx.fillRect(x, y + 8, 220 * (lifeItemCount / 5), 6);
  y += 28;

  y += 12;
  ctx.fillStyle = '#aaffff';
  ctx.font = '14px sans-serif';
  ctx.fillText('Stage', x, y);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px monospace';
  const progress = stageEnemiesKilled + stageEnemiesPassed;
  ctx.fillText(`${progress}/${stageEnemyTotal}`, x + 70, y + 2);
  y += 20;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '11px sans-serif';
  ctx.fillText(`撃破 ${stageEnemiesKilled} / 取り逃し ${stageEnemiesPassed}`, x, y);
  y += 18;
  if (bossActive) {
    ctx.fillStyle = '#ff66cc';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('!! BOSS BATTLE !!', x, y);
  }

  // 操作説明 (HUD下部)
  const ctrlY = HY + HH - 200;
  ctx.fillStyle = 'rgba(255, 220, 180, 0.5)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('— CONTROLS —', x, ctrlY);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '10px sans-serif';
  const controls = [
    '↑↓←→ : 移動',
    'Shift  : 低速 (判定表示)',
    'X      : ボム発動',
    'P / Esc: ポーズ',
    '',
    'Touch  : ドラッグで移動',
    '2本指  : 低速モード',
    'B ボタン: ボム発動',
    'II ボタン: ポーズ'
  ];
  controls.forEach((line, i) => {
    ctx.fillText(line, x, ctrlY + 16 + i * 13);
  });

  ctx.save();
  ctx.translate(HX + HW/2, HY + HH - 50);
  ctx.fillStyle = 'rgba(255,200,220,0.25)';
  ctx.font = 'bold 22px "Hiragino Mincho ProN", serif';
  ctx.textAlign = 'center';
  ctx.fillText('幻想弾幕遊', 0, 0);
  ctx.font = '11px serif';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText('Gensou Danmaku Yuu', 0, 18);
  ctx.restore();
}

function drawStateOverlays() {
  if (state === 'gameOver') {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(PX, PY, PW, PH);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4488';
    ctx.font = 'bold 56px "Hiragino Mincho ProN", serif';
    ctx.fillText('GAME OVER', PX + PW/2, PY + PH/2 - 30);
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText(`SCORE: ${score}`, PX + PW/2, PY + PH/2 + 10);
    // ハイスコア更新表示
    const hi = getHiScore(selectedDifficulty);
    if (score >= hi && score > 0) {
      ctx.fillStyle = '#ffcc44';
      ctx.font = 'bold 22px "Hiragino Mincho ProN", serif';
      ctx.fillText('★ NEW RECORD! ★', PX + PW/2, PY + PH/2 + 40);
    } else {
      ctx.fillStyle = 'rgba(255, 220, 180, 0.7)';
      ctx.font = '14px sans-serif';
      ctx.fillText(`HiScore: ${hi}`, PX + PW/2, PY + PH/2 + 40);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '16px sans-serif';
    ctx.fillText('Z または Enter でタイトルへ', PX + PW/2, PY + PH/2 + 70);
  } else if (state === 'clear') {
    drawClearSummary();
  } else if (state === 'allClear') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(PX, PY, PW, PH);
    ctx.textAlign = 'center';
    // 桜の花びら背景
    ctx.fillStyle = 'rgba(255, 200, 220, 0.5)';
    for (let i = 0; i < 30; i++) {
      const x = PX + (i * 173 + frame * 0.5) % PW;
      const y = PY + (i * 91 + frame * (1 + i % 3 * 0.3)) % PH;
      ctx.fillRect(x, y, 3, 3);
    }
    ctx.fillStyle = '#ffccdd';
    ctx.font = 'bold 48px "Hiragino Mincho ProN", serif';
    ctx.shadowColor = '#ff6699';
    ctx.shadowBlur = 16;
    ctx.fillText('ALL CLEAR!', PX + PW/2, PY + PH/2 - 50);
    ctx.font = 'bold 28px "Hiragino Mincho ProN", serif';
    ctx.fillText('〜 全ステージ制覇 〜', PX + PW/2, PY + PH/2 - 10);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText(`FINAL SCORE: ${score.toLocaleString()}`, PX + PW/2, PY + PH/2 + 30);
    // 追加: 累計グレイズ
    ctx.fillStyle = '#88ff88';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`Total Graze: ${grazeCount.toLocaleString()}`, PX + PW/2, PY + PH/2 + 56);
    // NEW RECORD表示
    const hiAll = getHiScore(selectedDifficulty);
    if (score >= hiAll && score > 0) {
      ctx.fillStyle = '#ffcc44';
      ctx.font = 'bold 22px "Hiragino Mincho ProN", serif';
      ctx.fillText('★ NEW RECORD! ★', PX + PW/2, PY + PH/2 + 86);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '16px sans-serif';
    ctx.fillText('Z または Enter でタイトルへ', PX + PW/2, PY + PH/2 + 116);
  } else if (state === 'paused') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(PX, PY, PW, PH);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffccdd';
    ctx.font = 'bold 48px "Hiragino Mincho ProN", serif';
    ctx.fillText('PAUSE', PX + PW/2, PY + PH/2 - 60);

    const pauseOpts = ['ゲームに戻る', 'タイトルに戻る'];
    ctx.font = '24px "Hiragino Mincho ProN", serif';
    pauseOpts.forEach((label, i) => {
      const yy = PY + PH/2 + i * 50;
      if (i === pauseMenuIndex) {
        ctx.fillStyle = '#ffaa00';
        ctx.fillText('▶ ' + label + ' ◀', PX + PW/2, yy);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(label, PX + PW/2, yy);
      }
    });

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px sans-serif';
    ctx.fillText('↑↓で選択 / Z で決定 / P または Esc で再開', PX + PW/2, PY + PH - 40);
  } else if (state === 'transition') {
    // ステージ遷移: 黒フェードイン → タイトルテロップ → フェードアウト
    // transitionTimer は 150 → 0 に減少
    //   150-120 (30f): bg fade in 0→1
    //   120- 30 (90f): hold black + title
    //    30-  0 (30f): bg fade out 1→0
    let bgAlpha;
    if (transitionTimer > 120) {
      bgAlpha = (150 - transitionTimer) / 30;
    } else if (transitionTimer > 30) {
      bgAlpha = 1;
    } else {
      bgAlpha = transitionTimer / 30;
    }
    ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
    ctx.fillRect(PX, PY, PW, PH);

    // タイトルテロップは bgAlpha が高いほど見える
    const textAlpha = bgAlpha;
    if (textAlpha > 0.05) {
      const stageSubtitles = ['', '', '雪山に至る', '紅葉の地へ'];
      const subtitle = stageSubtitles[selectedStage] || '';
      // テロップは中央付近を少し上から下へゆっくり流す (進行に応じて下降)
      const slideY = PY + PH/2 - 30 + (1 - bgAlpha) * 20;

      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff66cc';
      ctx.shadowBlur = 18;
      ctx.fillStyle = `rgba(255, 220, 230, ${textAlpha})`;
      ctx.font = 'bold 56px "Hiragino Mincho ProN", "Yu Mincho", serif';
      ctx.fillText(`STAGE ${selectedStage}`, PX + PW/2, slideY);

      ctx.shadowBlur = 12;
      ctx.fillStyle = `rgba(255, 200, 220, ${textAlpha * 0.9})`;
      ctx.font = 'bold 30px "Hiragino Mincho ProN", "Yu Mincho", serif';
      ctx.fillText(subtitle, PX + PW/2, slideY + 50);
      ctx.shadowBlur = 0;
    }
  } else if (state === 'bossIntro') {
    // ボス出現カットイン本体は boss.js の drawBossIntro が描画
    drawBossIntro();
  }
}

// ─────────────────────────────────────────────────────────
// ステージクリア集計画面
// summaryTimer: 'clear' 突入で 0 リセット、毎フレーム +1
//   0-180  (3s)    : 既存の STAGE CLEAR! 表示
// 180-210 (0.5s)   : 黒オーバーレイへフェード
// 210-570 (6s)     : 6項目を 60F 間隔でフェードイン+ロールアップ
// 570-630 (1s)     : Total Stage Score (金) ロールアップ
// 630+             : Z 押下プロンプト点滅
// ─────────────────────────────────────────────────────────
function drawClearSummary() {
  const t = summaryTimer || 0;

  // Phase A: 0-180F = 既存の STAGE CLEAR! 表示 (シンプル版)
  if (t < 180) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(PX, PY, PW, PH);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcc44';
    ctx.font = 'bold 56px "Hiragino Mincho ProN", serif';
    ctx.shadowColor = '#ff6699';
    ctx.shadowBlur = 12;
    ctx.fillText('STAGE CLEAR!', PX + PW/2, PY + PH/2 - 30);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText(`SCORE: ${score.toLocaleString()}`, PX + PW/2, PY + PH/2 + 10);
    return;
  }

  // Phase B+: 集計画面
  const phaseT = t - 180;

  // 背景フェード (0-30F)
  const bgFade = Math.min(1, phaseT / 30);
  ctx.fillStyle = `rgba(0, 0, 0, ${0.85 * bgFade})`;
  ctx.fillRect(PX, PY, PW, PH);

  // タイトル
  ctx.textAlign = 'center';
  ctx.fillStyle = `rgba(255, 204, 68, ${bgFade})`;
  ctx.font = 'bold 36px "Hiragino Mincho ProN", serif';
  ctx.shadowBlur = 12;
  ctx.shadowColor = '#ff6699';
  ctx.fillText(`STAGE ${selectedStage} CLEAR!`, PX + PW/2, PY + 70);
  ctx.shadowBlur = 0;

  // 6項目: ラベルと値
  const items = [
    { label: 'Stage Score',    value: score - stageStartScore },
    { label: 'Enemy Defeated', value: stageEnemiesKilled, max: stageEnemyTotal },
    { label: 'Boss Bonus',     value: 50000 },
    { label: 'Graze',          value: (grazeCount - stageStartGraze) * 50 },
    { label: 'Bombs Used',     value: bombsUsed },
    { label: 'Power Items',    value: powerItemsCollected },
  ];

  // 各項目: itemStart (= 30 + i*60) で出現開始、30F でロールアップ完了
  items.forEach((item, i) => {
    const itemStart = 30 + i * 60;
    if (phaseT < itemStart) return;
    const rollT = Math.min(1, (phaseT - itemStart) / 30);
    const rowAlpha = Math.min(1, (phaseT - itemStart) / 15);
    const y = PY + 130 + i * 38;
    const labelX = PX + 70;
    const valueX = PX + PW - 70;

    ctx.globalAlpha = rowAlpha;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#aaffff';
    ctx.font = 'bold 16px "Hiragino Mincho ProN", serif';
    ctx.fillText(item.label, labelX, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffcc44';
    ctx.font = 'bold 20px monospace';
    let displayValue;
    if (item.max !== undefined) {
      const cur = Math.floor(item.value * rollT);
      displayValue = `${cur} / ${item.max}`;
    } else {
      displayValue = Math.floor(item.value * rollT).toLocaleString();
    }
    ctx.fillText(displayValue, valueX, y);
    ctx.globalAlpha = 1;
  });

  // Total Stage Score (全項目完了後の 30F)
  const totalStart = 30 + items.length * 60; // 30 + 360 = 390
  if (phaseT >= totalStart) {
    const totalRollT = Math.min(1, (phaseT - totalStart) / 60);
    const totalY = PY + 130 + items.length * 38 + 40;
    const totalValue = Math.floor((score - stageStartScore) * totalRollT);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcc44';
    ctx.font = 'bold 24px "Hiragino Mincho ProN", serif';
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#ffcc44';
    ctx.fillText(`Total Stage Score: ${totalValue.toLocaleString()}`, PX + PW/2, totalY);
    ctx.shadowBlur = 0;

    // Z 押下プロンプト (合計表示完了後、点滅)
    if (totalRollT >= 1) {
      const blinkOn = Math.floor((phaseT - totalStart - 60) / 30) % 2 === 0;
      if (blinkOn) {
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.font = '14px sans-serif';
        const promptText = (selectedStage < 3 && !bossOnlyMode)
          ? 'Z または Enter で次のステージへ'
          : 'Z または Enter で進む';
        ctx.fillText(promptText, PX + PW/2, totalY + 44);
      }
    }
  }
}
