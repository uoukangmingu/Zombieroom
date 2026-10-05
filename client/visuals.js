import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {buildClassicEnemy,addClassicWeaponParts} from './classic-parts.js';

// Palette and proportions deliberately match the original cartoon art.
const C={outline:0x111111,skin:0xf0c39f,hair:0x060608,shirtBlack:0x09090b,skinHighlight:0xffe1bd,
  iceBlue:0xb8d2e8,gloveBlue:0x8fb3cc,zombieSuit:0xf5f2df,zombieStripe:0xf19b24,
  runnerSuit:0x31c7e8,runnerStripe:0xd9fbff,runnerFace:0x0d4f67,
  devilRed:0x5b2a86,devilDark:0x160d2d,devilEye:0xe5b7ff,casterCore:0x78f8ff,
  tankSuit:0x5f6670,tankArmor:0x2b3038,tankStripe:0xffc13b,
  bomberSuit:0xffb13d,bomberVest:0x2b2116,bomberRed:0xff3030,
  shieldSuit:0xe9edf2,shieldPlate:0x244c7a,shieldEdge:0x9fd8ff,shoeBlack:0x0a0a0c,
  weaponDark:0x1e2329,weaponMetal:0x555d66,gunPistol:0x242a33,gunSmg:0x1f4d3a,gunShotgun:0x6b3d22,
  gunGrenade:0x3d6b2e,gunMine:0x2c3035,gunWall:0xd5a92f,gunRocket:0x8e2e26,gunRail:0x1e6f82,
  gunAccent:0x7bf7ff,gunRedAccent:0xff4b35,gunYellowAccent:0xffd45a,mineDark:0x15171a,mineMetal:0x34383e,fakeWall:0xd5c76d,trim:0x2c2415};
const D={lowBox:[1,1,1],charHead:[.72,.72,.72],charTorso:[.78,.92,.42],charArm:[.22,.76,.24],charLeg:[.28,.56,.26],charShoe:[.38,.17,.48],facePanel:[.5,.32,.026],hairCap:[.74,.20,.74],horn:[.34,.92,.34,'cone'],sphere:[.5,.5,.5,'sphere'],mine:[1.3,.18,1.3,'cylinder'],mineButton:[.6,.08,.6,'cylinder']};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const b=(x,y,z,w,h,d,color,shape='box',rx=0,ry=0,rz=0)=>({x,y,z,w,h,d,color,shape,rx,ry,rz});
const WEAPON_SHAPES={pistol:[.28,.20,.62,.10,.10,.40,.31],smg:[.32,.20,.88,.11,.10,.70,.40],shotgun:[.42,.22,1.05,.20,.13,.82,.45],grenade:[.30,.28,.38,.18,.18,.22,.22],barrel:[.42,.20,.50,.24,.08,.32,.24],wall:[.48,.34,.26,.42,.10,.20,.20],rocket:[.46,.26,1.16,.26,.20,.84,.45],railgun:[.30,.18,1.30,.09,.08,1.06,.47]};
export class VisualFactory {
  constructor(){
    this.cache=new Map();this.geometries=new Set();
    this.base={box:new THREE.BoxGeometry(1,1,1),cylinder:new THREE.CylinderGeometry(.5,.5,1,12),sphere:new THREE.IcosahedronGeometry(.5,0),cone:new THREE.ConeGeometry(.5,1,3)};
    this.lit=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});
    this.flat=new THREE.MeshBasicMaterial({vertexColors:true});
    this.outline=new THREE.MeshBasicMaterial({color:C.outline,side:THREE.BackSide});
    this.edgeMaterial=new THREE.LineBasicMaterial({color:C.outline});
    this.edgeBases={};for(const [key,geo] of Object.entries(this.base))this.edgeBases[key]=new THREE.EdgesGeometry(geo,15);
  }
  // One color mesh and one black hull per moving part; edges are omitted only at ultra quality.
  mesh(parts,lite=false,glow=false){
    const chunks=[],hulls=[],lines=[],group=new THREE.Group();
    for(const p of parts){
      const shape=p.shape || 'box',base=this.base[shape];
      const make=(extra=[0,0,0],edge=false)=>{
        const geo=(edge?this.edgeBases[shape]:base).clone();
        geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(p.x,p.y,p.z),new THREE.Quaternion().setFromEuler(new THREE.Euler(p.rx||0,p.ry||0,p.rz||0)),new THREE.Vector3(p.w+extra[0],p.h+extra[1],p.d+extra[2])));
        return geo;
      };
      const copied=make(),geo=copied.index?copied.toNonIndexed():copied;if(geo!==copied)copied.dispose();
      const count=geo.attributes.position.count,colors=new Float32Array(count*3),color=new THREE.Color(p.color);
      for(let i=0;i<count;i++){const shade=lite&&!glow?.88+.12*Math.max(0,geo.attributes.normal.getY(i)):1;colors[i*3]=color.r*shade;colors[i*3+1]=color.g*shade;colors[i*3+2]=color.b*shade;}
      geo.setAttribute('color',new THREE.BufferAttribute(colors,3));chunks.push(geo);
      if(p.stroke!==false){const extra=p.stroke || [.034,.034,.034];const h=make(extra),outline=h.index?h.toNonIndexed():h;if(outline!==h)h.dispose();hulls.push(outline);if(!lite)lines.push(make([.001,.001,.001],true));}
    }
    const merge=arr=>{const result=mergeGeometries(arr,false);arr.forEach(g=>g.dispose());this.geometries.add(result);return result;};
    const mesh=new THREE.Mesh(merge(chunks),lite||glow?this.flat:this.lit);mesh.name='color-fill';mesh.castShadow=!lite;mesh.receiveShadow=!lite;mesh.userData.shadowCast=!lite;mesh.userData.shadowReceive=!lite;group.add(mesh);
    if(hulls.length){const hull=new THREE.Mesh(merge(hulls),this.outline);hull.name='cartoon-outline';hull.userData.outline=true;group.add(hull);}
    if(lines.length){const edges=new THREE.LineSegments(merge(lines),this.edgeMaterial);edges.name='cartoon-edges';group.add(edges);}
    return group;
  }
  group(parent,name,x=0,y=0,z=0){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;}
  classicBuilder(){
    return {geos:Object.fromEntries(Object.keys(D).map(k=>[k,k])),materials:C,
      addPart:(parent,geo,color,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{
        const dims=D[geo],part=new THREE.Group();part.position.set(x,y,z);part.rotation.set(rx,ry,rz);
        part.userData.classicPart={...b(0,0,0,dims[0]*sx,dims[1]*sy,dims[2]*sz,color,dims[3]||'box'),geo,stroke:dims.slice(0,3).map(v=>v*.045)};parent.add(part);return part;
      }
    };
  }
  adopt(parent,child){child.position.sub(parent.position);parent.add(child);}
  compile(group,lite){
    const parts=[];for(const child of [...group.children]){
      const p=child.userData.classicPart;
      if(p){parts.push({...p,x:child.position.x,y:child.position.y,z:child.position.z,rx:child.rotation.x,ry:child.rotation.y,rz:child.rotation.z});group.remove(child);}
      else this.compile(child,lite);
    }
    if(parts.length)group.add(this.mesh(parts,lite));
  }
  enemy(type='zombie',lite=false){
    const key=`enemy:${type}:${lite}`;if(!this.cache.has(key))this.cache.set(key,this.buildEnemy(type,lite));
    const g=this.cache.get(key).clone(true);g.userData={type,rigged:true,lite};
    for(const name of ['torso','head','leftArm','rightArm','leftElbow','rightElbow','leftLeg','rightLeg','leftKnee','rightKnee','shield','core','warning','castOrb'])g.userData[name]=g.getObjectByName(name);
    return g;
  }
  buildEnemy(type,lite){
    const builder=this.classicBuilder(),g=buildClassicEnemy.call(builder,type),original=[...g.children];
    const headY=type==='tank'?1.68:type==='devil'?1.62:1.58;
    const head=this.group(g,'head',0,headY,0),torso=this.group(g,'torso',0,type==='tank'?.88:type==='devil'||type==='bomber'?.82:.84,0);
    for(const side of ['left','right']){
      const arm=g.userData[side+'Arm'];arm.name=side+'Arm';this.group(arm,side+'Elbow',0,-.37,0);
      const part=g.userData[side+'Leg'],leg=this.group(g,side+'Leg',part.position.x,.56,part.position.z);this.adopt(leg,part);this.group(leg,side+'Knee',0,-.29,0);
    }
    let shield,warning;
    if(type==='shield')shield=this.group(g,'shield',0,.92,.62);
    if(type==='bomber')warning=this.group(torso,'warning',0,.16,.595);
    for(const part of original){
      const p=part.userData.classicPart;if(!p || part.parent!==g)continue;
      if(p.geo==='charHead'||p.geo==='hairCap'||p.geo==='horn'||(p.geo==='facePanel'&&part.position.y>1.3)||(type==='devil'&&part.position.y>1.5)){this.adopt(head,part);continue;}
      if(p.geo==='charShoe'){this.adopt(g.getObjectByName(part.position.x<0?'leftLeg':'rightLeg'),part);continue;}
      if(shield && [C.shieldPlate,C.shieldEdge].includes(p.color)){this.adopt(shield,part);continue;}
      if(warning && p.color===C.bomberRed){part.position.sub(torso.position).sub(warning.position);warning.add(part);continue;}
      this.adopt(torso,part);
    }
    const add=(parent,parts)=>parent.add(this.mesh(parts,lite));
    // Two or three small accents at most; no helmets, respirators, backpacks or new silhouettes.
    if(['zombie','runner','tank','shield'].includes(type))builder.addPart(head,'lowBox',0xf5fbff,-.09,-.005,type==='tank'?.431:.393,.13,.017,.004).userData.classicPart.stroke=false;
    if(type==='zombie')builder.addPart(torso,'lowBox',C.zombieStripe,0,-.23,.219,.022,.18,.015);
    if(type==='runner')for(const side of ['left','right'])builder.addPart(g.getObjectByName(side+'Leg'),'lowBox',C.runnerStripe,0,-.17,.14,.17,.035,.018);
    if(type==='tank')for(const x of [-.43,.43])builder.addPart(torso,'lowBox',C.weaponMetal,x,.09,.596,.043,.043,.015);
    if(type==='devil'){
      const core=this.group(torso,'core',0,.01,.26);add(core,[b(0,0,0,.12,.12,.035,C.casterCore,'box',0,0,Math.PI/4)]);
      const orb=this.group(g.getObjectByName('rightElbow'),'castOrb',0,-.35,.1);orb.add(this.mesh([b(0,0,0,.3,.3,.3,C.casterCore,'sphere')],true,true));orb.visible=false;
    }
    if(shield){
      for(const x of [-.44,.44])builder.addPart(shield,'lowBox',C.shieldEdge,x,-.31,.069,.035,.035,.014);
      const arm=g.getObjectByName('leftArm');shield.position.sub(arm.position);arm.add(shield);
    }
    this.compile(g,lite);g.userData={};return g;
  }
  weapon(id,lite=false){
    const key=`weapon:${id}:${lite}`;if(!this.cache.has(key))this.cache.set(key,this.buildWeapon(id,lite));
    const g=this.cache.get(key).clone(true);g.userData={id};for(const name of ['magazine','slide','pump','core','muzzle'])g.userData[name]=g.getObjectByName(name);return g;
  }
  buildWeapon(id,lite){
    const g=new THREE.Group(),builder=this.classicBuilder(),p=WEAPON_SHAPES[id] || WEAPON_SHAPES.pistol;
    const body={pistol:C.gunPistol,smg:C.gunSmg,shotgun:C.gunShotgun,grenade:C.gunGrenade,barrel:C.gunMine,wall:C.gunWall,rocket:C.gunRocket,railgun:C.gunRail}[id];
    const accent=['pistol','shotgun','grenade','wall'].includes(id)?C.gunYellowAccent:['barrel','rocket'].includes(id)?C.gunRedAccent:C.gunAccent;
    const theme={body,accent,barrel:id==='grenade'?C.gunRedAccent:id==='barrel'?C.mineMetal:id==='wall'?C.fakeWall:id==='railgun'?C.gunAccent:C.weaponMetal};
    const main=builder.addPart(g,'lowBox',body,0,0,0,p[0],p[1],p[2]);
    const barrel=builder.addPart(g,'lowBox',theme.barrel,0,.03,-p[6],p[3],p[4],p[5]);
    const bodyFront=-p[2]/2,barrelFront=-p[6]-p[5]/2;
    if(['pistol','smg','shotgun','rocket','railgun'].includes(id)){barrel.position.z=(bodyFront+barrelFront)/2;barrel.userData.classicPart.d=bodyFront-barrelFront;}
    const parts=this.group(g,'details');addClassicWeaponParts.call(builder,parts,{id},theme);
    const detailParts=[...parts.children];
    if(id==='grenade'){g.remove(barrel);parts.remove(detailParts[0]);main.position.set(0,.02,-.28);Object.assign(main.userData.classicPart,{w:.30,h:.34,d:.30});}
    const pivot=(part,name)=>{const group=this.group(parts,name,...part.position);part.position.set(0,0,0);group.add(part);return group;};
    if(id==='pistol'){
      const slide=this.group(g,'slide');slide.add(main);if(detailParts[0])slide.add(detailParts[0]);
      const mag=this.group(parts,'magazine',.03,-.29,.10);mag.userData.restY=-.29;
      builder.addPart(mag,'lowBox',C.weaponDark,0,0,0,.15,.05,.19);
      builder.addPart(slide,'lowBox',C.weaponMetal,.144,.035,.07,.012,.04,.09);
    }
    if(id==='smg'){const mag=pivot(detailParts[0],'magazine');mag.userData.restY=mag.position.y;builder.addPart(mag,'lowBox',C.weaponDark,.074,-.035,0,.01,.02,.15);}
    if(id==='shotgun'){const pump=pivot(detailParts[0],'pump');pump.userData.restZ=pump.position.z;for(const z of [-.14,0,.14])builder.addPart(pump,'lowBox',C.weaponDark,.143,0,z,.008,.065,.02);}
    if(id==='railgun'){const core=this.group(parts,'core');for(const part of detailParts.filter(p=>p.userData.classicPart.color===C.gunAccent))core.add(part);}
    if(id==='rocket'){builder.addPart(parts,'lowBox',C.weaponDark,0,.095,-.881,.16,.02,.05);}
    if(id==='wall'){builder.addPart(parts,'lowBox',C.gunYellowAccent,0,.02,-.297,.20,.026,.012);}
    if(id==='grenade')builder.addPart(parts,'lowBox',C.weaponDark,0,.285,-.28,.12,.018,.04);
    if(id==='barrel')builder.addPart(parts,'lowBox',C.gunYellowAccent,0,.158,-.38,.11,.012,.07);
    this.group(g,'muzzle',0,.03,-p[6]-p[5]/2-.015);
    this.compile(g,lite);return g;
  }
  dispose(){for(const g of this.geometries)g.dispose();for(const g of [...Object.values(this.base),...Object.values(this.edgeBases)])g.dispose();this.lit.dispose();this.flat.dispose();this.outline.dispose();this.edgeMaterial.dispose();this.cache.clear();}
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
  if(e.type==='bomber'){lean=.16+(warning?.045:0);armL=-.72+s*.10*walk;armR=-.86-s*.12*walk;elbowL=-.72;elbowR=-.57;leg=.48*s*walk;bob+=Math.abs(c)*.032*walk;sway=(warning?Math.sin(time*22)*.026:0);u.torso.scale.x=1+.025*Math.sin(time*(warning?12:5));if(u.warning)u.warning.scale.setScalar(warning?1+.12*Math.sin(time*15):1);}
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
  if(u.pump)u.pump.position.z=u.pump.userData.restZ+k*.10;
  if(u.magazine){u.magazine.position.y=u.magazine.userData.restY-r*.34;u.magazine.rotation.x=r*.15;}
  if(u.core)u.core.scale.y=.85+.15*Math.sin(time*3)+k*.35;
}
