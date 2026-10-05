const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hash=(n)=>{let x=Math.imul((Number(n)||1)^0x9e3779b9,0x85ebca6b);x^=x>>>13;x=Math.imul(x,0xc2b2ae35);return ((x^(x>>>16))>>>0)/4294967296;};
export const PERSONALITIES=Object.freeze({
  pursuer:{label:'집요한 추격자',spread:2.3,lead:.10,sway:.09,space:.55,pace:.04,fear:.30},
  flanker:{label:'측면 사냥꾼',spread:6.2,lead:.30,sway:.12,space:1.15,pace:.09,fear:.8},
  interceptor:{label:'앞길 차단자',spread:4.1,lead:.85,sway:.08,space:.85,pace:.06,fear:.65},
  erratic:{label:'변칙 돌진자',spread:4.8,lead:.20,sway:.43,space:.70,pace:.20,fear:.15},
  cautious:{label:'신중한 포위자',spread:5.3,lead:.45,sway:.14,space:1.25,pace:.08,fear:1.1}
});
export function makePersonality(seed=1,type='zombie') {
  const pools={tank:['pursuer','pursuer','interceptor','cautious'],runner:['flanker','interceptor','erratic','pursuer'],bomber:['erratic','flanker','pursuer','interceptor'],shield:['cautious','interceptor','pursuer','flanker'],devil:['cautious','flanker','interceptor']};
  const pool=pools[type]||Object.keys(PERSONALITIES),style=pool[Math.floor(hash(seed*7+13)*pool.length)];
  return {style,...PERSONALITIES[style],seed,side:hash(seed*5+2)<.5?-1:1,phase:hash(seed+19)*Math.PI*2,
    angle:hash(seed*3+11)*Math.PI*2,speed:.86+hash(seed*11+1)*.28,voicePitch:.90+hash(seed*13+17)*.22,
    think:.12+hash(seed*17+3)*.10,reach:.92+hash(seed+37)*.18};
}
export function personalityOf(enemy) {
  return enemy.personality ||= makePersonality(enemy.personalitySeed ?? enemy.id,enemy.type);
}
export function approachPoint(enemy,target,time=0,clear=()=>true) {
  const p=personalityOf(enemy),dx=target.x-enemy.x,dz=target.z-enemy.z,d=Math.hypot(dx,dz)||1;
  const near=clamp((8-d)/5,0,1),side=p.side*p.spread*(.78+.22*Math.sin(time*.31+p.phase));
  const lead=clamp((d-3)/9,0,1)*p.lead;
  const x=target.x+(-dz/d*side+(target.vx||0)*lead)*(1-near)+Math.cos(p.angle)*1.05*near;
  const z=target.z+( dx/d*side+(target.vz||0)*lead)*(1-near)+Math.sin(p.angle)*1.05*near;
  // A chosen lane must stay in the target's room, rather than aiming through a wall.
  const r=Math.max(.60,(enemy.radius||.5)+.08);
  return clear(target.x,target.z,x,z,r)?{x,z}:{x:target.x,z:target.z};
}
export function personalSteering(enemy,desired,target,neighbors,time=0,{clear=()=>true,hazards=[]}={}) {
  const p=personalityOf(enemy),distance=Math.hypot(target.x-enemy.x,target.z-enemy.z);
  let sx=0,sz=0,pressure=0;
  for(const other of neighbors){
    if(other===enemy||!other.alive)continue;
    let dx=enemy.x-other.x,dz=enemy.z-other.z,d=Math.hypot(dx,dz);
    const space=(enemy.radius||.5)+(other.radius||.5)+p.space;
    if(d>space+1)continue;
    if(d<.015){const angle=p.phase+(Number(other.id)||0)*2.399;dx=Math.cos(angle)*.02;dz=Math.sin(angle)*.02;d=.02;}
    if(d<space){const k=(space-d)/space;sx+=dx/d*k;sz+=dz/d*k;}
    const forward=-dx*desired.x-dz*desired.z,side=dx*-desired.z+dz*desired.x;
    if(forward>.15&&forward<space+1&&Math.abs(side)<space*.72)pressure+=1-forward/(space+1);
  }
  const length=Math.hypot(sx,sz);if(length>1.2){sx*=1.2/length;sz*=1.2/length;}
  const close=clamp((distance-1.4)/3,.3,1);
  const bend=(Math.sin(time*(p.style==='erratic'?1.7:.8)+p.phase)*p.sway+Math.min(.8,pressure)*p.side*.72)*close;
  let x=desired.x+sx*.90*close-desired.z*bend,z=desired.z+sz*.90*close+desired.x*bend;
  for(const f of hazards){
    if(f.life<=0)continue;const dx=enemy.x-f.x,dz=enemy.z-f.z,d=Math.hypot(dx,dz)||.1;
    if(d<f.radius+2){const k=(1-d/(f.radius+2))*p.fear*1.35;x+=dx/d*k;z+=dz/d*k;}
  }
  const len=Math.hypot(x,z)||1;x/=len;z/=len;
  const probe=Math.max(.65,(enemy.radius||.5)+.3),r=(enemy.radius||.5)+.04;
  if(clear(enemy.x,enemy.z,enemy.x+x*probe,enemy.z+z*probe,r))return {...desired,x,z};
  // Keep the valid navigation route in narrow passages; individuality must not break reachability.
  return desired;
}
export function personalPace(enemy,time=0) {
  const p=personalityOf(enemy);return p.speed*(1+Math.sin(time*(p.style==='erratic'?2.4:1.15)+p.phase)*p.pace);
}
