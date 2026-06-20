# Boxhead: Backroom Low - GitHub Pages Edition

이 버전은 1인 플레이 전용 정적 웹 게임이다.
Node.js 서버, Render, npm start, localhost 실행 없이 GitHub Pages 링크로 바로 실행하는 것을 목표로 정리했다.

## 파일 구성

```txt
index.html
style.css
game.js
config.js
.nojekyll
README.md
```

## GitHub Pages 배포 방법

1. GitHub 저장소의 기존 멀티/서버 파일을 정리하거나, 이 ZIP 안의 파일들을 저장소 최상단에 업로드한다.
2. 저장소에 `index.html`, `style.css`, `game.js`가 최상단에 바로 있어야 한다.
3. GitHub 저장소에서 Settings → Pages로 이동한다.
4. Build and deployment에서 Source를 `Deploy from a branch`로 선택한다.
5. Branch는 `main`, 폴더는 `/ (root)`로 선택한다.
6. Save를 누른다.
7. 몇 분 뒤 `https://사용자명.github.io/저장소명/` 주소로 접속한다.

## 주의

- 이 버전은 2인 플레이/Socket.IO/Node 서버를 사용하지 않는다.
- Three.js는 CDN에서 불러온다. 따라서 플레이할 때 인터넷 연결은 필요하다.
- GitHub Pages에서 실행해야 한다. 파일을 더블클릭해서 여는 `file://` 방식은 브라우저 보안 정책 때문에 정상 작동하지 않을 수 있다.
