// キャラ・敵・アイテム・とびら・パーティクル
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ModelSlot } from './models/glb.jsx';
import StaticMerge from './StaticMerge.jsx';
import { HeroToy, FairyToy, PomuToy, ChikuToy, BossToy } from './models/toys.jsx';
import { GATE, BOSS_POS } from './level.js';
import { store } from './store.js';

// ---------- 形 ----------
function starShape(outer = 0.5, inner = 0.22) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    i ? s.lineTo(x, y) : s.moveTo(x, y);
  }
  return s;
}
function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.35);
  s.bezierCurveTo(-0.5, 0.0, -0.35, 0.4, 0, 0.18);
  s.bezierCurveTo(0.35, 0.4, 0.5, 0.0, 0, -0.35);
  return s;
}
const extrude = { depth: 0.16, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 3 };

// ---------- アイテム ----------
export function Items({ world }) {
  const refs = useRef({});
  const geo = useMemo(
    () => ({
      star: new THREE.ExtrudeGeometry(starShape(), extrude).center(),
      heart: new THREE.ExtrudeGeometry(heartShape(), extrude).center(),
    }),
    [],
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (const it of world.items) {
      const g = refs.current[it.id];
      if (!g) continue;
      g.visible = !it.taken;
      g.rotation.y = t * (it.type === 'star' ? 1.6 : 2.2) + it.id;
      g.position.set(it.pos[0], it.pos[1] + (it.pull ? 0 : Math.sin(t * 2.4 + it.id) * 0.12), it.pos[2]);
    }
  });
  return world.items.map((it) => (
    <group key={it.id} ref={(el) => (refs.current[it.id] = el)} position={it.pos}>
      {it.type === 'drop' && (
        <StaticMerge>
        <group scale={0.85}>
          <mesh position={[0, -0.05, 0]}>
            <sphereGeometry args={[0.2, 14, 10]} />
            <meshStandardMaterial color="#8fe3ff" emissive="#4fc3ff" emissiveIntensity={0.6} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.17, 0]}>
            <coneGeometry args={[0.175, 0.32, 14]} />
            <meshStandardMaterial color="#8fe3ff" emissive="#4fc3ff" emissiveIntensity={0.6} roughness={0.1} />
          </mesh>
          <mesh position={[0.07, 0, 0.15]}>
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
        </StaticMerge>
      )}
      {it.type === 'star' && (
        <group scale={1.5}>
          <mesh geometry={geo.star}>
            <meshStandardMaterial color="#ffe066" emissive="#ffb800" emissiveIntensity={0.7} roughness={0.3} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.75, 16, 12]} />
            <meshBasicMaterial color="#fff6b0" transparent opacity={0.18} depthWrite={false} />
          </mesh>
        </group>
      )}
      {it.type === 'heart' && (
        <mesh geometry={geo.heart} scale={1.1}>
          <meshStandardMaterial color="#ff7aa8" emissive="#ff3d7f" emissiveIntensity={0.4} roughness={0.3} />
        </mesh>
      )}
    </group>
  ));
}

// ---------- 敵 ----------
export function Enemies({ world }) {
  const refs = useRef({});
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (const e of world.enemies) {
      const g = refs.current[e.id];
      if (!g) continue;
      g.position.set(e.pos[0], e.pos[1], e.pos[2]);
      if (e.type === 'pomu') {
        g.rotation.y = e.facing;
        if (e.alive) {
          const b = Math.abs(Math.sin(t * 8 + e.id));
          g.scale.set(1 + b * 0.08, 1 - b * 0.1, 1 + b * 0.08);
          g.position.y += b * 0.08;
        } else {
          const k = Math.min(1, e.deadT * 5);
          g.scale.set(1 + k * 0.5, Math.max(0.05, 1 - k), 1 + k * 0.5);
          g.visible = e.deadT < 0.5;
        }
      } else {
        g.rotation.y = t * 1.5;
        g.rotation.z = Math.sin(t * 3 + e.id) * 0.2;
      }
    }
  });
  return world.enemies.map((e) => (
    <group key={e.id} ref={(el) => (refs.current[e.id] = el)}>
      {e.type === 'pomu' ? (
        <ModelSlot id="pomu" height={1.0} fallback={<PomuToy />} />
      ) : (
        <group position={[0, -0.45, 0]}>
          <ModelSlot id="chiku" height={1.1} fallback={<group position={[0, 0.45, 0]}><ChikuToy /></group>} />
        </group>
      )}
    </group>
  ));
}

// ---------- チェックポイント ----------
export function Checkpoints({ world }) {
  const flags = useRef({});
  useFrame(({ clock }) => {
    for (const c of world.checkpoints) {
      const f = flags.current[c.id];
      if (!f) continue;
      f.rotation.y = Math.sin(clock.elapsedTime * 3 + c.id) * 0.25;
      f.children[0].material.color.set(c.active ? '#ff8fb1' : '#c9d6e6');
      f.children[0].material.emissive.set(c.active ? '#ff4f8f' : '#000000');
    }
  });
  // 旗は復活地点の少し横に立てる（キャラと重ならないように）
  return world.checkpoints.map((c) => (
    <group key={c.id} position={[c.pos[0] - 1.6, c.pos[1], c.pos[2]]}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 2.4, 8]} />
        <meshStandardMaterial color="#fff6fb" />
      </mesh>
      <mesh position={[0, 2.45, 0]}>
        <sphereGeometry args={[0.14, 10, 8]} />
        <meshStandardMaterial color="#ffe066" emissive="#ffb800" emissiveIntensity={0.4} />
      </mesh>
      <group ref={(el) => (flags.current[c.id] = el)} position={[0, 2.05, 0]}>
        <mesh position={[0.45, 0, 0]} scale={[1, 0.6, 0.35]}>
          <sphereGeometry args={[0.45, 12, 8]} />
          <meshStandardMaterial color="#c9d6e6" emissiveIntensity={0.3} />
        </mesh>
      </group>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.1, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  ));
}

// ---------- とびらとボス ----------
export function GateAndBoss({ world }) {
  const doors = useRef([]);
  const glow = useRef();
  const boss = useRef();
  useFrame(({ clock }, dt) => {
    const s = store.get();
    const open = s.phase === 'clearing' || s.phase === 'clear' ? Math.min(1, world.clearT / 1.4) : 0;
    doors.current.forEach((d, i) => d && (d.rotation.y = (i ? -1 : 1) * open * 1.7));
    if (glow.current) {
      glow.current.material.opacity = s.stars >= 3 ? 0.5 + Math.sin(clock.elapsedTime * 3) * 0.2 : 0.12;
    }
    if (boss.current) {
      boss.current.position.y = BOSS_POS[1] + Math.sin(clock.elapsedTime * 0.8) * 0.5;
      const near = s.phase === 'clearing' || s.phase === 'clear' ? 1 : 0;
      boss.current.position.z += ((BOSS_POS[2] + near * 4) - boss.current.position.z) * Math.min(1, dt * 0.8);
    }
  });
  const eyes = () => {
    const ph = store.get().phase;
    return ph === 'clearing' ? Math.min(1, Math.max(0, (world.clearT - 1) / 1)) : ph === 'clear' ? 1 : 0.08;
  };
  return (
    <group>
      <group position={GATE.pos}>
        {[-1, 1].map((sx) => (
          <mesh key={sx} position={[sx * 1.35, 1.3, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.32, 2.6, 12]} />
            <meshStandardMaterial color="#fff6fb" />
          </mesh>
        ))}
        <mesh position={[0, 2.6, 0]}>
          <torusGeometry args={[1.35, 0.25, 10, 24, Math.PI]} />
          <meshStandardMaterial color="#ffc0da" />
        </mesh>
        <mesh position={[0, 4.1, 0]} rotation={[0, 0, 0]}>
          <octahedronGeometry args={[0.32]} />
          <meshStandardMaterial color="#ffe066" emissive="#ffb800" emissiveIntensity={0.5} />
        </mesh>
        {[-1, 1].map((sx, i) => (
          <group key={sx} position={[sx * 1.1, 0, 0]} ref={(el) => (doors.current[i] = el)}>
            <mesh position={[-sx * 0.55, 1.35, 0]}>
              <boxGeometry args={[1.1, 2.7, 0.14]} />
              <meshStandardMaterial color="#9b86d9" />
            </mesh>
            {[0, 1, 2].map((k) => (
              <mesh key={k} position={[-sx * 0.55, 0.7 + k * 0.7, 0.08]}>
                <octahedronGeometry args={[0.13]} />
                <meshStandardMaterial
                  color="#ffe066"
                  emissive="#ffb800"
                  emissiveIntensity={0.3}
                />
              </mesh>
            ))}
          </group>
        ))}
        <mesh ref={glow} position={[0, 1.4, 0.2]}>
          <planeGeometry args={[2.4, 2.8]} />
          <meshBasicMaterial color="#fff2a8" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      </group>
      <group ref={boss} position={BOSS_POS} scale={2.4}>
        <ModelSlot id="boss" height={4} fallback={<BossToy getEyes={eyes} />} />
      </group>
    </group>
  );
}

// ---------- パーティクル ----------
const MAX_P = 320;
export function Particles({ world }) {
  const mesh = useRef();
  const pool = useMemo(
    () => Array.from({ length: MAX_P }, () => ({ life: 0, max: 1, p: new THREE.Vector3(), v: new THREE.Vector3(), size: 0.2, g: 4, c: new THREE.Color() })),
    [],
  );
  const cursor = useRef(0);
  const tmp = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    world.fx.burst = (pos, color, n = 10, { speed = 3, size = 0.2, gravity = 4, life = 0.7 } = {}) => {
      for (let i = 0; i < n; i++) {
        const q = pool[cursor.current];
        cursor.current = (cursor.current + 1) % MAX_P;
        q.life = q.max = life * (0.7 + Math.random() * 0.6);
        q.p.set(pos[0], pos[1], pos[2]);
        const a = Math.random() * Math.PI * 2;
        const u = Math.random() * 2 - 1;
        const r = Math.sqrt(1 - u * u);
        q.v.set(Math.cos(a) * r, Math.abs(u) * 0.8 + 0.4, Math.sin(a) * r).multiplyScalar(speed * (0.5 + Math.random() * 0.7));
        q.size = size;
        q.g = gravity;
        q.c.set(color);
      }
    };
    for (let i = 0; i < MAX_P; i++) mesh.current.setColorAt(i, new THREE.Color('#ffffff'));
  }, [world, pool]);

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    for (let i = 0; i < MAX_P; i++) {
      const q = pool[i];
      if (q.life > 0) {
        q.life -= dt;
        q.v.y -= q.g * dt;
        q.p.addScaledVector(q.v, dt);
        tmp.position.copy(q.p);
        tmp.scale.setScalar(Math.max(0, q.size * (q.life / q.max)));
        m.setColorAt(i, q.c);
      } else {
        tmp.scale.setScalar(0);
      }
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, MAX_P]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

// ---------- 主人公とナビ妖精 ----------
export function Player({ world }) {
  const root = useRef();
  const body = useRef();
  const shadow = useRef();
  useFrame(({ clock }) => {
    const pl = world.player;
    const a = pl.anim;
    if (!root.current) return;
    root.current.position.set(pl.pos[0], pl.pos[1], pl.pos[2]);
    root.current.rotation.y = pl.facing;
    const sq = a.squash;
    const bob = Math.abs(Math.sin(a.phase)) * 0.08 * a.run;
    body.current.position.y = bob;
    body.current.scale.set(1 + sq * 0.6, 1 - sq, 1 + sq * 0.6);
    body.current.rotation.x = a.flip > 0 ? (1 - a.flip) * Math.PI * 2 : a.air ? -0.1 : a.run * 0.12;
    body.current.visible = pl.invuln <= 0 || Math.floor(clock.elapsedTime * 18) % 2 === 0;

    // 足元の影：真下の足場に落とす
    let top = -Infinity;
    for (const p of world.platforms) {
      if (!p.active || p.cy > pl.pos[1] + 0.05) continue;
      const inside =
        p.shape === 'cyl'
          ? Math.hypot(pl.pos[0] - p.cx, pl.pos[2] - p.cz) <= p.r
          : Math.abs(pl.pos[0] - p.cx) <= p.w / 2 && Math.abs(pl.pos[2] - p.cz) <= p.d / 2;
      if (inside && p.cy > top) top = p.cy;
    }
    const s = shadow.current;
    if (top > -Infinity) {
      s.visible = true;
      s.position.set(pl.pos[0], top + 0.03, pl.pos[2]);
      const h = pl.pos[1] - top;
      s.scale.setScalar(Math.max(0.35, 1 - h * 0.06));
      s.material.opacity = Math.max(0.12, 0.35 - h * 0.02);
    } else s.visible = false;
  });
  return (
    <>
      <group ref={root}>
        <group ref={body}>
          <group position={[0, 0.55, 0]}>
            <group position={[0, -0.55, 0]}>
              <ModelSlot id="hero" height={1.15} fallback={<HeroToy anim={world.player.anim} />} />
            </group>
          </group>
        </group>
      </group>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 20]} />
        <meshBasicMaterial color="#5a4a7a" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </>
  );
}

export function Fairy({ world }) {
  const g = useRef();
  const pos = useRef(new THREE.Vector3(1, 2, 8));
  useFrame(({ clock }, dt) => {
    const pl = world.player;
    const f = pl.facing;
    const ox = 0.9, oz = -0.5;
    const tx = pl.pos[0] + Math.cos(f) * ox + Math.sin(f) * oz;
    const tz = pl.pos[2] - Math.sin(f) * ox + Math.cos(f) * oz;
    const ty = pl.pos[1] + 1.7 + Math.sin(clock.elapsedTime * 2.5) * 0.15;
    pos.current.lerp(new THREE.Vector3(tx, ty, tz), Math.min(1, dt * 3.5));
    g.current.position.copy(pos.current);
    g.current.rotation.y = f;
  });
  return (
    <group ref={g}>
      <ModelSlot id="fairy" height={0.7} fallback={<FairyToy />} />
      <pointLight color="#9fe0ff" intensity={4} distance={4} decay={2} position={[0, 0.3, 0]} />
    </group>
  );
}
