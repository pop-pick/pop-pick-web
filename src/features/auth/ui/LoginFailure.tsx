import type { ReactNode } from "react";

import { LinkButton } from "@/shared/ui/LinkButton";

import { DEFAULT_NEXT_PATH } from "../model/next-path";

interface LoginFailureProps {
	children: ReactNode;
	canceled?: boolean;
}

export function LoginFailure({ children, canceled = false }: LoginFailureProps) {
	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
			<p role="alert" className="text-base leading-relaxed text-zinc-700">
				{children}
			</p>
			<div className="flex w-full flex-col gap-2">
				<LinkButton href="/login">다시 로그인</LinkButton>
				{canceled && (
					<LinkButton href={DEFAULT_NEXT_PATH} variant="ghost">
						홈으로
					</LinkButton>
				)}
			</div>
		</main>
	);
}
