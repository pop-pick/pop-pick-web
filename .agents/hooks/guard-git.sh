#!/usr/bin/env bash
#
# PreToolUse(Bash) 훅. git-workflow.md 의 금지 패턴 중 기계가 판정할 수 있는 것을 막는다.
# 광범위 스테이징, 훅을 건너뛰는 커밋과 푸시, 강제 푸시, main 에 직접 푸시, main 과 develop 에서의 직접 커밋이다.
# stdin 의 JSON 에서 tool_input.command 를 읽고 걸리면 exit 2 와 stderr 로 이유를 낸다.
# 정규식은 git 하위 명령에 묶는다. 산문이나 heredoc 에 같은 글자가 있는 명령을 막지 않기 위해서다.

set -uo pipefail

input="$(cat)"
command="$(printf '%s' "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write(String((j.tool_input&&j.tool_input.command)||""))}catch{}})')"
[ -n "$command" ] || exit 0
case "$command" in *git*) ;; *) exit 0 ;; esac

deny() {
	printf '%s\n막힌 명령: %s\n' "$1" "$command" >&2
	exit 2
}

if printf '%s' "$command" | grep -qE 'git[[:space:]]+add[[:space:]]+([^|;&]*[[:space:]])?(-A|--all|-u|--update|\.|:/)([[:space:]]|$)'; then
	deny "광범위 스테이징이다. 파일 단위로 명시한다 (git-workflow.md 금지 패턴 2)"
fi

if printf '%s' "$command" | grep -qE 'git[[:space:]]+(commit|push|merge|rebase|cherry-pick)[^;&|]*[[:space:]]--no-verify([[:space:]]|$)|(LEFTHOOK=0|LEFTHOOK=false|core\.hooksPath=)[^;&|]*git[[:space:]]+(commit|push)|git[[:space:]]+-c[[:space:]]+core\.hooksPath=[^;&|]*(commit|push)'; then
	deny "훅을 건너뛰는 커밋과 푸시는 하지 않는다. 훅에 걸린 것을 고친다 (git-workflow.md 금지 패턴 5)"
fi

if printf '%s' "$command" | grep -qE 'git[[:space:]]+push[[:space:]].*(--force([[:space:]]|$)|[[:space:]]-f([[:space:]]|$))'; then
	deny "강제 푸시다. 필요하면 --force-with-lease 만 쓴다 (git-workflow.md 금지 패턴 5)"
fi

if printf '%s' "$command" | grep -qE 'git[[:space:]]+push[[:space:]].*[[:space:]](origin[[:space:]]+)?main([[:space:]]|$)'; then
	deny "main 에 직접 푸시하지 않는다. 릴리스는 develop 에서 main 으로 PR 이다 (git-workflow.md 금지 패턴 1)"
fi

if printf '%s' "$command" | grep -qE 'git[[:space:]]+commit([[:space:]]|$)'; then
	project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
	branch="$(git -C "$project_dir" branch --show-current 2>/dev/null)"
	case "$branch" in
		main | develop) deny "$branch 에서 직접 커밋하지 않는다. feature/ 브랜치를 딴다 (git-workflow.md 금지 패턴 1)" ;;
	esac
fi

exit 0
