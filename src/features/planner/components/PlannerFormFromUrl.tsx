"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";

import { plannerFormQueryOptions } from "../api/get-planner-form";
import { PlannerFormWithDraft } from "./PlannerFormWithDraft";

export function PlannerFormFromUrl() {
	const { data: form, error, isPending, refetch } = useQuery(plannerFormQueryOptions());

	useEffect(() => {
		if (error !== null) {
			console.error("[planner] 조건 입력 선택지를 불러오지 못했다", error);
		}
	}, [error]);

	const handleRetry = () => {
		void refetch();
	};

	if (isPending) {
		return (
			<div role="status" className="flex flex-1 flex-col gap-10 px-5 pt-20">
				<span className="sr-only">조건 입력을 준비하고 있습니다</span>
				<Skeleton className="h-45 rounded-2xl" />
				<Skeleton className="h-60 rounded-2xl" />
			</div>
		);
	}

	if (error !== null) {
		return (
			<div className="flex flex-1 items-center justify-center px-5">
				<EmptyState
					hasWarningIcon
					title="조건 입력을 불러오지 못했어요."
					description="잠시 뒤 다시 시도해 주세요."
					action={
						<Button variant="secondary" onClick={handleRetry}>
							다시 시도
						</Button>
					}
				/>
			</div>
		);
	}

	return <PlannerFormWithDraft form={form} />;
}
