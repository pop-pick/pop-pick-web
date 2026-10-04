type AccessTokenSource = () => string | null;
type RefreshHandler = () => Promise<boolean>;

const REFRESH_LOCK_NAME = "pp-auth-refresh";

let accessTokenSource: AccessTokenSource | null = null;
let refreshHandler: RefreshHandler | null = null;
let pendingRefresh: Promise<boolean> | null = null;

const expiredListeners = new Set<() => void>();
const sessionEndedListeners = new Set<() => void>();

export function setAccessTokenSource(nextSource: AccessTokenSource | null) {
	accessTokenSource = nextSource;
}

export function getAccessToken() {
	return accessTokenSource === null ? null : accessTokenSource();
}

export function setRefreshHandler(handler: RefreshHandler | null) {
	refreshHandler = handler;
}

/** 리프레시 토큰은 한 번 쓰면 폐기되고 재사용하면 백엔드가 세션을 끊는다. 탭마다 같은 쿠키로 동시에 재발급하면 늦은 탭이 재사용으로 걸려서, 브라우저가 탭 사이에 순서를 세운다 */
function runExclusively(handler: RefreshHandler) {
	return typeof navigator !== "undefined" && "locks" in navigator
		? navigator.locks.request(REFRESH_LOCK_NAME, handler)
		: handler();
}

export function refreshAccessToken() {
	if (refreshHandler === null) {
		return Promise.resolve(false);
	}

	pendingRefresh ??= runExclusively(refreshHandler).finally(() => {
		pendingRefresh = null;
	});

	return pendingRefresh;
}

export function subscribeAuthExpired(listener: () => void) {
	expiredListeners.add(listener);

	return () => {
		expiredListeners.delete(listener);
	};
}

export function notifyAuthExpired() {
	for (const listener of expiredListeners) {
		listener();
	}
}

/** 로그인했던 세션이 끝났을 때(로그아웃, 만료) 앞 계정의 클라이언트 상태를 비우려고 각 스토어가 구독한다 */
export function subscribeSessionEnded(listener: () => void) {
	sessionEndedListeners.add(listener);

	return () => {
		sessionEndedListeners.delete(listener);
	};
}

export function notifySessionEnded() {
	for (const listener of sessionEndedListeners) {
		listener();
	}
}
