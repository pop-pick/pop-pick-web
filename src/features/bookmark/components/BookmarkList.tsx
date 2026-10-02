"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { ListMoreTrigger } from "@/shared/components/ListMoreTrigger";
import { LoadFailure } from "@/shared/components/LoadFailure";
import { MyPageEmptyState } from "@/shared/components/MyPageEmptyState";
import { useSeoulNow } from "@/shared/lib/useSeoulNow";
import { Skeleton } from "@/shared/ui/Skeleton";

import { bookmarkListQueryOptions } from "../api/get-bookmarks";
import { BookmarkListItem } from "./BookmarkListItem";

export function BookmarkList() {
	const now = useSeoulNow();
	const {
		data: popups,
		error,
		refetch,
		hasNextPage,
		isFetchingNextPage,
		isFetchNextPageError,
		fetchNextPage
	} = useInfiniteQuery(bookmarkListQueryOptions());

	useEffect(() => {
		if (error !== null) {
			console.error("[bookmark] 찜 목록을 불러오지 못했다", error);
		}
	}, [error]);

	const handleRetry = () => {
		void refetch();
	};

	const handleLoadMore = () => {
		void fetchNextPage();
	};

	if (popups === undefined && error !== null) {
		return <LoadFailure className="py-10" title="찜한 팝업을 불러오지 못했어요." onRetry={handleRetry} />;
	}

	if (popups === undefined) {
		return (
			<div role="status" className="flex flex-col gap-3">
				<span className="sr-only">찜한 팝업을 불러오고 있습니다</span>
				<Skeleton className="h-28" />
				<Skeleton className="h-28" />
			</div>
		);
	}

	if (popups.length === 0) {
		return <MyPageEmptyState title="찜한 팝업이 없습니다." />;
	}

	return (
		<div className="flex flex-col gap-3">
			<ul aria-label="찜한 팝업" aria-busy={isFetchingNextPage} className="flex flex-col gap-3">
				{popups.map((popup) => (
					<li key={popup.id}>
						<BookmarkListItem popup={popup} now={now} />
					</li>
				))}
			</ul>
			{hasNextPage && (
				<ListMoreTrigger
					isLoading={isFetchingNextPage}
					isFailed={isFetchNextPageError}
					loadingLabel="찜한 팝업을 더 불러오고 있습니다"
					failureMessage="찜한 팝업을 더 불러오지 못했어요."
					skeletonClassName="h-28"
					onLoadMore={handleLoadMore}
				/>
			)}
		</div>
	);
}
