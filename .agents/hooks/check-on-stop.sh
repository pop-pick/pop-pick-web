#!/usr/bin/env bash
#
# Stop 훅. 응답을 끝내기 전에 컨벤션 검사를 돌리고 걸리면 끝내지 못하게 한다.
#
# 에이전트에게 스크립트를 돌리라고 적어 두는 것으로는 부족하다. 잊으면 그냥 안 돈다.
# 여기서 막으면 잊어도 돈다.
#
# 돌리지 않는 때가 둘 있다.
#
# - 이미 한 번 막은 뒤다. 고치지 못하는 것에 갇히지 않게 한 번만 막는다
# - 추적하는 파일에 바뀐 것이 없다. 질문만 한 턴에는 검사할 것이 없다
#
# 게이트 넷은 여기서 돌리지 않는다. 빌드가 느리고 타입 검사는 물어보려고 멈추는 자리를
# 자주 막는다. 게이트는 AGENTS.md 가 시키고 lefthook 이 커밋과 푸시에서 돌린다.

set -uo pipefail

input="$(cat)"

case "$input" in
	*'"stop_hook_active"'*'true'*) exit 0 ;;
esac

project_dir="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$project_dir" 2>/dev/null || exit 0

[ -f .agents/scripts/check-conventions.sh ] || exit 0

changed="$(git status --porcelain -- src docs scripts .agents .claude .codex AGENTS.md CLAUDE.md README.md CONTRIBUTING.md 2>/dev/null)"
[ -n "$changed" ] || exit 0

output="$(bash .agents/scripts/check-conventions.sh 2>&1)" && exit 0

{
	printf '%s\n\n' "$output"
	printf '컨벤션 검사가 걸렸다. 걸린 자리를 고치고 끝낸다.\n'
	printf '고칠 수 없는 것이면 왜인지 사용자에게 말하고 끝낸다.\n'
	printf '검사를 느슨하게 고쳐서 통과시키지 않는다.\n'
} >&2

exit 2
