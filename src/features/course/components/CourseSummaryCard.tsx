import Link from "next/link";

import { tv } from "@/shared/lib/tv";

import type { Course } from "../model/course";
import { CourseSummaryRows } from "./CourseSummaryRows";

interface CourseSummaryCardProps {
	course: Course;
	registeredAt: string;
	href?: string;
}

const courseSummaryCardVariants = tv({
	base: "flex flex-col gap-3 rounded-2xl border border-divider-2 bg-bg-1 p-4",
	variants: {
		isLink: {
			true: "focus-ring transition-colors hover:bg-bg-2"
		}
	}
});

export function CourseSummaryCard({ course, registeredAt, href }: CourseSummaryCardProps) {
	const content = (
		<>
			<p className="text-b1-14 text-text-3">일정 요약</p>
			<CourseSummaryRows course={course} />
			<p className="border-t border-divider-1 pt-2.75 text-b3-12 text-text-4">등록일 {registeredAt}</p>
		</>
	);

	if (href === undefined) {
		return <section className={courseSummaryCardVariants({ isLink: false })}>{content}</section>;
	}

	return (
		<Link href={href} className={courseSummaryCardVariants({ isLink: true })}>
			{content}
		</Link>
	);
}
