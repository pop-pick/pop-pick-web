"use client";

import { useSearchParams } from "next/navigation";

import { parseCourseRequestDraft, serializeCourseRequestDraft } from "../model/course-request";
import { PlannerForm } from "./PlannerForm";

interface GuestPlannerFormFromUrlProps {
	mode: "guest";
	loginHref: string;
}

interface InactivePlannerFormFromUrlProps {
	mode: "member" | "pending";
	loginHref?: never;
}

type PlannerFormFromUrlProps = GuestPlannerFormFromUrlProps | InactivePlannerFormFromUrlProps;

/** 뒤로 가기로 돌아오면 서버가 처음 준 값이 아니라 지금 주소의 조건으로 폼을 채워야 해서 클라이언트 주소에서 읽는다 */
export function PlannerFormFromUrl({ mode, loginHref }: PlannerFormFromUrlProps) {
	const searchParams = useSearchParams();
	const initialDraft = parseCourseRequestDraft(new URLSearchParams(searchParams.toString()));
	const formKey = serializeCourseRequestDraft(initialDraft).toString();

	if (mode === "guest") {
		return <PlannerForm key={formKey} mode="guest" initialDraft={initialDraft} loginHref={loginHref} />;
	}

	return <PlannerForm key={formKey} mode={mode} initialDraft={initialDraft} />;
}
