import type { ReactNode } from "react";

import { tv, type VariantProps } from "@/shared/lib/tv";

const badgeVariants = tv({
	base: "inline-flex h-6 shrink-0 items-center justify-center rounded-lg px-2 text-b2-12",
	variants: {
		tone: {
			primary: "bg-primary-subtle text-primary",
			region: "bg-region-subtle text-region",
			neutral: "bg-bg-3 text-text-4"
		}
	},
	defaultVariants: {
		tone: "primary"
	}
});

interface BadgeProps extends VariantProps<typeof badgeVariants> {
	children: ReactNode;
	className?: string;
}

export function Badge({ tone, className, children }: BadgeProps) {
	return <span className={badgeVariants({ tone, class: className })}>{children}</span>;
}
