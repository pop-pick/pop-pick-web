"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface ScreenHeaderProps {
	title: string;
	trailing?: ReactNode;
}

export function ScreenHeader({ title, trailing }: ScreenHeaderProps) {
	const router = useRouter();

	return (
		<header className="sticky top-0 z-10 flex items-center gap-2 bg-background/90 px-4 py-3 backdrop-blur">
			<button
				type="button"
				aria-label="뒤로 가기"
				onClick={() => {
					router.back();
				}}
				className="flex size-9 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
			>
				<svg viewBox="0 0 24 24" aria-hidden className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</button>
			<h1 className="min-w-0 flex-1 truncate text-base font-semibold">{title}</h1>
			{trailing}
		</header>
	);
}
