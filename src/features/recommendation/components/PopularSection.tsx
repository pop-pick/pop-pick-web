import Link from "next/link";

import ChevronRightIcon from "@/shared/assets/icons/chevron-right.svg";
import { buildExploreListPath } from "@/shared/model/explore-state";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import type { PopularPopupItem } from "../model/home-popup";
import { PopularPopupRow } from "./PopularPopupRow";

interface PopularSectionProps {
	popularPopups: PopularPopupItem[];
}

export function PopularSection({ popularPopups }: PopularSectionProps) {
	return (
		<section aria-labelledby="popular-section-title" className="flex flex-col gap-5">
			<div className="flex items-center justify-between">
				<h2 id="popular-section-title" className="text-b1-18 text-text-1">
					지금 인기 있는 팝업
				</h2>
				<Link
					href={buildExploreListPath()}
					aria-label="인기 팝업 전체보기"
					className="rounded-sm text-icon-disabled focus-ring transition-colors hover:text-icon-2"
				>
					<SvgIcon icon={ChevronRightIcon} size={24} />
				</Link>
			</div>
			<ul className="flex flex-col gap-4">
				{popularPopups.map((item) => (
					<li key={item.popup.id}>
						<PopularPopupRow item={item} />
					</li>
				))}
			</ul>
		</section>
	);
}
