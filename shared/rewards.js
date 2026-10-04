export const REWARDS = [
  {id:'maxHp',title:'최대 체력 +10',desc:'즉시 10 회복하고 최대 HP가 늘어납니다.',maxStacks:8},
  {id:'stamina',title:'스태미너 +15',desc:'달릴 수 있는 시간이 늘어납니다.',maxStacks:6},
  {id:'speed',title:'이동 속도 +4%',desc:'걷기와 달리기가 빨라집니다.',maxStacks:6},
  {id:'regen',title:'스태미너 회복 +20%',desc:'다시 달릴 수 있게 되는 시간이 짧아집니다.',maxStacks:5},
  {id:'damage',title:'무기 데미지 +8%',desc:'모든 무기의 피해가 증가합니다.',maxStacks:8},
  {id:'headshot',title:'헤드샷 데미지 +20%',desc:'정밀 사격의 피해가 증가합니다.',maxStacks:5},
  {id:'wallHp',title:'설치 벽 체력 +25%',desc:'새로 설치한 벽이 더 오래 버팁니다.',maxStacks:5,requires:'wall'},
  {id:'ammo',title:'탄약 보급 +25%',desc:'상자에서 얻는 탄약량이 증가합니다.',maxStacks:4},
  {id:'reload',title:'재장전 속도 +12%',desc:'모든 무기의 재장전 시간이 짧아집니다.',maxStacks:5},
  {id:'kit',title:'회복키트 저장 +10',desc:'회복키트 저장 한도가 늘어납니다.',maxStacks:6},
  {id:'shotgunBreach',title:'샷건 · 돌파탄',desc:'샷건 피해 +22%, 설치 벽 피해 +65%.',maxStacks:1,requires:'shotgun'},
  {id:'railOvercharge',title:'레일 · 과충전',desc:'레일 피해 +18%, 관통 대상 +1.',maxStacks:1,requires:'railgun'},
  {id:'rocketPayload',title:'로켓 · 확장 탄두',desc:'로켓 폭발 반경 +18%.',maxStacks:1,requires:'rocket'},
  {id:'fieldHeal',title:'현장 응급처치',desc:'최대 체력의 35%를 회복합니다.',repeatable:true},
  {id:'ammoCache',title:'탄약 캐시',desc:'해금된 무기 탄약 22%를 보급합니다.',repeatable:true},
  {id:'medkitCache',title:'회복키트 보급',desc:'회복키트 18을 보급합니다.',repeatable:true}
];
export function newUpgrades() {return{damage:1,headshot:1,speed:0,wallHp:1,ammoGain:1,reload:1,staminaRegen:0,maxHp:100,maxMedkits:100,maxStamina:100,rewardStacks:{}};}
export function rewardChoices(upgrades,wave,weapons,random=Math.random) {
  const pool=REWARDS.filter(r=>(r.repeatable || (upgrades.rewardStacks[r.id] || 0)<r.maxStacks) && (!r.requires || weapons[r.requires].unlockWave<=wave));
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  return pool.slice(0,3);
}
export function applyReward(player,id,wave,weapons) {
  const reward=REWARDS.find(r=>r.id===id),up=player.upgrades,ps=player.state;
  if(!reward || (!reward.repeatable && (up.rewardStacks[id] || 0)>=reward.maxStacks))return false;
  if(reward.requires && weapons[reward.requires].unlockWave>wave)return false;
  if(id==='maxHp'){up.maxHp+=10;ps.hp=Math.min(up.maxHp,ps.hp+10);}
  if(id==='stamina'){up.maxStamina+=15;player.motion.stamina=Math.min(up.maxStamina,player.motion.stamina+15);}
  if(id==='speed')up.speed+=.04;
  if(id==='regen')up.staminaRegen+=.20;
  if(id==='damage')up.damage*=1.08;
  if(id==='headshot')up.headshot*=1.2;
  if(id==='wallHp')up.wallHp*=1.25;
  if(id==='ammo')up.ammoGain*=1.25;
  if(id==='reload')up.reload*=.88;
  if(id==='kit')up.maxMedkits=Math.min(160,up.maxMedkits+10);
  if(['shotgunBreach','railOvercharge','rocketPayload'].includes(id))up[id]=true;
  if(id==='fieldHeal')ps.hp=Math.min(up.maxHp,ps.hp+up.maxHp*.35);
  if(id==='medkitCache')ps.medkits=Math.min(up.maxMedkits,ps.medkits+18);
  if(id==='ammoCache')for(const [wid,w]of Object.entries(weapons))if(w.unlockWave<=wave && Number.isFinite(w.ammoMax))player.weaponState.ammo[wid]=Math.min(w.ammoMax,Number(player.weaponState.ammo[wid] || 0)+Math.ceil(w.ammoMax*.22));
  if(!reward.repeatable)up.rewardStacks[id]=(up.rewardStacks[id] || 0)+1;
  ps.maxHp=up.maxHp;ps.maxStamina=up.maxStamina;ps.maxMedkits=up.maxMedkits;return true;
}
