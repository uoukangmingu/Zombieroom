# GitHub Pages

GitHub Pages는 `client/`의 정적 게임 화면을 제공할 수 있습니다.
번들에 필요한 코드가 포함되어 싱글플레이는 별도 서버 없이 실행됩니다.
루트 `index.html`은 `client/`로 연결됩니다.

- 기존 저장소의 Pages 워크플로가 있다면 `client` 배포 경로를 그대로 사용할 수 있습니다.
- 새 배포에서는 `client/`를 정적 게시 대상으로 지정하거나 루트를 게시합니다.
- **2인 온라인 협동은 별도 Node 서버가 필요합니다.**
- 분리 서버 주소는 `client/config.js`에서 설정합니다.

정확한 서버 실행과 분리 연결 방법은 `DEPLOYMENT.md`에 있습니다.
