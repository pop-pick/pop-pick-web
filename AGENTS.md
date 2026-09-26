# AGENTS.md

팝픽(POP PICK) 프론트엔드. 온보딩에서 받은 취향으로 서울 팝업을 AI가 추천하고 방문 동선까지 짜주는 웹 서비스다. Next.js App Router로 만들어 Vercel에 배포한다. 백엔드는 같은 Organization의 `pop-pick-server`다.

이 파일은 세션마다 읽힌다. 지워도 실수가 생기지 않는 줄은 두지 않는다. 자세한 규칙은 `.agents/rules/`, 절차는 `.agents/skills/`, 제품과 화면은 `docs/`에 있고 어느 문서가 무엇을 답하는지는 `docs/README.md`가 안내한다.

## 명령과 게이트

구현이 끝나면 이 순서로 돌린다. 하나라도 실패하면 커밋하지 않는다.

1. `pnpm type:check`
2. `pnpm build`
3. `pnpm lint`와 `pnpm format:check`

완료 보고에는 게이트 명령의 출력 결과를 함께 적는다. 통과했다는 말만 적지 않는다.

lefthook 훅이 커밋과 푸시 때 같은 검사를 저장소 전체에 돌린다. 커밋 때는 하네스 검사 `pnpm harness:check`도 함께 돈다. 내가 건드리지 않은 파일 때문에 커밋이 막히면 그 파일을 고치는 커밋을 따로 만든다. `--no-verify`로 건너뛰지 않는다.

이 넷과 `pnpm harness:check`를 CI가 PR마다 돌린다. CI가 빨간불이면 머지하지 않는다.

## 언어

산문과 주석, 커밋 메시지는 한국어, 코드 식별자는 영어로 쓴다. 가운뎃점과 화살표, em dash, 이모지, 한자를 쓰지 않는다. 나열은 조사와 쉼표로 푼다.

## 구조

- Feature 기반이다. `src/app`은 라우팅, `src/features`는 기능 단위, `src/shared`는 공용이다. 의존은 shared에서 features로, features에서 app으로 한 방향이고 기능끼리 부르지 않는다. 경로 별칭 `@/*`는 `./src/*`
- `src/app`에는 Next가 이름을 정하는 라우트 파일(`layout.tsx`, `page.tsx` 등)만 둔다. 전부 소문자다. 컴포넌트와 CSS는 `src/shared`나 `src/features`에 두고 라우트 파일이 import한다. 하단 탭바는 루트 레이아웃이 모든 화면에 그린다. 라우트 그룹을 두지 않는다
- `features/` 하위 폴더는 기능 하나에 하나다. 이름은 백엔드 `feature/{이름}` 패키지와 맞춘다. 기능 폴더 안은 `api`와 `ui`, `hooks`, `model` 넷으로 나누고 루트에 파일을 두지 않는다. `lib`은 `src/shared`에만 둔다
- 토큰 정본은 `src/shared/styles/globals.css`의 `@theme inline`이다

## 하지 않는 것

- 사용자가 요청할 때만 커밋한다. 지난번 커밋 요청이 이번 작업까지 이어지지 않는다
- 의존성 추가와 삭제, 공개 타입과 시그니처 변경, 빌드와 CI 설정 변경은 먼저 묻는다. 도입이 결정된 도구도 설치는 사용자가 요청할 때 한다
- 미결정 항목에 그럴듯한 기본값을 채우지 않고 묻는다. 무엇이 미결정인지는 `docs/product/ROADMAP.md`의 미결정 절이 정본이다
- `main`과 `develop`에 직접 커밋하지 않는다. 작업은 `feature/{슬러그}` 브랜치에서 하고 PR로 올린다

## 룰

`.agents/rules/`가 본문이다. `paths`가 있는 룰은 그 패턴의 파일을 읽을 때 실리고 없는 룰은 세션 시작 때 실린다. 룰을 자동으로 읽지 않는 도구는 작업 전에 해당 파일을 직접 연다. 사용자 홈의 룰과 어긋나면 이 저장소의 룰이 우선이다. 아래 목록은 각 룰의 `description`에서 생성된다.

<!-- agents-sync:rules:begin -->

<!-- 이 표식 사이는 .agents/scripts/agents-sync.mjs 가 .agents/rules/ 의 description 에서 만든다. 손으로 고치지 않는다 -->

- `api.md`. 층이 넷이다. shared/api는 HTTP만 알고 features/{기능}/api는 엔드포인트를, hooks는 변경을, ui는 화면을 안다. 브라우저는 같은 출처 /api를, 서버는 API_BASE_URL을 부른다
- `comments.md`. 기본은 주석을 쓰지 않는 것. 코드가 표현하지 못하는 넷만 적고 지시문 주석은 절대 지우지 않는다
- `documentation.md`. 문서를 어디에 두는지와 정본 하나, 시간순 기록을 소급하지 않는 것, 문서와 코드가 어긋날 때 할 일, 문서에 넣지 않는 것
- `git-workflow.md`. main과 develop, feature 세 브랜치. 커밋 메시지는 <타입>: <한국어 제목>. 금지 패턴 다섯. 브랜치와 커밋, PR, 머지 절차는 pop-pick-git 스킬에 있다
- `no-fallback.md`. 오류를 감싸 빈 값을 돌려주는 코드를 금지한다. 실패를 드러내거나 실패할 수 없는 설계로 바꾼다
- `state.md`. 서버 상태는 TanStack Query, 공유할 조건값은 URL, 나머지 클라이언트 상태만 Zustand. 서버 데이터를 스토어에 복제하지 않는다
- `structure.md`. src/app은 라우팅, src/features는 기능, src/shared는 공용. 기능 폴더 안은 api와 ui, hooks, model 넷이다. 의존은 한 방향이고 배럴 파일을 만들지 않는다
- `tailwind.md`. X-[value] 임의값을 쓰지 않는다. 값은 src/shared/styles/globals.css의 @theme inline 토큰과 @utility에서 온다. 어긋난 값을 옮기는 네 갈래
- `testing.md`. 테스팅 트로피가 전략이다. 기본 동작은 삭제이고 추가는 예외다. 도구는 미정. 층마다 소유하는 것과 지우는 기준
- `typescript.md`. 추론되는 반환 타입을 적지 않는다. 이름은 흔한 동사와 목적어로 짓고 handle, on, is 같은 접두사를 역할대로 쓴다. return 앞과 블록 뒤 빈 줄. 리뷰에서 쓰는 grep
- `ui.md`. 기성 UI 라이브러리 없음. 공용 컴포넌트는 src/shared/ui가 주인. 파일 이름과 선언 형식의 정본. 이벤트 핸들러는 JSX 밖으로 뺀다. 모바일 퍼스트, 키보드로 조작 가능, 토큰만 쓴다

<!-- agents-sync:rules:end -->

## 하네스

둘이다. 개발은 `.agents/skills/pop-pick-dev`, QA는 `.agents/skills/pop-pick-qa`다. 기능이나 화면을 만들기 전에 dev를 읽는다. qa는 QA 테스트 케이스가 오기 전까지 스켈레톤이다. git 절차는 `.agents/skills/pop-pick-git`, `review-protocol`은 리뷰어에 미리 실리는 공통 규약이라 사용자가 꺼내지 않는다. 스킬은 이 넷이고 어떤 스킬이 있는지는 이 절이 정본이다.

<!-- agents-sync:agents:begin -->

<!-- 이 표식 사이는 .agents/scripts/agents-sync.mjs 가 .agents/agents/ 에서 만든다. 손으로 고치지 않는다 -->

에이전트 11개의 원본이 `.agents/agents/` 아래 폴더 4개에 있다. `builders/`에 `pop-pick-architect`, `pop-pick-implementer`, `pop-pick-spec-navigator`, `curators/`에 `pop-pick-docs-curator`, `reviewers/`에 `pop-pick-review-data`, `pop-pick-review-nextjs`, `pop-pick-review-screen`, `pop-pick-review-structure`, `pop-pick-review-tailwind`, `pop-pick-review-typescript`, `verifiers/`에 `pop-pick-integration-qa`다.

<!-- agents-sync:agents:end -->

`builders/`는 요구사항 확정과 계획, 구현, `verifiers/`는 경계 대조, `curators/`는 문서, `reviewers/`는 룰을 하나씩 소유하는 리뷰어다. 도구가 읽는 형식은 여기서 생성된다. **전부 부르지 않는다.** 변경 규모가 누구를 부를지 정하고 바뀐 파일이 리뷰어를 정한다. 표는 `pop-pick-dev`에 있다.

```bash
bash .agents/scripts/check-conventions.sh
```

룰에 적힌 grep 검사를 한 번에 돌린다. `pnpm harness:check`가 이것과 생성물 대조, 회귀 테스트를 함께 돌리고 걸리면 커밋과 CI가 막는다. 원본과 생성물의 관계는 `.agents/README.md`에 있다.

## 기준 문서

| 무엇                      | 정본                                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| 어느 문서가 무엇을 답하나 | `docs/README.md`                                                                                     |
| 미결정 항목               | `docs/product/ROADMAP.md`의 미결정 절                                                                |
| 기능 설계                 | `docs/architecture/{기능}.md`                                                                        |
| 백엔드 계약               | 백엔드 저장소 `pop-pick-server`의 코드. 조회 순서는 `pop-pick-dev`의 `references/contract-lookup.md` |
| 하네스가 어떻게 도나      | `docs/harness/AI_WORKFLOW.md`                                                                        |
| 사람이 따르는 기여 절차   | `CONTRIBUTING.md`                                                                                    |

## 자주 틀리는 것

- `pnpm build`와 `pnpm type:check`는 `API_BASE_URL`이 비어 있으면 실패한다. `next.config.ts`가 설정을 읽을 때 예외를 낸다
- GitHub 기본 브랜치가 `main`이라 화면에서 PR을 열면 base가 `main`으로 잡힌다. `develop`으로 바꾼다
- `develop`에는 커밋하지 않지만 푸시는 막지 않는다. 릴리스 뒤 `develop`을 `main`에 맞추는 절차가 `git push origin develop`을 쓴다
- `.claude/`와 `.codex/` 아래 생성물을 손으로 고치면 다음 `pnpm harness:sync`가 지운다. `.agents/` 원본을 고친다
