import { Suspense } from "react";

import { KakaoCallback } from "@/features/auth/KakaoCallback";
import { LOGIN_PENDING_MESSAGE } from "@/features/auth/lib/login-messages";
import { LoginStatus } from "@/features/auth/LoginStatus";

export default function KakaoCallbackPage() {
	return (
		<Suspense fallback={<LoginStatus>{LOGIN_PENDING_MESSAGE}</LoginStatus>}>
			<KakaoCallback />
		</Suspense>
	);
}
