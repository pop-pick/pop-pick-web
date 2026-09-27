import { type KakaoLatLngLiteral, SEOUL_CENTER } from "@/shared/lib/kakao-map/kakao-map-utils";

export function resolveMapView(
	cameraTarget: KakaoLatLngLiteral | null,
	cameraLevel: number,
	positions: readonly KakaoLatLngLiteral[]
) {
	if (cameraTarget !== null) {
		return { center: cameraTarget, level: cameraLevel };
	}

	if (positions.length > 0) {
		return { fitTo: positions };
	}

	return { center: SEOUL_CENTER };
}
