"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { EmptyState } from "@/shared/components/EmptyState";
import { ListMoreTrigger } from "@/shared/components/ListMoreTrigger";
import { LoadFailure } from "@/shared/components/LoadFailure";
import type { PopupSummary } from "@/shared/model/popup";
import { Skeleton } from "@/shared/ui/Skeleton";

import { popupListQueryOptions } from "../api/get-popups";
import { buildExploreEmptyMessage, type ExploreEmptyMessage } from "../model/explore-empty-message";
import { ExploreListItem } from "./ExploreListItem";

const LOAD_FAILURE_TITLE = "팝업을 불러오지 못했어요.";

interface PopupListProps {
	keyword: string;
}

function buildResultAnnouncement(
	popups: readonly PopupSummary[] | undefined,
	hasError: boolean,
	emptyMessage: ExploreEmptyMessage
) {
	if (popups === undefined) {
		return hasError ? LOAD_FAILURE_TITLE : "";
	}

	if (popups.length === 0) {
		return `${emptyMessage.title} ${emptyMessage.description}`;
	}

	return `팝업 ${String(popups.length)}곳을 불러왔습니다`;
}

export function PopupList({ keyword }: PopupListProps) {
	const {
		data: popups,
		error,
		isPending,
		refetch,
		hasNextPage,
		isFetchingNextPage,
		isFetchNextPageError,
		fetchNextPage
	} = useInfiniteQuery(popupListQueryOptions(keyword));
	const emptyMessage = buildExploreEmptyMessage(keyword);

	useEffect(() => {
		if (error !== null) {
			console.error("[popup] 탐색 목록을 불러오지 못했다", error);
		}
	}, [error]);

	const handleRetry = () => {
		void refetch();
	};

	const handleLoadMore = () => {
		void fetchNextPage();
	};

	return (
		<>
			<p role="status" className="sr-only">
				{buildResultAnnouncement(popups, error !== null, emptyMessage)}
			</p>
			{error !== null && popups === undefined && (
				<div className="flex justify-center pt-31.75 pb-10">
					<LoadFailure title={LOAD_FAILURE_TITLE} onRetry={handleRetry} />
				</div>
			)}
			{isPending && (
				<div role="status" className="flex flex-col gap-3">
					<span className="sr-only">팝업 목록을 불러오고 있습니다</span>
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
				</div>
			)}
			{popups?.length === 0 && (
				<div className="flex justify-center pt-31.75 pb-10">
					<EmptyState title={emptyMessage.title} description={emptyMessage.description} hasWarningIcon />
				</div>
			)}
			{popups !== undefined && popups.length > 0 && (
				<div className="flex flex-col gap-3">
					<ul aria-label="팝업 목록" aria-busy={isFetchingNextPage} className="flex flex-col gap-3">
						{popups.map((popup) => (
							<li key={popup.id}>
								<ExploreListItem popup={popup} isBookmarked={popup.isBookmarked} />
							</li>
						))}
					</ul>
					{hasNextPage && (
						<ListMoreTrigger
							isLoading={isFetchingNextPage}
							isFailed={isFetchNextPageError}
							loadingLabel="다음 10개를 불러오는 중"
							failureMessage="팝업을 더 불러오지 못했어요."
							skeletonClassName="h-28"
							onLoadMore={handleLoadMore}
						/>
					)}
				</div>
			)}
		</>
	);
}
