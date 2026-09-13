"use client";

import { Button } from "@/shared/ui/Button";
import { LinkButton } from "@/shared/ui/LinkButton";

import { useLogout } from "./hooks/useLogout";
import { useAuthStore } from "./store/useAuthStore";

export function SessionPanel() {
	const accessToken = useAuthStore((state) => state.accessToken);
	const { mutate: signOut, isPending } = useLogout();

	if (accessToken === null) {
		return (
			<section className="flex flex-col gap-4 rounded-2xl bg-zinc-50 p-5">
				<div className="flex flex-col gap-1">
					<p className="font-semibold text-zinc-900">로그인하고 추천을 받아보세요</p>
					<p className="text-sm text-zinc-500">취향을 저장하면 다음에도 같은 추천을 볼 수 있어요.</p>
				</div>
				<LinkButton href="/login?next=/home">로그인하기</LinkButton>
			</section>
		);
	}

	return (
		<section className="flex items-center justify-between gap-4 rounded-2xl bg-blue-50 p-5">
			<div className="flex min-w-0 flex-col gap-1">
				<p className="font-semibold text-blue-900">로그인된 상태입니다</p>
				<p className="text-sm text-blue-700">토큰이 메모리에 있어 새로고침하면 풀립니다.</p>
			</div>
			<Button
				variant="secondary"
				disabled={isPending}
				onClick={() => {
					signOut();
				}}
			>
				{isPending ? "로그아웃 중" : "로그아웃"}
			</Button>
		</section>
	);
}
