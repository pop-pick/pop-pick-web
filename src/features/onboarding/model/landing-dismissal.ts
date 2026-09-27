const STORAGE_KEY = "pop-pick.landing-dismissed";

export function isLandingDismissed() {
	return window.sessionStorage.getItem(STORAGE_KEY) === "true";
}

export function markLandingDismissed() {
	window.sessionStorage.setItem(STORAGE_KEY, "true");
}
