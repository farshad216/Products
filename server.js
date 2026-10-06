'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 8080;
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const MATCH_MS = Number(process.env.MATCH_MS) || 300000;
const RELOAD_MS = 1200;
const RESPAWN_MS = 3000;
const MAG = 5;
const EYE = 1.55;

// Keep this block identical in game.js (geometry + colors).
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

const rooms = new Map();

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

function aabb(x, y, z, sx, sy, sz) {
  return {
    minX: x - sx / 2, maxX: x + sx / 2,
    minY: y - sy / 2, maxY: y + sy / 2,
    minZ: z - sz / 2, maxZ: z + sz / 2
  };
}

function playerBox(p, part) {
  if (part === 'head') return aabb(p.x, p.y + 1.6, p.z, 0.36, 0.36, 0.36);
  return aabb(p.x, p.y + 0.71, p.z, 0.7, 1.42, 0.56);
}

function dir(yaw, pitch) {
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  return [-sy * cp, sp, -cy * cp];
}

function rayAABB(o, d, b) {
  let t0 = 0;
  let t1 = 400;
  const mn = [b.minX, b.minY, b.minZ];
  const mx = [b.maxX, b.maxY, b.maxZ];
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-8) {
      if (o[i] < mn[i] || o[i] > mx[i]) return null;
    } else {
      let a = (mn[i] - o[i]) / d[i];
      let c = (mx[i] - o[i]) / d[i];
      if (a > c) {
        const s = a;
        a = c;
        c = s;
      }
      if (a > t0) t0 = a;
      if (c < t1) t1 = c;
      if (t0 > t1) return null;
    }
  }
  if (t1 < 0) return null;
  return t0 >= 0 ? t0 : 0;
}

function sendFrame(socket, opcode, payload) {
  if (!socket || socket.destroyed) return;
  if (!Buffer.isBuffer(payload)) payload = Buffer.from(payload);
  const n = payload.length;
  let hdr;
  if (n < 126) {
    hdr = Buffer.alloc(2);
    hdr[0] = 0x80 | opcode;
    hdr[1] = n;
  } else if (n < 65536) {
    hdr = Buffer.alloc(4);
    hdr[0] = 0x80 | opcode;
    hdr[1] = 126;
    hdr.writeUInt16BE(n, 2);
  } else {
    hdr = Buffer.alloc(10);
    hdr[0] = 0x80 | opcode;
    hdr[1] = 127;
    hdr.writeBigUInt64BE(BigInt(n), 2);
  }
  try {
    socket.write(Buffer.concat([hdr, payload]));
  } catch (e) {}
}

function send(socket, obj) {
  sendFrame(socket, 1, JSON.stringify(obj));
}

function pub(p) {
  return {
    x: p.x, y: p.y, z: p.z, yaw: p.yaw, pitch: p.pitch,
    hp: p.hp, ammo: p.ammo, rel: p.rel ? 1 : 0, score: p.score, alive: p.alive ? 1 : 0
  };
}

function snapshot(room) {
  const now = Date.now();
  if (room.ph === 'play' && now >= room.end) room.ph = 'end';
  if (room.ph === 'play') {
    for (const p of room.ps) {
      if (!p) continue;
      if (p.rel && now >= p.relAt) {
        p.rel = 0;
        p.ammo = MAG;
      }
      if (!p.alive && p.respawn && now >= p.respawn) {
        const s = SPAWN[p.id];
        p.x = s.x;
        p.y = s.y;
        p.z = s.z;
        p.yaw = s.yaw;
        p.pitch = 0;
        p.hp = 100;
        p.ammo = MAG;
        p.rel = 0;
        p.alive = 1;
        p.respawn = 0;
        p.lock = now + 200;
      }
    }
  }
  const left = room.end ? Math.max(0, room.end - now) : MATCH_MS;
  const body = {
    t: 'st',
    ph: room.ph,
    left,
    p: room.ps.map((q) => (q ? pub(q) : null))
  };
  for (const p of room.ps) {
    if (!p || !p.sock || p.sock.destroyed) continue;
    body.you = p.id;
    send(p.sock, body);
  }
}

function makePlayer(id, sock) {
  const s = SPAWN[id];
  return {
    id, sock,
    x: s.x, y: s.y, z: s.z, yaw: s.yaw, pitch: 0,
    hp: 100, ammo: MAG, rel: 0, relAt: 0,
    score: 0, alive: 1, respawn: 0, lock: 0
  };
}

function makeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(4);
  let code = '';
  for (let i = 0; i < 4; i++) code += alphabet[bytes[i] % alphabet.length];
  return rooms.has(code) ? makeCode() : code;
}

function pose(room, p, m) {
  if (room.ph !== 'play' || !p.alive || Date.now() < p.lock) return;
  if (!Number.isFinite(m.x) || !Number.isFinite(m.y) || !Number.isFinite(m.z)) return;
  p.x = clamp(m.x, -24, 24);
  p.y = clamp(m.y, -1, 12);
  p.z = clamp(m.z, -24, 24);
  if (Number.isFinite(m.yaw)) p.yaw = m.yaw;
  if (Number.isFinite(m.pitch)) p.pitch = clamp(m.pitch, -1.45, 1.45);
}

function fire(room, p) {
  if (room.ph !== 'play' || !p.alive || p.rel || p.ammo <= 0) return;
  p.ammo -= 1;
  const opp = room.ps[1 - p.id];
  const origin = [p.x, p.y + EYE, p.z];
  const d = dir(p.yaw, p.pitch);
  let hit = null;
  if (opp && opp.alive) {
    const headT = rayAABB(origin, d, playerBox(opp, 'head'));
    const bodyT = rayAABB(origin, d, playerBox(opp, 'body'));
    if (headT != null && (bodyT == null || headT <= bodyT)) hit = { t: headT, part: 'head' };
    else if (bodyT != null) hit = { t: bodyT, part: 'body' };
  }
  let wallT = Infinity;
  for (const box of WORLD) {
    const t = rayAABB(origin, d, box);
    if (t != null && t < wallT) wallT = t;
  }
  if (hit && hit.t < wallT && opp) {
    opp.hp = hit.part === 'head' ? 0 : Math.max(0, opp.hp - 50);
    if (opp.hp <= 0 && opp.alive) {
      opp.alive = 0;
      opp.hp = 0;
      opp.rel = 0;
      opp.respawn = Date.now() + RESPAWN_MS;
      p.score += 1;
    }
  }
  snapshot(room);
}

function reload(room, p) {
  if (room.ph !== 'play' || !p.alive || p.rel || p.ammo >= MAG) return;
  p.rel = 1;
  p.relAt = Date.now() + RELOAD_MS;
  snapshot(room);
}

function leave(sock) {
  const room = sock.room;
  const p = sock.player;
  if (!room || !p) return;
  if (room.ps[p.id] === p) room.ps[p.id] = null;
  sock.room = null;
  sock.player = null;
  if (!room.ps[0] && !room.ps[1]) {
    rooms.delete(room.code);
    return;
  }
  if (room.ph === 'play') room.ph = 'end';
  snapshot(room);
}

function onText(sock, text) {
  let m;
  try {
    m = JSON.parse(text);
  } catch (e) {
    return;
  }
  if (!m || typeof m.t !== 'string') return;
  if (m.t === 'host') {
    if (sock.player) return;
    const code = makeCode();
    const p = makePlayer(0, sock);
    const room = { code, ph: 'wait', end: 0, ps: [p, null] };
    rooms.set(code, room);
    sock.player = p;
    sock.room = room;
    send(sock, { t: 'room', code, you: 0 });
    snapshot(room);
    return;
  }
  if (m.t === 'join') {
    if (sock.player) return;
    const code = String(m.code || '').toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      send(sock, { t: 'err', m: 'no room' });
      return;
    }
    if (room.ps[0] && room.ps[1]) {
      send(sock, { t: 'err', m: 'full' });
      sendFrame(sock, 8, Buffer.alloc(0));
      sock.end();
      return;
    }
    const id = room.ps[0] ? 1 : 0;
    const p = makePlayer(id, sock);
    room.ps[id] = p;
    sock.player = p;
    sock.room = room;
    if (room.ps[0] && room.ps[1] && room.ph === 'wait') {
      room.ph = 'play';
      room.end = Date.now() + MATCH_MS;
    }
    send(sock, { t: 'room', code, you: id });
    snapshot(room);
    return;
  }
  const p = sock.player;
  const room = sock.room;
  if (!p || !room) return;
  if (m.t === 'in') pose(room, p, m);
  else if (m.t === 'fire') fire(room, p);
  else if (m.t === 'reload') reload(room, p);
}

function setupSocket(socket, head) {
  socket.setNoDelay(true);
  socket.setTimeout(0);
  let buf = head && head.length ? Buffer.from(head) : Buffer.alloc(0);
  let acc = null;
  let accOp = 0;
  socket.on('data', (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    while (buf.length >= 2) {
      const opcode = buf[0] & 0x0f;
      const fin = (buf[0] & 0x80) !== 0;
      const masked = (buf[1] & 0x80) !== 0;
      let len = buf[1] & 0x7f;
      let off = 2;
      if (len === 126) {
        if (buf.length < 4) return;
        len = buf.readUInt16BE(2);
        off = 4;
      } else if (len === 127) {
        if (buf.length < 10) return;
        const big = buf.readBigUInt64BE(2);
        if (big > BigInt(1 << 20)) {
          socket.destroy();
          return;
        }
        len = Number(big);
        off = 10;
      }
      const maskLen = masked ? 4 : 0;
      if (buf.length < off + maskLen + len) return;
      let payload = Buffer.from(buf.subarray(off + maskLen, off + maskLen + len));
      if (masked) {
        const mask = buf.subarray(off, off + 4);
        for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3];
      }
      buf = buf.subarray(off + maskLen + len);
      if (opcode === 0x8) {
        socket.end();
        return;
      }
      if (opcode === 0x9) {
        sendFrame(socket, 0xA, payload);
        continue;
      }
      if (opcode === 0xA) continue;
      if (opcode === 0x1 || opcode === 0x2) {
        acc = payload;
        accOp = opcode;
      } else if (opcode === 0x0 && acc) {
        acc = Buffer.concat([acc, payload]);
      } else {
        continue;
      }
      if (fin && acc && accOp === 0x1) {
        const text = acc.toString();
        acc = null;
        onText(socket, text);
      }
    }
  });
  socket.on('close', () => leave(socket));
  socket.on('error', () => leave(socket));
}

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  const name = url === '/' || url === '/index.html' ? 'index.html' : url === '/game.js' ? 'game.js' : null;
  if (!name) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('not found');
    return;
  }
  const body = fs.readFileSync(path.join(__dirname, name));
  const type = name.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8';
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': body.length, 'Cache-Control': 'no-store' });
  res.end(body);
});

server.on('upgrade', (req, socket, head) => {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }
  const accept = crypto.createHash('sha1').update(key + GUID).digest('base64');
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    'Sec-WebSocket-Accept: ' + accept + '\r\n\r\n'
  );
  setupSocket(socket, head);
});

server.requestTimeout = 0;
server.headersTimeout = 0;
server.timeout = 0;

setInterval(() => {
  for (const room of rooms.values()) snapshot(room);
}, 50);

server.on('error', (err) => {
  console.error(err.message);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log('listening ' + PORT);
});
