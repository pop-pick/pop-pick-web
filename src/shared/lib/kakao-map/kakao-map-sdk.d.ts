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
	isEmpty(): boolean;
};

export type KakaoMapInstance = {
	setCenter(latlng: KakaoLatLng): void;
	getCenter(): KakaoLatLng;
	setLevel(level: number): void;
	getLevel(): number;
	setBounds(
		bounds: KakaoLatLngBounds,
		paddingTop?: number,
		paddingRight?: number,
		paddingBottom?: number,
		paddingLeft?: number
	): void;
	relayout(): void;
};

export type KakaoMarkerOptions = {
	map?: KakaoMapInstance;
	position: KakaoLatLng;
	title?: string;
	clickable?: boolean;
};

export type KakaoMarkerInstance = {
	setMap(map: KakaoMapInstance | null): void;
	setPosition(position: KakaoLatLng): void;
	setTitle(title: string): void;
};

export type KakaoCustomOverlayOptions = {
	map?: KakaoMapInstance;
	position: KakaoLatLng;
	content: string | HTMLElement;
	/** 0이 왼쪽, 1이 오른쪽. 기본 0.5 */
	xAnchor?: number;
	/** 0이 위, 1이 아래. 기본 0.5 */
	yAnchor?: number;
	zIndex?: number;
	/** true면 오버레이 클릭이 지도 클릭으로 번지지 않는다 */
	clickable?: boolean;
};

export type KakaoCustomOverlayInstance = {
	setMap(map: KakaoMapInstance | null): void;
	getMap(): KakaoMapInstance | null;
	setPosition(position: KakaoLatLng): void;
	getPosition(): KakaoLatLng;
	setContent(content: string | HTMLElement): void;
	setVisible(visible: boolean): void;
	setZIndex(zIndex: number): void;
};

/** 클러스터러가 묶는 대상. 마커와 커스텀 오버레이 둘 다 받는다 */
export type KakaoClusterable = KakaoMarkerInstance | KakaoCustomOverlayInstance;

export type KakaoClusterStyle = Record<string, string>;

export type KakaoMarkerClustererOptions = {
	map: KakaoMapInstance;
	/** 이 레벨 이상(멀리 볼 때)에서만 묶는다. 이보다 확대하면 개별 핀으로 풀린다 */
	minLevel?: number;
	/** 몇 개부터 묶는지. 기본 2 */
	minClusterSize?: number;
	/** 묶인 핀들의 평균 위치에 클러스터를 둔다. false면 첫 핀 위치 */
	averageCenter?: boolean;
	gridSize?: number;
	/** 클러스터를 누르면 한 단계 확대하는 기본 동작을 끈다 */
	disableClickZoom?: boolean;
	styles?: KakaoClusterStyle[];
	/** 클러스터에 쓰는 글자. 배열이면 styles와 같은 인덱스, 함수면 크기를 받아 문자열을 낸다 */
	texts?: string[] | ((size: number) => string);
	/** 클러스터 크기를 styles 인덱스로 바꾼다. 배열이면 경계값 목록 */
	calculator?: number[] | ((size: number) => number);
};

export type KakaoClusterInstance = {
	getCenter(): KakaoLatLng;
	getBounds(): KakaoLatLngBounds;
	getSize(): number;
	getMarkers(): KakaoClusterable[];
};

export type KakaoMarkerClustererInstance = {
	addMarker(marker: KakaoClusterable, nodraw?: boolean): void;
	addMarkers(markers: KakaoClusterable[], nodraw?: boolean): void;
	removeMarker(marker: KakaoClusterable, nodraw?: boolean): void;
	removeMarkers(markers: KakaoClusterable[], nodraw?: boolean): void;
	clear(): void;
	redraw(): void;
	setMap(map: KakaoMapInstance | null): void;
};

export type KakaoMapEventType =
	| "bounds_changed"
	| "center_changed"
	| "click"
	| "dblclick"
	| "drag"
	| "dragend"
	| "dragstart"
	| "idle"
	| "jump"
	| "maptypeid_changed"
	| "mousemove"
	| "relayout"
	| "rightclick"
	| "tilesloaded"
	| "zoom_changed"
	| "zoom_start";

export type KakaoMarkerEventType = "click" | "dragend" | "dragstart" | "mouseout" | "mouseover" | "rightclick";

export type KakaoClustererEventType =
	"clusterclick" | "clusterover" | "clusterout" | "clusterdblclick" | "clusterrightclick" | "clustered";

export type KakaoMapsEventNamespace = {
	addListener(target: KakaoMapInstance, type: KakaoMapEventType, handler: () => void): void;
	addListener(target: KakaoMarkerInstance, type: KakaoMarkerEventType, handler: () => void): void;
	addListener(
		target: KakaoMarkerClustererInstance,
		type: KakaoClustererEventType,
		handler: (cluster: KakaoClusterInstance) => void
	): void;
	removeListener(target: KakaoMapInstance, type: KakaoMapEventType, handler: () => void): void;
	removeListener(target: KakaoMarkerInstance, type: KakaoMarkerEventType, handler: () => void): void;
	removeListener(
		target: KakaoMarkerClustererInstance,
		type: KakaoClustererEventType,
		handler: (cluster: KakaoClusterInstance) => void
	): void;
};

export type KakaoMapsNamespace = {
	load(callback: () => void): void;
	LatLng: new (lat: number, lng: number) => KakaoLatLng;
	LatLngBounds: new () => KakaoLatLngBounds;
	Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMapInstance;
	Marker: new (options: KakaoMarkerOptions) => KakaoMarkerInstance;
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
