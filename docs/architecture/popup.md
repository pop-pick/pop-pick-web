# 팝업 탐색과 상세 설계

`features/popup`. 탐색의 지도 뷰와 목록 뷰, 검색과 지역, 정렬, 지도의 위치 권한과 클러스터 핀, 지도 팝업 카드와 상세 바텀시트, 팝업 상세와 최근 본 팝업 기록을 다룬다. 팝업 타입과 사진, 찜 버튼 자리는 여러 기능이 쓰므로 `shared`에 있다.

## R. Requirements

**기능.** 탐색은 지도 뷰와 목록 뷰, 둘에 공통인 검색, 목록 위의 지역 드롭다운과 정렬, 결과 없음 세 화면(검색어, 지역, 등록된 팝업 없음)이다. 상세는 탭 없는 한 장이고 껍데기가 페이지와 지도 위 바텀시트 둘이다. 9/26 시안에 탭 셋과 길찾기, 주소 복사, "이 팝업으로 AI 코스 추천받기", 예상 체류시간이 없어 만들지 않았다. 각 화면에 무엇이 놓이고 어떻게 동작하는지는 `docs/product/SPEC.md`의 팝업 탐색과 지도 절과 팝업 상세 정보 절이 정본이다.

**보장.**

- 검색어나 지역, 정렬을 바꾸면 p75 1초 안에 목록이 바뀐다
- 지도와 목록을 오가도 검색어와 지역, 정렬이 그대로다. 두 뷰가 같은 조건으로 거른 팝업을 보인다. 새로고침과 공유 링크에서도 같다. 원천이 URL이다
- 늦게 도착한 응답이 현재 조건의 화면을 덮지 않는다. 쿼리 키에 조건이 들어가므로 다른 조건의 응답은 다른 캐시에 들어간다. 검색어는 입력이 멈춘 뒤 300ms에 한 번만 URL에 쓴다
- 목록에서 상세로 갔다가 뒤로 오면 스크롤 위치와 불러온 페이지가 남아 있다
- 지도에서 상세를 열고 닫으면 보던 지도가 그대로다. 중심과 확대 수준, 선택한 핀이 유지된다
- 위치 권한을 거부해도 지도가 뜬다. 서울 기본 위치를 중심으로 잡는다
- 지도 마커는 50개를 넘지 않는다. 백엔드 페이지 상한이 50이고 지도 뷰는 한 페이지만 받는다
- 상세 공유 링크를 열면 제목과 대표 이미지, 기간이 메타 태그에 들어 있다. 지금은 `generateMetadata`가 제목과 소개만 넣는다
- 대표 이미지가 없는 팝업은 카테고리별 대체 표시로 보인다. 회색 자리 표시가 없다
- 없는 팝업 id와 숫자가 아닌 id는 404다

**설계를 가르는 질문.**

- 주도권은 클라이언트다. 요청 응답이고 지속 연결이 없다
- 검색어와 지역, 정렬의 원천은 URL이다. 스토어에 두지 않는다. `state.md`가 공유와 새로고침 복원이 필요한 값은 URL을 먼저 보라고 한다
- 필터는 지역 하나다. 홈의 인기 지역 칩도 같은 `region`을 URL에 실어 목록 뷰로 들어온다. 드롭다운과 정렬은 목록 뷰에만 있지만 지도 뷰도 URL의 검색어와 지역, 정렬을 그대로 따른다. 지도 시안에 드롭다운이 없다고 지도가 조건을 버리면 뷰를 바꿀 때 결과가 달라진다
- 지도 뷰와 목록 뷰는 같은 조건으로 다른 쿼리를 쓴다. 목록은 열 개씩 무한 스크롤, 지도는 최대 50건 한 페이지다. 마커가 목록의 불러온 만큼만 보이면 지도가 결과를 대표하지 못한다
- 상세의 껍데기가 둘이다. 본문 컴포넌트 `PopupDetailView` 하나를 페이지와 바텀시트가 감싼다. 바텀시트는 `explore` 아래 병렬 라우트 `@sheet/popups/[popupId]`이고 주소는 `/explore/popups/{id}`다. 인터셉트 라우트(`explore/@modal/(..)popups/[popupId]`)를 쓰지 않았다. 인터셉트는 탐색 화면에서 가는 모든 `/popups/{id}` 이동을 가로채서 상세 페이지로 가야 하는 목록 카드까지 시트로 연다. 주소가 따로라 새로고침해도 지도 위에 시트가 열린다
- 상세의 첫 데이터는 서버 컴포넌트가 받는다. 메타 태그를 위해서다. 찜 상태처럼 사용자에 묶인 값은 클라이언트 쿼리가 덮어쓴다
- 신뢰도가 낮은 데이터는 감추지 않고 "정보 확인 중" 배지로 보인다. 배지를 켜는 필드 `verification`을 백엔드에 요구한다. 9/26 시안에는 배지가 없고 모든 팝업에 같은 신뢰도 안내 박스가 있어 지금은 그 박스만 그린다

**범위 밖.** 지도 영역 드래그로 재검색, 검색어 자동 완성, 방문 후기 본문과 평점, 주차 정보.

## A. Architecture

| 상태                             | 원천                                                    | 비고                                                                                                   |
| -------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 뷰, 검색어, 지역, 정렬           | URL `/explore?view=&q=&region=&sort=`                   | `shared/model/explore-state.ts`. 모르는 값은 기본값으로 읽고 기본값(지도, 인기순)은 주소에 쓰지 않는다 |
| 목록                             | Server. `["popups", "list", filters]` 무한 쿼리         | 설계. 열 개씩. `useCursorQuery`. 지금은 `placeholder-explore.ts`를 `filterExplorePopups`로 거른다      |
| 지도용 목록                      | Server. `["popups", "list", { ...filters, limit: 50 }]` | 설계. 한 페이지. 지금은 목록과 같은 걸러 낸 배열                                                       |
| 상세                             | Server. `["popups", "detail", popupId]`                 | 설계. 서버 컴포넌트가 prefetch해 hydrate. 지금은 `placeholder-details.ts`                              |
| 상세 탭                          | URL `?tab=info`                                         | 설계. 9/26 시안에 탭이 없어 쓰지 않는다                                                                |
| 현재 위치                        | `ExploreView`의 `useCurrentPosition`                    | 지도가 아니라 화면이 든다. 목록을 다녀와도 거부한 사용자에게 다시 묻지 않는다                          |
| 선택된 핀, 팝업 카드 열림        | 컴포넌트 `useState`                                     | 뷰를 바꾸면 초기화                                                                                     |
| 상세 바텀시트 열림               | URL `/explore/popups/{id}`                              | `@sheet` 슬롯. 탐색 조건을 쿼리로 달고 간다                                                            |
| 갤러리 현재 장                   | `PopupImageCarousel`의 `useState`                       | Embla의 `select` 이벤트에서 `selectedScrollSnap()`을 받는다                                            |
| 찜 버튼과 일치율 한 줄           | 인증 상태. `AuthStatusSwitch` 슬롯                      | 라우트가 상태마다 그릴 것을 넘긴다. 일치율은 슬롯 prop, 찜은 `BookmarkSlotProvider` 컨텍스트다         |
| 입력 중인 검색어                 | 컴포넌트 `useState`                                     | 300ms 뒤 URL에 쓴다                                                                                    |
| 최근 본 팝업 열 개               | 미결정. 메모리나 `sessionStorage`                       | 상세를 열 때 기록한다                                                                                  |
| 팝업 상태(진행, 종료 임박, 종료) | Derived. 시작일과 종료일, 오늘                          | 설계. `getPopupStatus`                                                                                 |

**흐름.** 검색어 입력과 지역, 정렬 변경은 `window.history.replaceState`로 URL만 바꾼다. Next가 이 변경을 `useSearchParams`에 반영하고 서버 컴포넌트를 다시 부르지 않는다. 화면은 URL을 읽어 `filters`를 만들고 쿼리 키로 쓴다. 뷰 전환도 URL의 `view`만 바꾼다. 검색창에서 엔터를 누르면 검색어를 바로 쓰고 목록 뷰로 바꾼다. 목록에서 상세로 가는 것은 `push`다. 뒤로 오면 목록 쿼리가 캐시에 있어 다시 그려지고 스크롤은 브라우저가 복원한다.

지도 뷰에서 핀을 누르면 하단 카드가 그 팝업을 보인다. 카드는 지도 빈 곳을 누르거나 Esc, 손잡이를 80px 넘게 아래로 끌면 닫힌다. 카드를 누르면 `/explore/popups/{id}`에 지금 탐색 조건을 쿼리로 붙인 주소로 이동하고 `@sheet` 슬롯이 바텀시트를 그린다. `children` 슬롯은 그 주소에 맞는 세그먼트가 없어 탐색 화면을 그대로 두므로 지도가 언마운트되지 않는다. 새로고침이나 공유 링크로 바로 들어오면 `explore/default.tsx`가 탐색 화면을 그리고 그 위에 시트가 열린다.

시트는 손잡이를 끌거나 시트 밖을 누르거나 Esc로 닫는다. 앱 안에 돌아갈 기록이 있으면 `router.back()`, 없으면 조건을 붙인 `/explore`로 `replace`한다. 기록 판정은 `shared/lib/navigation.ts`의 `canGoBackInApp`이 Navigation API로 한다. `history.length`는 다른 출처 항목까지 세어 뒤로 가기가 앱 밖으로 나갈 수 있어서 Navigation API가 없는 브라우저는 뒤로 가지 않는다. 상세 페이지 헤더 `PageHeader`의 뒤로 버튼도 같은 판정을 쓰고 기록이 없으면 홈으로 간다.

손잡이 끌기는 `useDragToClose`가 포인터 이벤트로 옮긴다. `MotionProvider`가 motion의 drag 기능을 싣지 않기 때문이다. 덜 끌면 제자리로 돌아간다.

지도 카드와 목록 카드 안에 찜 버튼이 있고 목록 카드는 제목 링크의 `::after`가 카드 전체를 덮는다. 찜 버튼을 눌러도 상세가 열리지 않게 두는 배치는 `bookmark.md`에 있다.

**지도 진입.** 탐색에 들어오면 지도 뷰가 먼저다. `ExploreView`가 지도 뷰에 처음 들어올 때 위치를 한 번 묻고 결과를 기다리는 동안 마커에 맞춘 지도를 그린다. 허용이 오면 중심을 현재 위치로 옮기고 현재 위치 표시를 켠다. URL에 `region`이 있으면 현재 위치가 와도 카메라를 옮기지 않고 그 지역 마커에 맞춘 범위를 둔다. 따라갈 위치가 있으면 `PopupMap`이 마커 범위 대신 그 위치를 중심으로 넘긴다. 마커 범위 맞춤이 현재 위치 이동을 덮지 않게 하려는 것이다. 마커 범위는 검색어와 지역, 정렬 값이 바뀔 때만 다시 맞춘다. 그래서 시트를 열고 닫아도 사용자가 옮긴 시점이 남는다.

거부나 실패면 다시 묻지 않고 현재 위치 버튼 옆 안내 문구에 이유를 적는다. 하단 카드가 떠 있는 동안에는 이 문구를 화면에서 감추고 스크린리더에만 읽힌다. 현재 위치 버튼은 누르면 중심을 다시 현재 위치로 옮긴다. `useCurrentPosition`은 진행 중인 요청이 있으면 그 결과를 함께 기다려 StrictMode 이중 실행과 연타에서 한 번만 묻는다. 권한 요청은 지도 뷰에 들어올 때만 한다. 첫 화면과 홈에서는 묻지 않는다.

**상세 흐름.** 라우트가 경로 값을 `parsePopupId`로 읽는다. 1 이상의 정수 문자열이 아니거나 그 id의 상세가 없으면 `notFound()`를 부른다. `/popups/abc`와 `/popups/0`, `/popups/999`가 404다. `generateMetadata`와 바텀시트 라우트도 같은 함수로 찾아 같은 404를 낸다. 임시 상세는 id 1부터 8까지이고 잠실에는 일부러 두지 않아 지역 결과 없음 화면을 볼 수 있다. 탐색의 임시 목록 `PLACEHOLDER_EXPLORE_POPUPS`가 같은 상세에 좌표와 등록일을 붙여 만든 것이라 이름이 같다.

찜 버튼과 일치율 한 줄은 인증 상태로 갈린다. `PopupDetailView`는 일치율을 슬롯 prop으로 받고 찜은 `BookmarkSlot` 자리만 그린다. 두 상세 라우트가 `AuthStatusSwitch`로 상태마다 그릴 것을 넣고 찜은 그 안에서 `BookmarkSlotProvider`의 `mode`를 고른다. 시트에서 비회원이 찜을 누르면 로그인 뒤 `/explore/popups/{id}`로 돌아온다. 일치율은 회원에게만 보인다. 재발급을 기다리는 동안 리프레시 토큰 쿠키가 있으면 같은 문구를 보이지 않게 그려 자리를 지키고 없으면 비운다.

예약 버튼은 `reservationUrl`이 있을 때만 새 탭 링크로 놓인다. 없으면 찜과 공유가 줄 오른쪽 끝으로 간다. 공유는 상세 페이지 경로 `/popups/{id}`에 현재 출처를 붙인 URL을 클립보드에 복사하고 결과를 알럿으로 알린다. 바텀시트에서 눌러도 상세 페이지 주소가 복사된다. 복사가 실패하면 실패 문구와 함께 그 URL을 알럿 안의 읽기 전용 입력칸에 보이고 `[popup]` 로그를 남긴다.

## D. Data Model

`PopupSummary`와 입장 방식은 `shared/model/popup.ts`, 탐색 조건 `ExploreState`는 `shared/model/explore-state.ts`, 상세 `PopupDetail`은 `features/popup/model/popup-detail.ts`에 있다. 두 타입은 임시 데이터가 쓰는 필드만 먼저 만들었다. 백엔드가 응답 필드를 확정하면 아래를 더한다.

```typescript
// 설계. PopupSummary에 더한다
type Verification = "VERIFIED" | "PENDING";

interface PopupSummary {
	verification: Verification;
	lat: number;
	lng: number;
	/** 토큰이 없으면 false */
	isBookmarked: boolean;
}

// 설계. PopupDetail에 더한다
interface PopupDetail {
	brand: string | null;
	tags: string[];
	addressJibun: string | null;
	reservationOpenAt: string | null;
	officialUrl: string | null;
	/** 백엔드 요구. 없으면 체류시간 줄을 그리지 않는다 */
	expectedStay: { minMinutes: number; maxMinutes: number } | null;
	source: { type: "KAKAO_MAP" | "SEOUL_OPEN" | "PERPLEXITY"; collectedAt: string };
	/** 후기 출처가 미정이다. null이면 그리지 않는다 */
	reviewSummary: { rating: number; count: number } | null;
}

// 설계. features/popup/model/popup-status.ts
type PopupStatus = "upcoming" | "ongoing" | "endingSoon" | "ended";
function getPopupStatus(popup: Pick<PopupSummary, "startDate" | "endDate">, today: string): PopupStatus;
```

탐색 카드가 쓰는 `ExplorePopup`(`model/explore-popup.ts`)은 `PopupSummary`에 좌표와 조회수, 등록일을 임시로 더한 것이다. 서버가 거르고 정렬하기 전까지 `filterExplorePopups`가 지역으로 거르고 팝업명과 지역, 카테고리 라벨에서 검색어를 찾는다. 인기순은 `viewCount`, 최신순은 `registeredAt` 내림차순이고 값이 없으면 뒤로, 같으면 id순이다.

`category`와 `region`은 서버가 주는 코드 문자열이다. 목록은 온보딩 선택지 테이블에 있고 라벨도 거기서 온다(`onboarding.md`). 지금 `shared/model/popup.ts`에는 카테고리 여덟이 유니온으로 들어 있고 선택지 조회가 열리면 없어진다. 입장 방식 라벨은 둘이다. 홈 인기 행의 짧은 라벨은 `shared/model/popup.ts`, 상세 정보 카드의 긴 라벨은 `popup-detail.ts`에 있다. `UNKNOWN`은 두 곳 모두 그 줄을 그리지 않는다.

카테고리는 두 곳에서 쓰인다. 온보딩 2단계의 관심 카테고리 칩과 카드와 상세의 배지이고 글자는 서버 라벨이다. 지도 핀은 카테고리와 무관하게 모양이 같다. 9/26 시안의 핀은 회색 점이고 누른 핀만 파란 원과 위치 아이콘이다. 명세의 카테고리별 핀 아이콘은 시안에 없어 그리지 않는다. `public/pins/`의 카테고리 SVG는 사진이 없는 팝업의 대체 표시가 쓰고 선택 핀 아이콘 `selected.svg`도 같은 폴더에 있다.

## I. Interface

**컴포넌트.** 탐색은 `ExploreView`가 URL을 읽고 위치 상태를 들고 검색창과 뷰 전환, 지도 `PopupMap`, 목록 `PopupList`를 조립한다. 걸러 낸 결과를 두 뷰에 똑같이 준다. 지도에서 누른 핀이 하단 카드에 가리면 `SelectedPinReveal`이 가린 만큼 지도를 밀어 올린다. 상세는 `PopupDetailView` 하나를 페이지와 `PopupSheet`가 감싼다. `variant`가 `page`면 사진이 200px이고 아래 여백이 없어 탭바 위 40px만 남고, `sheet`면 사진이 140px이고 판 바닥에 40px을 둔다. 검색창은 홈과 같이 쓰는 `shared/components/PopupSearchForm`이다. 지도 카드와 바텀시트, 손잡이, 배지는 이 기능만 쓰므로 이 기능의 `components`에 있다. 지역 드롭다운은 `shared/ui/Select`, 상세 헤더는 `shared/components/PageHeader`, 사진은 `shared/components/PopupImage`, 찜 버튼 자리는 `shared/components/BookmarkSlot`이다.

탭과 길찾기, 확인 상태를 붙일 때 더하는 것이다.

```typescript
export function DetailTabs({ tab }: { tab: "info" | "reviews" | "location" });
export function AddressActions(props: { address: string; lat: number; lng: number; title: string });
export function ReliabilityBanner({ verification }: { verification: Verification });
```

**API가 열리면 만드는 훅.**

```typescript
export function usePopupList(
	filters: PopupListFilters
): UseInfiniteQueryResult<InfiniteData<PageResponse<PopupSummary>>, ApiError>;
export function usePopupsForMap(filters: PopupListFilters): UseQueryResult<PopupSummary[], ApiError>;
export function usePopupDetail(popupId: number, initial?: PopupDetail): UseQueryResult<PopupDetail, ApiError>;
export function useRecentPopups(): { items: PopupSummary[]; record: (popup: PopupSummary) => void };
```

**최근 본 팝업.** `useRecentPopups().record`를 상세 본문이 마운트될 때 부른다. 최신 열 개만 남기고 열한 번째가 들어오면 가장 오래된 것을 버린다. 서버에 보내지 않는다. 보여주는 곳은 마이페이지라 두 기능이 같은 훅을 쓴다. 훅을 `shared`로 올릴지는 보관 방식이 정해질 때 다시 본다.

**서버 API.** 전부 백엔드 요구다.

| 메서드와 경로                  | 인증 | 파라미터                                                      | 응답                         |
| ------------------------------ | ---- | ------------------------------------------------------------- | ---------------------------- |
| `GET /api/v1/popups`           | 선택 | `q`, `sort`(`latest`, `popular`), `region`, `cursor`, `limit` | `PageResponse<PopupSummary>` |
| `GET /api/v1/popups/{popupId}` | 선택 |                                                               | `PopupDetail`                |

서버 공통 `PageResponse`는 `content`와 `hasNext` 둘이다. 다음 커서는 마지막 항목에서 뽑고(`useCursorQuery`) 총 건수는 시안에 "총 N곳"이 없어 받지 않는다. 인증 "선택"은 서버 설정에 팝업 경로를 `permitAll`로 더해야 성립한다. 지금은 인증과 온보딩 경로만 열려 있어 토큰 없는 요청이 막힌다. 정렬 값 이름과 검색 대상 필드는 백엔드가 정한다.

`sort=popular`는 최근 7일간 상세 조회수 내림차순이다. 집계는 백엔드가 한다. 상세 조회 요청이 그 집계를 겸하는지 아니면 별도 요청이 필요한지도 백엔드가 정한다.

**길찾기.** 설계다. 9/26 시안에 없어 만들지 않았다. 카카오맵 웹 링크 `https://map.kakao.com/link/to/{title},{lat},{lng}`를 새 탭으로 연다. SDK나 REST 호출이 없다. 주소 복사도 공유 링크 복사와 같이 `navigator.clipboard.writeText`이고 실패하면 값을 선택 가능한 텍스트로 두고 실패 문구를 보인다.

**이미지.** 요약의 대표 이미지는 `imageUrl: string | null`, 상세의 갤러리는 `imageUrls: string[]`이다. 백엔드 엔티티의 `imageUrls`를 받는 모양이다. 사진은 `shared/components/PopupImage`가 `next/image`의 `fill`로 그리고 `null`이면 `CategoryFallbackImage`로 대신한다. 지금은 시안의 더미 사진 다섯 장을 `public/placeholder/`에 두고 임시 데이터가 가리킨다. API가 열리면 이 폴더와 `shared/lib/placeholder-images.ts`를 지우고 둘을 함께 한다.

- 외부 이미지 URL을 받으려면 `next.config.ts`에 `images.remotePatterns`를 둔다. 빌드 설정 변경이라 사용자 승인이 필요하다. 수집 출처가 카카오맵과 Perplexity라 도메인이 여럿일 수 있어 백엔드가 한 도메인으로 옮겨 주는지, 최적화를 끄는지(`unoptimized`) 정한다
- 백엔드 `imageUrls`는 nullable 목록이라 받는 쪽에서 빈 배열로 맞춘다

**지도 핀.** `shared/lib/kakao-map`은 핀을 `CustomOverlay`로 그린다. 점과 라벨을 한 요소에 담고 클러스터러가 그 요소를 묶는다. 묶인 뒤 `clustered` 이벤트에서 클러스터 요소에 첫 핀의 라벨과 나머지 수 `+N`을 채운다. 핀은 `aria-hidden`이라 마우스 전용이고 키보드와 스크린리더 경로는 부르는 쪽이 같은 팝업 목록으로 따로 낸다. 핀의 탭 순서가 오버레이 삽입 순서라 화면 위치와 무관하고 클러스터에 묶이면 DOM에서 빠지기 때문이다. 탐색 지도는 `KakaoMapCamera`를 쓰지 않고 `PopupMap`이 중심과 마커 범위를 직접 고른다(`model/map-view.ts`).

**로그.** `[popup]` 접두사. 상세 조회 실패, 위치 권한 거부, 클립보드 실패. 위치 권한 거부는 실패가 아니라 사용자의 선택이므로 `console.info`로 한 번만 남긴다.

**접근성.**

| 요소              | 계약                                                                                                                                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 뷰 전환과 상세 탭 | 고르는 묶음이라 라디오와 탭 패턴을 쓴다. 상세 탭은 URL과 동기다                                                                                                                                                                                                     |
| 정렬              | 글자 버튼 둘을 `role="group" aria-label="정렬"`로 묶고 고른 쪽이 `aria-pressed`다                                                                                                                                                                                   |
| 지역 드롭다운     | 버튼이 `aria-haspopup="listbox"`와 `aria-expanded`이고 이름은 "지역"과 현재 값이다. 열면 목록에 포커스가 가고 `aria-activedescendant`로 위아래 화살표와 Home, End가 옮긴다. Enter와 스페이스로 고르고 Esc로 닫으면 버튼으로 돌아온다. 포커스가 밖으로 나가면 닫힌다 |
| 결과 없음         | 결과 수와 결과 없음 문구(제목과 안내)를 화면 밖 `role="status"` 한 곳이 읽는다. 목록 자리와 지도 위의 문구는 보이기만 한다                                                                                                                                          |
| 목록              | 더 불러오는 중은 `role="status"`로 "다음 10개를 불러오는 중"                                                                                                                                                                                                        |
| 지도              | 핀은 `aria-hidden`이라 읽히지 않는다. 같은 팝업을 담은 목록이 키보드와 스크린리더 경로다. 평소 `sr-only`이고 포커스가 들어오면 지도 위에 떠서 보인다                                                                                                                |
| 클러스터 핀       | 핀과 함께 접근성 트리에서 빠진다. 목록에서 고르면 카메라가 그 핀으로 옮겨 가 클러스터가 풀린다                                                                                                                                                                      |
| 현재 위치 버튼    | `aria-label`은 "현재 위치로 이동". 거부와 미지원이면 `disabled`, 측위 중이면 `aria-busy`. 이유는 버튼 옆 `role="status"` 안내 문구다                                                                                                                                |
| 지도 팝업 카드    | `<section aria-live="polite" aria-label="선택한 팝업">`. 포커스를 옮기지 않고 닫기 버튼이 없다. 손잡이는 `aria-hidden`이라 키보드로는 Esc로 닫고 그때 현재 위치 버튼으로 포커스가 간다. 시트가 열려 있으면 Esc는 시트만 닫는다                                      |
| 상세 바텀시트     | 모달 `<dialog>`와 `aria-modal`, 이름은 본문 제목(`aria-labelledby`). 열면 그 제목에 포커스가 간다. 손잡이는 `aria-hidden`이라 키보드로는 Esc로 닫는다                                                                                                               |
| 갤러리            | Embla 뷰포트가 `role="region"`, `aria-roledescription="carousel"`이고 `tabIndex={0}`이라 좌우 화살표로 넘긴다. 장마다 `aria-label="n / 전체"`, 현재 장은 `aria-live` 문장으로 읽힌다. 점은 `aria-hidden`이다. 이전과 다음 버튼은 시안에 없다                        |
| 공유 복사         | 결과를 `AlertDialog`로 알린다. 확인 버튼에 포커스가 가고 닫으면 공유 버튼으로 돌아온다. 실패하면 URL을 알럿 안의 읽기 전용 입력칸에 두고 포커스를 받으면 전체 선택된다                                                                                              |
| 주소 복사         | 설계. 결과를 `role="status"`로 "주소를 복사했습니다"                                                                                                                                                                                                                |
| 정보 확인 중 배지 | 텍스트 배지. 색만으로 구분하지 않는다                                                                                                                                                                                                                               |

## O. Optimization과 운영

**렌더링.** 목록은 열 개씩이라 가상화하지 않는다. 카드 이미지는 `next/image`와 고정 비율이다. 지도는 뷰를 바꿀 때 언마운트한다. CSS로 숨기면 컨테이너 크기가 0이 되어 relayout 뒤 중심이 틀어진다. 다만 상세 바텀시트를 열 때는 언마운트하지 않는다. `children` 슬롯이 탐색 화면을 그대로 두고 시트가 그 위를 덮는다. SDK 로딩은 세션 하나가 공유하므로 다시 마운트해도 스크립트를 다시 받지 않는다.

**장애.** 지도 SDK가 실패하면 `KakaoMap`이 `role="alert"`로 "지도를 불러오지 못했습니다"와 다시 시도하라는 한 줄을 보이고 목록 뷰로 가는 버튼과 다시 시도 버튼을 함께 둔다. 키가 없거나 도메인이 등록되지 않은 것 같은 원인은 화면에 보이지 않고 `[kakao-map]` 로그에 남는다. 목록 조회가 실패하면 같은 자리에 오류 상태와 다시 시도를 그린다. 상세의 서버 컴포넌트 조회가 실패하면 `error.tsx`가 받고 클라이언트 쿼리 실패는 섹션 `ErrorState`다. 위치 권한 거부는 장애가 아니라 정상 분기다.

**재시도와 몰림.** 검색어는 300ms 디바운스 뒤 URL에 한 번 쓴다. 지역과 정렬 변경은 디바운스 없이 즉시다. 위치 요청은 지도 뷰 진입마다 한 번이고 실패해도 다시 부르지 않는다.

**지표.** 결과 0건 비율이 높으면 데이터가 비었거나 검색어가 안 맞는 것이다. 대체 이미지 비율이 높으면 수집 파이프라인의 이미지가 비었다. 위치 권한 허용 비율은 지도 첫 화면이 얼마나 유용한지를 가른다.

**API가 열리면 옮길 것.** 탐색은 `placeholder-explore.ts`의 임시 목록 하나를 두 뷰가 같이 쓴다.

- 목록 뷰를 열 개씩 커서 무한 스크롤로 바꾼다. 지금은 걸러 낸 결과를 한 번에 그린다. 더 불러오는 중 문구와 조회 실패 상태도 이때 붙인다
- 검색과 지역 거르기, 정렬을 서버로 넘기고 `filterExplorePopups`를 지운다. 인기순은 서버의 조회수 집계, 최신순은 팝픽 등록 순이다
- 핀 좌표를 목록 응답의 `lat`, `lng`로 받는다. 서버 엔티티에 `latitude`, `longitude`가 있지만 응답에 없다
- 비회원이 탐색과 상세를 보려면 서버가 팝업 조회 경로를 `permitAll`에 넣어야 한다
- 찜은 `bookmark.md`의 서버 API가 열리면 카드와 시트의 회원 하트를 누를 수 있다
- 끝나면 `placeholder-explore.ts`와 `ExplorePopup`의 임시 필드를 지우고 `PopupSummary` 설계 필드로 옮긴다

**운영.** 팝업의 지역 배지는 백엔드가 주소와 위경도로 매핑해 내려준 값이다. 팝업 데이터에 저장된 값이 아니라 조회할 때 붙는다. 매핑 범위가 바뀌면 프론트는 고칠 것이 없다.

`next.config.ts`의 `Permissions-Policy`는 `geolocation=(self)`다. 같은 출처에서만 권한을 묻고 iframe에 넣은 외부 문서는 묻지 못한다. 카메라와 마이크는 빈 목록으로 막혀 있다.
