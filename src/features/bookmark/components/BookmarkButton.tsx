"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import HeartIcon from "@/shared/assets/icons/heart.svg";
import HeartFillIcon from "@/shared/assets/icons/heart-fill.svg";
import type { BookmarkButtonSize } from "@/shared/components/BookmarkSlot";
import { buildLoginPath } from "@/shared/model/login-path";
import { AlertDialog } from "@/shared/ui/AlertDialog";
import { IconButton } from "@/shared/ui/IconButton";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import { useToggleBookmark } from "../hooks/useToggleBookmark";
import type { BookmarkMode } from "../model/bookmark";
import { type BookmarkDialog, getBookmarkDialogCopy, resolveBookmarkIntent } from "../model/bookmark-dialog";

interface BookmarkButtonProps {
	mode: BookmarkMode;
	popupId: number;
	popupTitle: string;
	isBookmarked: boolean | null;
	size?: BookmarkButtonSize;
}

const ICON_SIZES: Record<BookmarkButtonSize, 20 | 24> = {
	sm: 20,
	md: 24,
	lg: 24
};

export function BookmarkButton({ mode, popupId, popupTitle, isBookmarked, size = "lg" }: BookmarkButtonProps) {
	const router = useRouter();
	const [dialog, setDialog] = useState<BookmarkDialog | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const { mutate: toggleBookmark, isPending, error } = useToggleBookmark(popupId);
	const isBookmarkUnknown = isBookmarked === null && mode !== "guest";
	const isUnavailable = mode === "pending" || isPending || isBookmarkUnknown;

	const openDialog = (nextDialog: BookmarkDialog) => {
		setDialog(nextDialog);
		setIsDialogOpen(true);
	};

	const handleToggleError = () => {
		openDialog("failure");
	};

	const handleBookmarkClick = () => {
		if (!isUnavailable) {
			openDialog(resolveBookmarkIntent({ isMember: mode === "member", isBookmarked: isBookmarked === true }));
		}
	};

	const handleDialogConfirm = () => {
		setIsDialogOpen(false);

		if (dialog === "login-required") {
			router.push(buildLoginPath(`${window.location.pathname}${window.location.search}`));
		}

		if (dialog === "add" || dialog === "remove") {
			toggleBookmark(dialog === "add", { onError: handleToggleError });
		}
	};

	const handleDialogCancel = () => {
		setIsDialogOpen(false);
	};

	const handleDialogClosed = () => {
		setDialog(null);
	};

	const dialogCopy = dialog === null ? null : getBookmarkDialogCopy(dialog, error);

	return (
		<>
			<IconButton
				label={`${popupTitle} 찜`}
				variant="outline"
				size={size}
				aria-pressed={isBookmarked === true}
				aria-disabled={isUnavailable || undefined}
				aria-busy={isPending || undefined}
				onClick={handleBookmarkClick}
			>
				<SvgIcon icon={isBookmarked === true ? HeartFillIcon : HeartIcon} size={ICON_SIZES[size]} />
			</IconButton>
			{dialogCopy !== null && (
				<AlertDialog
					open={isDialogOpen}
					message={dialogCopy.message}
					confirmLabel={dialogCopy.confirmLabel}
					closeLabel={dialogCopy.closeLabel}
					onConfirm={handleDialogConfirm}
					onCancel={dialog === "failure" ? undefined : handleDialogCancel}
					onClosed={handleDialogClosed}
				/>
			)}
		</>
	);
}
