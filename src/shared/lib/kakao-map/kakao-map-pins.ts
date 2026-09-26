"use client";

import type { KakaoClusterStyle } from "./kakao-map-sdk";
import type { KakaoMarkerData } from "./kakao-map-session";

const PIN_CLASS = "group flex cursor-pointer flex-col items-center gap-0.5";
const ICON_WRAP_CLASS =
	"flex size-8 items-center justify-center rounded-full border-2 border-white bg-white shadow-md transition-transform group-aria-pressed:scale-125 group-aria-pressed:border-blue-600";
const ICON_IMAGE_CLASS = "size-5";
const DEFAULT_DOT_CLASS = "size-3 rounded-full bg-blue-600";
const LABEL_CLASS =
	"max-w-24 truncate rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium text-zinc-800 shadow-sm group-aria-pressed:bg-blue-600 group-aria-pressed:text-white";

export const CLUSTER_STYLES: KakaoClusterStyle[] = [
	{
		width: "40px",
		height: "40px",
		background: "var(--primary)",
		border: "2px solid var(--background)",
		borderRadius: "20px",
		boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
		color: "var(--background)",
		fontSize: "var(--text-sm)",
		fontWeight: "600",
		lineHeight: "36px",
		textAlign: "center"
	}
];

export function formatClusterText(size: number) {
	return `+${String(size)}`;
}

function buildIcon(iconUrl: string | undefined) {
	const wrap = document.createElement("div");
	wrap.className = ICON_WRAP_CLASS;

	if (iconUrl === undefined) {
		const dot = document.createElement("span");
		dot.className = DEFAULT_DOT_CLASS;
		wrap.appendChild(dot);

		return wrap;
	}

	const image = document.createElement("img");
	image.src = iconUrl;
	image.alt = "";
	image.className = ICON_IMAGE_CLASS;
	wrap.appendChild(image);

	return wrap;
}

export function buildPinElement(marker: KakaoMarkerData) {
	const root = document.createElement("div");
	root.className = PIN_CLASS;
	root.setAttribute("aria-hidden", "true");
	root.title = marker.title;
	root.appendChild(buildIcon(marker.iconUrl));

	if (marker.label !== undefined) {
		const label = document.createElement("span");
		label.className = LABEL_CLASS;
		label.textContent = marker.label;
		root.appendChild(label);
	}

	return root;
}

function buildMyPositionElement() {
	const root = document.createElement("div");
	root.className = "relative flex size-6 items-center justify-center";
	root.setAttribute("aria-hidden", "true");

	const ring = document.createElement("span");
	ring.className = "absolute inset-0 animate-ping rounded-full bg-blue-400/40";

	const dot = document.createElement("span");
	dot.className = "relative size-3.5 rounded-full border-2 border-white bg-blue-600 shadow-md";

	root.append(ring, dot);

	return root;
}

let myPositionTemplate: HTMLElement | null = null;

export function getMyPositionElement() {
	myPositionTemplate ??= buildMyPositionElement();
	return myPositionTemplate.cloneNode(true) as HTMLElement;
}
