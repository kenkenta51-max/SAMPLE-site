import { useEffect, useRef, useState } from 'react';
import { setJoystick, pressJump } from '../input.js';

// スマホ用：左下スティック＋右下ジャンプボタン
export default function TouchControls() {
  const [show, setShow] = useState(false);
  const base = useRef();
  const knob = useRef();
  const active = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setShow(mq.matches || 'ontouchstart' in window);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  if (!show) return null;

  const R = 46;
  const move = (e) => {
    if (active.current === null || e.pointerId !== active.current) return;
    const r = base.current.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > R) {
      dx = (dx / len) * R;
      dy = (dy / len) * R;
    }
    knob.current.style.transform = `translate(${dx}px, ${dy}px)`;
    const nx = dx / R, ny = -dy / R;
    const m = Math.hypot(nx, ny);
    setJoystick(m < 0.15 ? 0 : nx, m < 0.15 ? 0 : ny);
  };
  const end = (e) => {
    if (e.pointerId !== active.current) return;
    active.current = null;
    knob.current.style.transform = '';
    setJoystick(0, 0);
  };

  return (
    <div className="touch">
      <div
        className="stick"
        ref={base}
        onPointerDown={(e) => {
          e.stopPropagation();
          active.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e);
        }}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <div className="knob" ref={knob} />
      </div>
      <button
        className="jump-btn"
        aria-label="ジャンプ"
        onPointerDown={(e) => {
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          pressJump(true);
        }}
        onPointerUp={() => pressJump(false)}
        onPointerCancel={() => pressJump(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        Ⓐ
      </button>
      <p className="touch-tip">画面をドラッグでカメラを回せるよ</p>
    </div>
  );
}
