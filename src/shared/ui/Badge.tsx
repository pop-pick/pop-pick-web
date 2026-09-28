import type { ReactNode } from "react";

import { tv, type VariantProps } from "@/shared/lib/tv";

const badgeVariants = tv({
	base: "inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold",
	variants: {
		tone: {
			neutral: "bg-zinc-100 text-zinc-700",
			accent: "bg-blue-50 text-blue-700",
			warning: "bg-amber-50 text-amber-800"
		}
	},
	defaultVariants: {
		tone: "neutral"
	}
});

interface BadgeProps extends VariantProps<typeof badgeVariants> {
	children: ReactNode;
	className?: string;
}

export function Badge({ tone, className, children }: BadgeProps) {
	return <span className={badgeVariants({ tone, class: className })}>{children}</span>;
}
