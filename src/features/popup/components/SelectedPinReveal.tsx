import { type RefObject, useEffect } from "react";

import { useKakaoMapHandle } from "@/shared/lib/kakao-map/kakao-map-context";
import { type KakaoLatLngLiteral, toLatLng } from "@/shared/lib/kakao-map/kakao-map-utils";

const PIN_CLEARANCE_PX = 32;

interface SelectedPinRevealProps {
	position: KakaoLatLngLiteral | null;
	overlayRef: RefObject<HTMLDivElement | null>;
}

export function SelectedPinReveal({ position, overlayRef }: SelectedPinRevealProps) {
	const handle = useKakaoMapHandle();

	useEffect(() => {
		const overlay = overlayRef.current;

		if (handle === null || position === null || overlay === null) {
			return;
		}

		const pinPoint = handle.map.getProjection().containerPointFromCoords(toLatLng(handle.sdk, position));
		const pinBottom = handle.map.getNode().getBoundingClientRect().top + pinPoint.y + PIN_CLEARANCE_PX;
		const hiddenHeight = pinBottom - overlay.getBoundingClientRect().top;

		if (hiddenHeight > 0) {
			handle.map.panBy(0, hiddenHeight);
		}
	}, [handle, position, overlayRef]);

	return null;
}
