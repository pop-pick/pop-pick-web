# 팝픽 (POP PICK)

![CI](https://github.com/pop-pick/pop-pick-web/actions/workflows/ci.yaml/badge.svg)

온보딩에서 받은 취향으로 서울 팝업을 AI가 추천하고 방문 동선까지 짜주는 서비스.

이 저장소(`pop-pick-web`)는 팝픽의 프론트엔드다. 백엔드는 같은 `pop-pick` Organization의 `pop-pick-server`에 있다. 두 저장소 모두 공개 저장소다.

스위프(SWYP) 웹 15기 6주 팀 프로젝트로 만든다. 개발 마감은 2026-10-04(일)이고 데모데이는 2026-10-17(토)이다.

프로덕션은 https://pop-pick-web.vercel.app 에 있다. `main`에 머지되면 자동으로 배포된다.

## 기술 스택

결정된 도구와 그 상태다. 쓰지 않기로 한 것과 이유는 `docs/product/ROADMAP.md`의 하지 않기로 한 것 표에 있다.

| 영역            | 도구                                                                                                                                   | 상태           |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 언어            | TypeScript                                                                                                                             | 설치됨         |
| 프레임워크      | Next.js (App Router), React                                                                                                            | 설치됨         |
| 스타일          | Tailwind CSS v4                                                                                                                        | 설치됨         |
| 클래스 합치기   | clsx, tailwind-merge, tailwind-variants                                                                                                | 설치됨         |
| 애니메이션      | motion                                                                                                                                 | 설치됨         |
| 캐러셀          | embla-carousel-react                                                                                                                   | 설치됨         |
| 컴파일러        | React Compiler (babel-plugin-react-compiler)                                                                                           | 설치됨         |
| 코드 품질       | ESLint, Prettier, lefthook                                                                                                             | 설치됨         |
| 서버 상태       | TanStack Query                                                                                                                         | 설치됨         |
| 클라이언트 상태 | Zustand. 액세스 토큰과 온보딩 입력 중인 답, 코스 API가 없는 동안 저장한 일정의 임시 스토어. 리프레시 토큰은 httpOnly 쿠키다            | 설치됨         |
| 지도            | Kakao Map JavaScript SDK. `src/shared/lib/kakao-map`이 script를 직접 주입한다. npm 패키지 없음                                         | 코어 모듈 있음 |
| 도보 소요시간   | 카카오맵 REST API 도보 경로 조회. 코스 순서를 아는 백엔드가 부르고 프론트는 코스 조회로 받는다                                         | 결정됨         |
| 폼              | react-hook-form, zod, @hookform/resolvers                                                                                              | 설치됨         |
| 날짜            | date-fns, @date-fns/tz. 달력은 react-day-picker                                                                                        | 설치됨         |
| HTTP            | `fetch`를 감싼 `src/shared/api` 래퍼. 별도 라이브러리 없음                                                                             | 결정됨         |
| UI 라이브러리   | 쓰지 않는다. 디자이너 시안 기반 자체 컴포넌트. 모양 없이 동작과 접근성만 주는 react-day-picker는 예외이고 기준은 `.agents/rules/ui.md` | 결정됨         |
| 배포            | Vercel. PR마다 미리보기 URL                                                                                                            | 배포됨         |
| 아이콘          | 디자이너가 준 SVG를 SVGR(@svgr/webpack)이 컴포넌트로 바꾼다. 아이콘 라이브러리 없음. 규칙은 `docs/design/DESIGN.md`                    | 설치됨         |
| 테스트          | 미정                                                                                                                                   |                |

## 시작하기

Node 24와 pnpm 11을 쓴다. Node 버전은 `.nvmrc`에 있다.

```bash
nvm use
pnpm install
cp .env.example .env.local
pnpm dev
```

`pnpm install`이 끝나면 `prepare` 스크립트가 lefthook 훅을 설치하고 `.agents/` 원본을 `.claude`와 `.codex` 자리에 복사한다. 따로 할 일은 없다.

`.env.example`에는 변수 이름만 있다. `.env.local`에 `API_BASE_URL`이 비어 있으면 개발 서버와 `pnpm build`, `pnpm type:check`, push가 실패한다. `next.config.ts`가 로드될 때 이 값을 읽고 비어 있으면 예외를 내기 때문이다. 값과 카카오 키 발급, 도메인 등록은 `docs/release/RUNBOOK.md`의 환경 변수 절에 있다.

`pnpm dev`를 실행하면 http://localhost:3000 에서 개발 서버가 열린다.

## 스크립트

| 명령                 | 하는 일                                                                                |
| -------------------- | -------------------------------------------------------------------------------------- |
| `pnpm dev`           | 개발 서버를 연다                                                                       |
| `pnpm build`         | 프로덕션 빌드를 만든다                                                                 |
| `pnpm start`         | 빌드 결과를 실행한다                                                                   |
| `pnpm preview`       | `pnpm start`를 부른다                                                                  |
| `pnpm lint`          | ESLint로 저장소 전체를 검사한다                                                        |
| `pnpm lint:fix`      | ESLint가 자동으로 고칠 수 있는 것을 고친다. import 정렬 등                             |
| `pnpm format`        | Prettier로 저장소 전체를 고쳐 쓴다                                                     |
| `pnpm format:check`  | Prettier 검사만 한다                                                                   |
| `pnpm type:check`    | `next typegen`과 `tsc --noEmit`                                                        |
| `pnpm test`          | Vitest로 `tests/`의 테스트를 한 번 돌린다                                              |
| `pnpm test:watch`    | 파일을 고칠 때마다 테스트를 다시 돌린다                                                |
| `pnpm check`         | 게이트 다섯(`type:check`와 `test`, `build`, `lint`, `format:check`)을 차례로 돌린다    |
| `pnpm harness:sync`  | `.agents/` 원본을 `.claude`와 `.codex` 자리에 복사하고 변환한다. 원본을 고친 뒤 돌린다 |
| `pnpm harness:check` | 컨벤션 검사와 생성물 대조, 회귀 테스트를 한 번에 돌린다. lefthook과 CI가 돌린다        |
| `pnpm prepare`       | lefthook 설치와 `harness:sync`. `pnpm install` 때 자동으로 돈다                        |

## 폴더 구조

Feature 기반으로 나눈다. 경로 별칭 `@/*`는 `./src/*`다.

```
src/
├── proxy.ts        로그인이 필요한 경로에서 세션 쿠키가 없으면 로그인으로 보낸다
├── app/            Next.js App Router 라우팅. 라우트 파일만 둔다
│   ├── api/auth/   세션 쿠키를 심고 지우는 Route Handler
│   └── auth/       소셜 로그인 콜백
├── features/       비즈니스 기능. 기능 하나가 폴더 하나
└── shared/         여러 기능이 함께 쓰는 것
    ├── api/        서버 호출 레이어. 화면 코드는 여기를 거쳐 서버를 부른다
    ├── ui/         디자인 시스템 부품. Button, Select, SvgIcon처럼 앱을 모른다
    ├── components/ 공용 조립 컴포넌트. 하단 탭바, 페이지 헤더처럼 경로와 도메인을 안다
    ├── assets/     코드가 아닌 원본. icons/의 SVG(빌드 때 SVGR이 컴포넌트로 바꾼다)와 fonts/
    ├── hooks/      공용 훅. 지금은 비어 있다
    ├── lib/        공용 유틸. 클래스를 합치는 cn()과 변형 레시피 tv, 서울 기준 날짜(date.ts), 카카오맵 코어 모듈(kakao-map/)
    ├── providers/  루트 레이아웃이 감싸는 프로바이더. QueryProvider, MotionProvider
    ├── styles/     globals.css가 Tailwind 진입점이고 tokens/에 디자인 토큰 정본
    └── model/      여러 기능이 함께 쓰는 값과 타입, 라벨
```

어떤 라우트가 있는지는 `docs/architecture/ARCHITECTURE.md`에, 기능 폴더 안을 어떻게 나누는지는 `.agents/rules/architecture.md`에 있다.

## API 주소

브라우저는 같은 출처 `/api/v1/...`를 부르고 `next.config.ts`의 rewrites가 백엔드로 넘긴다. 서버는 `API_BASE_URL`로 백엔드를 직접 부른다. 세션 쿠키를 다루는 `/api/auth/**`만 Next의 Route Handler가 직접 받는다. 주소를 가르는 것은 `src/shared/api`의 래퍼이고 그 이유와 규칙은 `.agents/rules/api.md`에 있다.

## 문서

어느 문서가 무엇을 답하는지와 비어 있는 자리는 `docs/README.md`에 있다. 에이전트가 늘 지켜야 하는 것은 `AGENTS.md`에, 자세한 규칙은 `.agents/rules/`에 있다. 기여 방법은 `CONTRIBUTING.md`를 본다.

## 팀

스위프 웹 15기 1팀, 7명이다. PM 1명, 디자이너 1명, 프론트엔드 2명, 백엔드 3명.

## 라이선스

MIT
