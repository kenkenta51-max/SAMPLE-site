// 3D シーン全体とメインループ（ゲーム処理 → カメラ）
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createWorld, step, stepIdle, respawnAtCheckpoint } from './game.js';
import { readInput, attachCameraDrag } from './input.js';
import { store } from './store.js';
import { sfx } from './audio.js';
import { Sky, FarClouds, Platforms, Decorations } from './environment.jsx';
import { Items, Enemies, Checkpoints, GateAndBoss, Particles, Player, Fairy } from './entities.jsx';
import { BOSS_POS, GATE } from './level.js';

export const worldRef = { current: null };

export default function Scene() {
  const world = useMemo(() => createWorld(), []);
  worldRef.current = world;
  const { camera, gl, size } = useThree();
  if (typeof window !== 'undefined') window.__pukapuka = world; // デバッグ・自動テスト用
  const sun = useRef();
  const tgt = useMemo(() => new THREE.Vector3(0, 1.2, 7), []);
  const camPos = useMemo(() => new THREE.Vector3(0, 6, 16), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const secs = useRef(0);

  useEffect(() => attachCameraDrag(gl.domElement), [gl]);

  // ゲームオーバー画面の「やりなおす」から呼ばれる
  useEffect(() => {
    const onRetry = () => respawnAtCheckpoint(world, true);
    window.addEventListener('pukapuka:retry', onRetry);
    return () => window.removeEventListener('pukapuka:retry', onRetry);
  }, [world]);

  useFrame((_, rawDt) => {
    // 星のかけらを取った瞬間は少しだけスローモーション
    const slow = world.slowmo > 0 ? 0.3 : 1;
    world.slowmo = Math.max(0, world.slowmo - Math.min(rawDt, 0.1));
    const frameDt = Math.min(rawDt, 0.1) * slow;
    const dt = Math.min(frameDt, 1 / 30);
    const s = store.get();
    const portrait = size.width < size.height;
    const dist = portrait ? 12.5 : 9.5;
    const fov = portrait ? 62 : 50;
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    const pl = world.player;
    const c = world.cam;

    if (s.phase === 'playing') {
      const inp = readInput();
      // 処理が重い端末でも同じ速さで動くよう、細かく分けて進める
      let rest = frameDt;
      let first = true;
      while (rest > 1e-5) {
        const h = Math.min(rest, 1 / 60);
        step(world, h, first ? inp : { ...inp, jumpPressed: false });
        first = false;
        rest -= h;
        if (store.get().phase !== 'playing') break;
      }
      // カメラ操作
      if (inp.camDX || inp.camDY || inp.camKeys) c.lastManual = world.t;
      c.yaw -= inp.camDX * 0.006;
      c.yaw += inp.camKeys * dt * 2.2;
      c.pitch = THREE.MathUtils.clamp(c.pitch + inp.camDY * 0.004, 0.12, 1.0);
      // 前に進んでいるときは少しずつ背中側へ回りこむ
      if (world.t - c.lastManual > 1.5 && inp.y > 0.5 && Math.abs(inp.x) < 0.5) {
        let d = pl.facing + Math.PI - c.yaw;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        c.yaw += d * Math.min(1, dt * 0.8);
      }
      secs.current += frameDt;
      if (Math.floor(secs.current) !== s.time) store.set({ time: Math.floor(secs.current) });
    } else if (s.phase === 'clearing') {
      world.t += dt;
      world.clearT += dt;
      stepIdle(world, 0);
      if (world.clearT > 1.1 && world.clearT - dt <= 1.1) store.hint('……だれじゃ。ワシの ねむりを じゃまするのは……', 'ゴロゴロ雲の王', 0);
      if (world.clearT > 4.6) {
        store.set({ phase: 'clear', hint: null });
        sfx('clear');
      }
    } else if (s.phase === 'title') {
      stepIdle(world, dt);
      c.yaw += dt * 0.12;
    } else {
      readInput(); // ポーズ中に押したボタンをためこまない
    }

    // ---- カメラ ----
    if (s.phase === 'clearing' || s.phase === 'clear') {
      const k = Math.min(1, dt * 1.2);
      camPos.lerp(new THREE.Vector3(GATE.pos[0] + 3, GATE.pos[1] + 2.5, GATE.pos[2] + 7.5), k);
      tgt.lerp(new THREE.Vector3(BOSS_POS[0], BOSS_POS[1] - 2, BOSS_POS[2]), k);
    } else {
      const k = Math.min(1, dt * 9);
      tgt.x += (pl.pos[0] - tgt.x) * k;
      tgt.z += (pl.pos[2] - tgt.z) * k;
      tgt.y += (pl.pos[1] + 1.2 - tgt.y) * Math.min(1, dt * 4.5);
      const d = (s.phase === 'title' ? dist + 6 : dist) * (c.zoom || 1);
      const p = s.phase === 'title' ? 0.35 : c.pitch;
      camPos.set(
        tgt.x + Math.sin(c.yaw) * Math.cos(p) * d,
        tgt.y + Math.sin(p) * d,
        tgt.z + Math.cos(c.yaw) * Math.cos(p) * d,
      );
    }
    camera.position.copy(camPos);
    // ボス登場のときは画面がゆれる
    if (s.phase === 'clearing' && world.clearT > 0.9 && world.clearT < 2.6) {
      const amp = 0.18 * (1 - (world.clearT - 0.9) / 1.7);
      camera.position.x += (Math.random() - 0.5) * amp;
      camera.position.y += (Math.random() - 0.5) * amp;
    }
    look.copy(tgt);
    camera.lookAt(look);

    // 影用の太陽光はプレイヤーについていく
    if (sun.current) {
      sun.current.position.set(pl.pos[0] + 8, pl.pos[1] + 16, pl.pos[2] + 6);
      sun.current.target.position.set(pl.pos[0], pl.pos[1], pl.pos[2]);
      sun.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <color attach="background" args={['#d9f0ff']} />
      <fog attach="fog" args={['#e6f4ff', 45, 150]} />
      <hemisphereLight args={['#eaf6ff', '#ffd6e8', 1.25]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        ref={sun}
        intensity={1.9}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0008}
      />
      <Sky />
      <FarClouds />
      <Platforms world={world} />
      <Decorations />
      <Checkpoints world={world} />
      <Items world={world} />
      <Enemies world={world} />
      <GateAndBoss world={world} />
      <Player world={world} />
      <Fairy world={world} />
      <Particles world={world} />
    </>
  );
}
