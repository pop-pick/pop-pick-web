import { postRefresh } from "@/features/auth/api/refresh-route";

export function POST() {
	return postRefresh();
}
