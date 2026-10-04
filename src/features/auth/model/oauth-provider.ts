import type { OAuthProvider } from "./auth";
import { storeNextPath } from "./next-path";
import { createOAuthState } from "./oauth-state";

interface OAuthProviderConfig {
	displayName: string;
	authorizeUrl: string;
	callbackPath: string;
	clientId: string | undefined;
	clientIdEnvName: string;
	clientConsoleName: string;
	extraAuthorizeParams: Record<string, string>;
}

/** Next는 NEXT_PUBLIC_ 환경 변수를 이름 그대로 적은 참조만 빌드 때 치환하므로 process.env[name]으로 읽지 않는다 */
const OAUTH_PROVIDERS: Record<OAuthProvider, OAuthProviderConfig> = {
	KAKAO: {
		displayName: "카카오",
		authorizeUrl: "https://kauth.kakao.com/oauth/authorize",
		callbackPath: "/auth/kakao/callback",
		clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID,
		clientIdEnvName: "NEXT_PUBLIC_KAKAO_CLIENT_ID",
		clientConsoleName: "카카오 개발자 콘솔",
		extraAuthorizeParams: {}
	},
	GOOGLE: {
		displayName: "구글",
		authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
		callbackPath: "/auth/google/callback",
		clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
		clientIdEnvName: "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
		clientConsoleName: "구글 클라우드 콘솔",
		extraAuthorizeParams: { scope: "openid email profile" }
	}
};

export function getOAuthProviderDisplayName(provider: OAuthProvider) {
	return OAUTH_PROVIDERS[provider].displayName;
}

export function buildOAuthRedirectUri(provider: OAuthProvider) {
	return `${window.location.origin}${OAUTH_PROVIDERS[provider].callbackPath}`;
}

export function buildOAuthAuthorizeUrl(provider: OAuthProvider, redirectUri: string, state: string) {
	const { authorizeUrl, clientId, clientIdEnvName, clientConsoleName, extraAuthorizeParams } =
		OAUTH_PROVIDERS[provider];
	if (!clientId) {
		throw new Error(`${clientIdEnvName}가 비어 있다. ${clientConsoleName}에서 발급받아 채운다`);
	}

	const url = new URL(authorizeUrl);
	url.searchParams.set("client_id", clientId);
	url.searchParams.set("redirect_uri", redirectUri);
	url.searchParams.set("response_type", "code");
	for (const [name, value] of Object.entries(extraAuthorizeParams)) {
		url.searchParams.set(name, value);
	}

	url.searchParams.set("state", state);

	return url.toString();
}

export function startOAuthLogin(provider: OAuthProvider, nextPath: string | null) {
	storeNextPath(nextPath);
	window.location.href = buildOAuthAuthorizeUrl(provider, buildOAuthRedirectUri(provider), createOAuthState());
}
