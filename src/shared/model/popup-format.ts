export const DEFAULT_NICKNAME = "회원";

export function formatMatchRateMessage(nickname: string | null, matchRate: number) {
	return `${nickname ?? DEFAULT_NICKNAME}님의 취향과 ${String(matchRate)}% 일치해요!`;
}
