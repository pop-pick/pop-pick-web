---
description: 변경사항을 분석하여 커밋 컨벤션에 맞게 커밋을 생성해주세요.
disable-model-invocation: true
---

# Commit

변경사항을 분석해 커밋 컨벤션에 맞는 커밋을 만든다.

## 절차

1. `git status`와 `git diff`로 변경사항을 확인한다
2. `git status --short`에서 MM으로 시작하는 줄이 있으면 커밋 전에 정리한다. 한 파일에 스테이징된 변경과 스테이징되지 않은 변경이 함께 있는 상태이며 훅 처리 중 스테이징되지 않은 쪽이 사라질 수 있다
3. 변경사항을 논리적 단위로 나눈다. 커밋 하나에 태스크 하나만 담는다
4. 단위별로 파일을 명시해 `git add`하고 커밋한다. `git add -A`를 쓰지 않는다
5. 커밋 후 `git status`로 결과를 확인한다

## 규칙

커밋 메시지 형식과 lefthook이 돌리는 검사, 실패했을 때 할 일은 `.agents/skills/pop-pick-git/SKILL.md`의 커밋 메시지 절과 커밋 전 확인 절을 따른다. 검사에 걸리면 원인을 고치고 다시 커밋한다.
