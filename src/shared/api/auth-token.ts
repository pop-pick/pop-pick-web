export type AccessTokenSource = () => string | null;

/** 재발급이 성공했는지 돌려준다. 성공이면 `request`가 원래 요청을 다시 보낸다 */
export type RefreshHandler = () => Promise<boolean>;

let accessTokenSource: AccessTokenSource | null = null;
let refreshHandler: RefreshHandler | null = null;
let pendingRefresh: Promise<boolean> | null = null;

const expiredListeners = new Set<() => void>();

/**
 * 액세스 토큰을 어디서 읽을지 등록한다. `features/auth`가 앱 시작 때 한 번 부른다.
 * `shared`가 `features`를 부르지 않으면서 요청에 Bearer를 붙이려면 방향을 뒤집는 이 자리가 필요하다.
 */
export function setAccessTokenSource(nextSource: AccessTokenSource | null) {
	accessTokenSource = nextSource;
}

export function getAccessToken() {
	return accessTokenSource === null ? null : accessTokenSource();
}

export function setRefreshHandler(handler: RefreshHandler | null) {
	refreshHandler = handler;
}

/**
 * 여러 요청이 같은 순간에 만료를 만나도 재발급은 한 번만 나간다.
 * 진행 중인 재발급이 있으면 그 결과를 함께 기다린다.
 */
export function refreshAccessToken() {
	if (refreshHandler === null) {
		return Promise.resolve(false);
	}

	pendingRefresh ??= refreshHandler().finally(() => {
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
