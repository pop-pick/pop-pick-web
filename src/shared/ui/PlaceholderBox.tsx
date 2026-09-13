import { cn } from "@/shared/lib/cn";

interface PlaceholderBoxProps {
	label: string;
	className?: string;
}

/** 이미지와 지도 자리를 비워 두는 상자다. 시안과 SDK가 붙으면 그 자리에서 지운다 */
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
