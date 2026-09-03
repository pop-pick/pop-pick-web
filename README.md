# 팝픽 (POP PICK)

![CI](https://github.com/pop-pick/pop-pick-web/actions/workflows/ci.yaml/badge.svg)

온보딩에서 받은 취향으로 서울 팝업을 AI가 추천하고 방문 동선까지 짜주는 서비스.

이 저장소(`pop-pick-web`)는 팝픽의 프론트엔드다. 백엔드는 같은 `pop-pick` Organization의 `pop-pick-server`에 있다. 두 저장소 모두 공개 저장소다.

스위프(SWYP) 웹 15기 6주 팀 프로젝트로 만든다. 개발 마감은 2026-10-04(일)이고 데모데이는 2026-10-17(토)이다.

프로덕션은 https://pop-pick-web.vercel.app 에 있다. `main`에 머지되면 자동으로 배포된다.

## 기술 스택

결정된 도구와 그 상태다. 쓰지 않기로 한 것과 이유는 `docs/product/ROADMAP.md`의 하지 않기로 한 것 표에 있다.

| 영역            | 도구                                                                                           | 상태             |
| --------------- | ---------------------------------------------------------------------------------------------- | ---------------- |
| 언어            | TypeScript                                                                                     | 설치됨           |
| 프레임워크      | Next.js (App Router), React                                                                    | 설치됨           |
| 스타일          | Tailwind CSS v4                                                                                | 설치됨           |
| 클래스 합치기   | clsx, tailwind-merge, class-variance-authority                                                 | 설치됨           |
| 컴파일러        | React Compiler (babel-plugin-react-compiler)                                                   | 설치됨           |
| 코드 품질       | ESLint, Prettier, lefthook                                                                     | 설치됨           |
| 서버 상태       | TanStack Query                                                                                 | 설치됨           |
| 클라이언트 상태 | Zustand. 조건 필터와 플래너에 담은 팝업 정도로 최소                                            | 설치됨           |
| 지도            | Kakao Map JavaScript SDK. `src/shared/lib/kakao-map`이 script를 직접 주입한다. npm 패키지 없음 | 코어 모듈 있음   |
| 도보 소요시간   | 카카오맵 REST API 도보 경로 조회. REST 키가 있는 서버에서 부른다                               | 부르는 서버 미정 |
| 폼              | react-hook-form, zod, @hookform/resolvers                                                      | 설치됨           |
| 날짜            | date-fns                                                                                       | 설치됨           |
| HTTP            | Next.js fetch를 얇게 감싼 래퍼. 별도 라이브러리 없음                                           | 결정됨           |
| UI 라이브러리   | 쓰지 않는다. 디자이너 시안 기반 자체 컴포넌트                                                  | 결정됨           |
| 배포            | Vercel. PR마다 미리보기 URL                                                                    | 배포됨           |
| 아이콘          | 미정                                                                                           |                  |
| 테스트          | 미정                                                                                           |                  |

## 시작하기

Node 24와 pnpm 11을 쓴다. Node 버전은 `.nvmrc`에 있다.

```bash
nvm use
pnpm install
cp .env.example .env.local
pnpm dev
```

`pnpm install`이 끝나면 `prepare` 스크립트가 lefthook 훅을 설치하고 `.agents/` 본문을 `.claude/rules`와 `.claude/skills`에 심볼릭 링크로 잇는다. 따로 할 일은 없다.

`.env.local`을 비워 둔 채 시작해도 개발 서버는 뜬다. 지도를 보려면 카카오맵 JavaScript 키가 필요하고 백엔드 주소는 미정이다. 변수 이름과 키 발급, 도메인 등록은 `docs/release/RUNBOOK.md`에 있다.

`pnpm dev`를 실행하면 http://localhost:3000 에서 개발 서버가 열린다.

## 스크립트

| 명령                | 하는 일                                                         |
| ------------------- | --------------------------------------------------------------- |
| `pnpm dev`          | 개발 서버를 연다                                                |
| `pnpm build`        | 프로덕션 빌드를 만든다                                          |
| `pnpm start`        | 빌드 결과를 실행한다                                            |
| `pnpm lint`         | ESLint로 저장소 전체를 검사한다                                 |
| `pnpm lint:fix`     | ESLint가 자동으로 고칠 수 있는 것을 고친다. import 정렬 등      |
| `pnpm format`       | Prettier로 저장소 전체를 고쳐 쓴다                              |
| `pnpm format:check` | Prettier 검사만 한다                                            |
| `pnpm type:check`   | `tsc --noEmit`                                                  |
| `pnpm link:agents`  | `.agents/` 본문을 `.claude/rules`와 `.claude/skills`에 링크한다 |
| `pnpm prepare`      | lefthook 설치와 `link:agents`. `pnpm install` 때 자동으로 돈다  |

## 폴더 구조

Feature 기반으로 나눈다.

```
src/
├── app/            Next.js App Router 라우팅. layout.tsx, page.tsx 같은 라우트 파일만 둔다. poc/는 임시 검증 페이지
├── features/       비즈니스 기능. 기능 하나가 폴더 하나
├── shared/         여러 기능이 함께 쓰는 것
│   ├── api/        서버 호출 레이어. 화면 코드는 여기를 거쳐 서버를 부른다
│   ├── ui/         공용 컴포넌트. 디자인 시스템 담당 프론트엔드가 주인이다
│   ├── hooks/      공용 훅
│   ├── lib/        공용 유틸. 클래스를 합치는 cn()과 카카오맵 코어 모듈(kakao-map/)
│   ├── providers/  루트 레이아웃이 감싸는 프로바이더. QueryProvider
│   └── styles/     globals.css. Tailwind 진입점과 디자인 토큰 정본
└── types/          여러 기능이 함께 쓰는 타입
```

`features/` 하위 폴더 이름은 미정이다. `features/`와 `types/`는 지금 `.gitkeep`만 있다. 정적 파일은 `public/`에 둔다(지금은 `favicon.ico` 하나).

경로 별칭 `@/*`는 `./src/*`다.

## 문서

| 문서                         | 답하는 질문                                 |
| ---------------------------- | ------------------------------------------- |
| `docs/product/PRD.md`        | 누구의 어떤 문제를 왜 푸는가                |
| `docs/product/SPEC.md`       | 각 기능이 정확히 어떻게 동작하는가          |
| `docs/product/ROADMAP.md`    | 무엇을 어떤 순서로 만드는가                 |
| `docs/design/DESIGN.md`      | 서비스가 어떤 인상을 주는가                 |
| `docs/design/DESIGN-SPEC.md` | 각 화면에 무엇이 어떻게 놓이는가            |
| `docs/release/RUNBOOK.md`    | 배포와 장애 대응을 어떻게 하는가            |
| `docs/release/SEO.md`        | 코드로 할 수 없는 검색 유입 작업은 무엇인가 |
| `docs/release/PRIVACY.md`    | 어떤 정보를 모으고 어떻게 다루는가          |

문서 배치 기준과 문서마다 무엇이 채워졌고 무엇이 비었는지는 `docs/CLAUDE.md`에 있다. 에이전트가 늘 지켜야 하는 것은 `AGENTS.md`에, 자세한 규칙은 `.agents/rules/`에 있다. 기여 방법은 `CONTRIBUTING.md`를 본다.

공통 레이어 안내는 코드 옆에 둔다.

- `src/shared/api/README.md` API 레이어. 서버 호출을 어디서 어떻게 하는가
- `src/shared/ui/README.md` 디자인 시스템. 공용 컴포넌트를 어떻게 만드는가

## 팀

스위프 웹 15기 1팀, 7명이다. PM 1명, 디자이너 1명, 프론트엔드 2명, 백엔드 3명.

## 라이선스

MIT
