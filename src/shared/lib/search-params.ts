/** 라우트의 searchParams는 같은 키가 여럿이면 배열로 온다 */
export function toUrlSearchParams(record: Record<string, string | string[] | undefined>) {
	const params = new URLSearchParams();

	for (const [key, value] of Object.entries(record)) {
		const values = Array.isArray(value) ? value : [value];

		for (const item of values) {
			if (item !== undefined) {
				params.append(key, item);
			}
		}
	}

	return params;
}
