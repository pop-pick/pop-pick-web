import type { ExploreState } from "@/shared/model/explore-state";
import { REGION_LABELS } from "@/shared/model/region";

export interface ExploreEmptyMessage {
	title: string;
	description: string;
}

export function buildExploreEmptyMessage({ query, region }: Pick<ExploreState, "query" | "region">) {
	if (query !== "") {
		return {
			title: "검색 결과가 없습니다.",
			description: "다른 검색어를 입력하거나\n지역을 변경해 다시 입력해주세요."
		};
	}

	if (region !== null) {
		return {
			title: `${REGION_LABELS[region]}에 등록된 팝업이 없어요.`,
			description: "다른 지역을 선택하여\n팝업을 다시 찾아보세요."
		};
	}

	return {
		title: "아직 등록된 팝업이 없어요.",
		description: "새 팝업이 등록되면\n여기에서 바로 보여드릴게요."
	};
}
