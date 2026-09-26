import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { buildLoginPath } from "../model/next-path";
import { useAuthStore } from "../model/useAuthStore";

export function useRequireAuth() {
	const router = useRouter();

	const ensureAuthenticated = useCallback(
		(next: string) => {
			const { status } = useAuthStore.getState();
			if (status === "authenticated") {
				return true;
			}

			if (status === "anonymous") {
				router.push(buildLoginPath(next));
			}

			return false;
		},
		[router]
	);

	return { ensureAuthenticated };
}
