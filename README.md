# Boxhead LowPoly FPS v36 Deploy Ready

Boxhead식 웨이브 생존 FPS 프로토타입의 v36 버전이다.
이번 단계는 실제 온라인 2인 플레이를 외부 서버에 올릴 수 있도록 배포 준비, 서버 주소 분리, 핑 표시, 재접속 기반을 추가한 버전이다.

## 실행

```bash
npm install
npm start
```

브라우저:

```txt
http://localhost:3000
```

## v36 변경점

- 배포용 서버 구조 보강
  - `PORT` 환경변수 지원
  - `/health`, `/api/status` 추가
  - `render.yaml`, `Procfile`, `.env.example`, `DEPLOYMENT.md` 추가

- 클라이언트/서버 주소 분리 준비
  - `client/config.js` 추가
  - `?server=https://서버주소` 쿼리로도 서버 지정 가능
  - Socket.IO CDN fallback 추가

- 핑 표시 추가
  - 게임 HUD 우측 상단에 `PING ms` 표시
  - 지연이 높으면 색이 바뀜

- 재접속 기반 추가
  - 브라우저별 player token 저장
  - 서버 재접속 시 같은 방/같은 플레이어 슬롯으로 복구 시도
  - 서버는 연결이 끊긴 플레이어를 즉시 삭제하지 않고 TTL 동안 보존

- 서버 안정화 준비
  - 방 TTL 정리 개선
  - disconnect 시 soft leave 처리
  - reconnect join 처리

## 온라인 테스트

1. `npm start` 실행
2. 브라우저 탭 A에서 2인 플레이 준비 → 방 만들기
3. 브라우저 탭 B에서 같은 주소 접속 → 방 코드 입력 → 입장
4. 두 명 모두 준비
5. 호스트가 시작
6. 게임 중 한 탭 새로고침 후 같은 방에 다시 붙는지 확인

## 다음 단계 제안

v37은 실제 인터넷 환경에서의 안정화 단계가 적절하다.
추천 작업은 초대 링크 생성, 방 코드 자동 복사, 재접속 중 대기 화면, 네트워크 지연이 클 때의 위치 튐 완화, 그리고 서버 로그/관리 화면 추가다.
