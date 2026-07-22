import assert from 'node:assert/strict';
import fs from 'node:fs';

const patch = fs.readFileSync(new URL('../client/v60.patch.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../client/index.html', import.meta.url), 'utf8');
const sw = fs.readFileSync(new URL('../client/sw.js', import.meta.url), 'utf8');
const version = JSON.parse(fs.readFileSync(new URL('../client/version.json', import.meta.url), 'utf8'));

assert.equal(version.build, '62.0', 'current build marker missing');
assert.match(html, /game\.bundle\.js\?v=62\.0/, 'v60 engine cache key missing');
assert.match(html, /v59\.patch\.js\?v=62\.0/, 'v59 compatibility layer must share v60 cache key');
assert.match(html, /v60\.patch\.js\?v=62\.0/, 'v60 realism patch is not loaded');
assert.match(sw, /v60\.patch\.js\?v=\$\{BUILD\}/, 'service worker does not precache v60 patch');

assert.match(patch, /target\?\.role === 'survivor'\) return null/, 'survivor CCTV suppression missing');
assert.match(patch, /createStoryHideout/, 'Oh Se-hyeon hideout builder missing');
assert.match(patch, /storyHideoutCover/, 'physical hideout cover missing');
assert.match(patch, /경비 초소 내부 구조 신호/, 'hidden survivor objective label missing');
assert.match(patch, /ensureStoryHideoutThreats/, 'hideout threat setup missing');
assert.match(patch, /sv\.revealed && !sv\.dead/, 'survivor must become attackable after reveal');
assert.match(patch, /escortNoCollision/, 'escort collision release missing');
assert.match(patch, /getFlowField\?\./, 'navigation flow-field following missing');
assert.match(patch, /const back = playerDistance > 10/, 'formation following distance missing');
assert.match(patch, /supportFireCd/, 'survivor support-fire behavior missing');
assert.match(patch, /storyDoorShakeTimer = 1\.85/, 'shutter camera shake trigger missing');
assert.match(patch, /spawnStoryDoorDust/, 'shutter dust effect missing');
assert.match(patch, /camera\.rotateZ/, 'camera rumble rotation missing');

console.log('v60 story realism, survivor AI, hideout and shutter feedback tests: passed');
