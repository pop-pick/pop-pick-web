"use client";

import { useCallback, useRef, useState } from "react";

import type { KakaoLatLngLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";

import type { PositionStatus } from "../model/position-status";

const POSITION_OPTIONS: PositionOptions = {
	enableHighAccuracy: false,
	timeout: 10_000,
	maximumAge: 60_000
};

export function useCurrentPosition() {
	const [status, setStatus] = useState<PositionStatus>("idle");
	const [position, setPosition] = useState<KakaoLatLngLiteral | null>(null);
	const pendingRequestRef = useRef<Promise<KakaoLatLngLiteral | null> | null>(null);

	const requestCurrentPosition = useCallback(() => {
		if (pendingRequestRef.current !== null) {
			return pendingRequestRef.current;
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
					const foundPosition = { lat: coords.latitude, lng: coords.longitude };
					setPosition(foundPosition);
					setStatus("granted");
					resolve(foundPosition);
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
			pendingRequestRef.current = null;
		});

		pendingRequestRef.current = request;

		return request;
	}, []);

	return { position, status, requestCurrentPosition };
}
