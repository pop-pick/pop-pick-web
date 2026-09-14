#!/usr/bin/env bash
#
# check-conventions. 룰 파일마다 적어 둔 grep 검사를 한 번에 돌린다.
#
# `.agents/rules/` 의 각 룰은 "확인하는 법" 이나 "리뷰에서 볼 것" 절에 찾는 명령을
# 갖고 있다. 흩어져 있으면 아무도 전부 돌리지 않는다. 여기 모아 한 번에 돌린다.
#
# 기계가 판정할 수 있는 것만 넣는다. 판단이 필요한 것은 리뷰 에이전트 몫이다.
# 검사를 추가할 때는 근거가 되는 룰 파일 이름을 제목에 적는다.
#
# Usage: bash .agents/scripts/check-conventions.sh
# 걸린 검사가 하나라도 있으면 1 로 끝난다.
#
# macOS bash 3.2 호환. grep -P 를 쓰지 않는다.

set -uo pipefail

REPO_ROOT="${CHECK_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$REPO_ROOT"

MAX_LINES=15
fail_count=0
pass_count=0
soft_count=0

# 검사 하나를 돌린다. 출력이 있으면 걸린 것이다.
check() {
	local title="$1"
	local cmd="$2"
	local out total

	out="$(eval "$cmd" 2>/dev/null)"

	if [ -z "$out" ]; then
		printf '  통과  %s\n' "$title"
		pass_count=$((pass_count + 1))
		return 0
	fi

	total="$(printf '%s\n' "$out" | wc -l | tr -d ' ')"
	printf '\n  걸림  %s  (%s건)\n' "$title" "$total"
	printf '%s\n' "$out" | head -"$MAX_LINES" | sed 's/^/        /'
	if [ "$total" -gt "$MAX_LINES" ]; then
		printf '        ... %s건 더 있다\n' "$((total - MAX_LINES))"
	fi
	printf '\n'
	fail_count=$((fail_count + 1))
}

# 판단이 필요한 검사. 자리를 알려 주되 실패로 세지 않는다.
# 문맥에 따라 정당한 쓰임이 있어 기계가 판정할 수 없다.
soft_check() {
	local title="$1"
	local cmd="$2"
	local out total

	out="$(eval "$cmd" 2>/dev/null)"

	if [ -z "$out" ]; then
		printf '  없음  %s\n' "$title"
		return 0
	fi

	total="$(printf '%s\n' "$out" | wc -l | tr -d ' ')"
	printf '\n  볼것  %s  (%s건)\n' "$title" "$total"
	printf '%s\n' "$out" | head -"$MAX_LINES" | sed 's/^/        /'
	printf '\n'
	soft_count=$((soft_count + 1))
}

printf '\n=== 구조와 경계 (structure.md) ===\n\n'

check "기능이 다른 기능을 부른다" \
	'grep -rn "@/features/" src/features src/shared --include="*.ts" --include="*.tsx"'

check "기능 밖을 상대 경로로 부른다" \
	'grep -rn "from \"\.\./\.\./" src/features --include="*.ts" --include="*.tsx"'

check "배럴 파일이 있다" \
	'find src -name "index.ts" -o -name "index.tsx"'

check "기능 폴더 루트에 파일이 있다" \
	'find src/features -maxdepth 2 -type f ! -name ".gitkeep"'

check "정해진 넷 밖의 세그먼트가 있다" \
	'find src/features -mindepth 2 -maxdepth 2 -type d ! -name api ! -name ui ! -name hooks ! -name model'

printf '\n=== 이름과 선언 형식 (ui.md) ===\n\n'

check "컴포넌트 파일이 소문자다" \
	'find src/features src/shared -name "*.tsx" | grep -vE "/[A-Z][A-Za-z0-9]*\.tsx$"'

check "export default 로 내보낸다" \
	'grep -rn "export default" src/features src/shared --include="*.ts" --include="*.tsx"'

check "화살표 함수에 대입한 컴포넌트다" \
	'grep -rnE "^(export )?const [A-Z][a-z][A-Za-z0-9]*( *: *[A-Za-z][A-Za-z0-9<>,. ]*)? *= *\(" src/features src/shared --include="*.tsx"'



printf '\n=== 값과 타입 (tailwind.md, typescript.md) ===\n\n'

check "Tailwind 임의값을 썼다" \
	'grep -rnoE "(^|[\" ])[a-z-]+-\[[^]]+\]" src --include="*.tsx" --include="*.ts"'

check "추론되는 반환 타입을 적었다" \
	'{ grep -rnE "^[[:space:]]*(export )?(async )?function [A-Za-z_$][A-Za-z0-9_$]*(<[^>]*>)?\(.*\)[[:space:]]*:[[:space:]]*[A-Za-z]" src --include="*.ts" --include="*.tsx"; grep -rnE "^[[:space:]]*(export )?(const|let) [A-Za-z_$][A-Za-z0-9_$]* = (async )?(<[^>]*>)?\([^)]*\)[[:space:]]*:[[:space:]]*[A-Za-z]" src --include="*.ts" --include="*.tsx"; } | grep -v " is " | grep -v "\.d\.ts"'

printf '\n=== 실패를 감추는 자리 (no-fallback.md, api.md) ===\n\n'

check "비어 있는 catch 다" \
	'grep -rnE "catch[^{]*\{\s*\}" src --include="*.ts" --include="*.tsx"'

check "컴포넌트나 훅에서 fetch 를 직접 부른다" \
	'grep -rnE "(^|[^A-Za-z0-9_])fetch\(" src/features src/app --include="*.ts" --include="*.tsx"'

check "shared/api 가 특정 기능을 안다" \
	'grep -rniE "popup|course|planner|onboarding|bookmark|recommendation" src/shared/api --include="*.ts"'

check "api 폴더가 무효화를 한다" \
	'grep -rn "invalidateQueries\|setQueryData" src/features/*/api --include="*.ts"'

check "호출하는 자리에서 authorization 을 손으로 붙인다" \
	'grep -rn "authorization\|Authorization" src/features src/app --include="*.ts" --include="*.tsx"'

check "화면이 api 를 직접 부른다" \
	'grep -rn "from \"@/shared/api/client\"" src/features/*/ui src/app --include="*.tsx"'

check "브라우저 코드가 백엔드 절대 주소를 안다" \
	'grep -rn "prod.poppick.shop\|API_BASE_URL" src/features src/app --include="*.ts" --include="*.tsx"'

check "app/api 아래 동적 세그먼트 라우트 핸들러가 있다" \
	'find src/app/api -type d -name "\[*\]" 2>/dev/null'

printf '\n=== 주석 (comments.md) ===\n\n'

check "함수 본문에 주석을 적었다" \
	'{ grep -rnE "^[[:space:]]+//" src --include="*.ts" --include="*.tsx"; grep -rnE "[^[:space:]:][[:space:]]+//([[:space:]]|$)" src --include="*.ts" --include="*.tsx"; grep -rnE "^[[:space:]]+/\*[^*]" src --include="*.ts" --include="*.tsx"; } | grep -vE "eslint-|@ts-|prettier-ignore|@jsxImportSource"'

printf '\n=== 한국어 표기 (AGENTS.md) ===\n\n'

check "금지 기호나 한자를 썼다" \
	'git ls-files -z --cached --others --exclude-standard -- src docs scripts .agents .claude ":(glob)*.md" | xargs -0 perl -CSD -ne '"'"'close ARGV if eof; print "$ARGV:$.: $_" if /[\x{00B7}\x{2022}\x{2013}\x{2014}\x{2190}-\x{21FF}\x{2460}-\x{24FF}\x{2700}-\x{27BF}\x{2B00}-\x{2BFF}\x{FE0F}\x{1F300}-\x{1FAFF}\x{3400}-\x{4DBF}\x{4E00}-\x{9FFF}]/'"'"''

printf '\n=== 판단이 필요한 자리 (막지 않는다) ===\n\n'

soft_check "빈 값으로 받는 자리. 실패를 삼키는지 본다" \
	'grep -rnE "\?\? (\[\]|0|\"\"|\x27\x27|\{\})" src --include="*.ts" --include="*.tsx"'

soft_check "격식체 동사로 시작하는 이름. typescript.md 이름 절의 표 오른쪽으로 바꿀 자리" \
	'grep -rnE "\b(acquire|obtain|retrieve|release|dispose|terminate|invoke|execute|perform|instantiate|materialize|initialize|utilize|leverage|populate|traverse)[A-Z(]" src --include="*.ts" --include="*.tsx"'

soft_check "훅만 내보내는데 파일 이름이 훅 이름이 아니다" \
	'for f in $(grep -rl "export function use[A-Z]" src --include="*.ts"); do
		case "$f" in */use[A-Z]*.ts) continue ;; esac
		[ "$(grep -c "^export" "$f")" = "$(grep -c "^export function use[A-Z]" "$f")" ] && echo "$f"
	done'

printf '\n=== 지우면 안 되는 지시문 주석 ===\n\n'

directives="$(grep -rnE "eslint-disable|@jsxImportSource|@ts-nocheck|@ts-expect-error|@ts-ignore|prettier-ignore" \
	src eslint.config.mjs next.config.ts 2>/dev/null)"
if [ -z "$directives" ]; then
	printf '  없음. 주석을 일괄로 지워도 깨질 것이 없다\n'
else
	printf '%s\n' "$directives" | sed 's/^/        /'
	printf '\n  위 줄은 도구에 주는 명령이다. 주석을 지울 때 함께 지우지 않는다\n'
fi

printf '\n=== 결과 ===\n\n'
printf '  막는 검사 통과 %s, 걸림 %s. 판단이 필요한 자리 %s\n\n' "$pass_count" "$fail_count" "$soft_count"

if [ "$fail_count" -gt 0 ]; then
	printf '  걸린 것은 해당 룰 파일의 "대신 하는 것" 절을 보고 옮긴다\n\n'
	exit 1
fi
exit 0
