"use client";

import useEmblaCarousel from "embla-carousel-react";
import { type KeyboardEvent, useEffect, useState } from "react";

import { PopupImage } from "@/shared/components/PopupImage";
import { tv, type VariantProps } from "@/shared/lib/tv";
import type { PopupCategory } from "@/shared/model/popup";

const IMAGE_SIZES = "(max-width: 430px) calc(100vw - 40px), 390px";

const carouselFrameVariants = tv({
	slots: {
		image: "rounded-2xl",
		viewport: "overflow-hidden rounded-2xl focus-ring"
	},
	variants: {
		variant: {
			page: { image: "h-50", viewport: "h-50" },
			sheet: { image: "h-35", viewport: "h-35" }
		}
	}
});

const carouselDotVariants = tv({
	base: "size-1.5 rounded-full",
	variants: {
		isSelected: {
			true: "bg-icon",
			false: "bg-divider-2/80"
		}
	}
});

interface PopupImageCarouselProps {
	label: string;
	images: string[];
	category: PopupCategory | null;
	variant: NonNullable<VariantProps<typeof carouselFrameVariants>["variant"]>;
}

export function PopupImageCarousel({ label, images, category, variant }: PopupImageCarouselProps) {
	const [viewportRef, emblaApi] = useEmblaCarousel();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const frameStyles = carouselFrameVariants({ variant });

	useEffect(() => {
		if (!emblaApi) {
			return;
		}

		const handleSelect = () => {
			setSelectedIndex(emblaApi.selectedScrollSnap());
		};

		emblaApi.on("select", handleSelect);
		emblaApi.on("reInit", handleSelect);

		return () => {
			emblaApi.off("select", handleSelect);
			emblaApi.off("reInit", handleSelect);
		};
	}, [emblaApi]);

	const handleViewportKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			emblaApi?.scrollPrev();
		}

		if (event.key === "ArrowRight") {
			event.preventDefault();
			emblaApi?.scrollNext();
		}
	};

	if (images.length <= 1) {
		return (
			<PopupImage
				src={images[0] ?? null}
				alt={label}
				category={category}
				sizes={IMAGE_SIZES}
				loading="eager"
				className={frameStyles.image()}
			/>
		);
	}

	return (
		<div className="relative">
			<div
				ref={viewportRef}
				tabIndex={0}
				role="region"
				aria-roledescription="carousel"
				aria-label={label}
				onKeyDown={handleViewportKeyDown}
				className={frameStyles.viewport()}
			>
				<ul className="flex h-full touch-pan-y">
					{images.map((image, index) => (
						<li
							key={image}
							aria-roledescription="slide"
							aria-label={`${String(index + 1)} / ${String(images.length)}`}
							className="h-full w-full shrink-0"
						>
							<PopupImage
								src={image}
								alt=""
								category={category}
								sizes={IMAGE_SIZES}
								loading={index === 0 ? "eager" : undefined}
								className="size-full"
							/>
						</li>
					))}
				</ul>
			</div>
			<p aria-live="polite" className="sr-only">
				{`${String(selectedIndex + 1)} / ${String(images.length)}`}
			</p>
			<div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center gap-2">
				{images.map((image, index) => (
					<span key={image} className={carouselDotVariants({ isSelected: index === selectedIndex })} />
				))}
			</div>
		</div>
	);
}
