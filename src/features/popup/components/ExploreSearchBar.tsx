"use client";

import { type ChangeEvent, type SubmitEvent, useRef } from "react";

import SearchIcon from "@/shared/assets/icons/search.svg";
import { SvgIcon } from "@/shared/ui/SvgIcon";

interface ExploreSearchBarProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
}

export function ExploreSearchBar({ value, onChange, onSubmit }: ExploreSearchBarProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange(event.currentTarget.value);
	};

	const handleFormSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		inputRef.current?.blur();
		onSubmit();
	};

	return (
		<form role="search" onSubmit={handleFormSubmit} className="relative">
			<SvgIcon
				icon={SearchIcon}
				size={20}
				className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-icon-2"
			/>
			<input
				ref={inputRef}
				type="search"
				value={value}
				onChange={handleInputChange}
				enterKeyHint="search"
				aria-label="팝업 검색"
				placeholder="지역, 팝업, 브랜드를 검색해보세요."
				className="h-10.5 w-full rounded-xl border border-divider-2 bg-bg-1 pr-3 pl-11 text-b3-14 text-text-1 transition-colors outline-none placeholder:text-text-5 not-focus:hover:border-divider-3 focus:border-primary"
			/>
		</form>
	);
}
