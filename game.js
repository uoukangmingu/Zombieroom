import * as THREE from 'three';

const $ = (id) => document.getElementById(id);
const canvas = $('game');

const UI = {
  start: $('start-screen'), pause: $('pause-screen'), over: $('game-over-screen'),
  hud: $('hud'), startBtn: $('start-button'), resumeBtn: $('resume-button'), restartBtn: $('restart-button'),
  singleModeBtn: $('single-mode-button'), coopModeBtn: $('coop-mode-button'), playMode: $('play-mode-select'), multiplayerPanel: $('multiplayer-panel'),
  createRoomBtn: $('create-room-button'), joinRoomBtn: $('join-room-button'), readyBtn: $('ready-button'), roomCodeInput: $('room-code-input'), lobbyRoomCode: $('lobby-room-code'), lobbyStatus: $('lobby-status-text'), netState: $('net-state'), netStatusText: $('net-status-text'),
  map: $('map-select'), diff: $('difficulty-select'), quality: $('quality-select'), startWave: $('start-wave-select'),
  pauseQuality: $('pause-quality-select'), masterVolume: $('master-volume-range'), sfxVolume: $('sfx-volume-range'), bgmVolume: $('bgm-volume-range'), masterVolumeLabel: $('master-volume-label'), sfxVolumeLabel: $('sfx-volume-label'), bgmVolumeLabel: $('bgm-volume-label'),
  hpText: $('hp-text'), hpBar: $('hp-bar'), staminaText: $('stamina-text'), staminaBar: $('stamina-bar'), medkitText: $('medkit-text'), medkitBar: $('medkit-bar'),
  waveText: $('wave-text'), aliveText: $('alive-text'), objectiveText: $('objective-text'), scoreText: $('score-text'), fpsText: $('fps-text'), pingText: $('ping-text'),
  weaponBar: $('weapon-bar'), ammoText: $('ammo-text'), toast: $('toast'), centerAlert: $('center-alert'), headshot: $('headshot-indicator'), lowHealth: $('low-health-warning'), vignette: $('damage-vignette'), damageDir: $('damage-direction'), impactNoise: $('impact-noise'),
  finalStats: $('final-stats'), minimap: $('minimap'), startMapPreview: $('start-map-preview'), crosshair: $('crosshair'),
  reward: $('reward-screen'), rewardTitle: $('reward-title'), rewardSubtitle: $('reward-subtitle'), rewardChoices: $('reward-choices'), rewardSkip: $('reward-skip')
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rand = (min, max) => min + Math.random() * (max - min);
const dist2 = (ax, az, bx, bz) => (ax - bx) * (ax - bx) + (az - bz) * (az - bz);
const now = () => performance.now() / 1000;

const WORLD = {
  WALL_HEIGHT: 4.0,
  CEILING_HEIGHT: 3.95,
  EYE_HEIGHT: 1.68,
  PLAYER_RADIUS: 0.46,
  GRAVITY: 17.5,
  JUMP_VELOCITY: 6.4
};

const COLORS = {
  // 밝은데 불길한 Backrooms 느낌: 더 잘 보이는 누런 벽지, 형광등, 어두운 몰딩으로 공포감 유지.
  floor: 0x6f684e, wall: 0xb2a866, wallDark: 0x4f4728, ceiling: 0x80784f, wallPanel: 0x988f53, trim: 0x2c2415,
  player: 0xffcf4d, zombie: 0xf5f2df, runner: 0x31c7e8, devil: 0xe91515,
  bullet: 0xfff1a6, fire: 0xff5833, pickup: 0x58d9ff, barrel: 0xff914d, fakeWall: 0xd5c76d,
  skin: 0xf0c39f, hair: 0x060608, shirtBlack: 0x09090b, suitWhite: 0xf3f5f7,
  iceBlue: 0xb8d2e8, gloveBlue: 0x8fb3cc, zombieSuit: 0xf5f2df, zombieStripe: 0xf19b24, runnerSuit: 0x31c7e8, runnerStripe: 0xd9fbff, runnerFace: 0x0d4f67, devilRed: 0xff1616, devilDark: 0x2a0606, devilEye: 0xfff05a, shoeBlack: 0x0a0a0c,
  tankSuit: 0x5f6670, tankArmor: 0x2b3038, tankStripe: 0xffc13b,
  bomberSuit: 0xffb13d, bomberVest: 0x2b2116, bomberRed: 0xff3030,
  shieldSuit: 0xe9edf2, shieldPlate: 0x244c7a, shieldEdge: 0x9fd8ff,
  weaponDark: 0x1e2329, weaponMetal: 0x555d66, outline: 0x111111, blood: 0xa50016, bloodDark: 0x56000b, crack: 0x17130c, dust: 0x8a7d55, mineDark: 0x15171a, mineMetal: 0x34383e,
  lightPanel: 0xdbe2a5, itemBox: 0xd3b34f, itemBand: 0x2a3340, itemHealth: 0x49d17d
};

const DIFFICULTY = {
  normal: { enemyHp: 1, enemySpeed: 1, enemyDamage: 1, spawn: 1 },
  hard: { enemyHp: 1.22, enemySpeed: 1.10, enemyDamage: 1.25, spawn: 1.18 },
  hell: { enemyHp: 1.45, enemySpeed: 1.18, enemyDamage: 1.45, spawn: 1.34 }
};

const QUALITY = {
  // 그림자는 모든 품질에서 유지하되, Low는 해상도와 라이트 수를 낮춰 최적화한다.
  low: { pixelRatio: 1.0, fogFar: 68, fx: 0.72, shadows: true, shadowMap: 512, lightCount: 5 },
  mid: { pixelRatio: 1.25, fogFar: 88, fx: 1.0, shadows: true, shadowMap: 1024, lightCount: 8 },
  high: { pixelRatio: 1.6, fogFar: 110, fx: 1.18, shadows: true, shadowMap: 1536, lightCount: 11 }
};

const WEAPON_DEFS = [
  { id: 'pistol', slot: 1, name: 'PISTOL', unlockWave: 1, ammoMax: Infinity, magSize: 12, reloadTime: .92, cooldown: .32, damage: 24, range: 42, pellets: 1, spread: 0.004, recoil: .020, type: 'hitscan' },
  { id: 'smg', slot: 2, name: 'SMG', unlockWave: 2, ammoMax: 160, magSize: 30, reloadTime: 1.28, cooldown: .08, damage: 12, range: 34, pellets: 1, spread: 0.018, recoil: .012, type: 'hitscan' },
  { id: 'shotgun', slot: 3, name: 'SHOTGUN', unlockWave: 3, ammoMax: 48, magSize: 6, reloadTime: 1.55, cooldown: .62, damage: 13, range: 24, pellets: 8, spread: 0.095, recoil: .060, type: 'hitscan' },
  { id: 'grenade', slot: 4, name: 'GRENADE', unlockWave: 4, ammoMax: 20, magSize: 1, reloadTime: 1.05, cooldown: .72, damage: 92, range: 22, radius: 5.2, recoil: .035, type: 'grenade' },
  { id: 'barrel', slot: 5, name: 'BARREL', unlockWave: 5, ammoMax: 12, cooldown: .45, damage: 130, radius: 6.3, type: 'barrel' },
  { id: 'wall', slot: 6, name: 'WALL', unlockWave: 6, ammoMax: 18, cooldown: .28, type: 'wall' },
  { id: 'rocket', slot: 7, name: 'ROCKET', unlockWave: 7, ammoMax: 18, magSize: 1, reloadTime: 1.82, cooldown: .86, damage: 145, radius: 6.8, speed: 26, recoil: .080, type: 'rocket' },
  { id: 'railgun', slot: 8, name: 'RAIL', unlockWave: 9, ammoMax: 28, magSize: 3, reloadTime: 1.70, cooldown: .75, damage: 105, range: 70, pellets: 1, spread: 0, pierce: 8, recoil: .045, type: 'rail' }
];

const MAPS = {
  box: {
    label: 'Big Boxy', size: 58, player: [0, 0],
    obstacles: [
      [-10, -8, 8, 4], [11, 8, 8, 4], [-18, 13, 5, 10], [18, -13, 5, 10],
      [0, 20, 16, 3], [0, -20, 16, 3], [-25, 0, 3, 16], [25, 0, 3, 16]
    ],
    spawns: [[-24,-24],[24,-24],[-24,24],[24,24], [0,-26], [0,26], [-26,0], [26,0]]
  },
  lane: {
    label: 'Thin Line', size: 62, player: [0, 0],
    obstacles: [
      [-18, 0, 5, 46], [18, 0, 5, 46],
      [0, -17, 16, 4], [0, 17, 16, 4],
      [-6, -28, 4, 10], [6, 28, 4, 10]
    ],
    spawns: [[0,-28], [0,28], [-24,-24], [24,24], [-24,24], [24,-24]]
  },
  castle: {
    label: '4 Castles', size: 64, player: [0, -9],
    obstacles: [
      [-17,-17,10,10], [17,-17,10,10], [-17,17,10,10], [17,17,10,10],
      [0,-22,14,3], [0,22,14,3], [-22,0,3,14], [22,0,3,14],
      [0,0,4,4]
    ],
    spawns: [[-27,-27], [27,-27], [-27,27], [27,27], [0,-29], [0,29], [-29,0], [29,0]]
  },
  maze: {
    label: 'Backrooms Maze XL', size: 112, player: [0, 0],
    obstacles: [
      [-43,-36,2,26], [-43,-3,2,24], [-43,32,2,30],
      [-31,-46,24,2], [-22,-33,2,18], [-17,-21,28,2], [-31,-8,20,2], [-21,9,2,22], [-35,23,22,2], [-26,43,2,20],
      [-7,-43,2,22], [5,-31,24,2], [18,-47,2,18], [33,-38,26,2], [45,-23,2,28],
      [28,-15,20,2], [12,-5,2,18], [29,4,28,2], [42,18,2,24], [22,30,24,2], [8,43,2,22],
      [-4,21,28,2], [-8,35,2,18], [-1,-17,2,16], [4,12,2,20],
      [-51,0,12,2], [51,0,12,2], [0,-51,2,12], [0,51,2,12],
      [-52,-52,10,2], [52,-52,10,2], [-52,52,10,2], [52,52,10,2],
      [-14,0,10,2], [16,17,2,10], [-16,16,2,12], [15,-19,2,10], [33,45,18,2], [-46,47,18,2],
      [-52,-18,2,18], [52,24,2,18], [-10,-52,18,2], [28,52,18,2]
    ],
    spawns: [[-50,-50], [50,-50], [-50,50], [50,50], [0,-52], [0,52], [-52,0], [52,0], [-34,45], [37,-44], [-45,26], [44,-18]]
  }
};

class NetAdapter {
  constructor(game) {
    this.game = game;
    this.enabled = false;
    this.connected = false;
    this.socket = null;
    this.room = null;
    this.lastInputAt = 0;
    this.lastInputSeq = 0;
    this.playerToken = this.loadPlayerToken();
    this.serverUrl = this.resolveServerUrl();
    this.pingMs = null;
    this.pingTimer = null;
    this.lastRoomSnapshot = null;
    this.connect();
  }



  loadPlayerToken() {
    try {
      let token = localStorage.getItem('bhfps_player_token');
      if (!token) {
        token = 'pt_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('bhfps_player_token', token);
      }
      return token;
    } catch (_) {
      return 'pt_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
  }

  resolveServerUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get('server') || '';
      const fromConfig = window.BHFPS_CONFIG?.SERVER_URL || '';
      return String(fromQuery || fromConfig || '').trim().replace(/\/$/, '');
    } catch (_) { return ''; }
  }

  updatePingUI(ms = null) {
    this.pingMs = Number.isFinite(ms) ? Math.max(0, Math.round(ms)) : null;
    if (!UI.pingText) return;
    UI.pingText.classList.remove('warn', 'bad');
    if (this.pingMs == null || !this.connected) {
      UI.pingText.textContent = 'PING --';
      return;
    }
    UI.pingText.textContent = `PING ${this.pingMs}ms`;
    if (this.pingMs > 180) UI.pingText.classList.add('bad');
    else if (this.pingMs > 90) UI.pingText.classList.add('warn');
  }

  startPingLoop() {
    clearInterval(this.pingTimer);
    const pingOnce = () => {
      if (!this.socket?.connected) { this.updatePingUI(null); return; }
      const t0 = performance.now();
      this.socket.timeout(1600).emit('latencyPing', { t: Date.now() }, (err) => {
        if (err) { this.updatePingUI(null); return; }
        this.updatePingUI(performance.now() - t0);
      });
    };
    pingOnce();
    this.pingTimer = setInterval(pingOnce, 2500);
  }

  rememberRoom(roomCode = '') {
    try {
      if (!roomCode) return;
      localStorage.setItem('bhfps_last_room', JSON.stringify({ roomCode, token: this.playerToken, time: Date.now() }));
    } catch (_) {}
  }

  tryRestoreRoom() {
    if (!this.connected || !this.game?.lobby?.roomCode) return;
    this.socket.emit('joinRoom', { roomCode: this.game.lobby.roomCode, playerToken: this.playerToken, reconnect: true });
  }

  setNetStatus(state = 'offline', text = '') {
    if (!UI.netState || !UI.netStatusText) return;
    UI.netState.classList.remove('connected', 'offline', 'error');
    UI.netState.classList.add(state === 'connected' ? 'connected' : (state === 'error' ? 'error' : 'offline'));
    UI.netState.textContent = state === 'connected' ? '서버 연결됨' : (state === 'error' ? '서버 오류' : '서버 미연결');
    UI.netStatusText.textContent = text || (state === 'connected'
      ? 'Socket.IO 서버 기반 방 만들기/입장/준비/시작을 사용 중이다.'
      : 'npm install 후 npm start로 실행하면 실제 서버 로비가 켜진다.');
  }

  connect() {
    if (typeof window === 'undefined' || typeof window.io !== 'function') {
      this.setNetStatus('offline', 'Socket.IO 클라이언트를 찾지 못했다. Python 서버로 열면 로컬 테스트 로비만 작동한다.');
      return;
    }
    try {
      const transports = window.BHFPS_CONFIG?.FORCE_WEBSOCKET ? ['websocket'] : ['websocket', 'polling'];
      const options = { transports, timeout: 4500, reconnection: true, reconnectionAttempts: Infinity, reconnectionDelay: 700, reconnectionDelayMax: 4000, auth: { playerToken: this.playerToken } };
      this.socket = this.serverUrl ? window.io(this.serverUrl, options) : window.io(options);
    } catch (err) {
      this.setNetStatus('error', 'Socket.IO 초기화 실패: ' + (err?.message || err));
      return;
    }

    this.socket.on('connect', () => {
      this.connected = true;
      this.enabled = true;
      const where = this.serverUrl || location.origin;
      this.setNetStatus('connected', `서버 접속 완료 · ${where} · id ${this.socket.id.slice(0, 5)}`);
      this.startPingLoop();
      this.game.updateLobbyUI('서버에 연결됐다. 2인 플레이에서 방을 만들거나 방 코드로 입장할 수 있다.');
      this.tryRestoreRoom();
    });
    this.socket.on('disconnect', () => {
      this.connected = false;
      this.updatePingUI(null);
      this.setNetStatus('offline', '서버 연결이 끊겼다. 자동 재접속을 시도한다.');
      this.game.updateLobbyUI('서버 연결이 끊겼다. 방을 다시 만들거나 입장해야 한다.');
    });
    this.socket.on('connect_error', (err) => {
      this.connected = false;
      this.updatePingUI(null);
      this.setNetStatus('error', '서버 접속 실패: ' + (err?.message || 'unknown') + (this.serverUrl ? ` · ${this.serverUrl}` : ''));
    });
    this.socket.on('roomCreated', (payload) => this.applyRoomState(payload, '방을 만들었다. 방 코드를 상대에게 알려줘라.'));
    this.socket.on('roomJoined', (payload) => this.applyRoomState(payload, '방에 입장했다. 준비를 누르면 호스트가 시작할 수 있다.'));
    this.socket.on('lobbyUpdate', (payload) => this.applyRoomState(payload));
    this.socket.on('lobbyError', (payload) => {
      this.game.updateLobbyUI(payload?.message || '로비 오류가 발생했다.');
      this.setNetStatus('error', payload?.message || '로비 오류');
    });
    this.socket.on('gameStart', (payload) => {
      const settings = payload?.settings || {};
      if (settings.map) UI.map.value = settings.map;
      if (settings.diff) UI.diff.value = settings.diff;
      if (settings.quality) UI.quality.value = settings.quality;
      if (settings.startWave) UI.startWave.value = String(settings.startWave);
      this.game.updateLobbyUI('서버가 게임 시작 신호를 보냈다. 양쪽 클라이언트가 같은 설정으로 시작한다.');
      this.game.startFromMenu(true);
    });
    this.socket.on('remoteInput', (payload) => {
      this.game.applyRemoteInput(payload?.playerId, payload?.state || payload?.input);
    });
    this.socket.on('stateSnapshot', (payload) => {
      this.game.applyNetworkSnapshot(payload);
    });
    this.socket.on('remoteAction', (payload) => {
      this.game.applyRemoteAction(payload?.playerId, payload?.action || payload);
    });
  }

  roomPlayersToLobby(room) {
    const selfId = this.socket?.id;
    const players = room?.players || [];
    const self = players.find(p => p.id === selfId);
    const other = players.find(p => p.id !== selfId);
    const role = self?.role || (room?.hostId === selfId ? 'host' : 'guest');
    return {
      mode: 'coop',
      role,
      roomCode: room?.roomCode || '',
      ready: !!self?.ready,
      remoteReady: !!other?.ready,
      remoteSeen: !!other,
      playerId: selfId || this.game.lobby.playerId || 'net-local'
    };
  }

  applyRoomState(payload = {}, extra = '') {
    const room = payload.room || payload;
    if (!room?.roomCode) return;
    this.room = room;
    this.lastRoomSnapshot = room;
    this.rememberRoom(room.roomCode);
    this.game.lobby = this.roomPlayersToLobby(room);
    if (UI.roomCodeInput) UI.roomCodeInput.value = room.roomCode;
    this.game.setPlayMode('coop');
    this.game.updateLobbyUI(extra);
    if (payload.message) this.game.showToast(payload.message);
  }

  createRoom(settings = {}) {
    if (!this.connected) return false;
    this.socket.emit('createRoom', { settings, playerToken: this.playerToken });
    this.game.updateLobbyUI('서버에 방 생성 요청 중...');
    return true;
  }

  joinRoom(roomCode = '') {
    if (!this.connected) return false;
    this.socket.emit('joinRoom', { roomCode, playerToken: this.playerToken });
    this.game.updateLobbyUI('서버 방 입장 요청 중...');
    return true;
  }

  setReady(ready) {
    if (!this.connected || !this.game.lobby.roomCode) return false;
    this.socket.emit('setReady', { roomCode: this.game.lobby.roomCode, ready: !!ready });
    return true;
  }

  startGame(settings = {}) {
    if (!this.connected || !this.game.lobby.roomCode) return false;
    this.socket.emit('startGame', { roomCode: this.game.lobby.roomCode, settings });
    this.game.updateLobbyUI('서버에 게임 시작 요청 중...');
    return true;
  }

  sendInput() {
    if (!this.connected || !this.game.running || this.game.paused || this.game.gameOver || this.game.lobby.mode !== 'coop') return;
    const t = performance.now();
    if (t - this.lastInputAt < 33) return; // v35: 서버 권위 이동 보정을 위해 약 30Hz로 입력을 보낸다.
    this.lastInputAt = t;
    const keys = {};
    for (const k of this.game.input.keys) keys[k] = true;
    this.socket.emit('playerInput', {
      roomCode: this.game.lobby.roomCode,
      seq: ++this.lastInputSeq,
      time: t,
      keys,
      look: { yaw: this.game.yaw, pitch: this.game.pitch },
      weapon: this.game.weapon?.id || 'pistol',
      flags: {
        fire: !!this.game.input.mouse.down,
        ads: this.game.ads > .45 || !!this.game.input.mouse.right,
        reload: !!this.game.reload?.active,
        move: Number(this.game.moveIntensity || 0)
      },
      player: { x: this.game.player.x, y: this.game.player.y, z: this.game.player.z, hp: Math.round(this.game.hp) }
    });
  }

  sendAction(actionType, weapon, extra = {}) {
    if (!this.connected || !this.game.running || this.game.paused || this.game.gameOver || this.game.lobby.mode !== 'coop') return false;
    const w = typeof weapon === 'string' ? this.game.getWeapon(weapon) : (weapon || this.game.getWeapon());
    const reserve = this.game.ammo?.[w?.id] === Infinity ? 'Infinity' : (this.game.ammo?.[w?.id] || 0);
    this.socket.emit('playerAction', {
      roomCode: this.game.lobby.roomCode,
      actionType,
      seq: ++this.lastInputSeq,
      time: performance.now(),
      weapon: w?.id || this.game.selectedWeapon || 'pistol',
      look: { yaw: this.game.yaw, pitch: this.game.pitch },
      position: { x: this.game.player.x, y: this.game.player.y, z: this.game.player.z },
      ads: this.game.ads > .45 || !!this.game.input.mouse.right,
      mag: this.game.mag?.[w?.id] || 0,
      reserve,
      ...extra
    });
    return true;
  }

  receiveSnapshot() { return null; }
}

class Input {
  constructor(dom) {
    this.dom = dom;
    this.keys = new Set();
    this.mouse = { dx: 0, dy: 0, down: false, right: false };
    this.wheel = 0;
    this.locked = false;
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
    }, { passive: false });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    dom.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      this.mouse.dx += e.movementX || 0;
      this.mouse.dy += e.movementY || 0;
    });
    dom.addEventListener('mousedown', (e) => {
      if (!this.locked) return;
      if (e.button === 0) this.mouse.down = true;
      if (e.button === 2) this.mouse.right = true;
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.down = false;
      if (e.button === 2) this.mouse.right = false;
    });
    dom.addEventListener('contextmenu', e => e.preventDefault());
    dom.addEventListener('wheel', (e) => {
      if (!this.locked) return;
      this.wheel += Math.sign(e.deltaY);
      e.preventDefault();
    }, { passive: false });
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === dom;
    });
  }
  requestLock() {
    try {
      const result = this.dom.requestPointerLock?.();
      if (result && typeof result.catch === 'function') result.catch(() => {});
    } catch (_) {
      // 포인터락이 거절돼도 게임 시작 자체는 막지 않는다.
    }
  }
  consumeMouse() {
    const m = { dx: this.mouse.dx, dy: this.mouse.dy };
    this.mouse.dx = 0; this.mouse.dy = 0;
    return m;
  }
  consumeWheel() {
    const w = this.wheel;
    this.wheel = 0;
    return w;
  }
  down(code) { return this.keys.has(code); }
}

class AudioBus {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.stepGate = 0;
    this.ambient = null;
    this.bgm = null;
    this.itemGate = 0;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.limiter = null;
    this.musicMood = 'explore';
    this.musicMoodTarget = 'explore';
    this.musicMoodGate = 0;
    this.volumes = { master: 1, sfx: 1, bgm: 1 };
  }
  unlock() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { this.enabled = false; return; }
    try {
      if (!this.ctx) this.ctx = new AC();
      if (!this.masterGain) this.createVolumeGraph();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this.enabled = true;
      this.applyVolumes();
    } catch (_) {
      this.enabled = false;
    }
  }
  createVolumeGraph() {
    if (!this.ctx || this.masterGain) return;
    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.bgmGain = this.ctx.createGain();
    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -8;
    this.limiter.knee.value = 14;
    this.limiter.ratio.value = 10;
    this.limiter.attack.value = .004;
    this.limiter.release.value = .18;
    this.sfxGain.connect(this.masterGain);
    this.bgmGain.connect(this.masterGain);
    this.masterGain.connect(this.limiter);
    this.limiter.connect(this.ctx.destination);
    this.applyVolumes();
  }
  setVolumes(next = {}) {
    this.volumes.master = clamp(Number.isFinite(next.master) ? next.master : this.volumes.master, 0, 1);
    this.volumes.sfx = clamp(Number.isFinite(next.sfx) ? next.sfx : this.volumes.sfx, 0, 1);
    this.volumes.bgm = clamp(Number.isFinite(next.bgm) ? next.bgm : this.volumes.bgm, 0, 1);
    this.applyVolumes();
  }
  applyVolumes() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    this.masterGain.gain.setTargetAtTime(this.volumes.master, t, .015);
    // 기본 소리가 작게 느껴져서 내부 출력 부스트를 적용한다.
    // 슬라이더는 여전히 0~100%로 작동하되, 100% 기준 소리가 더 또렷하게 들린다.
    this.sfxGain.gain.setTargetAtTime(this.volumes.sfx * 3.6, t, .015);
    this.bgmGain.gain.setTargetAtTime(this.volumes.bgm * 3.45, t, .035);
  }
  sfxDestination() { return this.sfxGain || this.ctx?.destination; }
  bgmDestination() { return this.bgmGain || this.ctx?.destination; }
  beep(freq = 220, dur = .05, type = 'square', gain = .03, freqEnd = null) {
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
    osc.connect(g).connect(this.sfxDestination());
    osc.start(t); osc.stop(t + dur + .02);
  }
  noise(dur = .08, gain = .035, filterType = 'lowpass', freq = 900) {
    if (!this.enabled || !this.ctx) return;
    const sr = this.ctx.sampleRate;
    const len = Math.max(1, Math.floor(sr * dur));
    const buffer = this.ctx.createBuffer(1, len, sr);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = 1 - i / len;
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filt = this.ctx.createBiquadFilter();
    filt.type = filterType; filt.frequency.value = freq;
    const g = this.ctx.createGain();
    const t = this.ctx.currentTime;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(filt).connect(g).connect(this.sfxDestination());
    src.start(t); src.stop(t + dur + .02);
  }
  startAmbience() {
    if (!this.enabled || !this.ctx || this.ambient) return;
    const t = this.ctx.currentTime;
    const base = this.ctx.createOscillator();
    const upper = this.ctx.createOscillator();
    const wobble = this.ctx.createOscillator();
    const wobbleGain = this.ctx.createGain();
    const filt = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    // 어둡게 깔리는 저음 대신, 낡은 형광등이 계속 웅웅거리는 느낌.
    base.type = 'sine'; base.frequency.value = 62;
    upper.type = 'triangle'; upper.frequency.value = 124.5;
    wobble.type = 'sine'; wobble.frequency.value = .11;
    wobbleGain.gain.value = 4.2;
    filt.type = 'lowpass'; filt.frequency.value = 520;
    g.gain.value = .044;
    wobble.connect(wobbleGain);
    wobbleGain.connect(base.frequency);
    base.connect(filt); upper.connect(filt);
    filt.connect(g).connect(this.bgmDestination());
    base.start(t); upper.start(t); wobble.start(t);
    this.ambient = { osc: base, upper, wobble, gain: g, filter: filt };
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
    osc.connect(g).connect(dest || this.sfxDestination());
    osc.start(t); osc.stop(t + dur + .04);
  }
  setMusicMood(mood = 'explore') {
    if (!['explore', 'combat', 'danger'].includes(mood)) mood = 'explore';
    this.musicMoodTarget = mood;
    if (!this.bgm || !this.ctx) { this.musicMood = mood; return; }
    if (this.musicMood === mood) return;
    this.musicMood = mood;
    const t = this.ctx.currentTime;
    const gain = mood === 'danger' ? .245 : (mood === 'combat' ? .205 : .155);
    const cutoff = mood === 'danger' ? 1180 : (mood === 'combat' ? 860 : 660);
    this.bgm.master.gain.setTargetAtTime(gain, t, .28);
    this.bgm.filter.frequency.setTargetAtTime(cutoff, t, .35);
    if (this.ambient?.gain) this.ambient.gain.gain.setTargetAtTime(mood === 'danger' ? .058 : .044, t, .35);
  }

  startBgm() {
    if (!this.enabled || !this.ctx || this.bgm) return;
    const master = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const pulseFilter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    pulseFilter.type = 'bandpass';
    pulseFilter.frequency.value = 160;
    master.gain.value = .155;
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
      src.connect(g).connect(pulseFilter);
      src.start(t); src.stop(t + .06);
    };

    const scheduleBar = () => {
      if (!this.enabled || !this.ctx || !this.bgm) return;
      const mood = this.musicMood || 'explore';
      const base = this.ctx.currentTime + .035;
      const bass = mood === 'danger' ? bassDanger : (mood === 'combat' ? bassCombat : bassExplore);
      const lead = mood === 'danger' ? leadDanger : (mood === 'combat' ? leadCombat : leadExplore);
      const beat = mood === 'danger' ? .30 : (mood === 'combat' ? .36 : .48);
      const bassGain = mood === 'danger' ? .034 : (mood === 'combat' ? .028 : .022);
      const leadGain = mood === 'danger' ? .018 : (mood === 'combat' ? .014 : .010);

      for (let i = 0; i < 8; i++) {
        const t = base + i * beat;
        const n = bass[(step + i) % bass.length];
        this.toneAt(n, t, beat * .82, 'sawtooth', bassGain, filter);
        if (mood !== 'explore') {
          this.toneAt(n * 2.01, t + beat * .52, beat * .18, 'square', bassGain * .55, filter);
          if (i % 2 === 0) hitNoise(t + .015, mood === 'danger' ? .024 : .016);
        }
      }
      for (let i = 0; i < 16; i++) {
        const n = lead[(step * 2 + i) % lead.length];
        if (!n) continue;
        const t = base + i * (beat / 2);
        this.toneAt(n, t, beat * .34, mood === 'danger' ? 'square' : 'triangle', leadGain, filter);
      }
      step = (step + 8) % 64;
    };

    this.bgm = { master, filter, pulseFilter, timer: setInterval(scheduleBar, 2900) };
    this.setMusicMood(this.musicMoodTarget || 'explore');
    scheduleBar();
  }

  stopBgm() {
    if (!this.bgm) return;
    clearInterval(this.bgm.timer);
    try { this.bgm.master.disconnect(); } catch (_) {}
    try { this.bgm.filter.disconnect(); } catch (_) {}
    try { this.bgm.pulseFilter?.disconnect(); } catch (_) {}
    this.bgm = null;
  }
  headshot() { this.beep(980, .055, 'triangle', .030, 1480); setTimeout(() => this.beep(520, .045, 'square', .018), 44); }
  shieldHit() { this.beep(280, .035, 'square', .018, 170); this.noise(.045, .020, 'highpass', 1800); }
  bomberWarn() { this.beep(980, .045, 'square', .016, 760); }
  lowHpBeat() { this.beep(72, .08, 'sine', .018, 60); }
  reload(kind = 'pistol') {
    const base = kind === 'rocket' || kind === 'shotgun' || kind === 'railgun' ? 180 : 260;
    this.beep(base, .055, 'triangle', .024, base * .7);
    setTimeout(() => this.beep(base * 1.45, .04, 'triangle', .018, base), 95);
    this.noise(.04, .018, 'highpass', 1200);
  }

  shoot(kind) {
    const map = {
      pistol: [340,.045,'square',.050,145], smg: [520,.028,'square',.035,180], shotgun: [150,.09,'sawtooth',.100,55],
      rocket: [82,.18,'sawtooth',.095,35], railgun: [760,.085,'triangle',.070,380], grenade: [170,.06,'triangle',.052,90],
      barrel: [115,.05,'square',.040,70], wall: [210,.045,'triangle',.038,130]
    };
    this.beep(...(map[kind] || map.pistol));
    if (['pistol','smg','shotgun'].includes(kind)) this.noise(kind === 'shotgun' ? .07 : .035, kind === 'shotgun' ? .070 : .040, 'bandpass', 1400);
  }
  hit() { this.noise(.045, .026, 'bandpass', 720); this.beep(88, .045, 'sawtooth', .018, 42); }
  pickup() { this.beep(820, .045, 'triangle', .022, 1180); setTimeout(() => this.beep(1180, .04, 'triangle', .018), 50); }
  itemSpawn() { if (!this.ctx || this.ctx.currentTime < this.itemGate) return; this.itemGate = this.ctx.currentTime + .55; this.beep(520, .035, 'triangle', .012, 680); }
  unlockSound() { this.beep(650, .08, 'triangle', .028, 850); setTimeout(() => this.beep(980, .11, 'triangle', .025, 1320), 65); }
  jump() { this.beep(260, .055, 'triangle', .020, 330); }
  playerHit(kind = 'hit') { this.noise(.085, kind === 'explosion' ? .060 : .043, 'lowpass', kind === 'explosion' ? 360 : 520); this.beep(kind === 'fireball' ? 96 : 72, .09, 'sawtooth', kind === 'explosion' ? .040 : .030, 45); }
  earRing(strength = 1) { this.beep(1550, .32 * strength, 'sine', .016 * strength, 980); setTimeout(() => this.beep(2100, .18 * strength, 'sine', .010 * strength, 1700), 80); }
  lowHpBreath() { this.noise(.18, .010, 'lowpass', 180); }
  playerStep(sprinting = false, ads = 0) { this.noise(sprinting ? .045 : .035, sprinting ? .018 : .011, 'lowpass', ads > .5 ? 250 : 360); }
  enemyStep(type = 'zombie') {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (t < this.stepGate) return;
    this.stepGate = t + (type === 'runner' || type === 'bomber' ? .045 : .075);
    const freq = type === 'devil' ? 180 : (type === 'tank' ? 135 : (type === 'shield' ? 235 : 330));
    const gain = type === 'devil' || type === 'tank' ? .028 : .014;
    this.noise(type === 'devil' || type === 'tank' ? .055 : .035, gain, 'lowpass', freq);
  }
  enemyAttack(type = 'zombie') {
    const heavy = type === 'devil' || type === 'tank' || type === 'shield';
    this.noise(type === 'devil' ? .075 : .045, heavy ? .035 : .022, 'bandpass', type === 'devil' ? 320 : (type === 'tank' ? 240 : 620));
  }
  devilCast() { this.beep(190, .13, 'sawtooth', .026, 88); this.noise(.09, .018, 'lowpass', 260); }
  fireballExplode() { this.noise(.10, .045, 'lowpass', 360); this.beep(58, .12, 'sawtooth', .035, 32); }
  placeWall() { this.beep(155, .055, 'square', .020, 95); this.noise(.035, .016, 'lowpass', 400); }
  placeMine() { this.beep(125, .045, 'triangle', .017, 85); this.beep(380, .035, 'triangle', .012, 240); }
  wallCrack() { this.noise(.06, .030, 'highpass', 900); }
  wallBreak() { this.noise(.16, .055, 'lowpass', 460); this.beep(75, .14, 'sawtooth', .040, 38); }
  enemyDeath(type = 'zombie') { this.noise(.13, type === 'devil' ? .055 : .040, 'lowpass', type === 'devil' ? 320 : 520); this.beep(type === 'devil' ? 92 : 130, .09, 'sawtooth', .026, 48); }
  explosion() { this.noise(.16, .06, 'lowpass', 360); this.beep(65, .16, 'sawtooth', .055, 32); }
}

class MiniMap {
  constructor(root) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 180; this.canvas.height = 180;
    root.innerHTML = '';
    root.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }
  draw(game) {
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
    const s = game.map.size;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0,0,w,h);
    const tx = x => (x / s + .5) * w;
    const tz = z => (z / s + .5) * h;
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.strokeRect(2,2,w-4,h-4);
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    for (const ob of game.obstacles) {
      if (ob.kind === 'outer') continue;
      ctx.fillRect(tx(ob.x - ob.w/2), tz(ob.z - ob.d/2), ob.w / s * w, ob.d / s * h);
    }
    for (const e of game.enemies) if (e.alive) {
      const c = e.type === 'devil' ? 'rgba(255,40,30,.95)' :
        e.type === 'runner' ? 'rgba(40,210,255,.95)' :
        e.type === 'tank' ? 'rgba(150,155,165,.95)' :
        e.type === 'bomber' ? 'rgba(255,205,45,.95)' :
        e.type === 'shield' ? 'rgba(110,180,255,.95)' : 'rgba(255,184,70,.95)';
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(tx(e.x), tz(e.z), e.type === 'devil' || e.type === 'tank' ? 3.2 : 2.3, 0, Math.PI*2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(85,215,255,.92)';
    for (const p of game.pickups) if (p.alive) { ctx.fillRect(tx(p.x)-2, tz(p.z)-2, 4, 4); }
    ctx.save();
    ctx.translate(tx(game.player.x), tz(game.player.z));
    ctx.rotate(-game.yaw);
    ctx.fillStyle = '#ffcf4d';
    ctx.beginPath(); ctx.moveTo(0,-7); ctx.lineTo(5,5); ctx.lineTo(-5,5); ctx.closePath(); ctx.fill();
    ctx.restore();
    if (game.remotePlayers && game.remotePlayers.size) {
      for (const r of game.remotePlayers.values()) {
        if (!r?.mesh || r.alive === false) continue;
        ctx.save();
        ctx.translate(tx(r.mesh.position.x), tz(r.mesh.position.z));
        ctx.rotate(-r.mesh.rotation.y);
        ctx.fillStyle = '#7fe8ff';
        ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(4,4); ctx.lineTo(-4,4); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }
  }
}

class Game {
  constructor() {
    this.input = new Input(canvas);
    this.audio = new AudioBus();
    // v38: 1인 플레이 전용. 네트워크/방/2인 동기화는 완전히 비활성화한다.
    this.net = { connected: false, socket: null, sendInput() {}, sendAction() { return false; } };
    this.clock = new THREE.Clock();
    this.tmpV = new THREE.Vector3();
    this.tmpDir = new THREE.Vector3();
    this.tmpEuler = new THREE.Euler(0,0,0,'YXZ');
    this.lastFpsUpdate = 0;
    this.fpsSamples = [];
    this.nextEnemyId = 1;
    this.toastTimer = 0;
    this.centerAlertTimer = 0;
    this.headshotTimer = 0;
    this.lowHealthBeepTimer = 0;
    this.hitDirTimer = 0;
    this.hitShake = 0;
    this.hitShakeTimer = 0;
    this.impactNoiseTimer = 0;
    this.rewardOpen = false;
    this.prepTimer = 0;
    this.prepPhase = false;
    this.runStartTime = 0;
    this.bestStats = this.loadBestStats();
    this.minimap = new MiniMap(UI.minimap);
    this.lobby = { mode: 'single', role: 'solo', roomCode: '', ready: false, remoteReady: false, remoteSeen: false };
    this.remotePlayers = new Map();
    this.lobbyChannel = null;
    // v38: 1인 전용이므로 로비 BroadcastChannel을 만들지 않는다.
    this.setupRenderer();
    this.bindUI();
    this.buildWeaponUI();
    window.addEventListener('resize', () => this.drawStartMapPreview());
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  setupLobbyChannel() {
    try {
      this.lobbyChannel = 'BroadcastChannel' in window ? new BroadcastChannel('boxhead-lowpoly-fps-lobby') : null;
      if (this.lobbyChannel) {
        this.lobbyChannel.onmessage = (ev) => this.handleLobbyMessage(ev.data || {});
      }
    } catch (_) { this.lobbyChannel = null; }
  }

  sendLobbyMessage(msg = {}) {
    const payload = { ...msg, roomCode: this.lobby.roomCode, sender: this.lobby.playerId || 'local', time: Date.now() };
    try { this.lobbyChannel?.postMessage(payload); } catch (_) {}
    try { localStorage.setItem('bhfps_room_' + payload.roomCode, JSON.stringify(payload)); } catch (_) {}
  }

  handleLobbyMessage(msg = {}) {
    if (!msg || !this.lobby?.roomCode || msg.roomCode !== this.lobby.roomCode || msg.sender === this.lobby.playerId) return;
    if (msg.type === 'hello' || msg.type === 'ready') {
      this.lobby.remoteSeen = true;
      this.lobby.remoteReady = !!msg.ready;
      if (this.lobby.role === 'host') this.sendLobbyMessage({ type: 'ready', ready: this.lobby.ready, role: this.lobby.role });
      this.updateLobbyUI();
    }
    if (msg.type === 'start' && this.lobby.role === 'guest') {
      if (msg.map) UI.map.value = msg.map;
      if (msg.diff) UI.diff.value = msg.diff;
      if (msg.quality) UI.quality.value = msg.quality;
      if (msg.startWave) UI.startWave.value = String(msg.startWave);
      this.startFromMenu(true);
    }
  }

  setPlayMode(mode = 'single') {
    mode = 'single';
    this.lobby.mode = mode;
    if (UI.playMode) UI.playMode.value = mode;
    UI.singleModeBtn?.classList.toggle('active', mode === 'single');
    UI.coopModeBtn?.classList.toggle('active', mode === 'coop');
    UI.multiplayerPanel?.classList.toggle('hidden', mode !== 'coop');
    this.updateLobbyUI();
  }

  randomRoomCode() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  currentMenuSettings() {
    return { map: UI.map.value, diff: UI.diff.value, quality: UI.quality.value, startWave: UI.startWave.value };
  }

  createRoom() {
    if (this.net?.createRoom?.(this.currentMenuSettings())) return;
    this.lobby = { mode: 'coop', role: 'host', roomCode: this.randomRoomCode(), ready: false, remoteReady: false, remoteSeen: false, playerId: 'host-' + Math.random().toString(36).slice(2, 8) };
    if (UI.roomCodeInput) UI.roomCodeInput.value = this.lobby.roomCode;
    this.sendLobbyMessage({ type: 'hello', ready: false, role: 'host' });
    this.updateLobbyUI('방을 만들었다. 상대가 같은 주소에서 방 코드로 입장한 뒤 준비하면 시작할 수 있다.');
  }

  joinRoom() {
    const code = (UI.roomCodeInput?.value || '').trim().toUpperCase();
    if (!code) { this.updateLobbyUI('입장할 방 코드를 입력해야 한다.'); return; }
    if (this.net?.joinRoom?.(code)) return;
    this.lobby = { mode: 'coop', role: 'guest', roomCode: code, ready: false, remoteReady: false, remoteSeen: false, playerId: 'guest-' + Math.random().toString(36).slice(2, 8) };
    this.sendLobbyMessage({ type: 'hello', ready: false, role: 'guest' });
    this.updateLobbyUI('방에 입장했다. 준비를 누르면 호스트가 시작할 수 있다.');
  }

  toggleReady() {
    if (this.lobby.mode !== 'coop' || !this.lobby.roomCode) { this.updateLobbyUI('먼저 방을 만들거나 입장해야 한다.'); return; }
    const nextReady = !this.lobby.ready;
    if (this.net?.setReady?.(nextReady)) { this.lobby.ready = nextReady; this.updateLobbyUI('서버에 준비 상태를 전송했다.'); return; }
    this.lobby.ready = nextReady;
    this.sendLobbyMessage({ type: 'ready', ready: this.lobby.ready, role: this.lobby.role });
    this.updateLobbyUI();
  }

  canStartCoop() { return false; }

  updateLobbyUI(extra = '') {
    if (!UI.lobbyRoomCode || !UI.lobbyStatus) return;
    const room = this.lobby.roomCode ? `방 코드: ${this.lobby.roomCode}` : '방 없음';
    UI.lobbyRoomCode.textContent = room;
    if (UI.readyBtn) {
      UI.readyBtn.disabled = this.lobby.mode !== 'coop' || !this.lobby.roomCode;
      UI.readyBtn.textContent = this.lobby.ready ? '준비 취소' : '준비';
    }
    if (UI.startBtn) {
      if (this.lobby.mode === 'coop') {
        UI.startBtn.textContent = this.lobby.role === 'guest' ? '호스트 시작 대기' : '2인 플레이 시작';
        UI.startBtn.disabled = !this.canStartCoop();
      } else {
        UI.startBtn.textContent = '클릭해서 시작';
        UI.startBtn.disabled = false;
      }
    }
    const roleText = this.lobby.role === 'host' ? '호스트' : (this.lobby.role === 'guest' ? '게스트' : '솔로');
    const remote = this.lobby.remoteSeen ? (this.lobby.remoteReady ? '상대 준비 완료' : '상대 대기 중') : '상대 미입장';
    const self = this.lobby.ready ? '내 준비 완료' : '내 준비 대기';
    UI.lobbyStatus.textContent = extra || `1인 플레이 전용 모드다. 멀티/방 만들기 기능은 제거됐다.`;
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x16130b);
    this.scene.fog = new THREE.Fog(0x2a2517, 16, 82);
    this.camera = new THREE.PerspectiveCamera(72, 1, .08, 120);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  bindUI() {
    UI.singleModeBtn?.addEventListener('click', () => this.setPlayMode('single'));
    UI.coopModeBtn?.addEventListener('click', () => this.setPlayMode('coop'));
    UI.createRoomBtn?.addEventListener('click', () => this.createRoom());
    UI.joinRoomBtn?.addEventListener('click', () => this.joinRoom());
    UI.readyBtn?.addEventListener('click', () => this.toggleReady());
    UI.roomCodeInput?.addEventListener('input', () => { UI.roomCodeInput.value = UI.roomCodeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); });
    this.setPlayMode('single');
    this.setupSettingsUI();
    UI.map?.addEventListener('change', () => this.drawStartMapPreview());
    this.drawStartMapPreview();
    // 일부 브라우저/환경에서 button click 이벤트가 포인터락/캔버스 포커스와 충돌해
    // 시작 버튼이 눌리지 않는 것처럼 보일 수 있어 pointerdown + click을 모두 받는다.
    const beginFromMenu = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      this.startFromMenu();
    };
    UI.startBtn.addEventListener('pointerdown', beginFromMenu, { passive: false });
    UI.startBtn.addEventListener('click', beginFromMenu);
    UI.restartBtn.addEventListener('pointerdown', beginFromMenu, { passive: false });
    UI.restartBtn.addEventListener('click', beginFromMenu);
    UI.resumeBtn.addEventListener('pointerdown', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      this.resumeFromPause();
    }, { passive: false });
    UI.resumeBtn.addEventListener('click', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      this.resumeFromPause();
    });
    UI.rewardSkip?.addEventListener('pointerdown', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      this.chooseReward(null);
    }, { passive: false });
    UI.rewardSkip?.addEventListener('click', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      this.chooseReward(null);
    });
    document.addEventListener('keydown', (e) => {
      if (UI.start.classList.contains('show') && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        this.startFromMenu();
        return;
      }
      if (e.code === 'Escape' && this.running && !this.gameOver) {
        e.preventDefault();
        if (this.paused) this.resumeFromPause();
        else this.pause();
      }
    });
    canvas.addEventListener('click', () => {
      if (this.running && !this.gameOver) this.input.requestLock();
    });
    document.addEventListener('pointerlockchange', () => {
      if (this.running && !this.gameOver && !this.paused && !this.rewardOpen && !this.input.locked) this.pause();
    });
  }

  setupSettingsUI() {
    const setLabel = (el, val) => { if (el) el.textContent = `${Math.round(clamp(Number(val) || 0, 0, 100))}%`; };
    if (UI.pauseQuality) UI.pauseQuality.value = UI.quality?.value || 'mid';
    setLabel(UI.masterVolumeLabel, UI.masterVolume?.value || 100);
    setLabel(UI.sfxVolumeLabel, UI.sfxVolume?.value || 100);
    setLabel(UI.bgmVolumeLabel, UI.bgmVolume?.value || 100);
    UI.pauseQuality?.addEventListener('change', () => {
      if (UI.quality) UI.quality.value = UI.pauseQuality.value;
      this.applyRuntimeQuality();
      this.showToast(`그래픽: ${UI.pauseQuality.value.toUpperCase()}`);
    });
    UI.quality?.addEventListener('change', () => {
      if (UI.pauseQuality) UI.pauseQuality.value = UI.quality.value;
      this.applyRuntimeQuality();
    });
    const volumeHandler = () => {
      setLabel(UI.masterVolumeLabel, UI.masterVolume?.value || 0);
      setLabel(UI.sfxVolumeLabel, UI.sfxVolume?.value || 0);
      setLabel(UI.bgmVolumeLabel, UI.bgmVolume?.value || 0);
      this.syncSettingsFromMenu();
    };
    UI.masterVolume?.addEventListener('input', volumeHandler);
    UI.sfxVolume?.addEventListener('input', volumeHandler);
    UI.bgmVolume?.addEventListener('input', volumeHandler);
    volumeHandler();
  }

  syncSettingsFromMenu() {
    this.audio.setVolumes({
      master: (Number(UI.masterVolume?.value ?? 100) || 0) / 100,
      sfx: (Number(UI.sfxVolume?.value ?? 100) || 0) / 100,
      bgm: (Number(UI.bgmVolume?.value ?? 100) || 0) / 100
    });
  }

  applyRuntimeQuality() {
    const key = UI.quality?.value || UI.pauseQuality?.value || 'mid';
    this.quality = QUALITY[key] || QUALITY.mid;
    if (this.scene?.fog) this.scene.fog.far = this.quality.fogFar;
    if (this.renderer) {
      this.renderer.shadowMap.enabled = !!this.quality.shadows;
      this.resize();
    }
  }

  resumeFromPause() {
    if (!this.running || this.gameOver) return;
    this.syncSettingsFromMenu();
    this.applyRuntimeQuality();
    this.paused = false;
    UI.pause.classList.remove('show');
    this.input.requestLock();
  }

  startFromMenu(fromNetwork = false) {
    if (this._startGuard) return;
    // v38: 1인 전용. 어떤 경로로 들어와도 항상 싱글 플레이로 시작한다.
    this.lobby.mode = 'single';
    this._startGuard = true;
    this.start();
    setTimeout(() => { this._startGuard = false; }, 260);
  }

  buildWeaponUI() {
    UI.weaponBar.innerHTML = '';
    for (const w of WEAPON_DEFS) {
      const el = document.createElement('div');
      el.className = 'weapon-slot';
      el.dataset.weapon = w.id;
      el.innerHTML = `<b>${w.slot}</b><span>${w.name}</span>`;
      UI.weaponBar.appendChild(el);
    }
  }

  resize() {
    const q = QUALITY[UI.quality.value] || QUALITY.mid;
    const pr = Math.min(window.devicePixelRatio || 1, q.pixelRatio);
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  start() {
    this.audio.unlock();
    this.syncSettingsFromMenu();
    this.audio.startAmbience();
    this.audio.startBgm();
    this.resize();
    this.running = true;
    this.paused = false;
    this.gameOver = false;
    this.playMode = 'single';
    this.mapKey = UI.map.value;
    this.map = MAPS[this.mapKey];
    this.diff = DIFFICULTY[UI.diff.value] || DIFFICULTY.normal;
    this.quality = QUALITY[UI.quality.value] || QUALITY.mid;
    this.startWave = clamp(parseInt(UI.startWave?.value || '1', 10) || 1, 1, 99);
    this.scene.fog.far = this.quality.fogFar;
    UI.start.classList.remove('show');
    UI.over.classList.remove('show');
    UI.pause.classList.remove('show');
    UI.reward?.classList.remove('show');
    UI.hud.classList.remove('hidden');
    this.runStartTime = now();
    this.resetWorld();
    this.input.requestLock();
    this.showToast(`${this.map.label} / Wave ${this.wave} 시작`);
  }

  pause() {
    if (!this.running || this.gameOver || this.paused) return;
    this.paused = true;
    if (UI.pauseQuality && UI.quality) UI.pauseQuality.value = UI.quality.value;
    this.syncSettingsFromMenu();
    try { if (document.pointerLockElement === canvas) document.exitPointerLock?.(); } catch (_) {}
    UI.pause.classList.add('show');
  }

  resetWorld() {
    while (this.scene.children.length) this.scene.remove(this.scene.children[0]);
    this.renderer.shadowMap.enabled = !!this.quality.shadows;
    this.scene.background = new THREE.Color(0x16130b);
    this.scene.fog = new THREE.Fog(0x2a2517, 14, this.quality.fogFar);
    this.flickerLights = [];

    const hemi = new THREE.HemisphereLight(0xffedb0, 0x4a3b20, .72);
    this.scene.add(hemi);
    const ambient = new THREE.AmbientLight(0xffedb0, .44);
    this.scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffe39a, .56);
    dir.position.set(-9, 14, 6);
    dir.castShadow = !!this.quality.shadows;
    if (dir.castShadow) {
      const shadowSize = this.quality.shadowMap || 1024;
      dir.shadow.mapSize.set(shadowSize, shadowSize);
      dir.shadow.camera.left = -36; dir.shadow.camera.right = 36;
      dir.shadow.camera.top = 36; dir.shadow.camera.bottom = -36;
      dir.shadow.camera.near = 1; dir.shadow.camera.far = 55;
    }
    this.scene.add(dir);
    this.scene.add(this.camera);

    this.materials = {
      floor: new THREE.MeshLambertMaterial({ color: COLORS.floor }),
      wall: new THREE.MeshLambertMaterial({ color: COLORS.wall, flatShading: true }),
      ceiling: new THREE.MeshLambertMaterial({ color: COLORS.ceiling, side: THREE.DoubleSide }),
      wallPanel: new THREE.MeshLambertMaterial({ color: COLORS.wallPanel, flatShading: true }),
      trim: new THREE.MeshLambertMaterial({ color: COLORS.trim }),
      zombie: new THREE.MeshLambertMaterial({ color: COLORS.zombie, flatShading: true }),
      runner: new THREE.MeshLambertMaterial({ color: COLORS.runner, flatShading: true }),
      zombieSuit: new THREE.MeshLambertMaterial({ color: COLORS.zombieSuit, flatShading: true }),
      zombieStripe: new THREE.MeshLambertMaterial({ color: COLORS.zombieStripe, flatShading: true }),
      runnerSuit: new THREE.MeshLambertMaterial({ color: COLORS.runnerSuit, flatShading: true }),
      runnerStripe: new THREE.MeshLambertMaterial({ color: COLORS.runnerStripe, flatShading: true }),
      runnerFace: new THREE.MeshLambertMaterial({ color: COLORS.runnerFace, flatShading: true }),
      tankSuit: new THREE.MeshLambertMaterial({ color: COLORS.tankSuit, flatShading: true }),
      tankArmor: new THREE.MeshLambertMaterial({ color: COLORS.tankArmor, flatShading: true }),
      tankStripe: new THREE.MeshLambertMaterial({ color: COLORS.tankStripe, flatShading: true }),
      bomberSuit: new THREE.MeshLambertMaterial({ color: COLORS.bomberSuit, flatShading: true }),
      bomberVest: new THREE.MeshLambertMaterial({ color: COLORS.bomberVest, flatShading: true }),
      bomberRed: new THREE.MeshLambertMaterial({ color: COLORS.bomberRed, flatShading: true }),
      shieldSuit: new THREE.MeshLambertMaterial({ color: COLORS.shieldSuit, flatShading: true }),
      shieldPlate: new THREE.MeshLambertMaterial({ color: COLORS.shieldPlate, flatShading: true }),
      shieldEdge: new THREE.MeshLambertMaterial({ color: COLORS.shieldEdge, flatShading: true }),
      devil: new THREE.MeshLambertMaterial({ color: COLORS.devil, flatShading: true }),
      skin: new THREE.MeshLambertMaterial({ color: COLORS.skin, flatShading: true }),
      hair: new THREE.MeshLambertMaterial({ color: COLORS.hair, flatShading: true }),
      shirtBlack: new THREE.MeshLambertMaterial({ color: COLORS.shirtBlack, flatShading: true }),
      suitWhite: new THREE.MeshLambertMaterial({ color: COLORS.suitWhite, flatShading: true }),
      iceBlue: new THREE.MeshLambertMaterial({ color: COLORS.iceBlue, flatShading: true }),
      gloveBlue: new THREE.MeshLambertMaterial({ color: COLORS.gloveBlue, flatShading: true }),
      devilRed: new THREE.MeshLambertMaterial({ color: COLORS.devilRed, flatShading: true }),
      devilDark: new THREE.MeshLambertMaterial({ color: COLORS.devilDark, flatShading: true }),
      devilEye: new THREE.MeshBasicMaterial({ color: COLORS.devilEye }),
      shoeBlack: new THREE.MeshLambertMaterial({ color: COLORS.shoeBlack, flatShading: true }),
      weaponDark: new THREE.MeshLambertMaterial({ color: COLORS.weaponDark, flatShading: true }),
      weaponMetal: new THREE.MeshLambertMaterial({ color: COLORS.weaponMetal, flatShading: true }),
      gunPistol: new THREE.MeshLambertMaterial({ color: 0x242a33, flatShading: true }),
      gunSmg: new THREE.MeshLambertMaterial({ color: 0x1f4d3a, flatShading: true }),
      gunShotgun: new THREE.MeshLambertMaterial({ color: 0x6b3d22, flatShading: true }),
      gunGrenade: new THREE.MeshLambertMaterial({ color: 0x3d6b2e, flatShading: true }),
      gunMine: new THREE.MeshLambertMaterial({ color: 0x2c3035, flatShading: true }),
      gunWall: new THREE.MeshLambertMaterial({ color: 0xd5a92f, flatShading: true }),
      gunRocket: new THREE.MeshLambertMaterial({ color: 0x8e2e26, flatShading: true }),
      gunRail: new THREE.MeshLambertMaterial({ color: 0x1e6f82, flatShading: true }),
      gunAccent: new THREE.MeshBasicMaterial({ color: 0x7bf7ff }),
      gunRedAccent: new THREE.MeshBasicMaterial({ color: 0xff4b35 }),
      gunYellowAccent: new THREE.MeshBasicMaterial({ color: 0xffd45a }),
      outline: new THREE.MeshLambertMaterial({ color: COLORS.outline, flatShading: true }),
      outlineBack: new THREE.MeshBasicMaterial({ color: COLORS.outline, side: THREE.BackSide }),
      lineOutline: new THREE.LineBasicMaterial({ color: COLORS.outline }),
      bullet: new THREE.MeshBasicMaterial({ color: COLORS.bullet }),
      fire: new THREE.MeshBasicMaterial({ color: COLORS.fire }),
      pickup: new THREE.MeshBasicMaterial({ color: COLORS.pickup }),
      itemBox: new THREE.MeshLambertMaterial({ color: COLORS.itemBox, flatShading: true }),
      itemBand: new THREE.MeshLambertMaterial({ color: COLORS.itemBand, flatShading: true }),
      itemHealth: new THREE.MeshLambertMaterial({ color: COLORS.itemHealth, flatShading: true }),
      lightPanel: new THREE.MeshBasicMaterial({ color: COLORS.lightPanel }),
      barrel: new THREE.MeshLambertMaterial({ color: COLORS.barrel, flatShading: true }),
      mineDark: new THREE.MeshLambertMaterial({ color: COLORS.mineDark, flatShading: true }),
      mineMetal: new THREE.MeshLambertMaterial({ color: COLORS.mineMetal, flatShading: true }),
      blood: new THREE.MeshLambertMaterial({ color: COLORS.blood, flatShading: true }),
      bloodDark: new THREE.MeshBasicMaterial({ color: COLORS.bloodDark }),
      crack: new THREE.MeshBasicMaterial({ color: COLORS.crack }),
      dust: new THREE.MeshLambertMaterial({ color: COLORS.dust, flatShading: true }),
      fakeWall: new THREE.MeshLambertMaterial({ color: COLORS.fakeWall, flatShading: true }),
      wallPreviewValid: new THREE.MeshBasicMaterial({ color: 0x7fe8ff, transparent: true, opacity: .34, depthWrite: false }),
      wallPreviewInvalid: new THREE.MeshBasicMaterial({ color: 0xff4d35, transparent: true, opacity: .30, depthWrite: false }),
      rail: new THREE.MeshBasicMaterial({ color: 0xdfffff, transparent: true, opacity: .72 })
    };

    this.geos = {
      floor: new THREE.PlaneGeometry(this.map.size, this.map.size, 1, 1),
      ceiling: new THREE.PlaneGeometry(this.map.size, this.map.size, 1, 1),
      wall: new THREE.BoxGeometry(1, WORLD.WALL_HEIGHT, 1),
      lowBox: new THREE.BoxGeometry(1, 1, 1),
      charHead: new THREE.BoxGeometry(.72, .72, .72),
      charTorso: new THREE.BoxGeometry(.78, .92, .42),
      charArm: new THREE.BoxGeometry(.22, .76, .24),
      charLeg: new THREE.BoxGeometry(.28, .56, .26),
      charShoe: new THREE.BoxGeometry(.38, .17, .48),
      facePanel: new THREE.BoxGeometry(.50, .32, .026),
      hairCap: new THREE.BoxGeometry(.74, .20, .74),
      horn: new THREE.ConeGeometry(.17, .92, 3),
      lightPanel: new THREE.BoxGeometry(2.8, .04, .74),
      sphere: new THREE.IcosahedronGeometry(.25, 0),
      pickup: new THREE.OctahedronGeometry(.38, 0),
      rail: new THREE.BoxGeometry(.06, .06, 1),
      bulletSlug: new THREE.BoxGeometry(1, 1, 1),
      mine: new THREE.CylinderGeometry(.58, .68, .18, 20),
      mineButton: new THREE.CylinderGeometry(.26, .30, .08, 16),
      bloodPatch: new THREE.BoxGeometry(1, 1, .018)
    };
    this.edgeCache = new Map();
    this.navGrid = null;
    this.navVersion = 1;
    this.collisionIndexDirty = true;
    this.obstacleIndex = null;
    this.rayQueryCache = null;
    this.fakeWallVisualCount = 0;
    // 플레이어가 설치 벽으로 둘러싸인 상황에서 적 AI가 매 프레임 비싼 경로탐색을 반복하지 않도록 제어한다.
    this.pathFailCacheTtl = 1.25;


    const floor = new THREE.Mesh(this.geos.floor, this.materials.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = !!this.quality.shadows;
    this.scene.add(floor);

    const ceiling = new THREE.Mesh(this.geos.ceiling, this.materials.ceiling);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = WORLD.CEILING_HEIGHT;
    ceiling.receiveShadow = false;
    this.scene.add(ceiling);

    this.obstacles = [];
    const s = this.map.size;
    this.addObstacle(0, -s/2, s, 2, 'outer');
    this.addObstacle(0, s/2, s, 2, 'outer');
    this.addObstacle(-s/2, 0, 2, s, 'outer');
    this.addObstacle(s/2, 0, 2, s, 'outer');
    for (const o of this.map.obstacles) this.addObstacle(o[0], o[1], o[2], o[3], 'map');
    this.addBackroomsDetails();

    const playerStart = this.safePlayerStart(this.map.player[0], this.map.player[1]);
    this.player = {
      x: playerStart.x, z: playerStart.z, y: 0, vy: 0,
      radius: WORLD.PLAYER_RADIUS, eyeHeight: WORLD.EYE_HEIGHT,
      speed: 4.45, sprint: 7.65, grounded: true, vx: 0, vz: 0,
      stamina: 100, maxStamina: 100, staminaRegen: 20, staminaDrain: 40, staminaLocked: false
    };
    this.yaw = Math.PI; this.pitch = 0; this.moveIntensity = 0; this.bobPhase = 0; this.jumpHeld = false; this.weaponKick = 0; this.playerStepCd = 0;
    this.ads = 0; this.adsTarget = 0; this.baseFov = 72; this.adsFov = 56;
    this.upgrades = {
      damage: 1, headshot: 1, speed: 0, wallHp: 1, ammoGain: 1, medkitMax: 0, staminaRegen: 0, reload: 1
    };
    this.hp = 100; this.maxHp = 100; this.downed = false; this._downToastShown = false;
    this.medkits = 0; this.maxMedkits = 100;
    this.assistHold = 0; this.assistTargetId = null; this.assistSent = false; this.eSelfConsumed = false;
    this.wave = (this.startWave || 1) - 1; this.score = 0; this.kills = 0; this.headshots = 0; this.rewardsTaken = 0;
    this.rewardOpen = false; this.prepTimer = 0; this.prepPhase = false;
    this.waveBreak = 0; this.spawnQueue = 0; this.spawnTimer = 0;
    this.currentMission = null; this.missionTimer = 0; this.missionCompletePending = false; this.objectiveCores = [];
    this.enemies = []; this.projectiles = []; this.pickups = []; this.fx = []; this.placeables = [];
    this.serverEnemyAuthority = false; this._serverEnemyAuthorityStarted = false;
    this.remotePlayers = new Map();
    this.enemyIntroduced = new Set();
    this.waveTipShown = new Set();
    this.centerAlertTimer = 0; this.headshotTimer = 0; this.lowHealthBeepTimer = 0; this.hitDirTimer = 0; this.hitShake = 0; this.hitShakeTimer = 0; this.impactNoiseTimer = 0;
    this.audio.setMusicMood('explore');
    UI.centerAlert?.classList.remove('show','danger','info');
    UI.reward?.classList.remove('show');
    UI.headshot?.classList.remove('show');
    UI.lowHealth?.classList.remove('show');
    this.wallPreview = this.createWallPreview();
    this.itemBoxTimer = 2.2;
    this.cooldowns = {};
    this.ammo = {}; // reserve ammo. magazine ammo is stored separately in this.mag
    this.mag = {};
    this.reload = { active: false, weapon: null, timer: 0, duration: 0 };
    this.unlocked = new Set(['pistol']);
    for (const w of WEAPON_DEFS) {
      this.ammo[w.id] = Number.isFinite(w.ammoMax) ? Math.ceil(w.ammoMax * (this.startWave > 1 ? .62 : .45)) : Infinity;
      if (w.magSize) this.mag[w.id] = w.magSize;
    }
    this.ammo.pistol = Infinity;
    this.mag.pistol = this.getWeapon('pistol').magSize;
    this.selectedWeapon = 'pistol';
    this.selectWeapon('pistol', true);
    this.buildViewWeapon();
    this.nextWave();
    if (!(this.lobby?.mode === 'coop' && this.net?.connected)) this.spawnInitialItemBoxes();
    this.updateCamera();
    this.updateHud();
  }

  addGridLines() {
    // 이전 테스트용 그리드. 현재는 Backrooms 세부 장식으로 대체된다.
    this.addBackroomsDetails();
  }

  applyShadows(mesh, cast = true, receive = true) {
    if (!mesh) return mesh;
    mesh.castShadow = !!this.quality.shadows && cast;
    mesh.receiveShadow = !!this.quality.shadows && receive;
    return mesh;
  }

  addBackroomsDetails() {
    const s = this.map.size / 2;
    const floorMat = new THREE.LineBasicMaterial({ color: 0x191710, transparent: true, opacity: .30 });
    const ceilMat = new THREE.LineBasicMaterial({ color: 0x2c2a1f, transparent: true, opacity: .28 });
    const group = new THREE.Group();

    // 낡은 카펫과 천장 타일 라인. 텍스처 없이 선만 써서 가볍게 Backrooms 분위기를 낸다.
    for (let i = -s; i <= s; i += 4) {
      const fa = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-s, .014, i), new THREE.Vector3(s, .014, i)]);
      const fb = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i, .014, -s), new THREE.Vector3(i, .014, s)]);
      group.add(new THREE.Line(fa, floorMat)); group.add(new THREE.Line(fb, floorMat));
      const ca = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-s, WORLD.CEILING_HEIGHT - .012, i), new THREE.Vector3(s, WORLD.CEILING_HEIGHT - .012, i)]);
      const cb = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i, WORLD.CEILING_HEIGHT - .012, -s), new THREE.Vector3(i, WORLD.CEILING_HEIGHT - .012, s)]);
      group.add(new THREE.Line(ca, ceilMat)); group.add(new THREE.Line(cb, ceilMat));
    }
    this.scene.add(group);

    // 낮은 비용의 형광등 패널 + 제한된 포인트 라이트.
    const candidates = [];
    for (let x = -s + 8; x <= s - 8; x += 12) {
      for (let z = -s + 8; z <= s - 8; z += 12) {
        if (!this.collides(x, z, 1.8)) candidates.push({ x: x + rand(-1.4, 1.4), z: z + rand(-1.4, 1.4) });
      }
    }
    candidates.sort(() => Math.random() - .5);
    const count = Math.min(this.quality.lightCount, candidates.length);
    for (let i = 0; i < count; i++) {
      const p = candidates[i];
      const panel = new THREE.Mesh(this.geos.lightPanel, this.materials.lightPanel);
      panel.position.set(p.x, WORLD.CEILING_HEIGHT - .045, p.z);
      panel.rotation.y = Math.random() > .5 ? Math.PI / 2 : 0;
      this.scene.add(panel);
      const light = new THREE.PointLight(i % 5 === 0 ? 0xd8ffe0 : 0xffefb0, i < 3 ? 1.55 : .92, 24, 1.55);
      light.position.set(p.x, WORLD.CEILING_HEIGHT - .55, p.z);
      light.castShadow = false;
      this.scene.add(light);
      this.flickerLights.push({ light, base: light.intensity, phase: Math.random() * Math.PI * 2, speed: rand(.75, 1.9), broken: Math.random() < .20 });
    }

    // 공포 분위기용 어두운 얼룩/축축한 자국. 전부 납작한 박스라 렉 부담이 작다.
    const stainMat = new THREE.MeshBasicMaterial({ color: 0x16130b, transparent: true, opacity: .22, depthWrite: false });
    const redStainMat = new THREE.MeshBasicMaterial({ color: 0x4b0707, transparent: true, opacity: .18, depthWrite: false });
    const stainGeo = new THREE.BoxGeometry(1, .018, 1);
    const stainCount = Math.min(32, Math.max(12, Math.floor(this.map.size / 4)));
    for (let i = 0; i < stainCount; i++) {
      let x = rand(-s + 5, s - 5), z = rand(-s + 5, s - 5);
      for (let tries = 0; tries < 8 && this.collides(x, z, 1.3); tries++) { x = rand(-s + 5, s - 5); z = rand(-s + 5, s - 5); }
      if (this.collides(x, z, 1.3)) continue;
      const m = new THREE.Mesh(stainGeo, Math.random() < .18 ? redStainMat : stainMat);
      m.position.set(x, .032, z);
      m.rotation.y = Math.random() * Math.PI;
      m.scale.set(rand(1.2, 4.8), 1, rand(.55, 2.2));
      this.scene.add(m);
    }
  }

  safePlayerStart(x, z) {
    if (!this.collides(x, z, WORLD.PLAYER_RADIUS + .18)) return { x, z };
    const candidates = [[0,0], [0,-9], [0,9], [-9,0], [9,0], ...(this.map?.spawns || [])];
    for (const c of candidates) {
      const cx = c[0], cz = c[1];
      if (!this.collides(cx, cz, WORLD.PLAYER_RADIUS + .35)) return { x: cx, z: cz };
    }
    const half = this.map.size / 2 - 6;
    for (let r = 3; r < half; r += 3) {
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        const cx = Math.cos(a) * r, cz = Math.sin(a) * r;
        if (!this.collides(cx, cz, WORLD.PLAYER_RADIUS + .35)) return { x: cx, z: cz };
      }
    }
    return { x: 0, z: 0 };
  }

  addObstacle(x, z, w, d, kind = 'map', hp = Infinity) {
    const mat = kind === 'fakeWall' ? this.materials.fakeWall : this.materials.wall;
    const mesh = new THREE.Mesh(this.geos.wall, mat);
    mesh.position.set(x, WORLD.WALL_HEIGHT / 2, z); mesh.scale.set(w, 1, d);
    // 플레이어가 설치하는 벽은 개수가 빠르게 늘 수 있으므로,
    // 그림자는 받되 castShadow와 장식 몰딩을 줄여 draw call 급증을 막는다.
    this.applyShadows(mesh, kind !== 'fakeWall', true);
    this.scene.add(mesh);
    const extras = [];
    if (kind !== 'outer') {
      const edge = new THREE.LineSegments(this.getEdgeGeometry(this.geos.wall), this.materials.lineOutline);
      edge.position.copy(mesh.position); edge.scale.copy(mesh.scale);
      this.scene.add(edge); extras.push(edge);
    }

    // 맵 기본 벽에는 백룸 몰딩을 넣고, 설치 벽은 가볍게 유지한다.
    if (kind !== 'fakeWall' && (kind !== 'outer' || Math.max(w, d) > 6)) {
      const bottom = new THREE.Mesh(this.geos.lowBox, this.materials.trim);
      bottom.position.set(x, .16, z); bottom.scale.set(w + .025, .10, d + .025);
      this.scene.add(bottom); extras.push(bottom);
      const mid = new THREE.Mesh(this.geos.lowBox, this.materials.wallPanel);
      mid.position.set(x, 2.05, z); mid.scale.set(w + .018, .035, d + .018);
      this.scene.add(mid); extras.push(mid);
    }

    const ob = { x, z, w, d, kind, hp, maxHp: hp, mesh, extras, crackLevel: 0, crackGroup: null, alive: true };
    this.obstacles.push(ob);
    this.collisionIndexDirty = true;
    if (kind === 'fakeWall') this.markNavDirty();
    return ob;
  }

  getEdgeGeometry(geo) {
    if (!this.edgeCache) this.edgeCache = new Map();
    if (!this.edgeCache.has(geo.uuid)) this.edgeCache.set(geo.uuid, new THREE.EdgesGeometry(geo, 15));
    return this.edgeCache.get(geo.uuid);
  }

  rebuildCollisionIndex() {
    const cell = 4;
    const half = this.map?.size ? this.map.size / 2 : 64;
    const cols = Math.max(1, Math.ceil((half * 2) / cell));
    const index = new Map();
    const key = (ix, iz) => `${ix},${iz}`;
    for (const o of this.obstacles || []) {
      if (!o.alive) continue;
      const minX = clamp(Math.floor((o.x - o.w/2 - 1.5 + half) / cell), 0, cols - 1);
      const maxX = clamp(Math.floor((o.x + o.w/2 + 1.5 + half) / cell), 0, cols - 1);
      const minZ = clamp(Math.floor((o.z - o.d/2 - 1.5 + half) / cell), 0, cols - 1);
      const maxZ = clamp(Math.floor((o.z + o.d/2 + 1.5 + half) / cell), 0, cols - 1);
      for (let iz = minZ; iz <= maxZ; iz++) {
        for (let ix = minX; ix <= maxX; ix++) {
          const k = key(ix, iz);
          let arr = index.get(k);
          if (!arr) index.set(k, arr = []);
          arr.push(o);
        }
      }
    }
    this.obstacleIndex = { cell, half, cols, index };
    this.collisionIndexDirty = false;
  }

  nearbyObstacles(x, z, radius = 0) {
    if (!this.obstacles) return [];
    if (this.collisionIndexDirty || !this.obstacleIndex) this.rebuildCollisionIndex();
    const oi = this.obstacleIndex;
    if (!oi) return this.obstacles;
    const ix = clamp(Math.floor((x + oi.half) / oi.cell), 0, oi.cols - 1);
    const iz = clamp(Math.floor((z + oi.half) / oi.cell), 0, oi.cols - 1);
    const range = Math.max(1, Math.ceil((radius + 1.2) / oi.cell));
    const seen = new Set();
    const out = [];
    for (let dz = -range; dz <= range; dz++) {
      for (let dx = -range; dx <= range; dx++) {
        const arr = oi.index.get(`${ix + dx},${iz + dz}`);
        if (!arr) continue;
        for (const o of arr) if (!seen.has(o)) { seen.add(o); out.push(o); }
      }
    }
    return out.length ? out : [];
  }

  rayObstacleCandidates(sx, sz, dir, maxT) {
    // 적 AI/총알/데빌 시야 체크가 모든 벽을 매번 훑지 않도록,
    // 공간 분할 그리드를 따라가는 DDA 방식으로 ray가 지나는 셀의 장애물만 검사한다.
    if (!this.obstacles) return [];
    if (this.collisionIndexDirty || !this.obstacleIndex) this.rebuildCollisionIndex();
    const oi = this.obstacleIndex;
    if (!oi || !oi.index) return this.obstacles;
    const dx = dir.x || 0;
    const dz = dir.z || 0;
    const len = Math.hypot(dx, dz);
    if (len < .0001) return this.nearbyObstacles(sx, sz, 1.5);
    const rx = dx / len;
    const rz = dz / len;
    let ix = Math.floor((sx + oi.half) / oi.cell);
    let iz = Math.floor((sz + oi.half) / oi.cell);
    const seen = new Set();
    const out = [];
    const collect = (cx, cz) => {
      const arr = oi.index.get(`${cx},${cz}`);
      if (!arr) return;
      for (const o of arr) {
        if (!o.alive || seen.has(o)) continue;
        seen.add(o);
        out.push(o);
      }
    };
    const stepX = rx > 0 ? 1 : -1;
    const stepZ = rz > 0 ? 1 : -1;
    const nextX = rx > 0 ? (-oi.half + (ix + 1) * oi.cell) : (-oi.half + ix * oi.cell);
    const nextZ = rz > 0 ? (-oi.half + (iz + 1) * oi.cell) : (-oi.half + iz * oi.cell);
    let tMaxX = Math.abs(rx) < .0001 ? Infinity : (nextX - sx) / rx;
    let tMaxZ = Math.abs(rz) < .0001 ? Infinity : (nextZ - sz) / rz;
    if (tMaxX < 0) tMaxX = 0;
    if (tMaxZ < 0) tMaxZ = 0;
    const tDeltaX = Math.abs(rx) < .0001 ? Infinity : oi.cell / Math.abs(rx);
    const tDeltaZ = Math.abs(rz) < .0001 ? Infinity : oi.cell / Math.abs(rz);
    let t = 0;
    let steps = 0;
    const maxSteps = Math.min(220, oi.cols + oi.cols + 30);
    while (t <= maxT && steps++ < maxSteps) {
      if (ix >= 0 && iz >= 0 && ix < oi.cols && iz < oi.cols) collect(ix, iz);
      if (tMaxX < tMaxZ) { ix += stepX; t = tMaxX; tMaxX += tDeltaX; }
      else { iz += stepZ; t = tMaxZ; tMaxZ += tDeltaZ; }
      if ((ix < 0 || iz < 0 || ix >= oi.cols || iz >= oi.cols) && t > maxT) break;
    }
    // 출발점 주변에 걸친 큰 벽이 셀 경계 문제로 빠지는 것을 막기 위한 소량 보정.
    for (const o of this.nearbyObstacles(sx, sz, 2.2)) {
      if (o.alive && !seen.has(o)) { seen.add(o); out.push(o); }
    }
    return out;
  }

  addCartoonStroke(group, geo, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0, inflate = .045) {
    if (!this.materials?.outlineBack || geo === this.geos.rail || geo === this.geos.sphere) return;
    const shell = new THREE.Mesh(geo, this.materials.outlineBack);
    shell.position.set(x, y, z);
    shell.scale.set(sx + inflate, sy + inflate, sz + inflate);
    shell.rotation.set(rx, ry, rz);
    shell.castShadow = false; shell.receiveShadow = false;
    group.add(shell);

    const edges = new THREE.LineSegments(this.getEdgeGeometry(geo), this.materials.lineOutline);
    edges.position.set(x, y, z);
    edges.scale.set(sx * 1.004, sy * 1.004, sz * 1.004);
    edges.rotation.set(rx, ry, rz);
    group.add(edges);
  }

  addPart(group, geo, mat, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) {
    if (mat !== this.materials.outline && mat !== this.materials.outlineBack && mat !== this.materials.lineOutline) {
      this.addCartoonStroke(group, geo, x, y, z, sx, sy, sz, rx, ry, rz);
    }
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    mesh.rotation.set(rx, ry, rz);
    this.applyShadows?.(mesh, true, true);
    group.add(mesh);
    return mesh;
  }

  createBoxheadModel(type) {
    const g = new THREE.Group();
    g.userData.type = type;

    if (type === 'player') {
      // 업로드1 기준 플레이어: 살구색 얼굴, 검은 민소매 몸통, 블록형 팔다리.
      this.addPart(g, this.geos.charTorso, this.materials.shirtBlack, 0, .84, 0, .95, 1.12, .92);
      this.addPart(g, this.geos.charHead, this.materials.skin, 0, 1.58, 0, .98, .98, .98);
      this.addPart(g, this.geos.hairCap, this.materials.hair, 0, 1.98, 0, 1.0, .72, 1.0);
      this.addPart(g, this.geos.facePanel, this.materials.skin, 0, 1.52, .375, .92, .64, 1);
      this.addPart(g, this.geos.charArm, this.materials.skin, -.54, .80, .02, .92, 1.08, .92);
      this.addPart(g, this.geos.charArm, this.materials.skin, .54, .80, .02, .92, 1.08, .92);
      this.addPart(g, this.geos.charLeg, this.materials.skin, -.20, .28, .02, .96, 1, .96);
      this.addPart(g, this.geos.charLeg, this.materials.skin, .20, .28, .02, .96, 1, .96);
      this.addPart(g, this.geos.lowBox, this.materials.weaponDark, -.73, .54, .22, .18, .56, .14, 0, 0, .04);
    } else if (type === 'devil') {
      // 빨간 박스 헤드 + 검은 뿔. Boxhead의 악마 실루엣을 1인칭에서도 멀리서 알아보게 만든다.
      this.addPart(g, this.geos.charTorso, this.materials.devilRed, 0, .82, 0, 1.12, 1.08, 1.08);
      this.addPart(g, this.geos.charHead, this.materials.devilRed, 0, 1.62, 0, 1.03, 1.03, 1.03);
      this.addPart(g, this.geos.facePanel, this.materials.devilDark, 0, 1.65, .375, .72, .26, 1);
      this.addPart(g, this.geos.lowBox, this.materials.devilEye, -.18, 1.68, .392, .13, .055, .025);
      this.addPart(g, this.geos.lowBox, this.materials.devilEye, .18, 1.68, .392, .13, .055, .025);
      this.addPart(g, this.geos.lowBox, this.materials.devilDark, 0, .98, .56, .72, .10, .055);
      this.addPart(g, this.geos.horn, this.materials.hair, -.42, 2.03, .01, 1, 1.05, 1, 0, 0, -.45);
      this.addPart(g, this.geos.horn, this.materials.hair, .42, 2.03, .01, 1, 1.05, 1, 0, 0, .45);
      // 팔은 한 벌만 생성한다. 이전 버전은 고정 팔 + 애니메이션 팔이 겹쳐 보여서
      // 걷는 중 몸이 두 개 겹친 것처럼 보였다.
      const castLeft = new THREE.Group();
      castLeft.position.set(-.62, 1.03, .16);
      this.addPart(castLeft, this.geos.charArm, this.materials.devilRed, 0, -.22, 0, .88, .90, .88);
      const castRight = new THREE.Group();
      castRight.position.set(.62, 1.03, .16);
      this.addPart(castRight, this.geos.charArm, this.materials.devilRed, 0, -.22, 0, .88, .90, .88);
      g.add(castLeft); g.add(castRight);
      g.userData.leftArm = castLeft; g.userData.rightArm = castRight;
      const leftLeg = this.addPart(g, this.geos.charLeg, this.materials.devilRed, -.22, .28, .02, 1.1, 1.03, 1.1);
      const rightLeg = this.addPart(g, this.geos.charLeg, this.materials.devilRed, .22, .28, .02, 1.1, 1.03, 1.1);
      g.userData.leftLeg = leftLeg; g.userData.rightLeg = rightLeg;
    } else if (type === 'tank') {
      // 탱커 좀비: 크고 둔한 체력형. 회색 중장갑 + 노란 경고띠로 일반 좀비와 확실히 구분한다.
      this.addPart(g, this.geos.charTorso, this.materials.tankSuit, 0, .88, 0, 1.34, 1.26, 1.12);
      this.addPart(g, this.geos.lowBox, this.materials.tankArmor, 0, .98, .54, 1.08, .74, .09);
      this.addPart(g, this.geos.lowBox, this.materials.tankStripe, 0, 1.22, .602, .88, .10, .045);
      this.addPart(g, this.geos.charHead, this.materials.tankSuit, 0, 1.68, 0, 1.10, 1.10, 1.10);
      this.addPart(g, this.geos.facePanel, this.materials.iceBlue, 0, 1.66, .414, .84, .58, 1);
      this.addPart(g, this.geos.lowBox, this.materials.tankArmor, -.68, 1.20, .03, .34, .32, .64);
      this.addPart(g, this.geos.lowBox, this.materials.tankArmor, .68, 1.20, .03, .34, .32, .64);
      const left = new THREE.Group(); left.position.set(-.76, .99, .17);
      const right = new THREE.Group(); right.position.set(.76, .99, .17);
      this.addPart(left, this.geos.charArm, this.materials.tankSuit, 0, -.22, 0, .96, 1.05, .96);
      this.addPart(right, this.geos.charArm, this.materials.tankSuit, 0, -.22, 0, .96, 1.05, .96);
      this.addPart(left, this.geos.charShoe, this.materials.tankArmor, 0, -.72, .04, .62, .80, .58);
      this.addPart(right, this.geos.charShoe, this.materials.tankArmor, 0, -.72, .04, .62, .80, .58);
      g.add(left); g.add(right); g.userData.leftArm = left; g.userData.rightArm = right;
      const leftLeg = this.addPart(g, this.geos.charLeg, this.materials.tankSuit, -.28, .28, .02, 1.18, 1.05, 1.18);
      const rightLeg = this.addPart(g, this.geos.charLeg, this.materials.tankSuit, .28, .28, .02, 1.18, 1.05, 1.18);
      g.userData.leftLeg = leftLeg; g.userData.rightLeg = rightLeg;
    } else if (type === 'bomber') {
      // 폭발 좀비: 노랑/주황 경고색 + 빨간 폭발 코어. 멀리서도 우선 처치 대상으로 보이게 한다.
      this.addPart(g, this.geos.charTorso, this.materials.bomberSuit, 0, .82, 0, .94, 1.08, .94);
      this.addPart(g, this.geos.lowBox, this.materials.bomberVest, 0, .95, .525, .78, .72, .08);
      this.addPart(g, this.geos.lowBox, this.materials.bomberRed, 0, .98, .595, .28, .34, .06);
      this.addPart(g, this.geos.lowBox, this.materials.tankStripe, -.30, 1.22, .58, .10, .52, .05, 0, 0, .55);
      this.addPart(g, this.geos.lowBox, this.materials.tankStripe, .30, 1.22, .58, .10, .52, .05, 0, 0, -.55);
      this.addPart(g, this.geos.charHead, this.materials.bomberSuit, 0, 1.58, 0, .96, .96, .96);
      this.addPart(g, this.geos.facePanel, this.materials.runnerFace, 0, 1.55, .370, .82, .60, 1);
      const left = new THREE.Group(); left.position.set(-.55, .96, .16);
      const right = new THREE.Group(); right.position.set(.55, .96, .16);
      this.addPart(left, this.geos.charArm, this.materials.bomberSuit, 0, -.22, 0, .72, .90, .72);
      this.addPart(right, this.geos.charArm, this.materials.bomberSuit, 0, -.22, 0, .72, .90, .72);
      this.addPart(left, this.geos.charShoe, this.materials.bomberRed, 0, -.65, .04, .45, .62, .48);
      this.addPart(right, this.geos.charShoe, this.materials.bomberRed, 0, -.65, .04, .45, .62, .48);
      g.add(left); g.add(right); g.userData.leftArm = left; g.userData.rightArm = right;
      const leftLeg = this.addPart(g, this.geos.charLeg, this.materials.bomberSuit, -.20, .28, .02, .96, 1, .96);
      const rightLeg = this.addPart(g, this.geos.charLeg, this.materials.bomberSuit, .20, .28, .02, .96, 1, .96);
      g.userData.leftLeg = leftLeg; g.userData.rightLeg = rightLeg;
    } else if (type === 'shield') {
      // 실드 좀비: 정면 장갑판. 정면 사격은 약해지고, 측면/헤드샷/폭발물로 처리하도록 만든다.
      this.addPart(g, this.geos.charTorso, this.materials.shieldSuit, 0, .84, 0, 1.00, 1.12, .98);
      this.addPart(g, this.geos.charHead, this.materials.shieldSuit, 0, 1.58, 0, .98, .98, .98);
      this.addPart(g, this.geos.facePanel, this.materials.iceBlue, 0, 1.55, .375, .90, .72, 1);
      this.addPart(g, this.geos.lowBox, this.materials.shieldPlate, 0, .92, .62, 1.08, .96, .12);
      this.addPart(g, this.geos.lowBox, this.materials.shieldEdge, 0, 1.43, .69, 1.16, .08, .05);
      this.addPart(g, this.geos.lowBox, this.materials.shieldEdge, -.58, .92, .69, .08, .98, .05);
      this.addPart(g, this.geos.lowBox, this.materials.shieldEdge, .58, .92, .69, .08, .98, .05);
      const left = new THREE.Group(); left.position.set(-.62, .98, .10);
      const right = new THREE.Group(); right.position.set(.62, .98, .10);
      this.addPart(left, this.geos.charArm, this.materials.shieldSuit, 0, -.22, 0, .72, .92, .72);
      this.addPart(right, this.geos.charArm, this.materials.shieldSuit, 0, -.22, 0, .72, .92, .72);
      this.addPart(left, this.geos.charShoe, this.materials.gloveBlue, 0, -.66, .04, .48, .72, .50);
      this.addPart(right, this.geos.charShoe, this.materials.gloveBlue, 0, -.66, .04, .48, .72, .50);
      g.add(left); g.add(right); g.userData.leftArm = left; g.userData.rightArm = right;
      const leftLeg = this.addPart(g, this.geos.charLeg, this.materials.shieldSuit, -.20, .28, .02, .96, 1, .96);
      const rightLeg = this.addPart(g, this.geos.charLeg, this.materials.shieldSuit, .20, .28, .02, .96, 1, .96);
      g.userData.leftLeg = leftLeg; g.userData.rightLeg = rightLeg;
    } else {
      // 업로드 이미지 기준 좀비: 흰색 수트/방호복 + 푸른 얼굴 패널 + 검은 신발.
      // runner는 같은 계열이지만 살짝 더 푸른 톤과 좁은 몸으로 속도감을 준다.
      const isRunner = type === 'runner';
      const suit = isRunner ? this.materials.runnerSuit : this.materials.zombieSuit;
      const stripe = isRunner ? this.materials.runnerStripe : this.materials.zombieStripe;
      const face = isRunner ? this.materials.runnerFace : this.materials.iceBlue;
      const sx = isRunner ? .82 : 1.04;
      const sy = isRunner ? 1.22 : 1.10;
      this.addPart(g, this.geos.charTorso, suit, 0, .84, 0, sx, sy, .98);
      // 일반 좀비는 주황 경고띠, 러너는 청록색 수트+흰 띠로 멀리서도 구분되게 한다.
      this.addPart(g, this.geos.lowBox, stripe, 0, 1.12, .525, sx * .62, .11, .055);
      this.addPart(g, this.geos.lowBox, stripe, 0, .74, .526, sx * .46, .09, .055, 0, 0, isRunner ? 0 : .42);
      this.addPart(g, this.geos.facePanel, face, 0, 1.01, .238, .82, .42, 1);
      this.addPart(g, this.geos.charHead, suit, 0, 1.58, 0, .98, .98, .98);
      this.addPart(g, this.geos.facePanel, face, 0, 1.55, .375, .90, .76, 1);
      this.addPart(g, this.geos.hairCap, isRunner ? this.materials.runnerFace : this.materials.hair, 0, 1.98, 0, 1.0, .72, 1.0);
      // 팔은 punchLeft/punchRight 그룹만 사용한다. 고정 팔을 별도로 만들지 않아
      // 정지한 팔과 움직이는 팔이 동시에 겹쳐 보이는 문제를 제거했다.
      const punchLeft = new THREE.Group();
      punchLeft.position.set(-.56, .98, .16);
      this.addPart(punchLeft, this.geos.charArm, suit, 0, -.22, 0, .72, .92, .72);
      const punchRight = new THREE.Group();
      punchRight.position.set(.56, .98, .16);
      this.addPart(punchRight, this.geos.charArm, suit, 0, -.22, 0, .72, .92, .72);
      g.add(punchLeft); g.add(punchRight);
      g.userData.leftArm = punchLeft; g.userData.rightArm = punchRight;
      // 손은 몸통에 고정하지 않고 팔 그룹의 하단에 붙인다.
      // 이렇게 해야 걷기/공격 애니메이션 때 손이 팔과 함께 움직인다.
      this.addPart(punchLeft, this.geos.charShoe, isRunner ? this.materials.runnerStripe : this.materials.gloveBlue, 0, -.66, .04, .48, .72, .50);
      this.addPart(punchRight, this.geos.charShoe, isRunner ? this.materials.runnerStripe : this.materials.gloveBlue, 0, -.66, .04, .48, .72, .50);
      const leftLeg = this.addPart(g, this.geos.charLeg, suit, -.20, .28, .02, .96, 1, .96);
      const rightLeg = this.addPart(g, this.geos.charLeg, suit, .20, .28, .02, .96, 1, .96);
      g.userData.leftLeg = leftLeg; g.userData.rightLeg = rightLeg;
    }

    this.addPart(g, this.geos.charShoe, this.materials.shoeBlack, -.23, .04, .10, 1.05, 1, 1.12);
    this.addPart(g, this.geos.charShoe, this.materials.shoeBlack, .23, .04, .10, 1.05, 1, 1.12);
    return g;
  }


  createRemotePlayerModel(role = 'ally') {
    const g = new THREE.Group();
    g.userData.type = 'remotePlayer';

    // 원격 플레이어는 1인칭 손만 보이는 내 캐릭터와 다르게, 협동 플레이에서 바로 알아볼 수 있는
    // 노란 얼굴 + 검은 상의 + 파란 완장/장비 조합으로 만든다.
    const torso = this.addPart(g, this.geos.charTorso, this.materials.shirtBlack, 0, .84, 0, .95, 1.12, .92);
    this.addPart(g, this.geos.lowBox, this.materials.gunAccent, 0, 1.16, .53, .72, .10, .055);
    this.addPart(g, this.geos.charHead, this.materials.skin, 0, 1.58, 0, .98, .98, .98);
    this.addPart(g, this.geos.hairCap, this.materials.hair, 0, 1.98, 0, 1.0, .72, 1.0);
    this.addPart(g, this.geos.facePanel, this.materials.skin, 0, 1.52, .375, .92, .64, 1);

    const leftArm = new THREE.Group(); leftArm.position.set(-.56, .98, .16);
    const rightArm = new THREE.Group(); rightArm.position.set(.56, .98, .16);
    this.addPart(leftArm, this.geos.charArm, this.materials.skin, 0, -.22, 0, .86, .98, .86);
    this.addPart(rightArm, this.geos.charArm, this.materials.skin, 0, -.22, 0, .86, .98, .86);
    this.addPart(leftArm, this.geos.charShoe, this.materials.gloveBlue, 0, -.66, .04, .48, .72, .50);
    this.addPart(rightArm, this.geos.charShoe, this.materials.gloveBlue, 0, -.66, .04, .48, .72, .50);
    g.add(leftArm); g.add(rightArm);
    g.userData.leftArm = leftArm; g.userData.rightArm = rightArm;

    const leftLeg = this.addPart(g, this.geos.charLeg, this.materials.skin, -.20, .28, .02, .96, 1, .96);
    const rightLeg = this.addPart(g, this.geos.charLeg, this.materials.skin, .20, .28, .02, .96, 1, .96);
    this.addPart(g, this.geos.charShoe, this.materials.shoeBlack, -.23, .04, .10, 1.05, 1, 1.12);
    this.addPart(g, this.geos.charShoe, this.materials.shoeBlack, .23, .04, .10, 1.05, 1, 1.12);
    g.userData.leftLeg = leftLeg; g.userData.rightLeg = rightLeg;

    const weapon = new THREE.Group();
    weapon.position.set(.38, .92, .52);
    weapon.rotation.set(-.10, 0, 0);
    const gunBody = this.addPart(weapon, this.geos.lowBox, this.materials.gunSmg, 0, 0, 0, .28, .18, .72);
    const gunBarrel = this.addPart(weapon, this.geos.lowBox, this.materials.weaponMetal, 0, .02, .52, .12, .10, .60);
    const gunAccent = this.addPart(weapon, this.geos.lowBox, this.materials.gunAccent, 0, .13, .02, .22, .045, .36);
    g.add(weapon);
    g.userData.weaponGroup = weapon;
    g.userData.gunBody = gunBody;
    g.userData.gunBarrel = gunBarrel;
    g.userData.gunAccent = gunAccent;

    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256; labelCanvas.height = 64;
    const ctx = labelCanvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillRect(28, 10, 200, 42);
    ctx.strokeStyle = 'rgba(126,232,255,.9)';
    ctx.lineWidth = 3; ctx.strokeRect(28, 10, 200, 42);
    ctx.fillStyle = '#dfffff'; ctx.font = 'bold 24px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(role === 'host' ? 'ALLY HOST' : 'ALLY', 128, 32);
    const tex = new THREE.CanvasTexture(labelCanvas);
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    label.position.set(0, 2.55, 0);
    label.scale.set(1.75, .44, 1);
    g.add(label);
    g.userData.label = label;

    return g;
  }

  ensureRemotePlayer(playerId, data = {}) {
    if (!playerId) return null;
    if (!this.remotePlayers) this.remotePlayers = new Map();
    let r = this.remotePlayers.get(playerId);
    if (r) return r;
    const mesh = this.createRemotePlayerModel(data.role || 'guest');
    const x = Number(data.x ?? data.state?.x ?? 0) || 0;
    const y = Number(data.y ?? data.state?.y ?? 0) || 0;
    const z = Number(data.z ?? data.state?.z ?? 0) || 0;
    mesh.position.set(x, y, z);
    mesh.rotation.y = Number(data.yaw ?? data.state?.yaw ?? 0) || 0;
    this.scene.add(mesh);
    r = {
      id: playerId,
      mesh,
      x, y, z,
      yaw: mesh.rotation.y,
      pitch: 0,
      target: { x, y, z, yaw: mesh.rotation.y, pitch: 0 },
      weapon: 'pistol',
      hp: 100,
      alive: true,
      ads: false,
      fire: false,
      reload: false,
      reloadPulse: 0,
      move: 0,
      walkPhase: Math.random() * Math.PI * 2,
      lastSeen: now(),
      lastFireAt: 0,
      firePulse: 0,
      _lastX: x,
      _lastZ: z,
      _weaponMaterialId: ''
    };
    this.remotePlayers.set(playerId, r);
    this.showToast('상대 플레이어 위치 동기화 시작');
    return r;
  }

  applyRemoteInput(playerId, stateOrInput = {}) {
    if (!this.running || this.lobby.mode !== 'coop' || !playerId) return;
    const selfId = this.net?.socket?.id;
    if (selfId && playerId === selfId) return;
    const state = stateOrInput.state || stateOrInput.player || stateOrInput;
    const look = stateOrInput.look || state.look || {};
    const flags = stateOrInput.flags || state.flags || {};
    const r = this.ensureRemotePlayer(playerId, { ...state, role: stateOrInput.role });
    if (!r) return;
    const x = Number(state.x);
    const y = Number(state.y);
    const z = Number(state.z);
    if (Number.isFinite(x)) r.target.x = x;
    if (Number.isFinite(y)) r.target.y = y;
    if (Number.isFinite(z)) r.target.z = z;
    const yaw = Number(state.yaw ?? look.yaw);
    const pitch = Number(state.pitch ?? look.pitch);
    if (Number.isFinite(yaw)) r.target.yaw = yaw;
    if (Number.isFinite(pitch)) r.target.pitch = pitch;
    if (state.hp !== undefined) r.hp = Number(state.hp) || 0;
    r.downed = !!state.downed;
    if (state.maxHp !== undefined) r.maxHp = Number(state.maxHp) || r.maxHp || 100;
    r.weapon = String(state.weapon || stateOrInput.weapon || r.weapon || 'pistol');
    r.alive = r.downed ? true : (state.alive !== undefined ? !!state.alive : r.hp > 0);
    r.ads = !!(state.ads ?? flags.ads);
    const fire = !!(state.fire ?? flags.fire);
    if (fire && !r.fire) r.firePulse = Math.max(r.firePulse, .18);
    r.fire = fire;
    r.reload = !!(state.reload ?? flags.reload);
    r.move = clamp(Number(state.move ?? flags.move ?? r.move) || 0, 0, 1);
    r.lastSeen = now();
  }


  applyRemoteAction(playerId, action = {}) {
    if (!this.running || this.lobby.mode !== 'coop' || !playerId) return;
    const selfId = this.net?.socket?.id;
    if (selfId && playerId === selfId) return;
    const r = this.ensureRemotePlayer(playerId, { x: action.x, y: action.y, z: action.z, yaw: action.yaw, pitch: action.pitch });
    if (!r) return;
    if (Number.isFinite(action.x)) r.target.x = action.x;
    if (Number.isFinite(action.y)) r.target.y = action.y;
    if (Number.isFinite(action.z)) r.target.z = action.z;
    if (Number.isFinite(action.yaw)) r.target.yaw = action.yaw;
    if (Number.isFinite(action.pitch)) r.target.pitch = action.pitch;
    r.weapon = String(action.weapon || r.weapon || 'pistol');
    r.ads = !!action.ads;
    r.lastSeen = now();

    if (action.actionType === 'fire') {
      r.firePulse = Math.max(r.firePulse || 0, .22);
      r.fire = true;
      r.lastFireAt = now();
      this.spawnRemoteWeaponFx(r, action);
    } else if (action.actionType === 'reloadStart') {
      r.reload = true;
      r.reloadPulse = Math.max(r.reloadPulse || 0, .9);
      this.audio.reload?.(r.weapon);
    } else if (action.actionType === 'reloadEnd' || action.actionType === 'reloadCancel') {
      r.reload = false;
      r.reloadPulse = 0;
      if (action.actionType === 'reloadEnd') this.audio.beep(520, .045, 'triangle', .014);
    }
  }

  applyNetworkSnapshot(payload = {}) {
    if (!this.running || this.lobby.mode !== 'coop') return;
    const selfId = this.net?.socket?.id;
    const seen = new Set();
    for (const p of payload.players || []) {
      if (!p?.id) continue;
      if (p.id === selfId) {
        // v31: 2인 멀티 중 HP/생존 판정은 서버가 권위적으로 보낸다.
        const serverMaxHp = Number(p.state?.maxHp);
        if (Number.isFinite(serverMaxHp) && serverMaxHp > 0) this.maxHp = Math.max(this.maxHp || 100, serverMaxHp);
        const serverHp = Number(p.state?.hp);
        const wasDowned = !!this.downed;
        this.downed = !!p.state?.downed;
        if (Number.isFinite(serverHp)) {
          if (!this.downed && serverHp < this.hp - .5) this.damagePlayer(Math.max(1, this.hp - serverHp), { x: this.player.x, z: this.player.z - 1 }, 'hit');
          this.hp = clamp(serverHp, 0, this.maxHp);
        }
        if (this.downed && !wasDowned) { this.showToast('쓰러짐: 아군이 E 길게 눌러 부활 가능'); this._downToastShown = true; }
        if (!this.downed && wasDowned) { this.showToast('부활 완료'); this._downToastShown = false; }
        const serverKit = Number(p.state?.medkits);
        if (Number.isFinite(serverKit)) this.medkits = clamp(serverKit, 0, this.maxMedkits || 100);
        const serverMaxKit = Number(p.state?.maxMedkits);
        if (Number.isFinite(serverMaxKit) && serverMaxKit > 0) this.maxMedkits = Math.max(this.maxMedkits || 100, serverMaxKit);
        if (p.state?.weaponState) this.syncLocalWeaponState(p.state.weaponState);
        this.reconcileLocalPlayerWithServer(p.state || {});
        if ((p.state?.alive === false || this.hp <= 0) && !this.downed) this.hp = 0;
        continue;
      }
      seen.add(p.id);
      this.applyRemoteInput(p.id, { ...(p.state || {}), role: p.role });
    }
    const t = now();
    for (const [id, r] of this.remotePlayers || []) {
      if (!seen.has(id) && t - (r.lastSeen || 0) > 2.5) this.removeRemotePlayer(id);
    }
    if (payload.game) {
      this.serverEnemyAuthority = true;
      this.wave = Number(payload.game.wave || this.wave || 1);
      this.spawnQueue = Number(payload.game.spawnQueue || 0);
      this.serverGamePhase = payload.game.phase || 'combat';
      if (this.serverGamePhase === 'prep') { this.prepPhase = true; this.prepTimer = Number(payload.game.prepTimer || this.prepTimer || 0); }
      if (Number.isFinite(Number(payload.game.score))) this.score = Math.max(this.score || 0, Number(payload.game.score));
      if (Number.isFinite(Number(payload.game.kills))) this.kills = Math.max(this.kills || 0, Number(payload.game.kills));
      if (Number.isFinite(Number(payload.game.headshots))) this.headshots = Math.max(this.headshots || 0, Number(payload.game.headshots));
    }
    if (Array.isArray(payload.placeables)) this.syncServerPlaceables(payload.placeables);
    if (Array.isArray(payload.items)) this.syncServerItems(payload.items);
    if (Array.isArray(payload.projectiles)) this.syncServerProjectiles(payload.projectiles);
    if (Array.isArray(payload.enemies)) this.syncServerEnemies(payload.enemies);
    if (Array.isArray(payload.events)) this.applyServerEvents(payload.events);
  }

  reconcileLocalPlayerWithServer(state = {}) {
    if (!this.player || this.lobby?.mode !== 'coop' || !this.net?.connected) return;
    const sx = Number(state.x), sy = Number(state.y), sz = Number(state.z);
    if (!Number.isFinite(sx) || !Number.isFinite(sz)) return;
    const dx = sx - this.player.x;
    const dz = sz - this.player.z;
    const dy = Number.isFinite(sy) ? sy - this.player.y : 0;
    const dist = Math.hypot(dx, dz);
    // 서버가 같은 방의 실제 좌표를 권위적으로 관리한다. 작은 차이는 부드럽게 보정하고,
    // 벽/점프/충돌 때문에 크게 벌어진 경우에는 즉시 같은 공간으로 맞춘다.
    if (dist > 3.0 || Math.abs(dy) > 2.0 || !this._serverPositionSeen) {
      this.player.x = sx;
      this.player.z = sz;
      if (Number.isFinite(sy)) this.player.y = sy;
      this.player.vx = 0;
      this.player.vz = 0;
      this._serverPositionSeen = true;
    } else if (dist > .10 || Math.abs(dy) > .08) {
      const factor = dist > .75 ? .34 : .16;
      this.player.x += dx * factor;
      this.player.z += dz * factor;
      if (Number.isFinite(sy)) this.player.y += dy * .20;
    }
    const serverStamina = Number(state.stamina);
    const serverMaxStamina = Number(state.maxStamina);
    if (Number.isFinite(serverMaxStamina) && serverMaxStamina > 0) this.player.maxStamina = serverMaxStamina;
    if (Number.isFinite(serverStamina)) this.player.stamina = clamp(serverStamina, 0, this.player.maxStamina || 100);
    if (state.grounded !== undefined) this.player.grounded = !!state.grounded;
  }

  usesServerEnemyAuthority() {
    return !!(this.running && this.lobby?.mode === 'coop' && this.net?.connected && this.serverEnemyAuthority);
  }

  syncLocalWeaponState(ws = {}) {
    if (!ws || typeof ws !== 'object') return;
    if (ws.ammo && typeof ws.ammo === 'object') {
      for (const [id, val] of Object.entries(ws.ammo)) this.ammo[id] = val === 'Infinity' ? Infinity : Number(val || 0);
    }
    if (ws.mag && typeof ws.mag === 'object') {
      for (const [id, val] of Object.entries(ws.mag)) this.mag[id] = Number(val || 0);
    }
    if (ws.reload && ws.reload.weapon) {
      this.reload = { active: true, weapon: ws.reload.weapon, timer: Number(ws.reload.timer || 0), duration: Number(ws.reload.duration || 1) };
    } else if (this.reload?.active && this.usesServerEnemyAuthority()) {
      this.reload.active = false;
    }
  }

  syncServerProjectiles(list = []) {
    if (!this.networkProjectiles) this.networkProjectiles = new Map();
    const seen = new Set();
    for (const sp of list) {
      if (sp?.id === undefined || sp?.id === null) continue;
      const id = String(sp.id); seen.add(id);
      let rec = this.networkProjectiles.get(id);
      if (!rec) {
        const kind = sp.kind === 'rocket' ? 'rocket' : 'grenade';
        const mesh = new THREE.Mesh(this.geos.sphere, kind === 'rocket' ? this.materials.fire : this.materials.bullet);
        mesh.scale.setScalar(kind === 'rocket' ? .22 : .17);
        mesh.position.set(Number(sp.x) || 0, Number(sp.y) || 1.4, Number(sp.z) || 0);
        this.scene.add(mesh);
        rec = { serverId: id, networked: true, kind, mesh, x: mesh.position.x, y: mesh.position.y, z: mesh.position.z, alive: true };
        this.projectiles.push(rec);
        this.networkProjectiles.set(id, rec);
      }
      rec.x = Number(sp.x) || rec.x; rec.y = Number(sp.y) || rec.y; rec.z = Number(sp.z) || rec.z; rec.alive = sp.alive !== false;
      rec.mesh.position.set(rec.x, rec.y, rec.z);
    }
    for (const [id, rec] of [...this.networkProjectiles]) {
      if (seen.has(id)) continue;
      rec.alive = false; rec.dead = true;
      if (rec.mesh?.parent) this.scene.remove(rec.mesh);
      this.networkProjectiles.delete(id);
    }
  }

  makeNetworkEnemy(snapshot) {
    const type = snapshot.type || 'zombie';
    const mesh = this.createBoxheadModel(type);
    mesh.position.set(Number(snapshot.x) || 0, 0, Number(snapshot.z) || 0);
    mesh.rotation.y = Number(snapshot.yaw) || 0;
    this.scene.add(mesh);
    const stats = this.enemyStats(type);
    return {
      id: snapshot.id, serverId: snapshot.id, type, mesh, alive: true,
      x: mesh.position.x, z: mesh.position.z, targetX: mesh.position.x, targetZ: mesh.position.z, yaw: mesh.rotation.y, targetYaw: mesh.rotation.y,
      vx: 0, vz: 0, hp: Number(snapshot.hp) || stats.hp, maxHp: Number(snapshot.maxHp) || stats.hp,
      speed: stats.speed, radius: stats.radius, damage: stats.damage, score: stats.score,
      attackCd: 0, meleeCd: 0, stun: 0, hitTimer: 0, hitMax: .001, hitLean: 0, bloodCount: 0,
      attackAnim: 0, attackMax: .001, castAnim: 0, castMax: .001, recoilTimer: 0, recoilMax: .001,
      walkPhase: rand(0, Math.PI * 2), walkSpeed: 0, stepCd: rand(.1, .35), shielded: type === 'shield', networked: true
    };
  }

  syncServerEnemies(snapshots = []) {
    if (!this._serverEnemyAuthorityStarted) {
      for (const local of [...this.enemies]) {
        if (!local.networked && local.mesh?.parent) this.scene.remove(local.mesh);
      }
      this.enemies = this.enemies.filter(e => e.networked);
      this._serverEnemyAuthorityStarted = true;
    }
    const seen = new Set();
    for (const s of snapshots) {
      if (s?.id === undefined || s?.id === null) continue;
      seen.add(String(s.id));
      let e = this.enemies.find(x => String(x.serverId ?? x.id) === String(s.id));
      if (!e) {
        e = this.makeNetworkEnemy(s);
        this.enemies.push(e);
      }
      const wasAlive = e.alive;
      e.type = s.type || e.type;
      e.targetX = Number(s.x) || e.x;
      e.targetZ = Number(s.z) || e.z;
      e.targetYaw = Number.isFinite(Number(s.yaw)) ? Number(s.yaw) : e.targetYaw;
      e.maxHp = Number(s.maxHp) || e.maxHp;
      e.hp = Number(s.hp) || 0;
      e.alive = s.alive !== false && e.hp > 0;
      if (s.lastHitPart && s.lastHitPart !== e.lastHitPart) e.lastHitPart = s.lastHitPart;
      if (wasAlive && !e.alive) this.removeNetworkEnemy(e, true);
    }
    for (const e of [...this.enemies]) {
      if (e.networked && !seen.has(String(e.serverId ?? e.id))) this.removeNetworkEnemy(e, false);
    }
  }

  removeNetworkEnemy(e, deathFx = false) {
    if (!e) return;
    if (deathFx && e.mesh?.parent) {
      this.spawnEnemyDeathDebris(e);
      this.audio.enemyDeath(e.type);
    }
    e.alive = false;
    if (e.mesh?.parent) this.scene.remove(e.mesh);
  }

  updateServerEnemies(dt) {
    for (const e of this.enemies) {
      if (!e.networked || !e.alive) continue;
      const px = e.x, pz = e.z;
      const lerp = 1 - Math.exp(-dt * 16);
      e.x += ((e.targetX ?? e.x) - e.x) * lerp;
      e.z += ((e.targetZ ?? e.z) - e.z) * lerp;
      e.mesh.position.x = e.x;
      e.mesh.position.z = e.z;
      if (Number.isFinite(e.targetYaw)) e.mesh.rotation.y = this.lerpAngle(e.mesh.rotation.y, e.targetYaw, 1 - Math.exp(-dt * 12));
      e.walkSpeed = Math.hypot(e.x - px, e.z - pz) / Math.max(.001, dt);
      if (e.walkSpeed > .05) {
        const pace = e.type === 'runner' ? 10.2 : (e.type === 'bomber' ? 8.6 : (e.type === 'tank' ? 3.7 : (e.type === 'devil' ? 4.2 : 6.2)));
        e.walkPhase += dt * pace * clamp(e.walkSpeed / Math.max(.1, e.speed || 1), .35, 1.55);
      }
      e.hitTimer = Math.max(0, (e.hitTimer || 0) - dt);
      e.attackAnim = Math.max(0, (e.attackAnim || 0) - dt);
      e.castAnim = Math.max(0, (e.castAnim || 0) - dt);
      this.applyEnemyVisualPose(e);
    }
    this.enemies = this.enemies.filter(e => !e.networked || e.alive || e.mesh?.parent);
  }

  applyServerEvents(events = []) {
    for (const ev of events) {
      if (!ev || !ev.type) continue;
      const e = this.enemies.find(x => String(x.serverId ?? x.id) === String(ev.enemyId));
      if (ev.type === 'enemySpawn') this.spawnEnemySpawnFx(ev.x || 0, ev.z || 0, ev.enemyType || 'zombie');
      if (ev.type === 'enemyHit' && e) {
        e.hitTimer = e.hitMax = ev.part === 'head' ? .22 : .14;
        e.hitLean = ev.part === 'head' ? .35 : .18;
        if (ev.part === 'head') this.showHeadshot();
        if (e.type !== 'devil') this.addBloodPatch(e, ev.damage || 12, ev.part === 'head' ? 'headshot' : 'bullet');
      }
      if (ev.type === 'enemyMelee' && e) {
        e.attackAnim = e.attackMax = e.type === 'tank' ? .50 : .42;
        this.audio.enemyAttack(e.type);
      }
      if (ev.type === 'devilCast' && e) {
        e.castAnim = e.castMax = .55;
        this.audio.devilCast();
      }
      if ((ev.type === 'enemyDeath' || ev.type === 'enemyExplode') && e) this.removeNetworkEnemy(e, true);
      if (ev.type === 'waveStart') { this.serverRewardMode = false; this.rewardOpen = false; UI.reward?.classList.remove('show'); this.showToast(`Wave ${ev.wave}`); }
      if (ev.type === 'rewardStart') this.showServerRewardChoices(ev.choices || [], ev.wave || this.wave);
      if (ev.type === 'rewardChosen') this.showToast(ev.playerId === this.net?.socket?.id ? '보상 선택 완료' : '상대가 보상을 선택했다');
      if (ev.type === 'prepStart') { this.serverRewardMode = false; this.startPrepPhase(Number(ev.seconds || 10)); }
      if (ev.type === 'wallCreate') this.audio.placeWall();
      if (ev.type === 'mineCreate') this.audio.placeMine();
      if (ev.type === 'wallDamage') this.audio.wallCrack();
      if (ev.type === 'wallBreak') this.audio.wallBreak();
      if (ev.type === 'mineExplode') this.explode(ev.x || 0, ev.z || 0, ev.radius || 5.8, 0, false);
      if (ev.type === 'itemSpawn') this.audio.itemSpawn();
      if (ev.type === 'serverFire' && ev.playerId === this.net?.socket?.id && ev.weaponState) this.syncLocalWeaponState(ev.weaponState);
      if ((ev.type === 'reloadStart' || ev.type === 'reloadEnd' || ev.type === 'reloadCancel') && ev.playerId === this.net?.socket?.id && ev.weaponState) this.syncLocalWeaponState(ev.weaponState);
      if (ev.type === 'projectileExplode') { this.explode(ev.x || 0, ev.z || 0, ev.radius || 5.5, 0, false); if (ev.kind === 'rocket' || ev.kind === 'grenade') this.audio.explosion?.(); }
      if (ev.type === 'playerExplodeHit' && ev.playerId === this.net?.socket?.id) this.damagePlayer(Number(ev.amount || 1), { x: ev.x || this.player.x, z: ev.z || this.player.z - 1 }, 'explosion');
      if (ev.type === 'itemPickup') { if (ev.playerId === this.net?.socket?.id) { if (ev.weaponState) this.syncLocalWeaponState(ev.weaponState); this.showToast(ev.itemKind === 'health' ? '회복 상자 획득' : '탄약 상자 획득'); } this.audio.pickup(); }
      if (ev.type === 'medkitUse') { if (ev.playerId === this.net?.socket?.id) this.showToast(`회복키트 사용 HP +${Math.ceil(ev.amount || 0)}`); this.audio.pickup(); }
      if (ev.type === 'allyHeal') { if (ev.healerId === this.net?.socket?.id) this.showToast(`아군 치료 HP +${Math.ceil(ev.amount || 0)}`); if (ev.targetId === this.net?.socket?.id) this.showToast(`아군에게 치료받음 HP +${Math.ceil(ev.amount || 0)}`); this.audio.pickup(); }
      if (ev.type === 'playerDowned') { if (ev.playerId === this.net?.socket?.id) { this.downed = true; this.hp = 0; this.showToast('쓰러짐: 아군 부활 대기'); } else this.showToast('아군이 쓰러짐'); this.audio.beep(150, .18, 'sawtooth', .030); }
      if (ev.type === 'allyRevive' || ev.type === 'playerRevived') { if ((ev.playerId || ev.targetId) === this.net?.socket?.id) { this.downed = false; this.showToast('아군이 부활시킴'); } else if (ev.healerId === this.net?.socket?.id) this.showToast('아군 부활 완료'); this.audio.pickup(); }
      if (ev.type === 'allyAssistFail') { if (ev.healerId === this.net?.socket?.id) this.showToast(ev.reason === 'noKit' ? '회복키트 부족' : ev.reason === 'far' ? '아군이 너무 멂' : '치료 불가'); }
      if (ev.type === 'teamWipe') { this.showToast('팀 전멸'); this.endGame(); }
    }
  }



  syncServerPlaceables(list = []) {
    if (!this.networkPlaceables) this.networkPlaceables = new Map();
    const seen = new Set();
    for (const sp of list) {
      if (sp?.id === undefined || sp?.id === null) continue;
      const id = String(sp.id), kind = sp.kind === 'mine' ? 'mine' : 'wall';
      seen.add(id);
      let rec = this.networkPlaceables.get(id);
      if (!rec) {
        if (kind === 'wall') {
          const ob = this.addObstacle(Number(sp.x) || 0, Number(sp.z) || 0, Number(sp.w) || 4.2, Number(sp.d) || .72, 'fakeWall', Number(sp.maxHp || sp.hp || 120));
          ob.serverId = id; ob.networked = true; ob.hp = Number(sp.hp || ob.hp); ob.maxHp = Number(sp.maxHp || ob.maxHp);
          this.placeables.push(ob);
          rec = { id, kind, object: ob };
        } else {
          const mesh = this.createMineModel();
          mesh.position.set(Number(sp.x) || 0, 0, Number(sp.z) || 0);
          this.scene.add(mesh);
          const mine = { serverId: id, networked: true, kind: 'barrel', x: mesh.position.x, z: mesh.position.z, w: 1.28, d: 1.28, hp: Number(sp.hp || 22), mesh, alive: true, radius: Number(sp.radius || 5.8), damage: 125 };
          this.placeables.push(mine);
          rec = { id, kind, object: mine };
        }
        this.networkPlaceables.set(id, rec);
      }
      const o = rec.object;
      o.x = Number(sp.x) || o.x; o.z = Number(sp.z) || o.z; o.hp = Number(sp.hp ?? o.hp); o.maxHp = Number(sp.maxHp ?? o.maxHp); o.alive = sp.alive !== false;
      if (o.mesh) o.mesh.position.set(o.x, kind === 'wall' ? WORLD.WALL_HEIGHT / 2 : 0, o.z);
      if (kind === 'wall') {
        const level = o.maxHp ? Math.floor((1 - o.hp / o.maxHp) * 4) : 0;
        if (level > (o.crackLevel || 0)) this.addWallCracks(o, level);
      }
    }
    for (const [id, rec] of [...this.networkPlaceables]) {
      if (seen.has(id)) continue;
      const o = rec.object;
      if (rec.kind === 'wall') this.breakWall(o, 'server');
      else if (o.mesh?.parent) this.scene.remove(o.mesh);
      o.alive = false;
      this.networkPlaceables.delete(id);
    }
  }

  syncServerItems(list = []) {
    if (!this.networkItems) this.networkItems = new Map();
    const seen = new Set();
    for (const si of list) {
      if (si?.id === undefined || si?.id === null) continue;
      const id = String(si.id); seen.add(id);
      let p = this.networkItems.get(id);
      if (!p) {
        const mesh = this.createItemBoxModel(si.kind === 'health' ? 'health' : 'ammo');
        mesh.position.set(Number(si.x) || 0, 0, Number(si.z) || 0);
        this.scene.add(mesh);
        p = { serverId: id, networked: true, alive: true, mesh, x: mesh.position.x, z: mesh.position.z, kind: si.kind || 'ammo', weapon: si.weapon || 'smg', amount: Number(si.amount || 20), life: Number(si.life || 20) };
        this.pickups.push(p); this.networkItems.set(id, p);
      }
      p.x = Number(si.x) || p.x; p.z = Number(si.z) || p.z; p.kind = si.kind || p.kind; p.weapon = si.weapon || p.weapon; p.amount = Number(si.amount || p.amount); p.life = Number(si.life || p.life); p.alive = si.alive !== false;
      if (p.mesh) p.mesh.position.set(p.x, p.mesh.position.y, p.z);
    }
    for (const [id, item] of [...this.networkItems]) {
      if (seen.has(id)) continue;
      item.alive = false;
      if (item.mesh?.parent) this.scene.remove(item.mesh);
      this.networkItems.delete(id);
    }
  }

  showServerRewardChoices(choices = [], wave = this.wave) {
    this.serverRewardMode = true;
    this.rewardOpen = true;
    this.prepPhase = false;
    this.prepTimer = 0;
    try { document.exitPointerLock?.(); } catch (_) {}
    const localPool = new Map(this.rewardPool().map(r => [r.id, r]));
    const prepared = choices.map(c => ({ ...(localPool.get(c.id) || {}), id: c.id, title: c.title || localPool.get(c.id)?.title || c.id, desc: c.desc || localPool.get(c.id)?.desc || '' })).slice(0, 3);
    if (UI.rewardTitle) UI.rewardTitle.textContent = `Wave ${wave} Clear`;
    if (UI.rewardSubtitle) UI.rewardSubtitle.textContent = '2인 멀티 서버 보상이다. 둘 다 선택하면 정비 시간이 시작된다.';
    if (UI.rewardChoices) {
      UI.rewardChoices.innerHTML = '';
      for (const r of prepared) {
        const btn = document.createElement('button');
        btn.className = 'reward-choice';
        btn.innerHTML = `<b>${r.title}</b><span>${r.desc}</span>`;
        btn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); this.chooseReward(r); }, { passive: false });
        btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.chooseReward(r); });
        UI.rewardChoices.appendChild(btn);
      }
    }
    UI.reward?.classList.add('show');
    this.audio.beep(660, .10, 'triangle', .035);
  }

  removeRemotePlayer(playerId) {
    const r = this.remotePlayers?.get(playerId);
    if (!r) return;
    r.mesh?.parent?.remove(r.mesh);
    this.remotePlayers.delete(playerId);
  }

  lerpAngle(a, b, t) {
    let d = (b - a + Math.PI) % (Math.PI * 2) - Math.PI;
    if (d < -Math.PI) d += Math.PI * 2;
    return a + d * t;
  }

  updateRemotePlayers(dt) {
    if (!this.remotePlayers || !this.remotePlayers.size) return;
    const t = now();
    for (const [id, r] of this.remotePlayers) {
      if (t - (r.lastSeen || 0) > 5 || (!r.alive && !r.downed)) {
        if (t - (r.lastSeen || 0) > 5) this.removeRemotePlayer(id);
        continue;
      }
      const mesh = r.mesh;
      const alpha = clamp(1 - Math.pow(.001, dt), 0, .35);
      mesh.position.x += (r.target.x - mesh.position.x) * alpha;
      mesh.position.y += (r.target.y - mesh.position.y) * alpha;
      mesh.position.z += (r.target.z - mesh.position.z) * alpha;
      mesh.rotation.y = this.lerpAngle(mesh.rotation.y, r.target.yaw, clamp(dt * 12, 0, 1));
      if (r.downed) {
        mesh.position.y = .08;
        mesh.rotation.z = this.lerpAngle(mesh.rotation.z || 0, 1.35, clamp(dt * 8, 0, 1));
        const ud = mesh.userData || {};
        if (ud.label) ud.label.position.y = 1.65;
        continue;
      } else if (mesh.userData?.label) mesh.userData.label.position.y = 2.55;

      const moved = Math.hypot(mesh.position.x - (r._lastX ?? mesh.position.x), mesh.position.z - (r._lastZ ?? mesh.position.z));
      const speed = moved / Math.max(.001, dt);
      r._lastX = mesh.position.x; r._lastZ = mesh.position.z;
      const walk = clamp(Math.max(r.move || 0, speed / 5.5), 0, 1);
      r.walkPhase += dt * (2.4 + walk * 5.2);
      r.firePulse = Math.max(0, (r.firePulse || 0) - dt);
      r.reloadPulse = Math.max(0, (r.reloadPulse || 0) - dt);

      const ud = mesh.userData || {};
      const armSwing = Math.sin(r.walkPhase) * .24 * walk;
      const legSwing = Math.sin(r.walkPhase) * .22 * walk;
      const bob = Math.abs(Math.sin(r.walkPhase)) * .020 * walk;
      const sway = Math.sin(r.walkPhase * 2) * .012 * walk;
      mesh.position.y = r.target.y + bob;
      mesh.rotation.z = sway;
      if (ud.leftArm && ud.rightArm) {
        const aim = r.ads ? -.32 : 0;
        const shoot = r.firePulse > 0 ? Math.sin((r.firePulse / .18) * Math.PI) * -.22 : 0;
        ud.leftArm.rotation.x = armSwing + aim;
        ud.rightArm.rotation.x = -armSwing + aim + shoot;
        ud.leftArm.position.z = .16 + (r.ads ? .14 : 0);
        ud.rightArm.position.z = .16 + (r.ads ? .20 : 0) + (r.firePulse > 0 ? -.04 : 0);
      }
      if (ud.leftLeg && ud.rightLeg) {
        ud.leftLeg.rotation.x = legSwing;
        ud.rightLeg.rotation.x = -legSwing;
      }
      if (ud.weaponGroup) {
        const reloadPose = r.reload ? .18 : 0;
        ud.weaponGroup.position.y = .92 - reloadPose * .52;
        ud.weaponGroup.position.z = .52 - reloadPose * .18;
        ud.weaponGroup.rotation.x = -0.10 + (r.ads ? -.10 : 0) + reloadPose * .42 + (r.firePulse > 0 ? Math.sin((r.firePulse / .22) * Math.PI) * .12 : 0);
        const theme = this.weaponTheme(r.weapon);
        if (theme && r._weaponMaterialId !== r.weapon) {
          if (ud.gunBody) ud.gunBody.material = theme.body;
          if (ud.gunBarrel) ud.gunBarrel.material = theme.barrel;
          if (ud.gunAccent) ud.gunAccent.material = theme.accent;
          r._weaponMaterialId = r.weapon;
        }
      }
    }
  }

  buildViewWeapon() {
    while (this.camera.children.length) this.camera.remove(this.camera.children[0]);
    const g = new THREE.Group();
    g.position.set(.34, -.33, -.78);
    g.rotation.set(-.06, -.08, 0);
    this.viewWeaponBody = this.addPart(g, this.geos.lowBox, this.materials.weaponDark, 0, 0, 0, .26, .20, .82);
    this.viewWeaponBarrel = this.addPart(g, this.geos.lowBox, this.materials.weaponMetal, 0, .03, -.58, .13, .12, .58);
    this.weaponAttachmentGroup = new THREE.Group();
    g.add(this.weaponAttachmentGroup);
    this.addPart(g, this.geos.lowBox, this.materials.skin, -.25, -.13, .20, .18, .17, .34);
    this.addPart(g, this.geos.lowBox, this.materials.skin, .20, -.11, .28, .18, .17, .30);
    this.addPart(g, this.geos.lowBox, this.materials.shirtBlack, -.08, -.23, .40, .46, .14, .34);
    this.camera.add(g);
    this.viewWeapon = g;
    this.updateViewWeapon();
  }

  clearWeaponAttachments() {
    if (!this.weaponAttachmentGroup) return;
    while (this.weaponAttachmentGroup.children.length) {
      const child = this.weaponAttachmentGroup.children.pop();
      child.parent?.remove(child);
    }
  }

  weaponTheme(id) {
    const m = this.materials;
    return {
      pistol: { body: m.gunPistol, barrel: m.weaponMetal, accent: m.gunYellowAccent },
      smg: { body: m.gunSmg, barrel: m.weaponMetal, accent: m.gunAccent },
      shotgun: { body: m.gunShotgun, barrel: m.weaponMetal, accent: m.gunYellowAccent },
      grenade: { body: m.gunGrenade, barrel: m.gunRedAccent, accent: m.gunYellowAccent },
      barrel: { body: m.gunMine, barrel: m.mineMetal, accent: m.gunRedAccent },
      wall: { body: m.gunWall, barrel: m.fakeWall, accent: m.gunYellowAccent },
      rocket: { body: m.gunRocket, barrel: m.weaponMetal, accent: m.gunRedAccent },
      railgun: { body: m.gunRail, barrel: m.gunAccent, accent: m.gunAccent }
    }[id] || { body: m.weaponDark, barrel: m.weaponMetal, accent: m.gunYellowAccent };
  }

  updateViewWeapon() {
    if (!this.viewWeapon || !this.viewWeaponBody || !this.viewWeaponBarrel) return;
    const w = this.getWeapon();
    const theme = this.weaponTheme(w.id);
    this.viewWeaponBody.material = theme.body;
    this.viewWeaponBarrel.material = theme.barrel;
    const shape = {
      pistol: [.28, .20, .62, .10, .10, .40, .31],
      smg: [.32, .20, .88, .11, .10, .70, .40],
      shotgun: [.42, .22, 1.05, .20, .13, .82, .45],
      grenade: [.30, .28, .38, .18, .18, .22, .22],
      barrel: [.42, .20, .50, .24, .08, .32, .24],
      wall: [.48, .34, .26, .42, .10, .20, .20],
      rocket: [.46, .26, 1.16, .26, .20, .84, .45],
      railgun: [.30, .18, 1.30, .09, .08, 1.06, .47]
    }[w.id] || [.26, .20, .72, .13, .12, .42, .34];
    this.viewWeaponBody.scale.set(shape[0], shape[1], shape[2]);
    this.viewWeaponBarrel.scale.set(shape[3], shape[4], shape[5]);
    this.viewWeaponBarrel.position.z = -shape[6];

    this.clearWeaponAttachments();
    const a = this.weaponAttachmentGroup;
    if (!a) return;
    const m = this.materials;
    // 각 무기의 실루엣과 색을 강하게 분리한다. 같은 박스 총처럼 보이지 않게
    // 탄창, 손잡이, 펌프, 조준기, 코일, 경고띠 등을 무기별로 다르게 배치했다.
    if (w.id === 'pistol') {
      this.addPart(a, this.geos.lowBox, theme.accent, .00, .13, -.20, .16, .055, .18);
      this.addPart(a, this.geos.lowBox, m.weaponMetal, .03, -.18, .10, .14, .28, .18, .20, 0, 0);
      this.addPart(a, this.geos.lowBox, m.weaponMetal, 0, .10, -.56, .08, .075, .16);
    } else if (w.id === 'smg') {
      this.addPart(a, this.geos.lowBox, m.weaponMetal, -.13, -.16, -.05, .14, .42, .20, -.18, 0, 0);
      this.addPart(a, this.geos.lowBox, theme.accent, .00, .15, -.46, .20, .045, .32);
      this.addPart(a, this.geos.lowBox, m.weaponDark, .16, -.03, .17, .08, .18, .32);
    } else if (w.id === 'shotgun') {
      this.addPart(a, this.geos.lowBox, m.weaponMetal, 0, -.05, -.43, .28, .08, .52);
      this.addPart(a, this.geos.lowBox, theme.accent, 0, .13, -.72, .26, .055, .20);
      this.addPart(a, this.geos.lowBox, m.weaponDark, .00, -.18, .20, .28, .12, .34);
    } else if (w.id === 'grenade') {
      this.addPart(a, this.geos.sphere, theme.body, 0, .02, -.28, .82, .82, .82);
      this.addPart(a, this.geos.lowBox, theme.accent, 0, .24, -.28, .30, .08, .20);
      this.addPart(a, this.geos.lowBox, m.weaponMetal, .18, .13, -.28, .055, .22, .14);
      this.addPart(a, this.geos.lowBox, m.weaponMetal, -.13, .15, -.28, .18, .045, .12, 0, 0, .35);
    } else if (w.id === 'barrel') {
      this.addPart(a, this.geos.mine, m.mineDark, 0, -.02, -.38, .68, .24, .68, Math.PI/2, 0, 0);
      this.addPart(a, this.geos.mineButton, theme.accent, 0, .05, -.38, .70, .22, .70, Math.PI/2, 0, 0);
      this.addPart(a, this.geos.lowBox, theme.accent, 0, .13, -.38, .90, .045, .12);
    } else if (w.id === 'wall') {
      this.addPart(a, this.geos.lowBox, m.fakeWall, 0, .02, -.36, .72, .46, .10);
      this.addPart(a, this.geos.lowBox, m.trim, -.26, .02, -.31, .055, .52, .12);
      this.addPart(a, this.geos.lowBox, m.trim, .26, .02, -.31, .055, .52, .12);
      this.addPart(a, this.geos.lowBox, theme.accent, 0, .28, -.30, .34, .06, .12);
    } else if (w.id === 'rocket') {
      this.addPart(a, this.geos.lowBox, theme.accent, 0, .05, -.88, .34, .09, .18);
      this.addPart(a, this.geos.lowBox, m.weaponMetal, -.24, -.05, -.42, .07, .18, .54);
      this.addPart(a, this.geos.lowBox, m.weaponMetal, .24, -.05, -.42, .07, .18, .54);
      this.addPart(a, this.geos.lowBox, m.gunRedAccent, 0, -.17, .17, .34, .12, .28);
    } else if (w.id === 'railgun') {
      this.addPart(a, this.geos.lowBox, m.gunAccent, -.17, .08, -.46, .05, .06, .90);
      this.addPart(a, this.geos.lowBox, m.gunAccent, .17, .08, -.46, .05, .06, .90);
      this.addPart(a, this.geos.lowBox, m.weaponDark, 0, -.13, -.15, .12, .22, .60);
      this.addPart(a, this.geos.lowBox, m.gunAccent, 0, .18, -.84, .22, .045, .18);
    }
  }

  getMissionForWave(w) {
    // v27: every few waves, the goal changes so the run is not only "kill everything".
    // Normal waves still remain the majority so the Boxhead survival core is preserved.
    if (w >= 8 && w % 8 === 0) {
      return { type: 'core', label: '감염 코어 파괴', short: 'CORE', desc: '맵에 생성된 감염 코어를 모두 부숴라. 적을 전부 잡지 않아도 코어만 부수면 클리어된다.' };
    }
    if (w >= 6 && w % 6 === 0) {
      return { type: 'survive', label: '제한 시간 버티기', short: 'SURVIVE', duration: clamp(38 + w * 1.8, 45, 70), desc: '제한 시간 동안 버티면 웨이브가 끝난다. 너무 오래 한 장소에 갇히지 마라.' };
    }
    if (w >= 9 && w % 7 === 0) {
      return { type: 'rush', label: '폭발 좀비 러시', short: 'RUSH', desc: '폭발 좀비 비율이 높아진다. 가까워지기 전에 먼저 끊어라.' };
    }
    if (w >= 10 && w % 9 === 0) {
      return { type: 'blackout', label: '조명 불안정 웨이브', short: 'LIGHTS', desc: '조명이 불안정하다. 미니맵과 발소리를 같이 봐라.' };
    }
    return { type: 'normal', label: '전멸', short: 'CLEAR', desc: '몰려오는 적을 모두 처치해라.' };
  }

  startMissionForWave() {
    this.cleanupObjectiveCores(false);
    this.currentMission = this.getMissionForWave(this.wave);
    this.missionTimer = this.currentMission.duration || 0;
    this.missionCompletePending = false;

    if (this.currentMission.type === 'survive') {
      this.spawnQueue = Math.max(this.spawnQueue, 36 + Math.floor(this.wave * 2.2));
      this.showCenterAlert('미션 웨이브: 제한 시간 버티기', `${Math.ceil(this.missionTimer)}초 동안 살아남아라. 적을 전부 죽일 필요는 없다.`, 'danger', 3.2);
    } else if (this.currentMission.type === 'core') {
      this.spawnQueue = Math.max(18, Math.round(this.spawnQueue * .72));
      const count = clamp(2 + Math.floor(this.wave / 8), 2, 4);
      this.spawnObjectiveCores(count);
      this.showCenterAlert('미션 웨이브: 감염 코어 파괴', `${count}개의 코어를 모두 부숴라. 코어를 부수면 바로 웨이브가 끝난다.`, 'danger', 3.4);
    } else if (this.currentMission.type === 'rush') {
      this.spawnQueue = Math.max(this.spawnQueue, 28 + Math.floor(this.wave * 2.4));
      this.showCenterAlert('특수 웨이브: 폭발 좀비 러시', '노란 폭발 좀비가 많이 섞인다. 거리 유지가 핵심이다.', 'danger', 3.0);
    } else if (this.currentMission.type === 'blackout') {
      this.spawnQueue = Math.max(this.spawnQueue, 26 + Math.floor(this.wave * 2.0));
      this.showCenterAlert('특수 웨이브: 조명 불안정', '형광등이 흔들린다. 소리와 미니맵으로 위치를 확인해라.', 'danger', 3.0);
    }
  }

  missionObjectiveText() {
    const m = this.currentMission;
    if (!m || m.type === 'normal') return '';
    if (m.type === 'survive') return `미션: ${Math.ceil(this.missionTimer)}초 버티기`;
    if (m.type === 'core') {
      const left = (this.objectiveCores || []).filter(c => c.alive).length;
      return `미션: 감염 코어 ${left}개 남음`;
    }
    if (m.type === 'rush') return '특수: 폭발 좀비 러시';
    if (m.type === 'blackout') return '특수: 조명 불안정';
    return m.label || '';
  }

  updateMissionState(dt) {
    const m = this.currentMission;
    if (!m || this.rewardOpen || this.prepPhase || this.missionCompletePending) return false;
    if (m.type === 'survive') {
      this.missionTimer = Math.max(0, this.missionTimer - dt);
      // keep pressure during survival without creating infinite buildup.
      const alive = this.enemies.filter(e => e.alive).length;
      if (this.spawnQueue < 8 && alive < 34 && this.missionTimer > 4) this.spawnQueue += 4;
      if (this.missionTimer <= 0) {
        this.finishMissionWave('SURVIVED');
        return true;
      }
    } else if (m.type === 'core') {
      if ((this.objectiveCores || []).length && this.objectiveCores.every(c => !c.alive)) {
        this.finishMissionWave('CORES DESTROYED');
        return true;
      }
    }
    return false;
  }

  finishMissionWave(title = 'MISSION CLEAR') {
    if (this.missionCompletePending) return;
    this.missionCompletePending = true;
    this.spawnQueue = 0;
    // Mission waves end immediately on objective clear. Remove leftovers so the reward/prep phase is safe.
    for (const e of this.enemies || []) {
      if (e.alive) {
        e.alive = false;
        if (e.mesh?.parent) this.scene.remove(e.mesh);
      }
    }
    this.showCenterAlert(title, '보상을 선택하고 다음 웨이브를 준비해라.', 'info', 2.2);
    this.completeWave();
  }

  findCoreSpawnPoint(radius = 1.2) {
    const half = this.map.size / 2 - 4;
    for (let i = 0; i < 180; i++) {
      const x = rand(-half, half), z = rand(-half, half);
      if (this.rectCollides(x, z, radius * 2, radius * 2, .35)) continue;
      if (dist2(x, z, this.player.x, this.player.z) < 12 * 12) continue;
      let nearCore = false;
      for (const c of this.objectiveCores || []) if (dist2(x, z, c.x, c.z) < 9 * 9) nearCore = true;
      if (nearCore) continue;
      return { x, z };
    }
    return this.findEnemySpawnPoint(radius) || { x: 0, z: 0 };
  }

  spawnObjectiveCores(count = 2) {
    this.objectiveCores = [];
    for (let i = 0; i < count; i++) {
      const p = this.findCoreSpawnPoint(1.25);
      if (!p) continue;
      const core = this.createObjectiveCore(p.x, p.z, i);
      this.objectiveCores.push(core);
    }
  }

  createObjectiveCore(x, z, i = 0) {
    const group = new THREE.Group();
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x332315, flatShading: true });
    const coreMat = new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff5138 : 0xff9b3d });
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffe081, transparent: true, opacity: .72 });
    const base = new THREE.Mesh(this.geos.lowBox, baseMat);
    base.position.set(0, .30, 0); base.scale.set(1.25, .55, 1.25); group.add(base);
    const body = new THREE.Mesh(this.geos.sphere, coreMat);
    body.position.set(0, .95, 0); body.scale.set(1.45, 1.45, 1.45); group.add(body);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.62, .045, 8, 18), ringMat);
    ring.position.set(0, .96, 0); ring.rotation.x = Math.PI / 2; group.add(ring);
    const halo = new THREE.PointLight(0xff5a35, 1.25, 7, 2.2);
    halo.position.set(0, 1.4, 0); group.add(halo);
    group.position.set(x, 0, z);
    this.scene.add(group);
    this.spawnEnemySpawnFx(x, z, 'bomber');
    return { kind: 'core', x, z, radius: .88, hp: 180 + this.wave * 20, maxHp: 180 + this.wave * 20, alive: true, mesh: group, body, ring, light: halo, phase: Math.random() * Math.PI * 2 };
  }

  cleanupObjectiveCores(withFx = true) {
    for (const c of this.objectiveCores || []) {
      if (withFx && c.alive) this.destroyObjectiveCore(c, false);
      else if (c.mesh?.parent) this.scene.remove(c.mesh);
      c.alive = false;
    }
    this.objectiveCores = [];
  }

  updateObjectiveCores(dt) {
    for (const c of this.objectiveCores || []) {
      if (!c.alive || !c.mesh) continue;
      c.phase += dt * 2.3;
      if (c.body) {
        const pulse = 1 + Math.sin(c.phase * 2.6) * .075;
        c.body.scale.setScalar(1.45 * pulse);
      }
      if (c.ring) {
        c.ring.rotation.z += dt * 1.8;
        c.ring.rotation.x = Math.PI / 2 + Math.sin(c.phase) * .18;
      }
      if (c.light) c.light.intensity = .9 + Math.sin(c.phase * 3.2) * .35;
    }
  }

  findObjectiveCoreOnRay(dir, range, tolerance = .45) {
    let best = null, bestT = range;
    const sx = this.player.x, sz = this.player.z, sy = this.getEyeY();
    for (const c of this.objectiveCores || []) {
      if (!c.alive) continue;
      const t = this.raySphereT(sx, sy, sz, dir, c.x, .95, c.z, c.radius + tolerance * .25);
      if (t !== null && t > .05 && t < bestT && !this.wallBlocksRay(sx, sz, dir, t)) {
        best = { core: c, distance: t };
        bestT = t;
      }
    }
    return best;
  }

  damageObjectiveCore(c, amount = 10, source = 'bullet', dir = null) {
    if (!c || !c.alive) return false;
    c.hp -= amount;
    const pct = clamp(c.hp / Math.max(1, c.maxHp), 0, 1);
    if (c.body?.material?.color) c.body.material.color.setHex(pct < .33 ? 0xff2118 : (pct < .66 ? 0xff6633 : 0xff9b3d));
    this.spawnCoreHitFx(c, source);
    this.audio.hit();
    if (c.hp <= 0) this.destroyObjectiveCore(c, true);
    return true;
  }

  spawnCoreHitFx(c, source = 'bullet') {
    const mat = new THREE.MeshBasicMaterial({ color: source === 'explosion' ? 0xffd45a : 0xff6a3a, transparent: true, opacity: .72 });
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(this.geos.lowBox, mat.clone());
      m.position.set(c.x + rand(-.25,.25), rand(.65,1.35), c.z + rand(-.25,.25));
      m.scale.set(rand(.05,.12), rand(.05,.14), rand(.05,.12));
      this.scene.add(m);
      this.fx.push({ mesh: m, life: .35, max: .35, debris: true, vx: rand(-1.8,1.8), vy: rand(.7,2.4), vz: rand(-1.8,1.8), fadeStart: .05 });
    }
  }

  destroyObjectiveCore(c, score = true) {
    if (!c || !c.alive) return;
    c.alive = false;
    this.explode(c.x, c.z, 3.3, 0, false);
    this.spawnCoreHitFx(c, 'explosion');
    if (c.mesh?.parent) this.scene.remove(c.mesh);
    if (score) this.score += 180 + this.wave * 15;
    this.audio.explosion();
    this.showToast('감염 코어 파괴');
  }

  nextWave() {
    this.rewardOpen = false;
    this.prepPhase = false;
    this.prepTimer = 0;
    this.wave++;
    // v17 밸런스: 초반은 학습 가능하게 천천히, 후반은 너무 폭발하지 않게 완만하게 증가.
    const base = Math.round((9 + this.wave * 3.65 + Math.sqrt(this.wave) * 2.2) * this.diff.spawn);
    this.spawnQueue = clamp(base, 8, 88);
    this.spawnTimer = 0;
    this.waveBreak = 0;
    this.unlockWeapons();
    this.startMissionForWave();
    this.showToast(this.currentMission && this.currentMission.type !== 'normal' ? `Wave ${this.wave} · ${this.currentMission.label}` : `Wave ${this.wave}`);
    this.showWaveTip();
  }

  unlockWeapons() {
    let any = false;
    for (const w of WEAPON_DEFS) {
      if (!this.unlocked.has(w.id) && this.wave >= w.unlockWave) {
        this.unlocked.add(w.id);
        if (Number.isFinite(w.ammoMax)) this.ammo[w.id] = Math.max(this.ammo[w.id] || 0, Math.ceil(w.ammoMax * .35));
        if (w.magSize && !this.mag[w.id]) this.mag[w.id] = Math.min(w.magSize, Math.max(1, Math.ceil(w.magSize * .65)));
        any = true;
        this.showToast(`${w.name} 해금`);
      }
    }
    if (any) this.audio.unlockSound();
  }

  getWeapon(id = this.selectedWeapon) { return WEAPON_DEFS.find(w => w.id === id); }

  selectWeapon(id, silent = false) {
    if (!this.unlocked.has(id)) { if (!silent) this.showToast('아직 해금되지 않음'); return; }
    if (this.reload?.active && this.reload.weapon !== id) this.cancelReload();
    this.selectedWeapon = id;
    if (!silent) this.audio.beep(540, .04, 'triangle', .018);
    this.updateWeaponUI();
    this.updateViewWeapon();
  }

  cycleWeapon(step = 1) {
    const weapons = WEAPON_DEFS
      .filter(w => this.unlocked.has(w.id))
      .sort((a, b) => a.slot - b.slot);
    if (!weapons.length) return;
    const current = weapons.findIndex(w => w.id === this.selectedWeapon);
    const next = weapons[(current + step + weapons.length) % weapons.length];
    if (next) this.selectWeapon(next.id);
  }

  showToast(text) {
    UI.toast.textContent = text;
    UI.toast.classList.add('show');
    this.toastTimer = 1.6;
  }

  showCenterAlert(title, body = '', tone = 'info', time = 2.6) {
    if (!UI.centerAlert) return;
    UI.centerAlert.innerHTML = `<b>${title}</b>${body ? `<span>${body}</span>` : ''}`;
    UI.centerAlert.classList.remove('danger','info');
    UI.centerAlert.classList.add('show', tone);
    this.centerAlertTimer = time;
  }

  showHeadshot() {
    this.headshots = (this.headshots || 0) + 1;
    if (!UI.headshot) return;
    UI.headshot.classList.add('show');
    this.headshotTimer = .42;
  }

  enemyLabel(type) {
    return ({ zombie: '기본 좀비', runner: '러너', devil: '데빌', tank: '탱커 좀비', bomber: '폭발 좀비', shield: '실드 좀비' })[type] || type;
  }

  enemyTip(type) {
    return ({
      zombie: '가장 기본 적. 거리를 유지하고 헤드샷으로 빠르게 줄여라.',
      runner: '빠르게 달려든다. SMG나 샷건으로 먼저 끊어라.',
      devil: '화염구를 쏘며 설치 벽도 부순다. 사격 모션 때 머리를 노려라.',
      tank: '체력이 높고 벽을 잘 부순다. 폭발물이나 헤드샷이 효율적이다.',
      bomber: '가까워지면 자폭한다. 점멸과 경고음이 들리면 즉시 떨어져라.',
      shield: '정면 몸통 피해가 크게 줄어든다. 머리, 측면, 폭발, 레일건을 써라.'
    })[type] || '';
  }

  showWaveTip() {
    const tips = [
      { wave: 3, title: '러너 등장', body: '빠른 적이 섞인다. 뒤로만 걷지 말고 옆으로 빠지며 쏴라.' },
      { wave: 4, title: '탱커 좀비 등장', body: '체력이 높다. 샷건·수류탄·헤드샷으로 처리하는 게 좋다.' },
      { wave: 7, title: '폭발 좀비 등장', body: '가까이 오면 터진다. 노란 적은 멀리서 먼저 제거해라.', tone: 'danger' },
      { wave: 10, title: '실드 좀비 등장', body: '정면 몸통 사격은 약하게 들어간다. 머리나 측면을 노려라.' },
      { wave: 15, title: '고밀도 웨이브', body: '설치 벽과 지뢰로 길목을 만들고, 데빌은 우선 처치해라.', tone: 'danger' }
    ];
    const tip = tips.find(t => this.wave >= t.wave && !this.waveTipShown.has(t.wave));
    if (!tip) return;
    this.waveTipShown.add(tip.wave);
    this.showCenterAlert(tip.title, tip.body, tip.tone || 'info', 3.0);
  }

  pickEnemyTypeForWave() {
    // v17 웨이브 밸런스: 새 적은 첫 등장 때 소량, 이후 조금씩만 증가한다.
    // 일반 좀비는 끝까지 베이스 물량으로 남겨 Boxhead식 압박을 유지한다.
    const w = this.wave;
    if (this.currentMission?.type === 'rush') {
      const pool = [
        { type: 'zombie', w: 36 }, { type: 'runner', w: 18 }, { type: 'bomber', w: 44 },
        { type: 'tank', w: w >= 12 ? 12 : 6 }, { type: 'devil', w: w >= 14 ? 10 : 4 }
      ];
      let total = pool.reduce((a, b) => a + b.w, 0);
      let r = Math.random() * total;
      for (const p of pool) { r -= p.w; if (r <= 0) return p.type; }
      return 'bomber';
    }
    if (this.currentMission?.type === 'core') {
      const pool = [{ type: 'zombie', w: 48 }, { type: 'runner', w: 22 }, { type: 'tank', w: 14 }, { type: 'shield', w: w >= 10 ? 12 : 0 }, { type: 'devil', w: 10 }].filter(p => p.w > 0);
      let total = pool.reduce((a, b) => a + b.w, 0);
      let r = Math.random() * total;
      for (const p of pool) { r -= p.w; if (r <= 0) return p.type; }
    }
    const pool = [{ type: 'zombie', w: Math.max(54, 104 - w * 1.4) }];
    if (w >= 3) pool.push({ type: 'runner', w: clamp(14 + (w - 3) * 1.35, 14, 34) });
    if (w >= 4) pool.push({ type: 'tank', w: clamp(7 + (w - 4) * .85, 7, 22) });
    if (w >= 5) pool.push({ type: 'devil', w: clamp(8 + (w - 5) * .95, 8, 26) });
    if (w >= 7) pool.push({ type: 'bomber', w: clamp(5 + (w - 7) * .75, 5, 18) });
    if (w >= 10) pool.push({ type: 'shield', w: clamp(6 + (w - 10) * .72, 6, 18) });
    let total = pool.reduce((a, b) => a + b.w, 0);
    let r = Math.random() * total;
    for (const p of pool) {
      r -= p.w;
      if (r <= 0) return p.type;
    }
    return 'zombie';
  }


  spawnEnemySpawnFx(x, z, type = 'zombie') {
    const mat = new THREE.MeshBasicMaterial({ color: type === 'devil' ? 0xff3333 : (type === 'bomber' ? 0xffb52d : 0xe6d48a), transparent: true, opacity: .36, depthWrite: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(.55, 1.35, 22), mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, .045, z);
    this.scene.add(ring);
    this.fx.push({ mesh: ring, life: .9, max: .9, ring: true, grow: 1.9, fadeStart: .08 });
    if (Math.random() < .65) this.audio.beep(type === 'devil' ? 110 : 180, .045, 'sawtooth', .018);
  }

  spawnEnemy() {
    const type = this.pickEnemyTypeForWave();
    const stats = this.enemyStats(type);
    const sp = this.findEnemySpawnPoint(stats.radius + .55);
    if (!sp) return false;
    const mesh = this.createBoxheadModel(type);
    mesh.position.set(sp.x, 0, sp.z);
    mesh.rotation.y = rand(0, Math.PI * 2);
    this.scene.add(mesh);
    this.spawnEnemySpawnFx(sp.x, sp.z, type);
    this.enemies.push({
      id: this.nextEnemyId++, type, mesh, alive: true,
      x: mesh.position.x, z: mesh.position.z, vx: 0, vz: 0,
      hp: stats.hp, maxHp: stats.hp, speed: stats.speed, radius: stats.radius,
      damage: stats.damage, score: stats.score, attackCd: rand(.3, 1.2), meleeCd: rand(.25, .75), stun: 0,
      hitTimer: 0, hitMax: .001, hitLean: 0, bloodCount: 0,
      attackAnim: 0, attackMax: .001, castAnim: 0, castMax: .001, recoilTimer: 0, recoilMax: .001, recoilDir: { x: 0, z: 0 },
      walkPhase: rand(0, Math.PI * 2), walkSpeed: 0, stepCd: rand(.12, .55),
      wallPower: stats.wallPower || 1, blastRadius: stats.blastRadius || 0, blastDamage: stats.blastDamage || 0,
      shielded: !!stats.shielded, deathExploded: false,
      bomberWarned: false, bomberFlash: 0
    });
    if (!this.enemyIntroduced?.has(type)) {
      this.enemyIntroduced.add(type);
      this.showCenterAlert(`${this.enemyLabel(type)} 등장`, this.enemyTip(type), type === 'bomber' ? 'danger' : 'info', type === 'zombie' ? 1.6 : 2.8);
    }
    return true;
  }

  findEnemySpawnPoint(radius = 1.25) {
    const shuffled = [...this.map.spawns].sort(() => Math.random() - .5);
    for (const base of shuffled) {
      for (let i = 0; i < 14; i++) {
        const x = base[0] + rand(-3.0, 3.0);
        const z = base[1] + rand(-3.0, 3.0);
        if (this.isValidEnemySpawn(x, z, radius)) return { x, z };
      }
    }
    const half = this.map.size / 2 - 4.5;
    for (let i = 0; i < 40; i++) {
      const side = Math.floor(Math.random() * 4);
      const x = side < 2 ? rand(-half, half) : (side === 2 ? -half : half);
      const z = side < 2 ? (side === 0 ? -half : half) : rand(-half, half);
      if (this.isValidEnemySpawn(x, z, radius)) return { x, z };
    }
    return null;
  }

  isValidEnemySpawn(x, z, radius = 1.25) {
    if (this.collides(x, z, radius)) return false;
    if (this.player && dist2(x, z, this.player.x, this.player.z) < 11.5 * 11.5) return false;
    for (const e of this.enemies || []) {
      if (e.alive && dist2(x, z, e.x, e.z) < (radius + e.radius + .7) ** 2) return false;
    }
    return true;
  }

  enemyStats(type) {
    const scale = 1 + this.wave * .075;
    if (type === 'runner') return { hp: 20 * scale * this.diff.enemyHp, speed: 4.1 * this.diff.enemySpeed, damage: 13 * this.diff.enemyDamage, score: 18, radius: .46 };
    if (type === 'devil') return { hp: 72 * scale * this.diff.enemyHp, speed: 1.85 * this.diff.enemySpeed, damage: 18 * this.diff.enemyDamage, score: 55, radius: .72 };
    if (type === 'tank') return { hp: 128 * scale * this.diff.enemyHp, speed: 1.45 * this.diff.enemySpeed, damage: 18 * this.diff.enemyDamage, score: 42, radius: .74, wallPower: 1.85 };
    if (type === 'bomber') return { hp: 28 * scale * this.diff.enemyHp, speed: 3.25 * this.diff.enemySpeed, damage: 16 * this.diff.enemyDamage, score: 30, radius: .50, blastRadius: 4.3, blastDamage: 88 * this.diff.enemyDamage };
    if (type === 'shield') return { hp: 62 * scale * this.diff.enemyHp, speed: 2.05 * this.diff.enemySpeed, damage: 14 * this.diff.enemyDamage, score: 34, radius: .58, shielded: true };
    return { hp: 31 * scale * this.diff.enemyHp, speed: 2.45 * this.diff.enemySpeed, damage: 10 * this.diff.enemyDamage, score: 10, radius: .48 };
  }

  loop() {
    requestAnimationFrame(this.loop);
    const dtRaw = this.clock.getDelta();
    const dt = Math.min(dtRaw, .033);
    if (this.running && !this.paused && !this.gameOver) this.update(dt);
    this.renderer.render(this.scene, this.camera);
    this.trackFps(dtRaw);
  }

  trackFps(dt) {
    this.fpsSamples.push(1 / Math.max(.001, dt));
    if (this.fpsSamples.length > 28) this.fpsSamples.shift();
    const t = now();
    if (t - this.lastFpsUpdate > .35) {
      const avg = this.fpsSamples.reduce((a,b) => a+b, 0) / this.fpsSamples.length;
      UI.fpsText.textContent = `FPS ${Math.round(avg)}`;
      this.lastFpsUpdate = t;
    }
  }

  update(dt) {
    if (this.rewardOpen) {
      this.updateFx(dt);
      this.updateHorrorLighting(dt);
      this.updateAdaptiveMusic(dt);
      this.updateHud();
      this.minimap.draw(this);
      return;
    }
    this.updateReload(dt);
    this.handleInput(dt);
    this.updateWallPreview();
    this.updatePlayerVertical(dt);
    const serverEnemyAuthority = this.usesServerEnemyAuthority();
    if (serverEnemyAuthority) {
      this.updateServerEnemies(dt);
    } else {
      this.updateSpawning(dt);
      this.updateEnemies(dt);
    }
    if (!serverEnemyAuthority) this.updateRandomItemBoxes(dt);
    this.updateProjectiles(dt);
    this.updateObjectiveCores(dt);
    this.updatePickups(dt);
    this.updatePlaceables(dt);
    this.updateFx(dt);
    this.updateHorrorLighting(dt);
    this.updateAdaptiveMusic(dt);
    this.updateCamera(dt);
    this.updateRemotePlayers(dt);
    this.updateHud();
    this.minimap.draw(this);
    this.net.sendInput();
    if (this.hp <= 0 && !(this.lobby?.mode === 'coop' && this.downed)) this.endGame();
  }

  updateHorrorLighting(dt) {
    if (!this.flickerLights || !this.flickerLights.length) return;
    const t = now();
    for (const f of this.flickerLights) {
      let pulse = .96 + Math.sin(t * f.speed + f.phase) * .07 + Math.sin(t * 8.7 + f.phase) * .020;
      if (this.currentMission?.type === 'blackout') pulse *= (.88 + Math.sin(t * 18 + f.phase) * .10 + (Math.sin(t * 31 + f.phase) > .86 ? -.22 : 0));
      if (f.broken) {
        const harsh = Math.sin(t * 25 + f.phase) > .93 ? rand(.62, .82) : 1;
        pulse *= harsh;
      }
      f.light.intensity = clamp(f.base * pulse, f.base * .42, f.base * 1.25);
    }
  }

  updateAdaptiveMusic(dt) {
    if (!this.audio || !this.running) return;
    this.musicMoodGate = (this.musicMoodGate || 0) - dt;
    if (this.musicMoodGate > 0) return;
    this.musicMoodGate = .35;

    const lowHp = this.hp > 0 && this.hp <= this.maxHp * .30;
    const enemyCount = this.enemies?.length || 0;
    let nearest = Infinity;
    let hasHeavyThreat = false;
    for (const e of this.enemies || []) {
      const d = Math.sqrt(dist2(this.player.x, this.player.z, e.x, e.z));
      if (d < nearest) nearest = d;
      if (['devil', 'bomber', 'tank', 'shield'].includes(e.type)) hasHeavyThreat = true;
    }

    let mood = 'explore';
    if (lowHp || nearest < 5.2 || enemyCount >= 16 || ['survive','core','rush','blackout'].includes(this.currentMission?.type)) mood = 'danger';
    else if (enemyCount >= 6 || hasHeavyThreat || this.wave >= 7) mood = 'combat';
    this.audio.setMusicMood(mood);
  }

  drawStartMapPreview() {
    const c = UI.startMapPreview;
    if (!c || !c.getContext) return;
    const map = MAPS[UI.map?.value || 'box'] || MAPS.box;
    const ctx = c.getContext('2d');
    const rect = c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = Math.max(260, Math.round(rect.width || 360));
    const cssH = Math.max(160, Math.round(rect.height || 220));
    if (c.width !== Math.round(cssW * dpr) || c.height !== Math.round(cssH * dpr)) {
      c.width = Math.round(cssW * dpr); c.height = Math.round(cssH * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = cssW, h = cssH;
    ctx.clearRect(0,0,w,h);
    const g = ctx.createRadialGradient(w*.52, h*.46, 10, w*.5, h*.5, Math.max(w,h)*.68);
    g.addColorStop(0, '#3a331f'); g.addColorStop(.62, '#1b170d'); g.addColorStop(1, '#0c0a06');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
    const pad = 14;
    const scale = Math.min((w - pad*2) / map.size, (h - pad*2) / map.size);
    const ox = w/2, oz = h/2;
    const tx = x => ox + x * scale;
    const tz = z => oz + z * scale;
    ctx.save();
    ctx.shadowColor = 'rgba(255,225,130,.12)';
    ctx.shadowBlur = 16;
    ctx.strokeStyle = 'rgba(255,225,150,.18)';
    ctx.lineWidth = 1;
    ctx.strokeRect(tx(-map.size/2), tz(-map.size/2), map.size*scale, map.size*scale);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.055)'; ctx.lineWidth = 1;
    for (let v = -map.size/2; v <= map.size/2; v += 8) {
      ctx.beginPath(); ctx.moveTo(tx(-map.size/2), tz(v)); ctx.lineTo(tx(map.size/2), tz(v)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx(v), tz(-map.size/2)); ctx.lineTo(tx(v), tz(map.size/2)); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(142,132,83,.90)';
    for (const o of map.obstacles) {
      const [x,z,ww,dd] = o;
      ctx.fillRect(tx(x - ww/2), tz(z - dd/2), Math.max(1.4, ww*scale), Math.max(1.4, dd*scale));
    }
    ctx.strokeStyle = 'rgba(20,18,10,.95)'; ctx.lineWidth = 1;
    for (const o of map.obstacles) { const [x,z,ww,dd] = o; ctx.strokeRect(tx(x-ww/2), tz(z-dd/2), Math.max(1.4, ww*scale), Math.max(1.4, dd*scale)); }
    for (const sp of map.spawns || []) {
      ctx.fillStyle = 'rgba(255,75,45,.95)';
      ctx.beginPath(); ctx.arc(tx(sp[0]), tz(sp[1]), 4.5, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,180,120,.6)'; ctx.stroke();
    }
    const px = map.player[0], pz = map.player[1];
    ctx.save();
    ctx.translate(tx(px), tz(pz));
    ctx.fillStyle = '#ffcf4d';
    ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(6,6); ctx.lineTo(-6,6); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,232,160,.92)';
    ctx.font = '900 13px system-ui, sans-serif';
    ctx.fillText(map.label, 14, 22);
    ctx.fillStyle = 'rgba(200,200,180,.72)';
    ctx.font = '800 11px system-ui, sans-serif';
    ctx.fillText(`${Math.round(map.size)}m x ${Math.round(map.size)}m · 장애물 ${map.obstacles.length}개`, 14, 39);
  }

  handleInput(dt) {
    if (this.input.down('KeyP')) { this.input.keys.delete('KeyP'); this.pause(); return; }
    const mouse = this.input.consumeMouse();
    this.adsTarget = this.input.mouse.right ? 1 : 0;
    const lookMul = 1 - this.ads * .42;
    this.yaw -= mouse.dx * 0.0021 * lookMul;
    this.pitch -= mouse.dy * 0.0017 * lookMul;
    this.pitch = clamp(this.pitch, -1.18, 1.10);

    for (let i = 1; i <= 8; i++) {
      const code = `Digit${i}`;
      if (this.input.down(code)) { this.input.keys.delete(code); const w = WEAPON_DEFS.find(x => x.slot === i); if (w) this.selectWeapon(w.id); }
    }
    const wheel = this.input.consumeWheel();
    if (wheel !== 0) this.cycleWeapon(wheel > 0 ? 1 : -1);

    if (this.downed) {
      this.adsTarget = 0;
      this.moveIntensity = 0;
      this.player.vx = 0; this.player.vz = 0;
      this.updateAssistInput(dt);
      this.input.mouse.down = false;
      return;
    }

    let mx = 0, mz = 0;
    if (this.input.down('KeyW') || this.input.down('ArrowUp')) mz -= 1;
    if (this.input.down('KeyS') || this.input.down('ArrowDown')) mz += 1;
    if (this.input.down('KeyA') || this.input.down('ArrowLeft')) mx -= 1;
    if (this.input.down('KeyD') || this.input.down('ArrowRight')) mx += 1;
    const rawMove = Math.hypot(mx, mz);
    const len = rawMove || 1;
    mx /= len; mz /= len;
    const wantsSprint = this.input.down('ShiftLeft') || this.input.down('ShiftRight');
    if (this.player.stamina <= 1) this.player.staminaLocked = true;
    if (this.player.stamina >= this.player.maxStamina * .58) this.player.staminaLocked = false;
    const sprinting = wantsSprint && rawMove > .01 && this.ads < .12 && !this.input.mouse.right && !this.player.staminaLocked && this.player.stamina > 0;
    if (sprinting) {
      this.player.stamina = Math.max(0, this.player.stamina - this.player.staminaDrain * dt);
    } else {
      // 스태미너는 가만히 서 있으면 차지 않는다. Shift를 떼고 실제로 걸어야 회복된다.
      const walkingForRegen = rawMove > .01 && !wantsSprint && this.ads < .35;
      if (walkingForRegen) this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + this.player.staminaRegen * dt);
    }
    const adsSlow = 1 - this.ads * .54;
    const staminaSlow = this.player.staminaLocked ? .90 : 1;
    const speed = (sprinting ? this.player.sprint : this.player.speed) * adsSlow * staminaSlow;
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    // 카메라가 바라보는 방향 기준 이동. W는 항상 조준점 방향, A/D는 좌우 스트레이프.
    const desiredVx = (mx * cos + mz * sin) * speed;
    const desiredVz = (-mx * sin + mz * cos) * speed;
    const accel = rawMove > .01 ? (1 - Math.exp(-dt * (sprinting ? 17 : 13))) : (1 - Math.exp(-dt * 18));
    this.player.vx += (desiredVx - this.player.vx) * accel;
    this.player.vz += (desiredVz - this.player.vz) * accel;
    if (Math.abs(this.player.vx) < .01) this.player.vx = 0;
    if (Math.abs(this.player.vz) < .01) this.player.vz = 0;
    this.moveEntity(this.player, this.player.vx * dt, this.player.vz * dt, this.player.radius);
    const actualMove = clamp(Math.hypot(this.player.vx, this.player.vz) / Math.max(1, this.player.sprint), 0, 1);
    this.moveIntensity = this.player.grounded ? actualMove * (sprinting ? 1.18 : 1) * (1 - this.ads * .68) : 0;
    this.playerStepCd = Math.max(0, (this.playerStepCd || 0) - dt);
    if (this.player.grounded && actualMove > .18 && this.playerStepCd <= 0) {
      this.audio.playerStep(sprinting, this.ads);
      this.playerStepCd = sprinting ? .26 : (this.ads > .55 ? .58 : .42);
    }

    const jumpDown = this.input.down('Space');
    if (jumpDown && !this.jumpHeld && this.player.grounded) {
      this.player.vy = WORLD.JUMP_VELOCITY;
      this.player.grounded = false;
      this.audio.jump();
    }
    this.jumpHeld = jumpDown;

    this.updateAssistInput(dt);
    if (this.input.down('KeyR')) { this.input.keys.delete('KeyR'); this.reloadSelected(); }
    if (this.input.mouse.down) this.fireSelected(false);
  }


  findAssistTarget() {
    if (!this.remotePlayers || !this.remotePlayers.size || !this.player) return null;
    const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
    let best = null, bestScore = Infinity;
    for (const r of this.remotePlayers.values()) {
      if (!r?.mesh) continue;
      const x = r.mesh.position.x, z = r.mesh.position.z;
      const dx = x - this.player.x, dz = z - this.player.z;
      const d = Math.hypot(dx, dz);
      if (d > 3.15 || d < .05) continue;
      const dot = (dx / d) * fx + (dz / d) * fz;
      if (dot < .52) continue;
      const needsHelp = !!r.downed || (Number.isFinite(r.hp) && r.hp < (r.maxHp || 100) - 2);
      if (!needsHelp) continue;
      const score = d - dot * .85 + (r.downed ? -1.0 : 0);
      if (score < bestScore) { bestScore = score; best = r; }
    }
    return best;
  }

  updateAssistInput(dt) {
    const eDown = this.input.down('KeyE');
    if (!eDown) {
      this.assistHold = 0; this.assistTargetId = null; this.assistSent = false; this.eSelfConsumed = false;
      return false;
    }
    if (!this.usesServerEnemyAuthority()) {
      if (!this.eSelfConsumed) { this.eSelfConsumed = true; this.useMedkit(); }
      return true;
    }
    const target = this.findAssistTarget();
    if (target) {
      if (this.assistTargetId !== target.id) { this.assistTargetId = target.id; this.assistHold = 0; this.assistSent = false; }
      this.assistHold += dt;
      const need = target.downed ? 1.15 : .75;
      const pct = clamp(this.assistHold / need, 0, 1);
      if (UI.centerAlert) {
        UI.centerAlert.textContent = `${target.downed ? '아군 부활' : '아군 치료'} ${Math.round(pct * 100)}%`;
        UI.centerAlert.className = 'show info';
        this.centerAlertTimer = .12;
      }
      if (!this.assistSent && this.assistHold >= need) {
        this.assistSent = true;
        this.net?.sendAction?.('assistAlly', 'pistol', { targetPlayerId: target.id });
        this.showToast(target.downed ? '아군 부활 시도' : '아군 치료 시도');
      }
      return true;
    }
    if (!this.eSelfConsumed) { this.eSelfConsumed = true; this.useMedkit(); }
    return true;
  }

  useMedkit(target = this.player) {
    if (this.downed) { this.showToast('쓰러진 상태에서는 아군 부활 필요'); return false; }
    if ((this.medkits || 0) <= 0) { this.showToast('회복키트 없음'); this.audio.beep(120, .05, 'square', .018); return false; }
    if (this.hp >= this.maxHp - .5) { this.showToast('이미 체력이 가득함'); return false; }
    if (this.usesServerEnemyAuthority()) {
      this.net?.sendAction?.('useMedkit', 'pistol', {});
      this.showToast('회복키트 사용 요청');
      return true;
    }
    const heal = Math.min(25, this.medkits, this.maxHp - this.hp);
    this.medkits = Math.max(0, this.medkits - heal);
    this.hp = Math.min(this.maxHp, this.hp + heal);
    this.showToast(`회복키트 사용 HP +${Math.ceil(heal)}`);
    this.audio.pickup();
    return true;
  }

  updateReload(dt) {
    if (!this.reload?.active) return;
    this.reload.timer -= dt;
    const w = this.getWeapon(this.reload.weapon);
    if (this.viewWeapon) {
      const phase = 1 - clamp(this.reload.timer / Math.max(.01, this.reload.duration), 0, 1);
      this.viewWeapon.rotation.x = -0.06 - Math.sin(phase * Math.PI) * .24;
      this.viewWeapon.position.y = -0.33 - Math.sin(phase * Math.PI) * .10;
    }
    if (this.reload.timer > 0) return;
    this.finishReload(w);
  }

  canMagazineReload(w) { return !!w?.magSize; }

  reloadSelected() {
    const w = this.getWeapon();
    if (!this.canMagazineReload(w)) { this.showToast('이 무기는 장전 없음'); return; }
    if (this.reload?.active) return;
    if ((this.mag[w.id] || 0) >= w.magSize) { this.showToast('탄창 가득함'); return; }
    if (this.ammo[w.id] !== Infinity && (this.ammo[w.id] || 0) <= 0) { this.showToast('예비 탄약 없음'); this.audio.beep(120, .05, 'square', .020); return; }
    const dur = (w.reloadTime || 1.2) * (this.upgrades?.reload || 1);
    this.reload = { active: true, weapon: w.id, timer: dur, duration: dur };
    this.showToast(`${w.name} 재장전`);
    this.audio.reload?.(w.id) || this.audio.beep(240, .08, 'triangle', .024);
    this.net?.sendAction?.('reloadStart', w);
  }

  cancelReload() {
    if (!this.reload?.active) return;
    const w = this.getWeapon(this.reload.weapon);
    this.reload.active = false;
    this.net?.sendAction?.('reloadCancel', w || this.selectedWeapon);
    if (this.viewWeapon) { this.viewWeapon.rotation.set(-.06, -.08, 0); this.viewWeapon.position.set(.34, -.33, -.78); }
  }

  finishReload(w) {
    if (!w || !w.magSize) { this.reload.active = false; return; }
    const current = this.mag[w.id] || 0;
    const need = Math.max(0, w.magSize - current);
    if (need <= 0) { this.reload.active = false; return; }
    if (this.ammo[w.id] === Infinity) {
      this.mag[w.id] = w.magSize;
    } else {
      const take = Math.min(need, this.ammo[w.id] || 0);
      this.mag[w.id] = current + take;
      this.ammo[w.id] = Math.max(0, (this.ammo[w.id] || 0) - take);
    }
    this.reload.active = false;
    this.audio.beep(520, .05, 'triangle', .020);
    this.net?.sendAction?.('reloadEnd', w);
    if (this.viewWeapon) { this.viewWeapon.rotation.set(-.06, -.08, 0); this.viewWeapon.position.set(.34, -.33, -.78); }
  }

  applyWeaponRecoil(w) {
    const hip = 1 - this.ads;
    const adsReduce = .52 + this.ads * .48;
    const base = (w.recoil || .018) * adsReduce;
    this.pitch = clamp(this.pitch + base * (1.0 + hip * .55), -1.45, 1.45);
    this.yaw += rand(-base * (0.35 + hip * .65), base * (0.35 + hip * .65));
    this.weaponKick = Math.min(.22, this.weaponKick + (w.id === 'shotgun' || w.id === 'rocket' ? .12 : .055));
  }

  fireSelected(alt) {
    const w = this.getWeapon();
    const t = now();
    if (this.reload?.active) return;
    if ((this.cooldowns[w.id] || 0) > t) return;
    if (!Number.isFinite(this.ammo[w.id]) && this.ammo[w.id] !== Infinity) this.ammo[w.id] = 0;
    if (this.canMagazineReload(w)) {
      if ((this.mag[w.id] || 0) <= 0) { this.reloadSelected(); return; }
    } else if (Number.isFinite(w.ammoMax) && (this.ammo[w.id] || 0) <= 0) { this.audio.beep(120, .04, 'square', .018); return; }

    this.cooldowns[w.id] = t + w.cooldown;
    const serverAuth = this.usesServerEnemyAuthority();
    let fired = true;
    if (serverAuth && ['hitscan','rail','grenade','rocket'].includes(w.type)) {
      const dir = this.aimDirection(w.spread || 0);
      if (w.type === 'hitscan' || w.type === 'rail') this.spawnBulletVisual(dir, w.range || 34, w.type === 'rail' ? .055 : (w.id === 'shotgun' ? .105 : .085), w.type === 'rail');
      else this.spawnMuzzleFlash(this.getMuzzleWorldPosition(), dir, false);
      this.net?.sendAction?.('fire', w, { alt: !!alt });
    } else {
      if (w.type === 'hitscan') this.fireHitscan(w);
      else if (w.type === 'rail') this.fireRail(w);
      else if (w.type === 'grenade') this.spawnProjectile('grenade', w, alt ? 11 : 17);
      else if (w.type === 'rocket') this.spawnProjectile('rocket', w, w.speed);
      else if (w.type === 'barrel') fired = this.placeBarrel();
      else if (w.type === 'wall') fired = this.placeWall();
    }
    if (!fired) { this.cooldowns[w.id] = 0; return; }
    this.applyWeaponRecoil(w);
    if (this.canMagazineReload(w)) this.mag[w.id] = Math.max(0, (this.mag[w.id] || 0) - 1);
    else if (Number.isFinite(w.ammoMax)) this.ammo[w.id]--;
    if (!serverAuth && w.type !== 'wall' && w.type !== 'barrel') this.net?.sendAction?.('fire', w);
    if (w.type !== 'wall' && w.type !== 'barrel') this.audio.shoot(w.id);
    if (this.canMagazineReload(w) && (this.mag[w.id] || 0) <= 0 && (this.ammo[w.id] === Infinity || (this.ammo[w.id] || 0) > 0)) {
      setTimeout(() => { if (this.running && !this.paused && !this.gameOver && this.selectedWeapon === w.id) this.reloadSelected(); }, 80);
    }
  }

  aimDirection(spread = 0) {
    // 정조준과 힙파이어의 차이를 확실히 둔다.
    // 그냥 쏘면 탄퍼짐이 커지고, 우클릭 정조준은 느려지는 대신 훨씬 정확하다.
    const hip = 1 - this.ads;
    const ads = this.ads;
    const hipPenalty = spread > 0 ? 0.0045 * hip : 0;
    const spreadScale = 1.85 * hip + 0.34 * ads;
    const effectiveSpread = spread * spreadScale + hipPenalty;
    this.tmpEuler.set(this.pitch + rand(-effectiveSpread, effectiveSpread), this.yaw + rand(-effectiveSpread, effectiveSpread), 0, 'YXZ');
    this.tmpDir.set(0, 0, -1).applyEuler(this.tmpEuler).normalize();
    return this.tmpDir.clone();
  }

  fireHitscan(w) {
    let hitSomething = false;
    for (let i = 0; i < w.pellets; i++) {
      const dir = this.aimDirection(w.spread);
      const hit = this.findEnemyOnRay(dir, w.range, .36 + w.spread * 7, false);
      const coreHit = this.findObjectiveCoreOnRay(dir, w.range, .36 + w.spread * 7);
      const wallHit = this.findWallOnRay(this.player.x, this.player.z, dir, w.range);
      const candidates = [];
      if (wallHit) candidates.push({ kind: 'wall', distance: wallHit.distance, data: wallHit });
      if (hit) candidates.push({ kind: 'enemy', distance: hit.distance, data: hit });
      if (coreHit) candidates.push({ kind: 'core', distance: coreHit.distance, data: coreHit });
      candidates.sort((a,b) => a.distance - b.distance);
      const first = candidates[0];
      const distance = first ? first.distance : Math.min(w.range, 26);
      this.spawnBulletVisual(dir, distance, w.id === 'shotgun' ? .12 : .095, false);
      if (first?.kind === 'wall') {
        const impact = { x: this.player.x + dir.x * wallHit.distance, y: this.getEyeY() + dir.y * wallHit.distance, z: this.player.z + dir.z * wallHit.distance };
        if (this.damageWall(wallHit.obstacle, w.damage, 'bullet', impact)) hitSomething = true;
      } else if (first?.kind === 'core') {
        this.damageObjectiveCore(coreHit.core, w.damage * (this.upgrades?.damage || 1), 'bullet', dir);
        hitSomething = true;
      } else if (first?.kind === 'enemy') {
        const hit = first.data;
        const dmg = w.damage * (this.upgrades?.damage || 1) * (hit.multiplier || 1) * (hit.part === 'head' ? (this.upgrades?.headshot || 1) : 1);
        this.damageEnemy(hit.enemy, dmg, hit.part === 'head' ? 'headshot' : 'bullet', dir, hit.part);
        this.spawnHitFx(hit.enemy, dir, hit.distance, hit.part === 'head' ? 'headshot' : 'bullet');
        if (hit.part === 'head') this.audio.headshot();
        hitSomething = true;
      }
    }
    if (hitSomething) this.audio.hit();
  }

  fireRail(w) {
    const dir = this.aimDirection(0);
    const hits = [];
    const wallHit = this.findWallOnRay(this.player.x, this.player.z, dir, w.range);
    const maxRange = wallHit ? wallHit.distance : w.range;
    for (let n = 0; n < w.pierce; n++) {
      const hit = this.findEnemyOnRay(dir, maxRange, .55, true, hits.map(h => h.enemy.id));
      if (!hit) break;
      hits.push(hit);
      const dmg = w.damage * (this.upgrades?.damage || 1) * (hit.part === 'head' ? 1.85 * (this.upgrades?.headshot || 1) : 1);
      this.damageEnemy(hit.enemy, dmg, hit.part === 'head' ? 'headshot' : 'rail', dir, hit.part);
      this.spawnHitFx(hit.enemy, dir, hit.distance, hit.part === 'head' ? 'headshot' : 'rail');
      if (hit.part === 'head') this.audio.headshot();
    }
    if (wallHit) {
      const impact = { x: this.player.x + dir.x * wallHit.distance, y: this.getEyeY() + dir.y * wallHit.distance, z: this.player.z + dir.z * wallHit.distance };
      this.damageWall(wallHit.obstacle, w.damage * 1.1, 'rail', impact);
    }
    const coreHit = this.findObjectiveCoreOnRay(dir, maxRange, .18);
    if (coreHit) this.damageObjectiveCore(coreHit.core, w.damage * 1.45 * (this.upgrades?.damage || 1), 'rail', dir);
    this.spawnBulletVisual(dir, wallHit ? wallHit.distance : (coreHit ? coreHit.distance : (hits.length ? hits[hits.length - 1].distance : 42)), .06, true);
    if (hits.length || wallHit || coreHit) this.audio.hit();
  }

  raySphereT(sx, sy, sz, dir, cx, cy, cz, radius) {
    const ox = sx - cx, oy = sy - cy, oz = sz - cz;
    const b = 2 * (ox * dir.x + oy * dir.y + oz * dir.z);
    const c = ox * ox + oy * oy + oz * oz - radius * radius;
    const disc = b * b - 4 * c;
    if (disc < 0) return null;
    const r = Math.sqrt(disc);
    const t1 = (-b - r) / 2;
    const t2 = (-b + r) / 2;
    if (t1 > .05) return t1;
    if (t2 > .05) return t2;
    return null;
  }

  findEnemyOnRay(dir, range, tolerance, pierce = false, ignoreIds = []) {
    let best = null, bestT = range;
    const sx = this.player.x, sz = this.player.z, sy = this.getEyeY();
    for (const e of this.enemies) {
      if (!e.alive || ignoreIds.includes(e.id)) continue;
      const yBase = e.mesh?.position?.y || 0;
      const bodyR = (e.type === 'devil' ? .74 : (e.type === 'tank' ? .82 : (e.type === 'shield' ? .68 : (e.type === 'runner' ? .54 : .60)))) + tolerance * .38;
      const headR = (e.type === 'devil' ? .46 : (e.type === 'tank' ? .48 : .41)) + tolerance * .18;
      const headT = this.raySphereT(sx, sy, sz, dir, e.x, yBase + 1.58, e.z, headR);
      const bodyT = this.raySphereT(sx, sy, sz, dir, e.x, yBase + .86, e.z, bodyR);
      let candidate = null;
      // 머리 판정은 의도적으로 우선한다. 몸통 볼륨이 앞에서 먼저 잡혀도,
      // 같은 적의 머리 볼륨을 통과하면 헤드샷으로 처리한다.
      if (headT !== null && headT > 0 && headT <= range && !this.wallBlocksRay(sx, sz, dir, headT)) {
        candidate = { enemy: e, distance: headT, part: 'head', multiplier: e.type === 'devil' ? 1.85 : 2.25 };
      } else if (bodyT !== null && bodyT > 0 && bodyT <= range && !this.wallBlocksRay(sx, sz, dir, bodyT)) {
        candidate = { enemy: e, distance: bodyT, part: 'body', multiplier: 1 };
      }
      if (candidate && candidate.distance < bestT) {
        best = candidate;
        bestT = candidate.distance;
      }
    }
    return best;
  }

  wallBlocksRay(sx, sz, dir, maxT) {
    return !!this.findWallOnRay(sx, sz, dir, maxT);
  }

  findWallOnRay(sx, sz, dir, maxT) {
    let best = null;
    let bestT = maxT;
    const candidates = this.rayObstacleCandidates ? this.rayObstacleCandidates(sx, sz, dir, maxT) : (this.obstacles || []);
    for (const o of candidates) {
      if (!o.alive) continue;
      const t = this.rayAabb2D(sx, sz, dir.x, dir.z, o.x - o.w/2, o.z - o.d/2, o.x + o.w/2, o.z + o.d/2);
      if (t !== null && t > .15 && t < bestT) {
        best = { obstacle: o, distance: t };
        bestT = t;
      }
    }
    return best;
  }

  getObstacleAt(x, z, radius = .22) {
    const candidates = this.nearbyObstacles ? this.nearbyObstacles(x, z, radius + .65) : (this.obstacles || []);
    for (const o of candidates) {
      if (!o.alive) continue;
      const cx = clamp(x, o.x - o.w/2, o.x + o.w/2);
      const cz = clamp(z, o.z - o.d/2, o.z + o.d/2);
      if (dist2(x,z,cx,cz) < radius * radius) return o;
    }
    return null;
  }

  damageWall(o, amount = 10, source = 'bullet', impact = null) {
    if (!o || !o.alive || o.kind !== 'fakeWall') return false;
    o.hp -= amount;
    const ratio = clamp(o.hp / Math.max(1, o.maxHp || 1), 0, 1);
    const level = ratio < .25 ? 3 : (ratio < .55 ? 2 : (ratio < .82 ? 1 : 0));
    if (level > (o.crackLevel || 0)) { this.addWallCracks(o, level); this.audio.wallCrack(); }
    if (impact) this.spawnWallHitFx(impact.x, impact.y || 1.35, impact.z, source);
    if (o.hp <= 0) this.breakWall(o, source);
    return true;
  }

  addWallCracks(o, level = 1) {
    o.crackLevel = level;
    if (o.crackGroup?.parent) this.scene.remove(o.crackGroup);
    const g = new THREE.Group();
    const horizontal = o.w >= o.d;
    const faces = horizontal ? [o.z - o.d/2 - .018, o.z + o.d/2 + .018] : [o.x - o.w/2 - .018, o.x + o.w/2 + .018];
    // 설치 벽이 많아질 때 렉을 만드는 주범이 crack 조각 수였으므로 수를 줄인다.
    const crackCount = level * 2;
    for (const face of faces) {
      for (let i = 0; i < crackCount; i++) {
        const c = new THREE.Mesh(this.geos.lowBox, this.materials.crack);
        const y = rand(.55, 2.65);
        const len = rand(.25, .72) * (level === 3 ? 1.2 : 1);
        if (horizontal) {
          const x = o.x + rand(-o.w * .38, o.w * .38);
          c.position.set(x, y, face);
          c.scale.set(len, .035, .018);
        } else {
          const z = o.z + rand(-o.d * .38, o.d * .38);
          c.position.set(face, y, z);
          c.scale.set(.018, .035, len);
        }
        c.rotation.y = horizontal ? 0 : Math.PI / 2;
        c.rotation.z = rand(-.8, .8);
        g.add(c);
      }
    }
    this.scene.add(g);
    o.crackGroup = g;
  }

  breakWall(o, source = 'damage') {
    if (!o || !o.alive) return;
    o.alive = false;
    this.collisionIndexDirty = true;
    if (o.kind === 'fakeWall') this.markNavDirty();
    this.spawnWallDebris(o);
    if (o.mesh?.parent) this.scene.remove(o.mesh);
    if (o.crackGroup?.parent) this.scene.remove(o.crackGroup);
    for (const extra of o.extras || []) if (extra?.parent) this.scene.remove(extra);
    this.audio.wallBreak();
  }

  spawnWallHitFx(x, y, z, source = 'bullet') {
    const count = source === 'rail' ? 5 : 3;
    for (let i = 0; i < count; i++) {
      const chip = new THREE.Mesh(this.geos.lowBox, this.materials.dust);
      chip.position.set(x + rand(-.06,.06), y + rand(-.05,.08), z + rand(-.06,.06));
      chip.scale.setScalar(rand(.05,.11));
      this.scene.add(chip);
      this.fx.push({ mesh: chip, life: rand(.22,.38), max: .38, debris: true, vx: rand(-1.2,1.2), vy: rand(.5,1.8), vz: rand(-1.2,1.2), rx: rand(-6,6), ry: rand(-6,6), rz: rand(-6,6), fadeStart: .08 });
    }
  }

  spawnWallDebris(o) {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const piece = new THREE.Mesh(this.geos.lowBox, this.materials.fakeWall.clone());
      piece.material.transparent = true;
      piece.material.opacity = 1;
      const px = o.x + rand(-o.w * .45, o.w * .45);
      const pz = o.z + rand(-o.d * .45, o.d * .45);
      piece.position.set(px, rand(.45, 2.4), pz);
      piece.scale.set(rand(.18,.48), rand(.12,.40), rand(.10,.34));
      this.applyShadows(piece, true, true);
      this.scene.add(piece);
      this.fx.push({ mesh: piece, life: 1.0, max: 1.0, debris: true, vx: rand(-2.4,2.4), vy: rand(1.2,4.2), vz: rand(-2.4,2.4), rx: rand(-8,8), ry: rand(-8,8), rz: rand(-8,8), fadeStart: .25 });
    }
  }

  rayAabb2D(ox, oz, dx, dz, minX, minZ, maxX, maxZ) {
    const invX = Math.abs(dx) < .0001 ? 1e9 : 1 / dx;
    const invZ = Math.abs(dz) < .0001 ? 1e9 : 1 / dz;
    let t1 = (minX - ox) * invX, t2 = (maxX - ox) * invX;
    let t3 = (minZ - oz) * invZ, t4 = (maxZ - oz) * invZ;
    const tmin = Math.max(Math.min(t1,t2), Math.min(t3,t4));
    const tmax = Math.min(Math.max(t1,t2), Math.max(t3,t4));
    if (tmax < 0 || tmin > tmax) return null;
    return tmin >= 0 ? tmin : tmax;
  }

  getEyeY() {
    return this.player.y + this.player.eyeHeight;
  }

  getMuzzleWorldPosition() {
    const fallback = new THREE.Vector3(this.player.x, this.getEyeY() - .22, this.player.z);
    if (!this.viewWeaponBarrel) return fallback;
    this.camera.updateMatrixWorld(true);
    this.viewWeaponBarrel.updateMatrixWorld(true);
    const tip = new THREE.Vector3(0, 0, -0.5);
    tip.applyMatrix4(this.viewWeaponBarrel.matrixWorld);
    return tip;
  }


  lookDirection(yaw = this.yaw, pitch = this.pitch) {
    this.tmpEuler.set(Number(pitch) || 0, Number(yaw) || 0, 0, 'YXZ');
    return new THREE.Vector3(0, 0, -1).applyEuler(this.tmpEuler).normalize();
  }

  getRemoteMuzzleWorldPosition(r, dir) {
    const mesh = r?.mesh;
    const base = mesh ? mesh.position : new THREE.Vector3(r?.target?.x || 0, r?.target?.y || 0, r?.target?.z || 0);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), r?.target?.yaw || r?.yaw || 0);
    return new THREE.Vector3(base.x, base.y + 1.22, base.z)
      .addScaledVector(dir || this.lookDirection(r?.target?.yaw || 0, r?.target?.pitch || 0), .54)
      .addScaledVector(right, .26);
  }

  spawnRemoteMuzzleFlash(start, dir, rail = false) {
    const flash = new THREE.Mesh(this.geos.sphere, rail ? this.materials.rail : this.materials.fire);
    flash.position.copy(start).addScaledVector(dir, .20);
    flash.scale.set(rail ? .30 : .20, rail ? .30 : .20, rail ? .30 : .20);
    this.scene.add(flash);
    this.fx.push({ mesh: flash, life: rail ? .075 : .05, max: rail ? .075 : .05, scaleOut: true });
  }

  spawnRemoteBulletVisual(r, dir, weaponId = 'pistol') {
    const w = this.getWeapon(weaponId) || this.getWeapon('pistol');
    const rail = w?.type === 'rail';
    const start = this.getRemoteMuzzleWorldPosition(r, dir);
    const visualLength = rail ? 2.5 : (weaponId === 'shotgun' ? .55 : .68);
    const thickness = rail ? .055 : (weaponId === 'shotgun' ? .105 : .085);
    const mesh = new THREE.Mesh(this.geos.bulletSlug, rail ? this.materials.rail : this.materials.bullet);
    mesh.scale.set(thickness, thickness, visualLength);
    mesh.position.copy(start).addScaledVector(dir, visualLength * .5 + .16);
    mesh.lookAt(start.clone().add(dir));
    this.scene.add(mesh);
    const maxDistance = rail ? 46 : (weaponId === 'shotgun' ? 18 : 28);
    const speed = rail ? 150 : 92;
    const maxLife = clamp(maxDistance / speed, .06, rail ? .18 : .25);
    this.fx.push({ mesh, life: maxLife, max: maxLife, bullet: true, dir: dir.clone(), speed, traveled: 0, maxDistance, segment: visualLength });
    this.spawnRemoteMuzzleFlash(start, dir, rail);
  }

  spawnRemoteThrownVisual(r, dir, weaponId = 'grenade') {
    const start = this.getRemoteMuzzleWorldPosition(r, dir);
    const mat = weaponId === 'rocket' ? this.materials.fire : this.materials.barrel;
    const mesh = new THREE.Mesh(this.geos.sphere, mat);
    mesh.position.copy(start).addScaledVector(dir, .38);
    mesh.scale.setScalar(weaponId === 'rocket' ? .20 : .16);
    this.scene.add(mesh);
    this.fx.push({ mesh, life: weaponId === 'rocket' ? .32 : .45, max: weaponId === 'rocket' ? .32 : .45, bullet: true, dir: dir.clone(), speed: weaponId === 'rocket' ? 28 : 16, traveled: 0, maxDistance: weaponId === 'rocket' ? 9 : 7 });
    this.spawnRemoteMuzzleFlash(start, dir, false);
  }

  spawnRemoteWeaponFx(r, action = {}) {
    const weaponId = String(action.weapon || r.weapon || 'pistol');
    const dir = this.lookDirection(action.yaw ?? r.target?.yaw ?? r.yaw, action.pitch ?? r.target?.pitch ?? r.pitch);
    if (['grenade', 'rocket'].includes(weaponId)) this.spawnRemoteThrownVisual(r, dir, weaponId);
    else if (weaponId !== 'wall' && weaponId !== 'barrel') this.spawnRemoteBulletVisual(r, dir, weaponId);
    this.audio.shoot(weaponId);
  }

  spawnMuzzleFlash(start, dir, rail = false) {
    const flash = new THREE.Mesh(this.geos.sphere, rail ? this.materials.rail : this.materials.fire);
    flash.position.copy(start).addScaledVector(dir, .18);
    flash.scale.set(rail ? .34 : .22, rail ? .34 : .22, rail ? .34 : .22);
    this.scene.add(flash);
    this.fx.push({ mesh: flash, life: rail ? .07 : .045, max: rail ? .07 : .045, scaleOut: true });
  }

  spawnBulletVisual(dir, distance, thickness = .095, rail = false) {
    // 기존의 긴 레이저선 대신, 총구에서 빠르게 날아가는 짧고 굵은 탄자/예광탄으로 표현한다.
    const start = this.getMuzzleWorldPosition();
    const visualLength = rail ? 2.8 : .72;
    const mesh = new THREE.Mesh(this.geos.bulletSlug, rail ? this.materials.rail : this.materials.bullet);
    mesh.scale.set(thickness, thickness, visualLength);
    mesh.position.copy(start).addScaledVector(dir, visualLength * .5 + .12);
    mesh.lookAt(start.clone().add(dir));
    this.scene.add(mesh);
    const speed = rail ? 150 : 92;
    const maxLife = clamp(distance / speed, .045, rail ? .18 : .23);
    this.fx.push({ mesh, life: maxLife, max: maxLife, bullet: true, dir: dir.clone(), speed, traveled: 0, maxDistance: distance, segment: visualLength });
    this.spawnMuzzleFlash(start, dir, rail);
  }

  spawnArmorChipFx(e, dir = null) {
    if (!e?.mesh || Math.random() < .45) return;
    const kx = dir?.x || Math.sin(e.mesh.rotation.y);
    const kz = dir?.z || Math.cos(e.mesh.rotation.y);
    for (let i = 0; i < 3; i++) {
      const chip = new THREE.Mesh(this.geos.lowBox, this.materials.tankStripe);
      chip.position.set(e.x + rand(-.28,.28), rand(.78,1.36), e.z + rand(-.28,.28));
      chip.scale.set(rand(.04,.09), rand(.025,.06), rand(.08,.16));
      chip.rotation.set(rand(-1,1), rand(-1,1), rand(-1,1));
      this.scene.add(chip);
      this.fx.push({ mesh: chip, life: rand(.18,.32), max: .32, pop: true, vx: -kx * rand(.8,1.8) + rand(-.5,.5), vy: rand(.5,1.4), vz: -kz * rand(.8,1.8) + rand(-.5,.5), fadeStart: .04 });
    }
  }

  spawnShieldHitFx(e) {
    if (!e?.mesh) return;
    const yaw = e.mesh.rotation.y || 0;
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    const base = new THREE.Vector3(e.x + fx * .70, 1.05, e.z + fz * .70);
    for (let i = 0; i < 7; i++) {
      const p = new THREE.Mesh(this.geos.lowBox, i % 2 ? this.materials.rail : this.materials.bullet);
      p.position.set(base.x + rand(-.15,.15), base.y + rand(-.28,.28), base.z + rand(-.15,.15));
      p.scale.set(rand(.035,.075), rand(.035,.075), rand(.10,.20));
      p.rotation.set(rand(-1,1), rand(-1,1), rand(-1,1));
      this.scene.add(p);
      this.fx.push({ mesh: p, life: rand(.14,.24), max: .24, pop: true, vx: fx * rand(.6,1.8) + rand(-.8,.8), vy: rand(.4,1.2), vz: fz * rand(.6,1.8) + rand(-.8,.8), fadeStart: .04 });
    }
  }

  spawnHitFx(enemy, dir, distance, kind = 'bullet') {
    const pos = new THREE.Vector3(
      this.player.x + dir.x * distance,
      this.getEyeY() + dir.y * distance,
      this.player.z + dir.z * distance
    );
    const mat = enemy.type === 'devil' ? this.materials.fire : this.materials.blood;
    const burstCount = kind === 'headshot' ? 7 : (kind === 'rail' ? 5 : 3);
    for (let i = 0; i < burstCount; i++) {
      const p = new THREE.Mesh(this.geos.sphere, mat);
      p.position.set(pos.x + rand(-.08,.08), pos.y + rand(-.08,.08), pos.z + rand(-.08,.08));
      p.scale.setScalar(rand(.09, .16));
      this.scene.add(p);
      this.fx.push({ mesh: p, life: rand(.16,.28), max: .28, pop: true, vx: -dir.x * rand(1.2, 2.8) + rand(-.9,.9), vy: rand(.6, 1.6), vz: -dir.z * rand(1.2, 2.8) + rand(-.9,.9) });
    }
  }

  spawnProjectile(kind, w, speed) {
    const dir = this.aimDirection(kind === 'grenade' ? .035 : .006);
    const mesh = new THREE.Mesh(this.geos.sphere, kind === 'rocket' ? this.materials.fire : this.materials.bullet);
    const start = this.getMuzzleWorldPosition();
    mesh.position.copy(start);
    this.applyShadows(mesh, true, false);
    this.scene.add(mesh);
    this.projectiles.push({ kind, mesh, x: mesh.position.x, z: mesh.position.z, y: mesh.position.y, vx: dir.x * speed, vz: dir.z * speed, vy: kind === 'grenade' ? 4.8 : dir.y * speed, life: kind === 'grenade' ? 1.15 : 2.2, radius: w.radius, damage: w.damage * (this.upgrades?.damage || 1) });
  }

  createMineModel() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(this.geos.mine, this.materials.mineDark);
    base.position.y = .12;
    this.applyShadows(base, true, true);
    g.add(base);
    const cap = new THREE.Mesh(this.geos.mineButton, this.materials.mineMetal);
    cap.position.y = .255;
    this.applyShadows(cap, true, true);
    g.add(cap);
    const stripeA = new THREE.Mesh(this.geos.lowBox, this.materials.barrel);
    stripeA.position.set(0, .30, 0); stripeA.scale.set(1.15, .035, .10);
    g.add(stripeA);
    const stripeB = new THREE.Mesh(this.geos.lowBox, this.materials.barrel);
    stripeB.position.set(0, .305, 0); stripeB.scale.set(.10, .035, 1.15);
    g.add(stripeB);
    const edge = new THREE.LineSegments(this.getEdgeGeometry(this.geos.mine), this.materials.lineOutline);
    edge.position.copy(base.position); edge.scale.copy(base.scale);
    g.add(edge);
    return g;
  }

  placeBarrel() {
    const pos = this.placePosition(3.2, { w: 1.45, d: 1.45 });
    if (!pos) return false;
    if (this.usesServerEnemyAuthority()) {
      this.net?.sendAction?.('placeMine', 'barrel', { placement: { x: pos.x, z: pos.z, w: 1.28, d: 1.28 } });
      this.audio.placeMine();
      return true;
    }
    const mesh = this.createMineModel();
    mesh.position.set(pos.x, 0, pos.z);
    mesh.rotation.y = rand(0, Math.PI * 2);
    this.scene.add(mesh);
    const barrel = { kind: 'barrel', x: pos.x, z: pos.z, w: 1.28, d: 1.28, hp: 22, mesh, alive: true, radius: 5.8, damage: 125 };
    this.placeables.push(barrel);
    this.audio.placeMine();
    return true;
  }

  placeWall() {
    const placement = this.getWallPlacement(true);
    if (!placement || !placement.valid) return false;
    if (this.usesServerEnemyAuthority()) {
      this.net?.sendAction?.('placeWall', 'wall', { placement: { x: placement.x, z: placement.z, w: placement.w, d: placement.d } });
      this.audio.placeWall();
      return true;
    }
    const ob = this.addObstacle(placement.x, placement.z, placement.w, placement.d, 'fakeWall', Math.round(115 * (this.upgrades?.wallHp || 1)));
    this.placeables.push(ob);
    this.audio.placeWall();
    return true;
  }

  createWallPreview() {
    const group = new THREE.Group();
    group.visible = false;
    const mesh = new THREE.Mesh(this.geos.wall, this.materials.wallPreviewValid);
    mesh.position.y = WORLD.WALL_HEIGHT / 2;
    mesh.renderOrder = 8;
    group.add(mesh);

    const edges = new THREE.LineSegments(this.getEdgeGeometry(this.geos.wall), new THREE.LineBasicMaterial({ color: 0xe8ffff, transparent: true, opacity: .72, depthWrite: false }));
    edges.position.y = WORLD.WALL_HEIGHT / 2;
    edges.renderOrder = 9;
    group.add(edges);
    group.userData = { mesh, edges };
    this.scene.add(group);
    return group;
  }

  getWallPlacement(showMessage = false) {
    const dir = this.aimDirection(0);
    // 바라보는 방향 기준으로 벽의 가로/세로를 미리 계산한다.
    const acrossZ = Math.abs(dir.z) >= Math.abs(dir.x);
    const w = acrossZ ? 3.25 : .82;
    const d = acrossZ ? .82 : 3.25;
    const pos = this.placePosition(3.05, { w, d }, showMessage);
    if (!pos) {
      const flatLen = Math.hypot(dir.x, dir.z) || 1;
      return { valid: false, w, d, x: this.player.x + (dir.x / flatLen) * 3.05, z: this.player.z + (dir.z / flatLen) * 3.05 };
    }
    return { valid: true, w, d, x: pos.x, z: pos.z };
  }

  updateWallPreview() {
    if (!this.wallPreview) return;
    const active = this.selectedWeapon === 'wall' && this.input?.mouse?.right && this.running && !this.paused && !this.gameOver;
    if (!active) { this.wallPreview.visible = false; return; }
    const placement = this.getWallPlacement(false);
    this.wallPreview.visible = true;
    this.wallPreview.position.set(placement.x, 0, placement.z);
    this.wallPreview.scale.set(placement.w, 1, placement.d);
    const { mesh, edges } = this.wallPreview.userData;
    mesh.material = placement.valid ? this.materials.wallPreviewValid : this.materials.wallPreviewInvalid;
    edges.material.color.set(placement.valid ? 0xe8ffff : 0xffb199);
    edges.material.opacity = placement.valid ? .72 : .62;
  }

  placePosition(distance, footprint = { w: 1.0, d: 1.0 }, showMessage = true) {
    const dir = this.aimDirection(0);
    const flatLen = Math.hypot(dir.x, dir.z) || 1;
    const fx = dir.x / flatLen;
    const fz = dir.z / flatLen;
    const x = this.player.x + fx * distance;
    const z = this.player.z + fz * distance;
    if (this.rectCollides(x, z, footprint.w, footprint.d, .12)) { if (showMessage) this.showToast('여기에는 설치할 수 없음'); return null; }
    if (dist2(x, z, this.player.x, this.player.z) < (this.player.radius + Math.max(footprint.w, footprint.d) * .45) ** 2) {
      if (showMessage) this.showToast('너무 가까움');
      return null;
    }
    return { x, z };
  }

  rectCollides(x, z, w, d, pad = 0) {
    const candidates = this.nearbyObstacles ? this.nearbyObstacles(x, z, Math.max(w, d) * .75 + pad) : (this.obstacles || []);
    for (const o of candidates) {
      if (!o.alive) continue;
      if (Math.abs(x - o.x) < (w/2 + o.w/2 + pad) && Math.abs(z - o.z) < (d/2 + o.d/2 + pad)) return true;
    }
    for (const b of this.placeables || []) {
      if (!b.alive || b.kind === 'fakeWall') continue;
      const bw = b.w || 1, bd = b.d || 1;
      if (Math.abs(x - b.x) < (w/2 + bw/2 + pad) && Math.abs(z - b.z) < (d/2 + bd/2 + pad)) return true;
    }
    return false;
  }

  updateSpawning(dt) {
    if (!this.prepPhase && this.currentMission && this.updateMissionState(dt)) return;
    if (this.spawnQueue > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.enemies.filter(e => e.alive).length < 72) {
        if (this.spawnEnemy()) this.spawnQueue--;
        this.spawnTimer = clamp(.72 - this.wave * .018, .18, .7);
      }
    } else if (this.prepPhase) {
      this.prepTimer -= dt;
      if (this.prepTimer <= 0) this.nextWave();
    } else if (!['survive','core'].includes(this.currentMission?.type) && this.enemies.every(e => !e.alive)) {
      this.waveBreak += dt;
      if (this.waveBreak > 1.35) this.completeWave();
    }
  }

  updateEnemies(dt) {
    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.stun = Math.max(0, e.stun - dt);
      e.hitTimer = Math.max(0, (e.hitTimer || 0) - dt);
      e.attackAnim = Math.max(0, (e.attackAnim || 0) - dt);
      e.castAnim = Math.max(0, (e.castAnim || 0) - dt);
      e.recoilTimer = Math.max(0, (e.recoilTimer || 0) - dt);
      e.meleeCd = Math.max(0, (e.meleeCd || 0) - dt);
      e.aiThink = Math.max(0, (e.aiThink || 0) - dt);
      const dxp = this.player.x - e.x, dzp = this.player.z - e.z;
      const d = Math.hypot(dxp, dzp) || 1;
      const nx = dxp / d, nz = dzp / d;
      const prevX = e.x, prevZ = e.z;

      // 플레이어와 적 사이에 설치 벽이 있으면, 그 벽을 우선 목표로 잡는다.
      // 일반 좀비/러너는 가까이 가서 손으로 부수고, 데빌은 멀리서 화염구로 부순다.
      const blocker = this.findWallOnRay(e.x, e.z, { x: nx, z: nz }, d);
      const playerWallBlocker = blocker && blocker.obstacle?.kind === 'fakeWall' ? blocker.obstacle : null;
      let wallAttack = false;
      let target = { x: this.player.x, z: this.player.z };
      if (playerWallBlocker) {
        const near = this.closestPointOnObstacle(playerWallBlocker, e.x, e.z);
        target = { x: near.x, z: near.z };
        const wallDist = Math.hypot(e.x - near.x, e.z - near.z);
        const wallReach = e.radius + (e.type === 'runner' ? .78 : (e.type === 'devil' ? 1.05 : (e.type === 'tank' ? 1.08 : .88)));
        if (e.type === 'bomber' && wallDist <= wallReach + .25 && e.meleeCd <= 0) {
          this.detonateEnemy(e, 'wall');
          continue;
        }
        if (wallDist <= wallReach && e.meleeCd <= 0 && e.type !== 'devil') {
          wallAttack = true;
          this.enemyAttackWall(e, playerWallBlocker, near);
        }
      }

      const tdx = target.x - e.x, tdz = target.z - e.z;
      const td = Math.hypot(tdx, tdz) || 1;
      const tnx = tdx / td, tnz = tdz / td;
      e.mesh.rotation.y = Math.atan2(tnx, tnz);
      if (e.type === 'devil') this.updateDevil(e, dt, d, nx, nz, playerWallBlocker);

      if (e.type === 'bomber') {
        const warnRange = e.radius + this.player.radius + 3.15;
        if (!playerWallBlocker && d < warnRange) {
          e.bomberFlash = Math.max(e.bomberFlash || 0, .22);
          if (!e.bomberWarned) { e.bomberWarned = true; this.audio.bomberWarn(); }
        } else if (d > warnRange + .8) {
          e.bomberWarned = false;
        }
        e.bomberFlash = Math.max(0, (e.bomberFlash || 0) - dt);
      }

      if ((e.kvx || e.kvz) && Math.hypot(e.kvx || 0, e.kvz || 0) > .01) {
        this.moveEnemy(e, (e.kvx || 0) * dt, (e.kvz || 0) * dt);
        e.kvx *= Math.exp(-dt * 9);
        e.kvz *= Math.exp(-dt * 9);
      }
      if (e.stun <= 0 && !wallAttack) {
        const steer = this.getEnemySteering(e, target.x, target.z, dt);
        const targetVx = steer.x * e.speed;
        const targetVz = steer.z * e.speed;
        const smooth = 1 - Math.exp(-dt * (steer.avoiding ? 11 : 8));
        e.vx += (targetVx - e.vx) * smooth;
        e.vz += (targetVz - e.vz) * smooth;
        this.moveEnemy(e, e.vx * dt, e.vz * dt);
      } else {
        e.vx *= .78; e.vz *= .78;
      }

      const zombieAttackRange = e.radius + this.player.radius + (e.type === 'runner' ? .82 : (e.type === 'tank' ? .92 : .74));
      const devilClawRange = e.radius + this.player.radius + .55;
      if (!playerWallBlocker && e.type === 'bomber' && d < e.radius + this.player.radius + 1.05 && e.meleeCd <= 0) {
        this.detonateEnemy(e, 'self');
        continue;
      }
      if (!playerWallBlocker && d < zombieAttackRange && e.meleeCd <= 0 && e.type !== 'devil') {
        // 일정 거리 안으로 들어오면 닿기만 하는 게 아니라 팔을 뻗어 때린다.
        e.meleeCd = e.type === 'runner' ? .72 : (e.type === 'tank' ? 1.12 : .92);
        e.attackAnim = e.type === 'tank' ? .50 : .42;
        e.attackMax = e.attackAnim;
        e.stun = Math.max(e.stun || 0, .08);
        this.damagePlayer(e.damage * (e.type === 'runner' ? .46 : (e.type === 'tank' ? .72 : .60)), e, 'melee');
        this.audio.enemyAttack(e.type);
      } else if (!playerWallBlocker && d < devilClawRange && e.meleeCd <= 0 && e.type === 'devil') {
        e.meleeCd = 1.15;
        e.attackAnim = .40;
        e.attackMax = .40;
        this.damagePlayer(e.damage * .48, e, 'melee');
        this.audio.enemyAttack(e.type);
      }
      e.walkSpeed = Math.hypot(e.x - prevX, e.z - prevZ) / Math.max(.001, dt);
      const desiredSpeed = Math.hypot(e.vx || 0, e.vz || 0);
      if (desiredSpeed > .25 && e.walkSpeed < .08 && e.stun <= 0) e.stuckTime = (e.stuckTime || 0) + dt;
      else e.stuckTime = Math.max(0, (e.stuckTime || 0) - dt * 2.2);
      if (e.walkSpeed > .05) {
        const pace = e.type === 'runner' ? 10.2 : (e.type === 'bomber' ? 8.6 : (e.type === 'tank' ? 3.7 : (e.type === 'devil' ? 4.2 : 6.2)));
        e.walkPhase += dt * pace * clamp(e.walkSpeed / Math.max(.1, e.speed), .35, 1.55);
        e.stepCd = Math.max(0, (e.stepCd || 0) - dt);
        if (e.stepCd <= 0 && d < 24) {
          this.audio.enemyStep(e.type);
          e.stepCd = e.type === 'runner' || e.type === 'bomber' ? .23 : (e.type === 'tank' ? .58 : (e.type === 'devil' ? .52 : .38));
        }
      } else {
        e.stepCd = Math.max(0, (e.stepCd || 0) - dt);
      }
      this.applyEnemyVisualPose(e);
    }
    this.resolveEnemyOverlaps();
    for (const e of this.enemies) {
      if (e.alive) this.applyEnemyVisualPose(e);
    }
    this.enemies = this.enemies.filter(e => e.alive || e.mesh.parent);
  }

  resolveEnemyOverlaps() {
    const alive = this.enemies.filter(e => e.alive);
    if (alive.length < 2) return;
    // 예전 방식은 매 프레임 모든 적 쌍을 비교했다. 적이 플레이어 설치 벽 앞에 몰리면
    // O(n²) 겹침 보정이 누적되어 렉이 커졌으므로, 가까운 셀의 적끼리만 비교한다.
    const cell = 2.2;
    const keyOf = (x, z) => `${Math.floor(x / cell)},${Math.floor(z / cell)}`;
    const neighborKeys = (x, z) => {
      const ix = Math.floor(x / cell), iz = Math.floor(z / cell);
      const keys = [];
      for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) keys.push(`${ix + dx},${iz + dz}`);
      return keys;
    };
    const maxIter = alive.length > 45 ? 1 : 2;
    for (let iter = 0; iter < maxIter; iter++) {
      const grid = new Map();
      for (const e of alive) {
        const k = keyOf(e.x, e.z);
        let arr = grid.get(k);
        if (!arr) grid.set(k, arr = []);
        arr.push(e);
      }
      const handled = new Set();
      for (const a of alive) {
        for (const k of neighborKeys(a.x, a.z)) {
          const arr = grid.get(k);
          if (!arr) continue;
          for (const b of arr) {
            if (a === b) continue;
            const pairKey = a.id < b.id ? `${a.id}:${b.id}` : `${b.id}:${a.id}`;
            if (handled.has(pairKey)) continue;
            handled.add(pairKey);
            let dx = a.x - b.x;
            let dz = a.z - b.z;
            let d2 = dx * dx + dz * dz;
            const minD = a.radius + b.radius + .18;
            if (d2 >= minD * minD) continue;
            if (d2 < .0001) {
              const ang = ((a.id * 97 + b.id * 31) % 628) / 100;
              dx = Math.cos(ang); dz = Math.sin(ang); d2 = 1;
            }
            const d = Math.sqrt(d2);
            const nx = dx / d, nz = dz / d;
            const push = Math.min(.12, (minD - d) * .42);
            this.trySeparateEnemy(a, nx * push, nz * push);
            this.trySeparateEnemy(b, -nx * push, -nz * push);
          }
        }
      }
    }
  }

  trySeparateEnemy(e, dx, dz) {
    if (!e || !e.alive) return;
    if (!this.collides(e.x + dx, e.z, e.radius)) e.x += dx;
    if (!this.collides(e.x, e.z + dz, e.radius)) e.z += dz;
  }

  closestPointOnObstacle(o, x, z) {
    return {
      x: clamp(x, o.x - o.w / 2, o.x + o.w / 2),
      z: clamp(z, o.z - o.d / 2, o.z + o.d / 2)
    };
  }

  enemyAttackWall(e, wall, hitPoint = null) {
    if (!e || !e.alive || !wall || !wall.alive) return false;
    const p = hitPoint || this.closestPointOnObstacle(wall, e.x, e.z);
    e.meleeCd = e.type === 'runner' ? .62 : (e.type === 'tank' ? 1.05 : .88);
    e.attackAnim = e.type === 'tank' ? .54 : .46;
    e.attackMax = e.attackAnim;
    e.stun = Math.max(e.stun || 0, .10);
    const power = e.damage * (e.type === 'runner' ? .95 : (e.type === 'tank' ? 2.25 : 1.22)) * (e.wallPower || 1);
    this.damageWall(wall, power, 'claw', { x: p.x, y: 1.18, z: p.z });
    this.audio.enemyAttack(e.type);
    return true;
  }

  markNavDirty() {
    this.navVersion = (this.navVersion || 1) + 1;
    this.navGrid = null;
    // 설치 벽이 여러 개 생길 때 모든 적이 같은 프레임에 A*를 다시 돌리면 순간 렉이 커진다.
    // 경로 무효화는 하되, 재계산 타이밍을 적마다 살짝 흩뿌려 프레임 스파이크를 줄인다.
    for (const e of this.enemies || []) {
      e.navPath = null;
      e.navIndex = 0;
      e.aiPathTimer = rand(.08, .42);
      e.navFailedUntil = 0;
      e.navFailTarget = null;
    }
  }

  buildNavGrid(radius = .78) {
    const cell = 2.0;
    const half = this.map.size / 2;
    const cols = Math.ceil(this.map.size / cell);
    const rows = cols;
    const walkable = new Uint8Array(cols * rows);
    const clearance = radius + .18;
    const toIndex = (ix, iz) => iz * cols + ix;
    for (let iz = 0; iz < rows; iz++) {
      for (let ix = 0; ix < cols; ix++) {
        const x = -half + cell * (ix + .5);
        const z = -half + cell * (iz + .5);
        walkable[toIndex(ix, iz)] = this.collides(x, z, clearance) ? 0 : 1;
      }
    }
    this.navGrid = { cell, half, cols, rows, walkable, radius, version: this.navVersion || 1 };
    return this.navGrid;
  }

  getNavGrid(radius = .78) {
    if (!this.navGrid || this.navGrid.version !== (this.navVersion || 1) || Math.abs((this.navGrid.radius || 0) - radius) > .08) {
      return this.buildNavGrid(radius);
    }
    return this.navGrid;
  }

  navWorldToCell(x, z, nav) {
    const ix = clamp(Math.floor((x + nav.half) / nav.cell), 0, nav.cols - 1);
    const iz = clamp(Math.floor((z + nav.half) / nav.cell), 0, nav.rows - 1);
    return { ix, iz, i: iz * nav.cols + ix };
  }

  navCellToWorld(ix, iz, nav) {
    return { x: -nav.half + nav.cell * (ix + .5), z: -nav.half + nav.cell * (iz + .5) };
  }

  nearestWalkableCell(ix, iz, nav, maxR = 7) {
    const idx = (x, z) => z * nav.cols + x;
    if (ix >= 0 && iz >= 0 && ix < nav.cols && iz < nav.rows && nav.walkable[idx(ix, iz)]) return { ix, iz, i: idx(ix, iz) };
    for (let r = 1; r <= maxR; r++) {
      let best = null;
      let bestD = Infinity;
      for (let dz = -r; dz <= r; dz++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue;
          const x = ix + dx, z = iz + dz;
          if (x < 0 || z < 0 || x >= nav.cols || z >= nav.rows) continue;
          const i = idx(x, z);
          if (!nav.walkable[i]) continue;
          const d = dx * dx + dz * dz;
          if (d < bestD) { bestD = d; best = { ix: x, iz: z, i }; }
        }
      }
      if (best) return best;
    }
    return null;
  }

  lineClear2D(ax, az, bx, bz, radius = .62) {
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz);
    if (len < .001) return true;
    const steps = Math.ceil(len / .75);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      if (this.collides(ax + dx * t, az + dz * t, radius)) return false;
    }
    return true;
  }

  findNavPath(sx, sz, tx, tz, radius = .75) {
    const nav = this.getNavGrid(radius);
    const startRaw = this.navWorldToCell(sx, sz, nav);
    const goalRaw = this.navWorldToCell(tx, tz, nav);
    const start = this.nearestWalkableCell(startRaw.ix, startRaw.iz, nav, 4);
    const goal = this.nearestWalkableCell(goalRaw.ix, goalRaw.iz, nav, 8);
    if (!start || !goal) return null;
    if (start.i === goal.i) return [this.navCellToWorld(goal.ix, goal.iz, nav)];

    const total = nav.cols * nav.rows;
    const came = new Int32Array(total); came.fill(-1);
    const gScore = new Float32Array(total); gScore.fill(Infinity);
    const fScore = new Float32Array(total); fScore.fill(Infinity);
    const opened = new Uint8Array(total);
    const closed = new Uint8Array(total);
    const heap = [];
    const push = (i) => {
      heap.push(i);
      let n = heap.length - 1;
      while (n > 0) {
        const p = (n - 1) >> 1;
        if (fScore[heap[p]] <= fScore[heap[n]]) break;
        [heap[p], heap[n]] = [heap[n], heap[p]];
        n = p;
      }
    };
    const pop = () => {
      const top = heap[0];
      const last = heap.pop();
      if (heap.length && last !== undefined) {
        heap[0] = last;
        let n = 0;
        while (true) {
          const l = n * 2 + 1, r = l + 1;
          let m = n;
          if (l < heap.length && fScore[heap[l]] < fScore[heap[m]]) m = l;
          if (r < heap.length && fScore[heap[r]] < fScore[heap[m]]) m = r;
          if (m === n) break;
          [heap[n], heap[m]] = [heap[m], heap[n]];
          n = m;
        }
      }
      return top;
    };
    const heuristic = (ix, iz) => {
      const dx = Math.abs(ix - goal.ix), dz = Math.abs(iz - goal.iz);
      return (dx + dz) + (Math.SQRT2 - 2) * Math.min(dx, dz);
    };
    const dirs = [
      [1,0,1],[-1,0,1],[0,1,1],[0,-1,1],
      [1,1,Math.SQRT2],[-1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,-1,Math.SQRT2]
    ];
    gScore[start.i] = 0;
    fScore[start.i] = heuristic(start.ix, start.iz);
    push(start.i); opened[start.i] = 1;
    let found = -1;
    let loops = 0;
    while (heap.length && loops++ < 3600) {
      const cur = pop();
      if (closed[cur]) continue;
      if (cur === goal.i) { found = cur; break; }
      closed[cur] = 1;
      const cx = cur % nav.cols, cz = Math.floor(cur / nav.cols);
      for (const [dx, dz, cost] of dirs) {
        const nx = cx + dx, nz = cz + dz;
        if (nx < 0 || nz < 0 || nx >= nav.cols || nz >= nav.rows) continue;
        const ni = nz * nav.cols + nx;
        if (!nav.walkable[ni] || closed[ni]) continue;
        // 대각선으로 벽 모서리를 뚫고 지나가는 것을 막는다.
        if (dx && dz) {
          const n1 = cz * nav.cols + nx;
          const n2 = nz * nav.cols + cx;
          if (!nav.walkable[n1] || !nav.walkable[n2]) continue;
        }
        const tentative = gScore[cur] + cost;
        if (tentative < gScore[ni]) {
          came[ni] = cur;
          gScore[ni] = tentative;
          fScore[ni] = tentative + heuristic(nx, nz);
          if (!opened[ni]) { opened[ni] = 1; push(ni); }
          else push(ni); // 중복 삽입 허용. pop 때 closed로 정리해서 코드가 가볍다.
        }
      }
    }
    if (found < 0) return null;
    const cells = [];
    let cur = found;
    while (cur >= 0 && cur !== start.i && cells.length < 90) {
      cells.push(cur);
      cur = came[cur];
    }
    cells.reverse();

    // 이전 버전은 코너 지점만 압축해서 반환했기 때문에,
    // 플레이어가 벽 뒤에 있을 때 첫 경유지가 벽 너머 코너로 잡히며
    // 적이 벽에 붙어서 비비는 현상이 생길 수 있었다.
    // 이제는 A*가 계산한 실제 셀 경로를 촘촘히 따라가게 해서
    // 벽을 뚫으려 하지 않고 통로를 따라 우회한다.
    const points = [];
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      const ix = c % nav.cols, iz = Math.floor(c / nav.cols);
      const isEarly = i < 6;
      const isInterval = i % 2 === 0;
      const isLast = i === cells.length - 1;
      if (isEarly || isInterval || isLast) points.push(this.navCellToWorld(ix, iz, nav));
    }
    return points.slice(0, 28);
  }

  getEnemySteering(e, tx, tz, dt) {
    let dx = tx - e.x;
    let dz = tz - e.z;
    let d = Math.hypot(dx, dz) || 1;
    let nx = dx / d, nz = dz / d;
    const radius = e.radius + .16;

    // 앞길이 뚫려 있으면 불필요한 경로 계산 없이 바로 추적한다.
    if (this.lineClear2D(e.x, e.z, tx, tz, radius)) {
      e.navPath = null;
      e.navIndex = 0;
      e.aiPathTimer = 0;
      return { x: nx, z: nz, avoiding: false };
    }

    const targetMoved = !e.navTarget || dist2(tx, tz, e.navTarget.x, e.navTarget.z) > 2.2 * 2.2;
    const navDirty = e.navVersion !== (this.navVersion || 1);
    e.aiPathTimer = Math.max(0, (e.aiPathTimer || 0) - dt);

    // 플레이어가 설치 벽으로 둘러싸였거나 통로가 완전히 막혔을 때는 A*가 실패할 수 있다.
    // 실패 직후 모든 적이 다시 A*를 반복하면 렉이 커지므로, 짧은 실패 캐시를 둔다.
    const tNow = now();
    const failCacheValid = e.navFailedUntil && tNow < e.navFailedUntil && e.navFailTarget && dist2(tx, tz, e.navFailTarget.x, e.navFailTarget.z) < 2.6 * 2.6 && !navDirty;
    if (failCacheValid && (!e.navPath || !e.navPath.length)) {
      e.aiPathTimer = Math.max(e.aiPathTimer || 0, .35);
    } else if (targetMoved || navDirty || e.aiPathTimer <= 0 || !e.navPath || !e.navPath.length || (e.stuckTime || 0) > .42) {
      const path = this.findNavPath(e.x, e.z, tx, tz, radius);
      e.navPath = path || null;
      e.navIndex = 0;
      e.navTarget = { x: tx, z: tz };
      e.navVersion = this.navVersion || 1;
      e.aiPathTimer = path ? rand(.52, .92) : rand(.85, 1.35);
      e.stuckTime = 0;
      if (!path) {
        e.navFailedUntil = tNow + rand(1.05, 1.75);
        e.navFailTarget = { x: tx, z: tz };
      } else {
        e.navFailedUntil = 0;
        e.navFailTarget = null;
      }
    }

    if (e.navPath && e.navPath.length) {
      // 이미 지나친 경유지는 넘긴다. 단, 코너 압축을 과하게 하지 않고
      // 현재 위치에서 실제로 보이는 경유지만 선택해서 벽 너머 지점을 향해 돌진하지 않게 한다.
      while (e.navIndex < e.navPath.length - 1 && dist2(e.x, e.z, e.navPath[e.navIndex].x, e.navPath[e.navIndex].z) < 1.05 * 1.05) {
        e.navIndex++;
      }

      let bestIndex = clamp(e.navIndex || 0, 0, e.navPath.length - 1);
      // 가까운 미래 경유지 중, 현재 위치에서 직선 이동 가능한 가장 먼 지점까지만 바라본다.
      // 이 덕분에 벽 뒤의 플레이어와 직선상으로 가장 가까운 벽면에 달라붙지 않고 통로를 돈다.
      for (let i = bestIndex + 1; i < Math.min(e.navPath.length, bestIndex + 5); i++) {
        const p = e.navPath[i];
        if (this.lineClear2D(e.x, e.z, p.x, p.z, radius)) bestIndex = i;
        else break;
      }
      e.navIndex = bestIndex;
      const wp = e.navPath[bestIndex];

      if (!this.lineClear2D(e.x, e.z, wp.x, wp.z, radius)) {
        // 다음 경유지 자체가 막혔다면 이번 프레임에 벽 쪽으로 비비지 말고,
        // 즉시 재탐색을 예약한 뒤 일시적으로 멈춘다.
        e.aiPathTimer = 0;
        return { x: 0, z: 0, avoiding: true };
      }

      const wdx = wp.x - e.x, wdz = wp.z - e.z;
      const wd = Math.hypot(wdx, wdz) || 1;
      return { x: wdx / wd, z: wdz / wd, avoiding: true };
    }

    // 길이 완전히 막힌 경우. 설치 벽에 갇힌 상황이면 기존 공격 로직이 처리하고,
    // 아니면 아주 짧게 좌우 탐색만 해서 제자리 떨림을 줄인다.
    const side = e.steerSide || (Math.random() > .5 ? 1 : -1);
    const sx = -nz * side, sz = nx * side;
    if (!this.collides(e.x + sx * (e.radius + .6), e.z + sz * (e.radius + .6), e.radius)) {
      e.steerSide = side;
      return { x: sx, z: sz, avoiding: true };
    }
    return { x: 0, z: 0, avoiding: true };
  }

  updateDevil(e, dt, d, nx, nz, fakeWallBlocker = null) {
    e.attackCd -= dt;
    const blocker = fakeWallBlocker ? { obstacle: fakeWallBlocker, distance: d } : this.findWallOnRay(e.x, e.z, { x: nx, z: nz }, d);
    const canShootPlayer = !blocker;
    const shouldBreakWall = blocker && blocker.obstacle?.kind === 'fakeWall';
    if (d < 30 && e.attackCd <= 0 && (canShootPlayer || shouldBreakWall)) {
      // 설치 벽이 시야를 막으면 플레이어가 아니라 벽을 향해 화염구를 쏜다.
      let sx = nx, sz = nz;
      if (shouldBreakWall) {
        const p = this.closestPointOnObstacle(blocker.obstacle, e.x, e.z);
        const dx = p.x - e.x, dz = p.z - e.z;
        const len = Math.hypot(dx, dz) || 1;
        sx = dx / len; sz = dz / len;
      }
      e.attackCd = rand(1.35, 2.35) * clamp(1.15 - this.wave * .02, .58, 1.1);
      e.castAnim = .48;
      e.castMax = .48;
      e.recoilTimer = .24;
      e.recoilMax = .24;
      e.recoilDir = { x: -sx, z: -sz };
      const mesh = new THREE.Mesh(this.geos.sphere, this.materials.fire);
      mesh.position.set(e.x + sx * .45, 1.22, e.z + sz * .45);
      this.scene.add(mesh);
      this.projectiles.push({ kind: 'fireball', mesh, x: mesh.position.x, z: mesh.position.z, y: mesh.position.y, vx: sx * 10.5, vz: sz * 10.5, vy: 0, life: 3.2, radius: 3.8, damage: 18 * this.diff.enemyDamage });
      this.audio.devilCast();
    }
  }

  applyEnemyVisualPose(e) {
    const walk = clamp((e.walkSpeed || 0) / Math.max(.1, e.speed || 1), 0, 1);
    const phase = e.walkPhase || 0;
    // 과한 상하 움직임과 좌우 기울임은 뒤뚱뒤뚱 걷는 느낌을 만들기 때문에
    // 몸통은 안정시키고 팔다리만 걷는 리듬을 보이게 한다.
    const bodyMoveScale = e.type === 'devil' ? .62 : (e.type === 'tank' ? .52 : (e.type === 'bomber' ? .88 : (e.type === 'runner' ? .92 : .78)));
    const walkBob = Math.abs(Math.sin(phase)) * .026 * walk * bodyMoveScale;
    const bodySway = Math.sin(phase * 2) * .018 * walk * bodyMoveScale;
    const bodyNod = Math.sin(phase) * .010 * walk * bodyMoveScale;
    const lateral = Math.sin(phase * 2) * .010 * walk * bodyMoveScale;
    const idleFloat = 0;
    const recoilK = e.recoilTimer > 0 ? Math.sin((e.recoilTimer / Math.max(.001, e.recoilMax || .24)) * Math.PI) : 0;
    const recoilX = (e.recoilDir?.x || 0) * .22 * recoilK;
    const recoilZ = (e.recoilDir?.z || 0) * .22 * recoilK;
    const facing = e.mesh.rotation.y || 0;
    const rightX = Math.cos(facing);
    const rightZ = -Math.sin(facing);
    e.mesh.position.x = e.x + recoilX + rightX * lateral;
    e.mesh.position.z = e.z + recoilZ + rightZ * lateral;
    e.mesh.position.y = idleFloat + walkBob;

    const attackK = e.attackAnim > 0 ? Math.sin((1 - e.attackAnim / Math.max(.001, e.attackMax || .32)) * Math.PI) : 0;
    const castK = e.castAnim > 0 ? Math.sin((1 - e.castAnim / Math.max(.001, e.castMax || .48)) * Math.PI) : 0;
    const arms = e.mesh.userData || {};
    const armSwing = Math.sin(phase) * walk;
    const sideSwing = Math.sin(phase * 2) * walk;
    if (arms.leftArm && arms.rightArm) {
      if (e.type === 'devil') {
        const walkArm = armSwing * .13 * (1 - castK) * (1 - attackK);
        arms.leftArm.rotation.x = -1.18 * castK - .42 * attackK + walkArm;
        arms.rightArm.rotation.x = -1.18 * castK - .42 * attackK - walkArm;
        arms.leftArm.rotation.z = -.22 * castK;
        arms.rightArm.rotation.z = .22 * castK;
        arms.leftArm.position.z = .16 + .34 * castK + .16 * attackK;
        arms.rightArm.position.z = .16 + .34 * castK + .16 * attackK;
        arms.leftArm.position.y = 1.03;
        arms.rightArm.position.y = 1.03;
      } else {
        const walkArm = armSwing * .30 * (1 - attackK);
        arms.leftArm.rotation.x = -1.65 * attackK + walkArm;
        arms.rightArm.rotation.x = -1.52 * attackK - walkArm;
        arms.leftArm.rotation.z = -.20 * attackK;
        arms.rightArm.rotation.z = .20 * attackK;
        arms.leftArm.position.z = .16 + .58 * attackK + Math.abs(armSwing) * .018;
        arms.rightArm.position.z = .16 + .54 * attackK + Math.abs(armSwing) * .018;
        arms.leftArm.position.y = .98 + .08 * attackK;
        arms.rightArm.position.y = .98 + .08 * attackK;
      }
    }

    if (arms.leftLeg && arms.rightLeg) {
      const legSwing = Math.sin(phase) * .24 * walk;
      arms.leftLeg.rotation.x = legSwing;
      arms.rightLeg.rotation.x = -legSwing;
      arms.leftLeg.position.y = .28 + Math.max(0, -legSwing) * .018;
      arms.rightLeg.position.y = .28 + Math.max(0, legSwing) * .018;
    }

    if (e.type === 'bomber') {
      const flashOn = (e.bomberFlash || 0) > 0 && Math.floor(now() * 14) % 2 === 0;
      if (e._flashState !== flashOn) {
        e._flashState = flashOn;
        e.mesh.traverse(obj => {
          if (obj.material && obj.material.emissive) {
            obj.material.emissive.setHex(flashOn ? 0x441000 : 0x000000);
            obj.material.emissiveIntensity = flashOn ? .65 : 0;
          }
        });
      }
    }

    if (e.hitTimer > 0) {
      const k = Math.sin((e.hitTimer / Math.max(.001, e.hitMax || .16)) * Math.PI);
      e.mesh.rotation.x = -(e.hitLean || .18) * k - .10 * attackK + bodyNod;
      e.mesh.rotation.z = (e.hitSide || 0) * .10 * k + bodySway * .45;
    } else {
      e.mesh.rotation.x = bodyNod - .06 * attackK;
      e.mesh.rotation.z = bodySway;
    }
    // 진행 방향을 약간 따라 흔들리는 정도만 추가한다. 너무 크면 뒤뚱거려 보이므로 낮게 제한.
    e.mesh.rotation.y += Math.sin(phase) * .010 * walk * bodyMoveScale;
  }

  moveEnemy(e, dx, dz) {
    if (!this.collides(e.x + dx, e.z, e.radius)) e.x += dx;
    if (!this.collides(e.x, e.z + dz, e.radius)) e.z += dz;
    this.applyEnemyVisualPose(e);
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) {
      if (p.dead) continue;
      if (p.networked) { p.mesh.rotation.x += dt * 8; p.mesh.rotation.y += dt * 6; continue; }
      p.life -= dt;
      p.x += p.vx * dt; p.z += p.vz * dt;
      if (p.kind === 'grenade') { p.vy -= 9.8 * dt; p.y += p.vy * dt; if (p.y < .35) { p.y = .35; p.vy *= -.42; p.vx *= .82; p.vz *= .82; } }
      p.mesh.position.set(p.x, p.y, p.z);
      p.mesh.rotation.x += dt * 8; p.mesh.rotation.y += dt * 6;
      const wall = this.getObstacleAt(p.x, p.z, .24);
      if (wall) {
        if (p.kind === 'fireball') this.damageWall(wall, 34, 'fireball', { x: p.x, y: p.y, z: p.z });
        this.detonateProjectile(p);
        continue;
      }
      if (p.kind === 'fireball') {
        if (dist2(p.x,p.z,this.player.x,this.player.z) < 1.1) { this.damagePlayer(p.damage, p, 'fireball'); this.detonateProjectile(p); }
      } else if (p.kind === 'rocket') {
        const hit = this.enemies.find(e => e.alive && dist2(p.x,p.z,e.x,e.z) < (e.radius + .35) ** 2);
        if (hit) this.detonateProjectile(p);
      }
      if (p.life <= 0) this.detonateProjectile(p);
    }
    this.projectiles = this.projectiles.filter(p => {
      if (!p.dead) return true;
      if (p.mesh.parent) this.scene.remove(p.mesh);
      return false;
    });
  }

  detonateProjectile(p) {
    if (p.dead) return;
    p.dead = true;
    if (p.kind === 'fireball') { this.audio.fireballExplode(); this.explode(p.x, p.z, 2.5, 0, false); }
    else this.explode(p.x, p.z, p.radius, p.damage, true);
  }

  updatePlaceables(dt) {
    for (const b of this.placeables) {
      if (!b.alive) continue;
      if (b.kind === 'barrel') {
        b.mesh.rotation.y += dt * .08;
        const near = this.enemies.some(e => e.alive && dist2(e.x,e.z,b.x,b.z) < 2.1 * 2.1);
        if (near || b.hp <= 0) { b.alive = false; this.explode(b.x, b.z, b.radius, b.damage, true); this.scene.remove(b.mesh); }
      } else if (b.kind === 'fakeWall') {
        if (b.hp <= 0) this.breakWall(b, 'damage');
      }
    }
    this.placeables = this.placeables.filter(p => p.alive);
    this.obstacles = this.obstacles.filter(o => o.alive || o.kind !== 'fakeWall');
  }

  explode(x, z, radius, damage, hurtsEnemies = true) {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, .05, 18), new THREE.MeshBasicMaterial({ color: 0xff7744, transparent: true, opacity: .5 }));
    ring.position.set(x, .07, z); this.scene.add(ring);
    this.fx.push({ mesh: ring, life: .28, max: .28, scaleOut: true });
    if (damage > 0) this.audio.explosion();
    if (hurtsEnemies && damage > 0) {
      for (const e of this.enemies) if (e.alive) {
        const d = Math.sqrt(dist2(x,z,e.x,e.z));
        if (d <= radius) {
          const nx = (e.x - x) / Math.max(.001, d);
          const nz = (e.z - z) / Math.max(.001, d);
          this.damageEnemy(e, damage * (1 - d / radius * .45), 'explosion', { x: nx, z: nz });
        }
      }
    }
    if (damage > 0) {
      for (const c of this.objectiveCores || []) if (c.alive) {
        const d = Math.sqrt(dist2(x, z, c.x, c.z));
        if (d <= radius + c.radius) this.damageObjectiveCore(c, damage * (1 - Math.min(1, d / Math.max(.01, radius)) * .35), 'explosion');
      }
      for (const o of this.obstacles) if (o.alive && o.kind === 'fakeWall') {
        const cx = clamp(x, o.x - o.w/2, o.x + o.w/2);
        const cz = clamp(z, o.z - o.d/2, o.z + o.d/2);
        const d = Math.sqrt(dist2(x, z, cx, cz));
        if (d <= radius) {
          const wallDamage = damage * (1 - d / radius * .55);
          this.damageWall(o, wallDamage, 'explosion', { x: cx, y: 1.35, z: cz });
        }
      }
    }
    const pd = Math.sqrt(dist2(x,z,this.player.x,this.player.z));
    if (pd <= radius * .85 && damage > 0) this.damagePlayer(damage * .34 * (1 - pd / radius), { x, z }, 'explosion');
    for (const b of this.placeables) if (b.alive && b.kind === 'barrel' && dist2(x,z,b.x,b.z) < radius*radius) b.hp = 0;
  }

  damageEnemy(e, amount, source, knockDir = null, hitPart = 'body') {
    if (!e.alive) return;
    amount = this.adjustEnemyDamageByType(e, amount, source, knockDir, hitPart);
    e.hp -= amount;
    if (source === 'headshot') this.showHeadshot();
    if (e.type === 'tank' && source !== 'explosion' && hitPart !== 'head') this.spawnArmorChipFx(e, knockDir);
    e.lastHitPart = hitPart || (source === 'headshot' ? 'head' : 'body');
    const stunBase = source === 'headshot' ? .20 : (source === 'rail' ? .16 : (source === 'explosion' ? .12 : .075));
    e.stun = Math.max(e.stun || 0, stunBase);
    e.hitMax = source === 'headshot' ? .24 : (source === 'rail' ? .22 : .16);
    e.hitTimer = e.hitMax;
    e.hitLean = clamp(amount / 170, source === 'headshot' ? .20 : .12, source === 'headshot' ? .46 : .34);
    e.hitSide = rand(-1, 1);
    if (knockDir) {
      const strength = source === 'explosion' ? clamp(amount / 28, 1.5, 7.5) : clamp(amount / 22, .65, 3.4);
      e.kvx = (e.kvx || 0) + knockDir.x * strength;
      e.kvz = (e.kvz || 0) + knockDir.z * strength;
    }
    e.mesh.scale.setScalar(1 + clamp(amount / 180, .035, .16));
    setTimeout(() => { if (e.mesh && e.alive) e.mesh.scale.setScalar(1); }, 55);
    if (source !== 'fireball') this.addBloodPatch(e, amount, source);
    if (e.hp <= 0) this.killEnemy(e, source);
  }

  adjustEnemyDamageByType(e, amount, source, knockDir = null, hitPart = 'body') {
    if (!e || !e.alive) return amount;
    // 실드 좀비는 정면 장갑판을 맞으면 피해가 크게 줄어든다.
    // 헤드샷, 폭발, 측면/후방 공격은 정상적으로 들어간다.
    if (e.type === 'shield' && hitPart !== 'head' && source !== 'explosion') {
      const yaw = e.mesh?.rotation?.y || 0;
      const fx = Math.sin(yaw), fz = Math.cos(yaw);
      const kx = knockDir?.x || 0, kz = knockDir?.z || 0;
      const len = Math.hypot(kx, kz) || 1;
      const incomingDot = (kx / len) * fx + (kz / len) * fz;
      if (incomingDot < -.42) {
        e.shieldFlash = .18;
        this.spawnShieldHitFx(e);
        this.audio.shieldHit();
        return amount * (source === 'rail' ? .55 : .28);
      }
    }
    if (e.type === 'tank' && hitPart !== 'head' && source !== 'explosion') return amount * .82;
    return amount;
  }

  addBloodPatch(e, amount = 10, source = 'bullet') {
    if (e.type === 'devil') return;
    const maxPatches = source === 'explosion' ? 10 : 7;
    if ((e.bloodCount || 0) >= maxPatches) return;
    const patch = new THREE.Mesh(this.geos.bloodPatch, Math.random() > .22 ? this.materials.blood : this.materials.bloodDark);
    // 업로드2의 흰 수트 위에 보이도록 몸통/얼굴 정면에 작은 피 얼룩을 붙인다.
    const onHead = source === 'headshot' || Math.random() < .32;
    patch.position.set(rand(-.22, .22), onHead ? rand(1.40, 1.76) : rand(.62, 1.12), onHead ? .385 : .505);
    const size = clamp(amount / 75, .09, .22) * rand(.75, 1.35);
    patch.scale.set(size * rand(.8, 1.4), size * rand(.55, 1.1), 1);
    patch.rotation.z = rand(-.8, .8);
    patch.castShadow = false; patch.receiveShadow = false;
    e.mesh.add(patch);
    e.bloodCount = (e.bloodCount || 0) + 1;
  }

  spawnEnemyDeathDebris(e) {
    const mats = e.type === 'devil'
      ? [this.materials.devilRed, this.materials.devilRed, this.materials.hair, this.materials.shoeBlack]
      : (e.type === 'runner'
        ? [this.materials.runnerSuit, this.materials.runnerSuit, this.materials.runnerFace, this.materials.shoeBlack, this.materials.runnerStripe]
        : (e.type === 'tank'
          ? [this.materials.tankSuit, this.materials.tankArmor, this.materials.iceBlue, this.materials.shoeBlack, this.materials.tankStripe]
          : (e.type === 'bomber'
            ? [this.materials.bomberSuit, this.materials.bomberVest, this.materials.bomberRed, this.materials.shoeBlack, this.materials.tankStripe]
            : (e.type === 'shield'
              ? [this.materials.shieldSuit, this.materials.shieldPlate, this.materials.iceBlue, this.materials.shoeBlack, this.materials.shieldEdge]
              : [this.materials.zombieSuit, this.materials.zombieSuit, this.materials.iceBlue, this.materials.shoeBlack, this.materials.zombieStripe]))));
    const pieces = [
      { y: 1.58, s: [.42,.42,.42], m: 0 }, { y: .92, s: [.52,.50,.36], m: 1 },
      { y: .70, s: [.18,.42,.20], m: 1 }, { y: .70, s: [.18,.42,.20], m: 1 },
      { y: .28, s: [.22,.34,.22], m: 1 }, { y: .28, s: [.22,.34,.22], m: 1 },
      { y: .09, s: [.32,.12,.38], m: 3 }, { y: .09, s: [.32,.12,.38], m: 3 },
      { y: 1.50, s: [.30,.18,.04], m: e.type === 'devil' ? 2 : 2 }
    ];
    const forwardX = Math.sin(e.mesh.rotation.y), forwardZ = Math.cos(e.mesh.rotation.y);
    for (const part of pieces) {
      const mat = (mats[part.m] || mats[0]).clone();
      mat.transparent = true; mat.opacity = 1;
      const mesh = new THREE.Mesh(this.geos.lowBox, mat);
      mesh.position.set(e.x + rand(-.18,.18), part.y, e.z + rand(-.18,.18));
      mesh.scale.set(part.s[0], part.s[1], part.s[2]);
      mesh.rotation.set(rand(-.4,.4), rand(0, Math.PI), rand(-.4,.4));
      this.applyShadows(mesh, true, true);
      this.scene.add(mesh);
      this.fx.push({
        mesh, life: 1.0, max: 1.0, debris: true,
        vx: -forwardX * rand(.7, 1.8) + rand(-1.5,1.5),
        vy: rand(1.4, 4.4),
        vz: -forwardZ * rand(.7, 1.8) + rand(-1.5,1.5),
        rx: rand(-8,8), ry: rand(-8,8), rz: rand(-8,8), fadeStart: .18
      });
    }
  }

  detonateEnemy(e, reason = 'self') {
    if (!e || !e.alive || e.deathExploded) return;
    e.deathExploded = true;
    this.killEnemy(e, reason);
  }

  killEnemy(e, source = 'damage') {
    if (!e.alive) return;
    e.alive = false;
    this.spawnEnemyDeathDebris(e);
    this.audio.enemyDeath(e.type);
    if (e.mesh?.parent) this.scene.remove(e.mesh);
    this.kills++;
    this.score += Math.round(e.score);
    if (e.type === 'bomber' && !e.deathExploded) {
      e.deathExploded = true;
      this.explode(e.x, e.z, e.blastRadius || 4.2, e.blastDamage || 82, true);
    } else if (e.type === 'bomber' && e.deathExploded) {
      this.explode(e.x, e.z, e.blastRadius || 4.2, e.blastDamage || 82, true);
    }
    if (Math.random() < .14) this.dropSupply(false, e.x, e.z);
    this.unlockWeapons();
  }

  createItemBoxModel(kind = 'ammo') {
    const g = new THREE.Group();
    const baseMat = kind === 'health' ? this.materials.itemHealth : this.materials.itemBox;
    this.addPart(g, this.geos.lowBox, baseMat, 0, .34, 0, .92, .58, .92);
    this.addPart(g, this.geos.lowBox, this.materials.itemBand, 0, .48, 0, .98, .08, .18);
    this.addPart(g, this.geos.lowBox, this.materials.itemBand, 0, .49, 0, .18, .08, .98);
    this.addPart(g, this.geos.lowBox, this.materials.lightPanel, 0, .67, 0, .42, .05, .42);
    return g;
  }

  dropSupply(force = false, x = null, z = null) {
    const finiteUnlocked = WEAPON_DEFS.filter(w => Number.isFinite(w.ammoMax) && this.unlocked.has(w.id));
    // Wave 1 전용이 아니라 2~N 웨이브에서도 회복 상자가 간헐적으로 나오도록 확률을 분리했다.
    // 체력이 낮을수록 회복 상자 확률이 크게 올라가고, 체력이 충분해도 소량 확률은 유지된다.
    const lowHealth = this.hp < this.maxHp * .72;
    const criticalHealth = this.hp < this.maxHp * .38;
    let healthChance = this.wave <= 1 ? .55 : .16;
    if (lowHealth) healthChance += .34;
    if (criticalHealth) healthChance += .22;
    if (force) healthChance += .06;
    const kind = finiteUnlocked.length === 0 || Math.random() < clamp(healthChance, .08, .78) ? 'health' : 'ammo';
    const weapon = finiteUnlocked[Math.floor(Math.random() * Math.max(1, finiteUnlocked.length))];
    const sp = x === null ? this.safeRandomPoint() : { x, z };
    if (!sp) return;
    const mesh = this.createItemBoxModel(kind);
    mesh.position.set(sp.x, 0, sp.z); this.scene.add(mesh);
    this.pickups.push({
      alive: true, mesh, x: sp.x, z: sp.z, kind,
      weapon: weapon?.id || 'pistol',
      amount: kind === 'health' ? (force ? 28 : 18) : Math.ceil(weapon.ammoMax * (force ? .38 : .18)),
      life: force ? 26 : 14
    });
    this.audio.itemSpawn();
  }

  spawnInitialItemBoxes() {
    const count = clamp(Math.floor(this.map.size / 10), 4, 7);
    for (let i = 0; i < count; i++) this.dropSupply(true);
  }

  updateRandomItemBoxes(dt) {
    this.itemBoxTimer -= dt;
    const target = clamp(3 + Math.floor(this.wave / 3), 3, 7);
    if (this.itemBoxTimer <= 0) {
      if (this.pickups.filter(p => p.alive).length < target) this.dropSupply(true);
      this.itemBoxTimer = rand(5.5, 10.5);
    }
  }

  safeRandomPoint() {
    for (let i = 0; i < 25; i++) {
      const s = this.map.size / 2 - 4;
      const x = rand(-s, s), z = rand(-s, s);
      if (!this.collides(x, z, 1.2)) return { x, z };
    }
    return { x: this.player.x, z: this.player.z + 3 };
  }

  updatePickups(dt) {
    for (const p of this.pickups) {
      if (!p.alive) continue;
      p.life -= dt; p.mesh.rotation.y += dt * 1.4; p.mesh.position.y = Math.sin(now()*3 + p.x) * .035;
      if (p.networked) { continue; }
      if (dist2(p.x,p.z,this.player.x,this.player.z) < 2.0) {
        if (p.kind === 'health') {
          if (this.hp >= this.maxHp - .5) {
            const before = this.medkits || 0;
            this.medkits = Math.min(this.maxMedkits || 100, before + p.amount);
            const gained = Math.max(0, this.medkits - before);
            this.showToast(gained > 0 ? `회복키트 +${gained}` : '회복키트 가득 참');
          } else {
            const beforeHp = this.hp;
            this.hp = Math.min(this.maxHp, this.hp + p.amount);
            this.showToast(`HP +${Math.ceil(this.hp - beforeHp)}`);
          }
        } else {
          const w = this.getWeapon(p.weapon);
          this.ammo[p.weapon] = Math.min(w.ammoMax, (this.ammo[p.weapon] || 0) + Math.ceil(p.amount * (this.upgrades?.ammoGain || 1)));
          this.showToast(`${w.name} +${Math.ceil(p.amount * (this.upgrades?.ammoGain || 1))}`);
        }
        p.alive = false; this.scene.remove(p.mesh);
        this.audio.pickup();
      } else if (p.life <= 0) { p.alive = false; this.scene.remove(p.mesh); }
    }
    this.pickups = this.pickups.filter(p => p.alive);
  }

  updateFx(dt) {
    for (const f of this.fx) {
      f.life -= dt;
      const k = clamp(f.life / Math.max(.001, f.max), 0, 1);
      if (f.bullet) {
        const step = f.speed * dt;
        f.traveled = Math.min(f.maxDistance, (f.traveled || 0) + step);
        const pos = f.mesh.position.clone();
        pos.addScaledVector(f.dir, step);
        f.mesh.position.copy(pos);
        if (f.traveled >= f.maxDistance) f.life = 0;
      }
      if (f.ring) {
        const grow = f.grow || 1.5;
        f.mesh.scale.setScalar(1 + (1 - k) * grow);
        f.mesh.rotation.z += dt * 2.2;
      }
      if (f.pop) {
        f.vy -= 7.4 * dt;
        f.mesh.position.x += (f.vx || 0) * dt;
        f.mesh.position.y += (f.vy || 0) * dt;
        f.mesh.position.z += (f.vz || 0) * dt;
      }
      if (f.debris) {
        f.vy -= 9.6 * dt;
        f.mesh.position.x += (f.vx || 0) * dt;
        f.mesh.position.y += (f.vy || 0) * dt;
        f.mesh.position.z += (f.vz || 0) * dt;
        f.mesh.rotation.x += (f.rx || 0) * dt;
        f.mesh.rotation.y += (f.ry || 0) * dt;
        f.mesh.rotation.z += (f.rz || 0) * dt;
        if (f.mesh.position.y < .08) {
          f.mesh.position.y = .08;
          f.vy = Math.abs(f.vy || 0) * .16;
          f.vx = (f.vx || 0) * .72;
          f.vz = (f.vz || 0) * .72;
          f.rx = (f.rx || 0) * .65;
          f.ry = (f.ry || 0) * .65;
          f.rz = (f.rz || 0) * .65;
        }
      }
      if (f.mesh.material?.transparent) {
        const fadeStart = f.fadeStart ?? 0;
        const fadeK = f.life < f.max - fadeStart ? k : 1;
        f.mesh.material.opacity = fadeK * (f.bullet ? .65 : 1);
      }
      if (f.scaleOut) f.mesh.scale.setScalar(1 + (1-k) * .8);
      if (f.life <= 0 && f.mesh.parent) this.scene.remove(f.mesh);
    }
    this.fx = this.fx.filter(f => f.life > 0);
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) UI.toast.classList.remove('show');
    }
    if (this.centerAlertTimer > 0) {
      this.centerAlertTimer -= dt;
      if (this.centerAlertTimer <= 0) UI.centerAlert?.classList.remove('show');
    }
    if (this.headshotTimer > 0) {
      this.headshotTimer -= dt;
      if (this.headshotTimer <= 0) UI.headshot?.classList.remove('show');
    }
    if (this.hitDirTimer > 0) {
      this.hitDirTimer -= dt;
      if (this.hitDirTimer <= 0) UI.damageDir?.classList.remove('show');
    }
    if (this.impactNoiseTimer > 0) {
      this.impactNoiseTimer -= dt;
      if (this.impactNoiseTimer <= 0) UI.impactNoise?.classList.remove('show');
    }
    const lowHp = this.hp > 0 && this.hp <= this.maxHp * .26;
    UI.lowHealth?.classList.toggle('show', !!lowHp);
    if (lowHp) {
      this.lowHealthBeepTimer -= dt;
      if (this.lowHealthBeepTimer <= 0) {
        this.audio.lowHpBeat();
        this.audio.lowHpBreath();
        this.lowHealthBeepTimer = clamp(this.hp / this.maxHp, .18, .65);
      }
    } else {
      this.lowHealthBeepTimer = 0;
    }
  }

  damagePlayer(amount, source = null, kind = 'hit') {
    if (this.gameOver) return;
    const actual = Math.max(0, amount || 0);
    this.hp = Math.max(0, this.hp - actual);
    this.audio.playerHit(kind);

    // 피격 방향 표시: 공격원이 있으면 플레이어 시야 기준으로 어느 방향에서 맞았는지 보여준다.
    if (source && Number.isFinite(source.x) && Number.isFinite(source.z) && this.player) {
      const dx = source.x - this.player.x;
      const dz = source.z - this.player.z;
      const worldAngle = Math.atan2(dx, dz);
      const relative = worldAngle - this.yaw;
      if (UI.damageDir) {
        UI.damageDir.style.setProperty('--hit-rot', `${relative}rad`);
        UI.damageDir.classList.add('show');
        this.hitDirTimer = .62;
      }
    }

    // 데미지량에 따라 카메라 흔들림 / 화면 노이즈를 다르게 준다.
    const trauma = clamp(actual / 58, .10, .62);
    this.hitShake = Math.max(this.hitShake || 0, trauma);
    this.hitShakeTimer = .34;

    UI.vignette?.classList.toggle('heavy', actual >= 22 || kind === 'explosion');
    UI.vignette?.classList.add('hit');
    UI.hud?.classList.add('damaged');
    UI.impactNoise?.classList.add('show');
    this.impactNoiseTimer = kind === 'explosion' ? .34 : .16;
    clearTimeout(this.vTimer);
    this.vTimer = setTimeout(() => {
      UI.vignette?.classList.remove('hit', 'heavy');
      UI.hud?.classList.remove('damaged');
    }, kind === 'explosion' ? 220 : 140);

    if (kind === 'explosion' || actual >= 30) this.audio.earRing(kind === 'explosion' ? 1.25 : .75);
  }

  updatePlayerVertical(dt) {
    if (!this.player.grounded) {
      this.player.vy -= WORLD.GRAVITY * dt;
      this.player.y += this.player.vy * dt;
      if (this.player.y <= 0) {
        this.player.y = 0;
        this.player.vy = 0;
        this.player.grounded = true;
      }
    }
  }

  updateCamera(dt = 0) {
    if (dt) {
      const adsLerp = 1 - Math.exp(-dt * 13);
      this.ads += (this.adsTarget - this.ads) * adsLerp;
      if (this.ads < .001) this.ads = 0;
      if (this.ads > .999) this.ads = 1;
    }

    const targetFov = this.baseFov + (this.adsFov - this.baseFov) * this.ads;
    if (Math.abs(this.camera.fov - targetFov) > .02) {
      this.camera.fov = targetFov;
      this.camera.updateProjectionMatrix();
    }
    UI.hud?.classList.toggle('ads', this.ads > .65);

    if (dt && this.moveIntensity > .05) {
      this.bobPhase += dt * 9.8 * this.moveIntensity;
    }
    this.weaponKick = Math.max(0, this.weaponKick - dt * .9);
    const activeBob = this.player.grounded ? this.moveIntensity : 0;
    const bobY = activeBob > .05 ? Math.sin(this.bobPhase * 2) * .030 * activeBob : 0;
    const bobSide = activeBob > .05 ? Math.cos(this.bobPhase) * .018 * activeBob : 0;
    const rightX = Math.cos(this.yaw), rightZ = -Math.sin(this.yaw);

    let shakeX = 0, shakeY = 0, shakeZ = 0, shakePitch = 0, shakeYaw = 0;
    if (dt && this.hitShakeTimer > 0 && this.hitShake > 0) {
      this.hitShakeTimer -= dt;
      const k = clamp(this.hitShakeTimer / .34, 0, 1) * this.hitShake;
      const t = now();
      shakeX = Math.sin(t * 88.0) * .030 * k;
      shakeY = Math.cos(t * 103.0) * .020 * k;
      shakeZ = Math.sin(t * 71.0) * .018 * k;
      shakePitch = Math.sin(t * 91.0) * .018 * k;
      shakeYaw = Math.cos(t * 73.0) * .014 * k;
      this.hitShake *= Math.exp(-dt * 7.5);
      if (this.hitShakeTimer <= 0 || this.hitShake < .015) { this.hitShakeTimer = 0; this.hitShake = 0; }
    }

    this.camera.position.set(
      this.player.x + rightX * (bobSide + shakeX) + Math.sin(this.yaw) * shakeZ,
      this.getEyeY() + bobY + shakeY,
      this.player.z + rightZ * (bobSide + shakeX) + Math.cos(this.yaw) * shakeZ
    );
    this.tmpEuler.set(this.pitch + shakePitch, this.yaw + shakeYaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(this.tmpEuler);

    if (this.viewWeapon) {
      const hipX = .34 + bobSide * .55;
      const hipY = -.33 - this.weaponKick + bobY * .45;
      const hipZ = -.78 + this.weaponKick * .18;
      const adsX = .015 + bobSide * .10;
      const adsY = -.235 - this.weaponKick * .34 + bobY * .18;
      const adsZ = -.62 + this.weaponKick * .06;
      this.viewWeapon.position.set(
        hipX + (adsX - hipX) * this.ads,
        hipY + (adsY - hipY) * this.ads,
        hipZ + (adsZ - hipZ) * this.ads
      );
      const hipRx = -.06 - this.weaponKick * .35;
      const hipRy = -.08 + bobSide * .65;
      const adsRx = -.01 - this.weaponKick * .18;
      const adsRy = 0;
      this.viewWeapon.rotation.set(
        hipRx + (adsRx - hipRx) * this.ads,
        hipRy + (adsRy - hipRy) * this.ads,
        0
      );
    }
  }

  moveEntity(entity, dx, dz, radius) {
    if (!this.collides(entity.x + dx, entity.z, radius)) entity.x += dx;
    else if (entity === this.player) entity.vx = 0;
    if (!this.collides(entity.x, entity.z + dz, radius)) entity.z += dz;
    else if (entity === this.player) entity.vz = 0;
  }

  collides(x, z, radius) {
    const candidates = this.nearbyObstacles ? this.nearbyObstacles(x, z, radius) : (this.obstacles || []);
    for (const o of candidates) {
      if (!o.alive) continue;
      const cx = clamp(x, o.x - o.w/2, o.x + o.w/2);
      const cz = clamp(z, o.z - o.d/2, o.z + o.d/2);
      if (dist2(x,z,cx,cz) < radius * radius) return true;
    }
    return false;
  }

  updateHud() {
    UI.hpText.textContent = this.downed ? 'DOWN' : Math.ceil(this.hp);
    UI.hpBar.style.width = `${clamp(this.hp / this.maxHp * 100, 0, 100)}%`;
    if (UI.staminaText && UI.staminaBar) {
      UI.staminaText.textContent = `${Math.ceil(this.player.stamina)}`;
      UI.staminaBar.style.width = `${clamp(this.player.stamina / this.player.maxStamina * 100, 0, 100)}%`;
    }
    if (UI.medkitText && UI.medkitBar) {
      UI.medkitText.textContent = `${Math.ceil(this.medkits || 0)}/${this.maxMedkits || 100}`;
      UI.medkitBar.style.width = `${clamp((this.medkits || 0) / (this.maxMedkits || 100) * 100, 0, 100)}%`;
    }
    UI.waveText.textContent = this.prepPhase ? `Prep ${Math.ceil(this.prepTimer)}s` : `Wave ${this.wave}`;
    const alive = this.enemies.filter(e => e.alive).length + this.spawnQueue;
    UI.aliveText.textContent = this.currentMission?.type === 'survive' ? `${this.enemies.filter(e => e.alive).length} active` : `${alive} left`;
    if (UI.objectiveText) {
      const obj = this.prepPhase ? '정비 시간: 보상/아이템/벽 설치' : this.missionObjectiveText();
      UI.objectiveText.textContent = obj;
      UI.objectiveText.classList.toggle('danger', !!obj && obj !== '정비 시간: 보상/아이템/벽 설치');
    }
    UI.scoreText.textContent = this.score.toLocaleString('ko-KR');
    this.updateWeaponUI();
  }

  updateWeaponUI() {
    const w = this.getWeapon();
    for (const el of UI.weaponBar.children) {
      const id = el.dataset.weapon;
      el.classList.toggle('unlocked', this.unlocked.has(id));
      el.classList.toggle('active', id === this.selectedWeapon);
    }
    const ammo = this.ammo[this.selectedWeapon];
    if (this.reload?.active && this.reload.weapon === w.id) {
      const pct = Math.round((1 - this.reload.timer / Math.max(.01, this.reload.duration)) * 100);
      UI.ammoText.textContent = `${w.name} 재장전 ${clamp(pct,0,100)}%`;
    } else if (w.magSize) {
      const mag = Math.max(0, Math.floor(this.mag[w.id] || 0));
      const reserve = ammo === Infinity ? '∞' : Math.max(0, Math.floor(ammo));
      UI.ammoText.textContent = `${w.name} ${mag}/${reserve}`;
    } else {
      UI.ammoText.textContent = `${w.name} ${ammo === Infinity ? '∞' : Math.max(0, Math.floor(ammo))}`;
    }
  }


  completeWave() {
    if (this.rewardOpen || this.prepPhase) return;
    this.waveBreak = 0;
    this.cleanupObjectiveCores(false);
    this.dropSupply(true);
    this.score += Math.round(120 + this.wave * 35);
    this.showRewardChoices();
  }

  rewardPool() {
    return [
      { id: 'maxHp', title: '최대 체력 +10', desc: '즉시 10 회복하고 최대 HP가 늘어난다.', apply: () => { this.maxHp += 10; this.hp = Math.min(this.maxHp, this.hp + 10); } },
      { id: 'stamina', title: '스태미너 +15', desc: '달릴 수 있는 시간이 늘어난다.', apply: () => { this.player.maxStamina += 15; this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 15); } },
      { id: 'speed', title: '이동 속도 +4%', desc: '걷기와 달리기 속도가 조금 빨라진다.', apply: () => { this.upgrades.speed += .04; this.player.speed *= 1.04; this.player.sprint *= 1.04; } },
      { id: 'regen', title: '스태미너 회복 +20%', desc: '걷는 동안 스태미너 회복이 빨라진다.', apply: () => { this.upgrades.staminaRegen += .20; this.player.staminaRegen *= 1.20; } },
      { id: 'damage', title: '무기 데미지 +8%', desc: '총, 폭발, 레일건의 기본 화력이 오른다.', apply: () => { this.upgrades.damage *= 1.08; } },
      { id: 'headshot', title: '헤드샷 데미지 +20%', desc: '머리를 맞혔을 때 보상이 커진다.', apply: () => { this.upgrades.headshot *= 1.20; } },
      { id: 'wallHp', title: '설치 벽 체력 +25%', desc: '앞으로 설치하는 벽이 더 오래 버틴다.', apply: () => { this.upgrades.wallHp *= 1.25; } },
      { id: 'ammo', title: '탄약 보급 +25%', desc: '상자에서 얻는 탄약량이 증가한다.', apply: () => { this.upgrades.ammoGain *= 1.25; } },
      { id: 'reload', title: '재장전 속도 +12%', desc: '모든 무기의 재장전 시간이 조금 짧아진다.', apply: () => { this.upgrades.reload = (this.upgrades.reload || 1) * .88; } },
      { id: 'kit', title: '회복키트 저장 +10', desc: '회복키트 저장 한도가 늘어난다.', apply: () => { this.maxMedkits = Math.min(160, this.maxMedkits + 10); this.upgrades.medkitMax += 10; } }
    ];
  }

  showRewardChoices() {
    this.serverRewardMode = false;
    this.rewardOpen = true;
    this.prepPhase = false;
    this.prepTimer = 0;
    try { document.exitPointerLock?.(); } catch (_) {}
    const pool = this.rewardPool().sort(() => Math.random() - .5).slice(0, 3);
    if (UI.rewardTitle) UI.rewardTitle.textContent = `Wave ${this.wave} Clear`;
    if (UI.rewardSubtitle) UI.rewardSubtitle.textContent = '보상 하나를 선택하면 10초 준비 시간이 시작된다.';
    if (UI.rewardChoices) {
      UI.rewardChoices.innerHTML = '';
      for (const r of pool) {
        const btn = document.createElement('button');
        btn.className = 'reward-choice';
        btn.innerHTML = `<b>${r.title}</b><span>${r.desc}</span>`;
        btn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); this.chooseReward(r); }, { passive: false });
        btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.chooseReward(r); });
        UI.rewardChoices.appendChild(btn);
      }
    }
    UI.reward?.classList.add('show');
    this.audio.beep(660, .10, 'triangle', .035);
  }

  chooseReward(reward) {
    if (!this.rewardOpen) return;
    if (this.usesServerEnemyAuthority() && this.serverRewardMode) {
      if (reward?.id) this.net?.sendAction?.('chooseReward', 'pistol', { rewardId: reward.id });
      this.rewardOpen = false;
      UI.reward?.classList.remove('show');
      this.showToast(reward?.title ? `${reward.title} 선택 요청` : '보상 건너뜀');
      this.input.requestLock();
      return;
    }
    if (reward?.apply) {
      reward.apply();
      this.rewardsTaken = (this.rewardsTaken || 0) + 1;
      this.showToast(reward.title);
    } else {
      this.showToast('보상 건너뜀');
    }
    this.rewardOpen = false;
    UI.reward?.classList.remove('show');
    this.startPrepPhase(10);
    this.input.requestLock();
  }

  startPrepPhase(seconds = 10) {
    this.prepPhase = true;
    this.prepTimer = seconds;
    this.spawnQueue = 0;
    this.spawnTimer = 0;
    this.showCenterAlert('정비 시간', `${Math.ceil(seconds)}초 동안 아이템을 줍고 벽·지뢰를 준비해라.`, 'info', 2.4);
  }

  loadBestStats() {
    try { return JSON.parse(localStorage.getItem('bhfps_best_stats_v24') || '{}') || {}; }
    catch (_) { return {}; }
  }

  saveBestStats() {
    const key = `${this.mapKey || 'map'}_${UI.diff?.value || 'normal'}`;
    const prev = this.bestStats?.[key] || { wave: 0, score: 0, kills: 0, headshots: 0 };
    const current = { wave: this.wave, score: this.score, kills: this.kills || 0, headshots: this.headshots || 0, map: this.map?.label || '', diff: UI.diff?.value || 'normal' };
    const best = {
      wave: Math.max(prev.wave || 0, current.wave),
      score: Math.max(prev.score || 0, current.score),
      kills: Math.max(prev.kills || 0, current.kills),
      headshots: Math.max(prev.headshots || 0, current.headshots),
      map: current.map,
      diff: current.diff
    };
    this.bestStats = { ...(this.bestStats || {}), [key]: best };
    try { localStorage.setItem('bhfps_best_stats_v24', JSON.stringify(this.bestStats)); } catch (_) {}
    return { current, best };
  }

  runRank() {
    const w = this.wave || 0;
    const s = this.score || 0;
    if (w >= 20 || s >= 18000) return 'S / 격리 실패';
    if (w >= 15 || s >= 11000) return 'A / 백룸 사냥꾼';
    if (w >= 10 || s >= 6500) return 'B / 청소부';
    if (w >= 6 || s >= 3000) return 'C / 생존자';
    return 'D / 실험체';
  }

  endGame() {
    const record = this.saveBestStats();
    this.gameOver = true;
    this.running = false;
    document.exitPointerLock?.();
    UI.hud.classList.add('hidden');
    UI.over.classList.add('show');
    const survived = this.runStartTime ? Math.max(0, now() - this.runStartTime) : 0;
    const min = Math.floor(survived / 60), sec = Math.floor(survived % 60);
    UI.finalStats.innerHTML = `
      <div><b>${this.runRank()}</b><span>런 랭크</span></div>
      <div><b>${this.wave}</b><span>도달 웨이브 / 최고 ${record.best.wave}</span></div>
      <div><b>${this.score.toLocaleString('ko-KR')}</b><span>점수 / 최고 ${record.best.score.toLocaleString('ko-KR')}</span></div>
      <div><b>${this.kills}</b><span>처치 / 최고 ${record.best.kills}</span></div>
      <div><b>${this.headshots || 0}</b><span>헤드샷 / 최고 ${record.best.headshots || 0}</span></div>
      <div><b>${min}:${String(sec).padStart(2,'0')}</b><span>생존 시간</span></div>
      <div><b>${this.rewardsTaken || 0}</b><span>선택한 보상</span></div>
      <div><b>${this.map.label}</b><span>맵</span></div>
      <div><b>${UI.diff.value.toUpperCase()}</b><span>난이도</span></div>
    `;
  }
}

window.__game = new Game();
console.info('[Boxhead FPS] game module loaded');
