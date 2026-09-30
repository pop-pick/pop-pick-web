# AGENTS.md

팝픽(POP PICK) 프론트엔드. 온보딩에서 받은 취향으로 서울 팝업을 AI가 추천하고 방문 동선까지 짜주는 웹 서비스다. Next.js App Router로 만들어 Vercel에 배포한다. 백엔드는 같은 Organization의 `pop-pick-server`다.

이 파일은 세션마다 읽힌다. 지워도 실수가 생기지 않는 줄은 두지 않는다. 자세한 규칙은 `.agents/rules/`, 절차는 `.agents/skills/`, 제품과 화면은 `docs/`에 있다.

## 규칙

- 문서와 주석, 커밋 메시지는 한국어로 쓰고 코드 식별자는 영어로 쓴다. 금지 기호와 한자는 `check-conventions.sh`가 막는다
- 먼저 물을 것과 게이트 명령과 순서, 완료 판정은 `.agents/rules/change-process.md`에 있다
- 커밋 메시지와 브랜치, PR 흐름은 `.agents/rules/git-workflow.md`에 있다

## 룰

`.agents/rules/`가 본문이다. `paths`가 있는 룰은 그 패턴의 파일을 읽을 때 실리고 없는 룰은 세션 시작 때 실린다. 룰을 자동으로 읽지 않는 도구는 작업 전에 해당 파일을 직접 연다. 아래 목록은 각 룰의 `description`에서 생성된다.

<!-- agents-sync:rules:begin -->

<!-- 이 표식 사이는 .agents/scripts/agents-sync.mjs 가 .agents/rules/ 의 description 에서 만든다. 손으로 고치지 않는다 -->

- `allowed-comments.md`. 이 저장소에서 주석을 쓰는 네 경우(외부 제약, 호출 순서 가정, 우회 근거, 회귀 방지)와 쓰지 않는 주석, 기계로 막는 것
- `api.md`. 층이 넷이다. shared/api는 HTTP만 알고 features/{기능}/api는 엔드포인트를, hooks는 변경을, components는 화면을 안다. 브라우저는 같은 출처 /api를, 서버는 API_BASE_URL을 부른다
- `architecture.md`. src/app은 라우팅, src/features는 기능, src/shared는 공용. 기능 폴더 안은 api와 components, hooks, model 넷이다. 의존은 한 방향이고 배럴 파일을 만들지 않는다
- `change-process.md`. 이 저장소에서 먼저 물을 것(미결정 정본, 공개 표면), 게이트 명령과 순서, 훅과 CI가 돌리는 것, 완료 판정
- `documentation.md`. 문서를 어디에 두는지와 정본 하나, 시간순 기록을 소급하지 않는 것, 문서와 코드가 어긋날 때 할 일, 문서에 넣지 않는 것
- `failure-handling.md`. 이 저장소에서 실패를 받는 곳(src/app/error.tsx, TanStack Query의 error 상태), 실패 로그를 남기는 방식, 허용되는 축소 동작의 예(플래너 도보 소요시간)
- `git-workflow.md`. 커밋 메시지는 <타입>: <한국어 제목>. main과 develop, feature 브랜치이고 직접 커밋을 막는 것은 main 하나. 커밋 전 MM과 RM 확인, PR base는 develop이고 squash를 쓰지 않는다. 절차는 pop-pick-git 스킬에 있다
- `state.md`. 서버 상태는 TanStack Query, 공유할 조건값은 URL, 나머지 클라이언트 상태만 Zustand. 서버 데이터를 스토어에 복제하지 않는다
- `tailwind.md`. X-[value] 임의값을 쓰지 않는다. 값은 src/shared/styles/tokens의 @theme inline 토큰과 utilities.css의 @utility에서 온다. 어긋난 값을 옮기는 네 갈래. 값에 따라 갈리는 모양은 aria 변형과 @/shared/lib/tv 레시피로 적는다
- `testing-trophy.md`. 테스팅 트로피가 전략이다. 기본 동작은 삭제이고 추가는 예외다. 도구는 Vitest와 Testing Library, MSW이고 테스트는 tests/에 둔다. 층마다 소유하는 것과 지우는 기준, 덜 깨지게 쓰는 법
- `typescript-conventions.md`. 이 저장소에서 타입스크립트 규칙을 기계로 막는 것과 그 규칙의 본문. 추론되는 반환 타입, props는 interface, return 앞과 블록 뒤 빈 줄, boolean 상태 이름
- `ui.md`. 기성 UI 라이브러리 없음(모양 없이 동작만 주는 부품은 예외). 공용 컴포넌트는 src/shared/ui와 components가 주인. 파일 이름과 선언 형식의 정본. 이벤트 핸들러는 JSX 밖으로 뺀다. 모바일 퍼스트, 키보드로 조작 가능, 토큰만 쓴다

<!-- agents-sync:rules:end -->

## 하네스

스킬은 넷이고 어떤 스킬이 있는지는 이 절이 정본이다. 개발은 `.agents/skills/pop-pick-dev`, QA는 `.agents/skills/pop-pick-qa`, git 절차는 `.agents/skills/pop-pick-git`이다. 기능이나 화면을 만들기 전에 dev를 읽는다. qa는 QA 테스트 케이스가 오기 전까지 스켈레톤이다. `review-protocol`은 리뷰어에 미리 실리는 공통 규약이라 사용자가 꺼내지 않는다.

<!-- agents-sync:agents:begin -->

<!-- 이 표식 사이는 .agents/scripts/agents-sync.mjs 가 .agents/agents/ 에서 만든다. 손으로 고치지 않는다 -->

에이전트 13개의 원본이 `.agents/agents/` 아래 폴더 4개에 있다. `builders/`에 `pop-pick-architect`, `pop-pick-implementer`, `pop-pick-spec-navigator`, `curators/`에 `pop-pick-docs-curator`, `reviewers/`에 `pop-pick-review-api`, `pop-pick-review-build`, `pop-pick-review-data`, `pop-pick-review-nextjs`, `pop-pick-review-screen`, `pop-pick-review-structure`, `pop-pick-review-tailwind`, `pop-pick-review-typescript`, `verifiers/`에 `pop-pick-integration-qa`다.

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
| 기능 설계                 | `docs/architecture/{기능}.md`                                                                        |
| 백엔드 계약               | 백엔드 저장소 `pop-pick-server`의 코드. 조회 순서는 `pop-pick-dev`의 `references/contract-lookup.md` |
| 하네스가 어떻게 도나      | `docs/harness/AI_WORKFLOW.md`                                                                        |
| 사람이 따르는 기여 절차   | `CONTRIBUTING.md`                                                                                    |

## 자주 틀리는 것

- 날짜는 date-fns로 다루고 달력 부품은 react-day-picker다. 서버가 UTC로 돌아서 오늘과 현재 시각은 `@/shared/lib/date`의 `getSeoulNow`와 `getSeoulToday`로 서울 기준을 구한다. `new Date()`와 `Date.now()`는 쓰지 않는다. 렌더 중에 지금 시각이 필요하면 `@/shared/lib/useSeoulNow`를 쓴다. React Compiler가 켜져 있어 렌더에서 `getSeoulNow`를 부르면 첫 값이 기억되고 시간이 흘러도 화면이 바뀌지 않는다. `"yyyy-MM-dd"`와 `"HH:mm"` 문자열은 같은 파일의 `parseDateOnly`나 `parseDateOnlyOrThrow`, `parseTimeOnlyOrThrow`로 읽는다. date-fns의 `parse`는 `2026-2-3`도 받아 주기 때문이다
- `pnpm build`와 `pnpm type:check`는 `API_BASE_URL`이 비어 있으면 실패한다. `next.config.ts`가 설정을 읽을 때 예외를 낸다
- `.claude/`와 `.codex/` 아래 생성물을 손으로 고치면 다음 `pnpm harness:sync`가 지운다. `.agents/` 원본을 고친다
