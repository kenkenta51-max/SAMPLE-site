// 効果音とBGMを Web Audio でその場で合成する（音声ファイル不要）。

let ctx = null;
let master = null;
let bgmGain = null;
let muted = false;
let bgmTimer = null;

export function initAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.55;
  master.connect(ctx.destination);
  bgmGain = ctx.createGain();
  bgmGain.gain.value = 0.22;
  bgmGain.connect(master);
}

export function setMuted(m) {
  muted = m;
  if (master) master.gain.setTargetAtTime(m ? 0 : 0.55, ctx.currentTime, 0.05);
}

function tone({ type = 'sine', f0, f1 = f0, dur = 0.15, vol = 0.3, delay = 0, out }) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(out || master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

const N = (n) => 440 * Math.pow(2, (n - 69) / 12);

export function sfx(name) {
  if (!ctx || muted) return;
  switch (name) {
    case 'jump':
      tone({ type: 'square', f0: 330, f1: 660, dur: 0.12, vol: 0.12 });
      break;
    case 'jump2':
      tone({ type: 'square', f0: 520, f1: 1040, dur: 0.14, vol: 0.12 });
      tone({ type: 'sine', f0: 1040, f1: 1400, dur: 0.12, vol: 0.08, delay: 0.05 });
      break;
    case 'drop':
      tone({ f0: N(88), dur: 0.08, vol: 0.18 });
      tone({ f0: N(93), dur: 0.16, vol: 0.18, delay: 0.06 });
      break;
    case 'star':
      [76, 79, 83, 88, 91].forEach((n, i) => tone({ type: 'triangle', f0: N(n), dur: 0.25, vol: 0.2, delay: i * 0.07 }));
      break;
    case 'heart':
      [72, 76, 79].forEach((n, i) => tone({ type: 'sine', f0: N(n), dur: 0.2, vol: 0.2, delay: i * 0.06 }));
      break;
    case 'stomp':
      tone({ type: 'square', f0: 260, f1: 90, dur: 0.12, vol: 0.18 });
      tone({ f0: 900, f1: 1300, dur: 0.1, vol: 0.12, delay: 0.06 });
      break;
    case 'spring':
      tone({ type: 'sine', f0: 180, f1: 900, dur: 0.35, vol: 0.25 });
      break;
    case 'hurt':
      tone({ type: 'sawtooth', f0: 420, f1: 110, dur: 0.3, vol: 0.16 });
      break;
    case 'land':
      tone({ type: 'sine', f0: 140, f1: 70, dur: 0.08, vol: 0.12 });
      break;
    case 'crumble':
      tone({ type: 'triangle', f0: 200, f1: 120, dur: 0.25, vol: 0.12 });
      break;
    case 'checkpoint':
      [79, 84, 88].forEach((n, i) => tone({ type: 'triangle', f0: N(n), dur: 0.35, vol: 0.16, delay: i * 0.09 }));
      break;
    case 'fall':
      tone({ type: 'triangle', f0: 700, f1: 120, dur: 0.6, vol: 0.16 });
      break;
    case 'locked':
      tone({ type: 'square', f0: 200, dur: 0.12, vol: 0.1 });
      tone({ type: 'square', f0: 160, dur: 0.18, vol: 0.1, delay: 0.12 });
      break;
    case 'boss':
      tone({ type: 'sawtooth', f0: 55, f1: 40, dur: 1.6, vol: 0.25 });
      tone({ type: 'sawtooth', f0: 58, f1: 42, dur: 1.6, vol: 0.2 });
      break;
    case 'clear':
      [72, 76, 79, 84, 79, 84, 88].forEach((n, i) =>
        tone({ type: 'triangle', f0: N(n), dur: i === 6 ? 0.8 : 0.2, vol: 0.2, delay: i * 0.13 }),
      );
      break;
    case 'ui':
      tone({ f0: N(84), dur: 0.08, vol: 0.12 });
      break;
    default:
  }
}

// ゆったりしたBGM（ペンタトニックのループ）
const MELODY = [72, 0, 76, 79, 81, 0, 79, 76, 74, 0, 76, 72, 69, 0, 72, 0, 72, 0, 76, 79, 84, 0, 81, 79, 76, 0, 79, 81, 79, 0, 0, 0];
const BASS = [48, 48, 45, 45, 41, 41, 43, 43];
let step = 0;
let nextTime = 0;

export function startBgm() {
  if (!ctx || bgmTimer) return;
  step = 0;
  nextTime = ctx.currentTime + 0.1;
  const beat = 0.24;
  bgmTimer = setInterval(() => {
    while (nextTime < ctx.currentTime + 0.3) {
      const delay = nextTime - ctx.currentTime;
      const m = MELODY[step % MELODY.length];
      if (m) tone({ type: 'triangle', f0: N(m), dur: beat * 1.6, vol: 0.16, delay, out: bgmGain });
      if (step % 4 === 0) {
        const b = BASS[Math.floor(step / 4) % BASS.length];
        tone({ type: 'sine', f0: N(b), dur: beat * 3.5, vol: 0.28, delay, out: bgmGain });
      }
      if (step % 2 === 1) tone({ type: 'sine', f0: N(96), dur: 0.04, vol: 0.03, delay, out: bgmGain });
      step++;
      nextTime += beat;
    }
  }, 80);
}

export function stopBgm() {
  clearInterval(bgmTimer);
  bgmTimer = null;
}
