const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// The browser and the authoritative server use the same level rules.
export const MISSION_CATALOG = Object.freeze([
  { type:'normal', label:'구역 확보', short:'CLEAR', desc:'몰려오는 감염체를 모두 처치하세요.', bonus:'headshots' },
  { type:'normal', label:'기동 제압', short:'RUNNERS', desc:'빠른 러너가 합류합니다. 이동하며 전부 처치하세요.', bonus:'headshots' },
  { type:'survive', label:'포위 생존', short:'SURVIVE', desc:'시간이 끝날 때까지 생존하세요. 적을 전부 잡을 필요는 없습니다.', bonus:'headshots' },
  { type:'core', label:'감염원 제거', short:'CORES', desc:'주황색 코어를 모두 파괴하세요. 코어가 남아 있으면 적이 충원됩니다.', bonus:'time' },
  { type:'normal', label:'중장갑 사냥', short:'ELITE', desc:'강화 탱크와 호위 감염체를 처치하세요. 머리와 측면을 노리세요.', elite:'tank', bonus:'headshots' },
  { type:'holdout', label:'거점 점령', short:'CAPTURE', desc:'청록색 거점 안에서 점령 시간을 채우세요. 밖으로 나가도 진행도는 유지됩니다.', bonus:'time' },
  { type:'rush', label:'폭발 러시', short:'RUSH', desc:'폭발 개체가 몰려옵니다. 거리를 벌리며 모두 처치하세요.', bonus:'headshots' },
  { type:'relay', label:'중계기 복구', short:'RELAYS', desc:'청록색 중계기 3곳에 접근해 F를 길게 누르세요. 둘이 각자 작업할 수 있습니다.', bonus:'time' },
  { type:'blackout', label:'비상 전력', short:'LOW POWER', desc:'어두워진 구역에서 시간이 끝날 때까지 버티세요. 목표 표시는 계속 보입니다.', bonus:'headshots' },
  { type:'normal', label:'균열 지휘체', short:'BOSS', desc:'강화 균열술사와 호위 개체를 처치하세요. 클리어 후 탈출하거나 다음 구역에 도전할 수 있습니다.', elite:'devil', bonus:'time' }
]);

export function getMission(wave = 1) {
  wave = Math.max(1, Math.floor(Number(wave) || 1));
  const index = (wave - 1) % 10;
  const sector = Math.floor((wave - 1) / 10) + 1;
  const base = MISSION_CATALOG[index];
  return {
    ...base, wave, index, sector,
    duration: base.type === 'survive' ? clamp(34 + (sector-1)*5,34,64) : base.type === 'blackout' ? clamp(38+(sector-1)*5,38,68) : 0,
    targetTime: base.type === 'holdout' ? clamp(26+(sector-1)*4,26,50) : 0,
    coreCount: clamp(2+Math.floor((sector-1)/2),2,4),
    coreHp: 105 + wave * 8,
    interactTime: 1.8,
    maxActive: clamp(16+wave,18,40),
    bonusTarget: base.bonus === 'headshots' ? clamp(2+Math.floor(wave/10),2,8) : 95+sector*12,
    completionScore: 120+wave*35,
    bonusScore: 100+wave*20,
    icon: ['◎','»','◷','◆','▣','⊙','✹','⚡','◐','✦'][index]
  };
}

export function waveSpawnCount(wave, diff = {spawn:1}, players = 1, threat = 1) {
  const value = (7 + wave*2.05 + Math.sqrt(wave)*1.7) * (diff.spawn || 1) * threat * (players === 2 ? 1.55 : 1);
  return clamp(Math.round(value),10,90);
}

export function createMissionState(mission, points = [], stats = {}) {
  return {
    wave:mission.wave, elapsed:0, timer:mission.duration || 0, progress:0, clearTimer:0, complete:false,
    bonusComplete:false, startHeadshots:stats.headshots || 0, startKills:stats.kills || 0,
    targets:points.map((p,i)=>({id:`${mission.wave}:${i}`,x:p.x,z:p.z,progress:0,done:false,radius:mission.type==='holdout'?4.2:2.8})),
    activeTarget:null, coreRemaining:mission.coreCount, active:false
  };
}

export function tickMission(m, state, dt, context = {}) {
  if (!state || state.complete || context.paused) return !!state?.complete;
  state.elapsed += dt;
  const players = (context.players || []).filter(p => p.alive !== false && !p.downed && p.connected !== false);
  if (m.type === 'survive' || m.type === 'blackout') {
    state.timer = Math.max(0,state.timer-dt);
    state.complete = state.timer <= 0;
  } else if (m.type === 'core') {
    state.coreRemaining = Math.max(0,context.coresLeft ?? state.coreRemaining);
    state.complete = state.coreRemaining === 0;
  } else if (m.type === 'holdout') {
    const t = state.targets[0];
    state.active = !!t && players.some(p => Math.hypot(p.x-t.x,p.z-t.z) <= t.radius);
    if (state.active) state.progress = Math.min(m.targetTime,state.progress+dt);
    state.complete = state.progress >= m.targetTime;
  } else if (m.type === 'relay') {
    state.activeTarget = null;
    for (const t of state.targets) {
      if (t.done) continue;
      const contributors = players.filter(p => p.interact && Math.hypot(p.x-t.x,p.z-t.z) <= t.radius && (context.canInteract?.(p,t) ?? true));
      if (contributors.length) {
        t.progress = Math.min(m.interactTime,t.progress+dt*contributors.length);
        state.activeTarget = t.id;
        if (t.progress >= m.interactTime) t.done = true;
      }
    }
    state.progress = state.targets.filter(t=>t.done).length;
    state.complete = state.targets.length > 0 && state.targets.every(t=>t.done);
  } else {
    state.clearTimer = context.remaining === 0 ? state.clearTimer+dt : 0;
    state.complete = state.clearTimer >= 1.2;
  }
  const headshots = (context.headshots || 0)-state.startHeadshots;
  state.bonusComplete = m.bonus === 'headshots' ? headshots >= m.bonusTarget : state.complete && state.elapsed <= m.bonusTarget;
  return state.complete;
}

export function missionProgress(m,s,context={}) {
  if(!s)return 0;
  if(m.type==='survive'||m.type==='blackout')return clamp(1-s.timer/m.duration,0,1);
  if(m.type==='core')return clamp(1-s.coreRemaining/m.coreCount,0,1);
  if(m.type==='holdout')return clamp(s.progress/m.targetTime,0,1);
  if(m.type==='relay')return s.targets.reduce((sum,t)=>sum+t.progress/m.interactTime,0)/Math.max(1,s.targets.length);
  return clamp(1-(context.remaining || 0)/Math.max(1,context.initialCount || 1),0,1);
}

export function missionHint(m,s,context={}) {
  if(!m||!s)return '레벨 목표 준비 중';
  if(s.complete)return `${m.label} · 완료`;
  if(m.type==='survive'||m.type==='blackout')return `${m.label} · ${Math.ceil(s.timer)}초 남음`;
  if(m.type==='core')return `감염 코어 ${s.coreRemaining}/${m.coreCount}개 남음 · 사격으로 파괴`;
  if(m.type==='holdout')return `거점 점령 ${Math.floor(s.progress)}/${m.targetTime}초 · ${s.active?'점령 중':'거점 안으로 이동'}`;
  if(m.type==='relay')return `중계기 ${s.progress}/${s.targets.length} 가동 · 접근해 F 길게`;
  return `${m.label} · ${context.remaining || 0}개체 남음`;
}
