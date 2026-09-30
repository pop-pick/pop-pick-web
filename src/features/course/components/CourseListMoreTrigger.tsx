"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";

interface CourseListMoreTriggerProps {
	isLoading: boolean;
	isFailed: boolean;
	onMore: () => void;
}

export function CourseListMoreTrigger({ isLoading, isFailed, onMore }: CourseListMoreTriggerProps) {
	const triggerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const trigger = triggerRef.current;

		if (trigger === null || isLoading || isFailed) {
			return;
		}

		const observer = new IntersectionObserver((entries) => {
			if (entries.some((entry) => entry.isIntersecting)) {
				onMore();
			}
		});

		observer.observe(trigger);

		return () => {
			observer.disconnect();
		};
	}, [isLoading, isFailed, onMore]);

	if (isFailed) {
		return (
			<div className="flex flex-col items-center gap-3 py-4 text-center">
				<p className="text-b3-14 text-text-3">일정을 더 불러오지 못했어요.</p>
				<Button variant="secondary" onClick={onMore}>
					다시 시도
				</Button>
			</div>
		);
	}

	return (
		<div ref={triggerRef}>
			{isLoading && (
				<div role="status">
					<span className="sr-only">일정을 더 불러오고 있습니다</span>
					<Skeleton className="h-45.25 rounded-2xl" />
				</div>
			)}
		</div>
	);
}
