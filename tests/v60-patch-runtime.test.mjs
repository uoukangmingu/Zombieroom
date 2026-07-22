import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class Vec3 {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
  copy(o){this.x=o.x;this.y=o.y;this.z=o.z;return this;}
  clone(){return new Vec3(this.x,this.y,this.z);}
}
const makeNode=()=>({classList:{add(){},remove(){},toggle(){}},style:{},dataset:{},textContent:'',offsetWidth:1,setAttribute(){},querySelector(){return null;}});
const nodes=new Map();
const document={documentElement:{dataset:{}},getElementById(id){if(!nodes.has(id))nodes.set(id,makeNode());return nodes.get(id);}};
const group=()=>({children:[],position:new Vec3(),rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1,set(){},},userData:{},add(o){this.children.push(o);o.parent=this;},constructor:function Group(){return group();}});
const survivorModel=group(); survivorModel.userData.leftArm=group(); survivorModel.userData.rightArm=group();
const survivor={role:'survivor',x:24,z:30,group:group(),collider:{alive:true},maxHp:160,hp:160,dead:false,active:true,done:false,destination:{x:-22,z:-24}};
survivor.group.userData.model=survivorModel;
const door={role:'blastDoor',door:true,x:14,z:-10,done:false,openT:0,group:group(),stripe:{constructor:function Mesh(){return {position:new Vec3(),scale:{set(){}},material:{clone(){return {}}}}},position:new Vec3(),material:{clone(){return {}}}},doorVisual:{position:new Vec3()}};
const relay={role:'relay',done:false};
const proto={
  getStoryCinematicCameraPose(){return {position:new Vec3()};},
  playStoryMotion(){this.motionCalls=(this.motionCalls||0)+1;},
  setupStoryEnvironment(){}, activateStoryMissionObjects(){}, getActiveStorySurvivor(){return null;},
  updateStorySurvivorHealthHud(){}, completeStoryInteraction(){}, updateStorySystems(){}, updateEnemies(){}, updateCamera(){}, clearStoryRuntimeState(){},
  getCurrentStoryTarget(){return survivor;}, getStorySurvivor(){return survivor;},
  moveStoryObjectTo(o,x,z){o.x=x;o.z=z;o.group?.position.set(x,0,z);},
  addObstacle(x,z,w,d,kind){const o={x,z,w,d,kind,alive:true,mesh:{position:new Vec3(),scale:{y:1},material:{}},extras:[]};this.obstacles.push(o);return o;},
  addPart(parent){const p={position:new Vec3(),rotation:{x:0,y:0,z:0},scale:{},userData:{}};parent.add(p);return p;},
  markNavDirty(){this.navDirty=true;}, collides(){return false;}, snapStoryPointToReachable(x,z){return {x,z};},
  enemyStats(){return {hp:30,speed:2.4,damage:10,score:10,radius:.48};}, createBoxheadModel(){return {position:new Vec3(),rotation:{y:0}};}, spawnEnemySpawnFx(){},
  showCenterAlert(){}, queueDialogue(){}, showToast(){},
  stepStoryMover(o,tx,tz){o.x=tx;o.z=tz;return true;}, getFlowField(){return null;}, moveEntity(o,dx,dz){o.x+=dx;o.z+=dz;},
  damageEnemy(){this.supportShots=(this.supportShots||0)+1;}, lookDirection(){return new Vec3(0,0,-1);}, spawnRemoteBulletVisual(){},
  isStoryCinematicLineClear(){return true;}
};
const seed=Object.assign(Object.create(proto),{
  build:'59.0',runMode:'story',storyChapter:{id:1},currentMission:{type:'rescue'},storyObjects:[door,relay,survivor],storySequence:{rescued:false,survivorExtracted:false},
  scene:{add(){},remove(){}},player:{x:20,z:23,vx:1,vz:0,radius:.55},yaw:0,obstacles:[],enemies:[],nextEnemyId:1,
  geos:{lowBox:{}},storyMats:{dark:{},steel:{},yellow:{},red:{},white:{}},materials:{wall:{},trim:{},weaponMetal:{},fire:{}},
  audio:{storyObjectCue(){},beep(){}},quality:{simpleModels:true},fx:[],camera:{position:new Vec3(),rotateZ(){},},accessibility:{cameraMotion:'full'}
});
const context=vm.createContext({window:{__game:seed},document,performance:{now:()=>1000},addEventListener(){},console,Math,Number,Object,Array,String,Boolean,Set,Map});
vm.runInContext(fs.readFileSync(new URL('../client/v60.patch.js',import.meta.url),'utf8'),context,{filename:'v60.patch.js'});

assert.equal(seed.build,'60.0');
assert.equal(seed.__v60PatchApplied,true);
assert.equal(seed.getStoryCinematicCameraPose(survivor,true),null,'close survivor must not use CCTV');
seed.setupStoryEnvironment();
assert.equal(survivor.hidden,true,'survivor was not hidden');
assert.equal(survivor.forceCutaway,false,'survivor still forces CCTV');
assert.equal(survivor.x,24); assert.equal(survivor.z,29.25);
assert.ok(survivor.hideoutCover,'physical hideout cover missing at runtime');

seed.completeStoryInteraction(survivor);
assert.equal(seed.storySequence.rescued,true,'rescue state was not set');
assert.equal(survivor.collider.alive,false,'survivor collider should be disabled during escort');
assert.equal(survivor.escortNoCollision,true);

const before=Math.hypot(survivor.x-seed.player.x,survivor.z-seed.player.z);
seed.stepStoryMover(survivor,seed.player.x,seed.player.z,2.4,.1,.56,1.65);
const after=Math.hypot(survivor.x-seed.player.x,survivor.z-seed.player.z);
assert.ok(after < before,'formation follower did not approach the player');
assert.equal(survivor.collider.alive,false,'escort collider was incorrectly restored');

seed.currentMission={type:'interact'};
seed.completeStoryInteraction(relay);
assert.ok(seed.storyDoorShakeTimer>1,'door shake was not triggered');

console.log('v60 compatibility patch runtime tests: passed');
