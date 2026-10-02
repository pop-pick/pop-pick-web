import { TZDate } from "@date-fns/tz";
import { expect, test } from "vitest";

import { formatBookmarkBadge } from "@/features/bookmark/model/bookmark-format";

const SEOUL_JUST_AFTER_MIDNIGHT = new TZDate("2026-10-03T00:30:00+09:00", "Asia/Seoul");

test.each([
	{ endDate: "2026-10-03", isEnded: false, badge: "종료임박 D-Day" },
	{ endDate: "2026-10-10", isEnded: false, badge: "종료임박 D-7" },
	{ endDate: "2026-10-11", isEnded: false, badge: null },
	{ endDate: null, isEnded: false, badge: null },
	{ endDate: "2026-10-02", isEnded: true, badge: "종료된 팝업" }
])("서울 날짜로 종료일 $endDate, 종료 $isEnded이면 배지는 $badge", ({ endDate, isEnded, badge }) => {
	expect(formatBookmarkBadge({ endDate, isEnded }, SEOUL_JUST_AFTER_MIDNIGHT)).toBe(badge);
});
