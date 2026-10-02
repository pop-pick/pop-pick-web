import { api } from "@/shared/api/client";

export async function removeBookmark(popupId: number) {
	await api.delete<null>(`/api/v1/popups/${String(popupId)}/wish`);
}
