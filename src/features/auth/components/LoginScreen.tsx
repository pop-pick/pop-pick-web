import Image from "next/image";
import Link from "next/link";

import CloseIcon from "@/shared/assets/icons/close.svg";
import { iconButtonVariants } from "@/shared/ui/IconButton";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import { GoogleLoginButton } from "./GoogleLoginButton";
import { KakaoLoginButton } from "./KakaoLoginButton";

const LOGO_MARK_WIDTH = 51;
const LOGO_MARK_HEIGHT = 55;
const WORDMARK_WIDTH = 186;
const WORDMARK_HEIGHT = 32;

interface LoginScreenProps {
	nextPath: string | null;
}

export function LoginScreen({ nextPath }: LoginScreenProps) {
	return (
		<main className="relative flex flex-1 flex-col px-5 pt-16 pb-13">
			<Link
				href="/"
				aria-label="닫고 홈으로 가기"
				className={iconButtonVariants({ variant: "ghost", class: "absolute top-3 right-3 text-icon" })}
			>
				<SvgIcon icon={CloseIcon} size={24} />
			</Link>
			<section className="flex flex-1 flex-col items-center justify-center gap-7.5 py-10">
				<Image src="/brand/logo-mark.svg" alt="" width={LOGO_MARK_WIDTH} height={LOGO_MARK_HEIGHT} loading="eager" />
				<h1>
					<Image src="/brand/logo.svg" alt="POP PICK" width={WORDMARK_WIDTH} height={WORDMARK_HEIGHT} loading="eager" />
				</h1>
			</section>

			<section className="flex flex-col gap-2.5">
				<KakaoLoginButton nextPath={nextPath} />
				<GoogleLoginButton />
			</section>

			<ul className="mt-8 list-disc space-y-5 rounded-2xl bg-bg-2 p-5 pl-11 text-b3-14 whitespace-pre-line text-text-3 marker:text-text-6">
				<li>{"로그인 시 이용약관 및 개인정보 처리방침에\n동의합니다."}</li>
				<li>{"로그인 완료 후 개인화 홈으로 이동해 추천\n결과를 확인할 수 있습니다."}</li>
			</ul>
		</main>
	);
}
