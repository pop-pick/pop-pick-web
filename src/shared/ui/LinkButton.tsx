import Link from "next/link";
import type { ComponentProps } from "react";

import type { VariantProps } from "@/shared/lib/tv";
import { buttonVariants } from "@/shared/ui/Button";

interface LinkButtonProps extends ComponentProps<typeof Link>, VariantProps<typeof buttonVariants> {}

export function LinkButton({ variant, size, className, ...props }: LinkButtonProps) {
	return <Link className={buttonVariants({ variant, size, class: className })} {...props} />;
}
