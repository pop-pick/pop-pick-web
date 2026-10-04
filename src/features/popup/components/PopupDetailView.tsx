import { tv, type VariantProps } from "@/shared/lib/tv";
import { POPUP_CATEGORY_LABELS } from "@/shared/model/popup";
import { buildPopupDetailPath } from "@/shared/model/popup-path";
import { Badge } from "@/shared/ui/Badge";
import { LinkButton } from "@/shared/ui/LinkButton";

import { formatViewCount } from "../model/detail-format";
import type { PopupDetail } from "../model/popup-detail";
import { PopupDetailBookmark } from "./PopupDetailBookmark";
import { PopupImageCarousel } from "./PopupImageCarousel";
import { PopupInfoCard } from "./PopupInfoCard";
import { RecentPopupRecorder } from "./RecentPopupRecorder";
import { ReliabilityNotice } from "./ReliabilityNotice";
import { SharePopupButton } from "./SharePopupButton";

const popupDetailViewVariants = tv({
	base: "flex flex-col gap-5 px-5",
	variants: {
		variant: {
			page: "pt-1.25",
			sheet: "pb-10"
		}
	}
});

interface PopupDetailViewProps {
	popup: PopupDetail;
	variant: NonNullable<VariantProps<typeof popupDetailViewVariants>["variant"]>;
	titleId?: string;
}

export function PopupDetailView({ popup, variant, titleId }: PopupDetailViewProps) {
	return (
		<div className={popupDetailViewVariants({ variant })}>
			<div className="flex flex-col gap-8">
				<div className="flex flex-col gap-5">
					<PopupImageCarousel
						label={`${popup.title} 사진`}
						images={popup.imageUrls}
						category={popup.category}
						variant={variant}
					/>
					<div className="flex flex-col gap-3">
						<div className="flex items-center gap-1">
							{popup.category !== null && <Badge>{POPUP_CATEGORY_LABELS[popup.category]}</Badge>}
							{popup.areaName !== null && <Badge tone="region">{popup.areaName}</Badge>}
							<p className="ml-auto text-b3-12 text-text-4">{formatViewCount(popup.viewCount)}</p>
						</div>
						<h1 id={titleId} tabIndex={titleId === undefined ? undefined : -1} className="text-h2 text-text-1">
							{popup.title}
						</h1>
						{popup.description !== null && <p className="text-b3-14 text-text-2">{popup.description}</p>}
					</div>
					<PopupInfoCard popup={popup} />
				</div>
				<div className="flex items-center gap-2.5">
					{popup.reservationUrl !== null && (
						<LinkButton href={popup.reservationUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
							예약 사이트로 이동
							<span className="sr-only">(새 창)</span>
						</LinkButton>
					)}
					<div className="ml-auto flex shrink-0 gap-2">
						<PopupDetailBookmark initialDetail={popup} />
						<SharePopupButton path={buildPopupDetailPath(popup.id)} />
					</div>
				</div>
			</div>
			<ReliabilityNotice />
			<RecentPopupRecorder initialDetail={popup} />
		</div>
	);
}
