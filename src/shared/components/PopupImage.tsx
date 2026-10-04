"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/shared/lib/cn";
import { isOptimizablePopupImage } from "@/shared/lib/popup-image-hosts";
import type { PopupCategory } from "@/shared/model/popup";

import { CategoryFallbackImage } from "./CategoryFallbackImage";

interface PopupImageProps {
	src: string | null;
	alt: string;
	category: PopupCategory | null;
	sizes: string;
	loading?: "eager" | "lazy";
	className?: string;
	fallbackClassName?: string;
}

/** `images.remotePatterns`에 등록된 출처의 사진만 최적화하고 나머지는 원본 주소로 그린다. 받지 못한 주소는 카테고리 그림으로 바꾼다 */
export function PopupImage({ src, alt, category, sizes, loading, className, fallbackClassName }: PopupImageProps) {
	const [failedSrc, setFailedSrc] = useState<string | null>(null);

	const handleError = () => {
		setFailedSrc(src);
	};

	if (src === null || src === failedSrc) {
		return <CategoryFallbackImage category={category} className={cn(className, fallbackClassName)} />;
	}

	return (
		<div className={cn("relative overflow-hidden bg-primary-subtle", className)}>
			<Image
				src={src}
				alt={alt}
				fill
				sizes={sizes}
				loading={loading}
				unoptimized={!isOptimizablePopupImage(src)}
				onError={handleError}
				className="object-cover"
			/>
		</div>
	);
}
