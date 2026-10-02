import { Skeleton } from "@/shared/ui/Skeleton";

const SKELETON_ROW_KEYS = ["first", "second", "third"];

export function PopularRowsSkeleton() {
	return (
		<div role="status" className="flex flex-col gap-4">
			<span className="sr-only">인기 팝업을 불러오는 중입니다</span>
			{SKELETON_ROW_KEYS.map((key) => (
				<div key={key} className="flex items-center gap-3">
					<Skeleton className="size-18 shrink-0 rounded-lg" />
					<div className="flex flex-1 flex-col gap-2">
						<Skeleton className="h-5 w-3/5 rounded-lg" />
						<Skeleton className="h-4 w-2/5 rounded-lg" />
					</div>
				</div>
			))}
		</div>
	);
}
