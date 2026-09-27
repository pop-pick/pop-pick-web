import SparklesIcon from "@/shared/assets/icons/sparkles.svg";
import { formatMatchRateMessage } from "@/shared/model/popup-format";
import { SvgIcon } from "@/shared/ui/SvgIcon";

interface MatchRateNoteProps {
	nickname: string | null;
	matchRate: number;
}

export function MatchRateNote({ nickname, matchRate }: MatchRateNoteProps) {
	return (
		<p className="flex items-center justify-center gap-1 text-b3-12 text-ai">
			<SvgIcon icon={SparklesIcon} size={16} className="shrink-0" />
			{formatMatchRateMessage(nickname, matchRate)}
		</p>
	);
}
