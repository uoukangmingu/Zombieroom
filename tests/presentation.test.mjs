import test from 'node:test';
import assert from 'node:assert/strict';
import {VisualFactory,animateEnemy,animateWeapon} from '../client/visuals.js';
import {Narrator,MISSION_LINES} from '../client/narrator.js';
import {joystickAxis} from '../client/control-icons.js';
import {MISSION_CATALOG} from '../shared/missions.js';

test('all six enemy rigs animate independently, with bounded lightweight geometry and distinct actions',()=>{
 const kit=new VisualFactory(),types=['zombie','runner','tank','devil','bomber','shield'],poses=[];
 for(const lite of [false,true])for(const type of types){
  const mesh=kit.enemy(type,lite),other=kit.enemy(type,lite);assert.notEqual(mesh.userData.head,other.userData.head);
  let draws=0,outlines=0;mesh.traverse(o=>{if(o.userData.outline)outlines++;if(o.isMesh){draws++;assert.ok(o.geometry.attributes.position.count>0);}});assert.ok(outlines>=6,'classic silhouette must retain its black hull');if(lite)assert.ok(draws<=18,`${type} uses ${draws} draws`);
  animateEnemy({mesh,type,id:3,x:2,z:4,walkSpeed:2,speed:2,walkPhase:1.2,attackAnim:.2,attackMax:.4,castAnim:.275,castMax:.55},2,true);
  assert.equal(mesh.position.x,2);assert.equal(mesh.position.z,4);mesh.traverse(o=>assert.ok([...o.position,...o.rotation.toArray().slice(0,3),...o.scale].every(Number.isFinite)));
  assert.ok(Math.abs(other.userData.head.rotation.z)<1e-10);if(!lite)poses.push([mesh.rotation.x,mesh.userData.leftArm.rotation.x,mesh.userData.rightArm.rotation.x].join(','));
  if(type==='devil')assert.equal(mesh.userData.castOrb.visible,true);
 }
 assert.equal(new Set(poses).size,6);
 for(const id of ['pistol','smg','shotgun','grenade','barrel','wall','rocket','railgun']){const m=kit.weapon(id);assert.ok(m.userData.muzzle.position.z<0);animateWeapon(m,{kick:.2,reload:.5,time:2});if(m.userData.magazine)assert.ok(m.userData.magazine.position.y<-.4);}
 kit.dispose();
});

test('joystick dead zone and analog magnitude retain direction without diagonal acceleration',()=>{
 assert.deepEqual(joystickAxis(1,2,40),{x:0,z:0});const half=joystickAxis(20,0,40);assert.ok(half.x>.4&&half.x<.5);assert.equal(half.z,0);
 const full=joystickAxis(80,-80,40);assert.ok(Math.abs(Math.hypot(full.x,full.z)-1)<1e-10);assert.ok(full.z<0);
});

test('narrator honors Korean voice, master gain, priorities, deduplication, mute and background cancellation',()=>{
 const calls=[],captions=[];let canceled=0;
 const voice={lang:'ko-KR',name:'Test Korean',voiceURI:'test-ko',localService:true};
 const synth={getVoices:()=>[{lang:'en-US'},voice],speak:u=>calls.push(u),cancel:()=>canceled++,addEventListener(){},removeEventListener(){}};
 class Utterance{constructor(text){this.text=text;}}
 const n=new Narrator({synth,Utterance,onCaption:text=>captions.push(text)});n.unlock();n.configure({volume:.8,master:.5});
 assert.equal(n.say('mission','구역 확보'),true);assert.equal(calls[0].voice,voice);assert.equal(calls[0].volume,.4);assert.equal(n.say('mission','중복'),false);
 n.say('risk','위험',{priority:3});assert.equal(calls.at(-1).text,'위험');assert.ok(canceled>0);
 n.configure({enabled:false});assert.equal(n.current,null);const count=calls.length;n.say('muted','자막 안내');assert.equal(calls.length,count);assert.equal(captions.at(-1),'자막 안내');
 n.setHidden(true);assert.equal(n.say('hidden','숨김'),false);assert.equal(captions.at(-1),'');n.dispose();
 for(const mission of MISSION_CATALOG)assert.ok(MISSION_LINES[mission.short]);
});

test('narrator without a Korean voice retains captions without selecting another language',()=>{
 let spoken=0,caption='';const n=new Narrator({synth:{getVoices:()=>[{lang:'en-US'}],speak:()=>spoken++,cancel(){}},Utterance:class{},onCaption:t=>caption=t});
 n.unlock();n.say('start','구역 확보');assert.equal(spoken,0);assert.equal(caption,'구역 확보');n.configure({enabled:false,subtitles:false});assert.equal(caption,'');n.dispose();
});
