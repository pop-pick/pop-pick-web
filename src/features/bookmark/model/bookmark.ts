import type { PopupSummary } from "@/shared/model/popup";

export type BookmarkMode = "guest" | "member" | "pending";

export interface BookmarkedPopup extends PopupSummary {
	isEnded: boolean;
}
