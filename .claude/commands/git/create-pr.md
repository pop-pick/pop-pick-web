---
description: 현재 브랜치의 변경사항으로 Pull Request를 생성해주세요.
---

# Create PR

현재 feature 브랜치의 변경사항으로 Pull Request를 만든다.

## 절차

1. `git status`와 `git log develop..HEAD --oneline`으로 브랜치의 변경과 커밋 목록 확인
2. 원격 저장소 확인 (`git remote -v`)
   - 원격이 없으면 PR을 만들 수 없다. 사용자에게 알리고 로컬 머지(`/git:merge`)를 안내한 뒤 종료
3. 현재 브랜치를 push (`git push -u origin HEAD`). 푸시할 때 lefthook pre-push가 `pnpm type:check`를 돌린다
4. `gh pr create`로 PR 생성. base는 `develop`

`develop`을 `main`으로 올리는 릴리스 PR은 다르다. PR을 만들기 전에 `git fetch origin main`과 `git merge origin/main`으로 충돌을 먼저 해소한다. 이 순서를 건너뛰면 PR마다 충돌을 만난다.

## PR 작성 규칙

- 제목: 커밋 컨벤션과 같은 형식 (`<타입>: <제목>`, 한국어)
- 본문은 `.github/PULL_REQUEST_TEMPLATE.md`의 절을 채운다
  - 변경 요약. 무엇을 왜 했는지
  - 바꾼 동작이 `docs/`의 어느 문서에 해당하는지 적고 그 문서를 같은 PR에서 고쳤는지 확인한다
  - 검증 결과. `pnpm type:check`, `pnpm build`, `pnpm lint`, `pnpm format:check`를 로컬에서 돌린 결과. CI가 아직 없어 로컬 결과가 유일한 검증이다
- PR 하나에 작업 단위 하나만 담는다. 무관한 변경이 섞였으면 PR 전에 분리한다
