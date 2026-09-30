import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { PopupSummary } from "./popup";
import { prependRecentPopup } from "./recent-popups";

const STORAGE_KEY = "pp-recent-popups";
const STORAGE_VERSION = 1;

export type RecentPopupsLoadStatus = "loading" | "ready" | "failed";

interface RecentPopupsState {
	items: PopupSummary[];
	loadStatus: RecentPopupsLoadStatus;
	addRecentPopup: (popup: PopupSummary) => void;
	clearRecentPopups: () => void;
}

/** 복원 전에 쓰면 persist가 빈 목록 위에 쓴 값을 저장해 이전 기록을 지운다. 복원이 끝나기 전의 쓰기는 호출하는 쪽의 결함이다 */
function assertRecentPopupsReady(loadStatus: RecentPopupsLoadStatus) {
	if (loadStatus !== "ready") {
		throw new Error(`[recent-popups] 최근 본 팝업을 불러오기 전에 고치려 했다: ${loadStatus}`);
	}
}

/** clearRecentPopups는 이전 기록을 덮어쓰는 것이 목적이라 복원 전에도 막지 않는다. 로그아웃이 복원 전에 불러도 저장소가 비워진다 */
export const useRecentPopupsStore = create<RecentPopupsState>()(
	persist(
		(set, get) => ({
			items: [],
			loadStatus: "loading",
			addRecentPopup: (popup) => {
				const { items, loadStatus } = get();
				assertRecentPopupsReady(loadStatus);
				set({ items: prependRecentPopup(items, popup) });
			},
			clearRecentPopups: () => {
				set({ items: [] });
			}
		}),
		{
			name: STORAGE_KEY,
			version: STORAGE_VERSION,
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({ items: state.items }),
			skipHydration: true,
			onRehydrateStorage: () => (_state, error) => {
				if (error !== undefined) {
					console.warn("[recent-popups] 최근 본 팝업을 불러오지 못했다", error);
					useRecentPopupsStore.setState({ loadStatus: "failed" });
					return;
				}

				useRecentPopupsStore.setState({ loadStatus: "ready" });
			}
		}
	)
);

/** zustand persist는 저장소를 얻지 못하면(사이트 데이터를 막은 브라우저) 스토어에 persist를 붙이지 않고 조용히 넘어간다. 그때 rehydrate를 부르면 TypeError로 화면이 죽으므로 불러오기 실패로 돌린다 */
export function loadRecentPopups() {
	const persistApi = (useRecentPopupsStore as Partial<typeof useRecentPopupsStore>).persist;

	if (persistApi === undefined) {
		console.warn("[recent-popups] 세션 저장소를 쓸 수 없어 최근 본 팝업을 불러오지 못했다");
		useRecentPopupsStore.setState({ loadStatus: "failed" });
		return;
	}

	void persistApi.rehydrate();
}
