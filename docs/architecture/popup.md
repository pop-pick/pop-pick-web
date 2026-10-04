# 팝업 탐색과 상세 설계

`features/popup`. 탐색의 지도 뷰와 목록 뷰, 검색, 지도의 위치 권한과 클러스터 핀, 지도 팝업 카드와 상세 바텀시트, 팝업 상세, 최근 본 팝업의 기록과 마이페이지 목록을 다룬다. 팝업 타입과 사진, 찜 버튼 자리는 여러 기능이 쓰므로 `shared`에 있다.

## R. Requirements

**기능.** 탐색은 지도 뷰와 목록 뷰, 둘에 공통인 검색, 목록 뷰의 지역 드롭다운과 정렬, 결과 없음 화면(검색 결과 없음, 지역 결과 없음, 등록된 팝업 없음)이다. 지도 뷰에는 지역 드롭다운과 정렬이 없다. 상세는 탭 없는 한 장이고 껍데기가 페이지와 지도 위 바텀시트 둘이다. 9/26 시안에 탭 셋과 길찾기, 주소 복사, "이 팝업으로 AI 코스 추천받기", 예상 체류시간이 없어 만들지 않았다. 각 화면에 무엇이 놓이고 어떻게 동작하는지는 `docs/product/SPEC.md`의 팝업 탐색과 지도 절과 팝업 상세 정보 절이 정본이다.

**보장.**

- 검색어를 바꾸면 p75 1초 안에 목록이 바뀐다
- 지도와 목록을 오가도 검색어와 지역, 정렬이 그대로다. 목록은 셋 모두로 거르고 지도는 검색어로 거른다. 새로고침과 공유 링크에서도 같다. 원천이 URL이다
- 늦게 도착한 응답이 현재 검색어의 화면을 덮지 않는다. 쿼리 키에 검색어가 들어가므로 다른 검색어의 응답은 다른 캐시에 들어간다. 검색어는 입력이 멈춘 뒤 300ms에 한 번만 URL에 쓴다
- 목록에서 상세로 갔다가 뒤로 오면 스크롤 위치와 불러온 페이지가 남아 있다
- 지도에서 상세를 열고 닫으면 보던 지도가 그대로다. 중심과 확대 수준, 선택한 핀이 유지된다
- 위치 권한을 거부해도 지도가 뜬다. 서울 기본 위치를 중심으로 잡는다
- 지도는 보이는 영역 안의 팝업을 최대 500건 한 번에 받는다. 지도를 옮기거나 확대하면 그 영역으로 다시 받고 받는 동안 이전 핀이 남는다
- 상세 공유 링크를 열면 제목과 대표 이미지, 기간이 메타 태그에 들어 있다. 지금은 `generateMetadata`가 제목과 소개를 넣고, 대표 사진이 있으면 그 사진을, 없으면 서비스 OG 이미지를 넣는다. 기간은 넣지 않는다
- 대표 이미지가 없는 팝업은 카테고리별 대체 표시로 보인다. 회색 자리 표시가 없다
- 없는 팝업 id와 숫자가 아닌 id는 404다

**설계를 가르는 질문.**

- 주도권은 클라이언트다. 요청 응답이고 지속 연결이 없다
- 뷰와 검색어의 원천은 URL이다. 스토어에 두지 않는다. `state.md`가 공유와 새로고침 복원이 필요한 값은 URL을 먼저 보라고 한다
- 지도 뷰와 목록 뷰는 같은 검색어로 다른 쿼리를 쓴다. 목록은 열 개씩 무한 스크롤, 지도는 `GET /popups/map`이 준 영역 안 팝업 전체다. 마커가 목록의 불러온 만큼만 보이면 지도가 결과를 대표하지 못한다
- 지도 응답이 좌표와 카드에 필요한 필드를 모두 준다. 마커와 하단 카드를 이 응답만으로 그리고 상세를 카드용으로 부르지 않는다. 상세 API는 조회수를 올리기 때문이다. 이 응답에는 `wished`가 없어 지도 카드의 하트는 모름(`null`)이다
- 상세의 껍데기가 둘이다. 본문 컴포넌트 `PopupDetailView` 하나를 페이지와 바텀시트가 감싼다. 바텀시트는 `explore` 아래 병렬 라우트 `@sheet/popups/[popupId]`이고 주소는 `/explore/popups/{id}`다. 인터셉트 라우트(`explore/@modal/(..)popups/[popupId]`)를 쓰지 않았다. 인터셉트는 탐색 화면에서 가는 모든 `/popups/{id}` 이동을 가로채서 상세 페이지로 가야 하는 목록 카드까지 시트로 연다. 주소가 따로라 새로고침해도 지도 위에 시트가 열린다
- 상세의 첫 데이터는 서버 컴포넌트가 받는다. 메타 태그를 위해서다. 서버 컴포넌트는 토큰 없이 부르므로 찜 여부를 모른다. 클라이언트 쿼리가 마운트하자마자 토큰으로 다시 받는다. 클라이언트가 받은 값이 없으면 하트는 모름(`null`)이다
- 신뢰도가 낮은 데이터는 감추지 않고 "정보 확인 중" 배지로 보인다. 배지를 켜는 필드 `verification`을 백엔드에 요구한다. 9/26 시안에는 배지가 없고 모든 팝업에 같은 신뢰도 안내 박스가 있어 지금은 그 박스만 그린다

**범위 밖.** 검색어 자동 완성, 방문 후기 본문과 평점, 주차 정보.

## A. Architecture

| 상태                             | 원천                                                                 | 비고                                                                                                                                                 |
| -------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 뷰, 검색어, 지역, 정렬           | URL `/explore?view=&q=&area=&sort=`                                  | `shared/model/explore-state.ts`. 모르는 값은 기본값으로 읽고 기본값(지도 뷰, 인기순)과 비어 있는 값은 주소에 쓰지 않는다                             |
| 목록                             | Server. `["popups", "list", { keyword, areaId, sort }]` 무한 쿼리    | 열 개씩. `api/get-popups.ts`의 `popupListQueryOptions`. 조건이 바뀌면 커서 없이 첫 페이지부터 받는다                                                 |
| 지도 핀                          | Server. `["popups", "map", { keyword, swLat, swLng, neLat, neLng }]` | `api/get-map-popups.ts`의 `popupMapQueryOptions`. `hooks/useMapPopups`가 지도의 보이는 영역으로 부른다. 이전 영역의 핀을 `keepPreviousData`로 남긴다 |
| 지역 목록                        | Server. `["popups", "areas"]`                                        | `api/get-areas.ts`. 온보딩 선택지와 같은 `GET /onboardings/favorite-areas`를 따로 받는다. `staleTime: Infinity`                                      |
| 상세                             | Server. `["popups", "detail", popupId]`                              | 서버 컴포넌트가 받은 상세를 `initialData`로 둔 클라이언트 쿼리(`hooks/usePopupDetail`). `initialDataUpdatedAt: 0`이라 바로 다시 받는다               |
| 상세 탭                          | URL `?tab=info`                                                      | 설계. 9/26 시안에 탭이 없어 쓰지 않는다                                                                                                              |
| 현재 위치                        | `ExploreView`의 `useCurrentPosition`                                 | 지도가 아니라 화면이 든다. 목록을 다녀와도 거부한 사용자에게 다시 묻지 않는다                                                                        |
| 선택된 핀, 팝업 카드 열림        | 컴포넌트 `useState`                                                  | 뷰를 바꾸면 초기화                                                                                                                                   |
| 상세 바텀시트 열림               | URL `/explore/popups/{id}`                                           | `@sheet` 슬롯. 탐색 조건을 쿼리로 달고 간다                                                                                                          |
| 갤러리 현재 장                   | `PopupImageCarousel`의 `useState`                                    | Embla의 `select` 이벤트에서 `selectedScrollSnap()`을 받는다                                                                                          |
| 찜 버튼                          | 인증 상태. `AuthStatusSwitch` 슬롯                                   | 라우트가 상태마다 `BookmarkSlotProvider`의 `mode`를 고른다. 찜 여부는 그 팝업 캐시의 `isBookmarked`다                                                |
| 입력 중인 검색어                 | 컴포넌트 `useState`                                                  | 300ms 뒤 URL에 쓴다                                                                                                                                  |
| 최근 본 팝업 열 개               | Zustand 스토어(`sessionStorage`)                                     | `shared/model/useRecentPopupsStore.ts`. 상세를 열 때 찜 여부를 뺀 요약을 기록하고 세션이 끝나면 비운다. 하트는 기록마다 상세 쿼리로 받는다           |
| 팝업 상태(진행, 종료 임박, 종료) | Derived. 시작일과 종료일, 오늘                                       | 설계. `getPopupStatus`                                                                                                                               |

**흐름.** 지역과 정렬을 바꾸면 URL의 `area`와 `sort`만 바꾼다. 검색어 입력은 `window.history.replaceState`로 URL만 바꾼다. Next가 이 변경을 `useSearchParams`에 반영하고 서버 컴포넌트를 다시 부르지 않는다. 화면은 URL의 검색어를 쿼리 키로 쓴다. 뷰 전환도 URL의 `view`만 바꾼다. 검색창에서 엔터를 누르면 검색어를 바로 쓰고 목록 뷰로 바꾼다. 목록에서 상세로 가는 것은 `push`다. 뒤로 오면 목록 쿼리가 캐시에 있어 다시 그려지고 스크롤은 브라우저가 복원한다.

지도 뷰에서 핀을 누르면 하단 카드가 그 팝업을 보인다. 카드는 지도 빈 곳을 누르거나 Esc, 손잡이를 80px 넘게 아래로 끌면 닫힌다. 카드를 누르면 `/explore/popups/{id}`에 지금 탐색 조건을 쿼리로 붙인 주소로 이동하고 `@sheet` 슬롯이 바텀시트를 그린다. `children` 슬롯은 그 주소에 맞는 세그먼트가 없어 탐색 화면을 그대로 두므로 지도가 언마운트되지 않는다. 새로고침이나 공유 링크로 바로 들어오면 `explore/default.tsx`가 탐색 화면을 그리고 그 위에 시트가 열린다.

시트는 손잡이를 끌거나 시트 밖을 누르거나 Esc로 닫는다. 앱 안에 돌아갈 기록이 있으면 `router.back()`, 없으면 조건을 붙인 `/explore`로 `replace`한다. 기록 판정은 `shared/lib/navigation.ts`의 `canGoBackInApp`이 Navigation API로 한다. `history.length`는 다른 출처 항목까지 세어 뒤로 가기가 앱 밖으로 나갈 수 있어서 Navigation API가 없는 브라우저는 뒤로 가지 않는다. 상세 페이지 헤더 `PageHeader`의 뒤로 버튼도 같은 판정을 쓰고 기록이 없으면 홈으로 간다.

손잡이 끌기는 `useDragToClose`가 포인터 이벤트로 옮긴다. `MotionProvider`가 motion의 drag 기능을 싣지 않기 때문이다. 덜 끌면 제자리로 돌아간다.

지도 카드와 목록 카드 안에 찜 버튼이 있고 목록 카드는 제목 링크의 `::after`가 카드 전체를 덮는다. 찜 버튼을 눌러도 상세가 열리지 않게 두는 배치는 `bookmark.md`에 있다.

**지도 진입.** 탐색에 들어오면 지도 뷰가 먼저다. `ExploreView`가 지도 뷰에 처음 들어올 때 위치를 한 번 묻는다. 허용이 오면 `PopupMap`이 중심을 현재 위치(확대 수준 5)로 옮기고 현재 위치 표시를 켠다. 거부하거나 위치를 모르면 서울 중심(`SEOUL_CENTER`)을 확대 수준 8로 보인다. 지도는 핀 범위에 맞춰 움직이지 않는다. 지도가 멈출 때마다(`idle`) `KakaoMap`의 `onBoundsChange`가 보이는 영역을 알리고 처음 뜬 영역도 한 번 알린다. `ExploreMap`이 그 영역을 상태로 들고 `useMapPopups`가 그 영역으로 핀을 받는다. 영역을 알기 전에는 요청하지 않는다.

**지도 핀.** 영역 조회가 준 팝업을 핀으로 그린다. 영역 네 값은 소수 셋째 자리(약 110m)로 바깥쪽을 반올림해 쿼리 키를 만든다. 조금 움직인 지도가 같은 캐시를 쓰고 가장자리 핀이 빠지지 않는다. 핀 라벨과 키보드 목록의 이름은 지역이 있으면 지역을 더해 읽는다. 결과 없음 안내는 영역 안에 팝업이 없을 때 뜨고, 다른 영역으로 옮긴 직후 새 응답이 오기 전에는 이전 영역의 빈 결과(`keepPreviousData`의 임시 값)를 빈 영역으로 읽지 않아 안내를 거둔다. 검색어가 없으면 "지도에 표시할 팝업이 없어요."와 지도를 움직이거나 목록에서 보라는 안내, 있으면 "검색 결과가 없습니다."와 다른 검색어를 입력하거나 지도를 움직이라는 안내다. 영역 응답이 오기 전에는 지도 위에 "지도에 팝업을 불러오고 있어요"를 띄운다. 선택한 핀의 카드는 지도를 움직여 핀이 사라져도 남고 검색어가 바뀌면 닫힌다. 지도 응답에 찜 여부가 없어 카드의 하트는 모름이고, 회원은 상세 시트에서 찜한다.

거부나 실패면 다시 묻지 않고 현재 위치 버튼 옆 안내 문구에 이유를 적는다. 하단 카드가 떠 있는 동안에는 이 문구를 화면에서 감추고 스크린리더에만 읽힌다. 현재 위치 버튼은 누르면 중심을 다시 현재 위치로 옮긴다. `useCurrentPosition`은 진행 중인 요청이 있으면 그 결과를 함께 기다려 StrictMode 이중 실행과 연타에서 한 번만 묻는다. 권한 요청은 지도 뷰에 들어올 때만 한다. 첫 화면과 홈에서는 묻지 않는다.

**상세 흐름.** 라우트가 경로 값을 `parsePopupId`로 읽는다. 1 이상의 정수 문자열이 아니면 `notFound()`를 부른다. 숫자면 `api/get-popup-detail.ts`의 `findPopupDetail`이 토큰 없이 상세를 받는다. 백엔드가 `E404`(없는 팝업)를 내면 `null`을 돌려주고 라우트가 `notFound()`를 부른다. `E400`은 요청 검증과 중복 등록에도 쓰여 없는 팝업으로 보지 않는다. `parsePopupId`가 안전 정수 범위 밖의 id를 먼저 걸러 `/popups/abc`와 `/popups/0`, 백엔드 정수 범위를 넘는 id는 API를 부르기 전에 404다. 그 밖의 실패는 그대로 던져 `error.tsx`가 받는다. `generateMetadata`와 바텀시트 라우트도 같은 함수로 찾아 같은 404를 낸다. 두 라우트 모두 조회 함수를 React `cache`로 감싸 `generateMetadata`와 본문이 한 요청에서 한 번만 부른다. `cache`는 인자를 참조로 비교해서 `params` 객체가 아니라 팝업 ID 문자열을 넘긴다.

찜 버튼은 인증 상태로 갈린다. `PopupDetailView`는 `PopupDetailBookmark`로 `BookmarkSlot` 자리만 그리고 찜 여부는 상세 쿼리 값을 넘긴다. 두 상세 라우트가 `AuthStatusSwitch`의 상태마다 `BookmarkSlotProvider`의 `mode`를 골라 감싼다. 시트에서 비회원이 찜을 누르면 로그인 뒤 `/explore/popups/{id}`로 돌아온다. 서버 컴포넌트가 받은 상세는 찜 여부를 모른다. 이 값은 갱신 시각이 0인 초기값으로 캐시에 들어간다. `PopupDetailBookmark`는 클라이언트가 받았거나 찜 패치로 바뀐 값(`dataUpdatedAt > 0`)이 있으면 그 찜 여부를 넘기고 초기값만 있으면 `null`을 넘긴다. 지도가 받아 둔 같은 팝업의 상세 캐시가 아직 신선하면 다시 받지 않고 그 값을 바로 쓴다. 초기값만 있는 동안 회원에게는 누를 수 없는 대기 하트로 보이고 다시 받기가 실패하면 `null`로 남아 `[popup]` 로그를 남긴다.

예약 버튼은 `reservationUrl`이 있을 때만 새 탭 링크로 놓인다. 없으면 찜과 공유가 줄 오른쪽 끝으로 간다. 공유는 상세 페이지 경로 `/popups/{id}`에 현재 출처를 붙인 URL을 클립보드에 복사하고 결과를 알럿으로 알린다. 바텀시트에서 눌러도 상세 페이지 주소가 복사된다. 복사가 실패하면 실패 문구와 함께 그 URL을 알럿 안의 읽기 전용 입력칸에 보이고 `[popup]` 로그를 남긴다.

## D. Data Model

`PopupSummary`와 입장 방식, 카테고리는 `shared/model/popup.ts`, 탐색 조건 `ExploreState`는 `shared/model/explore-state.ts`, 상세 `PopupDetail`은 `features/popup/model/popup-detail.ts`에 있다. 응답 타입(`PopupListItemResponse`, `PopupDetailResponse`)은 Swagger를 보고 손으로 둔다. 응답은 `select`가 아니라 queryFn 안에서 화면 모델로 바꿔 캐시에 둔다. 찜 토글의 캐시 패치가 `id`와 `isBookmarked`로 팝업을 찾기 때문이다(`bookmark.md`).

목록 한 건은 `shared/model/popup.ts`의 `toPopupSummary`가 바꾼다. `popupId`는 `id`, `wished`는 `isBookmarked`, `areaName`은 그대로 `areaName`이 된다. 목록에 시작일이 없어 `startDate`는 늘 `null`이다. 지도 한 건은 `model/explore-popup.ts`의 `toExplorePopup`이 바꾼다. 좌표는 `position`이 되고 `wished`가 없어 `isBookmarked`는 `null`이며 시작일도 없다. 상세는 `toPopupDetail`이 바꾼다. `imageUrls`가 `null`이면 빈 배열이고 첫 장이 대표 사진 `imageUrl`이다. 주소 `address`는 도로명이 없으면 지번이다. 좌표 `position`은 위도와 경도가 둘 다 있을 때만 있다. 입장료 `entryFee`가 0이면 무료다. 상세를 최근 본 팝업에 남길 때는 `pickRecentPopup`이 찜 여부를 뺀 요약 필드만 고르고 지도 핀은 `pickPopupSummary`가 찜 여부까지 고른다.

```typescript
// features/popup/model/popup-detail.ts
interface PopupDetail extends PopupSummary {
	imageUrls: string[];
	description: string | null;
	openingHours: string | null;
	address: string | null;
	position: KakaoLatLngLiteral | null;
	reservationUrl: string | null;
	entryFee: number | null;
}

// 설계. 백엔드 응답에 없다
type Verification = "VERIFIED" | "PENDING";
interface PopupSummary {
	verification: Verification;
}
interface PopupDetail {
	/** 없으면 체류시간 줄을 그리지 않는다 */
	expectedStay: { minMinutes: number; maxMinutes: number } | null;
	/** 후기 출처가 미정이다. null이면 그리지 않는다 */
	reviewSummary: { rating: number; count: number } | null;
}

// 설계. features/popup/model/popup-status.ts
type PopupStatus = "upcoming" | "ongoing" | "endingSoon" | "ended";
function getPopupStatus(popup: Pick<PopupSummary, "startDate" | "endDate">, today: string): PopupStatus;
```

상세 응답의 `viewCount`는 `PopupDetail.viewCount`로 받아 상세 배지 줄 오른쪽에 "조회수 1.2만"처럼 그린다(`formatViewCount`). 1만 미만은 쉼표 숫자, 1만부터는 만 단위 소수 첫째 자리 내림이다. 지역은 `areaName`을 지역 배지(`Badge tone="region"`)로 그린다. 상세 응답에 있지만 화면에 자리가 없어 응답 타입에 두지 않은 필드는 `areaId`, `brand`, `tags`, `reservationOpenAt`, `source`, `sourceUrls`다.

탐색 지도가 쓰는 `ExplorePopup`(`model/explore-popup.ts`)은 `PopupSummary`에 좌표 `position`을 더하고 `isBookmarked`를 `null`로 좁힌 것이다. 목록 카드 `ExploreListItem`은 찜 여부를 뺀 요약과 `isBookmarked: boolean | null`을 받아 공용 `PopupListCard`에 카테고리 배지와 메타 줄(지역, 종료일, 입장 방식)을 넘긴다. 최근 본 팝업 목록이 같은 카드를 쓴다.

`category`는 서버 `interest_category` 표의 id(1부터 8)를 `toPopupCategory`가 코드로 바꾼 값이다. 이 표는 온보딩 관심 카테고리 선택지와 같고 코드 여덟(`character`, `fashion`, `food`, `art`, `beauty`, `game`, `lifestyle`, `etc`)과 라벨이 `shared/model/popup.ts`에 있다. 표에 없는 id와 `null`은 카테고리 없음이라 배지를 그리지 않는다. 입장 방식 라벨은 둘이다. 홈 인기 행의 짧은 라벨은 `shared/model/popup.ts`, 상세 정보 카드의 긴 라벨은 `popup-detail.ts`에 있다. `UNKNOWN`은 두 곳 모두 그 줄을 그리지 않는다.

카테고리는 두 곳에서 쓰인다. 온보딩 2단계의 관심 카테고리 칩과 카드와 상세의 배지다. 칩 글자는 서버 라벨이고 배지 글자는 `POPUP_CATEGORY_LABELS`다. 지도 핀은 카테고리와 무관하게 모양이 같다. 9/26 시안의 핀은 회색 점이고 누른 핀만 파란 원과 위치 아이콘이다. 명세의 카테고리별 핀 아이콘은 시안에 없어 그리지 않는다. `public/images/pins/`의 카테고리 SVG는 사진이 없는 팝업의 대체 표시가 쓰고 `etc`와 카테고리 없음은 `default.svg`다. 선택 핀 아이콘 `selected.svg`도 같은 폴더에 있다.

## I. Interface

**컴포넌트.** 탐색은 `ExploreView`가 URL을 읽고 위치 상태를 들고 검색창과 뷰 전환, 지도 뷰 `ExploreMap`, 목록 `PopupList`를 조립하고 두 뷰에 검색어를 넘긴다. `ExploreMap`은 `useMapPopups`가 준 핀을 지도 `PopupMap`에 넘기고 지도 위에 불러오는 중과 실패, 결과 없음 안내를 그린다. `PopupList`는 `popupListQueryOptions`로 무한 쿼리를 부르고 목록 끝의 `shared/components/ListMoreTrigger`가 화면에 들어오면 다음 페이지를 받고 처음 불러오기 실패는 `shared/components/LoadFailure`로 그린다. 키보드용 팝업 목록은 포커스를 받을 때만 보이고(`not-focus-within:sr-only`) Tab 순서가 검색과 보기 전환, 지도 다음이다. 지도에서 누른 핀이 하단 카드에 가리면 `SelectedPinReveal`이 가린 만큼 지도를 밀어 올린다. 상세는 `PopupDetailView` 하나를 페이지와 `PopupSheet`가 감싼다. `variant`가 `page`면 사진이 200px이고 아래 여백이 없어 탭바 위 40px만 남고, `sheet`면 사진이 140px이고 판 바닥에 40px을 둔다. 검색창은 홈과 같이 쓰는 `shared/components/PopupSearchForm`이다. 지도 카드와 바텀시트, 손잡이는 이 기능만 쓰므로 이 기능의 `components`에 있다. 배지는 코스 타임라인과 같이 쓰는 `shared/ui/Badge`다. 상세 헤더는 `shared/components/PageHeader`, 사진은 `shared/components/PopupImage`, 찜 버튼 자리는 `shared/components/BookmarkSlot`이다.

탭과 길찾기, 확인 상태를 붙일 때 더하는 것이다.

```typescript
export function DetailTabs({ tab }: { tab: "info" | "reviews" | "location" });
export function AddressActions(props: { address: string; lat: number; lng: number; title: string });
export function ReliabilityBanner({ verification }: { verification: Verification });
```

**훅.** 목록은 훅 없이 `PopupList`가 `popupListQueryOptions`를 바로 쓴다.

```typescript
// features/popup/hooks/useMapPopups.ts
export function useMapPopups(
	keyword: string,
	bounds: KakaoBoundsLiteral | null // 지도가 뜨기 전에는 null이고 요청하지 않는다
): {
	popups: ExplorePopup[];
	markers: KakaoMarkerData[];
	isPending: boolean;
	isEmpty: boolean; // 영역 응답이 비었다
	error: Error | null;
	retry: () => void;
};

// features/popup/hooks/usePopupDetail.ts
export function usePopupDetail(initialDetail: PopupDetail): UseQueryResult<PopupDetail>;
```

**최근 본 팝업.** 서버에 보내지 않고 이 탭의 `sessionStorage`에 최신 열 개를 둔다. 같은 팝업을 다시 열면 맨 앞으로 옮기고 열한 번째가 들어오면 가장 오래된 것을 버린다(스토어의 `addRecentPopup`). 저장 형식 버전은 3이고 이전 버전 기록은 `migrate`가 버린다. 임시 데이터의 id를 들고 있거나 지역이 `region`으로 저장돼 지금 모양과 맞지 않기 때문이다. 세션이 끝나면(로그아웃이나 만료) `subscribeSessionEnded`로 기록을 비운다. `auth.md`에 있다.

```typescript
// shared/model/useRecentPopupsStore.ts
type RecentPopupsLoadStatus = "loading" | "ready" | "failed";
type RecentPopup = Omit<PopupSummary, "isBookmarked">;
interface RecentPopupsState {
	items: RecentPopup[];
	loadStatus: RecentPopupsLoadStatus;
	addRecentPopup: (popup: RecentPopup) => void;
	clearRecentPopups: () => void;
}
export function loadRecentPopups(): void;

// features/popup/hooks/useRecentPopups.ts
export function useRecentPopups(): {
	items: RecentPopup[];
	loadStatus: RecentPopupsLoadStatus;
	addRecentPopup: (popup: RecentPopup) => void;
};
```

스토어는 `shared/model`에 있다. popup이 기록하고 보여주지만 비우는 일은 auth가 알리는 세션 종료가 한다. 기능끼리 import하지 않으려면 둘 다 닿는 `shared`여야 한다. 화면 코드는 스토어 대신 `useRecentPopups`를 쓴다. 서버 렌더에는 `sessionStorage`가 없어 스토어는 복원을 건너뛰고 시작하고, 훅이 마운트된 뒤 `loadRecentPopups`로 한 번 불러온다.

기록 자리는 `components/PopupDetailView.tsx`다. 본문 끝의 `RecentPopupRecorder`가 서버 컴포넌트가 받은 상세를 `pickRecentPopup`으로 줄여 한 번 기록한다. `PopupDetail` 전체를 저장하지 않고 찜 여부도 넣지 않는다. 찜 여부는 서버 상태라 기록에 두면 원천이 둘이 된다. 페이지와 바텀시트가 같은 본문을 쓰므로 두 껍데기 모두 기록한다. 마이페이지의 최근 본 팝업 탭은 `RecentPopupList`가 탐색 목록 카드 `ExploreListItem`으로 그리고 비었으면 `MyPageEmptyState`를 보인다. 하트는 기록마다 상세 쿼리(`["popups", "detail", id]`)를 걸어 받은 찜 여부다. 마이페이지는 열린 탭의 패널만 그려서 최근 본 탭을 열 때만 최대 열 건을 받는다. 받기 전과 실패하면 하트가 모름(`null`)이고 실패는 `[popup]` 로그를 남긴다. 상세 캐시라 찜 토글의 캐시 패치가 그대로 덮는다. 탭 옆에 개수는 없다. 상세 API는 조회수를 올린다. 같은 조회자의 중복은 백엔드가 거르지만 그 메모가 만료된 뒤 이 탭을 열면 최대 열 건의 조회수가 올라간다.

**불러오기 실패.** 시크릿 모드나 사이트 데이터를 막은 브라우저처럼 세션 저장소를 읽지 못하면 `loadStatus`가 `"failed"`가 되고 `[recent-popups]` 로그를 남긴다. 이때 `RecentPopupRecorder`는 기록하지 않고 로그만 남긴다. 목록은 빈 목록과 구분되는 실패 문구를 보인다. `loadStatus`가 `"ready"`가 아닐 때 `addRecentPopup`을 부르면 스토어가 던진다. 복원 전에 쓰면 복원될 기록을 빈 목록 위에 쓴 값으로 덮어쓰기 때문이다. `clearRecentPopups`는 덮어쓰는 것이 목적이라 복원 전에도 막지 않는다.

**서버 API.** 운영 백엔드에 있는 것이다.

| 메서드와 경로                            | 인증 | 파라미터                                                                               | 응답                                                                                              |
| ---------------------------------------- | ---- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `GET /api/v1/popups`                     | 선택 | `keyword`, `areaId`, `sort`(`latest`, `popular`), `cursor`, `limit`(1부터 50, 기본 10) | `PageResponse<PopupListItemResponse>`. 항목에 `areaId`, `areaName`, `interestCategoryName`이 있다 |
| `GET /api/v1/popups/map`                 | 없음 | `swLat`, `swLng`, `neLat`, `neLng`(필수), `keyword`                                    | `PopupMapItemResponse[]`. 영역 안 최대 500건, 페이지 없음. `swLat`이 `neLat`보다 크면 400 `E400`  |
| `GET /api/v1/onboardings/favorite-areas` | 없음 |                                                                                        | `{ id, area }[]`. 성수, 여의도, 홍대, 잠실, 용산, 종로, 강남 일곱 곳                              |
| `GET /api/v1/popups/{popupId}`           | 선택 |                                                                                        | `PopupDetailResponse`. 없는 id는 404 `E404`, 숫자로 못 읽는 id는 400 `E400`. 조회수를 올린다      |

목록은 오픈했고 끝나지 않은 팝업만 준다. `sort`의 서버 기본은 `latest`(오픈일 최신순, 오픈일이 없는 팝업은 뒤)이고 `popular`는 조회수순이다. 프론트 기본은 인기순이라 `sort`를 항상 보낸다. 인기순 커서는 조회수가 바뀌면 순서가 바뀌어 무한 스크롤에서 중복이나 누락이 생길 수 있다. 백엔드 정렬이 `view_count DESC, popup_id DESC`이고 커서가 두 값을 담아 중복은 생기지 않고 누락만 생길 수 있다. 그래도 프론트는 펼친 목록에서 같은 id를 먼저 온 하나만 남긴다(`select`). 누락은 프론트가 막을 수 없다. `areaId`는 지역 드롭다운 값이고 비면 보내지 않는다. `keyword`는 이름과 브랜드, 도로명과 지번 주소에서 부분 일치로 찾는다. 프론트는 검색어의 앞뒤 공백을 지우고 비면 보내지 않는다. 서버 공통 `PageResponse`는 `content`와 `hasNext`, `nextCursor`다. 다음 요청의 커서는 `nextCursor`를 그대로 넘기고 총 건수는 시안에 "총 N곳"이 없어 받지 않는다. 상세 조회는 조회수를 올리지만 같은 조회자는 Redis 메모(`SET NX`)로 한동안 다시 세지 않는다. 지도 영역 조회는 조회수를 올리지 않고 비회원도 부르므로 토큰을 보내지 않는다. 목록과 상세는 토큰이 있을 때만 Bearer를 붙인다. 이유는 `ARCHITECTURE.md`의 백엔드 요구 목록 절에 있다.

**길찾기.** 설계다. 9/26 시안에 없어 만들지 않았다. 카카오맵 웹 링크 `https://map.kakao.com/link/to/{title},{lat},{lng}`를 새 탭으로 연다. SDK나 REST 호출이 없다. 주소 복사도 공유 링크 복사와 같이 `navigator.clipboard.writeText`이고 실패하면 값을 선택 가능한 텍스트로 두고 실패 문구를 보인다.

**이미지.** 요약의 대표 이미지는 `imageUrl: string | null`, 상세의 갤러리는 `imageUrls: string[]`이다. 사진은 `shared/components/PopupImage`가 `next/image`의 `fill`로 그리고 `null`이면 `CategoryFallbackImage`로 대신한다. 주소가 있어도 받지 못하면(`onError`) 같은 대체 그림으로 바꾸고 주소가 바뀌면 다시 그린다. 이미지 호스트가 정해지지 않아 `PopupImage`는 `unoptimized`로 원본 주소를 그대로 그리고 `next.config.ts`에 `images.remotePatterns`를 두지 않았다. 수집 출처가 여럿이라 운영 응답의 이미지 호스트가 목록 50건에서 열한 곳이다. 백엔드가 한 도메인으로 옮겨 주면 `remotePatterns`를 두고 `unoptimized`를 뗀다. 빌드 설정 변경이라 사용자 승인이 필요하다.

**지도 모듈.** `shared/lib/kakao-map`은 핀을 `CustomOverlay`로 그린다. 점과 라벨을 한 요소에 담고 클러스터러가 그 요소를 묶는다. 묶인 뒤 `clustered` 이벤트에서 클러스터 요소에 첫 핀의 라벨과 나머지 수 `+N`을 채운다. 핀은 `aria-hidden`이라 마우스 전용이고 키보드와 스크린리더 경로는 부르는 쪽이 같은 팝업 목록으로 따로 낸다. 핀의 탭 순서가 오버레이 삽입 순서라 화면 위치와 무관하고 클러스터에 묶이면 DOM에서 빠지기 때문이다. `KakaoMap`의 `onBoundsChange`는 지도가 멈출 때마다(`idle`)와 처음 한 번 보이는 영역을 알린다. 탐색 지도는 `PopupMap`이 중심과 확대 수준을 고른다.

**로그.** `[popup]` 접두사. 탐색 목록과 지도 핀 조회 실패, 상세 찜 여부 다시 받기 실패, 위치 권한 거부, 클립보드 실패. 위치 권한 거부는 실패가 아니라 사용자의 선택이므로 `console.info`로 한 번만 남긴다.

**접근성.**

| 요소              | 계약                                                                                                                                                                                                                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 뷰 전환과 상세 탭 | 고르는 묶음이라 라디오와 탭 패턴을 쓴다. 상세 탭은 URL과 동기다                                                                                                                                                                                                                                                  |
| 결과 안내         | 뷰마다 화면 밖 `role="status"` 한 곳이 읽는다. 목록 뷰는 불러온 수("팝업 N곳을 불러왔습니다")와 결과 없음 문구(제목과 안내), 처음 불러오기 실패 제목 중 하나이고 페이지가 붙을 때마다 수가 바뀐다. 지도 뷰는 핀 수("팝업 N곳")와 결과 없음 문구, 실패 제목 중 하나다. 목록 자리와 지도 위의 문구는 보이기만 한다 |
| 목록              | 처음 불러오는 중은 `role="status"`로 "팝업 목록을 불러오고 있습니다". 더 불러오는 중과 더 불러오기 실패는 목록 끝에 늘 붙어 있는 `role="status"` 하나가 "다음 10개를 불러오는 중"이나 "팝업을 더 불러오지 못했어요."로 읽는다. 실패하면 그 자리에 다시 시도 버튼이 놓인다                                        |
| 지도              | 핀은 `aria-hidden`이라 읽히지 않는다. 같은 팝업을 담은 목록이 키보드와 스크린리더 경로다. 평소 `sr-only`이고 포커스가 들어오면 지도 위에 떠서 보인다. 지도 위 안내(불러오는 중, 실패, 결과 없음)는 DOM에서 지도보다 앞이라 실패의 다시 시도가 먼저 포커스를 받고, 포커스로 펼친 목록은 안내 위에 그려진다        |
| 클러스터 핀       | 핀과 함께 접근성 트리에서 빠진다. 목록에서 고르면 카메라가 그 핀으로 옮겨 가 클러스터가 풀린다                                                                                                                                                                                                                   |
| 현재 위치 버튼    | `aria-label`은 "현재 위치로 이동". 거부와 미지원이면 `aria-disabled`(포커스는 받고 클릭만 막는다. Esc로 카드를 닫은 뒤 포커스가 갈 곳이라 `disabled`를 쓰지 않는다), 측위 중이면 `aria-busy`. 이유는 버튼 옆 `role="status"` 안내 문구다                                                                         |
| 지도 팝업 카드    | `<section aria-live="polite" aria-label="선택한 팝업">`. 포커스를 옮기지 않고 닫기 버튼이 없다. 손잡이는 `aria-hidden`이라 키보드로는 Esc로 닫고 그때 현재 위치 버튼으로 포커스가 간다. 시트가 열려 있으면 Esc는 시트만 닫는다                                                                                   |
| 상세 바텀시트     | 모달 `<dialog>`와 `aria-modal`, 이름은 본문 제목(`aria-labelledby`). 열면 그 제목에 포커스가 간다. 손잡이는 `aria-hidden`이라 키보드로는 Esc로 닫는다                                                                                                                                                            |
| 갤러리            | Embla 뷰포트가 `role="region"`, `aria-roledescription="carousel"`이고 `tabIndex={0}`이라 좌우 화살표로 넘긴다. 장마다 `aria-label="n / 전체"`, 현재 장은 `aria-live` 문장으로 읽힌다. 점은 `aria-hidden`이다. 이전과 다음 버튼은 시안에 없다                                                                     |
| 공유 복사         | 결과를 `AlertDialog`로 알린다. 확인 버튼에 포커스가 가고 닫으면 공유 버튼으로 돌아온다. 실패하면 URL을 알럿 안의 읽기 전용 입력칸에 두고 포커스를 받으면 전체 선택된다                                                                                                                                           |
| 주소 복사         | 설계. 결과를 `role="status"`로 "주소를 복사했습니다"                                                                                                                                                                                                                                                             |
| 정보 확인 중 배지 | 텍스트 배지. 색만으로 구분하지 않는다                                                                                                                                                                                                                                                                            |

## O. Optimization과 운영

**렌더링.** 상세 두 라우트는 ISR이다. `generateStaticParams`가 빈 배열이라 빌드 때는 그리지 않고, 처음 열린 팝업을 그려 5분(`revalidate = 300`) 동안 CDN에 캐시한다. 5분이 지나면 다음 요청은 캐시를 받고 뒤에서 새로 그린다. 서버가 그리는 본문은 토큰 없이 받은 공개 데이터라 사용자마다 같고, 사용자마다 다른 찜 여부는 브라우저가 따로 받는다. 이 라우트에서 쿠키나 헤더를 읽으면 요청마다 그리는 렌더링으로 돌아가 캐시가 꺼진다. 팝업 정보는 하루 한 번 수집되어 5분 늦어도 화면이 틀리지 않는다. 탐색(`/explore`)은 검색어가 URL에 있고 지도가 브라우저 전용이라 화면 틀만 정적으로 두고 데이터는 브라우저에서 받는다. 목록은 열 개씩이라 가상화하지 않는다. 카드 이미지는 `next/image`와 고정 비율이다. 지도는 뷰를 바꿀 때 언마운트한다. CSS로 숨기면 컨테이너 크기가 0이 되어 relayout 뒤 중심이 틀어진다. 다만 상세 바텀시트를 열 때는 언마운트하지 않는다. `children` 슬롯이 탐색 화면을 그대로 두고 시트가 그 위를 덮는다. SDK 로딩은 세션 하나가 공유하므로 다시 마운트해도 스크립트를 다시 받지 않는다.

**장애.** 지도 SDK가 실패하면 `KakaoMap`이 `role="alert"`로 "지도를 불러오지 못했습니다"와 다시 시도하라는 한 줄을 보이고 목록 뷰로 가는 버튼과 다시 시도 버튼을 함께 둔다. 키가 없거나 도메인이 등록되지 않은 것 같은 원인은 화면에 보이지 않고 `[kakao-map]` 로그에 남는다. 목록 조회가 처음부터 실패하면 목록 자리에 실패 문구와 다시 시도를 그리고 더 불러오기가 실패하면 목록 끝에 다시 시도를 둔다. 지도 뷰는 영역 조회가 실패하면 지도 위에 "팝업을 불러오지 못했어요."와 다시 시도를 띄우고 이미 받은 핀은 안내 아래에 남는다. 다시 시도는 영역 조회를 다시 받는다. 지역 목록 조회가 실패해도 목록은 뜬다. 지역 결과 없음 제목만 "선택한 지역"으로 쓴다. 상세의 서버 컴포넌트 조회가 실패하면 `error.tsx`가 받는다. 상세 쿼리의 다시 받기가 실패하면 하트를 모름으로 두고 로그를 남긴다. 위치 권한 거부는 장애가 아니라 정상 분기다.

**재시도와 몰림.** 검색어는 300ms 디바운스 뒤 URL에 한 번 쓴다. 위치 요청은 지도 뷰 진입마다 한 번이고 실패해도 다시 부르지 않는다. 지도 뷰는 영역마다 요청 한 번이다. 지도를 움직이면 영역이 소수 셋째 자리로 반올림되어 같은 영역은 캐시를 쓴다. 찜을 바꿔도 `["popups"]`를 무효화하지 않고 캐시를 고쳐 쓴다(`bookmark.md`).

**지표.** 결과 0건 비율이 높으면 데이터가 비었거나 검색어가 안 맞는 것이다. 대체 이미지 비율이 높으면 수집 파이프라인의 이미지가 비었다. 위치 권한 허용 비율은 지도 첫 화면이 얼마나 유용한지를 가른다.

**백엔드에 없어 내린 것.** 운영 백엔드 응답에 아래 값이 없어 화면에서 내렸다. 백엔드에 한 요청은 `ARCHITECTURE.md`의 백엔드 요구 목록에 있다. 지역과 정렬, 지도 영역 조회, 조회수는 백엔드가 주기 시작해 되살렸다.

- 취향 일치율과 "AI 한줄". 상세와 시트의 회원 일치율 한 줄을 그리지 않는다. 일치율이 생기면 상세 본문에 회원에게만 보이는 줄을 다시 넣는다
- 시작일. 목록과 지도 응답에 시작일이 없어 이 응답에서 온 팝업은 기간을 종료일로만 보인다
- 지도 카드의 찜 여부. 지도 응답에 `wished`가 없어 카드 하트가 모름이다

**운영.** 지역 배지는 백엔드가 응답에 실어 주는 `areaName`이다. 지역 값이 없는 팝업(`areaId`가 `null`)은 배지를 그리지 않는다. 지역 선택지는 백엔드 지역 일곱 곳이고 시안의 지역 이름은 예시다.

`next.config.ts`의 `Permissions-Policy`는 `geolocation=(self)`다. 같은 출처에서만 권한을 묻고 iframe에 넣은 외부 문서는 묻지 못한다. 카메라와 마이크는 빈 목록으로 막혀 있다.
