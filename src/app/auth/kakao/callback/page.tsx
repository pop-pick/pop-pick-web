import { Suspense } from "react";

import { LoginStatus } from "@/features/auth/components/LoginStatus";
import { OAuthCallback } from "@/features/auth/components/OAuthCallback";
import { LOGIN_PENDING_MESSAGE } from "@/features/auth/model/login-messages";

export default function KakaoCallbackPage() {
	return (
		<Suspense fallback={<LoginStatus>{LOGIN_PENDING_MESSAGE}</LoginStatus>}>
			<OAuthCallback provider="KAKAO" />
		</Suspense>
	);
}
