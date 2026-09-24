const PIN_LABEL_MAX_CHARS = 7;
const ELLIPSIS = "…";

/** 띄어쓰기를 포함해 일곱 자까지 남기고 뒤를 말줄임한다. 글자 단위로 자르므로 서로게이트 쌍이 갈라지지 않는다 */
export function truncatePinLabel(title: string) {
	const chars = Array.from(title);

	if (chars.length <= PIN_LABEL_MAX_CHARS) {
		return title;
	}

	return `${chars.slice(0, PIN_LABEL_MAX_CHARS).join("")}${ELLIPSIS}`;
}
