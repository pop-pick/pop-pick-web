export type AccessTokenSource = () => string | null;

let source: AccessTokenSource | null = null;

/**
 * 액세스 토큰을 어디서 읽을지 등록한다. `features/auth`가 앱 시작 때 한 번 부른다.
 * `shared`가 `features`를 부르지 않으면서 요청에 Bearer를 붙이려면 방향을 뒤집는 이 자리가 필요하다.
 */
export function setAccessTokenSource(next: AccessTokenSource | null) {
	source = next;
}

export function getAccessToken() {
	return source === null ? null : source();
}
