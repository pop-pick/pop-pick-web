/** Route Handler가 돌려주는 것. 리프레시 토큰은 쿠키로 가고 본문에 없다 */
export interface SessionResult {
	accessToken: string;
}

/** 백엔드가 돌려주는 것. Route Handler 안에서만 쓴다 */
export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

export type OAuthProvider = "KAKAO" | "GOOGLE";
