import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mat, canvasTexture, roundRect, PALETTE } from './materials.js';
import { BREADS, Sack, Tree, House, Person, prism } from './models.jsx';

// ───────── 共通：画面に入ったときだけ3Dを描く小さなキャンバス
export function MiniScene({ children, camera, className = '', label, onPointerDown }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: '200px 0px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={'mini ' + className} role="img" aria-label={label} onPointerDown={onPointerDown}>
      {on && (
        <Canvas shadows flat dpr={[1, 1.6]} camera={{ fov: 30, near: 0.1, far: 200, ...camera }}>
          <MiniLights />
          <AutoShadow />
          {children}
        </Canvas>
      )}
    </div>
  );
}

function MiniLights() {
  return (
    <>
      <ambientLight intensity={0.95} />
      <hemisphereLight args={['#FFF6E0', '#9FC48A', 0.8]} />
      <directionalLight position={[8, 14, 10]} intensity={2.2} color="#FFF3DE" castShadow
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} shadow-normalBias={0.02}
        shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
    </>
  );
}

function AutoShadow() {
  const { scene } = useThree();
  useEffect(() => {
    const id = setTimeout(() => scene.traverse((o) => {
      if (o.isMesh && !o.userData.noShadow && !(o.material && o.material.transparent)) { o.castShadow = true; o.receiveShadow = true; }
    }), 50);
    return () => clearTimeout(id);
  }, [scene]);
  return null;
}

// マウスで少しだけ視点が動く
function useParallax(base, target, amount = 0.6) {
  const { camera } = useThree();
  const p = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  useEffect(() => {
    const f = (e) => { p.current.x = (e.clientX / innerWidth) * 2 - 1; p.current.y = (e.clientY / innerHeight) * 2 - 1; };
    addEventListener('pointermove', f, { passive: true });
    return () => removeEventListener('pointermove', f);
  }, []);
  useFrame((_, dt) => {
    const q = p.current;
    q.sx += (q.x - q.sx) * Math.min(1, dt * 3);
    q.sy += (q.y - q.sy) * Math.min(1, dt * 3);
    camera.position.set(base[0] + q.sx * amount, base[1] - q.sy * amount * 0.6, base[2]);
    camera.lookAt(target[0], target[1], target[2]);
  });
}

function woodGrain(ctx, w, h, base = '#B97E4B', dark = '#9C6438', planks = 5) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  const ph = h / planks;
  for (let i = 0; i < planks; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)';
    ctx.fillRect(0, i * ph, w, ph);
    ctx.strokeStyle = 'rgba(90,42,15,.18)';
    ctx.lineWidth = 2;
    for (let k = 0; k < 5; k++) {
      const y = i * ph + ph * (0.2 + k * 0.15);
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 40) ctx.lineTo(x, y + Math.sin((x + i * 90 + k * 30) / 70) * 3);
      ctx.stroke();
    }
    ctx.fillStyle = dark;
    ctx.fillRect(0, i * ph - 3, w, 6);
  }
}

// ───────── 1) 焼きあがり時間の木の看板
export const BAKE_TIMES = [
  { time: '7:00', items: ['しょくぱん', 'くろわっさん', 'ばげっと'] },
  { time: '8:30', items: ['めろんぱん', 'くまさんのぱん'] },
  { time: '10:00', items: ['ばたーとーすと', 'でにっしゅ'] },
  { time: '11:30', items: ['うぃんなーぱん', 'くっぺ'] },
  { time: '14:00', items: ['ろっげんぶろーと', 'しょくぱん（2回目）'] },
  { time: '16:00', items: ['くろわっさん（2回目）'] },
];

function TimetableBoard() {
  const tex = useMemo(() => canvasTexture(1024, 800, (c, w, h) => {
    woodGrain(c, w, h, '#C48A55', '#9C6438', 6);
    c.textAlign = 'center';
    c.fillStyle = '#FFF6DF';
    c.font = '900 64px "Zen Maru Gothic", sans-serif';
    c.fillText('やきあがり じかん', w / 2, 100);
    c.fillStyle = '#FFDF5E';
    c.beginPath(); c.arc(w / 2, 150, 26, Math.PI, 0); c.fill();
    c.fillRect(w / 2 - 60, 150, 120, 5);
    BAKE_TIMES.forEach((r, i) => {
      const y = 232 + i * 92;
      c.fillStyle = 'rgba(90,42,15,.35)';
      roundRect(c, 70, y - 50, w - 140, 74, 18); c.fill();
      c.fillStyle = '#FFDF5E';
      roundRect(c, 88, y - 40, 170, 54, 27); c.fill();
      c.fillStyle = '#5A2A0F';
      c.font = '800 40px "Playfair Display", serif';
      c.fillText(r.time, 173, y);
      c.fillStyle = '#FFF6DF';
      c.textAlign = 'left';
      c.font = '700 34px "Zen Maru Gothic", sans-serif';
      c.fillText(r.items.join('・'), 288, y - 2);
      c.textAlign = 'center';
    });
  }), []);
  const plaque = useMemo(() => canvasTexture(512, 160, (c, w, h) => {
    woodGrain(c, w, h, '#FFF1D6', '#E9D2A8', 2);
    c.fillStyle = '#C8643A';
    c.textAlign = 'center';
    c.font = '900 64px "Zen Maru Gothic", sans-serif';
    c.fillText('焼きたて あります', w / 2, 104);
  }), []);
  const group = useRef();
  const hang = useRef();
  useParallax([1.2, 3.2, 12], [0, 2.4, 0], 0.9);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (group.current) group.current.rotation.y = Math.sin(t * 0.45) * 0.1 - 0.12;
    if (hang.current) hang.current.rotation.z = Math.sin(t * 1.6) * 0.08;
  });
  const wood = mat('#8A5530');
  return (
    <group>
      <mesh material={mat('#B8DC8A')} position={[0, -0.15, 0]}><cylinderGeometry args={[5.2, 5.4, 0.3, 10]} /></mesh>
      <mesh material={mat('#D7A46D')} position={[0, -0.6, 0]}><cylinderGeometry args={[5.4, 5.0, 0.6, 10]} /></mesh>
      <group ref={group}>
        {[-2.35, 2.35].map((x) => <mesh key={x} material={wood} position={[x, 2.2, 0]}><boxGeometry args={[0.28, 4.4, 0.28]} /></mesh>)}
        <mesh material={wood} position={[0, 3.0, -0.02]}><boxGeometry args={[4.75, 3.65, 0.16]} /></mesh>
        <mesh position={[0, 3.0, 0.07]}><planeGeometry args={[4.45, 3.48]} /><meshStandardMaterial map={tex} roughness={0.85} /></mesh>
        <mesh material={mat(PALETTE.terracotta)} geometry={prism(1.0, 0.7, 5.3)} position={[0, 4.82, 0]} rotation={[0, Math.PI / 2, 0]} />
        <mesh material={mat(PALETTE.yellow)} position={[0, 4.84, 0]}><boxGeometry args={[5.4, 0.1, 1.1]} /></mesh>
        <group ref={hang} position={[0, 1.15, 0.1]}>
          {[-0.75, 0.75].map((x) => <mesh key={x} material={mat('#5A5A66')} position={[x, -0.18, 0]}><cylinderGeometry args={[0.015, 0.015, 0.36, 4]} /></mesh>)}
          <mesh material={mat('#E9D2A8')} position={[0, -0.6, 0]}><boxGeometry args={[1.95, 0.6, 0.08]} /></mesh>
          <mesh position={[0, -0.6, 0.045]}><planeGeometry args={[1.85, 0.56]} /><meshStandardMaterial map={plaque} /></mesh>
        </group>
      </group>
      {/* 足もとのかごとパン */}
      <group position={[-3.4, 0, 1.2]} rotation={[0, 0.5, 0]}>
        <mesh material={mat('#A46A3C')} position={[0, 0.3, 0]}><cylinderGeometry args={[0.75, 0.6, 0.6, 9, 1, true]} /></mesh>
        <mesh material={mat('#8A5530')} position={[0, 0.05, 0]}><cylinderGeometry args={[0.6, 0.6, 0.1, 9]} /></mesh>
        <group position={[-0.1, 0.35, 0]} scale={1.2}><BREADS.melonpan.C /></group>
        <group position={[0.3, 0.45, 0.2]} scale={1.1}><BREADS.croissant.C /></group>
      </group>
      <group position={[3.4, 0, 1.0]} rotation={[0, -0.4, 0]}>
        <Sack scale={1.3} />
        <group position={[0.9, 0, 0.3]} scale={1.3}><BREADS.baguette.C /></group>
      </group>
      {[[-2.8, 2.6], [-1.9, 3.1], [2.2, 2.9], [3.0, 2.3], [0.8, 3.3]].map(([x, z], i) => (
        <mesh key={i} material={mat(['#F28C8C', '#FFDF5E', '#FFFFFF', '#C7A4E8', '#FFDF5E'][i])} position={[x, 0.18, z]}><icosahedronGeometry args={[0.16, 0]} /></mesh>
      ))}
      <Tree position={[-4.2, 0, -1.8]} s={1.3} c="#8CCB72" />
      <Tree position={[4.3, 0, -1.6]} s={1.1} c="#6FB861" />
    </group>
  );
}
export function TimetableScene() {
  return <MiniScene className="mini--board" camera={{ position: [1.2, 3.2, 12] }} label="焼きあがり時間が書かれた木の看板"><TimetableBoard /></MiniScene>;
}

// ───────── 2) 人気No.1：回るケーキスタンドとくまさんのぱん
function SignatureStand({ drag }) {
  const spin = useRef();
  const sign = useRef();
  const sparkles = useRef();
  const tex = useMemo(() => canvasTexture(512, 256, (c, w, h) => {
    woodGrain(c, w, h, '#C48A55', '#9C6438', 3);
    c.textAlign = 'center';
    c.fillStyle = '#FFF6DF';
    c.font = '900 52px "Zen Maru Gothic", sans-serif';
    c.fillText('人気', w / 2, 88);
    c.fillStyle = '#FFDF5E';
    c.font = '800 104px "Playfair Display", serif';
    c.fillText('No.1', w / 2, 200);
  }), []);
  useParallax([0, 3.4, 9.5], [0, 2.1, 0], 0.5);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    drag.current.v *= 0.94;
    drag.current.a += dt * 0.45 + drag.current.v;
    if (spin.current) { spin.current.rotation.y = drag.current.a; spin.current.position.y = 1.62 + Math.sin(t * 2) * 0.05; }
    if (sign.current) sign.current.rotation.z = Math.sin(t * 1.3) * 0.06;
    if (sparkles.current) sparkles.current.children.forEach((m, i) => {
      const a = t * 0.8 + (i / 10) * Math.PI * 2;
      m.position.set(Math.cos(a) * 2.2, 1.6 + Math.sin(t * 2 + i) * 0.6 + (i % 3) * 0.3, Math.sin(a) * 2.2);
      m.rotation.set(t, t * 1.3, 0);
      m.scale.setScalar(0.08 + Math.abs(Math.sin(t * 2 + i)) * 0.07);
    });
  });
  return (
    <group>
      <mesh material={mat('#FFE9A8')} position={[0, -0.1, 0]}><cylinderGeometry args={[3.2, 3.4, 0.2, 12]} /></mesh>
      <mesh material={mat('#F6D27A')} position={[0, -0.45, 0]}><cylinderGeometry args={[3.4, 3.0, 0.5, 12]} /></mesh>
      {/* ケーキスタンド */}
      <mesh material={mat('#FFFFFF')} position={[0, 0.05, 0]}><cylinderGeometry args={[0.7, 0.9, 0.12, 12]} /></mesh>
      <mesh material={mat('#FFFFFF')} position={[0, 0.7, 0]}><cylinderGeometry args={[0.16, 0.22, 1.3, 8]} /></mesh>
      <mesh material={mat('#FFFFFF')} position={[0, 1.38, 0]}><cylinderGeometry args={[1.7, 1.55, 0.12, 16]} /></mesh>
      <mesh material={mat(PALETTE.yellow)} position={[0, 1.36, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.65, 0.05, 4, 24]} /></mesh>
      <mesh material={mat('#FFF8EA')} position={[0, 1.45, 0]}><cylinderGeometry args={[1.45, 1.45, 0.02, 16]} /></mesh>
      <group ref={spin} position={[0, 1.62, 0]}>
        <group scale={2.8} rotation={[0.25, 0, 0]}><BREADS.bear.C /></group>
      </group>
      {/* 吊り看板 */}
      <group ref={sign} position={[0, 5.2, -0.6]}>
        {[-0.7, 0.7].map((x) => <mesh key={x} material={mat('#5A5A66')} position={[x, -0.4, 0]}><cylinderGeometry args={[0.02, 0.02, 0.8, 4]} /></mesh>)}
        <mesh material={mat('#8A5530')} position={[0, -1.25, -0.03]}><boxGeometry args={[2.1, 1.1, 0.12]} /></mesh>
        <mesh position={[0, -1.25, 0.04]}><planeGeometry args={[2.0, 1.0]} /><meshStandardMaterial map={tex} /></mesh>
      </group>
      <group ref={sparkles}>
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} material={mat(PALETTE.yellow, { emissive: '#FFC93C', emissiveIntensity: 0.6 })} userData={{ noShadow: true }}><octahedronGeometry args={[1, 0]} /></mesh>
        ))}
      </group>
      {[[-2.3, 1.2, 'croissant'], [2.3, 1.0, 'melonpan'], [-1.6, 2.2, 'danish'], [1.7, 2.3, 'kuppe']].map(([x, z, k]) => {
        const C = BREADS[k].C;
        return <group key={k} position={[x, 0, z]} scale={1.1}><C /></group>;
      })}
    </group>
  );
}
export function SignatureScene() {
  const drag = useRef({ a: 0, v: 0 });
  const onPointerDown = (e) => {
    let last = e.clientX;
    const move = (ev) => { drag.current.v = (ev.clientX - last) * 0.004; last = ev.clientX; };
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  };
  return (
    <MiniScene className="mini--stand" camera={{ position: [0, 3.4, 9.5] }} label="ケーキスタンドの上で回るくまさんのぱん" onPointerDown={onPointerDown}>
      <SignatureStand drag={drag} />
    </MiniScene>
  );
}

// ───────── 3) こだわり：風車と麦畑と牛さん
function Windmill(props) {
  const blades = useRef();
  useFrame(({ clock }) => { if (blades.current) blades.current.rotation.z = clock.elapsedTime * 0.8; });
  return (
    <group {...props}>
      <mesh material={mat('#FFF3DC')} position={[0, 2.5, 0]}><cylinderGeometry args={[1.05, 1.55, 5, 8]} /></mesh>
      <mesh material={mat(PALETTE.terracotta)} position={[0, 5.75, 0]}><coneGeometry args={[1.35, 1.6, 8]} /></mesh>
      <mesh material={mat('#8A5A3C')} position={[0, 0.65, 1.42]} rotation={[-0.1, 0, 0]}><boxGeometry args={[0.8, 1.3, 0.1]} /></mesh>
      <group ref={blades} position={[0, 4.7, 1.35]}>
        <mesh material={mat('#7A5A3C')}><cylinderGeometry args={[0.18, 0.18, 0.3, 6]} /></mesh>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
            <mesh material={mat('#8A6A4C')} position={[0, 1.4, 0.12]}><boxGeometry args={[0.08, 2.8, 0.06]} /></mesh>
            <mesh material={mat(i % 2 ? PALETTE.yellow : '#FFFFFF')} position={[0.24, 1.65, 0.12]}><boxGeometry args={[0.42, 2.0, 0.04]} /></mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
function Cow(props) {
  const head = useRef();
  useFrame(({ clock }) => { if (head.current) head.current.rotation.x = 0.4 + Math.sin(clock.elapsedTime * 1.5) * 0.25; });
  return (
    <group {...props}>
      <mesh material={mat('#FFFFFF')} position={[0, 0.85, 0]}><boxGeometry args={[1.4, 0.75, 0.8]} /></mesh>
      <mesh material={mat('#3B3B3B')} position={[0.25, 1.05, 0.41]}><boxGeometry args={[0.4, 0.35, 0.02]} /></mesh>
      <mesh material={mat('#3B3B3B')} position={[-0.35, 0.8, -0.41]}><boxGeometry args={[0.45, 0.3, 0.02]} /></mesh>
      {[[-0.5, -0.28], [-0.5, 0.28], [0.5, -0.28], [0.5, 0.28]].map(([x, z]) => (
        <mesh key={x + ',' + z} material={mat('#FFFFFF')} position={[x, 0.25, z]}><boxGeometry args={[0.18, 0.5, 0.18]} /></mesh>
      ))}
      <group ref={head} position={[0.75, 1.0, 0]}>
        <mesh material={mat('#FFFFFF')} position={[0.25, 0, 0]}><boxGeometry args={[0.5, 0.5, 0.55]} /></mesh>
        <mesh material={mat('#F7B9B0')} position={[0.52, -0.1, 0]}><boxGeometry args={[0.1, 0.25, 0.45]} /></mesh>
        {[-1, 1].map((s) => <mesh key={s} material={mat(PALETTE.yellow)} position={[0.2, 0.3, s * 0.2]}><coneGeometry args={[0.06, 0.2, 5]} /></mesh>)}
        {[-1, 1].map((s) => <mesh key={'e' + s} material={mat('#2B1D16')} position={[0.51, 0.08, s * 0.13]}><sphereGeometry args={[0.04, 5, 4]} /></mesh>)}
      </group>
    </group>
  );
}
function Wheat() {
  const g = useRef();
  const stalks = useMemo(() => {
    const a = [];
    for (let x = -4; x <= -0.6; x += 0.45) for (let z = 0.6; z <= 3.6; z += 0.45) a.push([x + (Math.random() - 0.5) * 0.15, z + (Math.random() - 0.5) * 0.15]);
    return a;
  }, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    g.current?.children.forEach((m, i) => { m.rotation.z = Math.sin(t * 1.4 + m.position.x * 0.8) * 0.12; m.rotation.x = Math.cos(t * 1.1 + i) * 0.05; });
  });
  return (
    <group ref={g}>
      {stalks.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh material={mat('#C9B45E')} position={[0, 0.35, 0]}><cylinderGeometry args={[0.02, 0.03, 0.7, 4]} /></mesh>
          <mesh material={mat('#F2CB5E')} position={[0, 0.8, 0]}><coneGeometry args={[0.09, 0.4, 5]} /></mesh>
        </group>
      ))}
    </group>
  );
}
function FarmDiorama() {
  const root = useRef();
  useParallax([7, 7.5, 13], [0, 1.6, 0], 0.8);
  useFrame(({ clock }) => { if (root.current) root.current.rotation.y = Math.sin(clock.elapsedTime * 0.2) * 0.25; });
  return (
    <group ref={root}>
      <mesh material={mat('#B8DC8A')} position={[0, -0.15, 0]}><boxGeometry args={[10, 0.3, 8]} /></mesh>
      <mesh material={mat('#D7A46D')} position={[0, -0.8, 0]}><boxGeometry args={[9.8, 1.0, 7.8]} /></mesh>
      <mesh material={mat('#D9B26B')} position={[-2.3, 0.02, 2.1]}><boxGeometry args={[3.9, 0.06, 3.5]} /></mesh>
      <Wheat />
      <Windmill position={[-2.4, 0, -1.8]} scale={0.8} />
      <Cow position={[2.2, 0, 1.6]} rotation={[0, -0.6, 0]} />
      {/* 柵 */}
      {[0.6, 1.6, 2.6, 3.6].map((x) => <mesh key={x} material={mat('#FFFFFF')} position={[x, 0.35, 3.2]}><boxGeometry args={[0.1, 0.7, 0.1]} /></mesh>)}
      <mesh material={mat('#FFFFFF')} position={[2.1, 0.5, 3.2]}><boxGeometry args={[3.2, 0.08, 0.06]} /></mesh>
      <mesh material={mat('#FFFFFF')} position={[2.1, 0.25, 3.2]}><boxGeometry args={[3.2, 0.08, 0.06]} /></mesh>
      {/* 牛乳缶・バター・袋 */}
      <mesh material={mat('#DADDE2', { metalness: 0.3, roughness: 0.4 })} position={[3.8, 0.4, -0.3]}><cylinderGeometry args={[0.3, 0.35, 0.8, 8]} /></mesh>
      <mesh material={mat(PALETTE.yellow)} position={[3.8, 0.88, -0.3]}><cylinderGeometry args={[0.18, 0.18, 0.16, 8]} /></mesh>
      <Sack position={[0.4, 0, -0.6]} />
      <Sack position={[1.05, 0, -0.9]} rotation={[0, 0.7, 0]} />
      <House position={[2.6, 0, -2.4]} wall="#FFF1D6" roof={PALETTE.terracotta} windowMat={mat('#FFE9A8')} w={2.4} d={2} h={1.8} />
      <Tree position={[4.2, 0, -3]} s={1.1} />
      <Tree position={[-4.3, 0, -3.1]} s={0.9} c="#6FB861" />
    </group>
  );
}
export function FarmScene() {
  return <MiniScene className="mini--farm" camera={{ position: [7, 7.5, 13] }} label="風車と麦畑と牛のいるミニチュアの農場"><FarmDiorama /></MiniScene>;
}

// ───────── 4) アクセス：駅からパン屋までの立体マップ
function labelTex(text, bg = '#FFFDF7', fg = '#C8643A') {
  return canvasTexture(512, 160, (c, w, h) => {
    c.fillStyle = bg; roundRect(c, 6, 6, w - 12, h - 30, 40); c.fill();
    c.beginPath(); c.moveTo(w / 2 - 18, h - 25); c.lineTo(w / 2 + 18, h - 25); c.lineTo(w / 2, h - 2); c.closePath(); c.fill();
    c.fillStyle = fg; c.textAlign = 'center';
    c.font = '900 56px "Zen Maru Gothic", sans-serif';
    c.fillText(text, w / 2, 92);
  });
}
function Label({ text, position, bg, fg, scale = 1 }) {
  const tex = useMemo(() => labelTex(text, bg, fg), [text, bg, fg]);
  return (
    <sprite position={position} scale={[2.4 * scale, 0.75 * scale, 1]}>
      <spriteMaterial map={tex} toneMapped={false} />
    </sprite>
  );
}
function MiniBakery(props) {
  return (
    <group {...props}>
      <mesh material={mat('#FFF4DC')} position={[0, 0.8, 0]}><boxGeometry args={[2.4, 1.6, 1.8]} /></mesh>
      <mesh material={mat(PALETTE.terracotta)} geometry={prism(2.2, 0.9, 2.6)} position={[0, 1.6, 0]} rotation={[0, Math.PI / 2, 0]} />
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} material={mat(i % 2 ? PALETTE.gray : PALETTE.yellow)} position={[-1.0 + i * 0.4, 1.2, 1.15]} rotation={[0.45, 0, 0]}>
          <boxGeometry args={[0.4, 0.04, 0.6]} />
        </mesh>
      ))}
      <mesh material={mat('#FFE9A8')} position={[0, 0.5, 0.91]}><planeGeometry args={[1.4, 0.9]} /></mesh>
    </group>
  );
}
function Train() {
  const g = useRef();
  useFrame(({ clock }) => {
    const x = ((clock.elapsedTime * 1.6) % 22) - 11;
    if (g.current) g.current.position.x = x;
  });
  return (
    <group ref={g} position={[0, 0, -2.9]}>
      {[0, -1.35].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh material={mat(i ? '#FFFFFF' : PALETTE.yellow)} position={[0, 0.45, 0]}><boxGeometry args={[1.25, 0.6, 0.6]} /></mesh>
          <mesh material={mat(PALETTE.terracotta)} position={[0, 0.3, 0]}><boxGeometry args={[1.27, 0.12, 0.62]} /></mesh>
          <mesh material={mat('#9FD6EA')} position={[0, 0.55, 0.31]}><boxGeometry args={[0.9, 0.2, 0.01]} /></mesh>
        </group>
      ))}
    </group>
  );
}
function AccessMap() {
  const pin = useRef();
  const dots = useMemo(() => {
    const pts = [[-3.4, -1.6], [-3.4, -0.4], [-3.4, 0.8], [-2.2, 0.8], [-1, 0.8], [0.2, 0.8], [1.4, 0.8], [2.4, 0.8], [2.4, 0.0]];
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0.08, z)), false, 'catmullrom', 0.05);
    return curve.getSpacedPoints(26);
  }, []);
  const dotRef = useRef();
  useParallax([5.5, 11, 13], [0, 0.6, 0], 0.7);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (pin.current) pin.current.position.y = 2.9 + Math.abs(Math.sin(t * 2.2)) * 0.45;
    if (pin.current) pin.current.rotation.y = t;
    dotRef.current?.children.forEach((m, i) => {
      const k = (i / dots.length - t * 0.25) % 1;
      m.scale.setScalar(0.07 + (k < 0 ? k + 1 : k) * 0.07);
    });
  });
  return (
    <group>
      <mesh material={mat('#B8DC8A')} position={[0, -0.15, 0]}><boxGeometry args={[11, 0.3, 8]} /></mesh>
      <mesh material={mat('#D7A46D')} position={[0, -0.8, 0]}><boxGeometry args={[10.8, 1.0, 7.8]} /></mesh>
      {/* 線路 */}
      <mesh material={mat('#9A8A7A')} position={[0, 0.02, -2.9]}><boxGeometry args={[11, 0.04, 0.9]} /></mesh>
      {Array.from({ length: 22 }, (_, i) => <mesh key={i} material={mat('#7A5A3C')} position={[-5.25 + i * 0.5, 0.05, -2.9]}><boxGeometry args={[0.12, 0.03, 0.8]} /></mesh>)}
      <Train />
      {/* 道路 */}
      <mesh material={mat('#F1E6D2')} position={[-3.4, 0.03, 0]}><boxGeometry args={[0.9, 0.06, 4.6]} /></mesh>
      <mesh material={mat('#F1E6D2')} position={[0.6, 0.03, 0.8]}><boxGeometry args={[9, 0.06, 0.9]} /></mesh>
      <mesh material={mat('#80838F')} position={[0, 0.02, 2.6]}><boxGeometry args={[11, 0.04, 1.3]} /></mesh>
      {/* 川 */}
      <mesh material={mat('#9FD6EA', { roughness: 0.3 })} position={[4.4, 0.03, 1.6]} rotation={[0, 0.3, 0]}><boxGeometry args={[1.1, 0.04, 5]} /></mesh>
      {/* 駅 */}
      <group position={[-3.4, 0, -1.85]}>
        <mesh material={mat('#FFFFFF')} position={[0, 0.55, 0]}><boxGeometry args={[2.4, 1.1, 1.0]} /></mesh>
        <mesh material={mat('#6E8FB3')} position={[0, 1.2, 0]}><boxGeometry args={[2.7, 0.2, 1.3]} /></mesh>
      </group>
      <MiniBakery position={[2.4, 0, -0.8]} rotation={[0, 0, 0]} />
      <Windmill position={[4.0, 0, -1.6]} scale={0.32} />
      <House position={[-1.1, 0, -1.5]} wall="#CDE8F6" roof="#6E8FB3" windowMat={mat('#FFE9A8')} w={1.4} d={1.2} h={1.1} />
      <House position={[0.3, 0, -0.35]} wall="#F7C9C9" roof={PALETTE.gray} windowMat={mat('#FFE9A8')} w={1.1} d={0.9} h={1.0} />
      {[[-4.8, 1.2], [-4.6, 3.2], [-0.2, 3.4], [1.5, 1.9], [4.9, -0.2], [-2.0, -0.2], [3.3, 3.4]].map(([x, z], i) => (
        <Tree key={i} position={[x, 0, z]} s={0.55} c={i % 2 ? '#6FB861' : '#8CCB72'} />
      ))}
      {/* 駐車場 */}
      <mesh material={mat('#B9B9BE')} position={[2.0, 0.03, 1.75]}><boxGeometry args={[1.8, 0.04, 0.8]} /></mesh>
      {[1.4, 2.0, 2.6].map((x) => <mesh key={x} material={mat('#FFFFFF')} position={[x - 0.3, 0.06, 1.75]}><boxGeometry args={[0.04, 0.01, 0.7]} /></mesh>)}
      <group ref={dotRef}>
        {dots.map((p, i) => <mesh key={i} material={mat(PALETTE.terracotta)} position={p} userData={{ noShadow: true }}><sphereGeometry args={[1, 6, 4]} /></mesh>)}
      </group>
      <group ref={pin} position={[2.4, 2.9, -0.8]}>
        <mesh material={mat(PALETTE.terracotta)} position={[0, 0.25, 0]}><sphereGeometry args={[0.32, 10, 8]} /></mesh>
        <mesh material={mat(PALETTE.terracotta)} position={[0, -0.12, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.24, 0.55, 10]} /></mesh>
        <mesh material={mat('#FFFFFF')} position={[0, 0.27, 0.22]}><sphereGeometry args={[0.13, 8, 6]} /></mesh>
      </group>
      <Label text="ひだまり駅" position={[-3.4, 2.2, -1.85]} bg="#6E8FB3" fg="#FFFFFF" scale={0.9} />
      <Label text="HIDAMARI" position={[2.4, 4.3, -0.8]} />
      <Label text="P 3台" position={[2.0, 1.0, 1.75]} bg="#FFFFFF" fg="#4A4A5A" scale={0.6} />
    </group>
  );
}
export function AccessScene() {
  return <MiniScene className="mini--map" camera={{ position: [5.5, 11, 13] }} label="ひだまり駅からパン屋までの立体マップ"><AccessMap /></MiniScene>;
}

