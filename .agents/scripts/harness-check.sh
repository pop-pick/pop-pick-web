#!/usr/bin/env bash
#
# harness-check. 하네스가 스스로를 확인하는 검사 셋을 한 번에 돌린다. lefthook pre-commit 과 CI 가 돌린다.
#
#   1. check-conventions.sh     룰에 적힌 grep 검사
#   2. agents-sync.mjs --check  생성물이 원본과 맞는가
#   3. harness-test.sh          검사 스크립트와 훅의 회귀 테스트
#
# CI(환경 변수 CI)에서는 prepare 가 생성물을 바꿨는지도 본다. 바뀌었으면 커밋된 복사본이 낡은 것이다.
# 통과한 검사는 한 줄로 줄이고 걸린 검사만 출력을 그대로 낸다. 하나라도 걸리면 1 로 끝난다.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

fail=0
run() {
	local title="$1"
	shift
	local out
	if out="$("$@" 2>&1)"; then
		printf '  통과  %s\n' "$title"
	else
		printf '\n  실패  %s\n\n%s\n\n' "$title" "$out"
		fail=1
	fi
}

run "컨벤션 검사" bash .agents/scripts/check-conventions.sh
run "생성물 대조" node .agents/scripts/agents-sync.mjs --check
run "회귀 테스트" bash .agents/scripts/harness-test.sh

if [ -n "${CI:-}" ]; then
	if [ -z "$(git status --porcelain -- .claude .codex AGENTS.md)" ]; then
		printf '  통과  커밋된 생성물\n'
	else
		printf '\n  실패  커밋된 생성물\n\n'
		git status --short -- .claude .codex AGENTS.md
		printf '\nprepare 가 생성물을 바꿨다. 커밋된 복사본이 원본과 어긋난다. pnpm harness:sync 를 돌리고 함께 커밋한다\n\n'
		fail=1
	fi
fi

if [ "$fail" -eq 0 ]; then
	printf '하네스 검사 통과\n'
	exit 0
fi
printf '하네스 검사 실패\n'
exit 1
