import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SHOPS, FLOORS, FACILITIES, CATEGORY, STATS } from './data.js';

// ------------------------------------------------------------------
// 基本設定
// ------------------------------------------------------------------
const params = new URLSearchParams(location.search);
const CAPTURE = params.has('capture');          // 1コマずつ書き出す録画モード
const DEMO = params.has('demo') || CAPTURE;     // 自動デモ
const FH = 6;                                   // 階高
const HALF_X = 60, HALF_Z = 30;                 // 建物の外形 120 x 60
const COR = 7;                                  // 通路の半幅
const VOID = { x0: -32, x1: 32, z0: -3.5, z1: 3.5 }; // 吹き抜け

const $ = (id) => document.getElementById(id);
const canvas = $('scene');
const isPhone = () => innerWidth < 760;

let seed = 7;
const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: CAPTURE });
renderer.setPixelRatio(Math.min(devicePixelRatio, CAPTURE ? 1 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0b1020, 0.0042);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.5, 2000);
camera.position.set(95, 62, -120);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 8;
controls.maxDistance = 320;
controls.target.set(0, 8, 0);
controls.autoRotateSpeed = 0.35;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.55, 0.6, 0.82);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ------------------------------------------------------------------
// テクスチャ（すべてCanvasで生成）
// ------------------------------------------------------------------
function canvasTex(w, h, draw, { repeat = null, srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}

const skyTex = canvasTex(4, 512, (g, w, h) => {
  const grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, '#05060c');
  grd.addColorStop(0.55, '#0d1428');
  grd.addColorStop(0.8, '#1c2340');
  grd.addColorStop(1, '#2b2742');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
});
scene.background = skyTex;

const glowTex = canvasTex(128, 128, (g, w, h) => {
  const grd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,.45)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
}, { srgb: false });

const windowTex = canvasTex(1024, 128, (g, w, h) => {
  // 1枚ずつ「店の中」が見える窓：天井の光・商品棚のシルエット・色温度の違い
  const PW = 32;
  for (let x = 0; x < w; x += PW) {
    const r = rand();
    const cool = r < 0.22, dark = r > 0.86;
    const grd = g.createLinearGradient(0, 0, 0, h);
    if (dark) { grd.addColorStop(0, '#3a2a1e'); grd.addColorStop(1, '#120c08'); }
    else if (cool) { grd.addColorStop(0, '#f4f7ff'); grd.addColorStop(0.25, '#c9d6ee'); grd.addColorStop(1, '#4a5670'); }
    else { grd.addColorStop(0, '#fff3dc'); grd.addColorStop(0.22, '#ffc77e'); grd.addColorStop(0.75, '#c97a34'); grd.addColorStop(1, '#5a3418'); }
    g.fillStyle = grd; g.fillRect(x, 0, PW, h);
    if (!dark) {
      g.fillStyle = 'rgba(25,15,8,.55)';
      const n = 1 + Math.floor(rand() * 3);
      for (let k = 0; k < n; k++) { const sw = 6 + rand() * 14, sh = 20 + rand() * 50; g.fillRect(x + rand() * (PW - sw), h - sh - 6, sw, sh); }
      g.fillStyle = 'rgba(255,250,235,.9)';
      for (let k = 0; k < 2; k++) g.fillRect(x + 6 + k * 14, 10, 6, 3);
    }
  }
  g.fillStyle = '#15110e';
  for (let x = 0; x < w; x += PW) g.fillRect(x, 0, 3, h);
  g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5);
}, { repeat: [1, 1] });

const cityTex = canvasTex(256, 512, (g, w, h) => {
  g.fillStyle = '#0a0c12'; g.fillRect(0, 0, w, h);
  for (let y = 6; y < h; y += 14) for (let x = 6; x < w; x += 12) {
    const r = rand();
    if (r < 0.32) { g.fillStyle = r < 0.06 ? '#cfe3ff' : r < 0.2 ? '#ffcc88' : '#ffe4b8'; g.globalAlpha = 0.45 + rand() * 0.55; g.fillRect(x, y, 6, 8); }
  }
  g.globalAlpha = 1;
}, { repeat: [1, 1] });

const marbleTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#d9d2c4'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(150,140,125,${rand() * 0.12})`; g.fillRect(rand() * w, rand() * h, rand() * 80, rand() * 3 + 1); }
  g.strokeStyle = 'rgba(120,110,100,.35)'; g.lineWidth = 2;
  g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
}, { repeat: [1, 1] });

const woodTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#9b6b43'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) {
    g.fillStyle = `rgba(${60 + rand() * 40},${35 + rand() * 20},15,${0.18 + rand() * 0.2})`; g.fillRect(0, y, w, 15);
    g.fillStyle = 'rgba(30,18,8,.5)'; g.fillRect(0, y + 15, w, 1);
  }
}, { repeat: [1, 1] });

const leaseTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#c9c6bf'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(90,90,90,.28)'; g.lineWidth = 14;
  for (let i = -h; i < w; i += 40) { g.beginPath(); g.moveTo(i, h); g.lineTo(i + h, 0); g.stroke(); }
}, { repeat: [2, 2] });

const dashTex = canvasTex(128, 16, (g, w, h) => {
  g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h);
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, w * 0.55, h);
}, { repeat: [1, 1], srgb: false });

function labelTex(text, { w = 512, h = 128, bg = 'rgba(12,12,14,.95)', color = '#fff', bar = null, size = 46, font = 'Zen Kaku Gothic New', weight = 700, letter = 0 } = {}) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    if (bar) { g.fillStyle = bar; g.fillRect(0, 0, 14, h); }
    g.fillStyle = color;
    g.font = `${weight} ${size}px "${font}", sans-serif`;
    g.textBaseline = 'middle';
    if ('letterSpacing' in g) g.letterSpacing = `${letter}px`;
    let s = size;
    while (g.measureText(text).width > w - (bar ? 60 : 40) && s > 18) { s -= 2; g.font = `${weight} ${s}px "${font}", sans-serif`; }
    const tw = g.measureText(text).width;
    g.fillText(text, bar ? 34 : (w - tw) / 2, h / 2 + 2);
  });
}

// ------------------------------------------------------------------
// マテリアル管理（グループごとにフェードできるように分ける）
// ------------------------------------------------------------------
function std(opts) { return new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.05, ...opts }); }
function box(w, h, d, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  parent && parent.add(m);
  return m;
}
function plane(w, d, mat, x, y, z, parent) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, y, z);
  parent && parent.add(m);
  return m;
}
function glowPool(color, size, x, y, z, parent, opacity = 0.5) {
  const mat = new THREE.MeshBasicMaterial({ map: glowTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const m = plane(size, size, mat, x, y, z, parent);
  m.userData.noFade = false;
  return m;
}
function rectsAround(x0, x1, z0, z1, h) {
  // 外側の矩形から穴（h）を除いた4つの矩形
  return [
    [x0, x1, h.z1, z1], [x0, x1, z0, h.z0],
    [x0, h.x0, h.z0, h.z1], [h.x1, x1, h.z0, h.z1],
  ];
}

// ------------------------------------------------------------------
// 地面・道路・街
// ------------------------------------------------------------------
const world = new THREE.Group();
scene.add(world);

scene.add(new THREE.HemisphereLight(0x8ea4d8, 0x1a140e, 0.55));
const moon = new THREE.DirectionalLight(0xaac4ff, 0.7);
moon.position.set(-120, 160, -60);
scene.add(moon);
const warm = new THREE.DirectionalLight(0xffb36b, 0.25);
warm.position.set(80, 40, -120);
scene.add(warm);

plane(2400, 2400, std({ color: 0x0c0e12, roughness: 1 }), 0, -0.02, 0, world);
// 歩道（建物の周り）
plane(150, 90, std({ color: 0x24262b, roughness: 0.95 }), 0, 0.0, -2, world);
// 道路（南側）
const ROAD_Z = -48;
plane(2400, 16, std({ color: 0x15171b, roughness: 0.7, metalness: 0.1 }), 0, 0.01, ROAD_Z, world);
plane(2400, 0.25, new THREE.MeshBasicMaterial({ color: 0xc9a550 }), 0, 0.03, ROAD_Z, world);
{
  const dashGeo = new THREE.PlaneGeometry(3, 0.18); dashGeo.rotateX(-Math.PI / 2);
  const dash = new THREE.InstancedMesh(dashGeo, new THREE.MeshBasicMaterial({ color: 0x9da3ad }), 160);
  const o = new THREE.Object3D();
  let i = 0;
  for (let x = -600; x < 600 && i < 160; x += 15) for (const z of [ROAD_Z - 4, ROAD_Z + 4]) { if (i >= 160) break; o.position.set(x, 0.03, z); o.updateMatrix(); dash.setMatrixAt(i++, o.matrix); }
  world.add(dash);
  // 横断歩道
  const cw = new THREE.MeshBasicMaterial({ color: 0xbfc3c9 });
  for (let k = -6; k <= 6; k++) plane(0.7, 15, cw, k * 1.4, 0.035, ROAD_Z, world);
}
// 対岸の歩道
plane(2400, 6, std({ color: 0x202226 }), 0, 0.02, ROAD_Z - 11, world);

// 街路樹と街灯
const treeTrunkGeo = new THREE.CylinderGeometry(0.18, 0.25, 2.6, 6);
const treeTopGeo = new THREE.IcosahedronGeometry(2.1, 1);
const trunkMat = std({ color: 0x3b2a1e });
const leafMat = std({ color: 0x1f3a26, roughness: 0.95, flatShading: true });
function tree(x, z, s = 1, parent = world, y = 0) {
  const g = new THREE.Group();
  const t = new THREE.Mesh(treeTrunkGeo, trunkMat); t.position.y = 1.3; g.add(t);
  const l = new THREE.Mesh(treeTopGeo, leafMat); l.position.y = 3.6; l.scale.set(1, 1.15, 1); g.add(l);
  g.position.set(x, y, z); g.scale.setScalar(s); g.rotation.y = rand() * 6;
  parent.add(g);
  return g;
}
const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff1d6, toneMapped: false });
const poleMat = std({ color: 0x2b2e35, metalness: 0.6, roughness: 0.4 });
function lamp(x, z, h = 6.5, parent = world, dir = 1) {
  box(0.16, h, 0.16, poleMat, x, h / 2, z, parent);
  box(0.12, 0.12, 1.6, poleMat, x, h, z + 0.8 * dir, parent);
  box(0.5, 0.15, 0.9, lampMat, x, h - 0.1, z + 1.4 * dir, parent);
  glowPool(0xffd9a0, 10, x, 0.05, z + 1.4 * dir, parent, 0.2);
}
for (let x = -150; x <= 150; x += 16) {
  if (Math.abs(x) > 8) tree(x + 4, -37.5, 0.9 + rand() * 0.25);
  lamp(x, -40.2, 6.5, world, -1);
  lamp(x + 8, ROAD_Z - 9.5, 6.5, world, 1);
}
for (let z = -26; z <= 30; z += 12) { tree(-68, z, 1); tree(68, z, 1.05); }
{ // バス停
  const sh = new THREE.Group();
  box(7, 0.2, 2.2, poleMat, 0, 2.8, 0, sh);
  for (const x of [-3.3, 3.3]) box(0.12, 2.8, 0.12, poleMat, x, 1.4, -0.9, sh);
  box(6.6, 2.2, 0.06, std({ color: 0x9ccaff, transparent: true, opacity: 0.2 }), 0, 1.5, 0.9, sh);
  box(1.6, 2.2, 0.15, new THREE.MeshBasicMaterial({ color: 0xffe9c4, toneMapped: false }), 2.4, 1.4, 0.95, sh);
  box(4, 0.4, 0.6, std({ color: 0x5b3b26 }), -0.8, 0.5, 0.4, sh);
  glowPool(0xffe2b8, 9, 0, 0.05, 0, sh, 0.35);
  sh.position.set(-26, 0, -39.2);
  world.add(sh);
}

// 遠景のビル
{
  const N = 220;
  const geo = new THREE.BoxGeometry(1, 1, 1);
  geo.translate(0, 0.5, 0);
  const mat = std({ color: 0x0b0d13, emissive: 0xffffff, emissiveMap: cityTex, emissiveIntensity: 0.55, map: cityTex });
  const city = new THREE.InstancedMesh(geo, mat, N);
  const o = new THREE.Object3D();
  for (let i = 0; i < N; i++) {
    const a = rand() * Math.PI * 2, r = 280 + rand() * 340;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (z > -120 && z < 200 && Math.abs(x) < 200) { i--; continue; }
    const w = 14 + rand() * 26, h = 10 + Math.pow(rand(), 2.4) * 95;
    o.position.set(x, 0, z); o.scale.set(w, h, 14 + rand() * 24); o.rotation.y = rand() * 0.6; o.updateMatrix();
    city.setMatrixAt(i, o.matrix);
  }
  world.add(city);
  // 高架の鉄道（北東の奥）
  const rail = new THREE.Group();
  box(900, 1.2, 8, std({ color: 0x1c1f26 }), 0, 9, 0, rail);
  for (let x = -440; x <= 440; x += 30) box(2, 9, 3, std({ color: 0x1a1c22 }), x, 4.5, 0, rail);
  rail.position.set(0, 0, 175);
  world.add(rail);
  const train = new THREE.Group();
  const trainBody = std({ color: 0xd8dde6, metalness: 0.4, roughness: 0.35 });
  const trainWin = new THREE.MeshBasicMaterial({ color: 0xfff0cf, toneMapped: false });
  for (let c = 0; c < 6; c++) {
    box(19.5, 3.2, 3, trainBody, c * 20, 11.4, 0, train);
    box(18, 0.9, 3.05, trainWin, c * 20, 11.9, 0, train);
  }
  train.position.set(-400, 0, 175);
  world.add(train);
  world.userData.train = train;
}

// ------------------------------------------------------------------
// 車
// ------------------------------------------------------------------
const carColors = [0xe8e8ea, 0x1d1f24, 0x8a1d24, 0x2a4f8a, 0x6c7075, 0xc7b79a, 0x234036, 0xf2f2f2, 0x3a3d44];
const tireMat = std({ color: 0x111111 });
const carGlass = std({ color: 0x0d1118, metalness: 0.6, roughness: 0.15 });
const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
const tailMat = new THREE.MeshBasicMaterial({ color: 0xff2a2a, toneMapped: false });
const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 12); wheelGeo.rotateX(Math.PI / 2);
function makeCar(color, lights = true) {
  const g = new THREE.Group();
  const body = std({ color, metalness: 0.55, roughness: 0.32 });
  box(4.4, 0.75, 1.85, body, 0, 0.72, 0, g);
  box(2.5, 0.65, 1.62, carGlass, -0.25, 1.38, 0, g);
  box(2.3, 0.08, 1.5, body, -0.25, 1.72, 0, g);
  for (const [x, z] of [[1.4, 0.88], [1.4, -0.88], [-1.4, 0.88], [-1.4, -0.88]]) {
    const w = new THREE.Mesh(wheelGeo, tireMat); w.position.set(x, 0.36, z); g.add(w);
  }
  if (lights) {
    box(0.06, 0.16, 0.42, headMat, 2.21, 0.85, 0.62, g);
    box(0.06, 0.16, 0.42, headMat, 2.21, 0.85, -0.62, g);
    box(0.06, 0.14, 0.5, tailMat, -2.21, 0.88, 0.6, g);
    box(0.06, 0.14, 0.5, tailMat, -2.21, 0.88, -0.6, g);
    const beam = glowPool(0xfff3d8, 9, 6, 0.04, 0, g, 0.42); beam.scale.set(1.5, 0.75, 1);
    glowPool(0xff3020, 3.5, -2.9, 0.04, 0, g, 0.35);
  }
  return g;
}
const movingCars = [];
for (let i = 0; i < 12; i++) {
  const dir = i % 2 === 0 ? 1 : -1;
  const car = makeCar(carColors[i % carColors.length]);
  car.position.set(-200 + i * 36 + rand() * 12, 0, dir === 1 ? ROAD_Z - 4 : ROAD_Z + 4);
  car.rotation.y = dir === 1 ? 0 : Math.PI;
  car.userData = { dir, speed: 9 + rand() * 5 };
  world.add(car);
  movingCars.push(car);
}

// ------------------------------------------------------------------
// 駐車場（北側）
// ------------------------------------------------------------------
const parking = new THREE.Group();
world.add(parking);
const LOT = { x0: -58, x1: 58, z0: 40, z1: 108 };
plane(LOT.x1 - LOT.x0 + 8, LOT.z1 - LOT.z0 + 6, std({ color: 0x17191d, roughness: 0.8 }), 0, 0.012, (LOT.z0 + LOT.z1) / 2, parking);
plane(150, 10, std({ color: 0x24262b }), 0, 0.011, 35, parking); // 北口の歩道
const spaces = [];
{
  const rows = [44, 49.6, 63, 68.6, 82, 87.6, 101];
  for (const [ri, z] of rows.entries()) {
    for (let x = LOT.x0 + 2; x <= LOT.x1 - 2; x += 2.8) {
      if (Math.abs(x) < 4) continue;
      spaces.push({ x, z, facing: ri % 2 === 0 ? 1 : -1 });
    }
  }
  // 白線
  const lineGeo = new THREE.PlaneGeometry(0.12, 5); lineGeo.rotateX(-Math.PI / 2);
  const lines = new THREE.InstancedMesh(lineGeo, new THREE.MeshBasicMaterial({ color: 0x9aa0a8 }), spaces.length + rows.length * 2);
  const o = new THREE.Object3D();
  spaces.forEach((s, i) => { o.position.set(s.x - 1.4, 0.03, s.z); o.updateMatrix(); lines.setMatrixAt(i, o.matrix); });
  parking.add(lines);
  // 空き/満車マーカー
  const markGeo = new THREE.PlaneGeometry(2.3, 4.4); markGeo.rotateX(-Math.PI / 2);
  const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const marks = new THREE.InstancedMesh(markGeo, markMat, spaces.length);
  const nearEntrance = new THREE.Vector3(0, 0, 36);
  let best = null;
  spaces.forEach((s, i) => {
    s.busy = rand() < (Math.abs(s.x) < 26 && s.z < 72 ? 0.93 : 0.72);
    o.position.set(s.x, 0.04, s.z); o.updateMatrix(); marks.setMatrixAt(i, o.matrix);
    marks.setColorAt(i, new THREE.Color(s.busy ? 0xff4a4a : 0x3dff7a));
    if (!s.busy) { const d = Math.hypot(s.x - nearEntrance.x, s.z - nearEntrance.z); if (!best || d < best.d) best = { s, d, i }; }
  });
  marks.instanceColor.needsUpdate = true;
  parking.add(marks);
  parking.userData.marks = marks;
  parking.userData.best = best;
  // 駐車中の車
  const busy = spaces.filter((s) => s.busy);
  const bodyGeo = new THREE.BoxGeometry(4.3, 0.8, 1.85); bodyGeo.translate(0, 0.72, 0);
  const cabGeo = new THREE.BoxGeometry(2.4, 0.62, 1.6); cabGeo.translate(-0.2, 1.4, 0);
  const bodies = new THREE.InstancedMesh(bodyGeo, std({ metalness: 0.5, roughness: 0.35 }), busy.length);
  const cabs = new THREE.InstancedMesh(cabGeo, carGlass, busy.length);
  busy.forEach((s, i) => {
    o.position.set(s.x, 0, s.z); o.rotation.y = Math.PI / 2 * s.facing + (rand() - 0.5) * 0.06; o.updateMatrix();
    bodies.setMatrixAt(i, o.matrix); cabs.setMatrixAt(i, o.matrix);
    bodies.setColorAt(i, new THREE.Color(carColors[Math.floor(rand() * carColors.length)]));
  });
  parking.add(bodies, cabs);
  const free = spaces.length - busy.length;
  parking.userData.stats = { free, total: spaces.length };
  // 駐車場の照明
  for (let x = -48; x <= 48; x += 24) for (const z of [56, 75, 94]) lamp(x, z, 8, parking, 1);
  for (let x = -60; x <= 60; x += 10) tree(x, 113, 0.9 + rand() * 0.2, parking);
  // いちばん近い空きのハイライト
  const nearMark = glowPool(0xffffff, 8, best.s.x, 0.06, best.s.z, parking, 0);
  parking.userData.nearMark = nearMark;
}

// ------------------------------------------------------------------
// モール本体
// ------------------------------------------------------------------
const mall = new THREE.Group();
world.add(mall);

function slotRect(slot) {
  const W = 88 / 5; // 17.6
  if (slot === 'W') return { x0: -58, x1: -44, z0: -28, z1: 28, side: 'W' };
  if (slot === 'E') return { x0: 44, x1: 58, z0: -28, z1: 28, side: 'E' };
  const i = Number(slot[1]) - 1;
  const x0 = -44 + W * i, x1 = x0 + W;
  return slot[0] === 'N' ? { x0, x1, z0: COR, z1: 28, side: 'N' } : { x0, x1, z0: -28, z1: -COR, side: 'S' };
}
function shopCenter(s) { const r = slotRect(s.slot); return new THREE.Vector3((r.x0 + r.x1) / 2, s.floor * FH, (r.z0 + r.z1) / 2); }
function shopFront(s) {
  const r = slotRect(s.slot), c = shopCenter(s);
  if (r.side === 'N') return new THREE.Vector3(c.x, c.y, COR);
  if (r.side === 'S') return new THREE.Vector3(c.x, c.y, -COR);
  if (r.side === 'W') return new THREE.Vector3(-44, c.y, 0);
  return new THREE.Vector3(44, c.y, 0);
}

const floorGroups = [];
const pickables = [];
const shopVisuals = new Map();

const catTint = (cat) => new THREE.Color(CATEGORY[cat].color);

function buildProps(s, r, y, g, mats) {
  const w = r.x1 - r.x0, d = r.z1 - r.z0;
  const cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
  const tint = catTint(s.cat);
  const shelf = std({ color: tint.clone().lerp(new THREE.Color(0xf4efe6), 0.45), emissive: tint, emissiveIntensity: 0.12 });
  const white = mats.fixture;
  const vertical = s.slot === 'W' || s.slot === 'E';
  const L = vertical ? d : w, S = vertical ? w : d;
  const put = (along, across, lw, lh, ld, mat) => {
    const x = vertical ? cx + across : cx + along;
    const z = vertical ? cz + along : cz + across;
    box(vertical ? ld : lw, lh, vertical ? lw : ld, mat, x, y + lh / 2, z, g);
  };
  const t = s.cat;
  if (t === 'food' || t === 'life') {
    const rows = Math.max(2, Math.floor(S / 4.2));
    for (let k = 0; k < rows; k++) put(0, -S / 2 + 3 + k * ((S - 6) / Math.max(1, rows - 1)), L * 0.62, 1.5, 0.9, shelf);
    put(-L / 2 + 1.6, 0, 1.0, 1.0, S * 0.5, white);
  } else if (t === 'fashion') {
    for (let k = -1; k <= 1; k++) put(k * L * 0.27, S * 0.25, 0.25, 1.5, 3.2, shelf);
    for (let k = -1; k <= 1; k += 2) { const m = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.9, 20), white); m.position.set(cx + (vertical ? 0 : k * L * 0.2), y + 0.45, cz + (vertical ? k * L * 0.2 : -S * 0.1)); g.add(m); }
    put(0, -S / 2 + 0.6, L * 0.8, 2.6, 0.5, shelf);
  } else if (t === 'gourmet') {
    const tbl = std({ color: 0x5a3a24 });
    for (let a = -L / 2 + 2.5; a < L / 2 - 1.5; a += 3.4) for (let b = -S / 2 + 3; b < S / 2 - 1.5; b += 3.6) put(a, b, 1.3, 0.8, 1.3, tbl);
    put(0, -S / 2 + 0.9, L * 0.7, 1.1, 1.2, shelf);
  } else if (t === 'play') {
    const cols = [0xff8a5c, 0x6cc4ff, 0xffd35c, 0x8be08b, 0xd08bff];
    for (let k = 0; k < 7; k++) {
      const m = std({ color: cols[k % cols.length], emissive: cols[k % cols.length], emissiveIntensity: 0.25 });
      put((rand() - 0.5) * L * 0.75, (rand() - 0.5) * S * 0.6, 1.6 + rand() * 2.2, 0.6 + rand() * 1.8, 1.6 + rand() * 2.2, m);
    }
  } else if (t === 'service') {
    for (let a = -L / 2 + 3; a < L / 2 - 1; a += 3.6) put(a, S / 2 - 2.2, 0.18, 2.2, 3.4, white);
    put(0, -S / 2 + 2, L * 0.4, 1.0, 1.0, shelf);
  } else if (t === 'gate') {
    const pl = std({ color: 0x2f4a30 });
    for (let k = -1; k <= 1; k += 2) { put(k * 4.5, 0, 2.2, 0.9, 2.2, mats.stone); tree(cx + (vertical ? 0 : k * 4.5), cz, 0.55, g, y + 0.9); }
    put(0, r.side === 'S' ? -S / 2 + 3 : S / 2 - 3, 4, 1.1, 1.4, pl);
  }
}

function buildFloor(f) {
  const g = new THREE.Group();
  g.userData.floor = f;
  const y = f * FH;
  const mats = {
    slab: std({ color: 0x3a3d44, roughness: 0.9 }),
    corridor: std({ color: 0xe6dfd2, map: marbleTex.clone(), emissive: 0xffe9c4, emissiveIntensity: 0.22, roughness: 0.4 }),
    wall: std({ color: 0x4a3229, roughness: 0.9 }),       // レンガ色の外壁
    band: std({ color: 0x1d1f24, metalness: 0.3, roughness: 0.6 }),
    partition: std({ color: 0xe9e4da, roughness: 0.95 }),
    glass: std({ color: 0x9ccaff, transparent: true, opacity: 0.16, metalness: 0.2, roughness: 0.1, depthWrite: false }),
    fixture: std({ color: 0xf2efe8 }),
    stone: std({ color: 0x8d877c }),
    window: std({ color: 0x2a1c12, emissive: 0xffffff, emissiveMap: windowTex.clone(), emissiveIntensity: 1.0, map: windowTex }),
    rail: new THREE.MeshBasicMaterial({ color: 0xfff3dc, toneMapped: false }),
  };
  mats.corridor.map.wrapS = mats.corridor.map.wrapT = THREE.RepeatWrapping;
  mats.corridor.map.repeat.set(22, 3.5);

  // 床スラブ
  if (f === 0) box(HALF_X * 2, 0.5, HALF_Z * 2, mats.slab, 0, y - 0.25, 0, g);
  else for (const [x0, x1, z0, z1] of rectsAround(-HALF_X, HALF_X, -HALF_Z, HALF_Z, VOID)) box(x1 - x0, 0.5, z1 - z0, mats.slab, (x0 + x1) / 2, y - 0.25, (z0 + z1) / 2, g);

  // 通路の床
  const corRects = f === 0 ? [[-44, 44, -COR, COR]] : rectsAround(-44, 44, -COR, COR, VOID);
  for (const [x0, x1, z0, z1] of corRects) {
    const m = plane(x1 - x0, z1 - z0, mats.corridor, (x0 + x1) / 2, y + 0.01, (z0 + z1) / 2, g);
    m.geometry = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
  }
  // 通路のダウンライト
  for (let x = -40; x <= 40; x += 8) for (const z of f === 0 ? [-4.5, 0, 4.5] : [-5.2, 5.2]) glowPool(0xffe2b0, 5, x, y + 0.03, z, g, 0.28);

  // 吹き抜けの手すり
  if (f > 0) {
    const { x0, x1, z0, z1 } = VOID;
    for (const z of [z0, z1]) { box(x1 - x0, 1.0, 0.06, mats.glass, 0, y + 0.5, z, g); box(x1 - x0, 0.06, 0.12, mats.rail, 0, y + 1.02, z, g); }
    for (const x of [x0, x1]) { box(0.06, 1.0, z1 - z0, mats.glass, x, y + 0.5, 0, g); box(0.12, 0.06, z1 - z0, mats.rail, x, y + 1.02, 0, g); }
  }
  // エスカレーター（上の階へ）
  if (f < 2) {
    const esc = std({ color: 0x2d3038, metalness: 0.6, roughness: 0.35 });
    for (const [x, z, dir] of [[-16, -1.6, 1], [16, 1.6, -1]]) {
      const len = Math.hypot(14, FH);
      const m = box(len, 0.5, 1.4, esc, x, y + FH / 2, z, g);
      m.rotation.z = Math.atan2(FH, 14) * dir;
      const rail = box(len, 0.08, 0.08, mats.rail, x, y + FH / 2 + 0.9, z + 0.75, g); rail.rotation.z = m.rotation.z;
      const rail2 = box(len, 0.08, 0.08, mats.rail, x, y + FH / 2 + 0.9, z - 0.75, g); rail2.rotation.z = m.rotation.z;
    }
  }
  // エレベーター
  for (const x of [-40, 40]) {
    box(3, FH - 0.5, 3, mats.glass, x, y + (FH - 0.5) / 2, 0, g);
    box(3.1, 0.12, 3.1, mats.rail, x, y + FH - 0.6, 0, g);
    box(2.6, 2.3, 2.6, std({ color: 0xcfd6e0, emissive: 0xbcd4ff, emissiveIntensity: 0.25 }), x, y + 1.2 + (f === 1 ? 0 : 0), 0, g).visible = f === 1;
  }

  // 店舗
  for (const s of SHOPS.filter((s) => s.floor === f)) {
    const r = slotRect(s.slot);
    const w = r.x1 - r.x0, d = r.z1 - r.z0, cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
    const tint = catTint(s.cat);
    let floorMat;
    if (s.cat === 'vacant') floorMat = std({ color: 0xb9b6af, map: leaseTex.clone(), emissive: 0x777777, emissiveIntensity: 0.15 });
    else if (s.cat === 'gate') floorMat = mats.corridor;
    else floorMat = std({ color: new THREE.Color(0xb98b5e).lerp(tint, 0.18), map: woodTex, emissive: new THREE.Color(0xffc98a).lerp(tint, 0.25), emissiveIntensity: 0.3, roughness: 0.75 });
    if (floorMat.map && s.cat === 'vacant') { floorMat.map.wrapS = floorMat.map.wrapT = THREE.RepeatWrapping; floorMat.map.repeat.set(w / 8, d / 8); }
    const fl = plane(w - 0.3, d - 0.3, floorMat, cx, y + 0.02, cz, g);
    // 店内の照明（あたたかい光だまり）
    if (s.cat !== 'vacant') {
      const n = Math.max(2, Math.round((w * d) / 120));
      for (let k = 0; k < n + 1; k++) glowPool(new THREE.Color(0xffd39a).lerp(tint, 0.15), 8 + rand() * 5, r.x0 + 2.5 + rand() * (w - 5), y + 0.04, r.z0 + 2.5 + rand() * (d - 5), g, 0.42);
    }
    // 間仕切り
    const ph = 3.2;
    if (r.side === 'N' || r.side === 'S') {
      for (const x of [r.x0, r.x1]) box(0.25, ph, d, mats.partition, x, y + ph / 2, cz, g);
      box(w, ph, 0.25, mats.partition, cx, y + ph / 2, r.side === 'N' ? r.z1 : r.z0, g);
    } else {
      for (const z of [r.z0, r.z1]) box(w, ph, 0.25, mats.partition, cx, y + ph / 2, z, g);
      box(0.25, ph, d, mats.partition, r.side === 'W' ? r.x0 : r.x1, y + ph / 2, cz, g);
    }
    // 店頭のガラスと看板
    if (s.cat !== 'gate') {
      const fz = r.side === 'N' ? r.z0 : r.side === 'S' ? r.z1 : 0;
      const fx = r.side === 'W' ? r.x1 : r.side === 'E' ? r.x0 : cx;
      const along = r.side === 'N' || r.side === 'S';
      const glassW = along ? w - 0.8 : d - 0.8;
      box(along ? glassW : 0.06, 3.0, along ? 0.06 : glassW, mats.glass, fx, y + 1.5, fz, g);
      box(along ? glassW : 0.1, 0.08, along ? 0.1 : glassW, mats.rail, fx, y + 3.05, fz, g);
      const signText = s.cat === 'vacant' ? 'FOR LEASE  テナント募集' : s.name;
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(10, glassW - 2), 1.35), new THREE.MeshBasicMaterial({ map: labelTex(signText, { bar: CATEGORY[s.cat].color }), toneMapped: false, transparent: true }));
      const off = 0.08;
      if (r.side === 'N') { sign.position.set(fx, y + 3.9, fz - off); sign.rotation.y = Math.PI; }
      else if (r.side === 'S') sign.position.set(fx, y + 3.9, fz + off);
      else if (r.side === 'W') { sign.position.set(fx + off, y + 3.9, 0); sign.rotation.y = Math.PI / 2; }
      else { sign.position.set(fx - off, y + 3.9, 0); sign.rotation.y = -Math.PI / 2; }
      g.add(sign);
    }
    buildProps(s, r, y + 0.02, g, mats);
    // ピック用の見えない箱
    const pick = box(w - 0.4, 3.4, d - 0.4, new THREE.MeshBasicMaterial({ visible: false }), cx, y + 1.7, cz, g);
    pick.userData.shop = s;
    pickables.push(pick);
    shopVisuals.set(s, { floorMat: fl.material, base: fl.material.emissiveIntensity, tint });
  }

  // 外壁（窓の帯つき）
  const wallH = FH - 0.5;
  const sides = [
    { w: HALF_X * 2, x: 0, z: -HALF_Z, ry: 0, n: -1 },
    { w: HALF_X * 2, x: 0, z: HALF_Z, ry: Math.PI, n: 1 },
    { w: HALF_Z * 2, x: -HALF_X, z: 0, ry: Math.PI / 2, n: -1 },
    { w: HALF_Z * 2, x: HALF_X, z: 0, ry: -Math.PI / 2, n: 1 },
  ];
  for (const sd of sides) {
    const wall = new THREE.Group();
    wall.position.set(sd.x, y, sd.z); wall.rotation.y = sd.ry;
    box(sd.w, 1.1, 0.6, mats.wall, 0, 0.55, 0, wall);
    box(sd.w, 1.3, 0.6, mats.band, 0, wallH - 0.15, 0, wall);
    // 窓の帯
    const winMat = mats.window.clone();
    winMat.emissiveMap = windowTex.clone(); winMat.emissiveMap.wrapS = THREE.RepeatWrapping; winMat.emissiveMap.repeat.set(sd.w / 64, 1); winMat.emissiveMap.offset.x = rand();
    winMat.map = winMat.emissiveMap;
    winMat.emissiveIntensity = f === 2 ? 1.05 : 0.95;
    const win = new THREE.Mesh(new THREE.PlaneGeometry(sd.w, wallH - 2.4), winMat);
    win.position.set(0, 1.1 + (wallH - 2.4) / 2, -0.31);
    win.rotation.y = Math.PI;
    wall.add(win);
    const winIn = win.clone(); winIn.position.z = 0.31; winIn.rotation.y = 0; wall.add(winIn);
    // 柱
    for (let x = -sd.w / 2; x <= sd.w / 2 + 0.1; x += 8) box(0.7, wallH, 0.9, mats.wall, x, wallH / 2, 0, wall);
    g.add(wall);
  }
  // 南口の大きなガラス
  if (f === 0) {
    box(18, 4.4, 0.4, std({ color: 0xffe6bf, emissive: 0xffd9a0, emissiveIntensity: 0.9 }), 0, 2.4, -HALF_Z - 0.05, g);
    box(22, 0.4, 6, std({ color: 0x1a1b20, metalness: 0.5 }), 0, 5.0, -HALF_Z - 3, g);
    for (let k = -2; k <= 2; k++) glowPool(0xffe0b0, 6, k * 4, 0.05, -HALF_Z - 3, g, 0.5);
    box(18, 4.4, 0.4, std({ color: 0xffe6bf, emissive: 0xffd9a0, emissiveIntensity: 0.7 }), 0, 2.4, HALF_Z + 0.05, g);
    box(22, 0.4, 5, std({ color: 0x1a1b20, metalness: 0.5 }), 0, 5.0, HALF_Z + 2.5, g);
  }
  mall.add(g);
  floorGroups.push(g);
  return g;
}

// 屋上
function buildRoof() {
  const g = new THREE.Group();
  const y = 3 * FH;
  const slab = std({ color: 0x2c2f36, roughness: 0.9 });
  for (const [x0, x1, z0, z1] of rectsAround(-HALF_X, HALF_X, -HALF_Z, HALF_Z, VOID)) box(x1 - x0, 0.6, z1 - z0, slab, (x0 + x1) / 2, y - 0.3, (z0 + z1) / 2, g);
  // パラペット
  const par = std({ color: 0x4a3229 });
  box(HALF_X * 2, 1.2, 0.6, par, 0, y + 0.6, -HALF_Z, g); box(HALF_X * 2, 1.2, 0.6, par, 0, y + 0.6, HALF_Z, g);
  box(0.6, 1.2, HALF_Z * 2, par, -HALF_X, y + 0.6, 0, g); box(0.6, 1.2, HALF_Z * 2, par, HALF_X, y + 0.6, 0, g);
  // 天窓（吹き抜けの上）
  const sky = std({ color: 0x24324a, emissive: 0x9fc0ff, emissiveIntensity: 0.18, transparent: true, opacity: 0.8, metalness: 0.5, roughness: 0.2 });
  const { x0, x1, z0, z1 } = VOID;
  const sw = (z1 - z0) / 2;
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, Math.hypot(sw, 1.6)), sky);
    p.position.set(0, y + 0.8, s * sw / 2);
    p.rotation.x = -Math.PI / 2 + s * Math.atan2(1.6, sw);
    g.add(p);
  }
  const frame = new THREE.MeshBasicMaterial({ color: 0x20232a });
  for (let x = x0; x <= x1; x += 4) { box(0.15, 0.15, z1 - z0, frame, x, y + 0.9, 0, g); }
  // 芝生とデッキ（西側＝屋上庭園）
  const lawn = std({ color: 0x3f7a36, roughness: 1, emissive: 0x2c5a22, emissiveIntensity: 0.45 });
  const deckMat = std({ color: 0x8a6040, map: woodTex, roughness: 0.8, emissive: 0x3a2210, emissiveIntensity: 0.25 });
  plane(26, 20, lawn, -42, y + 0.02, 14, g);
  plane(26, 20, lawn, -42, y + 0.02, -14, g);
  plane(8, 48, deckMat, -24, y + 0.03, 0, g);
  plane(22, 10, deckMat, -6, y + 0.03, 20, g);
  plane(22, 10, deckMat, -6, y + 0.03, -20, g);
  for (const [x, z] of [[-52, 22], [-34, 22], [-52, -22], [-34, -22], [-44, 4], [-44, -4], [-28, 26], [-28, -26]]) tree(x, z, 0.9, g, y);
  // BBQのテーブル
  const tblMat = std({ color: 0x5b3b26 });
  for (let k = 0; k < 6; k++) { box(2.4, 0.8, 1.2, tblMat, -12 + (k % 3) * 6, y + 0.4, k < 3 ? 19 : -19, g); }
  // ストリングライト
  const bulbs = [];
  for (const z of [-22, -14, -6, 6, 14, 22]) {
    const ax = -56, bx = -4;
    for (let t = 0; t <= 1.0001; t += 1 / 26) {
      const x = ax + (bx - ax) * t;
      const sag = Math.sin(t * Math.PI * 3) ** 2 * -1.2;
      bulbs.push(new THREE.Vector3(x, y + 4.2 + sag, z));
    }
    for (const x of [-56, -30, -4]) box(0.12, 4.4, 0.12, poleMat, x, y + 2.2, z, g);
  }
  const bulbMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd38a, toneMapped: false }), bulbs.length);
  const o = new THREE.Object3D();
  bulbs.forEach((p, i) => { o.position.copy(p); o.updateMatrix(); bulbMesh.setMatrixAt(i, o.matrix); });
  g.add(bulbMesh);
  for (const z of [-22, -14, -6, 6, 14, 22]) for (let x = -50; x <= -8; x += 10) glowPool(0xffc46a, 7, x, y + 0.06, z, g, 0.22);
  // 設備（東側）
  const hv = std({ color: 0x5d636e, metalness: 0.4, roughness: 0.5 });
  for (let k = 0; k < 6; k++) box(5, 2.2, 4, hv, 30 + (k % 3) * 8, y + 1.1, k < 3 ? 16 : -16, g);
  box(14, 3.5, 10, std({ color: 0x3a3e47 }), 44, y + 1.75, 0, g);
  // 屋上の看板（南向き）
  const signMat = new THREE.MeshBasicMaterial({ map: labelTex('TSUMUGI TERRACE', { w: 1024, h: 160, bg: 'rgba(0,0,0,0)', size: 104, font: 'Outfit', weight: 600, letter: 18 }), transparent: true, toneMapped: false, color: 0xfff4e2 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(44, 6.9), signMat);
  sign.position.set(18, y + 4.6, -HALF_Z - 0.2);
  sign.rotation.y = Math.PI;
  g.add(sign);
  box(46, 0.3, 0.3, poleMat, 18, y + 1.3, -HALF_Z + 0.3, g);
  for (const x of [-2, 18, 38]) box(0.25, 3.2, 0.25, poleMat, x, y + 2.6, -HALF_Z + 0.3, g);
  // 壁面の「つむぎテラス」
  const jp = new THREE.Mesh(new THREE.PlaneGeometry(26, 6.5), new THREE.MeshBasicMaterial({ map: labelTex('つむぎテラス', { w: 1024, h: 256, bg: 'rgba(0,0,0,0)', size: 190, weight: 900 }), transparent: true, toneMapped: false, color: 0xffe9c9 }));
  jp.position.set(-34, 2 * FH + 2.6, -HALF_Z - 0.4);
  jp.rotation.y = Math.PI;
  g.add(jp);
  mall.add(g);
  return g;
}

let roofGroup;

// ------------------------------------------------------------------
// ルート表示（ベビーカー）
// ------------------------------------------------------------------
const routeGroup = new THREE.Group();
scene.add(routeGroup);
const routeTex = dashTex.clone(); routeTex.wrapS = THREE.RepeatWrapping;
const routeMat = new THREE.MeshBasicMaterial({ color: 0x6fe3ff, map: routeTex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
const routeCore = new THREE.MeshBasicMaterial({ color: 0x2aa8ff, transparent: true, opacity: 0.35, depthTest: false, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
const routeDot = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, toneMapped: false }));
routeDot.renderOrder = 20;
const routeHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x7fe6ff, depthTest: false, blending: THREE.AdditiveBlending, transparent: true }));
routeHalo.scale.set(6, 6, 1); routeHalo.renderOrder = 19;
let routeCurve = null, routeLen = 0, routeProgress = 0;

function buildRoute(points) {
  routeGroup.clear();
  const path = new THREE.CurvePath();
  for (let i = 0; i < points.length - 1; i++) path.add(new THREE.LineCurve3(points[i], points[i + 1]));
  routeLen = path.getLength();
  const segs = Math.max(60, Math.round(routeLen * 2));
  const tube = new THREE.Mesh(new THREE.TubeGeometry(path, segs, 0.42, 8, false), routeMat);
  tube.renderOrder = 18;
  const core = new THREE.Mesh(new THREE.TubeGeometry(path, segs, 0.9, 8, false), routeCore);
  core.renderOrder = 17;
  routeTex.repeat.set(routeLen / 3, 1);
  routeGroup.add(core, tube, routeDot, routeHalo);
  routeCurve = path;
  routeProgress = 0;
  tube.geometry.setDrawRange(0, 0);
  core.geometry.setDrawRange(0, 0);
  routeGroup.userData = { tube, core };
}
function clearRoute() { routeGroup.clear(); routeCurve = null; }

function routeTo(shop) {
  const y = (f) => f * FH + 0.6;
  const front = shopFront(shop);
  const elevX = front.x < 0 ? -40 : 40;
  const pts = [new THREE.Vector3(0, y(0), -HALF_Z - 6), new THREE.Vector3(0, y(0), -1)];
  let steps;
  const elevName = elevX < 0 ? 'エレベーター A' : 'エレベーター B';
  if (shop.floor === 0) {
    pts.push(new THREE.Vector3(front.x, y(0), -1));
  } else {
    pts.push(new THREE.Vector3(elevX + (elevX < 0 ? 2.5 : -2.5), y(0), -1), new THREE.Vector3(elevX, y(0), -1), new THREE.Vector3(elevX, y(shop.floor), -1), new THREE.Vector3(elevX + (elevX < 0 ? 2.5 : -2.5), y(shop.floor), -1));
    const side = front.z > 0 ? 5.5 : -5.5;
    pts.push(new THREE.Vector3(elevX + (elevX < 0 ? 2.5 : -2.5), y(shop.floor), side), new THREE.Vector3(front.x, y(shop.floor), side));
  }
  const last = pts[pts.length - 1];
  if (shop.slot === 'W' || shop.slot === 'E') pts.push(new THREE.Vector3(front.x, last.y, last.z).setZ(0));
  else pts.push(new THREE.Vector3(front.x, last.y, last.z).setX(front.x), new THREE.Vector3(front.x, last.y, front.z + (front.z > 0 ? 3 : -3)));
  // 余計な重複点を除く
  const clean = pts.filter((p, i) => i === 0 || p.distanceTo(pts[i - 1]) > 0.05);
  buildRoute(clean);
  let dist = 0; for (let i = 1; i < clean.length; i++) dist += Math.hypot(clean[i].x - clean[i - 1].x, clean[i].z - clean[i - 1].z);
  const min = Math.max(1, Math.round(dist / 50 + (shop.floor ? 1 : 0)));
  const dirWord = front.x < -2 ? '左' : front.x > 2 ? '右' : 'まっすぐ';
  steps = shop.floor === 0
    ? [`<b>南口</b>から入って、通路を<b>${dirWord}</b>へ`, `段差なしで約${Math.round(dist)}m`, `<b>${shop.name}</b>に到着（約${min}分）`]
    : [`<b>南口</b>から入って<b>${dirWord}</b>へ`, `<b>${elevName}</b>で<b>${FLOORS[shop.floor].name}</b>へ（ベビーカー優先）`, `降りて約${Math.round(Math.abs(front.x - elevX))}m進むと<b>${shop.name}</b>（約${min}分）`];
  return steps;
}

// ------------------------------------------------------------------
// 状態・アニメーション
// ------------------------------------------------------------------
let viewShift = 0, viewShiftTarget = 0;
const state = { view: 'home', floor: null, hover: null, selected: null, filter: null, t: 0 };
const tweens = [];
function tween(dur, fn, ease = (t) => 1 - Math.pow(1 - t, 3)) {
  return new Promise((res) => tweens.push({ t: 0, dur, fn, ease, res }));
}
const groupAlpha = new Map(); // group -> {cur, target}

function setGroupAlpha(group, a) {
  group.visible = a > 0.01;
  group.position.y = (1 - a) * 26;
  group.traverse((o) => {
    if (!o.material) return;
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of ms) {
      if (m.userData.base === undefined) { m.userData.base = m.opacity; m.userData.tr = m.transparent; m.userData.dw = m.depthWrite; }
      if (a >= 0.999) { m.opacity = m.userData.base; m.transparent = m.userData.tr; m.depthWrite = m.userData.dw; }
      else { m.transparent = true; m.opacity = m.userData.base * a; m.depthWrite = false; }
    }
  });
}
function cutTo(level) {
  // level: null=全体 / 0..2=フロア / 3=屋上
  const groups = [...floorGroups, roofGroup];
  groups.forEach((g, i) => {
    const want = level === null || i <= level ? 1 : 0;
    const cur = groupAlpha.get(g) ?? 1;
    if (cur === want) return;
    groupAlpha.set(g, want);
    tween(0.9, (t) => { if (groupAlpha.get(g) === want) setGroupAlpha(g, cur + (want - cur) * t); }, (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  });
}

function flyTo(pos, target, dur = 1.8) {
  const p0 = camera.position.clone(), t0 = controls.target.clone();
  const p1 = new THREE.Vector3(...pos), t1 = new THREE.Vector3(...target);
  controls.enabled = false;
  const lift = Math.max(0, 22 - Math.abs(p1.y - p0.y)) * 0.6;
  return tween(dur, (t) => {
    camera.position.lerpVectors(p0, p1, t);
    camera.position.y += Math.sin(t * Math.PI) * lift;
    controls.target.lerpVectors(t0, t1, t);
  }, (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2).then(() => { controls.enabled = !CAPTURE; });
}

// 画面に合わせたカメラ位置
function views() {
  const phone = isPhone();
  const k = phone ? 1.55 : 1;
  const hk = phone ? 1.55 : innerWidth / innerHeight < 1.3 ? 1.12 : 1;
  return {
    home:    { pos: [92 * hk, 58 * hk, -118 * hk], target: [0, 7, 4] },
    floor:   (f) => ({ pos: [46 * k, 92 * k + f * FH, -64 * k], target: [0, f * FH, phone ? 4 : 2] }),
    roof:    { pos: [-80 * k, 44 * k, -44 * k], target: [-28, 17, 2] },
    parking: { pos: [62 * (phone ? 1.3 : 1), 82 * (phone ? 1.4 : 1), 20], target: [0, 0, 72] },
    street:  { pos: [62, 2.1, -40.6], target: [-30, 7, -27] },
  };
}

// ------------------------------------------------------------------
// UI
// ------------------------------------------------------------------
const ui = {
  hero: $('hero'), floorbar: $('floorbar'), parkingPanel: $('parkingPanel'), roofPanel: $('roofPanel'), streetPanel: $('streetPanel'),
  card: $('card'), pins: $('pins'), tip: $('hoverTip'), toast: $('toast'), cursor: $('fakeCursor'),
};
$('statShops').textContent = STATS.shops;

function toast(msg) {
  ui.toast.textContent = msg; ui.toast.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => (ui.toast.hidden = true), 2600);
}

function setTabs() {
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.view === state.view));
  document.querySelectorAll('.floors button').forEach((b) => {
    const f = b.dataset.floor;
    b.classList.toggle('on', (state.view === 'floor' && String(state.floor) === f) || (state.view === 'roof' && f === 'roof'));
  });
}

async function go(view, floor = null) {
  closeCard();
  state.view = view;
  const v = views();
  ui.hero.classList.toggle('away', view !== 'home');
  ui.floorbar.hidden = view !== 'floor';
  ui.parkingPanel.hidden = view !== 'parking';
  ui.roofPanel.hidden = view !== 'roof';
  ui.streetPanel.hidden = view !== 'street';
  controls.autoRotate = view === 'home';
  viewShiftTarget = view === 'home' ? (isPhone() ? 0.2 : innerWidth / innerHeight < 1.3 ? 0.1 : 0.17) : 0;
  setFilter(null);
  if (view === 'floor') {
    state.floor = floor ?? state.floor ?? 1;
    $('floorName').textContent = FLOORS[state.floor].name;
    $('floorTheme').textContent = FLOORS[state.floor].theme;
    cutTo(state.floor);
    setTabs();
    buildPins();
    await flyTo(v.floor(state.floor).pos, v.floor(state.floor).target, 1.6);
    return;
  }
  state.floor = null;
  cutTo(null);
  setTabs();
  buildPins();
  if (view === 'parking') showParking();
  const target = v[view];
  await flyTo(target.pos, target.target, view === 'street' ? 2.4 : 1.9);
}

// --- ピン（店舗番号・設備） ---
let pinItems = [];
function buildPins() {
  ui.pins.innerHTML = '';
  pinItems = [];
  const add = (pos, html, cls, onClick, data) => {
    const el = document.createElement('div');
    el.className = 'pin ' + cls;
    el.innerHTML = `<div class="pin-no">${html}</div>`;
    if (onClick) el.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
    ui.pins.appendChild(el);
    pinItems.push({ el, pos, data });
  };
  if (state.view === 'floor') {
    for (const s of SHOPS.filter((s) => s.floor === state.floor && s.cat !== 'gate')) {
      const c = shopCenter(s); c.y += 0.5;
      const el = add(c, s.cat === 'vacant' ? '空' : s.no, (s.sale ? 'sale ' : '') + (s.cat === 'vacant' ? 'vacant' : ''), () => openCard(s), { shop: s });
    }
    for (const fc of FACILITIES.filter((fc) => fc.floors.includes(state.floor))) {
      const icon = fc.type === 'elevator' ? '⇅' : fc.type === 'nursing' ? '🍼' : '♿';
      add(new THREE.Vector3(fc.x, state.floor * FH + 3.6, fc.z), icon, 'fac ' + fc.type + (fc.type === 'elevator' ? '' : ' hidden'), () => toast(fc.label + '（' + FLOORS[state.floor].name + '）'), { fac: fc });
    }
  }
  if (state.view === 'street') {
    add(new THREE.Vector3(0, 6.5, -HALF_Z - 3), '南口エントランス', 'spot', () => toast('南口：駅から徒歩3分・段差なし'));
    add(new THREE.Vector3(-26, 3.5, -40), 'バス停', 'spot', () => toast('バス停：駅⇔つむぎテラス 10分間隔'));
  }
  if (state.view === 'parking') {
    const b = parking.userData.best.s;
    add(new THREE.Vector3(b.x, 3, b.z), 'いちばん近い空き', 'spot', null);
    add(new THREE.Vector3(0, 5.5, HALF_Z + 3), '北口', 'spot', null);
  }
  if (state.view === 'roof') {
    add(new THREE.Vector3(-42, 22, 14), '芝生広場', 'spot', null);
    add(new THREE.Vector3(-6, 21, 20), '手ぶらBBQ', 'spot', null);
  }
  applyFilterToPins();
}

const v3 = new THREE.Vector3();
function updatePins() {
  const w = innerWidth, h = innerHeight;
  for (const p of pinItems) {
    v3.copy(p.pos);
    // フロアが持ち上がる途中も追従
    v3.project(camera);
    const vis = v3.z < 1 && Math.abs(v3.x) < 1.2 && Math.abs(v3.y) < 1.2;
    p.el.style.transform = `translate(${(v3.x * 0.5 + 0.5) * w}px, ${(-v3.y * 0.5 + 0.5) * h}px) translate(-50%, -50%)`;
    p.el.style.visibility = vis ? 'visible' : 'hidden';
  }
}

function setFilter(f) {
  state.filter = state.filter === f ? null : f;
  document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c.dataset.filter === state.filter));
  applyFilterToPins();
  for (const [s, vis] of shopVisuals) {
    let k = vis.base;
    if (state.filter === 'sale') k = s.sale ? 0.55 : 0.04;
    if (state.filter === 'vacant') k = s.cat === 'vacant' ? 0.6 : 0.04;
    vis.target = k;
  }
}
function applyFilterToPins() {
  for (const p of pinItems) {
    const s = p.data?.shop, fc = p.data?.fac;
    let dim = false, hidden = false;
    if (s && state.filter === 'sale') dim = !s.sale;
    if (s && state.filter === 'vacant') dim = s.cat !== 'vacant';
    if (s && (state.filter === 'nursing' || state.filter === 'toilet')) dim = true;
    if (fc && fc.type !== 'elevator') hidden = state.filter !== fc.type;
    p.el.classList.toggle('dim', dim);
    p.el.classList.toggle('hidden', hidden);
    if (s) p.el.classList.toggle('hot', state.hover === s || state.selected === s);
  }
}

// --- 店舗カード ---
function openCard(s) {
  if (s.cat === 'gate') return;
  state.selected = s;
  clearRoute();
  const cat = CATEGORY[s.cat];
  $('cardImg').src = s.img ? `img/${s.img}.jpg` : '';
  $('cardImg').alt = s.name + 'のイメージ写真';
  const badge = $('cardBadge');
  badge.hidden = !(s.sale || s.isNew || s.cat === 'vacant');
  badge.className = 'badge' + (s.cat === 'vacant' ? ' lease' : s.isNew ? ' new' : '');
  badge.textContent = s.cat === 'vacant' ? 'テナント募集中' : s.sale ? 'SALE 開催中' : 'NEW OPEN';
  $('cardMeta').textContent = `${FLOORS[s.floor].name} ・ ${s.no} ・ ${cat.label}`;
  $('cardName').textContent = s.name;
  $('cardDesc').textContent = s.desc;
  const facts = s.cat === 'vacant'
    ? [['面積', `${s.area}m²`], ['賃料目安', s.rent], ['前を通る人', s.traffic], ['引き渡し', '即日可（スケルトン）']]
    : [['営業時間', s.hours], ['フロア', `${FLOORS[s.floor].name} ${FLOORS[s.floor].theme}`], ['ベビーカー', '入店OK'], ['支払い', 'カード・QR決済']];
  $('cardFacts').innerHTML = facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  $('routeBtn').textContent = s.cat === 'vacant' ? '内見を予約する' : 'ベビーカーで行くルート';
  $('cardSub').textContent = s.cat === 'vacant' ? '区画図をダウンロード' : 'お店の詳細';
  $('routeSteps').hidden = true;
  ui.card.hidden = false;
  ui.card.style.animation = 'none'; void ui.card.offsetWidth; ui.card.style.animation = '';
  applyFilterToPins();
}
function closeCard() { ui.card.hidden = true; state.selected = null; clearRoute(); applyFilterToPins(); }
function showRoute() {
  const s = state.selected; if (!s) return;
  if (s.cat === 'vacant') { toast('内見のご予約を受け付けました（デモ）'); return; }
  const steps = routeTo(s);
  const ol = $('routeSteps');
  ol.innerHTML = steps.map((t) => `<li><span>${t}</span></li>`).join('');
  ol.hidden = false;
}

function showParking() {
  const { free, total } = parking.userData.stats;
  $('parkTotal').textContent = `/ ${total}台`;
  const el = $('parkFree');
  const meter = $('parkMeter');
  meter.style.width = '0%';
  tween(1.4, (t) => { el.textContent = Math.round(free * t); });
  setTimeout(() => (meter.style.width = `${(free / total) * 100}%`), 60);
}

// --- ホバー・クリック ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
function pickAt(x, y) {
  if (state.view !== 'floor') return null;
  mouse.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(pickables.filter((p) => p.userData.shop.floor === state.floor), false);
  return hits.length ? hits[0].object.userData.shop : null;
}
function setHover(s, x, y) {
  state.hover = s && s.cat !== 'gate' ? s : null;
  canvas.style.cursor = state.hover ? 'pointer' : '';
  if (!state.hover) { ui.tip.hidden = true; applyFilterToPins(); return; }
  const cat = CATEGORY[s.cat];
  ui.tip.innerHTML = `<span class="t-no">${s.cat === 'vacant' ? '空' : s.no}</span><span class="t-name">${s.name}</span><span class="t-cat"><i class="t-bar" style="background:${cat.color}"></i>${cat.label}${s.sale ? '・SALE' : ''}</span>`;
  ui.tip.style.left = x + 'px'; ui.tip.style.top = y + 'px';
  ui.tip.hidden = false;
  applyFilterToPins();
}
canvas.addEventListener('pointermove', (e) => { if (!CAPTURE) setHover(pickAt(e.clientX, e.clientY), e.clientX, e.clientY); });
let downAt = null;
canvas.addEventListener('pointerdown', (e) => (downAt = [e.clientX, e.clientY]));
canvas.addEventListener('pointerup', (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
  const s = pickAt(e.clientX, e.clientY);
  if (s) openCard(s);
});

document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); go(b.dataset.view); }));
document.querySelectorAll('[data-floor]').forEach((b) => b.addEventListener('click', () => (b.dataset.floor === 'roof' ? go('roof') : go('floor', Number(b.dataset.floor)))));
document.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => setFilter(c.dataset.filter)));
document.querySelectorAll('[data-spot]').forEach((b) => b.addEventListener('click', () => {
  const spot = b.dataset.spot;
  document.querySelectorAll('[data-spot]').forEach((x) => x.classList.toggle('on', x === b));
  const p = { gate: [[14, 3.2, -46], [0, 5, -30]], bus: [[-8, 2.4, -44], [-30, 3, -38]], taxi: [[16, 2.4, 44], [0, 3, 32]] }[spot];
  flyTo(p[0], p[1], 1.6);
}));
$('cardClose').addEventListener('click', closeCard);
$('routeBtn').addEventListener('click', showRoute);
$('cardSub').addEventListener('click', () => toast(state.selected?.cat === 'vacant' ? '区画図（PDF）はデモのため準備中です' : 'お店の詳細ページはデモのため準備中です'));
$('leasingBtn').addEventListener('click', async () => { await go('floor', 0); setFilter('vacant'); toast('空き区画が光っています。クリックで条件を確認'); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCard(); });

// ------------------------------------------------------------------
// ループ
// ------------------------------------------------------------------
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.fov = w < h ? 50 : 38;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);

function step(dt) {
  state.t += dt;
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i];
    tw.t += dt;
    const k = Math.min(1, tw.t / tw.dur);
    tw.fn(tw.ease(k));
    if (k >= 1) { tweens.splice(i, 1); tw.res(); }
  }
  for (const car of movingCars) {
    car.position.x += car.userData.dir * car.userData.speed * dt;
    if (car.position.x > 260) car.position.x = -260;
    if (car.position.x < -260) car.position.x = 260;
  }
  const train = world.userData.train;
  train.position.x += 28 * dt; if (train.position.x > 520) train.position.x = -640;
  // 店舗床の明るさ（フィルター）
  for (const [, vis] of shopVisuals) {
    const target = vis.target ?? vis.base;
    vis.floorMat.emissiveIntensity += (target - vis.floorMat.emissiveIntensity) * Math.min(1, dt * 6);
  }
  // 駐車場マーカー
  const marks = parking.userData.marks;
  const want = state.view === 'parking' ? 0.85 : 0;
  marks.material.opacity += (want - marks.material.opacity) * Math.min(1, dt * 3);
  parking.userData.nearMark.material.opacity = state.view === 'parking' ? 0.6 + Math.sin(state.t * 5) * 0.35 : 0;
  // ルートのアニメーション
  if (routeCurve) {
    routeProgress = Math.min(1, routeProgress + dt / 1.6);
    const { tube, core } = routeGroup.userData;
    const n = tube.geometry.index.count;
    const draw = Math.floor(n * routeProgress / 6) * 6;
    tube.geometry.setDrawRange(0, draw); core.geometry.setDrawRange(0, draw);
    routeTex.offset.x -= dt * 1.4;
    const u = routeProgress < 1 ? routeProgress : (state.t * 0.22) % 1;
    const p = routeCurve.getPointAt(u);
    routeDot.position.copy(p); routeHalo.position.copy(p);
  }
  viewShift += (viewShiftTarget - viewShift) * Math.min(1, dt * 2.5);
  if (Math.abs(viewShift) > 0.0005) camera.setViewOffset(innerWidth, innerHeight, isPhone() ? 0 : -innerWidth * viewShift, isPhone() ? innerHeight * viewShift : 0, innerWidth, innerHeight); else camera.clearViewOffset();
  controls.update(dt);
  updatePins();
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  step(dt);
  composer.render();
  requestAnimationFrame(frame);
}

// ------------------------------------------------------------------
// デモ（自動操作）と録画用API
// ------------------------------------------------------------------
const cursor = { x: 0, y: 0 };
function moveCursor(x, y) { cursor.x = x; cursor.y = y; ui.cursor.style.transform = `translate(${x - 4}px, ${y - 2}px)`; }
function elCenter(sel) { const r = document.querySelector(sel).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
function shopScreen(no) { const s = SHOPS.find((s) => s.no === no); const c = shopCenter(s); c.y += 0.5; c.project(camera); return [(c.x * 0.5 + 0.5) * innerWidth, (-c.y * 0.5 + 0.5) * innerHeight + 18]; }
const wait = (sec) => new Promise((res) => tweens.push({ t: 0, dur: sec, fn: () => {}, ease: (t) => t, res }));
async function glide(to, dur = 0.7) {
  const from = [cursor.x, cursor.y];
  await tween(dur, (t) => moveCursor(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t), (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
}
async function click() { ui.cursor.classList.add('click'); await wait(0.12); ui.cursor.classList.remove('click'); }
async function hoverShop(no, dur = 0.6) {
  await glide(shopScreen(no), dur);
  const s = SHOPS.find((s) => s.no === no);
  setHover(s, cursor.x, cursor.y);
}
async function demo() {
  ui.cursor.hidden = false;
  moveCursor(innerWidth * 0.62, innerHeight * 0.55);
  await wait(1.6);
  await glide(elCenter('.floors [data-floor="1"]'), 0.8); await click();
  go('floor', 1);
  await wait(1.9);
  await hoverShop('202', 0.6); await wait(0.45);
  await hoverShop('205', 0.55); await wait(0.5);
  await click(); setHover(null); openCard(SHOPS.find((s) => s.no === '205'));
  await wait(0.9);
  await glide(elCenter('#routeBtn'), 0.6); await click(); showRoute();
  await wait(2.4);
  await glide(elCenter('.tabs [data-view="roof"]'), 0.8); await click();
  go('roof');
  await wait(2.6);
  await glide(elCenter('.tabs [data-view="parking"]'), 0.6); await click();
  go('parking');
  await wait(2.8);
  await glide(elCenter('.tabs [data-view="street"]'), 0.6); await click();
  go('street');
  await wait(3.4);
  await glide(elCenter('.brand'), 0.7); await click();
  go('home');
  await glide([innerWidth * 0.62, innerHeight * 0.55], 1.2);
  await wait(1.4);
  window.__demoDone = true;
}

async function init() {
  try { await Promise.race([Promise.all([document.fonts.load('700 40px "Zen Kaku Gothic New"'), document.fonts.load('900 40px "Zen Kaku Gothic New"'), document.fonts.load('600 40px "Outfit"')]), new Promise((r) => setTimeout(r, 2500))]); } catch (e) { /* フォントが読めなくても続行 */ }
  for (const f of FLOORS) buildFloor(f.id);
  roofGroup = buildRoof();
  resize();
  setTabs();
  controls.autoRotate = true;
  viewShift = viewShiftTarget = isPhone() ? 0.2 : innerWidth / innerHeight < 1.3 ? 0.1 : 0.17;
  const v = views().home;
  camera.position.set(...v.pos); controls.target.set(...v.target);
  $('loader').classList.add('done');
  if (CAPTURE) $('loader').hidden = true;
  if (CAPTURE) {
    controls.enabled = false;
    window.__step = (ms) => {
      for (const a of document.getAnimations()) { if (a.playState !== 'finished') { a.pause(); a.currentTime = (a.currentTime ?? 0) + ms; } }
      step(ms / 1000); composer.render();
    };
    window.__startDemo = () => demo();
    window.__ready = true;
    return;
  }
  requestAnimationFrame((t) => { last = t; frame(t); });
  if (DEMO) demo();
}
init();
