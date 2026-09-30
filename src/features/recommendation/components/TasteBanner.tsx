import Image from "next/image";
import Link from "next/link";

import ArrowUpRightIcon from "@/shared/assets/icons/arrow-up-right.svg";
import { ONBOARDING_FIRST_STEP_PATH } from "@/shared/model/onboarding-path";
import { PLANNER_NEW_PATH } from "@/shared/model/planner-path";
import { SvgIcon } from "@/shared/ui/SvgIcon";

const PINS_WIDTH = 105;
const PINS_HEIGHT = 102;

const BANNER_ACTIONS = {
	member: { label: "AI POP PICK 시작하기", href: PLANNER_NEW_PATH },
	guest: { label: "나에게 맞는 팝업 찾기", href: ONBOARDING_FIRST_STEP_PATH }
} as const;

interface TasteBannerProps {
	audience: keyof typeof BANNER_ACTIONS;
}

export function TasteBanner({ audience }: TasteBannerProps) {
	const action = BANNER_ACTIONS[audience];

	return (
		<section
			aria-labelledby="taste-banner-title"
			className="relative flex h-55 flex-col justify-between rounded-2xl bg-bg-2 p-5"
		>
			<Image
				src="/illustrations/banner-pins.svg"
				alt=""
				width={PINS_WIDTH}
				height={PINS_HEIGHT}
				loading="eager"
				className="absolute top-6 right-4.5"
			/>
			<div className="relative flex w-46.25 flex-col gap-3">
				<h2 id="taste-banner-title" className="text-b1-18 text-text-1">
					나에게 맞는 팝업을
					<br />
					찾아볼까요?
				</h2>
				<p className="text-b2-14 text-text-2">
					취향을 설정하면 POP PICK이
					<br />
					맞춤 팝업을 추천해드려요.
				</p>
			</div>
			<Link
				href={action.href}
				className="relative flex h-10 items-center justify-center gap-1 rounded-xl bg-text-2 px-3 text-b1-14 text-text-w focus-ring transition-colors hover:bg-text-1"
			>
				{action.label}
				<SvgIcon icon={ArrowUpRightIcon} size={16} className="text-icon-w" />
			</Link>
		</section>
	);
}
