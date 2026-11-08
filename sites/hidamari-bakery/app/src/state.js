// スクロールで動くすべての値。GSAPのタイムラインがこの値を書き換え、
// 3D側は毎フレームこの値を読んで見た目に反映する。
export const CAM = {
  hero: { c: [24, 21, 30], t: [0, 0.5, 0] },
  mill: { c: [-3.5, 8.5, 16], t: [-11.5, 1.6, 2.5] },
  kitchenWide: { c: [6.5, 16, 9], t: [6.5, 0.5, -2] },
  knead: { c: [5.6, 6.2, 3.6], t: [4.6, 1.3, -2.8] },
  oven: { c: [8.6, 5.2, 2.6], t: [10.4, 1.6, -3.6] },
  shop: { c: [7.4, 8.4, 3.7], t: [6.8, 0.9, 0.3] },
  front: { c: [8.6, 4.6, 18.2], t: [7, 2.3, 4] },
  final: { c: [30, 27, 36], t: [0, 0.8, 0] },
};

export const S = {
  cx: CAM.hero.c[0], cy: CAM.hero.c[1], cz: CAM.hero.c[2],
  tx: CAM.hero.t[0], ty: CAM.hero.t[1], tz: CAM.hero.t[2],
  orbit: 0, // ヒーローでのゆっくりした回り込み
  follow: 0, // 1でトラック追従カメラ
  day: 0, // 0=夜, 0.5=夜明け, 1=朝
  truck: 0, // 0=製粉所, 1=パン屋の横
  load0: 0, load1: 0, load2: 0,
  unload0: 0, unload1: 0, unload2: 0,
  roof: 0, // 0=屋根あり, 1=持ち上げ
  baker: 0, // 0=キッチン, 1=売り場, 2=店先
  flour: 0, pour: 0, dough: 0, knead: 0, divide: 0,
  tray: 0, // 0=作業台, 1=オーブンの前, 2=オーブンの中
  door: 0, heat: 0, rise: 0, bake: 0, steam: 0,
  hop0: 0, hop1: 0, hop2: 0, hop3: 0, hop4: 0, hop5: 0,
  shelf0: 0, shelf1: 0, shelf2: 0, shelf3: 0,
  tags: 0, tongs: 0,
  shutter: 0, sign: 0, awning: 0, walk: 0, bag: 0,
  logo: 0,
};
