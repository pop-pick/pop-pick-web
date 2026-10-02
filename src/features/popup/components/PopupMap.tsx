import { animate, useMotionValue, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { type FocusEvent, useEffect, useLayoutEffect, useRef, useState } from "react";

import type { KakaoMarkerData } from "@/shared/lib/kakao-map/kakao-map-session";
import type { KakaoLatLngLiteral } from "@/shared/lib/kakao-map/kakao-map-utils";
import { KakaoMap } from "@/shared/lib/kakao-map/KakaoMap";
import { tv } from "@/shared/lib/tv";
import { REGION_LABELS } from "@/shared/model/region";
import { Button } from "@/shared/ui/Button";

import type { ExplorePopup } from "../model/explore-popup";
import { resolveMapView } from "../model/map-view";
import { POSITION_STATUS_NOTICES, type PositionStatus } from "../model/position-status";
import { CurrentPositionButton } from "./CurrentPositionButton";
import { CARD_SLIDE_TRANSITION, MapPopupCard } from "./MapPopupCard";
import { SelectedPinReveal } from "./SelectedPinReveal";

const CLUSTER_MIN_LEVEL = 5;
const MY_POSITION_LEVEL = 5;
const PICKED_POPUP_LEVEL = 4;

const popupMapVariants = tv({
	slots: {
		positionNotice: "rounded-2xl bg-bg-1/90 px-3 py-1 text-b3-12 break-keep text-text-4 shadow-floating",
		list: ""
	},
	variants: {
		isNoticeHidden: {
			true: { positionNotice: "sr-only" }
		},
		isListRevealed: {
			true: {
				list: "absolute inset-x-5 top-4 z-20 max-h-48 scrollbar-subtle overflow-y-auto rounded-2xl bg-bg-1 p-2 shadow-floating"
			},
			false: { list: "sr-only" }
		}
	}
});

interface PopupMapProps {
	popups: readonly ExplorePopup[];
	markers: readonly KakaoMarkerData[];
	position: KakaoLatLngLiteral | null;
	positionStatus: PositionStatus;
	onLocate: () => Promise<KakaoLatLngLiteral | null>;
	buildSheetHref: (popupId: number) => string;
	onSwitchToList: () => void;
}

export function PopupMap({
	popups,
	markers,
	position,
	positionStatus,
	onLocate,
	buildSheetHref,
	onSwitchToList
}: PopupMapProps) {
	const [selectedPopupId, setSelectedPopupId] = useState<number | null>(null);
	const [manualTarget, setManualTarget] = useState<KakaoLatLngLiteral | null>(null);
	const [isListRevealed, setIsListRevealed] = useState(false);
	const positionButtonRef = useRef<HTMLButtonElement | null>(null);
	const overlayRef = useRef<HTMLDivElement | null>(null);
	const controlRowRef = useRef<HTMLDivElement | null>(null);
	const controlRowTopRef = useRef<number | null>(null);
	const controlRowOffsetY = useMotionValue(0);
	const shouldReduceMotion = useReducedMotion() === true;

	const positions = markers.map((marker) => marker.position);
	const selectedPopup = popups.find((popup) => popup.id === selectedPopupId) ?? null;
	const hasCard = selectedPopup !== null;
	const positionNotice = POSITION_STATUS_NOTICES[positionStatus];
	const cameraTarget = manualTarget ?? position;
	const cameraLevel = manualTarget === null ? MY_POSITION_LEVEL : PICKED_POPUP_LEVEL;
	const viewProps = resolveMapView(cameraTarget, cameraLevel, positions);

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
		setManualTarget({ ...popup.position });
	};

	const styles = popupMapVariants({
		isNoticeHidden: positionNotice === undefined || selectedPopup !== null,
		isListRevealed
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
				<SelectedPinReveal position={selectedPopup?.position ?? null} overlayRef={overlayRef} />

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
						<p role="status" className={styles.positionNotice()}>
							{positionNotice}
						</p>
					</m.div>
					{selectedPopup === null ? (
						<div className="h-tab-bar-clearance" />
					) : (
						<MapPopupCard popup={selectedPopup} href={buildSheetHref(selectedPopup.id)} onClose={handleCardClose} />
					)}
				</div>

				<ul aria-label="지도에 표시한 팝업" onFocus={handleListFocus} onBlur={handleListBlur} className={styles.list()}>
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
