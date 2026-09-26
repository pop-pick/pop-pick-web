#!/usr/bin/env bash
# 이번 턴에 바뀐 파일을 가린다. save 는 바뀐 파일과 내용 해시를 떠 두고 list <세션> 은 그 뒤로 바뀐 파일을 낸다

set -uo pipefail

dir="$(cd "$(dirname "$0")" && pwd)"
project_dir="${CLAUDE_PROJECT_DIR:-$(cd "$dir/../../.." && pwd)}"
. "$dir/hook-input.sh"

snapshot_path() {
	local session
	session="$(printf '%s' "$1" | tr -cd 'A-Za-z0-9_-')"
	printf '%s/claude-turn-changes-%s' "${TMPDIR:-/tmp}" "${session:-unknown}"
}

changed_paths() {
	git -C "$project_dir" -c core.quotePath=false status --porcelain -z --untracked-files=all 2>/dev/null |
		while IFS= read -r -d '' entry; do
			printf '%s\n' "${entry:3}"
			case "${entry:0:1}" in
				R | C) IFS= read -r -d '' _ ;;
			esac
		done
}

snapshot() {
	local file
	changed_paths | while IFS= read -r file; do
		if [ -f "$project_dir/$file" ]; then
			printf '%s\t%s\n' "$(git -C "$project_dir" hash-object -- "$file")" "$file"
		else
			printf 'deleted\t%s\n' "$file"
		fi
	done
}

case "${1:-}" in
	save)
		session="$(hook_field session_id 2>/dev/null)" || exit 0
		snapshot >"$(snapshot_path "$session")"
		;;
	list)
		saved="$(snapshot_path "${2:-}")"
		if [ ! -f "$saved" ]; then
			changed_paths
			exit 0
		fi
		snapshot | while IFS= read -r line; do
			grep -qxF -- "$line" "$saved" || printf '%s\n' "${line#*	}"
		done
		;;
	*)
		printf '사용법: turn-changes.sh save | list <세션>\n' >&2
		exit 1
		;;
esac
