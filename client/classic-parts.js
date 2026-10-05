// Original game's block silhouettes and color placements. Keep this baseline minimal.
import * as THREE from 'three';

export function buildClassicEnemy(type) {
    const g = new THREE.Group();
    g.userData.type = type;

    if (type === 'player') {
      // 업로드1 기준 플레이어: 살구색 얼굴, 검은 민소매 몸통, 블록형 팔다리.
      this.addPart(g, this.geos.charTorso, this.materials.shirtBlack, 0, .84, 0, .95, 1.12, .92);
      this.addPart(g, this.geos.charHead, this.materials.skin, 0, 1.58, 0, .98, .98, .98);
      this.addPart(g, this.geos.hairCap, this.materials.hair, 0, 1.98, 0, 1.0, .72, 1.0);
      this.addPart(g, this.geos.facePanel, this.materials.skin, 0, 1.52, .375, .92, .64, 1);
      this.addPart(g, this.geos.charArm, this.materials.skin, -.54, .80, .02, .92, 1.08, .92);
      this.addPart(g, this.geos.charArm, this.materials.skin, .54, .80, .02, .92, 1.08, .92);
      this.addPart(g, this.geos.charLeg, this.materials.skin, -.20, .28, .02, .96, 1, .96);
      this.addPart(g, this.geos.charLeg, this.materials.skin, .20, .28, .02, .96, 1, .96);
      this.addPart(g, this.geos.lowBox, this.materials.weaponDark, -.73, .54, .22, .18, .56, .14, 0, 0, .04);
    } else if (type === 'devil') {
      // 균열술사: 오염된 보라색 방호복과 청록 균열광. 원거리 역할이 한눈에 보인다.
      this.addPart(g, this.geos.charTorso, this.materials.devilRed, 0, .82, 0, 1.12, 1.08, 1.08);
      this.addPart(g, this.geos.charHead, this.materials.devilRed, 0, 1.62, 0, 1.03, 1.03, 1.03);
      this.addPart(g, this.geos.facePanel, this.materials.devilDark, 0, 1.65, .375, .72, .26, 1);
      this.addPart(g, this.geos.lowBox, this.materials.devilEye, -.18, 1.68, .392, .13, .055, .025);
      this.addPart(g, this.geos.lowBox, this.materials.devilEye, .18, 1.68, .392, .13, .055, .025);
      this.addPart(g, this.geos.lowBox, this.materials.devilDark, 0, .98, .56, .72, .10, .055);
      this.addPart(g, this.geos.horn, this.materials.casterCore, -.42, 2.03, .01, 1, 1.05, 1, 0, 0, -.45);
      this.addPart(g, this.geos.horn, this.materials.casterCore, .42, 2.03, .01, 1, 1.05, 1, 0, 0, .45);
      // 팔은 한 벌만 생성한다. 이전 버전은 고정 팔 + 애니메이션 팔이 겹쳐 보여서
      // 걷는 중 몸이 두 개 겹친 것처럼 보였다.
      const castLeft = new THREE.Group();
      castLeft.position.set(-.62, 1.03, .16);
      this.addPart(castLeft, this.geos.charArm, this.materials.devilRed, 0, -.22, 0, .88, .90, .88);
      const castRight = new THREE.Group();
      castRight.position.set(.62, 1.03, .16);
      this.addPart(castRight, this.geos.charArm, this.materials.devilRed, 0, -.22, 0, .88, .90, .88);
      g.add(castLeft); g.add(castRight);
      g.userData.leftArm = castLeft; g.userData.rightArm = castRight;
      const leftLeg = this.addPart(g, this.geos.charLeg, this.materials.devilRed, -.22, .28, .02, 1.1, 1.03, 1.1);
      const rightLeg = this.addPart(g, this.geos.charLeg, this.materials.devilRed, .22, .28, .02, 1.1, 1.03, 1.1);
      g.userData.leftLeg = leftLeg; g.userData.rightLeg = rightLeg;
    } else if (type === 'tank') {
      // 탱커 좀비: 크고 둔한 체력형. 회색 중장갑 + 노란 경고띠로 일반 좀비와 확실히 구분한다.
      this.addPart(g, this.geos.charTorso, this.materials.tankSuit, 0, .88, 0, 1.34, 1.26, 1.12);
      this.addPart(g, this.geos.lowBox, this.materials.tankArmor, 0, .98, .54, 1.08, .74, .09);
      this.addPart(g, this.geos.lowBox, this.materials.tankStripe, 0, 1.22, .602, .88, .10, .045);
      this.addPart(g, this.geos.charHead, this.materials.tankSuit, 0, 1.68, 0, 1.10, 1.10, 1.10);
      this.addPart(g, this.geos.facePanel, this.materials.iceBlue, 0, 1.66, .414, .84, .58, 1);
      this.addPart(g, this.geos.lowBox, this.materials.tankArmor, -.68, 1.20, .03, .34, .32, .64);
      this.addPart(g, this.geos.lowBox, this.materials.tankArmor, .68, 1.20, .03, .34, .32, .64);
      const left = new THREE.Group(); left.position.set(-.76, .99, .17);
      const right = new THREE.Group(); right.position.set(.76, .99, .17);
      this.addPart(left, this.geos.charArm, this.materials.tankSuit, 0, -.22, 0, .96, 1.05, .96);
      this.addPart(right, this.geos.charArm, this.materials.tankSuit, 0, -.22, 0, .96, 1.05, .96);
      this.addPart(left, this.geos.charShoe, this.materials.tankArmor, 0, -.72, .04, .62, .80, .58);
      this.addPart(right, this.geos.charShoe, this.materials.tankArmor, 0, -.72, .04, .62, .80, .58);
      g.add(left); g.add(right); g.userData.leftArm = left; g.userData.rightArm = right;
      const leftLeg = this.addPart(g, this.geos.charLeg, this.materials.tankSuit, -.28, .28, .02, 1.18, 1.05, 1.18);
      const rightLeg = this.addPart(g, this.geos.charLeg, this.materials.tankSuit, .28, .28, .02, 1.18, 1.05, 1.18);
      g.userData.leftLeg = leftLeg; g.userData.rightLeg = rightLeg;
    } else if (type === 'bomber') {
      // 폭발 좀비: 노랑/주황 경고색 + 빨간 폭발 코어. 멀리서도 우선 처치 대상으로 보이게 한다.
      this.addPart(g, this.geos.charTorso, this.materials.bomberSuit, 0, .82, 0, .94, 1.08, .94);
      this.addPart(g, this.geos.lowBox, this.materials.bomberVest, 0, .95, .525, .78, .72, .08);
      this.addPart(g, this.geos.lowBox, this.materials.bomberRed, 0, .98, .595, .28, .34, .06);
      this.addPart(g, this.geos.lowBox, this.materials.tankStripe, -.30, 1.22, .58, .10, .52, .05, 0, 0, .55);
      this.addPart(g, this.geos.lowBox, this.materials.tankStripe, .30, 1.22, .58, .10, .52, .05, 0, 0, -.55);
      this.addPart(g, this.geos.charHead, this.materials.bomberSuit, 0, 1.58, 0, .96, .96, .96);
      this.addPart(g, this.geos.facePanel, this.materials.runnerFace, 0, 1.55, .370, .82, .60, 1);
      const left = new THREE.Group(); left.position.set(-.55, .96, .16);
      const right = new THREE.Group(); right.position.set(.55, .96, .16);
      this.addPart(left, this.geos.charArm, this.materials.bomberSuit, 0, -.22, 0, .72, .90, .72);
      this.addPart(right, this.geos.charArm, this.materials.bomberSuit, 0, -.22, 0, .72, .90, .72);
      this.addPart(left, this.geos.charShoe, this.materials.bomberRed, 0, -.65, .04, .45, .62, .48);
      this.addPart(right, this.geos.charShoe, this.materials.bomberRed, 0, -.65, .04, .45, .62, .48);
      g.add(left); g.add(right); g.userData.leftArm = left; g.userData.rightArm = right;
      const leftLeg = this.addPart(g, this.geos.charLeg, this.materials.bomberSuit, -.20, .28, .02, .96, 1, .96);
      const rightLeg = this.addPart(g, this.geos.charLeg, this.materials.bomberSuit, .20, .28, .02, .96, 1, .96);
      g.userData.leftLeg = leftLeg; g.userData.rightLeg = rightLeg;
    } else if (type === 'shield') {
      // 실드 좀비: 정면 장갑판. 정면 사격은 약해지고, 측면/헤드샷/폭발물로 처리하도록 만든다.
      this.addPart(g, this.geos.charTorso, this.materials.shieldSuit, 0, .84, 0, 1.00, 1.12, .98);
      this.addPart(g, this.geos.charHead, this.materials.shieldSuit, 0, 1.58, 0, .98, .98, .98);
      this.addPart(g, this.geos.facePanel, this.materials.iceBlue, 0, 1.55, .375, .90, .72, 1);
      this.addPart(g, this.geos.lowBox, this.materials.shieldPlate, 0, .92, .62, 1.08, .96, .12);
      this.addPart(g, this.geos.lowBox, this.materials.shieldEdge, 0, 1.43, .69, 1.16, .08, .05);
      this.addPart(g, this.geos.lowBox, this.materials.shieldEdge, -.58, .92, .69, .08, .98, .05);
      this.addPart(g, this.geos.lowBox, this.materials.shieldEdge, .58, .92, .69, .08, .98, .05);
      const left = new THREE.Group(); left.position.set(-.62, .98, .10);
      const right = new THREE.Group(); right.position.set(.62, .98, .10);
      this.addPart(left, this.geos.charArm, this.materials.shieldSuit, 0, -.22, 0, .72, .92, .72);
      this.addPart(right, this.geos.charArm, this.materials.shieldSuit, 0, -.22, 0, .72, .92, .72);
      this.addPart(left, this.geos.charShoe, this.materials.gloveBlue, 0, -.66, .04, .48, .72, .50);
      this.addPart(right, this.geos.charShoe, this.materials.gloveBlue, 0, -.66, .04, .48, .72, .50);
      g.add(left); g.add(right); g.userData.leftArm = left; g.userData.rightArm = right;
      const leftLeg = this.addPart(g, this.geos.charLeg, this.materials.shieldSuit, -.20, .28, .02, .96, 1, .96);
      const rightLeg = this.addPart(g, this.geos.charLeg, this.materials.shieldSuit, .20, .28, .02, .96, 1, .96);
      g.userData.leftLeg = leftLeg; g.userData.rightLeg = rightLeg;
    } else {
      // 업로드 이미지 기준 좀비: 흰색 수트/방호복 + 푸른 얼굴 패널 + 검은 신발.
      // runner는 같은 계열이지만 살짝 더 푸른 톤과 좁은 몸으로 속도감을 준다.
      const isRunner = type === 'runner';
      const suit = isRunner ? this.materials.runnerSuit : this.materials.zombieSuit;
      const stripe = isRunner ? this.materials.runnerStripe : this.materials.zombieStripe;
      const face = isRunner ? this.materials.runnerFace : this.materials.iceBlue;
      const sx = isRunner ? .82 : 1.04;
      const sy = isRunner ? 1.22 : 1.10;
      this.addPart(g, this.geos.charTorso, suit, 0, .84, 0, sx, sy, .98);
      // 일반 좀비는 주황 경고띠, 러너는 청록색 수트+흰 띠로 멀리서도 구분되게 한다.
      this.addPart(g, this.geos.lowBox, stripe, 0, 1.12, .525, sx * .62, .11, .055);
      this.addPart(g, this.geos.lowBox, stripe, 0, .74, .526, sx * .46, .09, .055, 0, 0, isRunner ? 0 : .42);
      this.addPart(g, this.geos.facePanel, face, 0, 1.01, .238, .82, .42, 1);
      this.addPart(g, this.geos.charHead, suit, 0, 1.58, 0, .98, .98, .98);
      this.addPart(g, this.geos.facePanel, face, 0, 1.55, .375, .90, .76, 1);
      this.addPart(g, this.geos.hairCap, isRunner ? this.materials.runnerFace : this.materials.hair, 0, 1.98, 0, 1.0, .72, 1.0);
      // 팔은 punchLeft/punchRight 그룹만 사용한다. 고정 팔을 별도로 만들지 않아
      // 정지한 팔과 움직이는 팔이 동시에 겹쳐 보이는 문제를 제거했다.
      const punchLeft = new THREE.Group();
      punchLeft.position.set(-.56, .98, .16);
      this.addPart(punchLeft, this.geos.charArm, suit, 0, -.22, 0, .72, .92, .72);
      const punchRight = new THREE.Group();
      punchRight.position.set(.56, .98, .16);
      this.addPart(punchRight, this.geos.charArm, suit, 0, -.22, 0, .72, .92, .72);
      g.add(punchLeft); g.add(punchRight);
      g.userData.leftArm = punchLeft; g.userData.rightArm = punchRight;
      // 손은 몸통에 고정하지 않고 팔 그룹의 하단에 붙인다.
      // 이렇게 해야 걷기/공격 애니메이션 때 손이 팔과 함께 움직인다.
      this.addPart(punchLeft, this.geos.charShoe, isRunner ? this.materials.runnerStripe : this.materials.gloveBlue, 0, -.66, .04, .48, .72, .50);
      this.addPart(punchRight, this.geos.charShoe, isRunner ? this.materials.runnerStripe : this.materials.gloveBlue, 0, -.66, .04, .48, .72, .50);
      const leftLeg = this.addPart(g, this.geos.charLeg, suit, -.20, .28, .02, .96, 1, .96);
      const rightLeg = this.addPart(g, this.geos.charLeg, suit, .20, .28, .02, .96, 1, .96);
      g.userData.leftLeg = leftLeg; g.userData.rightLeg = rightLeg;
    }

    this.addPart(g, this.geos.charShoe, this.materials.shoeBlack, -.23, .04, .10, 1.05, 1, 1.12);
    this.addPart(g, this.geos.charShoe, this.materials.shoeBlack, .23, .04, .10, 1.05, 1, 1.12);
    return g;
  }


export function addClassicWeaponParts(a,w,theme) {
    const m=this.materials;
    if (w.id === 'pistol') {
      this.addPart(a, this.geos.lowBox, theme.accent, .00, .13, -.20, .16, .055, .18);
      this.addPart(a, this.geos.lowBox, m.weaponMetal, .03, -.18, .10, .14, .28, .18, .20, 0, 0);
      this.addPart(a, this.geos.lowBox, m.weaponMetal, 0, .10, -.56, .08, .075, .16);
    } else if (w.id === 'smg') {
      this.addPart(a, this.geos.lowBox, m.weaponMetal, -.13, -.16, -.05, .14, .42, .20, -.18, 0, 0);
      this.addPart(a, this.geos.lowBox, theme.accent, .00, .15, -.46, .20, .045, .32);
      this.addPart(a, this.geos.lowBox, m.weaponDark, .16, -.03, .17, .08, .18, .32);
    } else if (w.id === 'shotgun') {
      this.addPart(a, this.geos.lowBox, m.weaponMetal, 0, -.05, -.43, .28, .08, .52);
      this.addPart(a, this.geos.lowBox, theme.accent, 0, .13, -.72, .26, .055, .20);
      this.addPart(a, this.geos.lowBox, m.weaponDark, .00, -.18, .20, .28, .12, .34);
    } else if (w.id === 'grenade') {
      this.addPart(a, this.geos.sphere, theme.body, 0, .02, -.28, .82, .82, .82);
      this.addPart(a, this.geos.lowBox, theme.accent, 0, .24, -.28, .30, .08, .20);
      this.addPart(a, this.geos.lowBox, m.weaponMetal, .18, .13, -.28, .055, .22, .14);
      this.addPart(a, this.geos.lowBox, m.weaponMetal, -.13, .15, -.28, .18, .045, .12, 0, 0, .35);
    } else if (w.id === 'barrel') {
      this.addPart(a, this.geos.mine, m.mineDark, 0, -.02, -.38, .68, .24, .68, Math.PI/2, 0, 0);
      this.addPart(a, this.geos.mineButton, theme.accent, 0, .05, -.38, .70, .22, .70, Math.PI/2, 0, 0);
      this.addPart(a, this.geos.lowBox, theme.accent, 0, .13, -.38, .90, .045, .12);
    } else if (w.id === 'wall') {
      this.addPart(a, this.geos.lowBox, m.fakeWall, 0, .02, -.36, .72, .46, .10);
      this.addPart(a, this.geos.lowBox, m.trim, -.26, .02, -.31, .055, .52, .12);
      this.addPart(a, this.geos.lowBox, m.trim, .26, .02, -.31, .055, .52, .12);
      this.addPart(a, this.geos.lowBox, theme.accent, 0, .28, -.30, .34, .06, .12);
    } else if (w.id === 'rocket') {
      this.addPart(a, this.geos.lowBox, theme.accent, 0, .05, -.88, .34, .09, .18);
      this.addPart(a, this.geos.lowBox, m.weaponMetal, -.24, -.05, -.42, .07, .18, .54);
      this.addPart(a, this.geos.lowBox, m.weaponMetal, .24, -.05, -.42, .07, .18, .54);
      this.addPart(a, this.geos.lowBox, m.gunRedAccent, 0, -.17, .17, .34, .12, .28);
    } else if (w.id === 'railgun') {
      this.addPart(a, this.geos.lowBox, m.gunAccent, -.17, .08, -.46, .05, .06, .90);
      this.addPart(a, this.geos.lowBox, m.gunAccent, .17, .08, -.46, .05, .06, .90);
      this.addPart(a, this.geos.lowBox, m.weaponDark, 0, -.13, -.15, .12, .22, .60);
      this.addPart(a, this.geos.lowBox, m.gunAccent, 0, .18, -.84, .22, .045, .18);
    }
  }


