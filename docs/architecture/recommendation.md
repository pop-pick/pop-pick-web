# 홈 추천 설계

`features/recommendation`. 홈의 헤더와 취향 배너, 회원의 팝업 PICK, 인기 팝업, 뜨고 있는 지역, 추천이 준비되기 전이나 실패했을 때의 축소 동작을 다룬다. 홈 화면 자체는 `src/app/page.tsx`(`/`)가 이 기능과 `auth`의 인증 슬롯을 조립한다.

## R. Requirements

**기능.** 홈은 위에서부터 헤더(워드마크와 검색 링크), 취향 배너, 회원에게만 보이는 "{이름}님의 팝업 PICK", 지금 인기 있는 팝업, 지금 뜨고 있는 지역 칩이다. 배너와 인기 팝업, 지역 칩은 회원과 비회원에게 같다. 9/26 시안에 검색바와 AI 코스 생성 배너가 없어 홈에 두지 않았다. 검색은 헤더 돋보기가 `/explore?view=list`로 가는 링크이고 플래너는 하단 탭바로 들어간다. 카드에 무엇이 놓이는지는 `docs/product/SPEC.md`의 AI 개인화 추천 코스 절이 정본이다.

**보장.**

- 홈 LCP는 p75 2.5초 이하다. 팝업 이미지가 붙으면 첫 PICK 카드 이미지가 LCP 요소다
- 회원의 PICK은 카드 셋을 가로 스크롤로 놓고 한 번에 한 장만 펼친다. 첫 카드가 펼쳐진 채 시작하고 다른 카드의 셰브론을 누르면 그 카드가 펼쳐지며 앞 카드가 접힌다. 펼친 카드의 셰브론을 다시 누르면 모두 접힌다. 3초마다 다음 카드로 넘어가고 마지막 다음은 첫 카드로 이어진다. 카드를 누르거나 끌거나 셰브론을 누르면 멈추고, 마우스를 올려 두거나 포커스가 안에 있는 동안은 쉰다. 움직임 줄이기 설정을 켜면 넘기지 않는다. 시안에 없는 정지 버튼은 평소에 보이지 않고 키보드 포커스가 오면 제목 줄에 나타난다. 자동으로 넘어가는 동안에는 맨 앞에 온 카드가 펼쳐지고 멈춘 뒤에는 사용자가 펼친 카드가 그대로다. 포커스가 들어온 카드는 보이는 자리로 스크롤한다. 자동 넘김은 `hooks/useCarouselAutoplay`가 Embla의 `scrollNext`로 한다
- 취향이 없는 회원에게는 랜덤 세 개를 보인다. 로그인한 사용자에게 PICK 자리가 비는 경우가 없다
- 인기 팝업은 상위 셋을 고정으로 보이고 전체보기를 누르면 탐색 목록이 인기순으로 열린다
- 추천이 준비되지 않았거나 실패해도 홈이 비지 않는다. 그 섹션이 인기 팝업으로 채워지고 제목과 한 줄 문구가 바뀌어 사용자가 추천이 아님을 안다
- 추천 이유는 두 줄을 넘지 않는다. 넘치면 두 줄에서 말줄임한다. 글자 수 상한은 백엔드와 맞춘다
- 섹션 셋(추천 또는 인기, 인기 지역, 배너)이 각자 로딩되고 하나의 실패가 다른 섹션을 막지 않는다

**설계를 가르는 질문.**

- 주도권은 클라이언트다. 요청 응답이다
- 추천 생성과 이유 문구는 백엔드 몫이다. 추천 기준은 PM이 정했고 AI가 그 위에서 돈다. FE는 결과를 그리기만 한다
- "준비 중"은 실패가 아니라 상태다. 온보딩 답이 아직 없거나 임베딩이 끝나지 않은 사용자에게 서버가 `PREPARING`을 값으로 낸다. 실패(`ApiError`)와 준비 중을 화면은 같은 축소 동작으로 다루지만 로그는 다르게 남긴다
- 축소 동작은 `no-fallback.md`의 조건 셋을 채운다. `docs/product/SPEC.md`에 적혀 있고 화면에서 라벨로 구분되고 `[recommendation]` 로그가 남는다
- 백엔드에 홈이 읽을 API가 아직 없다. 화면은 임시 데이터로 먼저 만들었고 없는 엔드포인트의 조회 함수와 `queryOptions`는 만들지 않았다. 출처가 정해지지 않은 값(일치율, 카드 배지 문구, 인기 한 줄 문구, 평점과 리뷰 수)은 `null`을 허용하고 값이 있을 때만 그린다. 임시 데이터에 시안 값을 넣어 지금 화면은 시안과 같다

**범위 밖.** 추천 새로 고침 버튼, 추천 결과 저장, 카드 단위 "관심 없음" 피드백, 홈 카드의 찜 버튼(시안에 없다).

## A. Architecture

| 상태                      | 원천                                                         | 비고                                                                                   |
| ------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| 추천 결과                 | Server. `["recommendations", "home"]`                        | 설계. 로그인 상태일 때만. 지금은 임시 데이터                                           |
| 인기 팝업                 | Server. `["popups", "list", { sort: "popular", limit: 10 }]` | 설계. 공개. 최근 7일 상세 조회수 내림차순. 비회원 홈과 축소 동작 둘이 같은 캐시를 쓴다 |
| 지역 요약                 | Server. `["regions", "summary"]`                             | 설계. 공개. 지금은 코드의 `REGIONS` 중 넷                                              |
| 내 정보                   | Server. `["me"]`                                             | `auth.md`. 지금은 닉네임 자리에 `null`을 넘긴다                                        |
| PICK 자리에 무엇을 그리나 | Derived. 인증 상태와 세션 쿠키 유무                          | 아래 표                                                                                |
| 펼친 PICK 카드            | `PickSection`의 `useState`                                   | 공유와 새로고침 복원이 필요 없다                                                       |
| 추천 섹션의 표시 모드     | Derived. 추천 쿼리 상태와 `status`                           | 설계. `recommended`, `fallback-preparing`, `fallback-failed`                           |

**PICK 자리.** 라우트 파일은 서버 컴포넌트라 인증 상태를 읽지 못한다. 그래서 인증 상태마다 그릴 것을 `features/auth`의 `AuthStatusSwitch`에 슬롯으로 넘긴다. 슬롯 방식은 `ARCHITECTURE.md`의 폴더 구조 절에 있다.

| 인증 상태       | PICK 자리                                                                        |
| --------------- | -------------------------------------------------------------------------------- |
| `authenticated` | `PickSection`                                                                    |
| `anonymous`     | 없음                                                                             |
| `restoring`     | 리프레시 토큰 쿠키가 있으면 `PickSectionSkeleton`, 없으면 없음                   |
| `unavailable`   | 쿠키가 있으면 `auth`의 `SessionRetry`(로그인 확인 실패와 다시 시도), 없으면 없음 |

서버 렌더와 하이드레이션 첫 렌더에서 인증 상태는 항상 `restoring`이다. 라우트가 `readRefreshToken`으로 쿠키가 있는지만 보고 슬롯을 고르므로 로그인한 사용자는 재발급이 끝날 때 뼈대가 PICK으로 바뀌고 아래 섹션이 밀리지 않는다. 쿠키를 읽기 때문에 `/`는 요청마다 렌더된다. 쿠키는 있는데 세션이 죽었으면 뼈대가 사라지며 아래 섹션이 올라온다.

통신은 요청 응답 셋이다.

**추천 섹션의 결정.** 설계다. 추천 API가 열리면 이대로 붙인다.

```
추천 쿼리 성공이고 status READY이고 items가 비지 않음   recommended        추천 카드
추천 쿼리 성공이고 status PREPARING                     fallback-preparing 인기 팝업 + "추천을 준비 중이라 인기 팝업을 보여드려요"
추천 쿼리 성공이고 items가 비어 있음                    fallback-preparing 같은 처리. 로그에 empty로 남긴다
추천 쿼리 실패                                          fallback-failed    인기 팝업 + "추천을 불러오지 못했어요" + 다시 시도
추천 쿼리 로딩                                          skeleton
```

축소 동작에서 인기 팝업 쿼리까지 실패하면 그 섹션은 `ErrorState`다. 대체할 것이 없을 때는 실패를 그대로 보인다.

## D. Data Model

```typescript
// 있는 것. features/recommendation/model/home-popup.ts
interface RecommendedPopupItem {
	popup: PopupSummary;
	/** 펼친 카드의 설명. 두 줄 말줄임. 글자 수 상한은 백엔드와 맞춘다 */
	reason: string | null;
	/** 취향 일치율. 0부터 100까지의 정수. 출처 미정 */
	matchRate: number | null;
	/** 카드 오른쪽 위 배지 문구. "성수동 오늘 오픈". 출처 미정 */
	badge: string | null;
}

interface PopularPopupItem {
	popup: PopupSummary;
	/** "실시간 인기 1위" 같은 한 줄. 출처 미정 */
	highlight: string | null;
	/** 후기 출처 미정 */
	reviewSummary: { rating: number; count: number } | null;
}

// 설계. 추천 API가 열리면
type RecommendationStatus = "READY" | "PREPARING";

interface RecommendationResult {
	status: RecommendationStatus;
	items: RecommendedPopupItem[];
}

interface RegionSummary {
	region: Region;
	ongoingCount: number;
}

type RecommendationSectionMode = "skeleton" | "recommended" | "fallback-preparing" | "fallback-failed";

// features/recommendation/model/section-mode.ts
function resolveSectionMode(query: UseQueryResult<RecommendationResult, ApiError>): RecommendationSectionMode;

// 있는 것. features/recommendation/model/home-format.ts
/** "10.12 ~ 10.26". 한쪽이 없으면 있는 쪽만, 둘 다 없으면 null */
function formatPopupPeriod(startDate: string | null, endDate: string | null): string | null;
/** "{이름}님의 팝업 PICK". 이름이 없을 때의 문구는 DESIGN-SPEC 홈 절 */
function formatPickTitle(nickname: string | null): string;
```

`PopupSummary`는 `shared/model/popup.ts`에 있고 필드는 `popup.md`가 갖는다. 인기 행 셋째 줄의 입장 방식은 같은 파일의 짧은 라벨(`RESERVATION_SHORT_LABELS`)이다. 시안의 지역 칩에는 개수가 없다. `resolveSectionMode`는 분기 있는 순수 함수라 `testing.md`의 값이 나는 자리다.

## I. Interface

**컴포넌트.** 전부 `features/recommendation/components`에 있다. 데이터는 props로 받고 라우트가 `features/recommendation/model/placeholder-home.ts`의 임시 데이터를 넘긴다.

```typescript
export function HomeHeader(); // 워드마크가 페이지 <h1>이고 alt는 POP PICK. 돋보기가 /explore?view=list 링크
export function TasteBanner(); // 회원과 비회원 모두. "나에게 맞는 팝업 찾기"가 /onboarding/1
export function PickSection({
	nickname,
	recommendations
}: {
	nickname: string | null;
	recommendations: RecommendedPopupItem[];
});
export function PickCard(props: {
	recommendation: RecommendedPopupItem;
	nickname: string | null;
	isExpanded: boolean;
	onToggle: () => void;
}); // 펼쳤을 때만 설명과 일치율
export function OnImageBadge({ label }: { label: string }); // 이미지 위 반투명 배지. 카테고리와 badge
export function MatchRatePill({ nickname, matchRate }: { nickname: string | null; matchRate: number });
export function PickSectionSkeleton(); // restoring에서 PICK 자리를 지킨다
export function PopularSection({ popularPopups }: { popularPopups: PopularPopupItem[] }); // 전체보기가 /explore?view=list&sort=popular
export function PopularPopupRow({ item }: { item: PopularPopupItem }); // 72px 썸네일과 세 줄. 행 전체가 상세 링크
export function TrendingRegions({ regions }: { regions: Region[] }); // 칩이 /explore?view=list&region=
```

PICK 카드와 인기 행은 시안에서 탐색 카드와 모양이 달라 이 기능 안에 있다. 배너 목적지는 회원과 비회원 모두 `/onboarding/1`이라 배너가 인증 상태를 모른다. 로그인하지 않은 사용자는 `proxy.ts`가 `/login?next=/onboarding/1`로 보내고 로그인이 끝나면 온보딩 1단계로 온다.

**서버 API.** 전부 백엔드 요구다.

| 메서드와 경로                              | 인증 | 응답                         | 상태             |
| ------------------------------------------ | ---- | ---------------------------- | ---------------- |
| `GET /api/v1/recommendations?limit=10`     | 필요 | `RecommendationResult`       | 요구             |
| `GET /api/v1/popups?sort=popular&limit=10` | 선택 | `PageResponse<PopupSummary>` | 요구(`popup.md`) |
| `GET /api/v1/regions/summary`              | 없음 | `RegionSummary[]`            | 요구             |

"인기"는 최근 7일간 팝업 상세 페이지 조회수 내림차순이다. 외부에서 받는 값이 아니라 우리가 집계한다. 집계와 정렬은 백엔드가 맡고 FE는 `sort=popular`를 넘긴다. 상세를 여는 것이 조회수에 반영되는 경로는 백엔드가 정한다.

**로그.** `[recommendation]` 접두사. `fallback-preparing`과 `fallback-failed`로 들어갈 때 각각 한 줄. 실패는 `errorCode`를 함께 남긴다.

**접근성.** 섹션마다 `<section aria-labelledby>`와 `<h2>`다. 축소 동작의 라벨 문구는 `<h2>` 아래 `<p>`로 두어 스크린리더가 제목 다음에 읽는다. PICK 목록과 인기 목록은 `<ul>`이고 PICK 카드는 `<li>` 안 `<article>`이다. 카드 제목이 상세로 가는 링크이고 링크의 `::after`가 카드 전체를 덮는다. 셰브론은 링크의 형제 버튼이라 링크 안에 버튼이 없고 `aria-expanded`와 `aria-controls`를 가진다. 셰브론을 눌러도 상세로 가지 않는다. `PickSectionSkeleton`은 `role="status"`와 화면에 보이지 않는 "추천 팝업을 불러오는 중입니다" 문구를 가진다.

## O. Optimization과 운영

**렌더링.** PICK 목록은 Embla 캐러셀(`embla-carousel-react`)이다. 터치와 마우스 끌기 모두 카드 한 장 단위로 멈추고, 카드 안으로 키보드 포커스가 들어가면 그 카드로 넘어간다. `motion`으로 끌기를 만들면 `drag`가 든 기능 묶음을 더 실어야 해서 쓰지 않았다. 사진은 `PopupImage`가 고정 크기 칸에 `next/image`로 그려 CLS가 없고, 첫 카드만 `loading="eager"`이다(`popup.md`의 이미지 절).

**장애.** 위의 결정표대로다. 인기 지역이 실패하면 칩 줄만 사라지고 로그를 남긴다. 배너는 정적이라 실패가 없다.

**재시도.** 추천 쿼리만 `staleTime`을 5분으로 올린다. 취향이 바뀌지 않는 한 결과가 같고 홈을 오갈 때마다 AI 호출이 나가면 비용이 든다.

**지표.** 축소 동작 발생 비율을 센다. 0이 목표는 아니고 배포 초기에 높다가 데이터가 쌓이며 내려가야 한다. 내려가지 않으면 임베딩 파이프라인을 본다.

**API가 열리면 옮길 것.**

- `placeholder-home.ts`의 상수 셋을 쿼리로 바꾸고 파일을 지운다. 조회 함수와 `queryOptions`는 엔드포인트가 생길 때 `api`에 만든다
- 닉네임 자리의 `PLACEHOLDER_NICKNAME`(`shared/lib/placeholder-data.ts`)을 `["me"]`의 `nickname`으로 바꾼다
- `RecommendedPopupItem`과 `PopularPopupItem`을 응답 모양에 맞추고 `null`을 허용한 필드 중 출처가 정해진 것은 `null`을 뺀다. 두 타입은 이미 이 기능의 `model`에 있다
- 지역 칩을 `RegionSummary`로 바꾼다
- **추천 API가 토큰을 요구하면 서버 슬롯 방식을 다시 본다.** 지금은 서버 컴포넌트인 라우트가 임시 데이터를 넣은 `PickSection`을 `authenticated` 슬롯에 넘긴다. 서버 컴포넌트는 토큰이 없어 인증이 필요한 API를 부르지 못한다. 추천 쿼리는 클라이언트 컴포넌트 안에서 돌아야 하고 `PickSection`이 쿼리를 직접 부르는 모양으로 바뀐다

**운영.** 추천 이유의 글자 수 상한을 백엔드와 정하면 카드의 줄 수 제한은 그대로 두고 상한만 문서에 적는다. 두 줄 말줄임은 상한과 무관하게 남는다.
