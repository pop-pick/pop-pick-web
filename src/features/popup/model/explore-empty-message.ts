export interface ExploreEmptyMessage {
	title: string;
	description: string;
}

export function buildExploreEmptyMessage(query: string) {
	if (query !== "") {
		return {
			title: "검색 결과가 없습니다.",
			description: "다른 검색어로\n다시 입력해주세요."
		};
	}

	return {
		title: "아직 등록된 팝업이 없어요.",
		description: "새 팝업이 등록되면\n여기에서 바로 보여드릴게요."
	};
}
