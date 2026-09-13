import type { PopupCardItem } from "@/shared/types/popup";

/**
 * 화면 뼈대를 눈으로 확인하려고 둔 임시 값이다.
 * 백엔드 팝업 API가 붙으면 이 파일을 지우고 쿼리 결과로 바꾼다
 */
export const PLACEHOLDER_POPUPS: PopupCardItem[] = [
	{
		id: 1,
		name: "어글리 토이 팝업: 가을의 위로",
		region: "seongsu",
		category: "character",
		reservation: "required",
		endsOn: "10.26",
		reason: "찜한 캐릭터 굿즈 취향과 잘 맞아요"
	},
	{
		id: 2,
		name: "노마드 가을 팝업",
		region: "hongdae",
		category: "fashion",
		reservation: "free",
		endsOn: "11.02",
		reason: "자주 가는 지역에서 이번 주에 열려요"
	},
	{
		id: 3,
		name: "모노에디션 미디어 아트",
		region: "yongsan",
		category: "art",
		reservation: "waiting",
		endsOn: "11.15"
	},
	{
		id: 4,
		name: "시나모롤 20주년 하우스",
		region: "yeouido",
		category: "character",
		reservation: "required",
		endsOn: "10.31"
	},
	{
		id: 5,
		name: "무신사 가을 시즌 오프",
		region: "sinchon",
		category: "fashion",
		reservation: "free",
		endsOn: "10.20"
	}
];
