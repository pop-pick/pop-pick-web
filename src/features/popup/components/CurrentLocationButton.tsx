"use client";

import type { Ref } from "react";

import GpsFixIcon from "@/shared/assets/icons/gps-fix.svg";
import { cn } from "@/shared/lib/cn";
import { IconButton } from "@/shared/ui/IconButton";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import type { PositionStatus } from "../hooks/useCurrentPosition";

interface CurrentLocationButtonProps {
	status: PositionStatus;
	onLocate: () => void;
	className?: string;
	ref?: Ref<HTMLButtonElement>;
}

export function CurrentLocationButton({ status, onLocate, className, ref }: CurrentLocationButtonProps) {
	const isDisabled = status === "denied" || status === "unavailable";
	const isBusy = status === "locating";

	const handleClick = () => {
		if (!isBusy) {
			onLocate();
		}
	};

	return (
		<IconButton
			ref={ref}
			label="현재 위치로 이동"
			aria-busy={isBusy}
			disabled={isDisabled}
			onClick={handleClick}
			className={cn(isBusy && "animate-pulse", className)}
		>
			<SvgIcon icon={GpsFixIcon} size={20} />
		</IconButton>
	);
}
