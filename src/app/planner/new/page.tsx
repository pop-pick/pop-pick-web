import type { Metadata } from "next";
import { Suspense } from "react";

import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { PlannerFormFromUrl } from "@/features/planner/components/PlannerFormFromUrl";
import { PlannerFormSkeleton } from "@/features/planner/components/PlannerFormSkeleton";
import { toUrlSearchParams } from "@/shared/lib/search-params";
import { PLANNER_NEW_PATH } from "@/shared/model/planner-path";

export const metadata: Metadata = {
	title: "코스 만들기"
};

export default async function PlannerNewPage({ searchParams }: PageProps<"/planner/new">) {
	const query = toUrlSearchParams(await searchParams).toString();

	return (
		<main className="flex flex-1 flex-col">
			<RequireAuth
				nextPath={query === "" ? PLANNER_NEW_PATH : `${PLANNER_NEW_PATH}?${query}`}
				fallback={<PlannerFormSkeleton />}
			>
				<Suspense fallback={<PlannerFormSkeleton />}>
					<PlannerFormFromUrl />
				</Suspense>
			</RequireAuth>
		</main>
	);
}
