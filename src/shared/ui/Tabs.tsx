"use client";

import * as m from "motion/react-m";
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";

export interface TabItem<T extends string> {
	value: T;
	id: string;
	label: ReactNode;
}

interface TabsProps<T extends string> {
	items: readonly TabItem<T>[];
	value: T;
	panelId: string;
	ariaLabel: string;
	onChange: (value: T) => void;
}

interface IndicatorBox {
	x: number;
	width: number;
}

const ARROW_STEPS: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
const INDICATOR_TRANSITION = { type: "spring", bounce: 0.2, duration: 0.35 } as const;

function resolveNextIndex(key: string, currentIndex: number, count: number) {
	if (key === "Home") {
		return 0;
	}

	if (key === "End") {
		return count - 1;
	}

	const step = ARROW_STEPS[key];

	return step === undefined ? null : (currentIndex + step + count) % count;
}

export function Tabs<T extends string>({ items, value, panelId, ariaLabel, onChange }: TabsProps<T>) {
	const listRef = useRef<HTMLDivElement>(null);
	const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
	const [indicator, setIndicator] = useState<IndicatorBox | null>(null);
	const currentIndex = items.findIndex((item) => item.value === value);

	useEffect(() => {
		const list = listRef.current;
		const button = buttonsRef.current[currentIndex];

		if (!list || !button) {
			return;
		}

		const observer = new ResizeObserver(() => {
			setIndicator({ x: button.offsetLeft, width: button.offsetWidth });
		});

		observer.observe(list);
		observer.observe(button);

		return () => {
			observer.disconnect();
		};
	}, [currentIndex]);

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const nextIndex = resolveNextIndex(event.key, currentIndex, items.length);
		const nextItem = nextIndex === null ? undefined : items[nextIndex];

		if (nextIndex === null || nextItem === undefined) {
			return;
		}

		event.preventDefault();
		onChange(nextItem.value);
		buttonsRef.current[nextIndex]?.focus();
	};

	const handleTabClick = (nextValue: T) => () => {
		onChange(nextValue);
	};

	return (
		<div
			ref={listRef}
			role="tablist"
			aria-label={ariaLabel}
			onKeyDown={handleKeyDown}
			className="relative flex gap-3 border-b border-divider-2 px-5"
		>
			{items.map((item, index) => {
				const isCurrent = item.value === value;

				return (
					<button
						key={item.value}
						ref={(element) => {
							buttonsRef.current[index] = element;
						}}
						id={item.id}
						type="button"
						role="tab"
						aria-selected={isCurrent}
						aria-controls={panelId}
						tabIndex={isCurrent ? 0 : -1}
						onClick={handleTabClick(item.value)}
						className="h-10 px-1 text-b2-16 text-text-4 focus-ring transition-colors not-aria-selected:hover:text-text-2 aria-selected:text-b1-16 aria-selected:text-primary"
					>
						{item.label}
					</button>
				);
			})}
			{indicator !== null && (
				<m.span
					aria-hidden
					initial={false}
					animate={{ x: indicator.x, width: indicator.width }}
					transition={INDICATOR_TRANSITION}
					className="absolute -bottom-0.5 left-0 h-0.5 bg-primary"
				/>
			)}
		</div>
	);
}
