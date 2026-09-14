# 찜 설계

`features/bookmark`. 카드와 상세, 마커 카드에 붙는 찜 버튼과 내 팝업의 찜 목록을 다룬다. 찜은 서버가 로그인 사용자별로 저장하는 서버 상태다. 스토어에 복제하지 않는다.

## R. Requirements

**기능.** 카드와 상세, 마커 카드의 하트로 찜하고 해제하며 내 팝업의 찜한 팝업 탭에서 목록을 본다. 동작 규칙은 `docs/product/SPEC.md`의 관심 팝업 저장 절이 정본이다.

**보장.**

- 하트를 누르면 100ms 안에 바뀐다. 서버 응답을 기다리지 않는다
- 서버가 실패하면 1초 안에 하트가 되돌아가고 토스트가 이유를 보인다
- 같은 팝업이 홈과 탐색 목록, 상세, 찜 목록에 동시에 보여도 하트 상태가 전부 같다. 캐시에 있는 그 팝업의 모든 사본을 한 번에 갱신한다
- 빠르게 여러 번 눌러도 마지막 의도가 남는다. 응답 순서가 뒤바뀌어도 화면이 뒤집히지 않는다
- 비로그인 사용자가 누르면 `/login?next={현재 경로}`로 간다. 로그인 뒤 돌아왔을 때 찜이 되어 있지 않다. 누른 의도까지 넘기지 않는다

**설계를 가르는 질문.**

- 주도권은 클라이언트다. 요청 응답이고 낙관적 갱신이다
- 실패는 되돌리고 알린다. 조용히 접지 않는다
- 찜 상태의 원천은 서버다. 각 팝업 응답의 `isBookmarked`가 원천이고 찜 목록은 그 집합이다. 별도 "찜한 id 집합" 스토어를 두면 원천이 둘이 된다

**범위 밖.** 찜 폴더와 메모, 찜 개수 상한, 찜한 팝업의 종료 알림(알림 자체가 범위 밖).

## A. Architecture

| 상태             | 원천                                      | 비고                                        |
| ---------------- | ----------------------------------------- | ------------------------------------------- |
| 팝업의 찜 여부   | Server. 각 팝업 응답의 `isBookmarked`     | 홈과 탐색, 상세, 찜 목록 캐시에 사본이 있다 |
| 찜 목록          | Server. `["bookmarks", "list"]` 무한 쿼리 | `PageResponse<PopupSummary>`                |
| 누른 직후의 상태 | Optimistic. 캐시를 먼저 바꾼다            | 실패 시 스냅샷으로 되돌린다                 |
| 진행 중인 토글   | 뮤테이션 상태. `mutationKey`에 `popupId`  | 같은 팝업의 이전 뮤테이션을 취소한다        |

**흐름.**

```
하트 클릭
  비로그인이면 useRequireAuth().ensure(현재 경로) 뒤 끝
  onMutate   그 popupId를 가진 모든 캐시 항목의 isBookmarked를 next로 바꾼다. 이전 값들을 스냅샷
  요청       next가 true면 POST, false면 DELETE
  onError    스냅샷으로 되돌리고 토스트, [bookmark] 로그
  onSettled  같은 popupId의 뮤테이션이 더 없을 때만 popups와 recommendations, bookmarks 키를 무효화
```

캐시를 바꾸는 자리는 `patchBookmarkInCaches` 하나다. `["popups"]`, `["recommendations"]`, `["bookmarks"]`로 시작하는 모든 쿼리 데이터를 훑어 `id`가 같은 `PopupSummary`를 찾아 바꾼다. 무한 쿼리는 페이지 배열 안을 훑는다. 상세 캐시(`PopupDetail`)도 `PopupSummary`를 확장하므로 같은 함수가 다룬다.

빠른 연타는 `mutationKey: ["bookmark", popupId]`로 같은 키의 뮤테이션을 묶고 새 뮤테이션이 시작되면 이전 것의 결과를 무시한다. 응답이 뒤바뀌어 도착해도 마지막 뮤테이션의 `onSettled`에서만 무효화가 돌아 서버 값으로 맞춰진다.

## D. Data Model

```typescript
// features/bookmark/model/bookmark.ts
interface BookmarkToggleInput {
	popupId: number;
	next: boolean;
}

interface BookmarkSnapshot {
	queryKey: QueryKey;
	data: unknown;
}

// features/bookmark/model/patch-bookmark-in-caches.ts
/** 캐시 안 모든 PopupSummary 사본을 찾아 isBookmarked를 바꾸고 이전 값 스냅샷을 돌려준다 */
function patchBookmarkInCaches(queryClient: QueryClient, popupId: number, isBookmarked: boolean): BookmarkSnapshot[];
function restoreSnapshots(queryClient: QueryClient, snapshots: BookmarkSnapshot[]): void;
```

찜 목록의 항목은 `PopupSummary` 그대로다. 종료 여부와 종료 임박은 `popup.md`의 `getPopupStatus`로 파생한다. 목록 응답에 별도 필드를 두지 않는다.

## I. Interface

**컴포넌트와 훅.**

```typescript
export function BookmarkButton({
	popup,
	size
}: {
	popup: Pick<PopupSummary, "id" | "isBookmarked" | "title">;
	size: "sm" | "md";
});
export function BookmarkList(); // 내 팝업의 찜한 팝업 탭. 종료 항목 흐림 처리

export function useToggleBookmark(): UseMutationResult<null, ApiError, BookmarkToggleInput>;
export function useBookmarkList(): UseInfiniteQueryResult<InfiniteData<PageResponse<PopupSummary>>, ApiError>;
```

`BookmarkButton`은 `popup.isBookmarked`를 그대로 그린다. 낙관적 상태가 캐시에 반영되므로 버튼이 따로 상태를 들지 않는다.

**서버 API.** 전부 백엔드 요구다.

| 메서드와 경로                        | 인증 | 응답                                       |
| ------------------------------------ | ---- | ------------------------------------------ |
| `POST /api/v1/bookmarks/{popupId}`   | 필요 | `null`. 이미 찜이면 그대로 성공            |
| `DELETE /api/v1/bookmarks/{popupId}` | 필요 | `null`. 찜이 아니어도 그대로 성공          |
| `GET /api/v1/me/bookmarks`           | 필요 | `PageResponse<PopupSummary>`. 최근 찜한 순 |

멱등이어야 한다. 연타로 같은 요청이 두 번 가도 오류가 아니어야 되돌림이 헛돌지 않는다. 팝업 응답 전부에 `isBookmarked`가 실리는 것도 요구다. 토큰이 없으면 `false`다.

**로그.** `[bookmark]` 접두사. 되돌림이 일어날 때 `popupId`와 `errorCode`.

**접근성.** `<button aria-pressed={isBookmarked}>`이고 `aria-label`은 "{팝업명} 찜" 하나로 고정한다. 눌림 상태는 `aria-pressed`가 전달하므로 라벨을 "찜 해제"로 바꾸지 않는다. 아이콘만 있는 버튼이라 라벨이 필수다. 되돌림 토스트는 `role="status"` 영역에 들어간다. 찜 목록의 종료 항목은 흐림 처리와 함께 "종료" 텍스트 배지를 가진다. 색만으로 구분하지 않는다.

## O. Optimization과 운영

**렌더링.** 캐시 패치는 `setQueriesData`로 한 번에 돈다. 페이지가 여럿이어도 팝업 수십 개 수준이다.

**장애.** 서버가 죽으면 모든 토글이 되돌아가고 토스트가 뜬다. 목록은 `ErrorState`다.

**재시도.** 토글 뮤테이션은 재시도하지 않는다. 사용자가 다시 누르는 것이 재시도다.

**지표.** 되돌림 횟수가 0이어야 한다. 0이 아닌데 네트워크 오류가 아니면 멱등이 깨졌거나 권한 문제다.

**운영.** 없음.
