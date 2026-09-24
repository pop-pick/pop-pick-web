"use client";

import { KakaoMapError } from "./kakao-map-error";
import { buildPinElement, CLUSTER_STYLES, formatClusterText, getMyPositionElement } from "./kakao-map-pins";
import type {
	KakaoCustomOverlayInstance,
	KakaoMapInstance,
	KakaoMapsSdk,
	KakaoMarkerClustererInstance
} from "./kakao-map-sdk";
import type { KakaoLatLngLiteral } from "./kakao-map-utils";
import { buildKakaoMapSdkUrl, isSamePosition, readKakaoMapKey, toLatLng } from "./kakao-map-utils";

export type KakaoMarkerData = {
	id: string;
	position: KakaoLatLngLiteral;
	/** 핀의 접근성 이름. 라벨이 잘려도 이 값은 전체다 */
	title: string;
	/** 핀에 그리는 아이콘. 없으면 기본 핀 */
	iconUrl?: string;
	/** 핀 아래 붙는 글자. 길이 제한은 부르는 쪽이 한다 */
	label?: string;
};

export type KakaoClusterOptions = {
	/** 이 레벨 이상(멀리 볼 때)에서만 묶는다 */
	minLevel: number;
};

export type KakaoMapViewOptions = {
	center: KakaoLatLngLiteral;
	level: number;
	cluster?: KakaoClusterOptions;
};

type MarkerClickHandler = (markerId: string) => void;

type SyncedPin = {
	overlay: KakaoCustomOverlayInstance;
	element: HTMLElement;
	listener: () => void;
	data: KakaoMarkerData;
};

const SCRIPT_ELEMENT_ID = "kakao-map-sdk";
const PIN_Z_INDEX = 1;
const SELECTED_PIN_Z_INDEX = 2;
const MY_POSITION_Z_INDEX = 3;

function isSamePinData(a: KakaoMarkerData, b: KakaoMarkerData) {
	return a.title === b.title && a.iconUrl === b.iconUrl && a.label === b.label;
}

export class KakaoMapSession {
	private static sdkPromise: Promise<KakaoMapsSdk> | null = null;
	private static attached = new WeakMap<HTMLElement, KakaoMapSession>();

	public static load() {
		KakaoMapSession.sdkPromise ??= KakaoMapSession.loadScript();
		return KakaoMapSession.sdkPromise;
	}

	/** 실패로 끝난 로딩을 버리고 다시 시도한다. 실패한 script 요소도 지운다 */
	public static reload() {
		KakaoMapSession.sdkPromise = null;
		document.getElementById(SCRIPT_ELEMENT_ID)?.remove();

		return KakaoMapSession.load();
	}

	public static attach(sdk: KakaoMapsSdk, container: HTMLElement, view: KakaoMapViewOptions) {
		const attached = KakaoMapSession.attached.get(container);
		if (attached !== undefined) {
			attached.observeResize();
			return attached;
		}

		const session = new KakaoMapSession(sdk, container, view);
		KakaoMapSession.attached.set(container, session);

		return session;
	}

	private static loadScript() {
		if (typeof window === "undefined") {
			return Promise.reject(new KakaoMapError("not-in-browser"));
		}

		const appkey = readKakaoMapKey();
		if (appkey === null) {
			return Promise.reject(new KakaoMapError("missing-key"));
		}

		return new Promise<KakaoMapsSdk>((resolve, reject) => {
			const finish = () => {
				const sdk = window.kakao;
				if (sdk === undefined) {
					reject(new KakaoMapError("script-load-failed"));
					return;
				}

				try {
					sdk.maps.load(() => resolve(sdk));
				} catch (cause) {
					console.error("[kakao-map] kakao.maps.load 가 실패했습니다", cause);
					reject(new KakaoMapError("script-load-failed"));
				}
			};

			const rejectOnError = (element: HTMLElement) => () => {
				element.dataset.loadFailed = "true";
				reject(new KakaoMapError("script-load-failed"));
			};

			if (window.kakao !== undefined) {
				finish();
				return;
			}

			const existing = document.getElementById(SCRIPT_ELEMENT_ID);

			if (existing !== null) {
				if (existing.dataset.loadFailed === "true") {
					reject(new KakaoMapError("script-load-failed"));
					return;
				}

				existing.addEventListener("load", finish, { once: true });
				existing.addEventListener("error", rejectOnError(existing), { once: true });
				return;
			}

			const script = document.createElement("script");

			script.id = SCRIPT_ELEMENT_ID;
			script.src = buildKakaoMapSdkUrl(appkey);
			script.async = true;
			script.addEventListener("load", finish, { once: true });
			script.addEventListener("error", rejectOnError(script), { once: true });

			document.head.appendChild(script);
		});
	}

	public readonly sdk: KakaoMapsSdk;
	public readonly map: KakaoMapInstance;

	private readonly container: HTMLElement;
	private readonly pins = new Map<string, SyncedPin>();
	private readonly clusterer: KakaoMarkerClustererInstance | null;

	private observer: ResizeObserver | null = null;
	private onMarkerClick: MarkerClickHandler | undefined = undefined;
	private selectedId: string | null = null;
	private myPosition: KakaoCustomOverlayInstance | null = null;

	private constructor(sdk: KakaoMapsSdk, container: HTMLElement, view: KakaoMapViewOptions) {
		const center = toLatLng(sdk, view.center);

		this.sdk = sdk;
		this.container = container;
		this.map = new sdk.maps.Map(container, {
			center,
			level: view.level,
			keyboardShortcuts: true
		});
		this.clusterer =
			view.cluster === undefined
				? null
				: new sdk.maps.MarkerClusterer({
						map: this.map,
						minLevel: view.cluster.minLevel,
						averageCenter: true,
						styles: CLUSTER_STYLES,
						texts: formatClusterText
					});

		this.observeResize();
	}

	public moveTo(center: KakaoLatLngLiteral) {
		this.map.setCenter(toLatLng(this.sdk, center));
	}

	public setLevel(level: number) {
		this.map.setLevel(level);
	}

	/** 넘긴 좌표가 전부 보이도록 중심과 배율을 한 번에 맞춘다. 좌표가 하나면 배율은 그대로 두고 중심만 옮긴다 */
	public fitToPositions(positions: readonly KakaoLatLngLiteral[], paddingPx: number) {
		const first = positions[0];
		if (first === undefined) {
			return;
		}

		if (positions.length === 1) {
			this.moveTo(first);
			return;
		}

		const bounds = new this.sdk.maps.LatLngBounds();
		for (const position of positions) {
			bounds.extend(toLatLng(this.sdk, position));
		}

		this.map.setBounds(bounds, paddingPx, paddingPx, paddingPx, paddingPx);
	}

	public setMarkerClickHandler(handler: MarkerClickHandler | undefined) {
		this.onMarkerClick = handler;
	}

	public setSelectedMarker(id: string | null) {
		if (this.selectedId === id) {
			return;
		}

		const previous = this.selectedId === null ? undefined : this.pins.get(this.selectedId);
		if (previous !== undefined) {
			previous.element.setAttribute("aria-pressed", "false");
			previous.overlay.setZIndex(PIN_Z_INDEX);
		}

		const next = id === null ? undefined : this.pins.get(id);
		if (next !== undefined) {
			next.element.setAttribute("aria-pressed", "true");
			next.overlay.setZIndex(SELECTED_PIN_Z_INDEX);
		}

		this.selectedId = id;
	}

	public setMyPosition(position: KakaoLatLngLiteral | null) {
		if (position === null) {
			this.myPosition?.setMap(null);
			this.myPosition = null;
			return;
		}

		const latLng = toLatLng(this.sdk, position);
		if (this.myPosition === null) {
			this.myPosition = new this.sdk.maps.CustomOverlay({
				map: this.map,
				position: latLng,
				content: getMyPositionElement(),
				zIndex: MY_POSITION_Z_INDEX
			});
			return;
		}

		this.myPosition.setPosition(latLng);
	}

	public syncMarkers(markers: readonly KakaoMarkerData[]) {
		const nextIds = new Set(markers.map((marker) => marker.id));

		for (const [id, synced] of this.pins) {
			if (!nextIds.has(id)) {
				this.removePin(id, synced);
			}
		}

		for (const marker of markers) {
			const synced = this.pins.get(marker.id);

			if (synced === undefined) {
				this.pins.set(marker.id, this.createPin(marker));
				continue;
			}

			if (!isSamePosition(synced.data.position, marker.position)) {
				synced.overlay.setPosition(toLatLng(this.sdk, marker.position));
			}

			if (!isSamePinData(synced.data, marker)) {
				this.removePin(marker.id, synced);
				this.pins.set(marker.id, this.createPin(marker));
				continue;
			}

			synced.data = marker;
		}

		this.clusterer?.redraw();
	}

	public detach() {
		for (const [id, synced] of this.pins) {
			this.removePin(id, synced);
		}

		this.setMyPosition(null);
		this.clusterer?.setMap(null);
		this.observer?.disconnect();
		this.observer = null;
		KakaoMapSession.attached.delete(this.container);
	}

	private createPin(marker: KakaoMarkerData) {
		const element = buildPinElement(marker);
		element.setAttribute("aria-pressed", String(marker.id === this.selectedId));

		const overlay = new this.sdk.maps.CustomOverlay({
			position: toLatLng(this.sdk, marker.position),
			content: element,
			yAnchor: 1,
			zIndex: marker.id === this.selectedId ? SELECTED_PIN_Z_INDEX : PIN_Z_INDEX,
			clickable: true
		});

		const markerId = marker.id;
		const listener = () => {
			this.onMarkerClick?.(markerId);
		};
		element.addEventListener("click", listener);

		if (this.clusterer === null) {
			overlay.setMap(this.map);
		} else {
			this.clusterer.addMarker(overlay, true);
		}

		return {
			overlay,
			element,
			listener,
			data: marker
		};
	}

	private removePin(id: string, synced: SyncedPin) {
		synced.element.removeEventListener("click", synced.listener);

		if (this.clusterer === null) {
			synced.overlay.setMap(null);
		} else {
			this.clusterer.removeMarker(synced.overlay, true);
		}

		this.pins.delete(id);
	}

	private observeResize() {
		if (this.observer !== null) {
			return;
		}

		const observer = new ResizeObserver(() => {
			this.map.relayout();
		});

		observer.observe(this.container);
		this.observer = observer;
	}
}
