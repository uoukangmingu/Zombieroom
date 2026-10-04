import test from 'node:test';
import assert from 'node:assert/strict';
import {getMission,createMissionState,tickMission,missionProgress,waveSpawnCount} from '../shared/missions.js';
import {MAPS,WEAPONS,DIFFICULTY} from '../shared/arena.js';
import {Navigation} from '../shared/navigation.js';
import {newUpgrades,rewardChoices,applyReward} from '../shared/rewards.js';

test('ten-level sequence and later sectors scale without duplicate special levels',()=>{
  assert.deepEqual(Array.from({length:10},(_,i)=>getMission(i+1).type),['normal','normal','survive','core','normal','holdout','rush','relay','blackout','normal']);
  assert.equal(getMission(5).elite,'tank');assert.equal(getMission(10).elite,'devil');
  assert.ok(getMission(16).targetTime>getMission(6).targetTime);
  assert.ok(waveSpawnCount(1,DIFFICULTY.normal,2)>waveSpawnCount(1,DIFFICULTY.normal,1));
  assert.ok(waveSpawnCount(999,DIFFICULTY.hell,2)<=90);
});
test('clear, timed survival, core, capture and relay each obey their actual objective',()=>{
  for(const wave of [1,2,5,7,10]){const m=getMission(wave),s=createMissionState(m);assert.equal(tickMission(m,s,5,{remaining:1}),false);assert.equal(tickMission(m,s,1.3,{remaining:0,headshots:3}),true);}
  for(const wave of [3,9]){const m=getMission(wave),s=createMissionState(m);assert.equal(tickMission(m,s,m.duration-1,{remaining:99}),false);assert.equal(tickMission(m,s,1,{remaining:99}),true);}
  {const m=getMission(4),s=createMissionState(m);assert.equal(tickMission(m,s,1,{coresLeft:1,remaining:0}),false);assert.equal(tickMission(m,s,1,{coresLeft:0,remaining:20}),true);}
  {const m=getMission(6),s=createMissionState(m,[{x:0,z:0}]);tickMission(m,s,10,{players:[{x:0,z:0,downed:true}]});assert.equal(s.progress,0);tickMission(m,s,10,{players:[{x:0,z:0}]});tickMission(m,s,5,{players:[{x:20,z:20}]});assert.equal(s.progress,10);assert.equal(tickMission(m,s,m.targetTime-10,{players:[{x:0,z:0}]}),true);}
  {const m=getMission(8),s=createMissionState(m,[{x:0,z:0},{x:10,z:0},{x:20,z:0}]);const players=[{x:0,z:0,interact:true},{x:10,z:0,interact:true}];tickMission(m,s,2,{players,canInteract:()=>false});assert.equal(s.progress,0);tickMission(m,s,2,{players});assert.equal(s.progress,2);assert.equal(s.complete,false);assert.equal(tickMission(m,s,2,{players:[{x:20,z:0,interact:true}]}),true);assert.equal(missionProgress(m,s),1);}
});
test('optional goals never block completion and pause freezes the mission clock',()=>{
 const m=getMission(1),s=createMissionState(m,[],{headshots:20});
 tickMission(m,s,10,{paused:true,remaining:0});assert.equal(s.elapsed,0);
 assert.equal(tickMission(m,s,2,{remaining:0,headshots:20}),true);assert.equal(s.bonusComplete,false);
});
test('all five maps have reachable, collision-free mission points with separated relay targets',()=>{
 for(const map of Object.values(MAPS)){const nav=new Navigation(map);assert.ok(nav.points.length>20);const points=[];for(let i=0;i<4;i++){const p=nav.safePoint({existing:points,minDistance:8,maxDistance:34,clearance:1.2});assert.equal(nav.collides(p.x,p.z,.8),false);assert.equal(nav.reachable[p.id],1);assert.ok(points.every(o=>Math.hypot(o.x-p.x,o.z-p.z)>=4));points.push(p);}}
});
test('reward unlock gates, stack limits and real upgrade values hold',()=>{
 const p={upgrades:newUpgrades(),state:{hp:50,medkits:0},motion:{stamina:10},weaponState:{ammo:{}}};
 assert.equal(applyReward(p,'wallHp',1,WEAPONS),false);assert.equal(applyReward(p,'fake',1,WEAPONS),false);
 for(let i=0;i<8;i++)assert.equal(applyReward(p,'maxHp',1,WEAPONS),true);
 assert.equal(applyReward(p,'maxHp',1,WEAPONS),false);assert.equal(p.state.maxHp,180);assert.equal(p.state.hp,130);
 for(let i=0;i<40;i++)for(const r of rewardChoices(p.upgrades,1,WEAPONS))assert.ok(!r.requires && r.id!=='maxHp');
});
