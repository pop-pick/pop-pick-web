const POPUP_ID_PATTERN = /^[1-9]\d*$/;

export function parsePopupId(value: string) {
	const popupId = POPUP_ID_PATTERN.test(value) ? Number(value) : null;
	return popupId !== null && Number.isSafeInteger(popupId) ? popupId : null;
}
