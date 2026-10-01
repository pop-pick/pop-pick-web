"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";

import { useCarouselAutoplay } from "../hooks/useCarouselAutoplay";
import { formatPickTitle } from "../model/home-format";
import type { RecommendedPopupItem } from "../model/home-popup";
import { PickCard } from "./PickCard";

const CAROUSEL_OPTIONS = { align: "start", loop: true, watchFocus: false } as const;
const AUTOPLAY_DELAY_MS = 3000;
const STOP_AUTOPLAY_LABEL = "자동 넘김 멈추기";
const START_AUTOPLAY_LABEL = "자동 넘김 다시 시작";

interface PickSectionProps {
	nickname: string | null;
	recommendations: RecommendedPopupItem[];
}

export function PickSection({ nickname, recommendations }: PickSectionProps) {
	const [expandedPopupId, setExpandedPopupId] = useState(recommendations[0]?.popup.id ?? null);
	const [viewportRef, emblaApi] = useEmblaCarousel(CAROUSEL_OPTIONS);
	const { isPlaying, canPlay, stopAutoplay, startAutoplay } = useCarouselAutoplay(emblaApi, AUTOPLAY_DELAY_MS);

	useEffect(() => {
		if (emblaApi === undefined || !isPlaying) {
			return;
		}

		const handleSelect = () => {
			const selectedRecommendation = recommendations[emblaApi.selectedScrollSnap()];

			if (selectedRecommendation !== undefined) {
				setExpandedPopupId(selectedRecommendation.popup.id);
			}
		};

		emblaApi.on("select", handleSelect);

		return () => {
			emblaApi.off("select", handleSelect);
		};
	}, [emblaApi, isPlaying, recommendations]);

	const handleCardToggle = (popupId: number) => () => {
		setExpandedPopupId((currentPopupId) => (currentPopupId === popupId ? null : popupId));
	};

	const handleSlideFocus = (index: number) => () => {
		emblaApi?.scrollTo(index);
	};

	const handleAutoplayToggle = () => {
		if (isPlaying) {
			stopAutoplay();
			return;
		}

		startAutoplay();
	};

	return (
		<section aria-labelledby="pick-section-title" className="flex flex-col gap-5">
			<div className="flex items-center justify-between gap-2">
				<h2 id="pick-section-title" className="text-b1-18 text-text-1">
					{formatPickTitle(nickname)}
				</h2>
				<div className="flex items-center gap-2">
					{canPlay && (
						<button
							type="button"
							onClick={handleAutoplayToggle}
							className="sr-only grid rounded-sm text-b3-12 text-text-4 focus-ring focus-visible:not-sr-only"
						>
							<span className="col-start-1 row-start-1">{isPlaying ? STOP_AUTOPLAY_LABEL : START_AUTOPLAY_LABEL}</span>
							<span aria-hidden className="invisible col-start-1 row-start-1">
								{isPlaying ? START_AUTOPLAY_LABEL : STOP_AUTOPLAY_LABEL}
							</span>
						</button>
					)}
					<p className="text-b3-12 text-text-4">총 {recommendations.length}개 추천됨</p>
				</div>
			</div>
			<div ref={viewportRef} className="-mr-5 overflow-hidden">
				<ul className="flex touch-pan-y">
					{recommendations.map((recommendation, index) => (
						<li key={recommendation.popup.id} onFocus={handleSlideFocus(index)} className="shrink-0 pr-4">
							<PickCard
								recommendation={recommendation}
								nickname={nickname}
								isExpanded={expandedPopupId === recommendation.popup.id}
								imageLoading={index === 0 ? "eager" : undefined}
								onToggle={handleCardToggle(recommendation.popup.id)}
							/>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
