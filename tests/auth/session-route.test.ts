import { expect, test } from "vitest";

import { postSession } from "@/features/auth/api/session-route";

test("로그인 본문이 JSON이 아니면 백엔드를 부르지 않고 400을 준다", async () => {
	const response = await postSession(new Request("http://localhost/api/auth/session", { method: "POST", body: "{" }));

	expect(response.status).toBe(400);
	await expect(response.json()).resolves.toMatchObject({ resultType: "ERROR", error: { errorCode: "E400" } });
});
