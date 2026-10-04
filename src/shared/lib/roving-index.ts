const ARROW_STEPS: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

export function resolveRovingIndex(key: string, currentIndex: number, count: number) {
	if (key === "Home") {
		return 0;
	}

	if (key === "End") {
		return count - 1;
	}

	const step = ARROW_STEPS[key];

	return step === undefined ? null : (currentIndex + step + count) % count;
}
