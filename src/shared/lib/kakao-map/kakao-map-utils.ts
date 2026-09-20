import type { KakaoMapsSdk } from "./kakao-map-sdk";

export type KakaoLatLngLiteral = {
	lat: number;
	lng: number;
};

type KakaoMapLibrary = "services" | "clusterer" | "drawing";

const KAKAO_MAP_SDK_URL = "https://dapi.kakao.com/v2/maps/sdk.js";
const KAKAO_MAP_LIBRARIES: readonly KakaoMapLibrary[] = [];
export const KAKAO_MAP_DEFAULT_LEVEL = 3;

export function readKakaoMapKey() {
	const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
	if (typeof key !== "string" || key.length === 0) {
		return null;
	}

	return key;
}

export function buildKakaoMapSdkUrl(appkey: string) {
	const params = new URLSearchParams({ appkey, autoload: "false" });

	if (KAKAO_MAP_LIBRARIES.length > 0) {
		params.set("libraries", KAKAO_MAP_LIBRARIES.join(","));
	}

	return `${KAKAO_MAP_SDK_URL}?${params.toString()}`;
}

export function toLatLng(sdk: KakaoMapsSdk, position: KakaoLatLngLiteral) {
	return new sdk.maps.LatLng(position.lat, position.lng);
}

export function isSamePosition(a: KakaoLatLngLiteral, b: KakaoLatLngLiteral) {
	return a.lat === b.lat && a.lng === b.lng;
}
