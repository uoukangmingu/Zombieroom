(() => {
  'use strict';
  const BUILD = '61.0';
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const missionChains = {
    1: [
      {
        fieldBrief: '구조 신호는 북측 격리동에서 나오지만 방폭 셔터가 유일한 통로를 막고 있다. 먼저 허브 앞 감염체를 제거해 인증 장치까지 접근한다.',
        handoff: '허브 전면을 확보했다. 살아 있는 구조 신호를 확인하려면 중앙 중계 허브의 생체 인증을 되살려야 한다.'
      },
      {
        fieldBrief: '소탕으로 작업 공간이 확보됐다. 중앙 허브를 재기동하면 사고 당시 내려온 셔터의 잠금핀과 격리동 조명이 함께 복구된다.',
        handoff: '셔터가 실제로 열렸다. 초소 내부에서 불규칙한 생체 신호와 감염체 충돌음이 동시에 잡힌다.'
      },
      {
        fieldBrief: '개방된 길 끝의 경비 초소에서 생존 반응이 확인된다. 감염체를 밀어내고 오세현의 신원을 확인한 뒤 후방 구조선으로 호위한다.',
        handoff: '오세현이 B동 수기 출입코드와 사고 당시 봉쇄 절차를 제공했다. 다음 작전의 근거와 진입 경로가 확보됐다.'
      }
    ],
    2: [
      {
        fieldBrief: '오세현의 수기 코드가 선발대의 차폐 화물을 가리킨다. 공진 노이즈가 무선 전송을 막으므로 케이스를 분석 플랫폼까지 직접 옮겨야 한다.',
        handoff: '화물이 플랫폼에 고정됐다. 판독 신호가 시작되면서 그 주파수에 반응하는 폭발형 잔향 개체가 물류축으로 몰려든다.'
      },
      {
        fieldBrief: '플랫폼이 좌표 데이터를 읽는 동안 고주파가 계속 발생한다. 장비가 파괴되면 선발대 기록과 C동 좌표를 함께 잃는다.',
        handoff: '분석은 끝났지만 좌표 지도를 출력할 전력이 없다. 분리된 세 전력 링을 모두 복구해야 다음 방화문이 작동한다.'
      },
      {
        fieldBrief: '세 발전기는 서로 다른 물류 구간을 담당한다. 한 구간이라도 빠지면 C동 좌표가 끊겨 잘못된 통로로 연결된다.',
        handoff: '전력 링이 동기화되어 C동 고정로의 좌표와 안전 진입 시간이 출력됐다.'
      }
    ],
    3: [
      {
        fieldBrief: 'C동 외곽 코어가 벽과 제어반을 서로 다른 위상에 붙잡고 있다. 외곽 닻부터 끊어야 중앙문 제어기가 같은 공간에 나타난다.',
        handoff: '외곽 위상 압력이 낮아져 동·서 제어반이 동시에 유지된다. 이제 두 인증값을 맞춰 중앙 격리문을 열 수 있다.'
      },
      {
        fieldBrief: '동·서 제어반은 복제 통로가 하나의 좌표인지 교차 확인한다. 두 장치를 모두 인증하지 않으면 문 뒤 공간이 충돌한다.',
        handoff: '중앙 격리문이 실제 좌표에 고정됐다. 문 너머의 주 고정로가 D동으로 가는 출구를 여러 복제본으로 갈라놓고 있다.'
      },
      {
        fieldBrief: '마지막 고정 코어들은 열린 중앙 구역의 구조물에 연결돼 있다. 모두 파괴해야 복제된 출구가 하나의 D동 통로로 수렴한다.',
        handoff: '복제 통로가 하나로 합쳐졌고 D동 아틀라스 기록보관구역의 좌표가 안정됐다.'
      }
    ],
    4: [
      {
        fieldBrief: 'D동 진입 전실만 현재 시간축에 남아 있다. 세 기록실에 좌표 비콘을 설치해 흩어진 서고를 같은 시점으로 묶어야 한다.',
        handoff: '세 비콘이 기준 시간축을 만들었다. 그 신호를 덮어쓰는 기록 왜곡 코어의 위치가 드러난다.'
      },
      {
        fieldBrief: '왜곡 코어가 과거 문서 내용을 벽과 문처럼 투사해 좌표를 오염시킨다. 코어를 제거해야 스캐너가 거짓 서고로 진입하지 않는다.',
        handoff: '기록 투사가 멈췄다. 비콘이 최종 동기화를 시작하면서 기준 신호를 파괴하려는 잔향 개체가 몰려든다.'
      },
      {
        fieldBrief: '비콘은 시간 왜곡과 반대되는 강한 기준 신호를 낸다. 동기화가 끝날 때까지 비콘망과 스캐너 도킹 전력을 지켜야 한다.',
        handoff: '시간축 동기화가 완료됐다. 대기 중이던 아틀라스 스캐너가 도킹을 해제하고 핵심 기록실로 이동할 수 있다.'
      },
      {
        fieldBrief: '핵심 보고서는 네트워크와 분리된 필름 보관실에 있다. 스캐너를 고정된 좌표선 안에서 호위해야 최종 보고서를 직접 판독할 수 있다.',
        handoff: '한민석의 최종 보고서가 복원됐다. 모든 감염 송출이 E-00 JANUS 코어에서 시작된다는 사실이 확인됐다.'
      }
    ],
    5: [
      {
        fieldBrief: 'E-00 방벽은 문이 아니라 공진 압력으로 유지된다. 세 외곽 밸브를 모두 열어 압력을 분산해야 증폭기 구역으로 진입할 수 있다.',
        handoff: '공진 압력이 낮아지고 중앙 방벽이 열렸다. 사방의 증폭기가 잔향 개체를 하나의 군집으로 묶어 코어를 보호하고 있다.'
      },
      {
        fieldBrief: '네 증폭기는 각 구역 형광등 주파수를 재송출한다. 모두 파괴해야 코어의 군집 통제와 자동 복구 능력이 약해진다.',
        handoff: '증폭망이 끊기자 코어가 냉각을 위해 비상 정전에 들어갔다. 시야는 나빠지지만 송출도 약해지는 유일한 진입 시간이다.'
      },
      {
        fieldBrief: '정전 동안 잔향 개체의 동기화가 느슨해졌다. 중앙 제어권을 확보하면 코어가 마지막 관리자 개체를 강제로 깨울 것이다.',
        handoff: '중앙 제어권을 확보했다. JANUS가 한민석의 판단 패턴과 결합된 균열술사를 최종 방어 수단으로 기동한다.'
      },
      {
        fieldBrief: '균열술사는 코어의 살아 있는 복구 관리자다. 그 연결을 끊지 않으면 손상된 송출망과 코어가 다시 기동한다.',
        handoff: '관리자 신호와 자동 복구가 함께 정지했다. 백룸 전역의 감염 송출이 약해지기 시작한다.'
      }
    ]
  };

  const objectNarrative = {
    2: {
      cargo: [
        '공진 차폐 케이스다. 무선 신호가 통하지 않아 분석 플랫폼까지 직접 옮겨야 한다.'
      ],
      generator: [
        '서측 화물 레일과 좌표 프린터 전원을 복구한다.',
        '중앙 분석 플랫폼과 통신 중계 전원을 복구한다.',
        '북측 방화문과 C동 좌표 송신 전원을 복구한다.'
      ]
    },
    3: {
      blastDoor: [
        '서측 제어반은 복제 통로의 서쪽 좌표를 인증한다.',
        '동측 제어반은 복제 통로의 동쪽 좌표를 인증한다.'
      ]
    },
    4: {
      beacon: [
        '과거 시점으로 밀린 남서 기록실을 현재 좌표에 고정한다.',
        '반복 재생 중인 동측 서고의 시간 기준점을 고정한다.',
        '핵심 필름 보관실로 이어지는 북측 좌표를 고정한다.'
      ],
      scanner: [
        '비콘 동기화가 끝난 뒤에만 도킹을 해제한다. 네트워크와 분리된 필름 기록을 현장에서 직접 판독한다.'
      ]
    },
    5: {
      citadelDoor: [
        '서측 유로의 공진 압력을 배출한다.',
        '중앙 냉각 유로의 압력을 배출한다.',
        '동측 송출 유로의 공진 압력을 배출한다.'
      ],
      machine: [
        '서측 구역의 잔향 군집을 동기화하는 증폭기다.',
        '동측 구역의 잔향 군집을 동기화하는 증폭기다.',
        '남측 물류축으로 주파수를 재송출하는 증폭기다.',
        '북측 기록동으로 주파수를 재송출하는 증폭기다.'
      ]
    }
  };

  const corePlans = {
    '3:1': [[-26,-21],[26,-21]],
    '3:3': [[-26,21],[0,31],[26,21]],
    '4:2': [[-31,-20],[13,7],[32,-27]],
    '5:2': [[-36,0],[36,0],[0,-36],[0,36]]
  };

  function apply() {
    const seed = window.__game;
    if (!seed || seed.__v61PatchApplied) return;
    if (seed.build === BUILD) return;
    const proto = Object.getPrototypeOf(seed);
    seed.__v61PatchApplied = true;
    proto.__v61PatchApplied = true;

    const previousGetMission = proto.getMissionForWave;
    proto.getMissionForWave = function(w) {
      const mission = previousGetMission.call(this, w);
      if (this.runMode === 'story') {
        const chain = missionChains[this.storyChapter?.id]?.[Math.max(0, Number(w) - 1)];
        if (chain) Object.assign(mission, chain);
      }
      return mission;
    };

    proto.applyStoryObjectNarrative = function() {
      const chapter = this.storyChapter?.id;
      const chapterNarrative = objectNarrative[chapter];
      if (!chapterNarrative) return;
      for (const [role, lines] of Object.entries(chapterNarrative)) {
        const objects = (this.storyObjects || []).filter(o => o.role === role && !o.door);
        objects.forEach((o, i) => {
          const purpose = lines[Math.min(i, lines.length - 1)];
          if (purpose) o.purpose = purpose;
          if (!o.result) o.result = `${o.label}의 작업 결과가 다음 작전 단계에 반영됐다.`;
        });
      }
    };

    proto.placeChapterFourPlayerSafely = function() {
      if (!this.player || this.storyChapter?.id !== 4) return false;
      const candidates = [[-50,44],[-50,38],[-49,48],[-42,49],[-36,49],[-52,43]];
      let chosen = null;
      for (const [x,z] of candidates) {
        if (!this.collides?.(x, z, (this.player.radius || .55) + .42)) { chosen = {x,z}; break; }
      }
      if (!chosen && this.findDeterministicSafePoint) {
        chosen = this.findDeterministicSafePoint((this.player.radius || .55) + .42, { originX:-50, originZ:44 });
      }
      if (!chosen) return false;
      this.player.x = chosen.x;
      this.player.z = chosen.z;
      this.player.y = 0;
      this.player.vx = 0;
      this.player.vz = 0;
      this.player.vy = 0;
      this.player.grounded = true;
      const firstBeacon = (this.storyObjects || []).find(o => o.role === 'beacon');
      if (firstBeacon) this.yaw = Math.atan2(-(firstBeacon.x - chosen.x), -(firstBeacon.z - chosen.z));
      this.pitch = 0;
      this.input?.resetTransient?.();
      return true;
    };

    const previousSetup = proto.setupStoryEnvironment;
    proto.setupStoryEnvironment = function(...args) {
      const result = previousSetup.apply(this, args);
      if (this.runMode !== 'story') return result;
      this.applyStoryObjectNarrative?.();
      if (this.storyChapter?.id === 4) {
        const scanner = (this.storyObjects || []).find(o => o.role === 'scanner');
        if (scanner) {
          scanner.group.visible = false;
          scanner.active = false;
          scanner.done = false;
          scanner.docked = true;
          scanner.purpose = '세 좌표 비콘의 동기화가 완료될 때까지 전실 도킹 레일에서 대기한다. 이후 핵심 기록실까지 직접 이동해 필름을 판독한다.';
          this.setStoryObjectCollision?.(scanner, false);
        }
        this.placeChapterFourPlayerSafely?.();
        this.ensureStoryPlayerClearance?.();
        if (this.collides?.(this.player.x, this.player.z, (this.player.radius || .55) + .12)) {
          this.placeChapterFourPlayerSafely?.();
        }
      }
      return result;
    };

    const previousActivate = proto.activateStoryMissionObjects;
    proto.activateStoryMissionObjects = function(...args) {
      const result = previousActivate.apply(this, args);
      if (this.runMode !== 'story' || !this.currentMission) return result;
      const chain = missionChains[this.storyChapter?.id]?.[Math.max(0, (this.wave || 1) - 1)];
      if (chain?.fieldBrief) {
        this.currentMission.fieldBrief = chain.fieldBrief;
        const current = this.storyCinematicState;
        if (current?.title === 'MISSION UPDATE') {
          current.copy = chain.fieldBrief;
          const copy = document.getElementById('story-cinematic-copy');
          if (copy) copy.textContent = chain.fieldBrief;
        }
        const queued = (this.storyCinematicQueue || []).findLast?.(clip => clip.title === 'MISSION UPDATE');
        if (queued) queued.copy = chain.fieldBrief;
      }
      if (this.storyChapter?.id === 4) {
        const scanner = (this.storyObjects || []).find(o => o.role === 'scanner');
        if (scanner) {
          const escort = this.currentMission.type === 'escort';
          scanner.group.visible = escort;
          scanner.docked = !escort;
          const scannerClearance = Math.max(scanner.collider?.w || 2.8, scanner.collider?.d || 1.9) * .55 + (this.player?.radius || .55) + .55;
          const playerOverlapsDock = !!(escort && this.player && Math.hypot(this.player.x - scanner.x, this.player.z - scanner.z) < scannerClearance);
          scanner.restoreEscortColliderWhenClear = playerOverlapsDock;
          this.setStoryObjectCollision?.(scanner, escort && !playerOverlapsDock);
          if (escort) {
            scanner.active = true;
            scanner.done = false;
            this.audio?.storyObjectCue?.('scanner', 'complete');
            this.showCenterAlert?.('스캐너 도킹 해제', '비콘망이 안정되어 아틀라스 스캐너가 핵심 기록실로 이동할 수 있다.', 'info', 2.6);
            this.queueDialogue?.('격리국 관제|스캐너 도킹 해제. 파란 좌표선 밖으로 밀려나면 시간 기준을 잃는다. 이동 경로를 확보하라.', { delay:.2 });
          }
        }
      }
      if (this.storyChapter?.id === 1 && this.wave >= 3) this.__v61ShutterSequenceActive = false;
      return result;
    };

    const previousPlayMotion = proto.playStoryMotion;
    proto.playStoryMotion = function(title, copy, target = null, kind = 'info') {
      if (this.runMode === 'story' && this.storyChapter?.id === 1 && this.__v61ShutterSequenceActive && title === '작전 결과') {
        return;
      }
      const localDistance = target && this.player && Number.isFinite(target.x) && Number.isFinite(target.z)
        ? Math.hypot(target.x - this.player.x, target.z - this.player.z) : Infinity;
      const localInteraction = target && !target.forceCutaway && !target.door && localDistance < 8 && /작동$/.test(String(title || ''));
      if (localInteraction) {
        this.showCenterAlert?.(title, copy || target.result || '장치가 정상 작동했다.', kind === 'danger' ? 'danger' : 'info', 1.9);
        return;
      }
      return previousPlayMotion.call(this, title, copy, target, kind);
    };

    const previousCompleteInteraction = proto.completeStoryInteraction;
    proto.completeStoryInteraction = function(o) {
      const relaySequence = this.runMode === 'story' && this.storyChapter?.id === 1 && o?.role === 'relay';
      if (relaySequence) this.__v61ShutterSequenceActive = true;
      const result = previousCompleteInteraction.call(this, o);
      if (relaySequence) {
        this.storyCinematicQueue = (this.storyCinematicQueue || []).filter(clip => clip.title !== '작전 결과');
      }
      if (this.runMode === 'story' && this.currentMission && o && !relaySequence) {
        const relevant = (this.storyObjects || []).filter(x => x.active && !x.door && (!this.currentMission.target || x.role === this.currentMission.target));
        const completed = relevant.filter(x => x.done).length;
        if (relevant.length > 1 && completed < relevant.length) {
          this.queueDialogue?.(`R-07|${o.label} 확인. ${relevant.length - completed}개 장치가 남았다.`, { delay:.12 });
        }
      }
      return result;
    };

    const previousFinishMission = proto.finishMissionWave;
    proto.finishMissionWave = function(title) {
      const chapter = this.storyChapter?.id;
      const wave = this.wave;
      const chain = missionChains[chapter]?.[Math.max(0, wave - 1)];
      const relaySequence = this.runMode === 'story' && chapter === 1 && wave === 2 && this.__v61ShutterSequenceActive;
      const result = previousFinishMission.call(this, title);
      if (relaySequence) {
        this.storyCinematicQueue = (this.storyCinematicQueue || []).filter(clip => clip.title !== '작전 결과');
      }
      if (this.runMode === 'story' && chain?.handoff) {
        this.queueDialogue?.(`격리국 관제|${chain.handoff}`, { delay: relaySequence ? .85 : .35 });
      }
      return result;
    };

    const previousSpawnCores = proto.spawnObjectiveCores;
    proto.spawnObjectiveCores = function(count = 2) {
      const key = this.runMode === 'story' ? `${this.storyChapter?.id}:${this.wave}` : '';
      const plan = corePlans[key];
      if (!plan) return previousSpawnCores.call(this, count);
      this.objectiveCores = [];
      const used = [];
      for (let i = 0; i < count; i++) {
        const requested = plan[i] || plan[plan.length - 1];
        let point = this.snapStoryPointToReachable?.(requested[0], requested[1], 1.25, 16) || {x:requested[0],z:requested[1]};
        if (this.rectCollides?.(point.x, point.z, 2.5, 2.5, .28) || used.some(p => Math.hypot(point.x-p.x, point.z-p.z) < 5.2)) {
          point = this.findCoreSpawnPoint?.(1.25) || point;
        }
        if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.z)) continue;
        used.push(point);
        const core = this.createObjectiveCore(point.x, point.z, i);
        core.storyAnchor = requested;
        core.storyPurpose = key === '5:2' ? '형광등 주파수를 재송출하는 증폭기 코어' : (key === '4:2' ? '기록 투사를 발생시키는 왜곡 코어' : '공간 좌표를 고정하는 공진 코어');
        this.objectiveCores.push(core);
      }
      if (this.objectiveCores.length < count) {
        for (let i = this.objectiveCores.length; i < count; i++) {
          const p = this.findCoreSpawnPoint?.(1.25);
          if (!p) break;
          this.objectiveCores.push(this.createObjectiveCore(p.x, p.z, i));
        }
      }
    };


    const previousUpdateStorySystems = proto.updateStorySystems;
    proto.updateStorySystems = function(dt) {
      const result = previousUpdateStorySystems.call(this, dt);
      if (this.runMode === 'story' && this.storyChapter?.id === 4 && this.currentMission?.type === 'escort') {
        const scanner = (this.storyObjects || []).find(o => o.role === 'scanner');
        if (scanner?.restoreEscortColliderWhenClear && this.player) {
          const clearance = Math.max(scanner.collider?.w || 2.8, scanner.collider?.d || 1.9) * .55 + (this.player.radius || .55) + .55;
          if (Math.hypot(this.player.x - scanner.x, this.player.z - scanner.z) >= clearance) {
            scanner.restoreEscortColliderWhenClear = false;
            this.setStoryObjectCollision?.(scanner, true);
          }
        }
      }
      return result;
    };

    const previousMissionObjectiveText = proto.missionObjectiveText;
    proto.missionObjectiveText = function() {
      const base = previousMissionObjectiveText.call(this);
      if (this.runMode !== 'story' || !this.currentMission?.fieldBrief) return base;
      return base || this.currentMission.fieldBrief;
    };

    const previousClear = proto.clearStoryRuntimeState;
    proto.clearStoryRuntimeState = function(...args) {
      const result = previousClear.apply(this, args);
      this.__v61ShutterSequenceActive = false;
      return result;
    };

    seed.build = BUILD;
    window.BOXHEAD_BUILD = BUILD;
    document.documentElement.dataset.boxheadBuild = BUILD;
  }

  if (window.__game) apply();
  else addEventListener('DOMContentLoaded', apply, { once:true });
})();
