import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const TEXT_SIZE_TOKENS = [
	"h1",
	"h2",
	"h3",
	"h4",
	"b1-18",
	"b1-16",
	"b1-14",
	"b2-20",
	"b2-16",
	"b2-14",
	"b2-12",
	"b3-16",
	"b3-14",
	"b3-12",
	"caption"
];
const SHADOW_TOKENS = ["subtle", "bar", "control", "floating", "on-map", "sheet", "modal"];
const TEXT_SHADOW_TOKENS = ["on-image"];
const SPACING_TOKENS = ["tab-bar-gap", "float-gap", "tab-bar-clearance", "tab-bar-space"];
const CONTAINER_TOKENS = ["app"];
const BLUR_TOKENS = ["floating"];

export const TAILWIND_MERGE_CONFIG = {
	extend: {
		theme: {
			text: TEXT_SIZE_TOKENS,
			shadow: SHADOW_TOKENS,
			"text-shadow": TEXT_SHADOW_TOKENS,
			spacing: SPACING_TOKENS,
			container: CONTAINER_TOKENS,
			blur: BLUR_TOKENS
		}
	}
};

const twMerge = extendTailwindMerge(TAILWIND_MERGE_CONFIG);

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
