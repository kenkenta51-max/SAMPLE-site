// ステージデータ（体験版：島3つ）
// 座標は「足場の上面の中心」。奥（-Z方向）へ進んでいく。

export const KILL_Y = -14;

let pid = 0;
const cyl = (x, y, z, r, opts = {}) => ({ id: pid++, shape: 'cyl', x, y, z, r, h: 0.6, kind: 'static', look: 'cloud', ...opts });
const box = (x, y, z, w, d, opts = {}) => ({ id: pid++, shape: 'box', x, y, z, w, d, h: 0.8, kind: 'static', look: 'candy', ...opts });
const bob = (amp = 0.2, speed = 1.4, phase = 0) => ({ axis: [0, 1, 0], amp, speed, phase });
const slide = (axis, amp, speed, phase = 0) => ({ axis, amp, speed, phase });

// ---------- 足場 ----------
export const PLATFORMS = [
  // 島1：はじまりの島
  cyl(0, 0, 0, 11, { h: 5, solid: true, look: 'island', tint: 'grass' }),
  cyl(6.5, 1.3, -1, 1.3, { move: bob(0.18, 1.3) }),
  cyl(8.5, 2.8, -4.5, 1.2, { move: bob(0.18, 1.3, 1) }),
  cyl(6, 4.2, -7.5, 1.4, { move: bob(0.18, 1.3, 2) }),
  cyl(-6, 0.3, -3, 1.0, { kind: 'spring', look: 'spring', h: 0.3 }),
  cyl(-6, 6.4, -7.5, 2, { look: 'cloud' }),

  // 橋1：うごく雲
  cyl(0, 0, -14.5, 1.6, { move: bob(0.2, 1.2) }),
  cyl(0, 0.6, -18.6, 1.5, { move: slide([1, 0, 0], 3, 1.1) }),
  cyl(0, 1.2, -22.6, 1.6, { move: bob(0.2, 1.2, 1.5) }),

  // 島2：かざぐるまの島
  cyl(0, 0, -34, 10, { h: 5, solid: true, look: 'island', tint: 'pink' }),
  cyl(13, 1, -34, 1.3, { kind: 'crumble', look: 'crumble' }),
  cyl(16.5, 2, -34, 1.3, { kind: 'crumble', look: 'crumble' }),
  cyl(20, 3, -34, 1.3, { kind: 'crumble', look: 'crumble' }),
  cyl(23.5, 5.5, -34, 1.5, { move: slide([0, 1, 0], 2.5, 0.9) }),
  cyl(27.5, 8.5, -34, 2.2, { look: 'cloud' }),

  // 橋2：くるくる花とキャンディブロック
  cyl(0, 0.4, -48, 2.6, { look: 'flower', spin: 1.1, h: 0.5 }),
  box(0, 1.0, -53, 2.6, 2.6, { move: slide([1, 0, 0], 3.5, 1.2) }),
  cyl(0, 1.6, -57.5, 1.5, { move: bob(0.2, 1.2) }),

  // 島3：そらの塔
  cyl(0, 0, -70, 9, { h: 5, solid: true, look: 'island', tint: 'mint' }),
  cyl(0, 12, -70, 3.5, { h: 17, solid: true, look: 'tower' }),
  // とびら（見えないかべ：とびらをすりぬけて落ちないように）
  box(0, 14.7, -73.3, 2.8, 0.4, { h: 2.7, solid: true, look: 'none' }),
];

// らせん階段
const SPIRAL = [];
for (let i = 0; i < 9; i++) {
  const a = 0.35 + i * 0.85;
  const opts = {};
  if (i === 3 || i === 7) Object.assign(opts, { kind: 'crumble', look: 'crumble' });
  if (i === 5) opts.move = bob(0.3, 1.5);
  const p = cyl(Math.sin(a) * 6, 1.3 * (i + 1), -70 + Math.cos(a) * 6, 1.3, opts);
  PLATFORMS.push(p);
  SPIRAL.push(p);
}

// ---------- アイテム ----------
const drop = (x, y, z) => ({ type: 'drop', pos: [x, y, z] });

export const ITEMS = [
  // 島1
  drop(0, 0.7, 3), drop(0, 0.7, 0), drop(0, 0.7, -3),
  drop(6.5, 2.2, -1), drop(8.5, 3.7, -4.5), drop(6, 5.1, -7.5),
  drop(-6, 2.6, -4.2), drop(-6, 4.6, -5.6),
  { type: 'star', pos: [-6, 7.5, -7.5] },
  // 橋1
  drop(0, 1, -14.5), drop(0, 1.7, -18.6), drop(0, 2.2, -22.6),
  // 島2
  drop(-4, 0.7, -30), drop(-6, 0.7, -34), drop(-4, 0.7, -38), drop(0, 0.7, -40),
  drop(13, 2, -34), drop(16.5, 3, -34), drop(20, 4, -34), drop(23.5, 9.2, -34),
  { type: 'heart', pos: [-7, 0.8, -38] },
  { type: 'star', pos: [27.5, 9.6, -34] },
  // 橋2
  drop(0, 1.3, -48), drop(0, 2.6, -57.5),
  // 島3
  drop(-3, 0.7, -63), drop(3.5, 0.7, -64.5),
  ...SPIRAL.filter((_, i) => i % 2 === 1).map((p) => drop(p.x, p.y + 0.9, p.z)),
  { type: 'heart', pos: [5.5, 0.8, -74] },
  { type: 'star', pos: [0, 13.1, -70] },
];

// ---------- 敵 ----------
export const ENEMIES = [
  { type: 'pomu', a: [-2, 0, -5], b: [3, 0, -5], speed: 0.9 },
  { type: 'pomu', a: [2, 0, -29], b: [6, 0, -33], speed: 0.8 },
  { type: 'pomu', a: [-6, 0, -31], b: [-2, 0, -37], speed: 1 },
  { type: 'pomu', a: [-5, 0, -66], b: [-3, 0, -75], speed: 0.8 },
  { type: 'chiku', center: [0, 4.4, -70], radius: 6, speed: 0.55, phase: 1.2 },
  { type: 'chiku', center: [0, 8.3, -70], radius: 6, speed: -0.45, phase: 4 },
  { type: 'chiku', center: [-4, 1.6, -34], radius: 2.2, speed: 1.1, phase: 0 },
];

// ---------- チェックポイント ----------
export const CHECKPOINTS = [
  { pos: [0, 0, 7], active: true },
  { pos: [2.2, 0, -26.5] },
  { pos: [2.2, 0, -62.5] },
];

// ---------- 島エリア（名前の表示用） ----------
export const AREAS = [
  { name: 'はじまりの島', center: [0, 0, 0], radius: 12 },
  { name: 'かざぐるまの島', center: [0, 0, -34], radius: 11 },
  { name: 'そらの塔', center: [0, 0, -70], radius: 10 },
];

// ---------- ナビ妖精ティアのヒント ----------
export const HINTS = [
  { pos: [0, 0, 6], r: 3, text: 'メルン、おきて！ 空の島からスターしずくが こぼれちゃったの。いっしょに あつめよう！' },
  { pos: [0, 0, 2], r: 2.5, text: 'うごくのは スティック／WASD。ジャンプは Ⓐボタン／スペースキーだよ。' },
  { pos: [0, 0, -2.5], r: 3, text: 'キノコの ポムムは、上から ふむと やっつけられるよ！' },
  { pos: [5, 0, -1], r: 2.5, text: 'ジャンプ中に もう1回ジャンプすると、2だんジャンプ！' },
  { pos: [-5, 0, -1.5], r: 2.5, text: 'あのバネキノコで 上の雲まで びよーん！ 星のかけらが 光ってる！' },
  { pos: [0, 0, -10], r: 2.5, text: 'ここから先は雲の橋。よこに うごく雲は タイミングを見てね。' },
  { pos: [7.5, 0, -34], r: 3, text: 'クッキー雲は のると すぐ くずれちゃう！ とまらずに ぴょんぴょん！' },
  { pos: [0, 0, -43], r: 2.5, text: 'くるくる花に のると いっしょに まわるよ。' },
  { pos: [0, 0, -61.5], r: 3, text: '塔の てっぺんに さいごの星のかけら！ トゲトゲの チクリンには さわっちゃダメ！' },
];

export const GATE = { pos: [0, 12, -73.2], zone: [0, 12, -72.4], zoneR: 1.7 };
export const BOSS_POS = [0, 16.5, -86];
