"use client";

import type { Ref } from "react";

import { cn } from "@/shared/lib/cn";
import { IconButton } from "@/shared/ui/IconButton";

import type { PositionStatus } from "../hooks/useCurrentPosition";

interface CurrentLocationButtonProps {
	status: PositionStatus;
	onLocate: () => void;
	className?: string;
	ref?: Ref<HTMLButtonElement>;
}

/** 거부와 미지원은 다시 눌러도 결과가 같아 끈다. 측위 중은 눌림만 막고 포커스는 남긴다 */
export function CurrentLocationButton({ status, onLocate, className, ref }: CurrentLocationButtonProps) {
	const isDisabled = status === "denied" || status === "unavailable";
	const isBusy = status === "locating";

	return (
		<IconButton
			ref={ref}
			label="현재 위치로 이동"
			aria-busy={isBusy}
			disabled={isDisabled}
			onClick={() => {
				if (!isBusy) {
					onLocate();
				}
			}}
			className={cn(isBusy && "animate-pulse", className)}
		>
			<svg viewBox="0 0 24 24" aria-hidden className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
				<circle cx="12" cy="12" r="3" />
				<path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
				<circle cx="12" cy="12" r="8" />
			</svg>
		</IconButton>
	);
}
