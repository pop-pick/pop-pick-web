import type { ReactNode } from "react";

import { tv, type VariantProps } from "@/shared/lib/tv";

const popupTagBadgeVariants = tv({
	base: "inline-flex h-6 shrink-0 items-center rounded-lg px-2 text-b2-12",
	variants: {
		tone: {
			category: "bg-primary-subtle text-primary",
			region: "bg-region-subtle text-region"
		}
	}
});

interface PopupTagBadgeProps {
	tone: NonNullable<VariantProps<typeof popupTagBadgeVariants>["tone"]>;
	children: ReactNode;
}

export function PopupTagBadge({ tone, children }: PopupTagBadgeProps) {
	return <span className={popupTagBadgeVariants({ tone })}>{children}</span>;
}
