import { KakaoMapError } from "./kakao-map-error";
import type { KakaoMapInstance, KakaoMapsSdk, KakaoMarkerInstance } from "./kakao-map-sdk";
import type { KakaoLatLngLiteral } from "./kakao-map-utils";
import { buildKakaoMapSdkUrl, isSamePosition, readKakaoMapKey, toLatLng } from "./kakao-map-utils";

export type KakaoMarkerData = {
	id: string;
	position: KakaoLatLngLiteral;
	title?: string;
};

export type KakaoMapViewOptions = {
	/** 지도를 만들 때 한 번만 쓰는 시점. 이후 변경은 moveTo 와 setLevel 로 한다 */
	center: KakaoLatLngLiteral;
	level: number;
};

type MarkerClickHandler = (markerId: string) => void;

type SyncedMarker = {
	instance: KakaoMarkerInstance;
	listener: () => void;
	position: KakaoLatLngLiteral;
	title: string | undefined;
};

const SCRIPT_ELEMENT_ID = "kakao-map-sdk";

export class KakaoMapSession {
	private static sdkPromise: Promise<KakaoMapsSdk> | null = null;
	private static attached = new WeakMap<HTMLElement, KakaoMapSession>();

	public static load() {
		KakaoMapSession.sdkPromise ??= KakaoMapSession.loadScript();
		return KakaoMapSession.sdkPromise;
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

			const failOn = (element: HTMLElement) => () => {
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
				existing.addEventListener("error", failOn(existing), { once: true });
				return;
			}

			const script = document.createElement("script");

			script.id = SCRIPT_ELEMENT_ID;
			script.src = buildKakaoMapSdkUrl(appkey);
			script.async = true;
			script.addEventListener("load", finish, { once: true });
			script.addEventListener("error", failOn(script), { once: true });

			document.head.appendChild(script);
		});
	}

	public readonly sdk: KakaoMapsSdk;
	public readonly map: KakaoMapInstance;

	private readonly container: HTMLElement;
	private readonly markers = new Map<string, SyncedMarker>();

	private observer: ResizeObserver | null = null;
	private onMarkerClick: MarkerClickHandler | undefined = undefined;

	private constructor(sdk: KakaoMapsSdk, container: HTMLElement, view: KakaoMapViewOptions) {
		const center = toLatLng(sdk, view.center);

		this.sdk = sdk;
		this.container = container;
		this.map = new sdk.maps.Map(container, {
			center,
			level: view.level,
			keyboardShortcuts: true
		});

		this.observeResize();
	}

	public moveTo(center: KakaoLatLngLiteral) {
		this.map.setCenter(toLatLng(this.sdk, center));
	}

	public setLevel(level: number) {
		this.map.setLevel(level);
	}

	public setMarkerClickHandler(handler: MarkerClickHandler | undefined) {
		this.onMarkerClick = handler;
	}

	public syncMarkers(markers: readonly KakaoMarkerData[]) {
		const nextIds = new Set(markers.map((marker) => marker.id));

		for (const [id, synced] of this.markers) {
			if (!nextIds.has(id)) {
				this.removeMarker(id, synced);
			}
		}

		for (const marker of markers) {
			const synced = this.markers.get(marker.id);

			if (synced === undefined) {
				this.markers.set(marker.id, this.createMarker(marker));
				continue;
			}

			if (!isSamePosition(synced.position, marker.position)) {
				synced.instance.setPosition(toLatLng(this.sdk, marker.position));
				synced.position = marker.position;
			}

			if (synced.title !== marker.title) {
				synced.instance.setTitle(marker.title ?? "");
				synced.title = marker.title;
			}
		}
	}

	public detach() {
		for (const [id, synced] of this.markers) {
			this.removeMarker(id, synced);
		}

		this.observer?.disconnect();
		this.observer = null;
	}

	private createMarker(marker: KakaoMarkerData) {
		const position = toLatLng(this.sdk, marker.position);
		const instance = new this.sdk.maps.Marker({
			map: this.map,
			position,
			title: marker.title,
			clickable: true
		});

		const listener = () => {
			this.onMarkerClick?.(marker.id);
		};

		this.sdk.maps.event.addListener(instance, "click", listener);

		return {
			instance,
			listener,
			position: marker.position,
			title: marker.title
		};
	}

	private removeMarker(id: string, synced: SyncedMarker) {
		this.sdk.maps.event.removeListener(synced.instance, "click", synced.listener);
		synced.instance.setMap(null);
		this.markers.delete(id);
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
