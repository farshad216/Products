'use strict';

// Keep this block identical in server.js (geometry + colors).
const MAP = [
  [0, -0.5, 0, 42, 1, 42, 0.30, 0.34, 0.28],
  [0, 2, -20, 42, 4, 1, 0.45, 0.43, 0.38],
  [0, 2, 20, 42, 4, 1, 0.45, 0.43, 0.38],
  [-20, 2, 0, 1, 4, 40, 0.45, 0.43, 0.38],
  [20, 2, 0, 1, 4, 40, 0.45, 0.43, 0.38],
  [-6, 0.6, -6, 3, 1.2, 1.5, 0.52, 0.36, 0.26],
  [6, 0.55, 6, 2.5, 1.1, 2.5, 0.50, 0.34, 0.24],
  [0, 0.4, -4, 1.4, 0.8, 3, 0.36, 0.40, 0.46],
  [-8, 0.7, 8, 5, 0.5, 4, 0.42, 0.30, 0.26],
  [9, 1.05, -7, 4, 0.5, 4, 0.28, 0.36, 0.42],
  [0, 1.1, 12, 8, 2.2, 1, 0.40, 0.40, 0.44]
];

const SPAWN = [
  { x: -15, y: 0, z: 0, yaw: -Math.PI / 2 },
  { x: 15, y: 0, z: 0, yaw: Math.PI / 2 }
];

const WORLD = MAP.map((b) => ({
  minX: b[0] - b[3] / 2, maxX: b[0] + b[3] / 2,
  minY: b[1] - b[4] / 2, maxY: b[1] + b[4] / 2,
  minZ: b[2] - b[5] / 2, maxZ: b[2] + b[5] / 2
}));

const HX = 0.3;
const HZ = 0.3;
const HH = 1.7;
const SPEED = 6.5;

const canvas = document.getElementById('view');
const menu = document.getElementById('menu');
const hud = document.getElementById('hud');
const statusEl = document.getElementById('status');
const hpEl = document.getElementById('hp');
const ammoEl = document.getElementById('ammo');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const xhair = document.getElementById('xhair');
const scopeEl = document.getElementById('scope');
const endEl = document.getElementById('end');

const keys = {};
let jumpQueued = false;
let scoped = false;
let phase = 'menu';
let left = 300000;
let you = 0;
let opp = null;
let oppScore = 0;
let prevAmmo = 5;
let prevRel = 0;
let ws = null;
let sendAt = 0;
let audio = null;

const me = {
  x: SPAWN[0].x, y: SPAWN[0].y, z: SPAWN[0].z, yaw: SPAWN[0].yaw, pitch: 0,
  vx: 0, vy: 0, vz: 0, grounded: false,
  hp: 100, ammo: 5, rel: 0, score: 0, alive: 0
};

const ghost = { x: 15, y: 0, z: 0, alive: 0, ready: false };

function overlaps(x, y, z, b) {
  return x - HX < b.maxX && x + HX > b.minX &&
    y < b.maxY && y + HH > b.minY &&
    z - HZ < b.maxZ && z + HZ > b.minZ;
}

function simulate(dt) {
  if (phase !== 'play' || !me.alive) {
    me.vx = 0;
    me.vz = 0;
    return;
  }
  let f = 0;
  let s = 0;
  if (keys.KeyW) f += 1;
  if (keys.KeyS) f -= 1;
  if (keys.KeyD) s += 1;
  if (keys.KeyA) s -= 1;
  const fx = -Math.sin(me.yaw);
  const fz = -Math.cos(me.yaw);
  const rx = Math.cos(me.yaw);
  const rz = -Math.sin(me.yaw);
  let mx = fx * f + rx * s;
  let mz = fz * f + rz * s;
  const len = Math.hypot(mx, mz);
  if (len > 0) {
    mx /= len;
    mz /= len;
  }
  me.vx = mx * SPEED;
  me.vz = mz * SPEED;
  me.vy -= 18 * dt;
  if (me.vy < -12) me.vy = -12;
  if (jumpQueued && me.grounded) me.vy = 7.6;
  jumpQueued = false;

  let x = me.x + me.vx * dt;
  for (const b of WORLD) {
    if (!overlaps(x, me.y, me.z, b)) continue;
    x = me.vx > 0 ? b.minX - HX : b.maxX + HX;
    me.vx = 0;
  }
  let z = me.z + me.vz * dt;
  for (const b of WORLD) {
    if (!overlaps(x, me.y, z, b)) continue;
    z = me.vz > 0 ? b.minZ - HZ : b.maxZ + HZ;
    me.vz = 0;
  }
  let y = me.y + me.vy * dt;
  me.grounded = false;
  for (const b of WORLD) {
    if (!overlaps(x, y, z, b)) continue;
    if (me.vy > 0) y = b.minY - HH;
    else {
      y = b.maxY;
      me.grounded = true;
    }
    me.vy = 0;
  }
  if (y < 0) {
    y = 0;
    if (me.vy < 0) me.vy = 0;
    me.grounded = true;
  }
  me.x = x;
  me.y = y;
  me.z = z;
}

function primeAudio() {
  try {
    audio = audio || new AudioContext();
    if (audio.state === 'suspended') audio.resume();
  } catch (e) {}
}

function beep(freq, dur) {
  try {
    if (!audio) return;
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    g.gain.value = 0.04;
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + dur);
  } catch (e) {}
}

function sendMsg(obj) {
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
}

function sendPose() {
  sendMsg({ t: 'in', x: me.x, y: me.y, z: me.z, yaw: me.yaw, pitch: me.pitch });
}

function fmtTime(ms) {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m + ':' + (r < 10 ? '0' : '') + r;
}

function resultText() {
  if (me.score > oppScore) return 'Win';
  if (me.score < oppScore) return 'Lose';
  return 'Draw';
}

function paintHud() {
  hpEl.textContent = 'HP ' + me.hp;
  ammoEl.textContent = me.rel ? 'Reloading ' + me.ammo + '/5' : me.ammo + '/5';
  scoreEl.textContent = 'You ' + me.score + ' / Opp ' + oppScore;
  timeEl.textContent = fmtTime(left);
  const over = phase === 'end';
  endEl.hidden = !over;
  endEl.textContent = over ? resultText() : '';
  xhair.hidden = scoped || over;
  scopeEl.hidden = !scoped || over;
}

function applyState(m) {
  phase = m.ph;
  left = m.left;
  if (Number.isInteger(m.you)) you = m.you;
  const mine = m.p && m.p[you];
  opp = m.p ? m.p[1 - you] : null;
  oppScore = opp ? opp.score : 0;
  if (!mine) {
    paintHud();
    return;
  }
  const was = me.alive;
  if (mine.ammo < prevAmmo && mine.alive) beep(720, 0.04);
  if (mine.rel && !prevRel) beep(160, 0.1);
  prevAmmo = mine.ammo;
  prevRel = mine.rel;
  me.hp = mine.hp;
  me.ammo = mine.ammo;
  me.rel = mine.rel;
  me.score = mine.score;
  me.alive = mine.alive;
  if (!was && mine.alive) {
    me.x = mine.x;
    me.y = mine.y;
    me.z = mine.z;
    me.yaw = mine.yaw;
    me.pitch = 0;
    me.vy = 0;
    sendPose();
  }
  if (phase === 'play' || phase === 'end') {
    menu.hidden = true;
    hud.hidden = false;
  }
  if (phase !== 'play') scoped = false;
  paintHud();
}

function connect(boot) {
  primeAudio();
  if (ws && ws.readyState === WebSocket.OPEN) {
    sendMsg(boot);
    return;
  }
  if (ws && ws.readyState === WebSocket.CONNECTING) return;
  const proto = location.protocol === 'https:' ? 'wss://' : 'ws://';
  ws = new WebSocket(proto + location.host);
  ws.onopen = () => sendMsg(boot);
  ws.onmessage = (ev) => {
    let m;
    try {
      m = JSON.parse(ev.data);
    } catch (e) {
      return;
    }
    if (m.t === 'room') {
      you = m.you;
      statusEl.textContent = 'Room ' + m.code + ' — waiting for opponent';
    } else if (m.t === 'err') {
      statusEl.textContent = m.m === 'full' ? 'Room is full' : 'Room not found';
    } else if (m.t === 'st') {
      applyState(m);
    }
  };
  ws.onclose = () => {
    if (phase !== 'end') statusEl.textContent = 'Disconnected';
  };
}

document.getElementById('host').onclick = () => {
  statusEl.textContent = 'Connecting…';
  connect({ t: 'host' });
};

document.getElementById('join').onclick = () => {
  const code = document.getElementById('code').value.trim().toUpperCase();
  if (!code) {
    statusEl.textContent = 'Enter a room code';
    return;
  }
  statusEl.textContent = 'Connecting…';
  connect({ t: 'join', code });
};

addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space') {
    e.preventDefault();
    jumpQueued = true;
  }
  if (e.code === 'KeyR' && phase === 'play' && me.alive) sendMsg({ t: 'reload' });
});

addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

addEventListener('blur', () => {
  for (const k of Object.keys(keys)) keys[k] = false;
  scoped = false;
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

canvas.addEventListener('mousedown', (e) => {
  if (phase !== 'play') return;
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
    return;
  }
  if (e.button === 0 && me.alive && !me.rel && me.ammo > 0) {
    sendPose();
    sendMsg({ t: 'fire' });
  } else if (e.button === 2) {
    scoped = true;
    paintHud();
  }
});

addEventListener('mouseup', (e) => {
  if (e.button === 2) {
    scoped = false;
    paintHud();
  }
});

addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== canvas || phase !== 'play' || !me.alive) return;
  const sens = scoped ? 0.0006 : 0.0022;
  me.yaw -= e.movementX * sens;
  me.pitch -= e.movementY * sens;
  if (me.pitch > 1.25) me.pitch = 1.25;
  if (me.pitch < -1.25) me.pitch = -1.25;
});

const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: true, powerPreference: 'low-power' });
if (!gl) statusEl.textContent = 'WebGL is not available';

function sh(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

let locM = null;
let locC = null;

if (gl) {
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec3 aP;uniform mat4 uM;void main(){gl_Position=uM*vec4(aP,1.0);}'));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, 'precision mediump float;uniform vec3 uC;void main(){gl_FragColor=vec4(uC,1.0);}'));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  locM = gl.getUniformLocation(prog, 'uM');
  locC = gl.getUniformLocation(prog, 'uC');
  const verts = [];
  for (let a = 0; a < 3; a++) {
    for (const side of [0.5, -0.5]) {
      const u = (a + 1) % 3;
      const v = (a + 2) % 3;
      const corners = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
      for (const c of corners) {
        const p = [0, 0, 0];
        p[a] = side;
        p[u] = c[0];
        p[v] = c[1];
        verts.push(p[0], p[1], p[2]);
      }
    }
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  const locA = gl.getAttribLocation(prog, 'aP');
  gl.enableVertexAttribArray(locA);
  gl.vertexAttribPointer(locA, 3, gl.FLOAT, false, 0, 0);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.12, 0.13, 0.15, 1);
}

function mul(a, b) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return o;
}

function viewMatrix(eye, yaw, pitch) {
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const fx = -sy * cp;
  const fy = sp;
  const fz = -cy * cp;
  const rx = cy;
  const ry = 0;
  const rz = -sy;
  const ux = sy * sp;
  const uy = cp;
  const uz = cy * sp;
  const m = new Float32Array(16);
  m[0] = rx;
  m[4] = ry;
  m[8] = rz;
  m[12] = -(rx * eye[0] + ry * eye[1] + rz * eye[2]);
  m[1] = ux;
  m[5] = uy;
  m[9] = uz;
  m[13] = -(ux * eye[0] + uy * eye[1] + uz * eye[2]);
  m[2] = -fx;
  m[6] = -fy;
  m[10] = -fz;
  m[14] = fx * eye[0] + fy * eye[1] + fz * eye[2];
  m[15] = 1;
  return m;
}

function persp(fov, aspect, n, f) {
  const m = new Float32Array(16);
  const t = 1 / Math.tan(fov / 2);
  m[0] = t / aspect;
  m[5] = t;
  m[10] = (f + n) / (n - f);
  m[11] = -1;
  m[14] = (2 * f * n) / (n - f);
  return m;
}

function model(x, y, z, sx, sy, sz) {
  const m = new Float32Array(16);
  m[0] = sx;
  m[5] = sy;
  m[10] = sz;
  m[15] = 1;
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
}

let proj = persp(1.2, 1, 0.05, 200);
let view = viewMatrix([SPAWN[0].x, SPAWN[0].y + 1.55, SPAWN[0].z], SPAWN[0].yaw, 0);

function drawBox(x, y, z, sx, sy, sz, r, g, b) {
  const mvp = mul(proj, mul(view, model(x, y, z, sx, sy, sz)));
  gl.uniformMatrix4fv(locM, false, mvp);
  gl.uniform3f(locC, r, g, b);
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function drawGun() {
  const ident = new Float32Array(16);
  ident[0] = ident[5] = ident[10] = ident[15] = 1;
  const saved = view;
  view = ident;
  drawBox(0.22, -0.26, -0.62, 0.07, 0.08, 0.62, 0.16, 0.16, 0.17);
  drawBox(0.22, -0.18, -0.42, 0.05, 0.06, 0.22, 0.22, 0.22, 0.24);
  view = saved;
}

function draw() {
  if (!gl) return;
  const w = canvas.clientWidth || 1;
  const h = canvas.clientHeight || 1;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  gl.viewport(0, 0, canvas.width, canvas.height);
  const fov = scoped ? 0.28 : 1.15;
  proj = persp(fov, canvas.width / canvas.height, 0.05, 200);
  const eyeY = me.y + 1.55;
  view = viewMatrix([me.x, eyeY, me.z], me.yaw, me.pitch);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  for (const b of MAP) drawBox(b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7], b[8]);
  if (ghost.alive) {
    drawBox(ghost.x, ghost.y + 0.71, ghost.z, 0.7, 1.42, 0.56, 0.55, 0.18, 0.16);
    drawBox(ghost.x, ghost.y + 1.6, ghost.z, 0.36, 0.36, 0.36, 0.78, 0.66, 0.52);
  }
  if (phase === 'play' && me.alive && !scoped) {
    gl.clear(gl.DEPTH_BUFFER_BIT);
    drawGun();
  }
}

function smoothGhost(dt) {
  if (!opp || !opp.alive) {
    ghost.alive = 0;
    return;
  }
  if (!ghost.ready || !ghost.alive || Math.hypot(opp.x - ghost.x, opp.z - ghost.z) > 3) {
    ghost.x = opp.x;
    ghost.y = opp.y;
    ghost.z = opp.z;
    ghost.ready = true;
  } else {
    const k = Math.min(1, dt * 14);
    ghost.x += (opp.x - ghost.x) * k;
    ghost.y += (opp.y - ghost.y) * k;
    ghost.z += (opp.z - ghost.z) * k;
  }
  ghost.alive = 1;
}

let last = performance.now();
let acc = 0;
function frame(now) {
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.05) dt = 0.05;
  acc += dt;
  while (acc >= 1 / 60) {
    simulate(1 / 60);
    acc -= 1 / 60;
  }
  smoothGhost(dt);
  if (phase === 'play' && me.alive && now >= sendAt) {
    sendPose();
    sendAt = now + 50;
  }
  draw();
  requestAnimationFrame(frame);
}

if (gl) requestAnimationFrame(frame);
