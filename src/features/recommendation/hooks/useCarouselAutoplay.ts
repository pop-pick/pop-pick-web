import type { UseEmblaCarouselType } from "embla-carousel-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

type EmblaApi = UseEmblaCarouselType[1];

export function useCarouselAutoplay(emblaApi: EmblaApi, delay: number) {
	const shouldReduceMotion = useReducedMotion();
	const [isStopped, setIsStopped] = useState(false);
	const canPlay = shouldReduceMotion !== true;
	const isPlaying = !isStopped && canPlay;

	useEffect(() => {
		if (emblaApi === undefined || !isPlaying) {
			return;
		}

		const root = emblaApi.rootNode();
		let timerId: number | undefined;
		let isPointerDown = false;
		let isHovered = false;
		let hasFocusWithin = false;

		const restartAutoplayTimer = () => {
			window.clearTimeout(timerId);

			if (isPointerDown || isHovered || hasFocusWithin || document.hidden) {
				return;
			}

			timerId = window.setTimeout(() => {
				emblaApi.scrollNext();
			}, delay);
		};

		const handlePointerDown = () => {
			isPointerDown = true;
			restartAutoplayTimer();
		};

		const handlePointerUp = () => {
			isPointerDown = false;
			restartAutoplayTimer();
		};

		const handlePointerEnter = (event: PointerEvent) => {
			if (event.pointerType !== "mouse") {
				return;
			}

			isHovered = true;
			restartAutoplayTimer();
		};

		const handlePointerLeave = (event: PointerEvent) => {
			if (event.pointerType !== "mouse") {
				return;
			}

			isHovered = false;
			restartAutoplayTimer();
		};

		const handleFocusIn = (event: FocusEvent) => {
			hasFocusWithin = event.target instanceof Element && event.target.matches(":focus-visible");
			restartAutoplayTimer();
		};

		const handleFocusOut = (event: FocusEvent) => {
			if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) {
				return;
			}

			hasFocusWithin = false;
			restartAutoplayTimer();
		};

		root.addEventListener("pointerenter", handlePointerEnter);
		root.addEventListener("pointerleave", handlePointerLeave);
		root.addEventListener("focusin", handleFocusIn);
		root.addEventListener("focusout", handleFocusOut);
		document.addEventListener("visibilitychange", restartAutoplayTimer);
		emblaApi.on("pointerDown", handlePointerDown);
		emblaApi.on("pointerUp", handlePointerUp);
		emblaApi.on("select", restartAutoplayTimer);
		restartAutoplayTimer();

		return () => {
			window.clearTimeout(timerId);
			root.removeEventListener("pointerenter", handlePointerEnter);
			root.removeEventListener("pointerleave", handlePointerLeave);
			root.removeEventListener("focusin", handleFocusIn);
			root.removeEventListener("focusout", handleFocusOut);
			document.removeEventListener("visibilitychange", restartAutoplayTimer);
			emblaApi.off("pointerDown", handlePointerDown);
			emblaApi.off("pointerUp", handlePointerUp);
			emblaApi.off("select", restartAutoplayTimer);
		};
	}, [emblaApi, delay, isPlaying]);

	const stopAutoplay = () => {
		setIsStopped(true);
	};

	const startAutoplay = () => {
		setIsStopped(false);
	};

	return { isPlaying, canPlay, stopAutoplay, startAutoplay };
}
