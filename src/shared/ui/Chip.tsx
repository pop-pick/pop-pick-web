"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	isSelected?: boolean;
}

export function Chip({ isSelected = false, className, type = "button", ...props }: ChipProps) {
	return (
		<button
			type={type}
			aria-pressed={isSelected}
			className={cn(
				"rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 focus-ring transition-colors not-aria-pressed:hover:bg-zinc-50 aria-pressed:border-blue-600 aria-pressed:bg-blue-50 aria-pressed:text-blue-700",
				className
			)}
			{...props}
		/>
	);
}
