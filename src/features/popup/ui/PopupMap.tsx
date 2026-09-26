"use client";

import { type FocusEvent, useMemo, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";
import type { KakaoLatLngLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";
import { KakaoMap } from "@/shared/lib/kakao-map/KakaoMap";
import { KakaoMapCamera } from "@/shared/lib/kakao-map/KakaoMapCamera";
import type { PopupCardItem } from "@/shared/model/popup";
import { type Region, REGION_LABELS } from "@/shared/model/region";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { IconButton } from "@/shared/ui/IconButton";
import { LinkButton } from "@/shared/ui/LinkButton";
import { PopupCard } from "@/shared/ui/PopupCard";

import type { PositionStatus } from "../hooks/useCurrentPosition";
import { PLACEHOLDER_NOTICE, toPlaceholderMarkers } from "../model/placeholder-markers";
import { CurrentLocationButton } from "./CurrentLocationButton";

const CLUSTER_MIN_LEVEL = 5;
const MY_POSITION_LEVEL = 5;
const PICKED_POPUP_LEVEL = 4;

const POSITION_NOTICES: Partial<Record<PositionStatus, string>> = {
	denied: "위치 권한을 거부해 서울 기본 위치를 보여줍니다",
	unavailable: "이 브라우저에서는 현재 위치를 쓸 수 없습니다"
};

interface PopupMapProps {
	popups: readonly PopupCardItem[];
	region: Region | null;
	position: KakaoLatLngLiteral | null;
	positionStatus: PositionStatus;
	onLocate: () => Promise<KakaoLatLngLiteral | null>;
	onSwitchToList: () => void;
}

export function PopupMap({ popups, region, position, positionStatus, onLocate, onSwitchToList }: PopupMapProps) {
	const [selectedPopupId, setSelectedPopupId] = useState<number | null>(null);
	const [manualTarget, setManualTarget] = useState<KakaoLatLngLiteral | null>(null);
	const [isListRevealed, setIsListRevealed] = useState(false);
	const locationButtonRef = useRef<HTMLButtonElement | null>(null);

	const markers = useMemo(() => toPlaceholderMarkers(popups), [popups]);
	const positions = useMemo(() => markers.map((marker) => marker.position), [markers]);
	const selectedPopup = popups.find((popup) => popup.id === selectedPopupId) ?? null;
	const positionNotice = POSITION_NOTICES[positionStatus];

	const cameraTarget = manualTarget ?? (region === null ? position : null);
	const cameraLevel = manualTarget === null ? MY_POSITION_LEVEL : PICKED_POPUP_LEVEL;

	const handleMarkerClick = (markerId: string) => {
		setSelectedPopupId(Number(markerId));
	};

	const handleLocate = () => {
		void onLocate().then((found) => {
			if (found !== null) {
				setManualTarget(found);
			}
		});
	};

	const handleSelectionClose = () => {
		setSelectedPopupId(null);
		locationButtonRef.current?.focus();
	};

	const handleListFocus = () => {
		setIsListRevealed(true);
	};

	const handleListBlur = (event: FocusEvent<HTMLUListElement>) => {
		if (!event.currentTarget.contains(event.relatedTarget)) {
			setIsListRevealed(false);
		}
	};

	const handleListItemClick = (popup: PopupCardItem) => () => {
		setSelectedPopupId(popup.id);
		const marker = markers.find((candidate) => candidate.id === String(popup.id));
		if (marker !== undefined) {
			setManualTarget({ ...marker.position });
		}
	};

	if (popups.length === 0) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
				<EmptyState
					title="지도에 보여줄 팝업이 없어요"
					description={
						region === null ? "조건에 맞는 팝업을 찾지 못했어요" : `${REGION_LABELS[region]}에 진행 중인 팝업이 없어요`
					}
					action={region === null ? undefined : <LinkButton href="/explore">전체 보기</LinkButton>}
				/>
			</div>
		);
	}

	return (
		<div className="relative flex flex-1">
			<KakaoMap
				fitTo={positions}
				markers={markers}
				selectedMarkerId={selectedPopup === null ? null : String(selectedPopup.id)}
				myPosition={position}
				initialCluster={{ minLevel: CLUSTER_MIN_LEVEL }}
				onMarkerClick={handleMarkerClick}
				label={`팝업 지도, ${String(popups.length)}곳`}
				className="flex-1 rounded-none"
				errorAction={
					<Button variant="secondary" onClick={onSwitchToList}>
						목록으로 보기
					</Button>
				}
			>
				<KakaoMapCamera center={cameraTarget} level={cameraLevel} />

				<div className="pointer-events-none absolute inset-x-0 top-0 p-3">
					<p className="inline-block rounded-full bg-background/90 px-3 py-1 text-xs text-zinc-600 shadow-sm">
						{PLACEHOLDER_NOTICE}
					</p>
				</div>

				<div
					className={cn("pointer-events-none absolute right-0 p-3", selectedPopup === null ? "bottom-0" : "bottom-36")}
				>
					<CurrentLocationButton
						ref={locationButtonRef}
						status={positionStatus}
						onLocate={handleLocate}
						className="pointer-events-auto"
					/>
				</div>

				{positionNotice === undefined || selectedPopup !== null ? null : (
					<p
						role="status"
						className="pointer-events-none absolute bottom-3 left-3 max-w-56 rounded-full bg-background/90 px-3 py-1 text-xs text-zinc-600 shadow-sm"
					>
						{positionNotice}
					</p>
				)}

				{selectedPopup === null ? null : (
					<section
						aria-live="polite"
						aria-label="선택한 팝업"
						className="pointer-events-none absolute inset-x-0 bottom-0 p-3"
					>
						<div className="pointer-events-auto relative">
							<PopupCard popup={selectedPopup} className="pr-12 shadow-lg" />
							<IconButton
								label="선택한 팝업 닫기"
								variant="ghost"
								onClick={handleSelectionClose}
								className="absolute top-2 right-2"
							>
								<svg
									viewBox="0 0 24 24"
									aria-hidden
									className="size-4"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
								</svg>
							</IconButton>
						</div>
					</section>
				)}

				<ul
					aria-label="지도에 표시한 팝업"
					onFocus={handleListFocus}
					onBlur={handleListBlur}
					className={cn(
						isListRevealed
							? "absolute inset-x-3 bottom-3 max-h-48 overflow-y-auto rounded-2xl bg-background p-2 shadow-lg"
							: "sr-only"
					)}
				>
					{popups.map((popup) => (
						<li key={popup.id}>
							<button
								type="button"
								aria-pressed={popup.id === selectedPopupId}
								onClick={handleListItemClick(popup)}
								className="w-full rounded-lg px-3 py-2 text-left text-sm focus-ring hover:bg-zinc-50 aria-pressed:bg-blue-50 aria-pressed:text-blue-700"
							>
								{popup.name}, {REGION_LABELS[popup.region]}
							</button>
						</li>
					))}
				</ul>
			</KakaoMap>
		</div>
	);
}
