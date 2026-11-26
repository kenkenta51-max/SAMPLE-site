import { useSyncExternalStore } from 'react';

// 画面表示（HUD・メニュー）用の小さなストア。
// 3D のゲーム処理は毎フレーム world オブジェクトを直接書き換え、
// 表示が変わるときだけここを更新する。

const MAX_HEARTS = 3;

const initial = () => ({
  phase: 'title', // title | playing | paused | gameover | clearing | clear
  hearts: MAX_HEARTS,
  maxHearts: MAX_HEARTS,
  drops: 0,
  totalDrops: 0,
  stars: 0,
  totalStars: 3,
  misses: 0,
  time: 0,
  hint: null, // { speaker, text, id }
  banner: null, // { text, id }
  toast: null, // { text, id }
  runId: 0,
  muted: false,
});

let state = initial();
const listeners = new Set();
let seq = 0;

export const store = {
  get: () => state,
  set(patch) {
    state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
    listeners.forEach((l) => l());
  },
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  newRun() {
    const muted = state.muted;
    state = { ...initial(), muted, phase: 'playing', runId: state.runId + 1 };
    listeners.forEach((l) => l());
  },
  hint(text, speaker = 'ティア', ms = 5200) {
    const id = ++seq;
    store.set({ hint: { text, speaker, id } });
    if (ms) setTimeout(() => store.get().hint?.id === id && store.set({ hint: null }), ms);
  },
  banner(text) {
    const id = ++seq;
    store.set({ banner: { text, id } });
    setTimeout(() => store.get().banner?.id === id && store.set({ banner: null }), 2600);
  },
  toast(text) {
    const id = ++seq;
    store.set({ toast: { text, id } });
    setTimeout(() => store.get().toast?.id === id && store.set({ toast: null }), 1600);
  },
};

export function useStore(selector) {
  return useSyncExternalStore(store.subscribe, () => selector(state));
}
