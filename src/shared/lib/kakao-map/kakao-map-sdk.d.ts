export type KakaoLatLng = {
	getLat(): number;
	getLng(): number;
};

export type KakaoMapOptions = {
	center: KakaoLatLng;
	level?: number;
	keyboardShortcuts?: boolean;
};

export type KakaoMapInstance = {
	setCenter(latlng: KakaoLatLng): void;
	getCenter(): KakaoLatLng;
	setLevel(level: number): void;
	getLevel(): number;
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

export type KakaoMapsEventNamespace = {
	addListener(target: KakaoMapInstance, type: KakaoMapEventType, handler: () => void): void;
	addListener(target: KakaoMarkerInstance, type: KakaoMarkerEventType, handler: () => void): void;
	removeListener(target: KakaoMapInstance, type: KakaoMapEventType, handler: () => void): void;
	removeListener(target: KakaoMarkerInstance, type: KakaoMarkerEventType, handler: () => void): void;
};

export type KakaoMapsNamespace = {
	load(callback: () => void): void;
	LatLng: new (lat: number, lng: number) => KakaoLatLng;
	Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMapInstance;
	Marker: new (options: KakaoMarkerOptions) => KakaoMarkerInstance;
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
