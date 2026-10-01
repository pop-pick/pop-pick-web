# 홈 추천 설계

`features/recommendation`. 홈의 헤더와 검색창, 취향 배너, 회원의 팝업 PICK, 인기 팝업, 뜨고 있는 지역, 추천이 준비되기 전이나 실패했을 때의 축소 동작을 다룬다. 홈 화면 자체는 `src/app/page.tsx`(`/`)가 이 기능과 `auth`의 인증 슬롯을 조립한다.

## R. Requirements

**기능.** 홈은 위에서부터 헤더(워드마크), 검색창, 취향 배너, 회원에게만 보이는 "{이름}님의 팝업 PICK", 지금 인기 있는 팝업, 지금 뜨고 있는 지역 칩이다. 인기 팝업과 지역 칩은 회원과 비회원에게 같다. 검색창은 탐색과 같은 입력칸(`shared/components/PopupSearchForm`)이다. 엔터를 누르면 그 검색어로 탐색 목록(`/explore?view=list&q=`)이 열리고 검색어가 비었으면 검색어 없는 목록이 열린다. 팀 위키 9/28 결정(D73)과 기능 명세의 탐색 목록 스티키를 따랐다. 취향 배너는 버튼 하나만 갈린다. 회원은 "AI POP PICK 시작하기"가 코스 조건 입력(`/planner/new`)으로, 비회원은 "나에게 맞는 팝업 찾기"가 `/onboarding/1`로 간다. 회원 버튼은 기능 명세의 "AI 코스 생성 버튼: 클릭 시 플래너 페이지로 이동"에 해당한다. 같은 문구의 플래너 홈 생성 배너가 조건 입력으로 가서 목적지를 맞췄다. 카드에 무엇이 놓이는지는 `docs/product/SPEC.md`의 AI 개인화 추천 코스 절이 정본이다.

**보장.**

- 홈 LCP는 p75 2.5초 이하다. 팝업 이미지가 붙으면 첫 PICK 카드 이미지가 LCP 요소다
- 회원의 PICK은 카드 셋을 가로 스크롤로 놓고 한 번에 한 장만 펼친다. 첫 카드가 펼쳐진 채 시작하고 다른 카드의 셰브론을 누르면 그 카드가 펼쳐지며 앞 카드가 접힌다. 펼친 카드의 셰브론을 다시 누르면 모두 접힌다. 3초마다 다음 카드로 넘어가고 마지막 다음은 첫 카드로 이어진다. 카드를 누르거나 끌고 있는 동안, 마우스가 카드 위에 있는 동안, 키보드 포커스가 안에 있는 동안, 탭이 숨겨진 동안에는 넘기지 않고 그 상태가 끝나면 3초 뒤 다음 카드로 넘어간다. 포커스는 `:focus-visible`일 때만 센다. Chrome은 마우스로 누른 링크와 버튼에도 포커스를 줘서 이 조건이 없으면 카드를 끌거나 셰브론을 누른 뒤에도 넘김이 멈춰 있다. 셰브론은 넘김을 멈추지 않는다. 계속 멈춰 있는 경우는 정지 버튼을 눌렀을 때와 움직임 줄이기 설정을 켰을 때 둘이다. 시안에 없는 정지 버튼은 평소에 보이지 않고 키보드 포커스가 오면 제목 줄에 나타난다. 버튼은 "멈추기"와 "다시 시작" 두 문구 중 긴 쪽의 폭을 늘 차지해 문구가 바뀌어도 옆 글자가 움직이지 않는다. 넘기는 동안에는 맨 앞에 온 카드가 펼쳐지고 정지 버튼으로 멈춘 뒤에는 사용자가 펼친 카드가 그대로다. 포커스가 들어온 카드는 보이는 자리로 스크롤한다. 자동 넘김은 `hooks/useCarouselAutoplay`가 Embla의 `scrollNext`로 한다
- 취향이 없는 회원에게는 랜덤 세 개를 보인다. 로그인한 사용자에게 PICK 자리가 비는 경우가 없다
- 인기 팝업은 상위 셋을 고정으로 보이고 전체보기를 누르면 탐색 목록이 인기순으로 열린다
- 추천이 준비되지 않았거나 실패해도 홈이 비지 않는다. 그 섹션이 인기 팝업으로 채워지고 제목과 한 줄 문구가 바뀌어 사용자가 추천이 아님을 안다
- 추천 이유는 두 줄을 넘지 않는다. 넘치면 두 줄에서 말줄임한다. 글자 수 상한은 백엔드와 맞춘다
- 섹션 셋(추천 또는 인기, 인기 지역, 배너)이 각자 로딩되고 하나의 실패가 다른 섹션을 막지 않는다

**설계를 가르는 질문.**

- 주도권은 클라이언트다. 요청 응답이다
- 추천 생성과 이유 문구는 백엔드 몫이다. 추천 기준은 PM이 정했고 AI가 그 위에서 돈다. FE는 결과를 그리기만 한다
- "준비 중"은 실패가 아니라 상태다. 임베딩이 끝나지 않은 사용자에게 서버가 `PREPARING`을 값으로 낸다. 취향이 없는 회원은 준비 중이 아니라 랜덤 셋을 받는다. 실패(`ApiError`)와 준비 중을 화면은 같은 축소 동작으로 다루지만 로그는 다르게 남긴다
- 축소 동작은 `~/.agents/rules/no-fallback.md`의 조건 셋을 채운다. `docs/product/SPEC.md`에 적혀 있고 화면에서 라벨로 구분되고 `[recommendation]` 로그가 남는다
- 백엔드 develop에 홈이 읽을 API가 아직 없다. 화면은 임시 데이터로 먼저 만들었고 없는 엔드포인트의 조회 함수와 `queryOptions`는 만들지 않았다. 출처가 정해지지 않은 값(일치율, 카드 배지 문구, 인기 한 줄 문구, 평점과 리뷰 수)은 `null`을 허용하고 값이 있을 때만 그린다. 임시 데이터에 시안 값을 넣어 지금 화면은 시안과 같다

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

`RecommendedPopupItem`(팝업과 추천 이유, 일치율, 카드 배지)과 `PopularPopupItem`(팝업과 인기 한 줄, 평점과 리뷰 수)은 `model/home-popup.ts`에 있다. 출처가 정해지지 않은 필드는 `null`을 허용한다. 아래는 추천 API가 열리면 만드는 설계다.

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

`PopupSummary`는 `shared/model/popup.ts`에 있고 필드는 `popup.md`가 갖는다. 인기 행 셋째 줄의 입장 방식은 같은 파일의 짧은 라벨(`RESERVATION_SHORT_LABELS`)이다. 시안의 지역 칩에는 개수가 없다. `resolveSectionMode`는 분기 있는 순수 함수라 `testing-trophy.md`의 값이 나는 자리다.

## I. Interface

**컴포넌트.** 전부 `features/recommendation/components`에 있다. 데이터는 props로 받고 라우트가 `features/recommendation/model/placeholder-home.ts`의 임시 데이터를 넘긴다.

| 컴포넌트              | 계약                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `HomeHeader`          | 워드마크가 페이지 `<h1>`이고 alt는 POP PICK. 그 아래 `HomeSearch`가 검색어를 받아 `buildExploreSearchPath`로 탐색 목록에 간다 |
| `TasteBanner`         | `audience`가 `member`면 "AI POP PICK 시작하기"가 `/planner/new`, `guest`면 "나에게 맞는 팝업 찾기"가 `/onboarding/1` 링크     |
| `PickSection`         | 닉네임과 `RecommendedPopupItem[]`을 받는다. 펼친 카드와 자동 넘김을 갖는다                                                    |
| `PickCard`            | 펼쳤을 때만 설명과 일치율을 그린다                                                                                            |
| `OnImageBadge`        | 이미지 위 반투명 배지. 카테고리와 `badge` 문구                                                                                |
| `PickSectionSkeleton` | `restoring`에서 PICK 자리를 지킨다                                                                                            |
| `PopularSection`      | 전체보기가 탐색 목록 인기순. 인기순이 탐색의 기본 정렬이라 주소에 `sort`가 붙지 않는다                                        |
| `PopularPopupRow`     | 72px 썸네일과 세 줄. 행 전체가 상세 링크                                                                                      |
| `TrendingRegions`     | 칩이 `/explore?view=list&region=`                                                                                             |

PICK 카드와 인기 행은 시안에서 탐색 카드와 모양이 달라 이 기능 안에 있다. 배너는 인증 상태를 모르고 라우트가 `AuthStatusSwitch`의 칸마다 `audience`를 골라 넣는다. 세션을 확인하는 동안(`restoring`)과 확인하지 못했을 때(`unavailable`)는 세션 쿠키가 있으면 회원 배너, 없으면 비회원 배너다. 비회원 배너를 누르면 `proxy.ts`가 `/login?next=/onboarding/1`로 보내고 로그인이 끝나면 온보딩 1단계로 온다.

**서버 API.** 전부 백엔드 요구다.

| 메서드와 경로                              | 인증 | 응답                         | 상태             |
| ------------------------------------------ | ---- | ---------------------------- | ---------------- |
| `GET /api/v1/recommendations?limit=10`     | 필요 | `RecommendationResult`       | 요구             |
| `GET /api/v1/popups?sort=popular&limit=10` | 선택 | `PageResponse<PopupSummary>` | 요구(`popup.md`) |
| `GET /api/v1/regions/summary`              | 없음 | `RegionSummary[]`            | 요구             |

"인기"는 최근 7일간 팝업 상세 페이지 조회수 내림차순이다. 외부에서 받는 값이 아니라 우리가 집계한다. 집계와 정렬은 백엔드가 맡고 FE는 `sort=popular`를 넘긴다.

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
- 추천과 인기 응답의 카테고리와 지역이 ID(`interestCategoryId`, `areaId`)로 오는지 코드 문자열로 오는지 정해지지 않았다. 카드 배지와 지역 칩 링크가 코드를 쓰므로 ID로 오면 바꾸는 곳을 정한다(`popup.md`의 상세 API 절)
- PICK 카드의 일치율 출처 필드가 없다. 추천 응답에 회원별 일치율이 실리는지 백엔드와 정한다. 상세의 일치율 줄도 같은 값을 쓴다
- 백엔드 `feature/18` 브랜치(develop 머지 전)에 홈 인기 API `GET /api/v1/popups/popular`가 있다. 토큰 없이 부르고 최대 셋을 준다. 한 건은 탐색 목록 한 건과 같은 모양이라(`popup.md`의 옮길 것 절) `PopularPopupItem`의 인기 한 줄과 평점, 리뷰 수가 없다. 순서는 목록의 `popular`와 같고 SPEC의 최근 7일 기준과 다르다. 비회원 홈과 축소 동작은 위 표대로 `limit=10` 목록 쿼리의 캐시를 같이 쓰는 설계인데 이 API로 바꿀지도 이때 정한다

**운영.** 추천 이유의 글자 수 상한을 백엔드와 정하면 카드의 줄 수 제한은 그대로 두고 상한만 문서에 적는다. 두 줄 말줄임은 상한과 무관하게 남는다.
