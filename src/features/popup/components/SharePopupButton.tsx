"use client";

import { useState } from "react";

import ShareIcon from "@/shared/assets/icons/share.svg";
import { AlertDialog } from "@/shared/ui/AlertDialog";
import { IconButton } from "@/shared/ui/IconButton";
import { SvgIcon } from "@/shared/ui/SvgIcon";

const COPIED_MESSAGE = "링크가 클립보드에 복사되었습니다";
const COPY_FAILED_MESSAGE = "링크를 복사하지 못했습니다.\n아래 링크를 직접 복사해 주세요.";

interface SharePopupButtonProps {
	path: string;
}

export function SharePopupButton({ path }: SharePopupButtonProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [failedUrl, setFailedUrl] = useState<string>();

	const handleShare = async () => {
		const url = `${window.location.origin}${path}`;

		try {
			await navigator.clipboard.writeText(url);
			setFailedUrl(undefined);
		} catch (error) {
			console.error("[popup] 링크를 클립보드에 복사하지 못했다", error);
			setFailedUrl(url);
		}

		setIsDialogOpen(true);
	};

	const handleDialogClose = () => {
		setIsDialogOpen(false);
	};

	return (
		<>
			<IconButton label="공유하기" variant="outline" size="lg" onClick={handleShare}>
				<SvgIcon icon={ShareIcon} size={20} />
			</IconButton>
			<AlertDialog
				open={isDialogOpen}
				message={failedUrl === undefined ? COPIED_MESSAGE : COPY_FAILED_MESSAGE}
				detail={failedUrl}
				onConfirm={handleDialogClose}
			/>
		</>
	);
}
