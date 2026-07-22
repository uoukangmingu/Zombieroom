import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'client/index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'client/style.css'), 'utf8');
const game = fs.readFileSync(path.join(root, 'client/game.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'client/manifest.webmanifest'), 'utf8'));

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML id는 중복되면 안 됨');

for (const id of [
  'mobile-controls', 'mobile-look-zone', 'mobile-joystick', 'mobile-joystick-knob',
  'mobile-settings-start', 'mobile-settings-pause', 'mobile-settings-screen',
  'mobile-key-list', 'mobile-sensitivity', 'mobile-layout-edit', 'mobile-layout-reset',
  'mobile-auto-sprint', 'mobile-aim-mode', 'mobile-scale', 'mobile-opacity',
  'mobile-layout-toolbar', 'mobile-layout-done', 'orientation-overlay', 'reward-confirm'
]) assert.ok(ids.includes(id), `모바일 UI 요소 #${id} 누락`);

for (const control of ['fireLeft','fire','adsFire','aim','jump','sprint','reload','heal','weapon','pause']) {
  assert.match(html, new RegExp(`data-control="${control}"`), `${control} 터치키 누락`);
}

assert.match(html, /viewport-fit=cover/, '노치 안전 영역용 viewport-fit 누락');
assert.match(css, /body\.mobile-device\.mobile-playing \.mobile-controls/, '플레이 중 모바일 조작계 표시 규칙 누락');
assert.match(css, /@media \(orientation: portrait\).*pointer: coarse/s, '세로 화면 회전 안내 규칙 누락');
assert.match(game, /screen\.orientation\?\.lock\?\.\('landscape'\)/, '가로 화면 잠금 요청 누락');
assert.match(game, /bhfps_mobile_controls_v45/, 'v45 모바일 키·배치 저장 키 누락');
assert.match(game, /updateDraggedPosition\(control, event\.clientX, event\.clientY\)/, '터치키 드래그 배치 누락');
assert.match(game, /this\.joystickSprint = sprintNext/, '스틱 밀기 자동 달리기 누락');
assert.match(game, /dragLook: action === 'fire' \|\| action === 'adsFire'/, '발사 버튼 드래그 조준 누락');
assert.doesNotMatch(game, /aimEdgeTurn\(/, '모바일 자동 가장자리 회전이 남아 있으면 발사 중 우측 쏠림이 재발할 수 있음');
assert.doesNotMatch(game, /horizontalPps|verticalPps|applyEdgeTurn/, '모바일 연속 자동 회전 로직이 제거돼야 함');
assert.match(game, /this\.mobile\?\.update\(dt\);[\s\S]*this\.handleInput\(dt\);/, '모바일 입력 업데이트 호출 순서가 유지돼야 함');
assert.match(game, /dx \* this\.sensitivity \* 1\.06, dy \* this\.sensitivity \* 1\.06/, '발사 드래그 양축 감도 보강 누락');
assert.match(game, /held\('fire'\) \|\| held\('adsFire'\)/, 'ADS 동시 발사 처리 누락');
assert.match(game, /시점 변화는 실제 드래그 거리만 사용한다/, '발사 드래그가 실제 이동량만 사용해야 함');
assert.match(game, /suppressClick = gesture\.dragged \|\| scrolled > 2/, '생존·스토리 시작 버튼 스크롤 오입력 방지 누락');
assert.match(css, /body\.mobile-device \.panel \{[\s\S]*touch-action: pan-y/, '모바일 메뉴 세로 스크롤 허용 규칙 누락');
assert.match(css, /--mobile-scale/, '터치키 크기 조절 스타일 누락');
assert.match(css, /--mobile-opacity/, '터치키 투명도 조절 스타일 누락');
assert.match(css, /v46: 모바일 가로 화면용 반응형 메뉴/, '모바일 메뉴·설정 반응형 규칙 누락');
assert.match(css, /body\.mobile-device \.reward-panel[\s\S]*width: min\(700px, 88dvw\)/, '모바일 업그레이드 팝업 축소 규칙 누락');
assert.match(css, /body\.mobile-device \.reward-choices \{ grid-template-columns: repeat\(3/, '모바일 보상 카드 3열 배치 누락');
assert.match(game, /usesMobileRewardConfirmation\(\)/, '모바일 보상 확인 단계 감지 누락');
assert.match(game, /this\.pendingReward = reward/, '모바일 보상 선택 상태 누락');
assert.match(game, /confirmRewardSelection\(\)[\s\S]*this\.chooseReward\(this\.pendingReward\)/, '업그레이드 적용 버튼 확인 로직 누락');
assert.match(game, /if \(this\.usesMobileRewardConfirmation\(\)\) this\.selectReward\(r, btn\)/, '모바일에서 카드 터치가 즉시 적용되지 않음이 보장돼야 함');

assert.equal(manifest.orientation, 'landscape', '웹 앱 매니페스트는 가로 고정이어야 함');
assert.equal(manifest.display, 'fullscreen', '웹 앱 매니페스트는 전체 화면이어야 함');
assert.ok(manifest.icons.some(icon => icon.sizes === '256x256'), '홈 화면용 256px 아이콘 누락');
for (const icon of manifest.icons) {
  assert.ok(fs.existsSync(path.join(root, 'client', icon.src)), `매니페스트 아이콘 누락: ${icon.src}`);
}

console.log('mobile controls regression tests: passed');
