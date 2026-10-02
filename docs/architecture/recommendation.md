# 홈 추천 설계

`features/recommendation`. 홈의 헤더와 검색창, 취향 배너, 회원의 팝업 PICK, 인기 팝업, 섹션마다의 실패 안내를 다룬다. 홈 화면 자체는 `src/app/page.tsx`(`/`)가 이 기능과 `auth`의 인증 슬롯을 조립한다.

## R. Requirements

**기능.** 홈은 위에서부터 헤더(워드마크), 검색창, 취향 배너, 회원에게만 보이는 "{이름}님의 팝업 PICK", 지금 인기 있는 팝업이다. 인기 팝업은 회원과 비회원에게 같다. 시안의 "지금 뜨고 있는 지역" 칩은 백엔드에 지역 요약이 없고 팝업 응답에 지역이 없어 내렸다. 검색창은 탐색과 같은 입력칸(`shared/components/PopupSearchForm`)이다. 엔터를 누르면 그 검색어로 탐색 목록(`/explore?view=list&q=`)이 열리고 검색어가 비었으면 검색어 없는 목록이 열린다. 팀 위키 9/28 결정(D73)과 기능 명세의 탐색 목록 스티키를 따랐다. 취향 배너는 버튼 하나만 갈린다. 회원은 "AI POP PICK 시작하기"가 코스 조건 입력(`/planner/new`)으로, 비회원은 "나에게 맞는 팝업 찾기"가 `/onboarding/1`로 간다. 회원 버튼은 기능 명세의 "AI 코스 생성 버튼: 클릭 시 플래너 페이지로 이동"에 해당한다. 같은 문구의 플래너 홈 생성 배너가 조건 입력으로 가서 목적지를 맞췄다. 카드에 무엇이 놓이는지는 `docs/product/SPEC.md`의 AI 개인화 추천 코스 절이 정본이다.

**지금 데이터.** 백엔드에 추천 API와 인기 API가 없어 두 섹션 모두 팝업 목록 API(`GET /api/v1/popups`)로 그린다. 인기 팝업은 서버 순서(오픈일 최신순) 상위 셋이다. 회원 PICK은 목록 한 페이지(50건)에서 무작위로 고른 셋이다. SPEC의 "취향이 없는 회원은 랜덤 셋" 규칙을 모든 회원에게 쓴다. 닉네임을 받는 API가 없어 제목은 "회원님의 팝업 PICK"이다.

**보장.**

- 홈 LCP는 p75 2.5초 이하다. 팝업 이미지가 붙으면 첫 PICK 카드 이미지가 LCP 요소다
- 회원의 PICK은 카드 셋을 가로 스크롤로 놓고 한 번에 한 장만 펼친다. 첫 카드가 펼쳐진 채 시작하고 다른 카드의 셰브론을 누르면 그 카드가 펼쳐지며 앞 카드가 접힌다. 펼친 카드의 셰브론을 다시 누르면 모두 접힌다. 3초마다 다음 카드로 넘어가고 마지막 다음은 첫 카드로 이어진다. 카드를 누르거나 끌고 있는 동안, 마우스가 카드 위에 있는 동안, 키보드 포커스가 안에 있는 동안, 탭이 숨겨진 동안에는 넘기지 않고 그 상태가 끝나면 3초 뒤 다음 카드로 넘어간다. 포커스는 `:focus-visible`일 때만 센다. Chrome은 마우스로 누른 링크와 버튼에도 포커스를 줘서 이 조건이 없으면 카드를 끌거나 셰브론을 누른 뒤에도 넘김이 멈춰 있다. 셰브론은 넘김을 멈추지 않는다. 계속 멈춰 있는 경우는 정지 버튼을 눌렀을 때와 움직임 줄이기 설정을 켰을 때 둘이다. 시안에 없는 정지 버튼은 평소에 보이지 않고 키보드 포커스가 오면 제목 줄에 나타난다. 버튼은 "멈추기"와 "다시 시작" 두 문구 중 긴 쪽의 폭을 늘 차지해 문구가 바뀌어도 옆 글자가 움직이지 않는다. 넘기는 동안에는 맨 앞에 온 카드가 펼쳐지고 정지 버튼으로 멈춘 뒤에는 사용자가 펼친 카드가 그대로다. 포커스가 들어온 카드는 보이는 자리로 스크롤한다. 자동 넘김은 `hooks/useCarouselAutoplay`가 Embla의 `scrollNext`로 한다
- 취향이 없는 회원에게는 랜덤 세 개를 보인다. 로그인한 사용자에게 PICK 자리가 비는 경우가 없다
- 인기 팝업은 상위 셋을 고정으로 보이고 전체보기를 누르면 탐색 목록이 열린다. 탐색에 정렬이 없어 목록은 서버 순서다
- PICK이 실패하면 섹션 안에 실패 안내와 다시 시도를 보이고 결과가 없으면 결과 없음 안내를 보인다. 추천이 준비되지 않았을 때 인기 팝업으로 채우는 축소 동작은 추천 API가 생기면 붙인다
- 추천 이유는 두 줄을 넘지 않는다. 넘치면 두 줄에서 말줄임한다. 글자 수 상한은 백엔드와 맞춘다
- 섹션 둘(PICK, 인기 팝업)이 각자 로딩되고 하나의 실패가 다른 섹션을 막지 않는다. 배너는 정적이다

**설계를 가르는 질문.**

- 주도권은 클라이언트다. 요청 응답이다
- 추천 생성과 이유 문구는 백엔드 몫이다. 추천 기준은 PM이 정했고 AI가 그 위에서 돈다. FE는 결과를 그리기만 한다
- "준비 중"은 실패가 아니라 상태다. 임베딩이 끝나지 않은 사용자에게 서버가 `PREPARING`을 값으로 낸다. 취향이 없는 회원은 준비 중이 아니라 랜덤 셋을 받는다. 실패(`ApiError`)와 준비 중을 화면은 같은 축소 동작으로 다루지만 로그는 다르게 남긴다
- 축소 동작은 `~/.agents/rules/no-fallback.md`의 조건 셋을 채운다. `docs/product/SPEC.md`에 적혀 있고 화면에서 라벨로 구분되고 `[recommendation]` 로그가 남는다
- 출처가 없는 값(추천 이유, 카드 배지 문구, 인기 한 줄 문구, 평점과 리뷰 수)은 `null`이고 값이 있을 때만 그린다. 추천 이유가 없으면 PICK 카드에 셰브론과 펼침 영역을 그리지 않는다. 지금 데이터로는 모든 카드가 그렇다. 취향 일치율은 받을 곳이 없어 타입과 카드에서 지웠다

**범위 밖.** 추천 새로 고침 버튼, 추천 결과 저장, 카드 단위 "관심 없음" 피드백, 홈 카드의 찜 버튼(시안에 없다).

## A. Architecture

| 상태                      | 원천                                     | 비고                                                                                   |
| ------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| 추천 결과                 | Server. `["recommendations", "home"]`    | 로그인 상태일 때만. `staleTime` 5분. 지금은 목록 한 페이지(limit 50)에서 무작위 셋     |
| 인기 팝업                 | Server. `["recommendations", "popular"]` | 공개(선택 인증). 지금은 목록의 서버 순서 상위 셋. 설계는 최근 7일 상세 조회수 내림차순 |
| 내 정보                   | Server. `["me"]`                         | `auth.md`. API가 없어 닉네임 자리에 `null`을 넘긴다                                    |
| PICK 자리에 무엇을 그리나 | Derived. 인증 상태와 세션 쿠키 유무      | 아래 표                                                                                |
| 펼친 PICK 카드            | `PickSection`의 `useState`               | 공유와 새로고침 복원이 필요 없다                                                       |
| 추천 섹션의 표시 모드     | Derived. 추천 쿼리 상태와 `status`       | 설계. 추천 API가 생기면 쓴다. `recommended`, `fallback-preparing`, `fallback-failed`   |

**PICK 자리.** 라우트 파일은 서버 컴포넌트라 인증 상태를 읽지 못한다. 그래서 인증 상태마다 그릴 것을 `features/auth`의 `AuthStatusSwitch`에 슬롯으로 넘긴다. 슬롯 방식은 `ARCHITECTURE.md`의 폴더 구조 절에 있다.

| 인증 상태       | PICK 자리                                                                        |
| --------------- | -------------------------------------------------------------------------------- |
| `authenticated` | `HomePickSection`                                                                | PICK 쿼리를 부르고 로딩과 정상, 실패, 결과 없음 넷을 그린다. 닉네임은 `null`이라 "회원님"이다. 기본 이름 "회원"은 `model/home-format.ts`에 있다 |
| `anonymous`     | 없음                                                                             |
| `restoring`     | 리프레시 토큰 쿠키가 있으면 `PickSectionSkeleton`, 없으면 없음                   |
| `unavailable`   | 쿠키가 있으면 `auth`의 `SessionRetry`(로그인 확인 실패와 다시 시도), 없으면 없음 |

서버 렌더와 하이드레이션 첫 렌더에서 인증 상태는 항상 `restoring`이다. 라우트가 `readRefreshToken`으로 쿠키가 있는지만 보고 슬롯을 고르므로 로그인한 사용자는 재발급이 끝날 때 뼈대가 PICK으로 바뀌고 아래 섹션이 밀리지 않는다. 쿠키를 읽기 때문에 `/`는 요청마다 렌더된다. 쿠키는 있는데 세션이 죽었으면 뼈대가 사라지며 아래 섹션이 올라온다. PICK 쿼리는 `authenticated` 칸의 `HomePickSection`이 클라이언트에서 부르므로 토큰이 붙는다.

통신은 요청 응답 둘이다.

**섹션 상태.** `HomePickSection`은 로딩이면 `PickSectionSkeleton`, 카드가 있으면 `PickSection`을 그린다. 실패하면 "회원님의 팝업 PICK" 제목 아래 실패 안내("추천 팝업을 불러오지 못했어요."와 다시 시도)를, 비었으면 "지금 추천할 팝업이 없어요." 안내를 그린다. `PopularSection`은 제목과 전체보기를 늘 보이고 아래가 로딩 뼈대(행 셋), 실패와 다시 시도("인기 팝업을 불러오지 못했어요."), 결과 없음("아직 등록된 팝업이 없어요."), 목록 넷으로 갈린다.

**추천 섹션의 결정.** 설계다. 추천 API가 열리면 이대로 붙인다.

```
추천 쿼리 성공이고 status READY이고 items가 비지 않음   recommended        추천 카드
추천 쿼리 성공이고 status PREPARING                     fallback-preparing 인기 팝업 + "추천을 준비 중이라 인기 팝업을 보여드려요"
추천 쿼리 성공이고 items가 비어 있음                    fallback-preparing 같은 처리. 로그에 empty로 남긴다
추천 쿼리 실패                                          fallback-failed    인기 팝업 + "추천을 불러오지 못했어요" + 다시 시도
추천 쿼리 로딩                                          skeleton
```

축소 동작에서 인기 팝업 쿼리까지 실패하면 그 섹션은 실패 안내다. 대체할 것이 없을 때는 실패를 그대로 보인다.

## D. Data Model

`RecommendedPopupItem`(팝업과 추천 이유, 카드 배지)과 `PopularPopupItem`(팝업과 인기 한 줄, 평점과 리뷰 수)은 `model/home-popup.ts`에 있다. 출처가 정해지지 않은 필드는 `null`을 허용한다. 지금은 목록 응답을 `toPopupSummary`로 바꾼 팝업에 나머지 필드를 모두 `null`로 붙여 queryFn 안에서 캐시에 둔다. 찜 토글의 캐시 패치가 `{ popup }` 안의 `id`와 `isBookmarked`를 찾기 때문이다. 무작위 셋을 고르는 `pickRandomPopups`도 이 파일에 있다. 아래는 추천 API가 열리면 만드는 설계다.

```typescript
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
```

`PopupSummary`는 `shared/model/popup.ts`에 있고 필드는 `popup.md`가 갖는다. 인기 행 셋째 줄의 입장 방식은 같은 파일의 짧은 라벨(`RESERVATION_SHORT_LABELS`)이다. `resolveSectionMode`는 분기 있는 순수 함수라 `testing-trophy.md`의 값이 나는 자리다.

## I. Interface

**컴포넌트.** 전부 `features/recommendation/components`에 있다. PICK은 `HomePickSection`이, 인기 팝업은 `PopularSection`이 쿼리를 직접 부르는 클라이언트 컴포넌트다. 인기 팝업은 공개 데이터라 서버 컴포넌트 `HomePopularSection`이 먼저 받아(`prefetchQuery`) `HydrationBoundary`로 넘긴다. 라우트가 이것을 `Suspense`로 감싸 홈 첫 응답은 기다리지 않고, 인기 팝업이 받아지면 같은 응답 안에서 목록이 그려져 온다. 받는 동안의 자리 `PopularSectionSkeleton`은 쿼리를 부르지 않는다. 같은 쿼리를 미리 만들면 `HydrationBoundary`가 서버 렌더에서 데이터를 채우지 않고 뼈대를 그린다. 서버 조회가 실패하면 데이터 없이 넘기고 브라우저 쿼리가 다시 받아 실패 화면을 그린다. 조회 함수와 `queryOptions` 둘(`homePickQueryOptions`, `popularPopupsQueryOptions`)은 `api/get-popups.ts`에 있다. 두 섹션의 실패 안내는 공용 `shared/components/LoadFailure`를 `role="alert"`로 감싼 것이다.

| 컴포넌트               | 계약                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `HomeHeader`           | 워드마크가 페이지 `<h1>`이고 alt는 POP PICK. 그 아래 `HomeSearch`가 검색어를 받아 `buildExploreSearchPath`로 탐색 목록에 간다 |
| `TasteBanner`          | `audience`가 `member`면 "AI POP PICK 시작하기"가 `/planner/new`, `guest`면 "나에게 맞는 팝업 찾기"가 `/onboarding/1` 링크     |
| `HomePickSection`      | PICK 쿼리를 부르고 로딩과 정상, 실패, 결과 없음 넷을 그린다. 닉네임은 `null`이라 "회원님"                                     |
| `PickSection`          | 닉네임과 `RecommendedPopupItem[]`을 받는다. 펼친 카드와 자동 넘김을 갖는다                                                    |
| `PickCard`             | 펼쳤을 때만 추천 이유를 그린다. 추천 이유가 `null`이면 셰브론과 펼침 영역이 없다                                              |
| `OnImageBadge`         | 이미지 위 반투명 배지. 카테고리와 `badge` 문구                                                                                |
| `PickSectionSkeleton`  | `restoring`과 PICK 로딩 중에 카드 높이의 뼈대를 그린다. 아래 섹션이 밀리지 않는다                                             |
| `HomePopularSection`   | 서버 컴포넌트. 인기 팝업을 받아 `HydrationBoundary`로 `PopularSection`에 넘긴다                                               |
| `PopularSection`       | 인기 쿼리를 부른다. 머리글 `PopularSectionHeader`와 뼈대 `PopularRowsSkeleton`을 `PopularSectionSkeleton`과 같이 쓴다         |
| `PopularSectionHeader` | 제목과 전체보기. 전체보기는 `buildExploreListPath()`로 탐색 목록(`/explore?view=list`)                                        |
| `PopularPopupRow`      | 72px 썸네일과 세 줄. 행 전체가 상세 링크                                                                                      |

PICK 카드와 인기 행은 시안에서 탐색 카드와 모양이 달라 이 기능 안에 있다. 배너는 인증 상태를 모르고 라우트가 `AuthStatusSwitch`의 칸마다 `audience`를 골라 넣는다. 세션을 확인하는 동안(`restoring`)과 확인하지 못했을 때(`unavailable`)는 세션 쿠키가 있으면 회원 배너, 없으면 비회원 배너다. 비회원 배너를 누르면 `proxy.ts`가 `/login?next=/onboarding/1`로 보내고 로그인이 끝나면 온보딩 1단계로 온다.

**서버 API.**

| 메서드와 경로                             | 인증 | 응답                                  | 상태                       |
| ----------------------------------------- | ---- | ------------------------------------- | -------------------------- |
| `GET /api/v1/popups?limit=3`              | 선택 | `PageResponse<PopupListItemResponse>` | 있다. 인기 팝업            |
| `GET /api/v1/popups?limit=50`             | 선택 | `PageResponse<PopupListItemResponse>` | 있다. 회원 PICK 후보       |
| `GET /api/v1/recommendations?limit=10`    | 필요 | `RecommendationResult`                | 요구                       |
| `GET /api/v1/popups?sort=popular&limit=3` | 선택 | `PageResponse<PopupListItemResponse>` | 요구. 정렬 파라미터가 없다 |
| `GET /api/v1/regions/summary`             | 없음 | `RegionSummary[]`                     | 요구                       |

"인기"는 최근 7일간 팝업 상세 페이지 조회수 내림차순이다. 외부에서 받는 값이 아니라 우리가 집계한다. 집계와 정렬은 백엔드가 맡고 FE는 `sort=popular`를 넘긴다. 지금 백엔드는 상세 조회수를 세지 않는다.

**로그.** `[recommendation]` 접두사. 지금은 PICK과 인기 팝업 조회 실패를 `console.error`로 남긴다. 축소 동작이 붙으면 `fallback-preparing`과 `fallback-failed`로 들어갈 때 각각 한 줄을 남기고 실패는 `errorCode`를 함께 남긴다.

**접근성.** 섹션마다 `<section aria-labelledby>`와 `<h2>`다. 축소 동작의 라벨 문구는 `<h2>` 아래 `<p>`로 두어 스크린리더가 제목 다음에 읽는다. PICK 목록과 인기 목록은 `<ul>`이고 PICK 카드는 `<li>` 안 `<article>`이다. 카드 제목이 상세로 가는 링크이고 링크의 `::after`가 카드 전체를 덮는다. 셰브론은 링크의 형제 버튼이라 링크 안에 버튼이 없고 `aria-expanded`와 `aria-controls`를 가진다. 셰브론을 눌러도 상세로 가지 않는다. `PickSectionSkeleton`은 `role="status"`와 화면에 보이지 않는 "추천 팝업을 불러오는 중입니다" 문구를 가진다. 인기 팝업 로딩 뼈대는 `role="status"`와 "인기 팝업을 불러오는 중입니다"다. 섹션 실패 안내는 `role="alert"`로 감싼다.

## O. Optimization과 운영

**렌더링.** 홈(`/`)은 세션 쿠키를 읽어 PICK 자리를 고르므로 요청마다 서버에서 그린다. 인기 팝업은 그 서버 렌더에 실려 첫 HTML에 목록이 있다. PICK은 토큰이 필요해 브라우저에서 받는다. PICK 목록은 Embla 캐러셀(`embla-carousel-react`)이다. 터치와 마우스 끌기 모두 카드 한 장 단위로 멈추고, 카드 안으로 키보드 포커스가 들어가면 그 카드로 넘어간다. `motion`으로 끌기를 만들면 `drag`가 든 기능 묶음을 더 실어야 해서 쓰지 않았다. 사진은 `PopupImage`가 고정 크기 칸에 `next/image`로 그려 CLS가 없고, 첫 카드만 `loading="eager"`이다(`popup.md`의 이미지 절).

**장애.** PICK과 인기 팝업은 각자 섹션 안에서 실패를 보이고 다시 시도로 회복한다. 추천 API가 붙으면 위의 결정표대로다. 배너는 정적이라 실패가 없다.

**재시도.** 추천 쿼리만 `staleTime`을 5분으로 올린다. 취향이 바뀌지 않는 한 결과가 같고 홈을 오갈 때마다 AI 호출이 나가면 비용이 든다. 지금은 무작위 셋이라 5분이 지난 뒤 창 포커스나 로그인 직후의 무효화로 다시 받으면 다른 셋으로 바뀐다.

**지표.** 축소 동작 발생 비율을 센다. 0이 목표는 아니고 배포 초기에 높다가 데이터가 쌓이며 내려가야 한다. 내려가지 않으면 임베딩 파이프라인을 본다.

**추천과 인기 API가 열리면 옮길 것.**

- `api/get-popups.ts`의 두 `queryOptions`를 각 엔드포인트 파일로 옮긴다
- 닉네임 자리의 `null`을 `["me"]`의 `nickname`으로 바꾼다
- `RecommendedPopupItem`과 `PopularPopupItem`을 응답 모양에 맞추고 `null`을 허용한 필드 중 출처가 정해진 것은 `null`을 뺀다
- 추천 섹션의 결정표대로 축소 동작을 붙이고 `HomePickSection`의 실패 안내를 그 결정으로 바꾼다
- 추천 응답에 회원별 일치율이 실리면 `RecommendedPopupItem`과 PICK 카드의 펼침 영역에 일치율 줄을 다시 넣는다
- 지역 요약 API와 팝업 응답의 지역이 생기면 지역 칩을 다시 놓는다. 칩이 `/explore?view=list&region=`으로 가므로 탐색의 지역 필터와 함께 되살린다(`popup.md`의 백엔드에 없어 내린 것)

**운영.** 추천 이유의 글자 수 상한을 백엔드와 정하면 카드의 줄 수 제한은 그대로 두고 상한만 문서에 적는다. 두 줄 말줄임은 상한과 무관하게 남는다.
