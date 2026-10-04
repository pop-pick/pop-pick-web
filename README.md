# 팝픽 (POP PICK)

![CI](https://github.com/pop-pick/pop-pick-web/actions/workflows/ci.yaml/badge.svg)

온보딩에서 고른 취향으로 서울 팝업을 추천하고, AI가 하루 방문 코스까지 짜 주는 웹 서비스다. 팝업은 열리는 곳과 기간, 예약 방식이 제각각이라 갈 곳을 고르고 동선을 짜는 데 시간이 든다. 팝픽은 팝업 정보를 한곳에서 보여 주고 취향과 일정에 맞춰 골라 준다.

서비스는 https://pop-pick-web.vercel.app 에 있다. 모바일 화면을 기준으로 만들었다.

## 할 수 있는 것

- **취향 등록.** 카카오나 구글로 로그인하고 동행 유형과 관심 카테고리, 자주 가는 지역, 선호 활동을 고른다
- **홈 추천.** 지금 인기 있는 팝업과 내 취향에 맞는 팝업을 본다
- **탐색.** 지도와 목록을 오가며 지역과 정렬, 검색어로 팝업을 찾는다
- **상세와 찜.** 운영 기간과 시간, 위치, 예약 방법을 보고 찜해 두면 마이에서 다시 본다
- **원데이 플래너.** 날짜와 지역, 시작 시각, 머무는 시간을 고르면 AI가 방문 순서와 도착 시각, 도보 시간을 정한 코스를 만든다
- **일정 저장.** 코스를 저장하고 구글 캘린더나 캘린더 파일로 내보낸다

기능마다 정확한 동작은 [docs/product/SPEC.md](docs/product/SPEC.md)에 있다.

## 프로젝트

스위프(SWYP) 웹 15기 1팀이 2026년 8월부터 10월까지 6주 동안 만든 팀 프로젝트다. PM 1명과 디자이너 1명, 프론트엔드 2명, 백엔드 3명이 함께 만들었다.

이 저장소는 프론트엔드다. 백엔드는 같은 Organization의 [pop-pick-server](https://github.com/pop-pick/pop-pick-server)에 있다. `main`에 머지되면 운영에 자동으로 배포된다.

Next.js(App Router)와 React, TypeScript로 만들고 Vercel에 배포한다. 지도는 카카오맵 JavaScript SDK를 쓰고 화면 부품은 UI 라이브러리 없이 디자인 시안대로 직접 만들었다. 버전과 의존 목록은 [package.json](package.json)에, 도구를 고른 이유와 쓰지 않기로 한 것은 [docs/product/ROADMAP.md](docs/product/ROADMAP.md)에 있다.

## 개발에 참여하기

로컬에서 띄우는 법과 명령, 브랜치에서 PR 머지까지의 순서는 [CONTRIBUTING.md](CONTRIBUTING.md)에 있다. 구조와 기능별 설계 문서는 [docs/README.md](docs/README.md)가 안내한다. AI 에이전트로 작업한다면 [AGENTS.md](AGENTS.md)를 먼저 읽는다.

문제와 제안은 [Issues](https://github.com/pop-pick/pop-pick-web/issues)에 남긴다.

## 라이선스

[MIT](LICENSE)
