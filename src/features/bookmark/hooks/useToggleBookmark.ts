import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/shared/api/errors";

import { addBookmark } from "../api/add-bookmark";
import { removeBookmark } from "../api/remove-bookmark";
import { patchBookmarkInCaches } from "../model/patch-bookmark-in-caches";

/** popups를 무효화하면 받아 둔 목록과 상세를 전부 다시 받아 요청이 몰린다. 찜 여부는 패치로 맞추고 찜 목록만 다시 받는다 */
export function useToggleBookmark(popupId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["bookmarks", "toggle", popupId],
		mutationFn: (isBookmarked: boolean) => (isBookmarked ? addBookmark(popupId) : removeBookmark(popupId)),
		onSuccess: (_, isBookmarked) => {
			patchBookmarkInCaches(queryClient, popupId, isBookmarked);
			void queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
		},
		onError: (error, isBookmarked) => {
			const errorCode = error instanceof ApiError ? error.errorCode : null;
			console.error("[bookmark] 찜 설정을 바꾸지 못했다", { popupId, isBookmarked, errorCode }, error);
		}
	});
}
