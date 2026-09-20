---
description: main과 develop, feature 세 브랜치. 커밋 메시지는 <타입>: <한국어 제목>. 금지 패턴 다섯. 브랜치와 커밋, PR, 머지 절차는 pop-pick-git 스킬에 있다
---

# Git 워크플로우

## 규칙

- 통합 브랜치는 `develop`, 프로덕션은 `main`이다. 둘에 직접 커밋하지 않고 `feature/{슬러그}`나 `fix/{슬러그}`에서 PR로 올린다
- 커밋 메시지는 `<타입>: <제목>`이다. 제목은 50자 이내 한국어이고 괄호 scope와 한자를 쓰지 않는다. 타입은 `scripts/commit-template.txt`의 여덟이다
- 사용자가 요청할 때만 커밋하고 푸시한다
- squash 머지를 쓰지 않는다. merge commit이나 rebase merge만 쓴다

## 금지 패턴

1. `main`과 `develop` 직접 커밋
2. `git add -A`와 `git add .` 광범위 스테이징. 파일 단위로 명시한다
3. `.env`와 비밀값 파일 커밋
4. 병합 충돌 `--ours` 일방 해소. 양쪽 의미를 검토한 뒤 해소한다
5. 강제 푸시와 `--no-verify`. 리베이스가 필요하면 `--force-with-lease`만 쓰고 기본 브랜치에는 쓰지 않는다

첫째와 둘째, 다섯째는 PreToolUse 훅 `.agents/hooks/guard-git.sh`가 막는다. 절차와 이유, lefthook이 하는 일, 릴리스 뒤 정리는 `.agents/skills/pop-pick-git/SKILL.md`에 있다.
