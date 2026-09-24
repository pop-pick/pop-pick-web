import { cn } from "@/shared/lib/cn";

/** 모양만 그린다. 무엇을 기다리는지는 감싸는 쪽의 role="status" 문구가 알린다 */
export function Skeleton({ className }: { className?: string }) {
	return <div aria-hidden className={cn("animate-pulse rounded-2xl bg-zinc-100", className)} />;
}
