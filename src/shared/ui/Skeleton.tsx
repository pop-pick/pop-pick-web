import { cn } from "@/shared/lib/cn";

interface SkeletonProps {
	className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
	return <div aria-hidden className={cn("rounded-2xl bg-bg-3 motion-safe:animate-pulse", className)} />;
}
