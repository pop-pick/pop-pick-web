import { useId } from "react";

import ArrowUpRightIcon from "@/shared/assets/icons/arrow-up-right.svg";
import { tv } from "@/shared/lib/tv";
import { LinkButton } from "@/shared/ui/LinkButton";
import { SvgIcon } from "@/shared/ui/SvgIcon";

interface CourseStartBannerProps {
	title: string;
	actionLabel: string;
	actionHref: string;
	isActionWide?: boolean;
}

const startActionVariants = tv({
	base: "mt-5",
	variants: {
		isWide: {
			true: "self-stretch",
			false: "w-50.25"
		}
	}
});

export function CourseStartBanner({ title, actionLabel, actionHref, isActionWide = false }: CourseStartBannerProps) {
	const titleId = useId();

	return (
		<section aria-labelledby={titleId} className="flex flex-col items-center rounded-2xl bg-bg-2 p-5">
			<h2 id={titleId} className="text-center text-b1-18 text-text-1">
				{title}
			</h2>
			<p className="mt-3 text-center text-b2-14 whitespace-pre-line text-text-2">
				{"취향, 동행, 시간 맞춤\n최적의 동선을 설계해 드려요"}
			</p>
			<LinkButton href={actionHref} size="sm" className={startActionVariants({ isWide: isActionWide })}>
				{actionLabel}
				<SvgIcon icon={ArrowUpRightIcon} size={16} />
			</LinkButton>
		</section>
	);
}
