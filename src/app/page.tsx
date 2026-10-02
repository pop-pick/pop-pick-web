import { Suspense } from "react";

import { AuthStatusSwitch } from "@/features/auth/components/AuthStatusSwitch";
import { SessionRetry } from "@/features/auth/components/SessionRetry";
import { readRefreshToken } from "@/features/auth/model/session-cookie";
import { LandingDialog } from "@/features/onboarding/components/LandingDialog";
import { HomeHeader } from "@/features/recommendation/components/HomeHeader";
import { HomePickSection } from "@/features/recommendation/components/HomePickSection";
import { HomePopularSection } from "@/features/recommendation/components/HomePopularSection";
import { PickSectionSkeleton } from "@/features/recommendation/components/PickSectionSkeleton";
import { PopularSectionSkeleton } from "@/features/recommendation/components/PopularSectionSkeleton";
import { TasteBanner } from "@/features/recommendation/components/TasteBanner";
import { buildLoginPath } from "@/shared/model/login-path";
import { ONBOARDING_FIRST_STEP_PATH } from "@/shared/model/onboarding-path";

export default async function HomePage() {
	const hasSessionCookie = (await readRefreshToken()) !== null;
	const memberBanner = <TasteBanner audience="member" />;
	const guestBanner = <TasteBanner audience="guest" />;
	const sessionCookieBanner = hasSessionCookie ? memberBanner : guestBanner;

	return (
		<main className="flex flex-1 flex-col">
			<HomeHeader />
			<div className="flex flex-col gap-8 px-5">
				<AuthStatusSwitch
					views={{
						authenticated: memberBanner,
						anonymous: guestBanner,
						restoring: sessionCookieBanner,
						unavailable: sessionCookieBanner
					}}
				/>
				<div className="flex flex-col gap-10">
					<AuthStatusSwitch
						views={{
							authenticated: <HomePickSection />,
							restoring: hasSessionCookie ? <PickSectionSkeleton /> : null,
							unavailable: hasSessionCookie ? <SessionRetry /> : null
						}}
					/>
					<Suspense fallback={<PopularSectionSkeleton />}>
						<HomePopularSection />
					</Suspense>
				</div>
			</div>
			<AuthStatusSwitch
				views={{ anonymous: <LandingDialog loginHref={buildLoginPath(ONBOARDING_FIRST_STEP_PATH)} /> }}
			/>
		</main>
	);
}
