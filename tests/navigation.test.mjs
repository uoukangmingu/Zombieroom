import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const gameSource = fs.readFileSync(path.join(root, 'client/game.js'), 'utf8');

function extractMethod(name) {
  const marker = `\n  ${name}(`;
  const start = gameSource.indexOf(marker);
  assert.notEqual(start, -1, `Game.${name} 메서드를 찾을 수 없음`);
  const methodStart = start + 3;
  const bodyStart = gameSource.indexOf('{', methodStart);
  let depth = 0;
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = bodyStart; i < gameSource.length; i++) {
    const ch = gameSource[i];
    const next = gameSource[i + 1];
    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (ch === '*' && next === '/') { blockComment = false; i++; }
      continue;
    }
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
    else if (ch === '}' && --depth === 0) return gameSource.slice(methodStart, i + 1);
  }
  throw new Error(`Game.${name} 메서드 본문이 닫히지 않음`);
}

function extractTopLevelFunction(name) {
  const marker = `function ${name}(`;
  const start = gameSource.indexOf(marker);
  assert.notEqual(start, -1, `${name} 함수를 찾을 수 없음`);
  const bodyStart = gameSource.indexOf('{', start);
  let depth = 0;
  for (let i = bodyStart; i < gameSource.length; i++) {
    if (gameSource[i] === '{') depth++;
    else if (gameSource[i] === '}' && --depth === 0) return gameSource.slice(start, i + 1);
  }
  throw new Error(`${name} 함수 본문이 닫히지 않음`);
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const dist2 = (ax, az, bx, bz) => (ax - bx) ** 2 + (az - bz) ** 2;
const NAV_DIRS = [
  [1,0,1],[-1,0,1],[0,1,1],[0,-1,1],
  [1,1,Math.SQRT2],[-1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,-1,Math.SQRT2]
];
const NAV_OPPOSITE = [1,0,3,2,7,6,5,4];
const NAV_FORWARD_LINKS = [0,2,4,5];
const WORLD = { PLAYER_RADIUS: .46 };
const methods = [
  'classifyNavigationCell', 'classifyNavigationEdge', 'buildNavGrid', 'getNavGrid',
  'navWorldToCell', 'navCellToWorld', 'nearestWalkableCell',
  'nearestReachableWalkableCell', 'lineClear2D', 'findNavPath'
].map(extractMethod).join('\n');

const HarnessBase = Function(
  'clamp', 'dist2', 'NAV_DIRS', 'NAV_OPPOSITE', 'NAV_FORWARD_LINKS', 'WORLD',
  `return class NavigationHarness { ${methods} }`
)(clamp, dist2, NAV_DIRS, NAV_OPPOSITE, NAV_FORWARD_LINKS, WORLD);

class NavigationHarness extends HarnessBase {
  constructor(map, obstacles = []) {
    super();
    this.map = map;
    this.obstacles = obstacles.map(obstacle => ({ alive: true, kind: 'wall', ...obstacle }));
    this.navVersion = 1;
    this.navGrids = new Map();
  }

  nearbyObstacles(x, z, radius = 0) {
    return this.obstacles.filter(obstacle =>
      Math.abs(x - obstacle.x) <= obstacle.w / 2 + radius &&
      Math.abs(z - obstacle.z) <= obstacle.d / 2 + radius
    );
  }

  collides(x, z, radius) {
    return this.obstacles.some(obstacle => {
      if (!obstacle.alive) return false;
      const cx = clamp(x, obstacle.x - obstacle.w / 2, obstacle.x + obstacle.w / 2);
      const cz = clamp(z, obstacle.z - obstacle.d / 2, obstacle.z + obstacle.d / 2);
      return dist2(x, z, cx, cz) < radius * radius;
    });
  }
}

function assertClearPath(harness, start, points, radius) {
  let previous = { x: start[0], z: start[1] };
  for (const point of points) {
    assert.equal(
      harness.lineClear2D(previous.x, previous.z, point.x, point.z, radius),
      true,
      `압축 경로가 벽을 통과함: (${previous.x}, ${previous.z}) -> (${point.x}, ${point.z})`
    );
    previous = point;
  }
}

// 셀 중심은 모두 비어 있지만 두 중심 사이에 얇은 벽이 있는 회귀 사례.
{
  const harness = new NavigationHarness(
    { size: 12, navCell: 4 },
    [{ x: 2, z: 0, w: .12, d: 8 }]
  );
  const nav = harness.getNavGrid(.4);
  const left = harness.navWorldToCell(0, 0, nav);
  assert.equal(nav.walkable[left.i], 1, '출발 셀은 걸을 수 있어야 함');
  assert.equal(nav.links[left.i * NAV_DIRS.length], 0, '얇은 벽을 가로지르는 동쪽 링크는 차단돼야 함');
}

// 실제 Thin Line 맵처럼 플레이어와 적 사이에 긴 벽이 있을 때 벽 끝으로 우회해야 한다.
{
  const obstacles = [
    { x:-18, z:0, w:5, d:46 }, { x:18, z:0, w:5, d:46 },
    { x:0, z:-17, w:16, d:4 }, { x:0, z:17, w:16, d:4 },
    { x:-6, z:-28, w:4, d:10 }, { x:6, z:28, w:4, d:10 }
  ];
  const harness = new NavigationHarness({ size: 62, navCell: 1.25 }, obstacles);
  const start = [25, 0];
  const path = harness.findNavPath(start[0], start[1], 0, 0, .78);
  assert.ok(path?.length, '긴 벽 반대편 플레이어까지 경로를 찾아야 함');
  assert.ok(path.some(point => Math.abs(point.z) > 23.4), '벽 끝을 돌아가는 경유지가 필요함');
  assertClearPath(harness, start, path, .78);
  assert.ok(Math.hypot(path.at(-1).x, path.at(-1).z) < 1.2, '경로 마지막은 플레이어 셀이어야 함');
}

// 과거 260셀 복원 제한으로 끊기던 장거리 경로가 끝까지 복원되는지 검사한다.
{
  const harness = new NavigationHarness({ size: 400, navCell: 1.25 });
  const start = [-180, 0];
  const path = harness.findNavPath(start[0], start[1], 180, 0, .78);
  assert.ok(path?.length, '260셀보다 긴 경로도 잘리지 않아야 함');
  assertClearPath(harness, start, path, .78);
  assert.ok(Math.abs(path.at(-1).x - 180) < 1.3, '장거리 경로가 목표 셀까지 도달해야 함');
}

// 가장 복잡한 Abyss Citadel의 16개 스폰이 중앙 플레이어까지 모두 연결되는지 검사한다.
{
  const builderSource = extractTopLevelFunction('buildAbyssCitadelObstacles');
  const buildAbyss = Function(`${builderSource}; return buildAbyssCitadelObstacles;`)();
  const obstacles = buildAbyss().map(([x, z, w, d]) => ({ x, z, w, d }));
  const spawns = [
    [-61,-61], [61,-61], [-61,61], [61,61], [0,-61], [0,61], [-61,0], [61,0],
    [-36,-61], [36,-61], [-36,61], [36,61], [-61,-36], [-61,36], [61,-36], [61,36]
  ];
  const harness = new NavigationHarness({ size: 132, navCell: 1.25 }, obstacles);
  for (const start of spawns) {
    const path = harness.findNavPath(start[0], start[1], 0, 0, .78);
    assert.ok(path?.length, `Abyss 스폰 (${start.join(',')})에서 중앙까지 경로가 필요함`);
    assertClearPath(harness, start, path, .78);
  }
}

// Big Boxy 우측의 좁은 포켓처럼 내비게이션 셀에서 플레이어 구역으로 나오지 못하는
// 위치는 스폰 후보에서 제외해야 한다. 과거에는 벽 너머의 가까운 셀로 강제 폴백했다.
{
  const obstacles = [
    { x:0, z:-29, w:58, d:2 }, { x:0, z:29, w:58, d:2 },
    { x:-29, z:0, w:2, d:58 }, { x:29, z:0, w:2, d:58 },
    { x:-10, z:-8, w:8, d:4 }, { x:11, z:8, w:8, d:4 },
    { x:-18, z:13, w:5, d:10 }, { x:18, z:-13, w:5, d:10 },
    { x:0, z:20, w:16, d:3 }, { x:0, z:-20, w:16, d:3 },
    { x:-25, z:0, w:3, d:16 }, { x:25, z:0, w:3, d:16 }
  ];
  const harness = new NavigationHarness({ size:58, navCell:1.25 }, obstacles);
  const start = [27.2, 0];
  const nav = harness.getNavGrid(.62);
  const strictStart = harness.nearestReachableWalkableCell(start[0], start[1], nav, .46, 5, false);
  assert.equal(strictStart, null, '벽을 통과해야 닿는 가까운 셀은 유효 스폰 구역이 아님');
}

// 정밀 A*가 한 번 만들어진 뒤 공유 흐름 지도가 다음 틱에 경로를 지우던 회귀 사례.
{
  const steeringMethod = extractMethod('getEnemySteering');
  let clock = 10;
  const SteeringHarnessBase = Function(
    'clamp', 'dist2', 'now', 'rand',
    `return class SteeringHarness { ${steeringMethod} }`
  )(clamp, dist2, () => clock, (a, b) => (a + b) / 2);
  class SteeringHarness extends SteeringHarnessBase {
    constructor() {
      super();
      this.navVersion = 1;
      this.player = { x:10, z:0 };
      this.flowCalls = 0;
    }
    lineClear2D(_ax, _az, bx, bz) { return bx === 4 && bz === 0; }
    getFlowSteering() { this.flowCalls++; return { x:0, z:1, avoiding:true }; }
    findNavPath() { return [{ x:4, z:0 }, { x:8, z:0 }]; }
    findWallOnRay() { return null; }
    findStrategicBreakableWall() { return null; }
    getBoundaryDetourSteering() { return null; }
    closestPointOnObstacle(o) { return { x:o.x, z:o.z }; }
  }
  const harness = new SteeringHarness();
  const enemy = { x:0, z:0, radius:.48, stuckTime:.8, progressStall:0, aiPathTimer:0 };
  const first = harness.getEnemySteering(enemy, 10, 0, .1);
  assert.ok(enemy.navPath?.length, '막힌 적은 정밀 A* 경로를 보관해야 함');
  assert.ok(first.x > .9 && Math.abs(first.z) < .01, '첫 A* 경유지를 향해야 함');
  enemy.stuckTime = 0;
  clock += .1;
  const second = harness.getEnemySteering(enemy, 10, 0, .1);
  assert.ok(enemy.navPath?.length, '다음 AI 틱에도 A* 경로가 유지돼야 함');
  assert.ok(second.x > .9 && Math.abs(second.z) < .01, '공유 흐름 방향으로 되돌아가면 안 됨');
  assert.equal(harness.flowCalls, 0, '활성 A* 경로를 공유 흐름 지도가 덮어쓰면 안 됨');
}

console.log('navigation regression tests: 6 groups passed');
