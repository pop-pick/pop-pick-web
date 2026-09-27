"use client";

import { type FocusEvent, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";
import type { KakaoLatLngLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";
import { KakaoMap } from "@/shared/lib/kakao-map/KakaoMap";
import { REGION_LABELS } from "@/shared/model/region";
import { Button } from "@/shared/ui/Button";

import type { PositionStatus } from "../hooks/useCurrentPosition";
import type { ExplorePopup } from "../model/explore-popup";
import { resolveMapView } from "../model/map-view";
import { toPopupMarkers } from "../model/popup-markers";
import { CurrentPositionButton } from "./CurrentPositionButton";
import { MapPopupCard } from "./MapPopupCard";

const CLUSTER_MIN_LEVEL = 5;
const MY_POSITION_LEVEL = 5;
const PICKED_POPUP_LEVEL = 4;

const POSITION_NOTICES: Partial<Record<PositionStatus, string>> = {
	denied: "위치 권한을 거부해 서울 기본 위치를 보여줍니다",
	unavailable: "이 브라우저에서는 현재 위치를 쓸 수 없습니다"
};

interface PopupMapProps {
	popups: readonly ExplorePopup[];
	position: KakaoLatLngLiteral | null;
	positionStatus: PositionStatus;
	onLocate: () => Promise<KakaoLatLngLiteral | null>;
	buildSheetHref: (popupId: number) => string;
	shouldFollowPosition: boolean;
	onSwitchToList: () => void;
}

export function PopupMap({
	popups,
	position,
	positionStatus,
	onLocate,
	buildSheetHref,
	shouldFollowPosition,
	onSwitchToList
}: PopupMapProps) {
	const [selectedPopupId, setSelectedPopupId] = useState<number | null>(null);
	const [manualTarget, setManualTarget] = useState<KakaoLatLngLiteral | null>(null);
	const [isListRevealed, setIsListRevealed] = useState(false);
	const positionButtonRef = useRef<HTMLButtonElement | null>(null);

	const markers = useMemo(() => toPopupMarkers(popups), [popups]);
	const positions = useMemo(() => markers.map((marker) => marker.position), [markers]);
	const selectedPopup = popups.find((popup) => popup.id === selectedPopupId) ?? null;
	const positionNotice = POSITION_NOTICES[positionStatus];
	const cameraTarget = manualTarget ?? (shouldFollowPosition ? position : null);
	const cameraLevel = manualTarget === null ? MY_POSITION_LEVEL : PICKED_POPUP_LEVEL;
	const viewProps = resolveMapView(cameraTarget, cameraLevel, positions);

	useEffect(() => {
		if (selectedPopup === null) {
			return;
		}

		const handleEscape = (event: KeyboardEvent) => {
			const isInsideDialog = event.target instanceof Element && event.target.closest("dialog[open]") !== null;

			if (event.key === "Escape" && !isInsideDialog) {
				setSelectedPopupId(null);
				positionButtonRef.current?.focus();
			}
		};

		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [selectedPopup]);

	const handleMarkerClick = (markerId: string) => {
		setSelectedPopupId(Number(markerId));
	};

	const handleMapClick = () => {
		setSelectedPopupId(null);
	};

	const handleCardClose = () => {
		setSelectedPopupId(null);
	};

	const handleLocate = () => {
		void onLocate().then((foundPosition) => {
			if (foundPosition !== null) {
				setManualTarget(foundPosition);
			}
		});
	};

	const handleListFocus = () => {
		setIsListRevealed(true);
	};

	const handleListBlur = (event: FocusEvent<HTMLUListElement>) => {
		if (!event.currentTarget.contains(event.relatedTarget)) {
			setIsListRevealed(false);
		}
	};

	const handleListItemClick = (popup: ExplorePopup) => () => {
		setSelectedPopupId(popup.id);

		if (popup.position !== null) {
			setManualTarget({ ...popup.position });
		}
	};

	return (
		<div className="relative flex flex-1">
			<KakaoMap
				{...viewProps}
				markers={markers}
				selectedMarkerId={selectedPopup === null ? null : String(selectedPopup.id)}
				myPosition={position}
				initialCluster={{ minLevel: CLUSTER_MIN_LEVEL }}
				onMarkerClick={handleMarkerClick}
				onMapClick={handleMapClick}
				label={`팝업 지도, ${String(markers.length)}곳`}
				className="flex-1 rounded-none"
				errorAction={
					<Button variant="secondary" onClick={onSwitchToList}>
						목록으로 보기
					</Button>
				}
			>
				<p role="status" className="sr-only">
					{selectedPopup === null ? "" : `${selectedPopup.title} 선택됨`}
				</p>

				<div className="pointer-events-none fixed inset-x-0 bottom-0 z-0 mx-auto flex max-w-app flex-col">
					<div className="flex items-center gap-2 px-5 pb-6">
						<CurrentPositionButton
							ref={positionButtonRef}
							status={positionStatus}
							onLocate={handleLocate}
							className="pointer-events-auto"
						/>
						<p
							role="status"
							className={cn(
								"rounded-full bg-bg-1/90 px-3 py-1 text-b3-12 text-text-4 shadow-floating",
								(positionNotice === undefined || selectedPopup !== null) && "sr-only"
							)}
						>
							{positionNotice}
						</p>
					</div>
					{selectedPopup === null ? (
						<div className="h-tab-bar-clearance" />
					) : (
						<MapPopupCard popup={selectedPopup} href={buildSheetHref(selectedPopup.id)} onClose={handleCardClose} />
					)}
				</div>

				<ul
					aria-label="지도에 표시한 팝업"
					onFocus={handleListFocus}
					onBlur={handleListBlur}
					className={cn(
						isListRevealed
							? "absolute inset-x-5 top-4 max-h-48 overflow-y-auto rounded-2xl bg-bg-1 p-2 shadow-floating"
							: "sr-only"
					)}
				>
					{popups.map((popup) => (
						<li key={popup.id}>
							<button
								type="button"
								aria-pressed={popup.id === selectedPopupId}
								onClick={handleListItemClick(popup)}
								className="w-full rounded-lg px-3 py-2 text-left text-b3-14 text-text-2 focus-ring hover:bg-bg-2 aria-pressed:bg-primary-subtle aria-pressed:text-primary"
							>
								{popup.region === null ? popup.title : `${popup.title}, ${REGION_LABELS[popup.region]}`}
							</button>
						</li>
					))}
				</ul>
			</KakaoMap>
		</div>
	);
}
