export interface SessionResult {
	accessToken: string;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

export type OAuthProvider = "KAKAO" | "GOOGLE";
