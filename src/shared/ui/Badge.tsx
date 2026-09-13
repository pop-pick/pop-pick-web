import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

const badgeVariants = cva("inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold", {
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

type BadgeProps = VariantProps<typeof badgeVariants> & {
	children: ReactNode;
	className?: string;
};

export function Badge({ tone, className, children }: BadgeProps) {
	return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}
