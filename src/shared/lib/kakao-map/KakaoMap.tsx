"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";

import { KakaoMapContext } from "./kakao-map-context";
import { type KakaoClusterOptions, KakaoMapSession, type KakaoMarkerData } from "./kakao-map-session";
import { KAKAO_MAP_DEFAULT_LEVEL, type KakaoLatLngLiteral } from "./kakao-map-utils";
import { useKakaoMapSdk } from "./useKakaoMapSdk";

type KakaoMapView =
	| { fitTo: readonly KakaoLatLngLiteral[]; center?: never; level?: never }
	| { fitTo?: never; center: KakaoLatLngLiteral; level?: number };

export type KakaoMapProps = KakaoMapView & {
	markers?: readonly KakaoMarkerData[];
	onMarkerClick?: (markerId: string) => void;
	selectedMarkerId?: string | null;
	myPosition?: KakaoLatLngLiteral | null;
	initialCluster?: KakaoClusterOptions;
	label: string;
	className?: string;
	children?: ReactNode;
	errorAction?: ReactNode;
};

const NO_MARKERS: readonly KakaoMarkerData[] = [];
const FIT_PADDING_PX = 20;

/** 컨테이너의 `isolate`가 SDK의 z-index 2 레이어를 가둔다. 빼면 지도 위 요소가 타일 뒤로 숨는다 */
export function KakaoMap({
	fitTo,
	center,
	level = KAKAO_MAP_DEFAULT_LEVEL,
	markers = NO_MARKERS,
	onMarkerClick,
	selectedMarkerId = null,
	myPosition = null,
	initialCluster,
	label,
	className,
	children,
	errorAction
}: KakaoMapProps) {
	const { status, sdk, error, reloadSdk } = useKakaoMapSdk();

	const containerRef = useRef<HTMLDivElement | null>(null);
	const initialCenter = fitTo?.[0] ?? center;
	if (initialCenter === undefined) {
		throw new Error("KakaoMap에 fitTo나 center 중 하나는 있어야 한다. fitTo가 빈 배열이면 그릴 자리를 알 수 없다");
	}

	const initialViewRef = useRef({ center: initialCenter, level, cluster: initialCluster });

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

	useEffect(() => {
		session?.setSelectedMarker(selectedMarkerId);
	}, [session, selectedMarkerId]);

	useEffect(() => {
		session?.setMyPosition(myPosition);
	}, [session, myPosition]);

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
				className={cn(
					"flex flex-col items-center justify-center gap-4 rounded-2xl bg-red-50 p-6 text-center",
					className
				)}
			>
				<div className="flex flex-col gap-1">
					<p className="font-semibold text-red-900">지도를 불러오지 못했습니다</p>
					<p className="text-xs leading-relaxed text-red-800">{error.message}</p>
				</div>
				<div className="flex flex-wrap justify-center gap-2">
					<Button variant="secondary" onClick={reloadSdk}>
						다시 시도
					</Button>
					{errorAction}
				</div>
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
