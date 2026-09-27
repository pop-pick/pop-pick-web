import { deleteSession, postSession } from "@/features/auth/api/session-route";

export function POST(request: Request) {
	return postSession(request);
}

export function DELETE(request: Request) {
	return deleteSession(request);
}
