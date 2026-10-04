import {test} from 'node:test';
import assert from 'node:assert/strict';
import {AudioBus} from '../client/audio.js';

class Param {
  constructor(value=1){this.value=value;}
  setValueAtTime(v){this.value=v;}
  setTargetAtTime(v){this.value=v;}
  exponentialRampToValueAtTime(v){this.value=v;}
  linearRampToValueAtTime(v){this.value=v;}
  cancelScheduledValues(){}
}
class Node {
  constructor(kind){this.kind=kind;this.edges=[];for(const p of ['gain','frequency','pan','delayTime','threshold','knee','ratio','attack','release'])this[p]=new Param();}
  connect(to){assert.ok(to,'A missing audio bus must never silently break output');this.edges.push(to);return to;}
  disconnect(){this.edges=[];}
  start(){}
  stop(){this.stopped=true;}
}
class Context {
  constructor(){this.state='running';this.currentTime=1;this.sampleRate=48000;this.destination=new Node('output');this.nodes=[];}
  node(kind){const n=new Node(kind);this.nodes.push(n);return n;}
  createGain(){return this.node('gain');}
  createDynamicsCompressor(){return this.node('limiter');}
  createBiquadFilter(){return this.node('filter');}
  createDelay(){return this.node('delay');}
  createStereoPanner(){return this.node('panner');}
  createOscillator(){return this.node('oscillator');}
  createBufferSource(){return this.node('buffer');}
  createBuffer(channels,len){const data=new Float32Array(len);return {getChannelData:()=>data};}
  async resume(){if(this.rejectResume)throw Error('blocked');this.state='running';}
}
const reachable=(from,to,seen=new Set())=>from===to||(!seen.has(from)&&seen.add(from)&&from.edges.some(n=>reachable(n,to,seen)));

test('audio first unlock connects every sound family to output',async()=>{
 const ctx=new Context(),a=new AudioBus({contextFactory:()=>ctx});assert.equal(await a.unlock(),true);
 for(const key of ['sfxGain','weaponGain','impactGain','cueGain','enemyGain','bgmGain','ambienceGain'])assert.ok(reachable(a[key],ctx.destination),key);
 const count=ctx.nodes.length;await a.unlock();assert.equal(ctx.nodes.length,count,'Repeated gestures must reuse the graph');a.stopAll();
});
test('failed graph creation rolls back and can recover on the next gesture',async()=>{
 const ctx=new Context(),make=ctx.createDelay.bind(ctx);let once=true;
 ctx.createDelay=()=>{if(once){once=false;throw Error('temporary failure');}return make();};
 const a=new AudioBus({contextFactory:()=>ctx});assert.equal(await a.unlock(),false);assert.equal(a.graphReady,false);
 assert.ok(ctx.nodes.every(n=>!n.edges.length));assert.equal(await a.unlock(),true);assert.ok(reachable(a.weaponGain,ctx.destination));a.stopAll();
});
test('blocked playback recovers and a closed context is recreated',async()=>{
 let ctx=new Context();ctx.state='suspended';ctx.rejectResume=true;
 const a=new AudioBus({contextFactory:()=>ctx});assert.equal(await a.unlock(),false);assert.equal(a.enabled,false);
 ctx.rejectResume=false;assert.equal(await a.unlock(),true);const old=ctx;old.state='closed';ctx=new Context();assert.equal(await a.unlock(),true);assert.notEqual(a.ctx,old);a.stopAll();
});
test('music, ambience and effects remain independent including initial mute',async()=>{
 const ctx=new Context(),a=new AudioBus({contextFactory:()=>ctx});a.setVolumes({master:0,sfx:.4,bgm:0,ambience:.6});await a.unlock();
 assert.equal(a.masterGain.gain.value,0);assert.equal(a.bgmGain.gain.value,0);assert.ok(a.ambienceGain.gain.value>0);
 a.setVolumes({sfx:0,bgm:.7});for(const key of ['sfxGain','weaponGain','impactGain','cueGain','enemyGain'])assert.equal(a[key].gain.value,0);
 assert.ok(a.bgmGain.gain.value>0);a.setMix('night');assert.equal(a.volumes.master,0);assert.equal(a.limiter.threshold.value,-8);a.stopAll();
});
test('positional sound follows facing, distance and wall occlusion',async()=>{
 const ctx=new Context(),a=new AudioBus({contextFactory:()=>ctx});await a.unlock();
 const route=(x,z,blocked=false)=>{const output=ctx.createGain();a.at(x,z,()=>a.route(output,a.enemyGain),blocked);return [output.edges[0].gain.value,output.edges[0].edges[0].frequency.value,output.edges[0].edges[0].edges[0].pan.value];};
 a.setListener(0,0,0);const left=route(-4,0),right=route(4,0),far=route(30,0),wall=route(4,0,true);
 assert.ok(left[2]<0&&right[2]>0);assert.ok(far[0]<right[0]);assert.ok(wall[0]<right[0]&&wall[1]<right[1]);
 a.setListener(0,0,Math.PI);assert.ok(route(4,0)[2]<0);a.stopAll();
});
test('stopping a run cancels delayed sounds and releases all transient voices',async()=>{
 const ctx=new Context(),a=new AudioBus({contextFactory:()=>ctx});await a.unlock();
 for(let i=0;i<160;i++)a.beep();assert.ok(a.voices.size<=128);a.shoot('shotgun');a.cue('extracted');assert.ok(a.timers.size>0);
 a.stopAll();assert.equal(a.voices.size,0);assert.equal(a.timers.size,0);assert.equal(a.ambient,null);assert.equal(a.bgm,null);
});
