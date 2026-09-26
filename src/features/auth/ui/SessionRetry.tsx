"use client";

import { useState } from "react";

import { refreshAccessToken } from "@/shared/api/auth-token";
import { Button } from "@/shared/ui/Button";

export function SessionRetry() {
	const [isRetrying, setIsRetrying] = useState(false);

	const handleRetry = async () => {
		setIsRetrying(true);
		await refreshAccessToken();
		setIsRetrying(false);
	};

	return (
		<div className="flex flex-col items-center gap-4 text-center">
			<p role="alert" className="text-base leading-relaxed text-zinc-700">
				로그인 상태를 확인하지 못했습니다. 연결을 확인하고 다시 시도해 주세요.
			</p>
			<Button variant="secondary" disabled={isRetrying} onClick={handleRetry}>
				{isRetrying ? "확인하는 중" : "다시 시도"}
			</Button>
		</div>
	);
}
