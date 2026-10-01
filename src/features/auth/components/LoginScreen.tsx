import Image from "next/image";

import { BackButton } from "@/shared/components/BackButton";
import { DEFAULT_NEXT_PATH } from "@/shared/model/login-path";

import { GoogleLoginButton } from "./GoogleLoginButton";
import { KakaoLoginButton } from "./KakaoLoginButton";

const LOGO_MARK_WIDTH = 51;
const LOGO_MARK_HEIGHT = 55;
const WORDMARK_WIDTH = 186;
const WORDMARK_HEIGHT = 32;
const LOGIN_NOTICES = [
	"로그인 시 이용약관 및 개인정보 처리방침에 동의합니다.",
	"로그인 완료 후 개인화 홈으로 이동해 추천 결과를 확인할 수 있습니다."
];

interface LoginScreenProps {
	nextPath: string | null;
}

export function LoginScreen({ nextPath }: LoginScreenProps) {
	return (
		<main className="flex flex-1 flex-col pb-13">
			<div className="flex h-20 items-end px-5 pb-5">
				<BackButton fallbackPath={DEFAULT_NEXT_PATH} />
			</div>
			<div aria-hidden className="max-h-20.75 grow" />
			<section className="flex flex-col items-center gap-7.5">
				<Image
					src="/images/brand/logo-mark.svg"
					alt=""
					width={LOGO_MARK_WIDTH}
					height={LOGO_MARK_HEIGHT}
					loading="eager"
				/>
				<h1>
					<Image
						src="/images/brand/logo.svg"
						alt="POP PICK"
						width={WORDMARK_WIDTH}
						height={WORDMARK_HEIGHT}
						loading="eager"
					/>
				</h1>
			</section>

			<div aria-hidden className="max-h-34.5 grow" />
			<section className="flex flex-col gap-2.5 px-5">
				<KakaoLoginButton nextPath={nextPath} />
				<GoogleLoginButton nextPath={nextPath} />
			</section>

			<ul className="mx-5 mt-8 space-y-5 rounded-2xl bg-bg-2 py-6 pr-5 pl-12 text-b3-14 break-keep text-text-3">
				{LOGIN_NOTICES.map((notice) => (
					<li
						key={notice}
						className="relative max-w-59 before:absolute before:top-2 before:-left-6 before:size-1 before:rounded-full before:bg-text-5"
					>
						{notice}
					</li>
				))}
			</ul>
		</main>
	);
}
