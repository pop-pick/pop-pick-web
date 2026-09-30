"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { getSeoulNow } from "@/shared/lib/date";
import { parsePlannerDraft } from "@/shared/model/planner-path";

import { buildInitialPlannerDraft } from "../model/course-request";
import type { PlannerFormData } from "../model/planner-form";
import { PlannerForm } from "./PlannerForm";

interface PlannerFormWithDraftProps {
	form: PlannerFormData;
}

export function PlannerFormWithDraft({ form }: PlannerFormWithDraftProps) {
	const searchParams = useSearchParams();
	const [initialDraft] = useState(() => {
		const params = new URLSearchParams(searchParams.toString());
		return buildInitialPlannerDraft(parsePlannerDraft(params), params.size > 0, form, getSeoulNow());
	});

	return <PlannerForm form={form} initialDraft={initialDraft} />;
}
