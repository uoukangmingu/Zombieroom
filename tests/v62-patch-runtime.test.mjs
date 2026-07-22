import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class V3 {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
  clone(){return new V3(this.x,this.y,this.z);}
  copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;}
  sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this;}
  add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;}
  multiplyScalar(k){this.x*=k;this.y*=k;this.z*=k;return this;}
  lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z;}
  normalize(){const d=Math.sqrt(this.lengthSq())||1;return this.multiplyScalar(1/d);}
  lerpVectors(a,b,t){this.x=a.x+(b.x-a.x)*t;this.y=a.y+(b.y-a.y)*t;this.z=a.z+(b.z-a.z)*t;return this;}
}
class Q { clone(){return new Q();} copy(){return this;} setFromRotationMatrix(){return this;} }
class M { lookAt(){return this;} }
const makeClassList=()=>{const s=new Set();return {add(...a){a.forEach(x=>s.add(x));},remove(...a){a.forEach(x=>s.delete(x));},toggle(x,v){if(v===undefined?v:!!v)s.add(x);else s.delete(x);},contains(x){return s.has(x);}};};
const nodes=new Map();
const makeNode=(id='')=>({id,textContent:'',innerHTML:'',style:{display:'',setProperty(){}},dataset:{},className:'',classList:makeClassList(),children:[],setAttribute(){},appendChild(n){this.children.push(n);if(n.id)nodes.set(n.id,n);return n;},querySelector(){return null;}});
const body=makeNode('body');
const document={body,documentElement:{dataset:{}},createElement(){return makeNode();},getElementById(id){if(!nodes.has(id))nodes.set(id,makeNode(id));return nodes.get(id);}};
const chapters=Array.from({length:5},(_,i)=>({id:i+1,title:`old${i+1}`,waves:i===3?4:3,missions:[{type:'normal'}],loadout:['pistol']}));
const baseDialogue=[];
const templateGroup={position:new V3(),visible:true,children:[],clone(){return {position:new V3(),visible:true,children:[],clone:this.clone};}};
const templateMarker={position:new V3(),visible:false,children:[{},{}],clone(){return {position:new V3(),visible:false,children:[{},{}],clone:this.clone};}};
const proto={
  getStoryChapter(id){return chapters[id-1]||chapters[0];},renderStoryMenu(){this.rendered=true;},
  queueDialogue(raw){baseDialogue.push(raw);},queueStoryDialogueSequence(){this.legacySequenceCalls=(this.legacySequenceCalls||0)+1;},
  isStoryControlLocked(){return false;},updateStorySystems(){},updateCamera(){},playStoryMotion(){},
  setupStoryEnvironment(){},activateStoryMissionObjects(){},startMissionForWave(m){this.currentMission=m||this.storyChapter.missions[this.wave-1];},
  completeStoryInteraction(o){o.done=true;},finishMissionWave(){this.finishCalls=(this.finishCalls||0)+1;},completeWave(){this.completeWaveCalls=(this.completeWaveCalls||0)+1;},
  resetWorld(){this.wave=1;this.currentMission=this.storyChapter.missions[0];this.startMissionForWave(this.currentMission);},
  completeStoryChapter(){this.baseChapterComplete=(this.baseChapterComplete||0)+1;},clearStoryRuntimeState(){},
  getStoryCinematicCameraPose(target){return {position:new V3(target.x+5,3,target.z+5),quaternion:new Q(),targetPoint:new V3(target.x,target.y||1.3,target.z),label:target.cameraLabel||target.label};},
  showCenterAlert(){},markNavDirty(){},cleanupObjectiveCores(){},nextWave(){this.wave++;this.startMissionForWave(this.storyChapter.missions[this.wave-1]);}
};
const seed=Object.assign(Object.create(proto),{
  build:'61.0',runMode:'story',storyChapter:chapters[0],storyObjects:[{role:'relay',x:0,z:0,label:'relay',cameraLabel:'relay cam',group:templateGroup,marker:templateMarker}],
  camera:{position:new V3(),quaternion:new Q(),matrix:new M(),fov:72,updateProjectionMatrix(){}},viewWeapon:{visible:true},map:{size:100},player:{x:0,z:0,radius:.55},
  audio:{duckMusic(){},storyStinger(){}},storyCinematicQueue:[],storyCinematicState:null,dialogueQueue:[],dialogueActive:null,
  scene:{add(){},remove(){}},obstacles:[],enemies:[],score:0,wave:1,running:true,gameOver:false,missionCompletePending:false
});
const context=vm.createContext({window:{__game:seed,requestAnimationFrame(fn){fn();}},document,addEventListener(){},console,Math,Number,Object,Array,String,Boolean,Set,Map,setTimeout(fn){fn();}});
vm.runInContext(fs.readFileSync(new URL('../client/v62.patch.js',import.meta.url),'utf8'),context,{filename:'v62.patch.js'});

assert.equal(seed.build,'62.0');
assert.equal(chapters[0].title,'A동, 남겨진 사람');
assert.equal(chapters[4].waves,5);
assert.equal(chapters[4].missions.length,5);
assert.equal(chapters[4].missions[4].target,'shutdown');

seed.queueDialogue('격리국 관제|old line');
assert.equal(baseDialogue.length,0,'legacy dialogue was not suppressed');
seed.queueV62Dialogue('현장통제 박지현|new line');
assert.equal(baseDialogue.length,1,'v62 dialogue did not reach base queue');

seed.storyChapter=chapters[0];
seed.storyObjects=[{role:'relay',x:0,z:0,label:'relay',cameraLabel:'relay cam',group:templateGroup,marker:templateMarker},{role:'blastDoor',x:4,z:0,label:'door',cameraLabel:'door cam',group:templateGroup,marker:templateMarker,door:true}];
seed.startEpisodeSequence('opening');
assert.equal(seed.storyEpisodeSequenceActive,true);
assert.equal(seed.isStoryControlLocked(),true);
assert.equal(seed.viewWeapon.visible,false,'view weapon must be hidden during chapter sequence');
for(let i=0;i<30&&seed.storyEpisodeSequenceActive;i++)seed.updateStorySystems(1);
assert.equal(seed.storyEpisodeSequenceActive,false,'opening sequence did not finish');
assert.equal(seed.viewWeapon.visible,true,'view weapon visibility was not restored after sequence');

seed.completeStoryChapter();
assert.equal(seed.baseChapterComplete||0,0,'chapter completed before closing sequence');
for(let i=0;i<40&&seed.storyEpisodeSequenceActive;i++)seed.updateStorySystems(1);
assert.equal(seed.baseChapterComplete,1,'chapter completion did not resume after closing sequence');

seed.storyChapter=chapters[4];
seed.storyObjects=[{role:'citadelDoor',x:-14,z:12,label:'valve',group:templateGroup,marker:templateMarker,door:false}];
seed.setupStoryEnvironment();
assert.ok(seed.storyObjects.some(o=>o.role==='shutdown'),'chapter 5 shutdown console was not created');
seed.startEpisodeSequence('closing');
assert.equal(seed.storyEpisodeSequence.steps.length,7,'chapter 5 closing must include the four-step final ending');
seed.finishEpisodeSequence();

console.log('v62 runtime story sequence and script replacement tests: passed');
