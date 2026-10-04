import { expect, test } from "vitest";

import { buildLoginPath, sanitizeNextPath } from "@/shared/model/login-path";

test("같은 출처의 경로는 그대로 돌아갈 곳으로 쓴다", () => {
	expect(sanitizeNextPath("/onboarding/1?from=landing")).toBe("/onboarding/1?from=landing");
});

test.each([
	"//evil.example",
	"/\\evil.example",
	"/\t/evil.example",
	"/\\[",
	"/\\a b",
	"https://evil.example",
	"evil",
	null
])("외부로 나가는 돌아갈 곳 %j는 버리고 로그인 뒤 홈으로 보낸다", (value) => {
	expect(sanitizeNextPath(value)).toBeNull();
});

test("외부 주소를 next로 만들어도 로그인 주소는 홈으로 돌아간다", () => {
	expect(buildLoginPath("/\\evil.example")).toBe(`/login?next=${encodeURIComponent("/")}`);
});
