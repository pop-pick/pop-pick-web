"use client";

import { createContext, useContext } from "react";

import type { KakaoMapInstance, KakaoMapsSdk } from "./kakao-map-sdk";

export type KakaoMapHandle = {
	sdk: KakaoMapsSdk;
	map: KakaoMapInstance;
};

type KakaoMapContextValue = {
	handle: KakaoMapHandle | null;
};

export const KakaoMapContext = createContext<KakaoMapContextValue | null>(null);

export function useKakaoMapHandle() {
	const value = useContext(KakaoMapContext);
	if (value === null) {
		throw new Error(
			"useKakaoMapHandle 은 KakaoMap 안에서만 쓸 수 있습니다. 이 훅을 부르는 컴포넌트를 KakaoMap 의 children 으로 넣으세요."
		);
	}

	return value.handle;
}
