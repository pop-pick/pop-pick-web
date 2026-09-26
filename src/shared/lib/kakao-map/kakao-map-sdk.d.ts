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
	xAnchor?: number;
	yAnchor?: number;
	zIndex?: number;
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

export type KakaoClusterable = KakaoMarkerInstance | KakaoCustomOverlayInstance;

export type KakaoClusterStyle = Record<string, string>;

export type KakaoMarkerClustererOptions = {
	map: KakaoMapInstance;
	minLevel?: number;
	minClusterSize?: number;
	averageCenter?: boolean;
	gridSize?: number;
	disableClickZoom?: boolean;
	styles?: KakaoClusterStyle[];
	texts?: string[] | ((size: number) => string);
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
