---
description: 변경사항을 분석하여 커밋 컨벤션에 맞게 커밋을 생성해주세요.
---

# Commit

변경사항을 분석해 커밋 컨벤션에 맞는 커밋을 만든다.

## 절차

1. `git status`와 `git diff`로 변경사항 확인
2. `git status --short`에서 MM으로 시작하는 줄이 있으면 커밋 전에 정리한다. 한 파일에 스테이징된 변경과 스테이징되지 않은 변경이 함께 있는 상태이며 훅 처리 중 스테이징되지 않은 쪽이 사라질 수 있다
3. 변경사항을 논리적 단위로 분리 (커밋 하나에 이슈 하나만)
4. 단위별로 파일을 명시해 `git add`하고 커밋 생성. `git add -A`를 쓰지 않는다
5. 커밋 후 `git status`로 결과 확인

## 훅

커밋할 때 lefthook pre-commit이 스테이징된 파일 종류에 따라 `pnpm lint`와 `pnpm format:check`를 돌린다. 검사 범위는 바뀐 파일이 아니라 저장소 전체다. 실패하면 원인을 고치고 다시 커밋한다. `--no-verify`로 건너뛰지 않는다.

## 커밋 메시지

`.agents/rules/git-workflow.md`의 커밋 규칙을 따른다.
