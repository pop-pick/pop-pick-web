import type { Metadata } from "next";

import { SITE_OPEN_GRAPH } from "@/shared/model/site-metadata";

import type { PopupDetail } from "./popup-detail";

export function buildPopupMetadata(detail: PopupDetail) {
	const metadata: Metadata = {
		title: detail.title,
		description: detail.description,
		openGraph: {
			...SITE_OPEN_GRAPH,
			title: detail.title,
			description: detail.description ?? SITE_OPEN_GRAPH.description,
			images: detail.imageUrl ?? SITE_OPEN_GRAPH.images
		}
	};

	return metadata;
}
