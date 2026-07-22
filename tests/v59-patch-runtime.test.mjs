import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class Vec3 {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
  distanceToSquared(o){return (this.x-o.x)**2+(this.y-o.y)**2+(this.z-o.z)**2;}
  copy(o){this.x=o.x;this.y=o.y;this.z=o.z;return this;}
}
class Quat { setFromRotationMatrix(){return this;} copy(){return this;} }
class Mat4 { lookAt(){return this;} }
const nodes = new Map();
const makeNode = () => ({
  classList:{ add(){}, remove(){}, toggle(){} }, dataset:{}, style:{},
  querySelector(){return null;}, insertBefore(){}, textContent:'', setAttribute(){}
});
const document = {
  documentElement:{dataset:{}},
  getElementById(id){ if(!nodes.has(id)) nodes.set(id,makeNode()); return nodes.get(id); },
  createElement(){return makeNode();}
};
const proto = {
  getMissionForWave(){ return { label:'mission', hud:'do mission' }; },
  setupStoryEnvironment(){}, ensureStoryOverlay(){}, updateStoryInteractionInput(){return false;},
  activateStoryMissionObjects(){}, completeStoryInteraction(){},
  startStoryCinematicClip(clip){ this.storyCinematicState={...clip,target:clip.target,elapsed:0,duration:3}; },
  updateStoryCinematic(){}, updateCamera(){}, finishStoryCinematicClip(){this.storyCinematicState=null;},
  clearStoryRuntimeState(){}, finishMissionWave(){},
  rayAabb2D(){return null;}, collides(){return false;}, getEyeY(){return 1.7;},
  addObstacle(x,z,w,d,kind){ const o={x,z,w,d,kind,alive:true,mesh:{material:null}}; this.obstacles.push(o); return o; },
  moveStoryObjectTo(o,x,z){o.x=x;o.z=z;if(o.obstacle){o.obstacle.x=x;o.obstacle.z=z;}},
  markNavDirty(){this.navDirty=true;}, ensureStoryPlayerClearance(){},
  nearestStoryObject(){return null;}, showCenterAlert(){}, playStoryMotion(){}, queueDialogue(){}
};
const seed = Object.assign(Object.create(proto), {
  camera:{position:new Vec3(),quaternion:new Quat(),matrix:new Mat4(),fov:72,updateProjectionMatrix(){}},
  player:{x:0,z:0,vx:0,vz:0}, map:{size:76}, obstacles:[], storyObjects:[], storyMats:{steel:{}},
  runMode:'story', storyChapter:{id:1}, currentMission:null, storyCinematicQueue:[],
  viewWeapon:{visible:true}
});
const window = {__game:seed};
const context = vm.createContext({window,document,performance:{now:()=>1000},addEventListener(){},console,Math,Number,Object,Array,String,Boolean,Set,Map});
const patch = fs.readFileSync(new URL('../client/v59.patch.js', import.meta.url),'utf8');
vm.runInContext(patch,context,{filename:'v59.patch.js'});

assert.equal(seed.build,'59.0','patch did not mark v59 build');
assert.equal(seed.__v59PatchApplied,true,'patch application marker missing');
const mission = seed.getMissionForWave(1);
assert.match(mission.rationale,/방폭 셔터/,'mission rationale patch missing');
assert.ok(mission.outcome,'mission outcome patch missing');

seed.storyObjects=[
  {role:'blastDoor',door:true,obstacle:{alive:true},doorVisual:{position:{x:0,z:0}}},
  {role:'relay'},
  {role:'survivor'}
];
seed.setupStoryEnvironment();
assert.equal(seed.player.x,-22);
assert.equal(seed.player.z,-24);
assert.equal(seed.obstacles.filter(o=>o.kind==='storyPartition').length,2,'chapter 1 full partition was not built');
assert.equal(seed.storyObjects[0].forceCutaway,true,'quarantine shutter did not force CCTV reveal');
assert.deepEqual([seed.storyObjects[0].x,seed.storyObjects[0].z],[14,-10],'quarantine shutter was not moved to the validated corridor');
assert.deepEqual([seed.storyObjects[2].x,seed.storyObjects[2].z],[24,30],'survivor was not moved inside the quarantine wing');

seed.obstacles=[];
seed.player.x=-22; seed.player.z=-24;
const target={x:14,z:-10,y:1.5,label:'door',forceCutaway:true};
const pose=seed.getStoryCinematicCameraPose(target,true);
assert.ok(pose?.position,'CCTV pose resolver returned no camera position');
assert.equal(pose.label,'door');

console.log('v59 browser compatibility patch runtime tests: passed');
