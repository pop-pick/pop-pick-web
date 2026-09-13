import type { VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";
import { buttonVariants } from "@/shared/ui/Button";

type LinkButtonProps = ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

/** 이동은 링크여야 한다. 버튼과 같은 모양이 필요할 때 Button 대신 쓴다 */
export function LinkButton({ variant, size, className, ...props }: LinkButtonProps) {
	return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
