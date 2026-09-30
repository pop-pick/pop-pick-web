import { type NextRequest, NextResponse } from "next/server";

import { REFRESH_COOKIE_NAME } from "@/features/auth/model/session-cookie";
import { buildLoginPath } from "@/shared/model/login-path";

const PROTECTED_PATHS = new Set(["/my", "/planner"]);
const ONBOARDING_STEP_PATH = /^\/onboarding\/\d+$/;
const COURSE_PATH = /^\/courses\/[^/]+(\/saved)?$/;
const GENERATING_PATH = /^\/planner\/generating\/[^/]+$/;

export function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	const isProtected =
		PROTECTED_PATHS.has(pathname) ||
		ONBOARDING_STEP_PATH.test(pathname) ||
		COURSE_PATH.test(pathname) ||
		GENERATING_PATH.test(pathname);

	if (!isProtected || request.cookies.has(REFRESH_COOKIE_NAME)) {
		return NextResponse.next();
	}

	return NextResponse.redirect(new URL(buildLoginPath(`${pathname}${search}`), request.url));
}

export const config = {
	matcher: [
		"/my",
		"/planner",
		"/planner/generating/:jobId",
		"/onboarding/:step(\\d+)",
		"/courses/:courseId",
		"/courses/:courseId/saved"
	]
};
