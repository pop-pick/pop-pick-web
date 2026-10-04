# 홈 추천 설계

`features/recommendation`. 홈의 헤더와 검색창, 취향 배너, 회원의 팝업 PICK, 인기 팝업, 섹션마다의 실패 안내를 다룬다. 홈 화면 자체는 `src/app/page.tsx`(`/`)가 이 기능과 `auth`의 인증 슬롯을 조립한다.

## R. Requirements

**기능.** 홈은 위에서부터 헤더(워드마크), 검색창, 취향 배너, 회원에게만 보이는 "{이름}님의 팝업 PICK", 지금 인기 있는 팝업이다. 인기 팝업은 회원과 비회원에게 같다. 시안의 "지금 뜨고 있는 지역" 칩은 백엔드에 지역 요약이 없어 내렸다. 검색창은 탐색과 같은 입력칸(`shared/components/PopupSearchForm`)이다. 엔터를 누르면 그 검색어로 탐색 목록(`/explore?view=list&q=`)이 열리고 검색어가 비었으면 검색어 없는 목록이 열린다. 팀 위키 9/28 결정(D73)과 기능 명세의 탐색 목록 스티키를 따랐다. 취향 배너는 버튼 하나만 갈린다. 회원은 "AI POP PICK 시작하기"가 코스 조건 입력(`/planner/new`)으로, 비회원은 "나에게 맞는 팝업 찾기"가 `/onboarding/1`로 간다. 회원 버튼은 기능 명세의 "AI 코스 생성 버튼: 클릭 시 플래너 페이지로 이동"에 해당한다. 플래너 홈 생성 배너("나만의 코스 만들기")도 조건 입력으로 가서 목적지를 맞췄다. 카드에 무엇이 놓이는지는 `docs/product/SPEC.md`의 AI 개인화 추천 코스 절이 정본이다.

**데이터.** 인기 팝업은 `GET /api/v1/popups/popular`, 회원 PICK은 `GET /api/v1/popups/recommended`가 준다. 둘 다 최대 세 건이다. 인기는 누적 조회수 내림차순이고 기간 조건이 없다. 추천은 회원이 고른 관심 카테고리나 선호 지역이 같은 팝업을 인기순으로 주고 모자라면 인기 팝업으로 채운다. 그래서 취향이 없는 회원도 빈 PICK을 받지 않고 SPEC의 랜덤 셋 대신 인기 팝업을 받는다. 응답에 닉네임과 추천 이유, 취향 일치율, 시작일이 없어 제목은 "회원님의 팝업 PICK"이고 카드는 펼치지 않으며 기간은 종료일만 보인다.

**보장.**

- 홈 LCP는 p75 2.5초 이하다. 팝업 이미지가 붙으면 첫 PICK 카드 이미지가 LCP 요소다
- 회원의 PICK은 카드 셋을 가로 스크롤로 놓고 한 번에 한 장만 펼친다. 첫 카드가 펼쳐진 채 시작하고 다른 카드의 셰브론을 누르면 그 카드가 펼쳐지며 앞 카드가 접힌다. 펼친 카드의 셰브론을 다시 누르면 모두 접힌다. 3초마다 다음 카드로 넘어가고 마지막 다음은 첫 카드로 이어진다. 카드를 누르거나 끌고 있는 동안, 마우스가 카드 위에 있는 동안, 키보드 포커스가 안에 있는 동안, 탭이 숨겨진 동안에는 넘기지 않고 그 상태가 끝나면 3초 뒤 다음 카드로 넘어간다. 포커스는 `:focus-visible`일 때만 센다. Chrome은 마우스로 누른 링크와 버튼에도 포커스를 줘서 이 조건이 없으면 카드를 끌거나 셰브론을 누른 뒤에도 넘김이 멈춰 있다. 셰브론은 넘김을 멈추지 않는다. 계속 멈춰 있는 경우는 정지 버튼을 눌렀을 때와 움직임 줄이기 설정을 켰을 때 둘이다. 시안에 없는 정지 버튼은 평소에 보이지 않고 키보드 포커스가 오면 제목 줄에 나타난다. 버튼은 "멈추기"와 "다시 시작" 두 문구 중 긴 쪽의 폭을 늘 차지해 문구가 바뀌어도 옆 글자가 움직이지 않는다. 넘기는 동안에는 맨 앞에 온 카드가 펼쳐지고 정지 버튼으로 멈춘 뒤에는 사용자가 펼친 카드가 그대로다. 포커스가 들어온 카드는 보이는 자리로 스크롤한다. 자동 넘김은 `hooks/useCarouselAutoplay`가 Embla의 `scrollNext`로 한다
- 취향이 없는 회원도 서버가 인기 팝업으로 채워 PICK을 받는다. 비어 오는 경우는 등록된 팝업이 없을 때뿐이다
- 인기 팝업은 상위 셋을 고정으로 보이고 전체보기를 누르면 탐색 목록이 `/explore?view=list`로 열린다. 탐색 기본 정렬이 인기순이라 같은 순서의 더 긴 목록이다
- PICK이 실패하면 섹션 안에 실패 안내와 다시 시도를 보이고 결과가 없으면 결과 없음 안내를 보인다. 서버가 추천을 인기 팝업으로 채워 주므로 프론트에는 추천을 인기로 바꿔 그리는 축소 동작이 없다
- 추천 이유는 두 줄을 넘지 않는다. 넘치면 두 줄에서 말줄임한다. 지금 응답에 이유가 없어 `reason` 슬롯은 값이 올 때를 위해 남겨 둔 것이다. 글자 수 상한은 백엔드와 맞춘다
- 섹션 둘(PICK, 인기 팝업)이 각자 로딩되고 하나의 실패가 다른 섹션을 막지 않는다. 배너는 정적이다

**설계를 가르는 질문.**

- 주도권은 클라이언트다. 요청 응답이다
- 추천 생성과 이유 문구는 백엔드 몫이다. 추천 기준은 PM이 정했고 AI가 그 위에서 돈다. FE는 결과를 그리기만 한다
- 추천 이유와 일치율, 평점과 리뷰 수, 닉네임, "오늘 오픈"과 "실시간 인기 1위" 같은 한 줄 문구는 백엔드 응답에 없어 그리지 않는다. 추천 이유가 없으면 PICK 카드에 셰브론과 펼침 영역이 없다. 평점과 리뷰, 인기 한 줄을 담던 모델과 늘 `null`이던 닉네임 인자는 걷어냈다
- 인기 팝업은 공개 API라 서버가 받아 첫 HTML에 넣는다. 서버 조회에는 토큰이 없어 `wished`가 `false`지만 홈 인기 행은 찜 표시를 그리지 않는다. 회원이 홈을 열면 브라우저 쿼리가 토큰을 실어 같은 키로 다시 받을 수 있다

**범위 밖.** 추천 새로 고침 버튼, 추천 결과 저장, 카드 단위 "관심 없음" 피드백, 홈 카드의 찜 버튼(시안에 없다).

## A. Architecture

| 상태                      | 원천                                     | 비고                                                           |
| ------------------------- | ---------------------------------------- | -------------------------------------------------------------- |
| 추천 결과                 | Server. `["recommendations", "home"]`    | 로그인 상태일 때만. `staleTime` 5분. `GET /popups/recommended` |
| 인기 팝업                 | Server. `["recommendations", "popular"]` | 공개. 토큰 없이 부른다. `GET /popups/popular`                  |
| PICK 자리에 무엇을 그리나 | Derived. 인증 상태와 세션 쿠키 유무      | 아래 표                                                        |
| 펼친 PICK 카드            | `PickSection`의 `useState`               | 공유와 새로고침 복원이 필요 없다                               |

**PICK 자리.** 라우트 파일은 서버 컴포넌트라 인증 상태를 읽지 못한다. 그래서 인증 상태마다 그릴 것을 `features/auth`의 `AuthStatusSwitch`에 슬롯으로 넘긴다. 슬롯 방식은 `ARCHITECTURE.md`의 폴더 구조 절에 있다.

| 인증 상태       | PICK 자리                                                                        |
| --------------- | -------------------------------------------------------------------------------- |
| `authenticated` | `HomePickSection`                                                                | PICK 쿼리를 부르고 로딩과 정상, 실패, 결과 없음 넷을 그린다. 제목은 `model/home-format.ts`의 `PICK_TITLE`("회원님의 팝업 PICK")이다 |
| `anonymous`     | 없음                                                                             |
| `restoring`     | 리프레시 토큰 쿠키가 있으면 `PickSectionSkeleton`, 없으면 없음                   |
| `unavailable`   | 쿠키가 있으면 `auth`의 `SessionRetry`(로그인 확인 실패와 다시 시도), 없으면 없음 |

서버 렌더와 하이드레이션 첫 렌더에서 인증 상태는 항상 `restoring`이다. 라우트가 `readRefreshToken`으로 쿠키가 있는지만 보고 슬롯을 고르므로 로그인한 사용자는 재발급이 끝날 때 뼈대가 PICK으로 바뀌고 아래 섹션이 밀리지 않는다. 쿠키를 읽기 때문에 `/`는 요청마다 렌더된다. 쿠키는 있는데 세션이 죽었으면 뼈대가 사라지며 아래 섹션이 올라온다. PICK 쿼리는 `authenticated` 칸의 `HomePickSection`이 클라이언트에서 부르므로 토큰이 붙는다.

통신은 요청 응답 둘이다.

**섹션 상태.** `HomePickSection`은 로딩이면 `PickSectionSkeleton`, 카드가 있으면 `PickSection`을 그린다. 실패하면 "회원님의 팝업 PICK" 제목 아래 실패 안내("추천 팝업을 불러오지 못했어요."와 다시 시도)를, 비었으면 "지금 추천할 팝업이 없어요." 안내를 그린다. `PopularSection`은 제목과 전체보기를 늘 보이고 아래가 로딩 뼈대(행 셋), 실패와 다시 시도("인기 팝업을 불러오지 못했어요."), 결과 없음("아직 등록된 팝업이 없어요."), 목록 넷으로 갈린다.

## D. Data Model

`RecommendedPopupItem`(팝업과 추천 이유)은 `model/recommended-popup.ts`에 있고 `reason`은 늘 `null`이다. 인기 팝업은 `PopupSummary` 배열 그대로다. 두 응답 모두 `PopupListItemResponse[]`이고 `toPopupSummary`가 queryFn 안에서 바꿔 캐시에 둔다. 찜 토글의 캐시 패치가 `{ popup }` 안의 `id`와 `isBookmarked`를 찾기 때문이다. 쿼리 키가 루트 `recommendations` 아래에 있어야 패치가 닿는다. 기간 줄은 `formatPopupPeriod`가 시작일이 없으면 "~ 10.26"처럼 종료일만 만든다.

`PopupSummary`는 `shared/model/popup.ts`에 있고 필드는 `popup.md`가 갖는다. 인기 행은 제목과 지역(`areaName`), 입장 방식 세 줄이고 입장 방식은 같은 파일의 짧은 라벨(`RESERVATION_SHORT_LABELS`)이다.

## I. Interface

**컴포넌트.** 전부 `features/recommendation/components`에 있다. PICK은 `HomePickSection`이, 인기 팝업은 `PopularSection`이 쿼리를 직접 부르는 클라이언트 컴포넌트다. 인기 팝업은 공개 데이터라 서버 컴포넌트 `HomePopularSection`이 먼저 받아(`prefetchQuery`) `HydrationBoundary`로 넘긴다. 라우트가 이것을 `Suspense`로 감싸 홈 첫 응답은 기다리지 않고, 인기 팝업이 받아지면 같은 응답 안에서 목록이 그려져 온다. 받는 동안의 자리 `PopularSectionSkeleton`은 쿼리를 부르지 않는다. 같은 쿼리를 미리 만들면 `HydrationBoundary`가 서버 렌더에서 데이터를 채우지 않고 뼈대를 그린다. 서버 조회가 실패하면 데이터 없이 넘기고 브라우저 쿼리가 다시 받아 실패 화면을 그린다. `queryOptions` 둘은 엔드포인트마다 파일이 하나다. `recommendedPopupsQueryOptions`는 `api/get-recommended-popups.ts`, `popularPopupsQueryOptions`는 `api/get-popular-popups.ts`에 있다. 서버 조회 실패는 `console.warn`으로 남긴다. 두 섹션의 실패 안내는 공용 `shared/components/LoadFailure`를 `role="alert"`로 감싼 것이다.

| 컴포넌트               | 계약                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `HomeHeader`           | 워드마크가 페이지 `<h1>`이고 alt는 POP PICK. 그 아래 `HomeSearch`가 검색어를 받아 `buildExploreSearchPath`로 탐색 목록에 간다 |
| `TasteBanner`          | `audience`가 `member`면 "AI POP PICK 시작하기"가 `/planner/new`, `guest`면 "나에게 맞는 팝업 찾기"가 `/onboarding/1` 링크     |
| `HomePickSection`      | PICK 쿼리를 부르고 로딩과 정상, 실패, 결과 없음 넷을 그린다                                                                   |
| `PickSection`          | `RecommendedPopupItem[]`을 받는다. 펼친 카드와 자동 넘김을 갖는다                                                             |
| `PickCard`             | 이미지 위에 카테고리 배지와 지역(`areaName`) 배지, 아래에 제목과 기간. 추천 이유가 `null`이면 셰브론과 펼침 영역이 없다       |
| `ImageOverlayBadge`    | 이미지 위 반투명 배지. 카테고리와 지역 이름. 카테고리가 없어도 지역 배지는 오른쪽에 붙는다                                    |
| `PickSectionSkeleton`  | `restoring`과 PICK 로딩 중에 카드 높이의 뼈대를 그린다. 아래 섹션이 밀리지 않는다                                             |
| `HomePopularSection`   | 서버 컴포넌트. 인기 팝업을 받아 `HydrationBoundary`로 `PopularSection`에 넘긴다                                               |
| `PopularSection`       | 인기 쿼리를 부른다. 머리글 `PopularSectionHeader`와 뼈대 `PopularRowsSkeleton`을 `PopularSectionSkeleton`과 같이 쓴다         |
| `PopularSectionHeader` | 제목과 전체보기. 전체보기는 `buildExploreListPath()`로 탐색 목록(`/explore?view=list`)                                        |
| `PopularPopupRow`      | 72px 썸네일과 세 줄. 행 전체가 상세 링크                                                                                      |

PICK 카드와 인기 행은 시안에서 탐색 카드와 모양이 달라 이 기능 안에 있다. 배너는 인증 상태를 모르고 라우트가 `AuthStatusSwitch`의 칸마다 `audience`를 골라 넣는다. 세션을 확인하는 동안(`restoring`)과 확인하지 못했을 때(`unavailable`)는 세션 쿠키가 있으면 회원 배너, 없으면 비회원 배너다. 비회원 배너를 누르면 `proxy.ts`가 `/login?next=/onboarding/1`로 보내고 로그인이 끝나면 온보딩 1단계로 온다.

**서버 API.**

| 메서드와 경로                    | 인증 | 응답                                | 비고                                                                                                            |
| -------------------------------- | ---- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `GET /api/v1/popups/popular`     | 선택 | `PopupListItemResponse[]`, 최대 3건 | 토큰을 보내면 `wished`가 채워지지만 인기 행이 찜을 그리지 않아 토큰 없이 부른다. 인기 기준은 누적 `viewCount`다 |
| `GET /api/v1/popups/recommended` | 필요 | `PopupListItemResponse[]`, 최대 3건 | 비회원은 401 `E1000`. 화면은 `AuthStatusSwitch`가 인증 상태에서만 그려 비회원은 부르지 않는다                   |

FigJam은 인기를 최근 7일 조회수로 적었지만 백엔드는 기간 조건 없이 누적 조회수로 센다. 토큰이 만료되어 `E1004`가 오면 `api` 클라이언트가 재발급해 다시 시도하고 그래도 `E1000`이면 PICK 실패 안내를 그린다. 시안의 취향 일치율과 추천 이유, 평점은 응답에 없다. 백엔드 요청은 `ARCHITECTURE.md`의 백엔드 요구 목록에 있다.

**로그.** `[recommendation]` 접두사. PICK과 인기 팝업 조회 실패를 `console.error`로 남긴다.

**접근성.** 섹션마다 `<section aria-labelledby>`와 `<h2>`다. 축소 동작의 라벨 문구는 `<h2>` 아래 `<p>`로 두어 스크린리더가 제목 다음에 읽는다. PICK 목록과 인기 목록은 `<ul>`이고 PICK 카드는 `<li>` 안 `<article>`이다. 카드 제목이 상세로 가는 링크이고 링크의 `::after`가 카드 전체를 덮는다. 셰브론은 링크의 형제 버튼이라 링크 안에 버튼이 없고 `aria-expanded`와 `aria-controls`를 가진다. 셰브론을 눌러도 상세로 가지 않는다. `PickSectionSkeleton`은 `role="status"`와 화면에 보이지 않는 "추천 팝업을 불러오는 중입니다" 문구를 가진다. 인기 팝업 로딩 뼈대는 `role="status"`와 "인기 팝업을 불러오는 중입니다"다. 섹션 실패 안내는 `role="alert"`로 감싼다.

## O. Optimization과 운영

**렌더링.** 홈(`/`)은 세션 쿠키를 읽어 PICK 자리를 고르므로 요청마다 서버에서 그린다. 인기 팝업은 그 서버 렌더에 실려 첫 HTML에 목록이 있다. PICK은 토큰이 필요해 브라우저에서 받는다. PICK 목록은 Embla 캐러셀(`embla-carousel-react`)이다. 터치와 마우스 끌기 모두 카드 한 장 단위로 멈추고, 카드 안으로 키보드 포커스가 들어가면 그 카드로 넘어간다. 화면 밖 카드에 포커스가 가면 브라우저가 `overflow-hidden` 뷰포트의 `scrollLeft`를 밀어 카드가 어긋나서 `scrollLeft`를 0으로 되돌린 뒤 `scrollTo`한다. `motion`으로 끌기를 만들면 `drag`가 든 기능 묶음을 더 실어야 해서 쓰지 않았다. 사진은 `PopupImage`가 고정 크기 칸에 `next/image`로 그려 CLS가 없고, 첫 카드만 `loading="eager"`이다(`popup.md`의 이미지 절).

**장애.** PICK과 인기 팝업은 각자 섹션 안에서 실패를 보이고 다시 시도로 회복한다. 배너는 정적이라 실패가 없다. 홈은 요청마다 서버에서 그리고 클라이언트 이동의 동적 라우트 캐시가 기본 0이라 다른 탭에서 홈으로 돌아오면 인기 뼈대가 다시 보일 수 있다. 서버 prefetch를 걷거나 `revalidate`를 주면 줄지만 후자는 `api.md`의 서버 캐시 없음 전제를 먼저 바꿔야 한다.

**재시도.** 추천 쿼리만 `staleTime`을 5분으로 올린다. 취향이 바뀌지 않는 한 결과가 같고 홈을 오갈 때마다 AI 호출이 나가면 비용이 든다. 온보딩을 저장하면 이 키(`["recommendations", "home"]`)를 무효화해 새 취향으로 다시 받는다(`onboarding.md`).

**지표.** PICK이 인기 팝업으로 채워진 비율은 응답에서 구분할 수 없어 재지 못한다. 취향 일치 팝업이 모자란 회원이 많은지는 백엔드가 센다.

**백엔드가 더 주면 붙일 것.**

- 추천 응답에 `startDate`와 추천 이유, 취향 일치율이 실리면 `RecommendedPopupItem.reason`을 채우고 PICK 카드의 기간과 펼침 영역, 일치율 줄을 그린다
- 내 정보 API가 닉네임을 주면 `PICK_TITLE`을 "{이름}님의 팝업 PICK"으로 바꾼다
- 인기 응답에 `viewCount`가 실리면 인기 행에 조회수를 그린다. 시안과 FigJam에 조회수 노출이 있는지는 기획 확인이 필요하다
- 지역 요약 API가 생기면 지역 칩을 다시 놓는다. 칩이 `/explore?view=list&area=`로 가므로 지역 id를 쓴다

**운영.** 추천 이유의 글자 수 상한을 백엔드와 정하면 카드의 줄 수 제한은 그대로 두고 상한만 문서에 적는다. 두 줄 말줄임은 상한과 무관하게 남는다.
