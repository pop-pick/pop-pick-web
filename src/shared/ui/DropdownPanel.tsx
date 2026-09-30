"use client";

import { AnimatePresence } from "motion/react";
import type { ComponentProps } from "react";

import { DropdownPanelBody } from "./DropdownPanelBody";

interface DropdownPanelProps extends ComponentProps<typeof DropdownPanelBody> {
	isOpen: boolean;
}

export function DropdownPanel({ isOpen, ...props }: DropdownPanelProps) {
	return <AnimatePresence>{isOpen && <DropdownPanelBody {...props} />}</AnimatePresence>;
}
