"use client";

import type { AnimationItem } from "lottie-web";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const ANIMATION_SIZE = 250;
const POSTER_FRAME = 23;

async function loadGeneratingAnimation() {
	const [{ default: lottie }, { default: animationData }] = await Promise.all([
		import("lottie-web/build/player/lottie_light"),
		import("@/shared/assets/lottie/planner-generating.json")
	]);

	return { lottie, animationData };
}

export function GeneratingSpinner() {
	const containerRef = useRef<HTMLDivElement>(null);
	const shouldReduceMotion = useReducedMotion() === true;
	const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
	const isPosterShown = shouldReduceMotion || !isAnimationPlaying;

	useEffect(() => {
		const container = containerRef.current;

		if (shouldReduceMotion || container === null) {
			return;
		}

		let animation: AnimationItem | undefined;
		let isUnmounted = false;

		loadGeneratingAnimation()
			.then(({ lottie, animationData }) => {
				if (isUnmounted) {
					return;
				}

				animation = lottie.loadAnimation({ container, renderer: "svg", loop: true, autoplay: false, animationData });
				animation.goToAndPlay(POSTER_FRAME, true);
				setIsAnimationPlaying(true);
			})
			.catch((error: unknown) => {
				console.warn("[planner] 생성중 애니메이션을 불러오지 못했다", error);
			});

		return () => {
			isUnmounted = true;
			animation?.destroy();
		};
	}, [shouldReduceMotion]);

	return (
		<div className="relative size-22.5">
			{isPosterShown && (
				<Image
					src="/illustrations/planner-generating-ring.svg"
					alt=""
					width={ANIMATION_SIZE}
					height={ANIMATION_SIZE}
					loading="eager"
					className="pointer-events-none absolute -inset-20 max-w-none"
				/>
			)}
			<div ref={containerRef} aria-hidden className="pointer-events-none absolute -inset-20" />
		</div>
	);
}
