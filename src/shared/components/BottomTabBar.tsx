"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import CalendarFillIcon from "@/shared/assets/icons/calendar-fill.svg";
import HomeFillIcon from "@/shared/assets/icons/home-fill.svg";
import SearchFillIcon from "@/shared/assets/icons/search-fill.svg";
import UserFillIcon from "@/shared/assets/icons/user-fill.svg";
import { cn } from "@/shared/lib/cn";
import { SvgIcon } from "@/shared/ui/SvgIcon";

const TABS = [
	{ href: "/home", label: "홈", icon: HomeFillIcon },
	{ href: "/explore", label: "탐색", icon: SearchFillIcon },
	{ href: "/planner", label: "플래너", icon: CalendarFillIcon },
	{ href: "/my", label: "MY", icon: UserFillIcon }
] as const;

export function BottomTabBar() {
	const pathname = usePathname();

	return (
		<nav aria-label="주요 화면" className="sticky bottom-0 border-t border-zinc-100 bg-bg-1">
			<ul className="flex">
				{TABS.map((tab) => {
					const isCurrent = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

					return (
						<li key={tab.href} className="flex-1">
							<Link
								href={tab.href}
								aria-current={isCurrent ? "page" : undefined}
								className={cn(
									"flex flex-col items-center gap-1 py-2 text-xs font-medium",
									"focus-ring",
									isCurrent ? "text-blue-600" : "text-zinc-400"
								)}
							>
								<SvgIcon icon={tab.icon} size={24} />
								{tab.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
