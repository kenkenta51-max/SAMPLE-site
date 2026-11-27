// つむぎテラス（架空の商業施設）の店舗・設備データ
// slot: W=西アンカー / E=東アンカー / N1〜N5=北側 / S1〜S5=南側（西から順）

export const CATEGORY = {
  food:    { label: 'フード・食品', color: '#f2b45c' },
  life:    { label: '暮らし・雑貨', color: '#8fd19e' },
  fashion: { label: 'ファッション', color: '#e98fb3' },
  gourmet: { label: 'レストラン', color: '#f07d5a' },
  play:    { label: 'あそび・体験', color: '#7fb7ff' },
  service: { label: 'サービス', color: '#b9a7f5' },
  vacant:  { label: 'テナント募集', color: '#d9d9d9' },
  gate:    { label: 'エントランス', color: '#ffffff' },
};

export const FLOORS = [
  { id: 0, name: '1F', theme: '食と暮らし' },
  { id: 1, name: '2F', theme: 'ファッション・雑貨' },
  { id: 2, name: '3F', theme: 'レストラン・あそび' },
];

const H = '10:00〜21:00';
const R = '11:00〜22:00';

export const SHOPS = [
  // ---- 1F ----
  { no: '101', floor: 0, slot: 'W',  cat: 'food',    name: '青果マルシェ ミドリ', desc: '朝どれ野菜と地元の魚が並ぶ食品スーパー。夕方5時からはタイムセール。', hours: '9:00〜22:00', img: 's103', sale: true },
  { no: '102', floor: 0, slot: 'N1', cat: 'food',    name: '灯珈琲ロースタリー', desc: '店内焙煎のスペシャルティコーヒー。豆の量り売りとハンドドリップ。', hours: H, img: 's101', isNew: true },
  { no: '103', floor: 0, slot: 'N2', cat: 'food',    name: 'ベーカリー ふくら', desc: '一日6回焼き上がる食パンと、季節のデニッシュ。', hours: '8:00〜20:00', img: 's104' },
  { no: '—',   floor: 0, slot: 'N3', cat: 'gate',    name: '北口（駐車場側）', desc: '平面駐車場・タクシー乗り場に直結。ベビーカー貸出あり。', hours: '8:00〜23:00', img: null },
  { no: '104', floor: 0, slot: 'N4', cat: 'food',    name: 'おむすび こめと', desc: '注文を受けてから握るおむすびと、日替わりの惣菜。', hours: H, img: 's102' },
  { no: '105', floor: 0, slot: 'N5', cat: 'life',    name: '花と緑 そよぎ', desc: '季節の切り花と観葉植物。ギフトのラッピング無料。', hours: H, img: 's106' },
  { no: '106', floor: 0, slot: 'S1', cat: 'life',    name: 'ドラッグ＆コスメ ハレ', desc: '処方せん受付・コスメ・日用品。ポイント5倍デー開催中。', hours: '9:00〜22:00', img: 's105', sale: true },
  { no: '107', floor: 0, slot: 'S2', cat: 'vacant',  name: '空き区画 1F-107', desc: '南口すぐの路面区画。カフェ・物販に最適。', area: 142, rent: '月額 68万円〜', traffic: '平日 8,200人 / 休日 14,600人', img: 'vacant' },
  { no: '—',   floor: 0, slot: 'S3', cat: 'gate',    name: '南口エントランス', desc: '駅前通りに面したメインエントランス。インフォメーションあり。', hours: '8:00〜23:00', img: null },
  { no: '108', floor: 0, slot: 'S4', cat: 'food',    name: '和菓子 つきみ', desc: 'どら焼きと上生菓子。手土産にちょうどいい詰め合わせ。', hours: H, img: 's108' },
  { no: '109', floor: 0, slot: 'S5', cat: 'service', name: 'クリニックモール つむぎ', desc: '内科・小児科・歯科。お買い物ついでにWeb予約。', hours: '9:00〜19:00', img: 's311' },
  { no: '110', floor: 0, slot: 'E',  cat: 'life',    name: 'DIY＆ホーム ナラ', desc: '工具・収納・園芸用品。木材カットサービスあり。', hours: '9:00〜21:00', img: 's110', sale: true },

  // ---- 2F ----
  { no: '201', floor: 1, slot: 'W',  cat: 'life',    name: '本と文具 しおり', desc: '約8万冊の書店と文具。カフェ席で試し読みOK。', hours: H, img: 's203' },
  { no: '202', floor: 1, slot: 'N1', cat: 'fashion', name: 'UNOI', desc: '国内ブランド中心のセレクトショップ。', hours: H, img: 's201', sale: true },
  { no: '203', floor: 1, slot: 'N2', cat: 'fashion', name: 'FOOTRUN', desc: 'スニーカー専門店。足型計測は無料。', hours: H, img: 's204' },
  { no: '204', floor: 1, slot: 'N3', cat: 'fashion', name: 'メガネの MIRU', desc: '最短30分で仕上がるメガネ。視力測定あり。', hours: H, img: 's205' },
  { no: '205', floor: 1, slot: 'N4', cat: 'life',    name: 'くらしの道具 tomoni', desc: 'うつわ・リネン・台所道具。名入れ対応。', hours: H, img: 's202', isNew: true },
  { no: '206', floor: 1, slot: 'N5', cat: 'fashion', name: 'こども服 ころん', desc: '80〜140cmのこども服と出産祝いギフト。', hours: H, img: 's206' },
  { no: '207', floor: 1, slot: 'S1', cat: 'vacant',  name: '空き区画 2F-207', desc: '吹き抜けに面した角区画。ファッション・雑貨向け。', area: 118, rent: '月額 49万円〜', traffic: '平日 5,400人 / 休日 11,200人', img: 'vacant' },
  { no: '208', floor: 1, slot: 'S2', cat: 'fashion', name: 'ジュエリー lumi', desc: 'ブライダルリングとセミオーダーのアクセサリー。', hours: H, img: 's208' },
  { no: '209', floor: 1, slot: 'S3', cat: 'service', name: 'ベビー休憩室', desc: '授乳室（個室6室）・おむつ替え・ミルク用給湯。パパも利用OK。', hours: '10:00〜21:00', img: 'nursing', facility: true },
  { no: '210', floor: 1, slot: 'S4', cat: 'service', name: 'ヘアサロン KAZE', desc: 'カット・カラー。キッズカットは予約優先。', hours: '10:00〜20:00', img: 's210' },
  { no: '211', floor: 1, slot: 'S5', cat: 'fashion', name: 'スポーツ＆アウトドア YAMABI', desc: 'ランニング・キャンプ用品。週末はテント展示。', hours: H, img: 's211', sale: true },
  { no: '212', floor: 1, slot: 'E',  cat: 'life',    name: 'でんきのツムギ', desc: '家電・PC・カメラ。スマホ修理カウンター併設。', hours: H, img: 's212' },

  // ---- 3F ----
  { no: '301', floor: 2, slot: 'W',  cat: 'play',    name: 'シネマつむぎ', desc: '8スクリーンの映画館。レイトショーは21:30まで。', hours: '9:00〜24:00', img: 's304' },
  { no: '302', floor: 2, slot: 'N1', cat: 'gourmet', name: '鮨 波音', desc: 'カウンター8席。お昼は1,800円のにぎりランチ。', hours: R, img: 's302' },
  { no: '303', floor: 2, slot: 'N2', cat: 'gourmet', name: 'らぁ麺 ゆげ', desc: '鶏白湯と煮干しの二枚看板。', hours: R, img: 's303r' },
  { no: '304', floor: 2, slot: 'N3', cat: 'gourmet', name: 'フードコート つむぎダイニング', desc: '12店舗・620席。キッズチェアと電子レンジあり。', hours: R, img: 's301' },
  { no: '305', floor: 2, slot: 'N4', cat: 'gourmet', name: 'パフェ専門店 ことり', desc: '季節のフルーツパフェ。テイクアウトのプリンも。', hours: R, img: 's305', isNew: true },
  { no: '306', floor: 2, slot: 'N5', cat: 'play',    name: 'あそびランド', desc: 'クレーンゲームとキッズ向けメダルゲーム。', hours: '10:00〜23:00', img: 's306' },
  { no: '307', floor: 2, slot: 'S1', cat: 'play',    name: 'キッズパーク もりもり', desc: '0〜6歳の室内あそび場。保護者1名同伴で60分800円。', hours: H, img: 's303' },
  { no: '308', floor: 2, slot: 'S2', cat: 'gourmet', name: '焼肉 炭や', desc: '無煙ロースターで服ににおいがつきにくい焼肉店。', hours: R, img: 's308', sale: true },
  { no: '309', floor: 2, slot: 'S3', cat: 'gourmet', name: 'トラットリア ソーレ', desc: '薪窯ナポリピッツァ。テラス席は屋上庭園に直結。', hours: R, img: 's309' },
  { no: '310', floor: 2, slot: 'S4', cat: 'vacant',  name: '空き区画 3F-310', desc: '屋上庭園への動線上。飲食（重飲食可）向け。', area: 165, rent: '月額 72万円〜', traffic: '平日 3,900人 / 休日 9,800人', img: 'vacant' },
  { no: '311', floor: 2, slot: 'S5', cat: 'service', name: '24h フィットネス FIT', desc: 'マシンジム。モール閉館後は専用入口から入館。', hours: '24時間', img: 's312' },
  { no: '312', floor: 2, slot: 'E',  cat: 'play',    name: 'ボウリング＆カラオケ STRIKE', desc: '24レーンのボウリングとカラオケ。', hours: '10:00〜24:00', img: 's306' },
];

// 共用設備（各フロアのピン）
export const FACILITIES = [
  { type: 'elevator', label: 'エレベーター A', x: -40, z: 0, floors: [0, 1, 2] },
  { type: 'elevator', label: 'エレベーター B', x: 40, z: 0, floors: [0, 1, 2] },
  { type: 'nursing',  label: '授乳室',         x: 0,  z: -14, floors: [1] },
  { type: 'nursing',  label: '授乳室',         x: -42, z: 5, floors: [0, 2] },
  { type: 'toilet',   label: '多目的トイレ',   x: 42, z: 5, floors: [0, 1, 2] },
  { type: 'toilet',   label: '多目的トイレ',   x: -42, z: -5, floors: [1] },
];

export const STATS = { shops: SHOPS.filter(s => s.cat !== 'gate' && s.cat !== 'vacant').length, parking: 640 };
