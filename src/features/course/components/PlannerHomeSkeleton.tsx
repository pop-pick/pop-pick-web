import { Skeleton } from "@/shared/ui/Skeleton";

import { COURSE_TABS } from "../model/course-tab";

export function PlannerHomeSkeleton() {
	return (
		<div role="status" className="flex flex-1 flex-col pt-17">
			<span className="sr-only">플래너를 불러오고 있습니다</span>
			<div className="flex gap-3 border-b border-divider-2 px-5 py-2">
				{COURSE_TABS.map((tab) => (
					<Skeleton key={tab} className="h-6 w-20 rounded-md" />
				))}
			</div>
			<div className="flex flex-col gap-5 px-5 pt-5">
				<Skeleton className="h-45.25 rounded-2xl" />
				<Skeleton className="h-49 rounded-2xl" />
			</div>
		</div>
	);
}
