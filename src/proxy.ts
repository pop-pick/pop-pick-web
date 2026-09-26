import { type NextRequest, NextResponse } from "next/server";

import { buildLoginPath } from "@/features/auth/model/next-path";
import { REFRESH_COOKIE_NAME } from "@/features/auth/model/session-cookie";

const PROTECTED_PATHS = new Set(["/my", "/planner"]);

export function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	const isProtected = PROTECTED_PATHS.has(pathname);

	if (!isProtected || request.cookies.has(REFRESH_COOKIE_NAME)) {
		return NextResponse.next();
	}

	return NextResponse.redirect(new URL(buildLoginPath(`${pathname}${search}`), request.url));
}

export const config = {
	matcher: ["/my", "/planner"]
};
