import type { ComponentProps } from "react";

import { tv, type VariantProps } from "@/shared/lib/tv";

export const iconButtonVariants = tv({
	base: "flex size-11 items-center justify-center rounded-full focus-ring transition-colors",
	variants: {
		variant: {
			surface:
				"border border-zinc-200 bg-bg-1 text-zinc-700 shadow-md not-disabled:hover:bg-zinc-50 disabled:text-zinc-300 disabled:shadow-none",
			ghost: "text-zinc-500 not-disabled:hover:bg-zinc-100"
		}
	},
	defaultVariants: {
		variant: "surface"
	}
});

interface IconButtonProps extends ComponentProps<"button">, VariantProps<typeof iconButtonVariants> {
	label: string;
}

export function IconButton({ label, variant, className, type = "button", children, ...props }: IconButtonProps) {
	return (
		<button type={type} aria-label={label} className={iconButtonVariants({ variant, class: className })} {...props}>
			{children}
		</button>
	);
}
