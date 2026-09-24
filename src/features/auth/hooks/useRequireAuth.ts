import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { buildLoginPath } from "../model/next-path";
import { useAuthStore } from "../model/useAuthStore";

/**
 * 로그인이 필요한 동작 앞에서 부른다. 로그인 상태면 true다.
 * 비로그인이면 `/login?next=`로 보내고 false를 돌려준다.
 * 재발급이 끝나기 전(restoring)과 세션을 확인하지 못한 때(unavailable)에는 보내지 않고 false만 돌려준다. 로그인한 사용자일 수 있어서다
 */
export function useRequireAuth() {
	const router = useRouter();

	const ensure = useCallback(
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

	return { ensure };
}
