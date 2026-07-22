import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../client/game.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../client/index.html', import.meta.url), 'utf8');
const sw = fs.readFileSync(new URL('../client/sw.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../client/style.css', import.meta.url), 'utf8');
const version = JSON.parse(fs.readFileSync(new URL('../client/version.json', import.meta.url), 'utf8'));

assert.equal(version.build, '62.0', 'current package build marker missing');
assert.match(source, /const GAME_BUILD = '62\.0'/, 'runtime build marker missing');
assert.match(html, /style\.css\?v=62\.0/, 'v60 stylesheet cache key missing');
assert.match(html, /game\.bundle\.js\?v=62\.0/, 'v60 bundle cache key missing');
assert.match(html, /updateViaCache: 'none'/, 'service worker update must bypass browser cache');
assert.match(html, /controllerchange[\s\S]*location\.replace/, 'new service worker must reload once automatically');
assert.match(sw, /networkFirst\(event\.request\)/, 'mutable assets must use network-first');
assert.match(sw, /fetch\(request, \{ cache:'no-store' \}\)/, 'network-first must bypass stale HTTP cache');
assert.match(sw, /keys\.filter\(key => key\.startsWith\('boxhead-backroom-low-'/, 'legacy cache cleanup missing');

const missionLines = [...source.matchAll(/\{ type: '(?:normal|interact|rescue|cargo|rush|generator|core|door|blackout|escort)'[^\n]*story: true/g)];
// STORY_CHAPTERS itself is multiline-free per mission, so count explicit rationale/outcome across chapter missions.
const rationales = [...source.matchAll(/rationale: '/g)].length;
const outcomes = [...source.matchAll(/outcome: '/g)].length;
assert.ok(rationales >= 16, `all story missions need rationale fields, found ${rationales}`);
assert.ok(outcomes >= 16, `all story missions need outcome fields, found ${outcomes}`);
assert.match(source, /작전 근거: \$\{m\.rationale\}/, 'mission cinematic does not explain why the gimmick exists');
assert.match(source, /const missionResult = this\.currentMission\?\.outcome/, 'mission completion does not explain its consequence');
assert.match(source, /target\.purpose\|\|this\.currentMission\.rationale/, 'interaction overlay does not show object purpose');

assert.match(source, /player: \[-22, -24\]/, 'chapter 1 must start on the relay side of the quarantine partition');
assert.match(source, /QUARANTINE WING · LOCKED/, 'chapter 1 quarantine partition sign missing');
assert.match(source, /addProp\(-14, -10, 48, WORLD\.WALL_HEIGHT, 1\.35/, 'left quarantine wall does not reach map boundary');
assert.match(source, /addProp\(28, -10, 20, WORLD\.WALL_HEIGHT, 1\.35/, 'right quarantine wall does not reach map boundary');
assert.match(source, /addDoor\('blastDoor', 14, -10, 8, true\)/, 'quarantine shutter is not placed on the validated relay corridor');
assert.match(source, /add\('survivor', 24, 30/, 'Oh Se-hyeon is not inside the reachable quarantine wing');
assert.match(source, /격리동 방폭 셔터 개방/, 'relay-to-shutter consequence cinematic missing');
assert.match(source, /유일 통로가 열린다/, 'shutter opening must explicitly create the only route');

assert.match(source, /isStoryCinematicLineClear\(/, 'CCTV line-of-sight test missing');
assert.match(source, /getStoryCinematicCameraPose\(/, 'CCTV camera pose resolver missing');
assert.match(source, /state\.cutawayActive = progress >= \.10 && progress <= \.86/, 'instant remote camera window missing');
assert.match(source, /this\.camera\.position\.copy\(cinematicCutaway\.position\)/, 'camera is not moved to remote CCTV pose');
assert.match(source, /this\.viewWeapon\.visible = !cinematicCutaway/, 'weapon must be hidden in remote camera view');
assert.match(css, /\.story-cinematic\.cctv-feed/, 'CCTV overlay style missing');
assert.match(css, /REMOTE OBSERVATION FEED/, 'CCTV feed label missing');

// Chapter 1 must have one meaningful route: relay side -> locked shutter -> survivor wing.
{
  const mapStart = source.indexOf('const MAPS = {');
  const mapEnd = source.indexOf('\n\nconst MAP_THEMES', mapStart);
  const mapCode = source.slice(mapStart, mapEnd);
  const maps = Function('buildAbyssCitadelObstacles', `${mapCode}; return MAPS;`)(() => []);
  const map = maps.relay_hub;
  const partition = [[-14,-10,48,1.35],[28,-10,20,1.35]];
  const shutter = [14,-10,8,1.1];
  // Story furniture is included because decorative collision must not turn the opened route into a fake route.
  const storyDecor = [
    [-18,-20,2.88,2.88],[-8,-20,2.88,2.88],[20,20,4.28,3.28],[20,8,3.48,2.48],
    [-22,22,2.92,1.18],[15,-13,1.18,2.72],[-22,-10,1.08,3.38],[21,14,1.08,3.28],
    [-6,22,5.32,1.22],[20,14,1.22,4.32],[-23,24,2.28,1.18],[-20.5,24,1.18,1.18],
    [14,22,2.68,1.48],[-27.8,21.6,1.16,2.48],[27.8,22.2,1.16,2.48],[-13,-28.2,2.48,1.16],
    [8,-12,2.34,1.54]
  ];
  const canReach = (goalPoint, closed) => {
    const obstacles = [...map.obstacles, ...partition, ...storyDecor, ...(closed ? [shutter] : [])];
    const step = .5, half = map.size / 2 - .8;
    const cols = Math.floor((half * 2) / step);
    const cell = ([x,z]) => [Math.max(0,Math.min(cols-1,Math.floor((x+half)/step))),Math.max(0,Math.min(cols-1,Math.floor((z+half)/step)))];
    const world = (ix,iz) => [-half+(ix+.5)*step,-half+(iz+.5)*step];
    const blocked = (x,z,r=.62) => obstacles.some(([ox,oz,w,d]) => Math.abs(x-ox)<w/2+r && Math.abs(z-oz)<d/2+r);
    const start = cell([-22,-24]), goal = cell(goalPoint), queue=[start], seen=new Set([start.join(',')]);
    const [sx,sz] = world(start[0],start[1]), [gx,gz] = world(goal[0],goal[1]);
    if (blocked(sx,sz) || blocked(gx,gz)) return false;
    for (let qi=0; qi<queue.length; qi++) {
      const [ix,iz]=queue[qi];
      if(ix===goal[0]&&iz===goal[1]) return true;
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=ix+dx,nz=iz+dz,key=`${nx},${nz}`;
        if(nx<0||nz<0||nx>=cols||nz>=cols||seen.has(key)) continue;
        const [x,z]=world(nx,nz); if(blocked(x,z)) continue;
        seen.add(key); queue.push([nx,nz]);
      }
    }
    return false;
  };
  assert.equal(canReach([24,30], true), false, 'closed quarantine shutter can be bypassed');
  assert.equal(canReach([24,30], false), true, 'opening quarantine shutter does not create a route to Oh Se-hyeon');
  assert.equal(canReach([8,-14], true), true, 'relay-side player cannot approach the central hub before opening the shutter');
}

console.log('v59 story coherence, CCTV, cache and gated-route regression tests: passed');
