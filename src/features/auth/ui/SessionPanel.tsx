"use client";

import { Button } from "@/shared/ui/Button";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Skeleton } from "@/shared/ui/Skeleton";

import { useLogout } from "../hooks/useLogout";
import { buildLoginPath } from "../model/next-path";
import { useAuthStore } from "../model/useAuthStore";
import { SessionRetry } from "./SessionRetry";

interface SessionPanelProps {
	next: string;
}

export function SessionPanel({ next }: SessionPanelProps) {
	const status = useAuthStore((state) => state.status);
	const { mutate: signOut, isPending } = useLogout();

	if (status === "restoring") {
		return (
			<div role="status">
				<span className="sr-only">로그인 상태를 확인하고 있습니다</span>
				<Skeleton className="h-24" />
			</div>
		);
	}

	if (status === "unavailable") {
		return (
			<section className="rounded-2xl bg-zinc-50 p-5">
				<SessionRetry />
			</section>
		);
	}

	if (status === "anonymous") {
		return (
			<section className="flex flex-col gap-4 rounded-2xl bg-zinc-50 p-5">
				<div className="flex flex-col gap-1">
					<p className="font-semibold text-zinc-900">로그인하고 추천을 받아보세요</p>
					<p className="text-sm text-zinc-500">취향을 저장하면 다음에도 같은 추천을 볼 수 있어요.</p>
				</div>
				<LinkButton href={buildLoginPath(next)}>로그인하기</LinkButton>
			</section>
		);
	}

	return (
		<section className="flex items-center justify-between gap-4 rounded-2xl bg-blue-50 p-5">
			<div className="flex min-w-0 flex-col gap-1">
				<p className="font-semibold text-blue-900">로그인된 상태입니다</p>
				<p className="text-sm text-blue-700">새로고침해도 로그인이 풀리지 않습니다.</p>
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
