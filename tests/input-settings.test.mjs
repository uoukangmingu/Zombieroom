import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'client/game.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'client/index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'client/style.css'), 'utf8');

function extractClass(name) {
  const start = source.indexOf(`class ${name} {`);
  assert.notEqual(start, -1, `${name} 클래스를 찾을 수 없음`);
  const body = source.indexOf('{', start);
  let depth = 0, quote = '', escaped = false, lineComment = false, blockComment = false;
  for (let i = body; i < source.length; i++) {
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
    else if (ch === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`${name} 클래스 본문이 닫히지 않음`);
}

const listeners = () => ({
  events: new Map(),
  addEventListener(type, callback) {
    const group = this.events.get(type) || [];
    group.push(callback);
    this.events.set(type, group);
  },
  dispatch(type, event = {}) { for (const callback of this.events.get(type) || []) callback(event); }
});
const windowMock = listeners();
const documentMock = Object.assign(listeners(), { pointerLockElement: null, hidden: false });
const domMock = Object.assign(listeners(), { requestPointerLock() {} });
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const defaults = {
  forward:'KeyW', backward:'KeyS', left:'KeyA', right:'KeyD', jump:'Space', sprint:'ShiftLeft',
  fire:'Mouse0', aim:'Mouse2', reload:'KeyR', heal:'KeyE', weapon1:'Digit1', weapon2:'Digit2',
  weapon3:'Digit3', weapon4:'Digit4', weapon5:'Digit5', weapon6:'Digit6', weapon7:'Digit7', weapon8:'Digit8'
};
const Input = Function('DEFAULT_BINDINGS', 'clamp', 'window', 'document', `return (${extractClass('Input')});`)(defaults, clamp, windowMock, documentMock);

{
  const input = new Input(domMock);
  input.setBindings({ forward:'KeyI', fire:'Mouse2', aim:'Mouse0' });
  input.keys.add('KeyI');
  assert.equal(input.actionDown('forward'), true, '변경된 이동 키를 읽어야 함');
  assert.equal(input.actionDown('backward'), false, '누르지 않은 동작은 꺼져 있어야 함');
  input.mouse.right = true;
  assert.equal(input.actionDown('fire'), true, '마우스 버튼도 사용자 바인딩을 따라야 함');
  assert.equal(input.consumeAction('fire'), true, '단발 동작을 소비할 수 있어야 함');
  assert.equal(input.mouse.right, false, '소비된 마우스 입력은 초기화돼야 함');
  input.setVirtualAction('jump', true);
  assert.equal(input.actionDown('jump'), true, '모바일 가상 동작은 키 변경과 독립적으로 동작해야 함');
  input.setVirtualAction('jump', false);
  assert.equal(input.actionDown('jump'), false, '모바일 가상 동작 해제가 반영돼야 함');
  input.locked = true;
  input.setMouseSensitivity(1.5);
  domMock.dispatch('mousemove', { movementX: 10, movementY: -4 });
  assert.deepEqual(input.consumeMouse(), { dx:15, dy:-6 }, '물리 마우스 감도가 이동량에 적용돼야 함');

  input.lookBlockedUntil = 0;
  domMock.dispatch('mousemove', { movementX: 5000, movementY: -3500 });
  assert.deepEqual(input.consumeMouse(), { dx:0, dy:0 }, '포인터락 복귀 뒤 비정상 마우스 스파이크는 폐기해야 함');

  input.lookBlockedUntil = 0;
  domMock.dispatch('mousemove', { movementX: 500, movementY: -500 });
  assert.deepEqual(input.consumeMouse(), { dx:165, dy:-165 }, '큰 정상 입력은 이벤트 단위 제한값으로 완화해야 함');

  input.lookBlockedUntil = 0;
  domMock.dispatch('mousemove', { movementX: 500, movementY: 0 });
  domMock.dispatch('mousemove', { movementX: 500, movementY: 0 });
  assert.deepEqual(input.consumeMouse(), { dx:260, dy:0 }, '한 프레임 누적 회전량은 안전 상한을 넘으면 안 됨');
}

for (const id of [
  'loading-screen', 'loading-status', 'loading-bar', 'controls-settings-start', 'controls-settings-pause',
  'controls-settings-screen', 'key-binding-list', 'pause-mouse-sensitivity', 'controls-mouse-sensitivity',
  'pause-input-mode-select', 'mobile-input-mode-select', 'mobile-settings-input-mode-select', 'main-menu-button',
  'fullscreen-start', 'fullscreen-pause', 'fullscreen-controls', 'fullscreen-mobile'
]) assert.match(html, new RegExp(`id="${id}"`), `#${id} UI 누락`);

assert.match(html, /id="loading-screen" class="loading-screen show"/, '게임 실행 직후 로딩 화면이 먼저 보여야 함');
assert.doesNotMatch(html, /id="start-screen" class="panel show"/, '메인 메뉴가 로딩 화면보다 먼저 보이면 안 됨');
assert.match(css, /\.loading-screen\.show/, '로딩 화면 표시 스타일 누락');
assert.match(source, /requestReturnToMainMenu\(\)/, '메인 메뉴 복귀 로직 누락');
assert.match(source, /window\.location\.reload\(\)/, '메인 복귀 시 최초 실행 상태 재시작 누락');
assert.match(source, /toggleFullscreen\(\)/, '전체화면 전환 로직 누락');
assert.match(source, /const canRecover = p\.grounded && !wantsSprint/, '정지 중 스태미너 회복 조건 누락');
assert.match(source, /stationary \? 1\.12 : 1/, '정지 시 걷기보다 빠른 스태미너 회복 누락');
assert.match(source, /bhfps_input_settings_v44/, '키 설정 영구 저장 누락');
assert.match(css, /\.settings-button\.accent/, '설정 버튼 공통 디자인 누락');

for (const [name, expected] of [['boxhead-icon-64.png',64], ['boxhead-icon-256.png',256]]) {
  const png = fs.readFileSync(path.join(root, 'client/assets', name));
  assert.equal(png.readUInt32BE(16), expected, `${name} 너비 오류`);
  assert.equal(png.readUInt32BE(20), expected, `${name} 높이 오류`);
}
const ico = fs.readFileSync(path.join(root, 'BOXHEAD.ico'));
assert.equal(ico.readUInt16LE(0), 0, 'ICO 예약 헤더 오류');
assert.equal(ico.readUInt16LE(2), 1, 'Windows ICO 형식이 아님');
assert.ok(ico.readUInt16LE(4) >= 6, 'Windows ICO에 필요한 다중 해상도가 부족함');

console.log('input settings, loading, menu and icon regression tests: passed');
