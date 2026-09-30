import { AuthStatusSwitch } from "@/features/auth/components/AuthStatusSwitch";
import { SessionRetry } from "@/features/auth/components/SessionRetry";
import { readRefreshToken } from "@/features/auth/model/session-cookie";
import { LandingDialog } from "@/features/onboarding/components/LandingDialog";
import { HomeHeader } from "@/features/recommendation/components/HomeHeader";
import { PickSection } from "@/features/recommendation/components/PickSection";
import { PickSectionSkeleton } from "@/features/recommendation/components/PickSectionSkeleton";
import { PopularSection } from "@/features/recommendation/components/PopularSection";
import { TasteBanner } from "@/features/recommendation/components/TasteBanner";
import { TrendingRegions } from "@/features/recommendation/components/TrendingRegions";
import {
	PLACEHOLDER_POPULAR_POPUPS,
	PLACEHOLDER_RECOMMENDED_POPUPS,
	PLACEHOLDER_TRENDING_REGIONS
} from "@/features/recommendation/model/placeholder-home";
import { PLACEHOLDER_NICKNAME } from "@/shared/lib/placeholder-data";
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
							authenticated: (
								<PickSection nickname={PLACEHOLDER_NICKNAME} recommendations={PLACEHOLDER_RECOMMENDED_POPUPS} />
							),
							restoring: hasSessionCookie ? <PickSectionSkeleton /> : null,
							unavailable: hasSessionCookie ? <SessionRetry /> : null
						}}
					/>
					<PopularSection popularPopups={PLACEHOLDER_POPULAR_POPUPS} />
					<TrendingRegions regions={PLACEHOLDER_TRENDING_REGIONS} />
				</div>
			</div>
			<AuthStatusSwitch
				views={{ anonymous: <LandingDialog loginHref={buildLoginPath(ONBOARDING_FIRST_STEP_PATH)} /> }}
			/>
		</main>
	);
}
