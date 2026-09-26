# 팝업 탐색과 상세 설계

`features/popup`. 탐색의 지도 뷰와 목록 뷰, 검색과 정렬, 지도의 위치 권한과 클러스터 핀, 팝업 카드, 팝업 상세와 최근 본 팝업 기록을 다룬다. 카드 컴포넌트와 팝업 타입은 여러 기능이 쓰므로 `shared`에 있다.

## R. Requirements

**기능.** 탐색은 지도 뷰와 목록 뷰, 둘에 공통인 검색과 정렬이다. 상세는 탭 셋과 하단 액션 셋이고 껍데기가 페이지와 레이어 둘이다. 각 화면에 무엇이 놓이고 어떻게 동작하는지는 `docs/product/SPEC.md`의 팝업 탐색과 지도 절과 팝업 상세 정보 절이 정본이다.

**보장.**

- 검색어나 정렬을 바꾸면 p75 1초 안에 목록이 바뀐다
- 지도와 목록을 오가도 검색어와 정렬이 그대로다. 새로고침과 공유 링크에서도 같다. 원천이 URL이다
- 늦게 도착한 응답이 현재 조건의 화면을 덮지 않는다. 쿼리 키에 조건이 들어가므로 다른 조건의 응답은 다른 캐시에 들어간다. 검색어는 입력이 멈춘 뒤 300ms에 한 번만 URL에 쓴다
- 목록에서 상세로 갔다가 뒤로 오면 스크롤 위치와 불러온 페이지가 남아 있다
- 지도에서 상세를 열고 닫으면 보던 지도가 그대로다. 중심과 확대 수준, 선택한 핀이 유지된다
- 위치 권한을 거부해도 지도가 뜬다. 서울 기본 위치를 중심으로 잡는다
- 지도 마커는 50개를 넘지 않는다. 백엔드 페이지 상한이 50이고 지도 뷰는 한 페이지만 받는다
- 상세 공유 링크를 열면 제목과 대표 이미지, 기간이 메타 태그에 들어 있다
- 대표 이미지가 없는 팝업은 카테고리별 대체 이미지로 보인다. 회색 자리 표시가 없다

**설계를 가르는 질문.**

- 주도권은 클라이언트다. 요청 응답이고 지속 연결이 없다
- 검색어와 정렬의 원천은 URL이다. 스토어에 두지 않는다. `state.md`가 공유와 새로고침 복원이 필요한 값은 URL을 먼저 보라고 한다
- 필터를 두지 않는다. 검색이 있으면 필터 없이 찾을 수 있고 필터를 넣으면 확인할 조합이 늘어난다는 판단이다. 지역은 화면 안에서 고르는 자리가 없고 홈의 인기 지역 칩에서 들어올 때만 URL에 실린다
- 지도 뷰와 목록 뷰는 같은 조건으로 다른 쿼리를 쓴다. 목록은 열 개씩 무한 스크롤, 지도는 최대 50건 한 페이지다. 마커가 목록의 불러온 만큼만 보이면 지도가 결과를 대표하지 못한다
- 상세의 껍데기가 둘이다. 본문 컴포넌트 하나를 페이지와 레이어가 감싼다. 레이어는 Next의 인터셉트 라우트이고 새로고침하면 가로채지 않아 전체 화면 상세가 열린다
- 상세의 첫 데이터는 서버 컴포넌트가 받는다. 메타 태그를 위해서다. 찜 상태처럼 사용자에 묶인 값은 클라이언트 쿼리가 덮어쓴다
- 신뢰도가 낮은 데이터는 감추지 않고 "정보 확인 중" 배지로 보인다. 배지를 켜는 필드 `verification`을 백엔드에 요구한다

**범위 밖.** 지도 영역 드래그로 재검색, 검색어 자동 완성, 방문 후기 본문과 평점(`null`이면 탭 안에 "후기 준비 중" 상태만), 주차 정보(위치와 주차 탭에는 지도와 주소만).

## A. Architecture

| 상태                             | 원천                                                    | 비고                                                                          |
| -------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 뷰, 검색어, 정렬, 진입 지역      | URL `/explore?...`                                      | `parseExploreState`와 `serializeExploreState`가 한 쌍                         |
| 목록                             | Server. `["popups", "list", filters]` 무한 쿼리         | 열 개씩. `useCursorQuery`                                                     |
| 지도용 목록                      | Server. `["popups", "list", { ...filters, limit: 50 }]` | 한 페이지                                                                     |
| 상세                             | Server. `["popups", "detail", popupId]`                 | 서버 컴포넌트가 prefetch해 hydrate                                            |
| 상세 탭                          | URL `?tab=info`                                         | 기본 `info`                                                                   |
| 현재 위치                        | `ExploreView`의 `useCurrentPosition`                    | 지도가 아니라 화면이 든다. 목록을 다녀와도 거부한 사용자에게 다시 묻지 않는다 |
| 선택된 핀, 팝업 카드 열림        | 컴포넌트 `useState`                                     | 뷰를 바꾸면 초기화                                                            |
| 갤러리 현재 장                   | 컴포넌트 `useState`                                     |                                                                               |
| 입력 중인 검색어                 | 컴포넌트 `useState`                                     | 300ms 뒤 URL에 쓴다                                                           |
| 최근 본 팝업 다섯                | 미결정. 메모리나 `sessionStorage`                       | 상세를 열 때 기록한다. 보관 자리는 ROADMAP 미결정                             |
| 팝업 상태(진행, 종료 임박, 종료) | Derived. 시작일과 종료일, 오늘                          | `getPopupStatus`                                                              |

**흐름.** 검색어 입력과 정렬 변경은 URL을 `replace`로 바꾼다. 화면은 URL을 읽어 `filters`를 만들고 쿼리 키로 쓴다. 뷰 전환도 URL의 `view`만 바꾼다. 목록에서 상세로 가는 것은 `push`다. 뒤로 오면 목록 쿼리가 캐시에 있어 다시 그려지고 스크롤은 브라우저가 복원한다.

지도 뷰에서 핀을 누르면 `selectedPopupId`가 바뀌고 하단 카드가 그 팝업을 보인다. 카드를 누르면 상세가 레이어로 열린다. 레이어는 인터셉트 라우트라 URL이 `/popups/{id}`로 바뀌고 닫으면 `back()`으로 지도로 돌아온다. 지도 컴포넌트는 언마운트되지 않아 중심과 확대 수준이 유지된다.

카드 안에 찜 버튼이 있고 카드 전체가 상세를 여는 자리라 찜 버튼은 이벤트 전파를 막는다.

**지도 진입.** 탐색에 들어오면 지도 뷰가 먼저다. `ExploreView`가 지도 뷰에 처음 들어올 때 `navigator.geolocation.getCurrentPosition`을 한 번 부르고 결과를 기다리는 동안 마커에 맞춘 지도를 그린다. 허용이 오면 중심을 현재 위치로 옮기고 현재 위치 표시를 켠다. 홈의 지역 칩으로 들어와 `region`이 있으면 그 지역 마커를 유지하고 카메라를 옮기지 않는다. 거부나 실패면 다시 묻지 않고 지도 왼쪽 아래에 이유를 `role="status"`로 보인다. 현재 위치 버튼은 거부와 미지원이면 비활성, 측위 중이면 `aria-busy`이고 누르면 중심을 다시 현재 위치로 옮긴다. 목록으로 갔다 돌아와도 상태가 남아 있어 다시 묻지 않는다.

권한 요청은 지도 뷰에 들어올 때만 한다. 첫 화면과 홈에서는 묻지 않는다.

## D. Data Model

```typescript
// 설계. 서버 응답 모양이다. 백엔드가 필드를 확정하면 shared/model/popup.ts에 더한다
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
	lat: number;
	lng: number;
	/** 토큰이 없으면 false */
	isBookmarked: boolean;
}

// features/popup/model/explore-state.ts
type ExploreViewMode = "map" | "list";

interface ExploreState {
	view: ExploreViewMode;
	/** 홈 인기 지역 칩에서 들어올 때만 값이 있다. 화면 안에서 바꾸는 자리는 없다 */
	region: Region | null;
}

function parseExploreState(searchParams: URLSearchParams): ExploreState;
function serializeExploreState(state: ExploreState): URLSearchParams;

// 검색과 정렬을 붙일 때 ExploreState에 더한다. 목록 조회 파라미터도 그때 정한다
type PopupSort = "newest" | "popular";

// 설계. features/popup/model/popup.ts
interface PopupDetail extends PopupSummary {
	brand: string | null;
	description: string | null;
	tags: string[];
	/** 요일 키와 "11:00-20:00" 값. 비어 있으면 운영 시간 줄을 그리지 않는다 */
	openingHours: Record<string, string>;
	addressRoad: string | null;
	addressJibun: string | null;
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
}

// features/popup/model/popup-status.ts. 설계
type PopupStatus = "upcoming" | "ongoing" | "endingSoon" | "ended";
function getPopupStatus(popup: Pick<PopupSummary, "startDate" | "endDate">, today: Date): PopupStatus;
function formatPeriod(startDate: string | null, endDate: string | null): string;
/** { mon: "11:00-20:00", ... }를 "매일 오전 11시부터 오후 8시까지, 월요일 휴무"로 */
function formatOpeningHours(hours: Record<string, string>): string;

// features/popup/model/pin-label.ts
/** 띄어쓰기를 포함해 일곱 자까지 남기고 뒤를 말줄임한다. 지도 핀 라벨이 쓴다 */
function truncatePinLabel(title: string): string;

// features/popup/model/pin-icon.ts
/** 카테고리가 서버 문자열로 바뀌어 여덟 밖의 값이 와도 기본 아이콘으로 그린다 */
function getPinIcon(category: string): string;
```

`category`와 `region`은 서버가 주는 코드 문자열이다. 목록은 온보딩 선택지 테이블에 있고 라벨도 거기서 온다(`onboarding.md`). 지금 `shared/model/popup.ts`에는 카테고리 일곱이 유니온으로 박혀 있는데 선택지 조회가 열리면 없어진다. `PopupSummary`와 `PopupDetail`, `Verification`은 백엔드가 응답 필드를 확정할 때 만든다.

카테고리는 세 자리에서 쓰인다. 온보딩 2단계의 관심 카테고리 칩, 지도 핀 아이콘, 카드와 상세의 배지다. 칩과 배지의 글자는 서버 라벨이고 핀 아이콘만 코드의 대응표를 쓴다. 대응표는 이 기능만 쓰므로 `features/popup/model/pin-icon.ts`에 있고 `public/pins/`의 SVG를 가리킨다. 지금 파일은 색만 다른 자리표시다. 서버가 새 카테고리를 더하면 아이콘 없는 값이 오므로 `getPinIcon`이 기본 아이콘으로 떨어진다. 여덟 중 어디에도 들지 않는 팝업을 어떻게 다룰지는 ROADMAP 미결정에 있다.

`getPopupStatus`와 `formatPeriod`, `formatOpeningHours`, `truncatePinLabel`, `getPinIcon`, `parseExploreState`는 분기 있는 순수 함수다.

## I. Interface

**컴포넌트와 훅.**

```typescript
// 있는 것. 데이터는 아직 PLACEHOLDER_POPUPS다
export function ExploreView({ popups }: { popups: readonly PopupCardItem[] }); // URL을 읽고 위치 상태를 들고 아래를 조립
export function ViewToggle({ view, onChange }: { view: ExploreViewMode; onChange: (view: ExploreViewMode) => void });
export function PopupList({ popups, region }: { popups: readonly PopupCardItem[]; region: Region | null });
export function PopupMap(props: {
	popups: readonly PopupCardItem[];
	region: Region | null;
	position: KakaoLatLngLiteral | null;
	positionStatus: PositionStatus;
	onLocate: () => Promise<KakaoLatLngLiteral | null>;
	onSwitchToList: () => void;
}); // 클러스터, 선택 핀, 하단 카드, 현재 위치 버튼, 키보드용 팝업 목록
export const CurrentLocationButton: ForwardRefExoticComponent<{ status: PositionStatus; onLocate: () => void }>;

// 설계. 검색과 정렬, 서버 조회를 붙일 때
export function ExploreSearchInput({ value, onCommit }: { value: string; onCommit: (q: string) => void });
export function SortSelect({ sort, onChange }: { sort: PopupSort; onChange: (sort: PopupSort) => void });

export function PopupDetailView({ popupId, initial }: { popupId: number; initial: PopupDetail }); // 본문. 두 껍데기가 쓴다
export function PopupDetailLayer({ popupId }: { popupId: number }); // 인터셉트 라우트가 쓰는 껍데기
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
export function ShareButton({ path }: { path: string }); // 팝픽 페이지 주소를 복사한다
export function ReliabilityBanner({ verification }: { verification: Verification });

export function usePopupList(
	filters: PopupListFilters
): UseInfiniteQueryResult<InfiniteData<PageResponse<PopupSummary>>, ApiError>;
export function usePopupsForMap(filters: PopupListFilters): UseQueryResult<PopupSummary[], ApiError>;
export function usePopupDetail(popupId: number, initial?: PopupDetail): UseQueryResult<PopupDetail, ApiError>;
// 있는 것. 진행 중인 요청이 있으면 그 결과를 함께 기다려 StrictMode 이중 실행과 연타에서 한 번만 묻는다
type PositionStatus = "idle" | "locating" | "granted" | "denied" | "unavailable";
export function useCurrentPosition(): {
	position: KakaoLatLngLiteral | null;
	status: PositionStatus;
	requestCurrentPosition: () => Promise<KakaoLatLngLiteral | null>;
};

// 설계
export function useRecentPopups(): { items: PopupCardItem[]; record: (popup: PopupCardItem) => void };
```

`PopupCard`와 `Chip`, `BottomSheet`, `Tabs`, `Skeleton`, `EmptyState`는 `shared/ui`다.

**최근 본 팝업.** `useRecentPopups().record`를 상세 본문이 마운트될 때 부른다. 최신 다섯만 남기고 여섯 번째가 들어오면 가장 오래된 것을 버린다. 서버에 보내지 않는다. 보여주는 곳은 마이페이지라 두 기능이 같은 훅을 쓰며 훅의 자리는 보관 방식이 정해질 때 `shared`로 올릴지 다시 본다.

**서버 API.** 전부 백엔드 요구다.

| 메서드와 경로                  | 인증 | 파라미터                                                      | 응답                                                       |
| ------------------------------ | ---- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| `GET /api/v1/popups`           | 선택 | `q`, `sort`(`newest`, `popular`), `region`, `cursor`, `limit` | `PageResponse<PopupSummary>`에 `nextCursor`와 `totalCount` |
| `GET /api/v1/popups/{popupId}` | 선택 |                                                               | `PopupDetail`                                              |

`sort=popular`는 최근 7일간 상세 조회수 내림차순이다. 집계는 백엔드가 한다. 상세를 열 때 조회수가 올라가야 하므로 상세 조회 요청이 그 집계를 겸하는지 아니면 별도 요청이 필요한지는 백엔드가 정한다.

**길찾기.** 카카오맵 웹 링크 `https://map.kakao.com/link/to/{title},{lat},{lng}`를 새 탭으로 연다. SDK나 REST 호출이 없다. 주소 복사와 공유 링크 복사는 `navigator.clipboard.writeText`이고 실패하면 값을 선택 가능한 텍스트로 두고 실패 문구를 보인다.

**`shared/lib/kakao-map`이 주는 것.** 핀은 `CustomOverlay`로 그린다. 아이콘과 라벨을 한 요소에 담고 클러스터러가 그 요소를 묶는다. 핀은 `aria-hidden`이라 마우스 전용이고 키보드와 스크린리더 경로는 부르는 쪽이 같은 팝업 목록으로 따로 낸다. 핀의 탭 순서가 오버레이 삽입 순서라 화면 위치와 무관하고 클러스터에 묶이면 DOM에서 빠지기 때문이다.

```typescript
interface KakaoMapProps {
	/** 카카오맵 SDK의 MarkerClusterer. 밀집 구간을 +N으로 묶고 확대하면 풀린다. 세션을 만들 때 한 번 읽는다 */
	initialCluster?: { minLevel: number };
	selectedMarkerId?: string | null;
	/** 현재 위치 표시. 팝업 핀과 다른 모양이다 */
	myPosition?: KakaoLatLngLiteral | null;
	/** SDK 실패 화면에 더 놓을 것. 다시 시도 버튼은 기본으로 있다 */
	errorAction?: ReactNode;
}

interface KakaoMarkerData {
	/** 핀의 접근성 이름이자 마우스 툴팁. 라벨이 잘려도 이 값은 전체다 */
	title: string;
	/** 카테고리별 핀 아이콘. 없으면 기본 점 */
	iconUrl?: string;
	/** 핀 아래 붙는 팝업명. 일곱 자 말줄임은 부르는 쪽이 한다 */
	label?: string;
}

/** KakaoMap의 children으로 넣는다. 새 객체가 올 때마다 그 자리로 중심을 옮기고 사용자가 끌어 놓은 지도는 덮지 않는다 */
export function KakaoMapCamera({ center, level }: { center: KakaoLatLngLiteral | null; level?: number });
```

**로그.** `[popup]` 접두사. 상세 조회 실패, 위치 권한 거부, 클립보드 실패. 위치 권한 거부는 실패가 아니라 사용자의 선택이므로 `console.info`로 한 번만 남긴다.

**접근성.**

| 요소              | 계약                                                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 뷰 전환과 상세 탭 | 고르는 묶음이라 라디오와 탭 패턴을 쓴다. 상세 탭은 URL과 동기다                                                                                      |
| 정렬              | `<select>`나 `role="listbox"`. 현재 값이 버튼 텍스트에 보인다                                                                                        |
| 목록              | 더 불러오는 중은 `role="status"`로 "다음 10개를 불러오는 중"                                                                                         |
| 지도              | 핀은 `aria-hidden`이라 읽히지 않는다. 같은 팝업을 담은 목록이 키보드와 스크린리더 경로다. 평소 `sr-only`이고 포커스가 들어오면 지도 위에 떠서 보인다 |
| 클러스터 핀       | 핀과 함께 접근성 트리에서 빠진다. 목록에서 고르면 카메라가 그 핀으로 옮겨 가 클러스터가 풀린다                                                       |
| 현재 위치 버튼    | `aria-label`은 "현재 위치로 이동". 거부와 미지원이면 `disabled`, 측위 중이면 `aria-busy`. 이유는 지도 왼쪽 아래 `role="status"` 문구                 |
| 지도 팝업 카드    | `<section aria-live="polite" aria-label="선택한 팝업">`. 포커스를 옮기지 않고 닫기 버튼이 있다. 닫으면 현재 위치 버튼으로 포커스가 간다              |
| 상세 레이어       | `role="dialog"`와 `aria-modal`. 열 때 제목에 포커스를 주고 Esc로 닫으며 닫으면 열었던 카드로 포커스가 돌아간다                                       |
| 갤러리            | 이전과 다음 버튼이 있고 현재 장이 `aria-live`로 읽힌다. 스와이프는 터치에서만                                                                        |
| 주소와 공유 복사  | 결과를 `role="status"`로 "주소를 복사했습니다"                                                                                                       |
| 정보 확인 중 배지 | 텍스트 배지. 색만으로 구분하지 않는다                                                                                                                |

## O. Optimization과 운영

**렌더링.** 목록은 열 개씩이라 가상화하지 않는다. 카드 이미지는 `next/image`와 고정 비율이다. 지도는 뷰를 바꿀 때 언마운트한다. CSS로 숨기면 컨테이너 크기가 0이 되어 relayout 뒤 중심이 틀어진다. 다만 상세 레이어를 열 때는 언마운트하지 않는다. 지도를 덮는 레이어이지 다른 뷰가 아니다. SDK 로딩은 세션 하나가 공유하므로 다시 마운트해도 스크립트를 다시 받지 않는다.

**장애.** 지도 SDK가 실패하면 `KakaoMap`이 `role="alert"`로 원인을 보이고 목록 뷰로 가는 버튼과 다시 시도 버튼을 함께 둔다. 목록 조회가 실패하면 같은 자리에 오류 상태와 다시 시도를 그린다. 상세의 서버 컴포넌트 조회가 실패하면 `error.tsx`가 받고 클라이언트 쿼리 실패는 섹션 `ErrorState`다. 위치 권한 거부는 장애가 아니라 정상 분기다.

**재시도와 몰림.** 검색어는 300ms 디바운스 뒤 URL에 한 번 쓴다. 정렬 변경은 디바운스 없이 즉시다. 위치 요청은 지도 뷰 진입마다 한 번이고 실패해도 다시 부르지 않는다.

**지표.** 결과 0건 비율이 높으면 데이터가 비었거나 검색어가 안 맞는 것이다. 대체 이미지 비율이 높으면 수집 파이프라인의 이미지가 비었다. 위치 권한 허용 비율은 지도 첫 화면이 얼마나 유용한지를 가른다.

**운영.** 지역별 중심 좌표와 "위치는 지역 기준 대략값이에요" 안내는 지금 `features/popup/model/placeholder-markers.ts`에 임시 마커용으로 있다. 백엔드가 좌표를 내려주면 그 파일을 지우고 마커에 맞추는 `fitTo`가 지도 범위를 정한다. 안내 문구도 그 파일에 두어 함께 사라진다.

팝업의 지역 배지는 백엔드가 주소와 위경도로 매핑해 내려준 값이다. 팝업 데이터에 저장된 값이 아니라 조회할 때 붙는다. 매핑 범위가 바뀌면 프론트는 고칠 것이 없다.

`next.config.ts`의 `Permissions-Policy`는 `geolocation=(self)`다. 같은 출처에서만 권한을 묻고 iframe에 넣은 외부 문서는 묻지 못한다. 카메라와 마이크는 빈 목록으로 막혀 있다.
