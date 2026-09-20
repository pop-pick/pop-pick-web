"use client";

import Link from "next/link";
import { useState } from "react";

import { KakaoMap } from "@/shared/lib/kakao-map/KakaoMap";
import type { PopupCardItem } from "@/shared/model/popup";
import type { Region } from "@/shared/model/region";
import { REGION_LABELS } from "@/shared/model/region";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LinkButton } from "@/shared/ui/LinkButton";
import { PopupCard } from "@/shared/ui/PopupCard";

import { toPlaceholderMarkers } from "../model/placeholder-markers";

interface PopupMapProps {
	popups: readonly PopupCardItem[];
	region: Region | null;
}

export function PopupMap({ popups, region }: PopupMapProps) {
	const [selectedPopupId, setSelectedPopupId] = useState<number | null>(null);

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

	const markers = toPlaceholderMarkers(popups);
	const selectedPopup = popups.find((popup) => popup.id === selectedPopupId);

	if (selectedPopupId !== null && selectedPopup === undefined) {
		setSelectedPopupId(null);
	}

	return (
		<div className="flex flex-1 flex-col">
			<div className="relative flex flex-1">
				<KakaoMap
					fitTo={markers.map((marker) => marker.position)}
					markers={markers}
					onMarkerClick={(markerId) => {
						setSelectedPopupId(Number(markerId));
					}}
					label={`팝업 지도, ${String(popups.length)}곳`}
					className="flex-1 rounded-none"
				/>

				<div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-start gap-2 p-3">
					{region === null ? null : (
						<Link
							href="/explore"
							className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-blue-600 py-2 pr-3 pl-4 text-sm font-medium text-white shadow-sm focus-ring"
						>
							{REGION_LABELS[region]}
							<span className="sr-only">지역 필터 해제</span>
							<svg
								viewBox="0 0 24 24"
								aria-hidden
								className="size-4"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
							>
								<path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
							</svg>
						</Link>
					)}
					<p className="rounded-full bg-white/90 px-3 py-1 text-xs text-zinc-600 shadow-sm">
						위치는 지역 기준 대략값이에요
					</p>
				</div>

				<div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
					{selectedPopup === undefined ? null : (
						<div className="pointer-events-auto relative">
							<PopupCard popup={selectedPopup} className="pr-12 shadow-lg" />
							<button
								type="button"
								aria-label="선택한 팝업 닫기"
								onClick={() => {
									setSelectedPopupId(null);
								}}
								className="absolute top-2 right-2 flex size-11 items-center justify-center rounded-full text-zinc-500 focus-ring hover:bg-zinc-100"
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
							</button>
						</div>
					)}
				</div>
			</div>

			<p aria-live="polite" className="sr-only">
				{selectedPopup === undefined ? "" : `${REGION_LABELS[selectedPopup.region]}, ${selectedPopup.name} 선택`}
			</p>

			<ul aria-label="지도에 표시한 팝업" className="sr-only focus-within:not-sr-only">
				{popups.map((popup) => (
					<li key={popup.id}>
						<button
							type="button"
							onClick={() => {
								setSelectedPopupId(popup.id);
							}}
							className="w-full px-4 py-2 text-left text-sm focus-ring"
						>
							{popup.name}, {REGION_LABELS[popup.region]}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
