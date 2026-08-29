import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:pointer-events-none disabled:opacity-40",
	{
		variants: {
			variant: {
				primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
				secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300",
				ghost: "text-blue-600 hover:bg-blue-50 active:bg-blue-100"
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
	}
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
	return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
