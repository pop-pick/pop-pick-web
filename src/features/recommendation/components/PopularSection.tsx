"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { EmptyState } from "@/shared/components/EmptyState";
import { LoadFailure } from "@/shared/components/LoadFailure";

import { popularPopupsQueryOptions } from "../api/get-popups";
import { PopularPopupRow } from "./PopularPopupRow";
import { PopularRowsSkeleton } from "./PopularRowsSkeleton";
import { PopularSectionHeader } from "./PopularSectionHeader";

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
			<PopularSectionHeader />
			{isPending && <PopularRowsSkeleton />}
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
