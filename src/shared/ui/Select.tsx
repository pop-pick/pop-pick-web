"use client";

import * as m from "motion/react-m";
import { type FocusEvent, type KeyboardEvent, type MouseEvent, useEffect, useId, useRef, useState } from "react";

import ChevronDownIcon from "@/shared/assets/icons/chevron-down.svg";
import { tv, type VariantProps } from "@/shared/lib/tv";

import { DropdownPanel } from "./DropdownPanel";
import { SvgIcon } from "./SvgIcon";

const selectVariants = tv({
	slots: {
		root: "relative",
		button:
			"relative z-20 flex items-center justify-between rounded-xl border border-divider-2 bg-bg-1 text-b2-14 focus-ring transition-colors not-aria-expanded:hover:bg-bg-2 aria-expanded:border-transparent aria-expanded:bg-transparent",
		panel: "absolute top-0 left-0 z-10 rounded-xl bg-bg-1",
		listbox: "flex flex-col rounded-lg focus-ring",
		option: "-ml-1.5 flex cursor-pointer items-center rounded-lg px-1.5 text-text-1 aria-selected:text-primary"
	},
	variants: {
		size: {
			compact: {
				button: "h-9.75 w-25.5 py-1 pr-2 pl-3",
				panel: "w-25.5 border border-divider-2 pt-10.25 pr-2 pb-2 pl-3 shadow-floating",
				listbox: "gap-2",
				option: "h-7.25 text-b2-14"
			},
			field: {
				root: "min-w-0 flex-1",
				button: "h-12 w-full py-3 pr-3 pl-4",
				panel: "w-full pt-13 pr-3 pb-3 pl-4 shadow-sheet",
				listbox: "-mx-2 -my-1 max-h-86 scrollbar-subtle gap-3 overflow-y-auto overscroll-contain px-2",
				option: "-mx-2 h-8 shrink-0 px-2 text-b2-16"
			}
		},
		hasValue: {
			true: { button: "text-text-1" },
			false: { button: "text-text-4" }
		},
		isActive: {
			true: { option: "bg-bg-2" }
		}
	}
});

interface SelectProps<T> {
	options: readonly T[];
	/** 아직 고르지 않았으면 undefined. null도 선택지 값이 될 수 있다 */
	value: T | undefined;
	onChange: (value: T) => void;
	formatOptionLabel: (option: T) => string;
	label: string;
	labelledBy?: string;
	size: NonNullable<VariantProps<typeof selectVariants>["size"]>;
}

const CHEVRON_TRANSITION = { duration: 0.2 } as const;
const ARROW_STEPS: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };

function resolveNextIndex(key: string, currentIndex: number, count: number) {
	if (key === "Home") {
		return 0;
	}

	if (key === "End") {
		return count - 1;
	}

	const step = ARROW_STEPS[key];

	return step === undefined ? null : Math.min(Math.max(currentIndex + step, 0), count - 1);
}

/** WAI-ARIA 리스트박스 버튼 패턴. 목록에 포커스를 두고 aria-activedescendant로 가리키는 항목을 알린다 */
export function Select<T>({ options, value, onChange, formatOptionLabel, label, labelledBy, size }: SelectProps<T>) {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [isActiveHighlighted, setIsActiveHighlighted] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const listboxRef = useRef<HTMLUListElement>(null);
	const listboxId = useId();
	const isOpen = activeIndex !== null;
	const hasValue = value !== undefined;
	const styles = selectVariants({ size, hasValue });
	const labelIds = [labelledBy, `${listboxId}-label`].filter((id) => id !== undefined).join(" ");

	useEffect(() => {
		if (activeIndex === null) {
			return;
		}

		listboxRef.current?.children.item(activeIndex)?.scrollIntoView({ block: "nearest" });
	}, [activeIndex]);

	const closeListbox = (shouldFocusButton: boolean) => {
		setActiveIndex(null);

		if (shouldFocusButton) {
			buttonRef.current?.focus();
		}
	};

	const selectOption = (index: number) => {
		closeListbox(true);

		if (index < options.length && options[index] !== value) {
			onChange(options[index] as T);
		}
	};

	const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
		if (isOpen) {
			closeListbox(false);
			return;
		}

		setIsActiveHighlighted(event.detail === 0);
		setActiveIndex(hasValue ? Math.max(options.indexOf(value), 0) : 0);
	};

	const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		const isOpenKey = event.key === "ArrowDown" || event.key === "ArrowUp";

		if (isOpen || !isOpenKey) {
			return;
		}

		event.preventDefault();
		setIsActiveHighlighted(true);

		if (hasValue) {
			setActiveIndex(Math.max(options.indexOf(value), 0));
			return;
		}

		setActiveIndex(event.key === "ArrowUp" ? Math.max(options.length - 1, 0) : 0);
	};

	const handleButtonMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
		if (isOpen) {
			event.preventDefault();
		}
	};

	const attachListbox = (element: HTMLUListElement | null) => {
		listboxRef.current = element;
		element?.focus({ preventScroll: true });
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

		const nextIndex = resolveNextIndex(event.key, activeIndex, options.length);

		if (nextIndex !== null) {
			event.preventDefault();
			setIsActiveHighlighted(true);
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
		setIsActiveHighlighted(true);
		setActiveIndex(index);
	};

	return (
		<div onBlur={handleContainerBlur} className={styles.root()}>
			<span id={`${listboxId}-label`} className="sr-only">
				{label}
			</span>
			<button
				ref={buttonRef}
				type="button"
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-controls={isOpen ? listboxId : undefined}
				aria-labelledby={hasValue ? `${labelIds} ${listboxId}-value` : labelIds}
				onKeyDown={handleButtonKeyDown}
				onMouseDown={handleButtonMouseDown}
				onClick={handleButtonClick}
				className={styles.button()}
			>
				<span id={`${listboxId}-value`}>{hasValue ? formatOptionLabel(value) : label}</span>
				<m.span
					aria-hidden
					animate={{ rotate: isOpen ? 180 : 0 }}
					transition={CHEVRON_TRANSITION}
					className="flex text-icon-disabled"
				>
					<SvgIcon icon={ChevronDownIcon} size={24} />
				</m.span>
			</button>
			<DropdownPanel isOpen={isOpen} className={styles.panel()}>
				<ul
					ref={attachListbox}
					id={listboxId}
					role="listbox"
					tabIndex={-1}
					aria-labelledby={labelIds}
					aria-activedescendant={`${listboxId}-${String(activeIndex)}`}
					onKeyDown={handleListboxKeyDown}
					className={styles.listbox()}
				>
					{options.map((option, index) => (
						<li
							key={formatOptionLabel(option)}
							id={`${listboxId}-${String(index)}`}
							role="option"
							aria-selected={option === value}
							onClick={handleOptionClick(index)}
							onPointerMove={handleOptionPointerMove(index)}
							className={styles.option({ isActive: isActiveHighlighted && index === activeIndex })}
						>
							{formatOptionLabel(option)}
						</li>
					))}
				</ul>
			</DropdownPanel>
		</div>
	);
}
