import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { S, CAM } from './state.js';

gsap.registerPlugin(ScrollTrigger);

// 時計の表示（スクロール位置 → 朝の時刻）
const CLOCK = [[0, 230], [8, 240], [28, 270], [47, 330], [67, 390], [85, 420], [100, 425]];
const CHAPTERS = [8, 28, 47, 67, 82, 94];
const TOTAL = 100;

function clockAt(p) {
  const x = p * TOTAL;
  for (let i = 1; i < CLOCK.length; i++) {
    const [a, ma] = CLOCK[i - 1];
    const [b, mb] = CLOCK[i];
    if (x <= b) {
      const m = Math.round(ma + (mb - ma) * ((x - a) / (b - a)));
      return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
    }
  }
  return '7:05';
}

export function buildTimeline(onProgress) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  const cam = (key, at, dur = 3, ease = 'power2.inOut') => {
    const v = CAM[key];
    tl.to(S, { cx: v.c[0], cy: v.c[1], cz: v.c[2], tx: v.t[0], ty: v.t[1], tz: v.t[2], duration: dur, ease }, at);
  };
  const card = (sel, inAt, outAt) => {
    tl.fromTo(sel, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.4, ease: 'power2.out' }, inAt);
    if (outAt != null) tl.to(sel, { autoAlpha: 0, y: -30, duration: 1.2, ease: 'power2.in' }, outAt);
  };
  const to = (vars, at, dur, ease) => tl.to(S, { ...vars, duration: dur, ...(ease ? { ease } : {}) }, at);

  // ── 0 ヒーロー（夜のミニチュアの町）
  to({ orbit: 1 }, 0, 6, 'none');
  tl.to('#hero', { autoAlpha: 0, y: -40, duration: 2, ease: 'power2.in' }, 4);

  // ── ① 4:00 製粉所で小麦粉を積み込む → トラックで運ぶ
  cam('mill', 6, 5);
  card('#ch1', 8, 25.5);
  to({ load0: 1 }, 10, 2, 'power1.inOut');
  to({ load1: 1 }, 11.2, 2, 'power1.inOut');
  to({ load2: 1 }, 12.4, 2, 'power1.inOut');
  to({ follow: 1 }, 14.4, 2);
  to({ truck: 1 }, 15, 7.5, 'power1.inOut');
  to({ day: 0.12 }, 6, 17, 'none');
  to({ follow: 0 }, 22, 3);
  cam('kitchenWide', 22, 3.5);
  to({ roof: 1 }, 22.2, 2.8, 'back.inOut(1.6)');
  to({ unload0: 1 }, 24, 1.8, 'power1.inOut');
  to({ unload1: 1 }, 25, 1.8, 'power1.inOut');
  to({ unload2: 1 }, 26, 1.8, 'power1.inOut');

  // ── ② 4:30 小麦粉をこねる
  cam('knead', 28, 3.5);
  card('#ch2', 29, 45.5);
  to({ pour: 1 }, 30, 1.5);
  to({ flour: 1 }, 30.8, 2, 'power1.out');
  to({ pour: 0 }, 32.6, 1.2);
  to({ dough: 1 }, 33, 2, 'back.out(2)');
  to({ knead: 5 }, 35, 9, 'none');
  to({ divide: 1 }, 44, 3, 'back.inOut(1.4)');
  to({ day: 0.28 }, 23, 24, 'none');

  // ── ③ 5:30 オーブンでふくらむ
  cam('oven', 47, 3.5);
  card('#ch3', 48.5, 65.5);
  to({ tray: 1 }, 48, 3);
  to({ door: 1 }, 51, 1.6, 'back.out(1.5)');
  to({ tray: 2 }, 52.6, 2);
  to({ door: 0 }, 54.6, 1.4, 'power2.in');
  to({ heat: 1 }, 55.5, 2.5, 'power1.out');
  to({ rise: 1 }, 56.5, 5.5, 'power1.inOut');
  to({ steam: 1 }, 58, 3, 'power1.out');
  to({ door: 1 }, 62, 1.4, 'back.out(1.5)');
  to({ heat: 0.25 }, 62, 2);
  to({ tray: 1 }, 63.2, 1.8);
  to({ bake: 1 }, 64.6, 2.4, 'elastic.out(1, 0.45)');
  to({ door: 0 }, 66, 1.2, 'power2.in');
  to({ day: 0.45 }, 47, 20, 'none');

  // ── ④ 6:30 焼きたてを並べる
  cam('shop', 67, 3.5);
  card('#ch4', 68.5, 81);
  to({ baker: 1 }, 67, 3);
  to({ steam: 0.35 }, 67, 3);
  for (let i = 0; i < 6; i++) to({ ['hop' + i]: 1 }, 70 + i * 1.05, 2, 'power1.inOut');
  for (let i = 0; i < 4; i++) to({ ['shelf' + i]: 1 }, 72.5 + i * 1.3, 1.6, 'back.out(2.2)');
  to({ tongs: 1 }, 73.5, 2, 'back.out(1.6)');
  to({ tags: 1 }, 78.5, 2, 'back.out(2)');

  // ── ⑤ 7:00 シャッターが上がって開店
  to({ roof: 0 }, 81.5, 3, 'bounce.out');
  cam('front', 82, 4);
  to({ day: 1 }, 82, 10, 'power1.inOut');
  card('#ch5', 85, 93.5);
  to({ shutter: 1 }, 86, 3, 'power2.inOut');
  to({ awning: 1 }, 87, 2, 'back.out(1.8)');
  to({ sign: 1 }, 88.5, 1.2, 'back.out(2)');
  to({ walk: 1 }, 86.5, 6, 'power1.inOut');
  to({ baker: 2 }, 89, 2.5);
  to({ bag: 1 }, 92, 1.8, 'power2.inOut');

  // ── フィナーレ：カメラが引いてロゴ
  cam('final', 93.5, 5.5, 'power3.inOut');
  to({ logo: 1 }, 96, 3, 'back.out(1.6)');
  tl.fromTo('#finale', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 2.5, ease: 'power2.out' }, 96.5);
  tl.set({}, {}, TOTAL);

  const st = ScrollTrigger.create({
    trigger: '#scroll-track',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    animation: tl,
    onUpdate: (self) => {
      const p = self.progress;
      const x = p * TOTAL;
      let ch = 0;
      CHAPTERS.forEach((c, i) => { if (x >= c - 0.5) ch = i + 1; });
      onProgress?.({ progress: p, clock: clockAt(p), chapter: ch });
    },
  });
  onProgress?.({ progress: 0, clock: clockAt(0), chapter: 0 });

  return () => {
    st.kill();
    tl.kill();
  };
}

export function scrollToChapter(i) {
  const track = document.getElementById('scroll-track');
  if (!track) return;
  const at = i === 0 ? 0 : (CHAPTERS[i - 1] + 3) / TOTAL;
  const top = track.offsetTop + at * (track.offsetHeight - window.innerHeight);
  window.scrollTo({ top, behavior: 'smooth' });
}
