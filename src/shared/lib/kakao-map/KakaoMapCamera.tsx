"use client";

import { useEffect } from "react";

import { useKakaoMapHandle } from "./kakao-map-context";
import type { KakaoLatLngLiteral } from "./kakao-map-utils";
import { toLatLng } from "./kakao-map-utils";

interface KakaoMapCameraProps {
	/** 새 객체가 올 때마다 그 자리로 중심을 옮긴다. 같은 좌표라도 다시 재면 다시 옮긴다 */
	center: KakaoLatLngLiteral | null;
	level?: number;
}

/** `KakaoMap`의 children으로 넣는다. 사용자가 끌어 놓은 지도를 덮지 않고 값이 바뀔 때만 움직인다 */
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
