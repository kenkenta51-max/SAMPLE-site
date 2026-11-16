// キーボード・マウス・タッチの入力をまとめる。
// ゲーム側は毎フレーム readInput() を呼ぶだけでよい。

const keys = new Set();
const state = {
  joyX: 0,
  joyY: 0,
  touchJump: false,
  jumpQueued: false,
  camDX: 0,
  camDY: 0,
};

const isTyping = (e) => /input|textarea/i.test(e.target?.tagName || '');

window.addEventListener('keydown', (e) => {
  if (isTyping(e)) return;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (e.code === 'Space' && !e.repeat) state.jumpQueued = true;
  keys.add(e.code);
});
window.addEventListener('keyup', (e) => keys.delete(e.code));
window.addEventListener('blur', () => keys.clear());

export function pressJump(down) {
  if (down && !state.touchJump) state.jumpQueued = true;
  state.touchJump = down;
}

export function setJoystick(x, y) {
  state.joyX = x;
  state.joyY = y;
}

export function addCameraDrag(dx, dy) {
  state.camDX += dx;
  state.camDY += dy;
}

export function clearInput() {
  keys.clear();
  state.joyX = state.joyY = 0;
  state.touchJump = false;
  state.jumpQueued = false;
  state.camDX = state.camDY = 0;
}

const k = (...codes) => codes.some((c) => keys.has(c));

export function readInput() {
  let x = (k('KeyD', 'ArrowRight') ? 1 : 0) - (k('KeyA', 'ArrowLeft') ? 1 : 0);
  let y = (k('KeyW', 'ArrowUp') ? 1 : 0) - (k('KeyS', 'ArrowDown') ? 1 : 0);
  x += state.joyX;
  y += state.joyY;
  const len = Math.hypot(x, y);
  if (len > 1) {
    x /= len;
    y /= len;
  }
  const out = {
    x,
    y,
    jumpPressed: state.jumpQueued,
    jumpHeld: keys.has('Space') || state.touchJump,
    camKeys: (k('KeyE') ? 1 : 0) - (k('KeyQ') ? 1 : 0),
    camDX: state.camDX,
    camDY: state.camDY,
  };
  state.jumpQueued = false;
  state.camDX = state.camDY = 0;
  return out;
}

// カメラ操作：画面（キャンバス）をドラッグして回す
export function attachCameraDrag(el) {
  const active = new Map();
  const down = (e) => {
    active.set(e.pointerId, { x: e.clientX, y: e.clientY });
    el.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    const p = active.get(e.pointerId);
    if (!p) return;
    addCameraDrag(e.clientX - p.x, e.clientY - p.y);
    p.x = e.clientX;
    p.y = e.clientY;
  };
  const up = (e) => active.delete(e.pointerId);
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
  };
}
