"use client";

import { useEffect, useState } from "react";

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
	const [brokenContract, setBrokenContract] = useState<Error | null>(null);

	useEffect(() => {
		let active = true;

		KakaoMapSession.load().then(
			(sdk) => {
				if (active) {
					setState({ status: "ready", sdk, error: null });
				}
			},
			(error: unknown) => {
				if (!active) {
					return;
				}

				if (error instanceof KakaoMapError) {
					setState({ status: "error", sdk: null, error });
					return;
				}

				console.error("[kakao-map] KakaoMapSession.load 가 KakaoMapError 가 아닌 값으로 거절했습니다", error);

				const broken = new Error("카카오맵 SDK 로더가 KakaoMapError 가 아닌 값으로 거절했습니다.", { cause: error });
				setBrokenContract(broken);
			}
		);

		return () => {
			active = false;
		};
	}, []);

	if (brokenContract !== null) {
		throw brokenContract;
	}

	return state;
}
