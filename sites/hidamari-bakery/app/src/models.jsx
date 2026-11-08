import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import { mat, canvasTexture, PALETTE } from './materials.js';

// ───────── パン（Canvaのメニュー10種をローポリで再構築）
// それぞれ原点＝底面の中心、幅はおよそ0.8

function MelonPan() {
  const map = useMemo(() => {
    const t = canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#F6CB74';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#DDA14A';
      ctx.lineWidth = 9;
      for (let i = -w; i < w * 2; i += 46) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i, h); ctx.lineTo(i + h, 0); ctx.stroke();
      }
    });
    return t;
  }, []);
  const m = useMemo(() => new THREE.MeshStandardMaterial({ map, flatShading: true, roughness: 0.8 }), [map]);
  return (
    <group>
      <mesh material={m} scale={[1, 0.72, 1]}>
        <sphereGeometry args={[0.4, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={mat('#E7AE57')} position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.4, 0.37, 0.05, 12]} />
      </mesh>
    </group>
  );
}

function Croissant() {
  const segs = [-2, -1, 0, 1, 2];
  return (
    <group rotation={[0, 0.3, 0]}>
      {segs.map((i) => {
        const a = i * 0.42;
        const r = 0.2 - Math.abs(i) * 0.04;
        return (
          <mesh key={i} material={mat(Math.abs(i) % 2 ? '#C9762F' : '#DE9442')}
            position={[Math.sin(a) * 0.42, r * 0.85, -Math.cos(a) * 0.42 + 0.42]}
            rotation={[0, -a, 0]} scale={[r * 1.25, r * 0.95, r * 1.05]}>
            <icosahedronGeometry args={[1, 0]} />
          </mesh>
        );
      })}
    </group>
  );
}

function BearPan() {
  return (
    <group>
      <mesh material={mat('#D99D57')} position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.36, 0.33, 0.16, 10]} />
      </mesh>
      <mesh material={mat('#FBF7EF')} position={[0, 0.18, 0]} scale={[1, 0.55, 0.95]}>
        <sphereGeometry args={[0.37, 10, 7]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={mat('#F6EEE0')} position={[s * 0.25, 0.22, -0.25]} scale={[1, 0.6, 1]}>
          <sphereGeometry args={[0.12, 7, 5]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={'e' + s} material={mat('#3B2116')} position={[s * 0.12, 0.38, 0.04]}>
          <sphereGeometry args={[0.035, 6, 4]} />
        </mesh>
      ))}
      <mesh material={mat('#3B2116')} position={[0, 0.38, 0.13]} scale={[1.3, 0.8, 1]}>
        <sphereGeometry args={[0.035, 6, 4]} />
      </mesh>
    </group>
  );
}

function Danish() {
  const cherries = [[0, 0], [0.09, 0.05], [-0.08, 0.07], [0.05, -0.08], [-0.07, -0.06]];
  return (
    <group>
      <mesh material={mat('#D69A4B')} position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.38, 0.36, 0.16, 9]} />
      </mesh>
      <mesh material={mat('#F9EDD3')} position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.04, 9]} />
      </mesh>
      {cherries.map(([x, z], i) => (
        <mesh key={i} material={mat('#A61D34', { roughness: 0.4 })} position={[x, 0.22, z]}>
          <icosahedronGeometry args={[0.07, 0]} />
        </mesh>
      ))}
    </group>
  );
}

function Kuppe() {
  return (
    <group rotation={[0, 0.4, 0]}>
      <mesh material={mat('#D8924A')} position={[0, 0.2, 0]} scale={[1.45, 0.75, 1]}>
        <sphereGeometry args={[0.3, 9, 6]} />
      </mesh>
      <mesh material={mat('#FAF0D2')} position={[0, 0.405, 0]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.62, 0.05, 0.11]} />
      </mesh>
    </group>
  );
}

function Wiener() {
  return (
    <group rotation={[0, -0.35, 0]}>
      <mesh material={mat('#E3A24E')} position={[0, 0.22, 0]} scale={[1.5, 0.8, 0.9]}>
        <sphereGeometry args={[0.28, 9, 6]} />
      </mesh>
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} material={mat('#F2CB7A')} position={[x, 0.22, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.92]}>
          <torusGeometry args={[0.235, 0.035, 4, 9]} />
        </mesh>
      ))}
      <mesh material={mat('#B83C2C', { roughness: 0.45 })} position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.085, 0.085, 1.0, 7]} />
      </mesh>
    </group>
  );
}

function Shokupan() {
  return (
    <group>
      <mesh material={mat('#F6E3BA')} position={[0, 0.21, 0]}>
        <boxGeometry args={[0.66, 0.42, 0.46]} />
      </mesh>
      <mesh material={mat('#CF8C43')} position={[0, 0.42, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.6, 1, 1]}>
        <cylinderGeometry args={[0.235, 0.235, 0.68, 8, 1, false, 0, Math.PI]} />
      </mesh>
      <mesh material={mat('#F6E3BA')} position={[0.12, 0.04, 0.38]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.07, 0.36]} />
      </mesh>
    </group>
  );
}

function ButterToast() {
  return (
    <group rotation={[0, 0.3, 0]}>
      <mesh material={mat('#E2AF5E')} position={[0, 0.1, 0]}>
        <boxGeometry args={[0.62, 0.2, 0.62]} />
      </mesh>
      <mesh material={mat('#F7CF78')} position={[0, 0.205, 0]}>
        <boxGeometry args={[0.56, 0.02, 0.56]} />
      </mesh>
      {[0, Math.PI / 2].map((r) => (
        <mesh key={r} material={mat('#C98A3E')} position={[0, 0.215, 0]} rotation={[0, r, 0]}>
          <boxGeometry args={[0.56, 0.012, 0.025]} />
        </mesh>
      ))}
      <mesh material={mat('#FFE36E', { roughness: 0.35 })} position={[0, 0.28, 0]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.17, 0.12, 0.17]} />
      </mesh>
    </group>
  );
}

function Pretzel() {
  const geo = useMemo(() => {
    const pts = [[0, -0.9], [0.6, -0.72], [0.95, -0.1], [0.78, 0.55], [0.32, 0.62], [0, 0.18], [-0.32, 0.62], [-0.78, 0.55], [-0.95, -0.1], [-0.6, -0.72]]
      .map(([x, z]) => new THREE.Vector3(x * 0.38, 0, z * 0.38));
    const curve = new THREE.CatmullRomCurve3(pts, true);
    return new THREE.TubeGeometry(curve, 40, 0.075, 5, true);
  }, []);
  return (
    <group position={[0, 0.08, 0]}>
      <mesh geometry={geo} material={mat('#B9682E')} />
      {[[0.25, -0.25], [-0.28, -0.2], [0.3, 0.12], [-0.3, 0.15], [0, -0.33]].map(([x, z], i) => (
        <mesh key={i} material={mat('#FFFFFF')} position={[x, 0.07, z]}>
          <boxGeometry args={[0.03, 0.03, 0.03]} />
        </mesh>
      ))}
    </group>
  );
}

function Baguette() {
  return (
    <group>
      <mesh material={mat('#9A5B33')} position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.24, 0.2, 0.36, 8, 1, true]} />
      </mesh>
      <mesh material={mat('#8A4F2B')} position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 8]} />
      </mesh>
      {[[-0.05, 0.25], [0.08, -0.2]].map(([x, rz], i) => (
        <group key={i} position={[x, 0.55, i * 0.04]} rotation={[0, i * 0.6, rz]}>
          <mesh material={mat('#C98944')}>
            <capsuleGeometry args={[0.085, 0.75, 3, 7]} />
          </mesh>
          {[-0.22, 0, 0.22].map((y) => (
            <mesh key={y} material={mat('#EAC283')} position={[0, y, 0.075]} rotation={[0.5, 0, 0]}>
              <boxGeometry args={[0.07, 0.11, 0.02]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export const BREADS = {
  melonpan: { C: MelonPan, name: 'めろんぱん' },
  croissant: { C: Croissant, name: 'くろわっさん' },
  bear: { C: BearPan, name: 'くまさんのぱん' },
  danish: { C: Danish, name: 'でにっしゅ' },
  kuppe: { C: Kuppe, name: 'くっぺ' },
  wiener: { C: Wiener, name: 'うぃんなーぱん' },
  shokupan: { C: Shokupan, name: 'しょくぱん' },
  butterToast: { C: ButterToast, name: 'ばたーとーすと' },
  pretzel: { C: Pretzel, name: 'ろっげんぶろーと' },
  baguette: { C: Baguette, name: 'ばげっと' },
};

export function Dough(props) {
  return (
    <mesh material={mat('#F7E8C9')} scale={[1, 0.8, 1]} {...props}>
      <icosahedronGeometry args={[0.22, 1]} />
    </mesh>
  );
}

// ───────── 小物
export const Sack = forwardRef(function Sack(props, ref) {
  return (
    <group ref={ref} {...props}>
      <mesh material={mat('#F4EBD9')} position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.27, 0.33, 0.7, 6]} />
      </mesh>
      <mesh material={mat(PALETTE.terracotta)} position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.3, 0.31, 0.12, 6]} />
      </mesh>
      <mesh material={mat('#E3D6BC')} position={[0, 0.78, 0]}>
        <coneGeometry args={[0.16, 0.2, 6]} />
      </mesh>
    </group>
  );
});

export function Tongs(props) {
  return (
    <group {...props}>
      {[-1, 1].map((s) => (
        <mesh key={s} material={mat(PALETTE.brown)} position={[0.25, 0.04, s * 0.05]} rotation={[0, s * 0.12, 0]}>
          <boxGeometry args={[0.75, 0.04, 0.06]} />
        </mesh>
      ))}
      <mesh material={mat('#7A3A14')} position={[-0.15, 0.04, 0]}>
        <boxGeometry args={[0.18, 0.06, 0.12]} />
      </mesh>
    </group>
  );
}

export function PriceTag({ tex, ...props }) {
  return (
    <group {...props}>
      <mesh material={mat('#8A4F2B')} position={[0, 0.12, 0]}>
        <boxGeometry args={[0.02, 0.24, 0.02]} />
      </mesh>
      <mesh position={[0, 0.3, 0.012]}>
        <planeGeometry args={[0.34, 0.2]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ───────── 人物
export const Person = forwardRef(function Person({ shirt = '#7CC6E8', hair = '#3B2A20', skin = '#F7D3B5', chef = false, ...props }, ref) {
  return (
    <group ref={ref} {...props}>
      {[-0.1, 0.1].map((x) => (
        <mesh key={x} material={mat('#4A4A5A')} position={[x, 0.22, 0]} name={x < 0 ? 'legL' : 'legR'}>
          <boxGeometry args={[0.12, 0.44, 0.14]} />
        </mesh>
      ))}
      <mesh material={mat(shirt)} position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.2, 0.27, 0.6, 7]} />
      </mesh>
      {chef && (
        <mesh material={mat('#F2B8A0')} position={[0, 0.66, 0.17]} rotation={[-0.15, 0, 0]}>
          <boxGeometry args={[0.36, 0.5, 0.04]} />
        </mesh>
      )}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.27, 0.95, 0]} name={s < 0 ? 'armL' : 'armR'}>
          <mesh material={mat(shirt)} position={[0, -0.2, 0]}>
            <boxGeometry args={[0.1, 0.42, 0.12]} />
          </mesh>
          <mesh material={mat(skin)} position={[0, -0.44, 0]}>
            <icosahedronGeometry args={[0.07, 0]} />
          </mesh>
        </group>
      ))}
      <mesh material={mat(skin)} position={[0, 1.24, 0]}>
        <icosahedronGeometry args={[0.24, 1]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={'eye' + s} material={mat('#2B1D16')} position={[s * 0.08, 1.27, 0.215]}>
          <sphereGeometry args={[0.028, 5, 4]} />
        </mesh>
      ))}
      <mesh material={mat('#F29A9A')} position={[0.13, 1.19, 0.19]}>
        <sphereGeometry args={[0.035, 5, 4]} />
      </mesh>
      <mesh material={mat('#F29A9A')} position={[-0.13, 1.19, 0.19]}>
        <sphereGeometry args={[0.035, 5, 4]} />
      </mesh>
      {chef ? (
        <group position={[0, 1.42, 0]}>
          <mesh material={mat('#FFFFFF')} position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.16, 8]} />
          </mesh>
          <mesh material={mat('#FFFFFF')} position={[0, 0.25, 0]} scale={[1, 0.75, 1]}>
            <icosahedronGeometry args={[0.27, 1]} />
          </mesh>
        </group>
      ) : (
        <group>
          <mesh material={mat(hair)} position={[0, 1.31, -0.03]} scale={[1.05, 0.85, 1.05]}>
            <sphereGeometry args={[0.25, 8, 5, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
          </mesh>
          <mesh material={mat(hair)} position={[0, 1.22, -0.08]} scale={[1, 1, 0.8]}>
            <icosahedronGeometry args={[0.24, 1]} />
          </mesh>
        </group>
      )}
    </group>
  );
});

// ───────── 小麦粉トラック
export const Truck = forwardRef(function Truck({ headlight, ...props }, ref) {
  return (
    <group ref={ref} {...props}>
      <mesh material={mat('#6E6E78')} position={[0, 0.55, 0]}>
        <boxGeometry args={[2.7, 0.35, 1.3]} />
      </mesh>
      {/* 荷台 */}
      <mesh material={mat(PALETTE.gray)} position={[-0.55, 0.8, 0]}>
        <boxGeometry args={[1.6, 0.15, 1.3]} />
      </mesh>
      {[-0.62, 0.62].map((z) => (
        <mesh key={z} material={mat(PALETTE.yellow)} position={[-0.55, 1.05, z]}>
          <boxGeometry args={[1.6, 0.36, 0.08]} />
        </mesh>
      ))}
      <mesh material={mat(PALETTE.yellow)} position={[-1.33, 1.05, 0]}>
        <boxGeometry args={[0.08, 0.36, 1.3]} />
      </mesh>
      {/* 運転席 */}
      <mesh material={mat(PALETTE.yellow)} position={[0.75, 1.25, 0]}>
        <boxGeometry args={[1.1, 1.05, 1.3]} />
      </mesh>
      <mesh material={mat('#FFFFFF')} position={[0.75, 1.82, 0]}>
        <boxGeometry args={[1.12, 0.1, 1.32]} />
      </mesh>
      <mesh material={mat('#9FD6EA', { roughness: 0.2 })} position={[1.31, 1.42, 0]}>
        <boxGeometry args={[0.04, 0.45, 1.05]} />
      </mesh>
      {[-0.66, 0.66].map((z) => (
        <mesh key={'w' + z} material={mat('#9FD6EA', { roughness: 0.2 })} position={[0.8, 1.42, z]}>
          <boxGeometry args={[0.6, 0.4, 0.03]} />
        </mesh>
      ))}
      {[-0.45, 0.45].map((z) => (
        <mesh key={'h' + z} position={[1.32, 0.85, z]} material={headlight}>
          <boxGeometry args={[0.04, 0.16, 0.22]} />
        </mesh>
      ))}
      <mesh material={mat(PALETTE.terracotta)} position={[0.75, 1.05, 0.66]}>
        <boxGeometry args={[0.7, 0.16, 0.02]} />
      </mesh>
      <mesh material={mat(PALETTE.terracotta)} position={[0.75, 1.05, -0.66]}>
        <boxGeometry args={[0.7, 0.16, 0.02]} />
      </mesh>
      {[[-0.85, 0.66], [-0.85, -0.66], [0.85, 0.66], [0.85, -0.66]].map(([x, z]) => (
        <group key={x + '' + z} position={[x, 0.32, z]} name="wheel">
          <mesh material={mat('#2E2E36')} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.22, 8]} />
          </mesh>
          <mesh material={mat('#DADADA')} position={[0, 0, z > 0 ? 0.115 : -0.115]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

// ───────── 木・家・雲
export function Tree({ s = 1, c = '#7CC26A', ...props }) {
  return (
    <group scale={s} {...props}>
      <mesh material={mat('#9A6A43')} position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.8, 5]} />
      </mesh>
      <mesh material={mat(c)} position={[0, 1.2, 0]}>
        <icosahedronGeometry args={[0.65, 0]} />
      </mesh>
      <mesh material={mat(c)} position={[0.25, 1.65, 0.1]}>
        <icosahedronGeometry args={[0.42, 0]} />
      </mesh>
    </group>
  );
}

const prismCache = new Map();
export function prism(w, h, depth) {
  const key = [w, h, depth].join();
  if (!prismCache.has(key)) {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0);
    shape.lineTo(w / 2, 0);
    shape.lineTo(0, h);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    prismCache.set(key, g);
  }
  return prismCache.get(key);
}

export function House({ wall, roof, windowMat, w = 2.6, d = 2.4, h = 2.2, ...props }) {
  return (
    <group {...props}>
      <mesh material={mat(wall)} position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <mesh material={mat(roof)} position={[0, h, 0]} geometry={prism(d + 0.4, 1.2, w + 0.3)} rotation={[0, Math.PI / 2, 0]} />
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} material={windowMat} position={[x, h * 0.6, d / 2 + 0.01]}>
          <planeGeometry args={[0.5, 0.55]} />
        </mesh>
      ))}
      <mesh material={mat('#8A5A3C')} position={[0, 0.45, d / 2 + 0.01]}>
        <planeGeometry args={[0.45, 0.9]} />
      </mesh>
    </group>
  );
}

export function Cloud(props) {
  return (
    <group {...props}>
      {[[0, 0, 0, 1], [0.9, -0.15, 0.1, 0.75], [-0.85, -0.2, 0, 0.7], [0.3, 0.45, -0.1, 0.65]].map(([x, y, z, r], i) => (
        <mesh key={i} material={mat('#FFFFFF')} position={[x, y, z]} userData={{ noShadow: true }}>
          <icosahedronGeometry args={[r, 0]} />
        </mesh>
      ))}
    </group>
  );
}
