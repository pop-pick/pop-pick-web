"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

const PANEL_HIDDEN_STYLE = { opacity: 0, y: -6, scale: 0.96 };
const PANEL_SHOWN_STYLE = { opacity: 1, y: 0, scale: 1 };
const PANEL_EXIT_STYLE = { ...PANEL_HIDDEN_STYLE, pointerEvents: "none" } as const;
const PANEL_TRANSITION = { type: "spring", bounce: 0.2, duration: 0.3 } as const;

interface DropdownPanelProps extends Omit<ComponentProps<typeof m.div>, "initial" | "animate" | "exit" | "transition"> {
	isOpen: boolean;
}

/** 닫히는 동안에도 판이 화면에 남아 있어 포인터를 받지 않게 한다. 받으면 항목의 포인터 이벤트가 판을 다시 연다 */
export function DropdownPanel({ isOpen, className, children, ...props }: DropdownPanelProps) {
	return (
		<AnimatePresence>
			{isOpen && (
				<m.div
					initial={PANEL_HIDDEN_STYLE}
					animate={PANEL_SHOWN_STYLE}
					exit={PANEL_EXIT_STYLE}
					transition={PANEL_TRANSITION}
					className={cn("origin-top", className)}
					{...props}
				>
					{children}
				</m.div>
			)}
		</AnimatePresence>
	);
}
