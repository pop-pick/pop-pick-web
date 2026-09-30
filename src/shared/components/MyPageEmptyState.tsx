import ArrowUpRightIcon from "@/shared/assets/icons/arrow-up-right.svg";
import { EXPLORE_PATH } from "@/shared/model/explore-state";
import { LinkButton } from "@/shared/ui/LinkButton";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import { EmptyState } from "./EmptyState";

interface MyPageEmptyStateProps {
	title: string;
}

export function MyPageEmptyState({ title }: MyPageEmptyStateProps) {
	return (
		<div className="flex flex-col pt-15">
			<EmptyState hasWarningIcon title={title} />
			<div className="mt-18 flex flex-col items-center rounded-2xl bg-bg-2 p-5 text-center">
				<p className="text-b1-18 text-text-1">AI 코스 생성기 POP PICK</p>
				<p className="mt-3 text-b2-14 whitespace-pre-line text-text-2">
					{"취향, 동행, 시간 맞춤\n최적의 동선을 설계해 드려요"}
				</p>
				<LinkButton href={EXPLORE_PATH} className="mt-5 h-10 w-full gap-1 rounded-xl px-3 text-b1-14">
					팝업 둘러보러 가기
					<SvgIcon icon={ArrowUpRightIcon} size={16} />
				</LinkButton>
			</div>
		</div>
	);
}
