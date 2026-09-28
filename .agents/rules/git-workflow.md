---
description: 커밋 메시지는 <타입>: <한국어 제목>. main과 develop, feature 브랜치이고 직접 커밋을 막는 것은 main 하나. 커밋 전 MM과 RM 확인, PR base는 develop이고 squash를 쓰지 않는다. 절차는 pop-pick-git 스킬에 있다
---

# Git 워크플로우

## 커밋 메시지

형식은 `<타입>: <제목>`이다. 제목은 50자 이내 한국어이고 괄호 scope와 한자를 쓰지 않는다. 타입은 `scripts/commit-template.txt`의 여덟이다.

## 브랜치

통합 브랜치는 `develop`, 프로덕션은 `main`이다. 작업은 `feature/{슬러그}`나 `fix/{슬러그}`에서 하고 PR로 올린다.

보호 브랜치는 `main` 하나다. PreToolUse 훅 `.agents/hooks/guard-git.sh`가 `main`에서의 커밋과 `main`으로 가는 푸시를 막는다. `develop` 위의 커밋과 `develop`으로 가는 푸시는 막지 않는다. 릴리스 PR 전후에 `develop`을 `main`에 맞추는 절차가 쓴다.

같은 훅이 광범위 스테이징과 `commit -a`, `.env` 스테이징, 강제 푸시, 훅 건너뛰기도 막는다.

## 커밋 전 확인

`git status --short`에서 `MM`에 더해 `RM`으로 시작하는 줄도 커밋 전에 정리한다. lefthook이 부분 스테이징 파일의 unstaged 변경을 잠시 숨기기 때문이다. lefthook이 커밋과 푸시에서 돌리는 것은 `.agents/skills/pop-pick-git/SKILL.md`에 있다.

## PR 흐름

GitHub 기본 브랜치가 `main`이라 feature PR의 base를 `develop`으로 적는다. squash 머지를 쓰지 않고 merge commit이나 rebase merge만 쓴다. 이유와 릴리스 뒤 정리 절차는 `.agents/skills/pop-pick-git/SKILL.md`에 있다.
