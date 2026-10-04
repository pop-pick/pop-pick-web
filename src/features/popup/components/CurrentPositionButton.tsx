import type { Ref } from "react";

import GpsFixIcon from "@/shared/assets/icons/gps-fix.svg";
import { cn } from "@/shared/lib/cn";
import { IconButton } from "@/shared/ui/IconButton";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import type { PositionStatus } from "../model/position-status";

interface CurrentPositionButtonProps {
	status: PositionStatus;
	onLocate: () => void;
	className?: string;
	ref?: Ref<HTMLButtonElement>;
}

export function CurrentPositionButton({ status, onLocate, className, ref }: CurrentPositionButtonProps) {
	const isDisabled = status === "denied" || status === "unavailable";
	const isBusy = status === "locating";

	const handleClick = () => {
		if (!isBusy && !isDisabled) {
			onLocate();
		}
	};

	return (
		<IconButton
			ref={ref}
			label="현재 위치로 이동"
			variant="floating"
			size="md"
			aria-busy={isBusy}
			aria-disabled={isDisabled || undefined}
			onClick={handleClick}
			className={cn(
				"aria-disabled:cursor-not-allowed aria-disabled:text-icon-disabled aria-disabled:hover:bg-bg-1",
				className
			)}
		>
			<SvgIcon icon={GpsFixIcon} size={24} />
		</IconButton>
	);
}
