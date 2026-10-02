"use client";

import * as m from "motion/react-m";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";

import { PopupSearchForm } from "@/shared/components/PopupSearchForm";
import { tv } from "@/shared/lib/tv";
import {
	EXPLORE_PATH,
	type ExploreState,
	type ExploreViewMode,
	parseExploreState,
	toExploreHref
} from "@/shared/model/explore-state";

import { useCurrentPosition } from "../hooks/useCurrentPosition";
import { ExploreMap } from "./ExploreMap";
import { PopupList } from "./PopupList";
import { ViewToggle } from "./ViewToggle";

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

export function ExploreView() {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { position, status, requestCurrentPosition } = useCurrentPosition();

	const state = parseExploreState(searchParams);
	const [draftQuery, setDraftQuery] = useState(state.query);
	const [urlQuerySync, setUrlQuerySync] = useState({ seenQuery: state.query, writtenQuery: state.query });

	if (state.query !== urlQuerySync.seenQuery) {
		setUrlQuerySync({ seenQuery: state.query, writtenQuery: urlQuerySync.writtenQuery });

		if (state.query !== urlQuerySync.writtenQuery) {
			setDraftQuery(state.query);
		}
	}

	const isMapView = state.view === "map";

	const replaceExploreState = (nextState: ExploreState) => {
		setUrlQuerySync((sync) => ({ ...sync, writtenQuery: nextState.query }));
		window.history.replaceState(null, "", toExploreHref(nextState, pathname));
	};

	const writeQueryToUrl = useEffectEvent((query: string) => {
		replaceExploreState({ ...state, query });
	});

	const buildSheetHref = (popupId: number) => toExploreHref(state, `${EXPLORE_PATH}/popups/${String(popupId)}`);

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
			writeQueryToUrl(nextQuery);
		}, SEARCH_DEBOUNCE_MS);

		return () => {
			window.clearTimeout(timer);
		};
	}, [draftQuery, state.query]);

	const handleSearchSubmit = () => {
		replaceExploreState({ ...state, query: draftQuery.trim(), view: "list" });
	};

	const handleViewChange = (view: ExploreViewMode) => {
		replaceExploreState({ ...state, view });
	};

	const handleSwitchToList = () => {
		handleViewChange("list");
	};

	return (
		<div className={exploreViewVariants({ isMapView })}>
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
					<ExploreMap
						keyword={state.query}
						position={position}
						positionStatus={status}
						onLocate={requestCurrentPosition}
						buildSheetHref={buildSheetHref}
						onSwitchToList={handleSwitchToList}
					/>
				</m.div>
			) : (
				<m.div
					key="list"
					initial={LIST_ENTER_FROM}
					animate={VIEW_SHOWN}
					transition={VIEW_TRANSITION}
					className="flex flex-1 flex-col px-5 pt-5"
				>
					<PopupList keyword={state.query} />
				</m.div>
			)}
		</div>
	);
}
