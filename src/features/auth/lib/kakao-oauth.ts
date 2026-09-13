const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";

export const KAKAO_CALLBACK_PATH = "/auth/kakao/callback";

export function getKakaoRedirectUri() {
	return `${window.location.origin}${KAKAO_CALLBACK_PATH}`;
}

export function buildKakaoAuthorizeUrl(redirectUri: string) {
	const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
	if (!clientId) {
		throw new Error("NEXT_PUBLIC_KAKAO_CLIENT_ID가 비어 있다. 카카오 개발자 콘솔에서 발급받아 채운다");
	}

	const url = new URL(KAKAO_AUTHORIZE_URL);
	url.searchParams.set("client_id", clientId);
	url.searchParams.set("redirect_uri", redirectUri);
	url.searchParams.set("response_type", "code");

	return url.toString();
}
