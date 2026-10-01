"use client";

import { useSearchParams } from "next/navigation";
import { type ReactNode, useId } from "react";

import {
	buildMyPageTabId,
	buildMyPageTabPath,
	MY_PAGE_TAB_ITEMS,
	type MyPageTab,
	parseMyPageTab
} from "@/shared/model/my-page-tab";
import { Tabs } from "@/shared/ui/Tabs";

interface MyPageTabsProps {
	bookmarkPanel: ReactNode;
	recentPanel: ReactNode;
}

export function MyPageTabs({ bookmarkPanel, recentPanel }: MyPageTabsProps) {
	const searchParams = useSearchParams();
	const panelId = useId();
	const tab = parseMyPageTab(searchParams);

	const panels: Record<MyPageTab, ReactNode> = { bookmark: bookmarkPanel, recent: recentPanel };

	const handleTabChange = (nextTab: MyPageTab) => {
		window.history.replaceState(null, "", buildMyPageTabPath(nextTab));
	};

	return (
		<div className="flex flex-col">
			<Tabs
				items={MY_PAGE_TAB_ITEMS}
				value={tab}
				panelId={panelId}
				ariaLabel="마이페이지 구분"
				onChange={handleTabChange}
			/>
			<div
				id={panelId}
				role="tabpanel"
				aria-labelledby={buildMyPageTabId(tab)}
				tabIndex={0}
				className="flex min-h-120.5 flex-col px-5 pt-5 pb-8 focus-ring"
			>
				{panels[tab]}
			</div>
		</div>
	);
}
