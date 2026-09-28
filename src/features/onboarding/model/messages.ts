import type { OnboardingStep } from "./steps";

export const ONBOARDING_STEP_TITLES: Record<OnboardingStep, string> = {
	1: "누구와 함께 다녀요?",
	2: "어떤 팝업을 좋아하세요?",
	3: "팝업에서 뭘 하는 걸 좋아하세요?"
};

export const ONBOARDING_QUESTION_LABELS = {
	companionType: "동행 유형",
	partySize: "동행 인원수",
	categories: "관심 카테고리",
	areas: "자주 가는 지역",
	activities: "선호 활동",
	freeText: "추가 요청사항"
} as const;

export const MULTIPLE_CHOICE_HINT = "* 복수선택 가능";
export const EMPTY_OPTIONS_MESSAGE = "선택지가 없어요";
export const EMPTY_SELECTION_MESSAGE = "항목을 선택해주세요";
export const WELCOME_MESSAGE = "POP PICK과 시작하는 여정을 환영합니다.";
export const FREE_TEXT_PLACEHOLDER = "예: 귀여운 캐릭터 굿즈 구경할 수 있는 곳 추천해줘";

export const ANSWERS_LOADING_MESSAGE = "입력한 답을 불러오고 있습니다";
export const ANSWERS_STORAGE_FAILURE_MESSAGE =
	"이 브라우저에 답을 저장하지 못했어요. 새로고침하면 고른 답이 사라질 수 있어요.";
export const OPTIONS_LOADING_MESSAGE = "선택지를 불러오고 있습니다";
export const OPTIONS_LOAD_FAILURE_TITLE = "선택지를 불러오지 못했어요.";
export const OPTIONS_LOAD_FAILURE_DESCRIPTION = "잠시 뒤 다시 시도해 주세요.";
export const SAVE_FAILURE_MESSAGE = "취향을 저장하지 못했어요. 고른 답은 그대로 남아 있어요.";
export const SAVE_PENDING_MESSAGE = "취향을 저장하고 있습니다";

export function formatRemainingLength(length: number, maxLength: number) {
	const remaining = maxLength - length;
	return remaining === 0 ? `${String(maxLength)}자를 모두 입력했어요` : `${String(remaining)}자 남음`;
}
