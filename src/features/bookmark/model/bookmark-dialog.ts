import { ApiError } from "@/shared/api/errors";
import { LOGIN_CONFIRM_LABEL, LOGIN_REQUIRED_MESSAGE } from "@/shared/model/login-prompt";

type BookmarkIntent = "login-required" | "add" | "remove";

export type BookmarkDialog = BookmarkIntent | "failure";

interface BookmarkDialogCopy {
	message: string;
	confirmLabel: string;
	closeLabel?: string;
}

const BOOKMARK_CONFIRM_COPIES: Record<BookmarkIntent, BookmarkDialogCopy> = {
	"login-required": { message: LOGIN_REQUIRED_MESSAGE, confirmLabel: LOGIN_CONFIRM_LABEL, closeLabel: "닫기" },
	add: { message: "해당 팝업을 찜하시겠습니까?", confirmLabel: "확인" },
	remove: { message: "해당 팝업의 찜 설정을 해제하시겠습니까?", confirmLabel: "해제" }
};

const NETWORK_FAILURE_MESSAGE = "인터넷 연결을 확인한 뒤\n다시 시도해 주세요.";
const NOT_FOUND_FAILURE_MESSAGE = "팝업 정보를 찾지 못했어요.\n새로고침한 뒤 다시 시도해 주세요.";
const DEFAULT_FAILURE_MESSAGE = "찜 설정을 바꾸지 못했어요.\n잠시 뒤 다시 시도해 주세요.";

export function resolveIntent({ isMember, isBookmarked }: { isMember: boolean; isBookmarked: boolean }) {
	const memberIntent: BookmarkIntent = isBookmarked ? "remove" : "add";
	return isMember ? memberIntent : "login-required";
}

function toBookmarkFailureMessage(error: unknown) {
	if (!(error instanceof ApiError)) {
		return DEFAULT_FAILURE_MESSAGE;
	}

	if (error.kind === "network" || error.kind === "timeout") {
		return NETWORK_FAILURE_MESSAGE;
	}

	return error.errorCode === "E404" ? NOT_FOUND_FAILURE_MESSAGE : DEFAULT_FAILURE_MESSAGE;
}

export function getBookmarkDialogCopy(dialog: BookmarkDialog, error: unknown) {
	if (dialog !== "failure") {
		return BOOKMARK_CONFIRM_COPIES[dialog];
	}

	const failureCopy: BookmarkDialogCopy = { message: toBookmarkFailureMessage(error), confirmLabel: "확인" };

	return failureCopy;
}
