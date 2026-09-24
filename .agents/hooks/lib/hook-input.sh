#!/usr/bin/env bash
#
# 훅 입력 JSON 에서 최상위 필드 하나를 꺼낸다. 불리언은 true 나 false 로 낸다. 읽지 못하면 1 로 끝난다

hook_field() {
	local key="$1"
	if command -v python3 >/dev/null 2>&1; then
		python3 -c '
import json, sys
value = json.load(sys.stdin).get(sys.argv[1])
if isinstance(value, bool):
    print("true" if value else "false")
elif value is not None:
    print(value)
' "$key"
		return $?
	fi
	if command -v node >/dev/null 2>&1; then
		node -e '
let s = "";
process.stdin.on("data", (d) => (s += d)).on("end", () => {
	const value = JSON.parse(s)[process.argv[1]];
	if (value !== undefined && value !== null) console.log(String(value));
});
' "$key"
		return $?
	fi
	return 1
}
