"use client";

import * as m from "motion/react-m";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PopupSearchForm } from "@/shared/components/PopupSearchForm";
import { tv } from "@/shared/lib/tv";
import {
	type ExploreSort,
	type ExploreState,
	type ExploreViewMode,
	parseExploreState,
	toExploreHref
} from "@/shared/model/explore-state";
import type { Region } from "@/shared/model/region";
import { Select } from "@/shared/ui/Select";

import { useCurrentPosition } from "../hooks/useCurrentPosition";
import { buildExploreEmptyMessage } from "../model/explore-empty-message";
import { filterExplorePopups } from "../model/explore-filter";
import type { ExplorePopup } from "../model/explore-popup";
import { EXPLORE_REGION_OPTIONS, formatExploreRegionLabel } from "../model/explore-region";
import { buildExploreSheetPath } from "../model/explore-sheet-path";
import { PopupList } from "./PopupList";
import { PopupMap } from "./PopupMap";
import { SortToggle } from "./SortToggle";
import { ViewToggle } from "./ViewToggle";

interface ExploreViewProps {
	popups: readonly ExplorePopup[];
}

const SEARCH_DEBOUNCE_MS = 300;

const exploreViewVariants = tv({
	base: "flex flex-1 flex-col overflow-x-clip",
	variants: {
		isMapView: {
			true: "-mb-tab-bar-gap"
		}
	}
});

const VIEW_TRANSITION = { duration: 0.25, ease: "easeOut" } as const;
const MAP_ENTER_FROM = { opacity: 0 };
const LIST_ENTER_FROM = { opacity: 0, x: 24 };
const VIEW_SHOWN = { opacity: 1, x: 0 };

export function ExploreView({ popups }: ExploreViewProps) {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { position, status, requestCurrentPosition } = useCurrentPosition();

	const state = useMemo(() => parseExploreState(searchParams), [searchParams]);
	const [draftQuery, setDraftQuery] = useState(state.query);
	const [urlQuerySync, setUrlQuerySync] = useState({ seenQuery: state.query, writtenQuery: state.query });

	if (state.query !== urlQuerySync.seenQuery) {
		setUrlQuerySync({ seenQuery: state.query, writtenQuery: urlQuerySync.writtenQuery });

		if (state.query !== urlQuerySync.writtenQuery) {
			setDraftQuery(state.query);
		}
	}

	const { query, region, sort } = state;
	const filteredPopups = useMemo(
		() => filterExplorePopups(popups, { query, region, sort }),
		[popups, query, region, sort]
	);
	const emptyMessage = buildExploreEmptyMessage(state);
	const isMapView = state.view === "map";
	const resultAnnouncement =
		filteredPopups.length === 0
			? `${emptyMessage.title} ${emptyMessage.description}`
			: `팝업 ${String(filteredPopups.length)}곳`;

	const replaceExploreState = useCallback(
		(nextState: ExploreState) => {
			setUrlQuerySync((sync) => ({ ...sync, writtenQuery: nextState.query }));
			window.history.replaceState(null, "", toExploreHref(nextState, pathname));
		},
		[pathname]
	);

	const buildSheetHref = useCallback((popupId: number) => buildExploreSheetPath(popupId, state), [state]);

	useEffect(() => {
		if (isMapView && status === "idle") {
			void requestCurrentPosition();
		}
	}, [isMapView, status, requestCurrentPosition]);

	useEffect(() => {
		const nextQuery = draftQuery.trim();

		if (nextQuery === state.query) {
			return;
		}

		const timer = window.setTimeout(() => {
			replaceExploreState({ ...state, query: nextQuery });
		}, SEARCH_DEBOUNCE_MS);

		return () => {
			window.clearTimeout(timer);
		};
	}, [draftQuery, state, replaceExploreState]);

	const handleSearchSubmit = () => {
		replaceExploreState({ ...state, query: draftQuery.trim(), view: "list" });
	};

	const handleViewChange = (view: ExploreViewMode) => {
		replaceExploreState({ ...state, view });
	};

	const handleSwitchToList = () => {
		handleViewChange("list");
	};

	const handleRegionChange = (region: Region | null) => {
		replaceExploreState({ ...state, region });
	};

	const handleSortChange = (sort: ExploreSort) => {
		replaceExploreState({ ...state, sort });
	};

	return (
		<div className={exploreViewVariants({ isMapView })}>
			<p role="status" className="sr-only">
				{resultAnnouncement}
			</p>
			<div className="flex flex-col gap-4 px-5 pt-6">
				<PopupSearchForm value={draftQuery} onChange={setDraftQuery} onSubmit={handleSearchSubmit} />
				<ViewToggle view={state.view} onChange={handleViewChange} />
			</div>

			{isMapView ? (
				<m.div
					key="map"
					initial={MAP_ENTER_FROM}
					animate={VIEW_SHOWN}
					transition={VIEW_TRANSITION}
					className="relative mt-4 -mb-tab-bar-clearance flex flex-1 flex-col"
				>
					<PopupMap
						popups={filteredPopups}
						position={position}
						positionStatus={status}
						onLocate={requestCurrentPosition}
						buildSheetHref={buildSheetHref}
						shouldFollowPosition={state.region === null}
						onSwitchToList={handleSwitchToList}
					/>
					{filteredPopups.length === 0 && (
						<div className="pointer-events-none absolute inset-x-5 top-4 flex flex-col gap-1 rounded-xl bg-bg-1 px-4 py-3 text-center shadow-floating">
							<p className="text-b1-14 text-text-1">{emptyMessage.title}</p>
							<p className="text-b3-12 whitespace-pre-line text-text-4">{emptyMessage.description}</p>
						</div>
					)}
				</m.div>
			) : (
				<m.div
					key="list"
					initial={LIST_ENTER_FROM}
					animate={VIEW_SHOWN}
					transition={VIEW_TRANSITION}
					className="flex flex-1 flex-col px-5 pt-5"
				>
					<div className="relative z-10 flex items-center justify-between">
						<Select
							options={EXPLORE_REGION_OPTIONS}
							value={state.region}
							onChange={handleRegionChange}
							formatOptionLabel={formatExploreRegionLabel}
							label="지역"
							size="compact"
						/>
						<SortToggle sort={state.sort} onChange={handleSortChange} />
					</div>
					<PopupList popups={filteredPopups} emptyMessage={emptyMessage} />
				</m.div>
			)}
		</div>
	);
}
