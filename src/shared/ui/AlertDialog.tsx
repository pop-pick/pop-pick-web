"use client";

import { type FocusEvent, useEffect, useId, useRef } from "react";

interface AlertDialogProps {
	open: boolean;
	message: string;
	detail?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	onCancel?: () => void;
}

export function AlertDialog({
	open,
	message,
	detail,
	confirmLabel = "확인",
	cancelLabel = "취소",
	onConfirm,
	onCancel
}: AlertDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const confirmButtonRef = useRef<HTMLButtonElement>(null);
	const messageId = useId();
	const detailId = useId();

	useEffect(() => {
		const dialog = dialogRef.current;

		if (!dialog) {
			return;
		}

		if (open && !dialog.open) {
			dialog.showModal();
			confirmButtonRef.current?.focus();
		}

		if (!open && dialog.open) {
			dialog.close();
		}
	}, [open]);

	const handleDetailFocus = (event: FocusEvent<HTMLInputElement>) => {
		event.currentTarget.select();
	};

	const handleClose = () => {
		if (open) {
			(onCancel ?? onConfirm)();
		}
	};

	return (
		<dialog
			ref={dialogRef}
			role="alertdialog"
			aria-modal="true"
			aria-labelledby={messageId}
			aria-describedby={detail === undefined ? undefined : detailId}
			onClose={handleClose}
			className="m-auto w-full max-w-80 rounded-2xl bg-bg-1 p-5 shadow-modal backdrop:bg-black/40"
		>
			<p id={messageId} className="text-center text-b2-16 whitespace-pre-line text-text-1">
				{message}
			</p>
			{detail !== undefined && (
				<input
					id={detailId}
					type="text"
					readOnly
					value={detail}
					aria-label="복사할 링크"
					onFocus={handleDetailFocus}
					className="mt-3 w-full rounded-lg bg-bg-2 p-3 text-center text-b3-14 text-text-2 focus-ring"
				/>
			)}
			<div className="mt-5 flex gap-2">
				{onCancel && (
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
					className="h-12 flex-1 rounded-xl bg-primary text-b1-16 text-text-w focus-ring transition-colors hover:bg-primary-strong"
				>
					{confirmLabel}
				</button>
			</div>
		</dialog>
	);
}
