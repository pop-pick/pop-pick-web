import Image from "next/image";

import { cn } from "@/shared/lib/cn";
import type { PopupCategory } from "@/shared/model/popup";

const FALLBACK_ICON_SIZE = 48;

interface CategoryFallbackImageProps {
	category: PopupCategory | null;
	className?: string;
}

export function CategoryFallbackImage({ category, className }: CategoryFallbackImageProps) {
	const iconPath = `/images/pins/${category === null || category === "etc" ? "default" : category}.svg`;

	return (
		<div aria-hidden className={cn("flex items-center justify-center bg-primary-subtle", className)}>
			<Image src={iconPath} alt="" width={FALLBACK_ICON_SIZE} height={FALLBACK_ICON_SIZE} />
		</div>
	);
}
