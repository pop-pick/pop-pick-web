export interface ExploreEmptyMessage {
	title: string;
	description: string;
}

const SEARCH_EMPTY_TITLE = "검색 결과가 없습니다.";

export function buildListEmptyMessage(query: string, selectedAreaName: string | null) {
	if (query !== "") {
		return {
			title: SEARCH_EMPTY_TITLE,
			description: "다른 검색어를 입력하거나\n지역을 변경해 다시 입력해주세요."
		};
	}

	if (selectedAreaName !== null) {
		return {
			title: `${selectedAreaName}에 등록된 팝업이 없어요.`,
			description: "다른 지역을 선택하여\n팝업을 다시 찾아보세요."
		};
	}

	return {
		title: "아직 등록된 팝업이 없어요.",
		description: "새 팝업이 등록되면\n여기에서 바로 보여드릴게요."
	};
}

/** 지도 응답은 보이는 영역 안에서 좌표가 있는 팝업만 준다. 빈 결과는 그 영역에 핀이 없다는 뜻이다 */
export function buildMapEmptyMessage(query: string) {
	if (query !== "") {
		return {
			title: SEARCH_EMPTY_TITLE,
			description: "다른 검색어를 입력하거나\n지도를 움직여 다시 찾아보세요."
		};
	}

	return {
		title: "지도에 표시할 팝업이 없어요.",
		description: "지도를 움직여 다른 곳을 찾아보세요.\n위치 정보가 없는 팝업은 목록에서 볼 수 있어요."
	};
}
