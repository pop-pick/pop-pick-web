import type { KakaoLatLngLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";
import type { PopupCardItem } from "@/shared/model/popup";
import type { Region } from "@/shared/model/region";

const REGION_CENTERS: Record<Region, KakaoLatLngLiteral> = {
	seongsu: { lat: 37.5445, lng: 127.0557 },
	yeouido: { lat: 37.5216, lng: 126.9243 },
	hongdae: { lat: 37.5572, lng: 126.9245 },
	sinchon: { lat: 37.5551, lng: 126.9368 },
	yongsan: { lat: 37.5299, lng: 126.9648 }
};

const FULL_TURN_RADIANS = 2 * Math.PI;
const POSITIONS_PER_RING = 6;
const RING_RADIUS_STEP_DEGREES = 0.0015;

function getPlaceholderPosition(region: Region, indexInRegion: number) {
	const center = REGION_CENTERS[region];

	if (indexInRegion === 0) {
		return center;
	}

	const slot = indexInRegion - 1;
	const ring = Math.floor(slot / POSITIONS_PER_RING) + 1;
	const angle = ((slot % POSITIONS_PER_RING) / POSITIONS_PER_RING) * FULL_TURN_RADIANS;
	const radius = ring * RING_RADIUS_STEP_DEGREES;

	return {
		lat: center.lat + radius * Math.sin(angle),
		lng: center.lng + radius * Math.cos(angle)
	};
}

/**
 * 팝업의 실제 좌표 대신 지역 중심 둘레에 흩어 놓은 마커. 같은 지역 팝업이 한 점에 겹치지 않게 한다.
 * 백엔드가 팝업 응답에 좌표를 담기 시작하면 이 파일을 통째로 지우고 좌표를 그대로 쓴다.
 */
export function toPlaceholderMarkers(popups: readonly PopupCardItem[]) {
	const countByRegion = new Map<Region, number>();

	return popups.map((popup) => {
		const indexInRegion = countByRegion.get(popup.region) ?? 0;
		countByRegion.set(popup.region, indexInRegion + 1);

		return {
			id: String(popup.id),
			position: getPlaceholderPosition(popup.region, indexInRegion),
			title: popup.name
		};
	});
}
