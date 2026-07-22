import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'client/game.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'client/index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'client/style.css'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'client/sw.js'), 'utf8');
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function extractMethod(name) {
  const marker = `\n  ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `Game.${name} 메서드 누락`);
  const methodStart = start + 3;
  const bodyStart = source.indexOf('{', methodStart);
  let depth = 0, quote = '', escaped = false, lineComment = false, blockComment = false;
  for (let i = bodyStart; i < source.length; i++) {
    const ch = source[i], next = source[i + 1];
    if (lineComment) { if (ch === '\n') lineComment = false; continue; }
    if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i++; } continue; }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '/' && next === '/') { lineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i++; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return source.slice(methodStart, i + 1);
  }
  throw new Error(`Game.${name} 본문이 닫히지 않음`);
}

// 저 FPS에서 한 프레임에 얇은 벽을 완전히 건너는 충돌 회귀 사례.
{
  const moveEntity = extractMethod('moveEntity');
  const Harness = Function('clamp', `return class Harness { ${moveEntity} }`)(clamp);
  const game = new Harness();
  game.player = { x: -1, z: 0, vx: 3, vz: 0 };
  game.collides = (x, z, radius) => Math.abs(x) < .08 + radius && Math.abs(z) < 2;
  game.moveEntity(game.player, 3, 0, .25);
  assert.ok(game.player.x < 0, '분할 이동이 얇은 벽 반대편으로 터널링하면 안 됨');
  assert.equal(game.player.vx, 0, '벽에 막힌 이동축 속도는 0이어야 함');
}

// 특수 미션은 6웨이브마다 하나만, 고정 순서로 순환해야 한다.
{
  const method = extractMethod('getMissionForWave');
  const Harness = Function('clamp', `return class Harness { ${method} }`)(clamp);
  const game = new Harness();
  const expected = ['survive', 'rush', 'core', 'blackout', 'survive'];
  assert.deepEqual([6,12,18,24,30].map(w => game.getMissionForWave(w).type), expected);
  for (const wave of [7,11,13,23]) assert.equal(game.getMissionForWave(wave).type, 'normal');
}

for (const id of [
  'career-summary','start-fov-range','pause-fov-range','pause-camera-motion','pause-flicker',
  'pause-high-contrast','save-export','save-import','reward-extract','game-over-main-button',
  'survival-mode-button','story-mode-button','story-start-button','story-screen','story-chapter-list',
  'story-target-marker','story-dialogue','story-cinematic'
]) assert.match(html, new RegExp(`id="${id}"`), `#${id} UI 누락`);

assert.match(source, /findDeterministicSafePoint\(/, '결정론적 안전 스폰 폴백 누락');
assert.doesNotMatch(extractMethod('findCoreSpawnPoint'), /\|\|\s*\{\s*x:\s*0/, '코어가 검증 없이 원점에 생성되면 안 됨');
assert.match(source, /getEnemyTacticalTarget\(/, '적 역할별 추적 슬롯 누락');
assert.match(source, /traceProjectileSegment\(/, '발사체 연속 충돌 검사 누락');
assert.match(source, /maxStacks:\s*\d+/, '보상 중첩 상한 누락');
assert.match(source, /shotgunBreach[\s\S]*railOvercharge[\s\S]*rocketPayload/, '무기 개조 보상 누락');
assert.match(source, /if \(!this\.rankedRun\) return '연습 \/ 기록 제외'/, '연습 런 기록 분리 누락');
assert.match(source, /enemyLabel\(type\)[\s\S]*균열술사/, '균열술사 명칭 누락');
assert.match(source, /casterOrb:\s*0xb65cff[\s\S]*casterCore:\s*0x78f8ff/, '균열술사 색상 팔레트 누락');
assert.match(css, /body\.high-contrast/, '고대비 HUD 스타일 누락');
assert.match(sw, /boxhead-backroom-low-v\$\{BUILD\}-network-first|boxhead-backroom-low-v59/, 'v59 네트워크 우선 캐시 누락');
for (const asset of ['index.html','style.css','game.bundle.js','manifest.webmanifest']) assert.match(sw, new RegExp(asset.replace('.', '\\.')), `서비스 워커 캐시 자산 누락: ${asset}`);

console.log('v59 systems regression tests: passed');
