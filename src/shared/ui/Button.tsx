import type { ComponentProps } from "react";

import { tv, type VariantProps } from "@/shared/lib/tv";

export const buttonVariants = tv({
	base: "inline-flex shrink-0 items-center justify-center rounded-xl focus-ring transition-colors disabled:opacity-40 aria-disabled:opacity-40",
	variants: {
		variant: {
			primary:
				"bg-primary text-text-w not-disabled:not-aria-disabled:hover:bg-primary-strong disabled:bg-bg-4 disabled:text-text-6 disabled:opacity-100",
			secondary: "bg-bg-3 text-text-2 not-disabled:not-aria-disabled:hover:bg-bg-4",
			outline: "border border-primary bg-bg-1 text-primary not-disabled:not-aria-disabled:hover:bg-primary-subtle",
			outlineMuted: "border border-divider-2 bg-bg-1 text-text-3 not-disabled:not-aria-disabled:hover:bg-bg-2",
			tonal: "bg-primary-subtle text-primary not-disabled:not-aria-disabled:hover:bg-primary/15",
			text: "text-text-4 not-disabled:not-aria-disabled:hover:bg-bg-2",
			ghost: "text-primary not-disabled:not-aria-disabled:hover:bg-primary-subtle",
			strong: "bg-text-2 text-text-w not-disabled:not-aria-disabled:hover:bg-text-1",
			inverse: "bg-bg-1 text-primary not-disabled:not-aria-disabled:hover:bg-primary-subtle focus-visible:outline-bg-1",
			inverseText: "text-text-w not-disabled:not-aria-disabled:hover:bg-bg-1/10 focus-visible:outline-bg-1",
			kakao:
				"bg-kakao text-kakao-foreground not-disabled:not-aria-disabled:hover:bg-kakao-hover not-disabled:not-aria-disabled:active:bg-kakao-active",
			google:
				"border border-google-border bg-bg-1 text-google-foreground not-disabled:not-aria-disabled:hover:bg-bg-3 not-disabled:not-aria-disabled:active:bg-bg-4"
		},
		size: {
			sm: "h-10 gap-1 px-3 text-b1-14",
			md: "h-10.5 gap-2 px-4 text-b1-14",
			lg: "h-12 gap-2 px-5 text-h4",
			xl: "h-13 gap-2 px-5 text-h4"
		}
	},
	compoundVariants: [
		{ variant: "kakao", class: "gap-3 text-b2-16" },
		{ variant: "google", class: "gap-3 text-b2-14" }
	],
	defaultVariants: {
		variant: "primary",
		size: "lg"
	}
});

interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
	return <button type={type} className={buttonVariants({ variant, size, class: className })} {...props} />;
}
