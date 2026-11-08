import { useEffect, useState } from 'react';
import { TimetableScene, SignatureScene, FarmScene, AccessScene, BAKE_TIMES } from './minis.jsx';

function Heading({ en, ja, light }) {
  return (
    <header className={'sec-head' + (light ? ' sec-head--light' : '')}>
      <p className="sec-head__en">{en}</p>
      <h2 className="sec-head__ja">{ja}</h2>
    </header>
  );
}

// ───────── 人気No.1
export function Signature() {
  return (
    <section id="signature" className="sec sec--signature">
      <div className="sec__inner sec__split">
        <SignatureScene />
        <div className="signature__text">
          <Heading en="SIGNATURE" ja="いちばん人気のパン" />
          <p className="badge-line"><span className="badge">人気 No.1</span><span className="badge badge--gray">1日 60個かぎり</span></p>
          <h3 className="signature__name">くまさんのぱん</h3>
          <p className="signature__desc">ふわふわのミルク生地に、とろ〜りカスタードをたっぷり。粉砂糖のおめかしをして、チョコでお顔を描いたら完成です。毎朝 8:30 ごろに焼きあがります。</p>
          <p className="signature__price"><b>500</b>円</p>
          <ol className="ranking">
            <li><img src="menu/melonpan.webp" alt="" width="72" height="72" loading="lazy" /><span><small>No.2</small>めろんぱん</span></li>
            <li><img src="menu/croissant.webp" alt="" width="72" height="72" loading="lazy" /><span><small>No.3</small>くろわっさん</span></li>
          </ol>
          <p className="hint">3Dのパンはドラッグでくるっと回せます</p>
        </div>
      </div>
    </section>
  );
}

// ───────── 焼きあがり時間
function toMin(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
export function Timetable() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(id); }, []);
  const m = now.getHours() * 60 + now.getMinutes();
  const nextIdx = BAKE_TIMES.findIndex((r) => toMin(r.time) > m);
  const status = nextIdx === -1
    ? '本日の焼きあがりは終了しました。あしたは 7:00 から焼きたてが並びます。'
    : `つぎの焼きあがりは ${BAKE_TIMES[nextIdx].time}　${BAKE_TIMES[nextIdx].items.join('・')}`;
  return (
    <section id="timetable" className="sec sec--timetable">
      <div className="sec__inner">
        <Heading en="BAKING SCHEDULE" ja="焼きあがり時間" />
        <p className="sec-lead">いちばんおいしい焼きたてをねらうなら、この時間に。<br className="pc" />天候や混みぐあいで前後することがあります。</p>
        <div className="sec__split sec__split--timetable">
          <TimetableScene />
          <div>
            <p className="next-bake" aria-live="polite"><span className="next-bake__dot" />{status}</p>
            <ul className="bake-list">
              {BAKE_TIMES.map((r, i) => (
                <li key={r.time} className={i === nextIdx ? 'is-next' : nextIdx !== -1 && i < nextIdx ? 'is-done' : nextIdx === -1 ? 'is-done' : ''}>
                  <time>{r.time}</time>
                  <span>{r.items.join('・')}</span>
                  {i === nextIdx && <em>つぎ！</em>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ───────── こだわり
const POINTS = [
  { no: '01', title: '国産小麦100%', text: 'となりの風車の製粉所で、毎週ひきたての国産小麦を仕入れています。香りがちがいます。' },
  { no: '02', title: '北海道産バター', text: 'くろわっさんやでにっしゅには、コクのある北海道産の発酵バターをぜいたくに。' },
  { no: '03', title: '自家製の天然酵母', text: 'レーズンから育てた酵母で、ひと晩じっくり発酵。もっちり、やさしい甘みに。' },
  { no: '04', title: '毎朝4時から仕込み', text: '作りおきはしません。その日の分を、その日の朝に。だからいつも焼きたてです。' },
];
export function Kodawari() {
  return (
    <section id="kodawari" className="sec sec--kodawari">
      <div className="sec__inner">
        <Heading en="OUR STORY" ja="ひだまりの こだわり" />
        <FarmScene />
        <ul className="points">
          {POINTS.map((p) => (
            <li key={p.no}>
              <span className="points__no">{p.no}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ───────── お知らせ（コルクボード）
const NEWS = [
  { date: '2026.11.01', tag: '新商品', title: 'さつまいもとくるみのぱん、はじまりました', text: '秋だけの限定パン。ほくほくのさつまいもがごろっと入っています。' },
  { date: '2026.11.15', tag: 'イベント', title: 'ひだまり町マルシェに出店します', text: '11/22(日) 10:00〜15:00、中央公園にて。マルシェ限定のミニぱんセットも。' },
  { date: '2026.12.01', tag: '予約', title: 'クリスマスのシュトーレン予約スタート', text: '12/20までのお渡し分を、店頭とお電話で受けつけます。' },
];
export function News() {
  return (
    <section id="news" className="sec sec--news">
      <div className="sec__inner">
        <Heading en="NEWS" ja="お知らせ" />
        <div className="cork">
          {NEWS.map((n, i) => (
            <article key={n.date} className={'note note--' + i}>
              <span className="note__pin" aria-hidden="true" />
              <p className="note__meta"><time>{n.date}</time><span>{n.tag}</span></p>
              <h3>{n.title}</h3>
              <p>{n.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────── アクセス
export function Access() {
  return (
    <section id="access" className="sec sec--access">
      <div className="sec__inner">
        <Heading en="ACCESS" ja="お店への行きかた" />
        <div className="sec__split sec__split--access">
          <AccessScene />
          <div className="access__info">
            <ol className="route">
              <li><span><b>ひだまり駅</b> 北口を出て、まっすぐ</span></li>
              <li><span>ひとつめの角を<b>右へ</b></span></li>
              <li><span>黄色とグレーのオーニングが目印。<b>徒歩5分</b></span></li>
            </ol>
            <dl className="shop-info">
              <div><dt>住所</dt><dd>ひだまり町 1-2-3（風車のとなり）</dd></div>
              <div><dt>営業時間</dt><dd>7:00 – 18:00（売り切れしだい終了）</dd></div>
              <div><dt>定休日</dt><dd>火曜日</dd></div>
              <div><dt>駐車場</dt><dd>3台（お店の前）・駐輪場あり</dd></div>
              <div><dt>お支払い</dt><dd>現金・クレジットカード・交通系IC・QR決済</dd></div>
              <div><dt>電話</dt><dd>000-0000-0000（予約・取り置きもどうぞ）</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

// ───────── SNS
const FEED = ['bear', 'croissant', 'melonpan', 'danish', 'butter-toast', 'pretzel'];
export function Sns() {
  return (
    <section id="sns" className="sec sec--sns">
      <div className="sec__inner sec__split sec__split--sns">
        <div>
          <Heading en="FOLLOW US" ja="焼きあがりを、毎朝おとどけ" light />
          <p className="sec-lead sec-lead--light">その日のパンや売り切れ情報を、InstagramとLINEで毎朝お知らせしています。</p>
          <div className="sns-btns">
            <span className="sns-btn sns-btn--ig">Instagram <small>@hidamari_bakery</small></span>
            <span className="sns-btn sns-btn--line">LINE 友だち追加</span>
          </div>
          <p className="note-demo">※デモサイトのため、実際のアカウントはありません。</p>
        </div>
        <div className="phone" aria-hidden="true">
          <div className="phone__bar"><b>hidamari_bakery</b><span>#ひだまりの焼きたて</span></div>
          <ul className="phone__grid">
            {FEED.map((k) => <li key={k}><img src={`menu/${k}.webp`} alt="" width="120" height="120" loading="lazy" /></li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
