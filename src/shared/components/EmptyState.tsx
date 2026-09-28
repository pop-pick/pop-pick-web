import type { ReactNode } from "react";

import WarningCircleIcon from "@/shared/assets/icons/warning-circle.svg";
import { cn } from "@/shared/lib/cn";
import { SvgIcon } from "@/shared/ui/SvgIcon";

interface EmptyStateProps {
	title: string;
	description?: string;
	action?: ReactNode;
	hasWarningIcon?: boolean;
	className?: string;
}

export function EmptyState({ title, description, action, hasWarningIcon = false, className }: EmptyStateProps) {
	return (
		<div className={cn("flex flex-col items-center text-center", className)}>
			{hasWarningIcon && (
				<div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-error-bg text-error">
					<SvgIcon icon={WarningCircleIcon} size={32} />
				</div>
			)}
			<div className="flex flex-col gap-3">
				<p className="text-h3 text-text-1">{title}</p>
				{description !== undefined && <p className="text-b3-14 whitespace-pre-line text-text-4">{description}</p>}
			</div>
			{action !== undefined && <div className="mt-6">{action}</div>}
		</div>
	);
}
