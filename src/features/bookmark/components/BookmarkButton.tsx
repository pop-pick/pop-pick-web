"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import HeartIcon from "@/shared/assets/icons/heart.svg";
import type { BookmarkButtonSize } from "@/shared/components/BookmarkSlot";
import { tv } from "@/shared/lib/tv";
import { buildLoginPath } from "@/shared/model/login-path";
import { LOGIN_CONFIRM_LABEL, LOGIN_REQUIRED_MESSAGE } from "@/shared/model/login-prompt";
import { AlertDialog } from "@/shared/ui/AlertDialog";
import { SvgIcon } from "@/shared/ui/SvgIcon";

interface BookmarkButtonProps {
	mode: "guest" | "member" | "pending";
	popupTitle: string;
	size?: BookmarkButtonSize;
}

const bookmarkButtonVariants = tv({
	base: "flex shrink-0 items-center justify-center rounded-xl border border-divider-2 bg-bg-1 text-icon-2 focus-ring transition-colors not-aria-disabled:hover:bg-bg-2 aria-disabled:cursor-not-allowed aria-disabled:text-icon-disabled",
	variants: {
		size: {
			sm: "size-8",
			md: "size-10",
			lg: "size-12"
		} satisfies Record<BookmarkButtonSize, string>
	}
});

const ICON_SIZES: Record<BookmarkButtonSize, 20 | 24> = {
	sm: 20,
	md: 24,
	lg: 24
};

export function BookmarkButton({ mode, popupTitle, size = "lg" }: BookmarkButtonProps) {
	const router = useRouter();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const isGuest = mode === "guest";

	const handleBookmarkClick = () => {
		if (isGuest) {
			setIsDialogOpen(true);
		}
	};

	const handleLoginConfirm = () => {
		setIsDialogOpen(false);
		router.push(buildLoginPath(`${window.location.pathname}${window.location.search}`));
	};

	const handleLoginCancel = () => {
		setIsDialogOpen(false);
	};

	return (
		<>
			<button
				type="button"
				aria-label={isGuest ? `${popupTitle} 찜` : undefined}
				aria-disabled={isGuest ? undefined : true}
				onClick={handleBookmarkClick}
				className={bookmarkButtonVariants({ size })}
			>
				<SvgIcon icon={HeartIcon} size={ICON_SIZES[size]} />
				{!isGuest && <span className="sr-only">{`${popupTitle} 찜, 준비 중`}</span>}
			</button>
			{isGuest && (
				<AlertDialog
					open={isDialogOpen}
					message={LOGIN_REQUIRED_MESSAGE}
					confirmLabel={LOGIN_CONFIRM_LABEL}
					closeLabel="닫기"
					onConfirm={handleLoginConfirm}
					onCancel={handleLoginCancel}
				/>
			)}
		</>
	);
}
