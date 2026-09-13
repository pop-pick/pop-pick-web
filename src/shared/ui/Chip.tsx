"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	selected?: boolean;
};

export function Chip({ selected = false, className, type = "button", ...props }: ChipProps) {
	return (
		<button
			type={type}
			aria-pressed={selected}
			className={cn(
				"rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
				"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
				selected
					? "border-blue-600 bg-blue-50 text-blue-700"
					: "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
				className
			)}
			{...props}
		/>
	);
}
