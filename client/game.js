import {AudioBus} from './audio.js';
import {NetAdapter} from './network.js';
import {MAPS,MAP_KEYS as SURVIVAL_MAP_KEYS,DIFFICULTY,WEAPON_DEFS,enemyStats as getEnemyStats,pickEnemyType} from '../shared/arena.js';
import {getMission,createMissionState,tickMission,missionProgress,missionHint,waveSpawnCount,MISSION_CATALOG} from '../shared/missions.js';
import * as THREE from 'three';

const GAME_BUILD = '1.1.0';

const $ = (id) => document.getElementById(id);
const canvas = $('game');

const UI = {
  loading: $('loading-screen'), loadingStatus: $('loading-status'), loadingBar: $('loading-bar'),
  start: $('start-screen'), pause: $('pause-screen'), over: $('game-over-screen'), 
  hud: $('hud'), startBtn: $('start-button'),  resumeBtn: $('resume-button'), restartBtn: $('restart-button'),
  survivalModeBtn: $('survival-mode-button'),  survivalMenuPanel: $('survival-menu-panel'), 

  pingText:$('ping-text'), missionCard:$('mission-card'), missionTitle:$('mission-title'), missionBar:$('mission-progress-bar'), missionBonus:$('mission-bonus'), missionMarker:$('objective-marker'), missionMarkerLabel:$('objective-marker-label'), squadStatus:$('squad-status'), prepReady:$('prep-ready'), connectionOverlay:$('connection-overlay'), connectionTitle:$('connection-title'), connectionCopy:$('connection-copy'), levelGuide:$('level-guide'), lobbyPlayers:$('lobby-players'), leaveRoomBtn:$('leave-room-button'), copyInviteBtn:$('copy-invite-button'),
  mainMenuBtn: $('main-menu-button'), controlsSettingsStart: $('controls-settings-start'), controlsSettingsPause: $('controls-settings-pause'),
  fullscreenStart: $('fullscreen-start'), fullscreenPause: $('fullscreen-pause'), fullscreenControls: $('fullscreen-controls'), fullscreenMobile: $('fullscreen-mobile'),
  singleModeBtn: $('single-mode-button'), coopModeBtn: $('coop-mode-button'), playMode: $('play-mode-select'), multiplayerPanel: $('multiplayer-panel'),
  createRoomBtn: $('create-room-button'), joinRoomBtn: $('join-room-button'), readyBtn: $('ready-button'), roomCodeInput: $('room-code-input'), lobbyRoomCode: $('lobby-room-code'), lobbyStatus: $('lobby-status-text'), netState: $('net-state'), netStatusText: $('net-status-text'),
  map: $('map-select'), diff: $('difficulty-select'), quality: $('quality-select'), startWave: $('start-wave-select'),
  pauseQuality: $('pause-quality-select'), masterVolume: $('master-volume-range'), sfxVolume: $('sfx-volume-range'), bgmVolume: $('bgm-volume-range'), masterVolumeLabel: $('master-volume-label'), sfxVolumeLabel: $('sfx-volume-label'), bgmVolumeLabel: $('bgm-volume-label'),
  ambienceVolume:$('ambience-volume-range'), ambienceVolumeLabel:$('ambience-volume-label'), soundMix:$('sound-mix'), soundSettings:$('sound-settings-screen'), soundStatus:$('sound-status'),
  startFov: $('start-fov-range'), startFovLabel: $('start-fov-label'), pauseFov: $('pause-fov-range'), pauseFovLabel: $('pause-fov-label'),
  startCameraMotion: $('start-camera-motion'), pauseCameraMotion: $('pause-camera-motion'), pauseFlicker: $('pause-flicker'), pauseHighContrast: $('pause-high-contrast'),
  gameOverMainBtn: $('game-over-main-button'), rewardExtract: $('reward-extract'), careerSummary: $('career-summary'),
  saveExport: $('save-export'), saveImport: $('save-import'), saveImportFile: $('save-import-file'),
  hpText: $('hp-text'), hpBar: $('hp-bar'), staminaText: $('stamina-text'), staminaBar: $('stamina-bar'), medkitText: $('medkit-text'), medkitBar: $('medkit-bar'), healKeyLabel: $('heal-key-label'),
  waveText: $('wave-text'), aliveText: $('alive-text'), objectiveText: $('objective-text'), scoreText: $('score-text'), fpsText: $('fps-text'), qualityText: $('quality-text'),
  weaponBar: $('weapon-bar'), ammoText: $('ammo-text'), toast: $('toast'), centerAlert: $('center-alert'), headshot: $('headshot-indicator'), lowHealth: $('low-health-warning'), vignette: $('damage-vignette'), damageDir: $('damage-direction'), impactNoise: $('impact-noise'),
  finalStats: $('final-stats'), minimap: $('minimap'), startMapPreview: $('start-map-preview'), crosshair: $('crosshair'),
  reward: $('reward-screen'), rewardTitle: $('reward-title'), rewardSubtitle: $('reward-subtitle'), rewardChoices: $('reward-choices'), rewardConfirm: $('reward-confirm'), rewardSkip: $('reward-skip'),
  detectedQuality: $('detected-quality'), qualityDescription: $('quality-description'), performanceNotice: $('performance-notice'),
  mobileControls: $('mobile-controls'), mobileLookZone: $('mobile-look-zone'), mobileJoystick: $('mobile-joystick'), mobileJoystickKnob: $('mobile-joystick-knob'),
  mobileSettingsStart: $('mobile-settings-start'), mobileSettingsPause: $('mobile-settings-pause'), mobileSettings: $('mobile-settings-screen'), mobileSettingsClose: $('mobile-settings-close'),
  mobileKeyList: $('mobile-key-list'), mobileSensitivity: $('mobile-sensitivity'), mobileSensitivityLabel: $('mobile-sensitivity-label'),
  mobileAutoSprint: $('mobile-auto-sprint'), mobileAimMode: $('mobile-aim-mode'),
  mobileScale: $('mobile-scale'), mobileScaleLabel: $('mobile-scale-label'), mobileOpacity: $('mobile-opacity'), mobileOpacityLabel: $('mobile-opacity-label'), mobileSprintState: $('mobile-sprint-state'),
  mobileLayoutEdit: $('mobile-layout-edit'), mobileLayoutReset: $('mobile-layout-reset'), mobileLayoutToolbar: $('mobile-layout-toolbar'), mobileLayoutDone: $('mobile-layout-done'),
  mobileInputMode: $('mobile-input-mode-select'), mobileSettingsInputMode: $('mobile-settings-input-mode-select'),
  pauseInputMode: $('pause-input-mode-select'), controlsInputMode: $('controls-input-mode-select'),
  pauseMouseSensitivity: $('pause-mouse-sensitivity'), pauseMouseSensitivityLabel: $('pause-mouse-sensitivity-label'),
  controlsMouseSensitivity: $('controls-mouse-sensitivity'), controlsMouseSensitivityLabel: $('controls-mouse-sensitivity-label'),
  controlsSettings: $('controls-settings-screen'), controlsSettingsClose: $('controls-settings-close'), controlsReset: $('controls-reset'),
  keyBindingList: $('key-binding-list'), bindingCaptureNotice: $('binding-capture-notice'),
  orientationOverlay: $('orientation-overlay'),

    };

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rand = (min, max) => min + Math.random() * (max - min);
const dist2 = (ax, az, bx, bz) => (ax - bx) * (ax - bx) + (az - bz) * (az - bz);
const now = () => performance.now() / 1000;

const isMobileDevice = () => {
  const coarse = !!window.matchMedia?.('(pointer: coarse)').matches;
  const touch = Number(navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
  const mobileUa = /Android|iPhone|iPad|iPod|Mobile|Silk|Kindle/i.test(navigator.userAgent || '');
  return touch && (coarse || mobileUa);
};

const DEFAULT_BINDINGS = Object.freeze({
  forward: 'KeyW', backward: 'KeyS', left: 'KeyA', right: 'KeyD',
  jump: 'Space', sprint: 'ShiftLeft', fire: 'Mouse0', aim: 'Mouse2',
  reload: 'KeyR', heal: 'KeyE', interact: 'KeyF',
  weapon1: 'Digit1', weapon2: 'Digit2', weapon3: 'Digit3', weapon4: 'Digit4',
  weapon5: 'Digit5', weapon6: 'Digit6', weapon7: 'Digit7', weapon8: 'Digit8'
});

const BINDING_ACTIONS = [
  ['forward','앞으로 이동'], ['backward','뒤로 이동'], ['left','왼쪽 이동'], ['right','오른쪽 이동'],
  ['jump','점프'], ['sprint','달리기'], ['fire','발사'], ['aim','정조준'],
  ['reload','재장전'], ['heal','회복·아군 지원'], ['interact','목표 상호작용'],
  ['weapon1','무기 1'], ['weapon2','무기 2'], ['weapon3','무기 3'], ['weapon4','무기 4'],
  ['weapon5','무기 5'], ['weapon6','무기 6'], ['weapon7','무기 7'], ['weapon8','무기 8']
];

const BINDING_NAMES = {
  Space:'Space', ShiftLeft:'왼쪽 Shift', ShiftRight:'오른쪽 Shift', ControlLeft:'왼쪽 Ctrl', ControlRight:'오른쪽 Ctrl',
  AltLeft:'왼쪽 Alt', AltRight:'오른쪽 Alt', ArrowUp:'↑', ArrowDown:'↓', ArrowLeft:'←', ArrowRight:'→',
  Mouse0:'마우스 왼쪽', Mouse1:'마우스 가운데', Mouse2:'마우스 오른쪽'
};
const bindingLabel = (code = '') => BINDING_NAMES[code] || code.replace(/^Key/, '').replace(/^Digit/, '숫자 ');

const WORLD = {
  WALL_HEIGHT: 4.0,
  CEILING_HEIGHT: 3.95,
  EYE_HEIGHT: 1.68,
  PLAYER_RADIUS: 0.46,
  GRAVITY: 17.5,
  JUMP_VELOCITY: 6.4
};

// 모든 내비게이션 단계가 같은 이웃 순서와 이동 비용을 사용한다.
const NAV_DIRS = [
  [1,0,1],[-1,0,1],[0,1,1],[0,-1,1],
  [1,1,Math.SQRT2],[-1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,-1,Math.SQRT2]
];
const NAV_OPPOSITE = [1,0,3,2,7,6,5,4];
const NAV_FORWARD_LINKS = [0,2,4,5];

const COLORS = {
  // 밝은데 불길한 Backrooms 느낌: 더 잘 보이는 누런 벽지, 형광등, 어두운 몰딩으로 공포감 유지.
  floor: 0x6f684e, wall: 0xb2a866, wallDark: 0x4f4728, ceiling: 0x80784f, wallPanel: 0x988f53, trim: 0x2c2415,
  player: 0xffcf4d, zombie: 0xf5f2df, runner: 0x31c7e8, devil: 0x5b2a86,
  bullet: 0xfff1a6, fire: 0xff5833, pickup: 0x58d9ff, barrel: 0xff914d, fakeWall: 0xd5c76d,
  skin: 0xf0c39f, hair: 0x060608, shirtBlack: 0x09090b, suitWhite: 0xf3f5f7,
  iceBlue: 0xb8d2e8, gloveBlue: 0x8fb3cc, zombieSuit: 0xf5f2df, zombieStripe: 0xf19b24, runnerSuit: 0x31c7e8, runnerStripe: 0xd9fbff, runnerFace: 0x0d4f67,
  devilRed: 0x5b2a86, devilDark: 0x160d2d, devilEye: 0xe5b7ff, casterOrb: 0xb65cff, casterCore: 0x78f8ff, casterExplosion: 0xa54cff, casterMarker: 0xd45cff, shoeBlack: 0x0a0a0c,
  tankSuit: 0x5f6670, tankArmor: 0x2b3038, tankStripe: 0xffc13b,
  bomberSuit: 0xffb13d, bomberVest: 0x2b2116, bomberRed: 0xff3030,
  shieldSuit: 0xe9edf2, shieldPlate: 0x244c7a, shieldEdge: 0x9fd8ff,
  weaponDark: 0x1e2329, weaponMetal: 0x555d66, outline: 0x111111, blood: 0xa50016, bloodDark: 0x56000b, crack: 0x17130c, dust: 0x8a7d55, mineDark: 0x15171a, mineMetal: 0x34383e,
  lightPanel: 0xdbe2a5, itemBox: 0xd3b34f, itemBand: 0x2a3340, itemHealth: 0x49d17d
};

const QUALITY = {
  // 초저사양은 사무용 내장 그래픽을 목표로 GPU/DOM/이펙트 갱신량을 함께 줄인다.
  ultra: { label: '초저사양', pixelRatio: .44, minPixelRatio: .30, fogFar: 38, fx: .04, shadows: false, shadowMap: 0, lightCount: 0, targetFps: 30, maxFx: 8, maxEnemies: 24, detailStep: 0, stainCount: 0, hudHz: 8, minimapHz: 4, aiHz: 12, overlapHz: 8, simpleModels: true, dynamicResolution: true },
  low: { label: '낮음', pixelRatio: .90, minPixelRatio: .66, fogFar: 64, fx: .58, shadows: false, shadowMap: 0, lightCount: 3, targetFps: 45, maxFx: 72, maxEnemies: 58, detailStep: 6, stainCount: 10, hudHz: 15, minimapHz: 6, dynamicResolution: true },
  mid: { label: '보통', pixelRatio: 1.15, minPixelRatio: .85, fogFar: 86, fx: 1.0, shadows: true, shadowMap: 768, lightCount: 7, targetFps: 60, maxFx: 130, maxEnemies: 72, detailStep: 4, stainCount: 20, hudHz: 30, minimapHz: 12, dynamicResolution: false },
  high: { label: '높음', pixelRatio: 1.5, minPixelRatio: 1.0, fogFar: 108, fx: 1.18, shadows: true, shadowMap: 1536, lightCount: 11, targetFps: 60, maxFx: 190, maxEnemies: 72, detailStep: 4, stainCount: 32, hudHz: 60, minimapHz: 20, dynamicResolution: false }
};

function detectQualityKey() {
  const cores = Number(navigator.hardwareConcurrency || 4);
  const memory = Number(navigator.deviceMemory || 4);
  const pixels = Math.max(1, window.screen?.width || window.innerWidth) * Math.max(1, window.screen?.height || window.innerHeight);
  // 모바일은 CPU 코어 수가 높게 보고돼도 발열과 통합 GPU 한계가 있으므로 별도 상한을 둔다.
  if (isMobileDevice()) return cores <= 4 || memory <= 3 ? 'ultra' : 'low';
  // 동작 감소 선호는 성능 등급이 아니다. 화질을 강제로 낮추지 않고 카메라·조명
  // 효과만 별도 접근성 설정으로 줄인다.
  if (cores <= 2 || memory <= 2) return 'ultra';
  if (cores <= 4 || memory <= 4 || pixels >= 2560 * 1440) return 'low';
  if (cores >= 10 && memory >= 8 && pixels <= 2560 * 1440) return 'high';
  return 'mid';
}

function describeHardware(key) {
  const cores = Number(navigator.hardwareConcurrency || 0);
  const memory = Number(navigator.deviceMemory || 0);
  const parts = [];
  if (cores) parts.push(`CPU ${cores}스레드`);
  if (memory) parts.push(`메모리 약 ${memory}GB`);
  parts.push(`${window.innerWidth}×${window.innerHeight}`);
  return `${parts.join(' · ')} 기준 ${QUALITY[key]?.label || '보통'} 모드`;
}

class Input {
  constructor(dom) {
    this.dom = dom;
    this.keys = new Set();
    this.mouse = { dx: 0, dy: 0, down: false, middle: false, right: false };
    this.wheel = 0;
    this.locked = false;
    this.touchMode = false;
    this.mouseSensitivity = 1;
    this.lookBlockedUntil = 0;
    this.lastMouseEventAt = 0;
    this.mouseEventLimit = 110;
    this.mouseFrameLimit = 260;
    this.bindings = { ...DEFAULT_BINDINGS };
    this.virtualActions = new Set();
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
    }, { passive: false });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.resetTransient());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.resetTransient();
    });
    dom.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      const t = performance.now();
      if (t < this.lookBlockedUntil) return;
      const rawX = Number(e.movementX) || 0;
      const rawY = Number(e.movementY) || 0;
      if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) return;
      // 포인터락 재진입·탭 전환·브라우저 프레임 정체 뒤 간헐적으로 수천 px짜리
      // movement 값이 한 번 들어오는 경우가 있다. 이 값은 정상 조작이 아니므로 버린다.
      if (Math.max(Math.abs(rawX), Math.abs(rawY)) > 900) {
        this.discardLook(90);
        return;
      }
      const dx = clamp(rawX, -this.mouseEventLimit, this.mouseEventLimit) * this.mouseSensitivity;
      const dy = clamp(rawY, -this.mouseEventLimit, this.mouseEventLimit) * this.mouseSensitivity;
      this.mouse.dx = clamp(this.mouse.dx + dx, -this.mouseFrameLimit, this.mouseFrameLimit);
      this.mouse.dy = clamp(this.mouse.dy + dy, -this.mouseFrameLimit, this.mouseFrameLimit);
      this.lastMouseEventAt = t;
    });
    dom.addEventListener('mousedown', (e) => {
      if (!this.locked) return;
      if (e.button === 0) this.mouse.down = true;
      if (e.button === 1) this.mouse.middle = true;
      if (e.button === 2) this.mouse.right = true;
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.down = false;
      if (e.button === 1) this.mouse.middle = false;
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
      if (this.locked) this.discardLook(120);
      else this.resetTransient();
    });
  }
  discardLook(blockMs = 0) {
    this.mouse.dx = 0;
    this.mouse.dy = 0;
    this.wheel = 0;
    if (blockMs > 0) this.lookBlockedUntil = Math.max(this.lookBlockedUntil, performance.now() + blockMs);
  }
  resetTransient() {
    this.keys.clear();
    this.discardLook(50);
    this.mouse.down = false;
    this.mouse.middle = false;
    this.mouse.right = false;
    this.virtualActions.clear();
  }
  requestLock() {
    if (this.touchMode) return;
    try {
      const result = this.dom.requestPointerLock?.();
      if (result && typeof result.catch === 'function') result.catch(() => {});
    } catch (_) {
      // 포인터락이 거절돼도 게임 시작 자체는 막지 않는다.
    }
  }
  consumeMouse() {
    const m = {
      dx: clamp(this.mouse.dx, -this.mouseFrameLimit, this.mouseFrameLimit),
      dy: clamp(this.mouse.dy, -this.mouseFrameLimit, this.mouseFrameLimit)
    };
    this.mouse.dx = 0; this.mouse.dy = 0;
    return m;
  }
  consumeWheel() {
    const w = this.wheel;
    this.wheel = 0;
    return w;
  }
  setTouchMode(enabled) { this.touchMode = !!enabled; }
  setMouseSensitivity(value = 1) { this.mouseSensitivity = clamp(Number(value) || 1, .35, 2); }
  setBindings(bindings = {}) { this.bindings = { ...DEFAULT_BINDINGS, ...bindings }; }
  mouseBindingDown(code) {
    if (code === 'Mouse0') return !!this.mouse.down;
    if (code === 'Mouse1') return !!this.mouse.middle;
    if (code === 'Mouse2') return !!this.mouse.right;
    return false;
  }
  actionDown(action) {
    if (this.virtualActions.has(action)) return true;
    const code = this.bindings[action];
    return code?.startsWith('Mouse') ? this.mouseBindingDown(code) : this.keys.has(code);
  }
  consumeAction(action) {
    if (!this.actionDown(action)) return false;
    this.virtualActions.delete(action);
    const code = this.bindings[action];
    if (code === 'Mouse0') this.mouse.down = false;
    else if (code === 'Mouse1') this.mouse.middle = false;
    else if (code === 'Mouse2') this.mouse.right = false;
    else if (code) this.keys.delete(code);
    return true;
  }
  setVirtualAction(action, active) {
    if (active) this.virtualActions.add(action);
    else this.virtualActions.delete(action);
  }
  setVirtualKey(code, active) {
    if (active) this.keys.add(code);
    else this.keys.delete(code);
  }
  setVirtualMouse(button, active) {
    if (button === 'right') this.mouse.right = !!active;
    else this.mouse.down = !!active;
  }
  addLookDelta(dx, dy) {
    this.mouse.dx += Number(dx) || 0;
    this.mouse.dy += Number(dy) || 0;
  }
  cycleVirtualWeapon(step = 1) { this.wheel += step >= 0 ? 1 : -1; }
  down(code) { return this.keys.has(code); }
}

class MobileController {
  constructor(game, input) {
    this.game = game;
    this.input = input;
    this.enabled = isMobileDevice();
    this.actions = {
      fire: { label: '발사' }, adsFire: { label: 'ADS 발사' }, aim: { label: '조준' }, jump: { label: '점프' },
      sprint: { label: '달리기' }, reload: { label: '재장전' }, heal: { label: '회복' }, interact:{label:'목표'},
      weapon: { label: '무기 변경' }, none: { label: '사용 안 함' }
    };
    this.configurableControls = ['fireLeft','fire','adsFire','aim','jump','sprint','reload','heal','interact','weapon'];
    this.controlNames = {
      fireLeft:'좌측 발사 버튼', fire:'우측 발사 버튼', adsFire:'ADS 발사 버튼', aim:'조준 버튼',
      jump:'점프 버튼', sprint:'달리기 잠금 버튼', reload:'재장전 버튼', heal:'회복 버튼', interact:'목표 상호작용 버튼', weapon:'무기 변경 버튼'
    };
    this.defaultMapping = { fireLeft:'fire', fire:'fire', adsFire:'adsFire', aim:'aim', jump:'jump', sprint:'sprint', reload:'reload', heal:'heal', interact:'interact', weapon:'weapon', pause:'pause' };
    this.defaultPositions = {
      joystick:{x:14,y:72}, fireLeft:{x:11,y:35}, fire:{x:91,y:64}, adsFire:{x:80,y:53}, aim:{x:79,y:70}, jump:{x:92,y:39},
      sprint:{x:28,y:53}, reload:{x:89,y:84}, heal:{x:66,y:86}, interact:{x:66,y:65}, weapon:{x:77,y:88}, pause:{x:96,y:10}
    };
    this.mapping = { ...this.defaultMapping };
    this.positions = JSON.parse(JSON.stringify(this.defaultPositions));
    this.sensitivity = 1;
    this.scale = 1;
    this.opacity = .72;
    this.autoSprint = true;
    this.aimMode = 'toggle';
    this.aimLocked = false;
    this.sprintLocked = false;
    this.joystickSprint = false;
    this.pointerActions = new Map();
    this.joystickPointer = null;
    this.lookPointer = null;
    this.lookDragDistance = 0;
    this.dragPointer = null;
    this.settingsReturn = 'start';
    this.layoutEditing = false;
    if (!this.enabled) return;

    document.body.classList.add('mobile-device');
    this.controls = new Map();
    for (const el of UI.mobileControls?.querySelectorAll?.('.mobile-control') || []) {
      this.controls.set(el.dataset.control, el);
    }
    this.load();
    this.renderKeySettings();
    this.applyPositions();
    this.updateButtonLabels();
    this.bind();
    this.updateOrientationState();
  }

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem('bhfps_mobile_controls_v45') || localStorage.getItem('bhfps_mobile_controls_v43') || '{}');
      if (saved.mapping && typeof saved.mapping === 'object') {
        for (const control of this.configurableControls) {
          if (this.actions[saved.mapping[control]]) this.mapping[control] = saved.mapping[control];
        }
      }
      if (saved.positions && typeof saved.positions === 'object') {
        for (const [control, pos] of Object.entries(saved.positions)) {
          if (!this.defaultPositions[control] || !Number.isFinite(pos?.x) || !Number.isFinite(pos?.y)) continue;
          this.positions[control] = { x: clamp(pos.x, 4, 96), y: clamp(pos.y, 7, 93) };
        }
      }
      if (Number.isFinite(saved.sensitivity)) this.sensitivity = clamp(saved.sensitivity, .45, 1.8);
      if (Number.isFinite(saved.scale)) this.scale = clamp(saved.scale, .75, 1.35);
      if (Number.isFinite(saved.opacity)) this.opacity = clamp(saved.opacity, .35, 1);
      if (typeof saved.autoSprint === 'boolean') this.autoSprint = saved.autoSprint;
      if (['toggle','hold'].includes(saved.aimMode)) this.aimMode = saved.aimMode;
    } catch (_) {}
    if (UI.mobileSensitivity) UI.mobileSensitivity.value = String(Math.round(this.sensitivity * 100));
    if (UI.mobileScale) UI.mobileScale.value = String(Math.round(this.scale * 100));
    if (UI.mobileOpacity) UI.mobileOpacity.value = String(Math.round(this.opacity * 100));
    if (UI.mobileAutoSprint) UI.mobileAutoSprint.value = this.autoSprint ? 'on' : 'off';
    if (UI.mobileAimMode) UI.mobileAimMode.value = this.aimMode;
    this.updateMobileSettingLabels();
    this.applyVisualPreferences();
  }

  save() {
    try {
      localStorage.setItem('bhfps_mobile_controls_v45', JSON.stringify({
        mapping: this.mapping,
        positions: this.positions,
        sensitivity: this.sensitivity,
        scale: this.scale,
        opacity: this.opacity,
        autoSprint: this.autoSprint,
        aimMode: this.aimMode
      }));
    } catch (_) {}
  }

  bind() {
    UI.mobileSettingsStart?.addEventListener('click', () => this.openSettings('start'));
    UI.mobileSettingsPause?.addEventListener('click', () => this.openSettings('pause'));
    UI.mobileSettingsClose?.addEventListener('click', () => this.closeSettings());
    UI.mobileLayoutEdit?.addEventListener('click', () => this.beginLayoutEdit());
    UI.mobileLayoutDone?.addEventListener('click', () => this.endLayoutEdit());
    UI.mobileLayoutReset?.addEventListener('click', () => this.resetDefaults());
    UI.mobileSensitivity?.addEventListener('input', () => {
      this.sensitivity = clamp((Number(UI.mobileSensitivity.value) || 100) / 100, .45, 1.8);
      this.updateMobileSettingLabels();
      this.save();
    });
    UI.mobileScale?.addEventListener('input', () => {
      this.scale = clamp((Number(UI.mobileScale.value) || 100) / 100, .75, 1.35);
      this.updateMobileSettingLabels();
      this.applyVisualPreferences();
      this.save();
    });
    UI.mobileOpacity?.addEventListener('input', () => {
      this.opacity = clamp((Number(UI.mobileOpacity.value) || 72) / 100, .35, 1);
      this.updateMobileSettingLabels();
      this.applyVisualPreferences();
      this.save();
    });
    UI.mobileAutoSprint?.addEventListener('change', () => {
      this.autoSprint = UI.mobileAutoSprint.value !== 'off';
      if (!this.autoSprint) this.joystickSprint = false;
      this.refreshCompositeActions();
      this.save();
    });
    UI.mobileAimMode?.addEventListener('change', () => {
      this.aimMode = UI.mobileAimMode.value === 'hold' ? 'hold' : 'toggle';
      this.aimLocked = false;
      this.refreshCompositeActions();
      this.updateButtonLabels();
      this.save();
    });
    UI.mobileSettingsInputMode?.addEventListener('change', () => this.game.setInputMode(UI.mobileSettingsInputMode.value));

    for (const [control, el] of this.controls) {
      el.addEventListener('pointerdown', (event) => this.onControlDown(control, el, event), { passive: false });
      el.addEventListener('pointermove', (event) => this.onControlMove(control, el, event), { passive: false });
      el.addEventListener('pointerup', (event) => this.onControlUp(control, el, event), { passive: false });
      el.addEventListener('pointercancel', (event) => this.onControlUp(control, el, event), { passive: false });
      el.addEventListener('contextmenu', event => event.preventDefault());
    }

    UI.mobileLookZone?.addEventListener('pointerdown', (event) => {
      if (!document.body.classList.contains('mobile-playing') || this.layoutEditing || this.lookPointer !== null) return;
      event.preventDefault();
      this.lookPointer = event.pointerId;
      this.lookLast = { x: event.clientX, y: event.clientY };
      this.lookDragDistance = 0;
      this.lookStart = { x: event.clientX, y: event.clientY };
      try { UI.mobileLookZone.setPointerCapture(event.pointerId); } catch (_) {}
    }, { passive: false });
    UI.mobileLookZone?.addEventListener('pointermove', (event) => {
      if (event.pointerId !== this.lookPointer || !this.lookLast) return;
      event.preventDefault();
      const dx = event.clientX - this.lookLast.x;
      const dy = event.clientY - this.lookLast.y;
      this.lookLast = { x: event.clientX, y: event.clientY };
      this.lookDragDistance += Math.hypot(dx, dy);
      // 모바일 시점 회전은 실제 손가락 이동량만 반영한다.
      // 가장자리 자동 회전을 사용하지 않아 발사 중 우측으로 계속 도는 현상을 방지한다.
      this.input.addLookDelta(dx * this.sensitivity, dy * this.sensitivity);
    }, { passive: false });
    const endLook = (event) => {
      if (event.pointerId !== this.lookPointer) return;
      this.lookPointer = null;
      this.lookLast = null;
      this.lookStart = null;
      this.lookDragDistance = 0;
    };
    UI.mobileLookZone?.addEventListener('pointerup', endLook, { passive: false });
    UI.mobileLookZone?.addEventListener('pointercancel', endLook, { passive: false });

    window.addEventListener('resize', () => this.updateOrientationState());
    window.addEventListener('orientationchange', () => setTimeout(() => this.updateOrientationState(), 80));
    document.addEventListener('fullscreenchange', () => this.updateOrientationState());
    window.addEventListener('blur', () => this.releaseAll());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.releaseAll(); });
  }

  renderKeySettings() {
    if (!UI.mobileKeyList) return;
    UI.mobileKeyList.innerHTML = '';
    for (const control of this.configurableControls) {
      const row = document.createElement('label');
      row.className = 'mobile-key-row';
      const title = document.createElement('b');
      title.textContent = this.controlNames[control] || `버튼 ${this.actionLabel(this.defaultMapping[control] || control)}`;
      const select = document.createElement('select');
      select.dataset.mobileControl = control;
      for (const [action, info] of Object.entries(this.actions)) {
        const option = document.createElement('option');
        option.value = action;
        option.textContent = info.label;
        select.appendChild(option);
      }
      select.value = this.mapping[control];
      select.addEventListener('change', () => {
        this.mapping[control] = this.actions[select.value] ? select.value : this.defaultMapping[control];
        this.updateButtonLabels();
        this.save();
      });
      row.append(title, select);
      UI.mobileKeyList.appendChild(row);
    }
  }

  actionLabel(action) { return action === 'pause' ? 'Ⅱ' : (this.actions[action]?.label || action); }

  updateButtonLabels() {
    const visualActions = ['fire','aim','jump','sprint','reload','heal','weapon'];
    for (const [control, el] of this.controls) {
      if (control === 'joystick') continue;
      const action = control === 'pause' ? 'pause' : (this.mapping[control] || control);
      el.textContent = this.actionLabel(action);
      for (const name of visualActions) el.classList.remove(`action-${name}`);
      if (visualActions.includes(action)) el.classList.add(`action-${action}`);
      el.classList.toggle('locked', (action === 'aim' && this.aimLocked) || (action === 'sprint' && this.sprintLocked));
    }
  }

  updateMobileSettingLabels() {
    if (UI.mobileSensitivityLabel) UI.mobileSensitivityLabel.textContent = `${Math.round(this.sensitivity * 100)}%`;
    if (UI.mobileScaleLabel) UI.mobileScaleLabel.textContent = `${Math.round(this.scale * 100)}%`;
    if (UI.mobileOpacityLabel) UI.mobileOpacityLabel.textContent = `${Math.round(this.opacity * 100)}%`;
  }

  applyVisualPreferences() {
    UI.mobileControls?.style.setProperty('--mobile-scale', String(this.scale));
    UI.mobileControls?.style.setProperty('--mobile-opacity', String(this.opacity));
  }

  applyPositions() {
    for (const [control, el] of this.controls) {
      const pos = this.positions[control] || this.defaultPositions[control];
      if (!pos) continue;
      el.style.setProperty('--mobile-x', `${pos.x}%`);
      el.style.setProperty('--mobile-y', `${pos.y}%`);
    }
  }

  openSettings(source = 'start') {
    if (!this.enabled) return;
    this.settingsReturn = source === 'pause' || this.game.running ? 'pause' : 'start';
    if (this.game.running && !this.game.paused) this.game.pause();
    this.releaseAll();
    UI.start?.classList.remove('show');
    UI.pause?.classList.remove('show');
    UI.mobileSettings?.classList.add('show');
    document.body.classList.remove('mobile-playing');
  }

  closeSettings() {
    UI.mobileSettings?.classList.remove('show');
    if (this.settingsReturn === 'pause' && this.game.running) UI.pause?.classList.add('show');
    else UI.start?.classList.add('show');
  }

  beginLayoutEdit() {
    this.releaseAll();
    this.layoutEditing = true;
    UI.mobileSettings?.classList.remove('show');
    document.body.classList.add('mobile-layout-edit');
  }

  endLayoutEdit() {
    this.layoutEditing = false;
    this.dragPointer = null;
    document.body.classList.remove('mobile-layout-edit');
    this.save();
    UI.mobileSettings?.classList.add('show');
  }

  resetDefaults() {
    this.mapping = { ...this.defaultMapping };
    this.positions = JSON.parse(JSON.stringify(this.defaultPositions));
    this.sensitivity = 1;
    this.scale = 1;
    this.opacity = .72;
    this.autoSprint = true;
    this.aimMode = 'toggle';
    this.aimLocked = false;
    this.sprintLocked = false;
    this.joystickSprint = false;
    if (UI.mobileSensitivity) UI.mobileSensitivity.value = '100';
    if (UI.mobileScale) UI.mobileScale.value = '100';
    if (UI.mobileOpacity) UI.mobileOpacity.value = '72';
    if (UI.mobileAutoSprint) UI.mobileAutoSprint.value = 'on';
    if (UI.mobileAimMode) UI.mobileAimMode.value = 'toggle';
    this.updateMobileSettingLabels();
    this.applyVisualPreferences();
    this.renderKeySettings();
    this.updateButtonLabels();
    this.applyPositions();
    this.save();
  }

  onControlDown(control, el, event) {
    event.preventDefault();
    event.stopPropagation();
    try { el.setPointerCapture(event.pointerId); } catch (_) {}
    if (this.layoutEditing) {
      this.dragPointer = event.pointerId;
      this.dragControl = control;
      this.updateDraggedPosition(control, event.clientX, event.clientY);
      return;
    }
    if (!document.body.classList.contains('mobile-playing')) return;
    if (control === 'joystick') {
      this.joystickPointer = event.pointerId;
      this.updateJoystick(event.clientX, event.clientY);
      return;
    }
    const action = control === 'pause' ? 'pause' : (this.mapping[control] || control);
    if (action === 'sprint') {
      this.sprintLocked = !this.sprintLocked;
      this.refreshCompositeActions();
      this.updateButtonLabels();
      return;
    }
    if (action === 'aim' && this.aimMode === 'toggle') {
      this.aimLocked = !this.aimLocked;
      this.refreshCompositeActions();
      this.updateButtonLabels();
      return;
    }
    this.pointerActions.set(event.pointerId, {
      action, el,
      lastX: event.clientX, lastY: event.clientY,
      startX: event.clientX, startY: event.clientY,
      dragLook: action === 'fire' || action === 'adsFire',
      dragDistance: 0
    });
    el.classList.add('active');
    this.setAction(action, true, true);
  }

  onControlMove(control, el, event) {
    if (this.layoutEditing && event.pointerId === this.dragPointer && control === this.dragControl) {
      event.preventDefault();
      this.updateDraggedPosition(control, event.clientX, event.clientY);
      return;
    }
    if (control === 'joystick' && event.pointerId === this.joystickPointer) {
      event.preventDefault();
      this.updateJoystick(event.clientX, event.clientY);
      return;
    }
    const active = this.pointerActions.get(event.pointerId);
    if (active?.dragLook) {
      event.preventDefault();
      const dx = event.clientX - active.lastX;
      const dy = event.clientY - active.lastY;
      active.lastX = event.clientX;
      active.lastY = event.clientY;
      active.dragDistance += Math.hypot(dx, dy);
      // 발사 버튼을 누른 채 상하좌우·대각선으로 조준할 수 있지만,
      // 시점 변화는 실제 드래그 거리만 사용한다. 정지 중 자동 회전은 발생하지 않는다.
      this.input.addLookDelta(dx * this.sensitivity * 1.06, dy * this.sensitivity * 1.06);
    }
  }

  update(dt) {
    // 연속 자동 회전은 사용하지 않는다.
    // pointermove에서 들어온 실제 드래그 입력만 카메라에 반영한다.
  }

  onControlUp(control, el, event) {
    event.preventDefault();
    if (this.layoutEditing && event.pointerId === this.dragPointer) {
      this.dragPointer = null;
      this.dragControl = null;
      this.save();
      return;
    }
    if (control === 'joystick' && event.pointerId === this.joystickPointer) {
      this.joystickPointer = null;
      this.clearJoystick();
      return;
    }
    const active = this.pointerActions.get(event.pointerId);
    if (!active) return;
    this.pointerActions.delete(event.pointerId);
    active.el?.classList.remove('active');
    this.syncHeldAction(active.action);
  }

  updateDraggedPosition(control, clientX, clientY) {
    const x = clamp(clientX / Math.max(1, window.innerWidth) * 100, 4, 96);
    const y = clamp(clientY / Math.max(1, window.innerHeight) * 100, 7, 93);
    this.positions[control] = { x, y };
    this.applyPositions();
  }

  updateJoystick(clientX, clientY) {
    const el = UI.mobileJoystick;
    const knob = UI.mobileJoystickKnob;
    if (!el || !knob) return;
    const rect = el.getBoundingClientRect();
    const max = Math.max(24, Math.min(rect.width, rect.height) * .34);
    let dx = clientX - (rect.left + rect.width / 2);
    let dy = clientY - (rect.top + rect.height / 2);
    const length = Math.hypot(dx, dy) || 1;
    if (length > max) { dx = dx / length * max; dy = dy / length * max; }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    const nx = dx / max, ny = dy / max;
    const threshold = .17;
    this.input.setVirtualAction('forward', ny < -threshold);
    this.input.setVirtualAction('backward', ny > threshold);
    this.input.setVirtualAction('left', nx < -threshold);
    this.input.setVirtualAction('right', nx > threshold);
    const sprintNext = this.autoSprint && ny < -.72 && Math.min(1, length / max) > .88;
    if (sprintNext !== this.joystickSprint) {
      this.joystickSprint = sprintNext;
      this.refreshCompositeActions();
      if (UI.mobileSprintState) UI.mobileSprintState.textContent = sprintNext ? '자동 달리기 활성' : '위로 밀면 자동 달리기';
      UI.mobileJoystick?.classList.toggle('sprinting', sprintNext);
    }
  }

  clearJoystick() {
    for (const action of ['forward','backward','left','right']) this.input.setVirtualAction(action, false);
    this.joystickSprint = false;
    this.refreshCompositeActions();
    UI.mobileJoystick?.classList.remove('sprinting');
    if (UI.mobileSprintState) UI.mobileSprintState.textContent = '위로 밀면 자동 달리기';
    if (UI.mobileJoystickKnob) UI.mobileJoystickKnob.style.transform = 'translate(-50%, -50%)';
  }

  setAction(action, active, firstDown = false) {
    if (['fire','adsFire','aim','jump','sprint','reload','heal','interact'].includes(action)) this.refreshCompositeActions();
    else if (action === 'weapon' && active && firstDown) this.input.cycleVirtualWeapon(1);
    else if (action === 'pause' && active && firstDown) this.game.pause();
  }

  syncHeldAction(action) {
    if (!['fire','adsFire','aim','jump','sprint','reload','heal','interact'].includes(action)) return;
    this.refreshCompositeActions();
  }

  refreshCompositeActions() {
    const held = action => [...this.pointerActions.values()].some(pointer => pointer.action === action);
    this.input.setVirtualAction('fire', held('fire') || held('adsFire'));
    this.input.setVirtualAction('aim', this.aimLocked || held('aim') || held('adsFire'));
    this.input.setVirtualAction('sprint', this.sprintLocked || this.joystickSprint || held('sprint'));
    for (const action of ['jump','reload','heal','interact']) this.input.setVirtualAction(action, held(action));
  }

  releaseAll() {
    this.clearJoystick();
    this.aimLocked = false;
    this.sprintLocked = false;
    for (const { el } of this.pointerActions.values()) el?.classList.remove('active');
    this.pointerActions.clear();
    this.refreshCompositeActions();
    this.updateButtonLabels();
    this.lookPointer = null;
    this.lookLast = null;
    this.lookDragDistance = 0;
  }

  setGameplayActive(active) {
    if (!this.enabled) return;
    const show = !!active && this.game.running && !this.game.paused && !this.game.gameOver && this.game.isTouchInputActive();
    document.body.classList.toggle('mobile-playing', show);
    UI.mobileControls?.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (!show) this.releaseAll();
  }

  requestLandscape() {
    if (!this.enabled) return;
    const lock = () => {
      try {
        const result = screen.orientation?.lock?.('landscape');
        if (result?.catch) result.catch(() => {});
      } catch (_) {}
    };
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        const result = document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        if (result?.then) result.then(lock).catch(lock);
        else lock();
      } else lock();
    } catch (_) { lock(); }
  }

  updateOrientationState() {
    if (!this.enabled) return;
    document.body.classList.toggle('mobile-portrait', window.innerHeight > window.innerWidth);
    this.game?.resize?.();
  }
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
      const c = e.type === 'devil' ? 'rgba(212,92,255,.98)' :
        e.type === 'runner' ? 'rgba(40,210,255,.95)' :
        e.type === 'tank' ? 'rgba(150,155,165,.95)' :
        e.type === 'bomber' ? 'rgba(255,205,45,.95)' :
        e.type === 'shield' ? 'rgba(110,180,255,.95)' : 'rgba(255,184,70,.95)';
      ctx.fillStyle = c;
      if (e.type === 'devil') {
        const x = tx(e.x), z = tz(e.z), r = 4.2;
        ctx.beginPath(); ctx.moveTo(x, z-r); ctx.lineTo(x+r, z); ctx.lineTo(x, z+r); ctx.lineTo(x-r, z); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(120,248,255,.95)'; ctx.lineWidth = 1.2; ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(tx(e.x), tz(e.z), e.type === 'tank' ? 3.2 : 2.3, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.fillStyle = 'rgba(85,215,255,.92)';
    for (const p of game.pickups) if (p.alive) { ctx.fillRect(tx(p.x)-2, tz(p.z)-2, 4, 4); }
    
    for(const t of game.missionState?.targets || []){if(t.done)continue;ctx.strokeStyle='#73efd1';ctx.lineWidth=2;ctx.beginPath();ctx.arc(tx(t.x),tz(t.z),game.currentMission?.type==='holdout'?6:3.5,0,Math.PI*2);ctx.stroke();}
    for(const c of game.objectiveCores || [])if(c.alive){ctx.fillStyle='#ff7849';ctx.fillRect(tx(c.x)-3,tz(c.z)-3,6,6);}
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
    this.inputMode = 'auto';
    this.effectiveInputMode = 'keyboard';
    this.mouseSensitivity = 1;
    this.bindings = { ...DEFAULT_BINDINGS };
    this.bindingCaptureAction = null;
    this.controlsSettingsReturn = 'start';
    this.loadInputPreferences();
    this.audio = new AudioBus();
        this.net = new NetAdapter(this, UI);
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
    this.pendingReward = null;
    this.lastRewardOfferIds = [];
    this.prepTimer = 0;
    this.prepPhase = false;
    this.runStartTime = 0;
    this.detectedQualityKey = detectQualityKey();
    this.effectiveQualityKey = this.detectedQualityKey;
    this.quality = QUALITY[this.effectiveQualityKey];
    this.dynamicPixelRatio = this.quality.pixelRatio;
    this.lastFrameTimeMs = 0;
    this.performanceAdjustTimer = 0;
    this.hudUpdateTimer = 0;
    this.minimapUpdateTimer = 0;
    this.frameNumber = 0;
    this.bestStats = this.loadBestStats();
    this.career = this.loadCareer();
    
    this.menuMode = 'survival';
    this.survivalMapKey = this.loadSurvivalMapKey();
    this.runMode = 'survival';

    this.modeTransitioning = false;
    this.suppressAutoPauseUntil = 0;

    this.accessibility = {
      fov: 72,
      cameraMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full',
      flicker: !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
      highContrast: false
    };
    this.minimap = new MiniMap(UI.minimap);
    this.lobby = { mode: 'single', role: 'solo', roomCode: '', ready: false, remoteReady: false, remoteSeen: false };
    this.remotePlayers = new Map();
    this.connectionBlocked = false;
    this.setupRenderer();
    this.bindUI();
    this.mobile = new MobileController(this, this.input);
    this.setInputMode(this.inputMode, false);
    this.renderLevelGuide();
    this.buildWeaponUI();
    window.addEventListener('resize', () => this.drawStartMapPreview());
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
    this.finishBootLoading();
    setTimeout(()=>this.net.restoreSession(),0);
  }

  loadSurvivalMapKey() {
    try {
      const saved = localStorage.getItem('bhfps_survival_map_v54') || localStorage.getItem('bhfps_survival_map_v52') || 'box';
      return SURVIVAL_MAP_KEYS.includes(saved) ? saved : 'box';
    } catch (_) { return 'box'; }
  }

  rememberSurvivalMapKey(key = '') {
    if (!SURVIVAL_MAP_KEYS.includes(key)) return this.survivalMapKey;
    this.survivalMapKey = key;
    try { localStorage.setItem('bhfps_survival_map_v54', key); } catch (_) {}
    return key;
  }

  finishBootLoading() {
    const steps = [
      [18, '그래픽 장치를 준비하는 중...'],
      [42, '백룸 구조를 불러오는 중...'],
      [68, '적 추적 경로를 계산하는 중...'],
      [88, '무기와 입력 장치를 연결하는 중...'],
      [100, '격리 구역 진입 준비 완료']
    ];
    let index = 0;
    const advance = () => {
      const [progress, label] = steps[index++];
      if (UI.loadingBar) UI.loadingBar.style.width = `${progress}%`;
      if (UI.loadingStatus) UI.loadingStatus.textContent = label;
      if (index < steps.length) setTimeout(advance, index === 1 ? 90 : 150);
      else setTimeout(() => {
        UI.loading?.classList.add('leaving');
        if(!this.running && !this.gameOver)UI.start?.classList.add('show');
        setTimeout(() => UI.loading?.classList.remove('show', 'leaving'), 480);
      }, 260);
    };
    requestAnimationFrame(() => requestAnimationFrame(advance));
  }

  setPlayMode(mode='single') {
    this.lobby.mode=mode==='coop'?'coop':'single';
    if(UI.playMode)UI.playMode.value=this.lobby.mode;
    UI.singleModeBtn?.classList.toggle('active',this.lobby.mode==='single');UI.coopModeBtn?.classList.toggle('active',this.lobby.mode==='coop');
    UI.singleModeBtn?.setAttribute('aria-selected',String(this.lobby.mode==='single'));UI.coopModeBtn?.setAttribute('aria-selected',String(this.lobby.mode==='coop'));
    UI.multiplayerPanel?.classList.toggle('hidden',this.lobby.mode!=='coop');
    if(this.lobby.mode==='coop')this.net.connect();
    this.updateLobbyUI();
  }

  randomRoomCode() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  currentMenuSettings() {
    return { map: SURVIVAL_MAP_KEYS.includes(UI.map.value) ? UI.map.value : this.survivalMapKey, diff: UI.diff.value, quality: UI.quality.value, startWave: UI.startWave.value };
  }

  createRoom() { this.net.createRoom(this.currentMenuSettings()); }

  joinRoom() {
    const code=(UI.roomCodeInput?.value || '').trim().toUpperCase();
    if(!/^[A-Z0-9]{6}$/.test(code)){this.updateLobbyUI('친구에게 받은 6자리 방 코드를 입력하세요.');return;}
    this.net.joinRoom(code);
  }

  toggleReady() { if(this.lobby.roomCode && this.net.connected)this.net.setReady(!this.lobby.ready); }

  canStartCoop() { return this.net.connected && this.lobby.role==='host' && this.lobby.ready && this.lobby.remoteReady && this.lobby.remoteConnected && this.net.room?.phase==='lobby'; }

  updateLobbyUI(extra='') {
    if(!this.lobby || !UI.lobbyRoomCode)return;
    const coop=this.lobby.mode==='coop', inRoom=!!this.lobby.roomCode, connected=this.net?.connected;
    UI.lobbyRoomCode.textContent=inRoom?this.lobby.roomCode:'— — — — — —';
    if(UI.readyBtn){UI.readyBtn.disabled=!inRoom||!connected||this.net.room?.phase!=='lobby';UI.readyBtn.textContent=this.lobby.ready?'준비 취소':'준비하기';}
    if(UI.createRoomBtn)UI.createRoomBtn.disabled=!connected || inRoom;
    if(UI.joinRoomBtn)UI.joinRoomBtn.disabled=!connected || inRoom;
    if(UI.leaveRoomBtn)UI.leaveRoomBtn.disabled=!inRoom;
    if(UI.copyInviteBtn)UI.copyInviteBtn.disabled=!inRoom;
    UI.startBtn.textContent=coop?(this.lobby.role==='guest'?'호스트 시작 대기':'협동 플레이 시작'):'싱글플레이 시작';
    UI.startBtn.disabled=coop && !this.canStartCoop();
    for(const select of [UI.map,UI.diff,UI.startWave])if(select)select.disabled=coop && inRoom && (this.lobby.role==='guest' || this.lobby.ready || this.net.room?.phase!=='lobby');
    if(UI.lobbyStatus)UI.lobbyStatus.textContent=extra || (inRoom?(!this.lobby.remoteSeen?'친구의 입장을 기다리고 있습니다.':this.canStartCoop()?'두 사람 준비 완료. 호스트가 시작할 수 있습니다.':'두 사람 모두 준비하기를 눌러주세요.'):'방 만들기 → 친구 입장 → 두 사람 준비 → 시작');
    if(UI.lobbyPlayers){UI.lobbyPlayers.replaceChildren();const list=this.net?.room?.players || [];for(let i=0;i<2;i++){const p=list[i],row=document.createElement('div');row.className='lobby-player'+(p?.ready?' ready':'');row.textContent=p?((p.id===this.net.socket?.id?'나':'친구')+' · '+(p.role==='host'?'호스트':'게스트')+' · '+(!p.connected?'재접속 중':p.ready?'준비 완료':'준비 대기')):'친구를 초대하세요';UI.lobbyPlayers.append(row);}}
  }

  loadInputPreferences() {
    try {
      const saved = JSON.parse(localStorage.getItem('bhfps_input_settings_v44') || '{}');
      this.inputMode = ['auto','touch','keyboard'].includes(saved.inputMode) ? saved.inputMode : 'auto';
      this.mouseSensitivity = clamp(Number(saved.mouseSensitivity) || 1, .35, 2);
      const candidateBindings = Object.fromEntries(BINDING_ACTIONS.map(([action]) => [
        action,
        typeof saved.bindings?.[action] === 'string' ? saved.bindings[action] : DEFAULT_BINDINGS[action]
      ]));
      const codes = Object.values(candidateBindings);
      const validBindings = !codes.includes('Escape') && new Set(codes).size === codes.length;
      Object.assign(this.bindings, validBindings ? candidateBindings : DEFAULT_BINDINGS);
    } catch (_) {}
    this.input.setBindings(this.bindings);
    this.input.setMouseSensitivity(this.mouseSensitivity);
  }

  saveInputPreferences() {
    try {
      localStorage.setItem('bhfps_input_settings_v44', JSON.stringify({
        inputMode: this.inputMode,
        mouseSensitivity: this.mouseSensitivity,
        bindings: this.bindings
      }));
    } catch (_) {}
  }

  isTouchInputActive() { return this.effectiveInputMode === 'touch'; }

  syncInputSettingUI() {
    for (const select of [UI.mobileInputMode, UI.mobileSettingsInputMode, UI.pauseInputMode, UI.controlsInputMode]) {
      if (select) select.value = this.inputMode;
    }
    const percent = Math.round(this.mouseSensitivity * 100);
    for (const range of [UI.pauseMouseSensitivity, UI.controlsMouseSensitivity]) if (range) range.value = String(percent);
    for (const label of [UI.pauseMouseSensitivityLabel, UI.controlsMouseSensitivityLabel]) if (label) label.textContent = `${percent}%`;
  }

  setInputMode(mode = 'auto', persist = true) {
    this.inputMode = ['auto','touch','keyboard'].includes(mode) ? mode : 'auto';
    const touchCapable = !!this.mobile?.enabled || isMobileDevice();
    this.effectiveInputMode = this.inputMode === 'auto' ? (touchCapable ? 'touch' : 'keyboard') : this.inputMode;
    if (this.effectiveInputMode === 'touch' && !touchCapable) this.effectiveInputMode = 'keyboard';
    this.input.setTouchMode(this.effectiveInputMode === 'touch');
    document.body.classList.toggle('mobile-keyboard-mode', touchCapable && this.effectiveInputMode === 'keyboard');
    this.syncInputSettingUI();
    this.mobile?.setGameplayActive(this.running && !this.paused && !this.gameOver);
    if (persist) this.saveInputPreferences();
  }

  setMouseSensitivity(percent = 100) {
    this.mouseSensitivity = clamp((Number(percent) || 100) / 100, .35, 2);
    this.input.setMouseSensitivity(this.mouseSensitivity);
    this.syncInputSettingUI();
    this.saveInputPreferences();
  }

  setupInputSettingsUI() {
    this.syncInputSettingUI();
    this.renderKeyBindingList();
    for (const select of [UI.mobileInputMode, UI.pauseInputMode, UI.controlsInputMode]) {
      select?.addEventListener('change', () => this.setInputMode(select.value));
    }
    for (const range of [UI.pauseMouseSensitivity, UI.controlsMouseSensitivity]) {
      range?.addEventListener('input', () => this.setMouseSensitivity(range.value));
    }
    UI.controlsSettingsStart?.addEventListener('click', () => this.openControlsSettings('start'));
    UI.controlsSettingsPause?.addEventListener('click', () => this.openControlsSettings('pause'));
    UI.controlsSettingsClose?.addEventListener('click', () => this.closeControlsSettings());
    UI.controlsReset?.addEventListener('click', () => {
      this.bindings = { ...DEFAULT_BINDINGS };
      this.input.setBindings(this.bindings);
      this.cancelBindingCapture('기본 키 설정을 복원했습니다.');
      this.renderKeyBindingList();
      this.saveInputPreferences();
    });
    window.addEventListener('keydown', event => {
      if (!this.bindingCaptureAction) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.code === 'Escape') this.cancelBindingCapture('키 변경을 취소했습니다.');
      else if (/^F\d+$/.test(event.code) || ['Tab','MetaLeft','MetaRight'].includes(event.code)) {
        this.setBindingCaptureNotice('이 키는 브라우저 기능과 충돌하여 지정할 수 없습니다.', true);
      } else this.finishBindingCapture(event.code);
    }, true);
    window.addEventListener('mousedown', event => {
      if (!this.bindingCaptureAction) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      this.finishBindingCapture(`Mouse${clamp(event.button, 0, 2)}`);
    }, true);
  }

  renderKeyBindingList() {
    if (!UI.keyBindingList) return;
    if (UI.healKeyLabel) UI.healKeyLabel.textContent = `회복키트 / ${bindingLabel(this.bindings.heal)}`;
    UI.keyBindingList.innerHTML = '';
    for (const [action, label] of BINDING_ACTIONS) {
      const row = document.createElement('div');
      row.className = 'key-binding-row';
      const title = document.createElement('span');
      title.textContent = label;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'binding-button';
      button.dataset.bindingAction = action;
      button.textContent = bindingLabel(this.bindings[action]);
      button.addEventListener('click', () => this.beginBindingCapture(action));
      row.append(title, button);
      UI.keyBindingList.appendChild(row);
    }
  }

  setBindingCaptureNotice(message, active = false) {
    if (!UI.bindingCaptureNotice) return;
    UI.bindingCaptureNotice.textContent = message;
    UI.bindingCaptureNotice.classList.toggle('active', active);
  }

  beginBindingCapture(action) {
    this.bindingCaptureAction = action;
    for (const button of UI.keyBindingList?.querySelectorAll?.('.binding-button') || []) {
      const selected = button.dataset.bindingAction === action;
      button.classList.toggle('capturing', selected);
      if (selected) button.textContent = '입력 대기...';
    }
    const label = BINDING_ACTIONS.find(([id]) => id === action)?.[1] || action;
    this.setBindingCaptureNotice(`${label}: 원하는 키 또는 마우스 버튼을 누르세요. ESC는 취소입니다.`, true);
  }

  cancelBindingCapture(message = '변경할 조작을 선택하세요.') {
    this.bindingCaptureAction = null;
    this.renderKeyBindingList();
    this.setBindingCaptureNotice(message, false);
  }

  finishBindingCapture(code) {
    const action = this.bindingCaptureAction;
    if (!action || !code) return;
    const previous = this.bindings[action];
    const conflict = BINDING_ACTIONS.find(([other]) => other !== action && this.bindings[other] === code)?.[0];
    this.bindings[action] = code;
    if (conflict) this.bindings[conflict] = previous;
    this.input.setBindings(this.bindings);
    this.saveInputPreferences();
    const actionName = BINDING_ACTIONS.find(([id]) => id === action)?.[1] || action;
    const note = conflict ? `${actionName} 키를 변경하고 중복 항목의 키를 서로 교환했습니다.` : `${actionName}: ${bindingLabel(code)}로 변경했습니다.`;
    this.cancelBindingCapture(note);
  }

  openControlsSettings(source = 'start') {
    this.controlsSettingsReturn = source === 'pause' || this.running ? 'pause' : 'start';
    if (this.running && !this.paused) this.pause();
    this.input.resetTransient();
    UI.start?.classList.remove('show');
    UI.pause?.classList.remove('show');
    UI.mobileSettings?.classList.remove('show');
    UI.controlsSettings?.classList.add('show');
    this.renderKeyBindingList();
    this.setBindingCaptureNotice('변경할 조작을 선택하세요.');
  }

  closeControlsSettings() {
    this.cancelBindingCapture();
    UI.controlsSettings?.classList.remove('show');
    if (this.controlsSettingsReturn === 'pause' && this.running) UI.pause?.classList.add('show');
    else UI.start?.classList.add('show');
  }

  requestReturnToMainMenu() {
    const t = now();
    if ((this.mainMenuConfirmUntil || 0) > t) {
      this.returnToMainMenu();
      return;
    }
    this.mainMenuConfirmUntil = t + 2.8;
    if (UI.mainMenuBtn) {
      UI.mainMenuBtn.textContent = '한 번 더 눌러 게임 종료';
      UI.mainMenuBtn.classList.add('confirming');
    }
    setTimeout(() => {
      if ((this.mainMenuConfirmUntil || 0) <= now() && UI.mainMenuBtn) {
        UI.mainMenuBtn.textContent = '게임 종료 후 메인으로';
        UI.mainMenuBtn.classList.remove('confirming');
      }
    }, 2900);
  }

  clearRunState() {
    this.connectionBlocked=false;this.serverSuspended=false;this.cleanupMissionTargets();
    UI.missionMarker?.classList.remove('show');UI.connectionOverlay?.classList.remove('show');
    if(this.viewWeapon)this.viewWeapon.visible=true;
  }

  resetToMainMenuState() {
    this.modeTransitioning = true;
    this.suppressAutoPauseUntil = now() + 1.0;
    this.running = false;
    this.paused = false;
    this.gameOver = false;
    this.rewardOpen = false;
    this.pendingReward = null;
    this.prepPhase = false;
    this.prepTimer = 0;
    this.spawnQueue = 0;
    this.spawnTimer = 0;
    this.waveBreak = 0;
    this.currentMission = null;
    this.missionCompletePending = false;
    this._startGuard = false;
    this.runEnded = true;
    this.audio.stopAll();
    this.clearRunState();
    this.input.resetTransient();
    this.mobile?.setGameplayActive(false);
    document.body.classList.remove('mobile-playing', 'mobile-layout-edit');
    try { if (document.pointerLockElement) document.exitPointerLock?.(); } catch (_) {}
    for (const panel of [UI.pause, UI.over, UI.reward, UI.mobileSettings, UI.controlsSettings, UI.soundSettings]) panel?.classList.remove('show');
    UI.loading?.classList.remove('show', 'leaving');
    UI.hud?.classList.add('hidden');
    UI.start?.classList.add('show');
    if (UI.mainMenuBtn) {
      UI.mainMenuBtn.textContent = '게임 종료 후 메인으로';
      UI.mainMenuBtn.classList.remove('confirming');
    }
    this.mainMenuConfirmUntil = 0;
    this.clock.getDelta();
    this.drawStartMapPreview();
    this.modeTransitioning = false;
    requestAnimationFrame(() => this.input.resetTransient());
  }

  returnToMainMenu() {
    if(this.lobby.mode==='coop'){this.net.leaveRoom();this.resetLobby();}
    this.resetToMainMenuState();this.setConnectionBlocked(false);
    try{document.fullscreenElement && document.exitFullscreen?.()?.catch?.(()=>{});}catch{}
  }

  setupRenderer() {
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false, depth: true });
    } catch (error) {
      this.showFatalError('이 PC에서 WebGL을 시작할 수 없습니다. 그래픽 드라이버를 업데이트하거나 Chrome/Edge의 하드웨어 가속을 켜 주세요.');
      throw error;
    }
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

  showFatalError(message) {
    UI.loading?.classList.remove('show', 'leaving');
    const box = document.createElement('div');
    box.className = 'fatal-error';
    box.innerHTML = `<b>게임을 시작하지 못했습니다</b><span>${message}</span>`;
    document.body.appendChild(box);
  }

  bindUI() {
    const unlockAudio = () => {
      if(this.audio.enabled && this.audio.ctx?.state==='running')return;
      this.audio.unlock().then(ok=>{if(ok && this.running){this.audio.startAmbience();this.audio.startBgm();}});
    };
    document.addEventListener('pointerdown',unlockAudio,{capture:true,passive:true});
    document.addEventListener('keydown',unlockAudio,{capture:true});
    document.addEventListener('visibilitychange',()=>{this.audio.setHidden(document.hidden);if(!document.hidden&&this.audio.ctx)unlockAudio();});
    this.audio.onStatus=()=>this.updateSoundStatus();
    for(const id of ['sound-settings-start','sound-settings-pause'])$(id)?.addEventListener('click',()=>this.openSoundSettings());
    $('sound-settings-close')?.addEventListener('click',()=>this.closeSoundSettings());
    $('sound-test')?.addEventListener('click',async()=>{if(await this.audio.unlock()){this.audio.test();this.updateSoundStatus('왼쪽 → 오른쪽 → 발사 → 금속 타격 순서입니다.');}});
    $('sound-reset')?.addEventListener('click',()=>{
      UI.masterVolume.value='100';UI.sfxVolume.value='85';UI.bgmVolume.value='65';UI.ambienceVolume.value='60';UI.soundMix.value='balanced';
      this.refreshVolumeLabels();this.syncSettingsFromMenu();this.savePreferences();this.updateSoundStatus('권장 음량으로 복원했습니다.');
    });
    UI.survivalModeBtn?.addEventListener('click', () => this.setMenuMode('survival'));

    UI.singleModeBtn?.addEventListener('click', () => { this.net.leaveRoom();this.resetLobby();this.setPlayMode('single'); });
    UI.coopModeBtn?.addEventListener('click', () => this.setPlayMode('coop'));
    UI.createRoomBtn?.addEventListener('click', () => this.createRoom());
    UI.joinRoomBtn?.addEventListener('click', () => this.joinRoom());
    UI.readyBtn?.addEventListener('click', () => this.toggleReady());
    UI.leaveRoomBtn?.addEventListener('click',()=>{this.net.leaveRoom();this.resetLobby();});
    UI.copyInviteBtn?.addEventListener('click',()=>this.copyInvite());
    UI.prepReady?.addEventListener('click',()=>this.readyForNextLevel());
    $('connection-leave')?.addEventListener('click',()=>this.returnToMainMenu());
    for(const select of [UI.map,UI.diff,UI.startWave])select?.addEventListener('change',()=>{this.renderLevelGuide();this.net.updateSettings(this.currentMenuSettings());});
    UI.roomCodeInput?.addEventListener('input', () => { UI.roomCodeInput.value = UI.roomCodeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); });
    this.setPlayMode('single');
    this.setupSettingsUI();
    UI.map?.addEventListener('change', () => { this.rememberSurvivalMapKey(UI.map.value); this.drawStartMapPreview(); });
    this.drawStartMapPreview();
    const beginFromMenu = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      this.runMode = 'survival';
      this.startFromMenu();
    };
    const bindSafeMenuTap = (button, handler) => {
      if (!button) return;
      let gesture = null;
      let suppressClick = false;
      const panel = button.closest('.panel');
      button.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') return;
        gesture = { id: e.pointerId, x: e.clientX, y: e.clientY, scrollTop: panel?.scrollTop || 0, dragged: false };
      }, { passive: true });
      window.addEventListener('pointermove', (e) => {
        if (!gesture || e.pointerId !== gesture.id) return;
        const moved = Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y);
        const scrolled = Math.abs((panel?.scrollTop || 0) - gesture.scrollTop);
        if (moved > 9 || scrolled > 2) gesture.dragged = true;
      }, { passive: true });
      const finish = (e) => {
        if (!gesture || e.pointerId !== gesture.id) return;
        const scrolled = Math.abs((panel?.scrollTop || 0) - gesture.scrollTop);
        suppressClick = gesture.dragged || scrolled > 2;
        gesture = null;
        if (suppressClick) setTimeout(() => { suppressClick = false; }, 450);
      };
      window.addEventListener('pointerup', finish, { passive: true });
      window.addEventListener('pointercancel', finish, { passive: true });
      button.addEventListener('click', (e) => {
        if (suppressClick) {
          e.preventDefault();
          e.stopPropagation();
          suppressClick = false;
          return;
        }
        handler(e);
      });
    };
    bindSafeMenuTap(UI.startBtn, beginFromMenu);
    const restartCurrentRun = (e) => {
      if(this.lobby.mode==='coop'){this.net.returnToLobby();return;}
      if (e) { e.preventDefault(); e.stopPropagation(); }
      this.runMode = 'survival';
      this.startFromMenu();
    };
    UI.restartBtn.addEventListener('pointerdown', restartCurrentRun, { passive: false });
    UI.restartBtn.addEventListener('click', restartCurrentRun);
    UI.resumeBtn.addEventListener('pointerdown', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      this.resumeFromPause();
    }, { passive: false });
    UI.resumeBtn.addEventListener('click', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      this.resumeFromPause();
    });
    UI.mainMenuBtn?.addEventListener('click', () => this.requestReturnToMainMenu());
    UI.gameOverMainBtn?.addEventListener('click', () => this.returnToMainMenu());
    UI.rewardExtract?.addEventListener('click', () => this.completeRun('extracted'));
    UI.saveExport?.addEventListener('click', () => this.exportSaveData());
    UI.saveImport?.addEventListener('click', () => UI.saveImportFile?.click());
    UI.saveImportFile?.addEventListener('change', event => this.importSaveData(event.target.files?.[0]));
    for (const button of [UI.fullscreenStart, UI.fullscreenPause, UI.fullscreenControls, UI.fullscreenMobile]) {
      button?.addEventListener('click', () => this.toggleFullscreen());
    }
    document.addEventListener('fullscreenchange', () => this.syncFullscreenButtons());
    this.syncFullscreenButtons();
    UI.rewardSkip?.addEventListener('pointerdown', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      this.chooseReward(null);
    }, { passive: false });
    UI.rewardSkip?.addEventListener('click', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      this.chooseReward(null);
    });
    UI.rewardConfirm?.addEventListener('pointerdown', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      this.confirmRewardSelection();
    }, { passive: false });
    UI.rewardConfirm?.addEventListener('click', (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      this.confirmRewardSelection();
    });
    document.addEventListener('keydown', (e) => {
      if(UI.soundSettings?.classList.contains('show') && e.code==='Escape'){e.preventDefault();this.closeSoundSettings();return;}
      if (UI.controlsSettings?.classList.contains('show') && e.code === 'Escape') {
        e.preventDefault();
        this.closeControlsSettings();
        return;
      }
      if (UI.mobileSettings?.classList.contains('show') && e.code === 'Escape') {
        e.preventDefault();
        this.mobile?.closeSettings();
        return;
      }
      if (UI.start.classList.contains('show') && !/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target?.tagName || '') && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        { this.runMode = 'survival'; this.startFromMenu(); }
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
      if (this.modeTransitioning || now() < (this.suppressAutoPauseUntil || 0)) return;
      if (!this.running || this.gameOver || this.paused || this.rewardOpen || this.input.locked || this.isTouchInputActive()) return;
      this.pause();
    });
  }

  setupSettingsUI() {
    this.loadPreferences();
    const setLabel = (el, val) => { if (el) el.textContent = `${Math.round(clamp(Number(val) || 0, 0, 100))}%`; };
    if (UI.pauseQuality) UI.pauseQuality.value = UI.quality?.value || 'mid';
    setLabel(UI.masterVolumeLabel, UI.masterVolume?.value || 100);
    setLabel(UI.sfxVolumeLabel, UI.sfxVolume?.value || 100);
    setLabel(UI.bgmVolumeLabel, UI.bgmVolume?.value || 100);
    setLabel(UI.ambienceVolumeLabel,UI.ambienceVolume?.value ?? 60);
    UI.pauseQuality?.addEventListener('change', () => {
      if (UI.quality) UI.quality.value = UI.pauseQuality.value;
      this.applyRuntimeQuality();
      this.savePreferences();
      this.showToast(`그래픽: ${this.quality.label}`);
    });
    UI.quality?.addEventListener('change', () => {
      if (UI.pauseQuality) UI.pauseQuality.value = UI.quality.value;
      this.applyRuntimeQuality();
      this.savePreferences();
    });
    const volumeHandler = () => {
      setLabel(UI.masterVolumeLabel, UI.masterVolume?.value || 0);
      setLabel(UI.sfxVolumeLabel, UI.sfxVolume?.value || 0);
      setLabel(UI.bgmVolumeLabel, UI.bgmVolume?.value || 0);
      setLabel(UI.ambienceVolumeLabel,UI.ambienceVolume?.value ?? 0);
      this.syncSettingsFromMenu();
      this.savePreferences();
    };
    UI.masterVolume?.addEventListener('input', volumeHandler);
    UI.sfxVolume?.addEventListener('input', volumeHandler);
    UI.bgmVolume?.addEventListener('input', volumeHandler);
    UI.ambienceVolume?.addEventListener('input',volumeHandler);
    UI.soundMix?.addEventListener('change',volumeHandler);
    const accessibilityHandler = () => {
      const fov = Number(UI.pauseFov?.value || UI.startFov?.value || this.accessibility.fov || 72);
      const motion = UI.pauseCameraMotion?.value || UI.startCameraMotion?.value || 'full';
      this.accessibility.fov = clamp(fov, 60, 100);
      this.accessibility.cameraMotion = ['full','reduced','off'].includes(motion) ? motion : 'full';
      this.accessibility.flicker = (UI.pauseFlicker?.value || 'on') !== 'off';
      this.accessibility.highContrast = (UI.pauseHighContrast?.value || 'off') === 'on';
      this.applyAccessibilitySettings();
      this.savePreferences();
    };
    for (const range of [UI.startFov, UI.pauseFov]) range?.addEventListener('input', () => {
      if (UI.startFov && range !== UI.startFov) UI.startFov.value = range.value;
      if (UI.pauseFov && range !== UI.pauseFov) UI.pauseFov.value = range.value;
      accessibilityHandler();
    });
    for (const select of [UI.startCameraMotion, UI.pauseCameraMotion]) select?.addEventListener('change', () => {
      if (UI.startCameraMotion && select !== UI.startCameraMotion) UI.startCameraMotion.value = select.value;
      if (UI.pauseCameraMotion && select !== UI.pauseCameraMotion) UI.pauseCameraMotion.value = select.value;
      accessibilityHandler();
    });
    UI.pauseFlicker?.addEventListener('change', accessibilityHandler);
    UI.pauseHighContrast?.addEventListener('change', accessibilityHandler);
    volumeHandler();
    this.syncAccessibilityUI();
    this.applyAccessibilitySettings();
    this.updateCareerSummary();
    this.applyRuntimeQuality();
    this.setupInputSettingsUI();
  }

  syncFullscreenButtons() {
    const label = document.fullscreenElement ? '전체화면 종료' : '전체화면 전환';
    for (const button of [UI.fullscreenStart, UI.fullscreenPause, UI.fullscreenControls, UI.fullscreenMobile]) {
      if (button) button.textContent = label;
    }
  }

  async toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen?.();
      else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        this.mobile?.requestLandscape();
      } else {
        this.showToast('이 브라우저는 전체화면 전환을 지원하지 않습니다.');
      }
    } catch (_) {
      this.showToast('브라우저에서 전체화면 요청을 허용하지 않았습니다.');
    }
    this.syncFullscreenButtons();
  }

  loadPreferences() {
    try {
      const saved = JSON.parse(localStorage.getItem('bhfps_settings_v37') || '{}');
      this.savedQualityPreference = ['auto','ultra','low','mid','high'].includes(saved.quality) ? saved.quality : 'auto';
      if (UI.quality && ['auto','ultra','low','mid','high'].includes(saved.quality)) UI.quality.value = saved.quality;
      if (UI.masterVolume && Number.isFinite(saved.master)) UI.masterVolume.value = String(clamp(saved.master, 0, 100));
      if (UI.sfxVolume && Number.isFinite(saved.sfx)) UI.sfxVolume.value = String(clamp(saved.sfx, 0, 100));
      if (UI.bgmVolume && Number.isFinite(saved.bgm)) UI.bgmVolume.value = String(clamp(saved.bgm, 0, 100));
      if(UI.ambienceVolume && Number.isFinite(saved.ambience ?? saved.bgm))UI.ambienceVolume.value=String(clamp(saved.ambience ?? saved.bgm,0,100));
      if(UI.soundMix && ['balanced','headphones','night'].includes(saved.soundMix))UI.soundMix.value=saved.soundMix;
      this.accessibility.fov = clamp(Number(saved.fov) || this.accessibility.fov || 72, 60, 100);
      this.accessibility.cameraMotion = ['full','reduced','off'].includes(saved.cameraMotion) ? saved.cameraMotion : this.accessibility.cameraMotion;
      this.accessibility.flicker = typeof saved.flicker === 'boolean' ? saved.flicker : this.accessibility.flicker;
      this.accessibility.highContrast = !!saved.highContrast;
    } catch (_) {}
  }

  savePreferences() {
    try {
      localStorage.setItem('bhfps_settings_v37', JSON.stringify({
        quality: UI.quality?.value || 'auto',
        master: Number(UI.masterVolume?.value ?? 100),
        sfx: Number(UI.sfxVolume?.value ?? 100),
        bgm: Number(UI.bgmVolume?.value ?? 100),
        ambience:Number(UI.ambienceVolume?.value ?? 60),soundMix:UI.soundMix?.value || 'balanced',
        fov: this.accessibility.fov,
        cameraMotion: this.accessibility.cameraMotion,
        flicker: this.accessibility.flicker,
        highContrast: this.accessibility.highContrast
      }));
    } catch (_) {}
  }

  syncSettingsFromMenu() {
    this.audio.setVolumes({
      master: (Number(UI.masterVolume?.value ?? 100) || 0) / 100,
      sfx: (Number(UI.sfxVolume?.value ?? 100) || 0) / 100,
      bgm: (Number(UI.bgmVolume?.value ?? 65) || 0) / 100,
      ambience:(Number(UI.ambienceVolume?.value ?? 60) || 0)/100
    });
    this.audio.setMix(UI.soundMix?.value || 'balanced');
  }

  refreshVolumeLabels() {
    for(const [range,label] of [[UI.masterVolume,UI.masterVolumeLabel],[UI.sfxVolume,UI.sfxVolumeLabel],[UI.bgmVolume,UI.bgmVolumeLabel],[UI.ambienceVolume,UI.ambienceVolumeLabel]])if(label)label.textContent=`${range.value}%`;
  }
  updateSoundStatus(message='') {
    if(!UI.soundStatus)return;
    UI.soundStatus.textContent=this.audio.volumes.master===0?'전체 음량이 0%입니다. 음량을 올려주세요.':!this.audio.enabled?'소리 확인 버튼을 눌러 소리를 켜주세요.':message || (this.audio.volumes.sfx===0?'효과음이 0%입니다. 음악·환경음은 별도로 재생됩니다.':'소리 켜짐 · 이어폰에서는 좌우 방향을 더 쉽게 구분할 수 있습니다.');
    UI.soundStatus.dataset.state=this.audio.enabled?'ready':'waiting';
  }
  openSoundSettings() {
    this.soundSettingsReturn=this.running?'pause':'start';
    if(this.running&&!this.paused)this.pause();
    UI.start.classList.remove('show');UI.pause.classList.remove('show');UI.soundSettings.classList.add('show');
    this.refreshVolumeLabels();this.audio.unlock();this.updateSoundStatus();
  }
  closeSoundSettings() {
    UI.soundSettings.classList.remove('show');
    if(this.running)UI.pause.classList.add('show');else if(!this.gameOver)UI.start.classList.add('show');
  }

  syncAccessibilityUI() {
    const fov = String(Math.round(this.accessibility.fov || 72));
    for (const range of [UI.startFov, UI.pauseFov]) if (range) range.value = fov;
    for (const label of [UI.startFovLabel, UI.pauseFovLabel]) if (label) label.textContent = `${fov}°`;
    for (const select of [UI.startCameraMotion, UI.pauseCameraMotion]) if (select) select.value = this.accessibility.cameraMotion || 'full';
    if (UI.pauseFlicker) UI.pauseFlicker.value = this.accessibility.flicker ? 'on' : 'off';
    if (UI.pauseHighContrast) UI.pauseHighContrast.value = this.accessibility.highContrast ? 'on' : 'off';
  }

  applyAccessibilitySettings() {
    this.syncAccessibilityUI();
    this.baseFov = clamp(Number(this.accessibility.fov) || 72, 60, 100);
    if (this.adsFov) this.adsFov = clamp(this.baseFov - 16, 42, 72);
    document.body.classList.toggle('high-contrast', !!this.accessibility.highContrast);
    document.body.dataset.cameraMotion = this.accessibility.cameraMotion || 'full';
    if (!this.accessibility.flicker) {
      for (const f of this.flickerLights || []) f.light.intensity = f.base;
    }
  }

  applyRuntimeQuality() {
    const selected = UI.quality?.value || UI.pauseQuality?.value || 'auto';
    const key = selected === 'auto' ? this.detectedQualityKey : selected;
    const previous = this.effectiveQualityKey;
    this.effectiveQualityKey = QUALITY[key] ? key : 'mid';
    this.quality = QUALITY[this.effectiveQualityKey];
    if (previous !== this.effectiveQualityKey || !this.dynamicPixelRatio) this.dynamicPixelRatio = this.quality.pixelRatio;
    document.body.dataset.quality = this.effectiveQualityKey;
    if (this.scene?.fog) if(this.scene.fog)this.scene.fog.far = this.quality.fogFar;
    if (this.renderer) {
      this.renderer.shadowMap.enabled = !!this.quality.shadows;
      this.renderer.sortObjects = !this.quality.simpleModels;
      this.scene?.traverse?.(obj => {
        if (obj.isMesh) {
          obj.castShadow = !!this.quality.shadows && !!obj.userData?.shadowCast;
          obj.receiveShadow = !!this.quality.shadows && !!obj.userData?.shadowReceive;
        }
        if (obj.isDirectionalLight) obj.castShadow = !!this.quality.shadows;
      });
      for (let i = 0; i < (this.flickerLights?.length || 0); i++) {
        this.flickerLights[i].light.visible = i < this.quality.lightCount;
      }
      if (this.running && previous && previous !== this.effectiveQualityKey && this.materials && this.map) {
        this.refreshQualityVisuals(previous, this.effectiveQualityKey);
      }
      this.syncBaseLightingForQuality();
      this.resize();
    }
    const autoText = selected === 'auto' ? '자동 감지 · ' : '';
    if (UI.detectedQuality) UI.detectedQuality.textContent = `${autoText}${this.quality.label} 모드 적용`;
    if (UI.qualityDescription) {
      UI.qualityDescription.textContent = this.quality.simpleModels
        ? '초저사양 전용: 적 1블록 모델 · 장식/파티클/미니맵 제거 · 30~44% 동적 내부 해상도 · 최대 24마리'
        : describeHardware(this.effectiveQualityKey);
    }
    if (UI.qualityText) UI.qualityText.textContent = `${selected === 'auto' ? 'AUTO ' : ''}${this.quality.label} · ${Math.round(this.dynamicPixelRatio * 100)}%`;
  }

  syncBaseLightingForQuality() {
    if (!this.scene) return;
    const simple = !!this.quality?.simpleModels;
    this.scene.traverse(obj => {
      if (obj.isAmbientLight) {
        obj.visible = true;
        obj.intensity = simple ? 1.02 : (obj.userData.baseIntensity ?? .44);
      } else if (obj.isHemisphereLight || obj.isDirectionalLight) {
        obj.visible = !simple;
        if (!simple && obj.userData.baseIntensity !== undefined) obj.intensity = obj.userData.baseIntensity;
      }
    });
  }

  rebuildObstacleDecorations() {
    for (const o of this.obstacles || []) {
      for (const extra of o.extras || []) if (extra?.parent) extra.parent.remove(extra);
      if (o.crackGroup?.parent) o.crackGroup.parent.remove(o.crackGroup);
      o.extras = [];
      o.crackGroup = null;
      o.crackLevel = 0;
      if (this.quality?.simpleModels || !o.alive) continue;
      if (o.kind !== 'outer') {
        const edge = new THREE.LineSegments(this.getEdgeGeometry(this.geos.wall), this.materials.lineOutline);
        edge.position.copy(o.mesh.position);
        edge.scale.copy(o.mesh.scale);
        this.scene.add(edge);
        o.extras.push(edge);
      }
      if (o.kind !== 'fakeWall' && (o.kind !== 'outer' || Math.max(o.w, o.d) > 6)) {
        const bottom = new THREE.Mesh(this.geos.lowBox, this.materials.trim);
        bottom.position.set(o.x, .16, o.z);
        bottom.scale.set(o.w + .025, .10, o.d + .025);
        this.scene.add(bottom);
        o.extras.push(bottom);
        const mid = new THREE.Mesh(this.geos.lowBox, this.materials.wallPanel);
        mid.position.set(o.x, 2.05, o.z);
        mid.scale.set(o.w + .018, .035, o.d + .018);
        this.scene.add(mid);
        o.extras.push(mid);
      }
    }
  }

  refreshQualityVisuals(previousKey, nextKey) {
    const wasSimple = !!QUALITY[previousKey]?.simpleModels;
    const simple = !!QUALITY[nextKey]?.simpleModels;
    if (wasSimple === simple) return;

    if (this.backroomsDetailGroup?.parent) this.backroomsDetailGroup.parent.remove(this.backroomsDetailGroup);
    this.backroomsDetailGroup = null;
    this.flickerLights = [];
    if (!simple) this.addBackroomsDetails();
    this.rebuildObstacleDecorations();

    for (const e of this.enemies || []) {
      if (!e.alive) continue;
      const old = e.mesh;
      const mesh = this.createBoxheadModel(e.type);
      mesh.position.set(e.x, 0, e.z);
      mesh.rotation.y = old?.rotation?.y || 0;
      if (old?.parent) old.parent.remove(old);
      this.scene.add(mesh);
      e.mesh = mesh;
    }
    for (const p of this.pickups || []) {
      if (!p.alive) continue;
      const old = p.mesh;
      const mesh = this.createItemBoxModel(p.kind);
      mesh.position.set(p.x, 0, p.z);
      mesh.rotation.y = old?.rotation?.y || 0;
      if (old?.parent) old.parent.remove(old);
      this.scene.add(mesh);
      p.mesh = mesh;
    }
    for (const b of this.placeables || []) {
      if (!b.alive || b.kind !== 'barrel') continue;
      const old = b.mesh;
      const mesh = this.createMineModel();
      mesh.position.set(b.x, 0, b.z);
      mesh.rotation.y = old?.rotation?.y || 0;
      if (old?.parent) old.parent.remove(old);
      this.scene.add(mesh);
      b.mesh = mesh;
    }
    this.objectiveCores = (this.objectiveCores || []).map((c, i) => {
      if (!c.alive) return c;
      const hp = c.hp, maxHp = c.maxHp, phase = c.phase;
      if (c.mesh?.parent) c.mesh.parent.remove(c.mesh);
      const next = this.createObjectiveCore(c.x, c.z, i);
      next.hp = hp;
      next.maxHp = maxHp;
      next.phase = phase;
      next.serverId=c.serverId;return next;
    });
    this.buildViewWeapon();

    if (simple) {
      for (const f of this.fx || []) if (f.mesh?.parent) f.mesh.parent.remove(f.mesh);
      this.fx = [];
    }
  }

  resumeFromPause() {
    if (!this.running || this.gameOver) return;
    this.audio.unlock();
    this.syncSettingsFromMenu();
    this.applyRuntimeQuality();
    this.paused = false;
    UI.pause.classList.remove('show');
    this.setInputMode(this.inputMode, false);
    if (this.isTouchInputActive()) {
      this.mobile.requestLandscape();
      this.mobile.setGameplayActive(true);
    } else {
      this.mobile?.requestLandscape();
      this.input.requestLock();
    }
  }

  startFromMenu(fromNetwork=false) {
    if(this._startGuard || this.modeTransitioning)return;
    if(!fromNetwork && this.lobby.mode==='coop'){
      if(!this.canStartCoop()){this.updateLobbyUI('친구가 입장한 뒤 두 사람 모두 준비해야 시작할 수 있습니다.');return;}
      this.net.startGame(this.currentMenuSettings());return;
    }
    this._startGuard=true;this.start();setTimeout(()=>this._startGuard=false,260);
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
    const q = this.quality || QUALITY.mid;
    const pr = Math.min(window.devicePixelRatio || 1, this.dynamicPixelRatio || q.pixelRatio);
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  start() {
    if (this.modeTransitioning) return;
    this.suppressAutoPauseUntil = now() + .75;
    this.clearRunState(true);
    this.input.resetTransient();
    this.audio.stopAll();this.audio.setBedPaused(false);this.audio.unlock();
    this.syncSettingsFromMenu();
    this.applyRuntimeQuality();
    this.resize();
    this.running = true;
    this.paused = false;
    this.gameOver = false;
    this.playMode = this.lobby.mode;
    this.runMode = ('survival');

    this.audio.startAmbience();
    this.audio.startBgm();
    const selectedSurvivalMap = SURVIVAL_MAP_KEYS.includes(UI.map?.value) ? UI.map.value : (SURVIVAL_MAP_KEYS.includes(this.survivalMapKey) ? this.survivalMapKey : 'box');
    this.mapKey = selectedSurvivalMap;
    this.audio.setEnvironment(this.mapKey);this.audioProgress=null;this.audioPrepSecond=null;
    this.map = MAPS[this.mapKey] || MAPS.box;
    this.rememberSurvivalMapKey(this.mapKey);
    this.diff = DIFFICULTY[UI.diff.value] || DIFFICULTY.normal;
    this.quality = QUALITY[this.effectiveQualityKey] || QUALITY.mid;
    this.startWave = (clamp(parseInt(UI.startWave?.value || '1', 10) || 1, 1, 99));
    this.scene.fog.far = this.quality.fogFar;
    UI.start.classList.remove('show');
    
    UI.over.classList.remove('show');
    UI.pause.classList.remove('show');
    UI.reward?.classList.remove('show');
    UI.hud.classList.remove('hidden');
    this.runStartTime = now();
    this.resetWorld();
    this.setInputMode(this.inputMode, false);
    if (this.isTouchInputActive()) {
      this.mobile.requestLandscape();
      this.mobile.setGameplayActive(true);
    } else {
      this.mobile?.requestLandscape();
      this.input.requestLock();
    }
    this.showToast((`${this.map.label} / Wave ${this.wave} 시작`));
  }

  pause() {
    if (!this.running || this.gameOver || this.paused) return;
    this.paused = true;this.input.resetTransient();this.net.sendInput(true);
    if (UI.pauseQuality && UI.quality) UI.pauseQuality.value = UI.quality.value;
    this.syncSettingsFromMenu();
    try { if (document.pointerLockElement === canvas) document.exitPointerLock?.(); } catch (_) {}
    this.mobile?.setGameplayActive(false);
    UI.pause.classList.add('show');
  }

  resetWorld() {
    this.disposeWorld();
    while (this.scene.children.length) this.scene.remove(this.scene.children[0]);
    this.renderer.shadowMap.enabled = !!this.quality.shadows;
    this.currentMapTheme = ({
      lane:{bg:0x10151a,fog:0x23303a,floor:0x46515c,wall:0x788b99,ceiling:0x536572,hemiSky:0xcfe5ff,hemiGround:0x192734,lightPanel:0xc6e5ff},
      castle:{bg:0x1c120e,fog:0x34231b,floor:0x705847,wall:0xa78868,ceiling:0x6e5540,hemiSky:0xffddba,lightPanel:0xffd6a1},
      maze:{bg:0x17160d,fog:0x302d1b,floor:0x6e674c,wall:0xb4ad76,ceiling:0x858060},
      abyss:{bg:0x120e20,fog:0x251d39,floor:0x40394f,wall:0x78648f,ceiling:0x574767,hemiSky:0xe3c6ff,hemiGround:0x1b102c,lightPanel:0xdcc5ff}
    })[this.mapKey] || null;
    const theme = this.currentMapTheme || {};
    this.scene.background = new THREE.Color(theme.bg ?? 0x16130b);
    this.scene.fog = new THREE.Fog(theme.fog ?? 0x2a2517, 14, this.quality.fogFar);
    this.flickerLights = [];

    const hemi = new THREE.HemisphereLight(theme.hemiSky ?? 0xffedb0, theme.hemiGround ?? 0x4a3b20, theme.hemiIntensity ?? .72);
    hemi.userData.baseIntensity = theme.hemiIntensity ?? .72;
    this.scene.add(hemi);
    const ambient = new THREE.AmbientLight(theme.hemiSky ?? 0xffedb0, theme.ambient ?? .44);
    ambient.userData.baseIntensity = theme.ambient ?? .44;
    this.scene.add(ambient);
    const dir = new THREE.DirectionalLight(theme.dir ?? 0xffe39a, theme.dirIntensity ?? .56);
    dir.userData.baseIntensity = theme.dirIntensity ?? .56;
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
    this.syncBaseLightingForQuality();
    this.scene.add(this.camera);

    this.materials = {
      floor: new THREE.MeshLambertMaterial({ color: theme.floor ?? COLORS.floor }),
      wall: new THREE.MeshLambertMaterial({ color: theme.wall ?? COLORS.wall, flatShading: true }),
      ceiling: new THREE.MeshLambertMaterial({ color: theme.ceiling ?? COLORS.ceiling, side: THREE.DoubleSide }),
      wallPanel: new THREE.MeshLambertMaterial({ color: theme.panel ?? COLORS.wallPanel, flatShading: true }),
      trim: new THREE.MeshLambertMaterial({ color: theme.trim ?? COLORS.trim }),
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
      casterOrb: new THREE.MeshBasicMaterial({ color: COLORS.casterOrb }),
      casterCore: new THREE.MeshBasicMaterial({ color: COLORS.casterCore }),
      casterShell: new THREE.MeshBasicMaterial({ color: COLORS.casterOrb, transparent: true, opacity: .68, wireframe: true }),
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
      lightPanel: new THREE.MeshBasicMaterial({ color: theme.lightPanel ?? COLORS.lightPanel }),
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
    this.navGrids = new Map();
    this.flowField = null;
    this.flowFields = new Map();
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
    floor.userData.shadowReceive = true;
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
      stamina: 100, maxStamina: 100, staminaRegen: 10, staminaDrain: 40, staminaLocked: false
    };
    this.build = GAME_BUILD;
    this.yaw = Math.PI; this.pitch = 0; this.moveIntensity = 0; this.bobPhase = 0; this.jumpHeld = false; this.weaponKick = 0; this.playerStepCd = 0;
    this.ads = 0; this.adsTarget = 0; this.baseFov = clamp(Number(this.accessibility?.fov) || 72, 60, 100); this.adsFov = clamp(this.baseFov - 16, 42, 72);
    this.upgrades = {
      damage: 1, headshot: 1, speed: 0, wallHp: 1, ammoGain: 1, medkitMax: 0, staminaRegen: 0, reload: 1,
      shotgunBreach: false, railOvercharge: false, rocketPayload: false
    };
    this.hp = 100; this.maxHp = 100; this.downed = false; this._downToastShown = false;
    this.medkits = 25; this.maxMedkits = 100;
    this.assistHold = 0; this.assistTargetId = null; this.assistSent = false; this.eSelfConsumed = false;
    this.missionsCleared=0;this.bonusesCleared=0;this.missionState=null;
    this.wave = (this.startWave || 1) - 1; this.score = 0; this.kills = 0; this.headshots = 0; this.rewardsTaken = 0;
    this.rankedRun = (this.startWave || 1) === 1;
    this.runEnded = false;
    this.runOutcome = 'defeated';
    this.rewardStacks = {};
    this.lastRewardOfferIds = [];
    this.elitePending = false;
    this.rewardOpen = false; this.prepTimer = 0; this.prepPhase = false;
    this.waveBreak = 0; this.spawnQueue = 0; this.spawnTimer = 0;
    this.currentMission = null; this.missionTimer = 0; this.missionCompletePending = false; this.objectiveCores = [];

    this.enemies = []; this.projectiles = []; this.pickups = []; this.fx = []; this.placeables = [];
    this.serverEnemyAuthority = this.lobby.mode==='coop'; this._serverEnemyAuthorityStarted = false;
    this.networkItems=new Map();this.networkProjectiles=new Map();this.networkPlaceables=new Map();this.serverRewardMode=false;this.serverRewardChosen=false;this.lastServerRewardWave=null;this.serverExtractRequested=false;this._serverPositionSeen=false;
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
    
    // 흩뿌리지 않아 공간 연출과 임무 동선이 소품에 가려지지 않게 한다.
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
    mesh.userData.shadowCast = !!cast;
    mesh.userData.shadowReceive = !!receive;
    mesh.castShadow = !!this.quality.shadows && cast;
    mesh.receiveShadow = !!this.quality.shadows && receive;
    return mesh;
  }

  addBackroomsDetails() {
    if (this.quality?.simpleModels) {
      this.backroomsDetailGroup = null;
      return;
    }
    const theme = this.currentMapTheme || {};
    const s = this.map.size / 2;
    const floorMat = new THREE.LineBasicMaterial({ color: theme.lineFloor ?? 0x191710, transparent: true, opacity: .30 });
    const ceilMat = new THREE.LineBasicMaterial({ color: theme.lineCeil ?? 0x2c2a1f, transparent: true, opacity: .28 });
    const group = new THREE.Group();

    // 낡은 카펫과 천장 타일 라인. 텍스처 없이 선만 써서 가볍게 Backrooms 분위기를 낸다.
    const detailStep = theme.detailStep || this.quality.detailStep || 4;
    for (let i = -s; i <= s; i += detailStep) {
      const fa = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-s, .014, i), new THREE.Vector3(s, .014, i)]);
      const fb = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i, .014, -s), new THREE.Vector3(i, .014, s)]);
      group.add(new THREE.Line(fa, floorMat)); group.add(new THREE.Line(fb, floorMat));
      const ca = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-s, WORLD.CEILING_HEIGHT - .012, i), new THREE.Vector3(s, WORLD.CEILING_HEIGHT - .012, i)]);
      const cb = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i, WORLD.CEILING_HEIGHT - .012, -s), new THREE.Vector3(i, WORLD.CEILING_HEIGHT - .012, s)]);
      group.add(new THREE.Line(ca, ceilMat)); group.add(new THREE.Line(cb, ceilMat));
    }
    this.scene.add(group);
    this.backroomsDetailGroup = group;

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
      group.add(panel);
      const light = new THREE.PointLight(i % 5 === 0 ? (theme.flickerTint ?? 0xd8ffe0) : (theme.lightPanel ?? 0xffefb0), i < 3 ? 1.55 : .92, 24, 1.55);
      light.position.set(p.x, WORLD.CEILING_HEIGHT - .55, p.z);
      light.castShadow = false;
      group.add(light);
      this.flickerLights.push({ light, base: light.intensity, phase: Math.random() * Math.PI * 2, speed: rand(.75, 1.9), broken: Math.random() < .20 });
    }

    // 공포 분위기용 어두운 얼룩/축축한 자국. 전부 납작한 박스라 렉 부담이 작다.
    const stainMat = new THREE.MeshBasicMaterial({ color: theme.stain ?? 0x16130b, transparent: true, opacity: .22, depthWrite: false });
    const redStainMat = new THREE.MeshBasicMaterial({ color: theme.redStain ?? 0x4b0707, transparent: true, opacity: .18, depthWrite: false });
    const stainGeo = new THREE.BoxGeometry(1, .018, 1);
    const defaultStains = Math.max(4, Math.floor(this.map.size / 4));
    
    const stainCount = Math.min(this.quality.stainCount ?? 20, (defaultStains));
    for (let i = 0; i < stainCount; i++) {
      let x = rand(-s + 5, s - 5), z = rand(-s + 5, s - 5);
      for (let tries = 0; tries < 8 && this.collides(x, z, 1.3); tries++) { x = rand(-s + 5, s - 5); z = rand(-s + 5, s - 5); }
      if (this.collides(x, z, 1.3)) continue;
      const m = new THREE.Mesh(stainGeo, Math.random() < .18 ? redStainMat : stainMat);
      m.position.set(x, .032, z);
      m.rotation.y = Math.random() * Math.PI;
      m.scale.set(rand(1.2, 4.8), 1, rand(.55, 2.2));
      group.add(m);
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
    return this.findDeterministicSafePoint(WORLD.PLAYER_RADIUS + .35, { originX: x, originZ: z }) || { x, z };
  }

  findDeterministicSafePoint(radius = 1.0, options = {}) {
    const half = this.map.size / 2 - Math.max(2.2, radius + 1.2);
    const step = this.map?.navCell || 1.25;
    const originX = Number.isFinite(options.originX) ? options.originX : 0;
    const originZ = Number.isFinite(options.originZ) ? options.originZ : 0;
    const player = this.player;
    let best = null, bestScore = -Infinity;
    for (let z = -half + step * .5; z <= half; z += step) {
      for (let x = -half + step * .5; x <= half; x += step) {
        const blocked = options.rectW && options.rectD
          ? this.rectCollides(x, z, options.rectW, options.rectD, options.pad || .2)
          : this.collides(x, z, radius);
        if (blocked) continue;
        const playerDistance = player ? Math.hypot(x - player.x, z - player.z) : Infinity;
        if (player && playerDistance < (options.minPlayerDistance || 0)) continue;
        let nearCore = false;
        for (const c of this.objectiveCores || []) {
          if (c.alive && Math.hypot(x - c.x, z - c.z) < (options.minCoreDistance || 0)) { nearCore = true; break; }
        }
        if (nearCore) continue;
        if (options.requireRoute && player && !this.hasNavRouteToPlayer(x, z, Math.max(.62, radius))) continue;
        const originDistance = Math.hypot(x - originX, z - originZ);
        const score = options.preferFar && player ? playerDistance - originDistance * .015 : -originDistance;
        if (score > bestScore) { bestScore = score; best = { x, z }; }
      }
    }
    return best;
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
    if (!this.quality?.simpleModels && kind !== 'outer') {
      const edge = new THREE.LineSegments(this.getEdgeGeometry(this.geos.wall), this.materials.lineOutline);
      edge.position.copy(mesh.position); edge.scale.copy(mesh.scale);
      this.scene.add(edge); extras.push(edge);
    }

    // 맵 기본 벽에는 백룸 몰딩을 넣고, 설치 벽은 가볍게 유지한다.
    if (!this.quality?.simpleModels && kind !== 'fakeWall' && (kind !== 'outer' || Math.max(w, d) > 6)) {
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
    // 소수의 동적 충돌체만 직접 확인한다.
    for (const o of this.obstacles || []) {
      continue;
      const reach = radius + Math.max(o.w || 0, o.d || 0) * .55 + 1.2;
      if (Math.abs(x - o.x) <= reach && Math.abs(z - o.z) <= reach) { seen.add(o); out.push(o); }
    }
    return out.length ? out : [];
  }

  rayObstacleCandidates(sx, sz, dir, maxT) {
    // 적 AI/총알/균열술사 시야 체크가 모든 벽을 매번 훑지 않도록,
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
    if (this.quality?.simpleModels) return;
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
    if (this.quality?.simpleModels && type !== 'player') return this.createUltraEnemyModel(type);
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
      // 균열술사: 오염된 보라색 방호복과 청록 균열광. 원거리 역할이 한눈에 보인다.
      this.addPart(g, this.geos.charTorso, this.materials.devilRed, 0, .82, 0, 1.12, 1.08, 1.08);
      this.addPart(g, this.geos.charHead, this.materials.devilRed, 0, 1.62, 0, 1.03, 1.03, 1.03);
      this.addPart(g, this.geos.facePanel, this.materials.devilDark, 0, 1.65, .375, .72, .26, 1);
      this.addPart(g, this.geos.lowBox, this.materials.devilEye, -.18, 1.68, .392, .13, .055, .025);
      this.addPart(g, this.geos.lowBox, this.materials.devilEye, .18, 1.68, .392, .13, .055, .025);
      this.addPart(g, this.geos.lowBox, this.materials.devilDark, 0, .98, .56, .72, .10, .055);
      this.addPart(g, this.geos.horn, this.materials.casterCore, -.42, 2.03, .01, 1, 1.05, 1, 0, 0, -.45);
      this.addPart(g, this.geos.horn, this.materials.casterCore, .42, 2.03, .01, 1, 1.05, 1, 0, 0, .45);
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

  createUltraEnemyModel(type = 'zombie') {
    if (!this.ultraEnemyGeometries) this.ultraEnemyGeometries = new Map();
    if (!this.ultraEnemyMaterials) {
      this.ultraEnemyMaterials = {
        zombie: new THREE.MeshBasicMaterial({ color: 0xd8d3bc }),
        runner: new THREE.MeshBasicMaterial({ color: 0x24b9d8 }),
        devil: new THREE.MeshBasicMaterial({ color: COLORS.devil }),
        tank: new THREE.MeshBasicMaterial({ color: 0x565e69 }),
        bomber: new THREE.MeshBasicMaterial({ color: 0xf0a229 }),
        shield: new THREE.MeshBasicMaterial({ color: 0x8dbbdc })
      };
    }
    const dims = {
      zombie: [.82, 1.78, .66], runner: [.66, 1.70, .58], devil: [.90, 1.92, .74],
      tank: [1.12, 2.05, .88], bomber: [.78, 1.72, .64], shield: [.96, 1.84, .74]
    }[type] || [.82, 1.78, .66];
    if (!this.ultraEnemyGeometries.has(type)) {
      const geo = new THREE.BoxGeometry(dims[0], dims[1], dims[2], 1, 1, 1);
      geo.translate(0, dims[1] / 2, 0);
      this.ultraEnemyGeometries.set(type, geo);
    }
    const mesh = new THREE.Mesh(this.ultraEnemyGeometries.get(type), this.ultraEnemyMaterials[type] || this.ultraEnemyMaterials.zombie);
    mesh.userData.type = type;
    mesh.userData.ultraSimple = true;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    return mesh;
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
      this.playWorldSound(r.target.x,r.target.z,()=>this.audio.reload(r.weapon));
    } else if (action.actionType === 'reloadEnd' || action.actionType === 'reloadCancel') {
      r.reload = false;
      r.reloadPulse = 0;
      if (action.actionType === 'reloadEnd') this.playWorldSound(r.target.x,r.target.z,()=>this.audio.reloadEnd());
    }
  }

  applyNetworkSnapshot(payload={}) {
    if(!this.running || this.lobby.mode!=='coop' || payload.roomCode!==this.lobby.roomCode || !payload.game)return;
    const g=payload.game,selfId=this.net.socket?.id,newLevel=this.currentMission?.wave!==g.wave;
    this.serverEnemyAuthority=true;this.serverGamePhase=g.phase;this.wave=g.wave;this.spawnQueue=g.spawnQueue;this.initialWaveCount=g.initialCount;
    this.score=g.score;this.kills=g.kills;this.headshots=g.headshots;this.missionsCleared=g.missionsCleared;this.bonusesCleared=g.bonusesCleared;this.networkElapsed=g.elapsed;
    if(newLevel){this.cleanupObjectiveCores(false);this.cleanupMissionTargets();this.serverRewardChosen=false;this.serverExtractRequested=false;this.lastServerRewardWave=null;}
    this.currentMission=g.mission;this.missionState=g.missionState;this.missionTimer=g.missionState?.timer || 0;
    this.prepPhase=g.phase==='prep';this.prepTimer=g.prepTimer || 0;this.prepReadyCount=g.prepReadyCount || 0;
    if(!this.prepPhase)this.prepVoteSent=false;
    const seen=new Set();for(const p of payload.players || []){
      if(p.id===selfId){
        const ps=p.state,wasDowned=this.downed,oldHp=this.hp;
        this.maxHp=ps.maxHp;this.maxMedkits=ps.maxMedkits;this.medkits=ps.medkits;
        this.downed=!!ps.downed;
        if(ps.hp<oldHp && !this.downed)this.damagePlayer(oldHp-ps.hp,{x:this.player.x,z:this.player.z-1},'hit');
        this.hp=ps.hp;this.player.staminaRegen=10*Math.pow(1.2,ps.upgrades?.rewardStacks?.regen || 0);
        if(ps.upgrades){this.upgrades={...this.upgrades,...ps.upgrades};this.rewardStacks=ps.upgrades.rewardStacks;this.player.speed=4.45*Math.pow(1.04,this.rewardStacks.speed || 0);this.player.sprint=7.65*Math.pow(1.04,this.rewardStacks.speed || 0);}
        this.syncLocalWeaponState(ps.weaponState);this.reconcileLocalPlayerWithServer(ps);
        if(!this.downed && wasDowned)this.showToast('친구가 부활시켰습니다');
      }else{seen.add(p.id);this.applyRemoteInput(p.id,{...p.state,role:p.role});}
    }
    for(const id of this.remotePlayers.keys())if(!seen.has(id))this.removeRemotePlayer(id);
    this.unlockWeapons();this.syncServerEnemies(payload.enemies || []);this.syncServerCores(payload.cores || []);this.syncServerPlaceables(payload.placeables || []);this.syncServerItems(payload.items || []);this.syncServerProjectiles(payload.projectiles || []);this.syncMissionTargets();
    this.setConnectionBlocked(g.suspended,'친구가 다시 연결하고 있습니다',String(g.waitingSeconds || 120)+'초 동안 현재 진행을 보관합니다. 연결되면 이어서 플레이합니다.');
    if(g.phase==='reward' && g.reward){
      this.serverRewardMode=true;
      const chosen=Object.hasOwn(g.reward.selected,selfId);
      if(!chosen && !this.serverRewardChosen && this.lastServerRewardWave!==g.wave){this.lastServerRewardWave=g.wave;this.showServerRewardChoices(g.reward.choicesByPlayer[selfId] || [],g.wave);}
      if(UI.rewardSubtitle && this.rewardOpen)UI.rewardSubtitle.textContent='목표 +'+g.reward.completionScore+' · 추가 목표 +'+g.reward.bonusScore+' · '+Math.ceil(g.reward.remaining)+'초 후 미선택 보상 자동 적용';
      if(UI.rewardExtract){UI.rewardExtract.hidden=g.wave%10!==0;UI.reward?.classList.toggle('can-extract',g.wave%10===0);UI.rewardExtract.textContent=this.serverExtractRequested?'친구의 탈출 동의 대기':'두 사람 탈출하기';}
      if(chosen && this.rewardOpen){this.rewardOpen=false;UI.reward.classList.remove('show');this.resetRewardSelection();}
    }else{this.serverRewardMode=false;this.serverRewardChosen=false;this.rewardOpen=false;UI.reward?.classList.remove('show');}
    if(newLevel && g.phase==='combat'){this.showCenterAlert('LEVEL '+g.wave+' · '+g.mission.label,g.mission.desc,g.mission.elite?'danger':'info',3);this.audio.cue(g.mission.elite?'boss':'start');}
    this.applyServerEvents((payload.events || []).filter(e=>!['rewardStart','prepStart','waveStart','teamWipe'].includes(e.type)));
    this.updateHud();
    if(g.phase==='gameover'){this.setConnectionBlocked(false);this.endGame(g.outcome || 'defeated');}
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

  usesServerEnemyAuthority() { return !!(this.running && this.lobby.mode==='coop' && this.serverEnemyAuthority); }

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
        const kind = ['rocket','fireball'].includes(sp.kind) ? sp.kind : 'grenade';
        const mesh = kind==='fireball'?this.createCasterOrb():new THREE.Mesh(this.geos.sphere, kind === 'rocket' ? this.materials.fire : this.materials.bullet);
        if(kind!=='fireball')mesh.scale.setScalar(kind === 'rocket' ? .22 : .17);
        mesh.position.set(Number(sp.x) || 0, Number(sp.y) || 1.4, Number(sp.z) || 0);
        this.scene.add(mesh);
        rec = { serverId: id, networked: true, kind, mesh, x: mesh.position.x, y: mesh.position.y, z: mesh.position.z, alive: true };
        this.projectiles.push(rec);
        this.networkProjectiles.set(id, rec);
      }
      rec.x = Number.isFinite(sp.x)?sp.x:rec.x; rec.y = Number.isFinite(sp.y)?sp.y:rec.y; rec.z = Number.isFinite(sp.z)?sp.z:rec.z; rec.alive = sp.alive !== false;
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
    if(snapshot.elite)mesh.scale.setScalar(1.18);this.scene.add(mesh);
    const stats = this.enemyStats(type);
    return {
      id: snapshot.id, serverId: snapshot.id, type, mesh, alive: true,
      x: mesh.position.x, z: mesh.position.z, targetX: mesh.position.x, targetZ: mesh.position.z, yaw: mesh.rotation.y, targetYaw: mesh.rotation.y,elite:!!snapshot.elite,
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
      e.targetX = Number.isFinite(s.x)?s.x:e.x;
      e.targetZ = Number.isFinite(s.z)?s.z:e.z;
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
    }
    if(deathFx&&!e.deathSoundPlayed){e.deathSoundPlayed=true;this.playWorldSound(e.x,e.z,()=>this.audio.enemyDeath(e.type));}
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
        e.stepCd=(e.stepCd||0)-dt;
        if(e.stepCd<=0&&dist2(e.x,e.z,this.player.x,this.player.z)<24*24){this.playWorldSound(e.x,e.z,()=>this.audio.enemyStep(e.type));e.stepCd=['runner','bomber'].includes(e.type)?.26:['tank','devil'].includes(e.type)?.55:.40;}
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
      if(ev.type==='coreDestroyed'){this.spawnEnemySpawnFx(ev.x,ev.z,'bomber');this.playWorldSound(ev.x,ev.z,()=>this.audio.explosion());this.showToast('감염 코어 파괴');}
      if (ev.type === 'enemySpawn') this.spawnEnemySpawnFx(ev.x || 0, ev.z || 0, ev.enemyType || 'zombie');
      if (ev.type === 'enemyHit' && e) {
        e.hitTimer = e.hitMax = ev.part === 'head' ? .22 : .14;
        e.hitLean = ev.part === 'head' ? .35 : .18;
        if (ev.shooterId===this.net.socket?.id) {this.audio.hit(ev.part==='head'?'head':'flesh');if(ev.part==='head')this.showHeadshot(false);}
        if (e.type !== 'devil') this.addBloodPatch(e, ev.damage || 12, ev.part === 'head' ? 'headshot' : 'bullet');
      }
      if (ev.type === 'enemyMelee' && e) {
        e.attackAnim = e.attackMax = e.type === 'tank' ? .50 : .42;
        this.playWorldSound(e.x,e.z,()=>this.audio.enemyAttack(e.type));
      }
      if (ev.type === 'devilCast' && e) {
        e.castAnim = e.castMax = .55;
        this.playWorldSound(e.x,e.z,()=>this.audio.devilCast());
      }
      if (ev.type === 'enemyDeath' || ev.type === 'enemyExplode') {
        if(e)this.removeNetworkEnemy(e,true);else this.playWorldSound(ev.x,ev.z,()=>this.audio.enemyDeath(ev.enemyType||'zombie'));
        if(ev.type==='enemyExplode'||ev.enemyType==='bomber')this.playWorldSound(ev.x,ev.z,()=>this.audio.explosion());
      }
      if (ev.type === 'waveStart') { this.serverRewardMode = false; this.rewardOpen = false; UI.reward?.classList.remove('show'); this.showToast(`Wave ${ev.wave}`); }
      if (ev.type === 'rewardStart') this.showServerRewardChoices(ev.choices || [], ev.wave || this.wave);
      if (ev.type === 'rewardChosen') this.showToast(ev.playerId === this.net?.socket?.id ? '보상 선택 완료' : '상대가 보상을 선택했다');
      if (ev.type === 'prepStart') { this.serverRewardMode = false; this.startPrepPhase(Number(ev.seconds || 10)); }
      if (ev.type === 'wallCreate') this.audio.placeWall();
      if (ev.type === 'mineCreate') this.audio.placeMine();
      if (ev.type === 'wallDamage') this.audio.wallCrack();
      if (ev.type === 'wallBreak') this.audio.wallBreak();
      if (ev.type === 'mineExplode') {this.explode(ev.x || 0, ev.z || 0, ev.radius || 5.8, 0, false);this.playWorldSound(ev.x,ev.z,()=>this.audio.explosion());}
      if (ev.type === 'itemSpawn') this.audio.itemSpawn();
      if (ev.type === 'serverFire' && ev.playerId === this.net?.socket?.id && ev.weaponState) this.syncLocalWeaponState(ev.weaponState);
      if ((ev.type === 'reloadStart' || ev.type === 'reloadEnd' || ev.type === 'reloadCancel') && ev.playerId === this.net?.socket?.id && ev.weaponState) this.syncLocalWeaponState(ev.weaponState);
      if (ev.type === 'projectileExplode') { this.explode(ev.x || 0, ev.z || 0, ev.radius || 5.5, 0, false); this.playWorldSound(ev.x,ev.z,()=>ev.kind==='fireball'?this.audio.fireballExplode():this.audio.explosion()); }
      if (ev.type === 'playerExplodeHit' && ev.playerId === this.net?.socket?.id) this.damagePlayer(Number(ev.amount || 1), { x: ev.x || this.player.x, z: ev.z || this.player.z - 1 }, 'explosion');
      if (ev.type === 'itemPickup') { if (ev.playerId === this.net?.socket?.id) { if (ev.weaponState) this.syncLocalWeaponState(ev.weaponState); this.showToast(ev.itemKind === 'health' ? '회복 상자 획득' : '탄약 상자 획득'); } this.audio.pickup(); }
      if (ev.type === 'medkitUse') { if (ev.playerId === this.net?.socket?.id) this.showToast(`회복키트 사용 HP +${Math.ceil(ev.amount || 0)}`); this.audio.pickup(); }
      if (ev.type === 'allyHeal') { if (ev.healerId === this.net?.socket?.id) this.showToast(`아군 치료 HP +${Math.ceil(ev.amount || 0)}`); if (ev.targetId === this.net?.socket?.id) this.showToast(`아군에게 치료받음 HP +${Math.ceil(ev.amount || 0)}`); this.audio.pickup(); }
      if (ev.type === 'playerDowned') { if (ev.playerId === this.net?.socket?.id) { this.downed = true; this.hp = 0; this.showToast('쓰러짐: 아군 부활 대기'); } else this.showToast('아군이 쓰러짐'); this.audio.cue('down'); }
      if (ev.type === 'allyRevive' || ev.type === 'playerRevived') { if ((ev.playerId || ev.targetId) === this.net?.socket?.id) { this.downed = false; this.showToast('아군이 부활시킴'); } else if (ev.healerId === this.net?.socket?.id) this.showToast('아군 부활 완료'); this.audio.cue('revive'); }
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
      o.x = Number.isFinite(sp.x)?sp.x:o.x; o.z = Number.isFinite(sp.z)?sp.z:o.z; o.hp = Number(sp.hp ?? o.hp); o.maxHp = Number(sp.maxHp ?? o.maxHp); o.alive = sp.alive !== false;
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
      p.x = Number.isFinite(si.x)?si.x:p.x; p.z = Number.isFinite(si.z)?si.z:p.z; p.kind = si.kind || p.kind; p.weapon = si.weapon || p.weapon; p.amount = Number(si.amount || p.amount); p.life = Number(si.life || p.life); p.alive = si.alive !== false;
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
    const prepared = choices
      .filter(c => localPool.has(c.id))
      .map(c => ({ ...(localPool.get(c.id) || {}), id: c.id, title: c.title || localPool.get(c.id)?.title || c.id, desc: c.desc || localPool.get(c.id)?.desc || '' }))
      .slice(0, 3);
    if (UI.rewardTitle) UI.rewardTitle.textContent = `Wave ${wave} Clear`;
    if (UI.rewardSubtitle) UI.rewardSubtitle.textContent = this.usesMobileRewardConfirmation()
      ? '업그레이드를 선택한 뒤 적용 버튼을 누르세요.'
      : '2인 멀티 서버 보상이다. 둘 다 선택하면 정비 시간이 시작된다.';
    if (UI.rewardExtract) UI.rewardExtract.hidden = true;
    UI.reward?.classList.remove('can-extract');
    this.renderRewardChoices(prepared);
    UI.reward?.classList.add('show');
    this.mobile?.setGameplayActive(false);
    this.audio.cue('complete');
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
      r.audioStepCd=(r.audioStepCd||0)-dt;
      if(speed>.4&&r.audioStepCd<=0){this.playWorldSound(mesh.position.x,mesh.position.z,()=>this.audio.playerStep(speed>5,0));r.audioStepCd=speed>5?.25:.40;}
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
        const reloadPose = r.reload ? .18 + Math.sin((r.reloadPulse || 0) * Math.PI) * .05 : 0;
        ud.weaponGroup.position.y = .92 - reloadPose * .62;
        ud.weaponGroup.position.z = .52 - reloadPose * .22;
        ud.weaponGroup.rotation.x = -0.10 + (r.ads ? -.10 : 0) + reloadPose * .52 + (r.firePulse > 0 ? Math.sin((r.firePulse / .22) * Math.PI) * .12 : 0);
        ud.weaponGroup.rotation.z = r.reload ? -.16 : 0;
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
    if (this.quality?.simpleModels) {
      this.viewWeaponBody = new THREE.Mesh(this.geos.lowBox, this.materials.weaponDark);
      this.viewWeaponBody.scale.set(.26, .20, .82);
      g.add(this.viewWeaponBody);
      this.viewWeaponBarrel = new THREE.Mesh(this.geos.lowBox, this.materials.weaponMetal);
      this.viewWeaponBarrel.position.set(0, .03, -.58);
      this.viewWeaponBarrel.scale.set(.13, .12, .58);
      g.add(this.viewWeaponBarrel);
      this.weaponAttachmentGroup = new THREE.Group();
      g.add(this.weaponAttachmentGroup);
      this.camera.add(g);
      this.viewWeapon = g;
      this.updateViewWeapon();
      return;
    }
    this.viewWeaponBody = this.addPart(g, this.geos.lowBox, this.materials.weaponDark, 0, 0, 0, .26, .20, .82);
    this.viewWeaponBarrel = this.addPart(g, this.geos.lowBox, this.materials.weaponMetal, 0, .03, -.58, .13, .12, .58);
    this.weaponAttachmentGroup = new THREE.Group();
    g.add(this.weaponAttachmentGroup);
    this.viewLeftHand = this.addPart(g, this.geos.lowBox, this.materials.skin, -.25, -.13, .20, .18, .17, .34);
    this.viewRightHand = this.addPart(g, this.geos.lowBox, this.materials.skin, .20, -.11, .28, .18, .17, .30);
    this.viewForearm = this.addPart(g, this.geos.lowBox, this.materials.shirtBlack, -.08, -.23, .40, .46, .14, .34);
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
    if (this.quality?.simpleModels) return;
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

  getMissionForWave(w) { return getMission(w); }

  startMissionForWave(m=null) {
    this.cleanupObjectiveCores(false);this.cleanupMissionTargets();
    this.currentMission=m || getMission(this.wave);m=this.currentMission;this.missionCompletePending=false;
    const points=[];
    if(m.type==='holdout' || m.type==='relay')for(let i=0;i<(m.type==='relay'?3:1);i++){
      const p=this.findMissionPoint(points,m.type==='holdout'?4.5:1.2);if(p)points.push(p);
    }
    this.missionState=createMissionState(m,points,{kills:this.kills,headshots:this.headshots});
    if(m.type==='core'){this.spawnObjectiveCores(m.coreCount);this.missionState.coreRemaining=this.objectiveCores.length;this.currentMission.coreCount=this.objectiveCores.length;}
    this.syncMissionTargets();this.missionTimer=this.missionState.timer;
    this.showCenterAlert('LEVEL '+this.wave+' · '+m.label,m.desc,m.elite?'danger':'info',3.2);
    this.audio.cue(m.elite?'boss':'start');
  }

  missionObjectiveText() { return missionHint(this.currentMission,this.missionState,{remaining:this.spawnQueue+this.enemies.filter(e=>e.alive).length}); }

  updateMissionState(dt) {
    const m=this.currentMission;if(!m || this.rewardOpen || this.prepPhase || this.missionCompletePending || this.usesServerEnemyAuthority())return false;
    const complete=tickMission(m,this.missionState,dt,{players:[{...this.player,alive:this.hp>0,interact:this.input.actionDown('interact')}],remaining:this.spawnQueue+this.enemies.filter(e=>e.alive).length,coresLeft:this.objectiveCores.filter(c=>c.alive).length,headshots:this.headshots,canInteract:(p,t)=>this.lineClear2D(p.x,p.z,t.x,t.z,.12)});
    this.missionTimer=this.missionState.timer;
    if(['survive','blackout','core','holdout','relay'].includes(m.type) && this.spawnQueue<3 && this.enemies.filter(e=>e.alive).length<m.maxActive && !complete)this.spawnQueue+=4;
    if(complete){this.finishMissionWave();return true;}return false;
  }

  finishMissionWave() {
    if(this.missionCompletePending)return;this.missionCompletePending=true;this.spawnQueue=0;
    for(const e of this.enemies){e.alive=false;if(e.mesh?.parent)this.scene.remove(e.mesh);}
    for(const p of this.projectiles){p.alive=false;p.dead=true;if(p.mesh?.parent)this.scene.remove(p.mesh);}this.projectiles=[];
    this.completeWave();
  }

  findCoreSpawnPoint(radius = 1.2) {
    const half = this.map.size / 2 - 4;
    for (let i = 0; i < 180; i++) {
      const x = rand(-half, half), z = rand(-half, half);
      if (this.rectCollides(x, z, radius * 2, radius * 2, .35)) continue;
      if (dist2(x, z, this.player.x, this.player.z) < 12 * 12) continue;
      // 벽 안쪽의 막힌 포켓에 생성되면 진행이 끊기므로, 랜덤 후보 단계부터 길 검사를 건다.
      if (this.player && !this.hasNavRouteToPlayer(x, z, Math.max(.62, radius + .12))) continue;
      let nearCore = false;
      for (const c of this.objectiveCores || []) if (dist2(x, z, c.x, c.z) < 9 * 9) nearCore = true;
      if (nearCore) continue;
      return { x, z };
    }
    return this.findDeterministicSafePoint(radius, {
      rectW: radius * 2,
      rectD: radius * 2,
      pad: .35,
      minPlayerDistance: 12,
      minCoreDistance: 9,
      preferFar: true,
      requireRoute: true
    }) || this.findDeterministicSafePoint(radius, {
      rectW: radius * 2,
      rectD: radius * 2,
      pad: .25,
      minPlayerDistance: 5,
      minCoreDistance: 5,
      preferFar: true,
      requireRoute: true
    });
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
    if (this.quality?.simpleModels) {
      const hp = this.currentMission?.coreHp || 140;
      const body = new THREE.Mesh(this.geos.lowBox, new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff5138 : 0xff9b3d }));
      body.userData.ultraSimple = true;
      body.position.set(x, .78, z);
      body.scale.set(.82, 1.5, .82);
      this.scene.add(body);
      return { kind: 'core', x, z, radius: .88, hp, maxHp: hp, alive: true, mesh: body, body, ring: null, light: null, phase: 0 };
    }
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
    return { kind: 'core', x, z, radius: .88, hp: this.currentMission?.coreHp || 140, maxHp: this.currentMission?.coreHp || 140, alive: true, mesh: group, body, ring, light: halo, phase: Math.random() * Math.PI * 2 };
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
      if (c.body && !c.body.userData?.ultraSimple) {
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
    this.audio.hit('core');
    if (c.hp <= 0) this.destroyObjectiveCore(c, true);
    return true;
  }

  spawnCoreHitFx(c, source = 'bullet') {
    if (this.quality?.simpleModels) return;
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
    this.playWorldSound(c.x,c.z,()=>this.audio.explosion());
    this.showToast('감염 코어 파괴');
  }

  nextWave() {
    if(this.usesServerEnemyAuthority())return;
    this.rewardOpen=false;this.prepPhase=false;this.prepTimer=0;this.wave++;
    const m=this.getMissionForWave(this.wave);this.elitePending=!!m.elite;
    this.spawnQueue=waveSpawnCount(this.wave,this.diff,1,this.map.threatScale || 1);this.initialWaveCount=this.spawnQueue;this.spawnTimer=.4;this.waveBreak=0;
    this.unlockWeapons();this.startMissionForWave(m);this.showWaveTip();
    this.showToast('레벨 '+this.wave+' · '+m.label);
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

  showHeadshot(count = true) {
    if (count) this.headshots = (this.headshots || 0) + 1;
    if (!UI.headshot) return;
    UI.headshot.classList.add('show');
    this.headshotTimer = .42;
  }

  enemyLabel(type) {
    return ({ zombie: '기본 좀비', runner: '러너', devil: '균열술사', tank: '탱커 좀비', bomber: '폭발 좀비', shield: '실드 좀비' })[type] || type;
  }

  enemyTip(type) {
    return ({
      zombie: '가장 기본 적. 거리를 유지하고 헤드샷으로 빠르게 줄여라.',
      runner: '빠르게 달려든다. SMG나 샷건으로 먼저 끊어라.',
      devil: '균열 구체를 쏘며 설치 벽도 부순다. 보라색 예고광이 모일 때 머리를 노려라.',
      tank: '체력이 높고 벽을 잘 부순다. 폭발물이나 헤드샷이 효율적이다.',
      bomber: '가까워지면 자폭한다. 점멸과 경고음이 들리면 즉시 떨어져라.',
      shield: '정면 몸통 피해가 크게 줄어든다. 머리, 측면, 폭발, 레일건을 써라.'
    })[type] || '';
  }

  showWaveTip() {
    const tips = [
      { wave: 2, title: '러너 등장', body: '빠른 적이 섞인다. 뒤로만 걷지 말고 옆으로 빠지며 쏴라.' },
      { wave: 4, title: '탱커 좀비 등장', body: '체력이 높다. 샷건·수류탄·헤드샷으로 처리하는 게 좋다.' },
      { wave: 7, title: '폭발 좀비 등장', body: '가까이 오면 터진다. 노란 적은 멀리서 먼저 제거해라.', tone: 'danger' },
      { wave: 8, title: '실드 좀비 등장', body: '정면 몸통 사격은 약하게 들어간다. 머리나 측면을 노려라.' },
      { wave: 15, title: '고밀도 웨이브', body: '설치 벽과 지뢰로 길목을 만들고, 균열술사는 우선 처치해라.', tone: 'danger' }
    ];
    const tip = tips.find(t => this.wave === t.wave && !this.waveTipShown.has(t.wave));
    if (!tip) return;
    this.waveTipShown.add(tip.wave);
    this.showCenterAlert(tip.title, tip.body, tip.tone || 'info', 3.0);
  }

  combatTierWave() { return this.wave; }

  pickEnemyTypeForWave() { return this.elitePending?this.currentMission.elite:pickEnemyType(this.wave,this.currentMission); }

  spawnEnemySpawnFx(x, z, type = 'zombie') {
    if (this.quality?.simpleModels) return;
    const mat = new THREE.MeshBasicMaterial({ color: type === 'devil' ? COLORS.casterMarker : (type === 'bomber' ? 0xffb52d : 0xe6d48a), transparent: true, opacity: .36, depthWrite: false });
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
    const sp = this.findEnemySpawnPoint(stats.radius);
    if (!sp) return false;
    const elite = !!this.elitePending;
    if (elite) this.elitePending = false;
    const mesh = this.createBoxheadModel(type);
    mesh.position.set(sp.x, 0, sp.z);
    mesh.rotation.y = rand(0, Math.PI * 2);
    if (elite) mesh.scale.setScalar(1.18);
    this.scene.add(mesh);
    this.spawnEnemySpawnFx(sp.x, sp.z, type);
    this.enemies.push({
      id: this.nextEnemyId++, type, mesh, alive: true,
      x: mesh.position.x, z: mesh.position.z, vx: 0, vz: 0,
      hp: stats.hp * (elite ? 2.35 : 1), maxHp: stats.hp * (elite ? 2.35 : 1), speed: stats.speed * (elite ? 1.08 : 1), radius: stats.radius * (elite ? 1.10 : 1),
      damage: stats.damage * (elite ? 1.32 : 1), score: stats.score * (elite ? 3 : 1), elite, attackCd: rand(.3, 1.2), meleeCd: rand(.25, .75), stun: 0,
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
    if (elite) this.showCenterAlert(`엘리트 ${this.enemyLabel(type)}`, '강화된 개체다. 공격 예고를 보고 집중 사격하라.', 'danger', 2.4);
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
    if (this.collides(x, z, radius + .38)) return false;
    if (this.player && dist2(x, z, this.player.x, this.player.z) < 11.5 * 11.5) return false;
    // 단순히 벽과 겹치지 않는 것만으로는 충분하지 않다. 외벽과 긴 장애물 사이의
    // 막힌 포켓에 태어난 적은 영원히 플레이어에게 갈 수 없으므로, 플레이어가 속한
    // 내비게이션 연결 구역까지 실제 비용이 존재하는 스폰만 허용한다.
    if (this.player && !this.hasNavRouteToPlayer(x, z, Math.max(.62, radius + .12))) return false;
    for (const e of this.enemies || []) {
      if (e.alive && dist2(x, z, e.x, e.z) < (radius + e.radius + .7) ** 2) return false;
    }
    return true;
  }

  hasNavRouteToPlayer(x, z, radius = .68) {
    const field = this.getFlowField(this.player.x, this.player.z, radius);
    if (!field) return false;
    const raw = this.navWorldToCell(x, z, field.nav);
    const start = field.nav.walkable[raw.i]
      ? raw
      : this.nearestReachableWalkableCell(x, z, field.nav, Math.max(.38, radius - .16), 5, false);
    return !!start && Number.isFinite(field.distance[start.i]);
  }

  enemyStats(type) { return getEnemyStats(type,this.wave,this.diff); }

  loop(frameTime = performance.now()) {
    requestAnimationFrame(this.loop);
    const targetFps = this.quality?.targetFps || 60;
    const minFrameMs = 1000 / targetFps;
    if (this.lastFrameTimeMs && frameTime - this.lastFrameTimeMs < minFrameMs - 1.2) return;
    if (!this.lastFrameTimeMs || frameTime - this.lastFrameTimeMs > minFrameMs * 2.2) this.lastFrameTimeMs = frameTime;
    else this.lastFrameTimeMs += minFrameMs;
    const dtRaw = this.clock.getDelta();
    const dt = Math.min(dtRaw, this.effectiveQualityKey === 'ultra' ? .050 : .040);
    this.frameNumber++;
    if(this.player)this.audio.setListener(this.player.x,this.player.z,this.yaw);
    if (this.running && !this.paused && !this.gameOver && !this.connectionBlocked) this.update(dt);
    this.updateAudioState();
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
      this.adjustDynamicResolution(avg, t);
      this.lastFpsUpdate = t;
    }
  }

  adjustDynamicResolution(avgFps, t = now()) {
    const q = this.quality || QUALITY.mid;
    if (!q.dynamicResolution || !this.running) return;
    if (t < (this.performanceAdjustTimer || 0)) return;
    this.performanceAdjustTimer = t + 2.2;
    const target = q.targetFps || 45;
    let next = this.dynamicPixelRatio || q.pixelRatio;
    if (avgFps < target * .78) next -= .07;
    else if (avgFps > target * .96) next += .035;
    next = clamp(next, q.minPixelRatio || .45, q.pixelRatio);
    if (Math.abs(next - this.dynamicPixelRatio) >= .025) {
      this.dynamicPixelRatio = next;
      this.resize();
    }
    if (UI.qualityText) UI.qualityText.textContent = `${UI.quality?.value === 'auto' ? 'AUTO ' : ''}${q.label} · ${Math.round(this.dynamicPixelRatio * 100)}%`;
  }

  update(dt) {
    this.hudUpdateTimer = (this.hudUpdateTimer || 0) - dt;
    this.minimapUpdateTimer = (this.minimapUpdateTimer || 0) - dt;
    const updateHudNow = this.hudUpdateTimer <= 0;
    const minimapHz = this.quality.minimapHz ?? 10;
    const updateMinimapNow = minimapHz > 0 && this.minimapUpdateTimer <= 0;
    if (updateHudNow) this.hudUpdateTimer = 1 / (this.quality.hudHz || 30);
    if (updateMinimapNow) this.minimapUpdateTimer = 1 / minimapHz;
    if (this.rewardOpen) {
      this.updateFx(dt);
      this.updateHorrorLighting(dt);
      this.updateAdaptiveMusic(dt);
      
      if (updateHudNow) this.updateHud();
      if (updateMinimapNow) this.minimap.draw(this);
      return;
    }
    
    this.updateReload(dt);
    this.mobile?.update(dt);
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
    this.updateObjectiveMarker();
    if (updateHudNow) this.updateHud();
    if (updateMinimapNow) this.minimap.draw(this);
    this.net.sendInput();
    if (this.hp <= 0 && !(this.lobby?.mode === 'coop' && this.downed)) this.endGame();
  }

  updateHorrorLighting(dt) {
    const blackout = this.currentMission?.type === 'blackout' && !this.prepPhase && !this.rewardOpen;
    for (const light of this.scene.children) if (light.isLight && Number.isFinite(light.userData.baseIntensity)) light.intensity = light.userData.baseIntensity * (blackout ? .58 : 1);
    if (!this.flickerLights || !this.flickerLights.length) return;
    if (!this.accessibility?.flicker) {
      for (const f of this.flickerLights) f.light.intensity = f.base * (blackout ? .58 : 1);
      return;
    }
    const t = now();
    for (const f of this.flickerLights) {
      let pulse = .96 + Math.sin(t * f.speed + f.phase) * .07 + Math.sin(t * 8.7 + f.phase) * .020;
      if (blackout) pulse *= (.58 + Math.sin(t * 18 + f.phase) * .10 + (Math.sin(t * 31 + f.phase) > .86 ? -.22 : 0));
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
    if(this.rewardOpen||this.prepPhase)mood='explore';
    this.audio.setMusicMood(mood);
  }

  playWorldSound(x,z,play) {
    if(!this.player || !Number.isFinite(x) || !Number.isFinite(z))return;
    if(dist2(x,z,this.player.x,this.player.z)>60*60)return;
    this.audio.setListener(this.player.x,this.player.z,this.yaw);
    const blocked=!this.lineClear2D(this.player.x,this.player.z,x,z,.08);
    this.audio.at(x,z,play,blocked);
  }

  updateAudioState() {
    if(!this.running)return;
    this.audio.setBedPaused(this.connectionBlocked || (this.paused && this.lobby.mode!=='coop'));
    if(this.connectionBlocked || (this.paused && this.lobby.mode!=='coop'))return;
    if(this.prepPhase){
      const second=Math.ceil(this.prepTimer);
      if(second>0 && second<=3 && second!==this.audioPrepSecond)this.audio.countdown();
      this.audioPrepSecond=second;
    }else this.audioPrepSecond=null;
    const m=this.currentMission,s=this.missionState;if(!m||!s)return;
    if(this.audioProgress?.wave!==this.wave){this.audioProgress={wave:this.wave,relay:s.progress||0};return;}
    if(m.type==='relay'){
      if(s.progress>this.audioProgress.relay&&!this.rewardOpen)this.audio.cue('relay');
      this.audioProgress.relay=s.progress;
      const target=s.targets.find(t=>t.id===s.activeTarget);
      if(target&&!target.done&&this.input.actionDown('interact')&&dist2(target.x,target.z,this.player.x,this.player.z)<=target.radius**2)this.audio.objectiveTick(target.progress/m.interactTime);
    }else if(m.type==='holdout'&&s.active&&!this.rewardOpen)this.audio.objectiveTick(s.progress/m.targetTime);
  }

  drawStartMapPreview() {
    const c = UI.startMapPreview;
    if (!c || !c.getContext) return;
    const previewKey = (SURVIVAL_MAP_KEYS.includes(UI.map?.value) ? UI.map.value : this.survivalMapKey);
    const map = MAPS[previewKey] || MAPS.box;
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
    const threatText = (map.threatScale || 1) > 1 ? ` · 위협도 +${Math.round(((map.threatScale || 1) - 1) * 100)}%` : '';
    ctx.fillText(`${Math.round(map.size)}m x ${Math.round(map.size)}m · 장애물 ${map.obstacles.length}개${threatText}`, 14, 39);
  }

  handleInput(dt) {
    if(this.prepPhase && this.input.consumeAction('interact'))this.readyForNextLevel();
    const mouse = this.input.consumeMouse();
    this.adsTarget = this.input.actionDown('aim') ? 1 : 0;
    const lookMul = 1 - this.ads * .42;
    this.yaw -= mouse.dx * 0.0021 * lookMul;
    this.pitch -= mouse.dy * 0.0017 * lookMul;
    this.pitch = clamp(this.pitch, -1.18, 1.10);

    for (let i = 1; i <= 8; i++) {
      if (this.input.consumeAction(`weapon${i}`)) { const w = WEAPON_DEFS.find(x => x.slot === i); if (w) this.selectWeapon(w.id); }
    }
    const wheel = this.input.consumeWheel();
    if (wheel !== 0) this.cycleWeapon(wheel > 0 ? 1 : -1);

    if (this.downed) {
      this.adsTarget = 0;
      this.moveIntensity = 0;
      this.player.vx = 0; this.player.vz = 0;
      this.updateAssistInput(dt);
      this.input.setVirtualAction('fire', false);
      return;
    }

    let mx = 0, mz = 0;
    if (this.input.actionDown('forward')) mz -= 1;
    if (this.input.actionDown('backward')) mz += 1;
    if (this.input.actionDown('left')) mx -= 1;
    if (this.input.actionDown('right')) mx += 1;
    const rawMove = Math.hypot(mx, mz);
    const len = rawMove || 1;
    mx /= len; mz /= len;
    const wantsSprint = this.input.actionDown('sprint');
    this.player.staminaLocked = this.player.stamina <= 0;
    // 스태미너가 조금이라도 있으면 즉시 다시 달릴 수 있다. 별도 회복 임계치는 없다.
    const sprinting = wantsSprint && rawMove > .01 && this.ads < .12 && !this.input.actionDown('aim') && this.player.stamina > 0;
    const sprintFrameCost = Math.max(.001, this.player.staminaDrain * dt);
    const sprintPower = sprinting ? clamp(this.player.stamina / sprintFrameCost, 0, 1) : 0;
    const adsSlow = 1 - this.ads * .54;
    // 한 프레임 소모량보다 스태미너가 적으면 남은 양만큼만 달리기 속도를 섞는다.
    const locomotionSpeed = this.player.speed + (this.player.sprint - this.player.speed) * sprintPower;
    const speed = locomotionSpeed * adsSlow;
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    // 카메라가 바라보는 방향 기준 이동. W는 항상 조준점 방향, A/D는 좌우 스트레이프.
    const desiredVx = (mx * cos + mz * sin) * speed;
    const desiredVz = (-mx * sin + mz * cos) * speed;
    const accel = rawMove > .01 ? (1 - Math.exp(-dt * (sprinting ? 17 : 13))) : (1 - Math.exp(-dt * 18));
    this.player.vx += (desiredVx - this.player.vx) * accel;
    this.player.vz += (desiredVz - this.player.vz) * accel;
    if (Math.abs(this.player.vx) < .01) this.player.vx = 0;
    if (Math.abs(this.player.vz) < .01) this.player.vz = 0;
    const moveStartX = this.player.x, moveStartZ = this.player.z;
    this.moveEntity(this.player, this.player.vx * dt, this.player.vz * dt, this.player.radius);
    const movedDistance = Math.hypot(this.player.x - moveStartX, this.player.z - moveStartZ);
    this.updatePlayerStamina(dt, sprinting, sprintPower, movedDistance, wantsSprint, rawMove);
    const actualMove = clamp(Math.hypot(this.player.vx, this.player.vz) / Math.max(1, this.player.sprint), 0, 1);
    this.moveIntensity = this.player.grounded ? actualMove * (1 + sprintPower * .18) * (1 - this.ads * .68) : 0;
    this.playerStepCd = Math.max(0, (this.playerStepCd || 0) - dt);
    if (this.player.grounded && actualMove > .18 && this.playerStepCd <= 0) {
      this.audio.playerStep(sprinting, this.ads);
      this.playerStepCd = sprinting ? .26 : (this.ads > .55 ? .58 : .42);
    }

    const jumpDown = this.input.actionDown('jump');
    if (jumpDown && !this.jumpHeld && this.player.grounded) {
      this.player.vy = WORLD.JUMP_VELOCITY;
      this.player.grounded = false;
      this.audio.jump();
    }
    this.jumpHeld = jumpDown;

    this.updateAssistInput(dt);
    if (this.input.consumeAction('reload')) this.reloadSelected();
    if (this.input.actionDown('fire')) this.fireSelected(false);
  }

  updatePlayerStamina(dt, sprinting, sprintPower, movedDistance, wantsSprint, rawMove) {
    const p = this.player;
    if (!p) return;
    const actuallySprinting = sprinting && p.grounded && movedDistance > Math.max(.002, dt * .18);
    if (actuallySprinting) {
      p.stamina = Math.max(0, p.stamina - p.staminaDrain * dt * sprintPower);
      p.staminaLocked = p.stamina <= 0;
      return;
    }

    // Shift를 놓으면 걷는 중에도, 제자리에 멈춰 있어도 회복한다. 정지 상태는 호흡을
    // 가다듬는 상황이므로 걷기보다 12%만 빠르다. Shift를 계속 누른 동안은 0이어도
    // 회복하지 않으며, 조준 여부는 회복을 막지 않는다.
    const canRecover = p.grounded && !wantsSprint;
    if (canRecover && p.stamina < p.maxStamina) {
      const stationary = rawMove <= .01 || movedDistance <= Math.max(.001, dt * .08);
      const recoveryRate = p.staminaRegen * (stationary ? 1.12 : 1);
      p.stamina = Math.min(p.maxStamina, p.stamina + recoveryRate * dt);
    }
    p.staminaLocked = p.stamina <= 0;
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
    
    const eDown = this.input.actionDown('heal');
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
      const wave = Math.sin(phase * Math.PI);
      this.viewWeapon.rotation.x = -0.06 - wave * .34;
      this.viewWeapon.rotation.y = -0.08 + Math.sin(phase * Math.PI * 2) * .06;
      this.viewWeapon.rotation.z = Math.sin(phase * Math.PI) * -.11;
      this.viewWeapon.position.x = .34 - wave * .08;
      this.viewWeapon.position.y = -0.33 - wave * .16;
      this.viewWeapon.position.z = -.78 + wave * .09;
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
    if (this.ammo[w.id] !== Infinity && (this.ammo[w.id] || 0) <= 0) { this.showToast('예비 탄약 없음'); this.audio.empty(); return; }
    const dur = (w.reloadTime || 1.2) * (this.upgrades?.reload || 1);
    this.reload = { active: true, weapon: w.id, timer: dur, duration: dur };
    this.showToast(`${w.name} 재장전`);
    this.audio.reload(w.id);
    this.net?.sendAction?.('reloadStart', w);
  }

  cancelReload() {
    if (!this.reload?.active) return;
    const w = this.getWeapon(this.reload.weapon);
    this.reload.active = false;
    this.net?.sendAction?.('reloadCancel', w || this.selectedWeapon);
    if (this.viewWeapon) { this.viewWeapon.rotation.set(-.06, -.08, 0); this.viewWeapon.position.set(.34, -.33, -.78); }
    if (this.viewLeftHand) this.viewLeftHand.rotation.set(0,0,0);
    if (this.viewRightHand) this.viewRightHand.rotation.set(0,0,0);
    if (this.viewForearm) this.viewForearm.rotation.set(0,0,0);
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
    this.audio.reloadEnd();
    this.net?.sendAction?.('reloadEnd', w);
    if (this.viewWeapon) { this.viewWeapon.rotation.set(-.06, -.08, 0); this.viewWeapon.position.set(.34, -.33, -.78); }
    if (this.viewLeftHand) this.viewLeftHand.rotation.set(0,0,0);
    if (this.viewRightHand) this.viewRightHand.rotation.set(0,0,0);
    if (this.viewForearm) this.viewForearm.rotation.set(0,0,0);
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
    } else if (Number.isFinite(w.ammoMax) && (this.ammo[w.id] || 0) <= 0) { this.audio.empty(); return; }

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
    const weaponMod = w.id === 'shotgun' && this.upgrades?.shotgunBreach ? 1.22 : 1;
    let hitSomething = false, impactKind = null, impactCount = 0;
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
        const breach = w.id === 'shotgun' && this.upgrades?.shotgunBreach ? 1.65 : 1;
        if (this.damageWall(wallHit.obstacle, w.damage * breach, 'bullet', impact)) { hitSomething = true; impactKind = impactKind || 'wall'; impactCount++; }
      } else if (first?.kind === 'core') {
        this.damageObjectiveCore(coreHit.core, w.damage * weaponMod * (this.upgrades?.damage || 1), 'bullet', dir);
        hitSomething = true; impactKind = 'core'; impactCount++;
      } else if (first?.kind === 'enemy') {
        const enemyHit = first.data;
        const dmg = w.damage * weaponMod * (this.upgrades?.damage || 1) * (enemyHit.multiplier || 1) * (enemyHit.part === 'head' ? (this.upgrades?.headshot || 1) : 1);
        this.damageEnemy(enemyHit.enemy, dmg, enemyHit.part === 'head' ? 'headshot' : 'bullet', dir, enemyHit.part);
        this.spawnHitFx(enemyHit.enemy, dir, enemyHit.distance, enemyHit.part === 'head' ? 'headshot' : 'bullet');
        if (enemyHit.part === 'head') this.audio.headshot();
        impactKind = enemyHit.part === 'head' ? 'head' : (enemyHit.enemy.type === 'tank' ? 'armor' : (enemyHit.enemy.type === 'shield' ? 'shield' : 'flesh'));
        impactCount++; hitSomething = true;
      }
    }
    if (hitSomething) this.audio.hit(impactKind || 'flesh', w.id === 'shotgun' ? Math.min(2.1, .8 + impactCount * .16) : 1);
  }

  fireRail(w) {
    const dir = this.aimDirection(0);
    const hits = [];
    let impactKind = null;
    const overcharge = this.upgrades?.railOvercharge ? 1.18 : 1;
    const wallHit = this.findWallOnRay(this.player.x, this.player.z, dir, w.range);
    const maxRange = wallHit ? wallHit.distance : w.range;
    for (let n = 0; n < w.pierce + (this.upgrades?.railOvercharge ? 1 : 0); n++) {
      const hit = this.findEnemyOnRay(dir, maxRange, .55, true, hits.map(h => h.enemy.id));
      if (!hit) break;
      hits.push(hit);
      const dmg = w.damage * overcharge * (this.upgrades?.damage || 1) * (hit.part === 'head' ? 1.85 * (this.upgrades?.headshot || 1) : 1);
      this.damageEnemy(hit.enemy, dmg, hit.part === 'head' ? 'headshot' : 'rail', dir, hit.part);
      this.spawnHitFx(hit.enemy, dir, hit.distance, hit.part === 'head' ? 'headshot' : 'rail');
      if (hit.part === 'head') this.audio.headshot();
      impactKind = hit.part === 'head' ? 'head' : (hit.enemy.type === 'tank' ? 'armor' : (hit.enemy.type === 'shield' ? 'shield' : 'flesh'));
    }
    if (wallHit) {
      const impact = { x: this.player.x + dir.x * wallHit.distance, y: this.getEyeY() + dir.y * wallHit.distance, z: this.player.z + dir.z * wallHit.distance };
      this.damageWall(wallHit.obstacle, w.damage * overcharge * 1.1, 'rail', impact);
      impactKind = impactKind || 'wall';
    }
    const coreHit = this.findObjectiveCoreOnRay(dir, maxRange, .18);
    if (coreHit) { this.damageObjectiveCore(coreHit.core, w.damage * overcharge * 1.45 * (this.upgrades?.damage || 1), 'rail', dir); impactKind = 'core'; }
    this.spawnBulletVisual(dir, wallHit ? wallHit.distance : (coreHit ? coreHit.distance : (hits.length ? hits[hits.length - 1].distance : 42)), .06, true);
    if (hits.length || wallHit || coreHit) this.audio.hit(impactKind || 'metal', 1.45);
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
    if (this.quality?.simpleModels) { o.crackGroup = null; return; }
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
    if (this.quality?.simpleModels) return;
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
    if (this.quality?.simpleModels) return;
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
    this.playWorldSound(r.target.x,r.target.z,()=>this.audio.shoot(weaponId));
  }

  spawnMuzzleFlash(start, dir, rail = false) {
    if (this.quality?.simpleModels) return;
    const flash = new THREE.Mesh(this.geos.sphere, rail ? this.materials.rail : this.materials.fire);
    flash.position.copy(start).addScaledVector(dir, .18);
    flash.scale.set(rail ? .34 : .22, rail ? .34 : .22, rail ? .34 : .22);
    this.scene.add(flash);
    this.fx.push({ mesh: flash, life: rail ? .07 : .045, max: rail ? .07 : .045, scaleOut: true });
  }

  spawnBulletVisual(dir, distance, thickness = .095, rail = false) {
    if (this.quality?.simpleModels) return;
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
    if (this.quality?.simpleModels) return;
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
    if (this.quality?.simpleModels) return;
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
    if (this.quality?.simpleModels) return;
    const pos = new THREE.Vector3(
      this.player.x + dir.x * distance,
      this.getEyeY() + dir.y * distance,
      this.player.z + dir.z * distance
    );
    const mat = enemy.type === 'devil' ? this.materials.casterOrb : this.materials.blood;
    const baseBurstCount = kind === 'headshot' ? 7 : (kind === 'rail' ? 5 : 3);
    const burstCount = Math.max(1, Math.round(baseBurstCount * (this.quality?.fx ?? 1)));
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
    const payload = kind === 'rocket' && this.upgrades?.rocketPayload ? 1.18 : 1;
    this.projectiles.push({ kind, mesh, x: mesh.position.x, z: mesh.position.z, y: mesh.position.y, vx: dir.x * speed, vz: dir.z * speed, vy: kind === 'grenade' ? 4.8 : dir.y * speed, life: kind === 'grenade' ? 1.15 : 2.2, radius: w.radius * payload, damage: w.damage * (this.upgrades?.damage || 1) });
  }

  createMineModel() {
    if (this.quality?.simpleModels) {
      const mesh = new THREE.Mesh(this.geos.lowBox, this.materials.mineDark);
      mesh.position.y = .18;
      mesh.scale.set(.92, .28, .92);
      return mesh;
    }
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
    const active = this.selectedWeapon === 'wall' && this.input?.actionDown?.('aim') && this.running && !this.paused && !this.gameOver;
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
    if(this.prepPhase){this.prepTimer=Math.max(0,this.prepTimer-dt);if(this.prepTimer<=0)this.nextWave();return;}
    if(this.updateMissionState(dt))return;
    const cap=Math.min(this.quality.maxEnemies || 40,this.currentMission?.maxActive || 40);
    if(this.spawnQueue>0){this.spawnTimer-=dt;if(this.spawnTimer<=0 && this.enemies.filter(e=>e.alive).length<cap){if(this.spawnEnemy())this.spawnQueue--;this.spawnTimer=clamp((.86-this.wave*.02)*(this.map.spawnIntervalScale||1),.27,.85);}}
  }

  updateEnemies(dt) {
    const aiClock = now();
    
    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.stun = Math.max(0, e.stun - dt);
      e.hitTimer = Math.max(0, (e.hitTimer || 0) - dt);
      e.attackAnim = Math.max(0, (e.attackAnim || 0) - dt);
      e.castAnim = Math.max(0, (e.castAnim || 0) - dt);
      e.recoilTimer = Math.max(0, (e.recoilTimer || 0) - dt);
      e.meleeCd = Math.max(0, (e.meleeCd || 0) - dt);
      e.aiThink = Math.max(0, (e.aiThink || 0) - dt);
      const aiInterval = this.quality?.aiHz ? 1 / this.quality.aiHz : 0;
      const thinkNow = e.aiThink <= 0 || !e.aiTarget || !e.cachedSteer;
      let aiDt = dt;
      if (thinkNow) {
        aiDt = e.lastAiThinkAt ? clamp(aiClock - e.lastAiThinkAt, dt, .28) : dt;
        e.lastAiThinkAt = aiClock;
        e.aiThink = aiInterval > 0 ? aiInterval * rand(.82, 1.18) : 0;
      }
      const dxp = this.player.x - e.x, dzp = this.player.z - e.z;
      const d = Math.hypot(dxp, dzp) || 1;
      const nx = dxp / d, nz = dzp / d;

      const prevX = e.x, prevZ = e.z;

      // 플레이어와 적 사이에 설치 벽이 있으면, 그 벽을 우선 목표로 잡는다.
      // 일반 좀비/러너는 가까이 가서 손으로 부수고, 균열술사는 멀리서 균열 구체로 부순다.
      let playerWallBlocker = thinkNow ? null : (e.aiWallBlocker?.alive ? e.aiWallBlocker : null);
      if (thinkNow) {
        const blocker = this.findWallOnRay(e.x, e.z, { x: nx, z: nz }, d);
        playerWallBlocker = blocker && blocker.obstacle?.kind === 'fakeWall' ? blocker.obstacle : null;
      }
      if (!playerWallBlocker && e.breakTarget?.alive) playerWallBlocker = e.breakTarget;
      if (e.breakTarget && !e.breakTarget.alive) e.breakTarget = null;
      let wallAttack = false;
      // 현재 위치만 뒤쫓지 않고 짧게 이동 방향을 예측해 코너에서 추적이 느슨해지는 현상을 줄인다.
      let target = e.aiTarget || { x: this.player.x, z: this.player.z };
      if (thinkNow) {
        const leadTime = clamp(d / 28, 0, .58);
        const predictedX = this.player.x + (this.player.vx || 0) * leadTime;
        const predictedZ = this.player.z + (this.player.vz || 0) * leadTime;
        target = this.collides(predictedX, predictedZ, this.player.radius) ? { x: this.player.x, z: this.player.z } : { x: predictedX, z: predictedZ };
        const routeRadius = Math.max(.62, e.radius + .12);
        if (!this.lineClear2D(e.x, e.z, target.x, target.z, routeRadius)) {
          target = this.getEnemyTacticalTarget(e, target.x, target.z, d);
        }

      }
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
      e.aiWallBlocker = playerWallBlocker;
      e.aiTarget = target;

      const tdx = target.x - e.x, tdz = target.z - e.z;
      const td = Math.hypot(tdx, tdz) || 1;
      const tnx = tdx / td, tnz = tdz / td;
      e.mesh.rotation.y = Math.atan2(tnx, tnz);
      if (e.type === 'devil') this.updateDevil(e, dt, d, nx, nz, playerWallBlocker);

      if (e.type === 'bomber') {
        const warnRange = e.radius + this.player.radius + 3.15;
        if (!playerWallBlocker && d < warnRange) {
          e.bomberFlash = Math.max(e.bomberFlash || 0, .22);
          if (!e.bomberWarned) { e.bomberWarned = true; this.playWorldSound(e.x,e.z,()=>this.audio.bomberWarn()); }
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
        const steer = thinkNow || !e.cachedSteer ? this.getEnemySteering(e, target.x, target.z, aiDt) : e.cachedSteer;
        e.cachedSteer = steer;
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

      if (!playerWallBlocker && e.type === 'bomber' && e.meleeCd <= 0 && (d < e.radius + this.player.radius + 1.05 )) {
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
        this.playWorldSound(e.x,e.z,()=>this.audio.enemyAttack(e.type));
      } else if (!playerWallBlocker && e.meleeCd <= 0 && e.type === 'devil' && (d < devilClawRange)) {
        e.meleeCd = 1.15;
        e.attackAnim = .40;
        e.attackMax = .40;
        this.damagePlayer(e.damage * .48, e, 'melee');
        this.playWorldSound(e.x,e.z,()=>this.audio.enemyAttack(e.type));
      }
      e.walkSpeed = Math.hypot(e.x - prevX, e.z - prevZ) / Math.max(.001, dt);
      const desiredSpeed = Math.hypot(e.vx || 0, e.vz || 0);
      if (desiredSpeed > .25 && e.walkSpeed < .08 && e.stun <= 0) e.stuckTime = (e.stuckTime || 0) + dt;
      else e.stuckTime = Math.max(0, (e.stuckTime || 0) - dt * 2.2);
      // 벽면을 좌우로 왕복하면 이동 속도만으로는 '막힘'을 감지할 수 있다. 일정 시간마다
      // 플레이어까지의 실제 거리 감소량도 확인해, 전진하지 못하는 조향을 정밀 A*로 승격한다.
      e.progressSampleTimer = (e.progressSampleTimer || 0) - dt;
      if (e.progressSampleTimer <= 0) {
        const chaseDistance = Math.hypot(this.player.x - e.x, this.player.z - e.z);
        const progress = Number.isFinite(e.lastChaseDistance) ? e.lastChaseDistance - chaseDistance : 1;
        if (!wallAttack && chaseDistance > 3.2 && desiredSpeed > .22 && progress < .16) e.progressStall = Math.min(4, (e.progressStall || 0) + .52);
        else e.progressStall = Math.max(0, (e.progressStall || 0) - .72);
        e.lastChaseDistance = chaseDistance;
        e.progressSampleTimer = .52;
      }
      if (e.walkSpeed > .05) {
        const pace = e.type === 'runner' ? 10.2 : (e.type === 'bomber' ? 8.6 : (e.type === 'tank' ? 3.7 : (e.type === 'devil' ? 4.2 : 6.2)));
        e.walkPhase += dt * pace * clamp(e.walkSpeed / Math.max(.1, e.speed), .35, 1.55);
        e.stepCd = Math.max(0, (e.stepCd || 0) - dt);
        if (e.stepCd <= 0 && d < 24) {
          this.playWorldSound(e.x,e.z,()=>this.audio.enemyStep(e.type));
          e.stepCd = e.type === 'runner' || e.type === 'bomber' ? .23 : (e.type === 'tank' ? .58 : (e.type === 'devil' ? .52 : .38));
        }
      } else {
        e.stepCd = Math.max(0, (e.stepCd || 0) - dt);
      }
    }
    this.overlapTimer = Math.max(0, (this.overlapTimer || 0) - dt);
    if (this.overlapTimer <= 0) {
      this.resolveEnemyOverlaps();
      this.overlapTimer = 1 / (this.quality?.overlapHz || 60);
    }
    const simpleModels = !!this.quality?.simpleModels;
    const fullPoseFrame = !simpleModels || this.frameNumber % 2 === 0;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (simpleModels) e.mesh.position.set(e.x, 0, e.z);
      else if (fullPoseFrame) this.applyEnemyVisualPose(e);
      else { e.mesh.position.x = e.x; e.mesh.position.z = e.z; }
    }
    this.enemies = this.enemies.filter(e => e.alive || e.mesh.parent);
  }

  getEnemyTacticalTarget(e, playerX, playerZ, distanceToPlayer = Infinity) {
    if (!e || distanceToPlayer < 3.2) return { x: playerX, z: playerZ };
    const slotRadius = e.type === 'devil' ? 8.5
      : (e.type === 'bomber' ? 1.85
      : (e.type === 'runner' ? 1.55
      : (e.type === 'tank' ? 1.35 : 1.25)));
    let angle = ((Number(e.id) || 1) * 2.399963229728653 + this.wave * .17) % (Math.PI * 2);
    const moveSpeed = Math.hypot(this.player.vx || 0, this.player.vz || 0);
    if (e.type === 'runner' && moveSpeed > .3) {
      const travel = Math.atan2(this.player.vz || 0, this.player.vx || 0);
      angle = travel + ((Number(e.id) || 0) % 2 ? Math.PI * .55 : -Math.PI * .55);
    } else if (e.type === 'shield') {
      angle = -this.yaw + Math.PI + (((Number(e.id) || 0) % 3) - 1) * .38;
    }
    // 같은 코너에 전원이 같은 목표를 잡지 않도록 역할·ID별 공격 슬롯을 예약한다.
    // 슬롯이 벽 안이면 주변 각도를 순서대로 확인하고, 모두 막힌 경우에만 플레이어
    // 좌표 자체를 목표로 되돌린다.
    for (const offset of [0, Math.PI / 4, -Math.PI / 4, Math.PI / 2, -Math.PI / 2, Math.PI]) {
      const a = angle + offset;
      const x = playerX + Math.cos(a) * slotRadius;
      const z = playerZ + Math.sin(a) * slotRadius;
      if (!this.collides(x, z, Math.max(.62, e.radius + .10))) return { x, z, tacticalSlot: true };
    }
    return { x: playerX, z: playerZ };
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
    this.playWorldSound(e.x,e.z,()=>this.audio.enemyAttack(e.type));
    return true;
  }

  markNavDirty() {
    this.navVersion = (this.navVersion || 1) + 1;
    this.navGrid = null;
    this.navGrids?.clear();
    this.flowField = null;
    this.flowFields?.clear();
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

  classifyNavigationCell(x, z, radius = .78) {
    let breakable = false;
    const candidates = this.nearbyObstacles(x, z, radius);
    for (const o of candidates) {
      if (!o.alive) continue;
      const cx = clamp(x, o.x - o.w / 2, o.x + o.w / 2);
      const cz = clamp(z, o.z - o.d / 2, o.z + o.d / 2);
      if (dist2(x, z, cx, cz) >= radius * radius) continue;
      if (o.kind === 'fakeWall') breakable = true;
      else return 0;
    }
    // 2는 통과 비용이 높은 파괴 가능 벽, 1은 일반 통로다.
    return breakable ? 2 : 1;
  }

  classifyNavigationEdge(ax, az, bx, bz, radius = .78) {
    // 셀 중심 두 개가 비어 있어도 그 사이에 얇은 벽이나 모서리가 끼어 있을 수 있다.
    // 이동 구간 전체를 촘촘히 검사해 0=차단, 1=통로, 2=파괴 가능 벽 통과로 분류한다.
    const dx = bx - ax, dz = bz - az;
    const length = Math.hypot(dx, dz);
    const step = Math.max(.18, Math.min(.34, radius * .40));
    const samples = Math.max(1, Math.ceil(length / step));
    let edgeType = 1;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const type = this.classifyNavigationCell(ax + dx * t, az + dz * t, radius);
      if (!type) return 0;
      if (type === 2) edgeType = 2;
    }
    return edgeType;
  }

  buildNavGrid(radius = .78) {
    // 2m 격자는 얇은 통로 입구와 벽 모서리를 놓칠 수 있었다. 1.25m 격자로
    // 통로의 실제 중심선을 보존하고, 적 크기별 격자를 별도 캐시해 서로 덮어쓰지 않는다.
    const cell = this.map?.navCell || 1.25;
    const half = this.map.size / 2;
    const cols = Math.ceil(this.map.size / cell);
    const rows = cols;
    const walkable = new Uint8Array(cols * rows);
    const clearance = radius + .08;
    const toIndex = (ix, iz) => iz * cols + ix;
    for (let iz = 0; iz < rows; iz++) {
      for (let ix = 0; ix < cols; ix++) {
        const x = -half + cell * (ix + .5);
        const z = -half + cell * (iz + .5);
        walkable[toIndex(ix, iz)] = this.classifyNavigationCell(x, z, clearance);
      }
    }
    // 각 셀의 8방향 연결을 연속 충돌 검사로 미리 계산한다. 흐름 지도와 A*가
    // 동일한 링크를 사용하므로 벽 건너편 셀을 다음 목표로 고르는 일이 없다.
    const links = new Uint8Array(cols * rows * NAV_DIRS.length);
    for (let iz = 0; iz < rows; iz++) {
      for (let ix = 0; ix < cols; ix++) {
        const i = toIndex(ix, iz);
        if (!walkable[i]) continue;
        const from = { x: -half + cell * (ix + .5), z: -half + cell * (iz + .5) };
        // 링크는 양방향이므로 동/남/남동/남서만 검사하고 반대편에 같은 값을 쓴다.
        // 큰 맵과 모바일에서도 내비게이션 격자 생성 비용이 두 배가 되지 않게 한다.
        for (const k of NAV_FORWARD_LINKS) {
          const [dx, dz] = NAV_DIRS[k];
          const nx = ix + dx, nz = iz + dz;
          if (nx < 0 || nz < 0 || nx >= cols || nz >= rows) continue;
          const ni = toIndex(nx, nz);
          if (!walkable[ni]) continue;
          if (dx && dz) {
            const sideA = toIndex(nx, iz);
            const sideB = toIndex(ix, nz);
            if (!walkable[sideA] || !walkable[sideB]) continue;
          }
          const to = { x: -half + cell * (nx + .5), z: -half + cell * (nz + .5) };
          const edgeType = this.classifyNavigationEdge(from.x, from.z, to.x, to.z, clearance);
          links[i * NAV_DIRS.length + k] = edgeType;
          links[ni * NAV_DIRS.length + NAV_OPPOSITE[k]] = edgeType;
        }
      }
    }
    const radiusKey = Math.round(clamp(radius, .55, 1.05) * 10) / 10;
    const grid = { cell, half, cols, rows, walkable, links, radius: radiusKey, radiusKey, version: this.navVersion || 1 };
    if (!this.navGrids) this.navGrids = new Map();
    this.navGrids.set(radiusKey, grid);
    this.navGrid = grid;
    return grid;
  }

  getNavGrid(radius = .78) {
    const radiusKey = Math.round(clamp(radius, .55, 1.05) * 10) / 10;
    if (!this.navGrids) this.navGrids = new Map();
    const cached = this.navGrids.get(radiusKey);
    if (cached && cached.version === (this.navVersion || 1)) return cached;
    return this.buildNavGrid(radiusKey);
  }

  getFlowField(tx, tz, radius = .82) {
    // 모든 적이 같은 플레이어를 쫓으므로, 적마다 A*를 다시 계산하는 대신
    // 플레이어 셀에서 퍼져 나오는 하나의 비용 지도를 공유한다.
    const nav = this.getNavGrid(radius);
    const goalRaw = this.navWorldToCell(tx, tz, nav);
    const goal = nav.walkable[goalRaw.i]
      ? goalRaw
      : this.nearestReachableWalkableCell(tx, tz, nav, WORLD.PLAYER_RADIUS, 8);
    if (!goal) return null;
    if (!this.flowFields) this.flowFields = new Map();
    const cacheKey = nav.radiusKey;
    const cached = this.flowFields.get(cacheKey);
    const cacheValid = cached && cached.nav === nav && cached.navVersion === nav.version && cached.goal === goal.i;
    if (cacheValid) return cached;

    const total = nav.cols * nav.rows;
    const distance = new Float32Array(total); distance.fill(Infinity);
    const nextHop = new Int32Array(total); nextHop.fill(-1);
    const closed = new Uint8Array(total);
    const heap = [];
    const push = (i) => {
      heap.push(i);
      let n = heap.length - 1;
      while (n > 0) {
        const p = (n - 1) >> 1;
        if (distance[heap[p]] <= distance[heap[n]]) break;
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
          if (l < heap.length && distance[heap[l]] < distance[heap[m]]) m = l;
          if (r < heap.length && distance[heap[r]] < distance[heap[m]]) m = r;
          if (m === n) break;
          [heap[n], heap[m]] = [heap[m], heap[n]];
          n = m;
        }
      }
      return top;
    };
    distance[goal.i] = 0;
    push(goal.i);
    while (heap.length) {
      const cur = pop();
      if (closed[cur]) continue;
      closed[cur] = 1;
      const cx = cur % nav.cols, cz = Math.floor(cur / nav.cols);
      for (let k = 0; k < NAV_DIRS.length; k++) {
        const [dx, dz, moveCost] = NAV_DIRS[k];
        const nx = cx + dx, nz = cz + dz;
        if (nx < 0 || nz < 0 || nx >= nav.cols || nz >= nav.rows) continue;
        const ni = nz * nav.cols + nx;
        if (!nav.walkable[ni] || closed[ni]) continue;
        const edgeType = nav.links?.[cur * NAV_DIRS.length + k] || 0;
        if (!edgeType) continue;
        // 목표에서 역방향으로 퍼뜨리므로, 정방향에서 실제로 들어갈 cur 셀의 비용을 쓴다.
        const breakCost = edgeType === 2 || nav.walkable[cur] === 2 ? 6.5 : 1;
        const nextDistance = distance[cur] + moveCost * breakCost;
        if (nextDistance < distance[ni]) {
          distance[ni] = nextDistance;
          nextHop[ni] = cur;
          push(ni);
        }
      }
    }
    const field = { nav, distance, nextHop, goal: goal.i, navVersion: nav.version };
    this.flowFields.set(cacheKey, field);
    this.flowField = field;
    return field;
  }

  getFlowSteering(e, tx, tz, radius) {
    // 적마다 거리 기반 예측 지점을 쓰면 같은 크기의 적끼리도 서로 다른 목표 셀로
    // 공유 흐름 지도를 덮어쓰게 된다. 흐름 지도는 모두가 공유하는 짧은 플레이어 예측점,
    // 근거리 조향과 공격은 적별 목표점을 사용한다.
    let flowX = this.player.x + (this.player.vx || 0) * .18;
    let flowZ = this.player.z + (this.player.vz || 0) * .18;
    if (this.collides(flowX, flowZ, this.player.radius)) {
      flowX = this.player.x;
      flowZ = this.player.z;
    }
    const field = this.getFlowField(flowX, flowZ, radius);
    if (!field) return null;
    const { nav, nextHop, distance } = field;
    const raw = this.navWorldToCell(e.x, e.z, nav);
    const start = nav.walkable[raw.i]
      ? raw
      : this.nearestReachableWalkableCell(e.x, e.z, nav, e.radius, 5);
    if (!start || start.i === field.goal) return null;
    let hop = nextHop[start.i];
    if (hop < 0) return null;

    // 정확히 같은 최단 경로만 모든 적이 공유하면 좁은 코너 한쪽에 줄지어 뭉친다.
    // 거리값이 실제로 감소하는 근접 후보 중 거의 같은 비용의 링크를 적 ID별로 나눠 쓴다.
    const candidates = [];
    const startDistance = distance[start.i];
    for (let k = 0; k < NAV_DIRS.length; k++) {
      const [ox, oz, moveCost] = NAV_DIRS[k];
      const nx = start.ix + ox, nz = start.iz + oz;
      if (nx < 0 || nz < 0 || nx >= nav.cols || nz >= nav.rows) continue;
      const ni = nz * nav.cols + nx;
      const edgeType = nav.links?.[start.i * NAV_DIRS.length + k] || 0;
      if (!edgeType || !Number.isFinite(distance[ni]) || distance[ni] >= startDistance - .01) continue;
      const cost = distance[ni] + moveCost * (edgeType === 2 || nav.walkable[ni] === 2 ? 6.5 : 1);
      candidates.push({ i: ni, cost });
    }
    if (candidates.length > 1) {
      candidates.sort((a, b) => a.cost - b.cost);
      const nearBest = candidates.filter(c => c.cost <= candidates[0].cost + .38);
      hop = nearBest[Math.abs(Number(e.id) || 0) % nearBest.length].i;
    }

    // 흐름 지도가 계산한 확정 다음 칸을 따르되, 현재 위치에서 실제로 보이는 최대 4칸까지
    // 앞을 본다. 벽 너머 칸을 골라 벽면에 비비는 기존 문제를 막는다.
    let bestHop = hop;
    for (let look = 0; look < 4; look++) {
      const candidate = nextHop[bestHop];
      if (candidate < 0) break;
      const cx = candidate % nav.cols, cz = Math.floor(candidate / nav.cols);
      const point = this.navCellToWorld(cx, cz, nav);
      if (!this.lineClear2D(e.x, e.z, point.x, point.z, radius)) break;
      bestHop = candidate;
    }
    const bx = bestHop % nav.cols, bz = Math.floor(bestHop / nav.cols);
    const best = this.navCellToWorld(bx, bz, nav);
    const dx = best.x - e.x, dz = best.z - e.z;
    const d = Math.hypot(dx, dz) || 1;
    const blocker = this.findWallOnRay(e.x, e.z, { x: dx / d, z: dz / d }, d + radius + .45);
    if (blocker?.obstacle?.kind === 'fakeWall' && blocker.obstacle.alive) {
      e.breakTarget = blocker.obstacle;
      const hit = this.closestPointOnObstacle(e.breakTarget, e.x, e.z);
      const bdx = hit.x - e.x, bdz = hit.z - e.z;
      const bd = Math.hypot(bdx, bdz) || 1;
      return { x: bdx / bd, z: bdz / bd, avoiding: true, breakWall: e.breakTarget };
    }
    // 확정 다음 칸조차 영구 벽이나 모서리 여유 공간 때문에 도달할 수 없다면
    // 잘못된 흐름 방향을 고집하지 않고 즉시 정밀 A*로 넘긴다.
    if (blocker || !this.lineClear2D(e.x, e.z, best.x, best.z, radius)) return null;
    return { x: dx / d, z: dz / d, avoiding: true };
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

  nearestReachableWalkableCell(x, z, nav, probeRadius = .45, maxR = 7, allowDisconnectedFallback = true) {
    const raw = this.navWorldToCell(x, z, nav);
    if (nav.walkable[raw.i]) return raw;
    let best = null;
    let bestD = Infinity;
    for (let r = 1; r <= maxR; r++) {
      for (let dz = -r; dz <= r; dz++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue;
          const ix = raw.ix + dx, iz = raw.iz + dz;
          if (ix < 0 || iz < 0 || ix >= nav.cols || iz >= nav.rows) continue;
          const i = iz * nav.cols + ix;
          if (!nav.walkable[i]) continue;
          const point = this.navCellToWorld(ix, iz, nav);
          const d = dist2(x, z, point.x, point.z);
          if (d >= bestD || !this.lineClear2D(x, z, point.x, point.z, probeRadius)) continue;
          bestD = d;
          best = { ix, iz, i };
        }
      }
      if (best) return best;
    }
    // 일반 추적은 동적 벽에 끼인 적을 복구하기 위해 가까운 셀로 폴백할 수 있지만,
    // 스폰 검증에서는 벽을 통과해야만 닿는 셀을 같은 연결 구역으로 인정하면 안 된다.
    return allowDisconnectedFallback ? this.nearestWalkableCell(raw.ix, raw.iz, nav, maxR) : null;
  }

  lineClear2D(ax, az, bx, bz, radius = .62) {
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz);
    if (len < .001) return true;
    const steps = Math.ceil(len / Math.max(.34, Math.min(.60, radius * .62)));
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
    const start = nav.walkable[startRaw.i] ? startRaw : this.nearestReachableWalkableCell(sx, sz, nav, Math.max(.40, radius - .18), 6);
    const goal = nav.walkable[goalRaw.i] ? goalRaw : this.nearestReachableWalkableCell(tx, tz, nav, WORLD.PLAYER_RADIUS, 8);
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
    gScore[start.i] = 0;
    fScore[start.i] = heuristic(start.ix, start.iz);
    push(start.i); opened[start.i] = 1;
    let found = -1;
    let loops = 0;
    const searchLimit = Math.min(18000, Math.max(5200, Math.ceil(total * 1.35)));
    while (heap.length && loops++ < searchLimit) {
      const cur = pop();
      if (closed[cur]) continue;
      if (cur === goal.i) { found = cur; break; }
      closed[cur] = 1;
      const cx = cur % nav.cols, cz = Math.floor(cur / nav.cols);
      for (let k = 0; k < NAV_DIRS.length; k++) {
        const [dx, dz, cost] = NAV_DIRS[k];
        const nx = cx + dx, nz = cz + dz;
        if (nx < 0 || nz < 0 || nx >= nav.cols || nz >= nav.rows) continue;
        const ni = nz * nav.cols + nx;
        if (!nav.walkable[ni] || closed[ni]) continue;
        const edgeType = nav.links?.[cur * NAV_DIRS.length + k] || 0;
        if (!edgeType) continue;
        // 설치 벽은 막힌 셀로 버리지 않고 높은 비용으로 둔다. 열린 우회로가 짧으면
        // 우회하고, 통로가 완전히 봉쇄됐거나 우회가 지나치게 길면 벽을 부순다.
        const breakPenalty = edgeType === 2 || nav.walkable[ni] === 2 ? 6.5 : 1;
        const tentative = gScore[cur] + cost * breakPenalty;
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
    while (cur >= 0 && cur !== start.i && cells.length < total) {
      cells.push(cur);
      cur = came[cur];
    }
    if (cur !== start.i) return null;
    cells.reverse();

    // 실제로 직선 이동 가능한 셀까지만 묶는다. 단순히 일정 간격의 셀만 남기면
    // 긴 미로에서 압축된 두 점 사이에 벽이 끼어 적이 다시 벽면으로 향할 수 있다.
    // 처음 몇 칸은 촘촘히 보존하고, 이후에도 충돌 검사를 통과한 구간만 압축한다.
    const points = [];
    let anchor = { x: sx, z: sz };
    let cursor = 0;
    const maxLookAhead = Math.max(10, Math.ceil(cells.length / 108));
    while (cursor < cells.length && points.length < 220) {
      let bestIndex = cursor;
      let bestPoint = null;
      const limit = Math.min(cells.length - 1, cursor + maxLookAhead);
      for (let i = cursor; i <= limit; i++) {
        const c = cells[i];
        const point = this.navCellToWorld(c % nav.cols, Math.floor(c / nav.cols), nav);
        if (!this.lineClear2D(anchor.x, anchor.z, point.x, point.z, radius)) break;
        bestIndex = i;
        bestPoint = point;
        if (points.length < 4 && i === cursor) break;
      }
      if (!bestPoint) {
        const c = cells[cursor];
        bestPoint = this.navCellToWorld(c % nav.cols, Math.floor(c / nav.cols), nav);
      }
      points.push(bestPoint);
      anchor = bestPoint;
      cursor = Math.max(cursor + 1, bestIndex + 1);
    }
    if (cursor < cells.length) {
      // 극단적으로 굴곡이 많은 사용자 설치 벽 배치에서는 잘린 경로를 쓰지 않는다.
      // 다음 AI 틱에서 다른 공유 경로/파괴 경로를 선택하도록 명시적으로 실패시킨다.
      return null;
    }
    return points;
  }

  getBoundaryDetourSteering(e, tx, tz, radius) {
    const dx = tx - e.x, dz = tz - e.z;
    const d = Math.hypot(dx, dz) || 1;
    const nx = dx / d, nz = dz / d;
    const blocker = this.findWallOnRay(e.x, e.z, { x: nx, z: nz }, Math.min(d, 18));
    const obstacle = blocker?.obstacle;
    const tNow = now();

    if (obstacle && obstacle.alive && obstacle.kind !== 'fakeWall') {
      // 경로망이 특수한 모서리에서 실패해도 벽을 향해 정지하지 않는다. 벽의 긴 축을
      // 접선으로 삼아 한 방향을 일정 시간 고정하고 실제 벽 끝까지 이동한다.
      const horizontal = obstacle.w >= obstacle.d;
      const tangent = horizontal ? { x: 1, z: 0 } : { x: 0, z: 1 };
      const options = [];
      for (const sign of [-1, 1]) {
        const sx = tangent.x * sign, sz = tangent.z * sign;
        let clearDistance = 0;
        for (const probe of [1.4, 2.5, 4.0, 5.8]) {
          if (!this.lineClear2D(e.x, e.z, e.x + sx * probe, e.z + sz * probe, radius)) break;
          clearDistance = probe;
        }
        if (clearDistance < 1.3) continue;
        const px = e.x + sx * clearDistance, pz = e.z + sz * clearDistance;
        let score = Math.hypot(tx - px, tz - pz) - clearDistance * .12;
        if (e.detourObstacle === obstacle && e.detourSign === sign && tNow < (e.detourUntil || 0)) score -= 2.4;
        // 비용이 같은 양쪽 끝에는 적을 분산해 한쪽 코너에 전부 몰리지 않게 한다.
        if (((Number(e.id) || 0) & 1) === (sign > 0 ? 1 : 0)) score -= .16;
        options.push({ sign, x: sx, z: sz, score });
      }
      if (options.length) {
        options.sort((a, b) => a.score - b.score);
        const best = options[0];
        e.detourObstacle = obstacle;
        e.detourSign = best.sign;
        e.detourUntil = tNow + 2.4;
        return { x: best.x, z: best.z, avoiding: true, boundaryDetour: true };
      }
    }

    // 벽 정보가 모호한 겹친 모서리에서는 여러 각도를 탐색하되, 이전에 택한 쪽을
    // 우선해 프레임마다 좌우가 뒤집히는 진동을 막는다.
    const base = Math.atan2(nz, nx);
    const preferred = e.steerSide || (((Number(e.id) || 0) & 1) ? 1 : -1);
    const offsets = [preferred * Math.PI/3, -preferred * Math.PI/3, preferred * Math.PI/2, -preferred * Math.PI/2, Math.PI];
    let best = null;
    for (const offset of offsets) {
      const sx = Math.cos(base + offset), sz = Math.sin(base + offset);
      const probe = 2.6;
      if (!this.lineClear2D(e.x, e.z, e.x + sx * probe, e.z + sz * probe, radius)) continue;
      const score = Math.hypot(tx - (e.x + sx * probe), tz - (e.z + sz * probe));
      if (!best || score < best.score) best = { x: sx, z: sz, score, side: offset >= 0 ? 1 : -1 };
    }
    if (best) {
      e.steerSide = best.side;
      return { x: best.x, z: best.z, avoiding: true, boundaryDetour: true };
    }
    return null;
  }

  getEnemySteering(e, tx, tz, dt) {
    let dx = tx - e.x;
    let dz = tz - e.z;
    let d = Math.hypot(dx, dz) || 1;
    let nx = dx / d, nz = dz / d;
    // 실제 충돌 반경보다 과도하게 큰 0.8m 고정 반경은 좁지만 통과 가능한 문을
    // 내비게이션에서 완전히 지워 버렸다. 적 크기에 맞춘 여유 반경을 사용한다.
    const radius = Math.max(.62, e.radius + .12);

    // 앞길이 뚫려 있으면 불필요한 경로 계산 없이 바로 추적한다.
    if (this.lineClear2D(e.x, e.z, tx, tz, radius)) {
      e.navPath = null;
      e.navIndex = 0;
      e.aiPathTimer = 0;
      e.detourObstacle = null;
      e.detourUntil = 0;
      if (!e.breakTarget?.alive) e.breakTarget = null;
      return { x: nx, z: nz, avoiding: false };
    }

    const targetMoved = !e.navTarget || dist2(tx, tz, e.navTarget.x, e.navTarget.z) > 1.45 * 1.45;
    const navDirty = e.navVersion !== (this.navVersion || 1);
    e.aiPathTimer = Math.max(0, (e.aiPathTimer || 0) - dt);

    // 플레이어가 설치 벽으로 둘러싸였거나 통로가 완전히 막혔을 때는 A*가 실패할 수 있다.
    // 실패 직후 모든 적이 다시 A*를 반복하면 렉이 커지므로, 짧은 실패 캐시를 둔다.
    const tNow = now();
    const stallPressure = Math.max(e.stuckTime || 0, e.progressStall || 0);

    // 공유 흐름 지도는 평상시의 저비용 추적에만 쓴다. 한 번 정밀 A* 경로를 얻은 적은
    // 그 경로를 벽 끝까지 유지해야 한다. 종전에는 다음 틱의 흐름 지도가 navPath를 지워
    // 적이 다시 벽 정면으로 돌아가던 것이 핵심 우회 실패 원인이었다.
    if ((!e.navPath || !e.navPath.length) && stallPressure < .42) {
      const sharedSteering = this.getFlowSteering(e, tx, tz, radius);
      if (sharedSteering) return sharedSteering;
    }

    const failCacheValid = e.navFailedUntil && tNow < e.navFailedUntil && e.navFailTarget && dist2(tx, tz, e.navFailTarget.x, e.navFailTarget.z) < 2.6 * 2.6 && !navDirty;
    if (failCacheValid && (!e.navPath || !e.navPath.length)) {
      e.aiPathTimer = Math.max(e.aiPathTimer || 0, .35);
    } else if (targetMoved || navDirty || e.aiPathTimer <= 0 || !e.navPath || !e.navPath.length || (stallPressure > .42 && tNow >= (e.navCommitUntil || 0))) {
      const path = this.findNavPath(e.x, e.z, tx, tz, radius);
      e.navPath = path || null;
      e.navIndex = 0;
      e.navTarget = { x: tx, z: tz };
      e.navVersion = this.navVersion || 1;
      e.aiPathTimer = path ? rand(1.25, 1.90) : rand(.72, 1.12);
      if (path) {
        e.stuckTime = Math.max(0, (e.stuckTime || 0) - .38);
        e.progressStall = Math.max(0, (e.progressStall || 0) - .38);
        e.navCommitUntil = tNow + 2.35;
      }
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

      // A*가 파괴 가능 벽을 통과하는 편이 낫다고 판단한 경우, 벽 앞에서 멈춰
      // 재탐색만 하지 않고 해당 벽을 명시적인 공격 목표로 넘긴다.
      const wdx0 = wp.x - e.x, wdz0 = wp.z - e.z;
      const wd0 = Math.hypot(wdx0, wdz0) || 1;
      const pathBlocker = this.findWallOnRay(e.x, e.z, { x: wdx0 / wd0, z: wdz0 / wd0 }, wd0 + radius + .5);
      if (pathBlocker?.obstacle?.kind === 'fakeWall' && pathBlocker.obstacle.alive) {
        e.breakTarget = pathBlocker.obstacle;
        const hit = this.closestPointOnObstacle(e.breakTarget, e.x, e.z);
        const bdx = hit.x - e.x, bdz = hit.z - e.z;
        const bd = Math.hypot(bdx, bdz) || 1;
        return { x: bdx / bd, z: bdz / bd, avoiding: true, breakWall: e.breakTarget };
      }

      if (!this.lineClear2D(e.x, e.z, wp.x, wp.z, radius)) {
        // 다음 경유지가 동적으로 막혀도 0벡터로 정지하지 않는다. 재탐색을 예약하면서
        // 현재 벽의 접선 방향으로 즉시 빠져나가, 적 무리가 같은 벽면에 고정되지 않게 한다.
        e.aiPathTimer = 0;
        e.navPath = null;
        e.navIndex = 0;
        const emergency = this.getBoundaryDetourSteering(e, tx, tz, radius);
        if (emergency) return emergency;
        return { x: -nz, z: nx, avoiding: true, boundaryDetour: true };
      }

      const wdx = wp.x - e.x, wdz = wp.z - e.z;
      const wd = Math.hypot(wdx, wdz) || 1;
      return { x: wdx / wd, z: wdz / wd, avoiding: true };
    }

    // 길이 완전히 막힌 경우에는 플레이어까지의 총 이동거리가 가장 짧아지는 설치 벽을
    // 찾아 공격한다. 이것도 없을 때만 짧게 좌우 탐색한다.
    const breakWall = this.findStrategicBreakableWall(e, tx, tz);
    if (breakWall) {
      e.breakTarget = breakWall;
      const hit = this.closestPointOnObstacle(breakWall, e.x, e.z);
      const bdx = hit.x - e.x, bdz = hit.z - e.z;
      const bd = Math.hypot(bdx, bdz) || 1;
      return { x: bdx / bd, z: bdz / bd, avoiding: true, breakWall };
    }

    const detour = this.getBoundaryDetourSteering(e, tx, tz, radius);
    if (detour) return detour;
    return { x: 0, z: 0, avoiding: true };
  }

  findStrategicBreakableWall(e, tx, tz) {
    let best = null;
    let bestScore = Infinity;
    for (const o of this.obstacles || []) {
      if (!o.alive || o.kind !== 'fakeWall') continue;
      const near = this.closestPointOnObstacle(o, e.x, e.z);
      const approach = Math.hypot(near.x - e.x, near.z - e.z);
      if (approach > 24) continue;
      const onward = Math.hypot(o.x - tx, o.z - tz);
      const durability = clamp((o.hp || 1) / Math.max(1, o.maxHp || o.hp || 1), 0, 1);
      const score = approach + onward * .34 + durability * 2.2;
      if (score < bestScore) { bestScore = score; best = o; }
    }
    return best;
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
      const mesh = this.createCasterOrb();
      mesh.position.set(e.x + sx * .45, 1.22, e.z + sz * .45);
      this.scene.add(mesh);
      this.projectiles.push({ kind: 'fireball', mesh, x: mesh.position.x, z: mesh.position.z, y: mesh.position.y, vx: sx * 10.5, vz: sz * 10.5, vy: 0, life: 3.2, radius: 3.8, damage: 18 * this.diff.enemyDamage });
      this.playWorldSound(e.x,e.z,()=>this.audio.devilCast());
    }
  }

  createCasterOrb() {
    if (this.quality?.simpleModels) return new THREE.Mesh(this.geos.sphere, this.materials.casterOrb);
    const group = new THREE.Group();
    const shell = new THREE.Mesh(this.geos.sphere, this.materials.casterShell);
    shell.scale.setScalar(1.34);
    const core = new THREE.Mesh(this.geos.sphere, this.materials.casterCore);
    core.scale.setScalar(.62);
    group.add(shell, core);
    group.userData.casterOrb = true;
    return group;
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
    this.moveEntity(e, dx, dz, e.radius);
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) {
      if (p.dead) continue;
      if (p.networked) { p.mesh.rotation.x += dt * 8; p.mesh.rotation.y += dt * 6; continue; }
      p.life -= dt;
      const startX = p.x, startZ = p.z;
      const endX = p.x + p.vx * dt, endZ = p.z + p.vz * dt;
      const hit = this.traceProjectileSegment(p, startX, startZ, endX, endZ);
      if (!hit) { p.x = endX; p.z = endZ; }
      if (p.kind === 'grenade') { p.vy -= 9.8 * dt; p.y += p.vy * dt; if (p.y < .35) { p.y = .35; p.vy *= -.42; p.vx *= .82; p.vz *= .82; } }
      p.mesh.position.set(p.x, p.y, p.z);
      p.mesh.rotation.x += dt * 8; p.mesh.rotation.y += dt * 6;
      if (!p.dead && p.life <= 0) this.detonateProjectile(p);
    }
    this.projectiles = this.projectiles.filter(p => {
      if (!p.dead) return true;
      if (p.mesh.parent) this.scene.remove(p.mesh);
      return false;
    });
  }

  traceProjectileSegment(p, startX, startZ, endX, endZ) {
    const length = Math.hypot(endX - startX, endZ - startZ);
    const stepSize = p.kind === 'rocket' ? .18 : .22;
    const steps = clamp(Math.ceil(length / stepSize), 1, 32);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = startX + (endX - startX) * t;
      const z = startZ + (endZ - startZ) * t;
      const wall = this.getObstacleAt(x, z, .24);
      if (wall) {
        p.x = x; p.z = z;
        if (p.kind === 'fireball') this.damageWall(wall, 34, 'fireball', { x, y: p.y, z });
        this.detonateProjectile(p);
        return { kind: 'wall', wall, x, z };
      }
      if (p.kind === 'fireball' && dist2(x, z, this.player.x, this.player.z) < 1.1) {
        p.x = x; p.z = z;
        this.damagePlayer(p.damage, p, 'fireball');
        this.detonateProjectile(p);
        return { kind: 'player', x, z };
      }
      if (p.kind === 'fireball') {

      }
      if (p.kind === 'rocket') {
        const enemy = this.enemies.find(e => e.alive && dist2(x, z, e.x, e.z) < (e.radius + .35) ** 2);
        if (enemy) {
          p.x = x; p.z = z;
          this.detonateProjectile(p);
          return { kind: 'enemy', enemy, x, z };
        }
      }
    }
    return null;
  }

  detonateProjectile(p) {
    if (p.dead) return;
    p.dead = true;
    if (p.kind === 'fireball') { this.playWorldSound(p.x,p.z,()=>this.audio.fireballExplode()); this.explode(p.x, p.z, 2.5, 0, false, COLORS.casterExplosion); }
    else this.explode(p.x, p.z, p.radius, p.damage, true);
  }

  updatePlaceables(dt) {
    for (const b of this.placeables) {
      if (!b.alive) continue;
      if (b.networked) { if (b.kind === 'barrel') b.mesh.rotation.y += dt * .08; continue; }
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

  explode(x, z, radius, damage, hurtsEnemies = true, fxColor = 0xff7744) {
    if (!this.quality?.simpleModels) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, .05, 18), new THREE.MeshBasicMaterial({ color: fxColor, transparent: true, opacity: .5 }));
      ring.position.set(x, .07, z); this.scene.add(ring);
      this.fx.push({ mesh: ring, life: .28, max: .28, scaleOut: true });
    }
    if (damage > 0) this.playWorldSound(x,z,()=>this.audio.explosion());
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
    if (!this.quality?.simpleModels) {
      e.mesh.scale.setScalar(1 + clamp(amount / 180, .035, .16));
      setTimeout(() => { if (e.mesh && e.alive) e.mesh.scale.setScalar(1); }, 55);
    }
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
    if (this.quality?.simpleModels) return;
    if (e.type === 'devil') return;
    const maxPatches = Math.max(1, Math.round((source === 'explosion' ? 10 : 7) * Math.max(.25, this.quality?.fx ?? 1)));
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
    if (this.quality?.simpleModels) return;
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
    const basePieces = [
      { y: 1.58, s: [.42,.42,.42], m: 0 }, { y: .92, s: [.52,.50,.36], m: 1 },
      { y: .70, s: [.18,.42,.20], m: 1 }, { y: .70, s: [.18,.42,.20], m: 1 },
      { y: .28, s: [.22,.34,.22], m: 1 }, { y: .28, s: [.22,.34,.22], m: 1 },
      { y: .09, s: [.32,.12,.38], m: 3 }, { y: .09, s: [.32,.12,.38], m: 3 },
      { y: 1.50, s: [.30,.18,.04], m: e.type === 'devil' ? 2 : 2 }
    ];
    const pieceCount = Math.max(2, Math.round(basePieces.length * Math.max(.22, this.quality?.fx ?? 1)));
    const pieces = basePieces.slice(0, pieceCount);
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
    this.playWorldSound(e.x,e.z,()=>this.audio.enemyDeath(e.type));
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
    if (this.quality?.simpleModels) {
      const mesh = new THREE.Mesh(this.geos.lowBox, kind === 'health' ? this.materials.itemHealth : this.materials.itemBox);
      mesh.position.y = .34;
      mesh.scale.set(.82, .58, .82);
      return mesh;
    }
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
    return this.findDeterministicSafePoint(1.2, {
      originX: this.player.x,
      originZ: this.player.z + 3,
      requireRoute: true
    });
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
    const maxFx = this.quality?.maxFx || 130;
    if (this.fx.length > maxFx) {
      const overflow = this.fx.splice(0, this.fx.length - maxFx);
      for (const f of overflow) if (f.mesh?.parent) this.scene.remove(f.mesh);
    }
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
    const motionScale = this.accessibility?.cameraMotion === 'off' ? 0 : (this.accessibility?.cameraMotion === 'reduced' ? .25 : 1);
    const trauma = clamp(actual / 58, .10, .62) * motionScale;
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

    const motionScale = this.accessibility?.cameraMotion === 'off' ? 0 : (this.accessibility?.cameraMotion === 'reduced' ? .25 : 1);
    if (dt && this.moveIntensity > .05 && motionScale > 0) {
      this.bobPhase += dt * 9.8 * this.moveIntensity;
    }
    this.weaponKick = Math.max(0, this.weaponKick - dt * .9);
    const activeBob = this.player.grounded ? this.moveIntensity : 0;
    const bobY = activeBob > .05 ? Math.sin(this.bobPhase * 2) * .030 * activeBob * motionScale : 0;
    const bobSide = activeBob > .05 ? Math.cos(this.bobPhase) * .018 * activeBob * motionScale : 0;
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

    if (this.viewWeapon) this.viewWeapon.visible = true;

    if (this.viewWeapon) {
      const reloadPhase = this.reload?.active ? 1 - clamp(this.reload.timer / Math.max(.01, this.reload.duration), 0, 1) : 0;
      const reloadWave = reloadPhase > 0 ? Math.sin(reloadPhase * Math.PI) : 0;
      const reloadRoll = reloadPhase > 0 ? Math.sin(reloadPhase * Math.PI * 2) * .06 : 0;
      const hipX = .34 + bobSide * .55 - reloadWave * .08;
      const hipY = -.33 - this.weaponKick + bobY * .45 - reloadWave * .16;
      const hipZ = -.78 + this.weaponKick * .18 + reloadWave * .09;
      const adsX = .015 + bobSide * .10 - reloadWave * .015;
      const adsY = -.235 - this.weaponKick * .34 + bobY * .18 - reloadWave * .08;
      const adsZ = -.62 + this.weaponKick * .06 + reloadWave * .04;
      this.viewWeapon.position.set(
        hipX + (adsX - hipX) * this.ads,
        hipY + (adsY - hipY) * this.ads,
        hipZ + (adsZ - hipZ) * this.ads
      );
      const hipRx = -.06 - this.weaponKick * .35 - reloadWave * .18;
      const hipRy = -.08 + bobSide * .65 + reloadRoll;
      const adsRx = -.01 - this.weaponKick * .18 - reloadWave * .08;
      const adsRy = reloadRoll * .45;
      this.viewWeapon.rotation.set(
        hipRx + (adsRx - hipRx) * this.ads,
        hipRy + (adsRy - hipRy) * this.ads,
        reloadWave * -.08
      );
      if (this.viewLeftHand) {
        this.viewLeftHand.rotation.x = reloadWave * .55;
        this.viewLeftHand.rotation.z = reloadWave * -.42;
      }
      if (this.viewRightHand) {
        this.viewRightHand.rotation.x = reloadWave * .22;
        this.viewRightHand.rotation.z = reloadWave * .20;
      }
      if (this.viewForearm) {
        this.viewForearm.rotation.y = reloadRoll * -.9;
      }
    }
  }

  moveEntity(entity, dx, dz, radius) {
    // 한 프레임의 끝점만 검사하면 낮은 FPS 또는 속도 강화가 누적된 장기 런에서
    // 얇은 벽 반대편으로 건너뛸 수 있다. 반경보다 작은 구간으로 나눠 이동한다.
    const distance = Math.hypot(dx, dz);
    const maxStep = Math.max(.18, Math.min(.34, radius * .72));
    const steps = clamp(Math.ceil(distance / maxStep), 1, 32);
    const sx = dx / steps, sz = dz / steps;
    let blockedX = false, blockedZ = false;
    for (let i = 0; i < steps; i++) {
      if (!this.collides(entity.x + sx, entity.z, radius)) entity.x += sx;
      else blockedX = true;
      if (!this.collides(entity.x, entity.z + sz, radius)) entity.z += sz;
      else blockedZ = true;
    }
    if (entity === this.player) {
      if (blockedX) entity.vx = 0;
      if (blockedZ) entity.vz = 0;
    }
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
    UI.waveText.textContent = (this.prepPhase ? `Prep ${Math.ceil(this.prepTimer)}s` : `Wave ${this.wave}`);
    const alive = this.enemies.filter(e => e.alive).length + this.spawnQueue;
    UI.aliveText.textContent = this.currentMission?.type === 'survive' ? `${this.enemies.filter(e => e.alive).length} active` : `${alive} left`;
    if (UI.objectiveText) {
      const obj = this.prepPhase ? '정비 시간: 보상/아이템/벽 설치' : this.missionObjectiveText();
      UI.objectiveText.textContent = obj;
      UI.objectiveText.classList.toggle('danger', !!obj && obj !== '정비 시간: 보상/아이템/벽 설치');
    }
    UI.scoreText.textContent = this.score.toLocaleString('ko-KR');
    this.updateMissionHud();
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
    if(this.rewardOpen || this.prepPhase)return;
    this.waveBreak=0;this.cleanupObjectiveCores(false);this.cleanupMissionTargets();
    const m=this.currentMission,bonus=this.missionState?.bonusComplete?m.bonusScore:0;
    this.score+=m.completionScore+bonus;this.missionsCleared=(this.missionsCleared||0)+1;if(bonus)this.bonusesCleared=(this.bonusesCleared||0)+1;
    this.hp=Math.min(this.maxHp,this.hp+8);this.medkits=Math.min(this.maxMedkits,this.medkits+8);
    for(const w of WEAPON_DEFS)if(this.unlocked.has(w.id)&&Number.isFinite(w.ammoMax))this.ammo[w.id]=Math.min(w.ammoMax,this.ammo[w.id]+Math.ceil(w.ammoMax*.15));
    this.dropSupply(true);this.showRewardChoices();
    if(UI.rewardSubtitle)UI.rewardSubtitle.textContent='목표 보상 +'+m.completionScore+(bonus?' · 추가 목표 +'+bonus:' · 추가 목표 미달성')+' · 체력과 탄약을 보급했습니다.';
  }

  rewardPool() {
    return [
      { id: 'maxHp', icon: '♥', category: '생존', maxStacks: 8, title: '최대 체력 +10', desc: '즉시 10 회복하고 최대 HP가 늘어난다.', apply: () => { this.maxHp += 10; this.hp = Math.min(this.maxHp, this.hp + 10); } },
      { id: 'stamina', icon: '⚡', category: '기동', maxStacks: 6, title: '스태미너 +15', desc: '달릴 수 있는 시간이 늘어난다.', apply: () => { this.player.maxStamina += 15; this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 15); } },
      { id: 'speed', icon: '»', category: '기동', maxStacks: 6, title: '이동 속도 +4%', desc: '걷기와 달리기 속도가 조금 빨라진다.', apply: () => { this.upgrades.speed += .04; this.player.speed *= 1.04; this.player.sprint *= 1.04; } },
      { id: 'regen', icon: '↻', category: '기동', maxStacks: 5, title: '스태미너 회복 +20%', desc: '걷거나 멈춰 있는 동안의 스태미너 회복 속도가 더 빨라진다.', apply: () => { this.upgrades.staminaRegen += .20; this.player.staminaRegen *= 1.20; } },
      { id: 'damage', icon: '✦', category: '화력', maxStacks: 8, title: '무기 데미지 +8%', desc: '총, 폭발, 레일건의 기본 화력이 오른다.', apply: () => { this.upgrades.damage *= 1.08; } },
      { id: 'headshot', icon: '◎', category: '정밀', maxStacks: 5, title: '헤드샷 데미지 +20%', desc: '머리를 맞혔을 때 보상이 커진다.', apply: () => { this.upgrades.headshot *= 1.20; } },
      { id: 'wallHp', icon: '▣', category: '방어', maxStacks: 5, title: '설치 벽 체력 +25%', desc: '앞으로 설치하는 벽이 더 오래 버틴다.', apply: () => { this.upgrades.wallHp *= 1.25; } },
      { id: 'ammo', icon: '▥', category: '보급', maxStacks: 4, title: '탄약 보급 +25%', desc: '상자에서 얻는 탄약량이 증가한다.', apply: () => { this.upgrades.ammoGain *= 1.25; } },
      { id: 'reload', icon: '↯', category: '화력', maxStacks: 5, title: '재장전 속도 +12%', desc: '모든 무기의 재장전 시간이 조금 짧아진다.', apply: () => { this.upgrades.reload = (this.upgrades.reload || 1) * .88; } },
      { id: 'kit', icon: '+', category: '생존', maxStacks: 6, title: '회복키트 저장 +10', desc: '회복키트 저장 한도가 늘어난다.', apply: () => { this.maxMedkits = Math.min(160, this.maxMedkits + 10); this.upgrades.medkitMax += 10; } },
      { id: 'shotgunBreach', icon: '◆', category: '무기 개조', maxStacks: 1, title: '샷건 · 돌파탄', desc: '샷건 피해 +22%, 파괴 가능한 벽 피해 +65%.', apply: () => { this.upgrades.shotgunBreach = true; } },
      { id: 'railOvercharge', icon: '⌁', category: '무기 개조', maxStacks: 1, title: '레일 · 과충전', desc: '레일 피해 +18%, 관통 대상이 1명 늘어난다.', apply: () => { this.upgrades.railOvercharge = true; } },
      { id: 'rocketPayload', icon: '◉', category: '무기 개조', maxStacks: 1, title: '로켓 · 확장 탄두', desc: '로켓 폭발 반경이 18% 넓어진다.', apply: () => { this.upgrades.rocketPayload = true; } },
      { id: 'fieldHeal', icon: '✚', category: '긴급 보급', repeatable: true, title: '현장 응급처치', desc: '체력을 최대 체력의 35%만큼 회복한다.', apply: () => { this.hp = Math.min(this.maxHp, this.hp + this.maxHp * .35); } },
      { id: 'ammoCache', icon: '▤', category: '긴급 보급', repeatable: true, title: '탄약 캐시', desc: '해금된 모든 유한 탄약을 최대치의 22% 보급한다.', apply: () => {
        for (const def of WEAPON_DEFS) if (this.unlocked.has(def.id) && Number.isFinite(def.ammoMax)) this.ammo[def.id] = Math.min(def.ammoMax, (this.ammo[def.id] || 0) + Math.ceil(def.ammoMax * .22));
      } },
      { id: 'medkitCache', icon: '▰', category: '긴급 보급', repeatable: true, title: '회복키트 보급', desc: '회복키트 저장량을 18만큼 채운다.', apply: () => { this.medkits = Math.min(this.maxMedkits, (this.medkits || 0) + 18); } }
    ].filter(reward => this.isRewardEligible(reward.id) && !this.rewardIsCapped(reward));
  }

  isRewardEligible(rewardId) {
    // 설치 벽은 Wave 6에 실제 무기로 해금된다. 소유하지 않은 기능의 강화가
    // 먼저 등장하지 않도록 로컬·서버 보상 후보 모두 같은 선행 조건을 사용한다.
    if (rewardId === 'wallHp' && !this.unlocked?.has('wall')) return false;
    if (rewardId === 'shotgunBreach' && !this.unlocked?.has('shotgun')) return false;
    if (rewardId === 'railOvercharge' && !this.unlocked?.has('railgun')) return false;
    if (rewardId === 'rocketPayload' && !this.unlocked?.has('rocket')) return false;
    return true;
  }

  rewardIsCapped(reward) {
    return !!reward?.maxStacks && (this.rewardStacks?.[reward.id] || 0) >= reward.maxStacks;
  }

  pickRewardChoices(pool, count = 3) {
    const available = pool.filter(r => !this.rewardIsCapped(r));
    const fresh = available.filter(r => !this.lastRewardOfferIds.includes(r.id));
    const candidates = fresh.length >= count ? fresh : available;
    const shuffled = [...candidates];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const picked = shuffled.slice(0, count);
    this.lastRewardOfferIds = picked.map(r => r.id);
    return picked;
  }

  showRewardChoices() {
    this.serverRewardMode = false;
    this.rewardOpen = true;
    this.prepPhase = false;
    this.prepTimer = 0;
    this.mobile?.setGameplayActive(false);
    try { document.exitPointerLock?.(); } catch (_) {}
    const pool = this.pickRewardChoices(this.rewardPool(), 3);
    if (UI.rewardTitle) UI.rewardTitle.textContent = (`Wave ${this.wave} Clear`);
    if (UI.rewardSubtitle) UI.rewardSubtitle.textContent = ('업그레이드를 선택한 뒤 적용하세요. Wave 10부터 10웨이브마다 안전하게 탈출해 기록을 확정할 수 있습니다.');
    const canExtract = this.wave >= 10 && this.wave % 10 === 0;
    if (UI.rewardExtract) UI.rewardExtract.hidden = !canExtract;
    UI.reward?.classList.toggle('can-extract', canExtract);
    this.renderRewardChoices(pool);
    UI.reward?.classList.add('show');
    this.audio.cue('complete');
  }

  usesMobileRewardConfirmation() {
    return true;
  }

  resetRewardSelection() {
    this.pendingReward = null;
    if (UI.rewardConfirm) {
      UI.rewardConfirm.disabled = true;
      UI.rewardConfirm.textContent = '업그레이드 선택 후 적용';
    }
    for (const choice of UI.rewardChoices?.querySelectorAll?.('.reward-choice') || []) {
      choice.classList.remove('selected');
      choice.setAttribute('aria-pressed', 'false');
    }
  }

  selectReward(reward, button = null) {
    if (!this.rewardOpen || !reward) return;
    this.pendingReward = reward;
    for (const choice of UI.rewardChoices?.querySelectorAll?.('.reward-choice') || []) {
      const selected = choice === button || choice.dataset.rewardId === reward.id;
      choice.classList.toggle('selected', selected);
      choice.setAttribute('aria-pressed', selected ? 'true' : 'false');
    }
    if (UI.rewardConfirm) {
      UI.rewardConfirm.disabled = false;
      UI.rewardConfirm.textContent = '선택한 업그레이드 적용';
    }
    this.audio.beep(520, .055, 'triangle', .022);
  }

  confirmRewardSelection() {
    if (!this.rewardOpen || !this.pendingReward || UI.rewardConfirm?.disabled) return;
    this.chooseReward(this.pendingReward);
  }

  renderRewardChoices(choices = []) {
    if (UI.rewardChoices) {
      UI.rewardChoices.innerHTML = '';
      for (const r of choices) {
        const btn = document.createElement('button');
        btn.className = 'reward-choice';
        btn.type = 'button';
        btn.dataset.rewardId = r.id || '';
        btn.setAttribute('aria-pressed', 'false');
        const stack = r.repeatable ? '즉시 사용' : `${this.rewardStacks?.[r.id] || 0}/${r.maxStacks || '∞'}`;
        btn.innerHTML = `<i class="reward-icon" aria-hidden="true">${r.icon || '✦'}</i><small>${r.category || '강화'} · ${stack}</small><b>${r.title}</b><span>${r.desc}</span>`;
        const activate = (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (this.usesMobileRewardConfirmation()) this.selectReward(r, btn);
          else this.chooseReward(r);
        };
        btn.addEventListener('click', activate);
        UI.rewardChoices.appendChild(btn);
      }
    }
    this.resetRewardSelection();
  }

  chooseReward(reward) {
    if (!this.rewardOpen) return;
    if (this.usesServerEnemyAuthority() && this.serverRewardMode) {
      this.net.sendAction('chooseReward','pistol',{rewardId:reward?.id || 'skip'});
      this.serverRewardChosen=true;
      this.rewardOpen = false;
      this.resetRewardSelection();
      UI.reward?.classList.remove('show');
      this.showToast(reward?.title ? `${reward.title} 선택 요청` : '보상 건너뜀');
      if (this.isTouchInputActive()) this.mobile?.setGameplayActive(true);
      else this.input.requestLock();
      return;
    }
    if (reward?.apply) {
      reward.apply();
      if (!reward.repeatable) this.rewardStacks[reward.id] = (this.rewardStacks[reward.id] || 0) + 1;
      this.rewardsTaken = (this.rewardsTaken || 0) + 1;
      this.showToast(reward.title);
    } else {
      this.showToast('보상 건너뜀');
    }
    this.rewardOpen = false;
    this.resetRewardSelection();
    UI.reward?.classList.remove('show');
    this.startPrepPhase(8);
    if (this.isTouchInputActive()) this.mobile?.setGameplayActive(true);
    else this.input.requestLock();
  }

  readyForNextLevel() {
    if(!this.prepPhase)return;
    if(this.lobby.mode==='coop'){if(!this.prepVoteSent && this.net.sendAction('skipPrep','pistol')){this.prepVoteSent=true;this.showToast('준비 완료. 친구가 준비하면 다음 레벨을 시작합니다.');}}
    else this.nextWave();
  }

  startPrepPhase(seconds = 10) {
    this.prepPhase = true;
    this.prepTimer = seconds;
    this.spawnQueue = 0;
    this.spawnTimer = 0;
    this.showCenterAlert('정비 시간', (`${Math.ceil(seconds)}초 동안 아이템을 줍고 벽·지뢰를 준비해라.`), 'info', 2.4);
  }

  loadCareer() {
    const fallback = { runs: 0, defeats: 0, extracts: 0, totalKills: 0, totalScore: 0, bestWave: 0, lastOutcome: '' };
    try {
      const saved = JSON.parse(localStorage.getItem('bhfps_career_v47') || '{}') || {};
      const safe = { ...fallback };
      for (const key of ['runs','defeats','extracts','totalKills','totalScore','bestWave']) safe[key] = Math.max(0, Number(saved[key]) || 0);
      safe.lastOutcome = ['defeated','extracted','abandoned'].includes(saved.lastOutcome) ? saved.lastOutcome : '';
      return safe;
    } catch (_) { return fallback; }
  }

  saveCareer() {
    try { localStorage.setItem('bhfps_career_v47', JSON.stringify(this.career)); } catch (_) {}
    this.updateCareerSummary();
  }

  recordCareer(outcome = 'defeated') {
    if (!this.rankedRun) return;
    const c = this.career || this.loadCareer();
    c.runs += 1;
    if (outcome === 'extracted') c.extracts += 1;
    else if (outcome === 'defeated') c.defeats += 1;
    c.totalKills += Math.max(0, this.kills || 0);
    c.totalScore += Math.max(0, this.score || 0);
    c.bestWave = Math.max(c.bestWave || 0, this.wave || 0);
    c.lastOutcome = outcome;
    this.career = c;
    this.saveCareer();
  }

  updateCareerSummary() {
    if (!UI.careerSummary) return;
    const c = this.career || { runs: 0, extracts: 0, totalKills: 0, bestWave: 0 };
    UI.careerSummary.textContent = c.runs
      ? `정규 런 ${c.runs}회 · 탈출 ${c.extracts}회 · 최고 Wave ${c.bestWave} · 누적 처치 ${Math.floor(c.totalKills).toLocaleString('ko-KR')}`
      : '첫 정규 런을 시작하세요. Wave 10 이후 탈출하면 기록을 안전하게 확정할 수 있습니다.';
  }

  exportSaveData() {
    const keys = ['bhfps_settings_v37','bhfps_input_settings_v44','bhfps_mobile_controls_v45','bhfps_best_stats_v24','bhfps_career_v47'];
    const data = {};
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    }
    const payload = { format: 'boxhead-save', version: 100, createdAt: new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `boxhead-save-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }

  async importSaveData(file) {
    if (!file) return;
    try {
      if (file.size > 512 * 1024) throw new Error('저장 파일이 너무 큽니다.');
      const payload = JSON.parse(await file.text());
      if (payload?.format !== 'boxhead-save' || !payload.data || typeof payload.data !== 'object') throw new Error('BOXHEAD 저장 파일이 아닙니다.');
      const allowed = new Set(['bhfps_settings_v37','bhfps_input_settings_v44','bhfps_mobile_controls_v45','bhfps_best_stats_v24','bhfps_career_v47']);
      let restored = 0;
      for (const [key, value] of Object.entries(payload.data)) {
        if (!allowed.has(key) || typeof value !== 'string') continue;
        JSON.parse(value);
        localStorage.setItem(key, value);
        restored++;
      }
      if (!restored) throw new Error('복원할 설정이나 기록이 없습니다.');
      window.location.reload();
    } catch (error) {
      this.showToast(error?.message || '저장 복원에 실패했습니다.');
      if (UI.saveImportFile) UI.saveImportFile.value = '';
    }
  }

  completeRun(outcome='extracted') {
    if(!this.running || this.runEnded)return;
    if(outcome==='extracted' && !(this.wave>=10 && this.wave%10===0))return;
    if(this.lobby.mode==='coop'){this.net.sendAction('extract','pistol');this.serverExtractRequested=true;if(UI.rewardExtract)UI.rewardExtract.textContent='친구의 탈출 동의 대기';this.showToast('탈출 동의 전송. 친구도 탈출하기를 눌러야 합니다.');return;}
    this.rewardOpen=false;this.resetRewardSelection();UI.reward?.classList.remove('show');this.endGame(outcome);
  }

  loadBestStats() {
    try { return JSON.parse(localStorage.getItem('bhfps_best_stats_v24') || '{}') || {}; }
    catch (_) { return {}; }
  }

  saveBestStats() {
    const key = `${this.lobby.mode}_${this.mapKey || 'map'}_${UI.diff?.value || 'normal'}`;
    const prev = this.bestStats?.[key] || (this.lobby.mode==='single'?this.bestStats?.[`${this.mapKey}_${UI.diff?.value || 'normal'}`]:null) || { wave: 0, score: 0, kills: 0, headshots: 0 };
    const current = { wave: this.wave, score: this.score, kills: this.kills || 0, headshots: this.headshots || 0, map: this.map?.label || '', diff: UI.diff?.value || 'normal' };
    const best = {
      wave: Math.max(prev.wave || 0, current.wave),
      score: Math.max(prev.score || 0, current.score),
      kills: Math.max(prev.kills || 0, current.kills),
      headshots: Math.max(prev.headshots || 0, current.headshots),
      map: current.map,
      diff: current.diff
    };
    if (this.rankedRun) {
      this.bestStats = { ...(this.bestStats || {}), [key]: best };
      try { localStorage.setItem('bhfps_best_stats_v24', JSON.stringify(this.bestStats)); } catch (_) {}
    }
    return { current, best };
  }

  runRank() {
    
    if (!this.rankedRun) return '연습 / 기록 제외';
    const w = this.wave || 0;
    const s = this.score || 0;
    if (w >= 20 || s >= 18000) return 'S / 격리 실패';
    if (w >= 15 || s >= 11000) return 'A / 백룸 사냥꾼';
    if (w >= 10 || s >= 6500) return 'B / 청소부';
    if (w >= 6 || s >= 3000) return 'C / 생존자';
    return 'D / 실험체';
  }

  endGame(outcome = 'defeated') {
    if (this.runEnded) return;
    this.runEnded = true;
    this.runOutcome = outcome;
    const record = this.saveBestStats();
    this.recordCareer(outcome);
    this.audio.stopAll();this.audio.cue(outcome==='extracted'?'extracted':'defeated');UI.soundSettings?.classList.remove('show');
    this.gameOver = true;
    this.running = false;this.paused=false;UI.pause?.classList.remove('show');UI.reward?.classList.remove('show');UI.connectionOverlay?.classList.remove('show');this.connectionBlocked=false;
    if(UI.restartBtn)UI.restartBtn.textContent=this.lobby.mode==='coop'?'로비로 돌아가기':'다시 시작';
    this.mobile?.setGameplayActive(false);
    
    document.exitPointerLock?.();
    UI.hud.classList.add('hidden');
    UI.over.classList.add('show');
    const overTitle = UI.over?.querySelector('h2');
    const overEyebrow = UI.over?.querySelector('.eyebrow');
    if (overTitle) overTitle.textContent = (outcome === 'extracted' ? '런 탈출 성공' : '게임 오버');
    if (overEyebrow) overEyebrow.textContent = (outcome === 'extracted' ? 'RUN EXTRACTED' : 'RUN ENDED');
    const survived = this.lobby.mode==='coop'?this.networkElapsed || 0:(this.runStartTime ? Math.max(0, now() - this.runStartTime) : 0);
    const min = Math.floor(survived / 60), sec = Math.floor(survived % 60);
    UI.finalStats.innerHTML = `
      <div><b>${this.runRank()}</b><span>${('런 랭크')}</span></div>
      <div><b>${this.wave}${('')}</b><span>${(`도달 웨이브${this.rankedRun ? ` / 최고 ${record.best.wave}` : ' / 기록 제외'}`)}</span></div>
      <div><b>${this.score.toLocaleString('ko-KR')}</b><span>점수${this.rankedRun ? ` / 최고 ${record.best.score.toLocaleString('ko-KR')}` : ' / 기록 제외'}</span></div>
      <div><b>${this.kills}</b><span>처치${this.rankedRun ? ` / 최고 ${record.best.kills}` : ' / 기록 제외'}</span></div>
      <div><b>${this.headshots || 0}</b><span>헤드샷${this.rankedRun ? ` / 최고 ${record.best.headshots || 0}` : ' / 기록 제외'}</span></div>
      <div><b>${min}:${String(sec).padStart(2,'0')}</b><span>생존 시간</span></div>
      <div><b>${this.missionsCleared || 0}</b><span>완료한 목표</span></div>
      <div><b>${this.map.label}</b><span>맵</span></div>
      <div><b>${UI.diff.value.toUpperCase()}</b><span>난이도</span></div>
    `;
  }

  resetLobby() { this.lobby={mode:'single',role:'solo',roomCode:'',ready:false,remoteReady:false,remoteSeen:false};this.setPlayMode('single'); }
  async copyInvite() {
    const url=new URL(location.protocol==='file:' && this.net.serverUrl?this.net.serverUrl:location.href);url.searchParams.set('room',this.lobby.roomCode);
    if(['localhost','127.0.0.1','[::1]'].includes(url.hostname)){this.showToast('다른 기기 초대: PC의 LAN IP 또는 공개 서버 주소로 접속한 뒤 링크를 복사하세요.');return;}
    try{await navigator.clipboard.writeText(url.href);this.showToast('초대 링크 복사 완료');}
    catch{if(UI.roomCodeInput){UI.roomCodeInput.value=this.lobby.roomCode;UI.roomCodeInput.focus();UI.roomCodeInput.select();}this.showToast('방 코드 '+this.lobby.roomCode+'를 친구에게 알려주세요.');}
  }
  setConnectionBlocked(blocked,title='',copy='') {
    const wasBlocked=this.connectionBlocked;this.connectionBlocked=!!blocked;
    if(wasBlocked!==!!blocked&&this.running)this.audio.cue(blocked?'disconnected':'connected');
    UI.connectionOverlay?.classList.toggle('show',!!blocked);
    if(UI.connectionTitle)UI.connectionTitle.textContent=title || '친구의 연결을 기다립니다';if(UI.connectionCopy)UI.connectionCopy.textContent=copy || '최대 2분 동안 현재 진행을 보관합니다.';
    if(blocked){this.input.resetTransient();this.net.sendInput(true);this.mobile?.setGameplayActive(false);try{document.exitPointerLock?.();}catch{}}
    else if(wasBlocked && this.running && !this.paused && !this.rewardOpen){if(this.isTouchInputActive())this.mobile?.setGameplayActive(true);else{this.paused=true;UI.pause?.classList.add('show');this.showToast('연결 복구 완료. 계속하기를 눌러주세요.');}}
  }
  disposeWorld() {
    if(!this.scene)return;const geometries=new Set(),materials=new Set();
    this.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of [].concat(o.material))materials.add(m);});
    for(const g of geometries)g.dispose();for(const m of materials)m.dispose();
    for(const light of this.flickerLights || [])light.light?.shadow?.map?.dispose?.();
  }
  renderLevelGuide() {
    if(!UI.levelGuide)return;const start=Math.max(1,Number(UI.startWave?.value || 1));
    UI.levelGuide.innerHTML=Array.from({length:10},(_,i)=>{const level=Math.floor((start-1)/10)*10+i+1,m=getMission(level);return '<div class="level-tile'+(start===level?' selected':'')+'"><small>LEVEL '+String(level).padStart(2,'0')+'</small><b>'+m.icon+' '+m.label+'</b><span>'+m.desc+'</span></div>';}).join('');
  }
  findMissionPoint(points=[],radius=1.2) {
    for(let attempt=0;attempt<90;attempt++){
      const half=Math.min(this.map.size/2-6,30);const x=rand(-half,half),z=rand(-half,half);
      if(this.collides(x,z,radius)||dist2(x,z,this.player.x,this.player.z)<36||points.some(p=>dist2(x,z,p.x,p.z)<81)||!this.hasNavRouteToPlayer(x,z,.65))continue;
      return {x,z};
    }
    return this.findDeterministicSafePoint(Math.min(radius,1.2),{originX:this.player.x,originZ:this.player.z+8,minPlayerDistance:4,minCoreDistance:5,requireRoute:true});
  }
  cleanupMissionTargets() {if(this.missionTargetGroup?.parent)this.missionTargetGroup.parent.remove(this.missionTargetGroup);this.missionTargetGroup=null;this.missionTargetKey='';}
  syncMissionTargets() {
    const m=this.currentMission,s=this.missionState;if(!m || !s)return;
    const key=m.wave+':'+s.targets.map(t=>t.id+':'+t.done).join('|');if(key===this.missionTargetKey)return;
    this.cleanupMissionTargets();this.missionTargetKey=key;const group=new THREE.Group();this.missionTargetGroup=group;this.scene.add(group);
    for(const t of s.targets){const color=t.done?0x466463:0x62efd6,r=m.type==='holdout'?t.radius:1.3;
      const ring=new THREE.Mesh(new THREE.RingGeometry(r-.12,r,32),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(t.x,.05,t.z);group.add(ring);
      const pole=new THREE.Mesh(this.geos.lowBox,new THREE.MeshBasicMaterial({color}));pole.position.set(t.x,1.3,t.z);pole.scale.set(.12,2.6,.12);group.add(pole);
      const top=new THREE.Mesh(this.geos.pickup,new THREE.MeshBasicMaterial({color}));top.position.set(t.x,2.8,t.z);group.add(top);
    }
  }
  updateObjectiveMarker() {
    if(!UI.missionMarker)return;const m=this.currentMission,s=this.missionState;
    const targets=(m && !s?.complete) && m.type==='core'?(this.objectiveCores || []).filter(t=>t.alive):(s?.targets || []).filter(t=>!t.done);
    const t=targets.sort((a,b)=>dist2(a.x,a.z,this.player.x,this.player.z)-dist2(b.x,b.z,this.player.x,this.player.z))[0];
    if(!t || s?.complete || this.prepPhase || this.rewardOpen){UI.missionMarker.classList.remove('show');return;}
    this.camera.updateMatrixWorld();const p=this.tmpV.set(t.x,1.5,t.z).project(this.camera);const front=p.z<1;
    const x=front?clamp((p.x*.5+.5)*innerWidth,100,innerWidth-100):(Math.cos(this.yaw)*(t.x-this.player.x)-Math.sin(this.yaw)*(t.z-this.player.z)>0?innerWidth-100:100);
    const y=front?clamp((-p.y*.5+.5)*innerHeight,110,innerHeight-145):innerHeight*.45;
    UI.missionMarker.style.left=x+'px';UI.missionMarker.style.top=y+'px';UI.missionMarker.classList.add('show');
    UI.missionMarkerLabel.textContent=(m.type==='core'?'◆ 코어':m.type==='holdout'?'⊙ 거점':'⚡ 중계기')+' · '+Math.round(Math.hypot(t.x-this.player.x,t.z-this.player.z))+'m';
    this.syncMissionTargets();
  }
  updateMissionHud() {
    const m=this.currentMission,s=this.missionState;if(!m||!s)return;
    if(UI.missionTitle)UI.missionTitle.textContent='L'+this.wave+' · '+m.label;
    if(UI.missionBar)UI.missionBar.style.width=Math.round(missionProgress(m,s,{remaining:this.spawnQueue+this.enemies.filter(e=>e.alive).length,initialCount:this.initialWaveCount})*100)+'%';
    if(UI.missionBonus)UI.missionBonus.textContent=m.bonus==='headshots'?'추가 목표: 헤드샷 '+Math.min(m.bonusTarget,(this.headshots || 0)-s.startHeadshots)+'/'+m.bonusTarget+' · +'+m.bonusScore:'추가 목표: '+m.bonusTarget+'초 안에 완료 · +'+m.bonusScore;
    if(UI.prepReady){UI.prepReady.hidden=!this.prepPhase;UI.prepReady.disabled=this.lobby.mode==='coop' && !!this.prepVoteSent;const key=this.isTouchInputActive()?'':'F · ';UI.prepReady.textContent=this.lobby.mode==='coop'?(this.prepVoteSent?'준비 완료 · '+this.prepReadyCount+'/2':key+'다음 레벨 준비 완료'):key+'다음 레벨 바로 시작';}
    if(UI.squadStatus){const ally=[...this.remotePlayers.values()][0];UI.squadStatus.hidden=this.lobby.mode!=='coop';UI.squadStatus.textContent=ally?('친구 '+(ally.downed?'쓰러짐 · E 길게 눌러 부활':'HP '+Math.ceil(ally.hp || 0))):'친구 상태 동기화 중';}
  }
  syncServerCores(list=[]) {
    const seen=new Set();for(const sc of list){const id=String(sc.id);seen.add(id);let c=this.objectiveCores.find(x=>x.serverId===id);
      if(!c){c=this.createObjectiveCore(sc.x,sc.z,this.objectiveCores.length);c.serverId=id;this.objectiveCores.push(c);}c.hp=sc.hp;c.maxHp=sc.maxHp;c.alive=sc.alive;
      if(!c.alive && c.mesh?.parent)this.scene.remove(c.mesh);
    }
    for(const c of this.objectiveCores)if(!seen.has(c.serverId)){c.alive=false;if(c.mesh?.parent)this.scene.remove(c.mesh);}this.objectiveCores=this.objectiveCores.filter(c=>seen.has(c.serverId));
  }

}

window.__game = new Game();
console.info('[Boxhead FPS] game module loaded');
