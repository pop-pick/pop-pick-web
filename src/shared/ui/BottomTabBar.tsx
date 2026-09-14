"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/cn";

const TABS = [
	{ href: "/home", label: "홈", icon: "M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5" },
	{ href: "/explore", label: "탐색", icon: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4-4" },
	{ href: "/planner", label: "플래너", icon: "M4 7h16M4 12h16M4 17h10" },
	{ href: "/my", label: "내 팝업", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0" }
] as const;

export function BottomTabBar() {
	const pathname = usePathname();

	return (
		<nav aria-label="주요 화면" className="sticky bottom-0 border-t border-zinc-100 bg-background">
			<ul className="flex">
				{TABS.map((tab) => {
					const isCurrent = pathname === tab.href;

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
								<svg
									viewBox="0 0 24 24"
									aria-hidden
									className="size-6"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.8"
								>
									<path d={tab.icon} strokeLinecap="round" strokeLinejoin="round" />
								</svg>
								{tab.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
