"use client";

import type { KakaoLatLngLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";
import { Button } from "@/shared/ui/Button";

import { usePopupsForMap } from "../hooks/usePopupsForMap";
import { buildExploreEmptyMessage } from "../model/explore-empty-message";
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
	const { popups, markers, isPending, isEmpty, error, retry } = usePopupsForMap(keyword);
	const emptyMessage = buildExploreEmptyMessage(keyword);
	const isFailed = error !== null;

	const buildResultAnnouncement = () => {
		if (isFailed) {
			return LOAD_FAILURE_TITLE;
		}

		if (isPending) {
			return "";
		}

		return isEmpty ? `${emptyMessage.title} ${emptyMessage.description}` : `팝업 ${String(popups.length)}곳`;
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
			{!isFailed && isEmpty && (
				<div className="pointer-events-none absolute inset-x-5 top-4 z-10 flex flex-col gap-1 rounded-xl bg-bg-1 px-4 py-3 text-center shadow-floating">
					<p className="text-b1-14 text-text-1">{emptyMessage.title}</p>
					<p className="text-b3-12 whitespace-pre-line text-text-4">{emptyMessage.description}</p>
				</div>
			)}
			<PopupMap popups={popups} markers={markers} {...mapProps} />
		</>
	);
}
