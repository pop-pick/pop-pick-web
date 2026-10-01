"use client";

import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";

import { EmptyState } from "@/shared/components/EmptyState";
import { MyPageEmptyState } from "@/shared/components/MyPageEmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";

import { popupDetailQueryOptions } from "../api/get-popup-detail";
import { useRecentPopups } from "../hooks/useRecentPopups";
import type { PopupDetail } from "../model/popup-detail";
import { ExploreListItem } from "./ExploreListItem";

function combineRecentBookmarks(results: UseQueryResult<PopupDetail>[]) {
	return {
		bookmarkStates: results.map((result) => (result.isSuccess ? result.data.isBookmarked : null)),
		error: results.find((result) => result.isError)?.error ?? null
	};
}

export function RecentPopupList() {
	const { items, loadStatus } = useRecentPopups();
	const { bookmarkStates, error } = useQueries({
		queries: items.map((recent) => popupDetailQueryOptions(recent.id)),
		combine: combineRecentBookmarks
	});

	useEffect(() => {
		if (error !== null) {
			console.error("[popup] 최근 본 팝업의 찜 여부를 받지 못했다", error);
		}
	}, [error]);

	if (loadStatus === "loading") {
		return (
			<div role="status" className="flex flex-col gap-3">
				<span className="sr-only">최근 본 팝업을 불러오고 있습니다</span>
				<Skeleton className="h-28" />
				<Skeleton className="h-28" />
			</div>
		);
	}

	if (loadStatus === "failed") {
		return (
			<EmptyState
				className="py-10"
				hasWarningIcon
				title="최근 본 팝업을 불러오지 못했어요."
				description={"이 브라우저의 저장 공간을 읽지 못했어요.\n새로고침한 뒤 다시 열어 주세요."}
			/>
		);
	}

	if (items.length === 0) {
		return <MyPageEmptyState title="최근 본 팝업이 없습니다." />;
	}

	return (
		<ul aria-label="최근 본 팝업" className="flex flex-col gap-3">
			{items.map((recent, index) => (
				<li key={recent.id}>
					<ExploreListItem popup={recent} isBookmarked={bookmarkStates[index] ?? null} />
				</li>
			))}
		</ul>
	);
}
