import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

/** 44px는 터치 타깃 최소 크기다. Button의 md(48px)와 다른 값이라 따로 둔다 */
export const iconButtonVariants = cva(
	"flex size-11 items-center justify-center rounded-full transition-colors focus-ring",
	{
		variants: {
			variant: {
				surface:
					"border border-zinc-200 bg-background text-zinc-700 shadow-md not-disabled:hover:bg-zinc-50 disabled:text-zinc-300 disabled:shadow-none",
				ghost: "text-zinc-500 not-disabled:hover:bg-zinc-100"
			}
		},
		defaultVariants: {
			variant: "surface"
		}
	}
);

type IconButtonProps = ComponentProps<"button"> &
	VariantProps<typeof iconButtonVariants> & {
		/** 아이콘만 있는 버튼이라 읽어 줄 이름이 필수다 */
		label: string;
	};

export function IconButton({ label, variant, className, type = "button", children, ...props }: IconButtonProps) {
	return (
		<button type={type} aria-label={label} className={cn(iconButtonVariants({ variant }), className)} {...props}>
			{children}
		</button>
	);
}
