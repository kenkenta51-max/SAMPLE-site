import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Scene from './Scene.jsx';
import TouchControls from './ui/TouchControls.jsx';
import { store, useStore } from './store.js';
import { initAudio, startBgm, stopBgm, setMuted, sfx } from './audio.js';
import { clearInput } from './input.js';
import { loadModelConfig } from './models/glb.jsx';

loadModelConfig();

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function Hud() {
  const s = useStore((x) => x);
  if (!['playing', 'paused', 'clearing'].includes(s.phase)) return null;
  return (
    <div className="hud">
      <div className="hud-top">
        <div className="pill hearts" aria-label={`ライフ ${s.hearts}`}>
          {Array.from({ length: s.maxHearts }, (_, i) => (
            <span key={i} className={i < s.hearts ? 'heart on' : 'heart'}>♥</span>
          ))}
        </div>
        <div className="pill">
          <span className="drop-icon" />
          {s.drops}
          <small>/{s.totalDrops}</small>
        </div>
        <div className="pill stars" aria-label={`星のかけら ${s.stars}/3`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < s.stars ? 'star on' : 'star'}>★</span>
          ))}
        </div>
        <div className="pill time">{fmt(s.time)}</div>
        <div className="hud-buttons">
          <button
            className="icon-btn"
            aria-label={s.muted ? '音を出す' : '音を消す'}
            onClick={() => {
              setMuted(!s.muted);
              store.set({ muted: !s.muted });
            }}
          >
            {s.muted ? '🔇' : '🔊'}
          </button>
          {s.phase === 'playing' && (
            <button
              className="icon-btn"
              aria-label="ポーズ"
              onClick={() => {
                sfx('ui');
                store.set({ phase: 'paused' });
              }}
            >
              Ⅱ
            </button>
          )}
        </div>
      </div>
      {s.banner && (
        <div className="banner" key={s.banner.id}>
          {s.banner.text}
        </div>
      )}
      {s.toast && (
        <div className="toast" key={s.toast.id}>
          {s.toast.text}
        </div>
      )}
      {s.hint && (
        <div className={s.hint.speaker === 'ティア' ? 'hint' : 'hint boss'} key={s.hint.id}>
          <b>{s.hint.speaker}</b>
          <p>{s.hint.text}</p>
        </div>
      )}
    </div>
  );
}

function Title({ onStart }) {
  return (
    <div className="screen title-screen">
      <div className="card">
        <p className="eyebrow">体験版</p>
        <h1>
          <span>ぷかぷか島の</span>
          スターしずく
        </h1>
        <p className="lead">
          空にうかぶ島から こぼれおちた スターしずく。
          <br />
          ひつじの<b>メルン</b>と しずくの妖精<b>ティア</b>の 大ぼうけん！
        </p>
        <button className="big-btn" onClick={onStart}>
          あそぶ
        </button>
        <div className="howto">
          <div>
            <b>PC</b>
            <span>WASD／矢印キー：いどう</span>
            <span>スペース：ジャンプ（2回で2だんジャンプ）</span>
            <span>ドラッグ／Q・E：カメラ</span>
          </div>
          <div>
            <b>スマホ</b>
            <span>左スティック：いどう</span>
            <span>Ⓐボタン：ジャンプ</span>
            <span>画面ドラッグ：カメラ</span>
          </div>
        </div>
        <p className="goal">もくてき：3つの島で「星のかけら」を3こ集めて、塔の上のとびらを ひらこう！</p>
      </div>
    </div>
  );
}

function Paused() {
  return (
    <div className="screen">
      <div className="card small">
        <h2>ひとやすみ</h2>
        <button
          className="big-btn"
          onClick={() => {
            clearInput();
            store.set({ phase: 'playing' });
          }}
        >
          つづける
        </button>
        <button className="sub-btn" onClick={() => store.set({ phase: 'title', hint: null })}>
          タイトルへ
        </button>
      </div>
    </div>
  );
}

function GameOver() {
  return (
    <div className="screen">
      <div className="card small">
        <h2>あらら……</h2>
        <p className="lead">ライフが なくなっちゃった。</p>
        <button
          className="big-btn"
          onClick={() => {
            clearInput();
            window.dispatchEvent(new Event('pukapuka:retry'));
          }}
        >
          チェックポイントから
        </button>
        <button className="sub-btn" onClick={() => store.set({ phase: 'title', hint: null })}>
          タイトルへ
        </button>
      </div>
    </div>
  );
}

function rank(s) {
  const ratio = s.drops / Math.max(1, s.totalDrops);
  if (ratio >= 1 && s.misses === 0) return 'S';
  if (ratio >= 0.8) return 'A';
  if (ratio >= 0.5) return 'B';
  return 'C';
}

const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 13) % 20) / 10,
  dur: 2.6 + ((i * 7) % 10) / 6,
  color: ['#ff8fb1', '#ffe066', '#8fd0ff', '#b5f0a0', '#c4a8ff'][i % 5],
  size: 6 + (i % 4) * 2,
}));

function Clear({ onRestart }) {
  const s = useStore((x) => x);
  return (
    <div className="screen clear-screen">
      <div className="confetti" aria-hidden="true">
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s`, background: c.color, width: c.size, height: c.size * 1.6 }}
          />
        ))}
      </div>
      <div className="card">
        <p className="eyebrow">体験版クリア！</p>
        <h2>とびらの むこうに いたのは……</h2>
        <p className="lead">
          ゴロゴロ雲の王！ スターしずくを ひとりじめしていたのは こいつだった！
          <br />
          メルンとティアの ぼうけんは <b>製品版</b>に つづく……！
        </p>
        <div className="result">
          <div>
            <span>ランク</span>
            <b className="rank">{rank(s)}</b>
          </div>
          <div>
            <span>スターしずく</span>
            <b>
              {s.drops}/{s.totalDrops}
            </b>
          </div>
          <div>
            <span>タイム</span>
            <b>{fmt(s.time)}</b>
          </div>
          <div>
            <span>ミス</span>
            <b>{s.misses}</b>
          </div>
        </div>
        <button className="big-btn" onClick={onRestart}>
          もういちど あそぶ
        </button>
        <button className="sub-btn" onClick={() => store.set({ phase: 'title', hint: null })}>
          タイトルへ
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const phase = useStore((s) => s.phase);
  const runId = useStore((s) => s.runId);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Escape' && e.code !== 'KeyP') return;
      const ph = store.get().phase;
      if (ph === 'playing') store.set({ phase: 'paused' });
      else if (ph === 'paused') store.set({ phase: 'playing' });
    };
    const onHide = () => document.hidden && store.get().phase === 'playing' && store.set({ phase: 'paused' });
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, []);

  useEffect(() => {
    if (phase === 'title' || phase === 'clear') stopBgm();
  }, [phase]);

  const start = () => {
    initAudio();
    sfx('ui');
    clearInput();
    store.newRun();
    startBgm();
  };

  return (
    <div className="app">
      <Canvas
        shadows
        dpr={[1, Math.min(window.devicePixelRatio || 1, 1.75)]}
        camera={{ fov: 50, near: 0.1, far: 900, position: [0, 6, 16] }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        onCreated={() => setReady(true)}
      >
        <Suspense fallback={null}>
          <Scene key={runId} />
        </Suspense>
      </Canvas>
      <Hud />
      {phase === 'playing' && <TouchControls />}
      {phase === 'clearing' && <div className="flash" aria-hidden="true" />}
      <div className="fade-in" key={runId} aria-hidden="true" />
      {phase === 'title' && <Title onStart={start} />}
      {phase === 'paused' && <Paused />}
      {phase === 'gameover' && <GameOver />}
      {phase === 'clear' && <Clear onRestart={start} />}
      {!ready && <div className="loading">よみこみ中…</div>}
    </div>
  );
}
