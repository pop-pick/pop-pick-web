# 찜 설계

`features/bookmark`. 카드와 상세, 지도 팝업 카드에 붙는 찜 버튼과 마이페이지의 찜 목록을 다룬다. 찜은 서버가 로그인 사용자별로 저장하는 서버 상태다. 스토어에 복제하지 않는다.

## R. Requirements

**기능.** 카드와 상세, 지도 팝업 카드의 하트로 찜하고 해제하며 마이페이지의 찜한 팝업 탭에서 목록을 본다. 알럿 문구와 분기는 `docs/product/SPEC.md`의 관심 팝업 저장 절이 정본이다.

**보장.**

- 하트를 누르면 무엇을 하려는지 묻는 알럿이 먼저 뜬다. 확인을 눌러야 요청이 나간다. 취소하면 아무 요청도 나가지 않고 하트가 그대로다
- 요청이 성공해야 하트가 바뀐다. 실패하면 하트가 그대로이고 이유를 문구로 보인다
- 요청이 나간 동안 그 버튼은 대기 상태이고 다시 눌리지 않는다. 같은 팝업에 요청이 겹치지 않는다
- 같은 팝업이 홈과 탐색 목록, 상세, 찜 목록에 동시에 보여도 하트 상태가 전부 같다. 응답이 오면 캐시에 있는 그 팝업의 모든 사본을 한 번에 갱신한다
- 비로그인 사용자가 누르면 로그인 유도 알럿이 뜨고 확인하면 `/login?next={현재 경로}`로 간다. 로그인 뒤 돌아왔을 때 찜이 되어 있지 않다. 누른 의도까지 넘기지 않는다
- 지도 팝업 카드에서 찜 버튼을 눌러도 상세가 열리지 않는다

**설계를 가르는 질문.**

- 주도권은 클라이언트다. 요청 응답이다
- 낙관적 갱신을 하지 않는다. 기획이 찜과 해제에 확인 알럿을 뒀다. 확인을 누르는 단계가 있으면 실수로 누르는 일이 없어 화면을 앞질러 그릴 이유가 사라지고, 되돌림 문구까지 보이면 알럿과 겹쳐 사용자가 두 번 놀란다
- 실패는 드러내고 알린다. 조용히 접지 않는다
- 찜 상태의 원천은 서버다. 각 팝업 응답의 `isBookmarked`가 원천이고 찜 목록은 그 집합이다. 별도 "찜한 id 집합" 스토어를 두면 원천이 둘이 된다

**범위 밖.** 찜 폴더와 메모, 찜 개수 상한, 찜한 팝업의 종료 알림(알림 자체가 범위 밖).

## A. Architecture

| 상태           | 원천                                      | 비고                                        |
| -------------- | ----------------------------------------- | ------------------------------------------- |
| 팝업의 찜 여부 | Server. 각 팝업 응답의 `isBookmarked`     | 홈과 탐색, 상세, 찜 목록 캐시에 사본이 있다 |
| 찜 목록        | Server. `["bookmarks", "list"]` 무한 쿼리 | `PageResponse<PopupSummary>`                |
| 열려 있는 알럿 | 컴포넌트 `useState`                       | native `<dialog>`. 버튼마다 하나            |
| 진행 중인 토글 | 뮤테이션 상태. `mutationKey`에 `popupId`  | 대기 중에는 버튼이 `disabled`               |

**흐름.**

```
하트 클릭
  비로그인    "로그인 후 이용 가능합니다. 로그인 하시겠습니까?"
                확인  useRequireAuth().ensureAuthenticated(현재 경로)로 /login?next=
                취소  알럿만 닫힌다
  찜 안 함    "해당 팝업을 찜하시겠습니까?"
                확인  POST /bookmarks/{popupId}
                취소  알럿만 닫힌다
  이미 찜함   "해당 팝업의 찜 설정을 해제하시겠습니까?"
                확인  DELETE /bookmarks/{popupId}
                취소  알럿만 닫힌다

  onSuccess   그 popupId를 가진 모든 캐시 항목의 isBookmarked를 next로 바꾸고
              popups와 recommendations, bookmarks 키를 무효화한다
  onError     하트는 그대로. 토스트로 이유, [bookmark] 로그
```

캐시를 바꾸는 자리는 `patchBookmarkInCaches` 하나다. `["popups"]`, `["recommendations"]`, `["bookmarks"]`로 시작하는 모든 쿼리 데이터를 훑어 `id`가 같은 `PopupSummary`를 찾아 바꾼다. 무한 쿼리는 페이지 배열 안을 훑는다. 상세 캐시(`PopupDetail`)도 `PopupSummary`를 확장하므로 같은 함수가 다룬다.

응답이 온 뒤에 캐시를 바꾸므로 되돌리는 경로가 없다. 무효화는 서버 값을 다시 받아 맞추는 자리이고 화면은 그 사이 패치된 값을 보인다.

지도 팝업 카드는 카드 전체가 상세를 여는 자리다. 찜 버튼의 클릭 핸들러가 `stopPropagation`을 부른다. 기획이 겹칠 우려를 먼저 짚은 자리라 구현할 때 확인한다.

## D. Data Model

```typescript
// features/bookmark/model/bookmark.ts
interface BookmarkToggleInput {
	popupId: number;
	next: boolean;
}

/** 알럿 문구를 고르는 자리. 세 상황이 서로 다른 문구다 */
type BookmarkIntent = "login-required" | "add" | "remove";

// features/bookmark/model/bookmark-intent.ts
function resolveIntent(params: { isAuthenticated: boolean; isBookmarked: boolean }): BookmarkIntent;
function getConfirmMessage(intent: BookmarkIntent): string;

// features/bookmark/model/patch-bookmark-in-caches.ts
/** 캐시 안 모든 PopupSummary 사본을 찾아 isBookmarked를 바꾼다 */
function patchBookmarkInCaches(queryClient: QueryClient, popupId: number, isBookmarked: boolean): void;
```

`resolveIntent`는 분기 있는 순수 함수라 `testing.md`의 값이 나는 자리다. 문구를 코드 여기저기에 흩지 않고 `getConfirmMessage` 한 곳에 둔다. 네 문구가 기획 명세에서 온 값이라 바뀌면 고칠 자리가 하나여야 한다.

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
export function BookmarkList(); // 마이페이지의 찜한 팝업 탭. 종료 항목 흐림 처리

export function useToggleBookmark(): UseMutationResult<null, ApiError, BookmarkToggleInput>;
export function useBookmarkList(): UseInfiniteQueryResult<InfiniteData<PageResponse<PopupSummary>>, ApiError>;
```

`BookmarkButton`은 알럿을 자기 안에 들고 있다. `popup.isBookmarked`를 그대로 그리고 뮤테이션이 진행 중이면 `disabled`다. 확인 대화상자는 `shared/ui`의 `ConfirmDialog`를 쓴다. 코스 삭제 확인도 같은 컴포넌트를 쓴다.

**서버 API.** 전부 백엔드 요구다.

| 메서드와 경로                        | 인증 | 응답                                       |
| ------------------------------------ | ---- | ------------------------------------------ |
| `POST /api/v1/bookmarks/{popupId}`   | 필요 | `null`. 이미 찜이면 그대로 성공            |
| `DELETE /api/v1/bookmarks/{popupId}` | 필요 | `null`. 찜이 아니어도 그대로 성공          |
| `GET /api/v1/me/bookmarks`           | 필요 | `PageResponse<PopupSummary>`. 최근 찜한 순 |

멱등이어야 한다. 같은 요청이 두 번 가도 오류가 아니어야 화면과 서버가 어긋나지 않는다. 팝업 응답 전부에 `isBookmarked`가 실리는 것도 요구다. 토큰이 없으면 `false`다.

**로그.** `[bookmark]` 접두사. 토글 요청이 실패할 때 `popupId`와 `errorCode`.

**접근성.** 하트는 `<button aria-pressed={isBookmarked}>`이고 `aria-label`은 "{팝업명} 찜" 하나로 고정한다. 눌림 상태는 `aria-pressed`가 전달하므로 라벨을 "찜 해제"로 바꾸지 않는다. 아이콘만 있는 버튼이라 라벨이 필수다.

확인 대화상자는 native `<dialog>`다. 열면 확인 버튼에 포커스가 가고 Esc와 취소가 같은 동작이며 닫으면 눌렀던 하트로 포커스가 돌아온다. 실패 토스트는 `role="status"` 영역에 들어간다. 찜 목록의 종료 항목은 흐림 처리와 함께 "종료" 텍스트 배지를 가진다. 색만으로 구분하지 않는다.

## O. Optimization과 운영

**렌더링.** 캐시 패치는 `setQueriesData`로 한 번에 돈다. 페이지가 여럿이어도 팝업 수십 개 수준이다.

**장애.** 서버가 죽으면 모든 토글이 실패하고 하트가 그대로 있으며 토스트가 뜬다. 목록은 `ErrorState`다.

**재시도.** 토글 뮤테이션은 재시도하지 않는다. 사용자가 다시 누르는 것이 재시도다.

**지표.** 토글 실패 횟수를 센다. 네트워크 오류가 아닌 실패가 있으면 멱등이 깨졌거나 권한 문제다. 알럿에서 취소를 누르는 비율이 높으면 하트를 실수로 누르기 쉬운 배치라는 뜻이다.
