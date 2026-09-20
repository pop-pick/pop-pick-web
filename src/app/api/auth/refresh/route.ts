import { handleRefresh } from "@/features/auth/api/refresh-route";

export function POST() {
	return handleRefresh();
}
