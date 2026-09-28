import type { Metadata } from "next";
import { Suspense } from "react";

import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { PlannerHome } from "@/features/course/components/PlannerHome";
import { PlannerHomeSkeleton } from "@/features/course/components/PlannerHomeSkeleton";
import { PLANNER_PATH } from "@/shared/model/planner-path";

export const metadata: Metadata = {
	title: "플래너"
};

export default function PlannerPage() {
	return (
		<main className="flex flex-1 flex-col">
			<h1 className="sr-only">플래너</h1>
			<RequireAuth nextPath={PLANNER_PATH} fallback={<PlannerHomeSkeleton />}>
				<Suspense fallback={<PlannerHomeSkeleton />}>
					<PlannerHome />
				</Suspense>
			</RequireAuth>
		</main>
	);
}
