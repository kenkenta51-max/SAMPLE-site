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

// ---------- 主人公：雲しっぽの子ひつじ「メルン」 ----------
export function HeroToy({ anim }) {
  const m = useMemo(
    () => ({
      wool: std('#ffffff'),
      face: std('#ffeedd'),
      cheek: std('#ffb3c7'),
      ear: std('#ffd6dc'),
      horn: std('#ffe9a8'),
      leg: std('#d9c2b0'),
      tail: std('#bfe6ff', { emissive: '#7fc8ff', emissiveIntensity: 0.25 }),
      scarf: std('#ff8fb1'),
    }),
    [],
  );
  const legs = useRef([]);
  const tail = useRef();
  const ears = useRef([]);
  useFrame(() => {
    if (!anim) return;
    const swing = Math.sin(anim.phase) * 0.9 * anim.run;
    legs.current.forEach((l, i) => {
      if (!l) return;
      const s = i % 2 === 0 ? swing : -swing;
      l.rotation.x = anim.air ? (i < 2 ? -0.6 : 0.6) : s;
    });
    if (tail.current) tail.current.rotation.z = Math.sin(anim.phase * 0.7) * 0.25;
    ears.current.forEach((e, i) => {
      if (e) e.rotation.z = (i ? -1 : 1) * (0.9 + (anim.air ? 0.5 : Math.sin(anim.phase) * 0.12 * anim.run));
    });
  });

  const fluff = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    fluff.push([Math.cos(a) * 0.36, 0.48 + Math.sin(i * 1.7) * 0.12, Math.sin(a) * 0.36]);
  }

  return (
    <group>
      {/* 体 */}
      <mesh material={m.wool} position={[0, 0.5, 0]} scale={[1, 0.92, 1.05]} castShadow>
        <sphereGeometry args={[0.4, 20, 16]} />
      </mesh>
      {fluff.map((p, i) => (
        <mesh key={i} material={m.wool} position={p} castShadow>
          <sphereGeometry args={[0.15, 10, 8]} />
        </mesh>
      ))}
      {/* スカーフ */}
      <mesh material={m.scarf} position={[0, 0.74, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.26, 0.055, 8, 20]} />
      </mesh>
      {/* 頭 */}
      <group position={[0, 0.98, 0.12]}>
        <mesh material={m.face} castShadow scale={[1, 0.95, 0.95]}>
          <sphereGeometry args={[0.3, 20, 16]} />
        </mesh>
        {[[-0.12, 0.22, -0.04], [0.12, 0.22, -0.04], [0, 0.27, 0.02], [0, 0.2, -0.15]].map((p, i) => (
          <mesh key={i} material={m.wool} position={p}>
            <sphereGeometry args={[0.13, 10, 8]} />
          </mesh>
        ))}
        <Eye position={[-0.1, 0.02, 0.26]} />
        <Eye position={[0.1, 0.02, 0.26]} />
        <mesh material={m.cheek} position={[-0.18, -0.07, 0.21]} scale={[1, 0.6, 0.5]}>
          <sphereGeometry args={[0.05, 8, 8]} />
        </mesh>
        <mesh material={m.cheek} position={[0.18, -0.07, 0.21]} scale={[1, 0.6, 0.5]}>
          <sphereGeometry args={[0.05, 8, 8]} />
        </mesh>
        <mesh position={[0, -0.08, 0.28]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#b46a7c" />
        </mesh>
        {[-1, 1].map((sx, i) => (
          <group key={sx} position={[sx * 0.27, 0.04, -0.02]} ref={(el) => (ears.current[i] = el)} rotation={[0, 0, sx * 0.9]}>
            <mesh material={m.ear} position={[0, -0.12, 0]} scale={[0.55, 1, 0.35]}>
              <sphereGeometry args={[0.13, 10, 8]} />
            </mesh>
          </group>
        ))}
        {[-1, 1].map((sx) => (
          <mesh key={sx} material={m.horn} position={[sx * 0.2, 0.17, 0.02]} rotation={[0, sx * 0.4, 0]}>
            <torusGeometry args={[0.06, 0.028, 8, 14, Math.PI * 1.5]} />
          </mesh>
        ))}
      </group>
      {/* 足 */}
      {[[-0.17, 0.15], [0.17, -0.15], [0.17, 0.15], [-0.17, -0.15]].map(([x, z], i) => (
        <group key={i} position={[x, 0.24, z]} ref={(el) => (legs.current[i] = el)}>
          <mesh material={m.leg} position={[0, -0.12, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.12, 4, 8]} />
          </mesh>
        </group>
      ))}
      {/* 雲のしっぽ */}
      <group ref={tail} position={[0, 0.55, -0.42]}>
        {[[0, 0, 0, 0.14], [0.1, 0.08, -0.06, 0.1], [-0.09, 0.07, -0.05, 0.1], [0, 0.15, -0.08, 0.09]].map(([x, y, z, r], i) => (
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
