# v47 온라인 배포 메모

> 1인용 완성 웹판은 서버 없이 `client/`만 GitHub Pages에 배포하면 된다. 아래 Node 서버 절차는 선택 사항인 2인 협동 실험 기능에만 필요하다.

## 로컬 실행

```bash
npm install
npm start
```

브라우저에서 `http://localhost:3000` 접속.

## 같은 서버에 클라이언트까지 같이 올리는 방식

Render, Railway, Fly.io, VPS 같은 Node 서버에 이 폴더 전체를 올리면 된다. 서버가 `client/`를 정적 파일로 제공하고 Socket.IO도 같은 주소에서 열린다.

필수 환경변수:

```txt
PORT=3000
```

호스팅 서비스가 `PORT`를 자동으로 주면 따로 지정하지 않아도 된다.

## 클라이언트와 서버를 분리하는 방식

예를 들어 client는 Netlify/Vercel에 올리고, server는 Render/Railway에 올릴 수 있다.

1. 서버 배포 후 서버 주소를 확인한다.
2. `client/config.js`의 `SERVER_URL`을 서버 주소로 바꾼다.

```js
window.BHFPS_CONFIG = {
  SERVER_URL: 'https://your-boxhead-server.onrender.com',
  FORCE_WEBSOCKET: false
};
```

3. 서버 환경변수에 클라이언트 주소를 허용한다.

```txt
CORS_ORIGIN=https://your-game.netlify.app
```

## 테스트 순서

1. `/health`가 `{ ok: true }`를 반환하는지 확인.
2. 클라이언트 우측 상단 또는 로비에서 `PING`이 표시되는지 확인.
3. 탭 A에서 방 만들기.
4. 탭 B에서 방 코드 입장.
5. 둘 다 준비 후 시작.
6. 한 탭을 새로고침했을 때 같은 방으로 재접속되는지 확인.

## 아직 남은 온라인 작업

- 실제 인터넷 환경에서 패킷 지연/끊김 테스트
- 지연이 큰 환경에서 위치 보정 튐 완화
- 방 목록/초대 링크 UI
- 관전자 모드 또는 재접속 중 대기 화면
- 서버 권위 판정의 보안 강화
