import type { ReactNode } from "react";

interface LoginStatusProps {
	children: ReactNode;
}

export function LoginStatus({ children }: LoginStatusProps) {
	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
			<p role="status" className="text-base leading-relaxed text-zinc-700">
				{children}
			</p>
		</main>
	);
}
