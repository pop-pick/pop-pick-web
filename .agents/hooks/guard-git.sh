#!/usr/bin/env bash
#
# PreToolUse(Bash) 훅. 판정은 lib/guard-git.mjs 가 한다. node 가 없으면 git 이 든 명령을 막는다

set -uo pipefail

input="$(cat)"
dir="$(cd "$(dirname "$0")" && pwd)"

if ! command -v node >/dev/null 2>&1; then
	case "$input" in
		*git*)
			printf 'node 가 PATH 에 없어 git 명령을 판정하지 못했다. 판정하지 못한 git 명령은 막는다\n' >&2
			exit 2
			;;
	esac
	exit 0
fi

printf '%s' "$input" | node "$dir/lib/guard-git.mjs"
