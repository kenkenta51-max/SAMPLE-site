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

// 屋上・駐車場・ストリートのスポット（ピンを押すとカードが開く）
// cam = 近くで見るときのカメラ位置 / action = カードのメインボタン
export const SPOTS = [
  { id: 'roof_lawn', view: 'roof', pin: [-42, 21.5, 14], label: '芝生広場', name: '芝生広場', meta: '屋上 ・ ROOFTOP GARDEN', badge: '入場無料',
    desc: '約900m²の天然芝の広場。レジャーシートの貸し出しがあり、お弁当を広げてピクニックができます。夜はストリングライトが灯ります。',
    facts: [['開放時間', '10:00〜22:00'], ['料金', '無料'], ['ベビーカー', 'そのまま入れます'], ['雨の日', '屋根付きデッキへ']],
    cam: { pos: [-64, 27, -4], target: [-42, 18.5, 14] }, action: { type: 'route', x: -34, z: 14 } },
  { id: 'roof_bbq', view: 'roof', pin: [-6, 21, 20], label: '手ぶらBBQ', name: '手ぶらBBQテラス', meta: '屋上 ・ BBQ', badge: '要予約',
    desc: '食材・コンロ・食器がすべてそろった手ぶらBBQ。1Fの青果マルシェで買った食材の持ち込みもできます。片付けはスタッフにおまかせ。',
    facts: [['営業時間', '11:00〜21:00'], ['料金', '4名 6,800円〜'], ['席数', '8卓（各6名まで）'], ['予約', '前日18時まで']],
    cam: { pos: [-24, 25, 35], target: [-6, 18.5, 20] }, action: { type: 'route', x: -6, z: 16.5 } },
  { id: 'roof_deck', view: 'roof', pin: [-24, 21, 0], label: '夜景デッキ', name: '夜景ウッドデッキ', meta: '屋上 ・ DECK',
    desc: '吹き抜けの天窓に沿ったウッドデッキ。ベンチに座って、駅前の夜景と電車を眺められます。3Fのトラットリアのテラス席にもつながっています。',
    facts: [['開放時間', '10:00〜22:00'], ['料金', '無料'], ['ベンチ', '4か所'], ['おすすめ', '日没の30分前']],
    cam: { pos: [-11, 23.5, -10], target: [-27, 19, 4] }, action: { type: 'route', x: -24, z: 0 } },
  { id: 'park_near', view: 'parking', pin: null, label: 'いちばん近い空き', name: '北口にいちばん近い空き', meta: '平面駐車場 P1', badge: '空き',
    desc: 'いま空いている区画のうち、北口エントランスにいちばん近い場所です。ここからお店の入口まで、段差なしで歩けます。',
    facts: [['入口まで', '歩いて約1分'], ['料金', '最初の3時間無料'], ['車幅', '2.8m（ゆったり区画）'], ['屋根', 'なし']],
    cam: null, action: { type: 'walk' } },
  { id: 'park_north', view: 'parking', pin: [0, 5.5, 33], label: '北口', name: '北口エントランス', meta: '1F ・ 駐車場側の入口',
    desc: '平面駐車場に直結する入口。ベビーカーと車椅子の貸し出しカウンターがあり、雨の日は屋根の下で乗り降りできます。',
    facts: [['開いている時間', '8:00〜23:00'], ['貸し出し', 'ベビーカー・車椅子'], ['段差', 'なし'], ['すぐ近く', 'ベーカリー・おむすび']],
    cam: { pos: [17, 7, 54], target: [0, 3, 31] }, action: { type: 'toast', label: 'ベビーカーを予約する', msg: 'ベビーカーの貸し出しを予約しました（デモ）' } },
  { id: 'park_taxi', view: 'parking', pin: [18, 3, 36.5], label: 'タクシー乗り場', name: 'タクシー乗り場', meta: '北口すぐ',
    desc: '北口を出て右手。荷物が多い日や雨の日に便利です。インフォメーションでタクシーの呼び出しもできます。',
    facts: [['場所', '北口から約20m'], ['待ち時間の目安', '平日 約3分'], ['屋根', 'あり'], ['呼び出し', '1F インフォメーション']],
    cam: { pos: [34, 5, 50], target: [16, 2, 35] }, action: { type: 'toast', label: 'タクシーを呼ぶ', msg: 'タクシーを呼びました（デモ）' } },
  { id: 'street_gate', view: 'street', pin: [0, 6.5, -33], label: '南口エントランス', name: '南口エントランス', meta: '1F ・ 駅前通り側のメイン入口',
    desc: '駅から歩いて3分。駅前通りに面したメインエントランスです。入ってすぐにインフォメーションとエレベーターがあります。',
    facts: [['開いている時間', '8:00〜23:00'], ['駅から', '徒歩3分・段差なし'], ['待ち合わせ', 'ベンチ6台'], ['すぐ近く', '和菓子・ドラッグストア']],
    cam: { pos: [15, 3.4, -47], target: [0, 5, -30] }, action: { type: 'toast', label: '駅からの道順を見る', msg: '駅の北口を出て、駅前通りをまっすぐ3分です（デモ）' } },
  { id: 'street_bus', view: 'street', pin: [-26, 3.6, -39.2], label: 'バス停', name: 'バス停 つむぎテラス前', meta: '駅前通り',
    desc: '駅とつむぎテラスを結ぶ循環バスが止まります。屋根とベンチのある停留所で、南口までは歩いて1分です。',
    facts: [['行き先', '駅 ⇔ つむぎテラス'], ['間隔', '10分おき'], ['始発・最終', '7:00 ／ 22:40'], ['運賃', '大人 100円']],
    cam: { pos: [-19.5, 3.4, -48], target: [-26, 1.8, -39] }, action: { type: 'toast', label: '時刻表を見る', msg: '次のバスは4分後です（デモ）' } },
];

export const FACILITY_INFO = {
  elevator: { name: 'エレベーター', desc: 'ベビーカー・車椅子優先のエレベーター。1Fから屋上まで行けます。', facts: [['行き先', '1F〜3F・屋上'], ['定員', '15名'], ['優先', 'ベビーカー・車椅子'], ['待ち時間の目安', '約1分']] },
  nursing: { name: '授乳室', img: 'nursing', desc: '個室の授乳室とおむつ替えスペース。ミルク用の給湯器があり、パパも利用できます。', facts: [['利用時間', '10:00〜21:00'], ['個室', '6室'], ['設備', '給湯器・おむつ替え台'], ['料金', '無料']] },
  toilet: { name: '多目的トイレ', desc: '車椅子のまま入れる広いトイレ。オストメイト対応で、ベビーチェアとおむつ替え台があります。', facts: [['利用時間', '開館中いつでも'], ['設備', 'オストメイト・ベビーチェア'], ['出入口', '引き戸・幅90cm'], ['呼び出し', '非常ボタンあり']] },
};
