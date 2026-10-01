import { api } from "@/shared/api/client";

export async function addBookmark(popupId: number) {
	await api.put<null>(`/api/v1/popups/${String(popupId)}/wish`);
}
