import { cn } from "@/shared/lib/cn";

interface PlaceholderBoxProps {
	label: string;
	className?: string;
}

export function PlaceholderBox({ label, className }: PlaceholderBoxProps) {
	return (
		<div
			className={cn(
				"flex items-center justify-center rounded-2xl bg-zinc-100 text-xs font-medium text-zinc-400",
				className
			)}
		>
			{label}
		</div>
	);
}
