import type { PopupCategory } from "@/shared/model/popup";

/**
 * 지도 핀 아이콘. 카테고리 라벨은 서버 목록으로 옮겨가도 아이콘은 정적 파일이라 대응표가 코드에 남는다.
 * 지금 파일은 색만 다른 자리표시이고 디자이너 아이콘이 오면 같은 경로에 덮어쓴다.
 */
const PIN_ICONS: Record<PopupCategory, string> = {
	fashion: "/pins/fashion.svg",
	beauty: "/pins/beauty.svg",
	character: "/pins/character.svg",
	game: "/pins/game.svg",
	tech: "/pins/tech.svg",
	food: "/pins/food.svg",
	art: "/pins/art.svg",
	lifestyle: "/pins/lifestyle.svg"
};

const DEFAULT_PIN_ICON = "/pins/default.svg";

function isKnownCategory(category: string): category is PopupCategory {
	return category in PIN_ICONS;
}

/** 카테고리가 서버 문자열로 바뀌어 여덟 밖의 값이 와도 기본 아이콘으로 그린다 */
export function getPinIcon(category: string) {
	return isKnownCategory(category) ? PIN_ICONS[category] : DEFAULT_PIN_ICON;
}
