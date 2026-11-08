import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { S } from './state.js';
import { mat, canvasTexture, drawLogo, roundRect, PALETTE } from './materials.js';
import { BREADS, Dough, Sack, Tongs, PriceTag, Person, Truck, Tree, House, Cloud, prism } from './models.jsx';

// ───────── 便利関数
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const _a = new THREE.Vector3();
function arc(out, a, b, t, h) {
  out.lerpVectors(a, b, t);
  out.y += Math.sin(Math.PI * clamp01(t)) * h;
  return out;
}
function piecewise(out, pts, t) {
  const i = Math.min(pts.length - 2, Math.max(0, Math.floor(t)));
  return out.lerpVectors(pts[i], pts[i + 1], clamp01(t - i));
}

// ───────── レイアウト（ワールド座標）
const PILE = [V(-10.1, 0, 2.5), V(-9.35, 0, 2.95), V(-9.85, 0, 3.45)];
const BED = [V(-0.95, 0.88, -0.3), V(-0.95, 0.88, 0.3), V(-0.25, 0.88, 0)];
const PANTRY = [V(1.8, 0, -4.35), V(2.5, 0, -4.45), V(2.15, 0, -3.75)];
const TRUCK_Z = 7.9;
const truckX = (t) => lerp(-11, -1.6, t);

const DOUGH_POS = V(3.8, 1.1, -2.8);
const TRAY = [V(5.6, 1.12, -2.6), V(10.5, 1.12, -2.2), V(10.5, 1.12, -4.0)];
const SLOTS = [[-0.62, -0.27], [0, -0.27], [0.62, -0.27], [-0.62, 0.27], [0, 0.27], [0.62, 0.27]].map(([x, z]) => V(x, 0.05, z));
const OVEN_BREADS = ['melonpan', 'croissant', 'bear', 'danish', 'kuppe', 'wiener'];
const TABLE_A = [[3.45, 1.15], [4.5, 1.15], [5.55, 1.15], [3.45, 2.05], [4.5, 2.05], [5.55, 2.05]].map(([x, z]) => V(x, 1.08, z));
const SHELF_BREADS = [
  { k: 'shokupan', p: V(8.6, 1.08, 0.95) },
  { k: 'butterToast', p: V(9.95, 1.08, 0.95) },
  { k: 'pretzel', p: V(8.6, 1.08, 1.75) },
  { k: 'baguette', p: V(9.95, 1.08, 1.75) },
];
const BAKER = [V(3.9, 0, -4.05), V(7.05, 0, 0.15), V(7.0, 0, 3.3)];
const CUSTOMERS = [
  { end: V(7.0, 0, 4.85), shirt: '#F28C8C', hair: '#3B2A20' },
  { end: V(5.3, 0, 5.35), shirt: '#7CC6E8', hair: '#6B4226' },
  { end: V(8.75, 0, 5.45), shirt: '#9AD38A', hair: '#2B2B2B' },
  { end: V(3.8, 0, 5.75), shirt: '#C7A4E8', hair: '#8A5A3C' },
];

const SKY = [new THREE.Color('#1F2B4F'), new THREE.Color('#F2A88E'), new THREE.Color('#BFE6F2')];
const SUN_COL = [new THREE.Color('#8DA2FF'), new THREE.Color('#FFB27A'), new THREE.Color('#FFF3DE')];
function tri(out, cols, t) {
  if (t < 0.5) return out.lerpColors(cols[0], cols[1], t * 2);
  return out.lerpColors(cols[1], cols[2], (t - 0.5) * 2);
}

export default function World() {
  const { camera, scene, size } = useThree();

  // 夜に光るマテリアル
  const glow = useMemo(() => ({
    window: new THREE.MeshStandardMaterial({ color: '#FFE9A8', emissive: '#FFC24A', emissiveIntensity: 1, flatShading: true }),
    lamp: new THREE.MeshStandardMaterial({ color: '#FFF4C9', emissive: '#FFD36B', emissiveIntensity: 1 }),
    head: new THREE.MeshStandardMaterial({ color: '#FFF7D6', emissive: '#FFE7A0', emissiveIntensity: 1 }),
    ovenIn: new THREE.MeshStandardMaterial({ color: '#5A2A18', emissive: '#FF6A1F', emissiveIntensity: 0, flatShading: true }),
    glass: new THREE.MeshStandardMaterial({ color: '#FFB46B', emissive: '#FF8A3D', emissiveIntensity: 0, transparent: true, opacity: 0.32, roughness: 0.1 }),
    stars: new THREE.PointsMaterial({ color: '#FFFFFF', size: 0.5, transparent: true, sizeAttenuation: true }),
    steam: new THREE.MeshStandardMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.55, flatShading: true, depthWrite: false }),
    sun: new THREE.MeshBasicMaterial({ color: '#FFD45E' }),
    moon: new THREE.MeshBasicMaterial({ color: '#FFF6D8' }),
  }), []);

  const tex = useMemo(() => ({
    logo: canvasTexture(1024, 300, (c, w, h) => drawLogo(c, w, h)),
    bigLogo: canvasTexture(1024, 300, (c, w, h) => drawLogo(c, w, h)),
    tag: canvasTexture(170, 100, (c, w, h) => {
      c.fillStyle = '#FFFDF7'; roundRect(c, 3, 3, w - 6, h - 6, 14); c.fill();
      c.strokeStyle = '#C8643A'; c.lineWidth = 5; c.stroke();
      c.fillStyle = '#C8643A'; c.textAlign = 'center';
      c.font = '800 48px "Playfair Display", serif'; c.fillText('500', w / 2 - 12, 66);
      c.font = '700 22px "Zen Maru Gothic", sans-serif'; c.fillText('円', w / 2 + 50, 66);
    }),
    open: canvasTexture(256, 128, (c, w, h) => {
      c.fillStyle = '#C8643A'; roundRect(c, 0, 0, w, h, 22); c.fill();
      c.fillStyle = '#FFF'; c.textAlign = 'center'; c.font = '800 70px "Playfair Display", serif'; c.fillText('OPEN', w / 2, 90);
    }),
    closed: canvasTexture(256, 128, (c, w, h) => {
      c.fillStyle = '#7A7A7A'; roundRect(c, 0, 0, w, h, 22); c.fill();
      c.fillStyle = '#EEE'; c.textAlign = 'center'; c.font = '700 54px "Playfair Display", serif'; c.fillText('CLOSED', w / 2, 84);
    }),
    shutter: canvasTexture(256, 256, (c, w, h) => {
      c.fillStyle = '#B9B9BE'; c.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 16) { c.fillStyle = '#9A9AA2'; c.fillRect(0, y, w, 4); c.fillStyle = '#D3D3D8'; c.fillRect(0, y + 4, w, 2); }
    }),
    tile: (() => {
      const t = canvasTexture(128, 128, (c, w, h) => {
        c.fillStyle = '#F4F7F5'; c.fillRect(0, 0, w, h);
        c.fillStyle = '#CFE3DD'; c.fillRect(0, 0, w / 2, h / 2); c.fillRect(w / 2, h / 2, w / 2, h / 2);
      });
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 4.5); t.magFilter = THREE.NearestFilter;
      return t;
    })(),
  }), []);
  const shutterMat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex.shutter, roughness: 0.5, metalness: 0.2 }), [tex]);
  const tileMat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex.tile, roughness: 0.6 }), [tex]);

  // ───────── 参照
  const r = useRef({}).current;
  const set = (k) => (el) => { r[k] = el; };
  const starsGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = [];
    for (let i = 0; i < 260; i++) {
      const a = Math.random() * Math.PI * 2;
      const e = 0.25 + Math.random() * 1.1;
      const d = 70 + Math.random() * 20;
      arr.push(Math.cos(a) * Math.cos(e) * d, Math.sin(e) * d, Math.sin(a) * Math.cos(e) * d);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    return g;
  }, []);

  // 影の設定
  useEffect(() => {
    scene.traverse((o) => {
      if (o.isMesh && !o.userData.noShadow && !(o.material && o.material.transparent)) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }, [scene]);

  // マウスでほんの少し視点が動く
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const tmp = useMemo(() => ({ cam: V(0, 0, 0), tgt: V(0, 0, 0), fc: V(0, 0, 0), ft: V(0, 0, 0), truck: V(0, 0, 0), tray: V(0, 0, 0), p: V(0, 0, 0), q: V(0, 0, 0), col: new THREE.Color() }), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const day = S.day;
    const night = 1 - clamp01(day * 1.6);

    // ── 空と光
    tri(tmp.col, SKY, day);
    scene.background = scene.background || new THREE.Color();
    scene.background.copy(tmp.col);
    if (r.sun) {
      tri(r.sun.color, SUN_COL, day);
      r.sun.intensity = lerp(0.7, 2.6, day);
      r.sun.position.set(lerp(-14, 16, day), 26, 14);
    }
    if (r.amb) r.amb.intensity = lerp(0.55, 0.95, day);
    if (r.hemi) r.hemi.intensity = lerp(0.35, 0.9, day);
    if (r.inside) r.inside.intensity = lerp(12, 17, clamp01(S.roof)) * (0.35 + 0.65 * night) + 2;
    glow.window.emissiveIntensity = 0.15 + night * 1.5;
    glow.lamp.emissiveIntensity = 0.1 + night * 2.2;
    glow.head.emissiveIntensity = night * 2.5;
    glow.stars.opacity = night;
    if (r.sunBall) { r.sunBall.visible = day > 0.4; r.sunBall.position.set(-34, lerp(-40, 30, day), -55); }
    if (r.moonBall) r.moonBall.position.set(30, lerp(30, -14, clamp01(day * 1.4)), -55);

    // ── 製粉所の風車・雲
    if (r.blades) r.blades.rotation.z = t * 0.7;
    if (r.clouds) r.clouds.children.forEach((c, i) => { c.position.x = ((c.userData.x + t * (0.25 + i * 0.05) + 40) % 80) - 40; });

    // ── トラック
    const tx = truckX(S.truck);
    tmp.truck.set(tx, 0, TRUCK_Z);
    if (r.truck) {
      r.truck.position.set(tx, Math.abs(Math.sin(t * 14)) * 0.03 * (S.truck > 0.001 && S.truck < 0.999 ? 1 : 0), TRUCK_Z);
      r.truck.children.forEach((c) => { if (c.name === 'wheel') c.rotation.z = -tx / 0.32; });
    }

    // ── 小麦粉の袋（製粉所 → 荷台 → キッチン）
    for (let i = 0; i < 3; i++) {
      const sack = r['sack' + i];
      if (!sack) continue;
      const load = S['load' + i];
      const unload = S['unload' + i];
      tmp.q.copy(BED[i]).add(tmp.truck);
      if (unload > 0) arc(tmp.p, tmp.q, PANTRY[i], unload, 6.5);
      else arc(tmp.p, PILE[i], tmp.q, load, 2.2);
      sack.position.copy(tmp.p);
      sack.rotation.y = (load + unload) * Math.PI * 2 + i;
    }

    // ── 屋根（ドールハウスのように持ち上がる）
    if (r.roof) {
      r.roof.position.set(0, S.roof * 9, -S.roof * 13);
      r.roof.rotation.x = -S.roof * 0.3;
    }

    // ── 生地づくり
    const knead = S.knead;
    const kActive = knead > 0.02 && knead < 4.98 ? 1 : 0;
    const squash = Math.abs(Math.sin(knead * Math.PI));
    if (r.pourSack) r.pourSack.rotation.z = -S.pour * 1.9;
    if (r.stream) {
      const on = S.pour > 0.55 && S.flour < 0.98;
      r.stream.scale.set(1, on ? 1 : 0.0001, 1);
    }
    if (r.pile) r.pile.scale.setScalar(Math.max(0.0001, S.flour * (1 - S.dough)));
    if (r.dough) {
      const s = Math.max(0.0001, S.dough * (1 - S.divide)) * 2.2;
      r.dough.scale.set(s * (1 + squash * 0.22), s * 0.8 * (1 - squash * 0.3), s * (1 + squash * 0.12));
    }
    if (r.pin) {
      const v = Math.max(0.0001, clamp01(knead * 3) * (1 - clamp01(S.divide * 2)));
      r.pin.scale.setScalar(v);
      r.pin.position.set(DOUGH_POS.x, 1.42 - squash * 0.12, DOUGH_POS.z + Math.sin(knead * Math.PI * 2) * 0.22);
      r.pin.rotation.x = knead * 6;
    }
    if (r.flourFx) {
      const f = (knead * 2) % 1;
      r.flourFx.children.forEach((m, i) => {
        const a = (i / r.flourFx.children.length) * Math.PI * 2;
        const d = 0.45 + f * 0.7;
        m.position.set(DOUGH_POS.x + Math.cos(a) * d, DOUGH_POS.y + 0.2 + f * 0.6 + (i % 3) * 0.08, DOUGH_POS.z + Math.sin(a) * d * 0.7);
        m.scale.setScalar(Math.max(0.0001, (1 - f) * kActive + (S.pour > 0.5 && S.flour < 1 ? 0.6 : 0)) * 0.6);
      });
    }

    // ── 天板の位置
    piecewise(tmp.tray, TRAY, S.tray);
    if (S.tray < 1) tmp.tray.y += Math.sin(Math.PI * S.tray) * 0.9;
    if (r.tray) r.tray.position.copy(tmp.tray);

    // ── 分けた生地 → ふくらむ → パンになる → 売り場へ
    for (let i = 0; i < 6; i++) {
      const d = r['dough' + i];
      const b = r['bread' + i];
      const ti = clamp01(S.divide * 1.7 - i * 0.12);
      tmp.q.copy(SLOTS[i]).add(tmp.tray);
      if (d) {
        arc(tmp.p, DOUGH_POS, tmp.q, ti, 0.9);
        d.position.copy(tmp.p);
        const wobble = 1 + Math.sin(t * 6 + i) * 0.04 * S.rise * (1 - clamp01(S.bake));
        const s = Math.min(1, ti * 4) * (1 + S.rise * 0.8) * clamp01(1 - S.bake * 1.4) * wobble;
        d.scale.setScalar(Math.max(0.0001, s));
      }
      if (b) {
        const hop = S['hop' + i];
        arc(tmp.p, tmp.q, TABLE_A[i], hop, 3.2);
        b.position.copy(tmp.p);
        const s = Math.max(0, S.bake) * lerp(0.72, 1, hop);
        b.scale.setScalar(Math.max(0.0001, s));
        b.rotation.y = hop * Math.PI * 2;
      }
    }
    // キラキラ
    if (r.sparkle) {
      const k = Math.sin(Math.PI * clamp01(S.bake)) + Math.sin(Math.PI * clamp01(S.tags)) * 0.6;
      r.sparkle.position.copy(S.tags > 0.01 ? V(6.5, 1.6, 1.4) : tmp.tray);
      r.sparkle.children.forEach((m, i) => {
        const a = t * 1.5 + (i / 8) * Math.PI * 2;
        const rad = S.tags > 0.01 ? 3.2 : 1.4;
        m.position.set(Math.cos(a) * rad, 0.6 + Math.sin(t * 3 + i) * 0.25, Math.sin(a) * rad * 0.6);
        m.rotation.set(t * 2, t * 3, 0);
        m.scale.setScalar(Math.max(0.0001, k * 0.12));
      });
    }
    for (let i = 0; i < 4; i++) {
      const b = r['shelf' + i];
      if (b) b.scale.setScalar(Math.max(0.0001, S['shelf' + i]));
    }
    for (let i = 0; i < 10; i++) {
      const g = r['tag' + i];
      if (g) g.scale.setScalar(Math.max(0.0001, clamp01(S.tags * 1.6 - i * 0.06)));
    }
    if (r.tongs) r.tongs.scale.setScalar(Math.max(0.0001, S.tongs));

    // ── オーブン
    if (r.door) r.door.rotation.x = S.door * 1.45;
    glow.ovenIn.emissiveIntensity = S.heat * 1.6 + Math.sin(t * 9) * 0.08 * S.heat;
    glow.glass.emissiveIntensity = S.heat * 1.2;
    if (r.ovenLight) r.ovenLight.intensity = S.heat * 10;
    if (r.steam) {
      const base = S.hop0 > 0.5 ? V(4.5, 1.2, 1.6) : tmp.tray;
      r.steam.children.forEach((m, i) => {
        const f = (t * 0.45 + i / r.steam.children.length) % 1;
        m.position.set(base.x + Math.sin(i * 2.1 + t) * 0.5, base.y + 0.4 + f * 1.8, base.z + Math.cos(i * 1.7) * 0.3);
        m.scale.setScalar(Math.max(0.0001, S.steam * (0.07 + f * 0.17) * (1 - f * 0.8)));
      });
    }
    if (r.smoke) {
      r.smoke.children.forEach((m, i) => {
        const f = (t * 0.25 + i / r.smoke.children.length) % 1;
        m.position.set(11.4 + f * 1.4 + Math.sin(t + i) * 0.2, 7.2 + f * 3.2, -4.5 - f * 0.6);
        m.scale.setScalar((0.2 + f * 0.5) * (0.4 + S.heat * 0.6) * (1 - f * 0.6));
      });
    }

    // ── パン職人
    if (r.baker) {
      piecewise(tmp.p, BAKER, S.baker);
      const moving = Math.abs(S.baker - Math.round(S.baker)) > 0.02;
      r.baker.position.set(tmp.p.x, moving ? Math.abs(Math.sin(t * 9)) * 0.08 : 0, tmp.p.z);
      const armL = r.baker.getObjectByName('armL');
      const armR = r.baker.getObjectByName('armR');
      let ax = -0.15 + Math.sin(t * 2) * 0.05;
      let bx = ax;
      if (S.baker < 0.2 && kActive) {
        ax = -1.0 - Math.sin(knead * Math.PI * 2) * 0.35;
        bx = -1.0 + Math.sin(knead * Math.PI * 2) * 0.35;
      } else if (S.baker < 0.2 && (S.divide > 0.02 && S.divide < 0.98)) {
        ax = bx = -1.1;
      } else if (S.baker > 1.6) {
        ax = bx = lerp(-0.2, -1.3, clamp01((S.baker - 1.6) * 3) * (1 - S.bag * 0.6));
      } else if (S.baker > 0.9 && S.baker < 1.1) {
        ax = -0.2 - Math.abs(Math.sin(t * 3)) * 0.4; // 手を振る
        bx = -0.15;
      }
      if (armL) armL.rotation.x = ax;
      if (armR) armR.rotation.x = bx;
    }

    // ── 開店（シャッター・オーニング・看板）
    if (r.shutter) {
      const s = S.shutter;
      r.shutter.scale.y = Math.max(0.02, 1 - s);
      r.shutter.position.y = 3.2 - 1.6 * (1 - s);
    }
    if (r.awning) r.awning.scale.z = 0.15 + 0.85 * S.awning;
    if (r.awning) r.awning.rotation.x = lerp(1.2, 0.38, S.awning);
    if (r.openSign) r.openSign.rotation.y = Math.PI * (1 - S.sign) + Math.sin(t * 2) * 0.04;

    // ── お客さん
    CUSTOMERS.forEach((c, i) => {
      const p = r['cust' + i];
      if (!p) return;
      const w = clamp01(S.walk * 1.3 - i * 0.1);
      const start = V(-20 - i * 1.6, 0, c.end.z);
      tmp.p.lerpVectors(start, c.end, w);
      const moving = w > 0.001 && w < 0.999;
      p.position.set(tmp.p.x, moving ? Math.abs(Math.sin(t * 9 + i)) * 0.07 : 0, tmp.p.z);
      p.rotation.y = lerp(Math.PI / 2, Math.PI, clamp01((w - 0.85) / 0.15));
      p.scale.setScalar(S.walk > 0.005 ? 1 : 0.0001);
      const legL = p.getObjectByName('legL');
      const legR = p.getObjectByName('legR');
      const sw = moving ? Math.sin(t * 9 + i) * 0.5 : 0;
      if (legL) legL.rotation.x = sw;
      if (legR) legR.rotation.x = -sw;
      const armR = p.getObjectByName('armR');
      if (armR) armR.rotation.x = i === 0 ? -1.2 * clamp01(S.bag * 2) * (1 - clamp01((S.bag - 0.8) * 5) * 0.5) : sw * 0.6;
      const armL = p.getObjectByName('armL');
      if (armL) armL.rotation.x = -sw * 0.6;
    });
    if (r.bag) {
      const from = V(0, 0.75, 0.55).add(r.baker ? r.baker.position : V());
      const to = V(0.2, 0.62, 0.5).add(r.cust0 ? r.cust0.position : V());
      to.z = (r.cust0 ? r.cust0.position.z : 0) - 0.5;
      arc(tmp.p, from, to, S.bag, 0.4);
      r.bag.position.copy(tmp.p);
      r.bag.scale.setScalar(Math.max(0.0001, clamp01((S.baker - 1.7) * 4)));
    }

    // ── ロゴ（フィナーレ）
    if (r.bigLogo) {
      r.bigLogo.scale.setScalar(Math.max(0.0001, S.logo));
      r.bigLogo.quaternion.copy(camera.quaternion);
      r.bigLogo.position.y = 11 + Math.sin(t * 1.2) * 0.25;
    }

    // ── カメラ
    tmp.cam.set(S.cx, S.cy, S.cz);
    tmp.tgt.set(S.tx, S.ty, S.tz);
    const ang = (S.orbit - 1) * 0.35;
    if (ang !== 0) {
      _a.subVectors(tmp.cam, tmp.tgt).applyAxisAngle(V(0, 1, 0), ang);
      tmp.cam.copy(tmp.tgt).add(_a);
    }
    if (S.follow > 0) {
      tmp.fc.set(tx + 5.5, 5.2, TRUCK_Z + 7.5);
      tmp.ft.set(tx + 1.2, 0.9, TRUCK_Z - 1);
      tmp.cam.lerp(tmp.fc, S.follow);
      tmp.tgt.lerp(tmp.ft, S.follow);
    }
    const aspect = size.width / size.height;
    const k = aspect < 1 ? 1 + (1 - aspect) * 1.25 : 1;
    _a.subVectors(tmp.cam, tmp.tgt).multiplyScalar(k);
    tmp.cam.copy(tmp.tgt).add(_a);
    const pt = pointer.current;
    pt.sx += (pt.x - pt.sx) * Math.min(1, dt * 3);
    pt.sy += (pt.y - pt.sy) * Math.min(1, dt * 3);
    tmp.cam.x += pt.sx * 0.6;
    tmp.cam.y -= pt.sy * 0.35;
    camera.position.copy(tmp.cam);
    camera.lookAt(tmp.tgt);
    // スマホ縦向きは下にカードが出るので、被写体を少し上に寄せる
    const shift = aspect < 1 ? Math.round(size.height * 0.12) : 0;
    if (camera.userData.shift !== shift) {
      camera.userData.shift = shift;
      if (shift) camera.setViewOffset(size.width, size.height, 0, shift, size.width, size.height);
      else camera.clearViewOffset();
    }
  });

  const houses = [
    [-20.5, '#F7C9C9', '#C8643A'], [-16.5, '#CDE8F6', '#6E8FB3'], [-7.8, '#FFE9A8', '#C8643A'], [-3.6, '#D9EFD0', '#7A9E6B'],
    [0.8, '#F6D9F0', '#B77AA8'], [5.2, '#FFF0D6', '#A6A6A6'], [9.6, '#CDE8F6', '#C8643A'], [14, '#FFE0C2', '#D08A4E'],
    [18.2, '#E4DAF7', '#8C7AB8'], [21.8, '#FFE9A8', '#A6A6A6'],
  ];
  const trees = [
    [-21, -3.5, 1.1], [-18.5, 1, 0.9], [-15.5, -4.5, 1], [-6.6, -4.5, 0.85], [-19, 10.8, 1], [-10, 11, 0.85], [-2.5, 10.6, 1.1],
    [5.5, 11, 0.9], [12.5, 10.7, 1], [19.5, 10.8, 1.05], [16, -2.5, 1.1], [19.8, 0.5, 0.95], [21.3, -4.2, 1], [16.5, 2.4, 0.8], [-21.5, 5, 0.9],
  ];

  return (
    <>
      {/* 光 */}
      <ambientLight ref={set('amb')} intensity={0.6} />
      <hemisphereLight ref={set('hemi')} args={['#FFF6E0', '#9FC48A', 0.5]} />
      <directionalLight ref={set('sun')} position={[-10, 26, 14]} castShadow
        shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02}
        shadow-camera-left={-28} shadow-camera-right={28} shadow-camera-top={22} shadow-camera-bottom={-22} shadow-camera-far={80} />
      <pointLight ref={set('inside')} position={[7, 3.6, -0.5]} color="#FFD9A0" intensity={10} distance={16} decay={1.6} />
      <pointLight ref={set('ovenLight')} position={[10.5, 1.6, -3.8]} color="#FF7A2E" intensity={0} distance={7} decay={1.6} />

      <points geometry={starsGeo} material={glow.stars} />
      <mesh ref={set('sunBall')} material={glow.sun}><icosahedronGeometry args={[4, 1]} /></mesh>
      <mesh ref={set('moonBall')} material={glow.moon}><icosahedronGeometry args={[2.6, 1]} /></mesh>
      <group ref={set('clouds')}>
        {[[-20, 13, -16, 1.4], [-4, 15, -20, 1.8], [10, 12.5, -14, 1.2], [24, 14, -18, 1.6], [34, 12, -10, 1.1]].map(([x, y, z, s], i) => (
          <group key={i} position={[x, y, z]} scale={s} userData={{ x }}><Cloud /></group>
        ))}
      </group>

      {/* 島（ミニチュアの台座） */}
      <mesh material={mat('#B8DC8A')} position={[0, -0.15, 0.5]}><boxGeometry args={[47, 0.3, 24]} /></mesh>
      <mesh material={mat('#D7A46D')} position={[0, -1.3, 0.5]}><boxGeometry args={[46.4, 2, 23.4]} /></mesh>
      <mesh material={mat('#B98656')} position={[0, -2.5, 0.5]}><boxGeometry args={[45.4, 0.5, 22.4]} /></mesh>
      {/* 歩道と道路 */}
      <mesh material={mat('#F1E6D2')} position={[0, 0.06, 5.25]}><boxGeometry args={[47, 0.12, 2.3]} /></mesh>
      <mesh material={mat('#E0D2BA')} position={[0, 0.1, 6.45]}><boxGeometry args={[47, 0.16, 0.2]} /></mesh>
      <mesh material={mat('#80838F')} position={[0, 0.03, 7.9]}><boxGeometry args={[47, 0.06, 2.8]} /></mesh>
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={i} material={mat(PALETTE.yellow)} position={[-22 + i * 3, 0.07, 7.9]}><boxGeometry args={[1.3, 0.02, 0.12]} /></mesh>
      ))}
      {/* 街灯 */}
      {[-6, 0, 14.6].map((x) => (
        <group key={x} position={[x, 0, 6.1]}>
          <mesh material={mat('#5A5A66')} position={[0, 1.5, 0]}><cylinderGeometry args={[0.06, 0.08, 3, 6]} /></mesh>
          <mesh material={glow.lamp} position={[0, 3.1, 0]} userData={{ noShadow: true }}><icosahedronGeometry args={[0.25, 0]} /></mesh>
          <mesh material={mat('#5A5A66')} position={[0, 3.38, 0]}><coneGeometry args={[0.3, 0.22, 6]} /></mesh>
        </group>
      ))}

      {/* 奥の町並み */}
      {houses.map(([x, wall, roof], i) => (
        <House key={i} position={[x, 0, -8.6]} wall={wall} roof={roof} windowMat={glow.window} h={2 + (i % 3) * 0.5} />
      ))}
      {trees.map(([x, z, s], i) => (
        <Tree key={i} position={[x, 0, z]} s={s} c={i % 3 === 0 ? '#8CCB72' : i % 3 === 1 ? '#6FB861' : '#A5D47A'} />
      ))}
      {/* 花壇 */}
      {[[-3, 4.4], [15.5, 4.4], [17.5, 4.4]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh material={mat('#C98B55')} position={[0, 0.2, 0]}><boxGeometry args={[1.4, 0.4, 0.5]} /></mesh>
          {[-0.45, -0.15, 0.15, 0.45].map((fx, j) => (
            <mesh key={j} material={mat(['#F28C8C', '#FFDF5E', '#FFFFFF', '#C7A4E8'][(j + i) % 4])} position={[fx, 0.5, 0]}>
              <icosahedronGeometry args={[0.13, 0]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ───── 製粉所（風車） */}
      <group position={[-12.5, 0, -1.5]}>
        <mesh material={mat('#FFF3DC')} position={[0, 2.5, 0]}><cylinderGeometry args={[1.05, 1.55, 5, 8]} /></mesh>
        <mesh material={mat(PALETTE.terracotta)} position={[0, 5.75, 0]}><coneGeometry args={[1.35, 1.6, 8]} /></mesh>
        <mesh material={mat('#8A5A3C')} position={[0, 0.65, 1.42]} rotation={[-0.1, 0, 0]}><boxGeometry args={[0.8, 1.3, 0.1]} /></mesh>
        <mesh material={glow.window} position={[0, 3.2, 1.23]} rotation={[-0.1, 0, 0]}><boxGeometry args={[0.5, 0.6, 0.08]} /></mesh>
        <group ref={set('blades')} position={[0, 4.7, 1.35]}>
          <mesh material={mat('#7A5A3C')}><cylinderGeometry args={[0.18, 0.18, 0.3, 6]} /></mesh>
          {[0, 1, 2, 3].map((i) => (
            <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
              <mesh material={mat('#8A6A4C')} position={[0, 1.4, 0.12]}><boxGeometry args={[0.08, 2.8, 0.06]} /></mesh>
              <mesh material={mat(i % 2 ? PALETTE.yellow : '#FFFFFF')} position={[0.24, 1.65, 0.12]}><boxGeometry args={[0.42, 2.0, 0.04]} /></mesh>
            </group>
          ))}
        </group>
      </group>
      <House position={[-8.8, 0, -2.2]} wall="#F4EBD9" roof={PALETTE.gray} windowMat={glow.window} w={2.4} d={2.2} h={1.8} />
      <mesh material={mat('#C98B55')} position={[-9.7, 0.08, 2.95]}><boxGeometry args={[2.2, 0.16, 1.8]} /></mesh>
      <Sack position={[-11.1, 0, 2.3]} rotation={[0, 0.4, 0]} />
      <Sack position={[-11.0, 0, 3.2]} rotation={[0, 1.2, 0]} />
      {[0, 1, 2].map((i) => <Sack key={i} ref={set('sack' + i)} />)}

      {/* ───── 小麦粉トラック */}
      <Truck ref={set('truck')} headlight={glow.head} />

      {/* ───── パン屋さん */}
      <Bakery set={set} tex={tex} glow={glow} shutterMat={shutterMat} tileMat={tileMat} />

      {/* フィナーレのロゴ */}
      <mesh ref={set('bigLogo')} position={[7, 11, -0.5]} userData={{ noShadow: true }}>
        <planeGeometry args={[9, 2.64]} />
        <meshBasicMaterial map={tex.bigLogo} transparent toneMapped={false} />
      </mesh>
    </>
  );
}

function Bakery({ set, tex, glow, shutterMat, tileMat }) {
  const wall = mat('#FFF4DC');
  const trim = mat(PALETTE.terracotta);
  return (
    <group>
      {/* 床 */}
      <mesh material={tileMat} position={[7, 0.05, -2.75]}><boxGeometry args={[12, 0.1, 4.5]} /></mesh>
      <mesh material={mat('#E2B88A')} position={[7, 0.05, 1.75]}><boxGeometry args={[12, 0.1, 4.5]} /></mesh>
      {/* 壁 */}
      <mesh material={wall} position={[7, 2, -5.0]}><boxGeometry args={[12.3, 4, 0.3]} /></mesh>
      <mesh material={wall} position={[1.0, 2, -0.5]}><boxGeometry args={[0.3, 4, 9.3]} /></mesh>
      <mesh material={wall} position={[13.0, 2, -0.5]}><boxGeometry args={[0.3, 4, 9.3]} /></mesh>
      <mesh material={trim} position={[7, 0.25, -4.84]}><boxGeometry args={[11.7, 0.5, 0.05]} /></mesh>
      {/* 壁の棚と時計 */}
      <mesh material={mat(PALETTE.wood)} position={[7, 2.6, -4.7]}><boxGeometry args={[3.5, 0.1, 0.4]} /></mesh>
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x, i) => (
        <mesh key={x} material={mat(['#FFDF5E', '#F4EBD9', '#C8643A', '#A6A6A6', '#F4EBD9'][i])} position={[7 + x, 2.85, -4.7]}>
          <cylinderGeometry args={[0.16, 0.16, 0.4, 6]} />
        </mesh>
      ))}
      {/* 正面ファサード */}
      <mesh material={wall} position={[2.5, 2, 4.0]}><boxGeometry args={[3, 4, 0.3]} /></mesh>
      <mesh material={wall} position={[11.5, 2, 4.0]}><boxGeometry args={[3, 4, 0.3]} /></mesh>
      <mesh material={wall} position={[7, 3.6, 4.0]}><boxGeometry args={[6, 0.8, 0.3]} /></mesh>
      <mesh material={trim} position={[2.5, 0.3, 4.17]}><boxGeometry args={[3, 0.6, 0.05]} /></mesh>
      <mesh material={trim} position={[11.5, 0.3, 4.17]}><boxGeometry args={[3, 0.6, 0.05]} /></mesh>
      {/* 窓 */}
      <mesh material={mat('#FFFFFF')} position={[2.5, 2.1, 4.16]}><boxGeometry args={[2.1, 1.6, 0.06]} /></mesh>
      <mesh material={glow.window} position={[2.5, 2.1, 4.2]}><planeGeometry args={[1.85, 1.35]} /></mesh>
      <mesh material={mat('#FFFFFF')} position={[2.5, 2.1, 4.22]}><boxGeometry args={[0.06, 1.35, 0.02]} /></mesh>
      <mesh material={mat(PALETTE.wood)} position={[2.5, 1.2, 4.35]}><boxGeometry args={[2.1, 0.25, 0.35]} /></mesh>
      {[-0.7, -0.25, 0.2, 0.65].map((x, i) => (
        <mesh key={x} material={mat(['#F28C8C', '#FFDF5E', '#FFFFFF', '#F28C8C'][i])} position={[2.5 + x, 1.42, 4.35]}><icosahedronGeometry args={[0.14, 0]} /></mesh>
      ))}
      <mesh material={mat('#FFFFFF')} position={[12.05, 2.45, 4.16]}><boxGeometry args={[1.2, 1.2, 0.06]} /></mesh>
      <mesh material={glow.window} position={[12.05, 2.45, 4.2]}><planeGeometry args={[1.0, 1.0]} /></mesh>
      {/* 看板（ロゴ） */}
      <mesh material={mat(PALETTE.terracotta)} position={[7, 4.75, 4.5]}><boxGeometry args={[6.9, 1.5, 0.2]} /></mesh>
      <mesh position={[7, 4.75, 4.61]} userData={{ noShadow: true }}>
        <planeGeometry args={[6.6, 1.93 * 0.66]} />
        <meshBasicMaterial map={tex.logo} transparent toneMapped={false} />
      </mesh>
      {/* シャッター */}
      <mesh material={mat('#8E8E96')} position={[7, 3.35, 4.25]}><boxGeometry args={[6.1, 0.35, 0.35]} /></mesh>
      <mesh ref={set('shutter')} material={shutterMat} position={[7, 1.6, 4.12]}><boxGeometry args={[6, 3.2, 0.06]} /></mesh>
      {/* オーニング（デザインの黄×グレーのストライプ） */}
      <group ref={set('awning')} position={[7, 3.55, 4.35]}>
        {Array.from({ length: 12 }, (_, i) => (
          <group key={i} position={[-2.75 + i * 0.5, 0, 0]}>
            <mesh material={mat(i % 2 ? PALETTE.gray : PALETTE.yellow)} position={[0, 0, 0.75]}><boxGeometry args={[0.5, 0.05, 1.5]} /></mesh>
            <mesh material={mat(i % 2 ? PALETTE.gray : PALETTE.yellow, { side: THREE.DoubleSide })} position={[0, 0, 1.5]}>
              <circleGeometry args={[0.25, 8, Math.PI, Math.PI]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* OPEN / CLOSED の札 */}
      <group ref={set('openSign')} position={[10.75, 1.7, 4.32]}>
        <mesh position={[0, 0, 0.015]}><planeGeometry args={[1.0, 0.5]} /><meshBasicMaterial map={tex.open} toneMapped={false} /></mesh>
        <mesh position={[0, 0, -0.015]} rotation={[0, Math.PI, 0]}><planeGeometry args={[1.0, 0.5]} /><meshBasicMaterial map={tex.closed} toneMapped={false} /></mesh>
      </group>

      {/* 屋根（持ち上がる） */}
      <group ref={set('roof')}>
        <mesh material={mat('#FFE9C2')} geometry={prism(9.6, 2.4, 12.6)} position={[7, 4, -0.5]} rotation={[0, Math.PI / 2, 0]} />
        <mesh material={trim} position={[7, 5.33, 1.95]} rotation={[0.455, 0, 0]}><boxGeometry args={[13, 0.26, 6.0]} /></mesh>
        <mesh material={trim} position={[7, 5.33, -2.95]} rotation={[-0.455, 0, 0]}><boxGeometry args={[13, 0.26, 6.0]} /></mesh>
        <mesh material={mat(PALETTE.yellow)} position={[7, 6.55, -0.5]} rotation={[Math.PI / 4, 0, 0]}><boxGeometry args={[13.1, 0.35, 0.35]} /></mesh>
        {[3, 7, 11].map((x) => (
          <mesh key={x} material={glow.window} position={[x, 5.45, 2.0]} rotation={[0.455, 0, 0]}><boxGeometry args={[0.9, 0.05, 0.9]} /></mesh>
        ))}
      </group>

      {/* ───── キッチン */}
      <mesh material={mat(PALETTE.wood)} position={[4.6, 1.02, -2.8]}><boxGeometry args={[4.0, 0.16, 1.9]} /></mesh>
      {[[-1.8, -0.8], [1.8, -0.8], [-1.8, 0.8], [1.8, 0.8]].map(([x, z]) => (
        <mesh key={x + ',' + z} material={mat('#9A6A43')} position={[4.6 + x, 0.48, -2.8 + z]}><boxGeometry args={[0.16, 0.95, 0.16]} /></mesh>
      ))}
      <mesh material={mat('#E8D2B0')} position={[4.6, 0.35, -2.8]}><boxGeometry args={[3.6, 0.06, 1.6]} /></mesh>
      {/* 粉をそそぐ袋・粉の山・生地・めん棒 */}
      <group ref={set('pourSack')} position={[2.85, 1.1, -3.25]}>
        <Sack scale={0.7} />
      </group>
      <mesh ref={set('stream')} material={mat('#FFFFFF')} position={[3.4, 1.4, -3.05]} rotation={[0, 0, -0.5]} userData={{ noShadow: true }}>
        <cylinderGeometry args={[0.05, 0.08, 0.6, 5]} />
      </mesh>
      <mesh ref={set('pile')} material={mat('#FFFDF6')} position={[DOUGH_POS.x, DOUGH_POS.y, DOUGH_POS.z]}>
        <coneGeometry args={[0.5, 0.5, 7]} />
      </mesh>
      <group position={[DOUGH_POS.x, DOUGH_POS.y + 0.12, DOUGH_POS.z]}>
        <group ref={set('dough')}><Dough /></group>
      </group>
      <group ref={set('pin')}>
        <mesh material={mat('#D9A66B')} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.09, 0.09, 1.1, 7]} /></mesh>
        {[-0.68, 0.68].map((x) => (
          <mesh key={x} material={mat('#9A6A43')} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.04, 0.3, 5]} /></mesh>
        ))}
      </group>
      <group ref={set('flourFx')}>
        {Array.from({ length: 14 }, (_, i) => (
          <mesh key={i} material={mat('#FFFFFF')} userData={{ noShadow: true }}><icosahedronGeometry args={[0.07, 0]} /></mesh>
        ))}
      </group>
      {Array.from({ length: 6 }, (_, i) => <group key={i} ref={set('dough' + i)}><Dough scale={[0.85, 0.68, 0.85]} /></group>)}

      {/* 天板 */}
      <group ref={set('tray')}>
        <mesh material={mat('#6E6E78', { metalness: 0.3, roughness: 0.5 })}><boxGeometry args={[2.1, 0.06, 1.15]} /></mesh>
        <mesh material={mat('#F7F1E3')} position={[0, 0.035, 0]}><boxGeometry args={[1.95, 0.01, 1.0]} /></mesh>
      </group>

      {/* オーブン */}
      <group>
        <mesh material={trim} position={[10.5, 0.55, -4.0]}><boxGeometry args={[3.2, 1.1, 2.0]} /></mesh>
        <mesh material={glow.ovenIn} position={[10.5, 1.6, -4.9]}><boxGeometry args={[3.2, 1.0, 0.2]} /></mesh>
        <mesh material={glow.ovenIn} position={[10.5, 1.11, -4.0]}><boxGeometry args={[2.6, 0.02, 1.8]} /></mesh>
        <mesh material={trim} position={[9.05, 1.6, -4.0]}><boxGeometry args={[0.3, 1.0, 2.0]} /></mesh>
        <mesh material={trim} position={[11.95, 1.6, -4.0]}><boxGeometry args={[0.3, 1.0, 2.0]} /></mesh>
        <mesh material={mat('#B5542F')} position={[10.5, 2.5, -4.0]}><boxGeometry args={[3.2, 0.8, 2.0]} /></mesh>
        <mesh material={mat(PALETTE.yellow)} position={[10.5, 2.5, -2.99]}><boxGeometry args={[2.4, 0.18, 0.04]} /></mesh>
        {[9.6, 10.5, 11.4].map((x) => (
          <mesh key={x} material={mat('#3A3A44')} position={[x, 2.5, -2.97]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.06, 8]} /></mesh>
        ))}
        <mesh material={mat('#8E8E96')} position={[11.4, 4.9, -4.5]}><cylinderGeometry args={[0.22, 0.22, 4.4, 7]} /></mesh>
        <group ref={set('door')} position={[10.5, 1.1, -3.0]}>
          <mesh material={mat('#3A3A44')} position={[0, 0.1, 0]}><boxGeometry args={[2.6, 0.2, 0.08]} /></mesh>
          <mesh material={mat('#3A3A44')} position={[0, 0.9, 0]}><boxGeometry args={[2.6, 0.2, 0.08]} /></mesh>
          {[-1.15, 1.15].map((x) => (
            <mesh key={x} material={mat('#3A3A44')} position={[x, 0.5, 0]}><boxGeometry args={[0.3, 0.6, 0.08]} /></mesh>
          ))}
          <mesh material={glow.glass} position={[0, 0.5, 0]}><boxGeometry args={[2.0, 0.6, 0.03]} /></mesh>
          <mesh material={mat('#DADADA', { metalness: 0.5, roughness: 0.3 })} position={[0, 0.9, 0.12]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.04, 1.6, 6]} /></mesh>
        </group>
      </group>
      <mesh material={mat('#DADDE2')} position={[10.5, 0.55, -2.2]}><boxGeometry args={[2.4, 1.1, 0.9]} /></mesh>
      <group ref={set('steam')}>
        {Array.from({ length: 10 }, (_, i) => <mesh key={i} material={glow.steam} userData={{ noShadow: true }}><icosahedronGeometry args={[1, 1]} /></mesh>)}
      </group>
      <group ref={set('smoke')}>
        {Array.from({ length: 6 }, (_, i) => <mesh key={i} material={mat('#F2F2F2')} userData={{ noShadow: true }}><icosahedronGeometry args={[1, 0]} /></mesh>)}
      </group>

      {/* パン職人 */}
      <Person ref={set('baker')} chef shirt="#FFFFFF" />

      {/* ───── 売り場 */}
      <DisplayTable x={4.5} z={1.6} w={3.6} d={1.9} front={PALETTE.yellow} />
      <DisplayTable x={9.3} z={1.35} w={3.0} d={1.6} front={PALETTE.gray} />
      <mesh material={mat(PALETTE.wood)} position={[12.1, 0.55, 2.5]}><boxGeometry args={[1.4, 1.1, 1.4]} /></mesh>
      <mesh material={mat('#4A4A5A')} position={[12.1, 1.3, 2.85]} rotation={[-0.4, 0, 0]}><boxGeometry args={[0.6, 0.35, 0.4]} /></mesh>
      <group ref={set('tongs')} position={[12.0, 1.11, 2.15]}>
        <mesh material={mat('#9A5B33')} position={[0, 0.02, 0]}><boxGeometry args={[0.9, 0.04, 0.6]} /></mesh>
        <Tongs position={[-0.25, 0.04, 0]} rotation={[0, 0.3, 0]} />
      </group>
      {OVEN_BREADS.map((k, i) => {
        const C = BREADS[k].C;
        return <group key={k} ref={set('bread' + i)}><C /></group>;
      })}
      {SHELF_BREADS.map(({ k, p }, i) => {
        const C = BREADS[k].C;
        return <group key={k} ref={set('shelf' + i)} position={[p.x, p.y, p.z]}><C /></group>;
      })}
      {[...TABLE_A, ...SHELF_BREADS.map((s) => s.p)].map((p, i) => (
        <group key={i} ref={set('tag' + i)} position={[p.x + 0.28, 1.08, p.z + 0.35]} rotation={[-0.3, 0, 0]}>
          <PriceTag tex={tex.tag} scale={0.9} />
        </group>
      ))}
      <group ref={set('sparkle')}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} material={mat(PALETTE.yellow, { emissive: '#FFC93C', emissiveIntensity: 0.8 })} userData={{ noShadow: true }}><octahedronGeometry args={[1, 0]} /></mesh>
        ))}
      </group>

      {/* お客さん・紙袋 */}
      {CUSTOMERS.map((c, i) => <Person key={i} ref={set('cust' + i)} shirt={c.shirt} hair={c.hair} scale={0.0001} />)}
      <group ref={set('bag')}>
        <mesh material={mat('#D9B98C')} position={[0, 0.18, 0]}><boxGeometry args={[0.32, 0.36, 0.2]} /></mesh>
        <mesh material={mat(PALETTE.terracotta)} position={[0, 0.2, 0.101]}><planeGeometry args={[0.18, 0.12]} /></mesh>
        <mesh material={mat('#C98944')} position={[0.06, 0.42, 0]} rotation={[0, 0, 0.2]}><capsuleGeometry args={[0.05, 0.3, 2, 6]} /></mesh>
      </group>
    </group>
  );
}

function DisplayTable({ x, z, w, d, front }) {
  return (
    <group position={[x, 0, z]}>
      <mesh material={mat(PALETTE.wood)} position={[0, 0.98, 0]}><boxGeometry args={[w, 0.12, d]} /></mesh>
      <mesh material={mat('#FFF8EA')} position={[0, 1.045, 0]}><boxGeometry args={[w - 0.2, 0.01, d - 0.2]} /></mesh>
      <mesh material={mat(front)} position={[0, 0.46, 0]}><boxGeometry args={[w - 0.2, 0.92, d - 0.2]} /></mesh>
      <mesh material={mat('#FFFFFF')} position={[0, 0.46, d / 2 - 0.09]}><boxGeometry args={[w - 0.6, 0.12, 0.02]} /></mesh>
    </group>
  );
}
