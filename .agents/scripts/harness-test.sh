#!/usr/bin/env bash
#
# harness-test. 검사 스크립트와 훅 넷, 생성기의 회귀 테스트. harness-check.sh 가 돌린다. 토큰을 쓰지 않는다.
# 위반을 심은 픽스처로 검사가 그 위반을 잡는지, 판정표로 guard-git 이 막을 것을 막고 통과시킬 것을 통과시키는지,
# 이번 턴 변경만 Stop 훅이 보는지, 룰 주입 훅이 Claude Code 와 같은 glob 으로 룰을 고르는지 본다.

set -uo pipefail
unset GIT_INDEX_FILE GIT_DIR GIT_WORK_TREE

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
export TMPDIR="$work/tmp"
mkdir -p "$TMPDIR"

fail=0
ok() { printf '  통과  %s\n' "$1"; }
ng() {
	printf '  실패  %s\n' "$1"
	fail=1
}
expect() {
	if printf '%s' "$2" | grep -qF -- "$1"; then
		ok "$1"
	else
		ng "$1 가 출력에 없다"
	fi
}
expect_status() {
	if [ "$1" = "$2" ]; then
		ok "$3 (exit $1)"
	else
		ng "$3 (exit $1, 기대 $2)"
	fi
}

new_repo() {
	local dir="$1"
	local tree commit
	mkdir -p "$dir"
	git -C "$dir" init -q
	tree="$(git -C "$dir" mktree </dev/null)"
	commit="$(git -C "$dir" -c user.name=harness -c user.email=harness@example.com commit-tree "$tree" -m init)"
	git -C "$dir" update-ref refs/heads/main "$commit"
	git -C "$dir" update-ref refs/heads/develop "$commit"
	git -C "$dir" symbolic-ref HEAD refs/heads/main
}

printf '=== 검사 스크립트 ===\n\n'

fixture="$work/conventions"
new_repo "$fixture"
mkdir -p "$fixture/src/features/popup/api" "$fixture/src/features/popup/ui" "$fixture/src/shared/api" "$fixture/src/app" "$fixture/docs"
cat >"$fixture/src/features/popup/api/get-popups.ts" <<'EOF'
export const retrievePopups = (region: string): string[] => [region];

export function countPopups(items: string[]) {
	const total = items.length; // 전체 개수
	return total ?? 0;
}

export async function loadRaw() {
	return fetch("/api/v1/popups");
}
EOF
cat >"$fixture/src/features/popup/ui/PopupCard.tsx" <<'EOF'
export function PopupCard() {
	return <article />;
}

function PopupBadge() {
	return <span />;
}
EOF
cat >"$fixture/src/shared/api/client.ts" <<'EOF'
export const client = 1;
EOF
cat >"$fixture/src/app/page.tsx" <<'EOF'
export default function Page() {
	return <button onClick={() => alert("저장")} />;
}
EOF
{
	printf '# 안내\n\n'
	printf '위키는 /Users/someone/wiki 에 있다.\n'
	printf '생성기에 부작용이 있다.\n'
	printf '`pop-pick-nothing` 스킬을 쓴다.\n'
	printf '구현은 feature-builder 가 한다.\n'
	printf '타입 검사\xc2\xb7빌드\n'
} >"$fixture/docs/guide.md"

output="$(CHECK_ROOT="$fixture" bash "$ROOT/.agents/scripts/check-conventions.sh" 2>&1)"
expect_status "$?" 1 "위반이 있으면 1 로 끝난다"
expect "걸림  추론되는 반환 타입을 적었다" "$output"
expect "걸림  함수 본문에 주석을 적었다" "$output"
expect "걸림  컴포넌트나 훅에서 fetch 를 직접 부른다" "$output"
expect "걸림  한 파일에 컴포넌트가 둘 이상이다" "$output"
expect "걸림  금지 기호나 한자를 썼다" "$output"
expect "걸림  번역 은유를 썼다" "$output"
expect "걸림  커밋되는 파일에 개인 절대 경로나 위키 경로를 적었다" "$output"
expect "걸림  문서가 없는 스킬이나 에이전트를 가리킨다" "$output"
expect "걸림  옛 에이전트 이름이나 폴더가 남아 있다" "$output"
expect "docs/guide.md" "$output"
expect "볼것  격식체 동사로 시작하는 이름" "$output"
expect "볼것  빈 값으로 받는 자리" "$output"
expect "볼것  alert 나 confirm 을 부른다" "$output"
if printf '%s' "$output" | grep -qF "검사 명령이 실패했다"; then
	ng "픽스처에서 검사 명령이 실패했다"
else
	ok "검사 명령이 전부 정상 종료했다"
fi

mkdir -p "$work/nogit"
output="$(CHECK_ROOT="$work/nogit" bash "$ROOT/.agents/scripts/check-conventions.sh" 2>&1)"
expect_status "$?" 1 "git 저장소가 아니면 실패로 끝난다"
expect "git 저장소가 아니다" "$output"

printf '\n=== PreToolUse 훅 guard-git ===\n\n'

new_repo "$work/guard/feat"
git -C "$work/guard/feat" symbolic-ref HEAD refs/heads/feat/x
git -C "$work/guard/feat" update-ref refs/heads/feat/x "$(git -C "$work/guard/feat" rev-parse main)"
new_repo "$work/guard/main"

guard_rows="$work/guard/rows"
cat >"$guard_rows" <<'EOF'
feat|git commit --no-verify -m x|2
feat|git push --no-verify|2
feat|LEFTHOOK=0 git commit -m x|2
feat|git -c core.hooksPath=/dev/null commit -m x|2
feat|git add -A|2
feat|git add .|2
feat|git push --force origin f|2
feat|git push origin main|2
feat|git add .env|2
feat|git add packages/a.ts .env.production|2
feat|git push -f origin x|2
feat|git push -fu origin x|2
feat|git push -uf origin x|2
feat|git commit -n -m x|2
feat|git commit -nm x|2
feat|git commit --no-veri -m x|2
feat|git -c core.hookspath=/dev/null commit|2
feat|git -c core.hooksPath /dev/null commit|2
feat|GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=/dev/null git commit -m x|2
feat|export LEFTHOOK=0; git commit -m x|2
feat|LEFTHOOK_EXCLUDE=harness,lint git commit -m x|2
feat|git config core.hooksPath /dev/null|2
feat|git push origin HEAD:main|2
feat|git push origin x:main|2
feat|git push origin +main|2
feat|git push origin +HEAD:main|2
feat|git push origin HEAD:refs/heads/main|2
feat|git push origin refs/heads/main|2
feat|git push origin :main|2
feat|git push origin +feat/x|2
feat|git push --all origin|2
feat|git add '.'|2
feat|git add ":/"|2
feat|git add ':(top)'|2
feat|git add *|2
feat|git add ./|2
feat|git add ..|2
feat|git add $(pwd)|2
feat|git add -vA|2
feat|git add --all=true|2
feat|git -c a=b add -A|2
feat|git -C sub add -A|2
feat|git --no-pager add -A|2
feat|G=git; $G add -A .|2
feat|git commit -a -m x|2
feat|git commit -am x|2
feat|git commit --all -m x|2
feat|git commit -m x -- .|2
feat|git add config/.env|2
feat|git add '.env'|2
feat|bash -c "git push -f origin x"|2
feat|ls && git add -A|2
feat|( git add -A )|2
feat|{ git add -A; }|2
feat|env LEFTHOOK=0 git commit -m x|2
feat|git diff --output=/tmp/x|2
feat|git log -1 --output=x.txt|2
feat|git show HEAD --output x.txt|2
feat|echo $(git add -A)|2
feat|timeout 5 git push -f origin x|2
feat|git merge --no-verify origin/main|2
feat|git commit -m "열린 따옴표|2
main|git commit -m x|2
main|git -C . commit -m x|2
main|git -c x=y commit -m x|2
main|git push|2
main|git push -u origin HEAD|2
feat|git switch main && git commit -m x|2
feat|git switch develop && git commit -m x|2
feat|git add ./packages/a.ts|0
feat|git add packages/a.ts packages/b.ts|0
feat|git add .env.example|0
feat|git push --force-with-lease origin f|0
feat|git push origin develop|0
feat|git push -u origin HEAD|0
feat|git push|0
feat|git commit -m x|0
feat|git commit -m "docs(#0):git add -A 금지를 적는다"|0
feat|git commit -m "fix(#0):git push --force 금지 문구 수정"|0
feat|git commit -m "-a 옵션 설명"|0
feat|git commit -F msg.txt -- packages/a.ts|0
feat|echo "git add -A 는 금지"|0
feat|git push origin x; echo main|0
feat|git push origin x && echo "use --force carefully"|0
feat|printf "훅 건너뛰기 플래그 --no-verify 금지" > /tmp/x|0
feat|grep -rn -- --no-verify .agents|0
feat|ls -la|0
feat|pnpm harness:check|0
feat|git status --short|0
feat|git log --oneline -3|0
feat|git diff -- packages|0
feat|git commit --pathspec-from-file=list.txt -m x|0
feat|git add --pathspec-from-file=list.txt|0
feat|find . -name '*.ts' -exec git add {} \;|0
feat|git switch develop|0
feat|git checkout -b feat/y|0
feat|git add src/a.ts 2>&1 | tail -3|0
feat|git commit --amend --no-edit|0
feat|git add docs/|0
EOF
guard_one() {
	local row="$1"
	local repo want cmd payload
	repo="${row%%|*}"
	want="${row##*|}"
	cmd="${row#*|}"
	cmd="${cmd%|*}"
	payload="$(node -e 'process.stdout.write(JSON.stringify({ cwd: process.argv[1], tool_input: { command: process.argv[2] } }))' "$work/guard/$repo" "$cmd")"
	(cd "$work/guard/$repo" && printf '%s' "$payload" | bash "$ROOT/.agents/hooks/guard-git.sh" >/dev/null 2>&1)
	printf '%s|%s\n' "$?" "$row"
}
guard_results="$work/guard/results"
: >"$guard_results"
count=0
while IFS= read -r row; do
	[ -n "$row" ] || continue
	guard_one "$row" >>"$guard_results.$count" &
	count=$((count + 1))
	[ $((count % 16)) -eq 0 ] && wait
done <"$guard_rows"
wait
cat "$guard_results".* >"$guard_results"
guard_fail=0
guard_total=0
while IFS= read -r line; do
	got="${line%%|*}"
	row="${line#*|}"
	want="${row##*|}"
	guard_total=$((guard_total + 1))
	if [ "$got" != "$want" ]; then
		ng "exit $got, 기대 $want  $row"
		guard_fail=1
	fi
done <"$guard_results"
[ "$guard_fail" -eq 0 ] && ok "판정표 ${guard_total}행이 전부 기대대로다"

heredoc_commit="$(printf 'git commit -m "$(cat <<%sEOF%s\nfix: 괄호가 안 맞는 본문 (설명\n\n- git add -A 는 금지 ) 그리고 --no-verify\nEOF\n)"' "'" "'")"
payload="$(node -e 'process.stdout.write(JSON.stringify({ cwd: process.argv[1], tool_input: { command: process.argv[2] } }))' "$work/guard/feat" "$heredoc_commit")"
printf '%s' "$payload" | bash "$ROOT/.agents/hooks/guard-git.sh" >/dev/null 2>&1
expect_status "$?" 0 "heredoc 커밋 메시지 안의 글자로 막지 않는다"

printf 'not json' | bash "$ROOT/.agents/hooks/guard-git.sh" >/dev/null 2>&1
expect_status "$?" 2 "JSON 이 아닌 입력은 막는다"

nobin="$work/nobin"
mkdir -p "$nobin"
for tool in bash cat dirname; do
	ln -s "$(command -v "$tool")" "$nobin/$tool"
done
printf '{"tool_input":{"command":"git status"}}' | PATH="$nobin" "$nobin/bash" "$ROOT/.agents/hooks/guard-git.sh" >/dev/null 2>&1
expect_status "$?" 2 "node 가 없으면 git 명령을 막는다"
printf '{"tool_input":{"command":"ls"}}' | PATH="$nobin" "$nobin/bash" "$ROOT/.agents/hooks/guard-git.sh" >/dev/null 2>&1
expect_status "$?" 0 "node 가 없어도 git 이 없는 명령은 통과시킨다"

printf '\n=== Stop 훅 check-on-stop ===\n\n'

stop="$work/stop"
new_repo "$stop"
mkdir -p "$stop/.agents/scripts"
cp -R "$ROOT/.agents/hooks" "$stop/.agents/hooks"
cat >"$stop/.agents/scripts/check-conventions.sh" <<'EOF'
#!/usr/bin/env bash
out="$(git ls-files -z --cached --others --exclude-standard | xargs -0 grep -l VIOLATION 2>/dev/null)"
[ -z "$out" ] && exit 0
printf '%s\n' "$out"
exit 1
EOF
run_stop() {
	printf '%s' "$1" | CLAUDE_PROJECT_DIR="$stop" bash "$stop/.agents/hooks/check-on-stop.sh" >/dev/null 2>&1
}
save_turn() {
	printf '{"session_id":"stop-test"}' | CLAUDE_PROJECT_DIR="$stop" bash "$stop/.agents/hooks/lib/turn-changes.sh" save
}
stop_input='{"session_id":"stop-test","stop_hook_active":false}'
tricky_input='{"session_id":"stop-test","stop_hook_active":false,"last_assistant_message":"\"stop_hook_active\": true"}'

printf 'VIOLATION\n' >"$stop/old.md"
save_turn
run_stop "$stop_input"
expect_status "$?" 0 "턴 시작 전부터 있던 위반만 있으면 막지 않는다"

printf 'clean\n' >"$stop/clean.md"
run_stop "$stop_input"
expect_status "$?" 0 "이번 턴 파일이 걸린 출력에 없으면 막지 않는다"

printf 'VIOLATION\n' >"$stop/new.md"
run_stop "$stop_input"
expect_status "$?" 2 "이번 턴에 위반이 든 파일이 생기면 막는다"

run_stop "$tricky_input"
expect_status "$?" 2 "응답 본문의 true 글자에 속지 않는다"

run_stop '{"session_id":"stop-test","stop_hook_active":true}'
expect_status "$?" 0 "stop_hook_active 가 참이면 막지 않는다"

save_turn
run_stop "$stop_input"
expect_status "$?" 0 "스냅샷 뒤 바뀐 것이 없으면 막지 않는다"

printf '\n=== 룰 주입 훅 inject-matching-rules ===\n\n'

inject="$work/inject"
new_repo "$inject"
mkdir -p "$inject/.agents/rules"
cp -R "$ROOT/.agents/hooks" "$inject/.agents/hooks"
cat >"$inject/.agents/rules/code.md" <<'EOF'
---
description: 코드 룰
paths:
  - "src/**/*.{ts,tsx}"
---
EOF
cat >"$inject/.agents/rules/docs.md" <<'EOF'
---
description: 루트 문서 룰
paths: ['*.md']
---
EOF
physical="$(cd "$inject" && pwd -P)"
run_inject() {
	local payload
	payload="$(node -e 'process.stdout.write(JSON.stringify({ session_id: "inject-test", cwd: process.argv[1], tool_input: { file_path: process.argv[2] } }))' "$inject" "$1")"
	printf '%s' "$payload" | CLAUDE_PROJECT_DIR="$inject" bash "$inject/.agents/hooks/inject-matching-rules.sh" 2>&1
}

output="$(run_inject "$physical/src/features/a/b.ts")"
expect ".agents/rules/code.md" "$output"
output="$(run_inject "$inject/src/c.tsx")"
[ -z "$output" ] && ok "같은 세션, 같은 룰 조합은 다시 알리지 않는다" || ng "같은 조합을 다시 알렸다"
output="$(run_inject "$work/outside.ts")"
[ -z "$output" ] && ok "프로젝트 밖 파일은 알리지 않는다" || ng "프로젝트 밖 파일을 알렸다"
output="$(run_inject "$inject/docs/nested.md")"
[ -z "$output" ] && ok "* 는 / 를 넘지 않는다" || ng "*.md 가 docs/nested.md 에 맞았다"
output="$(run_inject "$inject/node_modules/pkg/index.ts")"
[ -z "$output" ] && ok "paths 밖의 파일은 알리지 않는다" || ng "node_modules 아래 파일을 알렸다"
output="$(run_inject "$inject/README.md")"
expect ".agents/rules/docs.md" "$output"

printf '\n=== 생성물 대조 ===\n\n'

gen="$work/gen"
mkdir -p "$gen"
git -C "$ROOT" ls-files -z --cached --others --exclude-standard -- .agents .claude .codex AGENTS.md |
	while IFS= read -r -d '' file; do
		[ -f "$ROOT/$file" ] || continue
		mkdir -p "$gen/$(dirname "$file")"
		cp "$ROOT/$file" "$gen/$file"
	done
git -C "$gen" init -q
git -C "$gen" add -- .agents .claude .codex AGENTS.md
perl -pi -e 's/^(description: .*)$/$1 시험/ if $. == 2' "$gen/.agents/rules/git-workflow.md"
node "$gen/.agents/scripts/agents-sync.mjs" >/dev/null
git -C "$gen" add -- .agents/rules/git-workflow.md
node "$gen/.agents/scripts/agents-sync.mjs" --check >/dev/null 2>&1
expect_status "$?" 0 "작업 트리 대조는 통과한다"
node "$gen/.agents/scripts/agents-sync.mjs" --check-index >/dev/null 2>&1
expect_status "$?" 1 "원본만 스테이징하면 인덱스 대조가 걸린다"

printf '\n'
if [ "$fail" -eq 0 ]; then
	printf '회귀 테스트 통과\n'
	exit 0
fi
printf '회귀 테스트 실패\n'
exit 1
