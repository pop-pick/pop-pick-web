import type { UseEmblaCarouselType } from "embla-carousel-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

type EmblaApi = UseEmblaCarouselType[1];

export function useCarouselAutoplay(emblaApi: EmblaApi, delay: number) {
	const shouldReduceMotion = useReducedMotion();
	const [isStopped, setIsStopped] = useState(false);
	const isPlaying = !isStopped && shouldReduceMotion !== true;

	useEffect(() => {
		if (emblaApi === undefined || !isPlaying) {
			return;
		}

		const root = emblaApi.rootNode();
		let timerId: number | undefined;
		let isHovered = false;
		let hasFocusWithin = false;

		const restartAutoplayTimer = () => {
			window.clearTimeout(timerId);

			if (isHovered || hasFocusWithin || document.hidden) {
				return;
			}

			timerId = window.setTimeout(() => {
				emblaApi.scrollNext();
			}, delay);
		};

		const handleUserInteraction = () => {
			setIsStopped(true);
		};

		const handleMouseEnter = () => {
			isHovered = true;
			restartAutoplayTimer();
		};

		const handleMouseLeave = () => {
			isHovered = false;
			restartAutoplayTimer();
		};

		const handleFocusIn = () => {
			hasFocusWithin = true;
			restartAutoplayTimer();
		};

		const handleFocusOut = (event: FocusEvent) => {
			if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) {
				return;
			}

			hasFocusWithin = false;
			restartAutoplayTimer();
		};

		root.addEventListener("pointerdown", handleUserInteraction);
		root.addEventListener("keydown", handleUserInteraction);
		root.addEventListener("mouseenter", handleMouseEnter);
		root.addEventListener("mouseleave", handleMouseLeave);
		root.addEventListener("focusin", handleFocusIn);
		root.addEventListener("focusout", handleFocusOut);
		document.addEventListener("visibilitychange", restartAutoplayTimer);
		emblaApi.on("select", restartAutoplayTimer);
		restartAutoplayTimer();

		return () => {
			window.clearTimeout(timerId);
			root.removeEventListener("pointerdown", handleUserInteraction);
			root.removeEventListener("keydown", handleUserInteraction);
			root.removeEventListener("mouseenter", handleMouseEnter);
			root.removeEventListener("mouseleave", handleMouseLeave);
			root.removeEventListener("focusin", handleFocusIn);
			root.removeEventListener("focusout", handleFocusOut);
			document.removeEventListener("visibilitychange", restartAutoplayTimer);
			emblaApi.off("select", restartAutoplayTimer);
		};
	}, [emblaApi, delay, isPlaying]);

	const stopAutoplay = () => {
		setIsStopped(true);
	};

	const startAutoplay = () => {
		setIsStopped(false);
	};

	return {
		isPlaying,
		canPlay: shouldReduceMotion !== true,
		stopAutoplay,
		startAutoplay
	};
}
