import { Button } from "@/shared/ui/Button";

import { KakaoLoginButton } from "./KakaoLoginButton";

interface LoginScreenProps {
	next: string | null;
}

export function LoginScreen({ next }: LoginScreenProps) {
	return (
		<main className="flex flex-1 flex-col justify-center gap-10 px-6 py-16">
			<section className="flex flex-col items-center gap-3 text-center">
				<p className="text-sm font-bold tracking-widest text-blue-600">POP PICK</p>
				<h1 className="text-2xl leading-snug font-bold tracking-tight">
					AI와 함께 떠나는 여정
					<br />
					지금 시작해보세요
				</h1>
			</section>

			<section className="flex flex-col gap-3">
				<KakaoLoginButton next={next} />
				<Button variant="secondary" size="lg" disabled>
					구글로 계속하기
				</Button>
				<p className="text-center text-xs text-zinc-400">구글 로그인은 준비 중입니다.</p>
			</section>

			<section className="flex flex-col gap-2 text-center">
				<p className="text-xs text-zinc-400">로그인 시 이용약관 및 개인정보 처리방침에 동의한 것으로 간주됩니다.</p>
				<p className="text-sm text-zinc-500">로그인하면 개인화 홈으로 이동해 추천 결과를 확인할 수 있어요.</p>
			</section>
		</main>
	);
}
