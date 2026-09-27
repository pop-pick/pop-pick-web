"use client";

import * as m from "motion/react-m";
import { type FocusEvent, type SyntheticEvent, useEffect, useId, useRef } from "react";

import CloseIcon from "@/shared/assets/icons/close.svg";
import { cn } from "@/shared/lib/cn";

import { SvgIcon } from "./SvgIcon";

const DIALOG_HIDDEN = { opacity: 0, y: 24, scale: 0.96 };
const DIALOG_SHOWN = { opacity: 1, y: 0, scale: 1 };
const DIALOG_ENTER_TRANSITION = { type: "spring", bounce: 0.3, duration: 0.4 } as const;
const DIALOG_EXIT_TRANSITION = { duration: 0.18, ease: "easeIn" } as const;

interface AlertDialogProps {
	open: boolean;
	message: string;
	detail?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	closeLabel?: string;
	onConfirm: () => void;
	onCancel?: () => void;
}

export function AlertDialog({
	open,
	message,
	detail,
	confirmLabel = "확인",
	cancelLabel = "취소",
	closeLabel,
	onConfirm,
	onCancel
}: AlertDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const confirmButtonRef = useRef<HTMLButtonElement>(null);
	const messageId = useId();
	const detailId = useId();
	const hasCloseButton = closeLabel !== undefined;
	const dismissDialog = onCancel ?? onConfirm;

	useEffect(() => {
		const dialog = dialogRef.current;

		if (!dialog) {
			return;
		}

		if (open && !dialog.open) {
			dialog.showModal();
			confirmButtonRef.current?.focus();
		}
	}, [open]);

	const handleDetailFocus = (event: FocusEvent<HTMLInputElement>) => {
		event.currentTarget.select();
	};

	const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
		event.preventDefault();
		dismissDialog();
	};

	const handleClose = () => {
		if (open) {
			dismissDialog();
		}
	};

	const handleAnimationComplete = () => {
		if (!open) {
			dialogRef.current?.close();
		}
	};

	const handleCloseButtonClick = () => {
		dismissDialog();
	};

	return (
		<m.dialog
			ref={dialogRef}
			initial={DIALOG_HIDDEN}
			animate={open ? DIALOG_SHOWN : DIALOG_HIDDEN}
			transition={open ? DIALOG_ENTER_TRANSITION : DIALOG_EXIT_TRANSITION}
			onAnimationComplete={handleAnimationComplete}
			data-closing={open ? undefined : ""}
			role="alertdialog"
			aria-modal="true"
			aria-labelledby={messageId}
			aria-describedby={detail === undefined ? undefined : detailId}
			onCancel={handleCancel}
			onClose={handleClose}
			className={cn(
				"m-auto w-full rounded-2xl bg-bg-1 backdrop-fade shadow-modal data-closing:pointer-events-none",
				hasCloseButton ? "max-w-75 px-5 pt-6 pb-5 backdrop:bg-transparent" : "max-w-80 p-5 backdrop:bg-black/40"
			)}
		>
			<p
				id={messageId}
				className={cn(
					"text-center whitespace-pre-line text-text-1",
					hasCloseButton ? "px-10 text-b1-16" : "text-b2-16"
				)}
			>
				{message}
			</p>
			{hasCloseButton && (
				<button
					type="button"
					aria-label={closeLabel}
					onClick={handleCloseButtonClick}
					className="absolute top-5 right-5 flex size-7 items-center justify-center rounded-lg text-icon-disabled focus-ring transition-colors after:absolute after:-inset-2 hover:text-icon-2"
				>
					<SvgIcon icon={CloseIcon} size={20} />
				</button>
			)}
			{detail !== undefined && (
				<input
					id={detailId}
					type="text"
					readOnly
					value={detail}
					aria-label="복사할 링크"
					onFocus={handleDetailFocus}
					className="mt-3 w-full rounded-lg border border-transparent bg-bg-2 p-3 text-center text-b3-14 text-text-2 outline-none focus:border-primary"
				/>
			)}
			<div className={cn("flex gap-2", hasCloseButton ? "mt-5.5" : "mt-5")}>
				{onCancel && !hasCloseButton && (
					<button
						type="button"
						onClick={onCancel}
						className="h-12 flex-1 rounded-xl bg-bg-3 text-b1-16 text-text-2 focus-ring transition-colors hover:bg-bg-4"
					>
						{cancelLabel}
					</button>
				)}
				<button
					type="button"
					ref={confirmButtonRef}
					onClick={onConfirm}
					className={cn(
						"flex-1 rounded-xl bg-primary text-text-w focus-ring transition-colors hover:bg-primary-strong",
						hasCloseButton ? "h-10.5 text-b1-14" : "h-12 text-b1-16"
					)}
				>
					{confirmLabel}
				</button>
			</div>
		</m.dialog>
	);
}
