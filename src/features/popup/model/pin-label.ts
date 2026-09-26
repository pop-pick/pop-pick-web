const PIN_LABEL_MAX_CHARS = 7;
const ELLIPSIS = "…";

export function truncatePinLabel(title: string) {
	const chars = Array.from(title);

	if (chars.length <= PIN_LABEL_MAX_CHARS) {
		return title;
	}

	return `${chars.slice(0, PIN_LABEL_MAX_CHARS).join("")}${ELLIPSIS}`;
}
