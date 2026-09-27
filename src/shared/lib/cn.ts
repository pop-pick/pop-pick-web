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
const SHADOW_TOKENS = ["subtle", "bar", "floating", "on-map", "sheet", "modal"];
const TEXT_SHADOW_TOKENS = ["on-image"];

const twMerge = extendTailwindMerge({
	extend: {
		theme: {
			text: TEXT_SIZE_TOKENS,
			shadow: SHADOW_TOKENS,
			"text-shadow": TEXT_SHADOW_TOKENS
		}
	}
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
