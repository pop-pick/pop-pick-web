import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type PopupTagTone = "category" | "region";

const TONE_CLASSES: Record<PopupTagTone, string> = {
	category: "bg-primary-subtle text-primary",
	region: "bg-region-subtle text-region"
};

interface PopupTagBadgeProps {
	tone: PopupTagTone;
	children: ReactNode;
}

export function PopupTagBadge({ tone, children }: PopupTagBadgeProps) {
	return (
		<span className={cn("inline-flex h-6 shrink-0 items-center rounded-lg px-2 text-b2-12", TONE_CLASSES[tone])}>
			{children}
		</span>
	);
}
