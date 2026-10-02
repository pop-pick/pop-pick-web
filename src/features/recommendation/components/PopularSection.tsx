"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect } from "react";

import ChevronRightIcon from "@/shared/assets/icons/chevron-right.svg";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadFailure } from "@/shared/components/LoadFailure";
import { buildExploreListPath } from "@/shared/model/explore-state";
import { Skeleton } from "@/shared/ui/Skeleton";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import { popularPopupsQueryOptions } from "../api/get-popups";
import { PopularPopupRow } from "./PopularPopupRow";

const SKELETON_ROW_KEYS = ["first", "second", "third"];

export function PopularSection() {
	const { data: popularPopups, error, isPending, refetch } = useQuery(popularPopupsQueryOptions());

	useEffect(() => {
		if (error !== null) {
			console.error("[recommendation] 인기 팝업을 불러오지 못했다", error);
		}
	}, [error]);

	const handleRetry = () => {
		void refetch();
	};

	return (
		<section aria-labelledby="popular-section-title" className="flex flex-col gap-5">
			<div className="flex items-center justify-between">
				<h2 id="popular-section-title" className="text-b1-18 text-text-1">
					지금 인기 있는 팝업
				</h2>
				<Link
					href={buildExploreListPath()}
					aria-label="인기 팝업 전체보기"
					className="rounded-sm text-icon-disabled focus-ring transition-colors hover:text-icon-2"
				>
					<SvgIcon icon={ChevronRightIcon} size={24} />
				</Link>
			</div>
			{isPending && (
				<div role="status" className="flex flex-col gap-4">
					<span className="sr-only">인기 팝업을 불러오는 중입니다</span>
					{SKELETON_ROW_KEYS.map((key) => (
						<div key={key} className="flex items-center gap-3">
							<Skeleton className="size-18 shrink-0 rounded-lg" />
							<div className="flex flex-1 flex-col gap-2">
								<Skeleton className="h-5 w-3/5 rounded-lg" />
								<Skeleton className="h-4 w-2/5 rounded-lg" />
							</div>
						</div>
					))}
				</div>
			)}
			{error !== null && popularPopups === undefined && (
				<div role="alert" className="py-6">
					<LoadFailure title="인기 팝업을 불러오지 못했어요." onRetry={handleRetry} />
				</div>
			)}
			{popularPopups?.length === 0 && (
				<EmptyState
					className="py-6"
					title="아직 등록된 팝업이 없어요."
					description="새 팝업이 등록되면 여기에 보여드려요."
				/>
			)}
			{popularPopups !== undefined && popularPopups.length > 0 && (
				<ul className="flex flex-col gap-4">
					{popularPopups.map((item) => (
						<li key={item.popup.id}>
							<PopularPopupRow item={item} />
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
