import Link from "next/link";

import ArrowUpRightIcon from "@/shared/assets/icons/arrow-up-right.svg";
import { tv } from "@/shared/lib/tv";
import { PLANNER_NEW_PATH } from "@/shared/model/planner-path";
import { SvgIcon } from "@/shared/ui/SvgIcon";

const startActionVariants = tv({
	base: "mt-5 flex h-10 items-center justify-center gap-1 rounded-xl bg-primary px-6.5 text-b1-14 text-text-w focus-ring transition-colors hover:bg-primary-strong",
	variants: {
		isWide: {
			true: "self-stretch"
		}
	}
});

interface CourseStartBannerProps {
	actionLabel: string;
	isActionWide?: boolean;
}

export function CourseStartBanner({ actionLabel, isActionWide = false }: CourseStartBannerProps) {
	return (
		<section aria-labelledby="course-start-title" className="flex flex-col items-center rounded-2xl bg-bg-2 p-5">
			<h2 id="course-start-title" className="text-center text-b1-18 text-text-1">
				AI 코스 생성은 POP PICK
			</h2>
			<p className="mt-3 text-center text-b2-14 whitespace-pre-line text-text-2">
				{"취향, 동행, 시간 맞춤\n최적의 동선을 설계해 드려요"}
			</p>
			<Link href={PLANNER_NEW_PATH} className={startActionVariants({ isWide: isActionWide })}>
				{actionLabel}
				<SvgIcon icon={ArrowUpRightIcon} size={16} />
			</Link>
		</section>
	);
}
