"use client";

import { useCallback, useRef, useState } from "react";

import type { KakaoLatLngLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";

export type PositionStatus = "idle" | "locating" | "granted" | "denied" | "unavailable";

const POSITION_OPTIONS: PositionOptions = {
	enableHighAccuracy: false,
	timeout: 10_000,
	maximumAge: 60_000
};

export function useCurrentPosition() {
	const [status, setStatus] = useState<PositionStatus>("idle");
	const [position, setPosition] = useState<KakaoLatLngLiteral | null>(null);
	const inFlightRef = useRef<Promise<KakaoLatLngLiteral | null> | null>(null);

	const requestCurrentPosition = useCallback(() => {
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
				POSITION_OPTIONS
			);
		}).finally(() => {
			inFlightRef.current = null;
		});

		inFlightRef.current = request;

		return request;
	}, []);

	return { position, status, requestCurrentPosition };
}
