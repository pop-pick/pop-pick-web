import SparklesIcon from "@/shared/assets/icons/sparkles.svg";
import { formatMatchRateMessage } from "@/shared/model/popup-format";
import { SvgIcon } from "@/shared/ui/SvgIcon";

interface MatchRatePillProps {
	nickname: string | null;
	matchRate: number;
}

export function MatchRatePill({ nickname, matchRate }: MatchRatePillProps) {
	return (
		<p className="flex h-8.5 items-center justify-center gap-1 rounded-full bg-black/40 px-4 text-b3-12 text-primary-subtle">
			<SvgIcon icon={SparklesIcon} size={16} />
			{formatMatchRateMessage(nickname, matchRate)}
		</p>
	);
}
