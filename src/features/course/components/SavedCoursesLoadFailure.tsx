import { EmptyState } from "@/shared/components/EmptyState";

export function SavedCoursesLoadFailure() {
	return (
		<EmptyState
			hasWarningIcon
			title="저장한 일정을 불러오지 못했어요."
			description={"이 브라우저의 저장 공간을 읽지 못했어요.\n새로고침한 뒤 다시 열어 주세요."}
		/>
	);
}
