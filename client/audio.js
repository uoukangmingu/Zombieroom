// Standalone procedural audio: no downloads or sound-file dependencies.
import {creaturePCM} from './creature-voices.js';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

const MUSIC_PROFILE = {tempo:1,bass:1,lead:1,pulse:1,ambient:520,hum:62,upper:124.5,motif:[1,1,1,1]};

export class AudioBus {
  constructor(options = {}) {
    this.ctx = null;
    this.enabled = false;
    this.stepGate = 0;
    this.ambient = null;
    this.bgm = null;
    this.itemGate = 0;
    this.masterGain = null;
    this.sfxGain = null;
    this.weaponGain = null;
    this.impactGain = null;
    this.cueGain = null;
    this.enemyGain = null;
    this.ambienceGain = null;
    this.bgmGain = null;
    this.musicDuckGain = null;
    this.limiter = null;
    this.musicMood = 'explore';
    this.musicMoodTarget = 'explore';
    this.musicMoodGate = 0;
    
    this.volumes = { master: 1, sfx: .85, bgm: .65, ambience: .60 };
    this.mix = 'balanced';
    this.contextFactory = options.contextFactory || (() => {
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
      return AC ? new AC({latencyHint: 'interactive'}) : null;
    });
    this.graphReady = false;
    this.graphNodes = [];
    this.voices = new Map();
    this.timers = new Set();
    this.noiseCache = new Map();
    this.creatureCache=new Map();
    this.listener = {x: 0, z: 0, yaw: 0};
    this.spatial = null;
    this.environment = 'box';
    this.bedPaused = false;
    this.lastError = '';
    this.onStatus = null;
  }
  unlock() {
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        this.stopAll();
        this.graphNodes.forEach(node => { try { node.disconnect(); } catch {} });
        this.graphNodes = []; this.graphReady = false; this.masterGain = null;
        this.noiseCache.clear();
        this.ctx = this.contextFactory();
        if (!this.ctx) throw new Error('이 브라우저에서 소리를 사용할 수 없습니다.');
        this.ctx.onstatechange = () => {
          this.enabled = this.graphReady && this.ctx.state === 'running';
          this.notifyStatus();
        };
      }
      if (!this.graphReady) this.createVolumeGraph();
      this.applyVolumes();
      this.enabled = this.ctx.state === 'running';
      const resume = this.enabled ? Promise.resolve() : this.ctx.resume();
      return Promise.resolve(resume).then(() => {
        this.enabled = this.ctx.state === 'running'; this.lastError = '';
        this.notifyStatus(); return this.enabled;
      }).catch(error => {
        this.enabled = false; this.lastError = error.message || '소리를 다시 켜주세요.';
        this.notifyStatus(); return false;
      });
    } catch (error) {
      this.enabled = false; this.lastError = error.message || '소리를 다시 켜주세요.';
      this.notifyStatus(); return Promise.resolve(false);
    }
  }
  notifyStatus() { this.onStatus?.({enabled:this.enabled, muted:this.volumes.master === 0, error:this.lastError}); }
  createVolumeGraph() {
    if (!this.ctx || this.graphReady) return;
    // Commit only a fully connected graph. A failed construction can be retried.
    const graph = {}, nodes = [];
    const make = (name, method, ...args) => graph[name] = (nodes.push(this.ctx[method](...args)), nodes.at(-1));
    try {
      for (const name of ['masterGain','sfxGain','weaponGain','impactGain','cueGain','enemyGain','ambienceGain','bgmGain','musicDuckGain','bedGain','focusGain','roomSend','roomReturn']) make(name,'createGain');
      make('limiter','createDynamicsCompressor');
      make('roomDelay','createDelay',.5); make('roomFilter','createBiquadFilter');
      graph.limiter.threshold.value = -8; graph.limiter.knee.value = 10;
      graph.limiter.ratio.value = 6; graph.limiter.attack.value = .003; graph.limiter.release.value = .18;
      for (const name of ['sfxGain','weaponGain','impactGain','cueGain','enemyGain']) graph[name].connect(graph.masterGain);
      for (const name of ['weaponGain','impactGain','enemyGain']) graph[name].connect(graph.roomSend);
      graph.roomDelay.delayTime.value = .075; graph.roomFilter.type = 'lowpass'; graph.roomFilter.frequency.value = 1900;
      graph.roomSend.gain.value = .14; graph.roomReturn.gain.value = .42;
      graph.roomSend.connect(graph.roomDelay).connect(graph.roomFilter).connect(graph.roomReturn).connect(graph.masterGain);
      graph.bgmGain.connect(graph.musicDuckGain).connect(graph.bedGain);
      graph.ambienceGain.connect(graph.bedGain); graph.bedGain.connect(graph.masterGain);
      graph.masterGain.connect(graph.limiter).connect(graph.focusGain).connect(this.ctx.destination);
      graph.focusGain.gain.value=this.hidden?0:1;graph.bedGain.gain.value=this.bedPaused?.12:1;
      Object.assign(this, graph); this.graphNodes = nodes; this.graphReady = true;
      this.applyVolumes(true); this.setMix(this.mix); this.setEnvironment(this.environment);
    } catch (error) {
      nodes.forEach(node => { try { node.disconnect(); } catch {} });
      this.graphReady = false; throw error;
    }
  }
  setVolumes(next = {}) {
    this.volumes.master = clamp(Number.isFinite(next.master) ? next.master : this.volumes.master, 0, 1);
    this.volumes.sfx = clamp(Number.isFinite(next.sfx) ? next.sfx : this.volumes.sfx, 0, 1);
    this.volumes.bgm = clamp(Number.isFinite(next.bgm) ? next.bgm : this.volumes.bgm, 0, 1);
    this.volumes.ambience = clamp(Number.isFinite(next.ambience) ? next.ambience : this.volumes.ambience, 0, 1);
    this.applyVolumes();
    this.notifyStatus();
  }
  applyVolumes(immediate=false) {
    if (!this.ctx || !this.graphReady) return;
    const t = this.ctx.currentTime;
    const set=(node,value,time)=>{
      const param=node.gain, current=param.value;
      param.cancelScheduledValues(t);
      param.setValueAtTime(immediate?value:current,t);
      if(!immediate)param.linearRampToValueAtTime(value,t+time*2);
    };
    set(this.masterGain,this.volumes.master,.015);
    const s = this.volumes.sfx;
    set(this.sfxGain,s*1.55,.015);
    set(this.weaponGain,s*(this.mix==='night'?1.30:2.15),.015);
    set(this.impactGain,s*(this.mix==='night'?1.35:1.90),.015);
    set(this.cueGain,s*1.7,.015);set(this.enemyGain,s*(this.mix==='headphones'?1.9:1.5),.015);
    set(this.ambienceGain,this.volumes.ambience*.72,.035);set(this.bgmGain,this.volumes.bgm*2.3,.035);
  }
  sfxDestination() { return this.sfxGain || this.ctx?.destination; }
  weaponDestination() { return this.weaponGain || this.sfxDestination(); }
  impactDestination() { return this.impactGain || this.sfxDestination(); }
  cueDestination() { return this.cueGain || this.sfxDestination(); }
  enemyDestination() { return this.enemyGain || this.sfxDestination(); }
  ambienceDestination() { return this.ambienceGain || this.bgmGain || this.ctx?.destination; }
  bgmDestination() { return this.bgmGain || this.ctx?.destination; }
  setMix(value) {
    this.mix = ['balanced','headphones','night'].includes(value) ? value : 'balanced';
    if (!this.graphReady) return;
    const t = this.ctx.currentTime;
    // Keep compressor makeup gain constant. Night mode lowers loud effect buses
    // while retaining quiet cues/steps, rather than boosting the whole mix.
    this.limiter.threshold.setValueAtTime(-8,t);
    this.limiter.ratio.setValueAtTime(6,t);
    this.applyVolumes(); this.setEnvironment(this.environment);
  }
  setEnvironment(map = 'box') {
    this.environment = map;
    if (!this.graphReady) return;
    const rooms = {box:[.075,.12],lane:[.11,.18],castle:[.15,.22],maze:[.095,.16],abyss:[.20,.24]};
    const [delay, send] = rooms[map] || rooms.box, t = this.ctx.currentTime;
    this.roomDelay.delayTime.setTargetAtTime(delay, t, .2);
    this.roomSend.gain.setTargetAtTime(send * (this.mix === 'night' ? .45 : 1), t, .2);
  }
  setListener(x=0,z=0,yaw=0) { this.listener={x,z,yaw}; }
  at(x,z,fn,occluded=false) {
    if (!this.enabled) return;
    const previous=this.spatial; this.spatial={x,z,occluded};
    try { return fn(); } finally { this.spatial=previous; }
  }
  route(output, destination) {
    if (!this.spatial) { output.connect(destination); return []; }
    const {x,z,occluded}=this.spatial, {x:lx,z:lz,yaw}=this.listener;
    const dx=x-lx,dz=z-lz, distance=Math.hypot(dx,dz);
    const volume=this.ctx.createGain(), filter=this.ctx.createBiquadFilter(), pan=this.ctx.createStereoPanner();
    volume.gain.value = 1/(1+Math.max(0,distance-2)*.085) * (occluded ? .48 : 1);
    filter.type='lowpass';filter.frequency.value=occluded ? 850 : clamp(11000-distance*170,1800,11000);
    pan.pan.value=clamp((dx*Math.cos(yaw)-dz*Math.sin(yaw))/Math.max(1,distance),-.95,.95) * (this.mix==='headphones'?1:.82);
    output.connect(volume).connect(filter).connect(pan).connect(destination);
    return [volume,filter,pan];
  }
  track(source,nodes) {
    if (this.voices.size>=128) {
      const oldest=this.voices.keys().next().value;
      try { oldest.stop(); } catch {} this.releaseVoice(oldest);
    }
    this.voices.set(source,nodes); source.onended=()=>this.releaseVoice(source);
  }
  releaseVoice(source) {
    for (const node of [source,...(this.voices.get(source)||[])]) { try { node.disconnect(); } catch {} }
    this.voices.delete(source);
  }
  defer(fn,ms) {
    const spatial=this.spatial;
    const timer=setTimeout(()=>{this.timers.delete(timer);const prev=this.spatial;this.spatial=spatial;try{fn();}finally{this.spatial=prev;}},ms);
    this.timers.add(timer);return timer;
  }
  setBedPaused(paused) {
    if (this.bedPaused === !!paused) return;
    this.bedPaused=!!paused;
    this.bedGain?.gain.setTargetAtTime(paused ? .12 : 1,this.ctx.currentTime,.12);
    if(paused)this.stopBgm();else if(this.ambient)this.startBgm();
  }
  setHidden(hidden) {
    this.hidden=!!hidden;this.focusGain?.gain.setTargetAtTime(hidden ? 0 : 1,this.ctx.currentTime,.04);
    if(hidden)this.stopBgm();else if(this.ambient&&!this.bedPaused)this.startBgm();
  }
  beep(freq = 220, dur = .05, type = 'square', gain = .03, freqEnd = null, dest = null) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + .008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    const route=this.route(g,dest || this.sfxDestination());this.track(osc,[g,...route]);
    osc.start(t); osc.stop(t + dur + .02);
  }
  noise(dur = .08, gain = .035, filterType = 'lowpass', freq = 900, dest = null) {
    if (!this.enabled || !this.ctx) return;
    const sr = this.ctx.sampleRate;
    const len = Math.max(1, Math.floor(sr * dur));
    let buffer = this.noiseCache.get(len);
    if (!buffer) {
      buffer = this.ctx.createBuffer(1, len, sr);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      if(this.noiseCache.size>=32)this.noiseCache.delete(this.noiseCache.keys().next().value);
      this.noiseCache.set(len,buffer);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filt = this.ctx.createBiquadFilter();
    filt.type = filterType; filt.frequency.value = freq;
    const g = this.ctx.createGain();
    const t = this.ctx.currentTime;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(filt).connect(g);
    const route=this.route(g,dest || this.sfxDestination());this.track(src,[filt,g,...route]);
    src.start(t); src.stop(t + dur + .02);
  }
  startAmbience() {
    if (!this.enabled || !this.ctx || this.ambient) return;
    const t = this.ctx.currentTime;
    const profile = MUSIC_PROFILE;
    const base = this.ctx.createOscillator();
    const upper = this.ctx.createOscillator();
    const wobble = this.ctx.createOscillator();
    const wobbleGain = this.ctx.createGain();
    const filt = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    // 어둡게 깔리는 저음 대신, 낡은 형광등이 계속 웅웅거리는 느낌.
    base.type = 'sine'; base.frequency.value = profile.hum || 62;
    upper.type = 'triangle'; upper.frequency.value = profile.upper || 124.5;
    wobble.type = 'sine'; wobble.frequency.value = .11;
    wobbleGain.gain.value = 4.2;
    filt.type = 'lowpass'; filt.frequency.value = 520;
    g.gain.value = .018;
    wobble.connect(wobbleGain);
    wobbleGain.connect(base.frequency);
    base.connect(filt); upper.connect(filt);
    filt.connect(g).connect(this.ambienceDestination());
    base.start(t); upper.start(t); wobble.start(t);
    const air=this.ctx.createBufferSource(), airFilter=this.ctx.createBiquadFilter(), airGain=this.ctx.createGain();
    const buffer=this.ctx.createBuffer(1,this.ctx.sampleRate*2,this.ctx.sampleRate), data=buffer.getChannelData(0);
    let brown=0;for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.025)/1.018;data[i]=brown;}
    air.buffer=buffer;air.loop=true;airFilter.type='bandpass';airFilter.frequency.value=580;airGain.gain.value=.06;
    air.connect(airFilter).connect(airGain).connect(this.ambienceDestination());air.start(t);
    this.ambient = { osc: base, upper, wobble, air, gain: g, filter: filt, extra:[wobbleGain,airFilter,airGain] };
  }
  toneAt(freq = 220, start = 0, dur = .25, type = 'triangle', gain = .012, dest = null) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const t = start || this.ctx.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + .018);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    const route=this.route(g,dest || this.sfxDestination());this.track(osc,[g,...route]);
    osc.musicSession=this.bgm;
    osc.start(t); osc.stop(t + dur + .04);
  }
  
  duckMusic(level = .5, hold = .12, release = .35) {
    if (!this.ctx || !this.musicDuckGain) return;
    const t = this.ctx.currentTime;
    const target = clamp(level, .12, 1);
    this.musicDuckGain.gain.cancelScheduledValues(t);
    this.musicDuckGain.gain.setTargetAtTime(target, t, .012);
    this.musicDuckGain.gain.setTargetAtTime(1, t + Math.max(.02, hold), Math.max(.04, release));
  }
  
  missionStinger(kind = 'info') {
    const dest = this.cueDestination();
    const danger = kind === 'danger';
    this.beep(danger ? 118 : 420, danger ? .22 : .14, 'sawtooth', danger ? .048 : .034, danger ? 52 : 680, dest);
    this.defer(() => this.beep(danger ? 82 : 620, .18, 'triangle', .028, danger ? 45 : 920, dest), 75);
    this.duckMusic(danger ? .28 : .42, .24, .55);
  }
  
  setMusicMood(mood = 'explore') {
    if (!['explore', 'combat', 'danger'].includes(mood)) mood = 'explore';
    this.musicMoodTarget = mood;
    if (!this.bgm || !this.ctx) { this.musicMood = mood; return; }
    if (this.musicMood === mood) return;
    this.musicMood = mood;
    const t = this.ctx.currentTime;
    const gain = mood === 'danger' ? .80 : (mood === 'combat' ? .68 : .55);
    const cutoff = mood === 'danger' ? 1180 : (mood === 'combat' ? 860 : 660);
    this.bgm.master.gain.setTargetAtTime(gain, t, .28);
    this.bgm.filter.frequency.setTargetAtTime(cutoff, t, .35);
    if (this.ambient?.gain) this.ambient.gain.gain.setTargetAtTime(mood === 'danger' ? .024 : .018, t, .35);
  }

  startBgm() {
    if (!this.enabled || !this.ctx || this.bgm || this.bedPaused || this.hidden) return;
    const master = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const pulseFilter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    pulseFilter.type = 'bandpass';
    pulseFilter.frequency.value = 160;
    master.gain.value = .55;
    filter.connect(master).connect(this.bgmDestination());
    pulseFilter.connect(master);

    // 밝은 조명 아래에서 불안한 백룸 공포감을 주는 코드 기반 적응형 BGM.
    // explore: 반복되는 낮은 신스 / combat: 짧은 박동 / danger: 불협 리드와 빠른 펄스.
    const bassExplore = [49, 49, 55, 52, 49, 46.25, 43.65, 46.25];
    const bassCombat = [55, 55, 65.41, 58.27, 55, 73.42, 65.41, 58.27];
    const bassDanger = [41.2, 49, 46.25, 43.65, 41.2, 58.27, 55, 46.25];
    const leadExplore = [0, 196, 0, 185, 0, 174.61, 196, 0, 0, 146.83, 0, 164.81, 0, 174.61, 0, 0];
    const leadCombat = [220, 0, 196, 0, 246.94, 0, 220, 196, 174.61, 0, 196, 0, 220, 246.94, 0, 196];
    const leadDanger = [293.66, 277.18, 0, 246.94, 311.13, 0, 293.66, 233.08, 0, 220, 246.94, 0, 277.18, 0, 311.13, 0];
    let step = 0;

    const hitNoise = (t, gain = .018) => {
      const sr = this.ctx.sampleRate;
      const len = Math.floor(sr * .045);
      const buffer = this.ctx.createBuffer(1, len, sr);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(.0001, t + .045);
      src.connect(g).connect(pulseFilter);this.track(src,[g]);src.musicSession=this.bgm;
      src.start(t); src.stop(t + .06);
    };

    let nextBarTime=this.ctx.currentTime+.035;
    const scheduleBar = () => {
      if (!this.ctx || !this.bgm) return;
      if (!this.enabled) {this.bgm.timer=setTimeout(scheduleBar,250);return;}
      if(nextBarTime>this.ctx.currentTime+.18){this.bgm.timer=setTimeout(scheduleBar,90);return;}
      const mood = this.musicMood || 'explore';
      const profile = MUSIC_PROFILE;
      const base = Math.max(nextBarTime,this.ctx.currentTime+.015);
      const bass = mood === 'danger' ? bassDanger : (mood === 'combat' ? bassCombat : bassExplore);
      const lead = mood === 'danger' ? leadDanger : (mood === 'combat' ? leadCombat : leadExplore);
      const beat = (mood === 'danger' ? .30 : (mood === 'combat' ? .36 : .48)) / Math.max(.65, profile.tempo || 1);
      const bassGain = (mood === 'danger' ? .034 : (mood === 'combat' ? .028 : .022)) * profile.pulse;
      const leadGain = (mood === 'danger' ? .018 : (mood === 'combat' ? .014 : .010)) * (2 - profile.pulse * .45);

      for (let i = 0; i < 8; i++) {
        const t = base + i * beat;
        const motif = profile.motif?.[(step + i) % profile.motif.length] || 1;
        const n = bass[(step + i) % bass.length] * profile.bass * motif;
        this.toneAt(n, t, beat * .82, 'sawtooth', bassGain, filter);
        if (mood !== 'explore') {
          this.toneAt(n * 2.01, t + beat * .52, beat * .18, 'square', bassGain * .55, filter);
          if (i % 2 === 0) hitNoise(t + .015, mood === 'danger' ? .024 : .016);
        }
      }
      for (let i = 0; i < 16; i++) {
        const motif = profile.motif?.[(step + Math.floor(i / 2)) % profile.motif.length] || 1;
        const n = lead[(step * 2 + i) % lead.length] * profile.lead * motif;
        if (!n) continue;
        const t = base + i * (beat / 2);
        this.toneAt(n, t, beat * .34, mood === 'danger' ? 'square' : 'triangle', leadGain, filter);
      }
      step = (step + 8) % 64;
      nextBarTime=base+beat*8;
      if (this.bgm) this.bgm.timer = setTimeout(scheduleBar, 90);
    };

    this.bgm = { master, filter, pulseFilter, timer: null };
    this.musicMood=''; this.setMusicMood(this.musicMoodTarget || 'explore');
    scheduleBar();
  }

  stopBgm() {
    if (!this.bgm) return;
    for(const source of [...this.voices.keys()])if(source.musicSession===this.bgm){try{source.stop();}catch{}this.releaseVoice(source);}
    clearTimeout(this.bgm.timer);
    try { this.bgm.master.disconnect(); } catch (_) {}
    try { this.bgm.filter.disconnect(); } catch (_) {}
    try { this.bgm.pulseFilter?.disconnect(); } catch (_) {}
    this.bgm = null;
  }
  stopAll() {
    this.stopBgm();
    for(const timer of this.timers)clearTimeout(timer);this.timers.clear();
    for(const source of [...this.voices.keys()]){try{source.stop();}catch{}this.releaseVoice(source);}
    this.stepGate=0;this.itemGate=0;this.objectiveGate=0;this.emptyGate=0;
    if (this.ambient) {
      for (const node of [this.ambient.osc, this.ambient.upper, this.ambient.wobble, this.ambient.air]) {
        try { node?.stop?.(); } catch (_) {}
        try { node?.disconnect?.(); } catch (_) {}
      }
      try { this.ambient.gain?.disconnect?.(); } catch (_) {}
      try { this.ambient.filter?.disconnect?.(); } catch (_) {}
      for(const node of this.ambient.extra || []){try{node.disconnect();}catch{}}
      this.ambient = null;
    }
  }
  headshot() { this.beep(980, .055, 'triangle', .030, 1480); this.defer(() => this.beep(520, .045, 'square', .018), 44); }
  shieldHit() { this.beep(280, .035, 'square', .018, 170); this.noise(.045, .020, 'highpass', 1800); }
  bomberWarn() { this.beep(980, .045, 'square', .016, 760); }
  lowHpBeat() { this.beep(72, .08, 'sine', .018, 60); }
  reload(kind = 'pistol') {
    const base = kind === 'rocket' || kind === 'shotgun' || kind === 'railgun' ? 180 : 260;
    this.beep(base, .055, 'triangle', .024, base * .7);
    this.defer(() => this.beep(base * 1.45, .04, 'triangle', .018, base), 95);
    this.noise(.04, .018, 'highpass', 1200);
    this.defer(()=>this.noise(.055,.016,'bandpass',850),170);
  }
  reloadEnd() { this.noise(.035,.025,'highpass',1800);this.beep(640,.035,'triangle',.017,340); }
  empty() {
    if(!this.ctx || this.ctx.currentTime<(this.emptyGate||0))return;
    this.emptyGate=this.ctx.currentTime+.22;this.noise(.022,.022,'highpass',2500);this.beep(190,.024,'triangle',.02,85);
  }

  shoot(kind) {
    const dest = this.weaponDestination();
    if(kind==='molotov'){this.noise(.16,.048,'bandpass',950,dest);this.defer(()=>this.noise(.09,.025,'highpass',2700,dest),45);return;}
    const pitch = rand(.982, 1.018);
    const heavy = ['shotgun','rocket','railgun'].includes(kind);
    this.duckMusic(heavy ? .34 : .58, heavy ? .15 : .07, heavy ? .34 : .20);
    const map = {
      pistol: [132,.085,'sine',.090,46], smg: [155,.052,'sine',.075,62], shotgun: [83,.19,'sine',.155,31],
      rocket: [78,.22,'sine',.135,28], railgun: [820,.12,'triangle',.110,310], grenade: [165,.08,'triangle',.072,70],
      barrel: [112,.06,'square',.060,60], wall: [205,.055,'triangle',.052,115]
    };
    const base = [...(map[kind] || map.pistol)];
    base[0] *= pitch; if (base[4]) base[4] *= pitch;
    this.beep(...base, dest);
    if (kind === 'pistol') {
      this.noise(.028,.12,'highpass',2350,dest);this.noise(.095,.074,'bandpass',1350,dest);
      this.defer(() => this.beep(920*rand(.98,1.02),.026,'triangle',.022,540,dest),18);
      this.defer(() => this.noise(.075,.022,'lowpass',420,dest),30);
      this.beep(90,.085,'sine',.046,45,dest);
    } else if (kind === 'smg') {
      this.noise(.023,.082,'highpass',2700,dest);this.noise(.055,.058,'bandpass',1750,dest);
      if (Math.random() < .42) this.defer(() => this.beep(1080,.018,'triangle',.014,620,dest),12);
    } else if (kind === 'shotgun') {
      this.noise(.115,.155,'lowpass',760,dest);
      this.noise(.070,.088,'highpass',1900,dest);
      this.defer(() => this.beep(210,.075,'triangle',.040,105,dest),55);
      this.beep(76,.20,'sine',.065,31,dest);
      this.defer(()=>this.noise(.08,.03,'bandpass',1500,dest),230);
    } else if (kind === 'rocket') {
      this.noise(.22,.120,'lowpass',430,dest);
      this.noise(.12,.055,'highpass',1500,dest);
    } else if (kind === 'railgun') {
      this.noise(.10,.068,'highpass',2600,dest);
      this.defer(() => this.beep(1320,.11,'sine',.046,460,dest),22);
      this.beep(1800,.16,'sine',.027,290,dest);
    }
  }
  hit(kind = 'flesh', strength = 1) {
    const dest = this.impactDestination();
    const s = clamp(Number(strength) || 1, .65, 2.2);
    if (kind === 'head') {
      this.noise(.055,.052*s,'bandpass',1150,dest); this.beep(170,.050,'sawtooth',.032*s,70,dest);
    } else if (kind === 'armor') {
      this.beep(410,.052,'square',.048*s,145,dest); this.noise(.060,.044*s,'highpass',2300,dest);
    } else if (kind === 'shield') {
      this.beep(620,.045,'square',.052*s,260,dest); this.noise(.055,.050*s,'highpass',2900,dest);
    } else if (kind === 'core') {
      this.beep(240,.070,'sawtooth',.052*s,520,dest); this.noise(.075,.052*s,'bandpass',920,dest);
    } else if (kind === 'metal' || kind === 'wall') {
      this.beep(kind === 'metal' ? 520 : 260,.042,'triangle',.038*s,kind === 'metal' ? 190 : 95,dest); this.noise(.048,.034*s,'highpass',1800,dest);
    } else {
      this.noise(.065,.060*s,'bandpass',780,dest); this.beep(92,.055,'sawtooth',.032*s,38,dest);
    }
  }
  pickup() { this.beep(820, .045, 'triangle', .022, 1180); this.defer(() => this.beep(1180, .04, 'triangle', .018), 50); }
  itemSpawn() { if (!this.ctx || this.ctx.currentTime < this.itemGate) return; this.itemGate = this.ctx.currentTime + .55; this.beep(520, .035, 'triangle', .012, 680); }
  unlockSound() { this.beep(650, .08, 'triangle', .028, 850); this.defer(() => this.beep(980, .11, 'triangle', .025, 1320), 65); }
  jump() { this.beep(260, .055, 'triangle', .020, 330); }
  playerHit(kind = 'hit') {
    const d = this.impactDestination();
    this.duckMusic(kind === 'explosion' ? .25 : .52, .16, .38);
    this.noise(kind === 'explosion' ? .16 : .10, kind === 'explosion' ? .105 : .072, 'lowpass', kind === 'explosion' ? 330 : 620, d);
    this.beep(kind === 'fireball' ? 118 : 76, .12, 'sawtooth', kind === 'explosion' ? .068 : .050, 38, d);
  }
  earRing(strength = 1) { this.beep(1550, .32 * strength, 'sine', .016 * strength, 980); this.defer(() => this.beep(2100, .18 * strength, 'sine', .010 * strength, 1700), 80); }
  lowHpBreath() { this.noise(.18, .010, 'lowpass', 180); }
  playerStep(sprinting = false, ads = 0) {
    const hard=this.environment==='castle'||this.environment==='abyss';
    this.noise(sprinting ? .065 : .045, sprinting ? .028 : .018, hard?'bandpass':'lowpass', ads > .5 ? 250 : hard?1250:460);
    this.beep(rand(68,90),.045,'sine',sprinting?.018:.011,42);
  }
  enemyStep(type = 'zombie') {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (t < this.stepGate) return;
    this.stepGate = t + (type === 'runner' || type === 'bomber' ? .045 : .075);
    const freq = type === 'devil' ? 180 : (type === 'tank' ? 135 : (type === 'shield' ? 235 : 330));
    const gain = type === 'devil' || type === 'tank' ? .028 : .014;
    this.noise(type === 'devil' || type === 'tank' ? .085 : .05, gain, 'lowpass', freq, this.enemyDestination());
    if(type==='tank'||type==='devil')this.beep(65,.12,'sine',.027,38,this.enemyDestination());
  }
  enemyVoice(type='zombie',mood='idle',seed=1) {
    if(!this.enabled || !this.ctx)return;
    const key=type+':'+mood;
    let buffer=this.creatureCache.get(key);
    if(!buffer){const pcm=creaturePCM(type,mood);buffer=this.ctx.createBuffer(1,pcm.length,24000);buffer.getChannelData(0).set(pcm);this.creatureCache.set(key,buffer);}
    const src=this.ctx.createBufferSource(),g=this.ctx.createGain();src.buffer=buffer;
    if(src.playbackRate)src.playbackRate.value=.90+((Number(seed)*13%97+97)%97)/97*.22;
    g.gain.value=mood==='idle'?.085:mood==='death'?.12:.15;
    src.connect(g);const route=this.route(g,this.enemyDestination());this.track(src,[g,...route]);src.start();
    if(type==='shield' && mood!=='idle')this.noise(.11,.024,'bandpass',1600,this.enemyDestination());
  }
  enemyAttack(type = 'zombie',seed=1) {
    this.enemyVoice(type,'attack',seed);
    this.noise(.08,.027,'bandpass',type==='tank'?260:720,this.enemyDestination());
  }
  devilCast() { const d=this.enemyDestination();this.beep(160,.42,'sawtooth',.026,650,d);this.beep(171,.40,'sine',.018,675,d);this.noise(.22,.03,'bandpass',1100,d);this.duckMusic(.4,.3,.3); }
  fireballExplode() { this.noise(.10, .045, 'lowpass', 360); this.beep(58, .12, 'sawtooth', .035, 32); }
  placeWall() { this.beep(155, .055, 'square', .020, 95); this.noise(.035, .016, 'lowpass', 400); }
  placeMine() { this.beep(125, .045, 'triangle', .017, 85); this.beep(380, .035, 'triangle', .012, 240); }
  wallCrack() { this.noise(.06, .030, 'highpass', 900); }
  wallBreak() { this.noise(.16, .055, 'lowpass', 460); this.beep(75, .14, 'sawtooth', .040, 38); }
  enemyDeath(type = 'zombie',seed=1) {this.enemyVoice(type,'death',seed);this.noise(.16,.04,'lowpass',type==='tank'?190:480,this.enemyDestination());}
  molotovBreak() {const d=this.impactDestination();this.noise(.07,.09,'highpass',3800,d);this.noise(.24,.055,'bandpass',2300,d);this.defer(()=>this.noise(.35,.07,'lowpass',650,d),35);this.duckMusic(.55,.15,.3);}
  fireCrackle() {const d=this.enemyDestination();this.noise(.40,.035,'bandpass',650,d);this.noise(.021,.028,'highpass',2500,d);if(Math.random()<.45)this.defer(()=>this.noise(.018,.022,'highpass',3200,d),90);}
  explosion() {
    const d=this.impactDestination();this.duckMusic(.25,.22,.45);
    this.noise(.26,.095,'lowpass',540,d);this.noise(.075,.055,'highpass',1600,d);
    this.beep(82,.34,'sine',.10,27,d);this.defer(()=>this.noise(.30,.035,'lowpass',260,d),90);
  }
  cue(kind='complete') {
    const notes={start:[220,330],boss:[110,116.54,82.41],complete:[440,554.37,659.25],relay:[659.25,880],revive:[329.63,440,659.25],down:[220,155.56,110],extracted:[440,554.37,659.25,880],defeated:[196,174.61,130.81],connected:[440,660],disconnected:[330,220]}[kind] || [440,660];
    const d=this.cueDestination();
    notes.forEach((n,i)=>this.defer(()=>{this.beep(n,.20,'triangle',.034,n,d);this.beep(n/2,.24,'sine',.015,null,d);},i*115));
    this.duckMusic(.36,.28,.4);
  }
  objectiveTick(progress=0) {
    if(!this.ctx || this.ctx.currentTime<(this.objectiveGate||0))return;
    this.objectiveGate=this.ctx.currentTime+.28;
    this.beep(360+clamp(progress,0,1)*420,.048,'sine',.015,null,this.cueDestination());
  }
  countdown() { this.beep(660,.05,'triangle',.024,540,this.cueDestination()); }
  test() {
    const {x,z,yaw}=this.listener,rx=Math.cos(yaw)*3,rz=-Math.sin(yaw)*3;
    this.at(x-rx,z-rz,()=>this.beep(440,.20,'sine',.07,null,this.cueDestination()));
    this.defer(()=>this.at(x+rx,z+rz,()=>this.beep(660,.20,'sine',.07,null,this.cueDestination())),350);
    this.defer(()=>this.shoot('pistol'),750);this.defer(()=>this.hit('armor'),1050);
  }
}
