"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { type FocusEvent, type KeyboardEvent, type MouseEvent, useId, useRef, useState } from "react";

import ChevronDownIcon from "@/shared/assets/icons/chevron-down.svg";
import { cn } from "@/shared/lib/cn";
import { type Region, REGION_LABELS, REGIONS } from "@/shared/model/region";
import { SvgIcon } from "@/shared/ui/SvgIcon";

interface RegionSelectProps {
	region: Region | null;
	onChange: (region: Region | null) => void;
}

const REGION_OPTIONS = [null, ...REGIONS] as const;
const ALL_REGIONS_LABEL = "전체 지역";

const ARROW_STEPS: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };

const PANEL_HIDDEN = { opacity: 0, y: -6, scale: 0.96 };
const PANEL_SHOWN = { opacity: 1, y: 0, scale: 1 };
const PANEL_EXIT = { ...PANEL_HIDDEN, pointerEvents: "none" } as const;
const PANEL_TRANSITION = { type: "spring", bounce: 0.2, duration: 0.3 } as const;
const CHEVRON_TRANSITION = { duration: 0.2 } as const;

function formatRegionLabel(region: Region | null) {
	return region === null ? ALL_REGIONS_LABEL : REGION_LABELS[region];
}

function resolveNextIndex(key: string, currentIndex: number) {
	if (key === "Home") {
		return 0;
	}

	if (key === "End") {
		return REGION_OPTIONS.length - 1;
	}

	const step = ARROW_STEPS[key];

	return step === undefined ? null : Math.min(Math.max(currentIndex + step, 0), REGION_OPTIONS.length - 1);
}

export function RegionSelect({ region, onChange }: RegionSelectProps) {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const listboxId = useId();
	const labelId = useId();
	const isOpen = activeIndex !== null;

	const closeListbox = (shouldFocusButton: boolean) => {
		setActiveIndex(null);

		if (shouldFocusButton) {
			buttonRef.current?.focus();
		}
	};

	const selectOption = (index: number) => {
		const option = REGION_OPTIONS[index];

		closeListbox(true);

		if (option !== undefined && option !== region) {
			onChange(option);
		}
	};

	const handleButtonClick = () => {
		if (isOpen) {
			closeListbox(false);
			return;
		}

		setActiveIndex(REGION_OPTIONS.indexOf(region));
	};

	const handleButtonMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
		if (isOpen) {
			event.preventDefault();
		}
	};

	const focusListbox = (element: HTMLUListElement | null) => {
		element?.focus();
	};

	const handleListboxKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
		if (activeIndex === null) {
			return;
		}

		if (event.key === "Escape") {
			event.preventDefault();
			closeListbox(true);
			return;
		}

		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			selectOption(activeIndex);
			return;
		}

		if (event.key === "Tab") {
			closeListbox(false);
			return;
		}

		const nextIndex = resolveNextIndex(event.key, activeIndex);

		if (nextIndex !== null) {
			event.preventDefault();
			setActiveIndex(nextIndex);
		}
	};

	const handleContainerBlur = (event: FocusEvent<HTMLDivElement>) => {
		if (!event.currentTarget.contains(event.relatedTarget)) {
			closeListbox(false);
		}
	};

	const handleOptionClick = (index: number) => () => {
		selectOption(index);
	};

	const handleOptionPointerMove = (index: number) => () => {
		setActiveIndex(index);
	};

	return (
		<div onBlur={handleContainerBlur} className="relative">
			<span id={labelId} className="sr-only">
				지역
			</span>
			<button
				ref={buttonRef}
				type="button"
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-controls={isOpen ? listboxId : undefined}
				aria-labelledby={`${labelId} ${listboxId}-value`}
				onMouseDown={handleButtonMouseDown}
				onClick={handleButtonClick}
				className={cn(
					"relative z-20 flex h-9.75 w-25.5 items-center justify-between rounded-xl border py-1 pr-2 pl-3 text-b2-14 text-text-1 focus-ring transition-colors",
					isOpen ? "border-transparent" : "border-divider-2 bg-bg-1 hover:bg-bg-2"
				)}
			>
				<span id={`${listboxId}-value`}>{formatRegionLabel(region)}</span>
				<m.span
					aria-hidden
					animate={{ rotate: isOpen ? 180 : 0 }}
					transition={CHEVRON_TRANSITION}
					className="flex text-icon-disabled"
				>
					<SvgIcon icon={ChevronDownIcon} size={24} />
				</m.span>
			</button>
			<AnimatePresence>
				{isOpen && (
					<m.div
						initial={PANEL_HIDDEN}
						animate={PANEL_SHOWN}
						exit={PANEL_EXIT}
						transition={PANEL_TRANSITION}
						className="absolute top-0 left-0 z-10 w-25.5 origin-top rounded-xl border border-divider-2 bg-bg-1 pt-10.5 pr-2 pb-2 pl-3 shadow-floating"
					>
						<ul
							ref={focusListbox}
							id={listboxId}
							role="listbox"
							tabIndex={-1}
							aria-labelledby={labelId}
							aria-activedescendant={`${listboxId}-${String(activeIndex)}`}
							onKeyDown={handleListboxKeyDown}
							className="flex flex-col gap-2 rounded-lg focus-ring"
						>
							{REGION_OPTIONS.map((option, index) => (
								<li
									key={option ?? "all"}
									id={`${listboxId}-${String(index)}`}
									role="option"
									aria-selected={option === region}
									onClick={handleOptionClick(index)}
									onPointerMove={handleOptionPointerMove(index)}
									className={cn(
										"-ml-1.5 flex h-7.25 cursor-pointer items-center rounded-lg px-1.5 text-b2-14 text-text-1 aria-selected:text-primary",
										index === activeIndex && "bg-bg-2"
									)}
								>
									{formatRegionLabel(option)}
								</li>
							))}
						</ul>
					</m.div>
				)}
			</AnimatePresence>
		</div>
	);
}
