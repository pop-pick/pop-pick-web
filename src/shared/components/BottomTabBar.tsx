"use client";

import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type MouseEvent, useState } from "react";

import CalendarFillIcon from "@/shared/assets/icons/calendar-fill.svg";
import HomeFillIcon from "@/shared/assets/icons/home-fill.svg";
import SearchFillIcon from "@/shared/assets/icons/search-fill.svg";
import UserFillIcon from "@/shared/assets/icons/user-fill.svg";
import { tv } from "@/shared/lib/tv";
import { LOGIN_CONFIRM_LABEL, LOGIN_REQUIRED_MESSAGE } from "@/shared/model/login-prompt";
import { AlertDialog } from "@/shared/ui/AlertDialog";
import { SvgIcon } from "@/shared/ui/SvgIcon";

const TABS = [
	{ href: "/", activePaths: ["/"], label: "홈", icon: HomeFillIcon, widthClass: "w-8.75" },
	{ href: "/explore", activePaths: ["/explore"], label: "탐색", icon: SearchFillIcon, widthClass: "w-10.5" },
	{
		href: "/planner",
		activePaths: ["/planner", "/courses"],
		label: "플래너",
		icon: CalendarFillIcon,
		widthClass: "w-6"
	},
	{ href: "/my", activePaths: ["/my"], label: "마이", icon: UserFillIcon, widthClass: "w-11.5" }
] as const;

type TabHref = (typeof TABS)[number]["href"];

const HIDDEN_PATHS = ["/onboarding", "/login", "/auth", "/planner/new", "/planner/generating"] as const;

const ICON_SCALE_KEYFRAMES = [0.8, 1];
const ICON_TRANSITION = { type: "spring", bounce: 0.5, duration: 0.4 } as const;

const tabVariants = tv({
	slots: {
		link: "group -mx-5 flex flex-col items-center gap-2 rounded-lg px-5 text-b2-12 leading-5 whitespace-nowrap focus-ring transition-colors",
		icon: "transition-colors"
	},
	variants: {
		isHighlighted: {
			true: { link: "text-primary", icon: "text-icon-primary" },
			false: { link: "text-text-5 hover:text-text-3", icon: "text-icon-disabled group-hover:text-icon-2" }
		}
	}
});

function isWithinPath(pathname: string, path: string) {
	return pathname === path || pathname.startsWith(`${path}/`);
}

interface BottomTabBarProps {
	loginHrefByTab?: Partial<Record<TabHref, string>>;
}

export function BottomTabBar({ loginHrefByTab }: BottomTabBarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const [pendingTab, setPendingTab] = useState<{ index: number; fromPathname: string } | null>(null);
	const [loginPromptHref, setLoginPromptHref] = useState<string | null>(null);
	const [originIndex, setOriginIndex] = useState(0);

	const currentIndex = TABS.findIndex((tab) => tab.activePaths.some((path) => isWithinPath(pathname, path)));

	if (currentIndex !== -1 && currentIndex !== originIndex) {
		setOriginIndex(currentIndex);
	}

	const tabIndex = currentIndex === -1 ? originIndex : currentIndex;
	const highlightedIndex = pendingTab?.fromPathname === pathname ? pendingTab.index : tabIndex;

	const handleTabNavigate = (index: number) => () => {
		setPendingTab({ index, fromPathname: pathname });
	};

	const handleTabClick = (href: TabHref) => (event: MouseEvent<HTMLAnchorElement>) => {
		const loginHref = loginHrefByTab?.[href];
		const shouldOpenNewTab = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

		if (loginHref === undefined || shouldOpenNewTab) {
			return;
		}

		event.preventDefault();
		setLoginPromptHref(loginHref);
	};

	const handleLoginConfirm = () => {
		setLoginPromptHref(null);

		if (loginPromptHref !== null) {
			router.push(loginPromptHref);
		}
	};

	const handleLoginCancel = () => {
		setLoginPromptHref(null);
	};

	if (HIDDEN_PATHS.some((path) => isWithinPath(pathname, path))) {
		return null;
	}

	return (
		<>
			<nav
				aria-label="주요 화면"
				className="sticky bottom-float-gap z-10 mx-5 mt-tab-bar-gap mb-float-gap rounded-3xl bg-bg-1/80 px-8.5 py-3 shadow-floating backdrop-blur-floating"
			>
				<ul className="flex justify-between pt-1">
					{TABS.map((tab, index) => {
						const isHighlighted = index === highlightedIndex;
						const styles = tabVariants({ isHighlighted });

						return (
							<li key={tab.href} className={tab.widthClass}>
								<Link
									href={tab.href}
									aria-current={index === currentIndex ? "page" : undefined}
									aria-haspopup={loginHrefByTab?.[tab.href] === undefined ? undefined : "dialog"}
									onClick={handleTabClick(tab.href)}
									onNavigate={handleTabNavigate(index)}
									className={styles.link()}
								>
									<m.span
										initial={false}
										animate={{ scale: isHighlighted ? ICON_SCALE_KEYFRAMES : 1 }}
										transition={ICON_TRANSITION}
										className="flex"
									>
										<SvgIcon icon={tab.icon} size={24} className={styles.icon()} />
									</m.span>
									{tab.label}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>
			<AlertDialog
				open={loginPromptHref !== null}
				message={LOGIN_REQUIRED_MESSAGE}
				confirmLabel={LOGIN_CONFIRM_LABEL}
				closeLabel="닫기"
				onConfirm={handleLoginConfirm}
				onCancel={handleLoginCancel}
			/>
		</>
	);
}
