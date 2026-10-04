export const ACCOUNT_STORAGE_KEYS = {
	recentPopups: "pp-recent-popups",
	onboardingAnswers: "pp-onboarding-answers"
} as const;

/** 스토어 모듈이 이 페이지에 로드되지 않았으면 세션 종료 구독이 없어서 저장소 값이 남는다. 그래서 키를 직접 지운다 */
export function clearAccountStorage() {
	try {
		for (const key of Object.values(ACCOUNT_STORAGE_KEYS)) {
			window.sessionStorage.removeItem(key);
		}
	} catch (error) {
		console.warn("[auth] 세션 저장소를 비우지 못했다", error);
	}
}
