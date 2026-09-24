"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { Skeleton } from "@/shared/ui/Skeleton";

import { buildLoginPath } from "../model/next-path";
import { useAuthStore } from "../model/useAuthStore";
import { SessionRetry } from "./SessionRetry";

interface RequireAuthProps {
	children: ReactNode;
	next: string;
}

/**
 * 화면 전체가 로그인 필요일 때 본문을 감싼다. 비로그인이면 history를 남기지 않고 로그인 화면으로 바꾼다.
 * 화면 제목은 감싸지 않는다. 확인하는 동안에도 어느 화면인지 읽혀야 한다.
 * 서버 컴포넌트 children은 비로그인 사용자에게도 RSC 페이로드로 내려가므로 사용자 데이터는 이 안의 클라이언트 컴포넌트가 받는다
 */
export function RequireAuth({ children, next }: RequireAuthProps) {
	const router = useRouter();
	const status = useAuthStore((state) => state.status);

	useEffect(() => {
		if (status === "anonymous") {
			router.replace(buildLoginPath(next));
		}
	}, [status, next, router]);

	if (status === "unavailable") {
		return (
			<div className="flex flex-1 flex-col items-center justify-center py-16">
				<SessionRetry />
			</div>
		);
	}

	if (status !== "authenticated") {
		return (
			<div role="status" className="flex flex-col gap-4">
				<span className="sr-only">로그인 상태를 확인하고 있습니다</span>
				<Skeleton className="h-7 w-32 rounded-lg" />
				<Skeleton className="h-44" />
			</div>
		);
	}

	return <>{children}</>;
}
