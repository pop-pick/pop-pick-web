"use client";

import { useCallback, useEffect, useState } from "react";

import { KakaoMapError } from "./kakao-map-error";
import type { KakaoMapsSdk } from "./kakao-map-sdk";
import { KakaoMapSession } from "./kakao-map-session";

export type KakaoMapSdkState =
	| { status: "loading"; sdk: null; error: null }
	| { status: "ready"; sdk: KakaoMapsSdk; error: null }
	| { status: "error"; sdk: null; error: KakaoMapError };

const LOADING_STATE: KakaoMapSdkState = {
	status: "loading",
	sdk: null,
	error: null
};

export function useKakaoMapSdk() {
	const [state, setState] = useState<KakaoMapSdkState>(LOADING_STATE);
	const [attempt, setAttempt] = useState(0);
	const [unexpectedError, setUnexpectedError] = useState<Error | null>(null);

	useEffect(() => {
		let isActive = true;
		const loading = attempt === 0 ? KakaoMapSession.load() : KakaoMapSession.reload();

		loading.then(
			(sdk) => {
				if (isActive) {
					setState({ status: "ready", sdk, error: null });
				}
			},
			(error: unknown) => {
				if (!isActive) {
					return;
				}

				if (error instanceof KakaoMapError) {
					setState({ status: "error", sdk: null, error });
					return;
				}

				console.error("[kakao-map] KakaoMapSession.load 가 KakaoMapError 가 아닌 값으로 거절했습니다", error);

				const unexpected = new Error("카카오맵 SDK 로더가 KakaoMapError 가 아닌 값으로 거절했습니다.", {
					cause: error
				});
				setUnexpectedError(unexpected);
			}
		);

		return () => {
			isActive = false;
		};
	}, [attempt]);

	const reloadSdk = useCallback(() => {
		setState(LOADING_STATE);
		setAttempt((count) => count + 1);
	}, []);

	if (unexpectedError !== null) {
		throw unexpectedError;
	}

	return { ...state, reloadSdk };
}
