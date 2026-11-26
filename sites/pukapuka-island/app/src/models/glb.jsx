// Tripo などで作った GLB を読み込み、なければ仮モデルを表示する仕組み。
// public/models/config.json に書かれたファイルが見つかれば自動で差し替わる。
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const BASE = import.meta.env.BASE_URL + 'models/';
const registry = new Map(); // id -> { status, gltf, cfg }
const listeners = new Set();
let started = false;

const notify = () => listeners.forEach((l) => l());

function makeLoader() {
  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);
  return loader;
}

export function loadModelConfig() {
  if (started) return;
  started = true;
  fetch(BASE + 'config.json', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : {}))
    .then((config) => {
      const loader = makeLoader();
      Object.entries(config).forEach(([id, cfg]) => {
        if (!cfg || !cfg.file || id.startsWith('_')) return;
        registry.set(id, { status: 'loading', cfg });
        loader.load(
          BASE + cfg.file,
          (gltf) => {
            registry.set(id, { status: 'ready', gltf, cfg });
            console.info(`[models] ${id}: ${cfg.file} を読み込みました`);
            notify();
          },
          undefined,
          () => {
            registry.set(id, { status: 'missing', cfg });
            notify();
          },
        );
      });
      notify();
    })
    .catch(() => {});
}

function useModel(id) {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);
  return registry.get(id);
}

function GlbInstance({ gltf, cfg, height, tint }) {
  const mixer = useRef(null);
  const object = useMemo(() => {
    const root = skeletonClone(gltf.scene);
    root.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (tint && o.material) {
          o.material = o.material.clone();
          o.material.color = new THREE.Color(tint).multiply(o.material.color || new THREE.Color(1, 1, 1));
        }
      }
    });
    // 大きさをそろえる：高さを height にし、足元を y=0、中心を原点へ
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const targetH = (cfg.height ?? height) || 1;
    const s = (targetH / (size.y || 1)) * (cfg.scale ?? 1);
    const center = box.getCenter(new THREE.Vector3());
    const wrap = new THREE.Group();
    const inner = new THREE.Group();
    inner.add(root);
    root.position.set(-center.x, -box.min.y, -center.z);
    inner.scale.setScalar(s);
    inner.rotation.y = THREE.MathUtils.degToRad(cfg.rotationY ?? 0);
    const off = cfg.offset || [0, 0, 0];
    inner.position.set(off[0], off[1], off[2]);
    wrap.add(inner);

    if (gltf.animations?.length) {
      mixer.current = new THREE.AnimationMixer(root);
      const clip = gltf.animations.find((a) => a.name === cfg.animation) || gltf.animations[0];
      mixer.current.clipAction(clip).play();
    }
    return wrap;
  }, [gltf, cfg, height, tint]);

  useFrame((_, dt) => mixer.current?.update(dt));
  return <primitive object={object} />;
}

/**
 * <ModelSlot id="hero" height={1.1} fallback={<HeroToy />} />
 * GLB があればそれを、なければ fallback（仮モデル）を表示する。
 */
export function ModelSlot({ id, height, fallback, tint }) {
  const entry = useModel(id);
  if (entry?.status === 'ready') return <GlbInstance gltf={entry.gltf} cfg={entry.cfg} height={height} tint={tint} />;
  return fallback;
}

export function useHasGlb(id) {
  return useModel(id)?.status === 'ready';
}
