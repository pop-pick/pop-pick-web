import { PageHeader } from "@/shared/components/PageHeader";
import { PLANNER_PATH } from "@/shared/model/planner-path";
import { Skeleton } from "@/shared/ui/Skeleton";

import { PLANNER_FORM_TITLE } from "../model/planner-form";

export function PlannerFormSkeleton() {
	return (
		<>
			<PageHeader title={PLANNER_FORM_TITLE} fallbackPath={PLANNER_PATH} isSticky />
			<div role="status" className="flex flex-1 flex-col gap-10 px-5 pt-1.75">
				<span className="sr-only">조건 입력을 준비하고 있습니다</span>
				<Skeleton className="h-51.25" />
				<Skeleton className="h-60" />
			</div>
		</>
	);
}
