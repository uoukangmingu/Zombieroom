import assert from 'node:assert/strict';
import fs from 'node:fs';

const patch = fs.readFileSync(new URL('../client/v62.patch.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../client/style.css', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../client/index.html', import.meta.url), 'utf8');
const sw = fs.readFileSync(new URL('../client/sw.js', import.meta.url), 'utf8');
const bible = fs.readFileSync(new URL('../STORY_BIBLE_v62.md', import.meta.url), 'utf8');

assert.match(patch, /const BUILD = '62\.0'/);
assert.match(patch, /startEpisodeSequence/);
assert.match(patch, /advanceEpisodeSequenceStep/);
assert.match(patch, /updateEpisodeSequence/);
assert.match(patch, /kind === 'closing' && chapterId === 5/);
assert.match(patch, /finale:/);
assert.match(patch, /target:'shutdown'/);
assert.match(patch, /waves:5/);
assert.match(patch, /JANUS 수동 차단/);
assert.match(patch, /현장통제 박지현/);
assert.match(patch, /안쪽의 하루, 바깥의 15년/);
assert.match(patch, /한 사람의 잘못으로 끝나지 않는다/);
assert.match(patch, /사람을 살려 둔 것이 아니다/);
assert.doesNotMatch(patch, /격리국 관제\|/);

for (const id of [1,2,3,4,5]) {
  assert.match(patch, new RegExp(`\\n    ${id}: \\{`), `chapter ${id} sequence/script missing`);
  assert.match(patch, new RegExp(`${id}: \\{[\\s\\S]*?opening:`), `chapter ${id} opening missing`);
  assert.match(patch, new RegExp(`${id}: \\{[\\s\\S]*?closing:`), `chapter ${id} closing missing`);
}

assert.match(css, /\.episode-sequence/);
assert.match(css, /episode-sequence-active/);
assert.match(css, /episode-sequence-dots/);
assert.match(html, /v62\.patch\.js\?v=62\.0/);
assert.match(html, /BACKROOM LOW · v62\.0/);
assert.match(sw, /v62\.patch\.js\?v=\$\{BUILD\}/);
assert.match(bible, /작품의 중심 질문/);
assert.match(bible, /대사 원칙/);
assert.match(bible, /오세현/);
assert.match(bible, /한민석/);



// The final manual shutdown console must be physically reachable from the chapter 5 insertion point.
{
  const source = fs.readFileSync(new URL('../client/game.js', import.meta.url), 'utf8');
  const mapStart = source.indexOf('const MAPS = {');
  const mapEnd = source.indexOf('\n\nconst SURVIVAL_MAP_KEYS', mapStart);
  const mapCode = source.slice(mapStart, mapEnd);
  const maps = Function('buildAbyssCitadelObstacles', `${mapCode}; return MAPS;`)(() => []);
  const map = maps.janus_core;
  const radius = .60;
  const obstacles = [
    [0,-map.size/2,map.size,2],[0,map.size/2,map.size,2],[-map.size/2,0,2,map.size],[map.size/2,0,2,map.size],
    ...map.obstacles
  ];
  const blocked = (x,z) => obstacles.some(([ox,oz,w,d]) => Math.abs(x-ox) < w/2+radius && Math.abs(z-oz) < d/2+radius);
  const start = [0,48];
  const queue = [start];
  const seen = new Set([start.join(',')]);
  let reached = false;
  for (let q=0; q<queue.length && q<24000; q++) {
    const [x,z] = queue[q];
    if (Math.hypot(x, z + 12) <= 2.4) { reached = true; break; }
    for (const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx=x+dx,nz=z+dz,key=`${nx},${nz}`;
      if (seen.has(key) || blocked(nx,nz)) continue;
      seen.add(key); queue.push([nx,nz]);
    }
  }
  assert.equal(reached, true, 'chapter 5 manual shutdown console cannot be approached from the insertion point');
}

console.log('v62 story bible, chapter sequences, dialogue and final-ending tests: passed');
