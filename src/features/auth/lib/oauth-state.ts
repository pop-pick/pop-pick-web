const STORAGE_KEY = "pop-pick.oauth-state";
const STATE_BYTE_LENGTH = 16;

export class OAuthStateMismatchError extends Error {
	constructor() {
		super("콜백의 state가 인가 요청 때 저장한 값과 다르다");
		this.name = "OAuthStateMismatchError";
	}
}

/** 인가 요청마다 새 값을 만들어 이 탭의 sessionStorage에 둔다. 인가 흐름 안에서만 사는 값이다 */
export function issueOAuthState() {
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

/** 저장한 값은 한 번 대조하면 지운다. 같은 콜백 URL을 다시 열어도 두 번째는 통과하지 않는다 */
export function verifyOAuthState(received: string | null) {
	if (received === null || received !== consumeOAuthState()) {
		throw new OAuthStateMismatchError();
	}
}
