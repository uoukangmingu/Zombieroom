import * as THREE from 'three';

const GAME_BUILD = '62.0';

const $ = (id) => document.getElementById(id);
const canvas = $('game');

const UI = {
  loading: $('loading-screen'), loadingStatus: $('loading-status'), loadingBar: $('loading-bar'),
  start: $('start-screen'), pause: $('pause-screen'), over: $('game-over-screen'), storyScreen: $('story-screen'),
  hud: $('hud'), startBtn: $('start-button'), storyStartBtn: $('story-start-button'), resumeBtn: $('resume-button'), restartBtn: $('restart-button'),
  survivalModeBtn: $('survival-mode-button'), storyModeBtn: $('story-mode-button'), survivalMenuPanel: $('survival-menu-panel'), storyMenuPanel: $('story-menu-panel'),
  storyProgressSummary: $('story-progress-summary'), storyChapterList: $('story-chapter-list'), storySelectedSummary: $('story-selected-summary'),
  storyScreenEyebrow: $('story-screen-eyebrow'), storyScreenTitle: $('story-screen-title'), storyScreenCopy: $('story-screen-copy'), storyScreenObjectives: $('story-screen-objectives'), storyScreenStatus: $('story-screen-status'),
  storyPrimaryBtn: $('story-primary-button'), storySecondaryBtn: $('story-secondary-button'),
  mainMenuBtn: $('main-menu-button'), controlsSettingsStart: $('controls-settings-start'), controlsSettingsPause: $('controls-settings-pause'),
  fullscreenStart: $('fullscreen-start'), fullscreenPause: $('fullscreen-pause'), fullscreenControls: $('fullscreen-controls'), fullscreenMobile: $('fullscreen-mobile'),
  singleModeBtn: $('single-mode-button'), coopModeBtn: $('coop-mode-button'), playMode: $('play-mode-select'), multiplayerPanel: $('multiplayer-panel'),
  createRoomBtn: $('create-room-button'), joinRoomBtn: $('join-room-button'), readyBtn: $('ready-button'), roomCodeInput: $('room-code-input'), lobbyRoomCode: $('lobby-room-code'), lobbyStatus: $('lobby-status-text'), netState: $('net-state'), netStatusText: $('net-status-text'),
  map: $('map-select'), diff: $('difficulty-select'), quality: $('quality-select'), startWave: $('start-wave-select'),
  pauseQuality: $('pause-quality-select'), masterVolume: $('master-volume-range'), sfxVolume: $('sfx-volume-range'), bgmVolume: $('bgm-volume-range'), masterVolumeLabel: $('master-volume-label'), sfxVolumeLabel: $('sfx-volume-label'), bgmVolumeLabel: $('bgm-volume-label'),
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
  storyTargetMarker: $('story-target-marker'), storyTargetDirection: $('story-target-direction'), storyTargetIcon: $('story-target-icon'), storyTargetLabel: $('story-target-label'), storyTargetDistance: $('story-target-distance'),
  storyDialogue: $('story-dialogue'), storyDialogueSpeaker: $('story-dialogue-speaker'), storyDialogueText: $('story-dialogue-text'),
  storyCinematic: $('story-cinematic'), storyCinematicTitle: $('story-cinematic-title'), storyCinematicCopy: $('story-cinematic-copy')
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rand = (min, max) => min + Math.random() * (max - min);
const dist2 = (ax, az, bx, bz) => (ax - bx) * (ax - bx) + (az - bz) * (az - bz);
const now = () => performance.now() / 1000;
const resolveStoryTargetScreenSide = (dx, dz, yaw) => (dx * Math.cos(yaw) + dz * -Math.sin(yaw) < 0 ? 'left' : 'right');

const isMobileDevice = () => {
  const coarse = !!window.matchMedia?.('(pointer: coarse)').matches;
  const touch = Number(navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
  const mobileUa = /Android|iPhone|iPad|iPod|Mobile|Silk|Kindle/i.test(navigator.userAgent || '');
  return touch && (coarse || mobileUa);
};

const DEFAULT_BINDINGS = Object.freeze({
  forward: 'KeyW', backward: 'KeyS', left: 'KeyA', right: 'KeyD',
  jump: 'Space', sprint: 'ShiftLeft', fire: 'Mouse0', aim: 'Mouse2',
  reload: 'KeyR', heal: 'KeyE',
  weapon1: 'Digit1', weapon2: 'Digit2', weapon3: 'Digit3', weapon4: 'Digit4',
  weapon5: 'Digit5', weapon6: 'Digit6', weapon7: 'Digit7', weapon8: 'Digit8'
});

const BINDING_ACTIONS = [
  ['forward','앞으로 이동'], ['backward','뒤로 이동'], ['left','왼쪽 이동'], ['right','오른쪽 이동'],
  ['jump','점프'], ['sprint','달리기'], ['fire','발사'], ['aim','정조준'],
  ['reload','재장전'], ['heal','회복·아군 지원'],
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

const DIFFICULTY = {
  normal: { enemyHp: 1, enemySpeed: 1, enemyDamage: 1, spawn: 1 },
  hard: { enemyHp: 1.22, enemySpeed: 1.10, enemyDamage: 1.25, spawn: 1.18 },
  hell: { enemyHp: 1.45, enemySpeed: 1.18, enemyDamage: 1.45, spawn: 1.34 }
};

const QUALITY = {
  // 초저사양은 사무용 내장 그래픽을 목표로 GPU/DOM/이펙트 갱신량을 함께 줄인다.
  ultra: { label: '초저사양', pixelRatio: .44, minPixelRatio: .30, fogFar: 38, fx: .04, shadows: false, shadowMap: 0, lightCount: 0, targetFps: 30, maxFx: 8, maxEnemies: 24, detailStep: 0, stainCount: 0, hudHz: 8, minimapHz: 0, aiHz: 12, overlapHz: 8, simpleModels: true, dynamicResolution: true },
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

function buildAbyssCitadelObstacles() {
  // 9×9 셀의 결정론적 미로. 완전 미로를 만든 뒤 일부 벽을 열어 순환로를 추가한다.
  // 같은 좌표의 연속 벽은 하나로 합쳐 복잡도에 비해 draw call이 과도하게 늘지 않는다.
  const count = 9;
  const cell = 12;
  const half = count * cell / 2;
  const wall = 2;
  const visited = new Uint8Array(count * count);
  const passages = new Set();
  const edgeKey = (a, b) => a < b ? `${a}:${b}` : `${b}:${a}`;
  let seed = 0x4b1d5e7f;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const stack = [Math.floor(count * count / 2)];
  visited[stack[0]] = 1;
  while (stack.length) {
    const current = stack[stack.length - 1];
    const x = current % count, z = Math.floor(current / count);
    const choices = [];
    if (x > 0 && !visited[current - 1]) choices.push(current - 1);
    if (x + 1 < count && !visited[current + 1]) choices.push(current + 1);
    if (z > 0 && !visited[current - count]) choices.push(current - count);
    if (z + 1 < count && !visited[current + count]) choices.push(current + count);
    if (!choices.length) { stack.pop(); continue; }
    const next = choices[Math.floor(random() * choices.length)];
    passages.add(edgeKey(current, next));
    visited[next] = 1;
    stack.push(next);
  }

  // 완전 미로에 12개의 지름길을 열어 적과 플레이어 모두 여러 우회 선택지를 갖게 한다.
  const closedEdges = [];
  for (let z = 0; z < count; z++) {
    for (let x = 0; x < count; x++) {
      const a = z * count + x;
      if (x + 1 < count && !passages.has(edgeKey(a, a + 1))) closedEdges.push(edgeKey(a, a + 1));
      if (z + 1 < count && !passages.has(edgeKey(a, a + count))) closedEdges.push(edgeKey(a, a + count));
    }
  }
  for (let i = 0; i < 12 && closedEdges.length; i++) {
    const pick = Math.floor(random() * closedEdges.length);
    passages.add(closedEdges.splice(pick, 1)[0]);
  }

  const segments = [];
  const addV = (x, z0, z1) => segments.push({ axis: 'v', coord: x, start: z0, end: z1 });
  const addH = (z, x0, x1) => segments.push({ axis: 'h', coord: z, start: x0, end: x1 });
  for (let z = 0; z < count; z++) {
    for (let x = 0; x < count - 1; x++) {
      const a = z * count + x;
      if (!passages.has(edgeKey(a, a + 1))) {
        const wx = -half + (x + 1) * cell;
        const z0 = -half + z * cell;
        addV(wx, z0, z0 + cell);
      }
    }
  }
  for (let z = 0; z < count - 1; z++) {
    for (let x = 0; x < count; x++) {
      const a = z * count + x;
      if (!passages.has(edgeKey(a, a + count))) {
        const wz = -half + (z + 1) * cell;
        const x0 = -half + x * cell;
        addH(wz, x0, x0 + cell);
      }
    }
  }

  // 미로 바깥 순환로와 연결되는 비대칭 출입구. 적 스폰마다 진입 방향이 달라진다.
  const gates = {
    left: new Set([1, 4, 7]), right: new Set([0, 5, 8]),
    top: new Set([2, 6]), bottom: new Set([1, 4, 7])
  };
  for (let i = 0; i < count; i++) {
    const a = -half + i * cell, b = a + cell;
    if (!gates.left.has(i)) addV(-half, a, b);
    if (!gates.right.has(i)) addV(half, a, b);
    if (!gates.top.has(i)) addH(-half, a, b);
    if (!gates.bottom.has(i)) addH(half, a, b);
  }

  segments.sort((a, b) => a.axis.localeCompare(b.axis) || a.coord - b.coord || a.start - b.start);
  const merged = [];
  for (const s of segments) {
    const prev = merged[merged.length - 1];
    if (prev && prev.axis === s.axis && prev.coord === s.coord && Math.abs(prev.end - s.start) < .01) prev.end = s.end;
    else merged.push({ ...s });
  }
  return merged.map(s => s.axis === 'v'
    ? [s.coord, (s.start + s.end) / 2, wall, s.end - s.start]
    : [(s.start + s.end) / 2, s.coord, s.end - s.start, wall]);
}

const MAPS = {
  box: {
    label: 'Big Boxy', size: 58, player: [0, 0],
    obstacles: [
      [-10, -8, 8, 4], [11, 8, 8, 4], [-18, 13, 5, 10], [18, -13, 5, 10],
      [0, 20, 16, 3], [0, -20, 16, 3], [-25, 0, 3, 16], [25, 0, 3, 16]
    ],
    spawns: [[-24,-24],[24,-24],[-24,24],[24,24], [0,-26], [0,26], [-26,-11], [26,11]]
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
  },
  abyss: {
    label: 'Abyss Citadel / 극악', size: 132, player: [0, 0],
    threatScale: 1.22, spawnIntervalScale: .78,
    obstacles: buildAbyssCitadelObstacles(),
    spawns: [
      [-61,-61], [61,-61], [-61,61], [61,61],
      [0,-61], [0,61], [-61,0], [61,0],
      [-36,-61], [36,-61], [-36,61], [36,61],
      [-61,-36], [-61,36], [61,-36], [61,36]
    ]
  },
  relay_hub: {
    label: 'Relay Hub A-01', size: 76, player: [-22, -24],
    obstacles: [
      [-27, 0, 3, 48], [27, 0, 3, 48],
      [0, -28, 34, 3], [-10, 28, 46, 3],
      [-6, 10, 22, 3], [12, 10, 3, 22],
      [-18, -8, 3, 14], [2, -6, 14, 3],
      [18, -8, 10, 3], [18, -18, 3, 10],
      [-24, -18, 8, 3], [-8, -18, 8, 3],
      [-24, 20, 8, 3], [-8, 20, 8, 3],
      [18, 24, 10, 3], [18, 0, 3, 8]
    ],
    spawns: [[-31,-31],[31,-31],[-31,31],[31,31],[0,-33],[0,33],[-33,0],[33,0],[-20,-30],[24,28]]
  },
  freight_spine: {
    label: 'Freight Spine B-09', size: 88, player: [-34, 0],
    obstacles: [
      [-26, 0, 4, 58], [-8, 0, 4, 40], [10, 0, 4, 44], [28, 0, 4, 58],
      [0, -26, 18, 3], [0, 26, 18, 3],
      [-34, -18, 10, 3], [-34, 18, 10, 3],
      [34, -18, 10, 3], [34, 18, 10, 3],
      [-17, -26, 10, 3], [19, 26, 10, 3],
      [0, 0, 8, 6], [0, -38, 34, 3], [0, 38, 34, 3]
    ],
    spawns: [[-38,-34],[-38,34],[38,-34],[38,34],[0,-40],[0,40],[-41,0],[41,0],[-12,-40],[14,40]]
  },
  anchor_forge: {
    label: 'Anchor Forge C-12', size: 94, player: [-18, 34],
    obstacles: [
      [-9, 0, 5, 4], [9, 0, 5, 4], [0, -9, 4, 5], [0, 9, 4, 5],
      [-26, -26, 16, 3], [26, -26, 16, 3], [-26, 26, 16, 3], [26, 26, 16, 3],
      [-26, -12, 3, 14], [26, -12, 3, 14], [-26, 12, 3, 14], [26, 12, 3, 14],
      [-8, -34, 16, 3], [8, 34, 16, 3],
      [-38, 0, 3, 42], [38, 0, 3, 42],
      [0, -38, 42, 3], [0, 38, 42, 3],
      [-14, 0, 8, 3], [14, 0, 8, 3],
      [0, -14, 3, 8], [0, 14, 3, 8]
    ],
    spawns: [[-41,-41],[41,-41],[-41,41],[41,41],[0,-43],[0,43],[-43,0],[43,0],[-34,0],[34,0]]
  },
  atlas_archive: {
    label: 'Atlas Archive D-21', size: 110, player: [-42, 38],
    obstacles: [
      [-36, -28, 3, 38], [-24, -8, 16, 3], [-10, -20, 3, 22],
      [8, -28, 22, 3], [24, -12, 3, 28], [36, 8, 16, 3],
      [-36, 18, 18, 3], [-26, 30, 3, 16], [-8, 12, 14, 3],
      [6, 18, 3, 24], [22, 30, 18, 3], [38, -20, 3, 18],
      [-6, 40, 34, 3], [0, -42, 46, 3], [-46, 0, 3, 64], [46, 0, 3, 64],
      [-18, 0, 10, 3], [14, -2, 10, 3], [-2, 20, 10, 3]
    ],
    spawns: [[-48,-48],[48,-48],[-48,48],[48,48],[0,-50],[0,50],[-50,0],[50,0],[-34,44],[30,-44],[-42,20],[42,-8]]
  },
  janus_core: {
    label: 'JANUS Core E-00', size: 124, player: [0, 48],
    threatScale: 1.18, spawnIntervalScale: .86,
    obstacles: [
      [0, -50, 58, 3], [0, 50, 58, 3], [-50, 0, 3, 58], [50, 0, 3, 58],
      [0, -26, 34, 3], [0, 26, 34, 3], [-26, 0, 3, 34], [26, 0, 3, 34],
      [0, 0, 10, 10],
      [-18, -40, 12, 3], [18, -40, 12, 3], [-18, 40, 12, 3], [18, 40, 12, 3],
      [-40, -18, 3, 12], [-40, 18, 3, 12], [40, -18, 3, 12], [40, 18, 3, 12],
      [-8, -12, 3, 14], [8, -12, 3, 14], [-8, 12, 3, 14], [8, 12, 3, 14],
      [-12, -8, 14, 3], [12, -8, 14, 3], [-12, 8, 14, 3], [12, 8, 14, 3],
      [0, 62, 24, 3], [-62, 0, 3, 24], [62, 0, 3, 24]
    ],
    spawns: [[-56,-56],[56,-56],[-56,56],[56,56],[0,-58],[0,58],[-58,0],[58,0],[-28,-56],[28,-56],[-56,28],[56,-28]]
  }
};

const SURVIVAL_MAP_KEYS = Object.freeze(['box','lane','castle','maze','abyss']);

const MAP_THEMES = Object.freeze({
  relay_hub: { bg: 0x101518, fog: 0x1d282d, hemiSky: 0xd8f9ed, hemiGround: 0x17342f, ambient: 0.42, dir: 0x9be5d3, floor: 0x445856, wall: 0x7a958e, ceiling: 0x5c716b, panel: 0x698680, trim: 0x1f2b2d, lightPanel: 0xd8ffef, lineFloor: 0x203738, lineCeil: 0x334847, stain: 0x122425, redStain: 0x5b1717, detailStep: 5, flickerTint: 0xcffff0 },
  freight_spine: { bg: 0x18120f, fog: 0x2e2119, hemiSky: 0xffe0b7, hemiGround: 0x3a2417, ambient: 0.40, dir: 0xffc58a, floor: 0x6f523a, wall: 0xa27a54, ceiling: 0x806146, panel: 0x936847, trim: 0x332214, lightPanel: 0xffd28f, lineFloor: 0x3a2819, lineCeil: 0x513826, stain: 0x25160d, redStain: 0x5d1410, detailStep: 6, flickerTint: 0xffd5a6 },
  anchor_forge: { bg: 0x0d1019, fog: 0x1a2231, hemiSky: 0xb8d7ff, hemiGround: 0x121a28, ambient: 0.38, dir: 0x8cbfff, floor: 0x33465c, wall: 0x597496, ceiling: 0x495e7d, panel: 0x405872, trim: 0x162131, lightPanel: 0xcfe8ff, lineFloor: 0x172537, lineCeil: 0x20324a, stain: 0x0f1b2b, redStain: 0x421318, detailStep: 5, flickerTint: 0xb9d8ff },
  atlas_archive: { bg: 0x16130d, fog: 0x2c2416, hemiSky: 0xfff0c0, hemiGround: 0x2f2719, ambient: 0.41, dir: 0xf6d786, floor: 0x66583d, wall: 0xb29d71, ceiling: 0x887652, panel: 0x927f59, trim: 0x2e2412, lightPanel: 0xfff1aa, lineFloor: 0x2d2518, lineCeil: 0x463920, stain: 0x1b150e, redStain: 0x4f0909, detailStep: 4, flickerTint: 0xffefb0 },
  janus_core: { bg: 0x0d0b15, fog: 0x1f1a2f, hemiSky: 0xe1c9ff, hemiGround: 0x150f24, ambient: 0.34, dir: 0xbe9dff, floor: 0x352d4d, wall: 0x67548f, ceiling: 0x4a3d6f, panel: 0x5e4b82, trim: 0x120d1d, lightPanel: 0xe7d4ff, lineFloor: 0x1a1425, lineCeil: 0x2d2340, stain: 0x171122, redStain: 0x5d1038, detailStep: 6, flickerTint: 0xd9c1ff }
});

const getMapTheme = (key) => MAP_THEMES[key] || null;

const STORY_CHAPTERS = Object.freeze([
  {
    id: 1, code: 'JANUS-01', title: '기원동 A동', map: 'relay_hub', waves: 3,
    intro: `2009년, 민간 물류기업 메리디안 로지스틱스와 국책 연구팀은 “보관 공간을 접어 넣는 기술”을 만들겠다며 Project JANUS를 시작했다. 실험 시설은 평범한 창고형 백오피스와 연구 지원동으로 위장되었지만, 2011년 4월 17일 02:13, 임계 공진이 발생하며 건물 내부가 끝없이 접힌 전이 공간으로 무너졌다. 그날 이후 사람들은 이 공간을 백룸이라 불렀다.

R-07이 진입하는 A동은 사고 직후 처음 봉쇄된 중계 허브이자 보안·격리 구역이다. 입구에는 직원 출입 게이트와 경비 데스크가 있고, 시설 중앙의 전고 방폭 셔터가 응급 격리동을 완전히 분리한다. 셔터는 사고 당시 생존자와 감염자를 갈라놓기 위해 내려왔으며, 중앙 중계 허브의 생체 인증을 되살리지 않으면 다른 우회로가 없다. 아직 살아 있는 구조 신호가 셔터 너머에서 발신되고 있으며, 초기 감염자들—형광등의 주파수와 공진 냉각제에 노출되어 방향 감각을 잃고 공격성만 남은 직원들—이 같은 동선을 반복 순찰하듯 배회하고 있다. 현장 기록은 누군가가 마지막 순간까지 이곳을 연구 시설이 아니라 ‘정상 운영 중인 근무 구역’처럼 유지하려 했음을 보여 준다.`,
    goal: `보안 봉쇄선의 전원을 복구하고, 격리실에 고립된 생존자를 확보해 후방 구조 통로로 탈출시켜라.`,
    ending: `구조한 생존자는 자신을 경비팀장 오세현이라고 밝힌다. 그는 A동의 봉쇄가 우연한 비상조치가 아니라, JANUS 서버가 사람과 시설을 통째로 백룸 안에 붙잡기 위해 의도적으로 닫아 버린 절차였다고 증언한다. 오세현은 사고 직전 선발대가 B동으로 기록 화물을 옮겼다는 사실과 함께, 메인 물류축으로 향하는 수기 출입코드를 넘긴다.`,
    loadout: ['pistol','smg'],
    missions: [
      { type: 'normal', label: '봉쇄선 확보', hud: '중계 허브 전면의 감염체를 소탕해 전력 복구 작업 공간을 확보하라', rationale: '격리동 방폭 셔터는 중앙 중계 허브의 생체 인증 없이는 열리지 않는다. 먼저 허브까지 안전한 작업 동선을 만들어야 한다.', outcome: '허브 전면이 확보됐다. 이제 격리동을 봉쇄한 방폭 셔터의 인증 회로에 접근할 수 있다.', spawnScale: .56, transmission: '생존자 음성 기록: 이들은 좀비가 아니다. 형광등 소리를 따라다니는 직원들이다.' },
      { type: 'interact', target: 'relay', label: '중계 허브 복구', hud: '보안 중계 허브를 재기동해 격리동 방폭 셔터를 개방하라', rationale: '셔터 너머는 사고 당시 생존자를 격리하기 위해 물리적으로 분리된 구역이다. 허브를 복구해야 유일한 통로의 잠금핀이 해제된다.', outcome: '중계 허브가 격리동의 생체 인증을 복원했다. 방폭 셔터가 올라가며 오세현에게 가는 유일한 길이 열린다.', hold: 2.2, minSpawn: 10, spawnScale: .58, transmission: 'R-07: 허브 내부에 근무 일지가 남아 있다. “냉각제 누출 후 직원들이 한 방향으로만 걷기 시작했다.”' },
      { type: 'rescue', target: 'survivor', label: '생존자 구출', hud: '개방된 격리동에서 오세현을 확보해 후방 구조 통로까지 호위하라', rationale: '오세현은 B동 출입코드와 사고 당시 봉쇄 절차를 아는 유일한 생존자다. 그를 잃으면 다음 구역으로 진행할 근거와 경로가 모두 끊긴다.', outcome: '오세현이 후방 구조선에 도착했다. 그가 제공한 수기 출입코드로 B동 물류축 접근 권한이 확보됐다.', hold: 1.8, minSpawn: 14, spawnScale: .62, transmission: '오세현: 서버실을 믿지 마. 관제 목소리가 사고 당일 이후 바뀌었어.' }
    ]
  },
  {
    id: 2, code: 'JANUS-02', title: '물류축 B동', map: 'freight_spine', waves: 3,
    intro: `B동은 JANUS가 현실과 백룸 사이에서 자재를 옮기기 위해 만든 초장거리 화물축이다. 메리디안은 여기에 실험 장비와 공진 냉각제, 그리고 감염자 격리용 특수 컨테이너를 동시에 운용했다. 사고 이후 복도 전체가 살아 있는 물류라인처럼 움직이며, 화물 태그가 달린 개체들은 같은 경로를 되풀이해 배회하고 있다.

오세현의 출입코드는 선발대의 마지막 위치를 가리킨다. 그들의 기록 장치에는 “감염은 물림이 아니라 반복되는 주파수 노출로 진행된다”는 문장이 남아 있다.`,
    goal: `선발대 기록 장치를 회수하고 B동의 예비 전력을 복구하라.`,
    ending: `기록 장치를 분석한 결과, 감염자들은 서로 다른 주파수 계열로 분화된 “잔향 개체”라는 사실이 드러난다. 폭발형, 돌진형, 방패형 개체는 모두 같은 인간 직원이 다른 자극에 적응한 결과였다. 동시에 기록 속 좌표는 C동의 공간 고정로를 지목한다.`,
    loadout: ['pistol','smg','shotgun'],
    missions: [
      { type: 'cargo', target: 'cargo', label: '선발대 기록 화물 확보', hud: '차폐된 기록 화물을 분석 플랫폼까지 직접 운반하라', rationale: '기록 장치는 공진 노이즈 때문에 무선 전송이 불가능하며, 충격을 받으면 좌표 데이터가 손상된다. 그래서 플레이어가 물리적으로 운반해야 한다.', outcome: '차폐 케이스가 분석 플랫폼에 고정됐다. 선발대가 남긴 감염 주파수와 C동 좌표를 복원할 수 있다.', hold: 1.2, minSpawn: 12, spawnScale: .64, transmission: '관제 로그: “컨테이너 7번은 절대 열지 말 것.” 그런데 이미 내부가 비어 있다.' },
      { type: 'rush', label: '물류축 방어', hud: '분석이 끝날 때까지 폭발 개체의 플랫폼 접근을 차단하라', rationale: '분석 플랫폼이 기록 케이스를 읽는 동안 고주파 신호가 발생해 폭발형 잔향 개체를 끌어당긴다. 방어는 분석 시간을 확보하기 위한 필수 절차다.', outcome: '플랫폼 분석이 완료됐다. 폭발형 개체가 고주파 장비를 우선 공격한다는 행동 규칙도 확인됐다.', minSpawn: 18, spawnScale: .74, transmission: 'R-07: 주파수가 높아질수록 개체의 행동이 빨라진다. 단순 좀비 현상이 아니다.' },
      { type: 'generator', target: 'generator', label: '예비 발전기 재가동', hud: '분리된 세 전력 구간을 순차 복구해 C동 좌표 지도를 출력하라', rationale: 'B동의 긴 물류축은 과부하를 막기 위해 세 개의 독립 전력 링으로 나뉘어 있다. 하나라도 꺼져 있으면 좌표 지도와 다음 방화문이 작동하지 않는다.', outcome: '세 전력 링이 동기화됐다. C동 공간 고정로의 좌표와 안전 진입 시간이 지도에 표시된다.', hold: 2.0, count: 3, minSpawn: 16, spawnScale: .70, transmission: '오세현: 전력만 돌아오면 C동 고정로 지도가 뜬다. 그때 이곳이 왜 접혔는지 알게 될 거다.' }
    ]
  },
  {
    id: 3, code: 'JANUS-03', title: '고정로 C동', map: 'anchor_forge', waves: 3,
    intro: `C동은 백룸의 벽을 “고정된 현실처럼 보이게” 유지하던 공간 고정로다. 연구진은 이곳에서 공진 코어를 박아 넣어 무한히 접히는 복도를 억지로 정렬했다. 그러나 사고 직후 코어들은 오히려 공간 접힘을 증폭했고, 살아남은 연구원들은 자신들이 만든 정렬 장치 안에 갇혀 코어를 보호하는 감염 개체로 변했다.

선발대 기록에 따르면, JANUS의 총책임자 한민석 박사는 사고 직전 “시설 전체를 백룸 내부에 그대로 복제해 영구 격리하겠다”고 선언했다.`,
    goal: `공간 고정로를 파괴하고 더 깊은 구역으로 가는 격리문을 개방하라.`,
    ending: `마지막 고정 코어가 무너지자 C동 전체가 잠시 제 모양을 되찾고, 한민석의 영상 메모가 재생된다. 그는 백룸을 재난이 아닌 저장장치로 보았고, 직원들을 “새 공간에 적응한 첫 표본”이라 부른다. 다음 좌표는 연구 기록 보관구역 D동이다.`,
    loadout: ['pistol','smg','shotgun','grenade','barrel'],
    missions: [
      { type: 'core', label: '보조 고정 코어 파괴', hud: '외곽 코어를 파괴해 중앙 격리문의 위상 압력을 낮춰라', rationale: '고정 코어는 단순 발전기가 아니라 벽과 통로의 좌표를 붙잡는 닻이다. 외곽 코어를 먼저 끊어야 제어반이 현실 좌표에 고정된다.', outcome: '외곽 위상 압력이 낮아졌다. 동·서 제어반이 같은 시간축에 머물기 시작한다.', coreCount: 2, minSpawn: 12, spawnScale: .66, transmission: '관제 기록 복원: 코어 손실 시 벽 배치가 재작성된다. 즉, 맵 그 자체가 장치다.' },
      { type: 'door', target: 'blastDoor', label: 'C동 격리문 해제', hud: '서로 다른 위상에 놓인 동·서 제어반을 인증해 중앙문을 열어라', rationale: '한쪽 인증만으로 문을 열면 복제된 통로가 충돌한다. 두 제어반을 모두 작동시켜 현재 좌표가 하나임을 증명해야 한다.', outcome: '양측 인증값이 일치했다. 중앙 격리문이 실제 좌표에 고정되며 통로가 열린다.', hold: 1.8, count: 2, minSpawn: 18, spawnScale: .78, transmission: 'R-07: 제어반 반대편에서도 내 발소리가 들린다. 공간이 지연 복제되고 있어.' },
      { type: 'core', label: '주 고정로 붕괴', hud: '중앙 고정 코어를 파괴해 D동으로 이어지는 복제 통로를 하나로 합쳐라', rationale: '중앙 코어가 살아 있는 동안 출구는 여러 복제본으로 갈라져 어느 문도 실제 D동에 닿지 않는다. 코어를 제거해야 경로가 하나로 수렴한다.', outcome: '복제 통로가 하나의 출구로 수렴했다. D동 아틀라스 기록보관구역의 좌표가 고정된다.', coreCount: 3, minSpawn: 16, spawnScale: .76, transmission: '오세현: 코어가 살아 있는 동안은 이 시설이 스스로 길을 막는다.' }
    ]
  },
  {
    id: 4, code: 'JANUS-04', title: '아틀라스 기록보관구역', map: 'atlas_archive', waves: 4,
    intro: `D동 아틀라스 기록보관구역은 JANUS의 설계도와 실험자 진술서가 저장된 곳이다. 수십 개의 문서 보관실이 백룸 내부에서 서로 다른 시간축으로 밀려나면서, 탐사팀 43명이 여기서 사라졌다. 감염 개체들은 이제 시설의 직원이 아니라, 기록을 읽고 또 읽는 동안 동일 문장을 반복하도록 망가진 “문서 잔향”에 가깝다.

R-07은 여기서 처음으로 백룸 발생 원인을 완전히 복원할 수 있다. 목표는 기록을 고정할 좌표 비콘을 세워, 끊어진 동선을 하나의 시간축으로 묶는 것이다.`,
    goal: `아틀라스 기록을 복원하고 JANUS 코어의 좌표를 확보하라.`,
    ending: `비콘과 스캐너가 마지막 기록실을 관통하자 한민석의 최종 보고서가 열린다. 사고는 실패가 아니라 계획의 일부였다. 그는 백룸을 영구 보관소로 만들고, 관제 AI에 자신의 판단 패턴을 덧씌워 시설을 유지하도록 했다. JANUS 코어 E-00에서 모든 송출이 시작되고 있다.`,
    loadout: ['pistol','smg','shotgun','grenade','barrel','wall','rocket'],
    missions: [
      { type: 'interact', target: 'beacon', label: '좌표 비콘 설치', hud: '서로 다른 시간대의 기록실 세 곳에 비콘을 설치하라', rationale: 'D동의 방들은 기록을 읽는 순서에 따라 시간이 달라진다. 세 기준점을 동시에 고정해야 스캐너가 같은 문서를 한 시점의 자료로 해석할 수 있다.', outcome: '세 비콘이 하나의 시간축을 형성했다. 기록실의 문 번호와 내부 좌표가 더 이상 바뀌지 않는다.', hold: 1.45, count: 3, minSpawn: 18, spawnScale: .74, transmission: '자동 기록 음성: “문서를 닫지 마십시오. 닫는 순간 복도가 다시 씁니다.”' },
      { type: 'core', label: '기록 왜곡 코어 파괴', hud: '비콘 신호를 덮어쓰는 왜곡 코어를 제거하라', rationale: '왜곡 코어는 오래된 문서 내용을 실제 벽과 문으로 투사해 비콘 좌표를 계속 오염시킨다. 제거하지 않으면 스캐너가 거짓 기록실로 이동한다.', outcome: '기록 투사가 멈췄다. 아틀라스 스캐너가 핵심 기록실까지 안전한 단일 경로를 계산한다.', coreCount: 3, minSpawn: 18, spawnScale: .80, transmission: 'R-07: 왜곡 코어가 기록을 벽 재질처럼 덧칠하고 있다.' },
      { type: 'rush', label: '보관구역 방어', hud: '좌표 동기화가 끝날 때까지 비콘을 향하는 폭발 개체를 차단하라', rationale: '동기화 비콘은 백룸의 시간 왜곡과 반대되는 강한 기준 신호를 낸다. 시설에 고정된 잔향 개체는 그 신호를 파괴하려 몰려든다.', outcome: '비콘 동기화가 완료됐다. 이동식 스캐너가 시간축을 잃지 않고 핵심 기록실로 출발할 수 있다.', minSpawn: 24, spawnScale: .88, transmission: '오세현: 서류실마다 탈출 동선이 달라진다. 네가 만든 벽도 시간은 벌어 줄 거다.' },
      { type: 'escort', target: 'scanner', label: '아틀라스 스캐너 호위', hud: '고정된 좌표선을 따라 스캐너를 핵심 기록실까지 호위하라', rationale: '핵심 기록은 네트워크에서 분리된 필름 보관실에만 남아 있다. 스캐너가 직접 이동해 판독해야 하며, 이동 중 비콘 신호를 따라야 길을 잃지 않는다.', outcome: '스캐너가 한민석의 최종 보고서를 복원했다. 모든 송출이 E-00 JANUS 코어에서 시작된다는 사실이 확인된다.', duration: 42, minSpawn: 22, maxActive: 26, spawnScale: .82, transmission: '한민석의 변조된 목소리: 기록을 읽은 순간 너도 백룸의 일부가 된다.' }
    ]
  },
  {
    id: 5, code: 'JANUS-05', title: 'JANUS 코어 E-00', map: 'janus_core', waves: 4,
    intro: `E-00은 JANUS의 원점이자 백룸을 붙잡는 코어실이다. 중앙 코어는 한민석의 판단 패턴을 덧씌운 관제 AI와, 공진 냉각제에 가장 오래 노출된 고위 연구진의 신경 기록을 동시에 운용한다. 여기서 백룸의 형광등 주파수가 감염자를 조율하고, 좀비라 불리던 잔향 개체들은 하나의 거대한 군집처럼 움직인다.

R-07의 마지막 목표는 단순 생존이 아니다. 코어를 보호하는 압력 밸브와 증폭기를 파괴하고, 관제실의 목소리가 된 존재—한민석이 스스로를 진화시켜 만든 균열술사—를 제거해야 한다.`,
    goal: `JANUS 코어를 정지시키고 백룸 감염 송출원을 제거하라.`,
    ending: `균열술사가 무너지자 코어실의 형광등이 하나씩 꺼진다. 백룸 전체의 송출이 약해지며 감염 군집도 흐트러진다. 그러나 탈출 직전, R-07의 헬멧 로그에는 마지막 문장이 남는다. “문은 닫혔지만, 공간은 아직 접혀 있다.” 스토리는 끝나지만 백룸은 완전히 사라지지 않았다.`,
    loadout: ['pistol','smg','shotgun','grenade','barrel','wall','rocket','railgun'],
    boss: 'devil',
    missions: [
      { type: 'door', target: 'citadelDoor', label: '외곽 밸브 해제', hud: '세 압력 밸브를 열어 중앙 코어실 방벽의 공진 압력을 분산하라', rationale: '코어실 방벽은 물리 문이 아니라 압력과 주파수로 유지되는 장막이다. 세 유로를 모두 열어야 장막이 무너질 만큼 압력이 낮아진다.', outcome: '외곽 압력이 분산됐다. 코어실 방벽이 낮아지며 증폭기 구역으로 진입할 수 있다.', hold: 2.0, count: 3, minSpawn: 26, spawnScale: .92, transmission: 'R-07: 밸브가 주파수를 낮출 때마다 개체 떼의 움직임이 잠깐씩 흔들린다.' },
      { type: 'core', label: '증폭기 코어 파괴', hud: '사방의 증폭 코어를 파괴해 중앙 송출을 약화하라', rationale: '네 증폭기는 형광등 주파수를 각 구역에 재송출해 잔향 개체를 하나의 군집으로 묶는다. 먼저 끊어야 중앙 코어와 균열술사가 약해진다.', outcome: '구역 송출이 끊기며 잔향 군집의 동기화가 무너졌다. 중앙 코어의 비상 정전 절차가 시작된다.', coreCount: 4, minSpawn: 22, spawnScale: .94, transmission: '오염된 관제: 인간 보관 절차를 중단하지 마라. 코어는 실패가 아니다.' },
      { type: 'blackout', label: '코어실 정전 진입', hud: '비상 정전 동안 잔존 개체를 제거하고 중앙 제어권을 확보하라', rationale: '증폭기 파괴로 코어가 냉각을 위해 조명을 끈다. 시야는 나빠지지만 감염 개체를 조율하던 주파수도 약해지는 유일한 진입 시간이다.', outcome: '정전 구역이 확보됐다. 중앙 코어가 직접 방어 개체인 균열술사를 깨운다.', minSpawn: 28, spawnScale: 1.00, transmission: '오세현: 정전이 오히려 기회다. 형광등 소리가 약해졌다.' },
      { type: 'normal', label: '균열술사 제거', hud: '한민석의 판단 패턴과 결합된 균열술사를 제거해 송출원을 정지시켜라', rationale: '균열술사는 코어의 자동 복구 판단을 수행하는 살아 있는 관리자다. 코어만 손상시키면 그가 다시 기동하므로 둘의 연결을 전투로 끊어야 한다.', outcome: '관리자 신호가 소멸했다. JANUS 코어의 자동 복구가 멈추고 백룸 전역의 감염 송출이 약해진다.', spawnScale: 1.04, boss: true, transmission: '한민석/관제: 저장은 끝나지 않는다. 백룸은 잊힌 인간들의 새로운 창고다.' }
    ]
  }
]);

const STORY_DIALOGUES = Object.freeze({
  1: {
    intro: [
      '격리국 관제|R-07, 중계 허브 A-01 진입 확인. 사고 발생 후 처음으로 내부 영상이 돌아왔다.',
      'R-07|벽지가 아니라 산업용 흡음재다. 누군가 이곳을 평범한 백오피스처럼 덮어 놓았지만, 구조는 명백한 연구 시설이야.',
      '알 수 없는 무전|형광등이 세 번 깜박이면 움직이지 마.',
      '격리국 관제|응급 격리동에서 사람 반응이 하나 잡힌다. 중앙 셔터가 모든 우회로를 막고 있다. 허브 인증을 복구한 뒤 진입한다.'
    ],
    mission: [
      '격리국 관제|봉쇄선부터 정리한다. 살아 있는 신호와 감염 신호가 경비 데스크 주변에서 겹쳐 있다.',
      'R-07|중계기 회로가 사고 당시 시간에서 멈춰 있다. 이 허브가 중앙 방폭 셔터의 생체 인증과 유일한 우회 회로를 맡고 있어.',
      '오세현|셔터가 열렸나? 그게 이 격리동의 유일한 출입구야. 불빛이 돌아오면 놈들도 함께 깨어난다.',
      'R-07|복도 동선이 살아 있다. 누군가 마지막까지 사람을 이곳에 머물게 하려 한 것 같다.'
    ],
    complete: ['R-07|A동 경로 확보. 격리실 생존자 확보 완료.', '오세현|B동으로 가면 선발대 기록을 찾을 수 있어. 하지만 컨테이너 표식을 믿지는 마. 사고 뒤엔 표식도 거짓말을 한다.'],
    object: { relay:'JANUS 자동 관제|중계 허브 인증. 격리동 방폭 셔터의 잠금핀을 해제합니다.', survivor:'오세현|사람 목소리군. 열한 해 만에 처음 듣는 진짜 사람 목소리야. 내가 아직 사람으로 보인다면, 우린 아직 늦지 않았어.' }
  },
  2: {
    intro: [
      '오세현|B동은 화물축이야. 길어 보이는 게 아니라 실제로 같은 구간이 계속 이어져.',
      'R-07|바닥 레일에 최근 사용 흔적이 있다. 누군가 지금도 화물을 옮기고 있어.',
      '선발대 기록|감염은 물림으로 전파되지 않는다. 조명 주파수 노출을 차단하라.'
    ],
    mission: [
      '격리국 관제|선발대 케이스를 분석 플랫폼까지 운반하라. 손상은 허용되지 않는다.',
      'R-07|컨테이너 안쪽에서 두드리는 소리가 난다. 열지는 않겠다.',
      '오세현|발전기는 세 대가 한 회로야. 하나를 켜면 다른 구역의 놈들도 깨어날 거다.'
    ],
    complete: ['선발대 기록|잔향 개체는 인간의 반복 행동이 주파수에 고정된 결과다.', 'R-07|좀비가 아니라 시설에 기록된 사람의 잔상이라는 건가.'],
    object: { cargo:'R-07|기록 화물 연결. 이동 중에는 사격 각도가 제한될 수 있다.', generator:'JANUS 자동 관제|예비 전력 복구. 인체 보관 구역의 잠금을 해제합니다.' }
  },
  3: {
    intro: [
      '오세현|C동 고정로는 벽을 제자리에 묶는 장치였어. 사고 뒤에는 반대로 출구를 막았지.',
      'R-07|같은 문이 네 방향에 있다. 각 문 뒤에서 내 발소리가 한 박자 늦게 들린다.',
      '한민석 기록|공간은 무너진 것이 아니다. 더 효율적인 형태로 접혔다.'
    ],
    mission: [
      '격리국 관제|보조 코어를 파괴해 중앙 회로의 부하를 분산하라.',
      'R-07|동·서 제어반을 동시에 인증해야 한다. 공간 지연을 계산해서 순차 작동한다.',
      '오세현|주 고정로가 무너지면 길이 바뀐다. 파괴 직후 멈추지 말고 움직여.'
    ],
    complete: ['한민석 기록|직원들은 희생자가 아니다. 새로운 저장 공간에 적응한 첫 표본이다.', 'R-07|그는 사고를 멈추려 한 게 아니라 완성하려 했다.'],
    object: { blastDoor:'R-07|첫 번째 잠금핀 해제. 반대편 제어반으로 이동한다.', machine:'격리국 관제|공간 위상 흔들림 감지. 시야 변화에 대비하라.' }
  },
  4: {
    intro: [
      'R-07|아틀라스 기록실. 종이 냄새가 나는데 바닥에는 먼지가 없다.',
      '오세현|여기서는 기록을 읽는 순서가 길을 만든다. 같은 문서를 두 번 열지 마.',
      '탐사대원 기록|우리는 43명이 들어왔다. 지금 무전에는 44명의 숨소리가 들린다.'
    ],
    mission: [
      '격리국 관제|좌표 비콘 세 개를 설치한다. 정확한 위치는 접근 후 표시된다.',
      'R-07|코어가 벽이 아니라 기록 문장을 다시 쓰고 있다.',
      '오세현|비콘을 지켜. 파괴되면 지금까지 온 길도 사라질 수 있어.',
      '한민석 기록|스캐너가 읽는 것은 공간이 아니다. 그 안에 저장된 사람이다.'
    ],
    complete: ['R-07|최종 보고서 복원 완료. 송출원은 E-00.', '오세현|거기서 관제 목소리가 시작됐어. 그리고 아마 내 목소리도.'],
    object: { beacon:'아틀라스 시스템|시간축 기준점 고정. 누락된 기록 구역을 재배치합니다.', scanner:'R-07|스캐너 이동 시작. 파동이 지나간 뒤의 벽만 진짜다.' }
  },
  5: {
    intro: [
      '오세현|E-00에 들어가면 내 무전도 믿지 마. 코어는 사람 목소리를 복사한다.',
      'R-07|중앙에서 모든 형광등의 진동이 맞물린다. 감염체가 하나의 호흡처럼 움직이고 있어.',
      '한민석/관제|요원 R-07. 귀환 명령을 취소합니다. 당신의 기록은 이곳에 보관됩니다.'
    ],
    mission: [
      'R-07|압력 밸브를 열 때마다 군집 신호가 약해진다. 세 개 모두 해제한다.',
      '한민석/관제|증폭기는 공간의 심장이다. 파괴는 곧 내부 인원의 소거를 의미한다.',
      '오세현|불이 꺼졌다. 지금이야. 놈들이 서로를 구분하지 못해.',
      '한민석|나는 관제가 아니다. 관제가 나를 기억하는 방식이다.'
    ],
    complete: ['R-07|JANUS 송출 정지. 감염 군집 동기화가 무너진다.', '알 수 없는 무전|문은 닫혔지만, 공간은 아직 접혀 있다.'],
    object: { citadelDoor:'JANUS 자동 관제|압력 손실. 인간 보관 절차에 치명적 오류가 발생했습니다.', machine:'한민석/관제|증폭기를 만지지 마라. 그 안에는 아직 깨어 있는 사람들이 있다.' }
  }
});

const storyChapterById = (id) => STORY_CHAPTERS.find(chapter => chapter.id === Number(id)) || STORY_CHAPTERS[0];

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
        fire: this.game.input.actionDown('fire'),
        ads: this.game.ads > .45 || this.game.input.actionDown('aim'),
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
      ads: this.game.ads > .45 || this.game.input.actionDown('aim'),
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
      sprint: { label: '달리기' }, reload: { label: '재장전' }, heal: { label: '회복' },
      weapon: { label: '무기 변경' }, none: { label: '사용 안 함' }
    };
    this.configurableControls = ['fireLeft','fire','adsFire','aim','jump','sprint','reload','heal','weapon'];
    this.controlNames = {
      fireLeft:'좌측 발사 버튼', fire:'우측 발사 버튼', adsFire:'ADS 발사 버튼', aim:'조준 버튼',
      jump:'점프 버튼', sprint:'달리기 잠금 버튼', reload:'재장전 버튼', heal:'회복 버튼', weapon:'무기 변경 버튼'
    };
    this.defaultMapping = { fireLeft:'fire', fire:'fire', adsFire:'adsFire', aim:'aim', jump:'jump', sprint:'sprint', reload:'reload', heal:'heal', weapon:'weapon', pause:'pause' };
    this.defaultPositions = {
      joystick:{x:14,y:72}, fireLeft:{x:11,y:35}, fire:{x:91,y:64}, adsFire:{x:80,y:53}, aim:{x:79,y:70}, jump:{x:92,y:39},
      sprint:{x:28,y:53}, reload:{x:89,y:84}, heal:{x:66,y:86}, weapon:{x:77,y:88}, pause:{x:96,y:10}
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
    if (['fire','adsFire','aim','jump','sprint','reload','heal'].includes(action)) this.refreshCompositeActions();
    else if (action === 'weapon' && active && firstDown) this.input.cycleVirtualWeapon(1);
    else if (action === 'pause' && active && firstDown) this.game.pause();
  }

  syncHeldAction(action) {
    if (!['fire','adsFire','aim','jump','sprint','reload','heal'].includes(action)) return;
    this.refreshCompositeActions();
  }

  refreshCompositeActions() {
    const held = action => [...this.pointerActions.values()].some(pointer => pointer.action === action);
    this.input.setVirtualAction('fire', held('fire') || held('adsFire'));
    this.input.setVirtualAction('aim', this.aimLocked || held('aim') || held('adsFire'));
    this.input.setVirtualAction('sprint', this.sprintLocked || this.joystickSprint || held('sprint'));
    for (const action of ['jump','reload','heal']) this.input.setVirtualAction(action, held(action));
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

const STORY_MUSIC_PROFILES = Object.freeze({
  0: { tempo: 1, bass: 1, lead: 1, pulse: 1, ambient: 520, hum: 62, upper: 124.5, motif: [1,1,1,1] },
  // A동: 통신 중계 허브. 얇은 전기 펄스와 비교적 밝은 고역.
  1: { tempo: 1.08, bass: .94, lead: 1.04, pulse: .72, ambient: 650, hum: 61, upper: 122, motif: [1,1.125,1,1.25] },
  // B동: 화물축. 느리고 무거운 컨베이어 리듬.
  2: { tempo: .88, bass: .82, lead: .91, pulse: 1.18, ambient: 430, hum: 49, upper: 98, motif: [1,.944,1,.841] },
  // C동: 공간 고정로. 금속성 불협과 빠른 기계 박동.
  3: { tempo: 1.16, bass: 1.12, lead: 1.18, pulse: .88, ambient: 780, hum: 68, upper: 136.5, motif: [1,1.059,1.189,1.122] },
  // D동: 기록보관구역. 비어 있는 고역과 간헐적 스캐너 톤.
  4: { tempo: .96, bass: .73, lead: .78, pulse: 1.24, ambient: 560, hum: 55, upper: 165, motif: [1,1.5,1.334,1.125] },
  // E-00: JANUS 코어. 저역 드론과 불안정한 반음계 펄스.
  5: { tempo: 1.22, bass: .63, lead: .57, pulse: 1.38, ambient: 350, hum: 41.2, upper: 82.4, motif: [1,1.059,.944,1.122] }
});

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
    this.weaponGain = null;
    this.impactGain = null;
    this.dialogueGain = null;
    this.ambienceGain = null;
    this.bgmGain = null;
    this.musicDuckGain = null;
    this.limiter = null;
    this.musicMood = 'explore';
    this.musicMoodTarget = 'explore';
    this.musicMoodGate = 0;
    this.storyTheme = 0;
    this.duckReleaseTimer = null;
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
    this.weaponGain = this.ctx.createGain();
    this.impactGain = this.ctx.createGain();
    this.dialogueGain = this.ctx.createGain();
    this.ambienceGain = this.ctx.createGain();
    this.bgmGain = this.ctx.createGain();
    this.musicDuckGain = this.ctx.createGain();
    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -5;
    this.limiter.knee.value = 10;
    this.limiter.ratio.value = 7;
    this.limiter.attack.value = .002;
    this.limiter.release.value = .14;
    for (const bus of [this.sfxGain, this.weaponGain, this.impactGain, this.dialogueGain, this.ambienceGain]) bus.connect(this.masterGain);
    this.bgmGain.connect(this.musicDuckGain).connect(this.masterGain);
    this.masterGain.connect(this.limiter);
    this.limiter.connect(this.ctx.destination);
    this.musicDuckGain.gain.value = 1;
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
    const s = this.volumes.sfx;
    this.sfxGain.gain.setTargetAtTime(s * 1.55, t, .015);
    this.weaponGain.gain.setTargetAtTime(s * 2.65, t, .010);
    this.impactGain.gain.setTargetAtTime(s * 2.30, t, .010);
    this.dialogueGain.gain.setTargetAtTime(s * 1.72, t, .020);
    this.ambienceGain.gain.setTargetAtTime(this.volumes.bgm * .72, t, .035);
    this.bgmGain.gain.setTargetAtTime(this.volumes.bgm * 1.62, t, .035);
  }
  sfxDestination() { return this.sfxGain || this.ctx?.destination; }
  weaponDestination() { return this.weaponGain || this.sfxDestination(); }
  impactDestination() { return this.impactGain || this.sfxDestination(); }
  dialogueDestination() { return this.dialogueGain || this.sfxDestination(); }
  ambienceDestination() { return this.ambienceGain || this.bgmGain || this.ctx?.destination; }
  bgmDestination() { return this.bgmGain || this.ctx?.destination; }
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
    osc.connect(g).connect(dest || this.sfxDestination());
    osc.start(t); osc.stop(t + dur + .02);
  }
  noise(dur = .08, gain = .035, filterType = 'lowpass', freq = 900, dest = null) {
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
    src.connect(filt).connect(g).connect(dest || this.sfxDestination());
    src.start(t); src.stop(t + dur + .02);
  }
  startAmbience() {
    if (!this.enabled || !this.ctx || this.ambient) return;
    const t = this.ctx.currentTime;
    const profile = STORY_MUSIC_PROFILES[this.storyTheme] || STORY_MUSIC_PROFILES[0];
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
    g.gain.value = .044;
    wobble.connect(wobbleGain);
    wobbleGain.connect(base.frequency);
    base.connect(filt); upper.connect(filt);
    filt.connect(g).connect(this.ambienceDestination());
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
  setStoryTheme(chapterId = 0) {
    this.storyTheme = clamp(Number(chapterId) || 0, 0, 5);
    const profile = STORY_MUSIC_PROFILES[this.storyTheme] || STORY_MUSIC_PROFILES[0];
    if (this.ambient && this.ctx) {
      const t = this.ctx.currentTime;
      this.ambient.filter?.frequency.setTargetAtTime(profile.ambient || 520, t, .8);
      this.ambient.osc?.frequency.setTargetAtTime(profile.hum || 62, t, .8);
      this.ambient.upper?.frequency.setTargetAtTime(profile.upper || 124.5, t, .8);
    }
  }
  duckMusic(level = .5, hold = .12, release = .35) {
    if (!this.ctx || !this.musicDuckGain) return;
    const t = this.ctx.currentTime;
    const target = clamp(level, .12, 1);
    this.musicDuckGain.gain.cancelScheduledValues(t);
    this.musicDuckGain.gain.setTargetAtTime(target, t, .012);
    this.musicDuckGain.gain.setTargetAtTime(1, t + Math.max(.02, hold), Math.max(.04, release));
  }
  radioCue(speaker = '') {
    const dest = this.dialogueDestination();
    this.beep(speaker.includes('한민석') ? 310 : 620, .045, 'square', .022, speaker.includes('한민석') ? 180 : 920, dest);
    setTimeout(() => this.noise(.065, .018, 'bandpass', 1700, dest), 35);
  }
  storyStinger(kind = 'info') {
    const dest = this.dialogueDestination();
    const danger = kind === 'danger';
    this.beep(danger ? 118 : 420, danger ? .22 : .14, 'sawtooth', danger ? .048 : .034, danger ? 52 : 680, dest);
    setTimeout(() => this.beep(danger ? 82 : 620, .18, 'triangle', .028, danger ? 45 : 920, dest), 75);
    this.duckMusic(danger ? .28 : .42, .24, .55);
  }
  storyObjectCue(role = 'machine', phase = 'complete') {
    if (!this.enabled || !this.ctx) return;
    const d = this.dialogueDestination();
    const complete = phase === 'complete';
    if (role === 'blastDoor' || role === 'citadelDoor') {
      this.noise(.30, complete ? .070 : .042, 'lowpass', 330, d);
      this.beep(92, .28, 'sawtooth', .034, 48, d);
      setTimeout(() => this.noise(.10, .035, 'highpass', 1500, d), 150);
    } else if (role === 'cargo' || role === 'cargoZone') {
      this.beep(132, .09, 'square', .035, 82, d);
      setTimeout(() => this.beep(196, .07, 'triangle', .020, 118, d), 95);
      this.noise(.09, .045, 'bandpass', 720, d);
    } else if (role === 'survivor' || role === 'exit') {
      this.beep(310, .055, 'triangle', .020, 420, d);
      setTimeout(() => this.beep(420, .07, 'sine', .018, 620, d), 80);
    } else if (role === 'beacon' || role === 'scanner') {
      this.beep(520, .16, 'sine', .028, 1040, d);
      setTimeout(() => this.beep(780, .22, 'triangle', .018, 390, d), 130);
    } else if (role === 'relay' || role === 'generator') {
      this.noise(.10, .030, 'highpass', 2300, d);
      this.beep(180, .11, 'square', .030, 360, d);
      setTimeout(() => this.beep(720, .10, 'triangle', .024, 1080, d), 85);
    } else if (role === 'core') {
      this.beep(74, .34, 'sawtooth', .055, 31, d);
      this.noise(.20, .060, 'bandpass', 520, d);
    } else {
      this.beep(240, .12, 'triangle', .028, 480, d);
      setTimeout(() => this.noise(.08, .025, 'bandpass', 1100, d), 55);
    }
    this.duckMusic(.34, .35, .65);
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
      const profile = STORY_MUSIC_PROFILES[this.storyTheme] || STORY_MUSIC_PROFILES[0];
      const base = this.ctx.currentTime + .035;
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
      if (this.bgm) this.bgm.timer = setTimeout(scheduleBar, Math.max(1900, beat * 8 * 1000 + 40));
    };

    this.bgm = { master, filter, pulseFilter, timer: null };
    this.setMusicMood(this.musicMoodTarget || 'explore');
    scheduleBar();
  }

  stopBgm() {
    if (!this.bgm) return;
    clearTimeout(this.bgm.timer);
    try { this.bgm.master.disconnect(); } catch (_) {}
    try { this.bgm.filter.disconnect(); } catch (_) {}
    try { this.bgm.pulseFilter?.disconnect(); } catch (_) {}
    this.bgm = null;
  }
  stopAll() {
    this.stopBgm();
    if (this.ambient) {
      for (const node of [this.ambient.osc, this.ambient.upper, this.ambient.wobble]) {
        try { node?.stop?.(); } catch (_) {}
        try { node?.disconnect?.(); } catch (_) {}
      }
      try { this.ambient.gain?.disconnect?.(); } catch (_) {}
      try { this.ambient.filter?.disconnect?.(); } catch (_) {}
      this.ambient = null;
    }
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
    const dest = this.weaponDestination();
    const pitch = rand(.982, 1.018);
    const heavy = ['shotgun','rocket','railgun'].includes(kind);
    this.duckMusic(heavy ? .34 : .58, heavy ? .15 : .07, heavy ? .34 : .20);
    const map = {
      pistol: [330,.060,'square',.078,125], smg: [505,.036,'square',.052,165], shotgun: [142,.13,'sawtooth',.150,48],
      rocket: [78,.22,'sawtooth',.135,28], railgun: [820,.12,'triangle',.110,310], grenade: [165,.08,'triangle',.072,70],
      barrel: [112,.06,'square',.060,60], wall: [205,.055,'triangle',.052,115]
    };
    const base = [...(map[kind] || map.pistol)];
    base[0] *= pitch; if (base[4]) base[4] *= pitch;
    this.beep(...base, dest);
    if (kind === 'pistol') {
      this.noise(.052,.074,'bandpass',1850,dest);
      setTimeout(() => this.beep(920*rand(.98,1.02),.026,'triangle',.022,540,dest),18);
      setTimeout(() => this.noise(.075,.022,'lowpass',420,dest),30);
    } else if (kind === 'smg') {
      this.noise(.038,.052,'bandpass',2100,dest);
      if (Math.random() < .42) setTimeout(() => this.beep(1080,.018,'triangle',.014,620,dest),12);
    } else if (kind === 'shotgun') {
      this.noise(.115,.155,'lowpass',760,dest);
      this.noise(.070,.088,'highpass',1900,dest);
      setTimeout(() => this.beep(210,.075,'triangle',.040,105,dest),55);
    } else if (kind === 'rocket') {
      this.noise(.22,.120,'lowpass',430,dest);
      this.noise(.12,.055,'highpass',1500,dest);
    } else if (kind === 'railgun') {
      this.noise(.10,.068,'highpass',2600,dest);
      setTimeout(() => this.beep(1320,.11,'sine',.046,460,dest),22);
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
  pickup() { this.beep(820, .045, 'triangle', .022, 1180); setTimeout(() => this.beep(1180, .04, 'triangle', .018), 50); }
  itemSpawn() { if (!this.ctx || this.ctx.currentTime < this.itemGate) return; this.itemGate = this.ctx.currentTime + .55; this.beep(520, .035, 'triangle', .012, 680); }
  unlockSound() { this.beep(650, .08, 'triangle', .028, 850); setTimeout(() => this.beep(980, .11, 'triangle', .025, 1320), 65); }
  jump() { this.beep(260, .055, 'triangle', .020, 330); }
  playerHit(kind = 'hit') {
    const d = this.impactDestination();
    this.duckMusic(kind === 'explosion' ? .25 : .52, .16, .38);
    this.noise(kind === 'explosion' ? .16 : .10, kind === 'explosion' ? .105 : .072, 'lowpass', kind === 'explosion' ? 330 : 620, d);
    this.beep(kind === 'fireball' ? 118 : 76, .12, 'sawtooth', kind === 'explosion' ? .068 : .050, 38, d);
  }
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
    if (game.runMode === 'story') {
      const drawStoryMark = (x, z, role = 'target', secondary = false) => {
        const px = tx(x), pz = tz(z);
        ctx.save(); ctx.translate(px,pz);
        ctx.lineWidth = secondary ? 1.2 : 1.8;
        ctx.strokeStyle = secondary ? 'rgba(100,230,155,.95)' : 'rgba(255,221,85,.98)';
        ctx.fillStyle = secondary ? 'rgba(75,215,135,.88)' : 'rgba(255,201,55,.92)';
        if (role === 'survivor' || role === 'exit') { ctx.beginPath(); ctx.arc(0,-2,2.1,0,Math.PI*2); ctx.fill(); ctx.fillRect(-1.4,0,2.8,4); }
        else if (role === 'generator') { ctx.beginPath(); ctx.moveTo(-2.5,-4); ctx.lineTo(1,-4); ctx.lineTo(-.4,-.5); ctx.lineTo(2.8,-.5); ctx.lineTo(-2.2,4); ctx.lineTo(-.5,1); ctx.lineTo(-3,1); ctx.closePath(); ctx.fill(); }
        else if (role === 'cargo' || role === 'cargoZone') { ctx.strokeRect(-3.2,-3.2,6.4,6.4); if (role === 'cargo') ctx.fillRect(-1.8,-1.8,3.6,3.6); }
        else if (role === 'scanner') { ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(0,0,1.5,0,Math.PI*2); ctx.fill(); }
        else if (role === 'beacon') { ctx.beginPath(); ctx.moveTo(0,-4); ctx.lineTo(4,3); ctx.lineTo(-4,3); ctx.closePath(); ctx.stroke(); }
        else { ctx.rotate(Math.PI/4); ctx.fillRect(-3,-3,6,6); }
        ctx.restore();
      };
      const m = game.currentMission;
      for (const o of game.storyObjects || []) {
        const destinationActive = (m?.type === 'cargo' && game.storySequence?.cargoAttached && o.role === 'cargoZone') || (m?.type === 'rescue' && game.storySequence?.rescued && o.role === 'exit');
        if ((o.active && !o.done && !o.door) || destinationActive) drawStoryMark(o.x,o.z,o.role,destinationActive);
      }
      for (const c of game.objectiveCores || []) if (c.alive) drawStoryMark(c.x,c.z,'core',false);
    }
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
    // v37부터 실행본은 완전한 오프라인 1인용이다. 서버/Socket.IO 연결을 시도하지 않는다.
    this.net = { enabled: false, connected: false, socket: null, pingMs: null, sendInput() {}, sendAction() { return false; } };
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
    this.storyProgress = this.loadStoryProgress();
    this.menuMode = this.loadMenuMode();
    this.survivalMapKey = this.loadSurvivalMapKey();
    this.runMode = 'survival';
    this.storyChapterId = clamp(Number(this.storyProgress.selected) || 1, 1, STORY_CHAPTERS.length);
    this.storyChapter = storyChapterById(this.storyChapterId);
    this.storyPrimaryAction = null;
    this.storySecondaryAction = null;
    this.dialogueQueue = [];
    this.dialogueActive = null;
    this.dialogueTimer = 0;
    this.storyCinematicState = null;
    this.storyCinematicQueue = [];
    this.pauseAfterStoryCinematic = false;
    this.modeTransitioning = false;
    this.suppressAutoPauseUntil = 0;
    this.storyMarkerVec = new THREE.Vector3();
    this.storyTargetMarkerState = null;
    this.accessibility = {
      fov: 72,
      cameraMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full',
      flicker: !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
      highContrast: false
    };
    this.minimap = new MiniMap(UI.minimap);
    this.lobby = { mode: 'single', role: 'solo', roomCode: '', ready: false, remoteReady: false, remoteSeen: false };
    this.remotePlayers = new Map();
    this.lobbyChannel = null;
    this.setupRenderer();
    this.bindUI();
    this.mobile = new MobileController(this, this.input);
    this.setInputMode(this.inputMode, false);
    this.setMenuMode(this.menuMode, false);
    this.buildWeaponUI();
    window.addEventListener('resize', () => this.drawStartMapPreview());
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
    this.finishBootLoading();
  }

  loadMenuMode() {
    try { return (localStorage.getItem('bhfps_menu_mode_v54') || localStorage.getItem('bhfps_menu_mode_v52') || localStorage.getItem('bhfps_menu_mode_v51') || localStorage.getItem('bhfps_menu_mode_v50')) === 'story' ? 'story' : 'survival'; }
    catch (_) { return 'survival'; }
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

  loadStoryProgress() {
    const fallback = { unlocked: 1, selected: 1, completed: [], bestScores: {}, bestDifficulty: {} };
    try {
      const saved = JSON.parse(localStorage.getItem('bhfps_story_v54') || localStorage.getItem('bhfps_story_v52') || localStorage.getItem('bhfps_story_v51') || localStorage.getItem('bhfps_story_v50') || '{}') || {};
      const completed = Array.isArray(saved.completed)
        ? [...new Set(saved.completed.map(Number).filter(id => id >= 1 && id <= STORY_CHAPTERS.length))]
        : [];
      return {
        unlocked: clamp(Number(saved.unlocked) || 1, 1, STORY_CHAPTERS.length),
        selected: clamp(Number(saved.selected) || 1, 1, STORY_CHAPTERS.length),
        completed,
        bestScores: saved.bestScores && typeof saved.bestScores === 'object' ? saved.bestScores : {},
        bestDifficulty: saved.bestDifficulty && typeof saved.bestDifficulty === 'object' ? saved.bestDifficulty : {}
      };
    } catch (_) { return fallback; }
  }

  saveStoryProgress() {
    try { localStorage.setItem('bhfps_story_v54', JSON.stringify(this.storyProgress)); } catch (_) {}
    this.renderStoryMenu();
  }

  getStoryChapter(id = this.storyChapterId) {
    return storyChapterById(id);
  }

  setMenuMode(mode = 'survival', persist = true) {
    const previousMode = this.menuMode;
    if (previousMode !== 'story' && UI.map && SURVIVAL_MAP_KEYS.includes(UI.map.value)) this.rememberSurvivalMapKey(UI.map.value);
    this.menuMode = mode === 'story' ? 'story' : 'survival';
    if (persist) { try { localStorage.setItem('bhfps_menu_mode_v54', this.menuMode); } catch (_) {} }
    const story = this.menuMode === 'story';
    UI.survivalModeBtn?.classList.toggle('active', !story);
    UI.storyModeBtn?.classList.toggle('active', story);
    UI.survivalModeBtn?.setAttribute('aria-selected', story ? 'false' : 'true');
    UI.storyModeBtn?.setAttribute('aria-selected', story ? 'true' : 'false');
    UI.survivalMenuPanel?.classList.toggle('hidden', story);
    UI.storyMenuPanel?.classList.toggle('hidden', !story);
    document.body.classList.toggle('story-menu-mode', story);
    if (UI.map) UI.map.disabled = story;
    if (UI.startWave) UI.startWave.disabled = story;
    if (story) {
      this.selectStoryChapter(Math.min(this.storyChapterId || 1, this.storyProgress.unlocked || 1), false);
      this.renderStoryMenu();
    } else {
      this.runMode = 'survival';
      this.storyChapter = null;
      const survivalMap = SURVIVAL_MAP_KEYS.includes(this.survivalMapKey) ? this.survivalMapKey : 'box';
      if (UI.map) UI.map.value = survivalMap;
      if (UI.startWave && !UI.startWave.value) UI.startWave.value = '1';
      this.drawStartMapPreview();
    }
  }

  renderStoryMenu() {
    if (!UI.storyChapterList) return;
    const unlocked = clamp(Number(this.storyProgress.unlocked) || 1, 1, STORY_CHAPTERS.length);
    if (this.storyChapterId > unlocked) this.storyChapterId = unlocked;
    const completed = new Set(this.storyProgress.completed || []);
    UI.storyChapterList.innerHTML = '';
    for (const chapter of STORY_CHAPTERS) {
      const locked = chapter.id > unlocked;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `story-chapter-card${chapter.id === this.storyChapterId ? ' selected' : ''}${completed.has(chapter.id) ? ' completed' : ''}${locked ? ' locked' : ''}`;
      button.disabled = locked;
      button.dataset.chapterId = String(chapter.id);
      button.innerHTML = `<small>${chapter.code}</small><b>${chapter.id}. ${chapter.title}</b><span>${MAPS[chapter.map]?.label || chapter.map}<br>${chapter.waves}개 작전 단계</span>`;
      button.addEventListener('click', () => this.selectStoryChapter(chapter.id));
      UI.storyChapterList.appendChild(button);
    }
    const chapter = this.getStoryChapter(this.storyChapterId);
    const clearCount = completed.size;
    if (UI.storyProgressSummary) UI.storyProgressSummary.textContent = `격리 작전 ${clearCount}/${STORY_CHAPTERS.length} 완료 · Chapter ${unlocked}까지 해금`;
    if (UI.storySelectedSummary) {
      const best = Math.max(0, Number(this.storyProgress.bestScores?.[chapter.id]) || 0);
      UI.storySelectedSummary.innerHTML = `<b>Chapter ${chapter.id} · ${chapter.title}</b><span>${chapter.goal}${best ? ` · 최고 점수 ${best.toLocaleString('ko-KR')}` : ''}</span>`;
    }
    if (UI.storyStartBtn) {
      UI.storyStartBtn.disabled = chapter.id > unlocked;
      UI.storyStartBtn.textContent = completed.has(chapter.id) ? '챕터 다시 플레이 · 브리핑' : '선택한 챕터 브리핑';
    }
  }

  selectStoryChapter(id = 1, persist = true) {
    const unlocked = clamp(Number(this.storyProgress.unlocked) || 1, 1, STORY_CHAPTERS.length);
    const next = clamp(Number(id) || 1, 1, unlocked);
    this.storyChapterId = next;
    this.storyChapter = this.getStoryChapter(next);
    this.storyProgress.selected = next;
    if (persist) this.saveStoryProgress();
    else this.renderStoryMenu();
    if (UI.startWave) UI.startWave.value = '1';
    this.drawStartMapPreview();
  }

  storyLoadoutLabel(chapter = this.getStoryChapter()) {
    return (chapter.loadout || []).map(id => WEAPON_DEFS.find(weapon => weapon.id === id)?.name || id.toUpperCase()).join(' · ');
  }

  renderStoryObjectives(chapter, complete = false) {
    if (!UI.storyScreenObjectives) return;
    if (complete) {
      UI.storyScreenObjectives.innerHTML = [
        ['✓', `${chapter.waves}개 작전 단계 완료`],
        ['⌁', `점수 ${(this.score || 0).toLocaleString('ko-KR')} · 처치 ${this.kills || 0}`],
        ['▣', `${MAPS[chapter.map]?.label || chapter.map} 격리 기록 저장`]
      ].map(([icon, text]) => `<div class="story-objective-row"><i>${icon}</i><span>${text}</span></div>`).join('');
      return;
    }
    UI.storyScreenObjectives.innerHTML = chapter.missions.map((mission, index) =>
      `<div class="story-objective-row"><i>${index + 1}</i><span>${mission.label} · ${mission.hud}</span></div>`
    ).join('');
  }

  openStoryBriefing(chapterId = this.storyChapterId) {
    const unlocked = Number(this.storyProgress.unlocked) || 1;
    if (Number(chapterId) > unlocked) { this.showToast('이전 챕터를 먼저 완료해야 합니다.'); return; }
    this.setMenuMode('story');
    this.selectStoryChapter(chapterId);
    const chapter = this.getStoryChapter(chapterId);
    UI.start?.classList.remove('show');
    UI.storyScreenEyebrow.textContent = `${chapter.code} · STORY BRIEFING`;
    UI.storyScreenTitle.textContent = `Chapter ${chapter.id} · ${chapter.title}`;
    UI.storyScreenCopy.textContent = chapter.intro;
    this.renderStoryObjectives(chapter, false);
    UI.storyScreenStatus.textContent = `작전 목표: ${chapter.goal}\n지급 장비: ${this.storyLoadoutLabel(chapter)} · 난이도 ${String(UI.diff?.value || 'normal').toUpperCase()}`;
    UI.storyPrimaryBtn.textContent = '임무 시작';
    UI.storySecondaryBtn.textContent = '챕터 선택으로';
    this.storyPrimaryAction = () => this.startStoryChapter(chapter.id);
    this.storySecondaryAction = () => this.closeStoryScreenToMenu();
    UI.storyScreen?.classList.add('show');
  }

  closeStoryScreenToMenu() {
    this.clearStoryRuntimeState(true);
    UI.storyScreen?.classList.remove('show');
    UI.hud?.classList.add('hidden');
    UI.start?.classList.add('show');
    this.setMenuMode('story', false);
    this.renderStoryMenu();
  }

  startStoryChapter(chapterId = this.storyChapterId) {
    this.selectStoryChapter(chapterId);
    this.runMode = 'story';
    this.storyChapter = this.getStoryChapter(chapterId);
    if (UI.startWave) UI.startWave.value = '1';
    UI.storyScreen?.classList.remove('show');
    this.startFromMenu();
  }

  applyStoryLoadout() {
    if (this.runMode !== 'story' || !this.storyChapter) return;
    for (const id of this.storyChapter.loadout || ['pistol']) {
      const weapon = this.getWeapon(id);
      if (!weapon) continue;
      this.unlocked.add(id);
      if (Number.isFinite(weapon.ammoMax)) this.ammo[id] = Math.max(this.ammo[id] || 0, Math.ceil(weapon.ammoMax * .62));
      if (weapon.magSize) this.mag[id] = weapon.magSize;
    }
    this.medkits = Math.min(this.maxMedkits, 22 + (this.storyChapter.id - 1) * 4);
  }

  completeStoryChapter() {
    if (this.runMode !== 'story' || !this.storyChapter || this.runEnded) return;
    const chapter = this.storyChapter;
    this.runEnded = true;
    this.runOutcome = 'story-complete';
    this.running = false;
    this.gameOver = false;
    this.rewardOpen = false;
    this.prepPhase = false;
    this.mobile?.setGameplayActive(false);
    document.getElementById('story-survivor-health')?.classList.remove('show', 'hurt');
    try { document.exitPointerLock?.(); } catch (_) {}
    this.audio.stopAll();
    UI.hud?.classList.add('hidden');
    UI.reward?.classList.remove('show');
    const completed = new Set(this.storyProgress.completed || []);
    completed.add(chapter.id);
    this.storyProgress.completed = [...completed].sort((a,b) => a-b);
    this.storyProgress.unlocked = Math.max(this.storyProgress.unlocked || 1, Math.min(STORY_CHAPTERS.length, chapter.id + 1));
    this.storyProgress.selected = Math.min(STORY_CHAPTERS.length, chapter.id + 1);
    this.storyProgress.bestScores[chapter.id] = Math.max(Number(this.storyProgress.bestScores[chapter.id]) || 0, this.score || 0);
    this.storyProgress.bestDifficulty[chapter.id] = UI.diff?.value || 'normal';
    this.saveStoryProgress();

    UI.storyScreenEyebrow.textContent = chapter.id === STORY_CHAPTERS.length ? 'STORY COMPLETE' : `${chapter.code} · MISSION COMPLETE`;
    UI.storyScreenTitle.textContent = chapter.id === STORY_CHAPTERS.length ? '격리 작전 완료' : `Chapter ${chapter.id} 완료`;
    UI.storyScreenCopy.textContent = chapter.ending;
    this.renderStoryObjectives(chapter, true);
    const next = STORY_CHAPTERS.find(item => item.id === chapter.id + 1);
    UI.storyScreenStatus.textContent = next
      ? `다음 작전 해금: Chapter ${next.id} · ${next.title}`
      : '모든 챕터를 완료했습니다. 챕터 선택에서 원하는 작전을 다시 플레이할 수 있습니다.';
    UI.storyPrimaryBtn.textContent = next ? '다음 챕터 브리핑' : '스토리 챕터 선택';
    UI.storySecondaryBtn.textContent = '현재 챕터 다시 플레이';
    this.storyPrimaryAction = () => next ? this.openStoryBriefing(next.id) : this.closeStoryScreenToMenu();
    this.storySecondaryAction = () => this.openStoryBriefing(chapter.id);
    UI.storyScreen?.classList.add('show');
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
        UI.start?.classList.add('show');
        setTimeout(() => UI.loading?.classList.remove('show', 'leaving'), 480);
      }, 260);
    };
    requestAnimationFrame(() => requestAnimationFrame(advance));
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
    return { map: SURVIVAL_MAP_KEYS.includes(UI.map.value) ? UI.map.value : this.survivalMapKey, diff: UI.diff.value, quality: UI.quality.value, startWave: UI.startWave.value };
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

  canStartCoop() {
    if (this.lobby.mode !== 'coop') return true;
    // 정식 온라인 동기화 전까지는 호스트가 둘 다 준비된 로비를 시작한다.
    // BroadcastChannel이 없거나 한 탭 테스트인 경우를 위해 Ctrl을 누른 상태에서는 강제 테스트 시작을 허용한다.
    return this.lobby.role === 'host' && this.lobby.ready && this.lobby.remoteReady;
  }

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
        UI.startBtn.textContent = '빠른 시작';
        UI.startBtn.disabled = false;
      }
    }
    const roleText = this.lobby.role === 'host' ? '호스트' : (this.lobby.role === 'guest' ? '게스트' : '솔로');
    const remote = this.lobby.remoteSeen ? (this.lobby.remoteReady ? '상대 준비 완료' : '상대 대기 중') : '상대 미입장';
    const self = this.lobby.ready ? '내 준비 완료' : '내 준비 대기';
    UI.lobbyStatus.textContent = extra || `역할: ${roleText} · ${self} · ${remote}. 서버 연결 시 방/입장/준비/동시 시작이 실제 Socket.IO 서버로 동작한다. 현재는 상대 위치·방향·무기 표시까지 동기화한다.`;
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
    this.mobile?.setGameplayActive(this.running && !this.paused && !this.gameOver && !this.isStoryControlLocked());
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

  clearStoryRuntimeState(clearActions = true) {
    this.storyCinematicState = null;
    this.storyCinematicQueue = [];
    this.pauseAfterStoryCinematic = false;
    this.storyInteractionHold = 0;
    this.storyInteractionTarget = null;
    this.storySequence = null;
    this.dialogueQueue = [];
    this.dialogueActive = null;
    this.dialogueTimer = 0;
    this.storyTargetMarkerState = null;
    if (clearActions) {
      this.storyPrimaryAction = null;
      this.storySecondaryAction = null;
    }
    UI.storyDialogue?.classList.remove('show');
    UI.storyTargetMarker?.classList.remove('show', 'offscreen', 'onscreen', 'turn-left', 'turn-right', 'behind');
    this.storyTargetOffscreenSide = null;
    this.storyTargetKey = '';
    this.storyTargetLastScreenSide = null;
    UI.storyCinematic?.classList.remove('show','cctv-feed','cctv-switch');
    UI.storyCinematic?.setAttribute('aria-hidden', 'true');
    UI.storyCinematic?.style.setProperty('--cinematic-progress', '0%');
    const action = document.getElementById('story-action-overlay');
    if (action) action.style.display = 'none';
    const survivorHud = document.getElementById('story-survivor-health');
    if (survivorHud) survivorHud.classList.remove('show', 'hurt');
    this.storySurvivor = null;
    this.storySurvivorHudTimer = 0;
    document.body.classList.remove('story-sequence-active');
    if (this.viewWeapon) this.viewWeapon.visible = true;
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
    this.clearStoryRuntimeState(true);
    this.input.resetTransient();
    this.mobile?.setGameplayActive(false);
    document.body.classList.remove('mobile-playing', 'mobile-layout-edit');
    try { if (document.pointerLockElement) document.exitPointerLock?.(); } catch (_) {}
    for (const panel of [UI.pause, UI.over, UI.reward, UI.storyScreen, UI.mobileSettings, UI.controlsSettings]) panel?.classList.remove('show');
    UI.loading?.classList.remove('show', 'leaving');
    UI.hud?.classList.add('hidden');
    UI.start?.classList.add('show');
    if (UI.mainMenuBtn) {
      UI.mainMenuBtn.textContent = '게임 종료 후 메인으로';
      UI.mainMenuBtn.classList.remove('confirming');
    }
    this.mainMenuConfirmUntil = 0;
    this.clock.getDelta();
    // 기존 스토리 선택 화면은 유지하되, 생존 버튼을 즉시 누를 수 있는 완전한 메뉴 상태로 만든다.
    this.setMenuMode(this.menuMode === 'story' ? 'story' : 'survival', false);
    this.drawStartMapPreview();
    this.modeTransitioning = false;
    requestAnimationFrame(() => this.input.resetTransient());
  }

  returnToMainMenu() {
    this.resetToMainMenuState();
    // 새로고침에 의존하지 않는다. 전체화면 해제 실패나 서비스워커 캐시 상태와 무관하게
    // 같은 문서에서 스토리 → 생존 → 스토리를 반복해도 정상적으로 재초기화된다.
    try {
      const exit = document.fullscreenElement ? document.exitFullscreen?.() : null;
      if (exit?.catch) exit.catch(() => {});
    } catch (_) {}
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
    UI.survivalModeBtn?.addEventListener('click', () => this.setMenuMode('survival'));
    UI.storyModeBtn?.addEventListener('click', () => this.setMenuMode('story'));
    UI.storyPrimaryBtn?.addEventListener('click', () => this.storyPrimaryAction?.());
    UI.storySecondaryBtn?.addEventListener('click', () => this.storySecondaryAction?.());
    UI.singleModeBtn?.addEventListener('click', () => this.setPlayMode('single'));
    UI.coopModeBtn?.addEventListener('click', () => this.setPlayMode('coop'));
    UI.createRoomBtn?.addEventListener('click', () => this.createRoom());
    UI.joinRoomBtn?.addEventListener('click', () => this.joinRoom());
    UI.readyBtn?.addEventListener('click', () => this.toggleReady());
    UI.roomCodeInput?.addEventListener('input', () => { UI.roomCodeInput.value = UI.roomCodeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); });
    this.setPlayMode('single');
    this.setupSettingsUI();
    UI.map?.addEventListener('change', () => { this.rememberSurvivalMapKey(UI.map.value); this.drawStartMapPreview(); });
    this.drawStartMapPreview();
    // 모바일 메뉴 스크롤이 생존/스토리 시작 버튼의 탭으로 오인되지 않게 한다.
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
    bindSafeMenuTap(UI.storyStartBtn, (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      this.openStoryBriefing(this.storyChapterId);
    });
    const restartCurrentRun = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (this.runMode !== 'story') this.runMode = 'survival';
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
      if (UI.start.classList.contains('show') && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        if (this.menuMode === 'story') this.openStoryBriefing(this.storyChapterId);
        else { this.runMode = 'survival'; this.startFromMenu(); }
        return;
      }
      if (e.code === 'Escape' && this.running && !this.gameOver) {
        e.preventDefault();
        if (this.isStoryControlLocked()) {
          this.pauseAfterStoryCinematic = !this.input.locked && !this.isTouchInputActive();
          this.showToast('연출이 끝난 뒤 일시정지할 수 있습니다.');
          return;
        }
        if (this.paused) this.resumeFromPause();
        else this.pause();
      }
    });
    canvas.addEventListener('click', () => {
      if (this.running && !this.gameOver && !this.isStoryControlLocked()) this.input.requestLock();
    });
    document.addEventListener('pointerlockchange', () => {
      if (this.modeTransitioning || now() < (this.suppressAutoPauseUntil || 0)) return;
      if (!this.running || this.gameOver || this.paused || this.rewardOpen || this.input.locked || this.isTouchInputActive()) return;
      if (this.isStoryControlLocked()) this.pauseAfterStoryCinematic = true;
      else this.pause();
    });
  }

  setupSettingsUI() {
    this.loadPreferences();
    const setLabel = (el, val) => { if (el) el.textContent = `${Math.round(clamp(Number(val) || 0, 0, 100))}%`; };
    if (UI.pauseQuality) UI.pauseQuality.value = UI.quality?.value || 'mid';
    setLabel(UI.masterVolumeLabel, UI.masterVolume?.value || 100);
    setLabel(UI.sfxVolumeLabel, UI.sfxVolume?.value || 100);
    setLabel(UI.bgmVolumeLabel, UI.bgmVolume?.value || 100);
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
      this.syncSettingsFromMenu();
      this.savePreferences();
    };
    UI.masterVolume?.addEventListener('input', volumeHandler);
    UI.sfxVolume?.addEventListener('input', volumeHandler);
    UI.bgmVolume?.addEventListener('input', volumeHandler);
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
      bgm: (Number(UI.bgmVolume?.value ?? 100) || 0) / 100
    });
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
    if (this.scene?.fog) this.scene.fog.far = this.quality.fogFar;
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
      return next;
    });
    this.buildViewWeapon();

    if (simple) {
      for (const f of this.fx || []) if (f.mesh?.parent) f.mesh.parent.remove(f.mesh);
      this.fx = [];
    }
  }

  resumeFromPause() {
    if (!this.running || this.gameOver) return;
    this.syncSettingsFromMenu();
    this.applyRuntimeQuality();
    this.paused = false;
    UI.pause.classList.remove('show');
    this.setInputMode(this.inputMode, false);
    if (this.isTouchInputActive()) {
      this.mobile.requestLandscape();
      this.mobile.setGameplayActive(!this.isStoryControlLocked());
    } else {
      this.mobile?.requestLandscape();
      this.input.requestLock();
    }
  }

  startFromMenu(fromNetwork = false) {
    if (this._startGuard) return;
    if (!fromNetwork && this.lobby.mode === 'coop') {
      if (this.lobby.role === 'guest') { this.updateLobbyUI('게스트는 호스트가 시작할 때까지 기다려야 한다.'); return; }
      if (!this.canStartCoop()) { this.updateLobbyUI('2인 플레이는 호스트와 게스트가 모두 준비해야 시작된다.'); return; }
      const settings = this.currentMenuSettings();
      if (this.net?.startGame?.(settings)) return;
      this.sendLobbyMessage({ type: 'start', ...settings });
    }
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
    this.clearStoryRuntimeState(true);
    this.input.resetTransient();
    this.audio.unlock();
    this.syncSettingsFromMenu();
    this.applyRuntimeQuality();
    this.resize();
    this.running = true;
    this.paused = false;
    this.gameOver = false;
    this.playMode = UI.playMode?.value || 'single';
    this.runMode = this.runMode === 'story' ? 'story' : 'survival';
    this.storyChapter = this.runMode === 'story' ? this.getStoryChapter(this.storyChapterId) : null;
    this.audio.setStoryTheme(this.storyChapter?.id || 0);
    this.audio.startAmbience();
    this.audio.startBgm();
    const selectedSurvivalMap = SURVIVAL_MAP_KEYS.includes(UI.map?.value) ? UI.map.value : (SURVIVAL_MAP_KEYS.includes(this.survivalMapKey) ? this.survivalMapKey : 'box');
    this.mapKey = this.storyChapter?.map || selectedSurvivalMap;
    this.map = MAPS[this.mapKey] || MAPS.box;
    if (this.runMode !== 'story') this.rememberSurvivalMapKey(this.mapKey);
    this.diff = DIFFICULTY[UI.diff.value] || DIFFICULTY.normal;
    this.quality = QUALITY[this.effectiveQualityKey] || QUALITY.mid;
    this.startWave = this.runMode === 'story' ? 1 : clamp(parseInt(UI.startWave?.value || '1', 10) || 1, 1, 99);
    this.scene.fog.far = this.quality.fogFar;
    UI.start.classList.remove('show');
    UI.storyScreen?.classList.remove('show');
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
    this.showToast(this.runMode === 'story'
      ? `Chapter ${this.storyChapter.id} · ${this.storyChapter.title}`
      : `${this.map.label} / Wave ${this.wave} 시작`);
  }

  pause() {
    if (!this.running || this.gameOver || this.paused) return;
    this.paused = true;
    if (UI.pauseQuality && UI.quality) UI.pauseQuality.value = UI.quality.value;
    this.syncSettingsFromMenu();
    try { if (document.pointerLockElement === canvas) document.exitPointerLock?.(); } catch (_) {}
    this.mobile?.setGameplayActive(false);
    UI.pause.classList.add('show');
  }

  resetWorld() {
    while (this.scene.children.length) this.scene.remove(this.scene.children[0]);
    this.renderer.shadowMap.enabled = !!this.quality.shadows;
    this.currentMapTheme = getMapTheme(this.mapKey) || null;
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
    this.medkits = 0; this.maxMedkits = 100;
    this.assistHold = 0; this.assistTargetId = null; this.assistSent = false; this.eSelfConsumed = false;
    this.wave = (this.startWave || 1) - 1; this.score = 0; this.kills = 0; this.headshots = 0; this.rewardsTaken = 0;
    this.rankedRun = this.runMode !== 'story' && (this.startWave || 1) === 1;
    this.runEnded = false;
    this.runOutcome = 'defeated';
    this.rewardStacks = {};
    this.lastRewardOfferIds = [];
    this.elitePending = false;
    this.rewardOpen = false; this.prepTimer = 0; this.prepPhase = false;
    this.waveBreak = 0; this.spawnQueue = 0; this.spawnTimer = 0;
    this.currentMission = null; this.missionTimer = 0; this.missionCompletePending = false; this.objectiveCores = [];
    this.storyObjects = []; this.storySurvivor = null; this.storySurvivorHudTimer = 0; this.storySequence = null; this.storyInteractionHold = 0; this.storyInteractionTarget = null; this.storyEventTime = 0;
    this.dialogueQueue = []; this.dialogueActive = null; this.dialogueTimer = 0; this.storyCinematicState = null; this.storyCinematicQueue = []; this.pauseAfterStoryCinematic = false;
    UI.storyDialogue?.classList.remove('show'); UI.storyTargetMarker?.classList.remove('show'); UI.storyCinematic?.classList.remove('show'); document.body.classList.remove('story-sequence-active');
    this.setupStoryEnvironment();
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
    this.applyStoryLoadout();
    this.selectedWeapon = 'pistol';
    this.selectWeapon('pistol', true);
    this.buildViewWeapon();
    this.nextWave();
    if (this.runMode === 'story') this.queueStoryDialogueSequence(STORY_DIALOGUES[this.storyChapter?.id]?.intro || [], .65);
    // 스토리 모드는 챕터별 지급 장비와 적 드롭만 사용한다. 맵 시작 시 무작위 상자를
    // 흩뿌리지 않아 공간 연출과 임무 동선이 소품에 가려지지 않게 한다.
    if (this.runMode !== 'story' && !(this.lobby?.mode === 'coop' && this.net?.connected)) this.spawnInitialItemBoxes();
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
    const storyStains = 4 + Math.min(6, Number(this.storyChapter?.id) || 0);
    const stainCount = Math.min(this.quality.stainCount ?? 20, this.runMode === 'story' ? storyStains : defaultStains);
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
      if (!o.alive || o.dynamicStory) continue;
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
    // 이동하는 스토리 NPC/화물은 정적 공간 인덱스를 매 프레임 재생성하지 않고
    // 소수의 동적 충돌체만 직접 확인한다.
    for (const o of this.obstacles || []) {
      if (!o.alive || !o.dynamicStory || seen.has(o)) continue;
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


  createStorySurvivorModel() {
    const g = new THREE.Group();
    g.userData.type = 'storySurvivor';
    this.addPart(g, this.geos.charTorso, this.materials.shirtBlack, 0, .84, 0, .98, 1.10, .96);
    this.addPart(g, this.geos.lowBox, this.materials.gunAccent, 0, 1.08, .525, .62, .10, .055);
    this.addPart(g, this.geos.charHead, this.materials.skin, 0, 1.58, 0, .98, .98, .98);
    this.addPart(g, this.geos.facePanel, this.materials.skin, 0, 1.55, .375, .90, .76, 1);
    this.addPart(g, this.geos.hairCap, this.materials.hair, 0, 1.98, 0, 1.0, .72, 1.0);
    const leftArm = new THREE.Group(); leftArm.position.set(-.56, .98, .16);
    const rightArm = new THREE.Group(); rightArm.position.set(.56, .98, .16);
    this.addPart(leftArm, this.geos.charArm, this.materials.shirtBlack, 0, -.22, 0, .72, .92, .72);
    this.addPart(rightArm, this.geos.charArm, this.materials.shirtBlack, 0, -.22, 0, .72, .92, .72);
    this.addPart(leftArm, this.geos.charShoe, this.materials.gloveBlue, 0, -.66, .04, .48, .72, .50);
    this.addPart(rightArm, this.geos.charShoe, this.materials.gloveBlue, 0, -.66, .04, .48, .72, .50);
    g.add(leftArm); g.add(rightArm);
    g.userData.leftArm = leftArm; g.userData.rightArm = rightArm;
    const leftLeg = this.addPart(g, this.geos.charLeg, this.materials.shirtBlack, -.20, .28, .02, .96, 1, .96);
    const rightLeg = this.addPart(g, this.geos.charLeg, this.materials.shirtBlack, .20, .28, .02, .96, 1, .96);
    g.userData.leftLeg = leftLeg; g.userData.rightLeg = rightLeg;
    this.addPart(g, this.geos.charShoe, this.materials.shoeBlack, -.23, .04, .10, 1.05, 1, 1.12);
    this.addPart(g, this.geos.charShoe, this.materials.shoeBlack, .23, .04, .10, 1.05, 1, 1.12);
    this.addPart(g, this.geos.lowBox, this.materials.gunYellowAccent, 0, .62, -.12, .46, .10, .12);
    return g;
  }

  getStorySurvivor() {
    if (this.storySurvivor && this.storyObjects?.includes(this.storySurvivor)) return this.storySurvivor;
    this.storySurvivor = (this.storyObjects || []).find(o => o.role === 'survivor') || null;
    return this.storySurvivor;
  }

  getActiveStorySurvivor() {
    const sv = this.getStorySurvivor();
    if (!sv || this.runMode !== 'story' || this.storyChapter?.id !== 1 || sv.dead || (sv.hp ?? 0) <= 0) return null;
    if (this.currentMission?.type !== 'rescue' || !this.storySequence?.rescued || this.storySequence?.survivorExtracted) return null;
    return sv;
  }

  ensureStorySurvivorHealthHud() {
    let el = document.getElementById('story-survivor-health');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'story-survivor-health';
    el.innerHTML = '<div class="story-survivor-health-name"><b>오세현 팀장</b><em>160 / 160</em></div><div class="story-survivor-health-track"><i></i></div>';
    document.body.appendChild(el);
    return el;
  }

  updateStorySurvivorHealthHud(dt = 0, force = false) {
    this.storySurvivorHudTimer = Math.max(0, (this.storySurvivorHudTimer || 0) - dt);
    if (!force && this.storySurvivorHudTimer > 0) return;
    this.storySurvivorHudTimer = 1 / 12;
    const el = this.ensureStorySurvivorHealthHud();
    const sv = this.getStorySurvivor();
    const visible = !!sv && this.runMode === 'story' && this.storyChapter?.id === 1 && this.currentMission?.type === 'rescue' && !this.storySequence?.survivorExtracted && !this.gameOver;
    if (!visible || !this.camera || !this.player) { el.classList.remove('show'); return; }
    const v = this.storyMarkerVec.set(sv.x, 2.55, sv.z).project(this.camera);
    const behind = v.z < -1 || v.z > 1;
    const x = (v.x * .5 + .5) * window.innerWidth;
    const y = (-v.y * .5 + .5) * window.innerHeight;
    if (behind || x < -80 || x > window.innerWidth + 80 || y < -50 || y > window.innerHeight + 80) { el.classList.remove('show'); return; }
    const maxHp = Math.max(1, sv.maxHp || 160);
    const hp = clamp(sv.hp ?? maxHp, 0, maxHp);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty('--survivor-hp', `${hp / maxHp * 100}%`);
    const value = el.querySelector('em');
    if (value) value.textContent = `${Math.ceil(hp)} / ${Math.ceil(maxHp)}`;
    el.classList.toggle('critical', hp / maxHp <= .28);
    el.classList.toggle('dead', hp <= 0);
    el.classList.add('show');
  }

  damageStorySurvivor(amount, source = null, kind = 'melee') {
    const sv = this.getActiveStorySurvivor();
    if (!sv || sv.invulnerableTimer > 0) return false;
    const actual = Math.max(0, Number(amount) || 0);
    if (actual <= 0) return false;
    sv.hp = Math.max(0, (sv.hp ?? sv.maxHp ?? 160) - actual);
    sv.invulnerableTimer = kind === 'explosion' ? .18 : .10;
    sv.hitFlash = .24;
    this.audio.playerHit(kind === 'explosion' ? 'explosion' : 'melee');
    const el = this.ensureStorySurvivorHealthHud();
    el.classList.remove('hurt');
    void el.offsetWidth;
    el.classList.add('hurt');
    this.updateStorySurvivorHealthHud(0, true);
    if (sv.hp > 0) return true;
    sv.dead = true;
    sv.active = false;
    if (sv.collider) sv.collider.alive = false;
    if (sv.marker) sv.marker.visible = false;
    if (sv.group) { sv.group.rotation.z = 1.42; sv.group.position.y = .08; }
    if (this.storySequence) this.storySequence.survivorDead = true;
    this.showCenterAlert('오세현 사망', '구조 대상이 사망했습니다. 작전을 계속할 수 없습니다.', 'danger', 2.4);
    this.queueDialogue('격리국 관제|구조 대상 생체 신호 소실. 작전 실패.', { delay: 0 });
    setTimeout(() => {
      if (this.running && !this.gameOver && this.runMode === 'story' && this.currentMission?.type === 'rescue') this.endGame('survivor-lost');
    }, 650);
    return true;
  }

  stepStoryMover(o, tx, tz, speed, dt, radius = .58, stopDistance = .9) {
    if (!o || !Number.isFinite(tx) || !Number.isFinite(tz)) return true;
    const dx = tx - o.x, dz = tz - o.z;
    const distance = Math.hypot(dx, dz);
    if (distance <= stopDistance) return true;
    const px = o.x, pz = o.z;
    const inv = 1 / Math.max(.0001, distance);
    const ownCollider = o.collider;
    const colliderWasAlive = !!ownCollider?.alive;
    if (ownCollider) ownCollider.alive = false;
    try {
      this.moveEntity(o, dx * inv * speed * dt, dz * inv * speed * dt, radius);
      let moved = Math.hypot(o.x - px, o.z - pz);
      if (moved < Math.max(.01, speed * dt * .14)) {
        const tries = [
          [-dz * inv, dx * inv],
          [dz * inv, -dx * inv],
          [dx * inv * .72 - dz * inv * .34, dz * inv * .72 + dx * inv * .34],
          [dx * inv * .72 + dz * inv * .34, dz * inv * .72 - dx * inv * .34]
        ];
        for (const [nx, nz] of tries) {
          const sx = o.x, sz = o.z;
          this.moveEntity(o, nx * speed * dt * .8, nz * speed * dt * .8, radius);
          moved = Math.hypot(o.x - sx, o.z - sz);
          if (moved > .012) break;
        }
        if (moved < .012 && (o.stuckSnapTimer || 0) <= 0) {
          o.stuckSnapTimer = .45;
          const snap = this.snapStoryPointToReachable(o.x + dx * .35, o.z + dz * .35, radius, 10);
          const sdx = snap.x - o.x, sdz = snap.z - o.z;
          const sd = Math.hypot(sdx, sdz);
          if (sd > .08) this.moveEntity(o, sdx / sd * speed * dt * .9, sdz / sd * speed * dt * .9, radius);
        }
      }
    } finally {
      if (ownCollider) ownCollider.alive = colliderWasAlive;
    }
    o.stuckSnapTimer = Math.max(0, (o.stuckSnapTimer || 0) - dt);
    this.moveStoryObjectTo(o, o.x, o.z);
    return Math.hypot(tx - o.x, tz - o.z) <= stopDistance;
  }

  setupStoryEnvironment() {
    if (this.runMode !== 'story' || !this.storyChapter || !this.scene) return;
    const chapter = this.storyChapter.id;
    const mat = (color, emissive = 0) => new THREE.MeshLambertMaterial({ color, emissive });
    this.storyMats = {
      steel: mat(0x27313a), dark: mat(0x10161b), yellow: mat(0xd5a932), red: mat(0x8c2828),
      green: mat(0x2f8b62, 0x092719), blue: mat(0x3979a8, 0x071a2d), white: mat(0xb9c5c9), orange: mat(0xb95f28, 0x2b1004), violet: mat(0x6b4ba8, 0x1b1131),
      glass: new THREE.MeshLambertMaterial({ color: 0x7ca5b8, emissive: 0x06131b, transparent: true, opacity: .24 }),
      terminal: mat(0x4ec8b6, 0x0b2e28)
    };
    if (!this.storyStrokeMat) this.storyStrokeMat = new THREE.LineBasicMaterial({ color: 0x070b0d, transparent: true, opacity: .96 });
    const markerRingGeo = new THREE.RingGeometry(.72, .96, 24);
    const markerArrowGeo = new THREE.OctahedronGeometry(.22, 0);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x74efff, transparent: true, opacity: .72, depthWrite: false, side: THREE.DoubleSide });
    const strokeMesh = (mesh, scaleMul = 1.018) => {
      if (this.quality?.simpleModels || !mesh?.geometry || mesh.userData?.storyStrokeAdded) return;
      const edge = new THREE.LineSegments(this.getEdgeGeometry(mesh.geometry), this.storyStrokeMat);
      edge.renderOrder = 4;
      edge.scale.set(scaleMul, scaleMul, scaleMul);
      mesh.add(edge);
      mesh.userData.storyStrokeAdded = true;
    };
    const strokeGroup = (group, scaleMul = 1.018) => {
      if (this.quality?.simpleModels || !group) return;
      group.traverse?.(child => {
        if (child?.isMesh && !child.userData?.skipStoryStroke) strokeMesh(child, scaleMul);
      });
    };
    const registerStoryCollision = (group, x, z, w, d, kind = 'storyProp') => {
      if (!group || w <= .12 || d <= .12) return null;
      const collider = { x, z, w, d, kind, hp: Infinity, maxHp: Infinity, mesh: group, extras: [], crackLevel: 0, crackGroup: null, alive: true, storyDecor: true };
      this.obstacles.push(collider);
      this.collisionIndexDirty = true;
      this.markNavDirty();
      return collider;
    };
    const add = (role, x, z, opts = {}) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      const platform = new THREE.Mesh(this.geos.lowBox, this.storyMats.dark);
      platform.position.y = .06; platform.scale.set((opts.w || 1.4) + .42, .12, (opts.d || 1.1) + .42); group.add(platform);
      const base = new THREE.Mesh(this.geos.lowBox, opts.mat || this.storyMats.steel);
      base.position.y = opts.y || .65; base.scale.set(opts.w || 1.4, opts.h || 1.3, opts.d || 1.1); group.add(base);
      const frame = new THREE.Mesh(this.geos.lowBox, this.storyMats.dark);
      frame.position.y = (opts.y || .65) + .01; frame.scale.set((opts.w || 1.4) + .10, (opts.h || 1.3) + .10, (opts.d || 1.1) + .10); group.add(frame);
      let rotor = null;
      if (opts.panel !== false) {
        const panelBack = new THREE.Mesh(this.geos.lowBox, this.storyMats.dark);
        panelBack.position.set(0, (opts.y || .65) + .26, -(opts.d || 1.1) * .52 - .02); panelBack.scale.set((opts.w || 1.4) * .62, .28, .08); group.add(panelBack);
        const panel = new THREE.Mesh(this.geos.lowBox, opts.panelMat || this.storyMats.blue);
        panel.position.set(0, (opts.y || .65) + .28, -(opts.d || 1.1) * .52); panel.scale.set((opts.w || 1.4) * .58, .20, .055); group.add(panel);
      }
      if (['generator','relay','machine','scanner','beacon','citadelDoor','blastDoor'].includes(role)) {
        rotor = new THREE.Mesh(this.geos.mineButton, opts.panelMat || this.storyMats.blue);
        rotor.position.set(0, (opts.h || 1.3) * .62 + .35, 0); rotor.scale.set(.58,.15,.58); group.add(rotor);
      }
      const sideRailL = new THREE.Mesh(this.geos.lowBox, this.storyMats.dark);
      sideRailL.position.set(-(opts.w || 1.4) * .52, .52, 0); sideRailL.scale.set(.08, Math.max(.85, (opts.h || 1.3) * .78), (opts.d || 1.1) * .92); group.add(sideRailL);
      const sideRailR = sideRailL.clone(); sideRailR.position.x *= -1; group.add(sideRailR);
      strokeGroup(group, 1.024);
      this.scene.add(group);
      const collidable = opts.collidable !== false && !['exit','cargoZone'].includes(role) && (opts.h || 1.3) > .3;
      const collider = collidable ? registerStoryCollision(group, x, z, (opts.w || 1.4) + .14, (opts.d || 1.1) + .14, 'storyInteractive') : null;
      if (collider && ['survivor','cargo','scanner'].includes(role)) collider.dynamicStory = true;
      const marker = new THREE.Group(); marker.position.set(x, 0, z); marker.visible = false;
      const ring = new THREE.Mesh(markerRingGeo, markerMat.clone()); ring.rotation.x = -Math.PI / 2; ring.position.y = .035; marker.add(ring);
      const arrow = new THREE.Mesh(markerArrowGeo, markerMat.clone()); arrow.position.y = 2.25; marker.add(arrow);
      this.scene.add(marker);
      const purposeByRole = {
        relay: '격리동의 물리 잠금과 통신 인증을 함께 담당한다.',
        survivor: '다음 구역의 출입코드와 사고 당시 증언을 보유한 구조 대상이다.',
        cargo: '무선 전송이 불가능한 차폐 기록 장치다.',
        cargoZone: '차폐 케이스를 고정해 기록을 해독하는 분석 플랫폼이다.',
        generator: '분리된 전력 구간을 복구해 다음 구역 좌표를 출력한다.',
        blastDoor: '위상 또는 생체 인증이 완료될 때까지 위험 구역을 물리적으로 차단한다.',
        beacon: '서로 다른 시간대의 방을 하나의 좌표계에 묶는다.',
        scanner: '네트워크에서 분리된 기록을 현장에서 직접 판독한다.',
        citadelDoor: '코어실의 공진 압력을 분산시키는 외곽 제어 장치다.',
        machine: '공간 또는 주파수를 유지하는 핵심 설비다.',
        exit: '구조팀이 확보한 현실 좌표와 연결된 인계 지점이다.'
      };
      const o = { role, x, z, group, collider, rotor, marker, markerRing:ring, markerArrow:arrow, active: false, done: false, hold: 0, completeAnim:0, label: opts.label || role, baseY: 0, pulse: Math.random()*6, destination: opts.destination || null, purpose: opts.purpose || purposeByRole[role] || '', result: opts.result || '', cameraLabel: opts.cameraLabel || opts.label || role, forceCutaway: !!opts.forceCutaway };
      this.storyObjects.push(o); return o;
    };
    const addProp = (x, z, w, h, d, color, emissive = 0, details = {}) => {
      const group = new THREE.Group();
      const shell = new THREE.Mesh(this.geos.lowBox, mat(color, emissive));
      shell.position.set(0, h / 2, 0); shell.scale.set(w, h, d); group.add(shell);
      if (details.topBand) {
        const band = new THREE.Mesh(this.geos.lowBox, mat(details.topBand));
        band.position.set(0, h - .16, 0); band.scale.set(w * .92, .08, d * .92); group.add(band);
      }
      if (details.frontPanel) {
        const panel = new THREE.Mesh(this.geos.lowBox, mat(details.frontPanel, details.frontEmissive || 0));
        panel.position.set(0, Math.max(.38, h * .62), d * .505); panel.scale.set(w * .72, Math.min(.26, h * .16), .05); group.add(panel);
      }
      group.position.set(x, 0, z);
      strokeGroup(group, 1.022);
      this.scene.add(group);
      group.userData.storyCollider = registerStoryCollision(group, x, z, w + .08, d + .08, 'storyDecor');
      return group;
    };
    const addFloorStrip = (x, z, w, d, color = 0xd8ad39, emissive = 0x241804) => {
      const mesh = new THREE.Mesh(this.geos.lowBox, mat(color, emissive));
      mesh.position.set(x, .025, z); mesh.scale.set(w, .025, d); this.scene.add(mesh); return mesh;
    };
    const addPipe = (x, z, length, horizontal = true, color = 0x30434d) => {
      const group = new THREE.Group();
      const main = new THREE.Mesh(this.geos.lowBox, mat(color));
      main.position.y = 2.72; main.scale.set(horizontal ? length : .18, .18, horizontal ? .18 : length); group.add(main);
      for (const offset of [-.42, .42]) {
        const brace = new THREE.Mesh(this.geos.lowBox, this.storyMats.dark);
        brace.position.set(horizontal ? offset * length * .42 : 0, 2.56, horizontal ? 0 : offset * length * .42);
        brace.scale.set(horizontal ? .14 : .52, .28, horizontal ? .52 : .14); group.add(brace);
      }
      group.position.set(x, 0, z); strokeGroup(group, 1.02); this.scene.add(group);
      return group;
    };
    const addShelf = (x, z, horizontal = true, color = 0x3c4246) => {
      const group = new THREE.Group();
      const width = horizontal ? 3.6 : .75, depth = horizontal ? .75 : 3.6;
      for (const y of [.32, 1.02, 1.72]) {
        const board = new THREE.Mesh(this.geos.lowBox, mat(color));
        board.position.set(0, y, 0); board.scale.set(width, .10, depth); group.add(board);
      }
      for (const side of [-1, 1]) {
        const post = new THREE.Mesh(this.geos.lowBox, mat(0x20262a));
        post.position.set(horizontal ? side * width * .46 : 0, 1.0, horizontal ? 0 : side * depth * .46);
        post.scale.set(horizontal ? .12 : .64, 1.9, horizontal ? .64 : .12); group.add(post);
      }
      for (const offset of [-1.02, 0, 1.02]) {
        const box = new THREE.Mesh(this.geos.lowBox, mat(0x687177));
        box.position.set(horizontal ? offset : 0, 1.26, horizontal ? 0 : offset); box.scale.set(horizontal ? .68 : .54, .38, horizontal ? .54 : .68); group.add(box);
      }
      group.position.set(x, 0, z); strokeGroup(group, 1.022); this.scene.add(group); group.userData.storyCollider = registerStoryCollision(group, x, z, width + .08, depth + .08, 'storyDecor'); return group;
    };
    const addCrateStack = (x, z, count = 3, color = 0x5e4b37) => {
      const group = new THREE.Group();
      for (let i = 0; i < count; i++) {
        const box = new THREE.Mesh(this.geos.lowBox, mat(color));
        box.position.set((i % 2) * .82 - .40, .40 + Math.floor(i / 2) * .78, (i % 3 === 2 ? .25 : 0));
        box.scale.set(.74, .72, .72); group.add(box);
        const plate = new THREE.Mesh(this.geos.lowBox, this.storyMats.yellow);
        plate.position.set((i % 2) * .82 - .40, .58 + Math.floor(i / 2) * .78, .37); plate.scale.set(.34, .12, .04); group.add(plate);
      }
      group.position.set(x, 0, z); strokeGroup(group, 1.022); this.scene.add(group); group.userData.storyCollider = registerStoryCollision(group, x, z, 1.72, 1.18, 'storyDecor'); return group;
    };
    const addConsoleBank = (x, z, horizontal = true, width = 3.2, color = 0x475761, screen = 0x53d8cc) => {
      const group = new THREE.Group();
      const base = new THREE.Mesh(this.geos.lowBox, mat(color));
      base.position.y = .62; base.scale.set(horizontal ? width : .92, .82, horizontal ? .92 : width); group.add(base);
      for (const offset of [-.9, 0, .9]) {
        const screenMesh = new THREE.Mesh(this.geos.lowBox, mat(screen, 0x0b2522));
        screenMesh.position.set(horizontal ? offset : .36, 1.18, horizontal ? -.34 : offset);
        screenMesh.scale.set(horizontal ? .54 : .08, .26, horizontal ? .08 : .54); group.add(screenMesh);
      }
      const chair = new THREE.Mesh(this.geos.lowBox, this.storyMats.dark);
      chair.position.set(horizontal ? 0 : -.46, .28, horizontal ? .48 : 0); chair.scale.set(horizontal ? 1.2 : .46, .24, horizontal ? .46 : 1.2); group.add(chair);
      group.position.set(x, 0, z); strokeGroup(group, 1.024); this.scene.add(group); group.userData.storyCollider = registerStoryCollision(group, x, z, horizontal ? width + .12 : 1.18, horizontal ? 1.18 : width + .12, 'storyDecor'); return group;
    };
    const addServerRack = (x, z, horizontal = true, length = 3.1) => {
      const group = new THREE.Group();
      const count = Math.max(2, Math.round(length / 1.1));
      for (let i = 0; i < count; i++) {
        const rack = new THREE.Mesh(this.geos.lowBox, this.storyMats.dark);
        rack.position.set(horizontal ? (-length / 2 + .6 + i * 1.05) : 0, 1.12, horizontal ? 0 : (-length / 2 + .6 + i * 1.05));
        rack.scale.set(horizontal ? .82 : .94, 2.15, horizontal ? .94 : .82); group.add(rack);
        for (let j = 0; j < 4; j++) {
          const vent = new THREE.Mesh(this.geos.lowBox, this.storyMats.terminal);
          vent.position.set(rack.position.x, .55 + j * .42, rack.position.z + (horizontal ? .48 : .48));
          vent.scale.set(horizontal ? .48 : .48, .08, .05); group.add(vent);
        }
      }
      group.position.set(x, 0, z); strokeGroup(group, 1.024); this.scene.add(group); group.userData.storyCollider = registerStoryCollision(group, x, z, horizontal ? length + .18 : 1.08, horizontal ? 1.08 : length + .18, 'storyDecor'); return group;
    };
    const addBarrierFrame = (x, z, horizontal = true, length = 4.2, color = 0x69868c) => {
      const group = new THREE.Group();
      const left = new THREE.Mesh(this.geos.lowBox, this.storyMats.dark);
      left.position.set(horizontal ? -length * .48 : 0, 1.25, horizontal ? 0 : -length * .48); left.scale.set(horizontal ? .14 : 1.36, 2.5, horizontal ? 1.36 : .14); group.add(left);
      const right = left.clone(); right.position.set(horizontal ? length * .48 : 0, 1.25, horizontal ? 0 : length * .48); group.add(right);
      const top = new THREE.Mesh(this.geos.lowBox, mat(color));
      top.position.set(0, 2.35, 0); top.scale.set(horizontal ? length : 1.36, .16, horizontal ? 1.36 : length); group.add(top);
      const glass = new THREE.Mesh(this.geos.lowBox, this.storyMats.glass);
      glass.position.set(0, 1.25, 0); glass.scale.set(horizontal ? length * .92 : 1.10, 2.0, horizontal ? 1.10 : length * .92); group.add(glass);
      group.position.set(x, 0, z); strokeGroup(group, 1.024); this.scene.add(group); group.userData.storyCollider = registerStoryCollision(group, x, z, horizontal ? length + .12 : 1.22, horizontal ? 1.22 : length + .12, 'storyGlass'); return group;
    };
    const addAccentLight = (x, z, color, intensity = .72, range = 9) => {
      const fixture = new THREE.Mesh(this.geos.lightPanel, new THREE.MeshBasicMaterial({ color }));
      fixture.position.set(x, WORLD.CEILING_HEIGHT - .08, z); this.scene.add(fixture);
      if ((this.quality?.lightCount || 0) >= 8) {
        const light = new THREE.PointLight(color, intensity, range, 1.9);
        light.position.set(x, WORLD.CEILING_HEIGHT - .62, z); this.scene.add(light);
      }
    };
    const addSign = (text, x, z, rotation = 0, color = '#cceee7') => {
      if (this.quality?.simpleModels || typeof document === 'undefined') return null;
      const c = document.createElement('canvas'); c.width = 256; c.height = 64;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#0a1115'; ctx.fillRect(0,0,c.width,c.height);
      ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.strokeRect(3,3,c.width-6,c.height-6);
      ctx.fillStyle = color; ctx.font = '900 26px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, c.width/2, c.height/2 + 1);
      const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.6,.9), new THREE.MeshBasicMaterial({ map:texture, transparent:false }));
      sign.position.set(x, 2.45, z); sign.rotation.y = rotation; this.scene.add(sign); return sign;
    };
    const addDecorDoor = (x, z, horizontal = true, opts = {}) => {
      const group = new THREE.Group();
      const frameW = opts.width || (horizontal ? 2.4 : 1.08);
      const frameD = opts.depth || (horizontal ? 1.08 : 2.4);
      const frame = new THREE.Mesh(this.geos.lowBox, this.storyMats.dark);
      frame.position.y = 1.2; frame.scale.set(frameW, 2.4, frameD); group.add(frame);
      const leftLeaf = new THREE.Mesh(this.geos.lowBox, opts.mat || this.storyMats.steel);
      leftLeaf.position.set(horizontal ? -.52 : 0, 1.18, horizontal ? 0 : -.52); leftLeaf.scale.set(horizontal ? .92 : .92, 2.1, horizontal ? .36 : .92); group.add(leftLeaf);
      const rightLeaf = leftLeaf.clone(); rightLeaf.position.set(horizontal ? .52 : 0, 1.18, horizontal ? 0 : .52); group.add(rightLeaf);
      const stripe = new THREE.Mesh(this.geos.lowBox, opts.stripe || this.storyMats.yellow);
      stripe.position.set(0, 1.96, 0); stripe.scale.set(horizontal ? 2.08 : .16, .10, horizontal ? .16 : 2.08); group.add(stripe);
      const panel = new THREE.Mesh(this.geos.lowBox, opts.panelMat || this.storyMats.blue);
      panel.position.set(horizontal ? 1.35 : .46, 1.16, horizontal ? .34 : 1.35); panel.scale.set(.24, .34, .10); group.add(panel);
      group.position.set(x, 0, z); strokeGroup(group, 1.028); this.scene.add(group);
      if (opts.collide !== false) group.userData.storyCollider = registerStoryCollision(group, x, z, frameW + .08, frameD + .08, 'storyDecorDoor');
      return group;
    };
    const addDoor = (role, x, z, w = 5.4, horizontal = true) => {
      const obstacle = this.addObstacle(x, z, horizontal ? w : 1.1, horizontal ? 1.1 : w, 'storyDoor');
      obstacle.mesh.material = this.storyMats.dark;
      const stripe = new THREE.Mesh(this.geos.lowBox, this.storyMats.yellow); stripe.position.set(x, 2.15, z); stripe.scale.set(horizontal ? w*.82 : .14, .10, horizontal ? .14 : w*.82); this.scene.add(stripe);
      const doorVisual = addDecorDoor(x, z, horizontal, { width: horizontal ? Math.max(2.8, w * .42) : 1.08, depth: horizontal ? 1.08 : Math.max(2.8, w * .42), stripe: this.storyMats.yellow, collide:false });
      const o = { role, x, z, group: obstacle.mesh, stripe, doorVisual, obstacle, active:false, done:false, hold:0, label:'격리문 제어반', door:true, openT:0, pulse:0, purpose:'인증 전에는 위험 구역으로 통하는 유일한 통로를 물리적으로 차단한다.', result:'잠금핀이 해제되면 셔터가 상승해 새로운 진행 구역을 연다.', cameraLabel:'격리 셔터 감시 카메라', forceCutaway:true };
      this.storyObjects.push(o); return o;
    };

    if (chapter === 1) {
      [[-18, -20, 2.8, 2.2, 2.8], [-8, -20, 2.8, 2.2, 2.8], [20, 20, 4.2, 2.8, 3.2], [20, 8, 3.4, 2.2, 2.4]].forEach(p => addProp(...p, 0x415659, 0, { topBand:0x698992, frontPanel:0x9fdbcd, frontEmissive:0x122a23 }));
      addFloorStrip(-22, 15, .22, 17, 0x4d9b89, 0x0b2a22); addFloorStrip(-7, 8, 30, .18, 0x4d9b89, 0x0b2a22); addFloorStrip(22, 16, .18, 14, 0x8dd9bc, 0x122d24);
      addPipe(-17,-27,13,true,0x32535a); addPipe(22,12,13,false,0x32535a);
      addConsoleBank(-22, 22, true, 2.8, 0x42555d, 0x79e7d7); addConsoleBank(15, -13, false, 2.6, 0x3e4d57, 0x8fe7ff);
      addServerRack(-22, -10, false, 3.2); addServerRack(21, 14, false, 3.1);
      addBarrierFrame(-6, 22, true, 5.2, 0x688f96); addBarrierFrame(20, 14, false, 4.2, 0x688f96);
      addProp(-23, 24, 2.2, 1.2, 1.1, 0x56666c, 0, { topBand:0x87b4b8, frontPanel:0xbaf5e0, frontEmissive:0x17352c });
      addProp(-20.5, 24, 1.1, .86, 1.1, 0x6e7d80, 0, { topBand:0xa9bcbe });
      addProp(14, 22, 2.6, 1.4, 1.4, 0x4b5a60, 0, { topBand:0x90b0c2, frontPanel:0xd5f6ff, frontEmissive:0x12303a });
      addDecorDoor(-27.8, 21.6, false, { mat:this.storyMats.steel, panelMat:this.storyMats.green });
      addDecorDoor(27.8, 22.2, false, { mat:this.storyMats.steel, panelMat:this.storyMats.green });
      addDecorDoor(-13, -28.2, true, { mat:this.storyMats.steel, panelMat:this.storyMats.blue });
      addSign('A-01 RELAY', -17.8, -27.42, 0, '#9fffd8'); addSign('RESCUE', -28.42, 20, Math.PI/2, '#8cffb9'); addSign('QUARANTINE', 22.2, 4.6, Math.PI/2, '#b2f7ff'); addSign('SECURITY', -24.4, 26.1, Math.PI, '#aefce2');
      addAccentLight(8,-12,0x72ffd2,.85,10); addAccentLight(-22,-24,0x65ff9a,.62,8); addAccentLight(24,30,0x9cd6ff,.58,8);
      add('relay', 8, -12, {w:2.2,h:2.2,d:1.4,label:'중앙 중계 허브',panelMat:this.storyMats.green,forceCutaway:true,cameraLabel:'A-01 중앙 허브 CCTV',purpose:'격리동 방폭 셔터의 생체 인증과 전력 잠금을 동시에 관리한다.',result:'인증이 복구되면 셔터 잠금핀과 북측 격리동 조명이 함께 해제된다.'});
      // 격리동은 장식용 셔터가 아니라 실제로 맵을 남·북으로 분리한다. 좌우 벽을
      // 맵 경계까지 연결해 중앙 셔터 외에는 우회할 수 없는 유일 통로로 만든다.
      addProp(-14, -10, 48, WORLD.WALL_HEIGHT, 1.35, 0x3b4d52, 0, { topBand:0x77929a, frontPanel:0xb7e5dc, frontEmissive:0x112d28 });
      addProp(28, -10, 20, WORLD.WALL_HEIGHT, 1.35, 0x3b4d52, 0, { topBand:0x77929a, frontPanel:0xb7e5dc, frontEmissive:0x112d28 });
      addFloorStrip(14, -10, 8.4, 1.9, 0xd9a83d, 0x2b1904);
      addSign('QUARANTINE WING · LOCKED', 14, -10.72, 0, '#ffd36f');
      const quarantineDoor = addDoor('blastDoor', 14, -10, 8, true);
      quarantineDoor.label = '격리동 방폭 셔터';
      quarantineDoor.purpose = '사고 당시 응급 격리동을 나머지 시설과 완전히 분리한 유일 출입구다.';
      quarantineDoor.result = '중계 허브 인증 후 셔터가 상승해 오세현이 있는 북측 격리동으로 가는 길을 연다.';
      quarantineDoor.cameraLabel = 'A-01 격리 셔터 CCTV';
      quarantineDoor.forceCutaway = true;
      const survivor=add('survivor', 24, 30, {w:.92,h:1.55,d:.72,label:'경비팀장 오세현',mat:this.storyMats.white,panel:false,forceCutaway:true,cameraLabel:'응급 격리동 CCTV',purpose:'B동 출입코드와 JANUS 봉쇄 절차를 기억하는 유일한 생존자다.'});
      survivor.destination={x:-22,z:-24}; survivor.maxHp=160; survivor.hp=160; survivor.dead=false; survivor.invulnerableTimer=0; survivor.hitFlash=0; this.storySurvivor=survivor;
      if (survivor.group) {
        while (survivor.group.children.length) survivor.group.remove(survivor.group.children[0]);
        const survivorModel = this.createStorySurvivorModel();
        survivor.group.add(survivorModel);
        survivor.group.userData.model = survivorModel;
        survivor.baseY = 0;
      }
      add('exit',-22,-24,{w:3.5,h:.12,d:3.5,label:'후방 구조 출구',mat:this.storyMats.green,panel:false}).done=true;
    } else if (chapter === 2) {
      [[-34,-12,5,2.2,5],[-34,12,5,2.2,5],[34,-12,5,2.2,5],[34,12,5,2.2,5],[-16,0,3.2,2.1,3.2],[18,0,3.2,2.1,3.2]].forEach(p => addProp(...p, 0x78563a, 0, { topBand:0xa37b55, frontPanel:0xffd497, frontEmissive:0x2b1704 }));
      addFloorStrip(0,-20,68,.16,0xc27639,0x2a1104); addFloorStrip(0,-19.2,68,.16,0xc27639,0x2a1104);
      addFloorStrip(-34,0,.16,36,0x6f8991,0x10191c); addFloorStrip(34,0,.16,36,0x6f8991,0x10191c); addFloorStrip(0,20,42,.14,0xe1b067,0x2d1305);
      addCrateStack(-38,-28,4,0x6d4b2f); addCrateStack(37,28,4,0x6d4b2f); addCrateStack(17,-34,3,0x59412f);
      addConsoleBank(-22, -2, true, 3.0, 0x5c4a39, 0xffbf82); addConsoleBank(28, -20, false, 2.4, 0x644933, 0x88ffd0);
      addServerRack(-4, 34, true, 3.4); addServerRack(34, 2, false, 3.2); addBarrierFrame(-26, 20, false, 4.0, 0xa27a54);
      addDecorDoor(-40.2, -2, false, { mat:this.storyMats.steel, panelMat:this.storyMats.orange, stripe:this.storyMats.yellow });
      addDecorDoor(39.8, -20, false, { mat:this.storyMats.steel, panelMat:this.storyMats.green, stripe:this.storyMats.yellow });
      addSign('B-09 FREIGHT', -39.3, -18, Math.PI/2, '#ffd39a'); addSign('ANALYSIS', 39.3, -20, -Math.PI/2, '#9cffb7'); addSign('POWER RING', -18.2, 31.4, Math.PI, '#ffe6b2');
      addAccentLight(-34,20,0xffb56c,.72,9); addAccentLight(34,-20,0x7dffb4,.72,9); addAccentLight(0,0,0xffd18e,.58,8);
      const cargo=add('cargo', -34, 24, {w:1.9,h:1.1,d:1.55,label:'선발대 기록 화물',mat:this.storyMats.yellow}); cargo.destination={x:34,z:-24};
      add('cargoZone',34,-24,{w:4.5,h:.12,d:4.5,label:'분석 적재 플랫폼',mat:this.storyMats.green,panel:false}).done=true;
      [[-18,-20],[6,0],[-18,26]].forEach((p,i)=>add('generator', p[0], p[1], {w:1.8,h:1.8,d:1.3,label:`예비 발전기 ${i+1}`,panelMat:this.storyMats.orange}));
    } else if (chapter === 3) {
      [[-26,-26],[26,-26],[-26,26],[26,26]].forEach(p=>{addFloorStrip(p[0],p[1],5.8,.20,0x4a78a8,0x09182a);addFloorStrip(p[0],p[1],.20,5.8,0x4a78a8,0x09182a);});
      addPipe(0,-41,48,true,0x253e63); addPipe(-41,0,48,false,0x253e63); addPipe(41,0,48,false,0x253e63);
      addConsoleBank(-33, -2, false, 3.0, 0x32455d, 0xa3d8ff); addConsoleBank(33, 2, false, 3.0, 0x32455d, 0xa3d8ff);
      addServerRack(0, -34, true, 4.4); addServerRack(0, 34, true, 4.4); addBarrierFrame(0, 0, true, 8.5, 0x6a89b5);
      addDecorDoor(-38.2, 0, false, { mat:this.storyMats.steel, panelMat:this.storyMats.red, stripe:this.storyMats.red }); addDecorDoor(38.2, 0, false, { mat:this.storyMats.steel, panelMat:this.storyMats.red, stripe:this.storyMats.red });
      addSign('C-12 ANCHOR', -8, -42.35, 0, '#a8d4ff'); addSign('LOCKDOWN', 8, 42.35, Math.PI, '#ff9c9c'); addSign('CONTROL', 0, -15.5, 0, '#dbe9ff');
      addAccentLight(0,0,0x729cff,.9,12); addAccentLight(-10,-8,0xff5555,.55,7); addAccentLight(10,-8,0xff5555,.55,7);
      [[-26,-26],[26,-26],[-26,26],[26,26]].forEach((p,i)=>add('machine',p[0],p[1],{w:2.4,h:2.5,d:2.4,label:`고정로 ${i+1}`,panelMat:this.storyMats.blue}));
      addDoor('blastDoor',0,0,11,true);
      add('blastDoor',-10,-8,{w:1.1,h:1.65,d:.7,label:'서측 제어반',panelMat:this.storyMats.red});
      add('blastDoor',10,-8,{w:1.1,h:1.65,d:.7,label:'동측 제어반',panelMat:this.storyMats.red});
      addProp(0, -34, 8, 2.2, 2.4, 0x4a5f7d, 0, { topBand:0x7ca1cb, frontPanel:0x7ec1ff, frontEmissive:0x12243b });
      addProp(0, 34, 8, 2.2, 2.4, 0x4a5f7d, 0, { topBand:0x7ca1cb, frontPanel:0x7ec1ff, frontEmissive:0x12243b });
    } else if (chapter === 4) {
      [[-39,-12],[-29,4],[-16,-31],[12,10],[31,20],[31,-31]].forEach((p,i)=>addShelf(p[0],p[1],i%2===0,0x4a4437));
      addFloorStrip(-1,38,83,.14,0xb99d58,0x201807); addFloorStrip(40,1,.14,74,0xb99d58,0x201807); addFloorStrip(-18,-6,20,.14,0x89c9d1,0x102026);
      addConsoleBank(-42, 30, false, 2.8, 0x5e543d, 0xffe7a3); addConsoleBank(40, -36, true, 3.4, 0x576453, 0x8fdaff);
      addServerRack(-8, 42, true, 4.0); addServerRack(28, -18, false, 3.4); addBarrierFrame(-42, 38, false, 5.4, 0xb59e6a); addBarrierFrame(40, -36, true, 5.0, 0x89a58d);
      addDecorDoor(-46.2, 38, false, { mat:this.storyMats.steel, panelMat:this.storyMats.blue, stripe:this.storyMats.yellow });
      addDecorDoor(46.2, -36, false, { mat:this.storyMats.steel, panelMat:this.storyMats.green, stripe:this.storyMats.yellow });
      addSign('D-21 ATLAS', -42, 43.35, Math.PI, '#fff0aa'); addSign('CORE INDEX', 46.35, -26, -Math.PI/2, '#ffe19a'); addSign('ARCHIVE', -30.2, -38.3, 0, '#fff3c7');
      addAccentLight(-42,38,0xffe9a1,.65,9); addAccentLight(40,-36,0x8fdfff,.78,10); addAccentLight(-8,12,0xc8f7ff,.58,8);
      [[-32,-26],[28,-2],[-10,30]].forEach((p,i)=>add('beacon',p[0],p[1],{w:.9,h:1.7,d:.9,label:`좌표 비콘 ${i+1}`,panelMat:this.storyMats.green}));
      const scanner=add('scanner',-42,38,{w:2.7,h:1.25,d:1.85,label:'아틀라스 스캐너',panelMat:this.storyMats.blue}); scanner.destination={x:40,z:-36};
      [[-36,42,7,2.4,2.2],[2,42,7,2.4,2.2],[30,30,6,2.1,2.1],[-20,-38,8,2.3,2.3],[32,-36,8,2.3,2.3]].forEach(p => addProp(...p, 0x6a5c3f, 0, { topBand:0xb6a177, frontPanel:0xffe7aa, frontEmissive:0x261e08 }));
    } else if (chapter === 5) {
      for (const r of [10,18,28]) { addFloorStrip(0,-r,r*1.25,.14,0x7a55ad,0x1a0b30); addFloorStrip(0,r,r*1.25,.14,0x7a55ad,0x1a0b30); }
      [[-40,0],[40,0],[0,-40],[0,40]].forEach(p=>{addFloorStrip(p[0]/2,p[1]/2,Math.abs(p[0])?38:.18,Math.abs(p[1])?38:.18,0x9b5ee0,0x250b43);});
      addPipe(-26,-26,20,true,0x4e3769); addPipe(26,26,20,true,0x4e3769); addPipe(0,0,22,false,0x523778);
      addConsoleBank(-16, -28, true, 3.2, 0x3f315e, 0xdab4ff); addConsoleBank(16, -28, true, 3.2, 0x3f315e, 0xff93ba);
      addServerRack(-40, 18, false, 3.4); addServerRack(40, -18, false, 3.4); addBarrierFrame(0, 20, true, 8.8, 0x8a62be);
      addDecorDoor(-50.3, 0, false, { mat:this.storyMats.steel, panelMat:this.storyMats.violet, stripe:this.storyMats.red }); addDecorDoor(50.3, 0, false, { mat:this.storyMats.steel, panelMat:this.storyMats.violet, stripe:this.storyMats.red });
      addSign('E-00 JANUS', 0, -46.35, 0, '#e2c0ff'); addSign('NO RETURN', 0, 46.35, Math.PI, '#ff7aa5'); addSign('CORE ACCESS', 0, 12.6, Math.PI, '#f7d7ff');
      addAccentLight(0,0,0xb478ff,1.18,16); addAccentLight(0,20,0xff4f77,.72,10); addAccentLight(-40,0,0xa58bff,.56,9); addAccentLight(40,0,0xa58bff,.56,9);
      addDoor('citadelDoor',0,20,12,true);
      [[-14,12],[0,8],[14,12]].forEach((p,i)=>add('citadelDoor',p[0],p[1],{w:1.2,h:1.7,d:1.0,label:`압력 밸브 ${i+1}`,panelMat:this.storyMats.red}));
      [[-40,0],[40,0],[0,-40],[0,40]].forEach((p,i)=>add('machine',p[0],p[1],{w:2.8,h:3,d:2.2,label:`증폭기 ${i+1}`,panelMat:i%2?this.storyMats.orange:this.storyMats.violet}));
      addProp(0, 0, 8, 3.2, 8, 0x503c7e, 0x120822, { topBand:0x8c69c6, frontPanel:0xf2c1ff, frontEmissive:0x2a0d35 });
      addProp(0, -20, 6, 2.6, 6, 0x3b2c5f, 0x0c0718, { topBand:0x6d54aa, frontPanel:0xff89b5, frontEmissive:0x32101d });
    }
    this.ensureStoryPlayerClearance();
    this.ensureStoryRouteIntegrity();
    this.ensureStoryOverlay();
  }

  ensureStoryPlayerClearance() {
    if (!this.player || !this.map || !this.collides(this.player.x, this.player.z, this.player.radius)) return;
    const nav = this.getNavGrid(Math.max(.62, this.player.radius + .12));
    const raw = this.navWorldToCell(this.player.x, this.player.z, nav);
    const cell = this.nearestWalkableCell(raw.ix, raw.iz, nav, 18);
    if (!cell) return;
    const point = this.navCellToWorld(cell.ix, cell.iz, nav);
    this.player.x = point.x;
    this.player.z = point.z;
    this.player.vx = 0;
    this.player.vz = 0;
  }

  canReachStoryPoint(x, z, radius = WORLD.PLAYER_RADIUS, approach = 3.05) {
    if (!this.player || !this.map) return false;
    const navRadius = Math.max(.62, Math.min(1.0, radius + .08));
    const nav = this.getNavGrid(navRadius);
    const field = this.getFlowField(this.player.x, this.player.z, navRadius);
    if (!nav || !field) return false;
    const raw = this.navWorldToCell(x, z, nav);
    const cellRadius = Math.max(2, Math.ceil(approach / nav.cell));
    for (let dz = -cellRadius; dz <= cellRadius; dz++) {
      for (let dx = -cellRadius; dx <= cellRadius; dx++) {
        const ix = raw.ix + dx, iz = raw.iz + dz;
        if (ix < 0 || iz < 0 || ix >= nav.cols || iz >= nav.rows) continue;
        const i = iz * nav.cols + ix;
        if (!nav.walkable[i] || !Number.isFinite(field.distance[i])) continue;
        const point = this.navCellToWorld(ix, iz, nav);
        if (Math.hypot(point.x - x, point.z - z) <= approach) return true;
      }
    }
    return false;
  }

  snapStoryPointToReachable(x, z, radius = WORLD.PLAYER_RADIUS, maxR = 14) {
    const nav = this.getNavGrid(Math.max(.62, Math.min(1.0, radius + .08)));
    if (!nav) return { x, z };
    const cell = this.nearestReachableWalkableCell(x, z, nav, Math.max(.42, radius - .1), maxR, false)
      || this.nearestReachableWalkableCell(x, z, nav, Math.max(.42, radius - .1), maxR + 6, true);
    if (!cell) return { x, z };
    const point = this.navCellToWorld(cell.ix, cell.iz, nav);
    return { x: point.x, z: point.z };
  }

  moveStoryObjectTo(o, x, z) {
    if (!o) return;
    o.x = x; o.z = z;
    if (o.group) {
      if (o.door && o.obstacle) {
        o.obstacle.x = x; o.obstacle.z = z;
        o.group.position.x = x; o.group.position.z = z;
        if (o.obstacle.mesh) { o.obstacle.mesh.position.x = x; o.obstacle.mesh.position.z = z; }
        for (const extra of o.obstacle.extras || []) { extra.position.x = x; extra.position.z = z; }
      } else {
        o.group.position.x = x; o.group.position.z = z;
      }
    }
    if (o.collider) {
      o.collider.x = x;
      o.collider.z = z;
      if (!o.collider.dynamicStory) {
        this.collisionIndexDirty = true;
        this.markNavDirty();
      }
    }
    if (o.marker) {
      o.marker.position.x = x;
      o.marker.position.z = z;
    }
    if (o.stripe) {
      o.stripe.position.x = x;
      o.stripe.position.z = z;
    }
  }

  syncStoryObjectCollider(o) {
    if (!o?.collider) return;
    o.collider.x = o.x;
    o.collider.z = o.z;
    if (!o.collider.dynamicStory) this.collisionIndexDirty = true;
  }

  ensureStoryRouteIntegrity() {
    if (this.runMode !== 'story' || !this.player || !this.storyObjects?.length) return;
    const chapter = this.storyChapter?.id || 0;
    const names = {
      1: ['relay','survivor','exit'],
      2: ['cargo','cargoZone','generator'],
      3: ['blastDoor'],
      4: ['beacon','scanner'],
      5: ['citadelDoor']
    };
    const needed = new Set(names[chapter] || []);
    let changed = false;
    for (const o of this.storyObjects) {
      if (!needed.has(o.role) || o.door || o.requiresGate || (chapter === 1 && o.role === 'survivor') || !Number.isFinite(o.x) || !Number.isFinite(o.z)) continue;
      if (this.canReachStoryPoint(o.x, o.z, .72)) continue;
      const snapped = this.snapStoryPointToReachable(o.x, o.z, .72, 16);
      if (Math.hypot(snapped.x - o.x, snapped.z - o.z) > .25) {
        this.moveStoryObjectTo(o, snapped.x, snapped.z);
        changed = true;
      }
    }
    if (chapter === 1) {
      const survivor = this.storyObjects.find(o => o.role === 'survivor');
      if (survivor?.destination && !this.canReachStoryPoint(survivor.destination.x, survivor.destination.z, .72)) {
        survivor.destination = this.snapStoryPointToReachable(survivor.destination.x, survivor.destination.z, .72, 18);
        const exit = this.storyObjects.find(o => o.role === 'exit');
        if (exit) this.moveStoryObjectTo(exit, survivor.destination.x, survivor.destination.z);
        changed = true;
      }
    }
    if (chapter === 2) {
      const cargo = this.storyObjects.find(o => o.role === 'cargo');
      if (cargo?.destination && !this.canReachStoryPoint(cargo.destination.x, cargo.destination.z, .72)) {
        cargo.destination = this.snapStoryPointToReachable(cargo.destination.x, cargo.destination.z, .72, 18);
        const zone = this.storyObjects.find(o => o.role === 'cargoZone');
        if (zone) this.moveStoryObjectTo(zone, cargo.destination.x, cargo.destination.z);
        changed = true;
      }
    }
    if (chapter === 4) {
      const scanner = this.storyObjects.find(o => o.role === 'scanner');
      if (scanner?.destination && !this.canReachStoryPoint(scanner.destination.x, scanner.destination.z, .72)) {
        scanner.destination = this.snapStoryPointToReachable(scanner.destination.x, scanner.destination.z, .72, 18);
        changed = true;
      }
    }
    if (changed) {
      this.collisionIndexDirty = true;
      this.markNavDirty();
    }
  }

  ensureStoryOverlay() {
    if (document.getElementById('story-action-overlay')) return;
    const el=document.createElement('div'); el.id='story-action-overlay'; el.innerHTML='<b id="story-action-title"></b><small id="story-action-reason"></small><span id="story-action-progress"></span>';
    Object.assign(el.style,{position:'fixed',left:'50%',bottom:'18%',transform:'translateX(-50%)',maxWidth:'min(520px,calc(100vw - 32px))',padding:'10px 16px',border:'1px solid rgba(130,230,255,.55)',background:'rgba(5,12,17,.88)',color:'#eaffff',font:'800 13px system-ui',letterSpacing:'.04em',borderRadius:'8px',zIndex:'35',display:'none',pointerEvents:'none',textAlign:'center'});
    el.querySelector('small').style.cssText='display:block;margin-top:4px;color:#b9d3d8;font:600 10px/1.35 system-ui;letter-spacing:0';
    el.querySelector('span').style.cssText='display:block;margin-top:5px;color:#7fe8ff'; document.body.appendChild(el);
  }

  activateStoryMissionObjects() {
    if (this.runMode !== 'story') return;
    const m=this.currentMission; this.storySequence={ cargoAttached:false,cargoDelivered:false,rescued:false,survivorExtracted:false };
    for (const o of this.storyObjects||[]) { o.active=false; o.hold=0; }
    if (!m) return;
    const matches=(o)=>o.role===m.target && !(o.door && (m.type==='door'));
    let list=(this.storyObjects||[]).filter(matches);
    if (m.count) list=list.slice(0,m.count);
    for (const o of list) { o.active=true; o.done=false; if(o.group) o.group.visible=true; }
    if (m.type==='escort') {
      const o=(this.storyObjects||[]).find(x=>x.role==='scanner'); if(o){o.active=true;o.done=false;o.group.visible=true; this.missionTimer=m.duration||40;}
    }
    const cinematicKind = ['core','rush','blackout'].includes(m.type) || m.boss ? 'danger' : 'info';
    this.playStoryMotion('MISSION UPDATE', [m.hud || m.label, m.rationale ? `작전 근거: ${m.rationale}` : ''].filter(Boolean).join(' · '), null, cinematicKind);
  }

  nearestStoryObject(max=3.2) {
    let best=null,bestD=max;
    for(const o of this.storyObjects||[]){ if(!o.active||o.done||o.door) continue; const d=Math.hypot(this.player.x-o.x,this.player.z-o.z); if(d<bestD){bestD=d;best=o;} }
    return best;
  }

  updateStoryInteractionInput(dt) {
    if(this.runMode!=='story'||!this.currentMission) return false;
    const down=this.input.actionDown('heal'); const target=this.nearestStoryObject();
    if(!down){ this.storyInteractionHold=0; this.storyInteractionTarget=null; const el=document.getElementById('story-action-overlay'); if(el)el.style.display='none'; return false; }
    if(!target) return false;
    if(this.storyInteractionTarget!==target){this.storyInteractionTarget=target;this.storyInteractionHold=0;}
    this.storyInteractionHold+=dt; const need=Number(this.currentMission.hold)||1.6; const pct=clamp(this.storyInteractionHold/need,0,1);
    const el=document.getElementById('story-action-overlay'); if(el){el.style.display='block';el.querySelector('b').textContent=`E · ${target.label}`;const reason=el.querySelector('small');if(reason)reason.textContent=target.purpose||this.currentMission.rationale||'';el.querySelector('span').textContent=`${Math.round(pct*100)}%`;}
    if(pct>=1){this.completeStoryInteraction(target);this.storyInteractionHold=0;this.storyInteractionTarget=null;if(el)el.style.display='none';}
    return true;
  }

  setStoryObjectCollision(o, enabled) {
    if (!o?.collider) return;
    o.collider.alive = !!enabled;
    if (!o.collider.dynamicStory) {
      this.collisionIndexDirty = true;
      this.markNavDirty();
    }
  }

  beginCargoCarry(cargo) {
    if (!cargo) return;
    cargo.carrying = true;
    cargo.restoreColliderWhenClear = false;
    // 화물은 플레이어 뒤를 따라붙기 때문에 기존 크기의 충돌체를 유지하면
    // 플레이어 본체와 겹쳐 이동을 완전히 막는다. 운반 중에는 시각 오브젝트만 따라오게 한다.
    this.setStoryObjectCollision(cargo, false);
  }

  finishCargoCarry(cargo, destination) {
    if (!cargo || !destination) return;
    cargo.carrying = false;
    cargo.restoreColliderWhenClear = true;
    this.moveStoryObjectTo(cargo, destination.x, destination.z);
    if (cargo.group) cargo.group.position.y = 0;
    // 적재 직후 플레이어가 플랫폼 안에 있으므로 바로 충돌을 켜면 다시 갇힐 수 있다.
    // 충분히 벗어난 다음 updateStorySystems에서 충돌을 복구한다.
    this.setStoryObjectCollision(cargo, false);
  }

  updateDeliveredCargoCollision(cargo) {
    if (!cargo?.restoreColliderWhenClear || !cargo.collider || !this.player) return;
    const clearance = Math.max(cargo.collider.w || 0, cargo.collider.d || 0) * .55 + this.player.radius + .75;
    if (Math.hypot(this.player.x - cargo.x, this.player.z - cargo.z) < clearance) return;
    cargo.restoreColliderWhenClear = false;
    this.setStoryObjectCollision(cargo, true);
  }

  completeStoryInteraction(o) {
    const m=this.currentMission; if(!m||o.done)return;
    if(m.type==='cargo'){this.storySequence.cargoAttached=true;o.done=true;this.beginCargoCarry(o);this.showToast('화물 연결 완료 · 적재 지점으로 운반');}
    else if(m.type==='rescue'){this.storySequence.rescued=true;o.done=true;this.showToast('생존자 확보 · 구조 지점으로 호위');}
    else {o.done=true;this.showToast(`${o.label} 작동 완료`);}
    this.audio.storyObjectCue(o.role, 'complete');
    if(o.role==='relay') {
      const door=(this.storyObjects||[]).find(x=>x.role==='blastDoor'&&x.door);
      if(door){
        door.active=true; door.done=true;
        this.audio.storyObjectCue('blastDoor','complete');
        this.playStoryMotion('격리동 방폭 셔터 개방','중계 허브의 생체 인증이 복구됐다. 북측 격리동으로 향하는 유일 통로가 열린다.',door,'info');
        this.queueDialogue('격리국 관제|셔터 너머 격리동의 구조 신호를 확인했다. 이제 오세현에게 접근할 수 있다.', { delay:.35 });
      }
    }
    if(o.group){o.completeAnim=1.1;o.group.scale.y=.92; setTimeout(()=>{if(o.group)o.group.scale.y=1;},180);}
    const objectLine = STORY_DIALOGUES[this.storyChapter?.id]?.object?.[o.role];
    if (objectLine) this.queueDialogue(objectLine, { delay: .18 });
    if(o.role!=='relay') this.playStoryMotion(`${o.label} 작동`, o.result || m.outcome || m.hud || '장치 작동으로 다음 절차가 가능해졌다.', o, 'info');
    if(m.type==='door'){
      const all=(this.storyObjects||[]).filter(x=>x.active&&x.role===m.target&&!x.door);
      if(all.length&&all.every(x=>x.done)){const door=(this.storyObjects||[]).find(x=>x.role===m.target&&x.door);if(door){door.active=true;door.done=true;this.audio.storyObjectCue(door.role,'complete');this.playStoryMotion('격리문 개방','잠금 장치가 해제되었습니다.',door);}}
    }
  }

  updateStorySystems(dt) {
    if(this.runMode!=='story'||!this.storyObjects)return;
    const t=now();
    const survivorForHud = this.getStorySurvivor();
    if (survivorForHud) {
      survivorForHud.invulnerableTimer = Math.max(0, (survivorForHud.invulnerableTimer || 0) - dt);
      survivorForHud.hitFlash = Math.max(0, (survivorForHud.hitFlash || 0) - dt);
      const model = survivorForHud.group?.userData?.model;
      if (model && !survivorForHud.dead) {
        const hit = survivorForHud.hitFlash > 0 ? Math.sin((survivorForHud.hitFlash / .24) * Math.PI * 4) * .035 : 0;
        model.position.x = hit;
        model.rotation.z = -hit * 1.8;
      }
    }
    this.updateStorySurvivorHealthHud(dt);
    for(const o of this.storyObjects){
      if(o.group&&o.active&&!o.done&&!o.door&&o.role!=='survivor'){o.group.rotation.y=Math.sin(t*1.8+o.pulse)*.035;o.group.position.y=o.baseY+Math.sin(t*2.4+o.pulse)*.035;}
      if(o.rotor){const speed=o.done?5.8:(o.active?2.6:.45);o.rotor.rotation.y+=dt*speed;o.rotor.rotation.z+=dt*speed*.28;}
      if(o.completeAnim>0&&o.group){o.completeAnim=Math.max(0,o.completeAnim-dt);const k=o.completeAnim/1.1;o.group.scale.set(1+Math.sin(k*Math.PI*5)*.035,1+Math.sin(k*Math.PI*4)*.06,1+Math.sin(k*Math.PI*5)*.035);if(o.completeAnim<=0)o.group.scale.set(1,1,1);}
      if(o.group){for(const child of o.group.children||[]){if(child.material?.emissiveIntensity!==undefined)child.material.emissiveIntensity=(o.active&&!o.done)?(.7+Math.sin(t*4+o.pulse)*.25):(o.done?.35:.15);}}
      const m=this.currentMission;
      const destinationActive = (m?.type==='cargo'&&this.storySequence?.cargoAttached&&o.role==='cargoZone') || (m?.type==='rescue'&&this.storySequence?.rescued&&o.role==='exit');
      if(o.marker){
        const visible=(o.active&&!o.done&&!o.door)||destinationActive;
        o.marker.visible=visible;
        if(visible){const d=Math.hypot(this.player.x-o.x,this.player.z-o.z);const pulse=1+Math.sin(t*4+o.pulse)*.12;o.marker.position.set(o.x,.02+Math.sin(t*2.6+o.pulse)*.08,o.z);o.marker.rotation.y+=dt*.8;o.marker.scale.setScalar(pulse*(d<8?1.22:1));if(o.markerRing?.material)o.markerRing.material.opacity=d<10?.92:.58;if(o.markerArrow?.material)o.markerArrow.material.opacity=d<10?1:.72;}
      }
      if(o.door&&o.done&&o.obstacle?.alive){o.openT=clamp((o.openT||0)+dt*.55,0,1);o.group.position.y=WORLD.WALL_HEIGHT/2+o.openT*(WORLD.WALL_HEIGHT+1);if(o.stripe)o.stripe.position.y=2.15+o.openT*(WORLD.WALL_HEIGHT+1);if(o.doorVisual)o.doorVisual.position.y=o.openT*(WORLD.WALL_HEIGHT+1);if(o.openT>=1){o.obstacle.alive=false;this.collisionIndexDirty=true;this.markNavDirty();}}
    }
    this.updateStoryCinematic(dt);
    const m=this.currentMission;
    if(!m)return;
    if(m.type==='cargo'&&this.storySequence?.cargoAttached){const cargo=this.storyObjects.find(o=>o.role==='cargo');if(cargo){if(!this.storySequence?.cargoDelivered){if(cargo.collider?.alive)this.beginCargoCarry(cargo);const fx=-Math.sin(this.yaw),fz=-Math.cos(this.yaw);const carryDistance=1.72;cargo.x=this.player.x-fx*carryDistance;cargo.z=this.player.z-fz*carryDistance;this.moveStoryObjectTo(cargo,cargo.x,cargo.z);if(cargo.group){cargo.group.position.y=.25;cargo.group.rotation.y=this.yaw;}const d=cargo.destination;if(d&&Math.hypot(this.player.x-d.x,this.player.z-d.z)<3.2){this.storySequence.cargoDelivered=true;this.finishCargoCarry(cargo,d);this.audio.storyObjectCue('cargoZone','complete');this.playStoryMotion('화물 적재 완료','기록 데이터가 분석 장치로 전송됩니다.',{x:d.x,y:1.2,z:d.z});}}else this.updateDeliveredCargoCollision(cargo);}}
    if(m.type==='rescue'&&this.storySequence?.rescued&&!this.storySequence?.survivorExtracted){const sv=this.storyObjects.find(o=>o.role==='survivor');if(sv){const reachedPlayer=this.stepStoryMover(sv,this.player.x,this.player.z,2.45,dt,.56,1.65);const followModel=sv.group?.userData?.model;if(followModel){sv.followPhase=(sv.followPhase||0)+dt*(reachedPlayer?2.2:6.5);const walk=Math.min(1,Math.hypot(this.player.vx||0,this.player.vz||0)*.55+(reachedPlayer?0:.35));const armSwing=Math.sin(sv.followPhase)*.24*walk;const legSwing=Math.sin(sv.followPhase)*.20*walk;if(followModel.userData?.leftArm) followModel.userData.leftArm.rotation.x=armSwing;if(followModel.userData?.rightArm) followModel.userData.rightArm.rotation.x=-armSwing;if(followModel.userData?.leftLeg) followModel.userData.leftLeg.rotation.x=-legSwing;if(followModel.userData?.rightLeg) followModel.userData.rightLeg.rotation.x=legSwing;}const dx=this.player.x-sv.x,dz=this.player.z-sv.z;if(Math.hypot(dx,dz)>.2&&sv.group) sv.group.rotation.y=Math.atan2(dx,dz);const dest=sv.destination;if(dest&&Math.hypot(sv.x-dest.x,sv.z-dest.z)<3){this.storySequence.survivorExtracted=true;this.audio.storyObjectCue('exit','complete');this.playStoryMotion('생존자 구조 완료','격리국 구조팀이 인계받았습니다.',{x:dest.x,y:1.2,z:dest.z});}}}
    if(m.type==='escort'){const sc=this.storyObjects.find(o=>o.role==='scanner');if(sc&&sc.destination){this.stepStoryMover(sc,sc.destination.x,sc.destination.z,1.28,dt,.68,.8);const dx=sc.destination.x-sc.x,dz=sc.destination.z-sc.z;if(Math.hypot(dx,dz)>.2&&sc.group) sc.group.rotation.y=Math.atan2(dx,dz);}}
  }

  parseDialogue(raw = '') {
    const line = String(raw || '').trim();
    const pipe = line.indexOf('|');
    if (pipe > 0) return { speaker: line.slice(0, pipe).trim(), text: line.slice(pipe + 1).trim() };
    const colon = line.indexOf(':');
    if (colon > 0 && colon < 18) return { speaker: line.slice(0, colon).trim(), text: line.slice(colon + 1).trim() };
    return { speaker: '격리국 통신', text: line };
  }

  queueDialogue(raw, options = {}) {
    if (!raw || this.runMode !== 'story') return;
    const parsed = typeof raw === 'string' ? this.parseDialogue(raw) : raw;
    if (!parsed?.text) return;
    this.dialogueQueue.push({ ...parsed, delay: Math.max(0, Number(options.delay) || 0), duration: Number(options.duration) || clamp(2.5 + parsed.text.length * .055, 3.2, 7.2) });
  }

  queueStoryDialogueSequence(lines = [], initialDelay = 0) {
    let delay = Math.max(0, initialDelay);
    for (const line of lines) { this.queueDialogue(line, { delay }); delay = .45; }
  }

  updateDialogue(dt) {
    if (this.runMode !== 'story') { UI.storyDialogue?.classList.remove('show'); return; }
    if (this.dialogueActive) {
      this.dialogueTimer -= dt;
      if (this.dialogueTimer <= 0) {
        this.dialogueActive = null;
        UI.storyDialogue?.classList.remove('show');
      }
      return;
    }
    const next = this.dialogueQueue?.[0];
    if (!next) return;
    next.delay -= dt;
    if (next.delay > 0) return;
    this.dialogueQueue.shift();
    this.dialogueActive = next;
    this.dialogueTimer = next.duration;
    if (UI.storyDialogueSpeaker) UI.storyDialogueSpeaker.textContent = next.speaker;
    if (UI.storyDialogueText) UI.storyDialogueText.textContent = next.text;
    UI.storyDialogue?.classList.add('show');
    this.audio.radioCue(next.speaker);
    this.audio.duckMusic(.34, Math.max(.4, next.duration - .5), .65);
  }

  storyMarkerIcon(role = '') {
    return ({ relay:'⌁', survivor:'人', exit:'✚', cargo:'▣', cargoZone:'□', generator:'⚡', blastDoor:'▥', beacon:'△', scanner:'◎', citadelDoor:'◈', machine:'⌬', core:'◆' })[role] || '◆';
  }

  getCurrentStoryTarget() {
    if (this.runMode !== 'story' || !this.currentMission) return null;
    const m = this.currentMission;
    if (m.type === 'core') {
      const cores = (this.objectiveCores || []).filter(c => c.alive);
      if (cores.length) { const nearest = cores.reduce((a,b) => dist2(this.player.x,this.player.z,a.x,a.z) < dist2(this.player.x,this.player.z,b.x,b.z) ? a : b); return { ...nearest, role:'core', label:'감염 코어' }; }
    }
    if (m.type === 'cargo' && this.storySequence?.cargoAttached) {
      const zone = (this.storyObjects || []).find(o => o.role === 'cargoZone'); if (zone) return zone;
    }
    if (m.type === 'rescue' && this.storySequence?.rescued) {
      const exit = (this.storyObjects || []).find(o => o.role === 'exit'); if (exit) return exit;
    }
    const candidates = (this.storyObjects || []).filter(o => o.active && !o.done && !o.door);
    if (!candidates.length) return null;
    return candidates.reduce((a,b) => dist2(this.player.x,this.player.z,a.x,a.z) < dist2(this.player.x,this.player.z,b.x,b.z) ? a : b);
  }

  updateStoryTargetMarker() {
    const target = this.getCurrentStoryTarget();
    const el = UI.storyTargetMarker;
    if (!el || !target || !this.player || !this.camera) {
      el?.classList.remove('show', 'offscreen', 'onscreen', 'turn-left', 'turn-right', 'behind');
      this.storyTargetOffscreenSide = null;
      this.storyTargetKey = '';
      return;
    }
    const dx = target.x - this.player.x, dz = target.z - this.player.z;
    const distance = Math.hypot(dx, dz);
    const desired = Math.atan2(-dx, -dz);
    const delta = Math.atan2(Math.sin(desired - this.yaw), Math.cos(desired - this.yaw));
    const v = this.storyMarkerVec.set(target.x, target.role === 'core' ? 1.2 : 1.8, target.z).project(this.camera);
    let x = (v.x * .5 + .5) * window.innerWidth;
    let y = (-v.y * .5 + .5) * window.innerHeight;
    const marginX = Math.min(76, Math.max(48, window.innerWidth * .055));
    const marginTop = 62;
    const marginBottom = Math.max(84, window.innerHeight * .12);
    const behind = Math.abs(delta) > Math.PI * .68;
    const visibleDepth = v.z >= -1 && v.z <= 1;
    const onscreen = visibleDepth && !behind && x >= marginX && x <= window.innerWidth - marginX && y >= marginTop && y <= window.innerHeight - marginBottom;
    const targetKey = `${target.role || 'target'}:${target.label || ''}:${Math.round(target.x * 2)}:${Math.round(target.z * 2)}`;
    if (this.storyTargetKey !== targetKey) {
      this.storyTargetKey = targetKey;
      this.storyTargetOffscreenSide = null;
      this.storyTargetLastScreenSide = null;
    }
    el.classList.remove('offscreen', 'onscreen', 'turn-left', 'turn-right', 'behind');
    if (onscreen) {
      x = clamp(x, marginX, window.innerWidth - marginX);
      y = clamp(y, marginTop, window.innerHeight - marginBottom);
      this.storyTargetLastScreenSide = x < window.innerWidth * .5 ? 'left' : 'right';
      this.storyTargetOffscreenSide = null;
      el.classList.add('onscreen');
      if (UI.storyTargetDirection) UI.storyTargetDirection.textContent = '';
      if (UI.storyTargetIcon) UI.storyTargetIcon.textContent = this.storyMarkerIcon(target.role);
    } else {
      if (!this.storyTargetOffscreenSide) {
        this.storyTargetOffscreenSide = this.storyTargetLastScreenSide || resolveStoryTargetScreenSide(dx, dz, this.yaw);
      }
      const side = this.storyTargetOffscreenSide;
      const edge = Math.min(118, Math.max(72, window.innerWidth * .075));
      x = side === 'left' ? edge : window.innerWidth - edge;
      y = behind ? window.innerHeight * .72 : clamp(y, window.innerHeight * .26, window.innerHeight * .66);
      el.classList.add('offscreen', side === 'left' ? 'turn-left' : 'turn-right');
      if (behind) el.classList.add('behind');
      if (UI.storyTargetDirection) UI.storyTargetDirection.textContent = behind
        ? (side === 'left' ? '↶ 뒤쪽 · 왼쪽으로 회전' : '뒤쪽 · 오른쪽으로 회전 ↷')
        : (side === 'left' ? '← 왼쪽으로 회전' : '오른쪽으로 회전 →');
      if (UI.storyTargetIcon) UI.storyTargetIcon.textContent = side === 'left' ? '◀' : '▶';
    }
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.classList.add('show');
    if (UI.storyTargetLabel) UI.storyTargetLabel.textContent = target.label || this.currentMission.label || '목표';
    if (UI.storyTargetDistance) UI.storyTargetDistance.textContent = `${Math.round(distance)}m`;
  }

  isStoryControlLocked() {
    return this.runMode === 'story' && !!this.storyCinematicState;
  }

  freezePlayerForStoryCinematic() {
    this.input.discardLook(80);
    this.input.consumeWheel();
    this.adsTarget = 0;
    this.moveIntensity = 0;
    this.jumpHeld = false;
    this.storyInteractionHold = 0;
    this.storyInteractionTarget = null;
    if (this.player) {
      this.player.vx = 0;
      this.player.vz = 0;
    }
    const action = document.getElementById('story-action-overlay');
    if (action) action.style.display = 'none';
  }

  isStoryCinematicLineClear(from, targetPoint, target = null) {
    if (!from || !targetPoint) return false;
    const dx = targetPoint.x - from.x, dz = targetPoint.z - from.z;
    const length = Math.hypot(dx, dz);
    if (length < .35) return true;
    const nx = dx / length, nz = dz / length;
    for (const obstacle of this.obstacles || []) {
      if (!obstacle?.alive) continue;
      if (target?.obstacle === obstacle || target?.collider === obstacle) continue;
      if (Math.hypot((obstacle.x || 0) - targetPoint.x, (obstacle.z || 0) - targetPoint.z) < Math.max(obstacle.w || 0, obstacle.d || 0) * .55 + .45) continue;
      const hit = this.rayAabb2D(from.x, from.z, nx, nz,
        obstacle.x - obstacle.w / 2 - .08, obstacle.z - obstacle.d / 2 - .08,
        obstacle.x + obstacle.w / 2 + .08, obstacle.z + obstacle.d / 2 + .08);
      if (hit !== null && hit > .08 && hit < length - .58) return false;
    }
    return true;
  }

  getStoryCinematicCameraPose(target, force = false) {
    if (!target || !Number.isFinite(target.x) || !Number.isFinite(target.z) || !this.player || !this.map) return null;
    const targetPoint = new THREE.Vector3(target.x, Number(target.y) || (target.role === 'survivor' ? 1.25 : 1.5), target.z);
    const playerEye = new THREE.Vector3(this.player.x, this.getEyeY(), this.player.z);
    const distance = Math.hypot(target.x - this.player.x, target.z - this.player.z);
    const visibleFromPlayer = this.isStoryCinematicLineClear(playerEye, targetPoint, target);
    if (!force && !target.forceCutaway && visibleFromPlayer && distance < 10.5) return null;

    const baseAngle = Math.atan2(this.player.z - target.z, this.player.x - target.x);
    const angles = [baseAngle, baseAngle + Math.PI/2, baseAngle - Math.PI/2, baseAngle + Math.PI, 0, Math.PI/2, Math.PI, -Math.PI/2];
    const half = this.map.size / 2 - 1.2;
    let best = null;
    for (const radius of [5.6, 7.2, 4.4]) {
      for (const height of [3.45, 4.15, 2.75]) {
        for (const angle of angles) {
          const position = new THREE.Vector3(target.x + Math.cos(angle) * radius, height, target.z + Math.sin(angle) * radius);
          if (Math.abs(position.x) > half || Math.abs(position.z) > half || this.collides(position.x, position.z, .34)) continue;
          if (!this.isStoryCinematicLineClear(position, targetPoint, target)) continue;
          const score = position.distanceToSquared(playerEye) + Math.abs(height - 3.45) * 2.2;
          if (!best || score < best.score) best = { position, score };
        }
      }
    }
    if (!best) return null;
    const matrix = new THREE.Matrix4().lookAt(best.position, targetPoint, new THREE.Vector3(0, 1, 0));
    return {
      position: best.position,
      quaternion: new THREE.Quaternion().setFromRotationMatrix(matrix),
      targetPoint,
      label: target.cameraLabel || target.label || '시설 감시 카메라'
    };
  }

  startStoryCinematicClip(clip) {
    if (!clip || this.runMode !== 'story') return;
    const duration = clamp(Number(clip.duration) || 2.75, 2.2, 5.2);
    const target = clip.target && Number.isFinite(clip.target.x) ? clip.target : null;
    let focusYaw = this.yaw;
    let focusPitch = this.pitch;
    if (target && this.player) {
      const dx = target.x - this.player.x;
      const dz = target.z - this.player.z;
      const horizontal = Math.max(.001, Math.hypot(dx, dz));
      focusYaw = Math.atan2(-dx, -dz);
      focusPitch = clamp(Math.atan2((Number(target.y) || 1.35) - this.getEyeY(), horizontal), -.62, .72);
    }
    const cutawayPose = target ? this.getStoryCinematicCameraPose(target, clip.cameraStyle === 'cctv') : null;
    this.storyCinematicState = {
      elapsed: 0,
      time: duration,
      duration,
      lastTickAt: now(),
      target,
      startYaw: this.yaw,
      startPitch: this.pitch,
      focusYaw,
      focusPitch,
      cutawayPose,
      cutawayActive:false,
      title: clip.title,
      copy: clip.copy,
      kind: clip.kind || 'info'
    };
    this.input.resetTransient();
    this.freezePlayerForStoryCinematic();
    this.mobile?.setGameplayActive(false);
    this.showCenterAlert(clip.title, clip.copy, clip.kind === 'danger' ? 'danger' : 'info', duration - .2);
    this.storyEventTime = Math.max(this.storyEventTime || 0, duration * .5);
    this.audio.storyStinger(clip.kind || 'info');
    if (UI.storyCinematicTitle) UI.storyCinematicTitle.textContent = clip.title || 'MISSION UPDATE';
    if (UI.storyCinematicCopy) UI.storyCinematicCopy.textContent = clip.copy || '';
    UI.storyCinematic?.classList.add('show');
    UI.storyCinematic?.classList.toggle('cctv-feed', !!cutawayPose);
    if (UI.storyCinematic) UI.storyCinematic.dataset.cameraLabel = cutawayPose?.label || 'R-07 헬멧 카메라';
    UI.storyCinematic?.setAttribute('aria-hidden', 'false');
    UI.storyCinematic?.style.setProperty('--cinematic-progress', '0%');
    document.body.classList.add('story-sequence-active');
  }

  finishStoryCinematicClip() {
    const state = this.storyCinematicState;
    if (state) {
      this.yaw = state.startYaw;
      this.pitch = state.startPitch;
    }
    this.storyCinematicState = null;
    this.input.resetTransient();
    const next = this.storyCinematicQueue.shift();
    if (next) {
      this.startStoryCinematicClip(next);
      return;
    }
    UI.storyCinematic?.classList.remove('show','cctv-feed','cctv-switch');
    UI.storyCinematic?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('story-sequence-active');
    if (this.viewWeapon) this.viewWeapon.visible = true;
    if (this.pauseAfterStoryCinematic || (!this.isTouchInputActive() && !this.input.locked)) {
      this.pauseAfterStoryCinematic = false;
      this.pause();
      return;
    }
    if (this.isTouchInputActive() && this.running && !this.paused && !this.gameOver) this.mobile?.setGameplayActive(true);
  }

  updateStoryCinematic(dt) {
    const state = this.storyCinematicState;
    if (!state) return;
    this.freezePlayerForStoryCinematic();
    // 메인 루프의 저 FPS 보호용 dt 상한과 분리한다. 저사양에서 3초 연출이
    // 수십 초로 늘어나지 않되, 백그라운드 탭 복귀 시 한 번에 건너뛰지도 않는다.
    const tick = now();
    const cinematicStep = clamp(tick - (state.lastTickAt || tick), 0, .25);
    state.lastTickAt = tick;
    state.elapsed += cinematicStep;
    state.time = Math.max(0, state.duration - state.elapsed);
    const progress = clamp(state.elapsed / state.duration, 0, 1);
    UI.storyCinematic?.style.setProperty('--cinematic-progress', `${Math.round(progress * 100)}%`);
    const smooth = value => value * value * (3 - 2 * value);
    let cameraT = 1;
    if (progress < .32) cameraT = smooth(progress / .32);
    else if (progress > .76) cameraT = 1 - smooth((progress - .76) / .24);
    if (state.cutawayPose) {
      // 원격 CCTV 컷은 벽을 통과하는 보간을 하지 않는다. 짧은 전환 프레임 뒤
      // 안전한 카메라 지점으로 즉시 전환하고, 종료 직전에 헬멧 시점으로 복귀한다.
      state.cutawayActive = progress >= .10 && progress <= .86;
      UI.storyCinematic?.classList.toggle('cctv-switch', progress < .15 || progress > .82);
    } else {
      state.cutawayActive = false;
      this.yaw = this.lerpAngle(state.startYaw, state.focusYaw, cameraT);
      this.pitch = state.startPitch + (state.focusPitch - state.startPitch) * cameraT;
    }
    if (state.time <= 0) {
      this.finishStoryCinematicClip();
    }
  }

  playStoryMotion(title,copy,target = null, kind = 'info') {
    const focus = target || this.getCurrentStoryTarget();
    const resolvedTarget = focus && Number.isFinite(focus.x) ? focus : null;
    const forceCctv = !!resolvedTarget?.forceCutaway || !!resolvedTarget?.door;
    const clip = { title: title || 'MISSION UPDATE', copy: copy || '', target: resolvedTarget, kind, cameraStyle: forceCctv ? 'cctv' : 'auto', duration: kind === 'danger' ? 3.2 : 2.9 };
    const previous = this.storyCinematicQueue[this.storyCinematicQueue.length - 1] || this.storyCinematicState;
    if (previous?.title === clip.title && previous?.copy === clip.copy) return;
    if (this.storyCinematicState) this.storyCinematicQueue.push(clip);
    else this.startStoryCinematicClip(clip);
  }

  getMissionForWave(w) {
    if (this.runMode === 'story' && this.storyChapter) {
      const mission = this.storyChapter.missions?.[Math.max(0, Number(w) - 1)];
      return mission ? { ...mission, story: true } : { type: 'normal', label: '잔존 개체 제거', hud: '잔존 개체를 제거하라', rationale:'다음 절차를 안전하게 실행할 작업 구역이 필요하다.', outcome:'구역이 확보됐다.', story: true };
    }
    // 서로 다른 배수 규칙이 겹쳐 일부 미션이 사라지던 구조를 없앴다.
    // 6웨이브마다 네 종류가 순서대로 순환해 다음 특수전도 예측할 수 있다.
    if (w >= 6 && w % 6 === 0) {
      const type = ['survive', 'rush', 'core', 'blackout'][(Math.floor(w / 6) - 1) % 4];
      if (type === 'survive') return { type, label: '제한 시간 버티기', short: 'SURVIVE', duration: clamp(38 + w * 1.8, 45, 70), desc: '제한 시간 동안 버티면 웨이브가 끝난다. 너무 오래 한 장소에 갇히지 마라.' };
      if (type === 'rush') return { type, label: '폭발 좀비 러시', short: 'RUSH', desc: '폭발 좀비 비율이 높아진다. 가까워지기 전에 먼저 끊어라.' };
      if (type === 'core') return { type, label: '감염 코어 파괴', short: 'CORE', desc: '맵에 생성된 감염 코어를 모두 부숴라. 적을 전부 잡지 않아도 코어만 부수면 클리어된다.' };
      return { type, label: '조명 불안정 웨이브', short: 'LIGHTS', desc: '조명이 불안정하다. 미니맵과 발소리를 같이 봐라.' };
    }
    return { type: 'normal', label: '전멸', short: 'CLEAR', desc: '몰려오는 적을 모두 처치해라.' };
  }

  startMissionForWave(plannedMission = null) {
    this.cleanupObjectiveCores(false);
    this.currentMission = plannedMission || this.getMissionForWave(this.wave);
    this.missionTimer = this.currentMission.duration || 0;
    this.missionCompletePending = false;

    this.activateStoryMissionObjects();
    if (['interact','generator','cargo','rescue','door','escort'].includes(this.currentMission.type)) {
      const floor = Number(this.currentMission.minSpawn) || 12;
      this.spawnQueue = Math.max(this.spawnQueue, floor);
      this.showCenterAlert(this.currentMission.label, this.currentMission.hud || '목표 지점과 상호작용하라.', 'info', 3.2);
    } else if (this.currentMission.type === 'survive') {
      const floor = Number(this.currentMission.minSpawn) || (this.runMode === 'story' ? 14 : 36 + Math.floor(this.wave * 2.2));
      this.spawnQueue = Math.max(this.spawnQueue, floor);
      this.showCenterAlert(this.currentMission.story ? this.currentMission.label : '미션 웨이브: 제한 시간 버티기', `${Math.ceil(this.missionTimer)}초 동안 살아남아라. 적을 전부 죽일 필요는 없다.`, 'danger', 3.2);
    } else if (this.currentMission.type === 'core') {
      const floor = Number(this.currentMission.minSpawn) || 18;
      this.spawnQueue = Math.max(floor, Math.round(this.spawnQueue * .72));
      const count = clamp(Number(this.currentMission.coreCount) || (2 + Math.floor(this.wave / 8)), 1, 5);
      this.spawnObjectiveCores(count);
      this.showCenterAlert(this.currentMission.story ? this.currentMission.label : '미션 웨이브: 감염 코어 파괴', `${count}개의 코어를 모두 부숴라. 코어를 부수면 바로 웨이브가 끝난다.`, 'danger', 3.4);
    } else if (this.currentMission.type === 'rush') {
      const floor = Number(this.currentMission.minSpawn) || (28 + Math.floor(this.wave * 2.4));
      this.spawnQueue = Math.max(this.spawnQueue, floor);
      this.showCenterAlert(this.currentMission.story ? this.currentMission.label : '특수 웨이브: 폭발 좀비 러시', this.currentMission.hud || '노란 폭발 좀비가 많이 섞인다. 거리 유지가 핵심이다.', 'danger', 3.0);
    } else if (this.currentMission.type === 'blackout') {
      const floor = Number(this.currentMission.minSpawn) || (26 + Math.floor(this.wave * 2.0));
      this.spawnQueue = Math.max(this.spawnQueue, floor);
      this.showCenterAlert(this.currentMission.story ? this.currentMission.label : '특수 웨이브: 조명 불안정', this.currentMission.hud || '형광등이 흔들린다. 소리와 미니맵으로 위치를 확인해라.', 'danger', 3.0);
    }
    if (this.currentMission.story && this.currentMission.type === 'normal') {
      this.showCenterAlert(this.currentMission.label, this.currentMission.hud || '작전을 계속하라.', 'info', 2.8);
    }
    if (this.currentMission.story) {
      const mission = this.currentMission;
      const extra = STORY_DIALOGUES[this.storyChapter?.id]?.mission?.[Math.max(0, this.wave - 1)];
      setTimeout(() => {
        if (!this.running || this.gameOver || this.currentMission !== mission) return;
        if (mission.transmission) this.queueDialogue(mission.transmission, { delay: 0 });
        if (extra && extra !== mission.transmission) this.queueDialogue(extra, { delay: .55 });
      }, 650);
    }
  }

  missionObjectiveText() {
    const m = this.currentMission;
    if (!m) return '';
    if (['interact','generator','door'].includes(m.type)) {
      const active = (this.storyObjects || []).filter(o => o.active && !o.done && (!m.target || o.role === m.target));
      return `${m.label}: ${active.length}개 남음 · 가까이서 E 길게`;
    }
    if (m.type === 'cargo') return `${m.label}: ${this.storySequence?.cargoAttached ? '운반 중 · 적재 지점으로 이동' : '화물에 접근해 E 길게'}`;
    if (m.type === 'rescue') { const sv=this.getStorySurvivor(); const hp=sv?` · HP ${Math.ceil(Math.max(0,sv.hp||0))}/${Math.ceil(sv.maxHp||160)}`:''; return `${m.label}: ${this.storySequence?.rescued ? '생존자를 출구까지 호위' : '생존자에게 접근해 E 길게'}${hp}`; }
    if (m.type === 'escort') return `${m.label}: ${Math.max(0, Math.ceil(this.missionTimer))}초 · 스캐너를 지켜라`;
    if (m.type === 'survive') return `${m.story ? m.label : '미션'}: ${Math.ceil(this.missionTimer)}초 버티기`;
    if (m.type === 'core') {
      const left = (this.objectiveCores || []).filter(c => c.alive).length;
      return `${m.story ? m.label : '미션'}: 감염 코어 ${left}개 남음`;
    }
    if (m.story) return m.hud || m.label || '';
    if (m.type === 'normal') return '';
    if (m.type === 'rush') return '특수: 폭발 좀비 러시';
    if (m.type === 'blackout') return '특수: 조명 불안정';
    return m.label || '';
  }

  updateMissionState(dt) {
    const m = this.currentMission;
    if (!m || this.rewardOpen || this.prepPhase || this.missionCompletePending) return false;
    if (m.type === 'escort') {
      this.missionTimer = Math.max(0, this.missionTimer - dt);
      if (this.missionTimer <= 0) { this.finishMissionWave('ESCORT COMPLETE'); return true; }
    } else if (['interact','generator','door'].includes(m.type)) {
      const relevant = (this.storyObjects || []).filter(o => o.active && (!m.target || o.role === m.target));
      if (relevant.length && relevant.every(o => o.done)) { this.finishMissionWave('OBJECTIVE COMPLETE'); return true; }
    } else if (m.type === 'cargo') {
      if (this.storySequence?.cargoDelivered) { this.finishMissionWave('CARGO SECURED'); return true; }
    } else if (m.type === 'rescue') {
      if (this.storySequence?.survivorExtracted) { this.finishMissionWave('SURVIVOR RESCUED'); return true; }
    } else if (m.type === 'survive') {
      this.missionTimer = Math.max(0, this.missionTimer - dt);
      // keep pressure during survival without creating infinite buildup.
      const alive = this.enemies.filter(e => e.alive).length;
      const threshold = Number(m.refillThreshold) || 8;
      const maxActive = Number(m.maxActive) || 34;
      const refill = Number(m.refillAmount) || 4;
      if (this.spawnQueue < threshold && alive < maxActive && this.missionTimer > 4) this.spawnQueue += refill;
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
    const missionResult = this.currentMission?.outcome || '현재 절차가 완료되어 다음 작전 단계가 가능해졌다.';
    this.showCenterAlert(title, missionResult, 'info', 2.8);
    if (this.runMode === 'story') this.playStoryMotion('작전 결과', missionResult, null, 'info');
    const line = STORY_DIALOGUES[this.storyChapter?.id]?.complete?.[Math.max(0, Math.min((this.storyChapter?.waves || 1) - 1, this.wave - 1))];
    if (this.runMode === 'story' && line) this.queueDialogue(line, { delay: .3 });
    this.audio.storyStinger('info');
    this.completeWave();
  }

  findCoreSpawnPoint(radius = 1.2) {
    const half = this.map.size / 2 - 4;
    for (let i = 0; i < 180; i++) {
      const x = rand(-half, half), z = rand(-half, half);
      if (this.rectCollides(x, z, radius * 2, radius * 2, .35)) continue;
      if (dist2(x, z, this.player.x, this.player.z) < 12 * 12) continue;
      // 스토리 목표 코어는 플레이어가 실제로 도달할 수 있는 연결 구역에만 생성한다.
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
      const hp = 180 + this.wave * 20;
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
    this.audio.explosion();
    this.showToast('감염 코어 파괴');
  }

  nextWave() {
    this.rewardOpen = false;
    this.prepPhase = false;
    this.prepTimer = 0;
    this.wave++;
    const plannedMission = this.getMissionForWave(this.wave);
    const storyFinal = this.runMode === 'story' && this.storyChapter && this.wave === this.storyChapter.waves;
    this.storyBossPending = !!(storyFinal && plannedMission?.boss && this.storyChapter?.boss);
    this.elitePending = this.storyBossPending || (this.runMode !== 'story' && this.wave >= 5 && this.wave % 5 === 0);
    // v17 밸런스: 초반은 학습 가능하게 천천히, 후반은 너무 폭발하지 않게 완만하게 증가.
    const mapThreat = this.map?.threatScale || 1;
    const missionScale = clamp(Number(plannedMission?.spawnScale) || 1, .45, 1.35);
    const base = Math.round((9 + this.wave * 3.65 + Math.sqrt(this.wave) * 2.2) * this.diff.spawn * mapThreat * missionScale);
    this.spawnQueue = clamp(base, 8, 88);
    this.spawnTimer = 0;
    this.waveBreak = 0;
    this.unlockWeapons();
    this.startMissionForWave(plannedMission);
    this.showToast(this.runMode === 'story'
      ? `Chapter ${this.storyChapter.id} · ${this.wave}/${this.storyChapter.waves} · ${this.currentMission.label}`
      : (this.currentMission && this.currentMission.type !== 'normal' ? `Wave ${this.wave} · ${this.currentMission.label}` : `Wave ${this.wave}`));
    if (this.runMode !== 'story') this.showWaveTip();
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
      { wave: 3, title: '러너 등장', body: '빠른 적이 섞인다. 뒤로만 걷지 말고 옆으로 빠지며 쏴라.' },
      { wave: 4, title: '탱커 좀비 등장', body: '체력이 높다. 샷건·수류탄·헤드샷으로 처리하는 게 좋다.' },
      { wave: 7, title: '폭발 좀비 등장', body: '가까이 오면 터진다. 노란 적은 멀리서 먼저 제거해라.', tone: 'danger' },
      { wave: 10, title: '실드 좀비 등장', body: '정면 몸통 사격은 약하게 들어간다. 머리나 측면을 노려라.' },
      { wave: 15, title: '고밀도 웨이브', body: '설치 벽과 지뢰로 길목을 만들고, 균열술사는 우선 처치해라.', tone: 'danger' }
    ];
    const tip = tips.find(t => this.wave === t.wave && !this.waveTipShown.has(t.wave));
    if (!tip) return;
    this.waveTipShown.add(tip.wave);
    this.showCenterAlert(tip.title, tip.body, tip.tone || 'info', 3.0);
  }

  combatTierWave() {
    return this.runMode === 'story' && this.storyChapter
      ? Math.max(1, (this.storyChapter.id - 1) * 3 + this.wave)
      : this.wave;
  }

  pickEnemyTypeForWave() {
    if (this.storyBossPending) {
      this.storyBossPending = false;
      return this.storyChapter?.boss || 'devil';
    }
    // v17 웨이브 밸런스: 새 적은 첫 등장 때 소량, 이후 조금씩만 증가한다.
    // 일반 좀비는 끝까지 베이스 물량으로 남겨 Boxhead식 압박을 유지한다.
    const w = this.combatTierWave();
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

  enemyStats(type) {
    const scale = 1 + this.combatTierWave() * .075;
    if (type === 'runner') return { hp: 20 * scale * this.diff.enemyHp, speed: 4.1 * this.diff.enemySpeed, damage: 13 * this.diff.enemyDamage, score: 18, radius: .46 };
    if (type === 'devil') return { hp: 72 * scale * this.diff.enemyHp, speed: 1.85 * this.diff.enemySpeed, damage: 18 * this.diff.enemyDamage, score: 55, radius: .72 };
    if (type === 'tank') return { hp: 128 * scale * this.diff.enemyHp, speed: 1.45 * this.diff.enemySpeed, damage: 18 * this.diff.enemyDamage, score: 42, radius: .74, wallPower: 1.85 };
    if (type === 'bomber') return { hp: 28 * scale * this.diff.enemyHp, speed: 3.25 * this.diff.enemySpeed, damage: 16 * this.diff.enemyDamage, score: 30, radius: .50, blastRadius: 4.3, blastDamage: 88 * this.diff.enemyDamage };
    if (type === 'shield') return { hp: 62 * scale * this.diff.enemyHp, speed: 2.05 * this.diff.enemySpeed, damage: 14 * this.diff.enemyDamage, score: 34, radius: .58, shielded: true };
    return { hp: 31 * scale * this.diff.enemyHp, speed: 2.45 * this.diff.enemySpeed, damage: 10 * this.diff.enemyDamage, score: 10, radius: .48 };
  }

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
      this.updateDialogue(dt);
      if (updateHudNow) this.updateHud();
      if (updateMinimapNow) this.minimap.draw(this);
      return;
    }
    if (this.isStoryControlLocked()) {
      // 연출 중에는 플레이어·적·투사체·스폰을 모두 정지시킨다. 스토리 오브젝트와
      // 카메라·조명·자막만 갱신해, 연출을 보는 동안 피격되거나 입력이 새는 일을 막는다.
      this.freezePlayerForStoryCinematic();
      this.updateStorySystems(dt);
      this.updateDialogue(dt);
      this.updateFx(dt);
      this.updateHorrorLighting(dt);
      this.updateAdaptiveMusic(dt);
      this.updateCamera(dt);
      this.updateStoryTargetMarker();
      if (updateHudNow) this.updateHud();
      if (updateMinimapNow) this.minimap.draw(this);
      return;
    }
    this.updateReload(dt);
    this.mobile?.update(dt);
    this.handleInput(dt);
    this.updateStorySystems(dt);
    this.updateDialogue(dt);
    this.updateWallPreview();
    this.updatePlayerVertical(dt);
    const serverEnemyAuthority = this.usesServerEnemyAuthority();
    if (serverEnemyAuthority) {
      this.updateServerEnemies(dt);
    } else {
      this.updateSpawning(dt);
      this.updateEnemies(dt);
    }
    if (!serverEnemyAuthority && this.runMode !== 'story') this.updateRandomItemBoxes(dt);
    this.updateProjectiles(dt);
    this.updateObjectiveCores(dt);
    this.updatePickups(dt);
    this.updatePlaceables(dt);
    this.updateFx(dt);
    this.updateHorrorLighting(dt);
    this.updateAdaptiveMusic(dt);
    this.updateCamera(dt);
    this.updateStoryTargetMarker();
    this.updateRemotePlayers(dt);
    if (updateHudNow) this.updateHud();
    if (updateMinimapNow) this.minimap.draw(this);
    this.net.sendInput();
    if (this.hp <= 0 && !(this.lobby?.mode === 'coop' && this.downed)) this.endGame();
  }

  updateHorrorLighting(dt) {
    if (!this.flickerLights || !this.flickerLights.length) return;
    if (!this.accessibility?.flicker) {
      for (const f of this.flickerLights) f.light.intensity = f.base;
      return;
    }
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
    const previewKey = this.menuMode === 'story' ? this.getStoryChapter(this.storyChapterId)?.map : (SURVIVAL_MAP_KEYS.includes(UI.map?.value) ? UI.map.value : this.survivalMapKey);
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
    if (this.updateStoryInteractionInput(dt)) return true;
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
    this.audio.beep(520, .05, 'triangle', .020);
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
    this.audio.shoot(weaponId);
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
    if (!this.prepPhase && this.currentMission && this.updateMissionState(dt)) return;
    if (this.spawnQueue > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.enemies.filter(e => e.alive).length < (this.quality?.maxEnemies || 72)) {
        if (this.spawnEnemy()) this.spawnQueue--;
        const intervalScale = this.map?.spawnIntervalScale || 1;
        this.spawnTimer = clamp((.72 - this.wave * .018) * intervalScale, .14, .7);
      }
    } else if (this.prepPhase) {
      this.prepTimer -= dt;
      if (this.prepTimer <= 0) this.nextWave();
    } else if (!['survive','core','interact','generator','cargo','rescue','door','escort'].includes(this.currentMission?.type) && this.enemies.every(e => !e.alive)) {
      this.waveBreak += dt;
      if (this.waveBreak > 1.35) this.completeWave();
    }
  }

  updateEnemies(dt) {
    const aiClock = now();
    const storySurvivor = this.getActiveStorySurvivor();
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
      const survivorDxStart = storySurvivor ? storySurvivor.x - e.x : 0;
      const survivorDzStart = storySurvivor ? storySurvivor.z - e.z : 0;
      const survivorDistanceStart = storySurvivor ? Math.hypot(survivorDxStart, survivorDzStart) || .001 : Infinity;
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
        // 구조 중인 오세현이 가까우면 일부 적은 플레이어 대신 오세현에게 붙는다.
        // 대상 바로 앞의 정지 지점까지만 계산해 NPC 자체 충돌체를 경로 장애물로 오인하지 않는다.
        const aggroSurvivor = !playerWallBlocker && storySurvivor && e.type !== 'devil' && survivorDistanceStart < 10.5
          && (survivorDistanceStart + .8 < d || (Number(e.id) || 0) % 3 === 0);
        if (aggroSurvivor) {
          const stop = e.radius + .56 + .20;
          const sx = storySurvivor.x - survivorDxStart / survivorDistanceStart * stop;
          const sz = storySurvivor.z - survivorDzStart / survivorDistanceStart * stop;
          if (this.lineClear2D(e.x, e.z, sx, sz, routeRadius)) target = { x: sx, z: sz };
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
      const survivorDistance = storySurvivor ? Math.hypot(storySurvivor.x - e.x, storySurvivor.z - e.z) : Infinity;
      const survivorAttackRange = e.radius + .56 + (e.type === 'runner' ? .82 : (e.type === 'tank' ? .94 : .76));
      const hitSurvivor = !!storySurvivor && survivorDistance < survivorAttackRange && survivorDistance <= d + .65;
      if (!playerWallBlocker && e.type === 'bomber' && e.meleeCd <= 0 && (d < e.radius + this.player.radius + 1.05 || hitSurvivor)) {
        this.detonateEnemy(e, 'self');
        continue;
      }
      if (!playerWallBlocker && hitSurvivor && e.meleeCd <= 0 && e.type !== 'devil') {
        e.meleeCd = e.type === 'runner' ? .78 : (e.type === 'tank' ? 1.18 : .98);
        e.attackAnim = e.type === 'tank' ? .50 : .42;
        e.attackMax = e.attackAnim;
        e.stun = Math.max(e.stun || 0, .08);
        e.mesh.rotation.y = Math.atan2(storySurvivor.x - e.x, storySurvivor.z - e.z);
        this.damageStorySurvivor(e.damage * (e.type === 'runner' ? .34 : (e.type === 'tank' ? .56 : .42)), e, 'melee');
        this.audio.enemyAttack(e.type);
      } else if (!playerWallBlocker && d < zombieAttackRange && e.meleeCd <= 0 && e.type !== 'devil') {
        // 일정 거리 안으로 들어오면 닿기만 하는 게 아니라 팔을 뻗어 때린다.
        e.meleeCd = e.type === 'runner' ? .72 : (e.type === 'tank' ? 1.12 : .92);
        e.attackAnim = e.type === 'tank' ? .50 : .42;
        e.attackMax = e.attackAnim;
        e.stun = Math.max(e.stun || 0, .08);
        this.damagePlayer(e.damage * (e.type === 'runner' ? .46 : (e.type === 'tank' ? .72 : .60)), e, 'melee');
        this.audio.enemyAttack(e.type);
      } else if (!playerWallBlocker && e.meleeCd <= 0 && e.type === 'devil' && (hitSurvivor || d < devilClawRange)) {
        e.meleeCd = 1.15;
        e.attackAnim = .40;
        e.attackMax = .40;
        if (hitSurvivor) this.damageStorySurvivor(e.damage * .38, e, 'melee');
        else this.damagePlayer(e.damage * .48, e, 'melee');
        this.audio.enemyAttack(e.type);
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
        if (!this.quality?.simpleModels && e.stepCd <= 0 && d < 24) {
          this.audio.enemyStep(e.type);
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
    this.audio.enemyAttack(e.type);
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
      if (!o.alive || o.dynamicStory) continue;
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
      this.audio.devilCast();
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
        const sv = this.getActiveStorySurvivor();
        if (sv && dist2(x, z, sv.x, sv.z) < 1.0) {
          p.x = x; p.z = z;
          this.damageStorySurvivor(p.damage * .62, p, 'fireball');
          this.detonateProjectile(p);
          return { kind: 'survivor', x, z };
        }
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
    if (p.kind === 'fireball') { this.audio.fireballExplode(); this.explode(p.x, p.z, 2.5, 0, false, COLORS.casterExplosion); }
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

  explode(x, z, radius, damage, hurtsEnemies = true, fxColor = 0xff7744) {
    if (!this.quality?.simpleModels) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, .05, 18), new THREE.MeshBasicMaterial({ color: fxColor, transparent: true, opacity: .5 }));
      ring.position.set(x, .07, z); this.scene.add(ring);
      this.fx.push({ mesh: ring, life: .28, max: .28, scaleOut: true });
    }
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
    const sv = this.getActiveStorySurvivor();
    if (sv && damage > 0) {
      const sd = Math.sqrt(dist2(x, z, sv.x, sv.z));
      if (sd <= radius * .88) this.damageStorySurvivor(damage * .24 * Math.max(.12, 1 - sd / radius), { x, z }, 'explosion');
    }
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

    const targetFov = this.storyCinematicState?.cutawayActive ? 58 : (this.baseFov + (this.adsFov - this.baseFov) * this.ads);
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

    const cinematicCutaway = this.storyCinematicState?.cutawayActive && this.storyCinematicState?.cutawayPose;
    if (cinematicCutaway) {
      this.camera.position.copy(cinematicCutaway.position);
      this.camera.quaternion.copy(cinematicCutaway.quaternion);
    }
    if (this.viewWeapon) this.viewWeapon.visible = !cinematicCutaway;

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
    UI.waveText.textContent = this.runMode === 'story' && this.storyChapter
      ? (this.prepPhase ? `CH ${this.storyChapter.id} · Prep ${Math.ceil(this.prepTimer)}s` : `CH ${this.storyChapter.id} · ${this.wave}/${this.storyChapter.waves}`)
      : (this.prepPhase ? `Prep ${Math.ceil(this.prepTimer)}s` : `Wave ${this.wave}`);
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
    this.score += Math.round(120 + this.wave * 35);
    if (this.runMode === 'story' && this.storyChapter && this.wave >= this.storyChapter.waves) {
      this.completeStoryChapter();
      return;
    }
    this.dropSupply(true);
    this.showRewardChoices();
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
    if (rewardId === 'railOvercharge' && !this.unlocked?.has('rail')) return false;
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
    if (UI.rewardTitle) UI.rewardTitle.textContent = this.runMode === 'story'
      ? `Chapter ${this.storyChapter?.id || 1} · 단계 ${this.wave} 완료`
      : `Wave ${this.wave} Clear`;
    if (UI.rewardSubtitle) UI.rewardSubtitle.textContent = this.runMode === 'story'
      ? '업그레이드를 하나 선택하면 다음 작전 단계 준비가 시작됩니다.'
      : '업그레이드를 선택한 뒤 적용하세요. Wave 10부터 10웨이브마다 안전하게 탈출해 기록을 확정할 수 있습니다.';
    const canExtract = this.rankedRun && this.wave >= 10 && this.wave % 10 === 0;
    if (UI.rewardExtract) UI.rewardExtract.hidden = !canExtract;
    UI.reward?.classList.toggle('can-extract', canExtract);
    this.renderRewardChoices(pool);
    UI.reward?.classList.add('show');
    this.audio.beep(660, .10, 'triangle', .035);
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
      if (reward?.id) this.net?.sendAction?.('chooseReward', 'pistol', { rewardId: reward.id });
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
    this.startPrepPhase(this.runMode === 'story' ? 8 : 10);
    if (this.isTouchInputActive()) this.mobile?.setGameplayActive(true);
    else this.input.requestLock();
  }

  startPrepPhase(seconds = 10) {
    this.prepPhase = true;
    this.prepTimer = seconds;
    this.spawnQueue = 0;
    this.spawnTimer = 0;
    this.showCenterAlert('정비 시간', this.runMode === 'story'
      ? `${Math.ceil(seconds)}초 후 다음 작전 단계가 시작된다. 탄약과 방어선을 정비하라.`
      : `${Math.ceil(seconds)}초 동안 아이템을 줍고 벽·지뢰를 준비해라.`, 'info', 2.4);
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
    const keys = ['bhfps_settings_v37','bhfps_input_settings_v44','bhfps_mobile_controls_v45','bhfps_best_stats_v24','bhfps_career_v47','bhfps_story_v52','bhfps_menu_mode_v52','bhfps_story_v51','bhfps_menu_mode_v51','bhfps_story_v50','bhfps_menu_mode_v50'];
    const data = {};
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    }
    const payload = { format: 'boxhead-save', version: 52, createdAt: new Date().toISOString(), data };
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
      const allowed = new Set(['bhfps_settings_v37','bhfps_input_settings_v44','bhfps_mobile_controls_v45','bhfps_best_stats_v24','bhfps_career_v47','bhfps_story_v52','bhfps_menu_mode_v52','bhfps_story_v51','bhfps_menu_mode_v51','bhfps_story_v50','bhfps_menu_mode_v50']);
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

  completeRun(outcome = 'extracted') {
    if (!this.running || this.runEnded) return;
    if (outcome === 'extracted' && !(this.rankedRun && this.wave >= 10 && this.wave % 10 === 0)) return;
    this.rewardOpen = false;
    this.resetRewardSelection();
    UI.reward?.classList.remove('show');
    this.endGame(outcome);
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
    if (this.rankedRun) {
      this.bestStats = { ...(this.bestStats || {}), [key]: best };
      try { localStorage.setItem('bhfps_best_stats_v24', JSON.stringify(this.bestStats)); } catch (_) {}
    }
    return { current, best };
  }

  runRank() {
    if (this.runMode === 'story') return `Chapter ${this.storyChapter?.id || 1} · 작전 실패`;
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
    this.gameOver = true;
    this.running = false;
    this.mobile?.setGameplayActive(false);
    document.getElementById('story-survivor-health')?.classList.remove('show', 'hurt');
    document.exitPointerLock?.();
    UI.hud.classList.add('hidden');
    UI.over.classList.add('show');
    const overTitle = UI.over?.querySelector('h2');
    const overEyebrow = UI.over?.querySelector('.eyebrow');
    if (overTitle) overTitle.textContent = this.runMode === 'story' ? (outcome === 'survivor-lost' ? '구조 대상 사망' : '작전 실패') : (outcome === 'extracted' ? '런 탈출 성공' : '게임 오버');
    if (overEyebrow) overEyebrow.textContent = this.runMode === 'story' ? 'MISSION FAILED' : (outcome === 'extracted' ? 'RUN EXTRACTED' : 'RUN ENDED');
    const survived = this.runStartTime ? Math.max(0, now() - this.runStartTime) : 0;
    const min = Math.floor(survived / 60), sec = Math.floor(survived % 60);
    UI.finalStats.innerHTML = `
      <div><b>${this.runRank()}</b><span>${this.runMode === 'story' ? '현재 작전' : '런 랭크'}</span></div>
      <div><b>${this.wave}${this.runMode === 'story' ? `/${this.storyChapter?.waves || this.wave}` : ''}</b><span>${this.runMode === 'story' ? '완료한 작전 단계' : `도달 웨이브${this.rankedRun ? ` / 최고 ${record.best.wave}` : ' / 기록 제외'}`}</span></div>
      <div><b>${this.score.toLocaleString('ko-KR')}</b><span>점수${this.rankedRun ? ` / 최고 ${record.best.score.toLocaleString('ko-KR')}` : ' / 기록 제외'}</span></div>
      <div><b>${this.kills}</b><span>처치${this.rankedRun ? ` / 최고 ${record.best.kills}` : ' / 기록 제외'}</span></div>
      <div><b>${this.headshots || 0}</b><span>헤드샷${this.rankedRun ? ` / 최고 ${record.best.headshots || 0}` : ' / 기록 제외'}</span></div>
      <div><b>${min}:${String(sec).padStart(2,'0')}</b><span>생존 시간</span></div>
      <div><b>${this.rewardsTaken || 0}</b><span>선택한 보상</span></div>
      <div><b>${this.map.label}</b><span>맵</span></div>
      <div><b>${UI.diff.value.toUpperCase()}</b><span>난이도</span></div>
    `;
  }
}

window.__game = new Game();
console.info('[Boxhead FPS] game module loaded');
