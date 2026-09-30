export const MY_PAGE_PATH = "/my";

export const MY_PAGE_TABS = ["bookmark", "recent"] as const;

export type MyPageTab = (typeof MY_PAGE_TABS)[number];

export const MY_PAGE_TAB_LABELS: Record<MyPageTab, string> = {
	bookmark: "찜한 팝업",
	recent: "최근 본 팝업"
};

const DEFAULT_TAB: MyPageTab = "bookmark";
const TAB_PARAM = "tab";

function isMyPageTab(value: string | null): value is MyPageTab {
	return value !== null && MY_PAGE_TABS.includes(value as MyPageTab);
}

export function parseMyPageTab(searchParams: URLSearchParams) {
	const tab = searchParams.get(TAB_PARAM);
	return isMyPageTab(tab) ? tab : DEFAULT_TAB;
}

export function buildMyPageTabPath(tab: MyPageTab) {
	return tab === DEFAULT_TAB ? MY_PAGE_PATH : `${MY_PAGE_PATH}?${TAB_PARAM}=${tab}`;
}

export function buildMyPageTabId(tab: MyPageTab) {
	return `my-page-tab-${tab}`;
}

export const MY_PAGE_TAB_ITEMS = MY_PAGE_TABS.map((value) => ({
	value,
	id: buildMyPageTabId(value),
	label: MY_PAGE_TAB_LABELS[value]
}));
