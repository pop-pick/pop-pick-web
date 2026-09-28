import type { ChevronProps } from "react-day-picker";

import ChevronLeftIcon from "@/shared/assets/icons/chevron-left.svg";
import ChevronRightIcon from "@/shared/assets/icons/chevron-right.svg";
import { SvgIcon } from "@/shared/ui/SvgIcon";

export function CalendarChevron({ orientation, className }: ChevronProps) {
	return <SvgIcon icon={orientation === "left" ? ChevronLeftIcon : ChevronRightIcon} size={24} className={className} />;
}
