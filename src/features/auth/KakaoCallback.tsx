"use client";

import { redirect, useSearchParams } from "next/navigation";

import { useKakaoLogin } from "./hooks/useKakaoLogin";

export function KakaoCallback() {
	const searchParams = useSearchParams();
	const code = searchParams.get("code");
	const login = useKakaoLogin(code);

	if (code === null) {
		return <p>인가 코드가 없습니다.</p>;
	}

	if (login.isError) {
		return <p>로그인에 실패했습니다. {login.error.message}</p>;
	}

	if (login.isSuccess) {
		redirect("/");
	}

	return <p>로그인 처리 중입니다...</p>;
}
