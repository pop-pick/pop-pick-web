#!/usr/bin/env bash
#
# PreToolUse(Edit|Write) 훅. 고치려는 파일에 paths 가 맞는 룰 목록을 알린다. 판정은 lib/rule-matcher.py 가 한다

set -uo pipefail

dir="$(cd "$(dirname "$0")" && pwd)"

if ! command -v python3 >/dev/null 2>&1; then
	cat >/dev/null
	printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"python3 가 없어 이 파일에 맞는 룰을 찾지 못했다. .agents/rules/ 의 paths 를 직접 본다"}}\n'
	exit 0
fi

python3 "$dir/lib/rule-matcher.py"
exit 0
