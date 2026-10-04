import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {WebSocket} from 'ws';
globalThis.WebSocket ??= WebSocket;
const {io}=await import('../client/vendor/socket.io.js');
import {createGameServer} from '../server/server.js';

const event=(s,name)=>new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error(`Timeout: ${name}`)),5000);s.once(name,p=>{clearTimeout(t);resolve(p)});});
const flush=s=>new Promise((resolve,reject)=>s.timeout(2000).emit('latencyPing',{},err=>err?reject(err):resolve()));
async function harness(t,settings={}){
 const server=createGameServer({port:0,host:'127.0.0.1',autoTick:false});const a=await server.start(),url=`http://127.0.0.1:${a.port}`;const sockets=[];
 t.after(async()=>{sockets.forEach(s=>s.disconnect());await server.stop()});
 const connect=async(token=randomUUID())=>{const s=io(url,{transports:['websocket'],reconnection:false,auth:{playerToken:token}});s.token=token;s.seq=0;sockets.push(s);await event(s,'connect');return s;};
 const host=await connect(),guest=await connect();let p=event(host,'roomCreated');host.emit('createRoom',{settings});const code=(await p).room.roomCode;
 p=event(guest,'roomJoined');guest.emit('joinRoom',{roomCode:code});await p;const room=server.rooms.get(code);
 const send=async(s,name,p={})=>{s.emit(name,{roomCode:code,seq:++s.seq,...p});await flush(s)};
 const action=(s,type,p={})=>send(s,'playerAction',{actionType:type,...p});
 const start=async()=>{await send(host,'setReady',{ready:true});await send(guest,'setReady',{ready:true});const started=event(host,'gameStart');await send(host,'startGame');await started;};
 return{server,url,connect,host,guest,room,code,send,action,start,tick:dt=>server.tick(room,dt)};
}

test('real sockets: two ready players, host control, capacity and server-authoritative combat',async t=>{
 const h=await harness(t),{host,guest,room,send,action,server}=h;
 assert.equal((await fetch(h.url+'/health').then(r=>r.json())).ok,true);
 let err=event(host,'lobbyError');await send(host,'startGame');assert.match((await err).message,/준비/);assert.equal(room.game,null);
 const third=await h.connect();err=event(third,'lobbyError');await send(third,'joinRoom');assert.match((await err).message,/두 사람/);
 await send(guest,'updateSettings',{settings:{map:'abyss'}});assert.equal(room.settings.map,'box');
 await h.start();const g=room.game,p=room.players.get(host.id);g.spawnTimer=999;g.spawnQueue=1;g.enemies=[];
 const oldX=p.state.x;await send(host,'playerInput',{keys:{KeyD:true},look:{yaw:0,pitch:0},weapon:'pistol',x:999,hp:999,score:999});h.tick(.1);
 assert.ok(p.state.x>oldX && p.state.x<oldX+1);assert.equal(p.state.hp,100);assert.equal(g.score,0);
 p.input.keys={};p.state.x=0;p.state.z=0;p.motion.vx=p.motion.vz=0;
 const victim={id:42,type:'zombie',x:0,z:-5,hp:30,maxHp:30,radius:.48,score:10,alive:true,speed:0,damage:1,attackCd:9};g.enemies=[victim];
 await action(host,'fire',{weapon:'rocket',look:{yaw:0,pitch:0}});assert.equal(g.projectiles.length,0,'locked weapon accepted');
 await action(host,'fire',{weapon:'pistol',look:{yaw:0,pitch:0},ads:true});assert.equal(victim.alive,false);assert.equal(g.kills,1);assert.equal(g.headshots,1);assert.equal(p.weaponState.mag.pistol,11);
 await action(host,'fire',{weapon:'pistol',look:{yaw:0,pitch:0}});assert.equal(p.weaponState.mag.pistol,11,'cooldown bypass');
 p.weaponState.mag.pistol=4;await action(host,'reloadStart',{weapon:'pistol'});assert.ok(p.weaponState.reload);h.tick(1);assert.equal(p.weaponState.mag.pistol,12);
 g.spawnQueue=0;h.tick(1.3);assert.equal(g.phase,'reward');const score=g.score;
 await action(host,'chooseReward',{rewardId:'fake'});assert.equal(Object.keys(g.reward.selected).length,0);
 const offered=g.reward.choicesByPlayer[host.id][0].id;await action(host,'chooseReward',{rewardId:offered});await action(host,'chooseReward',{rewardId:offered});assert.equal(Object.keys(g.reward.selected).length,1);assert.equal(g.score,score);
 await action(guest,'chooseReward',{rewardId:'skip'});assert.equal(g.phase,'prep');
 await action(host,'skipPrep');h.tick(.01);assert.equal(g.phase,'prep');await action(guest,'skipPrep');h.tick(.01);assert.equal(g.wave,2);assert.equal(g.phase,'combat');
});

test('disconnect freezes all progression; token reconnect preserves player, rewards and extraction votes',async t=>{
 const h=await harness(t,{startWave:10}),{host,room,send,action,server}=h;let guest=h.guest;
 await h.start();const g=room.game;g.spawnQueue=0;g.enemies=[];h.tick(1.3);assert.equal(g.phase,'reward');
 const oldId=guest.id,oldPlayer=room.players.get(oldId),token=guest.token;oldPlayer.state.hp=57;
 await action(guest,'extract');assert.equal(g.reward.extractVotes[oldId],true);
 guest.disconnect();await new Promise(resolve=>server.io.of('/').sockets.get(oldId)?.once('disconnect',resolve) || resolve());
 h.tick(.1);assert.equal(g.suspended,true);const timer=g.reward.remaining,elapsed=g.elapsed;h.tick(30);assert.equal(g.reward.remaining,timer);assert.equal(g.elapsed,elapsed);
 guest=await h.connect(token);const joined=event(guest,'roomJoined');await send(guest,'joinRoom');const payload=await joined;
 assert.equal(payload.reconnected,true);assert.equal(payload.snapshot.game.id,g.id);assert.equal(room.players.get(guest.id),oldPlayer);assert.equal(oldPlayer.state.hp,57);
 assert.ok(g.reward.choicesByPlayer[guest.id]);assert.equal(g.reward.extractVotes[guest.id],true);
 await action(host,'extract');assert.equal(g.phase,'gameover');assert.equal(g.outcome,'extracted');
 await send(host,'returnToLobby');assert.equal(room.phase,'lobby');assert.equal(room.game,null);assert.equal(room.players.size,2);
});

test('downed teammate can be revived through held input, and team wipe ends run',async t=>{
 const h=await harness(t),{room,host,guest,send,action}=h;await h.start();const g=room.game;g.enemies=[];g.spawnTimer=999;g.spawnQueue=1;
 const p=room.players.get(host.id),q=room.players.get(guest.id);p.state.x=0;p.state.z=0;q.state.x=1.8;q.state.z=0;q.state.hp=0;q.state.downed=true;q.state.alive=false;
 await action(host,'assistAlly',{targetPlayerId:guest.id});assert.equal(q.state.downed,true,'instant revive must be rejected');
 await send(host,'playerInput',{flags:{assist:true},keys:{},look:{yaw:0,pitch:0}});
 for(let i=0;i<13;i++)h.tick(.1);assert.equal(q.state.downed,false);assert.equal(q.state.hp,40);assert.equal(p.state.medkits,25,'reviving costs no kit');
 p.state.hp=0;p.state.downed=true;p.state.alive=false;q.state.hp=0;q.state.downed=true;q.state.alive=false;h.tick(.1);assert.equal(g.phase,'gameover');assert.equal(g.outcome,'defeated');
});

test('actual mission handlers: core fire, simultaneous relays, capture and timed survival',async t=>{
 for(const wave of [3,4,6,8,9])await t.test(`level ${wave}`,async st=>{
  const h=await harness(st,{startWave:wave}),{room,host,guest,send,action}=h;await h.start();const g=room.game;g.spawnTimer=999;g.enemies=[];
  const p=room.players.get(host.id),q=room.players.get(guest.id);p.state.x=0;p.state.z=0;q.state.x=4;q.state.z=0;
  if(wave===3||wave===9){g.missionState.timer=.01;h.tick(.02);}
  if(wave===4){g.cores=[{id:'test',x:0,z:-4,hp:20,maxHp:20,alive:true}];await action(host,'fire',{weapon:'pistol',look:{yaw:0,pitch:-.16},ads:true});h.tick(.01);}
  if(wave===6){const target=g.missionState.targets[0];p.state.x=target.x;p.state.z=target.z;g.missionState.progress=g.mission.targetTime-.1;h.tick(.2);}
  if(wave===8){g.missionState.targets=[{id:'a',x:0,z:0,radius:2.8,progress:0,done:false},{id:'b',x:5,z:0,radius:2.8,progress:0,done:false},{id:'c',x:10,z:0,radius:2.8,progress:0,done:false}];q.state.x=5;
   await send(host,'playerInput',{flags:{interact:true}});await send(guest,'playerInput',{flags:{interact:true}});h.tick(1.9);assert.equal(g.missionState.progress,2);p.state.x=10;h.tick(1.9);
  }
  assert.equal(g.phase,'reward');assert.equal(g.missionsCleared,1);
 });
});

test('caster attacks have a dodge window, and projectiles cannot cross a thin wall',async t=>{
 const h=await harness(t),{room,host,guest}=h;await h.start();const g=room.game,p=room.players.get(host.id),q=room.players.get(guest.id);
 g.spawnTimer=999;g.spawnQueue=1;p.state.x=0;p.state.z=0;q.state.x=10;q.state.z=0;
 const e={id:11,type:'devil',x:0,z:-7,vx:0,vz:0,yaw:0,hp:100,maxHp:100,radius:.72,speed:0,damage:20,score:50,attackCd:0,alive:true};g.enemies=[e];
 h.tick(.1);assert.equal(p.state.hp,100);assert.ok(e.cast);assert.equal(g.projectiles.length,0);
 for(let i=0;i<5;i++)h.tick(.1);assert.ok(g.projectiles.some(p=>p.kind==='fireball'));assert.equal(p.state.hp,100);
 p.state.x=4;for(let i=0;i<12;i++)h.tick(.1);assert.equal(p.state.hp,100,'dodging the locked cast direction should work');
 g.enemies=[];g.projectiles=[{id:200,kind:'rocket',x:0,y:1,z:-1,vx:0,vy:0,vz:-80,life:3,radius:2,damage:1,ownerId:host.id,alive:true}];g.placeables=[{id:100,kind:'wall',x:0,z:-3,w:4,d:.45,hp:100,maxHp:100,alive:true}];
 h.tick(.1);assert.equal(g.projectiles.length,0);const hit=g.events.find(e=>e.type==='projectileExplode' && e.projectileId===200);assert.ok(hit.z>-3,'rocket detonated beyond the thin wall');
});

test('reconnect timeout returns a clear outcome and permits lobby recovery',async t=>{
 const h=await harness(t),{host,guest,room,send,server}=h;await h.start();const id=guest.id;const player=room.players.get(id);
 guest.disconnect();await new Promise(resolve=>server.io.of('/').sockets.get(id)?.once('disconnect',resolve)||resolve());player.disconnectedAt=Date.now()-121000;h.tick(.1);
 assert.equal(room.game.outcome,'connection-timeout');assert.equal(room.game.suspended,false);assert.equal(room.players.size,1);
 await send(host,'returnToLobby');assert.equal(room.phase,'lobby');
});
