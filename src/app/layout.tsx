import "@/shared/styles/globals.css";

import type { Metadata, Viewport } from "next";

import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { BottomTabBar } from "@/shared/components/BottomTabBar";
import { cn } from "@/shared/lib/cn";
import { MotionProvider } from "@/shared/providers/MotionProvider";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { pretendard } from "@/shared/styles/fonts";

export const metadata: Metadata = {
	title: "팝픽 POP PICK",
	description: "취향과 시간, 지역에 맞는 서울 팝업을 추천하고 방문 동선까지 짜주는 서비스"
};

export const viewport: Viewport = {
	viewportFit: "cover"
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="ko"
			className={cn(pretendard.variable, "h-full scrollbar-subtle scroll-pb-tab-bar-clearance antialiased")}
		>
			<body className="bg-bg-3 font-sans text-text-1">
				<div className="mx-auto flex min-h-dvh w-full max-w-app flex-col bg-bg-1">
					<QueryProvider>
						<AuthProvider>
							<MotionProvider>
								{children}
								<BottomTabBar />
							</MotionProvider>
						</AuthProvider>
					</QueryProvider>
				</div>
			</body>
		</html>
	);
}
