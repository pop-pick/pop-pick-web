"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";

interface ListMoreTriggerProps {
	isLoading: boolean;
	isFailed: boolean;
	loadingLabel: string;
	failureMessage: string;
	skeletonClassName: string;
	onLoadMore: () => void;
}

export function ListMoreTrigger({
	isLoading,
	isFailed,
	loadingLabel,
	failureMessage,
	skeletonClassName,
	onLoadMore
}: ListMoreTriggerProps) {
	const triggerRef = useRef<HTMLDivElement>(null);
	const isFailureShown = isFailed && !isLoading;

	useEffect(() => {
		const trigger = triggerRef.current;

		if (trigger === null || isLoading || isFailed) {
			return;
		}

		const observer = new IntersectionObserver((entries) => {
			if (entries.some((entry) => entry.isIntersecting)) {
				onLoadMore();
			}
		});

		observer.observe(trigger);

		return () => {
			observer.disconnect();
		};
	}, [isLoading, isFailed, onLoadMore]);

	const buildAnnouncement = () => {
		if (isLoading) {
			return loadingLabel;
		}

		return isFailureShown ? failureMessage : "";
	};

	return (
		<div ref={triggerRef}>
			<p role="status" className="sr-only">
				{buildAnnouncement()}
			</p>
			{isLoading && <Skeleton className={skeletonClassName} />}
			{isFailureShown && (
				<div className="flex flex-col items-center gap-3 py-4 text-center">
					<p aria-hidden className="text-b3-14 text-text-3">
						{failureMessage}
					</p>
					<Button variant="secondary" onClick={onLoadMore}>
						다시 시도
					</Button>
				</div>
			)}
		</div>
	);
}
