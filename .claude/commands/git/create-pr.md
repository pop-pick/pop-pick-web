---
description: 현재 브랜치의 변경사항으로 Pull Request를 생성해주세요.
---

# Create PR

현재 feature 브랜치의 변경사항으로 Pull Request를 만든다.

## 절차

1. `git status`와 `git log develop..HEAD --oneline`으로 브랜치의 변경과 커밋 목록을 확인한다
2. `git remote -v`로 원격 저장소를 확인한다. 원격이 없으면 PR을 만들 수 없다. 사용자에게 알리고 로컬 머지(`/git:merge`)를 안내한 뒤 멈춘다
3. `git push -u origin HEAD`로 현재 브랜치를 푸시한다. 푸시할 때 lefthook pre-push가 `pnpm type:check`를 돌린다
4. `gh pr create`로 PR을 만든다. base는 `develop`이다

`develop`을 `main`으로 올리는 릴리스 PR은 다르다. PR을 만들기 전에 `git fetch origin main`과 `git merge origin/main`으로 충돌을 먼저 해소한다. 이 순서를 건너뛰면 PR마다 충돌을 만난다.

## PR 작성 규칙

- 제목은 커밋과 같은 형식이다. `<타입>: <제목>`, 한국어
- 본문은 `.github/PULL_REQUEST_TEMPLATE.md`의 절을 채운다
  - 변경 요약. 무엇을 왜 했는지
  - 바꾼 동작이 `docs/`의 어느 문서에 해당하는지 적고 그 문서를 같은 PR에서 고쳤는지 확인한다
  - 검증 결과. `pnpm type:check`, `pnpm build`, `pnpm lint`, `pnpm format:check`를 로컬에서 돌린 결과. CI가 같은 넷을 돌리며 통과해야 머지할 수 있다. 로컬 결과를 먼저 적는다
  - 미리보기 URL. `https://pop-pick-web-git-{브랜치 이름}-chan9yus-projects.vercel.app`. 푸시 뒤 Vercel이 만들며 로그인 없이 열린다
- PR 하나에 작업 단위 하나만 담는다. 무관한 변경이 섞였으면 PR 전에 분리한다
