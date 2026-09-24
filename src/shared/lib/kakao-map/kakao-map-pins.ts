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

/**
 * SDK가 클러스터 모양을 인라인 스타일 객체로만 받는다. 클래스를 넘길 자리가 없어
 * 색과 글자 크기는 globals.css의 CSS 변수를 읽고 크기와 그림자만 여기 적는다.
 */
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

/**
 * 핀 하나의 DOM. 아이콘이 위, 라벨이 아래다. 클릭 리스너는 세션이 건다.
 * 접근성 트리에서 빼고 마우스 전용으로 둔다. 키보드와 스크린리더 경로는 부르는 쪽이 같은 팝업 목록으로 따로 낸다.
 * 핀의 탭 순서는 오버레이 삽입 순서라 화면 위치와 무관하고 클러스터에 묶이면 DOM에서 빠지기 때문이다.
 */
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

/** 서버에서 import돼도 DOM을 만들지 않게 지연시킨다. 세션이 브라우저에서 처음 쓸 때 만든다 */
let myPositionTemplate: HTMLElement | null = null;

export function getMyPositionElement() {
	myPositionTemplate ??= buildMyPositionElement();

	return myPositionTemplate.cloneNode(true) as HTMLElement;
}
