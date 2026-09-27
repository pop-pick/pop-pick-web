"use client";

import { useState } from "react";

import ShareIcon from "@/shared/assets/icons/share.svg";
import { AlertDialog } from "@/shared/ui/AlertDialog";
import { SvgIcon } from "@/shared/ui/SvgIcon";

const COPIED_MESSAGE = "링크가 클립보드에 복사되었습니다";
const COPY_FAILED_MESSAGE = "링크를 복사하지 못했습니다.\n아래 링크를 직접 복사해 주세요.";

export function SharePopupButton() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [dialogMessage, setDialogMessage] = useState(COPIED_MESSAGE);
	const [failedUrl, setFailedUrl] = useState<string>();

	const handleShare = async () => {
		const url = `${window.location.origin}${window.location.pathname}`;

		try {
			await navigator.clipboard.writeText(url);
			setDialogMessage(COPIED_MESSAGE);
			setFailedUrl(undefined);
			setIsDialogOpen(true);
		} catch (error) {
			console.error("[popup] 링크를 클립보드에 복사하지 못했다", error);
			setDialogMessage(COPY_FAILED_MESSAGE);
			setFailedUrl(url);
			setIsDialogOpen(true);
		}
	};

	const handleDialogClose = () => {
		setIsDialogOpen(false);
	};

	return (
		<>
			<button
				type="button"
				aria-label="공유하기"
				onClick={handleShare}
				className="flex size-12 items-center justify-center rounded-xl border border-divider-2 bg-bg-1 text-icon-2 focus-ring transition-colors hover:bg-bg-2"
			>
				<SvgIcon icon={ShareIcon} size={20} />
			</button>
			<AlertDialog open={isDialogOpen} message={dialogMessage} detail={failedUrl} onConfirm={handleDialogClose} />
		</>
	);
}
