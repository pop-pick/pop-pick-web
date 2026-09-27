import { Suspense } from "react";

import { KakaoCallback } from "@/features/auth/components/KakaoCallback";
import { LoginStatus } from "@/features/auth/components/LoginStatus";
import { LOGIN_PENDING_MESSAGE } from "@/features/auth/model/login-messages";

export default function KakaoCallbackPage() {
	return (
		<Suspense fallback={<LoginStatus>{LOGIN_PENDING_MESSAGE}</LoginStatus>}>
			<KakaoCallback />
		</Suspense>
	);
}
