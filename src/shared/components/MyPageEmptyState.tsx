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
		<div className="flex flex-col items-center gap-5 pt-15">
			<EmptyState hasWarningIcon title={title} description={"다양한 팝업을 둘러보고\n마음에 드는 곳을 찾아보세요."} />
			<LinkButton href={EXPLORE_PATH} size="sm" className="w-50.25">
				팝업 둘러보기
				<SvgIcon icon={ArrowUpRightIcon} size={16} />
			</LinkButton>
		</div>
	);
}
