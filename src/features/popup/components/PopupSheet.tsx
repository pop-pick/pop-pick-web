"use client";

import * as m from "motion/react-m";
import { useRouter } from "next/navigation";
import { type MouseEvent, type ReactNode, type SyntheticEvent, useLayoutEffect, useRef } from "react";

import { useDragToClose } from "../hooks/useDragToClose";
import { EXPLORE_PATH } from "../model/explore-state";
import { DragHandle } from "./DragHandle";

const SLIDE_FROM = { y: "100%" };
const SLIDE_TO = { y: 0 };

/** `history.length`는 다른 출처 항목도 세어 뒤로 가기가 앱 밖으로 나갈 수 있다. Navigation API가 없는 브라우저는 뒤로 가지 않고 탐색 주소로 바꾼다. https://developer.mozilla.org/en-US/docs/Web/API/Navigation/canGoBack */
function canGoBackInApp() {
	const navigation: Navigation | undefined = window.navigation;
	return navigation?.canGoBack === true;
}

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
				className="absolute inset-x-0 top-37 bottom-0 flex flex-col rounded-t-3xl bg-bg-1 shadow-sheet"
			>
				<DragHandle dragHandleProps={dragHandleProps} />
				<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
			</m.div>
		</dialog>
	);
}
