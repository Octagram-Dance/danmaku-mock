// 共通ユーティリティ

const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));

function drawStar(cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI/2 + i * Math.PI / 5;
    const rad = i % 2 === 0 ? r : r/2;
    const px = cx + Math.cos(a) * rad;
    const py = cy - Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}
