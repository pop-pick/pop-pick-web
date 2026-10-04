"use client";

import { useEffect, useState } from "react";

import { KakaoMapError } from "./kakao-map-error";
import type { KakaoMapsSdk } from "./kakao-map-sdk";
import { KakaoMapSession } from "./kakao-map-session";

type KakaoMapSdkState = { status: "loading" | "error"; sdk: null } | { status: "ready"; sdk: KakaoMapsSdk };

const LOADING_STATE: KakaoMapSdkState = {
	status: "loading",
	sdk: null
};

export function useKakaoMapSdk() {
	const [state, setState] = useState<KakaoMapSdkState>(LOADING_STATE);
	const [attempt, setAttempt] = useState(0);
	const [unexpectedError, setUnexpectedError] = useState<Error | null>(null);

	useEffect(() => {
		let isActive = true;
		const sdkPromise = attempt === 0 ? KakaoMapSession.loadSdk() : KakaoMapSession.reloadSdk();

		sdkPromise.then(
			(sdk) => {
				if (isActive) {
					setState({ status: "ready", sdk });
				}
			},
			(error: unknown) => {
				if (!isActive) {
					return;
				}

				if (error instanceof KakaoMapError) {
					console.error(`[kakao-map] SDK를 불러오지 못했다 (${error.reason})`, error);
					setState({ status: "error", sdk: null });
					return;
				}

				console.error("[kakao-map] KakaoMapSession.loadSdk가 KakaoMapError가 아닌 값으로 거절했습니다", error);

				const unexpectedLoadError = new Error("카카오맵 SDK 로더가 KakaoMapError가 아닌 값으로 거절했습니다.", {
					cause: error
				});
				setUnexpectedError(unexpectedLoadError);
			}
		);

		return () => {
			isActive = false;
		};
	}, [attempt]);

	const reloadSdk = () => {
		setState(LOADING_STATE);
		setAttempt((count) => count + 1);
	};

	if (unexpectedError !== null) {
		throw unexpectedError;
	}

	return { ...state, reloadSdk };
}
