import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { SHOPS, FLOORS, FACILITIES, CATEGORY, STATS, SPOTS, FACILITY_INFO } from './data.js';

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
const LITE = (innerWidth < 760 && !CAPTURE) || params.has('lite');      // スマホは軽量設定
renderer.shadowMap.enabled = !params.has('noshadow');
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.42, 0.55, 0.86);
composer.addPass(bloom);
const TiltShiftShader = {
  uniforms: { tDiffuse: { value: null }, amount: { value: 0 }, focus: { value: 0.5 }, res: { value: new THREE.Vector2(innerWidth, innerHeight) }, sat: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float amount; uniform float focus; uniform vec2 res; uniform float sat; varying vec2 vUv;
    void main(){
      float d = abs(vUv.y - focus);
      float b = smoothstep(0.10, 0.46, d) * amount;
      vec3 c = vec3(0.0); float tw = 0.0;
      float rot = fract(sin(dot(vUv * res, vec2(12.9898, 78.233))) * 43758.5453) * 6.2831;
      for (int i = 0; i < 40; i++) {
        float fi = float(i);
        float r = sqrt((fi + 0.5) / 40.0) * 3.2;
        float a = fi * 2.39996 + rot;
        float w = 1.0 - r / 4.2;
        c += texture2D(tDiffuse, vUv + vec2(cos(a), sin(a)) * r * b / res).rgb * w; tw += w;
      }
      c /= tw;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, sat);
      gl_FragColor = vec4(c, 1.0);
    }`,
};
const tilt = new ShaderPass(TiltShiftShader);
if (!params.has('notilt')) composer.addPass(tilt);
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
const skyDayTex = canvasTex(4, 512, (g, w, h) => {
  const grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, '#3f7fd0'); grd.addColorStop(0.5, '#8fbdea'); grd.addColorStop(0.85, '#d5e6f5'); grd.addColorStop(1, '#eef3f6');
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

const cityDayTex = canvasTex(256, 512, (g, w, h) => {
  g.fillStyle = '#c9cfd6'; g.fillRect(0, 0, w, h);
  for (let y = 6; y < h; y += 14) for (let x = 6; x < w; x += 12) { g.fillStyle = rand() < 0.5 ? '#7f97b3' : '#95abc4'; g.fillRect(x, y, 7, 9); }
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
const texLoader = new THREE.TextureLoader();
const texCache = {};
function sharedTex(file, srgb) {
  if (!texCache[file]) {
    const t = texLoader.load(file);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    texCache[file] = t;
  }
  return texCache[file];
}
// 実写テクスチャ（Poly Haven）。tile = 1枚ぶんの実寸
const wetMats = [];
function pbr(name, tile, { wet = false, ...opts } = {}) {
  const m = std({ map: sharedTex(`tex/${name}_diff.jpg`, true), roughnessMap: sharedTex(`tex/${name}_rough.jpg`, false), roughness: 1, ...opts });
  if (!LITE) m.normalMap = sharedTex(`tex/${name}_nor.jpg`, false);
  m.userData.tile = tile;
  if (wet) wetMats.push(m);
  return m;
}
function scaleBoxUV(geo, w, h, d, tile) {
  const uv = geo.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dims[f][0] / tile, uv.getY(i) * dims[f][1] / tile); }
}
function box(w, h, d, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  if (mat.userData && mat.userData.tile) scaleBoxUV(m.geometry, w, h, d, mat.userData.tile);
  m.position.set(x, y, z);
  parent && parent.add(m);
  return m;
}
function plane(w, d, mat, x, y, z, parent) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  if (mat.userData && mat.userData.tile) { const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / mat.userData.tile, uv.getY(i) * d / mat.userData.tile); }
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, y, z);
  parent && parent.add(m);
  return m;
}
const glowMats = [];   // 夜の光だまり（昼は消す）
const winMats = [];    // 窓（昼は控えめに光らせる）
function glowPool(color, size, x, y, z, parent, opacity = 0.5) {
  const mat = new THREE.MeshBasicMaterial({ map: glowTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const m = plane(size, size, mat, x, y, z, parent);
  mat.userData.glow = opacity; glowMats.push(mat);
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

// ---- 外部モデル・環境光の読み込み（失敗しても簡易版で続行）
const gltfLoader = new GLTFLoader();
async function loadModel(name) { try { return await gltfLoader.loadAsync(`models/${name}.glb`); } catch (e) { console.warn('model skipped', name); return null; } }
// 先に建物を表示し、モデルは読めた順に後から足す（最初の待ち時間を短くする）
let carGltf = null, carLoGltf = null, lampGltf = null, benchGltf = null, planterGltf = null, plantGltf = null, tableGltf = null, binGltf = null;
let personGltfs = [];
const env = { night: null, day: null };
const jobs = {}, jobsReady = {};
function defer(tag, fn) { if (jobsReady[tag]) fn(); else (jobs[tag] ||= []).push(fn); }
function runJobs(tag) { jobsReady[tag] = true; for (const fn of jobs[tag] || []) fn(); jobs[tag] = []; }
function loadEnv(file, key) {
  if (params.has('noenv')) return Promise.resolve();
  return new RGBELoader().loadAsync(file).then((tex) => {
    const pm = new THREE.PMREMGenerator(renderer);
    env[key] = pm.fromEquirectangular(tex).texture; tex.dispose(); pm.dispose();
    applyAtmosphere();
  }).catch(() => {});
}
let dayEnvAsked = false;
function loadLater() {
  return Promise.all([
    loadEnv('tex/night.hdr', 'night'),
    loadModel('car').then((g) => { carGltf = g; if (g) g.scene.traverse((o) => { if (o.isMesh) cheapGlass(o.material); }); runJobs('car'); }),
    Promise.all(['street_lamp_01', 'modular_street_seating', 'planter_box_01', 'potted_plant_04', 'outdoor_table_chair_set_01', 'metal_trash_can'].map(loadModel))
      .then((m) => { [lampGltf, benchGltf, planterGltf, plantGltf, tableGltf, binGltf] = m; runJobs('props'); }),
    Promise.all(['p1', 'p2', 'p3', 'p4', 'p5'].map(loadModel)).then((m) => { personGltfs = m.filter((g) => g && g.animations.length); runJobs('people'); }),
    LITE ? null : loadModel('car-lo').then((g) => { carLoGltf = g; if (g) g.scene.traverse((o) => { if (o.isMesh) cheapGlass(o.material); }); runJobs('carlo'); }),
  ]);
}
// モデルを同じ形のまま大量に置く（InstancedMesh）
// 透過ガラスは画面全体を二重に描くので、軽い半透明に置き換える
function cheapGlass(mat) {
  if (mat.transmission > 0) { mat.transmission = 0; mat.transparent = true; mat.opacity = 0.45; mat.color.set(0x0c1118); mat.roughness = 0.08; mat.metalness = 0.6; mat.depthWrite = false; }
  mat.iridescence = 0;
  return mat;
}
function scatter(gltf, placements, parent, { scale = 1, tintPaint = false } = {}) {
  if (!gltf || !placements.length) return [];
  gltf.scene.updateMatrixWorld(true);
  const out = [], o = new THREE.Object3D(), m4 = new THREE.Matrix4();
  gltf.scene.traverse((node) => {
    if (!node.isMesh) return;
    const mat = node.material.clone();
    const paint = tintPaint && /^Paint/.test(node.material.name);
    if (tintPaint) {
      const n = node.material.name || '';
      mat.emissive.set(0x000000); mat.emissiveIntensity = 0; mat.envMapIntensity = 0.7;
      if (paint) { mat.color.set(0xffffff); mat.metalness = 0.45; mat.roughness = 0.38; }
      else if (/^Tire/.test(n) || n === '') { mat.color.set(0x121212); mat.metalness = 0; mat.roughness = 0.9; }
      else if (/^Rim/.test(n)) { mat.color.set(0x8f9298); mat.metalness = 0.7; mat.roughness = 0.45; }
      else if (n === 'Headlight') { mat.color.set(0xcfd3d8); mat.metalness = 0.2; mat.roughness = 0.3; }
      else if (n === 'Brakelight') { mat.color.set(0x5a1010); mat.metalness = 0.1; mat.roughness = 0.4; }
    }
    const im = new THREE.InstancedMesh(node.geometry, mat, placements.length);
    placements.forEach((p, i) => {
      o.position.set(p.x, p.y || 0, p.z); o.rotation.set(0, p.ry || 0, 0); o.scale.setScalar((p.s || 1) * scale); o.updateMatrix();
      m4.multiplyMatrices(o.matrix, node.matrixWorld); im.setMatrixAt(i, m4);
      if (paint) im.setColorAt(i, new THREE.Color(p.color ?? 0xffffff));
    });
    im.castShadow = im.receiveShadow = !tintPaint;
    im.userData.noShadow = tintPaint;
    parent.add(im); out.push(im);
  });
  return out;
}

const hemi = new THREE.HemisphereLight(0x8ea4d8, 0x1a140e, 0.4);
scene.add(hemi);
const moon = new THREE.DirectionalLight(0xaac4ff, 1.15);
moon.position.set(-110, 170, -90);
moon.castShadow = true;
moon.shadow.mapSize.set(LITE ? 1024 : 2048, LITE ? 1024 : 2048);
Object.assign(moon.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, near: 20, far: 520 });
moon.shadow.bias = -0.0004; moon.shadow.normalBias = 0.35;
scene.add(moon);
const warm = new THREE.DirectionalLight(0xffb36b, 0.25);
warm.position.set(80, 40, -120);
scene.add(warm);

const groundMat = pbr('concrete_pavers', 6, { color: 0x1a1c20 });
plane(2400, 2400, groundMat, 0, -0.02, 0, world);
// 歩道（建物の周り）
plane(150, 90, pbr('large_floor_tiles_02', 5, { color: 0x8d8d92, wet: true }), 0, 0.0, -2, world);
// 道路（南側）
const ROAD_Z = -48;
const roadMat = pbr('asphalt_02', 9, { color: 0x6a6c72 });
const roadPlane = plane(900, 16, roadMat, 0, 0.012, ROAD_Z, world);
plane(2400, 16, std({ color: 0x15171b, roughness: 0.9 }), 0, 0.002, ROAD_Z, world);
// 雨のときだけ見える、濡れた路面の映り込み
let wetMirror = null;
if (!LITE) {
  wetMirror = new Reflector(new THREE.PlaneGeometry(520, 16), { textureWidth: 1024, textureHeight: 512, color: 0x8a8f99, clipBias: 0.003 });
  wetMirror.rotation.x = -Math.PI / 2; wetMirror.position.set(0, 0.006, ROAD_Z); wetMirror.visible = false;
  world.add(wetMirror);
}
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
plane(900, 6, pbr('large_floor_tiles_02', 5, { color: 0x77777c }), 0, 0.02, ROAD_Z - 11, world);

// 街路樹と街灯
const treeTrunkGeo = new THREE.CylinderGeometry(0.18, 0.25, 2.6, 6);
const treeTopGeo = new THREE.IcosahedronGeometry(1.5, 2);
const trunkMat = std({ color: 0x3b2a1e });
const leafMat = pbr('leafy_grass', 3, { color: 0x4f8a48 });
function tree(x, z, s = 1, parent = world, y = 0) {
  const g = new THREE.Group();
  const t = new THREE.Mesh(treeTrunkGeo, trunkMat); t.position.y = 1.3; g.add(t);
  for (const [lx, ly, lz, ls] of [[0, 3.9, 0, 1.05], [0.9, 3.3, 0.3, 0.8], [-0.8, 3.4, -0.4, 0.85], [0.1, 3.2, -0.9, 0.75], [-0.2, 3.3, 0.9, 0.78], [0.2, 4.7, 0.1, 0.7]]) {
    const l = new THREE.Mesh(treeTopGeo, leafMat); l.position.set(lx, ly, lz); l.scale.set(ls, ls * 0.92, ls); g.add(l);
  }
  g.position.set(x, y, z); g.scale.setScalar(s); g.rotation.y = rand() * 6;
  parent.add(g);
  return g;
}
const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff1d6, toneMapped: false });
const poleMat = std({ color: 0x2b2e35, metalness: 0.6, roughness: 0.4 });
const lampSpots = new Map();
function lamp(x, z, h = 6.5, parent = world, dir = 1) {
  const arm = 0.55;
  if (!lampSpots.has(parent)) lampSpots.set(parent, []);
  lampSpots.get(parent).push({ x, z, ry: dir > 0 ? -Math.PI / 2 : Math.PI / 2, s: h / 3.87 });
  box(0.42, 0.12, 0.42, lampMat, x, h - 0.28, z + arm * dir, parent);
  glowPool(0xffd9a0, 10, x, 0.05, z + arm * dir, parent, 0.2);
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
  const adTex = texLoader.load('img/s305.jpg'); adTex.colorSpace = THREE.SRGBColorSpace;
  box(1.6, 2.2, 0.15, std({ color: 0x111111, emissive: 0xffffff, emissiveMap: adTex, emissiveIntensity: 0.8 }), 2.4, 1.4, 0.95, sh);
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
  world.userData.cityMat = mat;
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
  city.userData.noShadow = true;
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
function carModel(color, lights) {
  {
    const m = carGltf.scene.clone(true);
    m.rotation.y = Math.PI / 2;
    const paint = new Map();
    m.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      const n = o.material.name || '';
      if (/^Paint/.test(n)) {
        if (!paint.has(n)) { const c = o.material.clone(); c.color.set(color); if (/Paint 2/.test(n)) c.color.multiplyScalar(0.55); paint.set(n, c); }
        o.material = paint.get(n);
      } else if (lights && n === 'Headlight') { o.material = o.material.clone(); o.material.emissive.set(0xfff4dd); o.material.emissiveIntensity = 4; }
      else if (lights && n === 'Brakelight') { o.material = o.material.clone(); o.material.emissive.set(0xff1a1a); o.material.emissiveIntensity = 3; }
    });
    return m;
  }
}
function makeCar(color, lights = true) {
  const g = new THREE.Group();
  // 仮の車（モデルが届いたら差し替える）
  const fb = new THREE.Group(); g.add(fb);
  const body = std({ color, metalness: 0.55, roughness: 0.32 });
  box(4.4, 0.75, 1.85, body, 0, 0.72, 0, fb);
  box(2.5, 0.65, 1.62, carGlass, -0.25, 1.38, 0, fb);
  box(2.3, 0.08, 1.5, body, -0.25, 1.72, 0, fb);
  for (const [x, z] of [[1.4, 0.88], [1.4, -0.88], [-1.4, 0.88], [-1.4, -0.88]]) {
    const w = new THREE.Mesh(wheelGeo, tireMat); w.position.set(x, 0.36, z); fb.add(w);
  }
  if (lights) {
    box(0.06, 0.16, 0.42, headMat, 2.21, 0.85, 0.62, fb);
    box(0.06, 0.16, 0.42, headMat, 2.21, 0.85, -0.62, fb);
    box(0.06, 0.14, 0.5, tailMat, -2.21, 0.88, 0.6, fb);
    box(0.06, 0.14, 0.5, tailMat, -2.21, 0.88, -0.6, fb);
  }
  defer('car', () => { if (!carGltf) return; g.remove(fb); g.add(carModel(color, lights)); });
  if (lights) {
    const beam = glowPool(0xfff3d8, 9, 6.4, 0.04, 0, g, 0.42); beam.scale.set(1.5, 0.75, 1);
    glowPool(0xff3020, 3.5, -3.1, 0.04, 0, g, 0.35);
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
plane(LOT.x1 - LOT.x0 + 8, LOT.z1 - LOT.z0 + 6, pbr('asphalt_02', 9, { color: 0x5c5e64, wet: true }), 0, 0.012, (LOT.z0 + LOT.z1) / 2, parking);
plane(150, 10, pbr('large_floor_tiles_02', 5, { color: 0x8d8d92, wet: true }), 0, 0.011, 35, parking); // 北口の歩道
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
  for (const s of busy) { s.color = carColors[Math.floor(rand() * carColors.length)]; s.jit = (rand() - 0.5) * 0.06; }
  {
    const bodyGeo = new THREE.BoxGeometry(4.3, 0.8, 1.85); bodyGeo.translate(0, 0.72, 0);
    const cabGeo = new THREE.BoxGeometry(2.4, 0.62, 1.6); cabGeo.translate(-0.2, 1.4, 0);
    const bodies = new THREE.InstancedMesh(bodyGeo, std({ metalness: 0.5, roughness: 0.35 }), busy.length);
    const cabs = new THREE.InstancedMesh(cabGeo, carGlass, busy.length);
    busy.forEach((s, i) => {
      o.position.set(s.x, 0, s.z); o.rotation.y = Math.PI / 2 * s.facing + s.jit; o.updateMatrix();
      bodies.setMatrixAt(i, o.matrix); cabs.setMatrixAt(i, o.matrix);
      bodies.setColorAt(i, new THREE.Color(s.color));
    });
    o.rotation.y = 0;
    bodies.castShadow = cabs.castShadow = true;
    parking.add(bodies, cabs);
    defer('carlo', () => {
      if (!carLoGltf) return;
      parking.remove(bodies, cabs);
      scatter(carLoGltf, busy.map((s) => ({ x: s.x, z: s.z, ry: (s.facing > 0 ? 0 : Math.PI) + s.jit, color: s.color })), parking, { tintPaint: true });
    });
  }
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
// ------------------------------------------------------------------
// 歩く人
// ------------------------------------------------------------------
const walkers = [];
const SHIRTS = [0xf2f0ea, 0x2f4a7a, 0x9c2f34, 0x3e6b4a, 0xe0b24a, 0x1f2126, 0xcfd8e6, 0x7a5aa0, 0xd98a5a, 0x5fa3b8, 0xf0c9d2, 0x8a8f99];
const PANTS = [0x23262d, 0x2c3a55, 0x4a4033, 0x6b6f78, 0xb9a98c, 0x1b2b3c, 0x3a3a3a];
const HAIRS = [0x15110f, 0x2a1c14, 0x3b2a1c, 0x5a4030, 0x1c1c1c, 0x8a8a8a];
const SKINS = [0xf0cfb0, 0xe8bf9a, 0xd9a982, 0xf3d6bd];
const pick = (a) => a[Math.floor(rand() * a.length)];
const STRIDE = 1.45;      // 歩きアニメ1周で進む距離（足がすべらない速さに合わせる）
// 通路の「道」を内側/外側に平行移動して、ひとりずつ自分のレーンを歩かせる
function offsetLoop(pts, off) {
  const n = pts.length;
  return pts.map((p, i) => {
    const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    const d1 = new THREE.Vector2(p[0] - a[0], p[1] - a[1]).normalize(), d2 = new THREE.Vector2(b[0] - p[0], b[1] - p[1]).normalize();
    return new THREE.Vector2(p[0] + (d1.y + d2.y) * off, p[1] - (d1.x + d2.x) * off);
  });
}
function addWalkers(parent, pts, n, { y = 0, speed = 1.25, lateral = 0.6 } = {}) {
  if (!personGltfs.length) return;
  if (LITE) n = Math.ceil(n / 3);
  for (let i = 0; i < n; i++) {
    const src = pick(personGltfs);
    const body = SkeletonUtils.clone(src.scene);
    const cols = { Shirt: pick(SHIRTS), Pants: pick(PANTS), Hair: pick(HAIRS), Skin: pick(SKINS), Black: pick([0x1f2126, 0x2c3a55, 0x4a4a52]) };
    const own = new Map();
    body.traverse((o) => {
      if (!o.isMesh) return;
      const name = o.material.name;
      if (!own.has(name)) { const m = o.material.clone(); m.side = THREE.FrontSide; m.roughness = 0.85; m.metalness = 0; if (cols[name] !== undefined) m.color.set(cols[name]); own.set(name, m); }
      o.material = own.get(name);
      o.castShadow = true; o.frustumCulled = false;
    });
    body.scale.multiplyScalar(0.5 + rand() * 0.045);
    const holder = new THREE.Group(); holder.add(body); parent.add(holder);
    const mixer = new THREE.AnimationMixer(body);
    mixer.clipAction(src.animations.find((a) => a.name === 'Walk') || src.animations[0]).play();
    mixer.setTime(rand());
    const off = (rand() - 0.5) * 2 * lateral;
    const route = offsetLoop(rand() < 0.5 ? pts : [...pts].reverse(), off);
    const segs = route.map((a, k) => a.distanceTo(route[(k + 1) % route.length]));
    const total = segs.reduce((a, b) => a + b, 0);
    const w = { holder, mixer, route, segs, total, dist: rand() * total, speed: speed * (0.85 + rand() * 0.3), y, parent, yaw: null };
    walkers.push(w); placeWalker(w, 1);
  }
}
function placeWalker(w, dt) {
  let d = w.dist % w.total, k = 0;
  while (d > w.segs[k]) { d -= w.segs[k]; k = (k + 1) % w.segs.length; }
  const n = w.route.length, a = w.route[k], b = w.route[(k + 1) % n], c = w.route[(k + 2) % n];
  let dx = (b.x - a.x) / w.segs[k], dz = (b.y - a.y) / w.segs[k];
  let px = a.x + dx * d, pz = a.y + dz * d;
  // 角は丸く曲がる（急に向きが変わらないように）
  const R = Math.min(1.6, w.segs[k] / 2, w.segs[(k + 1) % n] / 2), rest = w.segs[k] - d;
  if (rest < R) {
    const nx = (c.x - b.x) / w.segs[(k + 1) % n], nz = (c.y - b.y) / w.segs[(k + 1) % n];
    const t = 0.5 * (1 - rest / R);                 // 0 → 0.5
    const qx = b.x - dx * R, qz = b.y - dz * R, rx = b.x + nx * R, rz = b.y + nz * R, u = t;
    px = (1 - u) * (1 - u) * qx + 2 * u * (1 - u) * b.x + u * u * rx;
    pz = (1 - u) * (1 - u) * qz + 2 * u * (1 - u) * b.y + u * u * rz;
    dx = dx * (1 - t) + nx * t; dz = dz * (1 - t) + nz * t;
  } else if (d < R) {
    const p = w.route[(k + n - 1) % n], pl = w.segs[(k + n - 1) % n];
    const ox = (a.x - p.x) / pl, oz = (a.y - p.y) / pl;
    const u = 0.5 + 0.5 * (d / R);                  // 0.5 → 1
    const qx = a.x - ox * R, qz = a.y - oz * R, rx = a.x + dx * R, rz = a.y + dz * R;
    px = (1 - u) * (1 - u) * qx + 2 * u * (1 - u) * a.x + u * u * rx;
    pz = (1 - u) * (1 - u) * qz + 2 * u * (1 - u) * a.y + u * u * rz;
    const t = 1 - u; dx = dx * (1 - t) + ox * t; dz = dz * (1 - t) + oz * t;
  }
  w.holder.position.set(px, w.y, pz);
  const want = Math.atan2(dx, dz);
  if (w.yaw === null) w.yaw = want;
  let diff = want - w.yaw; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  w.yaw += diff * Math.min(1, dt * 8);
  w.holder.rotation.y = w.yaw;
}
function updateWalkers(dt) {
  for (const w of walkers) {
    if (!w.parent.visible) continue;
    w.dist += w.speed * dt;
    placeWalker(w, dt);
    w.mixer.update(dt * w.speed / STRIDE);
  }
}

// ---- 街のベンチ・プランター・ごみ箱・街灯（Poly Haven）
defer('props', () => {
for (const [parent, spots] of lampSpots) scatter(lampGltf, spots, parent);
scatter(benchGltf, [-54, -38, -22, 22, 38, 54].map((x) => ({ x, z: -33.2, ry: Math.PI })), world);
scatter(planterGltf, [-14, -11.5, 11.5, 14, -46, -30, 30, 46].map((x) => ({ x, z: -31.4, s: 2.6 })), world);
scatter(plantGltf, [-14, -11.5, 11.5, 14, -46, -30, 30, 46].map((x) => ({ x, y: 1.0, z: -31.4, ry: rand() * 6, s: 6 })), world);
scatter(binGltf, [-18, 18, -60, 60].map((x) => ({ x, z: -32.6, ry: Math.PI })), world);
});
defer('people', () => {
addWalkers(world, [[-120, -34.5], [120, -34.5], [120, -36.2], [-120, -36.2]], 22, { lateral: 0.4 });
addWalkers(world, [[-90, ROAD_Z - 11.3], [90, ROAD_Z - 11.3], [90, ROAD_Z - 12.8], [-90, ROAD_Z - 12.8]], 8, { lateral: 0.3 });
addWalkers(world, [[-7, -31.6], [7, -31.6], [7, -33.4], [-7, -33.4]], 4, { lateral: 0.3, speed: 0.9 });
addWalkers(parking, [[-50, 33.6], [50, 33.6], [50, 37.6], [-50, 37.6]], 6, { lateral: 0.5 });
});

// ------------------------------------------------------------------
// 雨・ミニチュア風の切り替え
// ------------------------------------------------------------------
const fx = { mini: true, rain: false, day: false };
const RAIN_N = LITE ? 1400 : 5000;
const rainPos = new Float32Array(RAIN_N * 6);
const rainSeed = new Float32Array(RAIN_N * 3);
for (let i = 0; i < RAIN_N * 3; i++) rainSeed[i] = rand();
const rainGeo = new THREE.BufferGeometry();
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xb9cdf0, transparent: true, opacity: 0.32, depthWrite: false }));
rain.frustumCulled = false; rain.visible = false;
scene.add(rain);
function updateRain(t) {
  const c = controls.target, R = 150, H = 90;
  for (let i = 0; i < RAIN_N; i++) {
    const x = c.x + (rainSeed[i * 3] - 0.5) * R * 2, z = c.z + (rainSeed[i * 3 + 2] - 0.5) * R * 2;
    const y = H - ((rainSeed[i * 3 + 1] * H + t * (52 + rainSeed[i * 3] * 18)) % H);
    rainPos.set([x, y, z, x + 0.25, y + 1.6, z], i * 6);
  }
  rainGeo.attributes.position.needsUpdate = true;
}
const lampBase = new THREE.Color(0xfff1d6);
function applyAtmosphere() {
  const day = fx.day, wet = fx.rain;
  scene.background = day ? skyDayTex : skyTex;
  scene.fog.color.set(day ? (wet ? 0x9aa6b3 : 0xc2d6ea) : 0x0b1020);
  scene.fog.density = day ? (wet ? 0.0036 : 0.0011) : (wet ? 0.0058 : 0.0042);
  scene.environment = day ? (env.day || env.night) : env.night;
  scene.environmentIntensity = day ? (wet ? 0.55 : 0.8) : (wet ? 0.34 : 0.22);
  hemi.color.set(day ? 0xdbe9ff : 0x8ea4d8); hemi.groundColor.set(day ? 0x8a8275 : 0x1a140e); hemi.intensity = day ? (wet ? 0.9 : 1.1) : 0.4;
  moon.color.set(day ? 0xfff0dc : 0xaac4ff); moon.intensity = day ? (wet ? 0.9 : 3.0) : 1.15;
  warm.intensity = day ? 0 : 0.25;
  renderer.toneMappingExposure = day ? 0.92 : 1.05;
  bloom.strength = day ? 0.1 : 0.42;
  groundMat.color.set(day ? 0x7c8388 : 0x1a1c20);
  const k = day ? 0.04 : 1;
  for (const m of glowMats) { m.opacity = m.userData.glow * k; if (m.userData.base !== undefined) m.userData.base = m.opacity; }
  for (const m of winMats) m.emissiveIntensity = day ? 0.38 : 0.7;
  lampMat.color.copy(lampBase).multiplyScalar(day ? 0.55 : 1);
  const city = world.userData.cityMat;
  if (city) { city.map = day ? cityDayTex : cityTex; city.emissiveIntensity = day ? 0 : 0.55; city.color.set(day ? 0xffffff : 0x0b0d13); city.needsUpdate = true; }
  rain.material.color.set(day ? 0xe8eef6 : 0xb9cdf0);
}
function setRain(on) {
  fx.rain = on;
  rain.visible = on;
  if (wetMirror) { wetMirror.visible = on; roadMat.transparent = on; roadMat.opacity = on ? 0.55 : 1; roadMat.depthWrite = !on; roadMat.needsUpdate = true; }
  for (const m of wetMats) { m.roughness = on ? 0.28 : 1; m.metalness = on ? 0.35 : 0.05; }
  applyAtmosphere();
  document.querySelectorAll('[data-fx="rain"]').forEach((b) => b.classList.toggle('on', on));
}
function setDay(on) {
  fx.day = on;
  if (on && !dayEnvAsked) { dayEnvAsked = true; loadEnv('tex/day.hdr', 'day'); }
  applyAtmosphere();
  document.querySelectorAll('[data-fx="day"]').forEach((b) => { b.classList.toggle('on', on); b.textContent = on ? '昼' : '夜'; });
}
function setMini(on) { fx.mini = on; document.querySelectorAll('[data-fx="mini"]').forEach((b) => b.classList.toggle('on', on)); }

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
    corridor: pbr('large_floor_tiles_02', 4, { color: 0xf3ead9, emissive: 0xffe9c4, emissiveIntensity: 0.16 }),
    wall: pbr('dark_brick_wall', 2.6, { color: 0xd8b9a8 }),       // レンガの外壁
    band: std({ color: 0x1d1f24, metalness: 0.3, roughness: 0.6 }),
    partition: std({ color: 0xe9e4da, roughness: 0.95 }),
    glass: std({ color: 0x9ccaff, transparent: true, opacity: 0.16, metalness: 0.2, roughness: 0.1, depthWrite: false }),
    fixture: std({ color: 0xf2efe8 }),
    stone: std({ color: 0x8d877c }),
    window: std({ color: 0x2a1c12, emissive: 0xffffff, emissiveMap: windowTex.clone(), emissiveIntensity: 1.0, map: windowTex }),
    rail: new THREE.MeshBasicMaterial({ color: 0xfff3dc, toneMapped: false }),
  };

  // 床スラブ
  if (f === 0) box(HALF_X * 2, 0.5, HALF_Z * 2, mats.slab, 0, y - 0.25, 0, g);
  else for (const [x0, x1, z0, z1] of rectsAround(-HALF_X, HALF_X, -HALF_Z, HALF_Z, VOID)) box(x1 - x0, 0.5, z1 - z0, mats.slab, (x0 + x1) / 2, y - 0.25, (z0 + z1) / 2, g);

  // 通路の床
  const corRects = f === 0 ? [[-44, 44, -COR, COR]] : rectsAround(-44, 44, -COR, COR, VOID);
  for (const [x0, x1, z0, z1] of corRects) {
    const m = plane(x1 - x0, z1 - z0, mats.corridor, (x0 + x1) / 2, y + 0.01, (z0 + z1) / 2, g);
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
    else floorMat = pbr('wood_floor_deck', 5, { color: new THREE.Color(0xe0b48a).lerp(tint, 0.18), emissive: new THREE.Color(0xffc98a).lerp(tint, 0.25), emissiveIntensity: 0.3, roughness: 0.75 });
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

  // 通路の鉢植え・ベンチ・歩く人
  const pots = [];
  for (let i = 0; i <= 5; i++) for (const z of [-6.25, 6.25]) pots.push({ x: -44 + 17.6 * i + (i === 0 ? 0.8 : i === 5 ? -0.8 : 0), y, z, ry: rand() * 6, s: 6.5 });
  defer('props', () => { scatter(plantGltf, pots, g); if (f === 0) scatter(benchGltf, [-24, 0, 24].map((x) => ({ x, y, z: 0, ry: 0 })), g); });
  const loop = f === 0 ? [[-42.6, -4.4], [42.6, -4.4], [42.6, 4.4], [-42.6, 4.4]] : [[-42.7, -5.1], [42.7, -5.1], [42.7, 5.1], [-42.7, 5.1]];
  defer('people', () => addWalkers(g, loop, f === 0 ? 14 : 10, { y, lateral: f === 0 ? 0.9 : 0.55 }));

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
    const winTex = texLoader.load(`img/win/f${f}_${'snwe'[sides.indexOf(sd)]}.jpg`);
    winTex.colorSpace = THREE.SRGBColorSpace; winTex.anisotropy = 8;
    const winMat = std({ color: 0x050505, emissive: 0xffffff, emissiveMap: winTex, emissiveIntensity: 0.7, roughness: 0.15, metalness: 0.1 });
    winMats.push(winMat);
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
    const gateTex = texLoader.load('img/s301.jpg'); gateTex.colorSpace = THREE.SRGBColorSpace;
    box(18, 4.4, 0.4, std({ color: 0x111111, emissive: 0xffffff, emissiveMap: gateTex, emissiveIntensity: 0.85, roughness: 0.15 }), 0, 2.4, -HALF_Z - 0.05, g);
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
  const slab = pbr('granite_tile', 5, { color: 0x8a8d96, wet: true });
  for (const [x0, x1, z0, z1] of rectsAround(-HALF_X, HALF_X, -HALF_Z, HALF_Z, VOID)) box(x1 - x0, 0.6, z1 - z0, slab, (x0 + x1) / 2, y - 0.3, (z0 + z1) / 2, g);
  // パラペット
  const par = pbr('dark_brick_wall', 2.6, { color: 0xd8b9a8 });
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
  const lawn = pbr('leafy_grass', 7, { color: 0x86d86a, emissive: 0x2c5a22, emissiveIntensity: 0.3 });
  const deckMat = pbr('wood_floor_deck', 4, { color: 0xd9b38c, emissive: 0x3a2210, emissiveIntensity: 0.2 });
  plane(26, 20, lawn, -42, y + 0.02, 14, g);
  plane(26, 20, lawn, -42, y + 0.02, -14, g);
  plane(8, 48, deckMat, -24, y + 0.03, 0, g);
  plane(22, 10, deckMat, -6, y + 0.03, 20, g);
  plane(22, 10, deckMat, -6, y + 0.03, -20, g);
  for (const [x, z] of [[-52, 22], [-34, 22], [-52, -22], [-34, -22], [-44, 4], [-44, -4], [-28, 26], [-28, -26]]) tree(x, z, 0.9, g, y);
  // BBQのテーブル
  const tblSpots = [];
  for (let k = 0; k < 8; k++) tblSpots.push({ x: -14 + (k % 4) * 5.2, y, z: k < 4 ? 20 : -20, ry: rand() * 6, s: 1.5 });
  defer('props', () => { scatter(tableGltf, tblSpots, g); scatter(benchGltf, [-18, -6, 6, 18].map((z) => ({ x: -27.2, y, z, ry: Math.PI / 2 })), g); });
  defer('people', () => {
    addWalkers(g, [[-25.3, -22], [-22.3, -22], [-22.3, 22], [-25.3, 22]], 5, { y, lateral: 0.4 });
    addWalkers(g, [[-17.5, 16.6], [4.5, 16.6], [4.5, 23.4], [-17.5, 23.4]], 3, { y, speed: 0.8, lateral: 0.2 });
  });
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
    street:  { pos: [68, 2.3, -41.6], target: [-30, 6, -29] },
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
      add(new THREE.Vector3(fc.x, state.floor * FH + 3.6, fc.z), icon, 'fac ' + fc.type + (fc.type === 'elevator' ? '' : ' hidden'), () => openFacility(fc), { fac: fc });
    }
  }
  for (const sp of SPOTS.filter((sp) => sp.view === state.view)) {
    const b = parking.userData.best.s;
    const pos = sp.pin ? new THREE.Vector3(...sp.pin) : new THREE.Vector3(b.x, 3, b.z);
    add(pos, sp.label, 'spot', () => openSpot(sp), { spot: sp });
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
  state.selected = s; state.spot = null;
  clearRoute();
  $('cardImg').parentElement.hidden = false;
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
$('cardImg').addEventListener('error', () => { $('cardImg').parentElement.hidden = true; });
function fillCard({ img, badge, badgeClass = 'new', meta, name, desc, facts, primary, secondary }) {
  clearRoute();
  $('cardImg').parentElement.hidden = !img;
  if (img) { $('cardImg').src = `img/${img}.jpg`; $('cardImg').alt = name + 'のイメージ'; }
  const b = $('cardBadge'); b.hidden = !badge; b.className = 'badge ' + badgeClass; b.textContent = badge || '';
  $('cardMeta').textContent = meta; $('cardName').textContent = name; $('cardDesc').textContent = desc;
  $('cardFacts').innerHTML = facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  $('routeBtn').textContent = primary; $('cardSub').textContent = secondary;
  $('routeSteps').hidden = true;
  ui.card.hidden = false;
  ui.card.style.animation = 'none'; void ui.card.offsetWidth; ui.card.style.animation = '';
}
function openSpot(sp) {
  state.selected = null; state.spot = sp;
  const label = sp.action.type === 'route' ? 'ベビーカーで行くルート' : sp.action.type === 'walk' ? '北口までの道を見る' : sp.action.label;
  fillCard({ img: 'spot_' + sp.id, badge: sp.badge, meta: sp.meta, name: sp.name, desc: sp.desc, facts: sp.facts, primary: label, secondary: '全体に戻る' });
  const b = parking.userData.best.s;
  const cam = sp.cam || { pos: [b.x - 10, 8, b.z + 13], target: [b.x, 0.5, b.z] };
  const far = isPhone() ? 1.5 : 1;
  flyTo(cam.target.map((t, i) => t + (cam.pos[i] - t) * far), cam.target, 1.5);
  applyFilterToPins();
}
function openFacility(fc) {
  const info = FACILITY_INFO[fc.type];
  state.selected = null;
  state.spot = { id: 'fac', facility: fc, action: { type: 'route', x: fc.x, z: fc.z, floor: state.floor }, name: fc.label };
  fillCard({ img: info.img, meta: `${FLOORS[state.floor].name} ・ 設備`, name: fc.label, desc: info.desc, facts: info.facts, primary: 'ベビーカーで行くルート', secondary: 'カードを閉じる' });
}
function spotAction() {
  const sp = state.spot; if (!sp) return;
  const a = sp.action, ol = $('routeSteps');
  let steps = null;
  if (a.type === 'toast') { toast(a.msg); return; }
  if (a.type === 'walk') {
    const b = parking.userData.best.s, y = 0.6;
    buildRoute([new THREE.Vector3(b.x, y, b.z), new THREE.Vector3(b.x, y, b.z < 47 ? 41 : b.z - 2.8), new THREE.Vector3(b.x, y, 41), new THREE.Vector3(0, y, 36), new THREE.Vector3(0, y, 31)].filter((p, i, arr) => i === 0 || p.distanceTo(arr[i - 1]) > 0.1));
    steps = ['車を降りて、通路を<b>建物のほう</b>へ', '横断部分を渡って<b>北口</b>へ（段差なし）', '<b>北口エントランス</b>に到着（約1分）'];
  } else {
    steps = routeToPoint(a.x, a.z, a.floor ?? 3, sp.name);
  }
  ol.innerHTML = steps.map((t) => `<li><span>${t}</span></li>`).join('');
  ol.hidden = false;
}
// 南口 → エレベーター → 目的地（屋上・設備）
function routeToPoint(x, z, floor, name) {
  const y = (f) => f * FH + 0.6;
  const elevX = x < 0 ? -40 : 40, side = elevX < 0 ? 2.6 : -2.6;
  const pts = [new THREE.Vector3(0, y(0), -HALF_Z - 6), new THREE.Vector3(0, y(0), -4.4)];
  if (floor === 0) pts.push(new THREE.Vector3(x, y(0), -4.4), new THREE.Vector3(x, y(0), z));
  else {
    pts.push(new THREE.Vector3(elevX + side, y(0), -4.4), new THREE.Vector3(elevX + side, y(0), 0), new THREE.Vector3(elevX, y(0), 0), new THREE.Vector3(elevX, y(floor), 0), new THREE.Vector3(elevX + side, y(floor), 0));
    const lane = floor === 3 ? z : (z > 0 ? 5.1 : -5.1);
    pts.push(new THREE.Vector3(elevX + side, y(floor), lane), new THREE.Vector3(x, y(floor), lane), new THREE.Vector3(x, y(floor), z));
  }
  buildRoute(pts.filter((p, i) => i === 0 || p.distanceTo(pts[i - 1]) > 0.05));
  const fname = floor === 3 ? '屋上' : FLOORS[floor].name;
  const elev = elevX < 0 ? 'エレベーター A' : 'エレベーター B';
  return floor === 0
    ? ['<b>南口</b>から入って通路へ', `段差なしで<b>${name}</b>に到着`]
    : ['<b>南口</b>から入って' + (elevX < 0 ? '<b>左</b>へ' : '<b>右</b>へ'), `<b>${elev}</b>で<b>${fname}</b>へ（ベビーカー優先）`, `降りて約${Math.round(Math.abs(x - elevX) + Math.abs(z))}m進むと<b>${name}</b>`];
}
function closeCard() { ui.card.hidden = true; state.selected = null; state.spot = null; clearRoute(); applyFilterToPins(); }
function showRoute() {
  if (state.spot) { spotAction(); return; }
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
document.querySelectorAll('[data-fx]').forEach((b) => b.addEventListener('click', () => (b.dataset.fx === 'rain' ? setRain(!fx.rain) : b.dataset.fx === 'day' ? setDay(!fx.day) : setMini(!fx.mini))));
document.querySelectorAll('[data-spot]').forEach((b) => b.addEventListener('click', async () => {
  const id = { gate: 'street_gate', bus: 'street_bus', taxi: 'park_taxi' }[b.dataset.spot];
  const sp = SPOTS.find((x) => x.id === id);
  if (sp.view !== state.view) await go(sp.view);
  openSpot(sp);
}));
$('cardClose').addEventListener('click', closeCard);
$('routeBtn').addEventListener('click', showRoute);
$('cardSub').addEventListener('click', () => {
  if (state.spot) {
    const fac = state.spot.id === 'fac';
    closeCard();
    if (!fac) { const v = views()[state.view]; if (v && v.pos) flyTo(v.pos, v.target, 1.4); }
    return;
  }
  toast(state.selected?.cat === 'vacant' ? '区画図（PDF）はデモのため準備中です' : 'お店の詳細ページはデモのため準備中です');
});
$('leasingBtn').addEventListener('click', async () => { await go('floor', 0); setFilter('vacant'); toast('空き区画が光っています。クリックで条件を確認'); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCard(); });

// ------------------------------------------------------------------
// ループ
// ------------------------------------------------------------------
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h);
  composer.setSize(w, h);
  tilt.uniforms.res.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
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
  updateWalkers(dt);
  if (fx.rain) updateRain(state.t);
  // ミニチュア風：注視点のあたりだけくっきり、上下をぼかす
  const wantBlur = fx.mini ? (state.view === 'street' ? 1.6 : 4.2) * (innerHeight / 1000) * renderer.getPixelRatio() : 0;
  tilt.uniforms.amount.value += (wantBlur - tilt.uniforms.amount.value) * Math.min(1, dt * 4);
  tilt.uniforms.sat.value += ((fx.mini ? 1.12 : 1) - tilt.uniforms.sat.value) * Math.min(1, dt * 4);
  v3.copy(controls.target).project(camera);
  const fy = THREE.MathUtils.clamp(v3.y * 0.5 + 0.5, 0.3, 0.7);
  tilt.uniforms.focus.value += (fy - tilt.uniforms.focus.value) * Math.min(1, dt * 4);
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

function pinCenter(label) {
  const el = [...document.querySelectorAll('.pin.spot')].find((p) => p.textContent.includes(label));
  const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2];
}
// 30秒のリール用：夜 → フロア → 屋上 → 昼 → ストリート（雨）→ 駐車場 → 夜に戻る
async function demoReel() {
  ui.cursor.hidden = false;
  moveCursor(innerWidth * 0.62, innerHeight * 0.55);
  await wait(1.3);
  await glide(elCenter('.floors [data-floor="1"]'), 0.6); await click();
  go('floor', 1);
  await wait(1.9);
  await hoverShop('202', 0.5); await wait(0.35);
  await hoverShop('205', 0.5); await wait(0.3);
  await click(); setHover(null); openCard(SHOPS.find((s) => s.no === '205'));
  await wait(0.7);
  await glide(elCenter('#routeBtn'), 0.45); await click(); showRoute();
  await wait(1.9);
  await glide(elCenter('.tabs [data-view="roof"]'), 0.6); await click();
  go('roof');
  await wait(2.3);
  await glide(pinCenter('手ぶらBBQ'), 0.6); await click(); openSpot(SPOTS.find((x) => x.id === 'roof_bbq'));
  await wait(2.2);
  await glide(elCenter('[data-fx="day"]'), 0.6); await click(); setDay(true);
  await wait(1.9);
  await glide(elCenter('.tabs [data-view="street"]'), 0.6); await click();
  go('street');
  await wait(3.2);
  await glide(elCenter('[data-fx="rain"]'), 0.5); await click(); setRain(true);
  await wait(2.4);
  await glide(elCenter('.tabs [data-view="parking"]'), 0.55); await click();
  setRain(false); go('parking');
  await wait(2.5);
  await glide(pinCenter('いちばん近い空き'), 0.6); await click(); openSpot(SPOTS.find((x) => x.id === 'park_near'));
  await wait(1.5);
  await glide(elCenter('#routeBtn'), 0.45); await click(); showRoute();
  await wait(1.8);
  await glide(elCenter('[data-fx="day"]'), 0.6); await click(); setDay(false);
  await wait(0.5);
  await glide(elCenter('.brand'), 0.5); await click();
  go('home');
  await glide([innerWidth * 0.62, innerHeight * 0.55], 0.9);
  await wait(1.4);
  window.__demoDone = true;
}

async function demoShort() {
  ui.cursor.hidden = false;
  moveCursor(innerWidth * 0.62, innerHeight * 0.55);
  await wait(1.0);
  await glide(elCenter('.floors [data-floor="1"]'), 0.6); await click();
  go('floor', 1);
  await wait(1.8);
  await hoverShop('205', 0.5); await wait(0.3);
  await click(); setHover(null); openCard(SHOPS.find((s) => s.no === '205'));
  await wait(0.6);
  await glide(elCenter('#routeBtn'), 0.45); await click(); showRoute();
  await wait(1.7);
  await glide(elCenter('.tabs [data-view="street"]'), 0.55); await click();
  go('street');
  await wait(1.5);
  await glide(elCenter('[data-fx="rain"]'), 0.5); await click(); setRain(true);
  await wait(2.4);
  await glide(elCenter('.tabs [data-view="parking"]'), 0.5); await click();
  go('parking');
  await wait(2.0);
  await glide(elCenter('.brand'), 0.5); await click();
  setRain(false); go('home');
  await glide([innerWidth * 0.62, innerHeight * 0.55], 0.9);
  await wait(1.2);
  window.__demoDone = true;
}

async function init() {
  try { await Promise.race([Promise.all([document.fonts.load('700 40px "Zen Kaku Gothic New"'), document.fonts.load('900 40px "Zen Kaku Gothic New"'), document.fonts.load('600 40px "Outfit"')]), new Promise((r) => setTimeout(r, 1200))]); } catch (e) { /* フォントが読めなくても続行 */ }
  for (const f of FLOORS) buildFloor(f.id);
  roofGroup = buildRoof();
  scene.traverse((o) => {
    if (!o.isMesh || o.userData.noShadow || o === wetMirror) return;
    const m = o.material;
    if (m && m.isMeshStandardMaterial && !(m.transparent && m.opacity < 0.6)) { o.castShadow = true; o.receiveShadow = true; }
  });
  setMini(true);
  applyAtmosphere();
  resize();
  setTabs();
  controls.autoRotate = true;
  viewShift = viewShiftTarget = isPhone() ? 0.2 : innerWidth / innerHeight < 1.3 ? 0.1 : 0.17;
  const v = views().home;
  camera.position.set(...v.pos); controls.target.set(...v.target);
  const allLoaded = loadLater();
  if (CAPTURE) { await allLoaded; await loadEnv('tex/day.hdr', 'day'); dayEnvAsked = true; applyAtmosphere(); }
  $('loader').classList.add('done');
  if (CAPTURE) $('loader').hidden = true;
  if (CAPTURE) {
    controls.enabled = false;
    window.__step = (ms) => {
      for (const a of document.getAnimations()) { if (a.playState !== 'finished') { a.pause(); a.currentTime = (a.currentTime ?? 0) + ms; } }
      step(ms / 1000); composer.render();
    };
    window.__startDemo = () => (params.get('demo') === 'reel' ? demoReel() : params.get('demo') === 'short' ? demoShort() : demo());
    window.__dbg = { camera, controls, setRain, setMini, setDay, wetMirror, roadPlane, scene, best: parking.userData.best.s, SPOTS };
    window.__ready = true;
    return;
  }
  requestAnimationFrame((t) => { last = t; frame(t); });
  if (DEMO) (params.get('demo') === 'reel' ? demoReel() : params.get('demo') === 'short' ? demoShort() : demo());
}
init();
