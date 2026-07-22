(() => {
  'use strict';
  const BUILD = '59.0';
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const now = () => performance.now() / 1000;

  const missionNarrative = {
    1: [
      { rationale:'격리동 방폭 셔터는 중앙 중계 허브의 생체 인증 없이는 열리지 않는다. 먼저 허브까지 안전한 작업 동선을 만들어야 한다.', outcome:'허브 전면이 확보됐다. 이제 격리동을 봉쇄한 방폭 셔터의 인증 회로에 접근할 수 있다.' },
      { rationale:'셔터 너머는 사고 당시 생존자를 격리하기 위해 물리적으로 분리된 구역이다. 허브를 복구해야 유일한 통로의 잠금핀이 해제된다.', outcome:'중계 허브가 격리동의 생체 인증을 복원했다. 방폭 셔터가 올라가며 오세현에게 가는 유일한 길이 열린다.' },
      { rationale:'오세현은 B동 출입코드와 사고 당시 봉쇄 절차를 아는 유일한 생존자다. 그를 잃으면 다음 구역으로 진행할 근거와 경로가 모두 끊긴다.', outcome:'오세현이 후방 구조선에 도착했다. 그가 제공한 수기 출입코드로 B동 물류축 접근 권한이 확보됐다.' }
    ],
    2: [
      { rationale:'기록 장치는 공진 노이즈 때문에 무선 전송이 불가능하며, 충격을 받으면 좌표 데이터가 손상된다. 그래서 플레이어가 물리적으로 운반해야 한다.', outcome:'차폐 케이스가 분석 플랫폼에 고정됐다. 선발대가 남긴 감염 주파수와 C동 좌표를 복원할 수 있다.' },
      { rationale:'분석 플랫폼이 기록 케이스를 읽는 동안 고주파 신호가 발생해 폭발형 잔향 개체를 끌어당긴다. 방어는 분석 시간을 확보하기 위한 필수 절차다.', outcome:'플랫폼 분석이 완료됐다. 폭발형 개체가 고주파 장비를 우선 공격한다는 행동 규칙도 확인됐다.' },
      { rationale:'B동의 긴 물류축은 과부하를 막기 위해 세 개의 독립 전력 링으로 나뉘어 있다. 하나라도 꺼져 있으면 좌표 지도와 다음 방화문이 작동하지 않는다.', outcome:'세 전력 링이 동기화됐다. C동 공간 고정로의 좌표와 안전 진입 시간이 지도에 표시된다.' }
    ],
    3: [
      { rationale:'고정 코어는 단순 발전기가 아니라 벽과 통로의 좌표를 붙잡는 닻이다. 외곽 코어를 먼저 끊어야 제어반이 현실 좌표에 고정된다.', outcome:'외곽 위상 압력이 낮아졌다. 동·서 제어반이 같은 시간축에 머물기 시작한다.' },
      { rationale:'한쪽 인증만으로 문을 열면 복제된 통로가 충돌한다. 두 제어반을 모두 작동시켜 현재 좌표가 하나임을 증명해야 한다.', outcome:'양측 인증값이 일치했다. 중앙 격리문이 실제 좌표에 고정되며 통로가 열린다.' },
      { rationale:'중앙 코어가 살아 있는 동안 출구는 여러 복제본으로 갈라져 어느 문도 실제 D동에 닿지 않는다. 코어를 제거해야 경로가 하나로 수렴한다.', outcome:'복제 통로가 하나의 출구로 수렴했다. D동 아틀라스 기록보관구역의 좌표가 고정된다.' }
    ],
    4: [
      { rationale:'D동의 방들은 기록을 읽는 순서에 따라 시간이 달라진다. 세 기준점을 동시에 고정해야 스캐너가 같은 문서를 한 시점의 자료로 해석할 수 있다.', outcome:'세 비콘이 하나의 시간축을 형성했다. 기록실의 문 번호와 내부 좌표가 더 이상 바뀌지 않는다.' },
      { rationale:'왜곡 코어는 오래된 문서 내용을 실제 벽과 문으로 투사해 비콘 좌표를 계속 오염시킨다. 제거하지 않으면 스캐너가 거짓 기록실로 이동한다.', outcome:'기록 투사가 멈췄다. 아틀라스 스캐너가 핵심 기록실까지 안전한 단일 경로를 계산한다.' },
      { rationale:'동기화 비콘은 백룸의 시간 왜곡과 반대되는 강한 기준 신호를 낸다. 시설에 고정된 잔향 개체는 그 신호를 파괴하려 몰려든다.', outcome:'비콘 동기화가 완료됐다. 이동식 스캐너가 시간축을 잃지 않고 핵심 기록실로 출발할 수 있다.' },
      { rationale:'핵심 기록은 네트워크에서 분리된 필름 보관실에만 남아 있다. 스캐너가 직접 이동해 판독해야 하며, 이동 중 비콘 신호를 따라야 길을 잃지 않는다.', outcome:'스캐너가 한민석의 최종 보고서를 복원했다. 모든 송출이 E-00 JANUS 코어에서 시작된다는 사실이 확인된다.' }
    ],
    5: [
      { rationale:'코어실 방벽은 물리 문이 아니라 압력과 주파수로 유지되는 장막이다. 세 유로를 모두 열어야 장막이 무너질 만큼 압력이 낮아진다.', outcome:'외곽 압력이 분산됐다. 코어실 방벽이 낮아지며 증폭기 구역으로 진입할 수 있다.' },
      { rationale:'네 증폭기는 형광등 주파수를 각 구역에 재송출해 잔향 개체를 하나의 군집으로 묶는다. 먼저 끊어야 중앙 코어와 균열술사가 약해진다.', outcome:'구역 송출이 끊기며 잔향 군집의 동기화가 무너졌다. 중앙 코어의 비상 정전 절차가 시작된다.' },
      { rationale:'증폭기 파괴로 코어가 냉각을 위해 조명을 끈다. 시야는 나빠지지만 감염 개체를 조율하던 주파수도 약해지는 유일한 진입 시간이다.', outcome:'정전 구역이 확보됐다. 중앙 코어가 직접 방어 개체인 균열술사를 깨운다.' },
      { rationale:'균열술사는 코어의 자동 복구 판단을 수행하는 살아 있는 관리자다. 코어만 손상시키면 그가 다시 기동하므로 둘의 연결을 전투로 끊어야 한다.', outcome:'관리자 신호가 소멸했다. JANUS 코어의 자동 복구가 멈추고 백룸 전역의 감염 송출이 약해진다.' }
    ]
  };

  function apply() {
    const seed = window.__game;
    if (!seed || seed.__v59PatchApplied) return;
    if (seed.build === BUILD) return; // A freshly rebuilt v59 source already contains these changes.
    const proto = Object.getPrototypeOf(seed);
    seed.__v59PatchApplied = true;
    proto.__v59PatchApplied = true;

    const Vector3 = seed.camera.position.constructor;
    const Quaternion = seed.camera.quaternion.constructor;
    const Matrix4 = seed.camera.matrix.constructor;

    proto.isStoryCinematicLineClear = function(from, targetPoint, target = null) {
      if (!from || !targetPoint) return false;
      const dx = targetPoint.x - from.x, dz = targetPoint.z - from.z;
      const length = Math.hypot(dx, dz);
      if (length < .35) return true;
      const nx = dx / length, nz = dz / length;
      for (const obstacle of this.obstacles || []) {
        if (!obstacle?.alive) continue;
        if (target?.obstacle === obstacle || target?.collider === obstacle) continue;
        if (Math.hypot((obstacle.x || 0) - targetPoint.x, (obstacle.z || 0) - targetPoint.z) < Math.max(obstacle.w || 0, obstacle.d || 0) * .55 + .45) continue;
        const hit = this.rayAabb2D(from.x, from.z, nx, nz,
          obstacle.x - obstacle.w / 2 - .08, obstacle.z - obstacle.d / 2 - .08,
          obstacle.x + obstacle.w / 2 + .08, obstacle.z + obstacle.d / 2 + .08);
        if (hit !== null && hit > .08 && hit < length - .58) return false;
      }
      return true;
    };

    proto.getStoryCinematicCameraPose = function(target, force = false) {
      if (!target || !Number.isFinite(target.x) || !Number.isFinite(target.z) || !this.player || !this.map) return null;
      const targetPoint = new Vector3(target.x, Number(target.y) || (target.role === 'survivor' ? 1.25 : 1.5), target.z);
      const playerEye = new Vector3(this.player.x, this.getEyeY(), this.player.z);
      const distance = Math.hypot(target.x - this.player.x, target.z - this.player.z);
      const visible = this.isStoryCinematicLineClear(playerEye, targetPoint, target);
      if (!force && !target.forceCutaway && visible && distance < 10.5) return null;
      const baseAngle = Math.atan2(this.player.z - target.z, this.player.x - target.x);
      const angles = [baseAngle, baseAngle + Math.PI/2, baseAngle - Math.PI/2, baseAngle + Math.PI, 0, Math.PI/2, Math.PI, -Math.PI/2];
      const half = this.map.size / 2 - 1.2;
      let best = null;
      for (const radius of [5.6, 7.2, 4.4]) for (const height of [3.45, 4.15, 2.75]) for (const angle of angles) {
        const position = new Vector3(target.x + Math.cos(angle) * radius, height, target.z + Math.sin(angle) * radius);
        if (Math.abs(position.x) > half || Math.abs(position.z) > half || this.collides(position.x, position.z, .34)) continue;
        if (!this.isStoryCinematicLineClear(position, targetPoint, target)) continue;
        const score = position.distanceToSquared(playerEye) + Math.abs(height - 3.45) * 2.2;
        if (!best || score < best.score) best = { position, score };
      }
      if (!best) return null;
      const matrix = new Matrix4().lookAt(best.position, targetPoint, new Vector3(0, 1, 0));
      return { position:best.position, quaternion:new Quaternion().setFromRotationMatrix(matrix), targetPoint, label:target.cameraLabel || target.label || '시설 감시 카메라' };
    };

    const originalGetMission = proto.getMissionForWave;
    proto.getMissionForWave = function(w) {
      const mission = originalGetMission.call(this, w);
      if (this.runMode === 'story') Object.assign(mission, missionNarrative[this.storyChapter?.id]?.[Math.max(0, Number(w) - 1)] || {});
      return mission;
    };

    const originalSetup = proto.setupStoryEnvironment;
    proto.setupStoryEnvironment = function() {
      originalSetup.call(this);
      if (this.runMode !== 'story' || this.storyChapter?.id !== 1 || this.__v59Chapter1GateBuilt) return;
      this.__v59Chapter1GateBuilt = true;
      // Move the insertion point to the relay side. Extraction remains at the same coordinate.
      this.player.x = -22; this.player.z = -24; this.player.vx = 0; this.player.vz = 0;
      const left = this.addObstacle(-14, -10, 48, 1.35, 'storyPartition');
      const right = this.addObstacle(28, -10, 20, 1.35, 'storyPartition');
      for (const wall of [left, right]) {
        wall.storyDecor = true;
        if (wall.mesh && this.storyMats?.steel) wall.mesh.material = this.storyMats.steel;
      }
      const door = (this.storyObjects || []).find(o => o.role === 'blastDoor' && o.door);
      if (door) {
        this.moveStoryObjectTo?.(door, 14, -10);
        if (door.doorVisual?.position) { door.doorVisual.position.x = 14; door.doorVisual.position.z = -10; }
        Object.assign(door, {
        label:'격리동 방폭 셔터', forceCutaway:true, cameraLabel:'A-01 격리 셔터 CCTV',
        purpose:'사고 당시 응급 격리동을 나머지 시설과 완전히 분리한 유일 출입구다.',
        result:'중계 허브 인증 후 셔터가 상승해 오세현이 있는 북측 격리동으로 가는 길을 연다.'
        });
      }
      const relay = (this.storyObjects || []).find(o => o.role === 'relay');
      if (relay) Object.assign(relay, { forceCutaway:true, cameraLabel:'A-01 중앙 허브 CCTV', purpose:'격리동 방폭 셔터의 생체 인증과 전력 잠금을 동시에 관리한다.' });
      const survivor = (this.storyObjects || []).find(o => o.role === 'survivor');
      if (survivor) {
        this.moveStoryObjectTo?.(survivor, 24, 30);
        Object.assign(survivor, { forceCutaway:true, cameraLabel:'응급 격리동 CCTV', purpose:'B동 출입코드와 JANUS 봉쇄 절차를 기억하는 유일한 생존자다.' });
      }
      this.collisionIndexDirty = true;
      this.markNavDirty();
      this.ensureStoryPlayerClearance();
    };

    const originalEnsureOverlay = proto.ensureStoryOverlay;
    proto.ensureStoryOverlay = function() {
      originalEnsureOverlay.call(this);
      const overlay = document.getElementById('story-action-overlay');
      if (!overlay || overlay.querySelector('#story-action-reason')) return;
      const reason = document.createElement('small');
      reason.id = 'story-action-reason';
      reason.style.cssText = 'display:block;margin-top:4px;color:#b9d3d8;font:600 10px/1.35 system-ui;letter-spacing:0;max-width:480px';
      overlay.insertBefore(reason, overlay.querySelector('span'));
    };

    const originalInteraction = proto.updateStoryInteractionInput;
    proto.updateStoryInteractionInput = function(dt) {
      const result = originalInteraction.call(this, dt);
      const reason = document.getElementById('story-action-reason');
      if (reason) {
        const target = this.storyInteractionTarget || this.nearestStoryObject?.();
        reason.textContent = target?.purpose || this.currentMission?.rationale || '';
        reason.style.display = reason.textContent ? 'block' : 'none';
      }
      return result;
    };

    const originalActivate = proto.activateStoryMissionObjects;
    proto.activateStoryMissionObjects = function() {
      originalActivate.call(this);
      const mission = this.currentMission;
      if (!mission?.rationale) return;
      const copy = `${mission.hud || mission.label} · 작전 근거: ${mission.rationale}`;
      const clip = this.storyCinematicQueue?.findLast?.(c => c.title === 'MISSION UPDATE') || (this.storyCinematicState?.title === 'MISSION UPDATE' ? this.storyCinematicState : null);
      if (clip) clip.copy = copy;
      const copyEl = document.getElementById('story-cinematic-copy');
      if (this.storyCinematicState?.title === 'MISSION UPDATE' && copyEl) copyEl.textContent = copy;
    };

    const originalCompleteInteraction = proto.completeStoryInteraction;
    proto.completeStoryInteraction = function(object) {
      originalCompleteInteraction.call(this, object);
      if (object?.role !== 'relay') return;
      const door = (this.storyObjects || []).find(o => o.role === 'blastDoor' && o.door);
      if (door) {
        door.forceCutaway = true;
        this.storyCinematicQueue = (this.storyCinematicQueue || []).filter(c => !['격리실 잠금 해제', `${object.label} 작동`].includes(c.title));
        const current = this.storyCinematicState;
        if (current) {
          current.title = '격리동 방폭 셔터 개방';
          current.copy = '중계 허브의 생체 인증이 복구됐다. 북측 격리동으로 향하는 유일 통로가 열린다.';
          current.target = door;
          current.cutawayPose = this.getStoryCinematicCameraPose(door, true);
          document.getElementById('story-cinematic-title').textContent = current.title;
          document.getElementById('story-cinematic-copy').textContent = current.copy;
        } else {
          this.playStoryMotion('격리동 방폭 셔터 개방', '중계 허브의 생체 인증이 복구됐다. 북측 격리동으로 향하는 유일 통로가 열린다.', door, 'info');
        }
        this.queueDialogue?.('격리국 관제|셔터 너머 격리동의 구조 신호를 확인했다. 이제 오세현에게 접근할 수 있다.', { delay:.35 });
      }
    };

    const originalStartCinematic = proto.startStoryCinematicClip;
    proto.startStoryCinematicClip = function(clip) {
      originalStartCinematic.call(this, clip);
      const state = this.storyCinematicState;
      if (!state?.target) return;
      state.cutawayPose = this.getStoryCinematicCameraPose(state.target, !!state.target.forceCutaway || !!state.target.door);
      state.cutawayActive = false;
      const el = document.getElementById('story-cinematic');
      el?.classList.toggle('cctv-feed', !!state.cutawayPose);
      if (el) el.dataset.cameraLabel = state.cutawayPose?.label || 'R-07 헬멧 카메라';
    };

    const originalUpdateCinematic = proto.updateStoryCinematic;
    proto.updateStoryCinematic = function(dt) {
      const before = this.storyCinematicState;
      originalUpdateCinematic.call(this, dt);
      const state = this.storyCinematicState;
      if (!state || state !== before || !state.cutawayPose) return;
      const progress = clamp(state.elapsed / state.duration, 0, 1);
      state.cutawayActive = progress >= .10 && progress <= .86;
      document.getElementById('story-cinematic')?.classList.toggle('cctv-switch', progress < .15 || progress > .82);
    };

    const originalUpdateCamera = proto.updateCamera;
    proto.updateCamera = function(dt = 0) {
      originalUpdateCamera.call(this, dt);
      const pose = this.storyCinematicState?.cutawayActive && this.storyCinematicState?.cutawayPose;
      if (pose) {
        this.camera.position.copy(pose.position);
        this.camera.quaternion.copy(pose.quaternion);
        if (Math.abs(this.camera.fov - 58) > .02) { this.camera.fov = 58; this.camera.updateProjectionMatrix(); }
      }
      if (this.viewWeapon) this.viewWeapon.visible = !pose;
    };

    const originalFinishCinematic = proto.finishStoryCinematicClip;
    proto.finishStoryCinematicClip = function() {
      originalFinishCinematic.call(this);
      if (!this.storyCinematicState) {
        document.getElementById('story-cinematic')?.classList.remove('cctv-feed','cctv-switch');
        if (this.viewWeapon) this.viewWeapon.visible = true;
      }
    };

    const originalClearStory = proto.clearStoryRuntimeState;
    proto.clearStoryRuntimeState = function(...args) {
      const result = originalClearStory.apply(this, args);
      document.getElementById('story-cinematic')?.classList.remove('cctv-feed','cctv-switch');
      if (this.viewWeapon) this.viewWeapon.visible = true;
      this.__v59Chapter1GateBuilt = false;
      return result;
    };

    const originalFinishMission = proto.finishMissionWave;
    proto.finishMissionWave = function(title) {
      const outcome = this.currentMission?.outcome;
      const result = originalFinishMission.call(this, title);
      if (this.runMode === 'story' && outcome) {
        this.showCenterAlert?.('작전 결과', outcome, 'info', 2.8);
        this.playStoryMotion?.('작전 결과', outcome, null, 'info');
      }
      return result;
    };

    seed.build = BUILD;
    document.documentElement.dataset.boxheadBuild = BUILD;
  }

  if (window.__game) apply();
  else addEventListener('DOMContentLoaded', apply, { once:true });
})();
