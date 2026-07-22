import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'client/index.html'), 'utf8');
const gamePath = path.join(root, 'client/game.js');
const runtimePath = path.join(root, 'tests/.runtime-game-v59.generated.mjs');
const dom = new JSDOM(html, { url: 'http://boxhead.test/', pretendToBeVisual: true, runScripts: 'outside-only' });
const { window } = dom;
const noop = () => {};
const gradient = { addColorStop: noop };
const ctx = new Proxy({ createRadialGradient: () => gradient, measureText: () => ({ width: 10 }) }, {
  get(target, key) { return key in target ? target[key] : noop; },
  set(target, key, value) { target[key] = value; return true; }
});
window.HTMLCanvasElement.prototype.getContext = function(type) { return type === '2d' ? ctx : null; };
window.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({ width: 360, height: 220, left: 0, top: 0, right: 360, bottom: 220 });
window.matchMedia = () => ({ matches: false, addEventListener: noop, removeEventListener: noop });
window.requestAnimationFrame = () => 0;
window.cancelAnimationFrame = noop;
window.devicePixelRatio = 1;
Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
Object.defineProperty(window, 'innerHeight', { value: 720, configurable: true });
Object.defineProperty(window.document, 'pointerLockElement', { value: null, writable: true, configurable: true });
window.document.exitPointerLock = function() { this.pointerLockElement = null; };
window.document.exitFullscreen = async () => {};
window.HTMLCanvasElement.prototype.requestPointerLock = function() { window.document.pointerLockElement = this; };
Object.defineProperty(window, 'screen', { value: { orientation: { lock: async () => {}, unlock: noop } }, configurable: true });
window.ResizeObserver = class { observe() {} disconnect() {} };
window.BroadcastChannel = undefined;
for (const [key, value] of Object.entries({
  window, document: window.document, navigator: window.navigator, localStorage: window.localStorage,
  HTMLElement: window.HTMLElement, HTMLCanvasElement: window.HTMLCanvasElement,
  requestAnimationFrame: window.requestAnimationFrame, cancelAnimationFrame: window.cancelAnimationFrame, screen: window.screen
})) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });

let source = fs.readFileSync(gamePath, 'utf8');
source = source.replace("import * as THREE from 'three';\n", `import * as THREE_REAL from 'three';
class FakeRenderer {
  constructor({ canvas } = {}) { this.domElement = canvas; this.shadowMap = { enabled: false, type: null }; this.sortObjects = true; this.outputColorSpace = null; }
  setPixelRatio() {} setSize() {} render() {}
}
const THREE = { ...THREE_REAL, WebGLRenderer: FakeRenderer };
`);
source = source.replace('    requestAnimationFrame(this.loop);\n    this.finishBootLoading();', '    // disabled in node runtime regression test');
fs.writeFileSync(runtimePath, source);

try {
  await import(`${pathToFileURL(runtimePath).href}?run=${Date.now()}`);
  const game = window.__game;
  assert.ok(game, 'game instance missing');
  window.document.querySelector('#start-screen').classList.add('show');

  window.document.querySelector('#map-select').value = 'castle';
  game.rememberSurvivalMapKey('castle');
  game.setMenuMode('story');
  game.selectStoryChapter(1);
  assert.equal(window.document.querySelector('#map-select').value, 'castle', 'story selection overwrote the survival map select');

  game.startStoryChapter(1);
  assert.equal(game.runMode, 'story');
  assert.equal(game.mapKey, 'relay_hub');
  assert.ok(game.obstacles.some(o => o.kind === 'storyInteractive'), 'interactive colliders missing');
  assert.ok(game.obstacles.some(o => ['storyDecor', 'storyGlass', 'storyDecorDoor'].includes(o.kind)), 'decor colliders missing');
  assert.equal(game.collides(game.player.x, game.player.z, game.player.radius), false, 'player starts inside decor after clearance repair');

  // Chapter 1 progression gate: the survivor wing must be unreachable until the relay raises the shutter.
  const quarantineDoor = game.storyObjects.find(o => o.role === 'blastDoor' && o.door);
  const gatedSurvivor = game.storyObjects.find(o => o.role === 'survivor');
  assert.ok(quarantineDoor?.obstacle?.alive, 'chapter 1 quarantine shutter missing');
  assert.equal(game.canReachStoryPoint(gatedSurvivor.x, gatedSurvivor.z, .72), false, 'survivor wing can be bypassed before relay activation');
  game.currentMission = { type:'interact', target:'relay', label:'relay gate test', hud:'open shutter', rationale:'test', outcome:'test', hold:.1 };
  game.storySequence = { cargoAttached:false, cargoDelivered:false, rescued:false, survivorExtracted:false };
  const relay = game.storyObjects.find(o => o.role === 'relay');
  relay.active = true; relay.done = false;
  game.completeStoryInteraction(relay);
  assert.equal(quarantineDoor.done, true, 'relay did not authorize the quarantine shutter');
  for (let i = 0; i < 150; i++) game.updateStorySystems(.04);
  assert.equal(quarantineDoor.obstacle.alive, false, 'quarantine shutter collision did not clear after opening');
  assert.equal(game.canReachStoryPoint(gatedSurvivor.x, gatedSurvivor.z, .72), true, 'survivor wing did not become reachable after shutter opening');
  assert.ok(game.storyCinematicState?.cutawayPose || game.storyCinematicQueue.some(c => c.target?.door), 'shutter opening did not create a CCTV reveal');
  game.storyCinematicState = null; game.storyCinematicQueue = []; window.document.body.classList.remove('story-sequence-active');
  window.document.querySelector('#story-cinematic').classList.remove('show','cctv-feed','cctv-switch');

  // Off-screen mission marker: a target on the camera's left must stay on the left edge even after looking farther away.
  const originalTargetResolver = game.getCurrentStoryTarget.bind(game);
  const markerTarget = { x: game.player.x - 12, z: game.player.z, role: 'relay', label: '방향 테스트 목표' };
  game.getCurrentStoryTarget = () => markerTarget;
  game.yaw = 0; game.pitch = 0; game.updateCamera(0); game.updateStoryTargetMarker();
  const targetMarker = window.document.querySelector('#story-target-marker');
  const targetDirection = window.document.querySelector('#story-target-direction');
  assert.equal(targetMarker.classList.contains('turn-left'), true, 'left-side target was shown on the wrong screen edge');
  assert.match(targetDirection.textContent, /왼쪽으로 회전/, 'left turn instruction missing');
  game.yaw = -Math.PI; game.updateCamera(0); game.updateStoryTargetMarker();
  assert.equal(targetMarker.classList.contains('turn-left'), true, 'off-screen marker flipped sides while the target stayed hidden');
  game.yaw = Math.PI / 2; game.updateCamera(0); game.updateStoryTargetMarker();
  assert.equal(targetMarker.classList.contains('onscreen'), true, 'marker did not return to the object when facing the target');
  game.getCurrentStoryTarget = originalTargetResolver;
  game.storyTargetOffscreenSide = null; game.storyTargetKey = '';

  const survivor = game.getStorySurvivor();
  assert.ok(survivor?.collider?.dynamicStory, 'survivor dynamic collider missing');
  game.currentMission = { type: 'rescue', target: 'survivor', label: 'test rescue' };
  game.storySequence = { rescued: true, survivorExtracted: false, survivorDead: false };
  survivor.done = true; survivor.active = false; survivor.hp = survivor.maxHp = 160;
  const previousAlive = survivor.collider.alive;
  survivor.collider.alive = false;
  let pair = null;
  for (let z = -30; z <= 30 && !pair; z += 4) {
    for (let x = -24; x <= 24 && !pair; x += 4) {
      if (game.collides(x, z, .62) || game.collides(x + 3.5, z, .62)) continue;
      if (!game.lineClear2D(x, z, x + 3.5, z, .56)) continue;
      pair = [{ x, z }, { x: x + 3.5, z }];
    }
  }
  survivor.collider.alive = previousAlive;
  assert.ok(pair, 'could not find a clear survivor follow test lane');
  game.player.x = pair[0].x; game.player.z = pair[0].z;
  survivor.x = pair[1].x; survivor.z = pair[1].z; game.moveStoryObjectTo(survivor, survivor.x, survivor.z);
  game.rebuildCollisionIndex();
  game.collisionIndexDirty = false;
  const beforeFollow = Math.hypot(game.player.x - survivor.x, game.player.z - survivor.z);
  game.stepStoryMover(survivor, game.player.x, game.player.z, 2.45, .20, .56, 1.0);
  const afterFollow = Math.hypot(game.player.x - survivor.x, game.player.z - survivor.z);
  assert.ok(afterFollow < beforeFollow, 'survivor failed to move because of its own collider');
  assert.equal(game.collisionIndexDirty, false, 'dynamic survivor movement rebuilt the static collision index');
  game.updateCamera(0);
  game.updateStorySurvivorHealthHud(0, true);
  assert.equal(window.document.querySelector('#story-survivor-health').classList.contains('show'), true, 'survivor health bar not shown');
  const hpBefore = survivor.hp;
  game.damageStorySurvivor(12, { x: survivor.x + 1, z: survivor.z }, 'melee');
  assert.ok(survivor.hp < hpBefore, 'survivor did not receive zombie damage');

  const decor = game.obstacles.find(o => ['storyDecor', 'storyGlass', 'storyDecorDoor'].includes(o.kind));
  const radius = game.player.radius;
  game.player.x = decor.x - decor.w / 2 - radius - .04;
  game.player.z = decor.z;
  const boundary = decor.x - decor.w / 2 - radius;
  game.moveEntity(game.player, 1.2, 0, radius);
  assert.ok(game.player.x <= boundary + .08, 'player passed through a story decor collider');

  // Chapter 2 cargo: attaching the cargo must not leave its collider overlapping the player.
  game.returnToMainMenu();
  game.setMenuMode('story');
  game.storyProgress.unlocked = Math.max(2, game.storyProgress.unlocked || 1);
  game.startStoryChapter(2);
  const cargo = game.storyObjects.find(o => o.role === 'cargo');
  assert.ok(cargo?.collider?.dynamicStory, 'cargo dynamic collider missing');
  game.currentMission = { type: 'cargo', target: 'cargo', label: 'cargo runtime test', hud: 'move cargo' };
  game.storySequence = { cargoAttached: false, cargoDelivered: false, rescued: false, survivorExtracted: false };
  cargo.active = true; cargo.done = false;
  game.completeStoryInteraction(cargo);
  game.storyCinematicState = null;
  game.storyCinematicQueue = [];
  window.document.body.classList.remove('story-sequence-active');
  window.document.querySelector('#story-cinematic').classList.remove('show');
  assert.equal(game.storySequence.cargoAttached, true, 'cargo interaction did not attach cargo');
  assert.equal(cargo.collider.alive, false, 'carried cargo collider remained active and can trap the player');

  let cargoLane = null;
  for (let z = -32; z <= 32 && !cargoLane; z += 4) {
    for (let x = -36; x <= 34 && !cargoLane; x += 4) {
      if (game.collides(x, z, game.player.radius) || game.collides(x + 2.4, z, game.player.radius)) continue;
      cargoLane = { x, z };
    }
  }
  assert.ok(cargoLane, 'could not find an open lane for cargo movement test');
  game.player.x = cargoLane.x; game.player.z = cargoLane.z; game.yaw = -Math.PI / 2;
  game.updateStorySystems(.016);
  const cargoMoveBefore = game.player.x;
  game.moveEntity(game.player, 1.2, 0, game.player.radius);
  assert.ok(game.player.x > cargoMoveBefore + .2, 'player remained blocked after attaching cargo');
  game.updateStorySystems(.016);
  assert.equal(cargo.collider.alive, false, 'cargo collider re-enabled during carry');

  const cargoDestination = cargo.destination;
  game.player.x = cargoDestination.x;
  game.player.z = cargoDestination.z + 1.8;
  game.updateStorySystems(.016);
  assert.equal(game.storySequence.cargoDelivered, true, 'cargo did not deliver when the player reached the platform');
  assert.equal(cargo.collider.alive, false, 'cargo collider re-enabled while player was still inside the delivery platform');
  game.storyCinematicState = null;
  game.player.x = -34; game.player.z = 0;
  game.updateStorySystems(.016);
  assert.equal(cargo.collider.alive, true, 'delivered cargo collision was not restored after the player moved clear');

  game.playStoryMotion('TEST', 'LEAVING DURING CINEMATIC', { x: game.player.x + 4, y: 1.4, z: game.player.z + 4 }, 'danger');
  assert.equal(window.document.body.classList.contains('story-sequence-active'), true);
  game.returnToMainMenu();
  assert.equal(game.running, false);
  assert.equal(game.paused, false);
  assert.equal(game.storyCinematicState, null);
  assert.equal(window.document.body.classList.contains('story-sequence-active'), false);
  assert.equal(window.document.querySelector('#story-cinematic').classList.contains('show'), false);
  assert.equal(window.document.querySelector('#start-screen').classList.contains('show'), true);

  game.setMenuMode('survival');
  assert.equal(window.document.querySelector('#map-select').value, 'castle');
  game.runMode = 'survival';
  game.startFromMenu();
  assert.equal(game.running, true);
  assert.equal(game.paused, false);
  assert.equal(game.runMode, 'survival');
  assert.equal(game.mapKey, 'castle');
  assert.ok(game.map, 'survival map became undefined');
  assert.equal(game.storyCinematicState, null);

  game.returnToMainMenu();
  game.setMenuMode('story');
  game.startStoryChapter(1);
  assert.equal(game.running, true);
  assert.equal(game.runMode, 'story');
  assert.equal(game.mapKey, 'relay_hub');

  await new Promise(resolve => setTimeout(resolve, 320));
  console.log('v59 runtime mode transition, gate, CCTV, survivor, cargo, marker and collision tests: passed');
} finally {
  try { fs.unlinkSync(runtimePath); } catch (_) {}
  dom.window.close();
}
