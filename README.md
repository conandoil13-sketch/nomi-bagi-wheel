# nomi-bagi-wheel

<!-- Project overview and local usage notes for the static site. -->

노미와 바기 돌림판은 HTML, CSS, Vanilla JS만 사용하는 정적 웹사이트입니다.
GitHub Pages에 그대로 올릴 수 있도록 빌드 도구나 서버 없이 구성되어 있습니다.

## Features

- 390x844 모바일 세로 화면과 쇼츠/릴스 녹화에 맞춘 UI
- 16칸 노미/바기 돌림판
- 1차 업그레이드와 2차 슈퍼 업그레이드 연출
- 파칭코/슬롯머신풍 보너스 컷신
- 누적 돌림 횟수 저장
- 이미지와 사운드 파일이 없어도 깨지지 않는 fallback 처리

## Structure

```text
nomi-bagi-wheel/
  index.html
  README.md
  assets/
    images/
      mushvenom.png
      ibaksa.png
      bg-kids.png
      bg-pachinko.png
    sounds/
      spin.mp3
      bonus.mp3
      result.mp3
      click.mp3
    fonts/
  src/
    styles/
      reset.css
      main.css
      kids.css
      pachinko.css
      animations.css
    js/
      app.js
      wheel.js
      effects.js
      state.js
```

## Assets

이미지와 사운드 파일은 아직 없어도 사이트가 동작합니다.
`assets/images`와 `assets/sounds`에 실제 파일을 추가하면 자동으로 더 풍성하게 보이도록 설계되어 있습니다.

## Run

`index.html`을 브라우저에서 바로 열면 됩니다.

또는 로컬 서버가 필요하면 아래 명령을 사용할 수 있습니다.

```sh
python3 -m http.server 8000
```

## GitHub Pages

이 저장소에는 `.github/workflows/pages.yml`이 포함되어 있습니다.
GitHub Pages 설정에서 Source를 GitHub Actions로 선택하면 `main` 브랜치 push 이후 자동으로 배포됩니다.
