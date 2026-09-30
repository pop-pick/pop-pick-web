import Link from "next/link";

import { tv } from "@/shared/lib/tv";
import { buildPopupDetailPath } from "@/shared/model/popup-path";
import { SeparatedText } from "@/shared/ui/SeparatedText";

import type { CourseStop } from "../model/course";
import { toStopDetailParts } from "../model/course-format";

const courseStopCardVariants = tv({
	base: "flex min-w-0 flex-1 flex-col gap-1 rounded-panel border border-divider-2 bg-bg-1 p-4",
	variants: {
		isLink: {
			true: "focus-ring transition-colors hover:bg-bg-2"
		}
	}
});

interface CourseStopCardProps {
	stop: CourseStop;
}

export function CourseStopCard({ stop }: CourseStopCardProps) {
	const detailParts = toStopDetailParts(stop);
	const content = (
		<>
			<span className="text-b1-14 text-text-1">{stop.title}</span>
			{detailParts.length > 0 && (
				<span className="text-b3-12 text-text-3">
					<SeparatedText parts={detailParts} />
				</span>
			)}
		</>
	);

	if (stop.popupId === null) {
		return <div className={courseStopCardVariants({ isLink: false })}>{content}</div>;
	}

	return (
		<Link href={buildPopupDetailPath(stop.popupId)} className={courseStopCardVariants({ isLink: true })}>
			{content}
		</Link>
	);
}
