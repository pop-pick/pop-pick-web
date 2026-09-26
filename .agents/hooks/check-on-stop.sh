#!/usr/bin/env bash
# Stop 훅. 이번 턴에 바뀐 파일이 컨벤션 검사에 걸리면 한 번 막는다.

set -uo pipefail

input="$(cat)"
dir="$(cd "$(dirname "$0")" && pwd)"
. "$dir/lib/hook-input.sh"

active="$(printf '%s' "$input" | hook_field stop_hook_active 2>/dev/null)" || exit 0
[ "$active" = "true" ] && exit 0
session="$(printf '%s' "$input" | hook_field session_id 2>/dev/null)"

project_dir="${CLAUDE_PROJECT_DIR:-$(cd "$dir/../.." && pwd)}"
cd "$project_dir" 2>/dev/null || exit 0
[ -f .agents/scripts/check-conventions.sh ] || exit 0

changed="$(bash "$dir/lib/turn-changes.sh" list "$session")"
[ -n "$changed" ] || exit 0

output="$(bash .agents/scripts/check-conventions.sh 2>&1)" && exit 0

hit=""
while IFS= read -r file; do
	case "$output" in
		*"$file"*)
			hit="$file"
			break
			;;
	esac
done <<EOF
$changed
EOF
[ -n "$hit" ] || exit 0

{
	printf '%s\n\n' "$output"
	printf '이번 턴에 바뀐 파일이 컨벤션 검사에 걸렸다. 걸린 곳을 고치고 끝낸다.\n'
	printf '고칠 수 없으면 왜인지 말하고 끝낸다. 검사를 느슨하게 고쳐서 통과시키지 않는다.\n'
} >&2
exit 2
