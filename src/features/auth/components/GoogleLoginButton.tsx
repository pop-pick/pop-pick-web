import Image from "next/image";

import { Button } from "@/shared/ui/Button";

const GOOGLE_LOGO_SIZE = 24;
const PREPARING_DESCRIPTION_ID = "google-login-preparing";

export function GoogleLoginButton() {
	return (
		<>
			<Button
				variant="secondary"
				size="lg"
				aria-disabled="true"
				aria-describedby={PREPARING_DESCRIPTION_ID}
				className="border border-text-4 bg-bg-1 text-text-1 not-disabled:hover:bg-bg-1 aria-disabled:cursor-not-allowed"
			>
				<Image
					src="/brand/google-g.png"
					alt=""
					width={GOOGLE_LOGO_SIZE}
					height={GOOGLE_LOGO_SIZE}
					className="size-6 shrink-0"
				/>
				Google 계정으로 로그인
			</Button>
			<p id={PREPARING_DESCRIPTION_ID} className="text-center text-b3-12 text-text-5">
				구글 로그인은 준비 중입니다.
			</p>
		</>
	);
}
