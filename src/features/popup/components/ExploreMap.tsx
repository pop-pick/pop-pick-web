"use client";

import { useState } from "react";

import type { KakaoBoundsLiteral, KakaoLatLngLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";
import { Button } from "@/shared/ui/Button";

import { useMapPopups } from "../hooks/useMapPopups";
import { buildMapEmptyMessage } from "../model/explore-empty-message";
import type { PositionStatus } from "../model/position-status";
import { PopupMap } from "./PopupMap";

const LOAD_FAILURE_TITLE = "팝업을 불러오지 못했어요.";

interface ExploreMapProps {
	keyword: string;
	position: KakaoLatLngLiteral | null;
	positionStatus: PositionStatus;
	onLocate: () => Promise<KakaoLatLngLiteral | null>;
	buildSheetHref: (popupId: number) => string;
	onSwitchToList: () => void;
}

export function ExploreMap({ keyword, ...mapProps }: ExploreMapProps) {
	const [bounds, setBounds] = useState<KakaoBoundsLiteral | null>(null);
	const { popups, markers, isPending, isEmpty, error, retry } = useMapPopups(keyword, bounds);
	const notice = buildMapEmptyMessage(keyword);
	const isFailed = error !== null;
	const hasNotice = !isFailed && isEmpty;

	const buildResultAnnouncement = () => {
		if (isFailed) {
			return LOAD_FAILURE_TITLE;
		}

		if (isPending) {
			return "";
		}

		return hasNotice ? `${notice.title} ${notice.description}` : `팝업 ${String(popups.length)}곳`;
	};

	return (
		<>
			<p role="status" className="sr-only">
				{buildResultAnnouncement()}
			</p>
			{isFailed && (
				<div className="absolute inset-x-5 top-4 z-10 flex flex-col items-center gap-3 rounded-xl bg-bg-1 px-4 py-3 text-center shadow-floating">
					<p className="text-b1-14 text-text-1">{LOAD_FAILURE_TITLE}</p>
					<Button variant="secondary" onClick={retry}>
						다시 시도
					</Button>
				</div>
			)}
			{!isFailed && isPending && (
				<p className="pointer-events-none absolute inset-x-5 top-4 z-10 rounded-xl bg-bg-1 px-4 py-3 text-center text-b3-12 text-text-4 shadow-floating">
					지도에 팝업을 불러오고 있어요
				</p>
			)}
			{hasNotice && (
				<div className="pointer-events-none absolute inset-x-5 top-4 z-10 flex flex-col gap-1 rounded-xl bg-bg-1 px-4 py-3 text-center shadow-floating">
					<p className="text-b1-14 text-text-1">{notice.title}</p>
					<p className="text-b3-12 whitespace-pre-line text-text-4">{notice.description}</p>
				</div>
			)}
			<PopupMap keyword={keyword} popups={popups} markers={markers} onBoundsChange={setBounds} {...mapProps} />
		</>
	);
}
