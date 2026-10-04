import Link from "next/link";

import { tv } from "@/shared/lib/tv";
import { buildPopupDetailPath } from "@/shared/model/popup-path";

import type { CourseStop } from "../model/course";

interface CourseStopCardProps {
	stop: CourseStop;
}

const courseStopCardVariants = tv({
	base: "flex min-w-0 flex-1 flex-col gap-1 rounded-2xl border border-divider-2 bg-bg-1 p-4",
	variants: {
		isLink: {
			true: "focus-ring transition-colors hover:bg-bg-2"
		}
	}
});

export function CourseStopCard({ stop }: CourseStopCardProps) {
	const content = (
		<>
			<span className="text-b1-14 text-text-1">{stop.title}</span>
			{stop.address !== null && <span className="text-b3-12 text-text-3">{stop.address}</span>}
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
