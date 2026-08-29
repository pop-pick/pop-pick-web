# 팝픽 (POP PICK)

취향과 시간, 지역에 맞는 서울 팝업을 추천하고 방문 동선까지 짜주는 서비스.

이 저장소(`pop-pick-web`)는 팝픽의 프론트엔드다. 백엔드는 같은 `pop-pick` Organization의 `pop-pick-server`에 있다. 두 저장소 모두 공개 저장소다.

스위프(SWYP) 웹 15기 6주 팀 프로젝트로 만든다. 개발 마감은 2026-10-04(일)이고 데모데이는 2026-10-17(토)이다.

프로덕션은 https://pop-pick-web.vercel.app 에 있다. `main`에 머지되면 자동으로 배포된다.

## 기술 스택

설치된 것과 도입이 결정됐지만 아직 의존성에 없는 것을 나눠 적는다.

| 영역            | 도구                                          | 상태                 |
| --------------- | --------------------------------------------- | -------------------- |
| 언어            | TypeScript                                    | 설치됨               |
| 프레임워크      | Next.js (App Router), React                   | 설치됨               |
| 스타일          | Tailwind CSS v4                               | 설치됨               |
| 컴파일러        | React Compiler (babel-plugin-react-compiler)  | 설치됨               |
| 코드 품질       | ESLint, Prettier, lefthook                    | 설치됨               |
| 서버 상태       | TanStack Query                                | 도입 예정            |
| 클라이언트 상태 | Zustand. 필터와 담은 팝업 목록 정도로 최소    | 도입 예정            |
| 지도            | Kakao Map SDK                                 | 도입 예정            |
| 폼              | react-hook-form, zod                          | 도입 예정            |
| 날짜            | date-fns                                      | 도입 예정            |
| 아이콘          | lucide-react                                  | 제안 단계            |
| HTTP            | Next.js fetch를 얇게 감싼 래퍼                | 별도 라이브러리 없음 |
| UI 라이브러리   | 쓰지 않는다. 디자이너 시안 기반 자체 컴포넌트 | 결정됨               |
| 배포            | Vercel. PR마다 미리보기 URL                   | 2026-08-29 첫 배포   |
| 테스트          | 미결정                                        |                      |

## 시작하기

Node 24와 pnpm 11을 쓴다. Node 버전은 `.nvmrc`에 있다.

```bash
nvm use
pnpm install
pnpm dev
```

`pnpm install`이 끝나면 `prepare` 스크립트가 lefthook 훅을 설치하고 `.agents/` 본문을 `.claude/rules`와 `.claude/skills`에 심볼릭 링크로 잇는다. 따로 할 일은 없다.

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
├── app/        Next.js App Router 라우팅. layout.tsx, page.tsx, globals.css
├── features/   비즈니스 기능. 기능 하나가 폴더 하나
├── shared/     여러 기능이 함께 쓰는 ui, hooks, lib, api
└── types/      여러 기능이 함께 쓰는 타입. 아직 비어 있다
```

`features/` 하위 폴더 이름은 8/30 정기회의에서 기능 범위가 확정된 뒤 정한다. 지금은 `features/`와 `shared/`, `types/` 모두 `.gitkeep`만 있다.

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

문서를 어디에 두고 어떤 순서로 채우는지는 `docs/CLAUDE.md`에 있다. 에이전트가 늘 지켜야 하는 것은 `AGENTS.md`에, 자세한 규칙은 `.agents/rules/`에 있다. 기여 방법은 `CONTRIBUTING.md`를 본다.

## 팀

스위프 웹 15기 1팀, 7명이다. PM 1명, 디자이너 1명, 프론트엔드 2명, 백엔드 3명.

## 라이선스

MIT
