"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { EmptyState } from "@/shared/components/EmptyState";
import { LoadFailure } from "@/shared/components/LoadFailure";

import { homePickQueryOptions } from "../api/get-popups";
import { formatPickTitle } from "../model/home-format";
import { PickSection } from "./PickSection";
import { PickSectionSkeleton } from "./PickSectionSkeleton";

export function HomePickSection() {
	const { data: recommendations, error, isPending, refetch } = useQuery(homePickQueryOptions());

	useEffect(() => {
		if (error !== null) {
			console.error("[recommendation] 팝업 PICK을 불러오지 못했다", error);
		}
	}, [error]);

	const handleRetry = () => {
		void refetch();
	};

	if (isPending) {
		return <PickSectionSkeleton />;
	}

	if (recommendations !== undefined && recommendations.length > 0) {
		return <PickSection nickname={null} recommendations={recommendations} />;
	}

	return (
		<section aria-labelledby="pick-section-title" className="flex flex-col gap-5">
			<h2 id="pick-section-title" className="text-b1-18 text-text-1">
				{formatPickTitle(null)}
			</h2>
			{recommendations === undefined ? (
				<div role="alert" className="py-6">
					<LoadFailure title="추천 팝업을 불러오지 못했어요." onRetry={handleRetry} />
				</div>
			) : (
				<EmptyState
					className="py-6"
					title="지금 추천할 팝업이 없어요."
					description="새 팝업이 등록되면 여기에 보여드려요."
				/>
			)}
		</section>
	);
}
