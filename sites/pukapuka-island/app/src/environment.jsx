// 空・雲・島・足場・飾り
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ModelSlot } from './models/glb.jsx';
import StaticMerge from './StaticMerge.jsx';

const TINTS = {
  grass: { top: '#b8eca6', rim: '#9fdf8e', body: '#f3d3b4' },
  pink: { top: '#ffd0e2', rim: '#ffb3cf', body: '#f6d9c0' },
  mint: { top: '#bdf3e0', rim: '#9ee8cc', body: '#e8d6f6' },
};

// 決まった乱数（毎回同じ配置にする）
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---------- 空 ----------
export function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE.Color('#8fd0ff') },
          mid: { value: new THREE.Color('#d9f0ff') },
          bottom: { value: new THREE.Color('#ffd9ec') },
        },
        vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP;
          void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.6, h)) : mix(mid, bottom, smoothstep(0.0, 0.35, -h));
          gl_FragColor = vec4(c, 1.0); }`,
      }),
    [],
  );
  return (
    <mesh material={mat} renderOrder={-1}>
      <sphereGeometry args={[400, 32, 16]} />
    </mesh>
  );
}

function Puff({ position, scale = 1, color = '#ffffff', seed = 1, count = 6, opacity = 1 }) {
  const parts = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, (_, i) => [(r() - 0.5) * 3.2, r() * 0.9, (r() - 0.5) * 1.6, 0.8 + r() * 0.9]);
  }, [seed, count]);
  return (
    <group position={position} scale={scale}>
      {parts.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={s}>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color={color} emissive="#ffffff" emissiveIntensity={0.22} roughness={1} transparent={opacity < 1} opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

export function FarClouds() {
  const group = useRef();
  const clouds = useMemo(() => {
    const r = rng(7);
    const out = [];
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2;
      const d = 85 + r() * 70;
      out.push({ pos: [Math.cos(a) * d, -10 + r() * 40, -35 + Math.sin(a) * d], s: 2.5 + r() * 3, seed: i + 3 });
    }
    // 下に広がる雲の海
    for (let i = 0; i < 22; i++) {
      out.push({ pos: [(r() - 0.5) * 160, -42 - r() * 6, 30 - r() * 150], s: 4 + r() * 3, seed: 100 + i });
    }
    return out;
  }, []);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.004;
  });
  return (
    <group ref={group} position={[0, 0, -35]}>
      <group position={[0, 0, 35]}>
        <StaticMerge>
          {clouds.map((c, i) => (
            <Puff key={i} position={c.pos} scale={c.s} seed={c.seed} />
          ))}
        </StaticMerge>
      </group>
    </group>
  );
}

export function Rainbow({ position, rotation, radius = 22 }) {
  const colors = ['#ff9aa2', '#ffc29a', '#fff09a', '#b5f0a0', '#9ad8ff', '#c4a8ff'];
  return (
    <group position={position} rotation={rotation}>
      {colors.map((c, i) => (
        <mesh key={c}>
          <torusGeometry args={[radius - i * 0.9, 0.45, 8, 48, Math.PI]} />
          <meshBasicMaterial color={c} transparent opacity={0.55} fog={false} />
        </mesh>
      ))}
    </group>
  );
}

// ---------- 足場の見た目 ----------
function IslandLook({ p }) {
  const t = TINTS[p.tint] || TINTS.grass;
  const rim = useMemo(() => {
    const n = Math.round(p.r * 2.6);
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [Math.cos(a) * p.r * 0.97, -0.28, Math.sin(a) * p.r * 0.97];
    });
  }, [p.r]);
  return (
    <group>
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[p.r, p.r, 0.4, 48]} />
        <meshStandardMaterial color={t.top} roughness={0.9} />
      </mesh>
      {rim.map((pos, i) => (
        <mesh key={i} position={pos} receiveShadow>
          <sphereGeometry args={[0.55, 10, 8]} />
          <meshStandardMaterial color={t.rim} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, -0.4 - p.h * 0.35, 0]}>
        <cylinderGeometry args={[p.r * 0.98, p.r * 0.6, p.h * 0.7, 32]} />
        <meshStandardMaterial color={t.body} roughness={1} />
      </mesh>
      <mesh position={[0, -0.4 - p.h * 0.7 - p.r * 0.35, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[p.r * 0.6, p.r * 0.7, 24]} />
        <meshStandardMaterial color={t.body} roughness={1} />
      </mesh>
      <Puff position={[0, -p.h - p.r * 0.35, 0]} scale={p.r * 0.2} seed={p.id + 11} count={7} />
    </group>
  );
}

function CloudLook({ p }) {
  const puffs = useMemo(() => {
    const n = 7;
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [Math.cos(a) * p.r * 0.75, -0.42, Math.sin(a) * p.r * 0.75];
    });
  }, [p.r]);
  return (
    <group>
      <mesh position={[0, -0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[p.r, p.r * 0.9, 0.36, 28]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      {puffs.map((pos, i) => (
        <mesh key={i} position={pos} scale={p.r * 0.42}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#f4fbff" roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, -0.55, 0]} scale={[p.r * 0.8, p.r * 0.45, p.r * 0.8]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#eef7ff" roughness={1} />
      </mesh>
    </group>
  );
}

function CrumbleLook({ p }) {
  const chips = useMemo(() => {
    const r = rng(p.id + 5);
    return Array.from({ length: 7 }, () => {
      const a = r() * Math.PI * 2;
      const d = r() * p.r * 0.75;
      return [Math.cos(a) * d, 0.01, Math.sin(a) * d];
    });
  }, [p.id, p.r]);
  return (
    <group>
      <mesh position={[0, -0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[p.r, p.r * 0.95, 0.44, 24]} />
        <meshStandardMaterial color="#f2c58a" roughness={0.9} />
      </mesh>
      {chips.map((c, i) => (
        <mesh key={i} position={c} scale={[1, 0.4, 1]}>
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshStandardMaterial color="#7a4a35" />
        </mesh>
      ))}
    </group>
  );
}

function SpringLook({ p, squashRef }) {
  return (
    <group ref={squashRef}>
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 0.3, 14]} />
        <meshStandardMaterial color="#fff2df" />
      </mesh>
      <mesh position={[0, -0.02, 0]} scale={[1, 0.45, 1]} castShadow>
        <sphereGeometry args={[p.r, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ff6f91" roughness={0.5} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * p.r * 0.55, 0.22, Math.sin(a) * p.r * 0.55]} scale={[1, 0.5, 1]}>
            <sphereGeometry args={[0.13, 8, 6]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        );
      })}
    </group>
  );
}

function FlowerLook({ p }) {
  const petals = 8;
  return (
    <group>
      <mesh position={[0, -0.18, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[p.r * 0.75, p.r * 0.7, 0.36, 24]} />
        <meshStandardMaterial color="#fff07a" roughness={0.7} />
      </mesh>
      {Array.from({ length: petals }, (_, i) => {
        const a = (i / petals) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * p.r * 0.8, -0.2, Math.sin(a) * p.r * 0.8]} rotation={[0, -a, 0]} scale={[1, 0.25, 0.65]} receiveShadow>
            <sphereGeometry args={[p.r * 0.42, 12, 8]} />
            <meshStandardMaterial color={i % 2 ? '#ff9ec4' : '#ffc0da'} roughness={0.8} />
          </mesh>
        );
      })}
      <mesh position={[0, -1.4, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 2.2, 8]} />
        <meshStandardMaterial color="#7fcf8a" />
      </mesh>
    </group>
  );
}

function CandyLook({ p }) {
  return (
    <group>
      <mesh position={[0, -p.h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[p.w, p.h, p.d]} />
        <meshStandardMaterial color="#ff9ec4" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[p.w + 0.06, 0.14, p.d + 0.06]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * p.w * 0.3, -p.h / 2, p.d / 2 + 0.01]}>
          <planeGeometry args={[0.25, p.h * 0.9]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

function TowerLook({ p }) {
  const crenels = 12;
  return (
    <group>
      <mesh position={[0, -p.h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[p.r * 0.92, p.r, p.h, 32]} />
        <meshStandardMaterial color="#e6dcff" roughness={0.85} />
      </mesh>
      {[3, 7, 11, 15].map((y, i) => (
        <mesh key={y} position={[0, -y, 0]}>
          <torusGeometry args={[p.r * 0.97, 0.12, 8, 40]} />
          <meshStandardMaterial color={i % 2 ? '#ffc0da' : '#bde6ff'} />
        </mesh>
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        const y = -2 - (i % 3) * 4.5;
        return (
          <mesh key={i} position={[Math.sin(a) * (p.r * 0.95), y, Math.cos(a) * (p.r * 0.95)]} rotation={[0, a, 0]}>
            <circleGeometry args={[0.35, 16]} />
            <meshStandardMaterial color="#7c6bb3" emissive="#ffe9a8" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[p.r + 0.15, p.r + 0.15, 0.2, 32]} />
        <meshStandardMaterial color="#fff6fb" roughness={0.9} />
      </mesh>
      {Array.from({ length: crenels }, (_, i) => {
        const a = (i / crenels) * Math.PI * 2;
        if (Math.cos(a) < -0.9) return null; // とびらの位置はあける
        return (
          <mesh key={i} position={[Math.sin(a) * (p.r + 0.05), 0.2, Math.cos(a) * (p.r + 0.05)]} rotation={[0, a, 0]}>
            <boxGeometry args={[0.5, 0.4, 0.3]} />
            <meshStandardMaterial color="#fff6fb" />
          </mesh>
        );
      })}
    </group>
  );
}

function RainbowCloudLook({ p }) {
  const colors = ['#ff9aa2', '#ffc29a', '#fff09a', '#b5f0a0', '#9ad8ff', '#c4a8ff'];
  return (
    <group>
      <CloudLook p={p} />
      {colors.map((c, i) => {
        const a = (i / colors.length) * Math.PI * 2;
        return (
          <mesh key={c} position={[Math.cos(a) * p.r * 0.95, -0.25, Math.sin(a) * p.r * 0.95]} scale={0.32}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.35} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

const LOOKS = { rainbow: RainbowCloudLook, island: IslandLook, cloud: CloudLook, crumble: CrumbleLook, flower: FlowerLook, candy: CandyLook, tower: TowerLook };

export function Platforms({ world }) {
  const refs = useRef({});
  const springRefs = useRef({});
  useFrame(() => {
    for (const p of world.platforms) {
      const g = refs.current[p.id];
      if (!g) continue;
      g.position.set(p.cx, p.cy, p.cz);
      g.rotation.y = p.angle;
      if (p.kind === 'crumble') {
        g.visible = p.crumble !== 'gone';
        if (p.crumble === 'shaking') {
          g.position.x += (Math.random() - 0.5) * 0.12;
          g.position.z += (Math.random() - 0.5) * 0.12;
        }
        const target = p.crumble === 'gone' ? 0.2 : 1;
        const s = g.scale.x + (target - g.scale.x) * 0.2;
        g.scale.setScalar(s);
      }
      const sp = springRefs.current[p.id];
      if (sp) {
        const k = p.squash;
        sp.scale.set(1 + k * 0.25, 1 - Math.sin(k * Math.PI) * 0.45 + k * 0.1, 1 + k * 0.25);
      }
    }
  });
  return (
    <group>
      {world.platforms.map((p) => {
        const Look = LOOKS[p.look];
        return (
          <group key={p.id} ref={(el) => (refs.current[p.id] = el)} position={[p.x, p.y, p.z]}>
            {p.look === 'spring' ? (
              <SpringLook p={p} squashRef={(el) => (springRefs.current[p.id] = el)} />
            ) : Look ? (
              <StaticMerge>
                <Look p={p} />
              </StaticMerge>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

// ---------- 飾り（当たり判定なし） ----------
function Tree({ position, scale = 1, color = '#ffc2dc', seed = 1 }) {
  const r = rng(seed);
  const puffs = [0, 1, 2, 3].map(() => [(r() - 0.5) * 1.1, 2 + r() * 0.8, (r() - 0.5) * 1.1, 0.6 + r() * 0.35]);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.26, 1.8, 8]} />
        <meshStandardMaterial color="#c99a7a" />
      </mesh>
      {puffs.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={s} castShadow>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Flowers({ center, radius, count, seed, avoid = [] }) {
  const list = useMemo(() => {
    const r = rng(seed);
    const colors = ['#ff8fb1', '#fff07a', '#ffffff', '#b7a6ff', '#8fd8ff'];
    const out = [];
    while (out.length < count) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * radius;
      const x = center[0] + Math.cos(a) * d, z = center[2] + Math.sin(a) * d;
      if (avoid.some(([ax, az, ar]) => Math.hypot(x - ax, z - az) < ar)) continue;
      out.push({ pos: [x, center[1], z], color: colors[out.length % colors.length], s: 0.7 + r() * 0.6 });
    }
    return out;
  }, [center, radius, count, seed, avoid]);
  return list.map((f, i) => (
    <group key={i} position={f.pos} scale={f.s}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
        <meshStandardMaterial color="#6cc47a" />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color={f.color} emissive={f.color} emissiveIntensity={0.15} />
      </mesh>
    </group>
  ));
}

function Windmill({ position }) {
  const blades = useRef();
  useFrame((_, dt) => blades.current && (blades.current.rotation.z += dt * 1.2));
  return (
    <group position={position} rotation={[0, 0.5, 0]}>
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.7, 1.1, 4, 12]} />
        <meshStandardMaterial color="#fff3e6" />
      </mesh>
      <mesh position={[0, 4.4, 0]} castShadow>
        <coneGeometry args={[1.0, 1.2, 12]} />
        <meshStandardMaterial color="#ff9ec4" />
      </mesh>
      <mesh position={[0, 1, 0.98]}>
        <boxGeometry args={[0.6, 1, 0.1]} />
        <meshStandardMaterial color="#c99a7a" />
      </mesh>
      <group ref={blades} position={[0, 3.4, 0.85]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 0, 0]}>
            <boxGeometry args={[0.35, 3.2, 0.06]} />
            <meshStandardMaterial color={i % 2 ? '#bde6ff' : '#fff07a'} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.2, 10, 8]} />
          <meshStandardMaterial color="#ff8fb1" />
        </mesh>
      </group>
    </group>
  );
}

function House({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <ModelSlot
        id="house"
        height={3.2}
        fallback={
          <group>
            <mesh position={[0, 1, 0]} castShadow>
              <cylinderGeometry args={[1.3, 1.4, 2, 16]} />
              <meshStandardMaterial color="#fff3e6" />
            </mesh>
            <mesh position={[0, 2.6, 0]} castShadow>
              <coneGeometry args={[1.7, 1.4, 16]} />
              <meshStandardMaterial color="#9ad8ff" />
            </mesh>
            <mesh position={[0, 0.6, 1.33]}>
              <boxGeometry args={[0.6, 1.1, 0.1]} />
              <meshStandardMaterial color="#ff9ec4" />
            </mesh>
            <mesh position={[0.75, 1.3, 1.12]} rotation={[0, 0.5, 0]}>
              <circleGeometry args={[0.25, 12]} />
              <meshStandardMaterial color="#7c6bb3" emissive="#ffe9a8" emissiveIntensity={0.4} />
            </mesh>
          </group>
        }
      />
    </group>
  );
}

const AVOID1 = [[0, 7, 1.5], [-6, -3, 1.5], [7.2, 5.5, 2]];
const AVOID3 = [[0, -70, 4]];

export function Decorations() {
  return (
    <group>
      <Windmill position={[-5, 0, -40]} />
      <House position={[7.2, 0, 5.5]} rotation={-0.9} />
      <StaticMerge>
      {/* 島1 */}
      <Tree position={[-8, 0, 3]} seed={3} />
      <Tree position={[-4, 0, 9]} seed={5} color="#bfe6ff" />
      <Tree position={[-2.5, 0, -9]} seed={8} color="#fff0a8" scale={0.9} />
      <Tree position={[-9, 0, -1]} seed={9} scale={0.8} />
      <Flowers center={[0, 0, 0]} radius={9.5} count={40} seed={11} avoid={AVOID1} />
      {/* 島2 */}
      <Tree position={[6, 0, -39]} seed={12} color="#c4a8ff" />
      <Tree position={[-7.5, 0, -28.5]} seed={13} color="#ffc2dc" scale={0.85} />
      <Flowers center={[0, 0, -34]} radius={8.5} count={30} seed={21} />
      {/* 島3 */}
      <Tree position={[6, 0, -66]} seed={17} color="#bfe6ff" scale={0.85} />
      <Tree position={[-6.5, 0, -72]} seed={19} color="#fff0a8" scale={0.85} />
      <Flowers center={[0, 0, -70]} radius={8} count={24} seed={31} avoid={AVOID3} />
      <Rainbow position={[-38, -10, -55]} rotation={[0, Math.PI / 2.6, 0]} radius={26} />
      </StaticMerge>
    </group>
  );
}
