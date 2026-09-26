export type AccessTokenSource = () => string | null;
export type RefreshHandler = () => Promise<boolean>;

let accessTokenSource: AccessTokenSource | null = null;
let refreshHandler: RefreshHandler | null = null;
let pendingRefresh: Promise<boolean> | null = null;

const expiredListeners = new Set<() => void>();

export function setAccessTokenSource(nextSource: AccessTokenSource | null) {
	accessTokenSource = nextSource;
}

export function getAccessToken() {
	return accessTokenSource === null ? null : accessTokenSource();
}

export function setRefreshHandler(handler: RefreshHandler | null) {
	refreshHandler = handler;
}

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
