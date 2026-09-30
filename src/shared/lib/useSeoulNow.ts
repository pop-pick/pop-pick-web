import { TZDate } from "@date-fns/tz";
import { useSyncExternalStore } from "react";

import { getSeoulNow, SEOUL_TIME_ZONE } from "./date";

const MINUTE_MS = 60_000;

function readMinute() {
	return Math.floor(getSeoulNow().getTime() / MINUTE_MS);
}

function subscribeMinute(onMinuteChange: () => void) {
	let timer: number | undefined;

	const scheduleNextTick = () => {
		const untilNextMinuteMs = MINUTE_MS - (getSeoulNow().getTime() % MINUTE_MS);

		timer = window.setTimeout(() => {
			onMinuteChange();
			scheduleNextTick();
		}, untilNextMinuteMs);
	};

	scheduleNextTick();

	return () => {
		window.clearTimeout(timer);
	};
}

/**
 * 렌더 중에 지금 시각이 필요할 때 쓴다. getSeoulNow를 렌더에서 직접 부르면 React Compiler가 첫 값을 기억해
 * 시간이 흘러도 화면이 옛 시각으로 남는다. 분이 바뀔 때마다 다시 그리고 그 분의 시작 시각을 준다
 */
export function useSeoulNow() {
	const minute = useSyncExternalStore(subscribeMinute, readMinute, readMinute);
	return new TZDate(minute * MINUTE_MS, SEOUL_TIME_ZONE);
}
