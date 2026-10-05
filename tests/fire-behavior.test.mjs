import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeFirePatch,tickBurning,strongestFireAt} from '../shared/fire.js';
import {approachPoint,makePersonality,personalSteering} from '../shared/enemy-behavior.js';
import {normalizeServerUrl,inviteUrl} from '../shared/connection.js';
import {creaturePCM,CREATURE_VOICES} from '../client/creature-voices.js';

test('overlapping fire does not stack, burns linger after escape, and wall cover blocks ignition',()=>{
 const e={id:1,x:0,z:0,radius:.5},a=makeFirePatch(1,0,0,'a'),b=makeFirePatch(2,0,0,'b',2);
 assert.equal(tickBurning(e,[a,b],.2),8.8);assert.equal(e.burnOwnerId,'b');
 e.x=20;assert.ok(tickBurning(e,[a,b],.2)>0);for(let i=0;i<10;i++)tickBurning(e,[a,b],.2);assert.equal(tickBurning(e,[a,b],.2),0);
 assert.equal(strongestFireAt([a,b],{x:0,z:0},()=>false),null);
});
test('each personality is stable and target/steering fall back when a wall blocks a flank',()=>{
 assert.deepEqual(makePersonality(200,'runner'),makePersonality(200,'runner'));
 const e={id:200,type:'runner',x:0,z:-10,radius:.46,alive:true},target={x:0,z:0,vx:4,vz:0};
 assert.deepEqual(approachPoint(e,target,1,()=>false),{x:0,z:0});
 const desired={x:0,z:1};assert.deepEqual(personalSteering(e,desired,target,[e],1,{clear:()=>false}),desired);
 const personalities=Array.from({length:40},(_,i)=>makePersonality(i,'zombie'));assert.equal(new Set(personalities.map(p=>p.style)).size,5);
});
test('invites preserve the actual server, replace loopback for LAN and support public hosting',()=>{
 assert.equal(normalizeServerUrl(' https://game.example:443/path '),'https://game.example');
 assert.throws(()=>normalizeServerUrl('javascript:alert(1)'));assert.throws(()=>normalizeServerUrl('https://name:pass@game.example'));
 assert.equal(inviteUrl('http://localhost:3000','ABC123',{lanUrls:['http://192.168.0.8:3000']}),'http://192.168.0.8:3000/?room=ABC123');
 assert.equal(inviteUrl('http://localhost:3000','ABC123',{publicUrl:'https://game.example'}),'https://game.example/?room=ABC123');
 assert.equal(inviteUrl('https://other.example','ABC123',{}),'https://other.example/?room=ABC123');
});
test('six creature voices produce distinct, finite, bounded and audible PCM in each mood',()=>{
 const fingerprints=[];
 for(const type of Object.keys(CREATURE_VOICES))for(const mood of ['idle','attack','death']){
  const pcm=creaturePCM(type,mood);let energy=0,peak=0,crossings=0;
  for(let i=0;i<pcm.length;i++){assert.ok(Number.isFinite(pcm[i]));energy+=pcm[i]*pcm[i];peak=Math.max(peak,Math.abs(pcm[i]));if(i&&pcm[i]*pcm[i-1]<0)crossings++;}
  assert.ok(Math.sqrt(energy/pcm.length)>.015);assert.ok(peak<=.83);fingerprints.push(`${pcm.length}:${crossings}`);
 }
 assert.equal(new Set(fingerprints).size,18);
});
