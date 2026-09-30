"use client";

import { EmptyState } from "@/shared/components/EmptyState";
import { MyPageEmptyState } from "@/shared/components/MyPageEmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";

import { useRecentPopups } from "../hooks/useRecentPopups";
import { ExploreListItem } from "./ExploreListItem";

export function RecentPopupList() {
	const { items, loadStatus } = useRecentPopups();

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
			{items.map((popup) => (
				<li key={popup.id}>
					<ExploreListItem popup={popup} />
				</li>
			))}
		</ul>
	);
}
