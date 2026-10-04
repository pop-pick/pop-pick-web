import type { OnboardingStep } from "./steps";

export const ONBOARDING_STEP_TITLES: Record<OnboardingStep, string> = {
	1: "누구와 함께 다녀요?",
	2: "어떤 팝업을 좋아하세요?",
	3: "어떤 활동을 할까요?"
};

export const ONBOARDING_STEP_DESCRIPTIONS: Record<OnboardingStep, string> = {
	1: "추천 코스의 분위기와\n규모를 정하는 데 활용해요.",
	2: "관심 카테고리와 자주 가는 지역을 선택하면\n개인화된 팝업 추천을 제공해요.",
	3: "좋아하는 활동을 선택해주세요."
};

export const ONBOARDING_HEADER_TITLE = "취향 분석 온보딩";

export const ONBOARDING_QUESTION_LABELS = {
	companionType: "동행 유형",
	partySize: "동행 인원수",
	categories: "관심 카테고리",
	areas: "자주 가는 지역",
	activities: "선호 활동",
	freeText: "이외의 좋아하는 것"
} as const;

export const MULTIPLE_CHOICE_HINT = "* 복수선택 가능";
export const EMPTY_OPTIONS_MESSAGE = "선택지가 없어요";
export const EMPTY_SELECTION_MESSAGE = "항목을 선택해주세요";
export const WELCOME_MESSAGE = "POP PICK과 시작하는 여정을 환영합니다.";
export const FREE_TEXT_PLACEHOLDER = "예시) 귀여운 캐릭터 굿즈 구경하는 걸 좋아해요.";
export const FREE_TEXT_DESCRIPTION = "좋아하는 것을 자유롭게 작성해주세요.\nAI가 팝업을 추천할 때 참고해요.";

export const AUTH_CHECKING_MESSAGE = "로그인 상태를 확인하고 있습니다";
export const ANSWERS_LOADING_MESSAGE = "입력한 답을 불러오고 있습니다";
export const ANSWERS_STORAGE_FAILURE_MESSAGE =
	"이 브라우저에 답을 저장하지 못했어요. 새로고침하면 고른 답이 사라질 수 있어요.";
export const OPTIONS_LOADING_MESSAGE = "선택지를 불러오고 있습니다";
export const OPTIONS_LOAD_FAILURE_TITLE = "선택지를 불러오지 못했어요.";
export const OPTIONS_LOAD_FAILURE_DESCRIPTION = "잠시 뒤 다시 시도해 주세요.";
export const SAVE_FAILURE_MESSAGE = "취향을 저장하지 못했어요. 고른 답은 그대로 남아 있어요.";
export const SAVE_REJECTED_MESSAGE = "저장할 수 없는 상태예요. 이미 취향을 저장했다면 홈에서 그대로 이용할 수 있어요.";
export const SAVE_REJECTED_NO_COMPANION_MESSAGE =
	"동행 유형과 인원수를 고르지 않아 저장하지 못했어요. 1단계에서 골라 주세요.";
export const SAVE_PENDING_MESSAGE = "취향을 저장하고 있습니다";

export function formatEnteredLength(length: number, maxLength: number) {
	return `${String(length)}/${String(maxLength)}자`;
}
