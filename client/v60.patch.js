(() => {
  'use strict';
  const BUILD = '60.0';
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const now = () => performance.now() / 1000;

  function apply() {
    const seed = window.__game;
    if (!seed || seed.__v60PatchApplied) return;
    const proto = Object.getPrototypeOf(seed);
    seed.__v60PatchApplied = true;
    proto.__v60PatchApplied = true;

    const previousGetPose = proto.getStoryCinematicCameraPose;
    proto.getStoryCinematicCameraPose = function(target, force = false) {
      // 오세현을 직접 대면하는 순간에는 시설 CCTV로 끊지 않는다. 구조 대상은
      // 플레이어의 현재 시야와 현장 대화로 보여 주고, CCTV는 원격 문·장치 확인에만 쓴다.
      if (target?.role === 'survivor') return null;
      return previousGetPose.call(this, target, force);
    };

    const previousPlayMotion = proto.playStoryMotion;
    proto.playStoryMotion = function(title, copy, target = null, kind = 'info') {
      const focus = target || this.getCurrentStoryTarget?.();
      if (focus?.role === 'survivor') {
        // NaN 좌표를 넘기면 원본 연출은 카메라 목표 없이 제목과 자막만 재생한다.
        return previousPlayMotion.call(this, title, copy, { x: Number.NaN, z: Number.NaN }, kind);
      }
      return previousPlayMotion.call(this, title, copy, target, kind);
    };

    proto.createStoryHideout = function(survivor) {
      if (!survivor || survivor.hideoutBuilt || !this.scene) return;
      survivor.hideoutBuilt = true;
      survivor.hidden = true;
      survivor.revealed = false;
      survivor.revealT = 0;
      survivor.label = '경비 초소 내부 구조 신호';
      survivor.forceCutaway = false;
      survivor.cameraLabel = '';
      survivor.purpose = '전복된 경비 데스크 뒤에 숨어 있는 생존 반응이다. 주변 감염체를 제거하고 직접 신원을 확인해야 한다.';

      this.moveStoryObjectTo?.(survivor, 24, 29.25);
      const model = survivor.group?.userData?.model;
      if (model) {
        model.position.y = -.48;
        model.scale.y = .86;
        model.rotation.x = -.10;
        const rightArm = model.userData?.rightArm;
        if (rightArm && !rightArm.userData?.survivorPistol) {
          const pistol = this.addPart(rightArm, this.geos.lowBox, this.materials.weaponMetal || this.storyMats.dark,
            0, -.78, .19, .13, .11, .36, -.18, 0, 0);
          rightArm.userData.survivorPistol = pistol;
        }
      }

      // 전복된 경비 데스크는 낮은 실제 충돌물이다. 오세현은 뒤에 몸을 낮춰 숨고,
      // 플레이어와 감염체는 데스크를 돌아 들어가야 한다.
      const cover = this.addObstacle(24, 27.45, 5.2, 1.05, 'storyHideoutCover');
      cover.storyDecor = true;
      cover.mesh.material = this.storyMats?.steel || cover.mesh.material;
      cover.mesh.position.y = .72;
      cover.mesh.scale.y = .28;
      for (const extra of cover.extras || []) if (extra?.parent) extra.parent.remove(extra);
      cover.extras = [];
      survivor.hideoutCover = cover;

      const GroupClass = survivor.group?.constructor;
      if (GroupClass) {
        const hideout = new GroupClass();
        this.addPart(hideout, this.geos.lowBox, this.storyMats?.dark || this.materials.wall,
          0, .68, 0, 5.1, 1.28, .92, 0, 0, -.035);
        this.addPart(hideout, this.geos.lowBox, this.storyMats?.yellow || this.materials.trim,
          0, 1.30, -.02, 4.75, .10, .98, 0, 0, -.035);
        this.addPart(hideout, this.geos.lowBox, this.storyMats?.red || this.materials.fire,
          -1.55, 1.12, -.52, .52, .18, .08, 0, 0, -.035);
        this.addPart(hideout, this.geos.lowBox, this.storyMats?.steel || this.materials.wall,
          2.95, 1.05, 1.20, 1.05, 2.05, 1.65, 0, .12, 0);
        hideout.position.set(24, 0, 27.45);
        this.scene.add(hideout);
        survivor.hideoutVisual = hideout;
      }
      this.collisionIndexDirty = true;
      this.markNavDirty?.();
    };

    proto.spawnStoryHideoutThreat = function(x, z, index = 0) {
      if (!this.scene || !this.enemies) return null;
      const type = index === 2 ? 'runner' : 'zombie';
      const stats = this.enemyStats(type);
      const snap = this.snapStoryPointToReachable?.(x, z, stats.radius, 8) || { x, z };
      if (this.collides(snap.x, snap.z, stats.radius + .15)) return null;
      const mesh = this.createBoxheadModel(type);
      mesh.position.set(snap.x, 0, snap.z);
      mesh.rotation.y = Math.atan2(24 - snap.x, 29.25 - snap.z);
      this.scene.add(mesh);
      const e = {
        id: this.nextEnemyId++, type, mesh, alive:true,
        x:snap.x, z:snap.z, vx:0, vz:0,
        hp:stats.hp, maxHp:stats.hp, speed:stats.speed, radius:stats.radius,
        damage:stats.damage, score:stats.score, elite:false,
        attackCd:99, meleeCd:.5, stun:0, hitTimer:0, hitMax:.001, hitLean:0, bloodCount:0,
        attackAnim:0, attackMax:.001, castAnim:0, castMax:.001, recoilTimer:0, recoilMax:.001,
        recoilDir:{x:0,z:0}, walkPhase:Math.random()*Math.PI*2, walkSpeed:0, stepCd:.4,
        wallPower:stats.wallPower || 1, blastRadius:stats.blastRadius || 0, blastDamage:stats.blastDamage || 0,
        shielded:!!stats.shielded, deathExploded:false, bomberWarned:false, bomberFlash:0,
        storyHideoutThreat:true, storyThreatReleased:false, storyThreatPhase:index * .37,
        storyThreatSpeed:stats.speed
      };
      this.enemies.push(e);
      this.spawnEnemySpawnFx?.(snap.x, snap.z, type);
      return e;
    };

    proto.ensureStoryHideoutThreats = function() {
      if (this.runMode !== 'story' || this.storyChapter?.id !== 1 || this.currentMission?.type !== 'rescue') return;
      if (this.__v60HideoutThreatsSpawned) return;
      this.__v60HideoutThreatsSpawned = true;
      const points = [[21.7,25.45],[24.0,24.95],[26.2,25.55]];
      this.storyHideoutThreats = points.map((p,i) => this.spawnStoryHideoutThreat(p[0],p[1],i)).filter(Boolean);
    };

    const previousSetup = proto.setupStoryEnvironment;
    proto.setupStoryEnvironment = function(...args) {
      const result = previousSetup.apply(this, args);
      if (this.runMode === 'story' && this.storyChapter?.id === 1) {
        const survivor = this.getStorySurvivor?.() || (this.storyObjects || []).find(o => o.role === 'survivor');
        if (survivor) this.createStoryHideout(survivor);
      }
      return result;
    };

    const previousActivate = proto.activateStoryMissionObjects;
    proto.activateStoryMissionObjects = function(...args) {
      const result = previousActivate.apply(this, args);
      if (this.runMode === 'story' && this.storyChapter?.id === 1 && this.currentMission?.type === 'rescue') {
        const survivor = this.getStorySurvivor?.();
        if (survivor) {
          survivor.forceCutaway = false;
          survivor.label = survivor.revealed ? '경비팀장 오세현' : '경비 초소 내부 구조 신호';
        }
        // 기존 MISSION UPDATE가 구조 대상 쪽으로 고개를 강제로 돌렸다면 현장 시점으로 복구한다.
        const state = this.storyCinematicState;
        if (state?.target?.role === 'survivor') {
          state.target = null;
          state.cutawayPose = null;
          state.cutawayActive = false;
          state.focusYaw = state.startYaw;
          state.focusPitch = state.startPitch;
          document.getElementById('story-cinematic')?.classList.remove('cctv-feed','cctv-switch');
        }
        this.ensureStoryHideoutThreats();
        this.queueDialogue?.('격리국 관제|경비 초소 안쪽에서 불규칙한 생체 신호가 잡힌다. 감염체가 데스크를 두드리고 있다.', { delay:.25 });
      }
      return result;
    };

    const previousGetActiveSurvivor = proto.getActiveStorySurvivor;
    proto.getActiveStorySurvivor = function() {
      const sv = this.getStorySurvivor?.();
      if (sv && this.runMode === 'story' && this.storyChapter?.id === 1 && this.currentMission?.type === 'rescue'
        && sv.revealed && !sv.dead && (sv.hp ?? 0) > 0 && !this.storySequence?.survivorExtracted) return sv;
      return previousGetActiveSurvivor.call(this);
    };

    const previousHealthHud = proto.updateStorySurvivorHealthHud;
    proto.updateStorySurvivorHealthHud = function(dt = 0, force = false) {
      const result = previousHealthHud.call(this, dt, force);
      const sv = this.getStorySurvivor?.();
      if (sv?.hidden && !sv.revealed) document.getElementById('story-survivor-health')?.classList.remove('show');
      return result;
    };

    proto.revealStorySurvivor = function(survivor) {
      if (!survivor || survivor.revealed) return;
      survivor.revealed = true;
      survivor.hidden = false;
      survivor.revealT = 0;
      survivor.label = '경비팀장 오세현';
      survivor.purpose = '부상과 탈진으로 경비 초소에 고립돼 있다. 주변 감염체를 저지하고 신원을 확인한 뒤 함께 철수해야 한다.';
      this.showCenterAlert?.('생존자 발견', '전복된 경비 데스크 뒤에서 오세현 팀장을 확인했다. 주변 감염체가 초소로 몰려든다.', 'danger', 2.8);
      this.queueDialogue?.('오세현|쏘지 마! 경비팀장 오세현이다. 다리를 다쳤지만 걸을 수 있어. 먼저 앞의 놈들부터 처리해.', { delay:0 });
      for (const e of this.storyHideoutThreats || []) if (e?.alive) e.storyThreatReleased = true;
      this.updateStorySurvivorHealthHud?.(0, true);
    };

    const previousComplete = proto.completeStoryInteraction;
    proto.completeStoryInteraction = function(o) {
      if (o?.role === 'survivor' && this.currentMission?.type === 'rescue' && !o.done) {
        this.revealStorySurvivor(o);
        this.storySequence.rescued = true;
        o.done = true;
        o.active = false;
        o.escortNoCollision = true;
        if (o.collider) o.collider.alive = false;
        this.audio.storyObjectCue?.('survivor','complete');
        this.showToast?.('오세현 확보 · 후방 구조선까지 호위');
        this.showCenterAlert?.('구조 대상 확보', '오세현이 R-07의 후방 대형에 합류했다. 멈추면 엄폐하고, 이동하면 코너를 확인하며 따라온다.', 'info', 2.6);
        this.queueDialogue?.('R-07|내 뒤에서 두 걸음 간격 유지해. 코너에서는 내가 먼저 확인한다.', { delay:.25 });
        this.queueDialogue?.('오세현|알겠다. 놈이 붙으면 나도 사격하겠다. 출구까지 길만 열어 줘.', { delay:.45 });
        return;
      }
      const result = previousComplete.call(this, o);
      if (o?.role === 'relay') {
        this.storyDoorShakeTimer = 1.85;
        this.storyDoorShakeStrength = 1;
        const door = (this.storyObjects || []).find(x => x.role === 'blastDoor' && x.door);
        if (door) {
          door.v60Rumble = true;
          this.spawnStoryDoorDust?.(door, 18);
        }
        this.audio.beep?.(52, 1.15, 'sawtooth', .075);
      }
      return result;
    };

    proto.spawnStoryDoorDust = function(door, count = 14) {
      if (!door || this.quality?.simpleModels || !door.stripe?.constructor) return;
      const MeshClass = door.stripe.constructor;
      const matBase = this.storyMats?.white || door.stripe.material;
      for (let i = 0; i < count; i++) {
        const mat = matBase?.clone ? matBase.clone() : matBase;
        if (mat) { mat.transparent = true; mat.opacity = .32; }
        const mesh = new MeshClass(this.geos.lowBox, mat);
        mesh.position.set(door.x + (Math.random()-.5)*7.2, .18+Math.random()*1.3, door.z + (Math.random()-.5)*1.4);
        mesh.scale.set(.05+Math.random()*.13, .04+Math.random()*.10, .05+Math.random()*.13);
        this.scene.add(mesh);
        this.fx.push({ mesh, life:.65+Math.random()*.5, max:1.1, debris:true,
          vx:(Math.random()-.5)*1.4, vy:.25+Math.random()*1.3, vz:(Math.random()-.5)*1.0, fadeStart:.08 });
      }
    };

    // 플레이어의 정확한 중심을 쫓지 않고, 진행 방향 뒤쪽의 대형 지점을 내비게이션으로 따라간다.
    const previousStepMover = proto.stepStoryMover;
    proto.stepStoryMover = function(o, tx, tz, speed, dt, radius = .58, stopDistance = .9) {
      if (o?.role !== 'survivor' || !this.player || !this.storySequence?.rescued) {
        return previousStepMover.call(this, o, tx, tz, speed, dt, radius, stopDistance);
      }
      const moving = Math.hypot(this.player.vx || 0, this.player.vz || 0);
      let fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
      if (moving > .35) { fx = (this.player.vx || 0) / moving; fz = (this.player.vz || 0) / moving; }
      const rightX = fz, rightZ = -fx;
      const playerDistance = Math.hypot(o.x - this.player.x, o.z - this.player.z);
      const back = playerDistance > 10 ? 1.65 : (moving > .25 ? 2.65 : 2.25);
      const side = playerDistance > 8 ? 0 : .62;
      let goalX = this.player.x - fx * back + rightX * side;
      let goalZ = this.player.z - fz * back + rightZ * side;

      o.formationRefresh = Math.max(0, (o.formationRefresh || 0) - dt);
      if (o.formationRefresh <= 0 || !Number.isFinite(o.formationX)) {
        o.formationRefresh = .16;
        const snap = this.snapStoryPointToReachable?.(goalX, goalZ, radius, 7) || {x:goalX,z:goalZ};
        o.formationX = snap.x; o.formationZ = snap.z;
      }
      goalX = o.formationX; goalZ = o.formationZ;
      const distance = Math.hypot(goalX - o.x, goalZ - o.z);
      if (distance < .48) return true;

      let steerX = goalX - o.x, steerZ = goalZ - o.z;
      const field = this.getFlowField?.(goalX, goalZ, Math.max(.62, radius + .06));
      if (field) {
        const raw = this.navWorldToCell(o.x, o.z, field.nav);
        const start = field.nav.walkable[raw.i] ? raw : this.nearestReachableWalkableCell(o.x,o.z,field.nav,radius,5);
        const hop = start ? field.nextHop[start.i] : -1;
        if (hop >= 0) {
          const hx = hop % field.nav.cols, hz = Math.floor(hop / field.nav.cols);
          const p = this.navCellToWorld(hx, hz, field.nav);
          steerX = p.x - o.x; steerZ = p.z - o.z;
        }
      }
      const len = Math.hypot(steerX, steerZ) || 1;
      const catchup = playerDistance > 10 ? 3.55 : (playerDistance > 6 ? 3.05 : 2.55);
      const ownCollider = o.collider;
      if (ownCollider) ownCollider.alive = false;
      this.moveEntity(o, steerX / len * catchup * dt, steerZ / len * catchup * dt, radius);
      if (ownCollider && !o.escortNoCollision) ownCollider.alive = true;
      this.moveStoryObjectTo(o, o.x, o.z);
      return Math.hypot(goalX - o.x, goalZ - o.z) < .65;
    };

    const previousUpdateStory = proto.updateStorySystems;
    proto.updateStorySystems = function(dt) {
      const result = previousUpdateStory.call(this, dt);
      const sv = this.getStorySurvivor?.();
      if (sv && this.runMode === 'story' && this.storyChapter?.id === 1) {
        const model = sv.group?.userData?.model;
        if (this.currentMission?.type === 'rescue' && !sv.revealed && !sv.dead) {
          const distance = Math.hypot(this.player.x - sv.x, this.player.z - sv.z);
          if (distance < 8.2 && !this.storyCinematicState) this.revealStorySurvivor(sv);
          if (model) {
            model.position.y = -.48 + Math.sin(now()*3.1)*.012;
            model.scale.y = .86;
            model.rotation.x = -.10;
            if (model.userData?.leftArm) model.userData.leftArm.rotation.x = -.38;
            if (model.userData?.rightArm) model.userData.rightArm.rotation.x = -.22;
          }
        } else if (model && sv.revealed && !sv.dead) {
          sv.revealT = clamp((sv.revealT || 0) + dt * 1.65, 0, 1);
          const k = sv.revealT * sv.revealT * (3 - 2 * sv.revealT);
          model.position.y = -.48 * (1-k);
          model.scale.y = .86 + .14*k;
          model.rotation.x = -.10 * (1-k);
        }

        // 오세현은 주변 적을 보고 방향을 바꾸며 낮은 화력으로 엄호한다.
        if (sv.revealed && !sv.dead && !this.storySequence?.survivorExtracted && !this.storyCinematicState) {
          sv.supportFireCd = Math.max(0, (sv.supportFireCd || .45) - dt);
          let nearest = null, nearestD = 11.5;
          for (const e of this.enemies || []) {
            if (!e.alive) continue;
            const d = Math.hypot(e.x - sv.x, e.z - sv.z);
            if (d < nearestD) { nearest=e; nearestD=d; }
          }
          if (nearest && sv.group) {
            const dx = nearest.x - sv.x, dz = nearest.z - sv.z;
            sv.group.rotation.y = Math.atan2(dx, dz);
            if (sv.supportFireCd <= 0 && nearestD < 10.5) {
              const from = {x:sv.x,y:1.35,z:sv.z};
              const to = {x:nearest.x,y:1.15,z:nearest.z};
              const clear = !this.isStoryCinematicLineClear || this.isStoryCinematicLineClear(from,to,null);
              if (clear) {
                sv.supportFireCd = .88 + Math.random()*.42;
                const yaw = Math.atan2(-dx,-dz);
                const dir = this.lookDirection?.(yaw,0);
                if (dir && this.spawnRemoteBulletVisual) this.spawnRemoteBulletVisual({mesh:sv.group,target:{yaw,pitch:0}},dir,'pistol');
                this.damageEnemy?.(nearest, 6.5, 'bullet', dir || {x:dx/(nearestD||1),z:dz/(nearestD||1)}, 'body');
              }
            }
          }
        }
      }

      const door = (this.storyObjects || []).find(o => o.role === 'blastDoor' && o.door);
      if (door) {
        const timer = Math.max(0, this.storyDoorShakeTimer || 0);
        const opening = door.done && (door.openT || 0) < 1;
        const shake = opening ? Math.sin(now()*58) * .055 * Math.min(1, timer/.25 + .25) : 0;
        if (door.group?.position) door.group.position.x = door.x + shake*.35;
        if (door.stripe?.position) door.stripe.position.x = door.x + shake*.65;
        if (door.doorVisual?.position) door.doorVisual.position.x = door.x + shake;
        if (door.v60Rumble && door.openT > .42 && !door.v60MidDust) {
          door.v60MidDust = true;
          this.spawnStoryDoorDust?.(door, 12);
        }
        if (!opening) {
          if (door.group?.position) door.group.position.x = door.x;
          if (door.stripe?.position) door.stripe.position.x = door.x;
          if (door.doorVisual?.position) door.doorVisual.position.x = door.x;
        }
      }
      return result;
    };

    const previousUpdateEnemies = proto.updateEnemies;
    proto.updateEnemies = function(dt) {
      const sv = this.getStorySurvivor?.();
      const playerNear = sv && this.player && Math.hypot(this.player.x-sv.x,this.player.z-sv.z) < 13.5;
      const held = [];
      for (const e of this.enemies || []) {
        if (!e.alive || !e.storyHideoutThreat || e.storyThreatReleased || sv?.revealed || playerNear || e.hp < e.maxHp) continue;
        held.push([e,e.speed,e.attackCd]);
        e.speed = 0;
        e.attackCd = 99;
      }
      const result = previousUpdateEnemies.call(this, dt);
      for (const [e,speed] of held) {
        e.speed = speed;
        e.x = e.mesh.position.x; e.z = e.mesh.position.z;
        if (sv && e.mesh) {
          e.mesh.rotation.y = Math.atan2(sv.x-e.x,sv.z-e.z);
          e.storyThreatPhase = (e.storyThreatPhase || 0) + dt;
          if (e.attackAnim <= 0 && e.storyThreatPhase % 1.15 < dt) { e.attackAnim=.42;e.attackMax=.42; }
        }
      }
      if (playerNear || sv?.revealed) for (const e of this.storyHideoutThreats || []) if (e?.alive) e.storyThreatReleased=true;
      return result;
    };

    const previousUpdateCamera = proto.updateCamera;
    proto.updateCamera = function(dt = 0) {
      const result = previousUpdateCamera.call(this, dt);
      if (dt && (this.storyDoorShakeTimer || 0) > 0 && this.accessibility?.cameraMotion !== 'off') {
        this.storyDoorShakeTimer = Math.max(0, this.storyDoorShakeTimer - dt);
        const reduced = this.accessibility?.cameraMotion === 'reduced' ? .28 : 1;
        const k = clamp(this.storyDoorShakeTimer / 1.85, 0, 1) * (this.storyDoorShakeStrength || 1) * reduced;
        const t = now();
        this.camera.position.x += Math.sin(t*74)*.055*k;
        this.camera.position.y += Math.cos(t*91)*.035*k;
        this.camera.position.z += Math.sin(t*63)*.040*k;
        this.camera.rotateZ?.(Math.sin(t*81)*.008*k);
        if (this.storyDoorShakeTimer <= 0) this.storyDoorShakeStrength = 0;
      }
      return result;
    };

    const previousClear = proto.clearStoryRuntimeState;
    proto.clearStoryRuntimeState = function(...args) {
      const survivor = this.getStorySurvivor?.();
      if (survivor?.hideoutVisual?.parent) survivor.hideoutVisual.parent.remove(survivor.hideoutVisual);
      const result = previousClear.apply(this,args);
      this.storyHideoutThreats = [];
      this.__v60HideoutThreatsSpawned = false;
      this.storyDoorShakeTimer = 0;
      this.storyDoorShakeStrength = 0;
      return result;
    };

    seed.build = BUILD;
    window.BOXHEAD_BUILD = BUILD;
    document.documentElement.dataset.boxheadBuild = BUILD;
  }

  if (window.__game) apply();
  else addEventListener('DOMContentLoaded', apply, { once:true });
})();
