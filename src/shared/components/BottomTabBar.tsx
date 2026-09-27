"use client";

import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import CalendarFillIcon from "@/shared/assets/icons/calendar-fill.svg";
import HomeFillIcon from "@/shared/assets/icons/home-fill.svg";
import SearchFillIcon from "@/shared/assets/icons/search-fill.svg";
import UserFillIcon from "@/shared/assets/icons/user-fill.svg";
import { cn } from "@/shared/lib/cn";
import { SvgIcon } from "@/shared/ui/SvgIcon";

const TABS = [
	{ href: "/", label: "홈", icon: HomeFillIcon, widthClass: "w-8.75" },
	{ href: "/explore", label: "탐색", icon: SearchFillIcon, widthClass: "w-10.5" },
	{ href: "/planner", label: "플래너", icon: CalendarFillIcon, widthClass: "w-6" },
	{ href: "/my", label: "마이", icon: UserFillIcon, widthClass: "w-11.5" }
] as const;

const HIDDEN_PATHS = ["/onboarding", "/login", "/auth", "/planner/new", "/planner/generating"] as const;

const ICON_SCALE_KEYFRAMES = [0.8, 1];
const ICON_TRANSITION = { type: "spring", bounce: 0.5, duration: 0.4 } as const;

function isWithinPath(pathname: string, path: string) {
	return pathname === path || pathname.startsWith(`${path}/`);
}

export function BottomTabBar() {
	const pathname = usePathname();
	const [pendingTab, setPendingTab] = useState<{ index: number; fromPathname: string } | null>(null);

	const currentIndex = TABS.findIndex((tab) => isWithinPath(pathname, tab.href));
	const highlightedIndex = pendingTab?.fromPathname === pathname ? pendingTab.index : currentIndex;

	const handleTabNavigate = (index: number) => () => {
		setPendingTab({ index, fromPathname: pathname });
	};

	if (HIDDEN_PATHS.some((path) => isWithinPath(pathname, path))) {
		return null;
	}

	return (
		<nav
			aria-label="주요 화면"
			className="sticky bottom-float-gap z-10 mx-5 mt-10 mb-float-gap rounded-3xl bg-bg-1/80 px-8.5 py-3 shadow-floating backdrop-blur-floating"
		>
			<ul className="flex justify-between pt-1">
				{TABS.map((tab, index) => {
					const isHighlighted = index === highlightedIndex;

					return (
						<li key={tab.href} className={tab.widthClass}>
							<Link
								href={tab.href}
								aria-current={index === currentIndex ? "page" : undefined}
								onNavigate={handleTabNavigate(index)}
								className={cn(
									"group -mx-5 flex flex-col items-center gap-2 rounded-lg px-5 text-b2-12 whitespace-nowrap transition-colors",
									"focus-ring",
									isHighlighted ? "text-primary" : "text-text-5 hover:text-text-3"
								)}
							>
								<m.span
									initial={false}
									animate={{ scale: isHighlighted ? ICON_SCALE_KEYFRAMES : 1 }}
									transition={ICON_TRANSITION}
									className="flex"
								>
									<SvgIcon
										icon={tab.icon}
										size={24}
										className={cn(
											"transition-colors",
											isHighlighted ? "text-icon-primary" : "text-icon-disabled group-hover:text-icon-2"
										)}
									/>
								</m.span>
								{tab.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
