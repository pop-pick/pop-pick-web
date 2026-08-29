---
description: 새 브랜치를 생성하고 전환해주세요.
---

# Branch

작업 단위에 맞는 feature 브랜치를 만들어 전환한다.

## 절차

1. `git status`로 워킹트리 상태 확인. 커밋하지 않은 변경이 있으면 커밋할지 스태시할지 사용자에게 먼저 확인한다
2. 원격과 통합 브랜치 확인. `git remote -v`로 `origin`이 있는지, `git branch -a`로 `develop`이 있는지 본다. 둘 중 하나라도 없으면 임의로 만들지 않는다. 사용자에게 알린 뒤 멈춘다. 통합 브랜치를 만드는 것은 사용자가 결정한다
3. 분기 기준 확인. `develop`에서 분기한다. 다른 브랜치에 있으면 `git switch develop` 후 `git pull origin develop`으로 원격 최신 상태를 받는다
4. 브랜치 이름 결정. 인자로 받았으면 그대로 쓰고, 없으면 현재 작업 맥락에서 제안하고 확인받는다. 영문 케밥 케이스로 짓는다. 예: `feature/planner-form`, `feature/course-map`. 고치는 일이면 `fix/{slug}`를 쓴다. 예: `fix/planner-form-validation`
5. `git switch -c feature/{slug}`로 생성하고 전환
6. `git branch --show-current`로 결과 확인

## 규칙

`.agents/rules/git-workflow.md`의 브랜치 전략을 따른다. `main`과 `develop`, `feature/{slug}`의 3단 구조는 이 저장소의 규칙이며 팀 공통 전략이 확정되면 맞춘다.
