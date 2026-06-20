import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { MAX_PLAYERS_PER_ROOM, ROOM_CODE_LENGTH, ROOM_TTL_MS } from '../shared/constants.js';
import { CLIENT_TO_SERVER, SERVER_TO_CLIENT, sanitizeRoomCode, sanitizeSettings } from '../shared/protocol.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CLIENT_DIR = path.join(ROOT_DIR, 'client');
const PORT = Number(process.env.PORT || 3000);
const CORS_ORIGIN = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean) : true;
const SERVER_VERSION = '0.36.0';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CORS_ORIGIN, credentials: true },
  pingInterval: 8000,
  pingTimeout: 12000
});

const rooms = new Map();

app.use(express.static(CLIENT_DIR, { extensions: ['html'] }));
app.get('/health', (_req, res) => res.json({ ok: true, version: SERVER_VERSION, rooms: rooms.size, uptime: process.uptime() }));
app.get('/api/status', (_req, res) => res.json({ ok: true, version: SERVER_VERSION, rooms: rooms.size, players: [...rooms.values()].reduce((n, r) => n + r.players.size, 0), uptime: process.uptime() }));
app.get('*', (_req, res) => res.sendFile(path.join(CLIENT_DIR, 'index.html')));

const MAPS = {
  box: {
    size: 58, player: [0, 0],
    obstacles: [[-10,-8,8,4],[11,8,8,4],[-18,13,5,10],[18,-13,5,10],[0,20,16,3],[0,-20,16,3],[-25,0,3,16],[25,0,3,16]],
    spawns: [[-24,-24],[24,-24],[-24,24],[24,24],[0,-26],[0,26],[-26,0],[26,0]]
  },
  lane: {
    size: 62, player: [0, 0],
    obstacles: [[-18,0,5,46],[18,0,5,46],[0,-17,16,4],[0,17,16,4],[-6,-28,4,10],[6,28,4,10]],
    spawns: [[0,-28],[0,28],[-24,-24],[24,24],[-24,24],[24,-24]]
  },
  castle: {
    size: 72, player: [0, 13],
    obstacles: [[0,0,8,8],[-22,-22,11,11],[22,-22,11,11],[-22,22,11,11],[22,22,11,11],[0,-31,44,3],[0,31,44,3],[-31,0,3,44],[31,0,3,44],[-10,0,2,20],[10,0,2,20],[0,-10,20,2],[0,10,20,2]],
    spawns: [[-32,-32],[32,-32],[-32,32],[32,32],[0,-34],[0,34],[-34,0],[34,0]]
  },
  maze: {
    size: 112, player: [0, 0],
    obstacles: [[-43,-36,2,26],[-43,-3,2,24],[-43,32,2,30],[-31,-46,24,2],[-22,-33,2,18],[-17,-21,28,2],[-31,-8,20,2],[-21,9,2,22],[-35,23,22,2],[-26,43,2,20],[-7,-43,2,22],[5,-31,24,2],[18,-47,2,18],[33,-38,26,2],[45,-23,2,28],[28,-15,20,2],[12,-5,2,18],[29,4,28,2],[42,18,2,24],[22,30,24,2],[8,43,2,22],[-4,21,28,2],[-8,35,2,18],[-1,-17,2,16],[4,12,2,20],[-51,0,12,2],[51,0,12,2],[0,-51,2,12],[0,51,2,12],[-52,-52,10,2],[52,-52,10,2],[-52,52,10,2],[52,52,10,2],[-14,0,10,2],[16,17,2,10],[-16,16,2,12],[15,-19,2,10],[33,45,18,2],[-46,47,18,2],[-52,-18,2,18],[52,24,2,18],[-10,-52,18,2],[28,52,18,2]],
    spawns: [[-50,-50],[50,-50],[-50,50],[50,50],[0,-52],[0,52],[-52,0],[52,0],[-34,45],[37,-44],[-45,26],[44,-18]]
  }
};
const DIFFICULTY = {
  normal: { enemyHp: 1, enemySpeed: 1, enemyDamage: 1, spawn: 1 },
  hard: { enemyHp: 1.22, enemySpeed: 1.10, enemyDamage: 1.25, spawn: 1.18 },
  hell: { enemyHp: 1.45, enemySpeed: 1.18, enemyDamage: 1.45, spawn: 1.34 }
};
const REWARD_DEFS = {
  maxHp: { title: '최대 체력 +10', desc: '즉시 회복하고 최대 HP가 오른다.' },
  stamina: { title: '스태미너 +15', desc: '달릴 수 있는 시간이 늘어난다.' },
  damage: { title: '무기 데미지 +8%', desc: '모든 무기 피해가 오른다.' },
  wallHp: { title: '설치 벽 체력 +25%', desc: '앞으로 설치하는 벽이 더 오래 버틴다.' },
  ammo: { title: '탄약 보급 +25%', desc: '상자 탄약 획득량이 증가한다.' },
  kit: { title: '회복키트 저장 +10', desc: '회복키트 저장 한도가 늘어난다.' }
};
const REWARD_IDS = Object.keys(REWARD_DEFS);

const WEAPONS = {
  pistol: { damage: 24, range: 42, pellets: 1, spread: 0.004, pierce: 1, type: 'hitscan', magSize: 12, ammoMax: Infinity, reloadTime: .92, cooldown: .32 },
  smg: { damage: 12, range: 34, pellets: 1, spread: 0.018, pierce: 1, type: 'hitscan', magSize: 30, ammoMax: 160, reloadTime: 1.28, cooldown: .08 },
  shotgun: { damage: 13, range: 24, pellets: 8, spread: 0.095, pierce: 1, type: 'hitscan', magSize: 6, ammoMax: 48, reloadTime: 1.55, cooldown: .62 },
  grenade: { damage: 92, range: 22, radius: 5.2, type: 'grenade', magSize: 1, ammoMax: 20, reloadTime: 1.05, cooldown: .72, speed: 17 },
  rocket: { damage: 145, range: 56, radius: 6.8, type: 'rocket', magSize: 1, ammoMax: 18, reloadTime: 1.82, cooldown: .86, speed: 26 },
  railgun: { damage: 105, range: 70, pellets: 1, spread: 0, pierce: 8, type: 'rail', magSize: 3, ammoMax: 28, reloadTime: 1.70, cooldown: .75 },
  barrel: { type: 'placeMine', ammoMax: 12, cooldown: .45 },
  wall: { type: 'placeWall', ammoMax: 18, cooldown: .28 }
};

function makeWeaponState(startWave = 1) {
  const ammo = {}, mag = {}, cooldowns = {};
  for (const [id, w] of Object.entries(WEAPONS)) {
    cooldowns[id] = 0;
    if (w.magSize) mag[id] = w.magSize;
    if (w.ammoMax === Infinity) ammo[id] = 'Infinity';
    else if (Number.isFinite(w.ammoMax)) ammo[id] = Math.ceil(w.ammoMax * (startWave > 1 ? .62 : .45));
  }
  ammo.pistol = 'Infinity';
  return { ammo, mag, cooldowns, reload: null, lastFireAt: {} };
}
function ammoNumber(v) { return v === 'Infinity' || v === Infinity ? Infinity : (Number(v) || 0); }
function weaponPublicState(player) {
  const ws = player.weaponState || makeWeaponState(1);
  return {
    ammo: ws.ammo || {}, mag: ws.mag || {},
    reload: ws.reload ? { weapon: ws.reload.weapon, timer: ws.reload.timer, duration: ws.reload.duration } : null,
    cooldowns: ws.cooldowns || {}
  };
}
function weaponUnlocked(id, wave = 1) {
  const unlock = { pistol:1, smg:2, shotgun:3, grenade:4, barrel:5, wall:6, rocket:7, railgun:9 };
  return (unlock[id] || 1) <= wave;
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const dist2 = (ax, az, bx, bz) => (ax - bx) * (ax - bx) + (az - bz) * (az - bz);
const n = (v, fallback = 0, min = -1e6, max = 1e6) => {
  const x = Number(v);
  return Number.isFinite(x) ? Math.max(min, Math.min(max, x)) : fallback;
};


const SERVER_PLAYER = {
  radius: 0.46,
  walk: 4.15,
  sprint: 7.05,
  adsSlow: 0.46,
  accelWalk: 13,
  accelSprint: 17,
  friction: 18,
  staminaDrain: 40,
  staminaRegen: 20,
  gravity: 17.5,
  jumpVelocity: 6.4
};
function keyDown(keys, ...codes) {
  return codes.some(c => !!keys?.[c]);
}
function moveServerPlayer(game, player, dx, dz) {
  const r = SERVER_PLAYER.radius;
  let movedX = false, movedZ = false;
  if (!rectCollidesGame(game, player.state.x + dx, player.state.z, r)) { player.state.x += dx; movedX = true; }
  if (!rectCollidesGame(game, player.state.x, player.state.z + dz, r)) { player.state.z += dz; movedZ = true; }
  if (!movedX) player.motion.vx *= 0.18;
  if (!movedZ) player.motion.vz *= 0.18;
}
function separateServerPlayers(room) {
  const players = [...room.players.values()].filter(p => p.state && !p.state.downed && p.state.hp > 0);
  for (let i = 0; i < players.length; i++) for (let j = i + 1; j < players.length; j++) {
    const a = players[i], b = players[j];
    let dx = a.state.x - b.state.x, dz = a.state.z - b.state.z;
    let d2 = dx * dx + dz * dz;
    const minD = SERVER_PLAYER.radius * 2 + .08;
    if (d2 >= minD * minD) continue;
    if (d2 < .0001) { dx = Math.random() - .5; dz = Math.random() - .5; d2 = dx * dx + dz * dz || 1; }
    const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, push = Math.min(.09, (minD - d) * .50);
    if (!rectCollidesGame(room.game, a.state.x + nx * push, a.state.z + nz * push, SERVER_PLAYER.radius)) { a.state.x += nx * push; a.state.z += nz * push; }
    if (!rectCollidesGame(room.game, b.state.x - nx * push, b.state.z - nz * push, SERVER_PLAYER.radius)) { b.state.x -= nx * push; b.state.z -= nz * push; }
  }
}
function updateServerPlayers(room, dt) {
  const game = room.game;
  if (!game) return;
  const mapSize = game.map?.size || 80;
  for (const player of room.players.values()) {
    if (!player.motion) player.motion = { vx: 0, vz: 0, vy: 0, grounded: true, stamina: 100, staminaLocked: false };
    if (!player.input) player.input = { keys: {}, flags: {}, look: { yaw: player.state.yaw || 0, pitch: player.state.pitch || 0 }, weapon: player.state.weapon || 'pistol' };
    const ps = player.state;
    const m = player.motion;
    const inp = player.input;
    const keys = inp.keys || {};
    const flags = inp.flags || {};
    const lockedDown = !!ps.downed || ps.hp <= 0;
    ps.maxHp = player.upgrades?.maxHp || ps.maxHp || 100;
    ps.maxMedkits = player.upgrades?.maxMedkits || ps.maxMedkits || 100;
    ps.maxStamina = player.upgrades?.maxStamina || ps.maxStamina || 100;
    if (lockedDown) {
      ps.alive = false; ps.fire = false; ps.reload = false; ps.sprint = false; ps.move = 0;
      m.vx = 0; m.vz = 0;
      continue;
    }
    let mx = 0, mz = 0;
    if (keyDown(keys, 'KeyW', 'ArrowUp')) mz -= 1;
    if (keyDown(keys, 'KeyS', 'ArrowDown')) mz += 1;
    if (keyDown(keys, 'KeyA', 'ArrowLeft')) mx -= 1;
    if (keyDown(keys, 'KeyD', 'ArrowRight')) mx += 1;
    const rawMove = Math.hypot(mx, mz);
    if (rawMove > 0) { mx /= rawMove; mz /= rawMove; }
    const wantsSprint = keyDown(keys, 'ShiftLeft', 'ShiftRight');
    const ads = !!flags.ads;
    if (m.stamina <= 1) m.staminaLocked = true;
    if (m.stamina >= ps.maxStamina * .58) m.staminaLocked = false;
    const sprinting = wantsSprint && rawMove > .01 && !ads && !m.staminaLocked && m.stamina > 0;
    if (sprinting) m.stamina = Math.max(0, m.stamina - SERVER_PLAYER.staminaDrain * dt);
    else if (rawMove > .01 && !wantsSprint && !ads) m.stamina = Math.min(ps.maxStamina, m.stamina + SERVER_PLAYER.staminaRegen * dt);
    const speed = (sprinting ? SERVER_PLAYER.sprint : SERVER_PLAYER.walk) * (ads ? SERVER_PLAYER.adsSlow : 1) * (m.staminaLocked ? .90 : 1);
    const yaw = ps.yaw || 0;
    const sin = Math.sin(yaw), cos = Math.cos(yaw);
    const desiredVx = (mx * cos + mz * sin) * speed;
    const desiredVz = (-mx * sin + mz * cos) * speed;
    const accel = rawMove > .01 ? (1 - Math.exp(-dt * (sprinting ? SERVER_PLAYER.accelSprint : SERVER_PLAYER.accelWalk))) : (1 - Math.exp(-dt * SERVER_PLAYER.friction));
    m.vx += (desiredVx - m.vx) * accel;
    m.vz += (desiredVz - m.vz) * accel;
    if (Math.abs(m.vx) < .01) m.vx = 0;
    if (Math.abs(m.vz) < .01) m.vz = 0;
    moveServerPlayer(game, player, m.vx * dt, m.vz * dt);
    if (keyDown(keys, 'Space') && m.grounded) { m.vy = SERVER_PLAYER.jumpVelocity; m.grounded = false; }
    if (!m.grounded) {
      m.vy -= SERVER_PLAYER.gravity * dt;
      ps.y += m.vy * dt;
      if (ps.y <= 0) { ps.y = 0; m.vy = 0; m.grounded = true; }
    }
    ps.x = clamp(ps.x, -mapSize / 2 + 1.1, mapSize / 2 - 1.1);
    ps.z = clamp(ps.z, -mapSize / 2 + 1.1, mapSize / 2 - 1.1);
    ps.stamina = Math.round(m.stamina);
    ps.maxStamina = Math.round(ps.maxStamina);
    ps.grounded = !!m.grounded;
    ps.sprint = sprinting;
    ps.move = clamp(Math.hypot(m.vx, m.vz) / SERVER_PLAYER.sprint, 0, 1);
    ps.alive = ps.hp > 0 && !ps.downed;
    ps.updatedAt = Date.now();
  }
  separateServerPlayers(room);
}

function randomRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 40; attempt++) {
    let code = '';
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) code += chars[Math.floor(Math.random() * chars.length)];
    if (!rooms.has(code)) return code;
  }
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function makeToken(seed = '') { return String(seed || '').slice(0, 96) || ('pt_' + Math.random().toString(36).slice(2) + Date.now().toString(36)); }

function makePlayer(socket, role, token = '') {
  const weaponState = makeWeaponState(1);
  return {
    id: socket.id, token: makeToken(token || socket.handshake?.auth?.playerToken), role, ready: false, connected: true, disconnectedAt: 0, lastInputSeq: 0,
    upgrades: { damage: 1, wallHp: 1, ammoGain: 1, maxHp: 100, maxMedkits: 100, maxStamina: 100 },
    weaponState,
    input: { keys: {}, flags: {}, look: { yaw: 0, pitch: 0 }, weapon: 'pistol', seq: 0, updatedAt: Date.now() },
    motion: { vx: 0, vz: 0, vy: 0, grounded: true, stamina: 100, staminaLocked: false },
    state: { id: socket.id, x: 0, y: 0, z: 0, yaw: 0, pitch: 0, hp: 100, maxHp: 100, stamina: 100, maxStamina: 100, medkits: 0, maxMedkits: 100, weapon: 'pistol', weaponState: weaponPublicState({ weaponState }), alive: true, downed: false, downedAt: 0, reviveProgress: 0, ads: false, fire: false, reload: false, sprint: false, move: 0, seq: 0, updatedAt: Date.now(), actionSeq: 0 }
  };
}

function publicRoom(room) {
  return { roomCode: room.roomCode, hostId: room.hostId, phase: room.phase, settings: room.settings,
    players: [...room.players.values()].map(p => ({ id: p.id, role: p.role, ready: !!p.ready, connected: !!p.connected, lastInputSeq: p.lastInputSeq || 0, state: p.state })) };
}
function emitLobby(room) { io.to(room.roomCode).emit(SERVER_TO_CLIENT.LOBBY_UPDATE, { room: publicRoom(room) }); }
function getRoomOrError(socket, code) {
  const roomCode = sanitizeRoomCode(code);
  const room = rooms.get(roomCode);
  if (!room) socket.emit(SERVER_TO_CLIENT.LOBBY_ERROR, { message: '방을 찾을 수 없다.' });
  return room;
}

function findPlayerByToken(room, token = '') {
  const safe = makeToken(token);
  return [...room.players.values()].find(p => p.token === safe) || null;
}
function bindSocketToPlayer(room, player, socket) {
  const oldId = player.id;
  if (oldId !== socket.id) {
    room.players.delete(oldId);
    player.id = socket.id;
    player.state.id = socket.id;
    if (room.hostId === oldId) room.hostId = socket.id;
  }
  player.connected = true;
  player.disconnectedAt = 0;
  room.players.set(socket.id, player);
  socket.join(room.roomCode);
  socket.data.roomCode = room.roomCode;
  socket.data.playerToken = player.token;
  return player;
}
function leaveCurrentRoom(socket, { soft = false } = {}) {
  const currentCode = socket.data.roomCode;
  if (!currentCode) return;
  const room = rooms.get(currentCode);
  if (!room) return;
  const player = room.players.get(socket.id);
  if (player) {
    player.connected = false;
    player.disconnectedAt = Date.now();
  }
  socket.leave(currentCode);
  socket.data.roomCode = null;
  if (!soft) {
    room.players.delete(socket.id);
  }
  const allDisconnected = [...room.players.values()].every(p => !p.connected);
  if (room.players.size === 0 || allDisconnected) {
    room.emptyAt = Date.now();
    setTimeout(() => {
      const latest = rooms.get(currentCode);
      if (!latest) return;
      const stillEmpty = latest.players.size === 0 || [...latest.players.values()].every(p => !p.connected && Date.now() - (p.disconnectedAt || 0) >= ROOM_TTL_MS);
      if (stillEmpty && latest.emptyAt && Date.now() - latest.emptyAt >= ROOM_TTL_MS) rooms.delete(currentCode);
    }, ROOM_TTL_MS + 500);
  } else {
    if (room.hostId === socket.id) {
      const nextHost = [...room.players.values()].find(p => p.connected) || [...room.players.values()][0];
      if (nextHost) { room.hostId = nextHost.id; nextHost.role = 'host'; }
    }
    emitLobby(room);
  }
}


function enemyStats(type, wave, diff) {
  const scale = 1 + wave * .075;
  if (type === 'runner') return { hp: 20 * scale * diff.enemyHp, speed: 4.1 * diff.enemySpeed, damage: 13 * diff.enemyDamage, score: 18, radius: .46, range: 1.3, cd: .72 };
  if (type === 'devil') return { hp: 72 * scale * diff.enemyHp, speed: 1.85 * diff.enemySpeed, damage: 18 * diff.enemyDamage, score: 55, radius: .72, range: 12, cd: 1.65, ranged: true };
  if (type === 'tank') return { hp: 128 * scale * diff.enemyHp, speed: 1.45 * diff.enemySpeed, damage: 18 * diff.enemyDamage, score: 42, radius: .74, range: 1.5, cd: 1.12 };
  if (type === 'bomber') return { hp: 28 * scale * diff.enemyHp, speed: 3.25 * diff.enemySpeed, damage: 16 * diff.enemyDamage, score: 30, radius: .50, range: 2.0, cd: .25, blastRadius: 4.3, blastDamage: 88 * diff.enemyDamage };
  if (type === 'shield') return { hp: 62 * scale * diff.enemyHp, speed: 2.05 * diff.enemySpeed, damage: 14 * diff.enemyDamage, score: 34, radius: .58, range: 1.35, cd: .92, shielded: true };
  return { hp: 31 * scale * diff.enemyHp, speed: 2.45 * diff.enemySpeed, damage: 10 * diff.enemyDamage, score: 10, radius: .48, range: 1.25, cd: .92 };
}
function pickEnemyType(w) {
  const pool = [{ type: 'zombie', w: Math.max(18, 62 - w * 2.4) }];
  if (w >= 3) pool.push({ type: 'runner', w: clamp(14 + (w - 3) * 1.35, 14, 34) });
  if (w >= 4) pool.push({ type: 'tank', w: clamp(7 + (w - 4) * .85, 7, 22) });
  if (w >= 5) pool.push({ type: 'devil', w: clamp(8 + (w - 5) * .95, 8, 26) });
  if (w >= 7) pool.push({ type: 'bomber', w: clamp(5 + (w - 7) * .75, 5, 18) });
  if (w >= 10) pool.push({ type: 'shield', w: clamp(6 + (w - 10) * .72, 6, 18) });
  let total = pool.reduce((a, b) => a + b.w, 0), r = Math.random() * total;
  for (const p of pool) { r -= p.w; if (r <= 0) return p.type; }
  return 'zombie';
}
function makeGame(settings) {
  const sanitized = sanitizeSettings(settings);
  const wave = Math.max(1, Number(sanitized.startWave || 1) || 1);
  const map = MAPS[sanitized.map] || MAPS.box;
  return {
    wave, mapId: sanitized.map, diffId: sanitized.diff, enemies: [], nextEnemyId: 1,
    placeables: [], nextPlaceableId: 1, items: [], nextItemId: 1, itemTimer: 1.8, projectiles: [], nextProjectileId: 1,
    spawnQueue: waveSpawnCount(wave, sanitized.diff), spawnTimer: .35, waveBreak: 0, phase: 'combat', prepTimer: 0, reward: null,
    score: 0, kills: 0, headshots: 0, events: [], lastTick: Date.now(), map
  };
}
function waveSpawnCount(wave, diffId) {
  const diff = DIFFICULTY[diffId] || DIFFICULTY.normal;
  return clamp(Math.round((9 + wave * 3.65 + Math.sqrt(wave) * 2.2) * diff.spawn), 8, 88);
}
function rectCollides(map, x, z, r) {
  const half = map.size / 2 - r;
  if (x < -half || x > half || z < -half || z > half) return true;
  for (const o of map.obstacles) {
    const [ox, oz, w, d] = o;
    if (Math.abs(x - ox) < w / 2 + r && Math.abs(z - oz) < d / 2 + r) return true;
  }
  return false;
}
function rayRectDistance(sx, sz, dx, dz, ox, oz, w, d, maxT) {
  const minX = ox - w / 2, maxX = ox + w / 2, minZ = oz - d / 2, maxZ = oz + d / 2;
  let tmin = 0, tmax = maxT;
  if (Math.abs(dx) < 1e-6) { if (sx < minX || sx > maxX) return null; }
  else { const tx1 = (minX - sx) / dx, tx2 = (maxX - sx) / dx; tmin = Math.max(tmin, Math.min(tx1, tx2)); tmax = Math.min(tmax, Math.max(tx1, tx2)); }
  if (Math.abs(dz) < 1e-6) { if (sz < minZ || sz > maxZ) return null; }
  else { const tz1 = (minZ - sz) / dz, tz2 = (maxZ - sz) / dz; tmin = Math.max(tmin, Math.min(tz1, tz2)); tmax = Math.min(tmax, Math.max(tz1, tz2)); }
  if (tmax >= Math.max(0, tmin) && tmin <= maxT) return Math.max(0, tmin);
  return null;
}
function wallBlocks(map, sx, sz, dx, dz, maxT) {
  for (const o of map.obstacles) if (rayRectDistance(sx, sz, dx, dz, o[0], o[1], o[2], o[3], maxT) !== null) return true;
  return false;
}
function hasLineOfSight(map, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz) || 1;
  return !wallBlocks(map, ax, az, dx / len, dz / len, len);
}
function activeWalls(game) {
  return (game?.placeables || []).filter(p => p.alive !== false && p.kind === 'wall');
}
function activeMines(game) {
  return (game?.placeables || []).filter(p => p.alive !== false && p.kind === 'mine');
}
function rectCollidesGame(game, x, z, r) {
  if (rectCollides(game.map, x, z, r)) return true;
  for (const w of activeWalls(game)) {
    if (Math.abs(x - w.x) < w.w / 2 + r && Math.abs(z - w.z) < w.d / 2 + r) return true;
  }
  return false;
}
function wallBlocksGame(game, sx, sz, dx, dz, maxT) {
  if (wallBlocks(game.map, sx, sz, dx, dz, maxT)) return true;
  for (const w of activeWalls(game)) {
    if (rayRectDistance(sx, sz, dx, dz, w.x, w.z, w.w, w.d, maxT) !== null) return true;
  }
  return false;
}
function hasLineOfSightGame(game, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz) || 1;
  return !wallBlocksGame(game, ax, az, dx / len, dz / len, len);
}
function findWallOnRayGame(game, sx, sz, dx, dz, maxT) {
  let best = null;
  for (const w of activeWalls(game)) {
    const t = rayRectDistance(sx, sz, dx, dz, w.x, w.z, w.w, w.d, maxT);
    if (t !== null && (!best || t < best.distance)) best = { wall: w, distance: t };
  }
  return best;
}
function damageServerWall(game, wall, amount, source = 'damage') {
  if (!game || !wall || wall.alive === false) return false;
  wall.hp = Math.max(0, (wall.hp || 0) - Math.max(0, Number(amount) || 0));
  game.events.push({ type: 'wallDamage', wallId: wall.id, hp: wall.hp, maxHp: wall.maxHp, source, x: wall.x, z: wall.z });
  if (wall.hp <= 0) { wall.alive = false; game.events.push({ type: 'wallBreak', wallId: wall.id, x: wall.x, z: wall.z, source }); }
  return true;
}
function findSpawn(game, players) {
  const map = game.map;
  const spawnBases = [...map.spawns].sort(() => Math.random() - .5);
  for (const [bx, bz] of spawnBases) {
    for (let i = 0; i < 16; i++) {
      const x = bx + (Math.random() - .5) * 6;
      const z = bz + (Math.random() - .5) * 6;
      if (rectCollides(map, x, z, .8)) continue;
      if (players.some(p => p.state.alive && dist2(x, z, p.state.x, p.state.z) < 12 * 12)) continue;
      if (game.enemies.some(e => e.alive && dist2(x, z, e.x, e.z) < 2.4 * 2.4)) continue;
      return { x, z };
    }
  }
  return null;
}
function spawnEnemy(game, room) {
  const diff = DIFFICULTY[game.diffId] || DIFFICULTY.normal;
  const players = [...room.players.values()];
  const sp = findSpawn(game, players);
  if (!sp) return false;
  const type = pickEnemyType(game.wave);
  const s = enemyStats(type, game.wave, diff);
  const enemy = { id: game.nextEnemyId++, type, x: sp.x, z: sp.z, vx: 0, vz: 0, yaw: Math.random() * Math.PI * 2, hp: s.hp, maxHp: s.hp, speed: s.speed, radius: s.radius, damage: s.damage, score: s.score, attackCd: .4 + Math.random(), alive: true, targetPlayerId: null, lastHitPart: 'body' };
  game.enemies.push(enemy);
  game.events.push({ type: 'enemySpawn', enemyId: enemy.id, enemyType: type, x: enemy.x, z: enemy.z });
  return true;
}
function steerAroundWalls(game, e, tx, tz, dt) {
  const map = game.map;
  let dx = tx - e.x, dz = tz - e.z;
  let d = Math.hypot(dx, dz) || 1;
  let nx = dx / d, nz = dz / d;
  // 맵 벽이 직선 경로를 막으면, 좌우 후보 중 더 덜 막히고 목표에 가까워지는 방향을 고른다.
  if (wallBlocksGame(game, e.x, e.z, nx, nz, Math.min(d, 4.2))) {
    const candidates = [
      { x: nz, z: -nx }, { x: -nz, z: nx },
      { x: nx * .45 + nz * .9, z: nz * .45 - nx * .9 },
      { x: nx * .45 - nz * .9, z: nz * .45 + nx * .9 }
    ];
    let best = null, bestScore = Infinity;
    for (const c of candidates) {
      const len = Math.hypot(c.x, c.z) || 1;
      const cx = c.x / len, cz = c.z / len;
      const nxp = e.x + cx * 1.25, nzp = e.z + cz * 1.25;
      if (rectCollidesGame(game, nxp, nzp, e.radius)) continue;
      const score = Math.hypot(tx - nxp, tz - nzp) + (wallBlocksGame(game, e.x, e.z, cx, cz, 1.4) ? 10 : 0);
      if (score < bestScore) { bestScore = score; best = { x: cx, z: cz }; }
    }
    if (best) { nx = best.x; nz = best.z; }
  }
  return { x: nx, z: nz };
}
function moveEnemy(game, e, dx, dz) {
  const map = game.map;
  let moved = false;
  if (!rectCollidesGame(game, e.x + dx, e.z, e.radius)) { e.x += dx; moved = true; }
  if (!rectCollidesGame(game, e.x, e.z + dz, e.radius)) { e.z += dz; moved = true; }
  return moved;
}
function updateEnemies(room, dt) {
  const game = room.game;
  if (!game) return;
  const players = [...room.players.values()].filter(p => p.state.alive && p.state.hp > 0);
  if (!players.length) return;
  const diff = DIFFICULTY[game.diffId] || DIFFICULTY.normal;
  for (const e of game.enemies) {
    if (!e.alive) continue;
    e.attackCd = Math.max(0, (e.attackCd || 0) - dt);
    let target = null, bestD = Infinity;
    for (const p of players) {
      const d = dist2(e.x, e.z, p.state.x, p.state.z);
      const losBonus = hasLineOfSightGame(game, e.x, e.z, p.state.x, p.state.z) ? -.5 : 0;
      const score = Math.sqrt(d) + losBonus;
      if (score < bestD) { bestD = score; target = p; }
    }
    if (!target) continue;
    e.targetPlayerId = target.id;
    const px = target.state.x, pz = target.state.z;
    const dxp = px - e.x, dzp = pz - e.z;
    const d = Math.hypot(dxp, dzp) || 1;
    const rayDx = dxp / d, rayDz = dzp / d;
    const wallBlocker = findWallOnRayGame(game, e.x, e.z, rayDx, rayDz, Math.min(d, 18));
    const dir = steerAroundWalls(game, e, px, pz, dt);
    e.yaw = Math.atan2(dir.x, dir.z);
    if (wallBlocker && wallBlocker.distance < e.radius + 1.25 && e.attackCd <= 0 && e.type !== 'devil') {
      e.attackCd = e.type === 'tank' ? .72 : .92;
      damageServerWall(game, wallBlocker.wall, e.damage * (e.type === 'tank' ? 2.4 : 1.25), 'enemy');
      game.events.push({ type: 'enemyMelee', enemyId: e.id, targetWallId: wallBlocker.wall.id, x: e.x, z: e.z });
      continue;
    }
    if (e.type === 'devil' && wallBlocker && wallBlocker.distance < 13 && e.attackCd <= 0) {
      e.attackCd = 1.55;
      damageServerWall(game, wallBlocker.wall, e.damage * 2.2, 'devilFireball');
      game.events.push({ type: 'devilCast', enemyId: e.id, targetWallId: wallBlocker.wall.id, x: e.x, z: e.z });
    } else if (e.type === 'devil' && d < 13 && hasLineOfSightGame(game, e.x, e.z, px, pz)) {
      e.vx *= .82; e.vz *= .82;
      if (e.attackCd <= 0) {
        e.attackCd = 1.55;
        damageServerPlayer(game, target, e.damage * .55, 'devilFireball', { x: e.x, z: e.z });
        game.events.push({ type: 'devilCast', enemyId: e.id, targetPlayerId: target.id, x: e.x, z: e.z });
      }
    } else {
      const acc = 1 - Math.exp(-dt * 8);
      e.vx += (dir.x * e.speed - e.vx) * acc;
      e.vz += (dir.z * e.speed - e.vz) * acc;
      moveEnemy(game, e, e.vx * dt, e.vz * dt);
    }
    const reach = e.radius + .48 + (e.type === 'runner' ? .82 : e.type === 'tank' ? .92 : .72);
    if (e.type === 'bomber' && d < 2.35 && e.attackCd <= 0) {
      e.alive = false;
      for (const p of players) {
        const pd = Math.sqrt(dist2(e.x, e.z, p.state.x, p.state.z));
        if (pd <= 4.3) damageServerPlayer(game, p, 88 * diff.enemyDamage * (1 - pd / 4.3 * .55), 'bomber', { x: e.x, z: e.z });
      }
      game.events.push({ type: 'enemyExplode', enemyId: e.id, x: e.x, z: e.z });
    } else if (e.type !== 'devil' && d < reach && e.attackCd <= 0 && hasLineOfSightGame(game, e.x, e.z, px, pz)) {
      e.attackCd = e.type === 'runner' ? .72 : e.type === 'tank' ? 1.12 : .92;
      damageServerPlayer(game, target, e.damage * (e.type === 'runner' ? .46 : e.type === 'tank' ? .72 : .60), 'melee', { x: e.x, z: e.z });
      game.events.push({ type: 'enemyMelee', enemyId: e.id, targetPlayerId: target.id, x: e.x, z: e.z });
    }
  }
  // 서버에서도 적끼리 아주 간단히 밀어내서 여러 마리가 한 점으로 겹치지 않게 한다.
  const alive = game.enemies.filter(e => e.alive);
  for (let i = 0; i < alive.length; i++) for (let j = i + 1; j < alive.length; j++) {
    const a = alive[i], b = alive[j];
    let dx = a.x - b.x, dz = a.z - b.z;
    let d2 = dx * dx + dz * dz;
    const minD = a.radius + b.radius + .18;
    if (d2 >= minD * minD) continue;
    if (d2 < .0001) { dx = Math.random() - .5; dz = Math.random() - .5; d2 = dx * dx + dz * dz || 1; }
    const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, push = Math.min(.07, (minD - d) * .28);
    moveEnemy(game, a, nx * push, nz * push); moveEnemy(game, b, -nx * push, -nz * push);
  }
}
function raySphere(sx, sy, sz, dx, dy, dz, cx, cy, cz, radius, maxT) {
  const ox = sx - cx, oy = sy - cy, oz = sz - cz;
  const b = 2 * (ox * dx + oy * dy + oz * dz);
  const c = ox * ox + oy * oy + oz * oz - radius * radius;
  const disc = b * b - 4 * c;
  if (disc < 0) return null;
  const r = Math.sqrt(disc), t1 = (-b - r) / 2, t2 = (-b + r) / 2;
  const t = t1 > .05 ? t1 : (t2 > .05 ? t2 : null);
  return t !== null && t <= maxT ? t : null;
}
function syncWeaponState(player) {
  if (!player?.state) return;
  player.state.weaponState = weaponPublicState(player);
  player.state.reload = !!player.weaponState?.reload;
}
function updatePlayerReloads(room, dt) {
  const game = room.game;
  for (const player of room.players.values()) {
    const ws = player.weaponState || (player.weaponState = makeWeaponState(game?.wave || 1));
    if (!ws.reload) { syncWeaponState(player); continue; }
    ws.reload.timer = Math.max(0, ws.reload.timer - dt);
    if (ws.reload.timer > 0) { syncWeaponState(player); continue; }
    const w = WEAPONS[ws.reload.weapon];
    if (w?.magSize) {
      const current = Number(ws.mag[w.id] || 0);
      const need = Math.max(0, w.magSize - current);
      if (need > 0) {
        const reserve = ammoNumber(ws.ammo[w.id]);
        if (reserve === Infinity) ws.mag[w.id] = w.magSize;
        else {
          const take = Math.min(need, reserve);
          ws.mag[w.id] = current + take;
          ws.ammo[w.id] = Math.max(0, reserve - take);
        }
      }
      game?.events.push({ type: 'reloadEnd', playerId: player.id, weapon: w.id, weaponState: weaponPublicState(player) });
    }
    ws.reload = null;
    syncWeaponState(player);
  }
}
function startServerReload(room, player, weaponId) {
  const game = room.game; if (!game) return false;
  const w = WEAPONS[weaponId]; if (!w?.magSize || !weaponUnlocked(weaponId, game.wave)) return false;
  const ws = player.weaponState || (player.weaponState = makeWeaponState(game.wave));
  if (ws.reload) return false;
  const mag = Number(ws.mag[weaponId] || 0);
  if (mag >= w.magSize) return false;
  const reserve = ammoNumber(ws.ammo[weaponId]);
  if (reserve <= 0 && reserve !== Infinity) return false;
  ws.reload = { weapon: weaponId, timer: w.reloadTime || 1.2, duration: w.reloadTime || 1.2 };
  player.state.reload = true;
  syncWeaponState(player);
  game.events.push({ type: 'reloadStart', playerId: player.id, weapon: weaponId, weaponState: weaponPublicState(player) });
  return true;
}
function cancelServerReload(room, player, weaponId = null) {
  const game = room.game; if (!game || !player?.weaponState?.reload) return false;
  const w = player.weaponState.reload.weapon;
  if (weaponId && weaponId !== w) return false;
  player.weaponState.reload = null;
  player.state.reload = false;
  syncWeaponState(player);
  game.events.push({ type: 'reloadCancel', playerId: player.id, weapon: w, weaponState: weaponPublicState(player) });
  return true;
}
function consumeServerAmmo(room, player, weaponId) {
  const game = room.game; if (!game) return false;
  const w = WEAPONS[weaponId]; if (!w || !weaponUnlocked(weaponId, game.wave)) return false;
  const ws = player.weaponState || (player.weaponState = makeWeaponState(game.wave));
  const now = Date.now() / 1000;
  if ((ws.cooldowns?.[weaponId] || 0) > now) return false;
  if (ws.reload) return false;
  if (w.magSize) {
    if ((ws.mag[weaponId] || 0) <= 0) { startServerReload(room, player, weaponId); return false; }
    ws.mag[weaponId] = Math.max(0, (ws.mag[weaponId] || 0) - 1);
  } else if (Number.isFinite(w.ammoMax)) {
    const reserve = ammoNumber(ws.ammo[weaponId]);
    if (reserve <= 0) return false;
    ws.ammo[weaponId] = reserve - 1;
  }
  ws.cooldowns[weaponId] = now + (w.cooldown || .25);
  syncWeaponState(player);
  if (w.magSize && (ws.mag[weaponId] || 0) <= 0 && ammoNumber(ws.ammo[weaponId]) > 0) {
    // 클라이언트 자동 장전과 별도로, 서버도 아주 짧게 뒤에서 자동 장전을 시작한다.
    setTimeout(() => {
      if (rooms.get(room.roomCode) === room && player.state.alive && player.weaponState && !player.weaponState.reload) startServerReload(room, player, weaponId);
    }, 90);
  }
  return true;
}
function applyExplosionDamage(room, x, z, radius, damage, source = 'explosion', ownerId = null) {
  const game = room.game; if (!game) return;
  for (const e of game.enemies) {
    if (!e.alive) continue;
    const d = Math.sqrt(dist2(e.x, e.z, x, z));
    if (d > radius + (e.radius || .5)) continue;
    const amt = damage * clamp(1 - d / Math.max(.001, radius) * .55, .22, 1);
    e.hp -= amt;
    e.lastHitPart = 'body';
    game.events.push({ type: 'enemyHit', enemyId: e.id, part: 'body', damage: Math.round(amt), x: e.x, z: e.z, shooterId: ownerId, source });
    if (e.hp <= 0) {
      e.alive = false; e.deadAt = Date.now(); game.kills++; game.score += Math.round(e.score || 10);
      game.events.push({ type: 'enemyDeath', enemyId: e.id, enemyType: e.type, x: e.x, z: e.z, source });
    }
  }
  for (const wall of activeWalls(game)) {
    const d = Math.sqrt(dist2(wall.x, wall.z, x, z));
    if (d <= radius + Math.max(wall.w || 1, wall.d || 1) * .55) damageServerWall(game, wall, damage * .48 * clamp(1 - d / Math.max(.001, radius), .15, 1), source);
  }
  for (const p of room.players.values()) {
    if (!p.state.alive) continue;
    const d = Math.sqrt(dist2(p.state.x, p.state.z, x, z));
    if (d > radius) continue;
    const friendlyScale = p.id === ownerId ? .35 : .55;
    const amt = damage * friendlyScale * clamp(1 - d / Math.max(.001, radius) * .70, .18, 1);
    damageServerPlayer(game, p, amt, source, { x, z });
    game.events.push({ type: 'playerExplodeHit', playerId: p.id, amount: Math.round(amt), x, z, source });
  }
}
function spawnServerProjectile(room, player, action, weaponId) {
  const game = room.game; const w = WEAPONS[weaponId]; if (!game || !w) return;
  const sx = action.x ?? player.state.x, sy = 1.50, sz = action.z ?? player.state.z;
  const yaw = action.yaw ?? player.state.yaw, pitch = action.pitch ?? player.state.pitch;
  const baseDx = -Math.sin(yaw) * Math.cos(pitch), baseDy = Math.sin(pitch), baseDz = -Math.cos(yaw) * Math.cos(pitch);
  const len = Math.hypot(baseDx, baseDy, baseDz) || 1;
  const ndx = baseDx / len, ndy = baseDy / len, ndz = baseDz / len;
  const speed = weaponId === 'grenade' ? 17 : (w.speed || 26);
  const proj = { id: game.nextProjectileId++, kind: weaponId, ownerId: player.id, x: sx + ndx * .85, y: sy, z: sz + ndz * .85, vx: ndx * speed, vy: weaponId === 'grenade' ? 4.8 : ndy * speed, vz: ndz * speed, life: weaponId === 'grenade' ? 1.15 : 2.25, radius: w.radius, damage: (w.damage || 80) * (player.upgrades?.damage || 1), alive: true };
  game.projectiles.push(proj);
  game.events.push({ type: 'projectileCreate', projectile: { id: proj.id, kind: proj.kind, ownerId: proj.ownerId, x: proj.x, y: proj.y, z: proj.z, vx: proj.vx, vy: proj.vy, vz: proj.vz } });
}
function updateServerProjectiles(room, dt) {
  const game = room.game; if (!game) return;
  for (const p of game.projectiles) {
    if (!p.alive) continue;
    p.life -= dt;
    p.x += p.vx * dt; p.z += p.vz * dt;
    if (p.kind === 'grenade') {
      p.vy -= 9.8 * dt; p.y += p.vy * dt;
      if (p.y < .35) { p.y = .35; p.vy *= -.42; p.vx *= .82; p.vz *= .82; }
    } else p.y += p.vy * dt;
    let detonate = p.life <= 0;
    if (!detonate && rectCollidesGame(game, p.x, p.z, .25)) detonate = true;
    if (!detonate && p.kind === 'rocket') {
      const hit = game.enemies.find(e => e.alive && dist2(p.x, p.z, e.x, e.z) < Math.pow((e.radius || .5) + .38, 2));
      if (hit) detonate = true;
    }
    if (detonate) {
      p.alive = false;
      applyExplosionDamage(room, p.x, p.z, p.radius || 5.5, p.damage || 90, p.kind, p.ownerId);
      game.events.push({ type: 'projectileExplode', projectileId: p.id, kind: p.kind, ownerId: p.ownerId, x: p.x, y: p.y, z: p.z, radius: p.radius });
    }
  }
  game.projectiles = game.projectiles.filter(p => p.alive);
}
function applyFire(room, player, action) {
  const game = room.game;
  if (!game || game.phase === 'reward' || !player.state.alive) return;
  const w = WEAPONS[action.weapon] || WEAPONS.pistol;
  const weaponId = Object.entries(WEAPONS).find(([, def]) => def === w)?.[0] || action.weapon || 'pistol';
  if (w.type === 'placeWall' || w.type === 'placeMine') return;
  if (!consumeServerAmmo(room, player, weaponId)) return;
  if (w.type === 'grenade' || w.type === 'rocket') {
    spawnServerProjectile(room, player, action, weaponId);
    game.events.push({ type: 'serverFire', playerId: player.id, weapon: weaponId, weaponState: weaponPublicState(player) });
    return;
  }
  const sx = action.x ?? player.state.x, sy = 1.68, sz = action.z ?? player.state.z;
  const yaw = action.yaw ?? player.state.yaw, pitch = action.pitch ?? player.state.pitch;
  const baseDx = -Math.sin(yaw) * Math.cos(pitch), baseDy = Math.sin(pitch), baseDz = -Math.cos(yaw) * Math.cos(pitch);
  const pellets = w.pellets || 1;
  for (let i = 0; i < pellets; i++) {
    const spread = (w.spread || 0) * (action.ads ? .45 : 1.75);
    const dx = baseDx + (Math.random() - .5) * spread;
    const dy = baseDy + (Math.random() - .5) * spread;
    const dz = baseDz + (Math.random() - .5) * spread;
    const len = Math.hypot(dx, dy, dz) || 1;
    const ndx = dx / len, ndy = dy / len, ndz = dz / len;
    let pierce = w.pierce || 1;
    const ignored = new Set();
    while (pierce-- > 0) {
      let best = null, bestT = w.range || 40, part = 'body';
      for (const e of game.enemies) {
        if (!e.alive || ignored.has(e.id)) continue;
        const bodyT = raySphere(sx, sy, sz, ndx, ndy, ndz, e.x, .86, e.z, e.radius + .25, bestT);
        const headT = raySphere(sx, sy, sz, ndx, ndy, ndz, e.x, 1.58, e.z, .43, bestT);
        const t = headT !== null ? headT : bodyT;
        if (t !== null && t < bestT && !wallBlocksGame(game, sx, sz, ndx, ndz, t)) { best = e; bestT = t; part = headT !== null ? 'head' : 'body'; }
      }
      if (!best) break;
      let dmg = (w.damage || 10) * (player.upgrades?.damage || 1);
      if (part === 'head') { dmg *= best.type === 'devil' ? 1.85 : 2.25; game.headshots++; }
      if (best.type === 'shield' && part !== 'head' && w.type !== 'explosive' && w.type !== 'rail') dmg *= .28;
      if (best.type === 'tank' && part !== 'head' && w.type !== 'explosive') dmg *= .82;
      best.hp -= dmg;
      best.lastHitPart = part;
      game.events.push({ type: 'enemyHit', enemyId: best.id, part, damage: Math.round(dmg), x: best.x, z: best.z, shooterId: player.id, weapon: weaponId });
      if (best.hp <= 0) {
        best.alive = false; best.deadAt = Date.now(); game.kills++; game.score += Math.round(best.score || 10);
        game.events.push({ type: 'enemyDeath', enemyId: best.id, enemyType: best.type, x: best.x, z: best.z });
      }
      ignored.add(best.id);
      if (w.pierce <= 1) break;
    }
  }
  game.events.push({ type: 'serverFire', playerId: player.id, weapon: weaponId, weaponState: weaponPublicState(player) });
}


function clampRectToMap(game, x, z, margin = 2) {
  const half = game.map.size / 2 - margin;
  return { x: clamp(x, -half, half), z: clamp(z, -half, half) };
}
function canPlaceRect(game, x, z, w, d) {
  const half = game.map.size / 2 - 1;
  if (x - w/2 < -half || x + w/2 > half || z - d/2 < -half || z + d/2 > half) return false;
  for (const o of game.map.obstacles) {
    if (Math.abs(x - o[0]) < w/2 + o[2]/2 + .18 && Math.abs(z - o[1]) < d/2 + o[3]/2 + .18) return false;
  }
  for (const p of game.placeables || []) {
    if (p.alive === false) continue;
    const pw = p.w || 1.2, pd = p.d || 1.2;
    if (Math.abs(x - p.x) < w/2 + pw/2 + .18 && Math.abs(z - p.z) < d/2 + pd/2 + .18) return false;
  }
  return true;
}
function handlePlaceWall(room, player, action) {
  const game = room.game; if (!game) return;
  const pl = action.placement || {};
  const x = n(pl.x, player.state.x, -999, 999), z = n(pl.z, player.state.z, -999, 999);
  const w = clamp(n(pl.w, 4.2), 1.2, 5.5), d = clamp(n(pl.d, .72), .45, 5.5);
  if (dist2(player.state.x, player.state.z, x, z) > 6.2 * 6.2) return;
  if (!canPlaceRect(game, x, z, w, d)) return;
  if (!consumeServerAmmo(room, player, 'wall')) return;
  const maxHp = Math.round(120 * (player.upgrades?.wallHp || 1));
  const wall = { id: game.nextPlaceableId++, kind: 'wall', ownerId: player.id, x, z, w, d, hp: maxHp, maxHp, alive: true };
  game.placeables.push(wall);
  game.events.push({ type: 'wallCreate', wall });
}
function handlePlaceMine(room, player, action) {
  const game = room.game; if (!game) return;
  const pl = action.placement || action.position || {};
  const x = n(pl.x, player.state.x, -999, 999), z = n(pl.z, player.state.z, -999, 999);
  if (dist2(player.state.x, player.state.z, x, z) > 6.8 * 6.8) return;
  if (!canPlaceRect(game, x, z, 1.4, 1.4)) return;
  if (!consumeServerAmmo(room, player, 'barrel')) return;
  const mine = { id: game.nextPlaceableId++, kind: 'mine', ownerId: player.id, x, z, w: 1.28, d: 1.28, hp: 22, maxHp: 22, radius: 5.8, damage: 125 * (player.upgrades?.damage || 1), alive: true };
  game.placeables.push(mine);
  game.events.push({ type: 'mineCreate', mine });
}
function applyRewardToPlayer(player, rewardId) {
  const r = String(rewardId || '');
  if (!REWARD_DEFS[r]) return false;
  const up = player.upgrades || (player.upgrades = { damage: 1, wallHp: 1, ammoGain: 1, maxHp: 100, maxMedkits: 100 });
  if (r === 'maxHp') { up.maxHp = Math.min(220, (up.maxHp || 100) + 10); player.state.hp = Math.min(up.maxHp, (player.state.hp || 0) + 10); }
  if (r === 'stamina') { player.state.staminaBonus = (player.state.staminaBonus || 0) + 15; }
  if (r === 'damage') up.damage = (up.damage || 1) * 1.08;
  if (r === 'wallHp') up.wallHp = (up.wallHp || 1) * 1.25;
  if (r === 'ammo') up.ammoGain = (up.ammoGain || 1) * 1.25;
  if (r === 'kit') { up.maxMedkits = Math.min(160, (up.maxMedkits || 100) + 10); }
  player.state.maxHp = up.maxHp;
  player.state.maxMedkits = up.maxMedkits;
  return true;
}
function startServerReward(room) {
  const game = room.game; if (!game) return;
  game.phase = 'reward';
  const pool = [...REWARD_IDS].sort(() => Math.random() - .5).slice(0, 3);
  game.reward = { wave: game.wave, choices: pool.map(id => ({ id, ...REWARD_DEFS[id] })), selected: {}, startedAt: Date.now() };
  game.events.push({ type: 'rewardStart', wave: game.wave, choices: game.reward.choices });
}
function finishServerReward(room) {
  const game = room.game; if (!game) return;
  game.phase = 'prep'; game.prepTimer = 10; game.reward = null;
  game.items.push(...makeItemDrops(game, 2));
  game.events.push({ type: 'prepStart', seconds: 10 });
}
function handleChooseReward(room, player, rewardId) {
  const game = room.game; if (!game || game.phase !== 'reward' || !game.reward) return;
  const choices = new Set(game.reward.choices.map(c => c.id));
  const id = choices.has(String(rewardId)) ? String(rewardId) : null;
  if (id && applyRewardToPlayer(player, id)) {
    game.reward.selected[player.id] = id;
    game.events.push({ type: 'rewardChosen', playerId: player.id, rewardId: id });
  }
  const players = [...room.players.values()].filter(p => p.connected !== false);
  if (players.every(p => game.reward.selected[p.id])) finishServerReward(room);
}
function makeItemDrops(game, count = 1) {
  const drops = [];
  for (let i = 0; i < count; i++) {
    for (let tries = 0; tries < 30; tries++) {
      const half = game.map.size / 2 - 5;
      const x = rand(-half, half), z = rand(-half, half);
      if (rectCollidesGame(game, x, z, 1.1)) continue;
      const kind = Math.random() < .36 ? 'health' : 'ammo';
      const ammoWeapons = Object.keys(WEAPONS).filter(id => id !== 'pistol' && Number.isFinite(WEAPONS[id].ammoMax) && weaponUnlocked(id, game.wave));
      const weapon = ammoWeapons.length ? ammoWeapons[Math.floor(Math.random() * ammoWeapons.length)] : 'smg';
      const amount = kind === 'health' ? 24 : Math.max(4, Math.ceil((WEAPONS[weapon]?.ammoMax || 40) * .18));
      const item = { id: game.nextItemId++, kind, weapon, amount, x, z, alive: true, life: 28 };
      drops.push(item); game.events.push({ type: 'itemSpawn', item }); break;
    }
  }
  return drops;
}
function updateServerItems(room, dt) {
  const game = room.game; if (!game || game.phase === 'reward') return;
  game.itemTimer = Math.max(0, (game.itemTimer || 0) - dt);
  if (game.itemTimer <= 0 && game.items.filter(i => i.alive).length < 8) {
    game.items.push(...makeItemDrops(game, 1));
    game.itemTimer = rand(6, 11);
  }
  for (const item of game.items) {
    if (!item.alive) continue;
    item.life -= dt;
    if (item.life <= 0) { item.alive = false; game.events.push({ type: 'itemExpire', itemId: item.id }); continue; }
    for (const p of room.players.values()) {
      if (!p.state.alive) continue;
      if (dist2(item.x, item.z, p.state.x, p.state.z) > 2.0 * 2.0) continue;
      if (item.kind === 'health') {
        const maxHp = p.upgrades?.maxHp || 100;
        if ((p.state.hp || 0) >= maxHp - .5) {
          const maxKit = p.upgrades?.maxMedkits || 100;
          const before = p.state.medkits || 0;
          p.state.medkits = Math.min(maxKit, before + item.amount);
        } else p.state.hp = Math.min(maxHp, (p.state.hp || 0) + item.amount);
      } else {
        const ws = p.weaponState || (p.weaponState = makeWeaponState(game.wave));
        const wid = WEAPONS[item.weapon] ? item.weapon : 'smg';
        const w = WEAPONS[wid];
        if (Number.isFinite(w.ammoMax)) {
          const gain = Math.ceil(item.amount * (p.upgrades?.ammoGain || 1));
          ws.ammo[wid] = Math.min(w.ammoMax, ammoNumber(ws.ammo[wid]) + gain);
          syncWeaponState(p);
        }
      }
      item.alive = false; game.events.push({ type: 'itemPickup', itemId: item.id, playerId: p.id, itemKind: item.kind, amount: item.amount, weapon: item.weapon, weaponState: weaponPublicState(p) });
      break;
    }
  }
  game.items = game.items.filter(i => i.alive);
}
function updateMinesAndWalls(room) {
  const game = room.game; if (!game) return;
  for (const mine of activeMines(game)) {
    const enemy = game.enemies.find(e => e.alive && dist2(e.x, e.z, mine.x, mine.z) < 2.0 * 2.0);
    if (!enemy) continue;
    mine.alive = false;
    for (const e of game.enemies) {
      if (!e.alive) continue;
      const d = Math.sqrt(dist2(e.x, e.z, mine.x, mine.z));
      if (d <= mine.radius) {
        e.hp -= mine.damage * (1 - d / mine.radius * .55);
        if (e.hp <= 0) { e.alive = false; game.kills++; game.score += Math.round(e.score || 10); game.events.push({ type: 'enemyDeath', enemyId: e.id, enemyType: e.type, x: e.x, z: e.z }); }
      }
    }
    game.events.push({ type: 'mineExplode', mineId: mine.id, x: mine.x, z: mine.z, radius: mine.radius });
  }
  game.placeables = game.placeables.filter(p => p.alive !== false);
}
function rand(min, max) { return min + Math.random() * (max - min); }

function updateGame(room, dt) {
  const game = room.game;
  if (!game) return;
  const players = [...room.players.values()];
  if (game.phase === 'gameover') return;
  updatePlayerReloads(room, dt);
  updateServerPlayers(room, dt);
  updateServerProjectiles(room, dt);
  if (game.phase === 'reward') {
    updateServerItems(room, dt);
    if (game.reward && Date.now() - game.reward.startedAt > 15000) finishServerReward(room);
  } else if (game.phase === 'prep') {
    game.prepTimer = Math.max(0, (game.prepTimer || 0) - dt);
    updateServerItems(room, dt);
    if (game.prepTimer <= 0) {
      game.phase = 'combat'; game.wave++; game.spawnQueue = waveSpawnCount(game.wave, game.diffId); game.spawnTimer = .8; game.waveBreak = 0;
      game.events.push({ type: 'waveStart', wave: game.wave });
    }
  } else {
    if (game.spawnQueue > 0) {
      game.spawnTimer -= dt;
      if (game.spawnTimer <= 0 && game.enemies.filter(e => e.alive).length < 72) {
        if (spawnEnemy(game, room)) game.spawnQueue--;
        game.spawnTimer = clamp(.72 - game.wave * .018, .18, .70);
      }
    }
    updateEnemies(room, dt);
    updateMinesAndWalls(room);
    updateServerItems(room, dt);
    if (game.spawnQueue <= 0 && game.enemies.every(e => !e.alive)) {
      game.waveBreak += dt;
      if (game.waveBreak > 1.35) { game.waveBreak = 0; startServerReward(room); }
    } else game.waveBreak = 0;
  }
  for (const p of players) {
    p.state.maxHp = p.upgrades?.maxHp || p.state.maxHp || 100;
    p.state.maxMedkits = p.upgrades?.maxMedkits || p.state.maxMedkits || 100;
    if (p.state.hp <= 0 && !p.state.downed) downServerPlayer(game, p, 'bleedout');
    if (p.state.downed) { p.state.alive = false; p.state.fire = false; p.state.reload = false; p.state.sprint = false; p.state.move = 0; }
  }
  if (bothPlayersDown(room) && game.phase !== 'gameover') {
    game.phase = 'gameover';
    game.events.push({ type: 'teamWipe', wave: game.wave, score: game.score, kills: game.kills, headshots: game.headshots });
  }
  game.enemies = game.enemies.filter(e => e.alive || Date.now() - (e.deadAt || Date.now()) < 250);
}
function snapshotRoom(room) {
  const game = room.game;
  const events = game ? game.events.splice(0, 30) : [];
  return {
    roomCode: room.roomCode, phase: room.phase, serverTime: Date.now(),
    players: [...room.players.values()].map(p => ({ id: p.id, role: p.role, connected: !!p.connected, state: p.state })),
    game: game ? { wave: game.wave, spawnQueue: game.spawnQueue, phase: game.phase, prepTimer: game.prepTimer || 0, score: game.score, kills: game.kills, headshots: game.headshots, mapId: game.mapId, diffId: game.diffId, reward: game.reward } : null,
    enemies: game ? game.enemies.map(e => ({ id: e.id, type: e.type, x: e.x, z: e.z, yaw: e.yaw, hp: Math.max(0, e.hp), maxHp: e.maxHp, alive: !!e.alive, targetPlayerId: e.targetPlayerId, lastHitPart: e.lastHitPart })) : [],
    placeables: game ? game.placeables.filter(p => p.alive !== false).map(p => ({ id: p.id, kind: p.kind, ownerId: p.ownerId, x: p.x, z: p.z, w: p.w, d: p.d, hp: p.hp, maxHp: p.maxHp, radius: p.radius, alive: p.alive !== false })) : [],
    items: game ? game.items.filter(i => i.alive !== false).map(i => ({ id: i.id, kind: i.kind, weapon: i.weapon, amount: i.amount, x: i.x, z: i.z, life: i.life, alive: i.alive !== false })) : [],
    projectiles: game ? game.projectiles.filter(p => p.alive !== false).map(p => ({ id: p.id, kind: p.kind, ownerId: p.ownerId, x: p.x, y: p.y, z: p.z, vx: p.vx, vy: p.vy, vz: p.vz, radius: p.radius, life: p.life, alive: p.alive !== false })) : [],
    events
  };
}

io.on('connection', (socket) => {
  socket.data.roomCode = null;
  socket.data.playerToken = makeToken(socket.handshake?.auth?.playerToken);
  socket.on(CLIENT_TO_SERVER.CREATE_ROOM, ({ settings, playerToken } = {}) => {
    leaveCurrentRoom(socket);
    socket.data.playerToken = makeToken(playerToken || socket.data.playerToken);
    const roomCode = randomRoomCode();
    const player = makePlayer(socket, 'host', socket.data.playerToken);
    const room = { roomCode, hostId: socket.id, phase: 'lobby', settings: sanitizeSettings(settings), players: new Map([[socket.id, player]]), createdAt: Date.now(), emptyAt: 0, lastInputs: new Map(), game: null };
    rooms.set(roomCode, room); socket.join(roomCode); socket.data.roomCode = roomCode;
    socket.emit(SERVER_TO_CLIENT.ROOM_CREATED, { room: publicRoom(room) }); emitLobby(room);
  });
  socket.on(CLIENT_TO_SERVER.JOIN_ROOM, ({ roomCode, playerToken, reconnect } = {}) => {
    const room = getRoomOrError(socket, roomCode); if (!room) return;
    socket.data.playerToken = makeToken(playerToken || socket.data.playerToken);
    const existingByToken = findPlayerByToken(room, socket.data.playerToken);
    if (existingByToken) {
      leaveCurrentRoom(socket);
      const player = bindSocketToPlayer(room, existingByToken, socket);
      socket.emit(SERVER_TO_CLIENT.ROOM_JOINED, { room: publicRoom(room), reconnected: true, phase: room.phase });
      emitLobby(room);
      return;
    }
    if (room.players.size >= MAX_PLAYERS_PER_ROOM && !room.players.has(socket.id)) return socket.emit(SERVER_TO_CLIENT.LOBBY_ERROR, { message: '방이 가득 찼다.' });
    if (room.phase !== 'lobby') return socket.emit(SERVER_TO_CLIENT.LOBBY_ERROR, { message: '이미 게임이 시작된 방이다.' });
    leaveCurrentRoom(socket);
    const player = makePlayer(socket, room.hostId === socket.id ? 'host' : 'guest', socket.data.playerToken);
    room.players.set(socket.id, player);
    socket.join(room.roomCode); socket.data.roomCode = room.roomCode; socket.emit(SERVER_TO_CLIENT.ROOM_JOINED, { room: publicRoom(room), reconnected: !!reconnect }); emitLobby(room);
  });
  socket.on(CLIENT_TO_SERVER.SET_READY, ({ roomCode, ready } = {}) => {
    const room = getRoomOrError(socket, roomCode); if (!room) return;
    const player = room.players.get(socket.id); if (!player) return socket.emit(SERVER_TO_CLIENT.LOBBY_ERROR, { message: '먼저 방에 입장해야 한다.' });
    player.ready = !!ready; emitLobby(room);
  });
  socket.on(CLIENT_TO_SERVER.START_GAME, ({ roomCode, settings } = {}) => {
    const room = getRoomOrError(socket, roomCode); if (!room) return;
    if (room.hostId !== socket.id) return socket.emit(SERVER_TO_CLIENT.LOBBY_ERROR, { message: '호스트만 시작할 수 있다.' });
    if (room.players.size < MAX_PLAYERS_PER_ROOM) return socket.emit(SERVER_TO_CLIENT.LOBBY_ERROR, { message: '2명이 모두 입장해야 시작할 수 있다.' });
    const players = [...room.players.values()]; if (!players.every(p => p.ready)) return socket.emit(SERVER_TO_CLIENT.LOBBY_ERROR, { message: '두 플레이어 모두 준비해야 한다.' });
    room.phase = 'playing'; room.settings = sanitizeSettings(settings || room.settings); room.game = makeGame(room.settings);
    const spawn = (MAPS[room.settings.map] || MAPS.box).player;
    players.forEach((p, i) => {
      p.weaponState = makeWeaponState(Number(room.settings.startWave || 1) || 1);
      p.motion = { vx: 0, vz: 0, vy: 0, grounded: true, stamina: p.upgrades?.maxStamina || 100, staminaLocked: false };
      p.input = { keys: {}, flags: {}, look: { yaw: i ? -0.1 : 0.1, pitch: 0 }, weapon: 'pistol', seq: 0, updatedAt: Date.now() };
      p.state = { ...p.state, x: spawn[0] + (i ? 1.4 : -1.4), y: 0, z: spawn[1], yaw: i ? -0.1 : 0.1, pitch: 0, hp: 100, maxHp: p.upgrades?.maxHp || 100, stamina: p.motion.stamina, maxStamina: p.upgrades?.maxStamina || 100, maxMedkits: p.upgrades?.maxMedkits || 100, alive: true, downed: false, downedAt: 0, reviveProgress: 0, weapon: 'pistol', weaponState: weaponPublicState(p), updatedAt: Date.now() };
    });
    io.to(room.roomCode).emit(SERVER_TO_CLIENT.GAME_START, { room: publicRoom(room), settings: room.settings, serverTime: Date.now() });
  });
  socket.on(CLIENT_TO_SERVER.PLAYER_INPUT, (payload = {}) => {
    const room = getRoomOrError(socket, payload.roomCode || socket.data.roomCode); if (!room) return;
    const player = room.players.get(socket.id); if (!player) return;
    const seq = Number(payload.seq || 0) || player.lastInputSeq || 0; player.lastInputSeq = seq;
    const look = payload.look || {}, keys = payload.keys || {}, flags = payload.flags || {};
    const lockedDown = !!player.state.downed || player.state.hp <= 0;
    player.input = {
      keys: lockedDown ? {} : { ...keys },
      flags: lockedDown ? { ...flags, fire: false, reload: false, move: 0 } : { ...flags },
      look: { yaw: n(look.yaw, player.state.yaw, -100000, 100000), pitch: n(look.pitch, player.state.pitch, -Math.PI / 2, Math.PI / 2) },
      weapon: String(payload.weapon || player.state.weapon || 'pistol').slice(0, 24),
      seq,
      updatedAt: Date.now()
    };
    player.state = { ...player.state,
      id: socket.id,
      yaw: player.input.look.yaw, pitch: player.input.look.pitch,
      weapon: player.input.weapon, alive: !lockedDown && player.state.hp > 0, downed: !!player.state.downed,
      ads: !!flags.ads, fire: lockedDown ? false : !!flags.fire, reload: lockedDown ? false : !!flags.reload,
      sprint: lockedDown ? false : (!!keys.ShiftLeft || !!keys.ShiftRight), move: lockedDown ? 0 : n(flags.move, 0, 0, 1), seq, updatedAt: Date.now()
    };
    room.lastInputs.set(socket.id, { ...payload, playerId: socket.id, serverTime: Date.now(), serverAuthoritativePosition: { x: player.state.x, y: player.state.y, z: player.state.z } });
    socket.to(room.roomCode).emit(SERVER_TO_CLIENT.REMOTE_INPUT, { playerId: socket.id, state: player.state, input: payload, serverTime: Date.now() });
  });
  socket.on(CLIENT_TO_SERVER.PLAYER_ACTION, (payload = {}) => {
    const room = getRoomOrError(socket, payload.roomCode || socket.data.roomCode); if (!room || room.phase !== 'playing') return;
    const player = room.players.get(socket.id); if (!player) return;
    const actionType = String(payload.actionType || '').slice(0, 24);
    const allowed = new Set(['fire','reloadStart','reloadEnd','reloadCancel','placeWall','placeMine','useMedkit','assistAlly','chooseReward']); if (!allowed.has(actionType)) return;
    const weapon = String(payload.weapon || player.state.weapon || 'pistol').slice(0, 24);
    const look = payload.look || {};
    const action = { actionType, weapon, seq: Number(payload.seq || 0) || 0, time: Number(payload.time || 0) || 0, serverTime: Date.now(), yaw: n(look.yaw, player.state.yaw, -100000, 100000), pitch: n(look.pitch, player.state.pitch, -Math.PI/2, Math.PI/2), x: player.state.x, y: player.state.y, z: player.state.z, ads: !!payload.ads, mag: n(payload.mag, 0, 0, 999), reserve: payload.reserve === 'Infinity' ? 'Infinity' : n(payload.reserve, 0, 0, 9999) };
    const actionLockedDown = !!player.state.downed || player.state.hp <= 0;
    player.state = { ...player.state, weapon, yaw: action.yaw, pitch: action.pitch, ads: action.ads, fire: actionLockedDown ? false : actionType === 'fire', reload: actionLockedDown ? false : actionType === 'reloadStart', actionSeq: action.seq, updatedAt: Date.now() };
    if (player.state.downed && !['assistAlly','chooseReward'].includes(actionType)) return;
    if (actionType === 'fire') applyFire(room, player, action);
    if (actionType === 'reloadStart') startServerReload(room, player, weapon);
    if (actionType === 'reloadCancel') cancelServerReload(room, player, weapon);
    if (actionType === 'reloadEnd') syncWeaponState(player); // 클라이언트 완료 신호는 신뢰하지 않고 서버 타이머만 기준으로 둔다.
    if (actionType === 'placeWall') handlePlaceWall(room, player, { ...action, placement: payload.placement || {} });
    if (actionType === 'placeMine') handlePlaceMine(room, player, { ...action, placement: payload.placement || {} });
    if (actionType === 'useMedkit') {
      if (!player.state.downed) healServerPlayer(room.game, player, player, 25, 'selfMedkit');
    }
    if (actionType === 'assistAlly') handleAssistAlly(room, player, payload);
    if (actionType === 'chooseReward') handleChooseReward(room, player, payload.rewardId || payload.id);
    socket.to(room.roomCode).emit(SERVER_TO_CLIENT.REMOTE_ACTION, { playerId: socket.id, action, state: player.state });
  });
  socket.on('latencyPing', (payload, ack) => { if (typeof ack === 'function') ack({ ok: true, serverTime: Date.now(), clientTime: payload?.t || null }); });
  socket.on('disconnect', () => leaveCurrentRoom(socket, { soft: true }));
});

setInterval(() => {
  const t = Date.now();
  for (const [code, room] of rooms) {
    const allDisconnected = [...room.players.values()].every(p => !p.connected && t - (p.disconnectedAt || 0) > ROOM_TTL_MS);
    if ((room.players.size === 0 || allDisconnected) && room.emptyAt && t - room.emptyAt > ROOM_TTL_MS) rooms.delete(code);
  }
}, 60_000);
setInterval(() => { for (const room of rooms.values()) if (room.phase === 'playing') updateGame(room, 1 / 30); }, 1000 / 30);
setInterval(() => { for (const room of rooms.values()) if (room.phase === 'playing') io.to(room.roomCode).emit(SERVER_TO_CLIENT.STATE_SNAPSHOT, snapshotRoom(room)); }, 1000 / 20);

httpServer.listen(PORT, () => console.log(`Boxhead LowPoly FPS v36 deploy-ready server running at http://localhost:${PORT}`));
