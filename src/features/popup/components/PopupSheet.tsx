"use client";

import * as m from "motion/react-m";
import { useRouter } from "next/navigation";
import { type MouseEvent, type ReactNode, type SyntheticEvent, useLayoutEffect, useRef } from "react";

import { canGoBackInApp } from "@/shared/lib/navigation";
import { EXPLORE_PATH } from "@/shared/model/explore-state";

import { useDragToClose } from "../hooks/useDragToClose";
import { DragHandle } from "./DragHandle";

const SLIDE_FROM = { y: "100%" };
const SLIDE_TO = { y: 0 };

interface PopupSheetProps {
	labelledBy: string;
	children: ReactNode;
}

export function PopupSheet({ labelledBy, children }: PopupSheetProps) {
	const router = useRouter();
	const dialogRef = useRef<HTMLDialogElement>(null);

	const closeSheet = () => {
		if (canGoBackInApp()) {
			router.back();
			return;
		}

		router.replace(`${EXPLORE_PATH}${window.location.search}`);
	};

	const { offsetY, dragHandleProps } = useDragToClose(closeSheet);

	useLayoutEffect(() => {
		const dialog = dialogRef.current;
		if (dialog === null) {
			return;
		}

		dialog.showModal();
		document.getElementById(labelledBy)?.focus();

		return () => {
			dialog.close();
		};
	}, [labelledBy]);

	const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
		event.preventDefault();
		closeSheet();
	};

	const handleOutsideClick = (event: MouseEvent<HTMLDialogElement>) => {
		if (event.target === event.currentTarget) {
			closeSheet();
		}
	};

	return (
		<dialog
			ref={dialogRef}
			aria-modal="true"
			aria-labelledby={labelledBy}
			onCancel={handleCancel}
			onClick={handleOutsideClick}
			className="mx-auto my-0 h-dvh max-h-none w-full max-w-app overflow-hidden bg-transparent p-0 backdrop:bg-transparent"
		>
			<m.div
				initial={SLIDE_FROM}
				animate={SLIDE_TO}
				style={{ y: offsetY }}
				className="absolute inset-x-0 top-26 bottom-0 flex flex-col rounded-t-panel bg-bg-1 shadow-sheet"
			>
				<DragHandle dragHandleProps={dragHandleProps} />
				<div className="min-h-0 scrollbar-subtle flex-1 overflow-y-auto overscroll-contain">{children}</div>
			</m.div>
		</dialog>
	);
}
