import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const C={dark:0x17232b,metal:0x677a80,edge:0xb2c2bc,ivory:0xc6c7ae,olive:0x4c6255,orange:0xe58c37,red:0xd45139,teal:0x399a98,cyan:0x7feada,navy:0x344d64,purple:0x59486e,black:0x0c151c};
const ENEMY_COLORS={zombie:[C.ivory,C.olive,C.orange],runner:[C.teal,C.dark,C.ivory],tank:[0x59615f,C.dark,0xe9b44d],devil:[C.purple,0x251e39,C.cyan],bomber:[C.orange,C.dark,C.red],shield:[C.navy,C.dark,0x99b5ba]};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const piece=(x,y,z,w,h,d,color,shape='box',rx=0,ry=0,rz=0)=>({x,y,z,w,h,d,color,shape,rx,ry,rz});
const b=piece;
export class VisualFactory {
  constructor(){
    this.cache=new Map();this.geometries=new Set();
    this.base={box:new THREE.BoxGeometry(1,1,1),bevel:new RoundedBoxGeometry(1,1,1,1,.075),cylinder:new THREE.CylinderGeometry(.5,.5,1,10),sphere:new THREE.IcosahedronGeometry(.5,1),cone:new THREE.ConeGeometry(.5,1,5)};
    this.lit=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.72,metalness:.12,flatShading:true});
    this.flat=new THREE.MeshBasicMaterial({vertexColors:true});
    this.glows=new Map();
  }
  mesh(parts,lite=false,glow=false){
    const chunks=[];
    for(const p of parts){
      const copy=this.base[p.shape || 'box'].clone(),geo=copy.index?copy.toNonIndexed():copy;
      if(geo!==copy)copy.dispose();
      geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(p.x,p.y,p.z),new THREE.Quaternion().setFromEuler(new THREE.Euler(p.rx||0,p.ry||0,p.rz||0)),new THREE.Vector3(p.w,p.h,p.d)));
      const count=geo.attributes.position.count,colors=new Float32Array(count*3),color=new THREE.Color(p.color);
      for(let i=0;i<count;i++){const shade=lite&&!glow?.79+.21*Math.max(0,geo.attributes.normal.getY(i)):.96;colors[i*3]=color.r*shade;colors[i*3+1]=color.g*shade;colors[i*3+2]=color.b*shade;}
      geo.setAttribute('color',new THREE.BufferAttribute(colors,3));chunks.push(geo);
    }
    const geometry=mergeGeometries(chunks,false);for(const g of chunks)g.dispose();this.geometries.add(geometry);
    const mesh=new THREE.Mesh(geometry,lite||glow?this.flat:this.lit);mesh.castShadow=!lite;mesh.receiveShadow=!lite;return mesh;
  }
  group(parent,name,x=0,y=0,z=0){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;}
  enemy(type='zombie',lite=false){
    const key=`enemy:${type}:${lite}`;
    if(!this.cache.has(key))this.cache.set(key,this.buildEnemy(type,lite));
    const g=this.cache.get(key).clone(true);g.userData={type,rigged:true,lite};
    for(const name of ['torso','head','leftArm','rightArm','leftElbow','rightElbow','leftLeg','rightLeg','leftKnee','rightKnee','shield','core','warning','castOrb'])g.userData[name]=g.getObjectByName(name);
    return g;
  }
  buildEnemy(type,lite){
    const g=new THREE.Group(),[suit,under,accent]=ENEMY_COLORS[type] || ENEMY_COLORS.zombie;
    const heavy=type==='tank',runner=type==='runner',devil=type==='devil',bomber=type==='bomber',shield=type==='shield';
    const width=heavy?1.04:runner?.59:.76,shoulder=heavy?.68:.48;
    const torso=this.group(g,'torso',0,.89,0),body=[b(0,0,0,width,.68,.43,suit,'bevel'),b(0,-.29,.015,width+.02,.12,.47,under),b(0,.06,.242,width*.70,.34,.06,under,'bevel')];
    if(type==='zombie')body.push(b(-.22,.16,.276,.12,.43,.035,accent,'box',0,0,-.2),b(.17,-.07,.282,.24,.09,.028,suit,'box',0,0,.35),b(0,.20,-.26,.38,.35,.17,under));
    if(runner)body.push(b(0,.22,-.25,.42,.25,.22,under,'bevel'),b(-.24,.01,.275,.08,.56,.05,accent,'box',0,0,-.3),b(.22,.05,.275,.07,.50,.05,accent,'box',0,0,.3));
    if(heavy){body.push(b(0,.12,.31,1.08,.48,.16,under,'bevel'),b(0,.36,.40,.92,.09,.035,accent),b(0,.12,-.32,.76,.82,.30,under,'bevel'));for(const x of [-.26,0,.26])body.push(b(x,.18,-.51,.09,.60,.05,C.metal));}
    if(devil){for(const x of [-.25,.25])body.push(b(x,-.38,0,.35,.60,.48,under,'box',0,0,x*.30));body.push(b(0,.22,.26,.34,.18,.1,accent,'bevel'),b(0,.03,.29,.23,.27,.12,under,'bevel'));}
    if(bomber){for(const x of [-.25,.25])body.push(b(x,.15,-.32,.25,.77,.25,0x829783,'cylinder'),b(x,-.13,.28,.13,.56,.11,accent,'bevel'));body.push(b(0,.15,.31,.31,.22,.09,under,'bevel'),b(0,-.08,.32,.28,.035,.02,C.edge));}
    if(shield)body.push(b(0,.13,.29,.57,.44,.14,C.navy,'bevel'),b(0,.21,.373,.32,.04,.02,accent),b(0,.1,-.28,.57,.51,.15,under,'bevel'));
    torso.add(this.mesh(body,lite));
    const head=this.group(g,'head',0,heavy?1.62:1.59,runner?.10:0);
    const headParts=[b(0,0,0,.68,.64,.64,suit,'bevel'),b(0,.02,.338,.56,.29,.045,under,'bevel'),b(0,.31,-.02,.72,.13,.70,under,'bevel')];
    if(devil){headParts.push(b(0,-.15,.36,.32,.12,.07,under));for(const side of [-1,1])headParts.push(b(side*.30,.54,-.08,.14,.65,.16,accent,'cone',0,0,-side*.32),b(side*.38,.28,.02,.17,.30,.3,under,'bevel'));}
    else {headParts.push(b(0,-.15,.376,heavy?.32:.25,.17,.12,C.dark,'bevel'));for(const side of [-1,1])headParts.push(b(side*.27,-.14,.33,.13,.14,.16,C.metal,'cylinder',Math.PI/2));}
    if(heavy)headParts.push(b(0,.12,.382,.70,.09,.09,accent),b(0,-.18,.46,.04,.15,.03,C.edge));
    if(shield)headParts.push(b(0,.08,.381,.58,.04,.015,accent),b(0,.19,.35,.68,.08,.15,under));
    if(!lite){headParts.push(b(-.13,.33,.08,.05,.035,.45,accent),b(.20,.31,-.2,.11,.04,.13,C.metal));}
    const eyes=[b(-.14,.04,.366,.10,.035,.025,devil?C.cyan:runner?0xffdf90:0xd4e3b1),b(.14,.04,.366,.10,.035,.025,devil?C.cyan:0xe2b875)];
    head.add(this.mesh(lite?[...headParts,...eyes]:headParts,lite));if(!lite)head.add(this.mesh(eyes,true,true));
    for(const side of [-1,1]){
      const prefix=side<0?'left':'right',arm=this.group(g,prefix+'Arm',side*shoulder,1.20,.035);
      const upper=[b(0,-.18,0,heavy?.35:.22,.38,heavy?.40:.25,suit,'bevel'),b(0,.02,0,heavy?.48:.30,heavy?.28:.16,heavy?.53:.35,under,'bevel')];
      if(heavy)upper.push(b(side*.05,.075,.28,.34,.055,.035,accent));
      if(!lite)arm.add(this.mesh(upper,false));
      const elbow=this.group(arm,prefix+'Elbow',0,-.37,0);
      const lower=[b(0,-.16,.01,heavy?.31:.19,.32,heavy?.35:.22,suit,'bevel'),b(0,-.33,.05,heavy?.35:.22,heavy?.23:.16,heavy?.38:.24,under,'bevel')];
      if(runner||devil){for(let i=0;i<(lite?2:3);i++)lower.push(b(-.07+i*.07,-.43,.13,.025,.17,.06,devil?C.cyan:C.metal,'cone',.18));}
      if(!lite){lower.push(b(0,-.18,.14,.16,.09,.04,accent));elbow.add(this.mesh(lower,false));}else arm.add(this.mesh([...upper,...lower.map(p=>({...p,y:p.y-.37}))],true));
      const leg=this.group(g,prefix+'Leg',side*(heavy?.26:.19),.61,0),thigh=[b(0,-.15,0,heavy?.32:.24,.32,heavy?.34:.25,suit,'bevel')];
      if(heavy||shield)thigh.push(b(0,-.17,.17,.24,.22,.10,under,'bevel'));
      const knee=this.group(leg,prefix+'Knee',0,-.29,0),shin=[b(0,-.12,.01,heavy?.28:.20,.27,.25,suit,'bevel'),b(0,-.24,.075,heavy?.37:.29,.16,heavy?.48:.38,C.black,'bevel')];
      if(lite)leg.add(this.mesh([...thigh,...shin.map(p=>({...p,y:p.y-.29}))],true));else{leg.add(this.mesh(thigh,false));knee.add(this.mesh(shin,false));}
    }
    if(shield){const plate=this.group(g.getObjectByName('leftElbow'),'shield',.37,-.04,.27);const parts=[b(0,0,0,1.03,1.08,.11,C.navy,'bevel'),b(0,.46,.075,1.10,.085,.06,accent),b(0,-.46,.075,1.1,.085,.06,accent),b(0,.19,.066,.51,.17,.025,C.black)];
      for(const x of [-.5,.5])parts.push(b(x,0,.08,.075,1,.05,C.edge));parts.push(b(0,-.15,.071,.45,.12,.03,C.ivory));plate.add(this.mesh(parts,lite));}
    if(bomber){const warning=this.group(torso,'warning',0,.18,.377);warning.add(this.mesh([b(0,0,0,.17,.07,.015,0xff5544)],true,true));}
    if(devil){const core=this.group(torso,'core',0,0,.37);core.add(this.mesh([b(0,0,0,.22,.29,.12,C.cyan,'sphere')],true,true));const orb=this.group(g.getObjectByName('rightElbow'),'castOrb',0,-.45,.10);orb.add(this.mesh([b(0,0,0,.38,.38,.38,C.cyan,'sphere')],true,true));orb.visible=false;}
    return g;
  }
  weapon(id,lite=false){
    const key=`weapon:${id}:${lite}`;if(!this.cache.has(key))this.cache.set(key,this.buildWeapon(id,lite));
    const g=this.cache.get(key).clone(true);g.userData={id};for(const name of ['magazine','slide','pump','core','muzzle'])g.userData[name]=g.getObjectByName(name);return g;
  }
  buildWeapon(id,lite){
    const g=new THREE.Group(),metal=C.metal,dark=C.dark,edge=C.edge;
    const palettes={pistol:0x596569,smg:0x47645b,shotgun:0x72523b,rocket:0x716e48,railgun:0x3d6470};const paint=palettes[id]||C.olive;
    const parts=[],end={pistol:-.62,smg:-.94,shotgun:-1.16,rocket:-1.12,railgun:-1.20,grenade:-.2,barrel:-.25,wall:-.15}[id] || -.8;
    const firearm=['pistol','smg','shotgun','railgun','rocket'].includes(id);
    if(firearm){
      parts.push(b(0,0,0,id==='pistol'?.19:.28,id==='rocket'?.32:.19,id==='pistol'?.51:.68,paint,'bevel'),b(.015,-.19,.18,.15,.35,.20,dark,'bevel',-.18),b(0,.09,-.10,.21,.035,.45,metal));
      parts.push(b(0,.01,(end-.24)/2,id==='rocket'?.36:.085,Math.abs(end)-.24,id==='rocket'?.36:.085,metal,'cylinder',Math.PI/2),b(0,.01,end,id==='rocket'?.39:.13,.075,id==='rocket'?.39:.13,dark,'cylinder',Math.PI/2));
      parts.push(b(-.065,.135,-.04,.034,.07,.07,dark),b(.065,.135,-.04,.034,.07,.07,dark),b(0,.115,end+.13,.045,.08,.06,dark));
      if(id!=='pistol')parts.push(b(0,-.03,.41,.21,.21,.30,dark,'bevel'),b(0,-.03,.59,.26,.24,.08,edge));
      if(!lite){for(let i=0;i<4;i++)parts.push(b(.145,.025,-.04-i*.085,.012,.075,.035,dark));parts.push(b(.149,-.018,.17,.015,.045,.11,C.orange),b(-.145,0,.18,.025,.025,.10,edge));}
      if(id==='pistol'){
        const slide=this.group(g,'slide');slide.add(this.mesh([b(0,.057,-.065,.22,.15,.58,metal,'bevel'),b(.112,.076,-.02,.006,.07,.13,dark),b(0,.143,-.26,.025,.018,.026,C.orange)],lite));
      }
      if(['pistol','smg','railgun'].includes(id)){
        const mag=this.group(g,'magazine',0,-.23,id==='pistol'?.18:0);mag.add(this.mesh([b(0,-.06,0,.14,id==='pistol'?.20:.32,.19,dark,'bevel'),b(0,-.22,0,.17,.05,.21,metal)],lite));
      }
      if(id==='shotgun'){
        parts.push(b(0,-.095,-.54,.078,.70,.078,dark,'cylinder',Math.PI/2));const pump=this.group(g,'pump',0,-.05,-.52);const grip=[b(0,0,0,.22,.18,.31,paint,'bevel')];for(let i=0;i<4;i++)grip.push(b(0,.08,-.11+i*.065,.23,.045,.025,dark));pump.add(this.mesh(grip,lite));
      }
      if(id==='rocket')parts.push(b(-.21,.18,-.4,.09,.17,.23,dark,'bevel'),b(0,.20,-.15,.30,.06,.19,C.orange),b(0,-.17,-.32,.18,.24,.19,dark,'bevel'),b(0,.01,.63,.40,.13,.40,metal,'cylinder',Math.PI/2));
      if(id==='railgun'){
        for(const x of [-.17,.17])parts.push(b(x,.06,-.58,.06,.12,.83,dark,'bevel'));
        const core=this.group(g,'core');const coils=[];for(let i=0;i<4;i++)coils.push(b(0,.08,-.30-i*.17,.29,.075,.035,C.cyan));core.add(this.mesh(coils,true,true));
      }
    }else if(id==='grenade'){
      parts.push(b(0,0,-.15,.28,.40,.28,0x5e7349,'sphere'),b(0,.20,-.15,.14,.13,.14,dark,'cylinder'),b(.08,.18,-.13,.055,.20,.22,metal,'bevel',0,0,.25));for(let i=0;i<3;i++)parts.push(b(0,-.1+i*.1,-.15,.29,.026,.29,dark,'cylinder'));
    }else if(id==='barrel'){
      parts.push(b(0,-.04,-.20,.49,.17,.49,dark,'cylinder'),b(0,.065,-.20,.20,.09,.20,C.red,'cylinder'),b(0,.01,-.20,.40,.08,.10,C.orange));
    }else if(id==='wall'){
      parts.push(b(0,0,-.15,.46,.41,.08,dark,'bevel'),b(0,.025,-.102,.34,.27,.022,0x235454),b(.15,-.145,-.1,.03,.03,.02,C.cyan),b(0,-.25,-.16,.13,.20,.1,metal));for(let i=0;i<3;i++)parts.push(b(0,-.065+i*.065,-.085,.23,.014,.01,C.cyan));
    }
    g.add(this.mesh(parts,lite));this.group(g,'muzzle',0,.01,end-.05);return g;
  }
  dispose(){for(const g of this.geometries)g.dispose();for(const g of Object.values(this.base))g.dispose();this.lit.dispose();this.flat.dispose();this.cache.clear();}
}

export function animateEnemy(e,time=0,warning=false){
  const root=e.mesh,u=root?.userData;if(!u?.rigged)return;
  const walk=clamp((e.walkSpeed || 0)/Math.max(.1,e.speed || 1),0,1.3),phase=e.walkPhase||0,s=Math.sin(phase),c=Math.cos(phase),idle=Math.sin(time*2.3+(e.id||0));
  const pulse=(remaining,max)=>remaining>0?Math.sin(clamp(1-remaining/Math.max(.001,max),0,1)*Math.PI):0;
  const atk=pulse(e.attackAnim,e.attackMax || .4),cast=pulse(e.castAnim,e.castMax || .55),hit=pulse(e.hitTimer,e.hitMax || .16);
  let lean=0,sway=0,bob=.008*idle,armL=-.24+s*.22*walk,armR=-.30-c*.18*walk,elbowL=-.10,elbowR=-.12,leg=.30*s*walk,headTilt=.04*idle;
  if(e.type==='zombie'){lean=.05;sway=.045*s*walk;armL-=atk*1.5;armR-=atk*.85;headTilt+=.07;bob+=Math.max(0,s)*.025*walk;}
  if(e.type==='runner'){lean=.22+atk*.10;armL=-.30+s*.75*walk-atk*1.4;armR=-.4-s*.72*walk-atk*.55;elbowL=elbowR=-.72;leg=.70*s*walk;bob+=Math.abs(c)*.045*walk;headTilt=-.05;}
  if(e.type==='tank'){lean=.045+atk*.16;armL=-.1+s*.16*walk-atk*2.0;armR=-.1-s*.16*walk-atk*2.0;leg=.22*s*walk;sway=.025*s*walk;bob+=Math.abs(s)*.025*walk;elbowL=elbowR=-atk*.38;}
  if(e.type==='devil'){lean=-.025;armL=-.28-c*.07-cast*1.05;armR=-.28+s*.07-cast*1.55;elbowL=-.34-cast*.45;elbowR=-.32-cast*.30;leg=.16*s*walk;bob=.025+.023*idle;headTilt=.055*idle;if(u.core)u.core.rotation.y=time*.8;if(u.castOrb){u.castOrb.visible=cast>.02;u.castOrb.scale.setScalar(.3+cast*1.2);u.castOrb.rotation.y=time*3;}}
  if(e.type==='bomber'){lean=.16+(warning?.045:0);armL=-.72+s*.10*walk;armR=-.86-s*.12*walk;elbowL=-.72;elbowR=-.57;leg=.48*s*walk;bob+=Math.abs(c)*.032*walk;sway=(warning?Math.sin(time*22)*.026:0);u.torso.scale.x=1+.025*Math.sin(time*(warning?12:5));if(u.warning)u.warning.scale.setScalar(warning?1.15+.25*Math.sin(time*15):.8);}
  if(e.type==='shield'){lean=.05+atk*.14;armL=-.12-atk*.55;armR=-.20-s*.30*walk-atk*1.1;elbowL=-.12;elbowR=-.28;leg=.24*s*walk;sway=-.035;headTilt=.04;if(u.shield)u.shield.rotation.y=.08-atk*.12;}
  root.position.set(e.x,Math.max(-.015,bob),e.z);root.rotation.x=lean-hit*(e.hitLean || .16);root.rotation.z=sway+hit*(e.hitSide || 0)*.10;
  u.head.rotation.set(-lean*.45,.035*idle,headTilt);
  u.leftArm.rotation.set(armL,0,e.type==='devil'?-.18-cast*.35:-.035);u.rightArm.rotation.set(armR,0,e.type==='devil'?.18+cast*.3:.035);
  u.leftElbow.rotation.x=elbowL;u.rightElbow.rotation.x=elbowR;
  u.leftLeg.rotation.x=leg;u.rightLeg.rotation.x=-leg*(e.type==='zombie'?.64:1);
  u.leftKnee.rotation.x=Math.max(0,-s)*walk*(e.type==='runner'?.65:.25);u.rightKnee.rotation.x=Math.max(0,s)*walk*(e.type==='runner'?.65:.25);
}

export function animateWeapon(model,{kick=0,reload=0,time=0}={}){
  const u=model?.userData;if(!u)return;const k=clamp(kick*5,0,1),r=Math.sin(clamp(reload,0,1)*Math.PI);
  if(u.slide)u.slide.position.z=k*.10;
  if(u.pump)u.pump.position.z=-.52+k*.10;
  if(u.magazine){u.magazine.position.y=-.23-r*.34;u.magazine.rotation.x=r*.15;}
  if(u.core)u.core.scale.y=.85+.15*Math.sin(time*3)+k*.35;
}
