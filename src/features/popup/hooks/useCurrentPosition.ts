"use client";

import { useCallback, useRef, useState } from "react";

import type { KakaoLatLngLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";

export type PositionStatus = "idle" | "locating" | "granted" | "denied" | "unavailable";

/** 지도 첫 화면용이라 정밀도보다 속도다. 1분 안의 캐시된 위치면 그대로 쓴다 */
const LOCATE_OPTIONS: PositionOptions = {
	enableHighAccuracy: false,
	timeout: 10_000,
	maximumAge: 60_000
};

export function useCurrentPosition() {
	const [status, setStatus] = useState<PositionStatus>("idle");
	const [position, setPosition] = useState<KakaoLatLngLiteral | null>(null);
	const inFlightRef = useRef<Promise<KakaoLatLngLiteral | null> | null>(null);

	/**
	 * 찾은 좌표를 돌려주고 못 찾으면 null이다. 거부와 미지원은 상태로 남겨 부르는 쪽이 다시 묻지 않게 한다.
	 * 진행 중인 요청이 있으면 그 결과를 함께 기다린다. StrictMode 이중 실행과 버튼 연타에서 요청이 한 번만 나간다.
	 */
	const locate = useCallback(() => {
		if (inFlightRef.current !== null) {
			return inFlightRef.current;
		}

		const request = new Promise<KakaoLatLngLiteral | null>((resolve) => {
			if (typeof navigator === "undefined" || navigator.geolocation === undefined) {
				setStatus("unavailable");
				resolve(null);
				return;
			}

			setStatus("locating");
			navigator.geolocation.getCurrentPosition(
				({ coords }) => {
					const found = { lat: coords.latitude, lng: coords.longitude };
					setPosition(found);
					setStatus("granted");
					resolve(found);
				},
				(error) => {
					if (error.code === error.PERMISSION_DENIED) {
						console.info("[popup] 위치 권한을 거부해 서울 기본 위치를 쓴다");
						setStatus("denied");
					} else {
						console.warn("[popup] 현재 위치를 얻지 못했다", error);
						setStatus("unavailable");
					}

					resolve(null);
				},
				LOCATE_OPTIONS
			);
		}).finally(() => {
			inFlightRef.current = null;
		});

		inFlightRef.current = request;

		return request;
	}, []);

	return { position, status, locate };
}
