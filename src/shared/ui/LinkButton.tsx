import type { VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";
import { buttonVariants } from "@/shared/ui/Button";

type LinkButtonProps = ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

export function LinkButton({ variant, size, className, ...props }: LinkButtonProps) {
	return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
