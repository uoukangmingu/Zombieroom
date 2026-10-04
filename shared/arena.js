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

export const MAPS = {
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
  }
};

export const DIFFICULTY = {
  normal: { enemyHp: 1, enemySpeed: 1, enemyDamage: 1, spawn: 1 },
  hard: { enemyHp: 1.22, enemySpeed: 1.10, enemyDamage: 1.25, spawn: 1.18 },
  hell: { enemyHp: 1.45, enemySpeed: 1.18, enemyDamage: 1.45, spawn: 1.34 }
};

export const WEAPON_DEFS = [
  { id: 'pistol', slot: 1, name: 'PISTOL', unlockWave: 1, ammoMax: Infinity, magSize: 12, reloadTime: .92, cooldown: .32, damage: 24, range: 42, pellets: 1, spread: 0.004, recoil: .020, type: 'hitscan' },
  { id: 'smg', slot: 2, name: 'SMG', unlockWave: 2, ammoMax: 160, magSize: 30, reloadTime: 1.28, cooldown: .08, damage: 12, range: 34, pellets: 1, spread: 0.018, recoil: .012, type: 'hitscan' },
  { id: 'shotgun', slot: 3, name: 'SHOTGUN', unlockWave: 3, ammoMax: 48, magSize: 6, reloadTime: 1.55, cooldown: .62, damage: 13, range: 24, pellets: 8, spread: 0.095, recoil: .060, type: 'hitscan' },
  { id: 'grenade', slot: 4, name: 'GRENADE', unlockWave: 4, ammoMax: 20, magSize: 1, reloadTime: 1.05, cooldown: .72, damage: 92, range: 22, radius: 5.2, recoil: .035, type: 'grenade' },
  { id: 'barrel', slot: 5, name: 'BARREL', unlockWave: 5, ammoMax: 12, cooldown: .45, damage: 130, radius: 6.3, type: 'barrel' },
  { id: 'wall', slot: 6, name: 'WALL', unlockWave: 6, ammoMax: 18, cooldown: .28, type: 'wall' },
  { id: 'rocket', slot: 7, name: 'ROCKET', unlockWave: 7, ammoMax: 18, magSize: 1, reloadTime: 1.82, cooldown: .86, damage: 145, radius: 6.8, speed: 26, recoil: .080, type: 'rocket' },
  { id: 'railgun', slot: 8, name: 'RAIL', unlockWave: 9, ammoMax: 28, magSize: 3, reloadTime: 1.70, cooldown: .75, damage: 105, range: 70, pellets: 1, spread: 0, pierce: 8, recoil: .045, type: 'rail' }
];

export const MAP_KEYS = Object.freeze(Object.keys(MAPS));
export const WEAPONS = Object.fromEntries(WEAPON_DEFS.map(w => [w.id, {...w, type: w.type === 'wall' ? 'placeWall' : w.type === 'barrel' ? 'placeMine' : w.type}]));
export function enemyStats(type, wave, diff = DIFFICULTY.normal) {
  const scale = 1 + Math.max(1, wave) * .055;
  const stats = {
    zombie: { hp:31, speed:2.45, damage:10, score:10, radius:.48 },
    runner: { hp:20, speed:4.1, damage:13, score:18, radius:.46 },
    tank: { hp:128, speed:1.45, damage:18, score:42, radius:.74, wallPower:1.85 },
    devil: { hp:72, speed:1.85, damage:18, score:55, radius:.72 },
    bomber: { hp:28, speed:3.25, damage:16, score:30, radius:.50, blastRadius:4.3, blastDamage:88*diff.enemyDamage },
    shield: { hp:62, speed:2.05, damage:14, score:34, radius:.58, shielded:true }
  }[type] || { hp:31, speed:2.45, damage:10, score:10, radius:.48 };
  return {...stats,hp:stats.hp*scale*diff.enemyHp,speed:stats.speed*diff.enemySpeed,damage:stats.damage*diff.enemyDamage};
}
export function pickEnemyType(wave, mission = {}, random = Math.random) {
  const pool = [{type:'zombie',weight:Math.max(38,100-wave*2)}];
  if (wave >= 2) pool.push({type:'runner',weight:Math.min(32,12+wave)});
  if (wave >= 4) pool.push({type:'tank',weight:Math.min(20,5+wave*.6)});
  if (wave >= 5) pool.push({type:'devil',weight:Math.min(20,4+wave*.5)});
  if (wave >= 7) pool.push({type:'bomber',weight:mission.type==='rush'?65:Math.min(20,4+wave*.6)});
  if (wave >= 8) pool.push({type:'shield',weight:Math.min(18,3+wave*.6)});
  let r = random()*pool.reduce((sum,p)=>sum+p.weight,0);
  return pool.find(p=>(r-=p.weight)<=0)?.type || 'zombie';
}
