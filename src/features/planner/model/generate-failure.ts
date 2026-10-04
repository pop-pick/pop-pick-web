import { ApiError } from "@/shared/api/errors";
import type { PlannerDraft } from "@/shared/model/planner-path";

const PAST_DATE_MESSAGE = "방문 날짜를 다시 골라 주세요.\n오늘부터 30일 안에서 고를 수 있어요.";
const PAST_START_TIME_MESSAGE = "시작 시간을 다시 골라 주세요.\n오늘이면 지금부터 30분 뒤부터 고를 수 있어요.";

const GENERATE_FAILURE_MESSAGES: Record<string, string> = {
	E3002: PAST_DATE_MESSAGE,
	E3003: PAST_START_TIME_MESSAGE,
	E3004: "조건에 맞는 팝업이 부족해요.\n지역이나 조건을 바꿔 다시 시도해 주세요."
};

const DEFAULT_FAILURE_MESSAGE = "코스를 만들지 못했어요.\n잠시 뒤 다시 시도해 주세요.";

export function toGenerateFailureMessage(error: unknown) {
	const errorCode = error instanceof ApiError ? error.errorCode : null;
	return (errorCode === null ? undefined : GENERATE_FAILURE_MESSAGES[errorCode]) ?? DEFAULT_FAILURE_MESSAGE;
}

export function toExpiredConditionMessage(draft: PlannerDraft, sanitized: PlannerDraft) {
	if (draft.date !== null && sanitized.date === null) {
		return PAST_DATE_MESSAGE;
	}

	return draft.startAt !== null && sanitized.startAt === null ? PAST_START_TIME_MESSAGE : null;
}
