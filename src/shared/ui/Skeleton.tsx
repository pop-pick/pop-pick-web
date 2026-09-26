import { cn } from "@/shared/lib/cn";

export function Skeleton({ className }: { className?: string }) {
	return <div aria-hidden className={cn("animate-pulse rounded-2xl bg-zinc-100", className)} />;
}
