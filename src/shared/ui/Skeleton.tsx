import { cn } from "@/shared/lib/cn";

interface SkeletonProps {
	className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
	return <div aria-hidden className={cn("animate-pulse rounded-2xl bg-bg-3", className)} />;
}
