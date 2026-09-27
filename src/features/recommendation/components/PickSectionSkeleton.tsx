import { Skeleton } from "@/shared/ui/Skeleton";

export function PickSectionSkeleton() {
	return (
		<div role="status" className="flex flex-col gap-5">
			<span className="sr-only">추천 팝업을 불러오는 중입니다</span>
			<div className="flex items-center justify-between">
				<Skeleton className="h-6.75 w-35 rounded-lg" />
				<Skeleton className="h-4.5 w-16.5 rounded-lg" />
			</div>
			<div className="-mr-5 flex gap-4 overflow-hidden">
				<Skeleton className="h-88.25 w-64.75 shrink-0 rounded-lg" />
				<Skeleton className="h-88.25 w-64.75 shrink-0 rounded-lg" />
			</div>
		</div>
	);
}
