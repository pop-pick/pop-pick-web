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

/**
 * 위치 상태를 지도가 아니라 여기서 든다. 목록으로 갔다 돌아와도 거부한 사용자에게 다시 묻지 않는다.
 * 권한은 지도 뷰에 처음 들어올 때 한 번만 묻는다.
 */
export function ExploreView({ popups }: ExploreViewProps) {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { position, status, locate } = useCurrentPosition();

	const state = useMemo(() => parseExploreState(searchParams), [searchParams]);
	const visible = useMemo(
		() => (state.region === null ? popups : popups.filter((popup) => popup.region === state.region)),
		[popups, state.region]
	);

	useEffect(() => {
		if (state.view === "map" && status === "idle") {
			void locate();
		}
	}, [state.view, status, locate]);

	/**
	 * 라우터를 거치지 않고 주소만 바꾼다. Next가 `useSearchParams`를 동기화해 주므로 화면은 따라온다.
	 * 페이지가 `searchParams`를 읽지 않아 서버에서 다시 그릴 것이 없고 스크롤도 그대로다.
	 */
	const changeView = (view: ExploreViewMode) => {
		window.history.replaceState(null, "", toHref(pathname, { ...state, view }));
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
				<ViewToggle view={state.view} onChange={changeView} />
			</div>

			{state.view === "map" ? (
				<PopupMap
					popups={visible}
					region={state.region}
					position={position}
					positionStatus={status}
					onLocate={locate}
					onSwitchToList={() => {
						changeView("list");
					}}
				/>
			) : (
				<PopupList popups={visible} region={state.region} />
			)}
		</>
	);
}
