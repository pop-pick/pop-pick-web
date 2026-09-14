# 홈 추천 설계

`features/recommendation`. 회원 홈의 추천 섹션과 비회원 홈의 인기 섹션, 지역 요약, 플래너 배너, 추천이 준비되기 전이나 실패했을 때의 축소 동작을 다룬다. 홈 화면 자체는 `src/app/(tabs)/home/page.tsx`가 이 기능과 `popup`, `bookmark`를 조립한다.

## R. Requirements

**기능.** 회원 홈은 취향 기반 추천 카드와 닉네임 인사, 비회원 홈은 취향 입력 배너와 인기 팝업이다. 둘 다 검색바와 인기 지역 칩, 플래너 배너가 있다. 카드에 무엇이 놓이는지는 `docs/product/SPEC.md`의 AI 개인화 추천 코스 절이 정본이다.

**보장.**

- 홈 LCP는 p75 2.5초 이하다. 첫 카드 이미지가 LCP 요소다
- 추천이 준비되지 않았거나 실패해도 홈이 비지 않는다. 그 섹션이 인기 팝업으로 채워지고 제목과 한 줄 문구가 바뀌어 사용자가 추천이 아님을 안다
- 추천 이유는 두 줄을 넘지 않는다. 넘치면 두 줄에서 말줄임한다. 글자 수 상한은 백엔드와 맞춘다
- 섹션 셋(추천 또는 인기, 인기 지역, 배너)이 각자 로딩되고 하나의 실패가 다른 섹션을 막지 않는다
- 홈에서 찜을 누르면 100ms 안에 하트가 바뀐다(`bookmark.md`)

**설계를 가르는 질문.**

- 주도권은 클라이언트다. 요청 응답이다
- 추천 생성과 이유 문구는 백엔드 몫이다. 추천 기준은 PM이 정했고 AI가 그 위에서 돈다. FE는 결과를 그리기만 한다
- "준비 중"은 실패가 아니라 상태다. 온보딩 답이 아직 없거나 임베딩이 끝나지 않은 사용자에게 서버가 `PREPARING`을 값으로 낸다. 실패(`ApiError`)와 준비 중을 화면은 같은 축소 동작으로 다루지만 로그는 다르게 남긴다
- 축소 동작은 `no-fallback.md`의 조건 셋을 채운다. `docs/product/SPEC.md`에 적혀 있고 화면에서 라벨로 구분되고 `[recommendation]` 로그가 남는다

**범위 밖.** 추천 새로 고침 버튼, 추천 결과 저장, 카드 단위 "관심 없음" 피드백, 평점과 리뷰 수(피그마 비회원 카드에 있지만 출처가 미정이라 `null`이면 그리지 않는다).

## A. Architecture

| 상태                  | 원천                                                         | 비고                                                   |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| 추천 결과             | Server. `["recommendations", "home"]`                        | 로그인 상태일 때만                                     |
| 인기 팝업             | Server. `["popups", "list", { sort: "popular", limit: 10 }]` | 공개. 비회원 홈과 축소 동작 둘이 같은 캐시를 쓴다      |
| 지역 요약             | Server. `["regions", "summary"]`                             | 공개                                                   |
| 내 정보               | Server. `["me"]`                                             | `auth.md`                                              |
| 어느 홈을 그리나      | Derived. 인증 상태                                           | `authenticated`면 회원 홈                              |
| 추천 섹션의 표시 모드 | Derived. 추천 쿼리 상태와 `status`                           | `recommended`, `fallback-preparing`, `fallback-failed` |

통신은 요청 응답 셋이다.

**추천 섹션의 결정.**

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
// features/recommendation/model/recommendation.ts. 백엔드 요구
interface RecommendedPopup {
	popup: PopupSummary;
	/** 두 줄 이내. 글자 수 상한은 백엔드와 맞춘다 */
	reason: string;
}

type RecommendationStatus = "READY" | "PREPARING";

interface RecommendationResult {
	status: RecommendationStatus;
	items: RecommendedPopup[];
}

interface RegionSummary {
	region: Region;
	ongoingCount: number;
}

type RecommendationSectionMode = "skeleton" | "recommended" | "fallback-preparing" | "fallback-failed";

// features/recommendation/model/section-mode.ts
function resolveSectionMode(query: UseQueryResult<RecommendationResult, ApiError>): RecommendationSectionMode;
```

`resolveSectionMode`는 분기 있는 순수 함수라 `testing.md`의 값이 나는 자리다. `PopupSummary`는 서버 응답 모양이고 `popup.md`가 갖는다. 지금 `shared/model/popup.ts`에 있는 것은 카드가 그리는 화면용 타입 `PopupCardItem`이다.

## I. Interface

**컴포넌트와 훅.**

```typescript
export function HomeHeader(); // 회원이면 닉네임 인사, 비회원이면 고정 문구
export function RecommendationSection(); // 모드에 따라 카드 목록과 라벨. 카드는 shared/ui/PopupCard
export function PopularSection({ title }: { title: string }); // 비회원 홈의 인기 팝업
export function OnboardingBanner(); // 비회원 홈. "취향 입력하기"가 /login?next=/onboarding/1로
export function PlannerBanner(); // "AI 코스 생성기"가 /planner로
export function RegionChips(); // 지역 요약. 칩이 /explore?region=으로
export function HomeSearchBar(); // 제출하면 /explore?q=

export function useRecommendations(): UseQueryResult<RecommendationResult, ApiError>;
export function useRegionSummary(): UseQueryResult<RegionSummary[], ApiError>;
```

`PopupCard`는 `shared/ui`에 두고 `reason`을 선택 prop으로 받는다. 홈과 탐색 목록, 찜 목록이 같은 카드를 쓴다. 카드는 `<article>`이고 제목이 상세로 가는 링크, 찜 버튼은 링크의 형제다. 링크 안에 버튼을 넣지 않는다.

**서버 API.**

| 메서드와 경로                              | 인증 | 응답                         | 상태             |
| ------------------------------------------ | ---- | ---------------------------- | ---------------- |
| `GET /api/v1/recommendations?limit=10`     | 필요 | `RecommendationResult`       | 요구             |
| `GET /api/v1/popups?sort=popular&limit=10` | 선택 | `PageResponse<PopupSummary>` | 요구(`popup.md`) |
| `GET /api/v1/regions/summary`              | 없음 | `RegionSummary[]`            | 요구             |

"인기"의 정의는 백엔드가 정한다. 지금은 조회수나 찜 수가 없어 최신 등록순이 될 수 있고 FE는 `sort=popular`라는 이름만 안다.

**로그.** `[recommendation]` 접두사. `fallback-preparing`과 `fallback-failed`로 들어갈 때 각각 한 줄. 실패는 `errorCode`를 함께 남긴다.

**접근성.** 섹션마다 `<section aria-labelledby>`와 `<h2>`다. 축소 동작의 라벨 문구는 `<h2>` 아래 `<p>`로 두어 스크린리더가 제목 다음에 읽는다. 카드 목록은 `<ul>`이고 카드는 `<li>` 안 `<article>`이다. 추천 이유는 카드 본문 텍스트라 별도 속성이 없다.

## O. Optimization과 운영

**렌더링.** 첫 카드 이미지에 `priority`를 주고 나머지는 지연 로드한다. 카드 이미지는 `next/image`에 고정 비율 컨테이너를 두어 CLS를 막는다. 대표 이미지가 없으면 카테고리별 대체 이미지를 쓴다. 대체 이미지는 `public/`의 정적 파일이다.

**장애.** 위의 결정표대로다. 인기 지역이 실패하면 칩 줄만 사라지고 로그를 남긴다. 배너는 정적이라 실패가 없다.

**재시도.** 추천 쿼리만 `staleTime`을 5분으로 올린다. 취향이 바뀌지 않는 한 결과가 같고 홈을 오갈 때마다 AI 호출이 나가면 비용이 든다.

**지표.** 축소 동작 발생 비율을 센다. 0이 목표는 아니고 배포 초기에 높다가 데이터가 쌓이며 내려가야 한다. 내려가지 않으면 임베딩 파이프라인을 본다.

**운영.** 추천 이유의 글자 수 상한을 백엔드와 정하면 `PopupCard`의 줄 수 제한은 그대로 두고 상한만 문서에 적는다. 두 줄 말줄임은 상한과 무관하게 남는다.
