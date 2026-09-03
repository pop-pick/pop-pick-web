"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";

import { KakaoMapContext } from "./kakao-map-context";
import { KakaoMapSession, type KakaoMarkerData } from "./kakao-map-session";
import { KAKAO_MAP_DEFAULT_LEVEL, type KakaoLatLngLiteral } from "./kakao-map-utils";
import { useKakaoMapSdk } from "./useKakaoMapSdk";

export type KakaoMapProps = {
	center: KakaoLatLngLiteral;
	level?: number;
	markers?: readonly KakaoMarkerData[];
	onMarkerClick?: (markerId: string) => void;
	label: string;
	className?: string;
	children?: ReactNode;
};

const NO_MARKERS: readonly KakaoMarkerData[] = [];

export function KakaoMap({
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
	const initialViewRef = useRef({ center, level });

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
		};
	}, [sdk]);

	useEffect(() => {
		session?.moveTo({
			lat: center.lat,
			lng: center.lng
		});
	}, [session, center.lat, center.lng]);

	useEffect(() => {
		session?.setLevel(level);
	}, [session, level]);

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
					className="size-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
