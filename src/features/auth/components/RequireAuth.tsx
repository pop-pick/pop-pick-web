"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { Skeleton } from "@/shared/ui/Skeleton";

import { buildLoginPath } from "../model/next-path";
import { useAuthStore } from "../model/useAuthStore";
import { SessionRetry } from "./SessionRetry";

interface RequireAuthProps {
	children: ReactNode;
	nextPath: string;
}

export function RequireAuth({ children, nextPath }: RequireAuthProps) {
	const router = useRouter();
	const status = useAuthStore((state) => state.status);

	useEffect(() => {
		if (status === "anonymous") {
			router.replace(buildLoginPath(nextPath));
		}
	}, [status, nextPath, router]);

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
