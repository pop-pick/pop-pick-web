import "@/shared/styles/globals.css";

import type { Metadata, Viewport } from "next";

import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { AuthStatusSwitch } from "@/features/auth/components/AuthStatusSwitch";
import { BottomTabBar } from "@/shared/components/BottomTabBar";
import { cn } from "@/shared/lib/cn";
import { buildLoginPath } from "@/shared/model/login-path";
import { SITE_ICONS, SITE_NAME, SITE_OPEN_GRAPH } from "@/shared/model/site-metadata";
import { MotionProvider } from "@/shared/providers/MotionProvider";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { pretendard } from "@/shared/styles/fonts";

export const metadata: Metadata = {
	title: { template: `%s | ${SITE_NAME}`, default: SITE_NAME },
	description: "취향과 시간, 지역에 맞는 서울 팝업을 추천하고 방문 동선까지 짜주는 서비스",
	icons: SITE_ICONS,
	openGraph: SITE_OPEN_GRAPH,
	twitter: { card: "summary_large_image" }
};

const LOGIN_HREF_BY_TAB = {
	"/planner": buildLoginPath("/planner"),
	"/my": buildLoginPath("/my")
};

export const viewport: Viewport = {
	viewportFit: "cover"
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="ko"
			className={cn(
				pretendard.variable,
				"h-full scrollbar-subtle scroll-pb-tab-bar-clearance scrollbar-gutter-stable antialiased"
			)}
		>
			<body className="bg-bg-3 font-sans text-text-1">
				<div className="mx-auto flex min-h-dvh w-full max-w-app flex-col bg-bg-1">
					<QueryProvider>
						<AuthProvider>
							<MotionProvider>
								{children}
								<AuthStatusSwitch
									views={{
										restoring: <BottomTabBar />,
										anonymous: <BottomTabBar loginHrefByTab={LOGIN_HREF_BY_TAB} />,
										unavailable: <BottomTabBar />,
										authenticated: <BottomTabBar />
									}}
								/>
							</MotionProvider>
						</AuthProvider>
					</QueryProvider>
				</div>
			</body>
		</html>
	);
}
