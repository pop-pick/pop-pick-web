const STORAGE_KEY = "pop-pick.oauth-state";
const STATE_BYTE_LENGTH = 16;

export class OAuthStateMismatchError extends Error {
	constructor() {
		super("콜백의 state가 인가 요청 때 저장한 값과 다르다");
		this.name = "OAuthStateMismatchError";
	}
}

export function createOAuthState() {
	const bytes = crypto.getRandomValues(new Uint8Array(STATE_BYTE_LENGTH));
	const state = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
	window.sessionStorage.setItem(STORAGE_KEY, state);
	return state;
}

function consumeOAuthState() {
	const state = window.sessionStorage.getItem(STORAGE_KEY);
	window.sessionStorage.removeItem(STORAGE_KEY);
	return state;
}

export function verifyOAuthState(received: string | null) {
	if (received === null || received !== consumeOAuthState()) {
		throw new OAuthStateMismatchError();
	}
}
