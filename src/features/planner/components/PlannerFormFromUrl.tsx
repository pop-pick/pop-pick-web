"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { LoadFailure } from "@/shared/components/LoadFailure";
import { PageHeader } from "@/shared/components/PageHeader";
import { PLANNER_PATH } from "@/shared/model/planner-path";

import { plannerFormQueryOptions } from "../api/get-planner-form";
import { PLANNER_FORM_TITLE } from "../model/planner-form";
import { PlannerFormSkeleton } from "./PlannerFormSkeleton";
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

	const header = <PageHeader title={PLANNER_FORM_TITLE} fallbackPath={PLANNER_PATH} isSticky />;

	if (isPending) {
		return <PlannerFormSkeleton />;
	}

	if (form === undefined) {
		return (
			<>
				{header}
				<div className="flex flex-1 items-center justify-center px-5">
					<LoadFailure title="조건 입력을 불러오지 못했어요." onRetry={handleRetry} />
				</div>
			</>
		);
	}

	return <PlannerFormWithDraft form={form} />;
}
