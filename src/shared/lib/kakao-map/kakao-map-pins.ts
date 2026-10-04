import { tv } from "@/shared/lib/tv";

import type { KakaoClusterStyle } from "./kakao-map-sdk";
import type { KakaoMarkerData } from "./kakao-map-session";

const SELECTED_PIN_ICON_PATH = "/images/pins/selected.svg";
const PIN_BOTTOM_Y_ANCHOR = 1;
const ICON_PIN_Y_ANCHOR = 0.5;

const PIN_CLASS = "group relative flex size-10 cursor-pointer items-center justify-center";
const PIN_CIRCLE_CLASS =
	"flex size-6 items-center justify-center rounded-full border-2 border-text-2 bg-bg-3 group-aria-pressed:size-10 group-aria-pressed:border-0 group-aria-pressed:bg-primary group-aria-pressed:shadow-control";
const PIN_DOT_CLASS = "size-3 rounded-full bg-icon group-aria-pressed:hidden";
const PIN_ICON_CLASS = "hidden size-5 group-aria-pressed:block";
const ICON_PIN_CLASS = "flex size-10 items-center justify-center rounded-full bg-bg-1 shadow-control";
const ICON_PIN_ICON_CLASS = "size-5";
const CLUSTER_CLASS =
	"relative flex size-7 cursor-pointer items-center justify-center rounded-xl border border-primary-strong bg-bg-3/50 text-b2-12 text-primary shadow-control";

const markerLabelVariants = tv({
	base: "absolute top-full left-1/2 -translate-x-1/2 rounded-xl bg-bg-1/50 px-3 py-1 whitespace-nowrap",
	variants: {
		kind: {
			pin: "text-b1-14 text-text-1 shadow-control backdrop-blur-xs group-aria-pressed:mt-2 group-aria-pressed:py-0 group-aria-pressed:leading-8 group-aria-pressed:text-primary group-aria-pressed:shadow-on-map group-aria-pressed:backdrop-blur-sm",
			cluster: "mt-2 text-b2-12 text-primary shadow-on-map backdrop-blur-sm"
		}
	}
});

/** 클러스터러가 content 요소에 이 값을 인라인 스타일로 넣는다. 모양은 `fillClusterElement`가 클래스로 준다 */
export const CLUSTER_STYLES: KakaoClusterStyle[] = [{ width: "28px", height: "28px" }];

export function formatClusterText(size: number) {
	return `+${String(size - 1)}`;
}

export function resolvePinYAnchor(marker: KakaoMarkerData) {
	return marker.variant === "icon" ? ICON_PIN_Y_ANCHOR : PIN_BOTTOM_Y_ANCHOR;
}

function buildIconPinElement(marker: KakaoMarkerData) {
	if (marker.iconUrl === undefined) {
		throw new Error(`[kakao-map] icon 핀에 iconUrl이 없다: ${marker.id}`);
	}

	const root = document.createElement("div");
	root.className = ICON_PIN_CLASS;
	root.setAttribute("aria-hidden", "true");
	root.title = marker.title;

	const icon = document.createElement("img");
	icon.src = marker.iconUrl;
	icon.alt = "";
	icon.className = ICON_PIN_ICON_CLASS;

	root.appendChild(icon);

	return root;
}

export function buildPinElement(marker: KakaoMarkerData) {
	if (marker.variant === "icon") {
		return buildIconPinElement(marker);
	}

	const root = document.createElement("div");
	root.className = PIN_CLASS;
	root.setAttribute("aria-hidden", "true");
	root.title = marker.title;

	const circle = document.createElement("span");
	circle.className = PIN_CIRCLE_CLASS;

	const dot = document.createElement("span");
	dot.className = PIN_DOT_CLASS;

	const icon = document.createElement("img");
	icon.src = SELECTED_PIN_ICON_PATH;
	icon.alt = "";
	icon.className = PIN_ICON_CLASS;

	circle.append(dot, icon);
	root.appendChild(circle);

	if (marker.label !== undefined) {
		const label = document.createElement("span");
		label.className = markerLabelVariants({ kind: "pin" });
		label.textContent = marker.label;
		root.appendChild(label);
	}

	return root;
}

export function fillClusterElement(element: HTMLElement, size: number, label: string | undefined) {
	element.className = CLUSTER_CLASS;
	element.setAttribute("aria-hidden", "true");
	element.textContent = formatClusterText(size);

	if (label !== undefined) {
		const labelElement = document.createElement("span");
		labelElement.className = markerLabelVariants({ kind: "cluster" });
		labelElement.textContent = label;
		element.appendChild(labelElement);
	}
}

function buildMyPositionTemplate() {
	const root = document.createElement("div");
	root.className = "relative flex size-6 items-center justify-center";
	root.setAttribute("aria-hidden", "true");

	const ring = document.createElement("span");
	ring.className = "absolute inset-0 rounded-full bg-primary/40 motion-safe:animate-ping";

	const dot = document.createElement("span");
	dot.className = "relative size-3.5 rounded-full border-2 border-bg-1 bg-primary shadow-floating";

	root.append(ring, dot);

	return root;
}

let myPositionTemplate: HTMLElement | null = null;

export function createMyPositionElement() {
	myPositionTemplate ??= buildMyPositionTemplate();
	return myPositionTemplate.cloneNode(true) as HTMLElement;
}
