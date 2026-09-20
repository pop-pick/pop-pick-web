import "@/shared/styles/globals.css";

import type { Metadata } from "next";

import { AuthProvider } from "@/features/auth/ui/AuthProvider";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { BottomTabBar } from "@/shared/ui/BottomTabBar";

export const metadata: Metadata = {
	title: "팝픽 POP PICK",
	description: "취향과 시간, 지역에 맞는 서울 팝업을 추천하고 방문 동선까지 짜주는 서비스"
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="ko" className="h-full antialiased">
			<body className="bg-zinc-100 font-sans text-foreground">
				<div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">
					<QueryProvider>
						<AuthProvider>
							{children}
							<BottomTabBar />
						</AuthProvider>
					</QueryProvider>
				</div>
			</body>
		</html>
	);
}
