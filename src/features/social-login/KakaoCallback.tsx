"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { loginWithKakao } from "./api/auth";
import { getKakaoRedirectUri } from "./lib/kakao-oauth";
import { useAuthStore } from "./store/auth-store";

export function KakaoCallback() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const setTokens = useAuthStore((state) => state.setTokens);
	const code = searchParams.get("code");

	const { mutate, error } = useMutation({
		mutationFn: (authCode: string) => loginWithKakao(authCode, getKakaoRedirectUri()),
		onSuccess: (tokens) => {
			setTokens(tokens);
			router.replace("/");
		}
	});

	useEffect(() => {
		if (code) {
			mutate(code);
		}
	}, [code, mutate]);

	if (!code) {
		return <p>인가 코드가 없습니다.</p>;
	}

	if (error) {
		return <p>로그인에 실패했습니다. {error.message}</p>;
	}

	return <p>로그인 처리 중입니다...</p>;
}
