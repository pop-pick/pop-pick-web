# AGENTS.md

팝픽(POP PICK) 프론트엔드. 온보딩에서 받은 취향으로 서울 팝업을 AI가 추천하고 방문 동선까지 짜주는 웹 서비스다. Next.js App Router로 만들어 Vercel에 배포한다. 백엔드는 같은 Organization의 `pop-pick-server`다.

이 파일은 세션마다 읽힌다. 지워도 실수가 생기지 않는 줄은 두지 않는다. 자세한 규칙은 `.agents/rules/`, 절차는 `.agents/skills/`, 제품과 화면은 `docs/`에 있다.

## 명령과 게이트

구현이 끝나면 이 순서로 돌린다. 하나라도 실패하면 커밋하지 않는다.

1. `pnpm type:check`
2. `pnpm build`
3. `pnpm lint`와 `pnpm format:check`

완료 보고에는 게이트 명령의 출력 결과를 함께 적는다. 통과했다는 말만 적지 않는다.

lefthook 훅이 커밋과 푸시 때 같은 검사를 저장소 전체에 돌린다. 내가 건드리지 않은 파일 때문에 커밋이 막히면 그 파일을 고치는 커밋을 따로 만든다. `--no-verify`로 건너뛰지 않는다.

같은 넷을 CI가 PR마다 돌린다. CI가 빨간불이면 머지하지 않는다.

## 언어

산문과 주석, 커밋 메시지는 한국어, 코드 식별자는 영어로 쓴다. 가운뎃점과 화살표, em dash, 이모지, 한자를 쓰지 않는다. 나열은 조사와 쉼표로 푼다.

## 구조

- Feature 기반이다. `src/app`은 라우팅, `src/features`는 기능 단위, `src/shared`는 공용 ui, hooks, lib, api, providers, styles, `src/types`는 공용 타입. 경로 별칭 `@/*`는 `./src/*`
- `src/app`에는 Next가 이름을 정하는 라우트 파일(`layout.tsx`, `page.tsx` 등)만 둔다. 전부 소문자다. 컴포넌트와 CSS는 `src/shared`나 `src/features`에 두고 라우트 파일이 import한다
- `features/` 하위 폴더 이름은 미정이다. 정해지기 전에는 만들지 않는다
- 기성 UI 라이브러리를 쓰지 않는다. 디자이너 시안을 따라 `src/shared/ui`에 직접 만든다
- Tailwind 클래스에 `p-[18px]` 같은 임의값을 쓰지 않는다. 토큰 정본은 `src/shared/styles/globals.css`의 `@theme inline`

## 하지 않는 것

- 사용자가 요청할 때만 커밋한다. 지난번 커밋 요청이 이번 작업까지 이어지지 않는다
- 의존성 추가와 삭제, 공개 타입과 시그니처 변경, 빌드와 CI 설정 변경은 먼저 묻는다. 도입이 결정된 도구도 설치는 사용자가 요청할 때 한다
- 미결정 항목에 그럴듯한 기본값을 채우지 않고 묻는다. 무엇이 미결정인지는 `docs/product/ROADMAP.md`의 미결정 절이 정본이다
- `main`과 `develop`에 직접 커밋하지 않는다. 작업은 `feature/{슬러그}` 브랜치에서 하고 PR로 올린다

## 룰

`.agents/rules/`가 본문이다. Claude Code는 `.claude/rules/` 링크로 자동으로 읽는다. 자동으로 읽지 않는 도구는 작업 전에 해당 파일을 직접 연다.

| 파일              | 한 줄                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `api.md`          | 서버 호출은 src/shared/api를 거친다. 응답 형식은 백엔드가 정한 것을 그대로 쓴다. fetch 래퍼 하나로, 실패는 쿼리 에러 상태로 드러낸다                   |
| `comments.md`     | 기본은 주석 없음. 코드가 표현하지 못하는 넷만 적고 지시문 주석은 지우지 않는다                                                                         |
| `git-workflow.md` | main, develop, feature 3단 브랜치. `<타입>: <한국어 제목>` 커밋. squash 머지 금지                                                                      |
| `no-fallback.md`  | 오류를 감싸 빈 값을 돌려주지 않는다. 실패를 드러내거나 실패할 수 없는 설계로 바꾼다                                                                    |
| `state.md`        | 서버 상태는 TanStack Query, 클라이언트 상태는 Zustand 최소. 서버 데이터를 스토어에 복제하지 않는다                                                     |
| `tailwind.md`     | 임의값 금지. 값은 `@theme inline` 토큰과 `@utility`에서 온다                                                                                           |
| `testing.md`      | 테스팅 트로피. 기본 동작은 삭제이고 추가는 예외. 도구는 미정                                                                                           |
| `ui.md`           | 기성 UI 라이브러리 없음. 공용 컴포넌트는 src/shared/ui가 주인. 파일은 PascalCase, export function 선언. 모바일 퍼스트, 키보드로 조작 가능, 토큰만 쓴다 |

## 스킬

`.agents/skills/`에 `pop-pick-harness` 하나가 있다. 작업을 시작할 때 읽는 순서와 미결정 항목을 만났을 때 묻는 절차, 끝낼 때 게이트를 돌리는 순서를 담는다. 어떤 스킬이 있고 언제 쓰는지는 이 절이 정본이다.
