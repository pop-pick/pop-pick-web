"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import type { PopupCardItem } from "@/shared/model/popup";
import { REGION_LABELS } from "@/shared/model/region";

import { useCurrentPosition } from "../hooks/useCurrentPosition";
import {
	type ExploreState,
	type ExploreViewMode,
	parseExploreState,
	serializeExploreState
} from "../model/explore-state";
import { PopupList } from "./PopupList";
import { PopupMap } from "./PopupMap";
import { ViewToggle } from "./ViewToggle";

interface ExploreViewProps {
	popups: readonly PopupCardItem[];
}

function toHref(pathname: string, state: ExploreState) {
	const query = serializeExploreState(state).toString();
	return query === "" ? pathname : `${pathname}?${query}`;
}

export function ExploreView({ popups }: ExploreViewProps) {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { position, status, requestCurrentPosition } = useCurrentPosition();

	const state = useMemo(() => parseExploreState(searchParams), [searchParams]);
	const visiblePopups = useMemo(
		() => (state.region === null ? popups : popups.filter((popup) => popup.region === state.region)),
		[popups, state.region]
	);

	useEffect(() => {
		if (state.view === "map" && status === "idle") {
			void requestCurrentPosition();
		}
	}, [state.view, status, requestCurrentPosition]);

	const handleViewChange = (view: ExploreViewMode) => {
		window.history.replaceState(null, "", toHref(pathname, { ...state, view }));
	};

	const handleSwitchToList = () => {
		handleViewChange("list");
	};

	return (
		<>
			<div className="flex items-center justify-between gap-3 px-5 pb-3">
				{state.region === null ? (
					<span />
				) : (
					<Link
						replace
						href={toHref(pathname, { ...state, region: null })}
						className="inline-flex items-center gap-2 rounded-full bg-primary py-2 pr-3 pl-4 text-sm font-medium text-white shadow-sm focus-ring transition-colors hover:bg-blue-700"
					>
						{REGION_LABELS[state.region]}
						<span className="sr-only">지역 해제</span>
						<svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5">
							<path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
						</svg>
					</Link>
				)}
				<ViewToggle view={state.view} onChange={handleViewChange} />
			</div>

			{state.view === "map" ? (
				<PopupMap
					popups={visiblePopups}
					region={state.region}
					position={position}
					positionStatus={status}
					onLocate={requestCurrentPosition}
					onSwitchToList={handleSwitchToList}
				/>
			) : (
				<PopupList popups={visiblePopups} region={state.region} />
			)}
		</>
	);
}
