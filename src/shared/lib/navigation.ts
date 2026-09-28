/** `history.length`는 다른 출처 항목도 세어 뒤로 가기가 앱 밖으로 나갈 수 있다. Navigation API가 없는 브라우저는 뒤로 갈 수 없는 것으로 본다. https://developer.mozilla.org/en-US/docs/Web/API/Navigation/canGoBack */
export function canGoBackInApp() {
	const navigation: Navigation | undefined = window.navigation;
	return navigation?.canGoBack === true;
}
