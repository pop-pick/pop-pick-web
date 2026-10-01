import type { ComponentProps } from "react";

import { tv, type VariantProps } from "@/shared/lib/tv";

export const iconButtonVariants = tv({
	base: "flex shrink-0 items-center justify-center focus-ring transition-colors aria-busy:motion-safe:animate-pulse",
	variants: {
		variant: {
			ghost: "rounded-full text-icon not-disabled:hover:bg-bg-3",
			outline:
				"rounded-xl border border-divider-2 bg-bg-1 text-icon-2 not-disabled:not-aria-disabled:hover:bg-bg-2 aria-disabled:cursor-not-allowed aria-disabled:text-icon-disabled",
			floating: "rounded-full bg-bg-1 text-icon-2 shadow-control not-disabled:hover:bg-bg-2 disabled:text-icon-disabled"
		},
		size: {
			sm: "size-8",
			md: "size-10",
			lg: "size-12"
		}
	},
	defaultVariants: {
		variant: "ghost",
		size: "lg"
	}
});

interface IconButtonProps extends ComponentProps<"button">, VariantProps<typeof iconButtonVariants> {
	label: string;
}

export function IconButton({ label, variant, size, className, type = "button", children, ...props }: IconButtonProps) {
	return (
		<button
			type={type}
			aria-label={label}
			className={iconButtonVariants({ variant, size, class: className })}
			{...props}
		>
			{children}
		</button>
	);
}
