import { MY_PAGE_TABS } from "@/shared/model/my-page-tab";
import { Skeleton } from "@/shared/ui/Skeleton";

const MENU_ROW_COUNT = 3;

export function MyPageSkeleton() {
	return (
		<div role="status" className="flex flex-1 flex-col">
			<span className="sr-only">마이페이지를 불러오고 있습니다</span>
			<div className="flex h-10 items-center gap-3 border-b border-divider-2 px-5">
				{MY_PAGE_TABS.map((tab) => (
					<Skeleton key={tab} className="h-6 w-24 rounded-md" />
				))}
			</div>
			<div className="flex min-h-80 flex-col items-center px-5 pt-20 pb-8">
				<Skeleton className="size-16 rounded-2xl" />
				<Skeleton className="mt-6 h-7 w-48 rounded-md" />
				<Skeleton className="mt-18 h-45 w-full rounded-2xl" />
			</div>
			<div className="mt-auto flex flex-col bg-bg-2 pt-4 pb-tab-bar-clearance">
				{Array.from({ length: MENU_ROW_COUNT }, (_, index) => (
					<div key={index} className="flex h-11 items-center px-5">
						<Skeleton className="h-4 w-40 rounded-md" />
					</div>
				))}
			</div>
		</div>
	);
}
