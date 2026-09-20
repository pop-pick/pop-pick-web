import { handleLogin, handleLogout } from "@/features/auth/api/session-route";

export function POST(request: Request) {
	return handleLogin(request);
}

export function DELETE(request: Request) {
	return handleLogout(request);
}
