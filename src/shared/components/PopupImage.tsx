import Image from "next/image";

import { cn } from "@/shared/lib/cn";
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

/** 팝업 사진은 수집 출처마다 호스트가 달라 `images.remotePatterns`에 묶지 않고 최적화 없이 원본 주소로 그린다 */
export function PopupImage({ src, alt, category, sizes, loading, className, fallbackClassName }: PopupImageProps) {
	if (src === null) {
		return <CategoryFallbackImage category={category} className={cn(className, fallbackClassName)} />;
	}

	return (
		<div className={cn("relative overflow-hidden bg-primary-subtle", className)}>
			<Image src={src} alt={alt} fill sizes={sizes} loading={loading} unoptimized className="object-cover" />
		</div>
	);
}
