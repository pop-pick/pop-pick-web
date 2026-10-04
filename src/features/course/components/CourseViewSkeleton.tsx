import { Skeleton } from "@/shared/ui/Skeleton";

export function CourseViewSkeleton() {
	return (
		<div role="status" className="flex flex-1 flex-col gap-5 px-5 pt-6">
			<span className="sr-only">일정을 불러오고 있습니다</span>
			<Skeleton className="h-38" />
			<Skeleton className="h-70" />
		</div>
	);
}
