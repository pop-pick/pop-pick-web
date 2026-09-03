---
description: 브랜치 전략과 커밋 메시지 형식, 머지 방식, lefthook 훅과 CI 머지 조건, 금지 패턴
---

# Git 워크플로우

## 브랜치 전략

통합 브랜치는 `develop`이다. `main`은 프로덕션 릴리스 전용이라 직접 커밋하지 않는다.

```
main       프로덕션 릴리스
  위로
develop    통합. 모든 feature PR의 base
  위로
feature/{슬러그}    작업 단위 브랜치
```

레포가 프론트와 백엔드로 나뉘어 있어 브랜치 전략은 저장소마다 따로 정한다. 이 구조는 프론트엔드 저장소의 규칙이다. 6주 프로젝트라 hotfix와 release 브랜치는 두지 않는다.

- 브랜치 이름은 `feature/planner-form`처럼 영문 케밥 케이스로 짓는다. 고치는 일이면 `fix/{슬러그}`를 쓴다
- 한 브랜치는 한 가지 일만 담는다. 성격이 다른 작업을 한 브랜치에 몰아넣지 않는다
- 브랜치를 딸 때는 원격의 최신 `develop`에서 딴다. 뒤처진 로컬에서 따면 나중에 충돌이 쌓인다
- 작업이 끝나면 `develop`으로 PR을 연다. 머지 후 로컬 브랜치를 지운다
- GitHub 기본 브랜치는 `main`이다. 화면에서 PR을 열 때는 base가 `main`으로 잡히므로 `develop`으로 바꾼다. `/git:create-pr`은 `--base develop`을 명시한다

## 커밋 규칙

사용자가 "커밋해" 또는 `/git:commit`을 요청할 때만 커밋한다. 지난번에 커밋을 요청받았다고 해서 이번 작업까지 이어지지 않는다.

### 커밋 메시지 형식

```
<타입>: <제목>

- 무엇을 왜 바꿨는지
- 관련 이슈 번호가 있으면 함께 적는다
```

예: `feat: 플래너 조건 입력 폼 추가`

**괄호 표기(scope)를 쓰지 않는다.** 프론트엔드 둘이 쓰는 저장소라 제목만으로 무엇을 바꿨는지 구분된다. `feat(planner):` 형태로 scope를 두면 둘이 이름을 맞추는 비용만 생긴다.

### 타입

`scripts/commit-template.txt`와 같은 목록이다. 커밋 메시지를 비워 두고 커밋하면 이 템플릿이 편집기에 뜬다.

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

### 작성 규칙

- 타입은 소문자 영문, 제목은 한국어로 쓴다
- 제목은 50자 이내
- 제목과 본문 사이에 빈 줄을 넣는다
- 어떻게보다 무엇을 왜 했는지를 쓴다. 어떻게는 diff에 있다
- 한 태스크가 한 커밋이다. 성격이 다른 변경(기능과 설정, 포맷)을 한 커밋에 섞지 않는다
- 한자를 쓰지 않는다. 길이가 아쉬워도 말로 푼다. 원격에 올라간 커밋 메시지는 고치지 못한다

## 커밋 전 확인

lefthook이 세 자리에서 훅을 돌린다. 설정은 `lefthook.yaml`에 있다.

| 훅                 | 하는 일                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| prepare-commit-msg | 메시지가 비어 있으면 `scripts/commit-template.txt`를 넣는다                                                                                                                                                  |
| pre-commit         | js와 ts 계열 파일이 스테이징되어 있으면 `pnpm run lint`를, 여기에 json과 yaml, md, css, html까지 더한 종류의 파일이 있으면 `pnpm run format:check`를 돌린다. 둘은 병렬로 돌고 merge와 rebase 중에는 건너뛴다 |
| pre-push           | `pnpm run type:check`                                                                                                                                                                                        |

pre-commit과 pre-push의 명령은 바뀐 파일만이 아니라 저장소 전체를 본다. 내가 건드리지 않은 파일에 어긋난 것이 있어도 커밋이 막힌다. 그럴 때는 그 파일을 고치는 커밋을 따로 만든다.

여기에 함정이 하나 더 있다.

**한 파일에 스테이징된 변경과 스테이징되지 않은 변경이 함께 있으면 훅 처리 중 스테이징되지 않은 변경이 사라질 수 있다.**

```bash
git status --short     # MM으로 시작하는 줄을 먼저 확인
```

MM 파일이 있으면 커밋 전에 정리한다. 커밋 후에는 `git status`를 다시 대조해 의도한 것만 들어갔는지 확인한다.

### PR 머지 조건

CI(`.github/workflows/ci.yaml`)가 PR마다 게이트 넷을 돌린다. `develop`과 `main`은 CI 통과 없이 머지할 수 없다. PR 승인 인원은 미정이다.

훅은 로컬에서 `--no-verify`로 건너뛸 수 있지만 CI는 그럴 수 없다. 그래서 머지 조건은 훅이 아니라 CI에 둔다.

## 머지 방식

**squash 머지를 쓰지 않는다.** merge commit 또는 rebase merge만 쓴다.

squash로 압축하면 `main`이 `develop`의 조상 관계를 잃는다. 그러면 다음 PR마다 충돌이 새로 생긴다. 커밋 단위 이력도 함께 사라져 `git log`와 `git blame`으로 변경 의도를 추적할 수 없게 된다.

`gh pr merge`를 쓸 때는 `--merge` 또는 `--rebase`를 명시한다. GitHub 화면에서는 Create a merge commit이나 Rebase and merge를 고른다.

## PR 만들기 전에

`develop`에서 `main`으로 PR을 열기 전에 `main`을 먼저 흡수한다. 이 단계를 건너뛰면 PR 화면에서 충돌이 뜬다.

```bash
git fetch origin main
git merge origin/main
git push origin develop
```

그다음에 PR을 연다. PR 본문에는 squash를 쓰지 말아 달라고 적는다. 저장소의 PR 템플릿에 이미 들어 있다.

릴리스 PR을 머지하면 `main`에 머지 커밋이 하나 생겨 `develop`보다 앞선다. 그대로 두면 다음 릴리스 PR에 그 커밋이 다시 끼어든다. 머지 직후 `develop`을 `main`에 맞춘다.

```bash
git switch develop
git fetch origin main
git merge --ff-only origin/main
git push origin develop
```

`main`에 머지되면 Vercel이 프로덕션에 자동 배포한다. 배포 주소는 `docs/release/RUNBOOK.md`에 있다.

## 금지 패턴

1. **`git add -A` 광범위 스테이징.** 파일 단위로 명시해서 add한다
2. **`.env`와 비밀값 파일 커밋.** `.gitignore` 확인이 필수다
3. **`main`과 `develop` 직접 커밋.** 항상 feature 브랜치를 경유한다
4. **병합 충돌 `--ours` 일방 해소.** 양쪽 의미를 검토한 뒤 해소한다
5. **"WIP" 커밋 그대로 병합.** 병합 전에 메시지를 정리한다
6. **강제 푸시.** 리베이스가 필요하면 `--force-with-lease`만 쓰고 기본 브랜치에는 쓰지 않는다
