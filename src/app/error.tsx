"use client";

import { useEffect } from "react";

import { Button } from "@/shared/ui/Button";

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error("[route] 화면을 그리다 실패했습니다", error);
	}, [error]);

	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
			<div className="flex flex-col gap-2">
				<h1 className="text-xl font-bold tracking-tight">화면을 열지 못했어요</h1>
				<p className="text-sm text-zinc-500">잠시 뒤 다시 시도해 주세요.</p>
			</div>
			<Button onClick={reset}>다시 시도</Button>
		</main>
	);
}
