import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import World from './World.jsx';
import { buildTimeline, scrollToChapter } from './timeline.js';
import { Signature, Timetable, Kodawari, News, Access, Sns } from './Sections.jsx';

const STEPS = ['小麦粉がとどく', 'こねる', 'ふくらむ', 'ならべる', '開店！'];
const CHAPTERS = [
  { id: 'ch1', time: '4:00 AM', no: '01', title: '小麦粉がとどく', text: '風車の製粉所で、ひいたばかりの小麦粉をトラックに積みこみ。まだ暗い町を走って、パン屋さんへ。' },
  { id: 'ch2', time: '4:30 AM', no: '02', title: '生地をこねる', text: '粉と水をあわせて、ぎゅっ、ぎゅっ。なめらかになるまでこねたら、ひとつずつ丸めて天板へ。' },
  { id: 'ch3', time: '5:30 AM', no: '03', title: 'オーブンでふくらむ', text: '200℃のオーブンへ。小さな生地が、ぷくーっとふくらんで、こんがりきつね色に。' },
  { id: 'ch4', time: '6:30 AM', no: '04', title: '焼きたてを並べる', text: 'めろんぱん、くろわっさん、くまさんのぱん…。焼きたてを並べて、値札をつけたら準備完了。' },
  { id: 'ch5', time: '7:00 AM', no: '05', title: 'シャッターが上がって、開店！', text: '朝日といっしょにシャッターオープン。今日いちばんの焼きたてを、どうぞ。' },
];
const MENU = [
  ['shokupan', 'しょくぱん'], ['butter-toast', 'ばたーとーすと'], ['croissant', 'くろわっさん'], ['kuppe', 'くっぺ'], ['baguette', 'ばげっと'],
  ['melonpan', 'めろんぱん'], ['wiener', 'うぃんなーぱん'], ['pretzel', 'ろっげんぶろーと'], ['bear', 'くまさんのぱん'], ['danish', 'でにっしゅ'],
];

function Logo({ small }) {
  return (
    <span className={'logo' + (small ? ' logo--small' : '')} aria-label="ひだまりベーカリー">
      <svg viewBox="0 0 64 40" aria-hidden="true">
        <path d="M10 34a22 22 0 0 1 44 0z" fill="#FFDF5E" />
        {[0, 1, 2, 3, 4].map((i) => {
          const a = Math.PI + ((i + 0.5) * Math.PI) / 5;
          return <line key={i} x1={32 + Math.cos(a) * 26} y1={34 + Math.sin(a) * 26} x2={32 + Math.cos(a) * 31} y2={34 + Math.sin(a) * 31} stroke="#FFC93C" strokeWidth="3" strokeLinecap="round" />;
        })}
        <rect x="6" y="34" width="52" height="4" rx="2" fill="#C8643A" />
      </svg>
      <span className="logo__text">
        <b>HIDAMARI</b>
        <small>ひだまりベーカリー</small>
      </span>
    </span>
  );
}

export default function App() {
  const [fontsReady, setFontsReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [hud, setHud] = useState({ progress: 0, clock: '3:50', chapter: 0 });
  const [past, setPast] = useState(false);

  useEffect(() => {
    let done = false;
    const finish = () => { if (!done) { done = true; setFontsReady(true); } };
    Promise.all([
      document.fonts.load('800 40px "Playfair Display"'),
      document.fonts.load('700 20px "Zen Maru Gothic"'),
    ]).then(finish, finish);
    const timer = setTimeout(finish, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!sceneReady) return;
    const kill = buildTimeline(setHud);
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => { clearTimeout(t); kill(); };
  }, [sceneReady]);

  // メニュー以降に来たら、固定表示の3D用UIを隠し、FVの描画も止める
  useEffect(() => {
    const menu = document.getElementById('menu');
    const check = () => {
      const p = menu.getBoundingClientRect().top < window.innerHeight * 0.65;
      document.body.classList.toggle('is-past-story', p);
      setPast(p);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, []);

  const dayish = hud.chapter >= 5;

  return (
    <>
      <div className={'loader' + (sceneReady ? ' is-done' : '')} aria-hidden={sceneReady}>
        <div className="loader__bread" />
        <p>オーブンを予熱中…</p>
      </div>

      <div className="stage" aria-hidden="true">
        {fontsReady && (
          <Canvas frameloop={past ? 'never' : 'always'} shadows flat dpr={[1, 1.75]} camera={{ fov: 32, near: 0.1, far: 300, position: [24, 21, 30] }}
            gl={{ antialias: true }} onCreated={() => setTimeout(() => setSceneReady(true), 400)}>
            <World />
          </Canvas>
        )}
      </div>

      <header className="hdr">
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Logo small /></a>
        <div className={'clock' + (dayish ? ' clock--day' : '')} aria-label={'現在の場面の時刻 ' + hud.clock}>
          <span className="clock__icon" aria-hidden="true">{dayish ? '☀' : '☾'}</span>
          {hud.clock}<small>AM</small>
        </div>
        <a className="hdr__menu" href="#menu">MENU</a>
      </header>

      <div className="overlay">
        <section id="hero" className="hero">
          <p className="kicker">BAKERY HIDAMARI ─ MORNING STORY</p>
          <h1>パン屋さんの<span>朝</span></h1>
          <p className="lead">まだ町が眠っている午前4時。<br />焼きたてが並ぶまでの3時間を、のぞいてみよう。</p>
          <div className="scroll-hint"><span />SCROLL</div>
        </section>

        {CHAPTERS.map((c) => (
          <article key={c.id} id={c.id} className={'card card--' + c.id}>
            <div className="card__head">
              <span className="card__no">{c.no}</span>
              <span className="card__time">{c.time}</span>
            </div>
            <h2>{c.title}</h2>
            <p>{c.text}</p>
          </article>
        ))}

        <section id="finale" className="finale">
          <p className="finale__price">ALL <b>500</b> YEN</p>
          <p className="finale__open">毎朝 7:00 OPEN</p>
          <div className="finale__btns">
            <a className="btn btn--fill" href="#menu">メニューを見る</a>
            <button className="btn" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>もう一度見る</button>
          </div>
        </section>
      </div>

      <nav className="steps" aria-label="ストーリーの場面">
        {STEPS.map((s, i) => (
          <button key={s} type="button" className={hud.chapter === i + 1 ? 'is-active' : hud.chapter > i + 1 ? 'is-past' : ''} onClick={() => scrollToChapter(i + 1)}>
            <span className="steps__dot" />
            <span className="steps__label">{s}</span>
          </button>
        ))}
      </nav>
      <div className="progress" aria-hidden="true"><span style={{ transform: `scaleX(${hud.progress})` }} /></div>

      <main id="top">
        <div id="scroll-track" />

        <section id="menu" className="menu">
          <div className="awning" aria-hidden="true" />
          <div className="menu__inner">
            <h2 className="menu__title">BREAD MENU <span>ALL <b>500</b> YEN</span></h2>
            <p className="menu__lead">毎朝この厨房で焼きあげる、10種類のパン。どれでも500円です。</p>
            <ul className="menu__grid">
              {MENU.map(([k, name]) => (
                <li key={k}>
                  <img src={`menu/${k}.webp`} alt="" width="360" height="360" loading="lazy" />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Signature />
        <Timetable />
        <Kodawari />
        <News />
        <Access />
        <Sns />
        <footer className="ftr">
          <Logo />
          <nav className="ftr__nav" aria-label="ページ内リンク">
            {[['#menu', 'メニュー'], ['#signature', '人気No.1'], ['#timetable', '焼きあがり時間'], ['#kodawari', 'こだわり'], ['#news', 'お知らせ'], ['#access', 'アクセス']].map(([h, t]) => <a key={h} href={h}>{t}</a>)}
          </nav>
          <p className="ftr__note">※このサイトは架空のパン屋さんのデモです。店舗情報・価格はサンプルです。</p>
          <small>© HIDAMARI BAKERY (Sample)</small>
        </footer>
      </main>
    </>
  );
}
