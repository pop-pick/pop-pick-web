"use client";

import ChevronRightIcon from "@/shared/assets/icons/chevron-right.svg";

import { SvgIcon } from "./SvgIcon";

interface ListRowProps {
	label: string;
	/** 주면 행이 포커스는 받되 눌러도 아무 일이 없고 이 문구를 스크린리더에 덧붙인다 */
	disabledReason?: string;
	onClick?: () => void;
}

export function ListRow({ label, disabledReason, onClick }: ListRowProps) {
	const isDisabled = disabledReason !== undefined;

	const handleClick = () => {
		if (!isDisabled) {
			onClick?.();
		}
	};

	return (
		<button
			type="button"
			aria-disabled={isDisabled ? true : undefined}
			onClick={handleClick}
			className="flex h-11 w-full items-center justify-between gap-3 px-5 text-left text-b3-14 text-text-4 focus-ring transition-colors not-aria-disabled:hover:text-text-2 aria-disabled:cursor-not-allowed aria-disabled:text-text-5"
		>
			<span className="min-w-0 truncate">
				{label}
				{isDisabled && <span className="sr-only">{`, ${disabledReason}`}</span>}
			</span>
			<SvgIcon icon={ChevronRightIcon} size={24} className="shrink-0" />
		</button>
	);
}
