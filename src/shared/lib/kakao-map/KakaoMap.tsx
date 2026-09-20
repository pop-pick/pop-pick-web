"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";

import { KakaoMapContext } from "./kakao-map-context";
import { KakaoMapSession, type KakaoMarkerData } from "./kakao-map-session";
import { KAKAO_MAP_DEFAULT_LEVEL, type KakaoLatLngLiteral } from "./kakao-map-utils";
import { useKakaoMapSdk } from "./useKakaoMapSdk";

/** 지도를 어디에 맞출지. 좌표를 전부 담거나(fitTo) 중심 하나를 고른다(center). 둘 중 하나는 있어야 한다 */
type KakaoMapView =
	| { fitTo: readonly KakaoLatLngLiteral[]; center?: never; level?: never }
	| { fitTo?: never; center: KakaoLatLngLiteral; level?: number };

export type KakaoMapProps = KakaoMapView & {
	markers?: readonly KakaoMarkerData[];
	onMarkerClick?: (markerId: string) => void;
	label: string;
	className?: string;
	children?: ReactNode;
};

const NO_MARKERS: readonly KakaoMarkerData[] = [];
const FIT_PADDING_PX = 20;

/**
 * 지도 SDK가 컨테이너 안에 z-index 2 레이어를 만든다. 컨테이너의 `isolate`가 그 숫자를 가둬서
 * 지도 위에 겹쳐 놓는 것은 z를 주지 않아도 DOM 순서대로 위에 그려진다. 빼면 타일 뒤로 들어가
 * 접근성 트리에는 남고 화면에서만 사라진다.
 */
export function KakaoMap({
	fitTo,
	center,
	level = KAKAO_MAP_DEFAULT_LEVEL,
	markers = NO_MARKERS,
	onMarkerClick,
	label,
	className,
	children
}: KakaoMapProps) {
	const { status, sdk, error } = useKakaoMapSdk();

	const containerRef = useRef<HTMLDivElement | null>(null);
	const initialCenter = fitTo?.[0] ?? center;
	if (initialCenter === undefined) {
		throw new Error("KakaoMap에 fitTo나 center 중 하나는 있어야 한다. fitTo가 빈 배열이면 그릴 자리를 알 수 없다");
	}

	const initialViewRef = useRef({ center: initialCenter, level });

	const [session, setSession] = useState<KakaoMapSession | null>(null);

	useEffect(() => {
		session?.setMarkerClickHandler(onMarkerClick);
	}, [session, onMarkerClick]);

	useEffect(() => {
		const container = containerRef.current;
		if (sdk === null || container === null) {
			return;
		}

		const attached = KakaoMapSession.attach(sdk, container, initialViewRef.current);
		setSession(attached);

		return () => {
			attached.detach();
			setSession(null);
		};
	}, [sdk]);

	useEffect(() => {
		if (session === null || fitTo !== undefined || center === undefined) {
			return;
		}

		session.moveTo({ lat: center.lat, lng: center.lng });
		session.setLevel(level);
	}, [session, fitTo, center?.lat, center?.lng, level]);

	useEffect(() => {
		if (fitTo === undefined) {
			return;
		}

		session?.fitToPositions(fitTo, FIT_PADDING_PX);
	}, [session, fitTo]);

	useEffect(() => {
		session?.syncMarkers(markers);
	}, [session, markers]);

	const contextValue = useMemo(
		() => ({
			handle:
				session === null
					? null
					: {
							sdk: session.sdk,
							map: session.map
						}
		}),
		[session]
	);

	if (status === "error") {
		return (
			<div
				role="alert"
				className={cn("flex items-center justify-center rounded-2xl bg-red-50 p-6 text-sm text-red-900", className)}
			>
				{error.message}
			</div>
		);
	}

	return (
		<KakaoMapContext.Provider value={contextValue}>
			<div className={cn("relative overflow-hidden rounded-2xl bg-zinc-100", className)}>
				<div
					ref={containerRef}
					role="application"
					aria-label={label}
					aria-busy={status === "loading"}
					tabIndex={status === "ready" ? 0 : -1}
					className="absolute inset-0 isolate focus-ring"
				/>
				{status === "loading" ? (
					<p role="status" className="absolute inset-0 flex items-center justify-center text-sm text-zinc-600">
						지도를 준비하고 있습니다
					</p>
				) : null}
				{children}
			</div>
		</KakaoMapContext.Provider>
	);
}
