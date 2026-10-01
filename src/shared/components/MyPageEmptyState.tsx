import { EXPLORE_PATH } from "@/shared/model/explore-state";

import { CourseStartBanner } from "./CourseStartBanner";
import { EmptyState } from "./EmptyState";

interface MyPageEmptyStateProps {
	title: string;
}

export function MyPageEmptyState({ title }: MyPageEmptyStateProps) {
	return (
		<div className="flex flex-col gap-18.5 pt-15">
			<EmptyState hasWarningIcon title={title} />
			<CourseStartBanner
				title="AI 코스 생성기 POP PICK"
				actionLabel="팝업 둘러보러 가기"
				actionHref={EXPLORE_PATH}
				isActionWide
			/>
		</div>
	);
}
