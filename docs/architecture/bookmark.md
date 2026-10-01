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
- 지도 팝업 카드와 탐색 목록 카드에서 찜 버튼을 눌러도 상세가 열리지 않는다

**설계를 가르는 질문.**

- 주도권은 클라이언트다. 요청 응답이다
- 낙관적 갱신을 하지 않는다. 기획이 찜과 해제에 확인 알럿을 뒀다. 확인을 누르는 단계가 있으면 실수로 누르는 일이 없어 화면을 앞질러 그릴 이유가 사라지고, 되돌림 문구까지 보이면 알럿과 겹쳐 사용자가 두 번 놀란다
- 실패는 드러내고 알린다. 하트를 그대로 두고 실패 알럿으로 이유를 보인다
- 찜 상태의 원천은 서버다. 각 팝업 응답의 찜 여부가 원천이고 찜 목록은 그 집합이다. 별도 "찜한 id 집합" 스토어를 두면 원천이 둘이 된다

**범위 밖.** 찜 폴더와 메모, 찜 개수 상한, 찜한 팝업의 종료 알림(알림 자체가 범위 밖).

**지금 있는 것.** 팝업 상세와 지도 위 상세 바텀시트, 탐색의 지도 카드와 목록 카드, 마이페이지 찜 목록 카드에 하트가 있다. 비회원은 로그인 유도 알럿을, 회원은 확인 알럿을 거쳐 서버에 찜과 해제를 요청한다. 마이페이지의 찜한 팝업 탭이 내 찜 목록을 보인다. 9/26 시안의 홈 카드에는 하트가 없다.

## A. Architecture

| 상태           | 원천                                                              | 비고                                                               |
| -------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| 팝업의 찜 여부 | Server. 각 팝업 캐시의 `isBookmarked`                             | 홈과 탐색, 상세, 찜 목록 캐시에 사본이 있다                        |
| 찜 목록        | Server. `["bookmarks", "list"]` 무한 쿼리                         | `BookmarkedPopup`. 열 개씩, 최근 찜한 순이고 끝난 팝업도 들어 있다 |
| 열려 있는 알럿 | 컴포넌트 `useState`                                               | native `<dialog>`. 열려 있을 때만 그린다                           |
| 로그인 여부    | 인증 상태. 라우트가 `AuthStatusSwitch` 슬롯으로 고른다            | 버튼은 `mode`만 받고 인증 상태를 읽지 않는다                       |
| 진행 중인 토글 | 뮤테이션 상태. `mutationKey`는 `["bookmarks", "toggle", popupId]` | 대기 중에는 버튼이 `aria-disabled`와 `aria-busy`다                 |

**흐름.**

```
하트 클릭
  비로그인    "로그인 후 이용이 가능합니다. 로그인하시겠습니까?"
                로그인 하러가기  /login?next=누른 순간의 경로와 쿼리로 이동
                닫기(X)          알럿만 닫힌다
  찜 안 함    "해당 팝업을 찜하시겠습니까?"
                확인  PUT /api/v1/popups/{popupId}/wish
                취소  알럿만 닫힌다
  이미 찜함   "해당 팝업의 찜 설정을 해제하시겠습니까?"
                해제  DELETE /api/v1/popups/{popupId}/wish
                취소  알럿만 닫힌다

  onSuccess   그 popupId를 가진 모든 캐시 항목의 isBookmarked를 다음 값으로 바꾸고
              bookmarks 키만 무효화한다
  onError     하트는 그대로. 실패 알럿으로 이유, [bookmark] 로그
```

`popups`와 `recommendations` 키는 패치만 하고 무효화하지 않는다. `popups`를 무효화하면 탐색 지도가 들고 있는 상세 최대 50건을 다시 받고, `recommendations`를 무효화하면 홈 PICK을 무작위로 다시 뽑아 카드가 바뀐다.

**로그인 여부를 아는 곳.** `BookmarkButton`은 `auth`의 `useAuthStore`를 부르지 않는다. 기능끼리 부르지 않는 규칙(`architecture.md`) 때문이다. 대신 라우트가 `features/auth`의 `AuthStatusSwitch`에 인증 상태마다 다른 `mode`의 `BookmarkSlotProvider`를 넣는다. `anonymous`는 `mode="guest"`, `authenticated`는 `mode="member"`, `restoring`과 `unavailable`은 `mode="pending"`이다. `pending`은 `aria-disabled`라 눌러도 아무 일이 없다. 마이페이지는 `RequireAuth` 안이라 `mode="member"`로 감싼다. `guest`의 로그인 주소는 알럿에서 로그인 하러가기를 누른 순간의 주소(`location.pathname`과 `search`)로 `shared/model/login-path`의 `buildLoginPath`가 만든다. 탐색은 검색어를 서버를 다시 부르지 않고 주소에만 쓰기 때문에 라우트가 미리 만든 주소로는 그 검색어가 돌아오지 않는다.

캐시를 바꾸는 자리는 `patchBookmarkInCaches` 하나다. `["popups"]`, `["recommendations"]`, `["bookmarks"]`로 시작하는 모든 쿼리 데이터를 재귀로 훑어 `id`가 같고 `isBookmarked`가 boolean인 객체를 바꾼다. 무한 쿼리의 페이지 배열과 홈 카드의 `{ popup }` 안까지 찾는다. 최근 본 팝업 탭의 하트도 상세 캐시에서 읽으므로 같이 바뀐다. 바뀐 경로의 객체만 새로 만들고 나머지는 참조가 그대로다. 그 팝업이 없는 쿼리는 업데이터가 `undefined`를 돌려줘 건드리지 않으므로 그 쿼리의 오류나 무효화 표시가 남는다. 상세 캐시(`PopupDetail`)도 `PopupSummary`를 확장하므로 같은 함수가 다룬다. 그래서 팝업을 캐시에 두는 쿼리는 이 세 접두사 중 하나로 키를 시작하고, 응답을 `select`가 아니라 queryFn 안에서 `id`와 `isBookmarked`를 가진 모델로 바꿔 둔다.

응답이 온 뒤에 캐시를 바꾸므로 되돌리는 경로가 없다. 무효화는 찜 목록을 다시 받아 순서와 포함 여부를 서버에 맞추고 화면은 그 사이 패치된 값을 보인다. 해제한 팝업은 다시 받은 찜 목록에서 빠진다.

지도 카드와 목록 카드는 카드 전체가 상세를 여는 링크처럼 보인다. 찜 버튼은 링크 안에 넣지 않고 링크의 형제로 두어 링크가 덮는 영역 위에 쌓는다. 클릭이 링크로 번질 경로가 없어 `stopPropagation`을 부르지 않는다. 찜 목록 카드도 같다.

**카드와 상세에 버튼을 넣는 법.** 탐색 카드는 여러 개이고 `features/popup` 안에서 그려져 라우트가 슬롯 prop으로 하나씩 넘길 수 없다. popup이 bookmark를 부르면 기능끼리 부르지 않는 규칙에 걸린다. 그래서 `shared/components/BookmarkSlot`이 컨텍스트를 두고 탐색 카드와 상세 본문은 `<BookmarkSlot popupId popupTitle isBookmarked size />` 자리만 그린다. 위에 적은 대로 라우트가 감싼 `BookmarkSlotProvider`가 그 모드의 `BookmarkButton`을 그린다. 탐색과 두 상세 라우트(`/popups/[popupId]`, `/explore/@sheet/popups/[popupId]`), 마이페이지가 이렇게 감싼다. Provider 밖에서 `BookmarkSlot`을 그리면 예외를 낸다. 라우트가 감싸는 것을 빠뜨리면 빈칸으로 그려지지 않고 예외로 드러난다.

## D. Data Model

```typescript
// features/bookmark/model/bookmark.ts
interface BookmarkedPopup extends PopupSummary {
	isEnded: boolean; // 서버 ended
}

// features/bookmark/model/bookmark-dialog.ts
/** 알럿 문구를 고르는 자리. 세 상황이 서로 다른 문구다 */
type BookmarkIntent = "login-required" | "add" | "remove";
type BookmarkDialog = BookmarkIntent | "failure";
function resolveIntent(params: { isMember: boolean; isBookmarked: boolean }): BookmarkIntent;
function getBookmarkDialogCopy(
	dialog: BookmarkDialog,
	error: unknown
): { message: string; confirmLabel: string; closeLabel?: string };

// features/bookmark/model/bookmark-format.ts
function formatBookmarkBadge(popup: Pick<BookmarkedPopup, "endDate" | "isEnded">, now: Date): string | null;

// features/bookmark/model/patch-bookmark-in-caches.ts
/** 캐시 안 모든 팝업 사본을 찾아 isBookmarked를 바꾼다 */
function patchBookmarkInCaches(queryClient: QueryClient, popupId: number, isBookmarked: boolean): void;
```

`resolveIntent`는 분기 있는 순수 함수라 `testing-trophy.md`의 값이 나는 자리다. 문구는 코드 여기저기에 흩지 않고 `bookmark-dialog.ts`의 표 한 곳에 둔다. 확인 알럿 셋의 메시지와 버튼 문구, 실패 문구 셋(네트워크와 타임아웃, `E404`, 나머지)이 여기 있다. 로그인 유도 알럿의 메시지와 버튼 문구는 `shared/model/login-prompt.ts`에서 가져온다.

찜 목록의 항목은 `BookmarkedPopup`이다. 종료 여부는 서버 `ended`를 그대로 쓴다. 상태 배지는 `formatBookmarkBadge`가 정한다. 끝났으면 "종료된 팝업"이고, 끝나지 않았고 종료일이 서울 기준 오늘부터 7일 안이면 "종료임박 D-n"이나 "종료임박 D-Day"다. 종료일이 없거나 8일 넘게 남았으면 배지가 없다. 7일은 시안 453-2921의 카드에서 정했다. 3일 남은 카드에 배지가 있고 11일 남은 카드에는 없다. 기획이 기준을 정하는지는 미정이고 바뀌면 `ENDING_SOON_DAYS` 하나를 고친다. 종료일 줄은 탐색 카드와 같은 `shared/model/popup-format.ts`의 `formatEndDateLabel`이다("MM.dd 종료", 종료일이 없으면 "상시운영"). 응답에 지역이 없어 `region`은 `null`이고 `wishedAt`은 쓰지 않는다. 응답은 queryFn 안에서 모델로 바꾼다.

## I. Interface

**컴포넌트와 훅.**

```typescript
// 테두리 버튼
type BookmarkButtonSize = "sm" | "md" | "lg"; // shared/components/BookmarkSlot.tsx. 32px, 40px, 48px이고 아이콘은 20, 24, 24
export function BookmarkButton(props: {
	mode: "guest" | "member" | "pending";
	popupId: number;
	popupTitle: string;
	isBookmarked: boolean | null; // null은 아직 모름
	size?: BookmarkButtonSize;
}); // size 기본 lg. 상세는 lg, 지도 카드는 md, 목록 카드와 찜 목록 카드는 sm

// shared/components/BookmarkSlot.tsx
interface BookmarkSlotProps {
	popupId: number;
	popupTitle: string;
	isBookmarked: boolean | null;
	size: BookmarkButtonSize;
}
export function BookmarkSlot(props: BookmarkSlotProps); // 가장 가까운 Provider가 준 함수로 그린다

// features/bookmark/components/BookmarkSlotProvider.tsx
export function BookmarkSlotProvider(props: { mode: "guest" | "member" | "pending"; children: ReactNode });

// features/bookmark/components/BookmarkList.tsx
export function BookmarkList(); // 마이페이지의 찜한 팝업 탭

// features/bookmark/components/BookmarkListItem.tsx
export function BookmarkListItem(props: { popup: BookmarkedPopup; now: Date });

// features/bookmark/hooks/useToggleBookmark.ts
export function useToggleBookmark(popupId: number): UseMutationResult<void, Error, boolean>; // 변수는 다음 찜 여부

// features/bookmark/api/get-bookmarks.ts
export function bookmarkListQueryOptions(); // 키 ["bookmarks", "list"]. select가 페이지를 한 배열로 펼친다
```

`BookmarkButton`은 알럿을 자기 안에 들고 있다. 탐색 목록은 카드마다 하트가 있어 알럿을 늘 그리면 카드 수만큼 `<dialog>`가 생기므로 열 때만 그린다. 닫을 때는 바로 지우지 않고 `AlertDialog`의 `onClosed`가 불린 뒤 지운다. 바로 지우면 닫힘 애니메이션이 사라지고 dialog가 `close()` 없이 DOM에서 빠져서 포커스가 누른 하트로 돌아오지 않는다. 찜한 하트는 채운 아이콘(`heart-fill.svg`)이다. `isBookmarked`가 `null`이면 찜 여부를 아직 모른다는 뜻이다. 상세 화면에서 서버 컴포넌트가 토큰 없이 받은 초기값만 있고 클라이언트가 받은 값이 없는 경우와 최근 본 팝업 탭에서 기록의 상세를 받기 전이다(`popup.md`). `member`와 `pending`에서는 빈 하트를 `aria-disabled`와 `aria-busy`로 그리고 누를 수 없다. `guest`는 `null`이어도 눌리고 로그인 유도 알럿을 띄운다. 확인을 누르면 알럿을 닫고 요청을 보낸다. 요청이 진행 중이면 버튼은 `aria-disabled`와 `aria-busy`이고 눌러도 핸들러가 무시한다. `disabled`를 쓰지 않는 것은 알럿이 닫히며 포커스를 하트로 돌려줄 때 요청이 진행 중이기 때문이다. `disabled`면 포커스를 받지 못해 body로 떨어진다. 실패하면 확인 버튼 하나인 실패 알럿을 연다. 알럿은 `shared/ui`의 `AlertDialog`이고 모양은 `docs/design/DESIGN-SPEC.md`의 공통 컴포넌트 표에 있다. 하단 탭바와 코스 조건 입력도 로그인 유도 알럿에 같은 `login-prompt.ts` 값을 쓴다.

`BookmarkList`는 처음 불러오는 동안 뼈대, 처음 불러오기 실패면 `shared/components/LoadFailure`의 실패 문구와 다시 시도, 비었으면 `MyPageEmptyState`("찜한 팝업이 없습니다."), 있으면 카드 목록을 그린다. 목록 끝의 `shared/components/ListMoreTrigger`가 화면에 들어오면 다음 페이지를 받고 다음 페이지가 실패하면 그 자리에 문구와 다시 시도를 둔다. `BookmarkListItem`은 공용 목록 카드 `shared/components/PopupListCard`에 상태 배지와 종료일 줄을 넘긴다. 종료임박 배지는 `Badge`의 primary, "종료된 팝업"은 neutral(회색)이고 끝난 팝업은 카드 전체를 흐리게 한다(`isDimmed`). 카드 모양은 `docs/design/DESIGN-SPEC.md`의 마이페이지 절에 있다.

**서버 API.** 운영 백엔드에 있는 것이다.

| 메서드와 경로                          | 인증 | 응답                                                                                      |
| -------------------------------------- | ---- | ----------------------------------------------------------------------------------------- |
| `PUT /api/v1/popups/{popupId}/wish`    | 필요 | 204 본문 없음. 이미 찜이어도 성공한다. 없는 팝업은 404 `E404`                             |
| `DELETE /api/v1/popups/{popupId}/wish` | 필요 | 204 본문 없음. 찜이 아니어도 성공한다                                                     |
| `GET /api/v1/wishes?cursor&limit`      | 필요 | `PageResponse<WishResponse>`. 최근 찜한 순이고 끝난 팝업도 준다. 잘못된 커서는 400 `E400` |

두 토글은 멱등이다. 같은 요청이 두 번 가도 오류가 아니라 화면과 서버가 어긋나지 않는다. 팝업 목록과 상세 응답의 `wished`가 찜 여부이고 토큰이 없으면 `false`다. 찜 목록 한 건은 `popupId`, `imageUrl`, `interestCategoryId`, `title`, `startDate`, `endDate`, `reservationType`, `ended`, `wishedAt`이다. 204 빈 본문은 공용 클라이언트가 `null`로 돌려준다.

**로그.** `[bookmark]` 접두사. 토글 요청이 실패할 때 `popupId`와 다음 찜 여부, `errorCode`. 찜 목록 조회 실패.

**접근성.** 하트는 `<button aria-pressed={isBookmarked}>`이고 `aria-label`은 "{팝업명} 찜" 하나로 고정한다. 눌림 상태는 `aria-pressed`가 전달하므로 라벨을 "찜 해제"로 바꾸지 않는다. 아이콘만 있는 버튼이라 라벨이 필수다. `aria-pressed`는 찜한 경우에만 참이다. `pending` 모드와 요청 진행 중, 회원의 찜 여부를 모를 때는 `aria-disabled`이고 요청 진행 중과 모를 때는 `aria-busy`도 붙는다.

확인 대화상자는 native `<dialog>`다. 열면 확인 버튼에 포커스가 가고 Esc와 취소, 닫기 버튼이 같은 동작이며 닫으면 눌렀던 하트로 포커스가 돌아온다. 실패도 같은 대화상자로 알린다. 찜 목록 카드는 `<article>`이고 이름은 제목이다. 제목 링크의 `::after`가 카드 전체를 덮는다. 끝난 항목은 흐림 처리와 함께 "종료된 팝업" 텍스트 배지를 가진다. 색만으로 구분하지 않는다. 찜 목록을 처음 불러오는 동안은 `role="status"`로 "찜한 팝업을 불러오고 있습니다"를 읽고 더 불러오는 동안과 더 불러오기 실패는 목록 끝의 `role="status"`가 "찜한 팝업을 더 불러오고 있습니다", "찜한 팝업을 더 불러오지 못했어요."를 읽는다.

## O. Optimization과 운영

**렌더링.** 캐시 패치는 `setQueriesData`로 키 접두사 셋을 한 번씩 돈다. 페이지가 여럿이어도 팝업 수십 개 수준이다.

**장애.** 서버가 죽으면 모든 토글이 실패하고 하트가 그대로 있으며 실패 알럿이 뜬다. 찜 목록은 실패 문구와 다시 시도다.

**재시도.** 토글 뮤테이션은 재시도하지 않는다. 사용자가 다시 누르는 것이 재시도다.

**지표.** 토글 실패 횟수를 센다. 네트워크 오류가 아닌 실패가 있으면 멱등이 깨졌거나 권한 문제다. 알럿에서 취소를 누르는 비율이 높으면 하트를 실수로 누르기 쉬운 배치라는 뜻이다.
