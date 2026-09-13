import Link from "next/link";
import type { ReactNode } from "react";

interface LoginStatusProps {
	children: ReactNode;
	showHomeLink?: boolean;
}

export function LoginStatus({ children, showHomeLink = false }: LoginStatusProps) {
	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
			<p role="status" className="text-base leading-relaxed text-zinc-700">
				{children}
			</p>
			{showHomeLink && (
				<Link
					href="/"
					className="rounded-md font-semibold text-blue-600 underline underline-offset-4 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
				>
					홈으로 돌아가기
				</Link>
			)}
		</main>
	);
}
