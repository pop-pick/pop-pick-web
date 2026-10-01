import type { ReactNode } from "react";

interface BottomActionBarProps {
	children: ReactNode;
}

export function BottomActionBar({ children }: BottomActionBarProps) {
	return (
		<div className="sticky bottom-0 z-40 mt-auto flex flex-col gap-2.5 rounded-t-3xl bg-bg-1 px-4 pt-4 pb-float-gap shadow-bar">
			{children}
		</div>
	);
}
