import "@/shared/styles/globals.css";

import type { Metadata } from "next";

import { QueryProvider } from "@/shared/providers/QueryProvider";

export const metadata: Metadata = {
	title: "팝픽 POP PICK",
	description: "취향과 시간, 지역에 맞는 서울 팝업을 추천하고 방문 동선까지 짜주는 서비스"
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="ko" className="h-full antialiased">
			<body className="flex min-h-full flex-col bg-background font-sans text-foreground">
				<QueryProvider>{children}</QueryProvider>
			</body>
		</html>
	);
}
