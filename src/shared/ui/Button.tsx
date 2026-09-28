import type { ButtonHTMLAttributes } from "react";

import { tv, type VariantProps } from "@/shared/lib/tv";

export const buttonVariants = tv({
	base: "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold focus-ring transition-colors disabled:opacity-40",
	variants: {
		variant: {
			primary: "bg-primary text-text-w not-disabled:hover:bg-primary-strong",
			secondary: "bg-bg-3 text-text-2 not-disabled:hover:bg-bg-4",
			ghost: "text-primary not-disabled:hover:bg-primary-subtle",
			kakao: "bg-kakao text-kakao-foreground not-disabled:hover:bg-kakao-hover not-disabled:active:bg-kakao-active"
		},
		size: {
			md: "h-12 px-5 text-base",
			lg: "h-14 px-6 text-lg"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
	return <button type={type} className={buttonVariants({ variant, size, class: className })} {...props} />;
}
