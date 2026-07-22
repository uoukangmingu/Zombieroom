import assert from 'node:assert/strict';
import fs from 'node:fs';

const patch = fs.readFileSync(new URL('../client/v61.patch.js', import.meta.url), 'utf8');

const source = fs.readFileSync(new URL('../client/game.js', import.meta.url), 'utf8');
{
  const mapStart = source.indexOf('const MAPS = {');
  const mapEnd = source.indexOf('\n\nconst MAP_THEMES', mapStart);
  const mapCode = source.slice(mapStart, mapEnd);
  const maps = Function('buildAbyssCitadelObstacles', `${mapCode}; return MAPS;`)(() => []);
  const map = maps.atlas_archive;
  const start = [-50,44], radius = .97;
  const all = [
    [0,-map.size/2,map.size,2],[0,map.size/2,map.size,2],[-map.size/2,0,2,map.size],[map.size/2,0,2,map.size],
    ...map.obstacles
  ];
  const blocked = all.some(([x,z,w,d]) => Math.abs(start[0]-x) < w/2+radius && Math.abs(start[1]-z) < d/2+radius);
  assert.equal(blocked, false, 'chapter 4 vestibule start overlaps a map wall');
  assert.ok(Math.hypot(start[0]-(-42),start[1]-38) > 8, 'chapter 4 start remains too close to scanner dock');
}

const html = fs.readFileSync(new URL('../client/index.html', import.meta.url), 'utf8');
const sw = fs.readFileSync(new URL('../client/sw.js', import.meta.url), 'utf8');

assert.match(patch, /placeChapterFourPlayerSafely/, 'chapter 4 safe insertion resolver missing');
assert.match(patch, /\[-50,44\]/, 'chapter 4 validated vestibule start missing');
assert.match(patch, /scanner\.group\.visible = false/, 'chapter 4 scanner must remain docked before escort');
assert.match(patch, /this\.setStoryObjectCollision\?\.\(scanner, false\)/, 'docked scanner collider must be disabled');
assert.match(patch, /this\.__v61ShutterSequenceActive && title === '작전 결과'/, 'chapter 1 duplicate outcome cinematic suppression missing');
assert.match(patch, /filter\(clip => clip\.title !== '작전 결과'\)/, 'queued duplicate black-screen clip is not removed');
assert.match(patch, /localInteraction[\s\S]*showCenterAlert/, 'nearby controls should use direct feedback instead of unnecessary cinematic cuts');
assert.match(patch, /const corePlans =/, 'story core placement plans missing');
assert.match(patch, /'4:2': \[\[-31,-20\],\[13,7\],\[32,-27\]\]/, 'chapter 4 distortion cores are not tied to archive zones');
assert.match(patch, /missionChains = \{/, 'cross-mission causal chain data missing');
for (const chapter of [1,2,3,4,5]) {
  assert.match(patch, new RegExp(`\\n    ${chapter}: \\[`), `chapter ${chapter} causal chain missing`);
}
assert.match(patch, /fieldBrief/, 'mission cause briefing missing');
assert.match(patch, /handoff/, 'mission consequence handoff missing');
assert.match(patch, /v61ShutterSequenceActive = false/, 'chapter 1 shutter sequence reset missing');

// Version wiring is updated later by the packaging script; this test also guards the expected final references.
assert.match(html, /v61\.patch\.js\?v=62\.0/, 'v61 runtime patch is not loaded');
assert.match(sw, /v61\.patch\.js\?v=\$\{BUILD\}/, 'v61 patch is not cached for offline startup');

console.log('v61 story coherence and chapter-start regression tests: passed');
