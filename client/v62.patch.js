(() => {
  'use strict';

  const BUILD = '62.0';
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const ease = (t) => t * t * (3 - 2 * t);

  const STORY_V62 = {
    1: {
      title: 'A동, 남겨진 사람',
      intro: `2026년 7월 22일 새벽 3시 18분. 15년 전 폐쇄된 메리디안 지하 시설 A동에서 구조 신호가 다시 잡혔다. 신호는 11분째 같은 위치에서 반복되고 있으며, 내부 시간과 외부 시간이 다르게 흐를 가능성이 있다.\n\n현장대응요원 R-07의 첫 임무는 사람을 찾는 일이 아니다. 구조 신호까지 이어지는 통로를 실제로 확보하고, 사고 당시 내려온 방폭 셔터를 정상 절차로 여는 일이다. 셔터를 억지로 파괴하면 격리동의 압력과 전력이 함께 끊어져 안쪽 생존자가 버티지 못한다.`,
      goal: 'A동 봉쇄선을 확보하고, 중앙 허브를 복구해 격리동에 고립된 오세현을 구조하라.',
      ending: `오세현은 사고가 난 지 17시간쯤 됐다고 말했다. 밖에서는 15년이 지났다. 그는 한민석의 지시로 직접 방폭 셔터를 내렸고, 그 선택 때문에 동료들을 안에 남겼다고 인정했다.\n\n오세현이 내민 수기 출입카드에는 B동으로 먼저 들어간 현재 시점 선발대 3조의 호출부호가 적혀 있었다. 그들은 R-07보다 여섯 시간 먼저 진입한 뒤 연락이 끊겼다.`,
      missions: [
        { type:'normal', label:'진입로 확보', hud:'경비동 앞 감염체를 제거하고 중앙 허브까지 안전한 접근로를 확보하라', rationale:'허브 앞 통로가 막혀 있으면 셔터 전원과 생체 인증을 복구할 수 없다. 구조팀이 들어올 수 있는 최소한의 퇴로도 먼저 만들어야 한다.', outcome:'경비동 앞 통로와 후방 퇴로가 확보됐다. 중앙 허브 작업을 시작할 수 있다.', spawnScale:.54, transmission:'현장통제 박지현|허브까지 길부터 비워요. 구조 신호가 살아 있어도 퇴로가 없으면 들어가면 안 됩니다.' },
        { type:'interact', target:'relay', label:'중앙 허브 복구', hud:'중앙 허브의 보조 전원과 생체 인증 회로를 복구하라', rationale:'방폭 셔터는 충격으로 여는 문이 아니다. 허브가 격리동 압력과 잠금핀을 순서대로 해제해야 안쪽 초소를 무너뜨리지 않고 길을 열 수 있다.', outcome:'허브가 보조 전원과 생체 인증을 복구했다. 방폭 셔터의 잠금핀이 풀리고 격리동 조명이 켜졌다.', hold:2.3, minSpawn:10, spawnScale:.58, transmission:'R-07|보조 전원 들어왔습니다. 잠금핀 네 개 확인. 순서대로 해제합니다.' },
        { type:'rescue', target:'survivor', label:'오세현 구조', hud:'경비 초소 뒤에 숨어 있는 오세현을 확보하고 후방 인계 지점까지 호위하라', rationale:'오세현은 사고 당시 봉쇄 절차를 직접 실행했고 B동 수기 출입카드를 가지고 있다. 감염체가 초소를 무너뜨리기 전에 데리고 나와야 한다.', outcome:'오세현이 후방 구조선에 인계됐다. B동 출입카드와 선발대 3조의 마지막 이동 경로를 확보했다.', hold:1.6, minSpawn:15, spawnScale:.64, transmission:'오세현|여기 있습니다. 문 쪽부터 막아 주세요. 얘기는 나가면서 하겠습니다.' }
      ]
    },
    2: {
      title: 'B동, 돌아오지 않은 선발대',
      intro: `선발대 3조는 R-07보다 여섯 시간 먼저 B동에 들어왔다. 마지막 보고는 “기록 케이스 확보”였다. 이후 세 명의 생체 신호가 동시에 끊겼다.\n\nB동은 세 구간의 전력이 서로 분리된 장거리 화물축이다. 선발대가 남긴 케이스는 공진 차폐 때문에 무선으로 읽을 수 없고, 분석 플랫폼까지 직접 옮겨야 한다. 플랫폼이 케이스를 읽는 동안 발생하는 고주파는 감염체를 끌어들인다.`,
      goal: '선발대의 기록 케이스를 회수하고, B동 전력망을 복구해 C동 진입 좌표를 확인하라.',
      ending: `기록 케이스에는 선발대원 강서윤의 마지막 보고가 남아 있었다. 감염은 물림으로 번진 것이 아니었다. 형광등과 냉각 설비에서 나온 반복 주파수가 사람의 행동을 공간에 고정했고, 오래 노출된 사람은 같은 동작만 남긴 채 공격적으로 변했다.\n\n선발대는 C동으로 가는 좌표를 찾았지만, 누군가 그 좌표를 일부러 세 조각으로 나눠 전력망에 숨겨 두었다.`,
      missions: [
        { type:'cargo', target:'cargo', label:'기록 케이스 회수', hud:'차폐 케이스를 화물 레일에서 분리해 분석 플랫폼까지 운반하라', rationale:'케이스는 무선 신호와 충격을 동시에 차단하도록 밀봉돼 있다. 원격 전송도 견인 장비도 작동하지 않아 사람이 직접 옮겨야 한다.', outcome:'기록 케이스가 분석 플랫폼에 고정됐다. 손상 없이 판독을 시작할 수 있다.', hold:1.2, minSpawn:12, spawnScale:.64, transmission:'오세현|저 케이스, 선발대 물건 맞습니다. 손잡이 두 개 다 잠그고 옮겨요. 떨어뜨리면 안 열립니다.' },
        { type:'rush', label:'분석 플랫폼 방어', hud:'기록 판독이 끝날 때까지 플랫폼과 케이스를 지켜라', rationale:'차폐를 해제하는 순간 케이스의 고주파 기록이 외부로 샌다. 폭발형 개체가 그 신호를 따라 플랫폼으로 몰려오기 때문에 판독 시간 동안 방어가 필요하다.', outcome:'선발대 기록 판독이 끝났다. 감염 주파수와 C동 좌표의 일부를 복원했다.', minSpawn:18, spawnScale:.75, transmission:'현장통제 박지현|판독 40초 남았습니다. 케이스가 깨지면 좌표도 같이 날아갑니다.' },
        { type:'generator', target:'generator', label:'전력 링 복구', hud:'서측·중앙·북측 전력 링을 복구해 손상된 좌표를 교차 검증하라', rationale:'선발대가 좌표를 한 곳에 남기지 않고 세 전력 구간에 나눠 저장했다. 세 값이 일치해야 C동 방화문이 실제 통로를 선택한다.', outcome:'세 전력 링의 좌표가 일치했다. C동 고정로로 이어지는 안전 진입 시간이 계산됐다.', hold:1.9, count:3, minSpawn:16, spawnScale:.70, transmission:'R-07|첫 좌표만으로는 문이 열리지 않습니다. 나머지 두 구간까지 맞춰 보겠습니다.' }
      ]
    },
    3: {
      title: 'C동, 버티고 있는 벽',
      intro: `C동 고정로는 무너지는 공간을 붙잡기 위해 만든 설비다. 지금도 코어 일부가 시설 붕괴를 늦추고 있다. 문제는 같은 코어가 D동 출구까지 여러 개로 복제해 어느 문도 실제 통로에 닿지 못하게 한다는 점이다.\n\n코어를 한꺼번에 파괴하면 통로와 천장이 함께 무너진다. 외곽 부하를 낮추고, 동·서 제어반으로 붕괴 하중을 빈 구역에 넘긴 뒤, 마지막 고정로를 끊어야 한다.`,
      goal: '고정로의 하중을 안전 구역으로 우회시키고 D동으로 이어지는 실제 통로를 확보하라.',
      ending: `C동 영상 기록에서 한민석은 시설을 보존하겠다고 말하지 않았다. 그는 외부 도심으로 번지는 공간 균열을 막기 위해 내부 구역을 통째로 접어 넣겠다고 보고했다. 회사 임원들은 대피가 끝나지 않았다는 이유로 반대했지만, 이미 지상 바닥이 꺼지고 있었다.\n\n그 선택이 사람을 살렸는지 버렸는지는 D동의 원본 기록을 봐야 판단할 수 있다.`,
      missions: [
        { type:'core', label:'외곽 부하 절단', hud:'외곽 보조 코어 두 개를 파괴해 중앙 고정로의 부하를 낮춰라', rationale:'외곽 코어가 살아 있는 상태에서 제어반을 만지면 복제된 벽이 겹쳐 작업자가 압착된다. 먼저 부하를 절반 이하로 낮춰야 한다.', outcome:'외곽 부하가 낮아졌다. 동·서 제어반이 같은 좌표에 고정됐다.', coreCount:2, minSpawn:12, spawnScale:.66, transmission:'현장통제 박지현|코어 두 개만 먼저 끊어요. 중앙 것까지 건드리면 통로가 같이 내려앉습니다.' },
        { type:'door', target:'blastDoor', label:'붕괴 하중 우회', hud:'동·서 제어반을 작동해 중앙 통로의 하중을 빈 격리 구역으로 넘겨라', rationale:'두 제어반은 문 잠금이 아니라 공간 하중 분배 장치다. 양쪽 값이 맞아야 중앙문을 열어도 사람이 있는 통로가 붕괴하지 않는다.', outcome:'하중 우회값이 일치했다. 중앙 격리문과 D동 연결축이 안정됐다.', hold:1.8, count:2, minSpawn:18, spawnScale:.78, transmission:'R-07|서측 값 입력했습니다. 동측과 오차 3퍼센트. 반대편에서 맞추겠습니다.' },
        { type:'core', label:'주 고정로 차단', hud:'남은 중앙 코어 세 개를 차례로 파괴해 복제 출구를 하나로 수렴시켜라', rationale:'하중을 우회한 지금만 중앙 코어를 제거할 수 있다. 세 코어가 멈춰야 가짜 출구가 사라지고 실제 D동 통로 하나만 남는다.', outcome:'복제 출구가 사라지고 D동 연결축 하나가 남았다. 기록보관구역 진입이 가능하다.', coreCount:3, minSpawn:16, spawnScale:.76, transmission:'오세현|마지막 코어가 꺼지면 벽이 한 번 움직일 겁니다. 소리 나도 멈추지 마세요.' }
      ]
    },
    4: {
      title: 'D동, 기록된 책임',
      intro: `D동은 종이 문서와 필름 원본을 보관한 구역이다. 네트워크 기록은 사고 뒤 여러 차례 수정됐지만, 이곳의 원본은 서로 다른 시간대에 흩어진 채 남아 있다.\n\n좌표 비콘 세 개로 기록실의 시간을 맞추고, 문서를 덮어쓰는 왜곡 코어를 제거한 뒤, 아틀라스 스캐너를 원본 필름 보관실까지 호위해야 한다. 이 과정이 끝나면 회사와 본부, 한민석, 오세현이 각각 어떤 결정을 내렸는지 확인할 수 있다.`,
      goal: 'D동 원본 기록을 복원해 JANUS 사고와 봉쇄 명령의 실제 책임 관계를 확인하라.',
      ending: `원본 기록은 누구 한 사람만의 범죄를 보여 주지 않았다. 메리디안은 위험 경고를 무시하고 실험을 강행했고, 본부는 지상 피해를 우려해 대피 완료 전 봉쇄를 승인했다. 한민석은 그 승인에 따라 시설을 접었고, 오세현은 A동 셔터를 직접 내렸다.\n\n관제 시스템은 한민석의 판단 기록을 복사해 15년 동안 “시설을 열지 말 것”이라는 마지막 명령만 반복했다. 모든 송출과 자동 복구는 E-00 코어에서 이어지고 있다.`,
      missions: [
        { type:'interact', target:'beacon', label:'기록실 시간 고정', hud:'세 기록실에 좌표 비콘을 설치해 원본 문서의 시간 순서를 맞춰라', rationale:'현재 D동의 방들은 서로 다른 시점에 머물러 있다. 세 기준점이 없으면 같은 문서가 서로 다른 내용으로 겹쳐 원본을 구분할 수 없다.', outcome:'세 기록실의 시간 기준이 일치했다. 조작된 문서 좌표와 원본 좌표가 분리됐다.', hold:1.8, count:3, minSpawn:16, spawnScale:.72, transmission:'현장통제 박지현|비콘은 표식이 아닙니다. 세 방의 시간을 같은 초에 맞추는 기준점이에요.' },
        { type:'core', label:'왜곡 기록 제거', hud:'문서 좌표를 덮어쓰는 왜곡 코어 세 개를 파괴하라', rationale:'왜곡 코어가 수정된 보고서를 벽과 문처럼 투사하고 있다. 코어를 없애야 스캐너가 가짜 보관실로 들어가지 않는다.', outcome:'문서 투사가 멈췄다. 원본 필름 보관실의 실제 위치가 드러났다.', coreCount:3, minSpawn:18, spawnScale:.79, transmission:'R-07|같은 결재서가 두 장입니다. 서명 시간이 다릅니다. 코어 쪽 문서가 나중에 덮어쓴 겁니다.' },
        { type:'survive', label:'비콘망 동기화', hud:'기준 시간 동기화가 끝날 때까지 세 비콘과 도킹 전력을 방어하라', rationale:'비콘이 강한 기준 신호를 내자 잔향 개체가 신호원을 파괴하려고 몰린다. 동기화가 끝나야 스캐너 도킹 잠금이 풀린다.', outcome:'시간축 동기화가 완료됐다. 아틀라스 스캐너의 도킹 잠금이 해제됐다.', duration:42, minSpawn:22, spawnScale:.82, transmission:'오세현|비콘 하나라도 꺼지면 방금 본 기록이 다시 섞입니다. 여기서 버텨야 합니다.' },
        { type:'escort', target:'scanner', label:'원본 필름 판독', hud:'아틀라스 스캐너를 원본 필름 보관실까지 호위하라', rationale:'원본 필름은 네트워크와 완전히 분리돼 있다. 스캐너가 직접 도착해 광학 판독을 해야 수정 전 기록을 확보할 수 있다.', outcome:'원본 필름 판독이 끝났다. E-00 코어의 위치와 수동 차단 절차가 복원됐다.', duration:45, minSpawn:20, spawnScale:.84, transmission:'현장통제 박지현|스캐너가 멈추면 기록도 끝입니다. 앞쪽 통로부터 열어 주세요.' }
      ]
    },
    5: {
      title: 'E동, 사람을 보관하는 방식',
      intro: `E-00 코어는 사람을 살려 두는 장치가 아니다. 반복된 움직임과 목소리, 판단을 공간에 남겨 관제 시스템이 계속 재생하도록 만든다. 잔향 개체는 그 기록이 몸에 남은 결과다.\n\n코어를 정지하면 안에 남은 기록도 끝난다. 그러나 송출을 유지하면 구조 신호가 계속 외부 사람을 끌어들이고, 관제는 새로 들어온 사람까지 보관 대상으로 판단한다. R-07은 코어실에 들어가 자동 복구를 끊고 수동 차단을 직접 실행해야 한다.`,
      goal: 'E-00 코어의 압력·증폭·관리자 체계를 순서대로 해제하고 수동 차단을 완료하라.',
      ending: `R-07은 수동 차단 손잡이를 내렸다. 형광등의 진동이 멎고, 복도에서 반복되던 발소리도 하나씩 사라졌다. 오세현은 마지막까지 초소 무전을 듣고 있었지만 더 이상 동료들의 목소리는 나오지 않았다.\n\n지상 구조대는 A동 출구에서 두 사람을 인계했다. 본부는 JANUS 관련 자료를 전면 공개했고, 메리디안과 당시 승인 책임자들에 대한 수사가 시작됐다. 시설은 닫혔지만 철거되지는 못했다. 콘크리트 안쪽에서 공간이 아직 접혀 있었기 때문이다.`,
      waves:5,
      missions: [
        { type:'door', target:'citadelDoor', label:'공진 압력 해제', hud:'서측·중앙·동측 압력 밸브를 열어 코어실 방벽을 낮춰라', rationale:'코어실 방벽은 문짝이 아니라 세 유로의 압력 차로 유지된다. 한 밸브만 열면 남은 유로가 과압돼 통로가 무너진다.', outcome:'세 유로의 압력이 균형을 이뤘다. 중앙 방벽이 내려가 증폭 구역으로 진입할 수 있다.', hold:2.0, count:3, minSpawn:26, spawnScale:.92, transmission:'R-07|서측 압력 내려갑니다. 나머지 두 유로까지 맞춘 뒤 문을 열겠습니다.' },
        { type:'core', label:'증폭망 차단', hud:'네 증폭 코어를 파괴해 잔향 개체의 군집 동기화를 끊어라', rationale:'증폭기는 코어 신호를 각 구역 형광등에 재송출한다. 모두 끊지 않으면 감염체가 한 몸처럼 움직이고 손상된 코어도 다시 켜진다.', outcome:'증폭망이 끊겼다. 잔향 개체의 동기화가 무너지고 코어가 냉각 정전에 들어갔다.', coreCount:4, minSpawn:22, spawnScale:.94, transmission:'현장통제 박지현|증폭기 네 대 확인. 하나라도 남으면 중앙 코어가 다시 붙습니다.' },
        { type:'blackout', label:'냉각 정전 진입', hud:'정전 시간 안에 중앙 제어 구역을 확보하라', rationale:'증폭망 손실로 코어가 과열돼 스스로 조명을 끈다. 시야는 나빠지지만 주파수 출력도 가장 낮아지는 유일한 진입 시간이다.', outcome:'중앙 제어 구역이 확보됐다. 관제 모델이 마지막 관리자 개체를 기동했다.', minSpawn:28, spawnScale:1.0, transmission:'오세현|불 꺼진 지금은 놈들도 서로 위치를 못 잡습니다. 중앙까지 밀고 들어가죠.' },
        { type:'normal', label:'관리자 개체 제거', hud:'코어의 자동 복구를 수행하는 관리자 개체를 제거하라', rationale:'관리자 개체는 한민석의 판단 기록을 생체 인터페이스로 실행한다. 이 연결이 살아 있으면 수동 차단을 내려도 코어가 다시 기동한다.', outcome:'관리자 신호가 끊겼다. 자동 복구가 멈추고 수동 차단 장치가 활성화됐다.', spawnScale:1.04, boss:true, transmission:'한민석 기록|외부 확산을 막는다. 시설은 열지 않는다. 내부 인원은 현 상태로 유지한다.' },
        { type:'interact', target:'shutdown', label:'JANUS 수동 차단', hud:'중앙 차단 장치의 안전 덮개를 열고 수동 손잡이를 끝까지 내려라', rationale:'관리자 개체를 제거해도 코어 자체는 예비 전원으로 다시 켜진다. 현장에서 기계식 차단을 내려야 송출과 재기동 회로가 함께 끊어진다.', outcome:'수동 차단이 완료됐다. JANUS 송출과 자동 재기동 회로가 완전히 정지했다.', hold:3.2, minSpawn:0, spawnScale:.45, transmission:'현장통제 박지현|차단하면 안쪽 신호도 끝납니다. 그래도 계속 켜 두면 다음 구조대가 또 들어옵니다. 판단은 현장에 맡기겠습니다.' }
      ]
    }
  };

  const MISSION_DIALOGUE = {
    1: [
      '현장통제 박지현|허브 앞 통로부터 확보해요. 구조팀이 들어올 퇴로도 같이 봐야 합니다.',
      'R-07|허브 전원함 열겠습니다. 셔터 압력부터 살리고 잠금핀을 풉니다.',
      '오세현|초소 오른쪽이 약합니다. 놈들이 그쪽 벽부터 밀고 있어요.'
    ],
    2: [
      '오세현|선발대 표시 맞습니다. 케이스 두 손잡이 모두 잠근 뒤 옮기세요.',
      '현장통제 박지현|판독 시작합니다. 플랫폼에서 떨어지지 않게 막아 주세요.',
      'R-07|전력 구간 세 곳 확인. 좌표가 맞는지 하나씩 대조하겠습니다.'
    ],
    3: [
      '현장통제 박지현|외곽 두 개만 먼저 끊어요. 중앙 부하는 아직 건드리면 안 됩니다.',
      'R-07|서측 하중값 입력. 동측 제어반으로 이동합니다.',
      '오세현|마지막 코어 뒤에는 벽이 움직입니다. 파괴하고 바로 빠져나오세요.'
    ],
    4: [
      '현장통제 박지현|비콘 세 개가 같은 시간을 가리켜야 원본 위치가 나옵니다.',
      'R-07|수정본 좌표가 코어에서 나옵니다. 먼저 그쪽부터 지우겠습니다.',
      '오세현|비콘 소리가 커졌습니다. 놈들이 전부 이쪽으로 옵니다.',
      '현장통제 박지현|스캐너 도킹 해제됐습니다. 원본 필름실까지 붙어서 이동해요.'
    ],
    5: [
      'R-07|압력 밸브 세 곳 확인. 한 곳씩 열고 수치 맞추겠습니다.',
      '현장통제 박지현|증폭기 네 대입니다. 중앙 코어보다 먼저 끊어야 합니다.',
      '오세현|조명 꺼졌습니다. 중앙까지 가려면 지금 움직여야 합니다.',
      '한민석 기록|외부 확산 방지 절차를 유지한다. 시설 개방 요청은 모두 거부한다.',
      '현장통제 박지현|수동 차단 준비됐습니다. 손잡이를 내리면 송출은 돌아오지 않습니다.'
    ]
  };

  const MISSION_HANDOFF = {
    1: ['통로 확보됐습니다. 허브 전원함으로 이동하세요.', '셔터가 올라갑니다. 초소 쪽 움직임이 늘었습니다.', '오세현 인계 확인. B동 출입카드 내용을 전송받았습니다.'],
    2: ['케이스 고정 완료. 판독 차폐를 해제합니다.', '기록 복원됐습니다. 좌표가 세 조각으로 나뉘어 있습니다.', '세 좌표 일치. C동 진입 시간 창이 열렸습니다.'],
    3: ['외곽 부하 절반 이하. 제어반 작업 가능합니다.', '하중 우회 완료. 중앙 고정로를 끊어도 통로는 버팁니다.', 'D동 연결축 하나만 남았습니다.'],
    4: ['세 기록실 시간이 맞았습니다. 왜곡 좌표가 드러납니다.', '수정 기록 투사가 멈췄습니다. 비콘 동기화를 시작합니다.', '동기화 완료. 스캐너 도킹이 풀렸습니다.', '원본 필름 확보. E-00 수동 차단 절차를 확인했습니다.'],
    5: ['방벽 압력 해제. 증폭 구역 진입 가능합니다.', '증폭망 정지. 냉각 정전이 시작됩니다.', '중앙 제어 구역 확보. 관리자 개체가 기동합니다.', '자동 복구 신호 끊겼습니다. 수동 차단 장치가 열립니다.', 'JANUS 송출 정지 확인.']
  };

  const OBJECT_DIALOGUE = {
    1: {
      relay:['R-07|잠금핀 해제됐습니다. 셔터 모터가 압력을 빼는 중입니다.'],
      survivor:['오세현|경비팀장 오세현입니다. 사고 난 지 열일곱 시간쯤 됐습니다. 밖은 얼마나 지났습니까?']
    },
    2: {
      cargo:['R-07|케이스 연결됐습니다. 뒤쪽 간격 유지하면서 옮기겠습니다.'],
      generator:['현장통제 박지현|전력값 들어왔습니다. 남은 구간과 대조할게요.']
    },
    3: {
      blastDoor:['R-07|제어값 저장됐습니다. 반대편 값이 들어오면 하중이 넘어갑니다.']
    },
    4: {
      beacon:['현장통제 박지현|기준 시간 잡혔습니다. 나머지 기록실과 오차 계산 중입니다.'],
      scanner:['R-07|스캐너 이동 확인. 앞쪽 통로부터 비우겠습니다.']
    },
    5: {
      citadelDoor:['R-07|압력 내려갑니다. 다음 유로로 이동합니다.'],
      shutdown:['R-07|안전 덮개 열었습니다. 수동 차단 내립니다.']
    }
  };

  const SEQUENCES = {
    1: {
      opening: [
        { kicker:'2026.07.22 · 03:18', title:'A동 구조 신호', speaker:'현장통제 박지현', text:'15년 전 폐쇄된 시설에서 사람 목소리가 잡혔습니다. 신호는 셔터 너머 경비 초소에서 반복됩니다.', role:'relay', camera:'A동 중앙 허브', duration:4.1 },
        { kicker:'진입 기록', title:'먼저 길을 만든다', speaker:'R-07', text:'경비동 앞에 움직이는 사람 여섯. 반응은 없습니다. 허브까지 통로부터 확보하겠습니다.', x:-10, z:-20, y:1.2, camera:'R-07 헬멧 카메라', duration:3.9 },
        { kicker:'봉쇄 구조', title:'셔터는 이유 없이 닫힌 문이 아니다', speaker:'현장통제 박지현', text:'저 문은 격리동 압력까지 잡고 있어요. 부수지 말고 허브 절차대로 열어야 합니다.', role:'blastDoor', camera:'A동 방폭 셔터', duration:4.1 }
      ],
      closing: [
        { kicker:'구조 완료', title:'안쪽의 하루, 바깥의 15년', speaker:'오세현', text:'열일곱 시간쯤 버틴 줄 알았습니다. 밖에서 15년이 지났다는 말은 아직 믿기 어렵습니다.', role:'survivor', camera:'후방 인계 지점', duration:4.5 },
        { kicker:'현장 진술', title:'셔터를 내린 사람', speaker:'오세현', text:'그 셔터, 제가 내렸습니다. 밖으로 번지는 걸 막으라는 지시였습니다. 안에 남은 사람들 이름도 다 기억합니다.', x:14, z:-10, y:1.2, camera:'A동 봉쇄선', duration:4.7 },
        { kicker:'다음 좌표', title:'돌아오지 않은 선발대', speaker:'현장통제 박지현', text:'오세현 팀장의 카드에서 선발대 3조 호출부호가 확인됐습니다. 마지막 위치는 B동 화물축입니다.', x:0, z:30, y:1.3, camera:'북측 연결축', duration:4.2 }
      ]
    },
    2: {
      opening: [
        { kicker:'선발대 3조 · 연락 두절 06:12', title:'마지막 화물', speaker:'현장통제 박지현', text:'세 명이 먼저 들어왔고, 마지막 보고는 기록 케이스 확보였습니다. 생체 신호는 B동에서 동시에 끊겼습니다.', role:'cargo', camera:'B동 화물 레일', duration:4.2 },
        { kicker:'장비 조건', title:'직접 옮겨야 하는 이유', speaker:'오세현', text:'차폐 케이스는 안테나도 견인 장치도 막습니다. 손잡이를 잠그고 사람이 옮기는 수밖에 없습니다.', role:'cargoZone', camera:'분석 플랫폼', duration:4.0 },
        { kicker:'위험 예고', title:'판독 신호가 놈들을 부른다', speaker:'R-07', text:'플랫폼 주변에 폭발 흔적이 집중돼 있습니다. 판독을 시작하면 방어가 필요합니다.', x:32, z:-20, y:1.3, camera:'B동 분석 구역', duration:4.0 }
      ],
      closing: [
        { kicker:'선발대 기록 복원', title:'감염은 물림이 아니었다', speaker:'선발대 강서윤', text:'조명 주파수를 끊으십시오. 오래 들은 사람부터 같은 행동을 반복합니다. 얼굴을 알아봐도 가까이 가지 마십시오.', role:'cargoZone', camera:'분석 플랫폼', duration:4.8 },
        { kicker:'좌표 교차 검증', title:'C동으로 가는 한 개의 길', speaker:'R-07', text:'세 전력 구간 좌표가 일치합니다. 선발대가 일부러 나눠 둔 겁니다. 누군가 한 구간만 바꿔도 문이 열리지 않게.', role:'generator', camera:'B동 전력 링', duration:4.4 },
        { kicker:'작전 계속', title:'기록을 남긴 이유', speaker:'현장통제 박지현', text:'선발대는 돌아오지 못했지만 다음 사람이 틀린 문을 열지 않도록 좌표를 남겼습니다. 그 좌표로 갑니다.', x:0, z:-36, y:1.3, camera:'C동 방화문', duration:4.2 }
      ]
    },
    3: {
      opening: [
        { kicker:'C동 고정로', title:'길을 막는 장치가 천장도 받치고 있다', speaker:'현장통제 박지현', text:'코어를 전부 한 번에 끊으면 출구와 천장이 같이 내려앉습니다. 외곽 부하부터 낮춰요.', role:'machine', camera:'외곽 고정 코어', duration:4.3 },
        { kicker:'하중 우회', title:'문을 여는 일이 아니라 무게를 옮기는 일', speaker:'R-07', text:'동·서 제어반이 중앙 통로 하중을 빈 격리 구역으로 넘깁니다. 두 값이 맞아야 합니다.', role:'blastDoor', camera:'C동 중앙 격리문', duration:4.2 },
        { kicker:'현장 경고', title:'마지막 코어 뒤에는 같은 벽이 없다', speaker:'오세현', text:'사고 때도 여기서 길이 바뀌었습니다. 코어가 꺼지면 뒤돌아보지 말고 열린 쪽으로 이동하세요.', x:0, z:20, y:1.2, camera:'C동 북측 연결로', duration:4.1 }
      ],
      closing: [
        { kicker:'복원 영상 · 2011.04.17', title:'봉쇄 승인', speaker:'한민석 기록', text:'지상 균열이 확장 중이다. 대피 완료를 기다리면 외부 구역까지 접힌다. 내부 시설을 전이 공간 안에 봉쇄한다.', x:0, z:0, y:1.5, camera:'C동 중앙 기록기', duration:5.0 },
        { kicker:'판단의 대가', title:'완성하려 한 것이 아니라 막으려 했다', speaker:'R-07', text:'사고를 이용한 건 맞습니다. 하지만 마지막 선택은 외부 확산을 막는 쪽이었습니다. 누가 그 선택을 승인했는지 확인해야 합니다.', x:0, z:32, y:1.3, camera:'D동 연결축', duration:4.8 },
        { kicker:'원본 기록 위치 확인', title:'D동 아틀라스', speaker:'현장통제 박지현', text:'네트워크 기록은 수정됐습니다. 종이와 필름 원본이 남아 있는 D동으로 이동합니다.', x:0, z:38, y:1.3, camera:'북측 출구', duration:4.1 }
      ]
    },
    4: {
      opening: [
        { kicker:'D동 아틀라스', title:'같은 문서가 서로 다른 시간을 가리킨다', speaker:'R-07', text:'결재서 두 장이 같은 서명을 갖고 있습니다. 작성 시각만 11분 차이입니다.', role:'beacon', camera:'남서 기록실', duration:4.2 },
        { kicker:'복원 절차', title:'비콘은 위치 표시가 아니다', speaker:'현장통제 박지현', text:'세 기록실의 시계를 같은 초에 맞춰야 원본과 수정본을 나눌 수 있습니다.', role:'scanner', camera:'아틀라스 스캐너 도크', duration:4.2 },
        { kicker:'오세현 진술', title:'기록 안에 남은 자신의 서명', speaker:'오세현', text:'A동 셔터 승인서에 제 이름이 있을 겁니다. 제가 직접 눌렀으니까요. 숨길 생각 없습니다.', x:-30, z:30, y:1.2, camera:'D동 원본 서고', duration:4.5 }
      ],
      closing: [
        { kicker:'원본 필름 판독', title:'한 사람의 잘못으로 끝나지 않는다', speaker:'현장통제 박지현', text:'회사는 위험 경고를 묵살했고, 본부는 대피 전 봉쇄를 승인했습니다. 한민석은 승인대로 시설을 접었습니다.', role:'scanner', camera:'원본 필름 보관실', duration:5.0 },
        { kicker:'관제 모델 확인', title:'15년 동안 반복된 마지막 명령', speaker:'R-07', text:'현재 관제는 살아 있는 한민석이 아닙니다. 그의 판단 기록이 “시설을 열지 말라”는 명령만 계속 실행하고 있습니다.', x:40, z:-36, y:1.3, camera:'D동 스캐너 종착점', duration:4.8 },
        { kicker:'송출원 좌표', title:'E-00', speaker:'오세현', text:'저 코어를 끄면 안에 남은 목소리도 끝납니다. 그래도 켜 두면 밖에서 또 사람이 들어옵니다.', x:0, z:-42, y:1.3, camera:'E동 연결문', duration:4.7 }
      ]
    },
    5: {
      opening: [
        { kicker:'E-00 JANUS CORE', title:'사람을 살려 둔 것이 아니다', speaker:'현장통제 박지현', text:'코어 안에는 생체 신호가 없습니다. 행동과 목소리, 판단 기록만 반복 재생되고 있습니다.', x:0, z:0, y:1.7, camera:'JANUS 중앙 코어', duration:4.7 },
        { kicker:'진입 순서', title:'압력, 증폭, 관리자, 수동 차단', speaker:'R-07', text:'방벽 압력을 내리고 증폭망을 끊습니다. 관리자 개체 제거 후 제가 직접 차단 손잡이를 내립니다.', role:'citadelDoor', camera:'코어실 방벽', duration:4.5 },
        { kicker:'마지막 확인', title:'정지하면 되돌릴 수 없다', speaker:'오세현', text:'알고 있습니다. 그래도 여기서 계속 사람을 부르게 둘 수는 없습니다. 들어가죠.', x:0, z:28, y:1.3, camera:'E동 진입축', duration:4.4 }
      ],
      closing: [
        { kicker:'관리자 신호 소멸', title:'자동 복구 정지', speaker:'현장통제 박지현', text:'관리자 연결 끊겼습니다. 이제 코어가 스스로 차단을 되돌릴 수 없습니다.', x:0, z:0, y:1.7, camera:'JANUS 중앙 코어', duration:4.2 },
        { kicker:'수동 차단', title:'마지막 손잡이', speaker:'R-07', text:'차단 내립니다. 송출과 예비 전원 함께 끊습니다.', role:'shutdown', camera:'E-00 수동 차단반', duration:4.5 },
        { kicker:'03:57', title:'형광등 소리가 멎었다', speaker:'오세현', text:'초소 무전도 끊겼습니다. 이제 정말 끝난 것 같습니다.', x:0, z:28, y:1.2, camera:'E동 출구 방향', duration:4.6 }
      ],
      finale: [
        { kicker:'지상 인계 기록', title:'두 명 생존', speaker:'현장통제 박지현', text:'R-07과 오세현 팀장, A동 출구에서 인계했습니다. 추가 구조 신호는 없습니다.', x:0, z:48, y:1.3, camera:'E동 남측 회수축', duration:4.8 },
        { kicker:'사고 자료 공개', title:'15년 동안 봉인된 책임', speaker:'뉴스 음성', text:'정부는 JANUS 사고 자료를 공개하고 메리디안 관계자와 당시 승인 책임자들에 대한 수사에 착수했습니다.', black:true, duration:5.0 },
        { kicker:'철거 보류', title:'시설은 닫혔지만 없어지지 않았다', speaker:'현장 기록', text:'콘크리트 절단면 안쪽에서 동일한 복도가 다시 확인됐다. 공간은 더 이상 사람을 부르지 않지만, 아직 접혀 있다.', black:true, duration:5.2 },
        { kicker:'BOXHEAD: BACKROOM LOW', title:'END', speaker:'', text:'JANUS 격리 작전 종료', black:true, duration:4.2 }
      ]
    }
  };

  function apply() {
    const seed = window.__game;
    if (!seed || seed.__v62PatchApplied) return;
    if (seed.build === BUILD) return;
    const proto = Object.getPrototypeOf(seed);
    seed.__v62PatchApplied = true;
    proto.__v62PatchApplied = true;

    // STORY_CHAPTERS 배열의 개별 객체는 동결되지 않았으므로 메뉴와 브리핑이 같은 대본을 보도록 원본 객체를 갱신한다.
    for (const [idText, replacement] of Object.entries(STORY_V62)) {
      const id = Number(idText);
      const chapter = seed.getStoryChapter?.(id);
      if (!chapter) continue;
      Object.assign(chapter, replacement);
      chapter.missions = replacement.missions.map(mission => ({ ...mission }));
      if (replacement.waves) chapter.waves = replacement.waves;
    }
    seed.renderStoryMenu?.();

    const Vector3 = seed.camera?.position?.constructor;
    const Quaternion = seed.camera?.quaternion?.constructor;
    const Matrix4 = seed.camera?.matrix?.constructor;

    const baseQueueDialogue = proto.queueDialogue;
    proto.queueV62Dialogue = function(raw, options = {}) {
      return baseQueueDialogue.call(this, raw, options);
    };
    proto.queueDialogue = function(raw, options = {}) {
      if (this.runMode === 'story' && this.__v62SuppressLegacyDialogue !== false) {
        const text = typeof raw === 'string' ? raw : raw?.text || '';
        if (/작전 실패|생체 신호 소실|오세현 사망/.test(text)) {
          return baseQueueDialogue.call(this, '현장통제 박지현|구조 대상 생체 신호가 끊겼습니다. 현재 작전은 중단합니다.', options);
        }
        return;
      }
      return baseQueueDialogue.call(this, raw, options);
    };

    const previousQueueSequence = proto.queueStoryDialogueSequence;
    proto.queueStoryDialogueSequence = function(lines = [], initialDelay = 0) {
      if (this.runMode === 'story' && this.__v62SuppressLegacyIntro) return;
      return previousQueueSequence.call(this, lines, initialDelay);
    };

    proto.ensureEpisodeSequenceOverlay = function() {
      let el = document.getElementById('episode-sequence');
      if (el) return el;
      el = document.createElement('section');
      el.id = 'episode-sequence';
      el.className = 'episode-sequence';
      el.setAttribute('aria-live', 'polite');
      el.innerHTML = `
        <div class="episode-sequence-shade"></div>
        <i class="episode-sequence-bar top"></i><i class="episode-sequence-bar bottom"></i>
        <div class="episode-sequence-camera"><span id="episode-sequence-camera"></span><em>● REC</em></div>
        <div class="episode-sequence-copy">
          <small id="episode-sequence-kicker"></small>
          <h2 id="episode-sequence-title"></h2>
          <b id="episode-sequence-speaker"></b>
          <p id="episode-sequence-text"></p>
          <div id="episode-sequence-dots" class="episode-sequence-dots"></div>
        </div>`;
      document.body.appendChild(el);
      return el;
    };

    proto.findEpisodeSequenceTarget = function(step = {}) {
      if (step.role) {
        const candidates = (this.storyObjects || []).filter(o => o.role === step.role);
        const target = candidates.find(o => !o.door) || candidates[0];
        if (target) return target;
      }
      if (Number.isFinite(step.x) && Number.isFinite(step.z)) {
        return { x:step.x, y:Number(step.y) || 1.35, z:step.z, label:step.camera || step.title, cameraLabel:step.camera || step.title, forceCutaway:true };
      }
      return null;
    };

    proto.makeEpisodeSequencePose = function(step = {}) {
      if (step.black || !Vector3 || !Quaternion || !Matrix4) return null;
      const target = this.findEpisodeSequenceTarget(step);
      if (!target) return null;
      let pose = this.getStoryCinematicCameraPose?.(target, true) || null;
      if (!pose) {
        const targetPoint = new Vector3(target.x, Number(target.y) || 1.35, target.z);
        const half = (this.map?.size || 80) / 2 - 2;
        const position = new Vector3(clamp(target.x + 5.8, -half, half), 3.4, clamp(target.z + 5.8, -half, half));
        const matrix = new Matrix4().lookAt(position, targetPoint, new Vector3(0,1,0));
        pose = { position, quaternion:new Quaternion().setFromRotationMatrix(matrix), targetPoint, label:step.camera || target.label || '시설 카메라' };
      }
      const finish = pose.position.clone();
      const targetPoint = pose.targetPoint?.clone?.() || new Vector3(target.x, Number(target.y)||1.35, target.z);
      const away = finish.clone().sub(targetPoint);
      if (away.lengthSq() > .001) away.normalize();
      const start = finish.clone().add(away.multiplyScalar(1.25));
      start.y += .18;
      return { start, finish, quaternion:pose.quaternion.clone(), targetPoint, label:step.camera || pose.label || '시설 카메라' };
    };

    proto.startEpisodeSequence = function(kind = 'opening', options = {}) {
      if (this.runMode !== 'story' || !this.storyChapter) {
        options.onComplete?.();
        return false;
      }
      const chapterId = this.storyChapter.id;
      const chapterSet = SEQUENCES[chapterId] || {};
      let steps = [...(chapterSet[kind] || [])];
      if (kind === 'closing' && chapterId === 5) steps = [...steps, ...(chapterSet.finale || [])];
      if (!steps.length) {
        options.onComplete?.();
        return false;
      }
      const el = this.ensureEpisodeSequenceOverlay();
      this.storyEpisodeSequence = { kind, steps, index:-1, elapsed:0, duration:0, pose:null, onComplete:options.onComplete || null, viewWeaponWasVisible:this.viewWeapon?.visible !== false };
      if (this.viewWeapon) this.viewWeapon.visible = false;
      this.storyEpisodeSequenceActive = true;
      this.storyCinematicQueue = [];
      this.storyCinematicState = null;
      this.dialogueQueue = [];
      this.dialogueActive = null;
      document.getElementById('story-dialogue')?.classList.remove('show');
      document.getElementById('story-cinematic')?.classList.remove('show','cctv-feed','cctv-switch');
      document.body.classList.add('episode-sequence-active','story-sequence-active');
      el.classList.add('show');
      el.classList.toggle('ending', kind === 'closing');
      this.advanceEpisodeSequenceStep();
      this.audio?.duckMusic?.(.32, 20, .8);
      return true;
    };

    proto.advanceEpisodeSequenceStep = function() {
      const state = this.storyEpisodeSequence;
      if (!state) return;
      state.index += 1;
      if (state.index >= state.steps.length) {
        this.finishEpisodeSequence();
        return;
      }
      const step = state.steps[state.index];
      state.elapsed = 0;
      state.duration = Math.max(2.4, Number(step.duration) || 4);
      state.pose = this.makeEpisodeSequencePose(step);
      const el = this.ensureEpisodeSequenceOverlay();
      el.classList.remove('step-visible','black-frame');
      if (step.black) el.classList.add('black-frame');
      const kicker = document.getElementById('episode-sequence-kicker');
      const title = document.getElementById('episode-sequence-title');
      const speaker = document.getElementById('episode-sequence-speaker');
      const text = document.getElementById('episode-sequence-text');
      const camera = document.getElementById('episode-sequence-camera');
      if (kicker) kicker.textContent = step.kicker || '';
      if (title) title.textContent = step.title || '';
      if (speaker) { speaker.textContent = step.speaker || ''; speaker.style.display = step.speaker ? 'block' : 'none'; }
      if (text) text.textContent = step.text || '';
      if (camera) camera.textContent = state.pose?.label || step.camera || (step.black ? 'ARCHIVE' : 'R-07 BODY CAM');
      const dots = document.getElementById('episode-sequence-dots');
      if (dots) dots.innerHTML = state.steps.map((_,i)=>`<i class="${i===state.index?'active':i<state.index?'done':''}"></i>`).join('');
      window.requestAnimationFrame?.(() => el.classList.add('step-visible'));
      this.audio?.storyStinger?.(this.storyEpisodeSequence.kind === 'closing' ? 'info' : 'danger');
    };

    proto.updateEpisodeSequence = function(dt = 0) {
      const state = this.storyEpisodeSequence;
      if (!state) return;
      state.elapsed += dt;
      const progress = clamp(state.elapsed / state.duration, 0, 1);
      const el = document.getElementById('episode-sequence');
      el?.style.setProperty('--episode-progress', `${progress * 100}%`);
      el?.classList.toggle('transitioning', progress < .10 || progress > .90);
      if (progress >= 1) this.advanceEpisodeSequenceStep();
    };

    proto.finishEpisodeSequence = function() {
      const state = this.storyEpisodeSequence;
      if (!state) return;
      const callback = state.onComplete;
      if (this.viewWeapon) this.viewWeapon.visible = state.viewWeaponWasVisible !== false;
      this.storyEpisodeSequence = null;
      this.storyEpisodeSequenceActive = false;
      const el = document.getElementById('episode-sequence');
      el?.classList.remove('show','step-visible','black-frame','transitioning','ending');
      document.body.classList.remove('episode-sequence-active','story-sequence-active');
      if (this.__v62PendingMissionLine) {
        const line = this.__v62PendingMissionLine;
        this.__v62PendingMissionLine = '';
        this.queueV62Dialogue?.(line, { delay:.35 });
      }
      callback?.();
    };

    const previousIsLocked = proto.isStoryControlLocked;
    proto.isStoryControlLocked = function() {
      return !!this.storyEpisodeSequenceActive || previousIsLocked.call(this);
    };

    const previousUpdateSystems = proto.updateStorySystems;
    proto.updateStorySystems = function(dt) {
      const result = previousUpdateSystems.call(this, dt);
      if (this.storyEpisodeSequenceActive) this.updateEpisodeSequence?.(dt);
      return result;
    };

    const previousUpdateCamera = proto.updateCamera;
    proto.updateCamera = function(dt = 0) {
      previousUpdateCamera.call(this, dt);
      const state = this.storyEpisodeSequence;
      const pose = state?.pose;
      if (!state || !pose || !this.camera) return;
      if (this.viewWeapon) this.viewWeapon.visible = false;
      const p = ease(clamp(state.elapsed / Math.max(.01, state.duration), 0, 1));
      this.camera.position.lerpVectors(pose.start, pose.finish, p * .72);
      this.camera.quaternion.copy(pose.quaternion);
      if (Math.abs(this.camera.fov - 56) > .02) {
        this.camera.fov = 56;
        this.camera.updateProjectionMatrix();
      }
    };

    const previousPlayMotion = proto.playStoryMotion;
    proto.playStoryMotion = function(title, copy, target, kind) {
      if (this.runMode === 'story' && ['MISSION UPDATE','작전 결과'].includes(String(title))) {
        if (copy) this.showCenterAlert?.(title === 'MISSION UPDATE' ? (this.currentMission?.label || '작전 갱신') : '작전 단계 완료', String(copy).replace(/작전 근거:\s*/g,''), 'info', 2.8);
        return;
      }
      if (this.runMode === 'story' && String(title).includes('격리동 방폭 셔터')) {
        title = 'A동 방폭 셔터 개방';
        copy = '허브가 압력을 먼저 낮춘 뒤 잠금핀을 풀었다. 격리동 통로가 안전하게 열렸다.';
      }
      if (this.runMode === 'story' && title === '격리문 개방') copy = '양쪽 제어값이 일치해 중앙 통로의 하중이 빈 구역으로 넘어갔다.';
      return previousPlayMotion.call(this, title, copy, target, kind);
    };

    const previousSetup = proto.setupStoryEnvironment;
    proto.setupStoryEnvironment = function(...args) {
      const result = previousSetup.apply(this, args);
      if (this.runMode !== 'story') return result;
      const chapter = this.storyChapter?.id;
      const purpose = {
        1: {
          relay:['셔터 잠금핀보다 먼저 격리동 압력을 정상화하는 중앙 허브다.','허브 복구 후 방폭 셔터가 안전 순서로 열린다.'],
          survivor:['사고 당시 방폭 셔터를 직접 내린 경비팀장이다. B동 출입카드와 현장 진술을 갖고 있다.','오세현을 후방 구조선까지 호위해 B동 진입 근거를 확보한다.']
        },
        2: {
          cargo:['선발대 3조가 남긴 공진 차폐 기록 케이스다. 무선 판독이 불가능하다.','분석 플랫폼으로 옮겨 선발대의 마지막 기록을 복원한다.'],
          generator:['선발대가 나눠 숨긴 C동 좌표 한 조각을 보관한 전력 링이다.','세 구간의 좌표가 일치해야 실제 C동 문이 열린다.']
        },
        3: {
          blastDoor:['중앙문 잠금이 아니라 공간 붕괴 하중을 빈 구역으로 넘기는 제어반이다.','동·서 값이 일치하면 중앙 통로를 안전하게 열 수 있다.'],
          machine:['시설 붕괴를 늦추지만 출구를 복제해 막고 있는 고정 설비다.','부하 우회 뒤 정지시켜 D동 통로를 하나로 수렴시킨다.']
        },
        4: {
          beacon:['서로 다른 시간에 머문 기록실을 같은 초로 맞추는 기준 장치다.','세 기준점이 일치하면 원본과 수정본 좌표가 분리된다.'],
          scanner:['네트워크에서 분리된 필름 원본을 현장에서 광학 판독하는 장비다.','필름 보관실까지 호위해 수정 전 사고 기록을 확보한다.']
        },
        5: {
          citadelDoor:['코어실 방벽을 유지하는 세 압력 유로의 수동 밸브다.','세 유로 압력이 맞아야 중앙 방벽이 안전하게 내려간다.'],
          machine:['코어 신호를 형광등과 잔향 개체에 재송출하는 증폭 설비다.','증폭망을 끊어 군집 동기화와 자동 복구를 약화한다.']
        }
      }[chapter] || {};
      for (const [role, values] of Object.entries(purpose)) {
        for (const object of (this.storyObjects || []).filter(o => o.role === role && !o.door)) {
          object.purpose = values[0];
          object.result = values[1];
        }
      }
      if (chapter === 5 && !(this.storyObjects || []).some(o => o.role === 'shutdown')) {
        const template = (this.storyObjects || []).find(o => o.role === 'citadelDoor' && !o.door) || (this.storyObjects || []).find(o => o.group);
        if (template?.group) {
          const group = template.group.clone(true);
          group.position.set(0,0,-12);
          group.visible = false;
          this.scene.add(group);
          const collider = { x:0,z:-12,w:1.65,d:1.35,kind:'storyInteractive',hp:Infinity,maxHp:Infinity,mesh:group,extras:[],crackLevel:0,crackGroup:null,alive:false,storyDecor:true,dynamicStory:true };
          this.obstacles.push(collider);
          const marker = template.marker?.clone?.(true) || null;
          if (marker) { marker.position.set(0,0,-12); marker.visible=false; this.scene.add(marker); }
          const shutdown = {
            role:'shutdown',x:0,z:-12,group,collider,rotor:group.children?.find?.(c=>c.geometry===this.geos?.mineButton) || null,marker,
            markerRing:marker?.children?.[0] || null,markerArrow:marker?.children?.[1] || null,active:false,done:false,hold:0,completeAnim:0,
            label:'JANUS 수동 차단반',baseY:0,pulse:0,destination:null,
            purpose:'예비 전원과 자동 재기동 회로를 기계적으로 함께 끊는 마지막 차단 장치다.',
            result:'송출과 자동 재기동 회로가 함께 끊겨 JANUS가 다시 켜지지 않는다.',
            cameraLabel:'E-00 수동 차단반',forceCutaway:false
          };
          this.storyObjects.push(shutdown);
          this.collisionIndexDirty = true;
          this.markNavDirty?.();
        }
      }
      return result;
    };

    const previousActivate = proto.activateStoryMissionObjects;
    proto.activateStoryMissionObjects = function(...args) {
      const result = previousActivate.apply(this, args);
      if (this.runMode !== 'story') return result;
      if (this.storyChapter?.id === 5) {
        const shutdown = (this.storyObjects || []).find(o => o.role === 'shutdown');
        const active = this.currentMission?.target === 'shutdown';
        if (shutdown?.group) shutdown.group.visible = active;
        if (shutdown?.collider) shutdown.collider.alive = active;
        if (shutdown?.marker) shutdown.marker.visible = active;
      }
      return result;
    };

    const previousStartMission = proto.startMissionForWave;
    proto.startMissionForWave = function(plannedMission = null) {
      const result = previousStartMission.call(this, plannedMission);
      if (this.runMode !== 'story') return result;
      const chapter = this.storyChapter?.id;
      const line = MISSION_DIALOGUE[chapter]?.[Math.max(0, this.wave - 1)] || this.currentMission?.transmission;
      if (line) {
        if (this.storyEpisodeSequenceActive || this.__v62OpeningPending) this.__v62PendingMissionLine = line;
        else this.queueV62Dialogue?.(line, { delay:.55 });
      }
      if (chapter === 5 && this.wave === 5) {
        this.spawnQueue = 0;
        for (const enemy of this.enemies || []) {
          enemy.alive = false;
          if (enemy.mesh?.parent) this.scene.remove(enemy.mesh);
        }
        this.showCenterAlert?.('최종 절차', '전투는 끝났습니다. 중앙 수동 차단반으로 이동해 송출을 종료하세요.', 'info', 4.0);
      }
      return result;
    };

    const previousCompleteInteraction = proto.completeStoryInteraction;
    proto.completeStoryInteraction = function(object) {
      const chapter = this.storyChapter?.id;
      const role = object?.role;
      const siblings = (this.storyObjects || []).filter(o => o.role === role && !o.door);
      const index = Math.max(0, siblings.indexOf(object));
      const result = previousCompleteInteraction.call(this, object);
      const pool = OBJECT_DIALOGUE[chapter]?.[role];
      const line = pool?.[Math.min(index, pool.length - 1)];
      if (line) this.queueV62Dialogue?.(line, { delay:.18 });
      return result;
    };

    const previousFinishMission = proto.finishMissionWave;
    proto.finishMissionWave = function(title = 'MISSION CLEAR') {
      const chapter = this.storyChapter?.id;
      const wave = this.wave;
      const line = MISSION_HANDOFF[chapter]?.[Math.max(0,wave-1)];
      if (line && !(chapter === 5 && wave === 5)) this.queueV62Dialogue?.(`현장통제 박지현|${line}`, { delay:.2 });
      return previousFinishMission.call(this, title);
    };

    const previousCompleteWave = proto.completeWave;
    proto.completeWave = function() {
      if (this.runMode === 'story' && this.storyChapter?.id === 5 && this.wave === 4 && !this.__v62FinalTransitionScheduled) {
        this.__v62FinalTransitionScheduled = true;
        this.waveBreak = 0;
        this.cleanupObjectiveCores?.(false);
        this.score += Math.round(120 + this.wave * 35);
        this.spawnQueue = 0;
        this.prepPhase = false;
        this.rewardOpen = false;
        setTimeout(() => {
          if (!this.running || this.gameOver || this.storyChapter?.id !== 5) return;
          this.missionCompletePending = false;
          this.nextWave();
        }, 1250);
        return;
      }
      return previousCompleteWave.call(this);
    };

    const previousReset = proto.resetWorld;
    proto.resetWorld = function(...args) {
      this.__v62SuppressLegacyDialogue = true;
      this.__v62SuppressLegacyIntro = true;
      this.__v62OpeningPending = true;
      this.__v62FinalTransitionScheduled = false;
      const result = previousReset.apply(this, args);
      this.__v62SuppressLegacyIntro = false;
      if (this.runMode === 'story') {
        this.dialogueQueue = [];
        this.dialogueActive = null;
        this.startEpisodeSequence?.('opening', {
          onComplete: () => {
            this.__v62OpeningPending = false;
            if (!this.__v62PendingMissionLine) {
              const line = MISSION_DIALOGUE[this.storyChapter?.id]?.[Math.max(0,this.wave-1)];
              if (line) this.queueV62Dialogue?.(line, { delay:.25 });
            }
          }
        });
      } else {
        this.__v62OpeningPending = false;
      }
      return result;
    };

    const previousCompleteChapter = proto.completeStoryChapter;
    proto.completeStoryChapter = function() {
      if (this.runMode !== 'story' || !this.storyChapter) return previousCompleteChapter.call(this);
      if (this.__v62ChapterEndingDone) {
        this.__v62ChapterEndingDone = false;
        return previousCompleteChapter.call(this);
      }
      if (this.storyEpisodeSequenceActive || this.__v62ChapterEndingPending) return;
      this.__v62ChapterEndingPending = true;
      this.startEpisodeSequence?.('closing', {
        onComplete: () => {
          this.__v62ChapterEndingPending = false;
          this.__v62ChapterEndingDone = true;
          previousCompleteChapter.call(this);
        }
      });
    };

    const previousClear = proto.clearStoryRuntimeState;
    proto.clearStoryRuntimeState = function(...args) {
      const result = previousClear.apply(this, args);
      this.storyEpisodeSequence = null;
      this.storyEpisodeSequenceActive = false;
      this.__v62ChapterEndingPending = false;
      this.__v62ChapterEndingDone = false;
      this.__v62OpeningPending = false;
      this.__v62PendingMissionLine = '';
      this.__v62FinalTransitionScheduled = false;
      document.getElementById('episode-sequence')?.classList.remove('show','step-visible','black-frame','transitioning','ending');
      document.body.classList.remove('episode-sequence-active');
      return result;
    };

    seed.build = BUILD;
    window.BOXHEAD_BUILD = BUILD;
    document.documentElement.dataset.boxheadBuild = BUILD;
  }

  if (window.__game) apply();
  else addEventListener('DOMContentLoaded', apply, { once:true });
})();
