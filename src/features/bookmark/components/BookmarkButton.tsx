"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import HeartIcon from "@/shared/assets/icons/heart.svg";
import { LOGIN_REQUIRED_MESSAGE } from "@/shared/model/login-prompt";
import { AlertDialog } from "@/shared/ui/AlertDialog";
import { SvgIcon } from "@/shared/ui/SvgIcon";

interface GuestBookmarkButtonProps {
	mode: "guest";
	popupTitle: string;
	loginHref: string;
}

interface InactiveBookmarkButtonProps {
	mode: "member" | "pending";
	popupTitle: string;
	loginHref?: never;
}

type BookmarkButtonProps = GuestBookmarkButtonProps | InactiveBookmarkButtonProps;

export function BookmarkButton({ mode, popupTitle, loginHref }: BookmarkButtonProps) {
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

		if (loginHref !== undefined) {
			router.push(loginHref);
		}
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
				className="flex size-12 items-center justify-center rounded-xl border border-divider-2 bg-bg-1 text-icon-2 focus-ring transition-colors not-aria-disabled:hover:bg-bg-2 aria-disabled:cursor-not-allowed aria-disabled:text-icon-disabled"
			>
				<SvgIcon icon={HeartIcon} size={24} />
				{!isGuest && <span className="sr-only">{`${popupTitle} 찜, 준비 중`}</span>}
			</button>
			{isGuest && (
				<AlertDialog
					open={isDialogOpen}
					message={LOGIN_REQUIRED_MESSAGE}
					onConfirm={handleLoginConfirm}
					onCancel={handleLoginCancel}
				/>
			)}
		</>
	);
}
