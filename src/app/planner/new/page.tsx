import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthStatusSwitch } from "@/features/auth/components/AuthStatusSwitch";
import { SessionRetry } from "@/features/auth/components/SessionRetry";
import { buildLoginPath } from "@/features/auth/model/next-path";
import { PlannerFormFromUrl } from "@/features/planner/components/PlannerFormFromUrl";
import { PLANNER_NEW_PATH } from "@/shared/model/planner-path";

export const metadata: Metadata = {
	title: "코스 만들기"
};

export default function PlannerNewPage() {
	const pendingForm = <PlannerFormFromUrl mode="pending" />;

	return (
		<main className="flex flex-1 flex-col">
			<Suspense>
				<AuthStatusSwitch
					views={{
						anonymous: <PlannerFormFromUrl mode="guest" loginHref={buildLoginPath(PLANNER_NEW_PATH)} />,
						authenticated: <PlannerFormFromUrl mode="member" />,
						restoring: pendingForm,
						unavailable: (
							<>
								<div className="px-5 pt-17">
									<SessionRetry />
								</div>
								{pendingForm}
							</>
						)
					}}
				/>
			</Suspense>
		</main>
	);
}
