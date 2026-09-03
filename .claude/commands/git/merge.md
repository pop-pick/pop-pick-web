---
description: PR을 머지하고 브랜치를 정리해주세요.
---

# Merge

완료된 feature 브랜치를 `develop`으로 머지하고 정리한다.

## 절차

1. 완료 기준을 확인한다. 게이트 통과와 리뷰 반영 여부를 본다. 미충족이면 머지하지 않고 보고한다
2. 머지 경로를 정한다
   - PR이 있으면 `gh pr merge --merge` 또는 `--rebase`
   - 원격이나 PR이 없으면 `git switch develop` 후 `git merge --no-ff feature/{slug}`
3. 머지 커밋 메시지는 기본 형식 `Merge branch 'feature/{slug}'`를 그대로 둔다
4. 머지 뒤 `pnpm type:check`와 `pnpm build`가 통과하는지 확인한다
5. `git branch -d feature/{slug}`로 브랜치를 지운다. 원격 브랜치가 있으면 원격도 지운다
6. `git log --oneline -5`로 결과를 확인한다

**squash 머지를 쓰지 않는다.** `--squash`를 붙이면 `main`이 `develop`의 조상 관계를 잃어 다음 PR마다 충돌이 생기고 커밋 단위 이력도 사라진다.

## 규칙

`.agents/rules/git-workflow.md`의 브랜치 전략과 금지 패턴을 따른다.
