import type { ReactNode } from "react";

import { BottomTabBar } from "@/shared/ui/BottomTabBar";

export default function TabsLayout({ children }: { children: ReactNode }) {
	return (
		<>
			{children}
			<BottomTabBar />
		</>
	);
}
