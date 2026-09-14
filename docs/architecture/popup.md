# 팝업 탐색과 상세 설계

`features/popup`. 탐색의 지도 뷰와 목록 뷰, 필터와 검색과 정렬, 결과 0건의 인접 지역 제안, 마커 미리보기 카드, 팝업 상세를 다룬다. 카드 컴포넌트와 팝업 타입은 여러 기능이 쓰므로 `shared`에 있다.

## R. Requirements

**기능.** 탐색은 지도 뷰와 목록 뷰, 둘에 공통인 필터와 검색, 결과 0건의 인접 지역 제안이다. 상세는 전체 화면에 탭 셋과 하단 액션 둘이다. 각 화면에 무엇이 놓이고 어떻게 동작하는지는 `docs/product/SPEC.md`의 팝업 탐색과 지도 절과 팝업 상세 정보 절이 정본이다.

**보장.**

- 필터를 바꾸면 p75 1초 안에 목록이 바뀐다
- 지도와 목록을 오가도 필터와 검색어, 정렬이 그대로다. 새로고침과 공유 링크에서도 같다. 원천이 URL이다
- 늦게 도착한 응답이 현재 필터의 화면을 덮지 않는다. 쿼리 키에 필터가 들어가므로 다른 필터의 응답은 다른 캐시에 들어간다. 검색어는 입력이 멈춘 뒤 300ms에 한 번만 URL에 쓴다
- 목록에서 상세로 갔다가 뒤로 오면 스크롤 위치와 불러온 페이지가 남아 있다
- 지도 마커는 50개를 넘지 않는다. 백엔드 페이지 상한이 50이고 지도 뷰는 한 페이지만 받는다
- 상세 공유 링크를 열면 제목과 대표 이미지, 기간이 메타 태그에 들어 있다
- 대표 이미지가 없는 팝업은 카테고리별 대체 이미지로 보인다. 회색 자리 표시가 없다

**설계를 가르는 질문.**

- 주도권은 클라이언트다. 요청 응답이고 지속 연결이 없다
- 필터의 원천은 URL이다. 스토어에 두지 않는다. `state.md`가 공유와 새로고침 복원이 필요한 값은 URL을 먼저 보라고 한다
- 지도 뷰와 목록 뷰는 같은 필터로 다른 쿼리를 쓴다. 목록은 열 개씩 무한 스크롤, 지도는 최대 50건 한 페이지다. 마커가 목록의 불러온 만큼만 보이면 지도가 필터 결과를 대표하지 못한다
- 상세의 첫 데이터는 서버 컴포넌트가 받는다. 메타 태그를 위해서다. 찜 상태처럼 사용자에 묶인 값은 클라이언트 쿼리가 덮어쓴다
- 신뢰도가 낮은 데이터는 감추지 않고 "정보 확인 중" 배지로 보인다. 배지를 켜는 필드 `verification`을 백엔드에 요구한다

**범위 밖.** 마커 클러스터링, 지도 영역 드래그로 재검색, 현재 위치 기준 도보 시간(`walkFromLandmark`가 `null`이면 그리지 않는다), 방문 후기 본문과 평점과 조회수(`null`이면 탭 안에 "후기 준비 중" 상태만), 주차 정보(위치와 주차 탭에는 지도와 주소만).

## A. Architecture

| 상태                                              | 원천                                                    | 비고                                                  |
| ------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| 뷰, 지역, 카테고리, 예약, 종료 임박, 검색어, 정렬 | URL `/explore?...`                                      | `parseExploreState`와 `serializeExploreState`가 한 쌍 |
| 목록                                              | Server. `["popups", "list", filters]` 무한 쿼리         | 열 개씩. `useCursorQuery`                             |
| 지도용 목록                                       | Server. `["popups", "list", { ...filters, limit: 50 }]` | 한 페이지                                             |
| 지역별 건수(0건 때)                               | Server. `["popups", "count-by-region", filters]`        | 결과가 0건일 때만 `enabled`                           |
| 상세                                              | Server. `["popups", "detail", popupId]`                 | 서버 컴포넌트가 prefetch해 hydrate                    |
| 상세 탭                                           | URL `?tab=info`                                         | 기본 `info`                                           |
| 선택된 마커, 바텀 카드 열림                       | 컴포넌트 `useState`                                     | 뷰를 바꾸면 초기화                                    |
| 갤러리 현재 장                                    | 컴포넌트 `useState`                                     |                                                       |
| 입력 중인 검색어                                  | 컴포넌트 `useState`                                     | 300ms 뒤 URL에 쓴다                                   |
| 팝업 상태(진행, 종료 임박, 종료)                  | Derived. 시작일과 종료일, 오늘                          | `getPopupStatus`                                      |

**흐름.** 필터 칩이나 검색어 입력은 URL을 `replace`로 바꾼다. 화면은 URL을 읽어 `filters`를 만들고 쿼리 키로 쓴다. 뷰 전환도 URL의 `view`만 바꾼다. 상세는 `push`다. 뒤로 오면 목록 쿼리가 캐시에 있어 다시 그려지고 스크롤은 브라우저가 복원한다. 무한 쿼리의 페이지들이 캐시에 남아 있으므로 불러온 만큼이 그대로 보인다.

지도 뷰에서 마커를 누르면 `selectedPopupId`가 바뀌고 바텀 카드가 그 팝업을 보인다. 카드를 누르면 상세로 간다. 마커 번호는 지도용 목록의 순서다.

## D. Data Model

```typescript
// 설계. 서버 응답 모양이다. 백엔드가 필드를 확정하면 shared/model/popup.ts에 더한다
type PopupCategory = "CHARACTER_IP" | "FASHION" | "FNB" | "ART" | "BEAUTY" | "ANIME_GAME" | "ETC";
type ReservationType = "NONE" | "RESERVATION" | "WAITING" | "BOTH" | "UNKNOWN";
type Verification = "VERIFIED" | "PENDING";

interface PopupSummary {
	id: number;
	title: string;
	category: PopupCategory;
	region: Region;
	/** 없으면 카테고리별 대체 이미지 */
	thumbnailUrl: string | null;
	/** 날짜 포맷은 미정(ROADMAP). ISO 8601 날짜 문자열을 가정한다 */
	startDate: string | null;
	endDate: string | null;
	reservationType: ReservationType;
	verification: Verification;
	/** 토큰이 없으면 false. 낙관적 갱신의 대상 */
	isBookmarked: boolean;
}

// features/popup/model/explore.ts
type ReservationFilter = "any" | "none";
type PopupSort = "endingSoon" | "newest" | "popular";
type ExploreView = "map" | "list";

interface PopupListFilters {
	region: Region | null;
	category: PopupCategory | null;
	reservation: ReservationFilter;
	/** true면 종료일이 오늘부터 7일 안 */
	endingThisWeek: boolean;
	q: string;
	sort: PopupSort;
}

interface ExploreState extends PopupListFilters {
	view: ExploreView;
}

// features/popup/model/explore-state.ts
function parseExploreState(searchParams: URLSearchParams): ExploreState;
function serializeExploreState(state: ExploreState): URLSearchParams;

// 설계. features/popup/model/popup.ts
interface PopupDetail extends PopupSummary {
	brand: string | null;
	description: string | null;
	tags: string[];
	/** 요일 키와 "11:00-20:00" 값. 비어 있으면 운영 시간 줄을 그리지 않는다 */
	openingHours: Record<string, string>;
	addressRoad: string | null;
	addressJibun: string | null;
	lat: number;
	lng: number;
	reservationUrl: string | null;
	reservationOpenAt: string | null;
	/** 0은 무료, null은 미확인 */
	entryFee: number | null;
	imageUrls: string[];
	officialUrl: string | null;
	/** 백엔드 요구. 없으면 체류시간 줄을 그리지 않는다 */
	expectedStay: { minMinutes: number; maxMinutes: number } | null;
	source: { type: "KAKAO_MAP" | "SEOUL_OPEN" | "PERPLEXITY"; collectedAt: string };
	/** 후기 출처가 미정이다. null이면 후기 탭에 준비 중 상태 */
	reviewSummary: { rating: number; count: number } | null;
	/** 후기 출처가 미정이라 null일 수 있다 */
	viewCount: number | null;
	/** 도보 시간 기준점이 미정이라 null일 수 있다 */
	walkFromLandmark: { landmark: string; minutes: number } | null;
}

interface RegionCount {
	region: Region;
	count: number;
}

// features/popup/model/popup-status.ts
type PopupStatus = "upcoming" | "ongoing" | "endingSoon" | "ended";
function getPopupStatus(popup: Pick<PopupSummary, "startDate" | "endDate">, today: Date): PopupStatus;
function formatPeriod(startDate: string | null, endDate: string | null): string;
/** { mon: "11:00-20:00", ... }를 "매일 오전 11시부터 오후 8시까지, 월요일 휴무"로 */
function formatOpeningHours(hours: Record<string, string>): string;
```

지금 `shared/model/popup.ts`에 있는 것은 카드가 그리는 값만 담은 화면용 타입 `PopupCardItem`과 `PopupCategory` 일곱, `ReservationType` 셋, 둘의 라벨 대응표다. 값은 `character`와 `free`처럼 소문자라 위 블록의 서버 값과 이름은 같고 값이 다르다. 어느 쪽으로 맞출지는 백엔드가 응답 필드를 확정할 때 정한다. `PopupSummary`와 `PopupDetail`, `Verification`도 그때 만든다.

`PopupCategory`는 피그마의 일곱을 따른다. 백엔드 enum(TECH와 LIFESTYLE이 있고 ANIME_GAME이 없다)과 다르며 백엔드가 피그마 쪽으로 맞추는 것을 요구 목록에 올렸다. 맞춰지기 전까지 생성 타입과 이 타입이 어긋나 타입 검사가 그 자리를 잡아 준다.

"예약 없이 입장" 필터는 `reservationType`이 `NONE`이나 `WAITING`인 팝업이다. 현장 대기는 예약 없이 들어가는 것이다. 이 대응은 백엔드가 `reservation=none` 파라미터로 처리하고 FE는 파라미터 이름만 안다.

`getPopupStatus`와 `formatPeriod`, `formatOpeningHours`, `parseExploreState`는 분기 있는 순수 함수다.

## I. Interface

**컴포넌트와 훅.**

```typescript
export function ExploreView(); // URL을 읽어 상태를 만들고 아래를 조립
export function ExploreSearchInput({ value, onCommit }: { value: string; onCommit: (q: string) => void });
export function ViewToggle({ view, onChange }: { view: ExploreView; onChange: (view: ExploreView) => void });
export function FilterChips({
	filters,
	onChange
}: {
	filters: PopupListFilters;
	onChange: (next: PopupListFilters) => void;
});
export function PopupList({ filters }: { filters: PopupListFilters }); // 총 N곳, 정렬, 무한 스크롤
export function PopupMap({ filters }: { filters: PopupListFilters }); // KakaoMap + 번호 마커 + MarkerPreviewCard
export function MarkerPreviewCard({ popup, onClose }: { popup: PopupSummary; onClose: () => void });
export function EmptyResults({ filters, onReset }: { filters: PopupListFilters; onReset: () => void }); // 인접 지역 제안 포함

export function PopupDetailView({ popupId, initial }: { popupId: number; initial: PopupDetail });
export function ImageGallery({ urls, fallbackCategory }: { urls: string[]; fallbackCategory: PopupCategory });
export function DetailTabs({ tab }: { tab: "info" | "reviews" | "location" });
export function AddressActions({
	address,
	lat,
	lng,
	title
}: {
	address: string;
	lat: number;
	lng: number;
	title: string;
});
export function ReliabilityBanner({ verification }: { verification: Verification });

export function usePopupList(
	filters: PopupListFilters
): UseInfiniteQueryResult<InfiniteData<PageResponse<PopupSummary>>, ApiError>;
export function usePopupsForMap(filters: PopupListFilters): UseQueryResult<PopupSummary[], ApiError>;
export function useRegionCounts(filters: PopupListFilters, enabled: boolean): UseQueryResult<RegionCount[], ApiError>;
export function usePopupDetail(popupId: number, initial?: PopupDetail): UseQueryResult<PopupDetail, ApiError>;
```

`PopupCard`와 `Chip`, `BottomSheet`, `Tabs`, `Skeleton`, `EmptyState`는 `shared/ui`다.

**서버 API.** 전부 백엔드 요구다.

| 메서드와 경로                        | 인증 | 파라미터                                                                                                  | 응답                                                       |
| ------------------------------------ | ---- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `GET /api/v1/popups`                 | 선택 | `region`, `category`, `reservation`(`any`, `none`), `endingWithinDays`(7), `q`, `sort`, `cursor`, `limit` | `PageResponse<PopupSummary>`에 `nextCursor`와 `totalCount` |
| `GET /api/v1/popups/{popupId}`       | 선택 |                                                                                                           | `PopupDetail`                                              |
| `GET /api/v1/popups/count-by-region` | 없음 | `category`, `reservation`, `endingWithinDays`, `q`. 지역은 빼고 센다                                      | `RegionCount[]`                                            |

`totalCount`가 오기 전까지 "총 N곳"은 그리지 않는다. 불러온 개수를 대신 보이면 틀린 숫자다.

**길찾기.** 카카오맵 웹 링크 `https://map.kakao.com/link/to/{title},{lat},{lng}`를 새 탭으로 연다. SDK나 REST 호출이 없다. 주소 복사는 `navigator.clipboard.writeText`이고 실패하면 주소를 선택 가능한 텍스트로 두고 "복사에 실패했습니다"를 보인다.

**로그.** `[popup]` 접두사. 상세 조회 실패, 지역별 건수 실패, 클립보드 실패. 검색 응답 폐기는 쿼리 키 설계로 일어나지 않으므로 개발 모드에서 응답의 요청 필터와 현재 필터가 다르면 `console.error`로 단언한다.

**접근성.**

| 요소              | 계약                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| 뷰 전환과 상세 탭 | 고르는 묶음이라 라디오와 탭 패턴을 쓴다. 상세 탭은 URL과 동기다                                        |
| 필터 칩           | `<button aria-pressed>`. 지역과 카테고리처럼 값을 고르는 칩은 눌렀을 때 `role="listbox"` 목록이 열린다 |
| 목록              | 더 불러오는 중은 `role="status"`로 "다음 10개를 불러오는 중"                                           |
| 지도              | 지도 뷰에도 같은 팝업을 시각적으로 숨긴 `<ul>`로 함께 두어 스크린리더가 마커 대신 읽는다               |
| 바텀 카드         | `role="dialog"`가 아니라 `<section aria-live="polite">`. 포커스를 옮기지 않고 닫기 버튼이 있다         |
| 갤러리            | 이전과 다음 버튼이 있고 현재 장이 `aria-live`로 읽힌다. 스와이프는 터치에서만                          |
| 주소 복사         | 결과를 `role="status"`로 "주소를 복사했습니다"                                                         |
| 정보 확인 중 배지 | 텍스트 배지. 색만으로 구분하지 않는다                                                                  |

## O. Optimization과 운영

**렌더링.** 목록은 열 개씩이라 가상화하지 않는다. 카드 이미지는 `next/image`와 고정 비율이다. 지도는 뷰를 바꿀 때 언마운트한다. CSS로 숨기면 컨테이너 크기가 0이 되어 relayout 뒤 중심이 틀어진다. SDK 로딩은 세션 하나가 공유하므로 다시 마운트해도 스크립트를 다시 받지 않는다. 마커 50개는 기본 마커와 CustomOverlay 번호 하나씩이라 성능 문제가 없다.

**장애.** 지도 SDK가 실패하면 `KakaoMap`이 `role="alert"`로 원인을 보이고 목록 뷰로 가는 버튼을 함께 둔다. 상세의 서버 컴포넌트 조회가 실패하면 `error.tsx`가 받는다. 클라이언트 쿼리 실패는 섹션 `ErrorState`다. 지역별 건수가 실패하면 0건 화면에서 제안 줄만 빠지고 초기화 버튼은 남는다.

**재시도와 몰림.** 검색어는 300ms 디바운스 뒤 URL에 한 번 쓴다. 필터 칩은 디바운스 없이 즉시다.

**지표.** 결과 0건 비율이 높으면 데이터가 비었거나 필터 조합이 과하다. 대체 이미지 비율이 높으면 수집 파이프라인의 이미지가 비었다.

**운영.** 지역별 중심 좌표는 지금 `features/popup/model/placeholder-markers.ts`에 임시 마커용으로 있다. 백엔드가 좌표를 내려주면 그 파일을 지우고 마커에 맞추는 `fitTo`가 지도 범위를 정한다. 지역이 늘면 `shared/model/region.ts`를 고친다.
