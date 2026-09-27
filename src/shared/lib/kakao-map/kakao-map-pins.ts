"use client";

import type { KakaoClusterStyle } from "./kakao-map-sdk";
import type { KakaoMarkerData } from "./kakao-map-session";

const SELECTED_PIN_ICON_PATH = "/pins/selected.svg";

const PIN_CLASS = "group relative flex size-10 cursor-pointer items-center justify-center";
const PIN_CIRCLE_CLASS =
	"flex size-6 items-center justify-center rounded-full border-2 border-text-2 bg-bg-3 group-aria-pressed:size-10 group-aria-pressed:border-0 group-aria-pressed:bg-primary group-aria-pressed:shadow-floating";
const PIN_DOT_CLASS = "size-3 rounded-full bg-icon group-aria-pressed:hidden";
const PIN_ICON_CLASS = "hidden size-5 group-aria-pressed:block";
const LABEL_CLASS = "absolute top-full left-1/2 -translate-x-1/2 rounded-xl px-3 py-1 whitespace-nowrap";
const PIN_LABEL_CLASS = `${LABEL_CLASS} bg-bg-1/50 text-b1-14 text-text-1 shadow-floating backdrop-blur-xs group-aria-pressed:mt-2 group-aria-pressed:backdrop-blur-sm group-aria-pressed:text-primary group-aria-pressed:shadow-on-map`;
const CLUSTER_CLASS =
	"relative flex size-7 cursor-pointer items-center justify-center rounded-xl border border-primary-strong bg-bg-3/50 text-b2-12 text-primary shadow-floating";
const CLUSTER_LABEL_CLASS = `${LABEL_CLASS} mt-2 bg-bg-1/50 text-b2-12 text-primary shadow-on-map backdrop-blur-sm`;

/** 클러스터러가 content 요소에 이 값을 인라인 스타일로 넣는다. 모양은 `fillClusterElement`가 클래스로 준다 */
export const CLUSTER_STYLES: KakaoClusterStyle[] = [{ width: "28px", height: "28px" }];

export function formatClusterText(size: number) {
	return `+${String(size - 1)}`;
}

export function buildPinElement(marker: KakaoMarkerData) {
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
		label.className = PIN_LABEL_CLASS;
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
		labelElement.className = CLUSTER_LABEL_CLASS;
		labelElement.textContent = label;
		element.appendChild(labelElement);
	}
}

function buildMyPositionElement() {
	const root = document.createElement("div");
	root.className = "relative flex size-6 items-center justify-center";
	root.setAttribute("aria-hidden", "true");

	const ring = document.createElement("span");
	ring.className = "absolute inset-0 animate-ping rounded-full bg-primary/40";

	const dot = document.createElement("span");
	dot.className = "relative size-3.5 rounded-full border-2 border-bg-1 bg-primary shadow-floating";

	root.append(ring, dot);

	return root;
}

let myPositionTemplate: HTMLElement | null = null;

export function createMyPositionElement() {
	myPositionTemplate ??= buildMyPositionElement();
	return myPositionTemplate.cloneNode(true) as HTMLElement;
}
