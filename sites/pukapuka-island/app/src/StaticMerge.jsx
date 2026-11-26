// 動かない飾りを、同じ見た目（マテリアル）ごとに1つのメッシュへまとめる。
// 描画命令の数が大きく減るので、スマホでも軽く動く。
import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const KEEP = ['position', 'normal', 'uv'];

function materialKey(o) {
  const m = o.material;
  return [
    m.type,
    m.color?.getHexString(),
    m.emissive?.getHexString(),
    m.emissiveIntensity,
    m.opacity,
    m.transparent,
    m.roughness,
    m.side,
    m.fog,
    o.castShadow,
    o.receiveShadow,
  ].join('|');
}

export default function StaticMerge({ children }) {
  const src = useRef();
  const out = useRef();

  useLayoutEffect(() => {
    const root = src.current;
    const target = out.current;
    root.updateWorldMatrix(true, true);
    const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
    const groups = new Map();
    root.traverse((o) => {
      if (!o.isMesh || Array.isArray(o.material)) return;
      const key = materialKey(o);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(o);
    });

    const made = [];
    const rel = new THREE.Matrix4();
    for (const list of groups.values()) {
      let geos = list.map((o) => {
        const g = new THREE.BufferGeometry();
        KEEP.forEach((n) => o.geometry.attributes[n] && g.setAttribute(n, o.geometry.attributes[n].clone()));
        if (o.geometry.index) g.setIndex(o.geometry.index.clone());
        g.applyMatrix4(rel.multiplyMatrices(inv, o.matrixWorld));
        return g;
      });
      if (geos.some((g) => !g.index) && geos.some((g) => g.index)) geos = geos.map((g) => (g.index ? g.toNonIndexed() : g));
      const names = KEEP.filter((n) => geos.every((g) => g.attributes[n]));
      geos.forEach((g) => Object.keys(g.attributes).forEach((n) => !names.includes(n) && g.deleteAttribute(n)));
      const merged = mergeGeometries(geos, false);
      geos.forEach((g) => g.dispose());
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, list[0].material);
      mesh.castShadow = list[0].castShadow;
      mesh.receiveShadow = list[0].receiveShadow;
      target.add(mesh);
      made.push(mesh);
    }
    root.visible = false;
    return () => {
      made.forEach((m) => {
        target.remove(m);
        m.geometry.dispose();
      });
      root.visible = true;
    };
  }, []);

  return (
    <>
      <group ref={src}>{children}</group>
      <group ref={out} />
    </>
  );
}
