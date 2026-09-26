"use client";

import { useEffect } from "react";

import { useKakaoMapHandle } from "./kakao-map-context";
import type { KakaoLatLngLiteral } from "./kakao-map-utils";
import { toLatLng } from "./kakao-map-utils";

interface KakaoMapCameraProps {
	center: KakaoLatLngLiteral | null;
	level?: number;
}

export function KakaoMapCamera({ center, level }: KakaoMapCameraProps) {
	const handle = useKakaoMapHandle();

	useEffect(() => {
		if (handle === null || center === null) {
			return;
		}

		handle.map.setCenter(toLatLng(handle.sdk, center));
		if (level !== undefined) {
			handle.map.setLevel(level);
		}
	}, [handle, center, level]);

	return null;
}
