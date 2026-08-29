# 기여 안내

팝픽 프론트엔드 저장소에서 작업하는 방법을 적는다. 자세한 규칙은 `.agents/rules/git-workflow.md`에 있다.

## 브랜치

`main`은 프로덕션 릴리스 전용이다. `develop`이 통합 브랜치이고 모든 작업은 `feature/{슬러그}`에서 한다. 고치는 일이면 `fix/{슬러그}`를 쓴다.

```
main               프로덕션 릴리스
develop            통합. 모든 PR의 base
feature/{슬러그}   작업 단위 브랜치
fix/{슬러그}       고치는 일
```

- 브랜치 이름은 `feature/planner-form`처럼 영문 케밥 케이스로 짓는다
- 브랜치는 원격의 최신 `develop`에서 딴다
- GitHub 기본 브랜치는 `main`이다. 화면에서 PR을 열 때 base를 `develop`으로 바꾼다
- 한 브랜치는 한 가지 일만 담는다

이 구조는 이 저장소의 규칙이다. 팀 공통 브랜치 전략은 8/30 개발자 논의에서 확정하며 확정되면 이 문서를 그에 맞춘다.

## 커밋

형식은 `<타입>: <제목>`이다. 제목은 한국어로 50자 이내에 쓰고 scope 괄호는 붙이지 않는다. 본문에는 무엇을 왜 바꿨는지 적는다. 어떻게 바꿨는지는 diff에 있다.

```
docs: README에 시작하기 절 추가

- 새로 합류한 사람이 설치부터 개발 서버 실행까지 한 번에 따라갈 수 있게 한다
```

타입은 `scripts/commit-template.txt`와 같다. 커밋 메시지를 비워 두고 커밋하면 `prepare-commit-msg` 훅이 이 템플릿을 넣어 준다.

| 타입     | 용도                                |
| -------- | ----------------------------------- |
| feat     | 새로운 기능                         |
| fix      | 버그 수정                           |
| docs     | 문서 변경                           |
| style    | 코드 포맷팅 (세미콜론, 들여쓰기 등) |
| refactor | 코드 리팩토링                       |
| perf     | 성능 개선                           |
| test     | 테스트 추가나 수정                  |
| chore    | 빌드, 설정 변경                     |

## 훅

lefthook이 `pnpm install` 때 설치된다. 설정은 `lefthook.yaml`에 있다.

| 시점               | 도는 것                                                                    |
| ------------------ | -------------------------------------------------------------------------- |
| prepare-commit-msg | 메시지가 비어 있으면 커밋 템플릿을 넣는다                                  |
| pre-commit         | `pnpm lint`와 `pnpm format:check`. 바뀐 파일만이 아니라 저장소 전체를 본다 |
| pre-push           | `pnpm type:check`                                                          |

한 파일에 스테이징된 변경과 스테이징되지 않은 변경이 함께 있으면 훅 처리 중 스테이징되지 않은 변경이 사라질 수 있다. 커밋 전에 `git status --short`에서 `MM`으로 시작하는 줄이 없는지 확인하고 있으면 정리한다.

## 게이트

커밋하기 전에 순서대로 돌린다. 하나라도 실패하면 커밋하지 않는다.

1. `pnpm type:check`
2. `pnpm build`
3. `pnpm lint`와 `pnpm format:check`

## Pull Request

- base는 `develop`이다
- PR 하나에 작업 단위 하나를 담는다
- `.github/PULL_REQUEST_TEMPLATE.md`를 채운다
- squash 머지를 쓰지 않는다. merge commit 또는 rebase merge로 머지한다. squash로 압축하면 `main`이 `develop`의 조상 관계를 잃어 다음 PR마다 충돌이 반복된다
- `gh pr merge`를 쓸 때는 `--merge` 또는 `--rebase`를 명시한다
- 푸시하면 Vercel가 `https://pop-pick-web-git-{브랜치 이름}-chan9yus-projects.vercel.app`에 미리보기를 만든다. PR 본문에 적는다
- `develop`에서 `main`으로 올리는 릴리스 PR을 머지한 뒤에는 `develop`을 `main`에 fast-forward로 맞춘다. 절차는 `.agents/rules/git-workflow.md`에 있다

## 문서

공개 계약이나 동작 규칙을 바꾸면 `docs/`의 해당 문서를 같은 PR에서 고친다. 어느 문서가 무엇을 답하는지는 `docs/CLAUDE.md`에 있다.
