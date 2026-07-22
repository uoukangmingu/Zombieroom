import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const makeNode = () => ({textContent:'',classList:{add(){},remove(){},toggle(){}},style:{},dataset:{}});
const nodes = new Map();
const document = { documentElement:{dataset:{}}, getElementById(id){ if(!nodes.has(id)) nodes.set(id, makeNode()); return nodes.get(id); } };
const makeGroup = () => ({visible:true,position:{x:0,y:0,z:0},rotation:{y:0}});
const scanner = {role:'scanner',x:-42,z:38,group:makeGroup(),collider:{alive:true,dynamicStory:true},active:false,done:false,label:'아틀라스 스캐너'};
const beacon = {role:'beacon',x:-32,z:-26,group:makeGroup(),collider:{alive:true},active:false,done:false,label:'좌표 비콘 1'};
const relay = {role:'relay',x:8,z:-12,group:makeGroup(),active:true,done:false,label:'중앙 중계 허브'};
const proto = {
  getMissionForWave(w){ return {type:w===4?'escort':'interact',target:w===4?'scanner':'beacon',label:'mission',hud:'hud'}; },
  setupStoryEnvironment(){}, activateStoryMissionObjects(){}, playStoryMotion(title){this.motionTitles.push(title);},
  completeStoryInteraction(o){o.done=true; this.playStoryMotion(`${o.label} 작동`,'copy',o,'info');},
  finishMissionWave(){this.playStoryMotion('작전 결과','outcome',null,'info'); this.storyCinematicQueue.push({title:'작전 결과'});},
  spawnObjectiveCores(count){this.objectiveCores=Array.from({length:count},(_,i)=>({x:i,z:i}));},
  missionObjectiveText(){return '';}, clearStoryRuntimeState(){},
  setStoryObjectCollision(o,enabled){if(o.collider)o.collider.alive=enabled;},
  ensureStoryPlayerClearance(){}, collides(x,z){return x===-50&&z===38;},
  findDeterministicSafePoint(){return {x:-49,z:47};},
  showCenterAlert(){this.alerts=(this.alerts||0)+1;}, queueDialogue(raw){this.dialogues.push(raw);},
  snapStoryPointToReachable(x,z){return {x,z};}, rectCollides(){return false;},
  createObjectiveCore(x,z,i){return {x,z,i};}, findCoreSpawnPoint(){return {x:20,z:20};},
  input:{resetTransient(){}}
};
const seed = Object.assign(Object.create(proto), {
  build:'60.0', runMode:'story', storyChapter:{id:4}, wave:1,
  player:{x:-42,z:38,y:0,vx:0,vz:0,vy:0,radius:.55,grounded:true}, yaw:0,pitch:0,
  storyObjects:[scanner,beacon], currentMission:{type:'interact',target:'beacon'},
  storyCinematicState:{title:'MISSION UPDATE',copy:''},storyCinematicQueue:[],motionTitles:[],dialogues:[],objectiveCores:[],
  input:{resetTransient(){}}
});
const context=vm.createContext({window:{__game:seed},document,addEventListener(){},console,Math,Number,Object,Array,String,Boolean,Set,Map});
vm.runInContext(fs.readFileSync(new URL('../client/v61.patch.js', import.meta.url),'utf8'),context,{filename:'v61.patch.js'});

assert.equal(seed.build,'61.0');
seed.setupStoryEnvironment();
assert.equal(scanner.group.visible,false,'scanner should remain docked at chapter start');
assert.equal(scanner.collider.alive,false,'docked scanner collider should not trap the player');
assert.notDeepEqual([seed.player.x,seed.player.z],[-42,38],'chapter 4 player was not moved away from scanner');
assert.equal(seed.player.x,-50); assert.equal(seed.player.z,44);

seed.currentMission=seed.getMissionForWave(4); seed.wave=4; seed.activateStoryMissionObjects();
assert.equal(scanner.group.visible,true,'scanner did not undock for escort');
assert.equal(scanner.collider.alive,true,'scanner collider did not restore for escort');
assert.match(seed.currentMission.fieldBrief,/핵심 보고서/);

seed.storyChapter={id:1}; seed.wave=2; seed.currentMission={type:'interact',target:'relay'}; seed.storyObjects=[relay];
seed.__v61ShutterSequenceActive=true;
seed.finishMissionWave('OBJECTIVE COMPLETE');
assert.equal(seed.motionTitles.includes('작전 결과'),false,'duplicate chapter 1 outcome cinematic was not suppressed');
assert.equal(seed.storyCinematicQueue.some(x=>x.title==='작전 결과'),false,'duplicate queued black-screen clip remains');

seed.__v61ShutterSequenceActive=false;
seed.player={x:8,z:-10,radius:.55}; seed.storyChapter={id:2}; seed.currentMission={type:'generator',target:'generator'};
const local={role:'generator',x:8,z:-12,group:makeGroup(),active:true,done:false,label:'예비 발전기 1',forceCutaway:false};
seed.storyObjects=[local];
const before=seed.motionTitles.length;
seed.completeStoryInteraction(local);
assert.equal(seed.motionTitles.length,before,'nearby control interaction unnecessarily started a cinematic');
assert.ok(seed.alerts>0,'nearby control interaction lacked direct feedback');

seed.storyChapter={id:4}; seed.wave=2; seed.player={x:-50,z:44,radius:.55};
seed.spawnObjectiveCores(3);
assert.equal(JSON.stringify(seed.objectiveCores.map(c=>[c.x,c.z])), JSON.stringify([[-31,-20],[13,7],[32,-27]]));

console.log('v61 runtime compatibility patch tests: passed');
