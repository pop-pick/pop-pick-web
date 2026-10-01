import Image from "next/image";

import ArrowUpRightIcon from "@/shared/assets/icons/arrow-up-right.svg";
import { ONBOARDING_FIRST_STEP_PATH } from "@/shared/model/onboarding-path";
import { PLANNER_NEW_PATH } from "@/shared/model/planner-path";
import { LinkButton } from "@/shared/ui/LinkButton";
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
			className="flex h-55 flex-col justify-between rounded-2xl bg-bg-2 p-5"
		>
			<div className="flex items-start">
				<div className="flex w-46.25 shrink-0 flex-col gap-3">
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
				<Image
					src="/images/illustrations/banner-pins.svg"
					alt=""
					width={PINS_WIDTH}
					height={PINS_HEIGHT}
					loading="eager"
					className="mt-1 -mr-0.5 ml-auto h-auto min-w-0 shrink"
				/>
			</div>
			<LinkButton href={action.href} variant="strong" size="sm">
				{action.label}
				<SvgIcon icon={ArrowUpRightIcon} size={16} className="text-icon-w" />
			</LinkButton>
		</section>
	);
}
