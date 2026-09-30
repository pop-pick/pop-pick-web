import { usePathname } from "next/navigation";

import { CourseView } from "@/features/course/components/CourseView";
import { PlannerHome } from "@/features/course/components/PlannerHome";
import { PlannerFormFromUrl } from "@/features/planner/components/PlannerFormFromUrl";

const COURSE_PATH_PATTERN = /^\/courses\/(\d+)(\/saved)?$/;

export function PlannerRoutes() {
	const pathname = usePathname();
	const courseMatch = COURSE_PATH_PATTERN.exec(pathname);

	if (pathname === "/planner/new") {
		return <PlannerFormFromUrl />;
	}

	if (pathname === "/planner") {
		return <PlannerHome />;
	}

	if (courseMatch !== null) {
		return <CourseView key={pathname} courseId={Number(courseMatch[1])} view={courseMatch[2] ? "saved" : "detail"} />;
	}

	return <p>{`${pathname} 화면`}</p>;
}
