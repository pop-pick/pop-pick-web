export type KakaoLatLng = {
	getLat(): number;
	getLng(): number;
};

export type KakaoMapOptions = {
	center: KakaoLatLng;
	level?: number;
	keyboardShortcuts?: boolean;
};

export type KakaoLatLngBounds = {
	extend(latlng: KakaoLatLng): void;
	getSouthWest(): KakaoLatLng;
	getNorthEast(): KakaoLatLng;
};

export type KakaoMapInstance = {
	setCenter(latlng: KakaoLatLng): void;
	setLevel(level: number): void;
	setBounds(
		bounds: KakaoLatLngBounds,
		paddingTop?: number,
		paddingRight?: number,
		paddingBottom?: number,
		paddingLeft?: number
	): void;
	relayout(): void;
	getBounds(): KakaoLatLngBounds;
	panBy(dx: number, dy: number): void;
	getProjection(): KakaoMapProjection;
	getNode(): HTMLElement;
};

export type KakaoPoint = {
	x: number;
	y: number;
};

export type KakaoMapProjection = {
	containerPointFromCoords(latlng: KakaoLatLng): KakaoPoint;
};

export type KakaoCustomOverlayOptions = {
	map?: KakaoMapInstance;
	position: KakaoLatLng;
	content: string | HTMLElement;
	yAnchor?: number;
	zIndex?: number;
	clickable?: boolean;
};

export type KakaoCustomOverlayInstance = {
	setMap(map: KakaoMapInstance | null): void;
	setPosition(position: KakaoLatLng): void;
	getContent(): string | HTMLElement;
	setZIndex(zIndex: number): void;
};

export type KakaoClusterStyle = Record<string, string>;

export type KakaoMarkerClustererOptions = {
	map: KakaoMapInstance;
	minLevel?: number;
	averageCenter?: boolean;
	styles?: KakaoClusterStyle[];
	texts?: string[] | ((size: number) => string);
};

export type KakaoClusterInstance = {
	getSize(): number;
	getMarkers(): KakaoCustomOverlayInstance[];
	/** 클러스터 마커는 CustomOverlay다. content 요소에 클러스터러가 클릭 확대를 걸어 두므로 요소를 바꾸지 않고 안을 채운다 */
	getClusterMarker(): KakaoCustomOverlayInstance;
};

export type KakaoMarkerClustererInstance = {
	addMarker(marker: KakaoCustomOverlayInstance, nodraw?: boolean): void;
	removeMarker(marker: KakaoCustomOverlayInstance, nodraw?: boolean): void;
	redraw(): void;
	setMap(map: KakaoMapInstance | null): void;
};

export type KakaoMapsEventNamespace = {
	addListener(target: KakaoMapInstance, type: "click" | "idle", handler: () => void): void;
	addListener(
		target: KakaoMarkerClustererInstance,
		type: "clustered",
		handler: (clusters: KakaoClusterInstance[]) => void
	): void;
	removeListener(target: KakaoMapInstance, type: "click" | "idle", handler: () => void): void;
	removeListener(
		target: KakaoMarkerClustererInstance,
		type: "clustered",
		handler: (clusters: KakaoClusterInstance[]) => void
	): void;
};

export type KakaoMapsNamespace = {
	load(callback: () => void): void;
	LatLng: new (lat: number, lng: number) => KakaoLatLng;
	LatLngBounds: new () => KakaoLatLngBounds;
	Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMapInstance;
	CustomOverlay: new (options: KakaoCustomOverlayOptions) => KakaoCustomOverlayInstance;
	/** `libraries=clusterer`로 SDK를 불러야 존재한다 */
	MarkerClusterer: new (options: KakaoMarkerClustererOptions) => KakaoMarkerClustererInstance;
	event: KakaoMapsEventNamespace;
};

export type KakaoMapsSdk = {
	maps: KakaoMapsNamespace;
};

declare global {
	interface Window {
		kakao?: KakaoMapsSdk;
	}
}
