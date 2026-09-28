const POPUP_ID_PATTERN = /^[1-9]\d*$/;

export function parsePopupId(value: string) {
	return POPUP_ID_PATTERN.test(value) ? Number(value) : null;
}
