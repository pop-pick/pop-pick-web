import type { PopupCategory } from "@/shared/model/popup";

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

export function getPinIcon(category: string) {
	return isKnownCategory(category) ? PIN_ICONS[category] : DEFAULT_PIN_ICON;
}
