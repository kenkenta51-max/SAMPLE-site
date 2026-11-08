import * as THREE from 'three';

// ローポリ感を出すため flatShading の共通マテリアルをキャッシュして使い回す
const cache = new Map();
export function mat(color, extra = {}) {
  const key = color + JSON.stringify(extra);
  if (!cache.has(key)) {
    cache.set(key, new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.78, metalness: 0, ...extra }));
  }
  return cache.get(key);
}

export const PALETTE = {
  yellow: '#FFDF5E',
  gray: '#A6A6A6',
  terracotta: '#C8643A',
  cream: '#EFEBE3',
  brown: '#5A2A0F',
  wood: '#C98B55',
  woodLight: '#E2B88A',
  wall: '#FFF1D6',
  white: '#FFFFFF',
};

// 文字や模様は CanvasTexture で描いて3Dに貼る（画像ファイルは使わない）
export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function drawLogo(ctx, w, h, { badge = true } = {}) {
  ctx.clearRect(0, 0, w, h);
  const s = h / 300;
  if (badge) {
    ctx.fillStyle = '#FFFDF7';
    roundRect(ctx, 6 * s, 6 * s, w - 12 * s, h - 12 * s, 40 * s);
    ctx.fill();
    ctx.lineWidth = 10 * s;
    ctx.strokeStyle = '#C8643A';
    roundRect(ctx, 22 * s, 22 * s, w - 44 * s, h - 44 * s, 28 * s);
    ctx.stroke();
  }
  const cx = w / 2;
  // 朝日のマーク
  ctx.fillStyle = '#FFDF5E';
  ctx.beginPath();
  ctx.arc(cx, 98 * s, 40 * s, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#FFC93C';
  ctx.lineWidth = 7 * s;
  ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i + 0.5) * (Math.PI / 7);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 52 * s, 98 * s + Math.sin(a) * 52 * s);
    ctx.lineTo(cx + Math.cos(a) * 66 * s, 98 * s + Math.sin(a) * 66 * s);
    ctx.stroke();
  }
  ctx.fillStyle = '#A6A6A6';
  ctx.fillRect(cx - 70 * s, 100 * s, 140 * s, 6 * s);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#C8643A';
  ctx.font = `800 ${92 * s}px "Playfair Display", serif`;
  ctx.fillText('HIDAMARI', cx, 196 * s);
  ctx.fillStyle = '#7A7A7A';
  ctx.font = `700 ${30 * s}px "Zen Maru Gothic", sans-serif`;
  ctx.fillText('ひだまりベーカリー', cx, 250 * s);
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
