import {randomBytes,randomUUID} from 'node:crypto';
import {MAPS,DIFFICULTY,WEAPONS,enemyStats,pickEnemyType} from '../shared/arena.js';
import {getMission,createMissionState,tickMission,waveSpawnCount} from '../shared/missions.js';
import {Navigation} from '../shared/navigation.js';
import {newUpgrades,rewardChoices,applyReward} from '../shared/rewards.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { MAX_PLAYERS_PER_ROOM, ROOM_CODE_LENGTH, ROOM_TTL_MS } from '../shared/constants.js';
import { CLIENT_TO_SERVER, SERVER_TO_CLIENT, sanitizeRoomCode, sanitizeSettings } from '../shared/protocol.js';


export function createGameServer({port=Number(process.env.PORT || 3000),host='0.0.0.0',autoTick=true}={}) {
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CLIENT_DIR = path.join(ROOT_DIR, 'client');

const CORS_ORIGIN = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean) : true;
const SERVER_VERSION = '1.0.0';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CORS_ORIGIN, credentials: true },
  maxHttpBufferSize: 16384,
  pingInterval: 8000,
  pingTimeout: 12000
});

const rooms = new Map();

app.use(express.static(CLIENT_DIR, { extensions: ['html'], setHeaders(res, file) { if(/\.(js|css|html|json)$/.test(file))res.setHeader('Cache-Control','no-cache'); } }));
app.get('/health', (_req, res) => res.json({ ok: true, version: SERVER_VERSION, rooms: rooms.size, uptime: process.uptime() }));
app.get('/api/status', (_req, res) => res.json({ ok: true, version: SERVER_VERSION, rooms: rooms.size, players: [...rooms.values()].reduce((n, r) => n + r.players.size, 0), uptime: process.uptime() }));
app.use((_req, res) => res.sendFile(path.join(CLIENT_DIR, 'index.html')));








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
  walk: 4.45,
  sprint: 7.65,
  adsSlow: 0.46,
  accelWalk: 13,
  accelSprint: 17,
  friction: 18,
  staminaDrain: 40,
  staminaRegen: 10,
  gravity: 17.5,
  jumpVelocity: 6.4
};
function keyDown(keys, ...codes) {
  return codes.some(c => !!keys?.[c]);
}
function moveServerPlayer(game,p,dx,dz) {
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dz))/.18));
  for(let i=0;i<steps;i++){if(!rectCollidesGame(game,p.state.x+dx/steps,p.state.z,SERVER_PLAYER.radius))p.state.x+=dx/steps;else p.motion.vx=0;if(!rectCollidesGame(game,p.state.x,p.state.z+dz/steps,SERVER_PLAYER.radius))p.state.z+=dz/steps;else p.motion.vz=0;}
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
    const inp=player.input;
    if(!player.connected || Date.now()-inp.updatedAt>250){inp.keys={};inp.flags={};player.motion.vx=player.motion.vz=0;}
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
    m.staminaLocked = m.stamina <= 0;
    const sprinting = wantsSprint && rawMove > .01 && !ads && m.stamina > 0;
    if (!wantsSprint && m.grounded) m.stamina = Math.min(ps.maxStamina, m.stamina + (SERVER_PLAYER.staminaRegen*Math.pow(1.2,player.upgrades?.rewardStacks?.regen || 0)) * (rawMove > .01 ? 1 : 1.12) * dt);
    const speed = (sprinting ? SERVER_PLAYER.sprint : SERVER_PLAYER.walk) * Math.pow(1.04,player.upgrades.rewardStacks.speed || 0) * (ads ? SERVER_PLAYER.adsSlow : 1);
    const yaw = ps.yaw || 0;
    const sin = Math.sin(yaw), cos = Math.cos(yaw);
    const desiredVx = (mx * cos + mz * sin) * speed;
    const desiredVz = (-mx * sin + mz * cos) * speed;
    const accel = rawMove > .01 ? (1 - Math.exp(-dt * (sprinting ? SERVER_PLAYER.accelSprint : SERVER_PLAYER.accelWalk))) : (1 - Math.exp(-dt * SERVER_PLAYER.friction));
    m.vx += (desiredVx - m.vx) * accel;
    m.vz += (desiredVz - m.vz) * accel;
    if (Math.abs(m.vx) < .01) m.vx = 0;
    if (Math.abs(m.vz) < .01) m.vz = 0;
    const beforeX=ps.x,beforeZ=ps.z;
    moveServerPlayer(game, player, m.vx * dt, m.vz * dt);
    if(sprinting && m.grounded && Math.hypot(ps.x-beforeX,ps.z-beforeZ)>Math.max(.002,dt*.18))m.stamina=Math.max(0,m.stamina-SERVER_PLAYER.staminaDrain*dt);
    if (keyDown(keys, 'Space') && !m.jumpHeld && m.grounded) { m.vy = SERVER_PLAYER.jumpVelocity; m.grounded = false; }
    if (!m.grounded) {
      m.vy -= SERVER_PLAYER.gravity * dt;
      ps.y += m.vy * dt;
      if (ps.y <= 0) { ps.y = 0; m.vy = 0; m.grounded = true; }
    }
    ps.x = clamp(ps.x, -mapSize / 2 + 1.1, mapSize / 2 - 1.1);
    ps.z = clamp(ps.z, -mapSize / 2 + 1.1, mapSize / 2 - 1.1);
    ps.stamina = Math.round(m.stamina);
    ps.maxStamina = Math.round(ps.maxStamina);
    m.jumpHeld=keyDown(keys,'Space');
    ps.grounded = !!m.grounded;
    ps.sprint = sprinting;
    ps.move = clamp(Math.hypot(m.vx, m.vz) / SERVER_PLAYER.sprint, 0, 1);
    ps.alive = ps.hp > 0 && !ps.downed;
    ps.updatedAt = Date.now();
  }
  separateServerPlayers(room);
}

function randomRoomCode() {const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code;do{code=[...randomBytes(6)].map(b=>chars[b%chars.length]).join('');}while(rooms.has(code));return code;}

function makeToken(seed = '') { return String(seed || '').slice(0, 96) || ('pt_' + Math.random().toString(36).slice(2) + Date.now().toString(36)); }

function makePlayer(socket,role,token='') {
  return {id:socket.id,token:makeToken(token),role,ready:false,connected:true,disconnectedAt:0,lastInputSeq:0,lastActionSeq:0,
    upgrades:newUpgrades(),weaponState:makeWeaponState(1),assist:{target:null,time:0},
    input:{keys:{},flags:{},look:{yaw:0,pitch:0},weapon:'pistol',updatedAt:Date.now()},
    motion:{vx:0,vz:0,vy:0,grounded:true,stamina:100},
    state:{id:socket.id,x:0,y:0,z:0,yaw:0,pitch:0,hp:100,maxHp:100,medkits:25,maxMedkits:100,maxStamina:100,stamina:100,alive:true,downed:false,weapon:'pistol'}
  };
}

function publicRoom(room) {
  return { roomCode: room.roomCode, hostId: room.hostId, phase: room.phase, settings: room.settings,
    players: [...room.players.values()].map(p => ({ id: p.id, role: p.role, ready: !!p.ready, connected: !!p.connected, lastInputSeq: p.lastInputSeq || 0, state: p.state })) };
}
function emitLobby(room) { io.to(room.roomCode).emit(SERVER_TO_CLIENT.LOBBY_UPDATE, { room: publicRoom(room) }); }
function getRoomOrError(socket,code) {const room=rooms.get(sanitizeRoomCode(code));if(!room)socket.emit('lobbyError',{code:'NOT_FOUND',message:'방이 없거나 만료되었습니다. 새 방을 만들어주세요.'});return room;}

function findPlayerByToken(room, token = '') {
  const safe = makeToken(token);
  return [...room.players.values()].find(p => p.token === safe) || null;
}
function bindSocketToPlayer(room,player,socket) {
  const old=player.id;room.players.delete(old);player.id=socket.id;player.state.id=socket.id;player.connected=true;player.disconnectedAt=0;player.lastInputSeq=0;player.lastActionSeq=0;player.input.keys={};player.input.flags={};player.input.updatedAt=Date.now();
  if(room.hostId===old)room.hostId=socket.id;
  if(room.game?.reward?.selected && Object.hasOwn(room.game.reward.selected,old)){room.game.reward.selected[socket.id]=room.game.reward.selected[old];delete room.game.reward.selected[old];}
  if(room.game?.reward?.choicesByPlayer?.[old]){room.game.reward.choicesByPlayer[socket.id]=room.game.reward.choicesByPlayer[old];delete room.game.reward.choicesByPlayer[old];}
  for(const votes of [room.game?.prepVotes,room.game?.reward?.extractVotes])if(votes && Object.hasOwn(votes,old)){votes[socket.id]=votes[old];delete votes[old];}
  for(const p of room.players.values())if(p.assist?.target===old)p.assist.target=socket.id;
  for(const p of room.game?.projectiles || [])if(p.ownerId===old)p.ownerId=socket.id;
  room.players.set(socket.id,player);socket.join(room.roomCode);socket.data.roomCode=room.roomCode;socket.data.playerToken=player.token;
  room.emptyAt=0;return player;
}
function leaveCurrentRoom(socket,{soft=false}={}) {
  const code=socket.data.roomCode,room=rooms.get(code);if(!room)return;
  const p=room.players.get(socket.id);if(p){p.connected=false;p.ready=false;p.disconnectedAt=Date.now();p.input.keys={};p.input.flags={};p.motion.vx=p.motion.vz=0;}
  socket.leave(code);socket.data.roomCode=null;
  if(!soft){room.players.delete(socket.id);if(room.game && room.game.phase!=='gameover')endRoomRun(room,'teammate-left');if(room.hostId===socket.id){const next=[...room.players.values()][0];if(next){room.hostId=next.id;next.role='host';}}}
  if(!room.players.size || [...room.players.values()].every(p=>!p.connected))room.emptyAt=Date.now();emitLobby(room);
}




function makeGame(settings) {
  const config=sanitizeSettings(settings),map=MAPS[config.map],wave=Number(config.startWave),nav=new Navigation(map);
  const game={id:randomUUID(),wave,mapId:config.map,diffId:config.diff,map,nav,enemies:[],nextEnemyId:1,placeables:[],nextPlaceableId:1,items:[],nextItemId:1,itemTimer:3,
    projectiles:[],nextProjectileId:1,cores:[],phase:'combat',prepTimer:0,reward:null,score:0,kills:0,headshots:0,events:[],elapsed:0,suspended:false,missionsCleared:0,bonusesCleared:0,prepVotes:{}};
  setupServerMission(game);return game;
}

function rectCollides(map, x, z, r) {
  const half = map.size / 2 - 1 - r;
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
    if (t !== null && !wallBlocks(game.map,sx,sz,dx,dz,t) && (!best || t < best.distance)) best = { wall: w, distance: t };
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
function findSpawn(game,players) {
  const active=players.filter(p=>p.connected && p.state.alive);if(!active.length)return null;
  const primary=active[game.nextEnemyId%active.length].state;
  for(let attempt=0;attempt<45;attempt++){
    const point=game.nav.safePoint({from:primary,minDistance:13,maxDistance:Math.min(34,game.map.size/2),clearance:.95});
    if(rectCollidesGame(game,point.x,point.z,.85) || active.some(p=>dist2(point.x,point.z,p.state.x,p.state.z)<100) || game.enemies.some(e=>e.alive && dist2(point.x,point.z,e.x,e.z)<2.5))continue;
    return point;
  }
  return null;
}
function spawnEnemy(game,room) {
  const sp=findSpawn(game,[...room.players.values()]);if(!sp)return false;
  const elite=!!game.elitePending,type=elite?game.mission.elite:pickEnemyType(game.wave,game.mission),stats=enemyStats(type,game.wave,DIFFICULTY[game.diffId]);
  game.elitePending=false;const e={id:game.nextEnemyId++,type,x:sp.x,z:sp.z,vx:0,vz:0,yaw:0,hp:stats.hp*(elite?2.35:1),maxHp:stats.hp*(elite?2.35:1),speed:stats.speed*(elite?1.08:1),radius:stats.radius*(elite?1.1:1),damage:stats.damage*(elite?1.32:1),score:stats.score*(elite?3:1),elite,attackCd:.6,alive:true,targetPlayerId:null,lastHitPart:'body'};
  game.enemies.push(e);game.events.push({type:'enemySpawn',enemyId:e.id,enemyType:type,x:e.x,z:e.z,elite});return true;
}
function steerAroundWalls(game,e,tx,tz,dt) {
  e.think=(e.think || 0)-dt;if(e.think<=0 || !e.steer){e.steer=game.nav.direction(e.x,e.z,tx,tz);e.think=.12+(e.id%5)*.01;}
  return e.steer;
}
function moveEnemy(game,e,dx,dz) {
  let moved=false;const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dz))/.18));
  for(let i=0;i<steps;i++){if(!rectCollidesGame(game,e.x+dx/steps,e.z,e.radius)){e.x+=dx/steps;moved=true;}if(!rectCollidesGame(game,e.x,e.z+dz/steps,e.radius)){e.z+=dz/steps;moved=true;}}return moved;
}
function updateEnemies(room, dt) {
  const game = room.game;
  if (!game) return;
  const players = [...room.players.values()].filter(p => p.connected && p.state.alive && p.state.hp > 0);
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
      if(e.attackCd<=0 && !e.cast){e.cast={remaining:.55,dx:rayDx,dz:rayDz};e.attackCd=2.1;game.events.push({type:'devilCast',enemyId:e.id,targetPlayerId:target.id,x:e.x,z:e.z});}
    } else {
      const acc = 1 - Math.exp(-dt * 8);
      e.vx += (dir.x * e.speed - e.vx) * acc;
      e.vz += (dir.z * e.speed - e.vz) * acc;
      moveEnemy(game, e, e.vx * dt, e.vz * dt);
    }
    if(e.cast){e.cast.remaining-=dt;if(e.cast.remaining<=0){const c=e.cast;e.cast=null;game.projectiles.push({id:game.nextProjectileId++,kind:'fireball',enemyId:e.id,x:e.x+c.dx,y:1.1,z:e.z+c.dz,vx:c.dx*8.5,vy:0,vz:c.dz*8.5,life:3,radius:2.1,damage:e.damage,alive:true});}}
    const reach = e.radius + .48 + (e.type === 'runner' ? .82 : e.type === 'tank' ? .92 : .72);
    if (e.type === 'bomber' && d < 2.35 && e.attackCd <= 0) {
      e.alive = false;
      for (const p of players) {
        const pd = Math.sqrt(dist2(e.x, e.z, p.state.x, p.state.z));
        if (pd <= 4.3 && hasLineOfSightGame(game,e.x,e.z,p.state.x,p.state.z)) damageServerPlayer(game, p, 88 * diff.enemyDamage * (1 - pd / 4.3 * .55), 'bomber', { x: e.x, z: e.z });
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
      const current = Number(ws.mag[ws.reload.weapon] || 0);
      const need = Math.max(0, w.magSize - current);
      if (need > 0) {
        const reserve = ammoNumber(ws.ammo[ws.reload.weapon]);
        if (reserve === Infinity) ws.mag[ws.reload.weapon] = w.magSize;
        else {
          const take = Math.min(need, reserve);
          ws.mag[ws.reload.weapon] = current + take;
          ws.ammo[ws.reload.weapon] = Math.max(0, reserve - take);
        }
      }
      game?.events.push({ type: 'reloadEnd', playerId: player.id, weapon: ws.reload.weapon, weaponState: weaponPublicState(player) });
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
  ws.reload = { weapon: weaponId, timer: (w.reloadTime || 1.2)*player.upgrades.reload, duration: (w.reloadTime || 1.2)*player.upgrades.reload };
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
function applyExplosionDamage(room,x,z,radius,damage,source='explosion',ownerId=null) {
  const game=room.game;for(const e of game.enemies){if(!e.alive)continue;const d=Math.hypot(e.x-x,e.z-z);if(d>radius+e.radius || !hasLineOfSightGame(game,x,z,e.x,e.z))continue;
    const amount=damage*clamp(1-d/radius*.55,.22,1);e.hp-=amount;game.events.push({type:'enemyHit',enemyId:e.id,damage:amount,part:'body',shooterId:ownerId});if(e.hp<=0)killServerEnemy(room,e,source,ownerId);
  }
  for(const c of game.cores){const d=Math.hypot(c.x-x,c.z-z);if(c.alive && d<=radius+1 && hasLineOfSightGame(game,x,z,c.x,c.z))damageCore(game,c,damage*clamp(1-d/radius,.25,1));}
  for(const wall of activeWalls(game)){const d=Math.hypot(wall.x-x,wall.z-z);if(d<=radius)damageServerWall(game,wall,damage*.48*clamp(1-d/radius,.15,1),source);}
  for(const p of room.players.values()){if(ownerId && p.id!==ownerId)continue;const d=Math.hypot(p.state.x-x,p.state.z-z);if(p.state.alive && d<=radius && hasLineOfSightGame(game,x,z,p.state.x,p.state.z))damageServerPlayer(game,p,damage*(ownerId?.18:.55)*clamp(1-d/radius*.7,.18,1),source,{x,z});}
}
function spawnServerProjectile(room, player, action, weaponId) {
  const game = room.game; const w = WEAPONS[weaponId]; if (!game || !w) return;
  const sx = action.x ?? player.state.x, sy = 1.50+(player.state.y || 0), sz = action.z ?? player.state.z;
  const yaw = action.yaw ?? player.state.yaw, pitch = action.pitch ?? player.state.pitch;
  const baseDx = -Math.sin(yaw) * Math.cos(pitch), baseDy = Math.sin(pitch), baseDz = -Math.cos(yaw) * Math.cos(pitch);
  const len = Math.hypot(baseDx, baseDy, baseDz) || 1;
  const ndx = baseDx / len, ndy = baseDy / len, ndz = baseDz / len;
  const speed = weaponId === 'grenade' ? 17 : (w.speed || 26);
  const proj = { id: game.nextProjectileId++, kind: weaponId, ownerId: player.id, x: sx + ndx * .85, y: sy, z: sz + ndz * .85, vx: ndx * speed, vy: weaponId === 'grenade' ? 4.8 : ndy * speed, vz: ndz * speed, life: weaponId === 'grenade' ? 1.15 : 2.25, radius: w.radius * (weaponId==='rocket' && player.upgrades.rocketPayload?1.18:1), damage: (w.damage || 80) * (player.upgrades?.damage || 1), alive: true };
  game.projectiles.push(proj);
  game.events.push({ type: 'projectileCreate', projectile: { id: proj.id, kind: proj.kind, ownerId: proj.ownerId, x: proj.x, y: proj.y, z: proj.z, vx: proj.vx, vy: proj.vy, vz: proj.vz } });
}
function updateServerProjectiles(room, dt) {
  const game = room.game; if (!game) return;
  for (const p of game.projectiles) {
    if (!p.alive) continue;
    p.life -= dt;
    let detonate = p.life <= 0;
    const steps=Math.max(1,Math.ceil(Math.max(Math.abs(p.vx*dt),Math.abs(p.vz*dt))/.18));
    for(let i=0;i<steps && !detonate;i++){
      const h=dt/steps,nx=p.x+p.vx*h,nz=p.z+p.vz*h;
      if(rectCollidesGame(game,nx,nz,.25)){detonate=true;break;}
      p.x=nx;p.z=nz;
      if(p.kind==='grenade')p.vy-=9.8*h;
      p.y+=p.vy*h;
      if(p.y<.35){p.y=.35;if(p.kind==='grenade'){p.vy*= -.42;p.vx*=.82;p.vz*=.82;}else detonate=true;}
      if(p.kind==='fireball' && [...room.players.values()].some(ply=>ply.state.alive && Math.hypot(ply.state.x-p.x,ply.state.z-p.z)<.8 && Math.abs((ply.state.y||0)+.9-p.y)<1))detonate=true;
      if(p.kind==='rocket' && game.enemies.some(e=>e.alive && dist2(p.x,p.z,e.x,e.z)<Math.pow((e.radius || .5)+.38,2)))detonate=true;
    }
    if (detonate) {
      p.alive = false;
      if(p.kind==='fireball'){for(const player of room.players.values()){const d=Math.hypot(player.state.x-p.x,player.state.z-p.z);if(d<=p.radius && hasLineOfSightGame(game,p.x,p.z,player.state.x,player.state.z))damageServerPlayer(game,player,p.damage*(1-d/p.radius*.55),'devilFireball',{x:p.x,z:p.z});}for(const w of activeWalls(game))if(Math.hypot(w.x-p.x,w.z-p.z)<3)damageServerWall(game,w,34,'devilFireball');}
      else applyExplosionDamage(room, p.x, p.z, p.radius || 5.5, p.damage || 90, p.kind, p.ownerId);
      game.events.push({ type: 'projectileExplode', projectileId: p.id, kind: p.kind, ownerId: p.ownerId, x: p.x, y: p.y, z: p.z, radius: p.radius });
    }
  }
  game.projectiles = game.projectiles.filter(p => p.alive);
}
function applyFire(room,player,action) {
  const game=room.game;if(!game || game.phase!=='combat' || game.suspended || !player.state.alive)return;
  const wid=action.weapon,w=WEAPONS[wid];if(!w || !['hitscan','rail','grenade','rocket'].includes(w.type) || !consumeServerAmmo(room,player,wid))return;
  if(w.type==='grenade' || w.type==='rocket'){spawnServerProjectile(room,player,action,wid);game.events.push({type:'serverFire',playerId:player.id,weapon:wid,weaponState:weaponPublicState(player)});return;}
  const sx=player.state.x,sy=1.68+(player.state.y || 0),sz=player.state.z,yaw=action.yaw,pitch=action.pitch;
  for(let pellet=0;pellet<(w.pellets || 1);pellet++){
    const spread=(w.spread || 0)*(action.ads?.34:1.85);const ya=yaw+(Math.random()-.5)*spread,pi=pitch+(Math.random()-.5)*spread;
    const dx=-Math.sin(ya)*Math.cos(pi),dy=Math.sin(pi),dz=-Math.cos(ya)*Math.cos(pi),ignored=new Set();
    let pierce=(w.pierce || 1)+(wid==='railgun' && player.upgrades.railOvercharge?1:0),limit=w.range || 42;
    const wall=findWallOnRayGame(game,sx,sz,dx,dz,limit);
    if(wall)limit=wall.distance;
    while(pierce-->0){
      let best=null,bestT=limit,part='body';
      for(const e of game.enemies){if(!e.alive || ignored.has('e'+e.id))continue;const head=raySphere(sx,sy,sz,dx,dy,dz,e.x,1.58,e.z,.47,bestT),body=raySphere(sx,sy,sz,dx,dy,dz,e.x,.86,e.z,e.radius+.22,bestT),t=head!==null?head:body;if(t!==null && t<bestT && !wallBlocksGame(game,sx,sz,dx,dz,t)){best={enemy:e};bestT=t;part=head!==null?'head':'body';}}
      for(const c of game.cores){if(!c.alive || ignored.has('c'+c.id))continue;const t=raySphere(sx,sy,sz,dx,dy,dz,c.x,.95,c.z,.95,bestT);if(t!==null && t<bestT && !wallBlocksGame(game,sx,sz,dx,dz,t)){best={core:c};bestT=t;}}
      if(!best)break;
      let damage=w.damage*player.upgrades.damage*(wid==='shotgun' && player.upgrades.shotgunBreach?1.22:1)*(wid==='railgun' && player.upgrades.railOvercharge?1.18:1);
      if(best.core){damageCore(game,best.core,damage);ignored.add('c'+best.core.id);}
      else{const e=best.enemy;if(part==='head'){damage*= (e.type==='devil'?1.85:2.25)*player.upgrades.headshot;game.headshots++;}else{if(e.type==='shield' && w.type!=='rail' && (Math.sin(e.yaw)*(sx-e.x)+Math.cos(e.yaw)*(sz-e.z))/Math.max(.01,Math.hypot(sx-e.x,sz-e.z))>.25)damage*=.28;if(e.type==='tank')damage*=.82;}e.hp-=damage;e.lastHitPart=part;
        game.events.push({type:'enemyHit',enemyId:e.id,part,damage,shooterId:player.id,weapon:wid});if(e.hp<=0)killServerEnemy(room,e,wid,player.id);ignored.add('e'+e.id);
      }
    }
    if(wall)damageServerWall(game,wall.wall,w.damage*(wid==='shotgun' && player.upgrades.shotgunBreach?1.65:1),'bullet');
  }
  game.events.push({type:'serverFire',playerId:player.id,weapon:wid,weaponState:weaponPublicState(player)});
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
  if (!canPlaceRect(game, x, z, w, d) || [...room.players.values()].some(p=>Math.abs(p.state.x-x)<w/2+.6 && Math.abs(p.state.z-z)<d/2+.6) || !hasLineOfSightGame(game,player.state.x,player.state.z,x,z)) return;
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
  if (!canPlaceRect(game, x, z, 1.4, 1.4) || !hasLineOfSightGame(game,player.state.x,player.state.z,x,z)) return;
  if (!consumeServerAmmo(room, player, 'barrel')) return;
  const mine = { id: game.nextPlaceableId++, kind: 'mine', ownerId: player.id, x, z, w: 1.28, d: 1.28, hp: 22, maxHp: 22, radius: 5.8, damage: 125 * (player.upgrades?.damage || 1), alive: true };
  game.placeables.push(mine);
  game.events.push({ type: 'mineCreate', mine });
}

function startServerReward(room) {
  const g=room.game;if(!g || g.phase==='reward')return;
  g.phase='reward';g.spawnQueue=0;g.projectiles=[];for(const e of g.enemies)e.alive=false;g.cores=[];
  const bonus=g.missionState.bonusComplete?g.mission.bonusScore:0;g.score+=g.mission.completionScore+bonus;g.missionsCleared++;if(bonus)g.bonusesCleared++;
  const choicesByPlayer={};for(const p of room.players.values()){if(p.state.downed)reviveServerPlayer(g,p,null);p.state.hp=Math.min(p.upgrades.maxHp,p.state.hp+8);p.state.medkits=Math.min(p.upgrades.maxMedkits,p.state.medkits+8);
    for(const [id,w]of Object.entries(WEAPONS))if(weaponUnlocked(id,g.wave) && Number.isFinite(w.ammoMax))p.weaponState.ammo[id]=Math.min(w.ammoMax,ammoNumber(p.weaponState.ammo[id])+Math.ceil(w.ammoMax*.15));syncWeaponState(p);
    choicesByPlayer[p.id]=rewardChoices(p.upgrades,g.wave,WEAPONS);
  }
  g.reward={wave:g.wave,choicesByPlayer,selected:{},remaining:25,bonusScore:bonus,completionScore:g.mission.completionScore,extractVotes:{}};
  g.events.push({type:'rewardStart',wave:g.wave});
}
function finishServerReward(room) {const g=room.game;if(!g || g.phase!=='reward')return;g.phase='prep';g.prepTimer=8;g.prepVotes={};g.reward=null;g.items.push(...makeItemDrops(g,2));g.events.push({type:'prepStart',seconds:8});}
function handleChooseReward(room,p,id) {
  const g=room.game;if(!g || g.phase!=='reward' || g.suspended || !g.reward || Object.hasOwn(g.reward.selected,p.id))return false;
  if(id!=='skip' && !g.reward.choicesByPlayer[p.id]?.some(r=>r.id===id))return false;
  if(id!=='skip' && !applyReward(p,id,g.wave,WEAPONS))return false;
  g.reward.selected[p.id]=id;g.events.push({type:'rewardChosen',playerId:p.id,rewardId:id});
  if([...room.players.values()].every(p=>Object.hasOwn(g.reward.selected,p.id)))finishServerReward(room);return true;
}
function makeItemDrops(game,count=1) {
  const drops=[];for(let i=0;i<count;i++){
    const point=game.nav.safePoint({minDistance:2,maxDistance:35,clearance:1.2}),kind=Math.random()<.4?'health':'ammo',pool=Object.keys(WEAPONS).filter(id=>id!=='pistol' && weaponUnlocked(id,game.wave));
    const weapon=pool[Math.floor(Math.random()*pool.length)] || 'pistol';if(kind==='ammo' && weapon==='pistol')continue;
    const item={id:game.nextItemId++,kind,weapon,amount:kind==='health'?24:Math.max(4,Math.ceil(WEAPONS[weapon].ammoMax*.2)),x:point.x,z:point.z,alive:true,life:30};drops.push(item);game.events.push({type:'itemSpawn',item});
  }return drops;
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
      if (d <= mine.radius && hasLineOfSightGame(game,mine.x,mine.z,e.x,e.z)) {
        e.hp -= mine.damage * (1 - d / mine.radius * .55);
        if (e.hp <= 0) killServerEnemy(room,e,'mine',mine.ownerId);
      }
    }
    game.events.push({ type: 'mineExplode', mineId: mine.id, x: mine.x, z: mine.z, radius: mine.radius });
  }
  game.placeables = game.placeables.filter(p => p.alive !== false);
}
function rand(min, max) { return min + Math.random() * (max - min); }

function updateGame(room,dt) {
  const g=room.game;if(!g || g.phase==='gameover')return;
  const players=[...room.players.values()],missing=players.filter(p=>!p.connected);
  g.suspended=missing.length>0 || players.length!==2;
  if(g.suspended){if(missing.some(p=>Date.now()-p.disconnectedAt>120000)){endRoomRun(room,'connection-timeout');for(const p of missing)room.players.delete(p.id);const host=[...room.players.values()][0];if(host){room.hostId=host.id;host.role='host';}emitLobby(room);}return;}
  g.elapsed+=dt;updatePlayerReloads(room,dt);updateServerPlayers(room,dt);updateServerAssist(room,dt);
  if(g.phase==='reward'){
    g.reward.remaining=Math.max(0,g.reward.remaining-dt);
    if(g.reward.remaining<=0){for(const p of players)if(g.reward && !Object.hasOwn(g.reward.selected,p.id))handleChooseReward(room,p,g.reward.choicesByPlayer[p.id]?.[0]?.id || 'skip');}
  }else if(g.phase==='prep'){
    g.prepTimer=Math.max(0,g.prepTimer-dt);updateServerItems(room,dt);
    if(g.prepTimer<=0 || players.every(p=>g.prepVotes[p.id])){g.phase='combat';g.wave++;setupServerMission(g);for(const p of players){for(const [id,w]of Object.entries(WEAPONS))if(w.unlockWave===g.wave && Number.isFinite(w.ammoMax))p.weaponState.ammo[id]=Math.max(ammoNumber(p.weaponState.ammo[id]),Math.ceil(w.ammoMax*.35));}g.events.push({type:'waveStart',wave:g.wave});}
  }else{
    if(g.spawnQueue>0){g.spawnTimer-=dt;if(g.spawnTimer<=0 && g.enemies.filter(e=>e.alive).length<Math.min(48,g.mission.maxActive+8)){if(spawnEnemy(g,room))g.spawnQueue--;g.spawnTimer=clamp((.74-g.wave*.015)*(g.map.spawnIntervalScale || 1),.2,.75);}}
    updateEnemies(room,dt);updateServerProjectiles(room,dt);updateMinesAndWalls(room);updateServerItems(room,dt);
    if(players.every(p=>p.state.downed || p.state.hp<=0)){endRoomRun(room,'defeated');return;}
    const done=tickMission(g.mission,g.missionState,dt,{players:players.map(p=>({...p.state,connected:p.connected,interact:!!p.input.flags.interact})),remaining:g.spawnQueue+g.enemies.filter(e=>e.alive).length,coresLeft:g.cores.filter(c=>c.alive).length,headshots:g.headshots,canInteract:(p,t)=>hasLineOfSightGame(g,p.x,p.z,t.x,t.z)});
    if(done)startServerReward(room);
    else if(['survive','blackout','core','relay','holdout'].includes(g.mission.type) && g.spawnQueue<3 && g.enemies.filter(e=>e.alive).length<g.mission.maxActive+8)g.spawnQueue+=5;
  }
  for(const p of players){p.state.maxHp=p.upgrades.maxHp;p.state.maxMedkits=p.upgrades.maxMedkits;p.state.maxStamina=p.upgrades.maxStamina;}
  g.enemies=g.enemies.filter(e=>e.alive || Date.now()-(e.deadAt || 0)<250);g.events=g.events.slice(-200);
}
function snapshotRoom(room,consume=true) {
  const g=room.game;return{roomCode:room.roomCode,phase:room.phase,serverTime:Date.now(),
    players:[...room.players.values()].map(p=>({id:p.id,role:p.role,connected:p.connected,state:{...p.state,upgrades:p.upgrades,weaponState:weaponPublicState(p),reviveProgress:p.assist?.time || 0}})),
    game:g?{id:g.id,wave:g.wave,spawnQueue:g.spawnQueue,initialCount:g.initialCount,phase:g.phase,prepTimer:g.prepTimer,prepReadyCount:Object.keys(g.prepVotes).length,score:g.score,kills:g.kills,headshots:g.headshots,mapId:g.mapId,diffId:g.diffId,reward:g.reward,mission:g.mission,missionState:g.missionState,elapsed:g.elapsed,suspended:g.suspended,waitingSeconds:Math.max(0,...[...room.players.values()].filter(p=>!p.connected).map(p=>Math.ceil((120000-Date.now()+p.disconnectedAt)/1000))),missionsCleared:g.missionsCleared,bonusesCleared:g.bonusesCleared,outcome:g.outcome}:null,
    enemies:g?g.enemies.map(e=>({id:e.id,type:e.type,x:e.x,z:e.z,yaw:e.yaw,hp:Math.max(0,e.hp),maxHp:e.maxHp,alive:e.alive,elite:e.elite,targetPlayerId:e.targetPlayerId,lastHitPart:e.lastHitPart})):[],
    cores:g?g.cores.map(c=>({...c})):[],placeables:g?g.placeables.filter(p=>p.alive):[],items:g?g.items.filter(i=>i.alive):[],projectiles:g?g.projectiles.filter(p=>p.alive):[],events:g?(consume?g.events.splice(0,150):[]):[]};
}


function setupServerMission(g) {
  g.mission=getMission(g.wave);const points=[],from=g.nav.point(g.nav.start);
  if(g.mission.type==='holdout' || g.mission.type==='relay')for(let i=0;i<(g.mission.type==='relay'?3:1);i++)points.push(g.nav.safePoint({from,minDistance:8,maxDistance:30,existing:points,clearance:g.mission.type==='holdout'?4.5:1.2}));
  g.missionState=createMissionState(g.mission,points,{kills:g.kills,headshots:g.headshots});g.cores=[];
  if(g.mission.type==='core')for(let i=0;i<g.mission.coreCount;i++){const p=g.nav.safePoint({from,minDistance:10,maxDistance:34,existing:g.cores,clearance:1.2});g.cores.push({id:g.wave+':'+i,x:p.x,z:p.z,hp:g.mission.coreHp,maxHp:g.mission.coreHp,alive:true});}
  g.elitePending=!!g.mission.elite;g.spawnQueue=waveSpawnCount(g.wave,DIFFICULTY[g.diffId],2,g.map.threatScale || 1);g.initialCount=g.spawnQueue;g.spawnTimer=.6;g.waveBreak=0;
}
function damageCore(g,c,amount){if(!c.alive)return;c.hp=Math.max(0,c.hp-amount);g.events.push({type:'coreHit',coreId:c.id});if(c.hp<=0){c.alive=false;g.score+=80+g.wave*10;g.events.push({type:'coreDestroyed',coreId:c.id,x:c.x,z:c.z});}}
function killServerEnemy(room,e,source,owner){if(!e.alive)return;const g=room.game;e.alive=false;e.deadAt=Date.now();g.kills++;g.score+=Math.round(e.score);g.events.push({type:'enemyDeath',enemyId:e.id,enemyType:e.type,x:e.x,z:e.z});if(e.type==='bomber')applyExplosionDamage(room,e.x,e.z,4.3,70,'bomber',null);if(Math.random()<.15)g.items.push(...makeItemDrops(g,1));}
function downServerPlayer(g,p,reason='damage'){if(p.state.downed)return;p.state.hp=0;p.state.downed=true;p.state.alive=false;p.state.downedAt=Date.now();p.weaponState.reload=null;p.motion.vx=p.motion.vz=0;g.events.push({type:'playerDowned',playerId:p.id,reason});}
function damageServerPlayer(g,p,amount,kind,source={}){if(g.phase!=='combat' || g.suspended || p.state.downed || !p.connected || Date.now()<(p.invulnerableUntil || 0))return;p.state.hp=Math.max(0,p.state.hp-Math.max(0,amount));if(p.state.hp<=0)downServerPlayer(g,p,kind);}
function healServerPlayer(g,healer,target,amount,kind){if(!healer.state.alive || target.state.downed || target.state.hp>=target.upgrades.maxHp || (healer.state.medkits || 0)<=0)return false;const gain=Math.min(amount,healer.state.medkits,target.upgrades.maxHp-target.state.hp);healer.state.medkits-=gain;target.state.hp+=gain;g.events.push({type:healer.id===target.id?'medkitUse':'allyHeal',playerId:target.id,healerId:healer.id,targetId:target.id,amount:gain});return true;}
function reviveServerPlayer(g,p,healer){p.state.hp=p.upgrades.maxHp*.4;p.state.downed=false;p.state.alive=true;p.invulnerableUntil=Date.now()+1800;g.events.push({type:'allyRevive',targetId:p.id,playerId:p.id,healerId:healer?.id});}
function handleAssistAlly(room,healer,payload){const target=room.players.get(payload.targetPlayerId),g=room.game;if(!target || !healer.state.alive || target.id===healer.id || Math.hypot(healer.state.x-target.state.x,healer.state.z-target.state.z)>3.2 || !hasLineOfSightGame(g,healer.state.x,healer.state.z,target.state.x,target.state.z))return false;
  if(healer.assist.target!==target.id || healer.assist.time<(target.state.downed?1.05:.65))return false;
  if(target.state.downed)reviveServerPlayer(g,target,healer);else healServerPlayer(g,healer,target,25,'ally');healer.assist={target:null,time:0};return true;
}
function updateServerAssist(room,dt){for(const healer of room.players.values()){
  const target=[...room.players.values()].find(p=>p.id!==healer.id && (p.state.downed || p.state.hp<p.upgrades.maxHp-2) && Math.hypot(p.state.x-healer.state.x,p.state.z-healer.state.z)<=3.2 && hasLineOfSightGame(room.game,healer.state.x,healer.state.z,p.state.x,p.state.z));
  if(!healer.input.flags.assist || !healer.state.alive || !target){healer.assist={target:null,time:0};continue;}
  if(healer.assist.target!==target.id)healer.assist={target:target.id,time:0};healer.assist.time+=dt;
  if(healer.assist.time>=(target.state.downed?1.15:.75))handleAssistAlly(room,healer,{targetPlayerId:target.id});
}}
function endRoomRun(room,outcome){if(!room.game || room.game.phase==='gameover')return;room.game.phase='gameover';room.game.outcome=outcome;room.game.suspended=false;room.game.events.push({type:'teamWipe',outcome});}

io.on('connection',socket=>{
  socket.data.roomCode=null;
  socket.data.playerToken=makeToken(socket.handshake.auth?.playerToken);
  let bucketAt=Date.now(),messages=0;
  const bind=(event,handler)=>socket.on(event,raw=>{
    const t=Date.now();if(t-bucketAt>=1000){bucketAt=t;messages=0;}if(++messages>160)return;
    const payload=raw && typeof raw==='object' && !Array.isArray(raw)?raw:{};
    handler(payload);
  });
  bind('createRoom',p=>{
    if(rooms.size>=Number(process.env.MAX_ROOMS || 100))return socket.emit('lobbyError',{message:'서버의 방이 모두 사용 중입니다. 잠시 뒤 다시 시도하세요.'});
    leaveCurrentRoom(socket);
    const code=randomRoomCode(),player=makePlayer(socket,'host',socket.data.playerToken);
    const room={roomCode:code,hostId:socket.id,phase:'lobby',settings:sanitizeSettings(p.settings),players:new Map([[socket.id,player]]),createdAt:Date.now(),emptyAt:0,game:null};
    rooms.set(code,room);socket.join(code);socket.data.roomCode=code;
    socket.emit('roomCreated',{room:publicRoom(room)});emitLobby(room);
  });
  bind('joinRoom',p=>{
    const room=getRoomOrError(socket,p.roomCode);if(!room)return;
    const existing=findPlayerByToken(room,socket.data.playerToken);
    if(existing){
      if(existing.connected && existing.id!==socket.id)return socket.emit('lobbyError',{message:'이 플레이어는 다른 탭에서 접속 중입니다. 다른 브라우저로 두 번째 플레이어를 연결하세요.'});
      if(socket.data.roomCode && socket.data.roomCode!==room.roomCode)leaveCurrentRoom(socket);
      bindSocketToPlayer(room,existing,socket);if(room.game)room.game.suspended=[...room.players.values()].some(p=>!p.connected);
      socket.emit('roomJoined',{room:publicRoom(room),reconnected:true,snapshot:snapshotRoom(room,false)});emitLobby(room);return;
    }
    if(room.phase!=='lobby')return socket.emit('lobbyError',{message:'진행 중인 방에는 새 플레이어가 입장할 수 없습니다.'});
    if(room.players.size>=2)return socket.emit('lobbyError',{message:'이 방은 두 사람이 모두 입장했습니다.'});
    leaveCurrentRoom(socket);const player=makePlayer(socket,'guest',socket.data.playerToken);room.players.set(socket.id,player);socket.join(room.roomCode);socket.data.roomCode=room.roomCode;
    socket.emit('roomJoined',{room:publicRoom(room)});emitLobby(room);
  });
  bind('leaveRoom',()=>{leaveCurrentRoom(socket);socket.emit('roomLeft',{});});
  bind('updateSettings',p=>{
    const room=getRoomOrError(socket,p.roomCode);if(!room || room.hostId!==socket.id || room.phase!=='lobby')return;
    room.settings=sanitizeSettings(p.settings);for(const player of room.players.values())player.ready=false;emitLobby(room);
  });
  bind('setReady',p=>{
    const room=getRoomOrError(socket,p.roomCode),player=room?.players.get(socket.id);if(!player || room.phase!=='lobby')return;
    player.ready=!!p.ready;emitLobby(room);
  });
  bind('startGame',p=>{
    const room=getRoomOrError(socket,p.roomCode);if(!room)return;
    if(room.hostId!==socket.id)return socket.emit('lobbyError',{message:'호스트만 게임을 시작할 수 있습니다.'});
    if(room.phase!=='lobby')return;
    const players=[...room.players.values()];
    if(players.length!==2 || !players.every(p=>p.connected && p.ready))return socket.emit('lobbyError',{message:'두 사람이 입장하고 준비를 완료해야 합니다.'});
    // Lobby settings are authoritative; a start packet cannot silently change them.
    room.phase='playing';room.game=makeGame(room.settings);const g=room.game,start=g.nav.point(g.nav.start);
    players.forEach((p,i)=>{
      p.upgrades=newUpgrades();p.weaponState=makeWeaponState(Number(room.settings.startWave));p.lastInputSeq=0;p.lastActionSeq=0;p.assist={target:null,time:0};
      p.motion={vx:0,vz:0,vy:0,grounded:true,stamina:100};
      let x=start.x+(i?1.2:-1.2),z=start.z;if(rectCollidesGame(g,x,z,.48)){const safe=g.nav.safePoint({from:start,minDistance:1,maxDistance:5,clearance:.6});x=safe.x;z=safe.z;}
      p.state={id:p.id,x,y:0,z,yaw:Math.PI,pitch:0,hp:100,maxHp:100,medkits:25,maxMedkits:100,stamina:100,maxStamina:100,alive:true,downed:false,weapon:'pistol'};
      p.input={keys:{},flags:{},look:{yaw:Math.PI,pitch:0},weapon:'pistol',updatedAt:Date.now()};
    });
    io.to(room.roomCode).emit('gameStart',{room:publicRoom(room),settings:room.settings,gameId:g.id,snapshot:snapshotRoom(room,false)});
  });
  bind('returnToLobby',p=>{
    const room=getRoomOrError(socket,p.roomCode);if(!room || !room.players.has(socket.id) || room.game?.phase!=='gameover')return;
    room.phase='lobby';room.game=null;for(const player of room.players.values())player.ready=false;
    io.to(room.roomCode).emit('returnToLobby',{room:publicRoom(room)});
  });
  bind('playerInput',payload=>{
    const room=rooms.get(socket.data.roomCode),p=room?.players.get(socket.id);if(!p || !room.game || room.phase!=='playing')return;
    const seq=n(payload.seq,0,0,1e12);if(seq<=p.lastInputSeq)return;p.lastInputSeq=seq;
    const keys={},allowed=['KeyW','KeyA','KeyS','KeyD','ShiftLeft','Space','KeyF'];
    for(const code of allowed)keys[code]=!!payload.keys?.[code];
    const flags={fire:!!payload.flags?.fire,ads:!!payload.flags?.ads,interact:!!payload.flags?.interact,assist:!!payload.flags?.assist,move:n(payload.flags?.move,0,0,1)};
    const weapon=Object.hasOwn(WEAPONS,payload.weapon)?payload.weapon:'pistol';
    if(p.input.weapon!==weapon && p.weaponState.reload)cancelServerReload(room,p);
    p.input={keys,flags,look:{yaw:n(payload.look?.yaw,p.state.yaw,-1e5,1e5),pitch:n(payload.look?.pitch,p.state.pitch,-1.18,1.10)},weapon,updatedAt:Date.now()};
    p.state.yaw=p.input.look.yaw;p.state.pitch=p.input.look.pitch;p.state.weapon=weapon;p.state.ads=flags.ads;
  });
  bind('playerAction',payload=>{
    const room=rooms.get(socket.data.roomCode),p=room?.players.get(socket.id),g=room?.game;if(!p || !g || room.phase!=='playing' || g.phase==='gameover' || g.suspended)return;
    const seq=n(payload.seq,0,0,1e12);if(seq<=p.lastActionSeq)return;p.lastActionSeq=seq;
    const type=String(payload.actionType || '');
    if(type==='chooseReward'){handleChooseReward(room,p,String(payload.rewardId));return;}
    if(type==='extract' && g.phase==='reward' && g.wave%10===0){g.reward.extractVotes[p.id]=true;if([...room.players.values()].every(p=>g.reward.extractVotes[p.id]))endRoomRun(room,'extracted');return;}
    if(type==='skipPrep' && g.phase==='prep'){g.prepVotes[p.id]=true;return;}
    if(!p.state.alive || !['combat','prep'].includes(g.phase))return;
    const weapon=Object.hasOwn(WEAPONS,payload.weapon)?payload.weapon:'pistol';
    const action={actionType:type,weapon,yaw:n(payload.look?.yaw,p.state.yaw,-1e5,1e5),pitch:n(payload.look?.pitch,p.state.pitch,-1.18,1.10),x:p.state.x,y:p.state.y,z:p.state.z,ads:!!payload.ads};
    if(type==='fire')applyFire(room,p,action);
    else if(type==='reloadStart')startServerReload(room,p,weapon);
    else if(type==='reloadCancel')cancelServerReload(room,p,weapon);
    else if(type==='placeWall')handlePlaceWall(room,p,{...action,placement:payload.placement || {}});
    else if(type==='placeMine')handlePlaceMine(room,p,{...action,placement:payload.placement || {}});
    else if(type==='useMedkit')healServerPlayer(g,p,p,25,'self');
    else if(type==='assistAlly')handleAssistAlly(room,p,payload);
    if(['fire','reloadStart','placeWall','placeMine'].includes(type))socket.to(room.roomCode).emit('remoteAction',{playerId:p.id,action});
  });
  socket.on('latencyPing',(payload,ack)=>{if(typeof ack==='function')ack({ok:true,serverTime:Date.now()});});
  socket.on('disconnect',()=>leaveCurrentRoom(socket,{soft:true}));
});

const intervals=[];
let lastTick=performance.now();
if(autoTick)intervals.push(setInterval(()=>{
  const current=performance.now(),dt=Math.min(.1,(current-lastTick)/1000);lastTick=current;
  for(const room of rooms.values())if(room.phase==='playing')updateGame(room,dt);
},1000/30));
intervals.push(setInterval(()=>{for(const room of rooms.values())if(room.phase==='playing')io.to(room.roomCode).emit('stateSnapshot',snapshotRoom(room));},1000/20));
intervals.push(setInterval(()=>{
  const t=Date.now();for(const [code,room]of rooms){
    if(room.phase==='lobby'){for(const [id,p]of room.players)if(!p.connected && t-p.disconnectedAt>120000)room.players.delete(id);const host=room.players.get(room.hostId);if(!host){const next=[...room.players.values()][0];if(next){room.hostId=next.id;next.role='host';emitLobby(room);}}}
    if(!room.players.size || (room.emptyAt && [...room.players.values()].every(p=>!p.connected) && t-room.emptyAt>120000))rooms.delete(code);
  }
},1000));

return {
  app,io,rooms,httpServer,
  tick:updateGame,snapshot:snapshotRoom,
  async start(){return new Promise((resolve,reject)=>{httpServer.once('error',reject);httpServer.listen(port,host,()=>{httpServer.removeListener('error',reject);resolve(httpServer.address());});});},
  async stop(){for(const interval of intervals)clearInterval(interval);for(const room of rooms.values())room.game=null;await new Promise(resolve=>io.close(resolve));}
};

}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const server=createGameServer();const address=await server.start();
  console.log(`BOXHEAD CO-OP · http://localhost:${address.port}`);
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await server.stop();process.exit(0);});
}
