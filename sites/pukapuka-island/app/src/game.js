// ゲームの中身（移動・当たり判定・敵・アイテム）。React には依存しない。
import { PLATFORMS, ITEMS, ENEMIES, CHECKPOINTS, AREAS, HINTS, GATE, KILL_Y } from './level.js';
import { store } from './store.js';
import { sfx } from './audio.js';

export const PLAYER = {
  radius: 0.42,
  height: 1.1,
  speed: 6.8,
  jump: 11.2,
  jump2: 9.8,
  spring: 20.5,
  gravity: 28,
  stompBounce: 11,
};

export function createWorld() {
  const platforms = PLATFORMS.map((p) => ({
    ...p,
    cx: p.x, cy: p.y, cz: p.z,
    dx: 0, dy: 0, dz: 0,
    angle: 0, dAngle: 0,
    crumble: 'idle', timer: 0,
    active: true,
    squash: 0,
  }));
  const items = ITEMS.map((it, i) => ({ ...it, pos: [...it.pos], home: [...it.pos], id: i, taken: false, pull: false }));
  const enemies = ENEMIES.map((e, i) => ({
    ...e,
    id: i,
    alive: true,
    deadT: 0,
    pos: [...(e.a || e.center)],
    facing: 0,
  }));
  const checkpoints = CHECKPOINTS.map((c, i) => ({ ...c, id: i, active: !!c.active }));
  store.set({ totalDrops: items.filter((i) => i.type === 'drop').length });

  return {
    t: 0,
    platforms,
    items,
    enemies,
    checkpoints,
    hintsShown: new Set(),
    area: -1,
    respawn: [...CHECKPOINTS[0].pos],
    gateCooldown: 0,
    clearT: 0,
    player: {
      pos: [...CHECKPOINTS[0].pos],
      vel: [0, 0, 0],
      facing: Math.PI,
      ground: null,
      coyote: 0,
      jumpBuffer: 0,
      jumps: 0,
      jumpCut: false,
      invuln: 0,
      // 見た目のアニメーション用
      anim: { run: 0, phase: 0, air: false, squash: 0, flip: 0, hurt: 0 },
    },
    cam: { yaw: 0, pitch: 0.42, lastManual: -10, target: [0, 1, 7] },
    fx: { burst: () => {} },
    slowmo: 0,
  };
}

// ---------- 足場 ----------
function updatePlatforms(w, dt) {
  for (const p of w.platforms) {
    let nx = p.x, ny = p.y, nz = p.z;
    if (p.move) {
      const s = Math.sin(w.t * p.move.speed + p.move.phase) * p.move.amp;
      nx += p.move.axis[0] * s;
      ny += p.move.axis[1] * s;
      nz += p.move.axis[2] * s;
    }
    p.dx = nx - p.cx; p.dy = ny - p.cy; p.dz = nz - p.cz;
    p.cx = nx; p.cy = ny; p.cz = nz;
    p.dAngle = p.spin ? p.spin * dt : 0;
    p.angle += p.dAngle;
    p.squash = Math.max(0, p.squash - dt * 3);

    if (p.kind === 'crumble') {
      if (p.crumble === 'shaking') {
        p.timer -= dt;
        if (p.timer <= 0) {
          p.crumble = 'gone';
          p.timer = 3;
          w.fx.burst([p.cx, p.cy, p.cz], '#f6d7a7', 14, { speed: 3, size: 0.22, gravity: 6 });
        }
      } else if (p.crumble === 'gone') {
        p.timer -= dt;
        if (p.timer <= 0) p.crumble = 'idle';
      }
      p.active = p.crumble !== 'gone';
    }
  }
}

function inFootprint(p, x, z, extra) {
  if (p.shape === 'cyl') return Math.hypot(x - p.cx, z - p.cz) <= p.r + extra;
  return Math.abs(x - p.cx) <= p.w / 2 + extra && Math.abs(z - p.cz) <= p.d / 2 + extra;
}

function pushOutSides(p, pos, r) {
  if (p.shape === 'cyl') {
    const dx = pos[0] - p.cx, dz = pos[2] - p.cz;
    const d = Math.hypot(dx, dz);
    const min = p.r + r;
    if (d < min && d > 1e-4) {
      pos[0] = p.cx + (dx / d) * min;
      pos[2] = p.cz + (dz / d) * min;
    }
  } else {
    const hx = p.w / 2, hz = p.d / 2;
    const qx = Math.max(p.cx - hx, Math.min(pos[0], p.cx + hx));
    const qz = Math.max(p.cz - hz, Math.min(pos[2], p.cz + hz));
    const dx = pos[0] - qx, dz = pos[2] - qz;
    const d = Math.hypot(dx, dz);
    if (d < r && d > 1e-4) {
      pos[0] = qx + (dx / d) * r;
      pos[2] = qz + (dz / d) * r;
    }
  }
}

// ---------- プレイヤー ----------
function hurt(w, fromX, fromZ) {
  const pl = w.player;
  if (pl.invuln > 0) return;
  const s = store.get();
  const hearts = s.hearts - 1;
  store.set({ hearts, misses: s.misses + 1 });
  sfx('hurt');
  pl.invuln = 1.6;
  pl.anim.hurt = 0.5;
  let kx = pl.pos[0] - fromX, kz = pl.pos[2] - fromZ;
  const kl = Math.hypot(kx, kz) || 1;
  pl.vel[0] = (kx / kl) * 7;
  pl.vel[2] = (kz / kl) * 7;
  pl.vel[1] = 7.5;
  pl.ground = null;
  w.fx.burst([pl.pos[0], pl.pos[1] + 0.6, pl.pos[2]], '#ff8fb1', 10, { speed: 4, size: 0.18 });
  if (hearts <= 0) gameOver(w);
}

function gameOver(w) {
  store.set({ phase: 'gameover', hint: null });
}

export function respawnAtCheckpoint(w, refill) {
  const pl = w.player;
  pl.pos = [...w.respawn];
  pl.vel = [0, 0, 0];
  pl.ground = null;
  pl.invuln = 1.2;
  if (refill) store.set({ hearts: store.get().maxHearts, phase: 'playing' });
}

function updatePlayer(w, dt, inp) {
  const pl = w.player;
  const pos = pl.pos;
  const vel = pl.vel;

  // 乗っている足場といっしょに動く
  const g = pl.ground;
  if (g) {
    pos[0] += g.dx; pos[1] += g.dy; pos[2] += g.dz;
    if (g.dAngle) {
      const ox = pos[0] - g.cx, oz = pos[2] - g.cz;
      const c = Math.cos(g.dAngle), s = Math.sin(g.dAngle);
      pos[0] = g.cx + ox * c + oz * s;
      pos[2] = g.cz - ox * s + oz * c;
      pl.facing += g.dAngle;
    }
  }

  // カメラ基準の移動方向
  const yaw = w.cam.yaw;
  const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
  const rx = Math.cos(yaw), rz = -Math.sin(yaw);
  const wx = rx * inp.x + fx * inp.y;
  const wz = rz * inp.x + fz * inp.y;
  const wl = Math.hypot(wx, wz);
  const accel = pl.ground ? 45 : 22;
  const tx = wx * PLAYER.speed, tz = wz * PLAYER.speed;
  const k = Math.min(1, accel * dt / PLAYER.speed);
  if (pl.anim.hurt <= 0) {
    vel[0] += (tx - vel[0]) * k;
    vel[2] += (tz - vel[2]) * k;
  }
  if (wl > 0.1) {
    const target = Math.atan2(wx, wz);
    let diff = target - pl.facing;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    pl.facing += diff * Math.min(1, dt * 14);
  }

  // ジャンプ（コヨーテタイム・先行入力つき）
  pl.coyote = pl.ground ? 0.1 : pl.coyote - dt;
  pl.jumpBuffer = inp.jumpPressed ? 0.13 : pl.jumpBuffer - dt;
  if (pl.jumpBuffer > 0) {
    if (pl.ground || pl.coyote > 0) {
      vel[1] = PLAYER.jump;
      pl.ground = null;
      pl.coyote = 0;
      pl.jumpBuffer = 0;
      pl.jumps = 1;
      pl.jumpCut = false;
      pl.anim.squash = -0.25;
      sfx('jump');
    } else if (pl.jumps < 2) {
      vel[1] = PLAYER.jump2;
      pl.jumps = 2;
      pl.jumpBuffer = 0;
      pl.jumpCut = false;
      pl.anim.flip = 1;
      sfx('jump2');
      w.fx.burst([pos[0], pos[1] + 0.2, pos[2]], '#ffffff', 8, { speed: 2.5, size: 0.2, gravity: -1 });
    }
  }
  // ボタンを早く離すと低いジャンプ
  if (!inp.jumpHeld && vel[1] > 4 && !pl.jumpCut && pl.jumps > 0) {
    vel[1] *= 0.55;
    pl.jumpCut = true;
  }

  // 落ちるときは少し速く（ふわっと上がって、ストンと落ちる）
  vel[1] = Math.max(vel[1] - PLAYER.gravity * (vel[1] < 0 ? 1.22 : 1) * dt, -30);

  // 横方向の移動と壁
  pos[0] += vel[0] * dt;
  pos[2] += vel[2] * dt;
  for (const p of w.platforms) {
    if (!p.active || !p.solid) continue;
    if (pos[1] < p.cy - 0.05 && pos[1] + PLAYER.height > p.cy - p.h) pushOutSides(p, pos, PLAYER.radius);
  }

  // 縦方向の移動と着地
  const prevY = pos[1];
  pos[1] += vel[1] * dt;
  let landed = null;
  if (vel[1] <= 0) {
    let best = -Infinity;
    for (const p of w.platforms) {
      if (!p.active) continue;
      const top = p.cy;
      const crossing = prevY >= top - 0.06 && pos[1] <= top;
      const stepUp = g && pos[1] < top && top - prevY <= 0.45 && prevY < top;
      if ((crossing || stepUp) && top > best && inFootprint(p, pos[0], pos[2], 0.2)) {
        best = top;
        landed = p;
      }
    }
  }
  if (landed) {
    const fallSpeed = -vel[1];
    pos[1] = landed.cy;
    vel[1] = 0;
    if (!pl.ground) {
      pl.anim.squash = Math.min(0.35, fallSpeed / 40);
      if (fallSpeed > 9) {
        sfx('land');
        w.fx.burst([pos[0], pos[1] + 0.05, pos[2]], '#ffffff', 6, { speed: 2, size: 0.18, gravity: 0 });
      }
    }
    pl.ground = landed;
    pl.jumps = 0;
    if (landed.kind === 'spring') {
      vel[1] = PLAYER.spring;
      pl.ground = null;
      pl.jumps = 1;
      pl.jumpCut = true;
      landed.squash = 1;
      pl.anim.flip = 1;
      sfx('spring');
    } else if (landed.kind === 'crumble' && landed.crumble === 'idle') {
      landed.crumble = 'shaking';
      landed.timer = 0.7;
      sfx('crumble');
    }
  } else {
    pl.ground = null;
  }

  // 落下
  if (pos[1] < KILL_Y) {
    sfx('fall');
    const s = store.get();
    const hearts = s.hearts - 1;
    store.set({ hearts, misses: s.misses + 1 });
    if (hearts <= 0) {
      gameOver(w);
      respawnAtCheckpoint(w, false);
    } else {
      respawnAtCheckpoint(w, false);
      store.hint('だいじょうぶ？ チェックポイントから もういちど！');
    }
  }

  pl.invuln = Math.max(0, pl.invuln - dt);
  const a = pl.anim;
  a.hurt = Math.max(0, a.hurt - dt);
  const hs = Math.hypot(vel[0], vel[2]);
  a.run += ((pl.ground ? Math.min(1, hs / PLAYER.speed) : 0) - a.run) * Math.min(1, dt * 10);
  a.phase += dt * (6 + hs * 1.6);
  // 走るとき足元に小さな土けむり
  pl.dustT = (pl.dustT || 0) - dt;
  if (pl.ground && hs > 4.5 && pl.dustT <= 0) {
    pl.dustT = 0.11;
    w.fx.burst([pos[0], pos[1] + 0.05, pos[2]], '#ffffff', 1, { speed: 0.8, size: 0.13, gravity: -0.5, life: 0.45 });
  }
  a.air = !pl.ground;
  a.squash += (0 - a.squash) * Math.min(1, dt * 9);
  a.flip = Math.max(0, a.flip - dt * 2.6);
}

// ---------- 敵 ----------
function updateEnemies(w, dt) {
  const pl = w.player;
  for (const e of w.enemies) {
    if (!e.alive) {
      e.deadT += dt;
      continue;
    }
    if (e.type === 'pomu') {
      const s = 0.5 - 0.5 * Math.cos(w.t * e.speed);
      const nx = e.a[0] + (e.b[0] - e.a[0]) * s;
      const nz = e.a[2] + (e.b[2] - e.a[2]) * s;
      const mx = nx - e.pos[0], mz = nz - e.pos[2];
      if (Math.hypot(mx, mz) > 1e-4) e.facing = Math.atan2(mx, mz);
      e.pos[0] = nx; e.pos[1] = e.a[1]; e.pos[2] = nz;

      const d = Math.hypot(pl.pos[0] - e.pos[0], pl.pos[2] - e.pos[2]);
      const dy = pl.pos[1] - e.pos[1];
      if (d < 0.95 && dy > -0.6 && dy < 1.1) {
        if (pl.vel[1] < 0 && dy > 0.45) {
          e.alive = false;
          pl.vel[1] = PLAYER.stompBounce;
          pl.jumps = 1;
          pl.jumpCut = true;
          pl.anim.squash = -0.2;
          sfx('stomp');
          w.fx.burst([e.pos[0], e.pos[1] + 0.5, e.pos[2]], '#ffb3cf', 16, { speed: 4, size: 0.22 });
          store.toast('ポムムを やっつけた！');
        } else {
          hurt(w, e.pos[0], e.pos[2]);
        }
      }
    } else if (e.type === 'chiku') {
      const ang = w.t * e.speed + e.phase;
      e.pos[0] = e.center[0] + Math.sin(ang) * e.radius;
      e.pos[2] = e.center[2] + Math.cos(ang) * e.radius;
      e.pos[1] = e.center[1] + Math.sin(w.t * 2.2 + e.phase) * 0.35;
      const dx = pl.pos[0] - e.pos[0];
      const dy = pl.pos[1] + 0.55 - e.pos[1];
      const dz = pl.pos[2] - e.pos[2];
      if (dx * dx + dy * dy + dz * dz < 1.05 * 1.05) hurt(w, e.pos[0], e.pos[2]);
    }
  }
}

// ---------- アイテム・チェックポイント・ヒント ----------
function updatePickups(w) {
  const pl = w.player;
  const cy = pl.pos[1] + 0.55;
  for (const it of w.items) {
    if (it.taken) continue;
    const dx = pl.pos[0] - it.pos[0], dy = cy - it.pos[1], dz = pl.pos[2] - it.pos[2];
    const d2 = dx * dx + dy * dy + dz * dz;
    // しずくは近づくと吸いよせられる
    if (it.type === 'drop' && (it.pull || d2 < 2.3 * 2.3)) {
      it.pull = true;
      const d = Math.sqrt(d2) || 1;
      const k = Math.min(1, (12 / d) * (1 / 60));
      it.pos[0] += dx * k; it.pos[1] += dy * k; it.pos[2] += dz * k;
    }
    const r = it.type === 'star' ? 1.4 : 1.05;
    if (d2 > r * r) continue;
    const s = store.get();
    if (it.type === 'heart') {
      if (s.hearts >= s.maxHearts) continue;
      store.set({ hearts: s.hearts + 1 });
      sfx('heart');
      w.fx.burst(it.pos, '#ff7aa8', 12, { speed: 3, size: 0.2 });
    } else if (it.type === 'drop') {
      store.set({ drops: s.drops + 1 });
      sfx('drop');
      w.fx.burst(it.pos, '#8fe3ff', 10, { speed: 2.6, size: 0.16, gravity: -1 });
    } else {
      const stars = s.stars + 1;
      store.set({ stars });
      sfx('star');
      w.fx.burst(it.pos, '#ffe066', 30, { speed: 5, size: 0.26, gravity: 2 });
      w.fx.burst(it.pos, '#ffffff', 16, { speed: 7, size: 0.14, gravity: 0, life: 0.5 });
      w.slowmo = 0.45;
      store.banner(`星のかけら ${stars}/3`);
      store.hint(
        stars < 3
          ? `星のかけら ゲット！ あと ${3 - stars}こ！`
          : '星のかけらが ぜんぶ そろった！ 塔の上の とびらへ いこう！',
      );
    }
    it.taken = true;
  }

  for (const c of w.checkpoints) {
    if (c.active) continue;
    if (Math.hypot(pl.pos[0] - c.pos[0], pl.pos[2] - c.pos[2]) < 2.6 && Math.abs(pl.pos[1] - c.pos[1]) < 2) {
      c.active = true;
      w.respawn = [...c.pos];
      sfx('checkpoint');
      store.toast('チェックポイント！');
      w.fx.burst([c.pos[0], c.pos[1] + 1.8, c.pos[2]], '#a6f0c6', 16, { speed: 3, size: 0.2 });
    }
  }

  for (let i = 0; i < HINTS.length; i++) {
    if (w.hintsShown.has(i)) continue;
    const h = HINTS[i];
    if (Math.hypot(pl.pos[0] - h.pos[0], pl.pos[2] - h.pos[2]) < h.r && Math.abs(pl.pos[1] - h.pos[1]) < 3) {
      w.hintsShown.add(i);
      store.hint(h.text);
    }
  }

  let area = -1;
  AREAS.forEach((a, i) => {
    if (Math.hypot(pl.pos[0] - a.center[0], pl.pos[2] - a.center[2]) < a.radius && pl.pos[1] > -3) area = i;
  });
  if (area !== -1 && area !== w.area) {
    w.area = area;
    store.banner(AREAS[area].name);
  }

  // とびら
  w.gateCooldown -= 1 / 60;
  const gz = GATE.zone;
  const gd = Math.hypot(pl.pos[0] - gz[0], pl.pos[2] - gz[2]);
  if (gd < GATE.zoneR && Math.abs(pl.pos[1] - gz[1]) < 1.5) {
    const s = store.get();
    if (s.stars >= 3) {
      store.set({ phase: 'clearing', hint: null });
      w.clearT = 0;
      sfx('boss');
    } else if (w.gateCooldown <= 0) {
      w.gateCooldown = 4;
      sfx('locked');
      store.hint(`とびらが あかない……。星のかけらが あと ${3 - s.stars}こ ひつようみたい。`);
    }
  }
}

export function step(w, dt, inp) {
  w.t += dt;
  updatePlatforms(w, dt);
  updatePlayer(w, dt, inp);
  updateEnemies(w, dt);
  updatePickups(w);
}

export function stepIdle(w, dt) {
  w.t += dt;
  updatePlatforms(w, dt);
}
