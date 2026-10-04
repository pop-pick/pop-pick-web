# 기여 안내

팝픽 프론트엔드를 로컬에서 띄우고 브랜치를 따서 PR을 머지하기까지의 안내다. 각 단계의 규칙 본문은 정본 문서에 있고 여기서는 가리키기만 한다. 서비스 소개는 [README.md](README.md)에 있다.

## 개발 환경

Node는 `.nvmrc`의 버전(24)을, pnpm은 `package.json`의 `packageManager`(11)를 쓴다.

```bash
nvm use
pnpm install
cp .env.example .env.local
pnpm dev
```

개발 서버는 http://localhost:3000 에서 열린다.

`pnpm install`이 끝나면 `prepare` 스크립트가 lefthook 훅을 설치하고 `.agents/` 원본을 `.claude`와 `.codex` 자리에 복사한다. 따로 할 일은 없다.

`.env.example`에는 변수 이름만 있다. `.env.local`의 `API_BASE_URL`이 비어 있으면 개발 서버와 `pnpm build`, `pnpm type:check`, 푸시가 실패한다. `next.config.ts`가 설정을 읽을 때 이 값이 없으면 예외를 내기 때문이다. 값과 카카오 키 발급, 도메인 등록은 [docs/release/RUNBOOK.md](docs/release/RUNBOOK.md)의 환경 변수 절에 있다.

## 명령

| 명령                 | 하는 일                                                                                |
| -------------------- | -------------------------------------------------------------------------------------- |
| `pnpm dev`           | 개발 서버를 연다                                                                       |
| `pnpm build`         | 프로덕션 빌드를 만든다                                                                 |
| `pnpm start`         | 빌드 결과를 실행한다                                                                   |
| `pnpm preview`       | `pnpm start`를 부른다                                                                  |
| `pnpm lint`          | ESLint로 저장소 전체를 검사한다. 타입 정보가 필요한 규칙도 함께 돈다                   |
| `pnpm lint:fix`      | ESLint가 자동으로 고칠 수 있는 것을 고친다. import 정렬 등                             |
| `pnpm format`        | Prettier로 저장소 전체를 고쳐 쓴다                                                     |
| `pnpm format:check`  | Prettier 검사만 한다                                                                   |
| `pnpm type:check`    | `next typegen`과 `tsc --noEmit`                                                        |
| `pnpm test`          | Vitest로 `tests/`의 테스트를 한 번 돌린다                                              |
| `pnpm test:watch`    | 파일을 고칠 때마다 테스트를 다시 돌린다                                                |
| `pnpm check`         | 게이트(`type:check`와 `test`, `build`, `lint`, `format:check`)를 차례로 돌린다         |
| `pnpm harness:sync`  | `.agents/` 원본을 `.claude`와 `.codex` 자리에 복사하고 변환한다. 원본을 고친 뒤 돌린다 |
| `pnpm harness:check` | 컨벤션 검사와 생성물 대조, 회귀 테스트를 한 번에 돌린다. lefthook과 CI가 돌린다        |

## 작업 순서

1. **브랜치를 딴다.** 원격의 최신 `develop`에서 `feature/{슬러그}`를 만든다. 고치는 일이면 `fix/{슬러그}`다. 직접 커밋을 막는 브랜치는 `main` 하나다. 브랜치 전략과 이름 규칙은 `.agents/skills/pop-pick-git/SKILL.md`에 있다. Claude Code에서는 `/git:branch`가 같은 절차로 만든다
2. **작업한다.** 세션마다 지킬 것은 [AGENTS.md](AGENTS.md)에 있고 규칙 본문은 `.agents/rules/`에 있다. 어느 규칙이 무엇을 다루는지는 `AGENTS.md`의 룰 목록이 답한다. 폴더 배치는 `.agents/rules/architecture.md`, 테스트는 `.agents/rules/testing-trophy.md`가 정한다
3. **게이트를 돌린다.** 명령과 순서는 `.agents/rules/change-process.md`의 게이트 절이 정본이다
4. **커밋한다.** 형식은 `<타입>: <제목>`이고 제목은 한국어다. 타입 목록과 본문 작성법, 훅이 하는 일, 커밋 전에 확인할 것은 `.agents/skills/pop-pick-git/SKILL.md`에 있다. `/git:commit`이 같은 규칙으로 커밋을 만든다
5. **PR을 연다.** base는 `develop`이다. GitHub 화면은 `main`으로 잡으니 바꾼다. 본문은 `.github/PULL_REQUEST_TEMPLATE.md`를 채운다. `/git:create-pr`이 base와 템플릿을 맞춰 준다
6. **머지한다.** CI가 초록불이어야 한다. squash 머지를 쓰지 않는다. 이유와 릴리스 뒤 `develop`을 `main`에 맞추는 절차는 `.agents/skills/pop-pick-git/SKILL.md`에 있다

## 문서

공개 계약이나 동작 규칙을 바꾸면 `docs/`의 해당 문서를 같은 PR에서 고친다. 어느 문서가 무엇을 답하는지는 [docs/README.md](docs/README.md)에 있다.
