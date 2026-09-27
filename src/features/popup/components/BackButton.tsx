"use client";

import { useRouter } from "next/navigation";

import ArrowLeftIcon from "@/shared/assets/icons/arrow-left.svg";
import { SvgIcon } from "@/shared/ui/SvgIcon";

const FALLBACK_PATH = "/";

export function BackButton() {
	const router = useRouter();

	const handleBack = () => {
		if (window.history.length > 1) {
			router.back();
			return;
		}

		router.push(FALLBACK_PATH);
	};

	return (
		<button
			type="button"
			aria-label="뒤로 가기"
			onClick={handleBack}
			className="-m-2.5 flex size-11 shrink-0 items-center justify-center rounded-full text-icon focus-ring transition-colors hover:bg-bg-3"
		>
			<SvgIcon icon={ArrowLeftIcon} size={24} />
		</button>
	);
}
