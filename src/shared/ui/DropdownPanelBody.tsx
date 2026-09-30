"use client";

import { useIsPresent } from "motion/react";
import * as m from "motion/react-m";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

const PANEL_HIDDEN_STYLE = { opacity: 0, y: -6, scale: 0.96 };
const PANEL_SHOWN_STYLE = { opacity: 1, y: 0, scale: 1 };
const PANEL_TRANSITION = { type: "spring", bounce: 0.2, duration: 0.3 } as const;

type MotionDivAttributes = Omit<ComponentProps<typeof m.div>, "initial" | "animate" | "exit" | "transition">;

/** 닫히는 애니메이션 동안에도 판이 화면에 남는다. 그동안 inert로 두어 포인터와 Tab 포커스, 키 입력이 판 안으로 들어가지 않게 한다 */
export function DropdownPanelBody({ className, children, ...props }: MotionDivAttributes) {
	const isPresent = useIsPresent();

	return (
		<m.div
			initial={PANEL_HIDDEN_STYLE}
			animate={PANEL_SHOWN_STYLE}
			exit={PANEL_HIDDEN_STYLE}
			transition={PANEL_TRANSITION}
			inert={!isPresent}
			className={cn("origin-top", className)}
			{...props}
		>
			{children}
		</m.div>
	);
}
