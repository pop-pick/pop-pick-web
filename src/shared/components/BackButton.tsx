"use client";

import { useRouter } from "next/navigation";

import ArrowLeftIcon from "@/shared/assets/icons/arrow-left.svg";
import { canGoBackInApp } from "@/shared/lib/navigation";
import { IconButton } from "@/shared/ui/IconButton";
import { SvgIcon } from "@/shared/ui/SvgIcon";

interface BackButtonProps {
	/** 앱 안에 돌아갈 기록이 없을 때 갈 주소 */
	fallbackPath: string;
}

export function BackButton({ fallbackPath }: BackButtonProps) {
	const router = useRouter();

	const handleBack = () => {
		if (canGoBackInApp()) {
			router.back();
			return;
		}

		router.replace(fallbackPath);
	};

	return (
		<IconButton label="뒤로 가기" onClick={handleBack} className="-m-3">
			<SvgIcon icon={ArrowLeftIcon} size={24} />
		</IconButton>
	);
}
