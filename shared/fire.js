export const FIRE_RULES=Object.freeze({radius:3.6,duration:7,dps:22,selfDps:5,linger:1.8,lingerScale:.32,tick:.20,maxPatches:12});
export function makeFirePatch(id,x,z,ownerId=null,power=1) {
  return {id,x,z,ownerId,radius:FIRE_RULES.radius,life:FIRE_RULES.duration,duration:FIRE_RULES.duration,dps:FIRE_RULES.dps*power};
}
export function strongestFireAt(patches,entity,clear=()=>true,ownerOnly=false) {
  let strongest=null;
  for(const f of patches){
    if(f.life<=0 || (ownerOnly&&f.ownerId!==entity.id))continue;
    if(Math.hypot(entity.x-f.x,entity.z-f.z)>f.radius+(entity.radius||0)*.45 || !clear(f.x,f.z,entity.x,entity.z))continue;
    if(!strongest||f.dps>strongest.dps)strongest=f;
  }
  return strongest;
}
export function tickBurning(enemy,patches,dt,clear=()=>true) {
  const field=strongestFireAt(patches,enemy,clear);
  if(field){enemy.burnRemaining=FIRE_RULES.linger;enemy.burnDps=field.dps;enemy.burnOwnerId=field.ownerId;}
  else enemy.burnRemaining=Math.max(0,(enemy.burnRemaining||0)-dt);
  const active=field || enemy.burnRemaining>0;
  return active?(enemy.burnDps||0)*dt*(field?1:FIRE_RULES.lingerScale):0;
}
