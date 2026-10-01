"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import HeartIcon from "@/shared/assets/icons/heart.svg";
import type { BookmarkButtonSize } from "@/shared/components/BookmarkSlot";
import { buildLoginPath } from "@/shared/model/login-path";
import { LOGIN_CONFIRM_LABEL, LOGIN_REQUIRED_MESSAGE } from "@/shared/model/login-prompt";
import { AlertDialog } from "@/shared/ui/AlertDialog";
import { IconButton } from "@/shared/ui/IconButton";
import { SvgIcon } from "@/shared/ui/SvgIcon";

interface BookmarkButtonProps {
	mode: "guest" | "member" | "pending";
	popupTitle: string;
	size?: BookmarkButtonSize;
}

type LoginDialogState = "closed" | "open" | "closing";

const ICON_SIZES: Record<BookmarkButtonSize, 20 | 24> = {
	sm: 20,
	md: 24,
	lg: 24
};

export function BookmarkButton({ mode, popupTitle, size = "lg" }: BookmarkButtonProps) {
	const router = useRouter();
	const [loginDialogState, setLoginDialogState] = useState<LoginDialogState>("closed");
	const isGuest = mode === "guest";

	const handleBookmarkClick = () => {
		if (isGuest) {
			setLoginDialogState("open");
		}
	};

	const handleLoginConfirm = () => {
		setLoginDialogState("closing");
		router.push(buildLoginPath(`${window.location.pathname}${window.location.search}`));
	};

	const handleLoginCancel = () => {
		setLoginDialogState("closing");
	};

	const handleLoginDialogClosed = () => {
		setLoginDialogState("closed");
	};

	return (
		<>
			<IconButton
				label={isGuest ? `${popupTitle} 찜` : `${popupTitle} 찜, 준비 중`}
				variant="outline"
				size={size}
				aria-disabled={isGuest ? undefined : true}
				onClick={handleBookmarkClick}
			>
				<SvgIcon icon={HeartIcon} size={ICON_SIZES[size]} />
			</IconButton>
			{loginDialogState !== "closed" && (
				<AlertDialog
					open={loginDialogState === "open"}
					message={LOGIN_REQUIRED_MESSAGE}
					confirmLabel={LOGIN_CONFIRM_LABEL}
					closeLabel="닫기"
					onConfirm={handleLoginConfirm}
					onCancel={handleLoginCancel}
					onClosed={handleLoginDialogClosed}
				/>
			)}
		</>
	);
}
