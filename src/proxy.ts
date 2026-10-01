import { type NextRequest, NextResponse } from "next/server";

import { REFRESH_COOKIE_NAME } from "@/features/auth/model/session-cookie";
import { buildLoginPath } from "@/shared/model/login-path";

const PROTECTED_PATHS = new Set(["/my", "/planner", "/planner/new"]);
const ONBOARDING_STEP_PATH = /^\/onboarding\/[1-3]$/;
const COURSE_PATH = /^\/courses\/[^/]+(\/saved)?$/;

export function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	const isProtected =
		PROTECTED_PATHS.has(pathname) || ONBOARDING_STEP_PATH.test(pathname) || COURSE_PATH.test(pathname);

	if (!isProtected || request.cookies.has(REFRESH_COOKIE_NAME)) {
		return NextResponse.next();
	}

	return NextResponse.redirect(new URL(buildLoginPath(`${pathname}${search}`), request.url));
}

export const config = {
	matcher: [
		"/my",
		"/planner",
		"/planner/new",
		"/onboarding/:step([1-3])",
		"/courses/:courseId",
		"/courses/:courseId/saved"
	]
};
