"use client";

import type { Ref } from "react";

import GpsFixIcon from "@/shared/assets/icons/gps-fix.svg";
import { cn } from "@/shared/lib/cn";
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
		if (!isBusy) {
			onLocate();
		}
	};

	return (
		<button
			ref={ref}
			type="button"
			aria-label="현재 위치로 이동"
			aria-busy={isBusy}
			disabled={isDisabled}
			onClick={handleClick}
			className={cn(
				"flex size-10 items-center justify-center rounded-full bg-bg-1 text-icon-2 shadow-floating focus-ring transition-colors not-disabled:hover:bg-bg-2 disabled:text-icon-disabled aria-busy:animate-pulse",
				className
			)}
		>
			<SvgIcon icon={GpsFixIcon} size={24} />
		</button>
	);
}
