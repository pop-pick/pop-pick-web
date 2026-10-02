import type { Metadata } from "next";

export const SITE_NAME = "팝픽 POP PICK";

const SHARE_COPY = "이젠 팝업 찾지 마세요. 오늘 갈 팝업 PICK 해드릴게요!";

export const SITE_OPEN_GRAPH = {
	type: "website",
	locale: "ko_KR",
	siteName: SITE_NAME,
	title: SITE_NAME,
	description: SHARE_COPY,
	images: [{ url: "/images/brand/og.png", width: 1200, height: 630, alt: SHARE_COPY }]
} satisfies Metadata["openGraph"];
