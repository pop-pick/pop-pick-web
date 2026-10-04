import { animate, useMotionValue, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { KakaoMarkerData } from "@/shared/lib/kakao-map/kakao-map-session";
import { type KakaoBoundsLiteral, type KakaoLatLngLiteral, SEOUL_CENTER } from "@/shared/lib/kakao-map/kakao-map-utils";
import { KakaoMap } from "@/shared/lib/kakao-map/KakaoMap";
import { tv } from "@/shared/lib/tv";
import { Button } from "@/shared/ui/Button";

import type { ExplorePopup } from "../model/explore-popup";
import { POSITION_STATUS_NOTICES, type PositionStatus } from "../model/position-status";
import { CARD_SLIDE_TRANSITION } from "../model/slide-motion";
import { CurrentPositionButton } from "./CurrentPositionButton";
import { MapPopupCard } from "./MapPopupCard";
import { SelectedPinReveal } from "./SelectedPinReveal";

const CLUSTER_MIN_LEVEL = 5;
const MY_POSITION_LEVEL = 5;
const MANUAL_TARGET_LEVEL = 4;
const SEOUL_OVERVIEW_LEVEL = 8;

const positionNoticeVariants = tv({
	base: "rounded-2xl bg-bg-1/90 px-3 py-1 text-b3-12 break-keep text-text-4 shadow-floating",
	variants: {
		isHidden: {
			true: "sr-only"
		}
	}
});

interface PopupMapProps {
	keyword: string;
	popups: readonly ExplorePopup[];
	markers: readonly KakaoMarkerData[];
	position: KakaoLatLngLiteral | null;
	positionStatus: PositionStatus;
	onLocate: () => Promise<KakaoLatLngLiteral | null>;
	buildSheetHref: (popupId: number) => string;
	onSwitchToList: () => void;
	onBoundsChange: (bounds: KakaoBoundsLiteral) => void;
}

export function PopupMap({
	keyword,
	popups,
	markers,
	position,
	positionStatus,
	onLocate,
	buildSheetHref,
	onSwitchToList,
	onBoundsChange
}: PopupMapProps) {
	const [selection, setSelection] = useState<{ popup: ExplorePopup; keyword: string } | null>(null);
	const [manualTarget, setManualTarget] = useState<KakaoLatLngLiteral | null>(null);
	const positionButtonRef = useRef<HTMLButtonElement | null>(null);
	const overlayRef = useRef<HTMLDivElement | null>(null);
	const controlRowRef = useRef<HTMLDivElement | null>(null);
	const controlRowTopRef = useRef<number | null>(null);
	const controlRowOffsetY = useMotionValue(0);
	const shouldReduceMotion = useReducedMotion() === true;

	const selectedPopup = selection?.keyword === keyword ? selection.popup : null;
	const hasCard = selectedPopup !== null;
	const positionNotice = POSITION_STATUS_NOTICES[positionStatus];
	const cameraTarget = manualTarget ?? position;
	const cameraLevel = manualTarget === null ? MY_POSITION_LEVEL : MANUAL_TARGET_LEVEL;
	const viewProps =
		cameraTarget === null
			? { center: SEOUL_CENTER, level: SEOUL_OVERVIEW_LEVEL }
			: { center: cameraTarget, level: cameraLevel };

	useLayoutEffect(() => {
		const controlRow = controlRowRef.current;

		if (controlRow === null) {
			return;
		}

		const previousTop = controlRowTopRef.current;
		const top = controlRow.getBoundingClientRect().top - controlRowOffsetY.get();
		controlRowTopRef.current = top;

		if (previousTop === null || previousTop === top || shouldReduceMotion) {
			return;
		}

		controlRowOffsetY.jump(previousTop - top);
		void animate(controlRowOffsetY, 0, CARD_SLIDE_TRANSITION);
	}, [hasCard, controlRowOffsetY, shouldReduceMotion]);

	useEffect(() => {
		if (selectedPopup === null) {
			return;
		}

		const handleEscape = (event: KeyboardEvent) => {
			const isInsideDialog = event.target instanceof Element && event.target.closest("dialog[open]") !== null;

			if (event.key === "Escape" && !isInsideDialog) {
				setSelection(null);
				positionButtonRef.current?.focus();
			}
		};

		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [selectedPopup]);

	const selectPopup = (popup: ExplorePopup | null) => {
		setSelection(popup === null ? null : { popup, keyword });
	};

	const handleMarkerClick = (markerId: string) => {
		selectPopup(popups.find((popup) => String(popup.id) === markerId) ?? null);
	};

	const handleSelectionClear = () => {
		selectPopup(null);
	};

	const handleLocate = () => {
		void onLocate().then((foundPosition) => {
			if (foundPosition !== null) {
				setManualTarget(foundPosition);
			}
		});
	};

	const handleListItemClick = (popup: ExplorePopup) => () => {
		selectPopup(popup);
		setManualTarget({ ...popup.position });
	};

	const positionNoticeClass = positionNoticeVariants({
		isHidden: positionNotice === undefined || selectedPopup !== null
	});

	return (
		<div className="relative flex flex-1">
			<KakaoMap
				{...viewProps}
				markers={markers}
				selectedMarkerId={selectedPopup === null ? null : String(selectedPopup.id)}
				myPosition={position}
				initialCluster={{ minLevel: CLUSTER_MIN_LEVEL }}
				onMarkerClick={handleMarkerClick}
				onMapClick={handleSelectionClear}
				onBoundsChange={onBoundsChange}
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
				<SelectedPinReveal position={selectedPopup?.position ?? null} overlayRef={overlayRef} />

				<ul
					aria-label="지도에 표시한 팝업"
					className="absolute inset-x-5 top-4 z-20 max-h-48 scrollbar-subtle overflow-y-auto rounded-2xl bg-bg-1 p-2 shadow-floating not-focus-within:sr-only"
				>
					{popups.map((popup) => (
						<li key={popup.id}>
							<button
								type="button"
								aria-pressed={popup.id === selectedPopup?.id}
								onClick={handleListItemClick(popup)}
								className="w-full rounded-lg px-3 py-2 text-left text-b3-14 text-text-2 focus-ring hover:bg-bg-2 aria-pressed:bg-primary-subtle aria-pressed:text-primary"
							>
								{popup.areaName === null ? popup.title : `${popup.title}, ${popup.areaName}`}
							</button>
						</li>
					))}
				</ul>

				<div
					ref={overlayRef}
					className="pointer-events-none fixed inset-x-0 bottom-0 z-0 mx-auto flex max-w-app flex-col"
				>
					<m.div ref={controlRowRef} style={{ y: controlRowOffsetY }} className="flex items-center gap-2 px-5 pb-6">
						<CurrentPositionButton
							ref={positionButtonRef}
							status={positionStatus}
							onLocate={handleLocate}
							className="pointer-events-auto"
						/>
						<p role="status" className={positionNoticeClass}>
							{positionNotice}
						</p>
					</m.div>
					{selectedPopup === null ? (
						<div className="h-tab-bar-clearance" />
					) : (
						<MapPopupCard
							popup={selectedPopup}
							href={buildSheetHref(selectedPopup.id)}
							onClose={handleSelectionClear}
						/>
					)}
				</div>
			</KakaoMap>
		</div>
	);
}
