import { Suspense } from "react";

import { LOGIN_PENDING_MESSAGE } from "@/features/auth/model/login-messages";
import { KakaoCallback } from "@/features/auth/ui/KakaoCallback";
import { LoginStatus } from "@/features/auth/ui/LoginStatus";

export default function KakaoCallbackPage() {
	return (
		<Suspense fallback={<LoginStatus>{LOGIN_PENDING_MESSAGE}</LoginStatus>}>
			<KakaoCallback />
		</Suspense>
	);
}
