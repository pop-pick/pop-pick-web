import Link from "next/link";

import { cn } from "@/shared/lib/cn";
import type { PopupCardItem } from "@/shared/types/popup";
import { POPUP_CATEGORY_LABEL, RESERVATION_TYPE_LABEL } from "@/shared/types/popup";
import { REGION_LABEL } from "@/shared/types/region";
import { Badge } from "@/shared/ui/Badge";
import { PlaceholderBox } from "@/shared/ui/PlaceholderBox";

interface PopupCardProps {
	popup: PopupCardItem;
	showReason?: boolean;
	className?: string;
}

export function PopupCard({ popup, showReason = false, className }: PopupCardProps) {
	return (
		<Link
			href={`/popups/${String(popup.id)}`}
			className={cn(
				"flex gap-4 rounded-2xl border border-zinc-100 bg-white p-4 transition-colors hover:bg-zinc-50",
				"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
				className
			)}
		>
			<PlaceholderBox label="이미지" className="size-20 shrink-0" />
			<div className="flex min-w-0 flex-col gap-2">
				<div className="flex flex-wrap gap-1">
					<Badge tone="accent">{POPUP_CATEGORY_LABEL[popup.category]}</Badge>
					<Badge>{RESERVATION_TYPE_LABEL[popup.reservation]}</Badge>
				</div>
				<p className="truncate font-semibold text-zinc-900">{popup.name}</p>
				<p className="text-sm text-zinc-500">
					{REGION_LABEL[popup.region]} · {popup.endsOn} 종료
				</p>
				{showReason && popup.reason !== undefined ? (
					<p className="line-clamp-2 text-sm text-blue-700">{popup.reason}</p>
				) : null}
			</div>
		</Link>
	);
}
