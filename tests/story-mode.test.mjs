import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'client/game.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'client/index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'client/style.css'), 'utf8');

for (const id of [
  'survival-mode-button','story-mode-button','story-menu-panel','story-progress-summary',
  'story-chapter-list','story-selected-summary','story-start-button','story-screen',
  'story-screen-title','story-screen-copy','story-screen-objectives','story-primary-button','story-secondary-button',
  'story-target-marker','story-target-direction','story-dialogue','story-dialogue-speaker','story-dialogue-text','story-cinematic'
]) assert.match(html, new RegExp(`id="${id}"`), `스토리 UI #${id} 누락`);

assert.match(source, /const STORY_CHAPTERS = Object\.freeze\(\[/, '스토리 챕터 정의 누락');
for (let chapter = 1; chapter <= 5; chapter++) {
  assert.match(source, new RegExp(`id: ${chapter}, code: 'JANUS-0${chapter}'`), `JANUS Chapter ${chapter} 정의 누락`);
}
for (const map of ['relay_hub','freight_spine','anchor_forge','atlas_archive','janus_core']) {
  assert.match(source, new RegExp(`map: '${map}'`), `스토리 전용 맵 ${map} 연결 누락`);
}
for (const survivalMap of ['box','lane','castle','maze','abyss']) {
  assert.doesNotMatch(source, new RegExp(`code: 'JANUS-[^']+'[\\s\\S]{0,150}map: '${survivalMap}'`), `스토리 챕터가 생존 맵 ${survivalMap}을 재사용하면 안 됨`);
}
assert.match(source, /bhfps_story_v54/, 'v54 스토리 진행 저장 키 누락');
assert.match(source, /bhfps_story_v52/, 'v52 스토리 진행 데이터 마이그레이션 누락');
assert.match(source, /bhfps_story_v51/, 'v51 진행 데이터 마이그레이션 누락');
assert.match(source, /bhfps_story_v50/, 'v50 진행 데이터 마이그레이션 누락');
assert.match(source, /completeStoryChapter\(\)/, '스토리 챕터 완료 처리 누락');
assert.match(source, /this\.storyProgress\.unlocked = Math\.max/, '다음 챕터 해금 처리 누락');
assert.match(source, /this\.storyBossPending = !!\(storyFinal/, '최종 보스 예약 처리 누락');
assert.match(source, /return this\.storyChapter\?\.boss \|\| 'devil'/, '최종 균열술사 강제 출현 누락');
assert.match(source, /const STORY_DIALOGUES = Object\.freeze/, '챕터별 추가 대사 데이터 누락');
assert.match(source, /queueDialogue\(/, '대사 큐 시스템 누락');
assert.match(source, /updateStoryTargetMarker\(/, '화면 목표 방향 마커 누락');
assert.match(source, /storyTargetOffscreenSide/, '화면 밖 목표 방향 고정 상태 누락');
assert.match(source, /resolveStoryTargetScreenSide/, '카메라 좌우 벡터 기반 목표 방향 판정 누락');
assert.match(source, /뒤쪽 · 왼쪽으로 회전[\s\S]{0,160}뒤쪽 · 오른쪽으로 회전/, '뒤쪽 목표 회전 안내 문구 누락');
assert.match(source, /drawStoryMark/, '미니맵 임무 아이콘 누락');
assert.match(source, /storyCinematicState/, '스토리 시네마틱 상태 누락');
assert.match(source, /markerRingGeo[\s\S]*markerArrowGeo/, '상호작용 오브젝트 월드 마커 누락');
assert.match(source, /STORY_MUSIC_PROFILES/, '챕터별 음악 테마 누락');
assert.match(source, /weaponGain[\s\S]*impactGain[\s\S]*dialogueGain/, '오디오 버스 분리 누락');
assert.match(source, /duckMusic\(/, '발사·대사 음악 덕킹 누락');
assert.match(source, /hit\(kind = 'flesh'/, '재질별 명중음 누락');
assert.match(css, /\.story-target-marker/, '스토리 목표 마커 스타일 누락');
assert.match(css, /\.story-target-marker\.turn-left/, '좌측 화면 가장자리 방향 표시 스타일 누락');
assert.match(css, /\.story-target-marker\.turn-right/, '우측 화면 가장자리 방향 표시 스타일 누락');
{
  const markerCss = css.slice(css.indexOf('.story-target-marker {'), css.indexOf('.story-dialogue {'));
  assert.doesNotMatch(markerCss, /ffd65a|255,214,102|fff2b0/i, '화면 밖 목표 표시가 주황색 의미에 의존하면 안 됨');
}
assert.match(css, /\.story-dialogue/, '스토리 자막 스타일 누락');
assert.match(css, /\.story-cinematic/, '스토리 시네마틱 스타일 누락');

assert.match(source, /isStoryControlLocked\(\)/, '스토리 연출 전용 조작 잠금 판정 누락');
assert.match(source, /if \(this\.isStoryControlLocked\(\)\)[\s\S]{0,900}return;/, '일반 입력·전투 업데이트보다 먼저 실행되는 시네마틱 정지 분기 누락');
assert.match(source, /this\.storyCinematicQueue = \[\]/, '시네마틱 순차 재생 대기열 누락');
assert.match(source, /pauseAfterStoryCinematic/, '연출 종료 후 일시정지 처리 누락');
assert.match(source, /this\.input\.discardLook\(80\)/, '연출 중 마우스 회전 입력 폐기 누락');
assert.match(source, /const cinematicStep = clamp\(tick - \(state\.lastTickAt \|\| tick\), 0, \.25\)/, '저 FPS에서도 연출 시간이 과도하게 늘어나지 않는 전용 타이머 누락');
assert.match(source, /!this\.storySequence\?\.cargoDelivered/, '화물 완료 연출 1회 실행 가드 누락');
assert.match(source, /!this\.storySequence\?\.survivorExtracted/, '생존자 완료 연출 1회 실행 가드 누락');
assert.match(source, /storyObjectCue\(role = 'machine', phase = 'complete'\)/, '절차형 스토리 장치 효과음 누락');
assert.match(source, /addFloorStrip[\s\S]*addPipe[\s\S]*addShelf[\s\S]*addSign/, '스토리 공간 목적형 세트 드레싱 누락');

assert.match(source, /storyStrokeMat/, '스토리 전용 강한 스트로크 재질 누락');
assert.match(source, /ensureStoryRouteIntegrity\(\)/, '스토리 경로 무결성 보정 누락');
assert.match(source, /canReachStoryPoint\(/, '스토리 목표 도달 가능성 검사 누락');
assert.match(source, /addConsoleBank[\s\S]*addServerRack[\s\S]*addDecorDoor/, '연구 시설형 스토리 장식 세트 누락');
assert.match(source, /createStorySurvivorModel\(\)/, '오세현 전용 인간형 모델 생성 누락');
assert.match(source, /damageStorySurvivor\(/, '오세현 피해/사망 처리 누락');
assert.match(source, /story-survivor-health/, '오세현 체력바 UI 누락');
assert.match(source, /dynamicStory/, '이동 스토리 충돌체 최적화 누락');
assert.match(source, /if \(ownCollider\) ownCollider\.alive = false/, '오세현 자기 충돌 때문에 이동이 막히는 문제 수정 누락');
assert.match(source, /const storySurvivor = this\.getActiveStorySurvivor\(\)/, '적 AI의 오세현 공격 판정 캐시 누락');
assert.match(css, /#story-survivor-health/, '오세현 체력바 스타일 누락');
assert.match(source, /stepStoryMover\(/, '스토리 이동 오브젝트 정체 방지 이동 보정 누락');
assert.match(source, /beginCargoCarry\(/, '화물 운반 시작 시 충돌 해제 처리 누락');
assert.match(source, /finishCargoCarry\(/, '화물 적재 완료 처리 누락');
assert.match(source, /updateDeliveredCargoCollision\(/, '적재 후 안전 거리에서 충돌 복구 처리 누락');
assert.match(source, /viewLeftHand[\s\S]*viewRightHand[\s\S]*viewForearm/, '장전 모션용 1인칭 손/팔 참조 누락');
assert.match(source, /registerStoryCollision\(/, '스토리 장식 충돌체 등록 함수 누락');
assert.match(source, /kind = 'storyProp'/, '스토리 장식 충돌 종류 누락');
assert.match(source, /storyInteractive/, '상호작용 오브젝트 충돌체 누락');
assert.match(source, /ensureStoryPlayerClearance\(\)/, '장식물과 시작점이 겹칠 때 플레이어 복구 처리 누락');
assert.match(source, /clearStoryRuntimeState\(clearActions = true\)/, '스토리 연출 상태 일괄 정리 함수 누락');
assert.match(source, /resetToMainMenuState\(\)/, '모드 전환용 메인 메뉴 초기화 함수 누락');
assert.match(source, /const SURVIVAL_MAP_KEYS = Object\.freeze/, '생존 모드 전용 맵 목록 누락');
assert.match(source, /loadSurvivalMapKey\(\)/, '생존 맵 선택값 복원 처리 누락');
assert.match(source, /selectedSurvivalMap/, '스토리 다음 생존 시작 시 맵 폴백 누락');
assert.doesNotMatch(source.slice(source.indexOf('  selectStoryChapter('), source.indexOf('\n\n  storyLoadoutLabel', source.indexOf('  selectStoryChapter('))), /UI\.map\.value = this\.storyChapter\.map/, '스토리 선택이 생존 맵 select 값을 오염시키면 안 됨');
assert.match(source, /suppressAutoPauseUntil/, '모드 전환 중 포인터락 자동 일시정지 방지 누락');
assert.doesNotMatch(source.slice(source.indexOf('  returnToMainMenu() {'), source.indexOf('\n\n  setupRenderer()', source.indexOf('  returnToMainMenu() {'))), /window\.location\.reload/, '메인 복귀가 페이지 새로고침에 의존하면 안 됨');
assert.match(source, /this\.runMode !== 'story'[\s\S]{0,120}this\.spawnInitialItemBoxes/ , '스토리 시작 시 무작위 보급 상자 제거 누락');
assert.match(source, /!serverEnemyAuthority && this\.runMode !== 'story'\) this\.updateRandomItemBoxes/, '스토리 진행 중 무작위 보급 상자 제거 누락');
assert.match(css, /story-sequence-active[\s\S]*pointer-events:none/, '연출 중 모바일 조작 차단 스타일 누락');
assert.match(css, /--cinematic-progress/, '강제 시청 진행 표시 누락');


// 모든 스토리 전용 맵의 시작점은 기본 벽 내부에 있으면 안 된다.
{
  const start = source.indexOf('const MAPS = {');
  const end = source.indexOf('\n\nconst MAP_THEMES', start);
  assert.ok(start >= 0 && end > start, 'MAPS 정의 추출 실패');
  const mapCode = source.slice(start, end);
  const maps = Function('buildAbyssCitadelObstacles', `${mapCode}; return MAPS;`)(() => []);
  for (const key of ['relay_hub','freight_spine','anchor_forge','atlas_archive','janus_core']) {
    const map = maps[key];
    const [px,pz] = map.player;
    const blocked = map.obstacles.some(([x,z,w,d]) => Math.abs(px-x) < w/2 + .48 && Math.abs(pz-z) < d/2 + .48);
    assert.equal(blocked, false, `${key} 시작점이 맵 벽과 겹치면 안 됨`);
  }
}

const chapterCount = [...source.matchAll(/id: \d, code: 'JANUS-0\d'/g)].length;
assert.equal(chapterCount, 5, '스토리 챕터는 정확히 5개여야 함');
console.log('v59 story mode regression tests: passed');


// 스토리 핵심 상호작용 지점은 시작점에서 실제로 접근 가능한 연결 구역에 있어야 한다.
{
  const start = source.indexOf('const MAPS = {');
  const end = source.indexOf('\n\nconst MAP_THEMES', start);
  const mapCode = source.slice(start, end);
  const maps = Function('buildAbyssCitadelObstacles', `${mapCode}; return MAPS;`)(() => []);
  const collides = (map, x, z, radius = .62) => map.obstacles.some(([ox, oz, w, d]) => Math.abs(x - ox) < w / 2 + radius && Math.abs(z - oz) < d / 2 + radius);
  const canReach = (map, from, to) => {
    const step = 1.25;
    const half = map.size / 2 - 1.5;
    const cols = Math.ceil((half * 2) / step);
    const toCell = ([x, z]) => [Math.max(0, Math.min(cols - 1, Math.floor((x + half) / step))), Math.max(0, Math.min(cols - 1, Math.floor((z + half) / step)))];
    const toWorld = (ix, iz) => [-half + step * (ix + .5), -half + step * (iz + .5)];
    const s = toCell(from), g = toCell(to);
    const idx = (ix, iz) => iz * cols + ix;
    const q = [s];
    const seen = new Uint8Array(cols * cols);
    seen[idx(s[0], s[1])] = 1;
    while (q.length) {
      const [ix, iz] = q.shift();
      if (ix === g[0] && iz === g[1]) return true;
      for (const [dx, dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = ix + dx, nz = iz + dz;
        if (nx < 0 || nz < 0 || nx >= cols || nz >= cols) continue;
        const i = idx(nx, nz);
        if (seen[i]) continue;
        const [wx, wz] = toWorld(nx, nz);
        if (collides(map, wx, wz)) continue;
        seen[i] = 1;
        q.push([nx, nz]);
      }
    }
    return false;
  };
  const routeCases = [
    ['relay_hub', [-22, -24], [[8, -12]]],
    ['freight_spine', [-34, 0], [[-34, 24], [34, -24], [-18, -20], [6, 0], [-18, 26]]],
    ['anchor_forge', [-18, 34], [[-10, -8], [10, -8]]],
    ['atlas_archive', [-42, 38], [[-32, -26], [28, -2], [-10, 30], [40, -36]]],
    ['janus_core', [0, 48], [[-14, 12], [0, 8], [14, 12]]]
  ];
  for (const [key, startPoint, targets] of routeCases) {
    const map = maps[key];
    for (const target of targets) {
      assert.equal(collides(map, target[0], target[1]), false, `${key} 핵심 목표 ${target}가 벽과 겹치면 안 됨`);
      assert.equal(canReach(map, startPoint, target), true, `${key} 시작점에서 핵심 목표 ${target}까지 길이 막히면 안 됨`);
    }
  }
}
