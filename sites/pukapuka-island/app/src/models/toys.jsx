// 仮モデル（球や円柱を組み合わせたローポリ）。
// Tripo の GLB を用意したら、glb.jsx の仕組みで自動的に置き換わる。
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...extra });

function Eye({ position, size = 0.05 }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[size, 12, 12]} />
        <meshStandardMaterial color="#2b2340" roughness={0.3} />
      </mesh>
      <mesh position={[size * 0.35, size * 0.4, size * 0.75]}>
        <sphereGeometry args={[size * 0.35, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// ---------- 主人公：雲しっぽの子ひつじ「メルン」（2本足で立つちびキャラ） ----------
// うずまきのツノ（横から見て渦を巻くチューブ）
function useSpiralHorn() {
  return useMemo(() => {
    const pts = [];
    const turns = 1.35;
    const n = 40;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const a = t * turns * Math.PI * 2;
      const r = 0.1 * (1 - t * 0.78);
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, t * 0.025));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 60, 0.034, 10, false);
  }, []);
}

export function HeroToy({ anim }) {
  const m = useMemo(
    () => ({
      wool: std('#fffaf4', { roughness: 0.95 }),
      woolShade: std('#f4ede6', { roughness: 0.95 }),
      face: std('#ffe9d2', { roughness: 0.7 }),
      cheek: std('#ffb0bd', { roughness: 0.8 }),
      earIn: std('#ffc4cc'),
      horn: std('#ffd75e', { roughness: 0.6, side: THREE.DoubleSide }),
      skin: std('#ffe4c8', { roughness: 0.7 }),
      hoof: std('#b98a66', { roughness: 0.7 }),
      scarf: std('#ff9fb5', { roughness: 0.9 }),
      tail: std('#bfe2ff', { emissive: '#8fcaff', emissiveIntensity: 0.2, roughness: 0.9 }),
      eye: std('#4a2a22', { roughness: 0.25 }),
      mouth: std('#ff8fa3', { roughness: 0.6 }),
      nose: std('#8a5a48'),
    }),
    [],
  );
  const horn = useSpiralHorn();
  const legs = useRef([]);
  const arms = useRef([]);
  const ears = useRef([]);
  const tail = useRef();
  const scarfEnd = useRef();

  useFrame(() => {
    if (!anim) return;
    const swing = Math.sin(anim.phase) * 0.8 * anim.run;
    legs.current.forEach((l, i) => {
      if (l) l.rotation.x = anim.air ? (i ? 0.35 : -0.45) : i ? -swing : swing;
    });
    arms.current.forEach((a, i) => {
      if (!a) return;
      const sx = i ? 1 : -1;
      a.rotation.x = anim.air ? -0.9 : (i ? swing : -swing) * 0.8;
      a.rotation.z = sx * (anim.air ? 0.9 : 0.25);
    });
    ears.current.forEach((e, i) => {
      if (!e) return;
      const sx = i ? 1 : -1;
      e.rotation.z = sx * (anim.air ? 0.8 : 1.2 + Math.sin(anim.phase * 2) * 0.12 * anim.run);
    });
    if (tail.current) tail.current.rotation.z = Math.sin(anim.phase * 0.8) * 0.3;
    if (scarfEnd.current) scarfEnd.current.rotation.x = anim.air ? -0.5 : -0.1 - anim.run * 0.35 + Math.sin(anim.phase) * 0.08 * anim.run;
  });

  // もこもこの体と頭の毛（球を並べる）
  const bodyPuffs = useMemo(() => {
    const out = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      out.push([Math.cos(a) * 0.2, 0.3 + (i % 2) * 0.12, Math.sin(a) * 0.17, 0.11 + (i % 3) * 0.015]);
    }
    return out;
  }, []);
  const headPuffs = useMemo(() => {
    const out = [];
    // 顔のまわりを囲む毛
    for (let i = 0; i < 11; i++) {
      const a = Math.PI * (0.02 + (i / 10) * 0.96);
      out.push([Math.cos(a) * 0.3, 0.04 + Math.sin(a) * 0.26, -0.04, 0.105]);
    }
    // 頭の上と後ろ
    [[0, 0.3, 0.06, 0.15], [-0.13, 0.27, 0.1, 0.12], [0.13, 0.27, 0.1, 0.12], [0, 0.22, -0.16, 0.2], [-0.18, 0.12, -0.14, 0.15], [0.18, 0.12, -0.14, 0.15], [0, 0.02, -0.2, 0.18]].forEach((p) =>
      out.push(p),
    );
    // おでこの前髪
    [[-0.09, 0.2, 0.15, 0.08], [0.07, 0.21, 0.15, 0.08], [-0.01, 0.17, 0.19, 0.065]].forEach((p) => out.push(p));
    return out;
  }, []);

  return (
    <group>
      {/* 足（2本） */}
      {[-1, 1].map((sx, i) => (
        <group key={sx} position={[sx * 0.1, 0.2, 0]} ref={(el) => (legs.current[i] = el)}>
          <mesh material={m.skin} position={[0, -0.09, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.12, 4, 10]} />
          </mesh>
          <mesh material={m.hoof} position={[0, -0.175, 0.01]}>
            <cylinderGeometry args={[0.07, 0.075, 0.05, 12]} />
          </mesh>
        </group>
      ))}
      {/* 体 */}
      <mesh material={m.wool} position={[0, 0.36, 0]} scale={[1, 1, 0.9]} castShadow>
        <sphereGeometry args={[0.22, 18, 14]} />
      </mesh>
      {bodyPuffs.map(([x, y, z, r], i) => (
        <mesh key={i} material={i % 4 ? m.wool : m.woolShade} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 10, 8]} />
        </mesh>
      ))}
      {/* 腕 */}
      {[-1, 1].map((sx, i) => (
        <group key={sx} position={[sx * 0.23, 0.45, 0.02]} ref={(el) => (arms.current[i] = el)}>
          <mesh material={m.wool} position={[sx * 0.02, -0.04, 0]}>
            <sphereGeometry args={[0.07, 10, 8]} />
          </mesh>
          <mesh material={m.skin} position={[sx * 0.03, -0.12, 0.01]}>
            <sphereGeometry args={[0.05, 10, 8]} />
          </mesh>
        </group>
      ))}
      {/* マフラー */}
      <mesh material={m.scarf} position={[0, 0.54, 0.01]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1.4]}>
        <torusGeometry args={[0.17, 0.05, 10, 22]} />
      </mesh>
      <group ref={scarfEnd} position={[0.08, 0.52, 0.25]}>
        <mesh material={m.scarf} position={[0, -0.1, 0]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[0.1, 0.2, 0.045]} />
        </mesh>
        {[-0.03, -0.01, 0.01, 0.03].map((x) => (
          <mesh key={x} material={m.scarf} position={[x + 0.012, -0.22, 0]}>
            <boxGeometry args={[0.014, 0.05, 0.03]} />
          </mesh>
        ))}
      </group>
      {/* 頭 */}
      <group position={[0, 0.8, 0.02]}>
        <mesh material={m.face} position={[0, -0.02, 0.06]} scale={[1.05, 0.95, 0.85]} castShadow>
          <sphereGeometry args={[0.24, 22, 18]} />
        </mesh>
        {headPuffs.map(([x, y, z, r], i) => (
          <mesh key={i} material={m.wool} position={[x, y, z]} castShadow>
            <sphereGeometry args={[r, 10, 8]} />
          </mesh>
        ))}
        {/* 目 */}
        {[-1, 1].map((sx) => (
          <group key={sx} position={[sx * 0.095, -0.01, 0.255]}>
            <mesh material={m.eye} scale={[1, 1.08, 0.6]}>
              <sphereGeometry args={[0.055, 14, 12]} />
            </mesh>
            <mesh position={[sx * 0.012 + 0.012, 0.022, 0.03]}>
              <sphereGeometry args={[0.017, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.014, -0.02, 0.03]}>
              <sphereGeometry args={[0.009, 6, 6]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
        {/* ほっぺ・鼻・口 */}
        {[-1, 1].map((sx) => (
          <mesh key={sx} material={m.cheek} position={[sx * 0.16, -0.08, 0.215]} scale={[1, 0.65, 0.4]}>
            <sphereGeometry args={[0.045, 10, 8]} />
          </mesh>
        ))}
        <mesh material={m.nose} position={[0, -0.06, 0.27]} scale={[1.3, 0.8, 0.6]}>
          <sphereGeometry args={[0.014, 8, 6]} />
        </mesh>
        <mesh material={m.mouth} position={[0, -0.1, 0.262]} scale={[1, 0.9, 0.5]}>
          <sphereGeometry args={[0.026, 10, 8]} />
        </mesh>
        {/* たれ耳 */}
        {[-1, 1].map((sx, i) => (
          <group key={sx} position={[sx * 0.33, -0.03, 0.06]} ref={(el) => (ears.current[i] = el)} rotation={[0, 0, sx * 1.2]}>
            <mesh material={m.wool} position={[0, -0.14, 0]} scale={[0.7, 1.12, 0.42]}>
              <sphereGeometry args={[0.14, 12, 10]} />
            </mesh>
            <mesh material={m.earIn} position={[0, -0.155, 0.05]} scale={[0.45, 0.82, 0.15]}>
              <sphereGeometry args={[0.14, 12, 10]} />
            </mesh>
          </group>
        ))}
        {/* うずまきツノ */}
        {[-1, 1].map((sx) => (
          <group key={sx} position={[sx * 0.29, 0.23, 0.07]} scale={[sx * 1.35, 1.35, 1.35]} rotation={[0, sx * 0.3, 0]}>
            <mesh geometry={horn} material={m.horn} castShadow />
          </group>
        ))}
      </group>
      {/* 雲のしっぽ */}
      <group ref={tail} position={[0.04, 0.32, -0.22]}>
        {[[0, 0, 0, 0.09], [0.07, 0.05, -0.03, 0.065], [-0.06, 0.04, -0.03, 0.065], [0.01, 0.1, -0.04, 0.06]].map(([x, y, z, r], i) => (
          <mesh key={i} material={m.tail} position={[x, y, z]}>
            <sphereGeometry args={[r, 10, 8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ---------- ナビ妖精：しずくの妖精「ティア」 ----------
export function FairyToy() {
  const wings = useRef([]);
  useFrame(({ clock }) => {
    const f = Math.sin(clock.elapsedTime * 22) * 0.6;
    wings.current.forEach((w, i) => w && (w.rotation.y = (i ? -1 : 1) * (0.4 + f)));
  });
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.2, 18, 14]} />
        <meshStandardMaterial color="#8fdcff" emissive="#4fb8ff" emissiveIntensity={0.45} roughness={0.15} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <coneGeometry args={[0.15, 0.28, 18]} />
        <meshStandardMaterial color="#8fdcff" emissive="#4fb8ff" emissiveIntensity={0.45} roughness={0.15} transparent opacity={0.9} />
      </mesh>
      <Eye position={[-0.07, 0.22, 0.17]} size={0.035} />
      <Eye position={[0.07, 0.22, 0.17]} size={0.035} />
      <mesh position={[0, 0.58, 0]}>
        <octahedronGeometry args={[0.06]} />
        <meshBasicMaterial color="#fff6a8" />
      </mesh>
      {[-1, 1].map((sx, i) => (
        <group key={sx} position={[sx * 0.1, 0.28, -0.1]} ref={(el) => (wings.current[i] = el)}>
          <mesh position={[sx * 0.17, 0.05, 0]} scale={[1, 0.6, 1]}>
            <circleGeometry args={[0.18, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------- 敵：ぷにキノコ「ポムム」 ----------
export function PomuToy() {
  const dots = [[0.25, 0.25, 0.3], [-0.3, 0.2, 0.2], [0, 0.42, 0.05], [0.3, 0.18, -0.25], [-0.15, 0.25, -0.35]];
  return (
    <group>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.32, 0.5, 16]} />
        <meshStandardMaterial color="#fff2df" roughness={0.8} />
      </mesh>
      <group position={[0, 0.5, 0]}>
        <mesh castShadow scale={[1, 0.75, 1]}>
          <sphereGeometry args={[0.55, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ff7fa8" roughness={0.6} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.55, 20]} />
          <meshStandardMaterial color="#ffd1e0" side={THREE.DoubleSide} />
        </mesh>
        {dots.map((p, i) => (
          <mesh key={i} position={p} scale={[1, 0.6, 1]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>
      <Eye position={[-0.1, 0.33, 0.27]} size={0.05} />
      <Eye position={[0.1, 0.33, 0.27]} size={0.05} />
      <mesh position={[-0.13, 0.04, 0.05]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#e8b98f" />
      </mesh>
      <mesh position={[0.13, 0.04, 0.05]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#e8b98f" />
      </mesh>
    </group>
  );
}

// ---------- 敵：トゲわたげ「チクリン」 ----------
export function ChikuToy() {
  const spikes = useMemo(() => {
    const out = [];
    const n = 16;
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = i * 2.399963;
      const dir = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      out.push({ pos: dir.clone().multiplyScalar(0.42), quat: q });
    }
    return out;
  }, []);
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.42, 18, 14]} />
        <meshStandardMaterial color="#b9a2ff" roughness={0.9} />
      </mesh>
      {spikes.map((s, i) => (
        <mesh key={i} position={s.pos} quaternion={s.quat}>
          <coneGeometry args={[0.09, 0.3, 8]} />
          <meshStandardMaterial color="#ffd0f0" roughness={0.6} />
        </mesh>
      ))}
      <group position={[0, 0.05, 0.38]}>
        {[-1, 1].map((sx) => (
          <group key={sx}>
            <mesh position={[sx * 0.12, 0, 0]}>
              <sphereGeometry args={[0.08, 10, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[sx * 0.11, -0.01, 0.06]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#2b2340" />
            </mesh>
            <mesh position={[sx * 0.12, 0.11, 0.04]} rotation={[0, 0, sx * -0.5]}>
              <boxGeometry args={[0.14, 0.035, 0.03]} />
              <meshBasicMaterial color="#5a3d8a" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// ---------- ボス：ゴロゴロ雲の王（体験版ではシルエットだけ） ----------
export function BossToy({ getEyes = () => 0 }) {
  const mats = useMemo(
    () => ({
      crown: std('#c9a83a', { emissive: '#ffcf33', emissiveIntensity: 0 }),
      eye: new THREE.MeshBasicMaterial({ color: '#2a2140' }),
    }),
    [],
  );
  const dark = useMemo(() => new THREE.Color('#2a2140'), []);
  const glow = useMemo(() => new THREE.Color('#ffe14d'), []);
  useFrame(({ clock }) => {
    const e = getEyes();
    const blink = Math.sin(clock.elapsedTime * 1.3) > 0.97 ? 0.2 : 1;
    mats.eye.color.copy(dark).lerp(glow, Math.min(1, e * blink));
    mats.crown.emissiveIntensity = 0.6 * e;
  });
  const puffs = useMemo(() => {
    const out = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      out.push([Math.cos(a) * 1.6, Math.sin(i * 2.1) * 0.6, Math.sin(a) * 0.8, 0.9 + (i % 3) * 0.25]);
    }
    return out;
  }, []);
  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.8, 20, 16]} />
        <meshStandardMaterial color="#4a3d6e" roughness={1} />
      </mesh>
      {puffs.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 12, 10]} />
          <meshStandardMaterial color="#3d3260" roughness={1} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={mats.crown} position={[(i - 1) * 0.6, 1.95 + (i === 1 ? 0.25 : 0), 0.3]}>
          <coneGeometry args={[0.22, 0.6, 6]} />
        </mesh>
      ))}
      {[-1, 1].map((sx) => (
        <mesh key={sx} material={mats.eye} position={[sx * 0.6, 0.3, 1.6]} scale={[1, 0.55, 0.4]}>
          <sphereGeometry args={[0.3, 12, 10]} />
        </mesh>
      ))}
    </group>
  );
}
