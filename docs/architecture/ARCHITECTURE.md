# 팝픽 프론트엔드 구조

화면을 코드보다 먼저 설계한 문서다. 라우트 트리와 상태의 원천, 데이터 흐름, 폴더 구조, 인증 세션처럼 기능 하나에 가두기 어려운 것을 여기 적고 기능별 보장과 데이터 모델, 계약은 같은 폴더의 기능 문서에 적는다.

## 기준선

화면과 기능의 정본은 PM이 관리하는 기획 피그잼 보드다. 화면 구조와 문구는 보드의 화면을, 동작 규칙은 화면마다 붙은 명세 스티키를 따른다. 스티키는 메인과 로그인, 온보딩 세 단계, 홈, 탐색 지도까지 붙었고 팝업 상세와 플래너, 마이페이지는 아직 없다. 스티키가 없는 화면은 앞서 받은 와이어프레임과 기능 명세서를 기준으로 둔다.

화면에는 데이터를 받을 경로가 없는 요소가 몇 남아 있다. 연계 카페와 제휴 할인, 방문 후기 탭과 평점, 대기시간 예상이다. 이들은 화면 자리를 두되 데이터 모델에서 `null`을 허용하고 값이 `null`이면 그리지 않는다. 서버가 "없음"을 보낸 것이라 실패를 감추는 것이 아니다. 어느 결정에 걸려 있는지는 미결정 의존 절에 있다.

수료 심사가 운영진에 제출한 기능 구현 계획과 결과물을 대조한다. 제출문과 달라진 자리는 둘이다. 온보딩에서 성별을 받지 않고 동행 유형을 받는다. 팝업 상세의 하단 액션이 예약 버튼이 아니라 찜과 공유하기, 코스 추천받기 셋이고 예약 링크는 `reservationUrl`이 있을 때 정보 영역에 외부 링크로 놓인다.

## 화면과 라우트

하단 탭바는 모든 화면에 붙는다. 노출 조건 분기가 없어 루트 레이아웃이 탭바를 그린다. **지금 코드는 라우트 그룹 `(flow)`와 `(tabs)`로 노출을 가르고 있고 탭바가 넷에만 붙는다.** 이 결정을 반영하면 그룹 둘이 없어진다. 반응형 범위는 `docs/design/DESIGN.md`에 있다.

```
src/app/
├── layout.tsx                          루트. QueryProvider와 고정 폭 컬럼, 하단 탭바. AuthProvider는 설계
├── page.tsx                            /                         랜딩(메인)
├── error.tsx                           라우트 오류 경계
├── not-found.tsx
├── api/auth/                           설계. 세션 쿠키를 굽고 지운다
│   ├── session/route.ts                POST 로그인, DELETE 로그아웃
│   └── refresh/route.ts                POST 재발급
├── onboarding/[step]/page.tsx          /onboarding/1, 2, 3       온보딩 세 단계
├── onboarding/result/page.tsx          /onboarding/result        추천 미리보기(존치 미결정)
├── login/page.tsx                      /login?next=              로그인
├── login/complete/page.tsx             /login/complete?next=     로그인 완료(설계)
├── auth/kakao/callback/page.tsx
├── auth/google/callback/page.tsx       설계. 구글 클라이언트 ID가 오면 만든다
├── home/page.tsx                       /home                     회원 홈과 비회원 홈
├── explore/page.tsx                    /explore?view=&q=&sort=
├── explore/@modal/(..)popups/[popupId]/page.tsx  설계. 지도에서 연 상세를 레이어로 가로챈다
├── popups/[popupId]/page.tsx           /popups/{id}?tab=         팝업 상세(전체 화면)
├── planner/page.tsx                    /planner?tab=             내 일정
├── planner/new/page.tsx                /planner/new?anchor=      코스 조건 입력
├── planner/generating/[jobId]/page.tsx /planner/generating/{jobId}  코스 생성 중
├── courses/[courseId]/page.tsx         /courses/{id}             코스 결과
├── courses/[courseId]/saved/page.tsx   /courses/{id}/saved       캘린더 저장 완료
└── my/page.tsx                         /my?tab=                  마이페이지
```

**지금 코드와 다른 자리가 넷이다.** 라우트 그룹 `(flow)`와 `(tabs)`가 아직 있고, `/planner`가 조건 입력이며, `/login/complete`와 `api/auth`, 상세 인터셉트 라우트가 없다. 화면은 랜딩과 로그인, 홈, 탐색, 마이페이지에 내용이 있고 나머지는 `ScreenPlaceholder`로 자리만 있다.

팝업 상세는 껍데기가 둘이다. 홈과 검색 결과에서 누르면 페이지로 이동하고 탐색 지도의 팝업 카드에서 누르면 레이어로 뜬다. 지도에서 페이지로 나가면 보던 지도로 돌아오지 못하기 때문이다. 본문 컴포넌트는 하나이고 두 껍데기가 그것을 감싼다. Next의 인터셉트 라우트가 이 구조에 그대로 맞는다. `explore` 아래 `@modal` 슬롯이 `(..)popups/[popupId]`로 형제 경로를 가로채고 새로고침하면 가로채지 않아 전체 화면 상세가 열린다.

| 경로                          | 화면             | 로그인    | 데이터를 받는 곳                                                | 기능 문서           |
| ----------------------------- | ---------------- | --------- | --------------------------------------------------------------- | ------------------- |
| `/`                           | 랜딩             | 아니오    | 없음. 정적                                                      | `onboarding.md`     |
| `/onboarding/[step]`          | 온보딩 1, 2, 3   | 예        | 서버                                                            | `onboarding.md`     |
| `/login`                      | 로그인           | 아니오    | 없음                                                            | `auth.md`           |
| `/login/complete`             | 로그인 완료      | 예        | 없음. 정적                                                      | `auth.md`           |
| `/auth/{provider}/callback`   | 콜백             | 아니오    | 클라이언트 쿼리                                                 | `auth.md`           |
| `/home`                       | 홈               | 아니오    | 클라이언트 쿼리. 로그인 여부로 분기                             | `recommendation.md` |
| `/explore`                    | 탐색 지도와 목록 | 아니오    | 클라이언트 쿼리. 검색어와 정렬은 URL                            | `popup.md`          |
| `/popups/[popupId]`           | 팝업 상세        | 아니오    | 서버 컴포넌트가 첫 데이터와 메타 태그, 나머지는 클라이언트 쿼리 | `popup.md`          |
| `/planner`                    | 내 일정          | 예        | 클라이언트 쿼리. 탭은 URL                                       | `course.md`         |
| `/planner/new`                | 조건 입력        | 만들기 때 | 폼                                                              | `planner.md`        |
| `/planner/generating/[jobId]` | 생성 중          | 예        | 클라이언트 폴링                                                 | `planner.md`        |
| `/courses/[courseId]`         | 코스 결과        | 예        | 클라이언트 쿼리 둘(코스, 구간)                                  | `course.md`         |
| `/courses/[courseId]/saved`   | 저장 완료        | 예        | 클라이언트 쿼리                                                 | `course.md`         |
| `/my`                         | 마이페이지       | 예        | 클라이언트 쿼리. 탭은 URL                                       | `bookmark.md`       |

저장한 코스는 마이페이지가 아니라 플래너에 있다. 플래너에 들어왔을 때 자기 일정이 먼저 보이는 편이 낫다는 판단이다. 탭은 다가오는 일정과 지난 일정, 취소된 일정 셋이고 일정이 없으면 코스 만들기로 가는 자리가 뜬다. 마이페이지는 찜한 팝업과 최근 본 팝업 둘이다.

로그인 필요 화면과 동작은 클라이언트에서 막는다. 리프레시 토큰 쿠키의 `Path`가 `/`라 서버가 로그인 여부를 볼 수는 있지만 `proxy.ts`로 옮기는 것은 지금 하지 않는다. 비로그인 사용자가 찜이나 코스 만들기를 누르면 그 시점에 `/login?next={돌아올 경로}`로 보낸다. 로그인 뒤 `next`로 돌아온다.

서버 컴포넌트가 백엔드를 직접 부르는 자리는 상세 하나다. 공유 링크의 메타 태그(제목, 대표 이미지, 기간)를 서버에서 채워야 하고 상세 조회가 인증 없는 공개 API라서 가능하다. 그 밖의 화면은 개인화나 URL 필터에 묶여 있어 클라이언트 쿼리로 통일한다. 서버 컴포넌트는 인증이 필요한 API를 부르지 않는다. 토큰이 서버에 없다.

## 상태의 원천

같은 값을 두 곳에 두지 않는다. 화면에 보이는 값마다 원천이 하나다.

| 분류          | 원천                        | 값                                                                                                            |
| ------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Server State  | 백엔드. TanStack Query 캐시 | 팝업 목록과 상세, 추천 결과, 찜 목록, 코스와 구간 소요시간, 코스 작업 상태, 내 정보, 지역 요약, 온보딩 선택지 |
| URL State     | 주소창                      | 탐색의 뷰와 검색어와 정렬, 상세의 탭, 플래너와 마이페이지의 탭, 온보딩 단계, 로그인 뒤 돌아갈 경로            |
| Local State   | Zustand 스토어              | 온보딩 입력 중인 답. 마치면 서버에 저장하고 비운다                                                            |
| Local State   | Zustand 스토어(메모리)      | 액세스 토큰과 인증 상태. 리프레시 토큰은 스토어에 없다                                                        |
| Local State   | httpOnly 쿠키               | 리프레시 토큰. Route Handler만 읽고 쓴다. 화면 코드가 값을 보지 못한다                                        |
| Local State   | 미결정                      | 최근 본 팝업 다섯. 메모리인지 `sessionStorage`인지 정해지지 않았다                                            |
| Local State   | 컴포넌트 `useState`         | 바텀시트 열림, 선택된 마커, 이미지 갤러리 위치, 폼 입력 중인 값(react-hook-form)                              |
| Derived State | 다른 상태의 계산            | 팝업의 진행 중과 종료 임박과 종료, 코스의 총 도보 시간, 온보딩 추천받기 버튼 활성 여부, 도착 시각 라벨        |

찜은 낙관적 갱신이 아니다. 기획이 찜과 해제에 확인 알럿을 두기로 해서 사용자가 확인을 누른 뒤 요청이 나가고 응답이 와야 하트가 바뀐다. 자세한 것은 `bookmark.md`에 있다.

최근 본 팝업은 서버에 이력을 쌓지 않고 프론트가 들고 있다. 최신 다섯이고 하나를 더 보면 제일 오래된 것이 밀려난다. 기록하는 곳은 팝업 상세이고 보여주는 곳은 마이페이지다.

플래너에 팝업을 담아 두는 스토어는 만들지 않는다. 조건을 입력해 코스를 통째로 받는 흐름이라 담기 단계가 없다. 상세의 "이 팝업으로 AI 코스 추천받기"는 `/planner/new?anchor={popupId}`로 조건 입력 화면에 팝업 하나를 미리 채우는 것으로 끝나고 이 값도 URL이다.

## 데이터 흐름

브라우저에서 나가는 요청은 전부 같은 출처로 간다. 두 갈래다. `/api/v1/...`는 `next.config.ts`의 rewrites가 백엔드로 넘기고 `/api/auth/...`는 Next의 Route Handler가 직접 받는다. 서버 컴포넌트는 `API_BASE_URL`로 백엔드를 직접 부른다. 어느 쪽이든 `src/shared/api`의 `request<T>`를 거치고 화면 코드는 응답 공통 구조를 모른다. 이 계약은 `.agents/rules/api.md`가 정본이고 프론트 쪽 구현은 `src/shared/api/types.ts`와 `errors.ts`다.

```
화면(클라이언트 컴포넌트)
  useQuery / useMutation      TanStack Query. 캐시와 로딩, 에러 상태
    features/{기능}/api/*.ts  엔드포인트 하나에 함수 하나. queryOptions로 키와 함께 내보낸다
      shared/api/request<T>   Bearer 부착, 재발급 한 번, 타임아웃, ApiError
        /api/v1/...           rewrites가 백엔드로
        /api/auth/...         Route Handler가 세션 쿠키를 다루고 백엔드를 부른다
```

rewrite는 `/api/v1/:path*`로 좁힌다. 백엔드 API가 전부 `/api/v1/**`이라 잃는 것이 없고 `/api/auth/**`와 경로가 겹치지 않는다. `/api` 아래 Route Handler를 정적 경로로만 만드는 이유는 `.agents/rules/api.md`의 실행 순서 절에 있다.

인증이 필요한 요청은 `request`가 Bearer를 붙이고 토큰 소스는 auth 기능이 등록한다. 만료 뒤 재발급과 로그인 화면으로 보내는 흐름은 `auth.md`에 있다.

읽기는 쿼리, 쓰기는 뮤테이션이다. 뮤테이션이 성공하면 관련 쿼리를 무효화한다. 캐시를 응답보다 먼저 바꾸는 자리는 없다. 서버 데이터를 스토어에 복제하지 않는다.

## 폴더 구조

`features/` 하위 폴더는 기능 하나에 하나이고 이름은 백엔드 `feature/{이름}` 패키지와 맞춘다. 지금 백엔드에는 `auth`와 `member`, `collection`(수집 파이프라인)만 있어 나머지 이름은 FE가 제안하고 백엔드가 사용자향 API 패키지를 만들 때 같은 이름을 쓰도록 요구 목록에 올린다.

일곱 중 `auth`와 `onboarding`, `popup`에 내용이 있고 나머지 넷은 폴더만 있다.

| 폴더                      | 담는 것                                                                     | 쓰는 화면                             |
| ------------------------- | --------------------------------------------------------------------------- | ------------------------------------- |
| `features/auth`           | 소셜 로그인 둘, 토큰 스토어, 재발급, 내 정보, 로그인 가드                   | 로그인, 콜백, 모든 보호 화면          |
| `features/onboarding`     | 랜딩, 온보딩 세 단계 폼, 취향 저장                                          | `/`, `/onboarding/*`                  |
| `features/recommendation` | 홈 추천 섹션, 인기 팝업 섹션, 지역 요약, 추천 실패 축소 동작                | `/home`                               |
| `features/popup`          | 탐색 지도와 목록, 검색과 정렬, 상세, 마커 카드, 최근 본 팝업 기록           | `/explore`, `/popups/[id]`            |
| `features/bookmark`       | 찜 버튼(확인 알럿), 찜 목록                                                 | 카드가 있는 모든 화면, `/my`          |
| `features/planner`        | 조건 입력 폼, 코스 생성 작업 시작과 폴링과 취소                             | `/planner/new`, `/planner/generating` |
| `features/course`         | 코스 결과(지도와 타임라인), 구간 소요시간, 내 일정 목록과 삭제, 캘린더 저장 | `/courses/*`, `/planner`              |

홈과 마이페이지처럼 여러 기능이 한 화면에 놓이는 자리는 `src/app`의 라우트 파일이 조립한다. 홈은 recommendation과 popup과 bookmark를, 마이페이지는 bookmark와 popup을 가져다 놓는다. 라우트 파일은 조립만 하고 로직을 갖지 않는다.

기능 폴더 안을 어떻게 나누는지는 `.agents/rules/structure.md`에 있다. MSW를 도입하면 기능마다 `api/handlers.ts`가 하나씩 더 생긴다.

여러 기능이 함께 쓰는 것은 `src/shared`에 둔다. `shared/model`과 `shared/lib/kakao-map`, `shared/ui`, `shared/api/auth-token.ts`는 있고 나머지 셋은 이 설계로 새로 생긴다.

| 위치                             | 담는 것                                                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/model/region.ts`         | 지역 유니온과 라벨 대응표. **선택지가 서버로 가면서 없어질 파일이다.** 지역 값과 라벨은 온보딩 선택지 조회에서 온다                               |
| `shared/model/popup.ts`          | 카테고리와 예약 유형, 라벨 대응표, 카드가 그리는 값 `PopupCardItem`. 카테고리 라벨도 서버 목록으로 옮겨가고 핀 아이콘 대응표만 코드에 남는다      |
| `shared/api/auth-token.ts`       | 액세스 토큰 소스 등록. auth 기능이 등록하고 `request`가 읽는다. 재발급이 붙으면 만료 이벤트가 더해진다                                            |
| `shared/api/schema.d.ts`         | Swagger `/v3/api-docs`에서 생성한 타입. 손으로 고치지 않는다                                                                                      |
| `shared/api/mocks/`              | MSW 브라우저 워커와 노드 서버 설정. 핸들러는 각 기능의 `api/handlers.ts`에서 모은다                                                               |
| `shared/hooks/useCursorQuery.ts` | `PageResponse<T>`를 받는 무한 스크롤 쿼리. 마지막 항목에서 커서를 뽑는 규칙을 한 곳에 둔다                                                        |
| `shared/lib/kakao-map`           | 마커와 마커 전체가 보이게 맞추기(`fitTo`)는 있다. 클러스터러와 카테고리 핀, 폴리라인, 번호 마커, 경로 좌표를 SDK 좌표로 옮기는 함수가 더 필요하다 |
| `shared/ui`                      | 화면 뼈대가 쓰는 열 개가 있다. 이 설계가 더 요구하는 것은 BottomSheet와 Tabs, Skeleton, ErrorState, ConfirmDialog                                 |

`shared/ui`에 무엇을 올릴지는 후보로 둔다. 두 화면 이상에서 쓰임이 확인된 것만 올리고 주인은 디자인 시스템 담당이다.

## 공통 계약

### 쿼리 키와 queryOptions

키는 그것을 쓰는 `queryOptions` 옆에 둔다. 키만 모으는 공용 파일을 만들지 않는다. 규칙과 그 이유는 `.agents/rules/api.md`의 기능의 api 폴더 절에 있다.

첫 조각은 기능 이름, 둘째는 종류, 셋째부터 식별자와 필터다. 무효화는 앞 조각을 그대로 적는다.

| 조회           | 키                                | 두는 곳                                                   |
| -------------- | --------------------------------- | --------------------------------------------------------- |
| 내 정보        | `["me"]`                          | `features/auth/api/get-me.ts`                             |
| 팝업 목록      | `["popups", "list", filters]`     | `features/popup/api/get-popups.ts`                        |
| 팝업 상세      | `["popups", "detail", popupId]`   | `features/popup/api/get-popup.ts`                         |
| 홈 추천        | `["recommendations", "home"]`     | `features/recommendation/api/get-home-recommendations.ts` |
| 지역 요약      | `["regions", "summary"]`          | `features/recommendation/api/get-region-summary.ts`       |
| 찜 목록        | `["bookmarks", "list"]`           | `features/bookmark/api/get-bookmarks.ts`                  |
| 코스 상세      | `["courses", "detail", courseId]` | `features/course/api/get-course.ts`                       |
| 구간 소요시간  | `["courses", "walks", courseId]`  | `features/course/api/get-course-walks.ts`                 |
| 코스 작업 상태 | `["courses", "job", jobId]`       | `features/planner/api/get-course-job.ts`                  |
| 저장한 코스    | `["courses", "list"]`             | `features/course/api/get-courses.ts`                      |

지금 코드에 있는 쿼리는 인가 코드 교환 하나다. 키는 `["auth", "kakao-login", code, state]`이고 `features/auth/hooks/useKakaoLogin.ts`에 있다. 조회가 아니라 일회용 코드를 한 번만 쓰기 위한 쿼리라 위 표에 넣지 않는다.

### 커서 페이지네이션

백엔드 `PageResponse<T>`는 `content`와 `hasNext`만 있고 다음 커서 값이 없다. `useCursorQuery`가 마지막 항목의 `id`를 다음 요청의 `cursor`로 쓴다. 한 페이지는 10건이고 백엔드 상한은 50건이다. 응답에 `nextCursor`를 실어 달라고 요구 목록에 올렸고 실리면 그 값을 우선한다.

### 재시도와 캐시 기본값

`QueryProvider`가 정한다. 4xx는 재시도하지 않고 브라우저에서 2회까지이며 `staleTime`은 30초다. 기능 문서는 이 기본과 다르게 두는 자리만 적는다.

### 실패의 표면

- 쿼리 실패는 그 섹션의 `ErrorState`로 보인다. 다시 시도 버튼이 `refetch`를 부른다
- 라우트 단위로 던져진 오류는 가장 가까운 `error.tsx`가 받는다. 루트에 하나 두고 코스 결과처럼 지도가 있는 화면은 자기 `error.tsx`를 둔다
- `ApiError.errorCode`로 문구를 가른다. `ApiError.message`는 로그용이라 화면에 그대로 내지 않는다
- 축소 동작은 SPEC에 적힌 둘뿐이다. 도보 소요시간을 못 받은 구간의 "소요시간 모름"과 추천이 준비되기 전이나 실패했을 때의 인기순 대체다. 둘 다 화면에서 구분되고 `console.warn` 로그를 남긴다

### 로그와 지표

수집 도구는 두지 않는다. `console.warn`과 `console.error`에 기능 이름을 대괄호로 묶은 접두사를 붙인다. 기능마다 무엇을 남기고 무엇을 세는지는 그 기능 문서의 로그 절과 지표 절이 갖는다. 기능에 속하지 않는 접두사는 둘이다. 카카오맵 SDK 로딩 실패가 `[kakao-map]`, 구간별 경로 조회 실패가 `[walk-route]`다.

지표는 이름만 정해 두고 도구를 붙일 때 다시 정하지 않는다. 0이 아니면 설계가 샌 것이라는 지표가 기능마다 하나씩 있다.

## 개발 의존성 전제

이 설계는 개발 의존성 둘을 전제한다. 설치는 별도로 묻는다.

**openapi-typescript.** Swagger의 `/v3/api-docs`에서 `src/shared/api/schema.d.ts`를 생성한다. `pnpm api:types` 스크립트가 돌린다. 기능의 `api/*.ts`는 요청과 응답 타입을 이 파일의 `components["schemas"]`에서 가져온다. 백엔드 스펙이 바뀌면 타입 검사가 깨져 바로 안다. 백엔드에 아직 없는 엔드포인트는 기능 문서의 타입을 손으로 두고 백엔드가 만들면 생성 타입으로 바꾼다.

**MSW.** 정규화된 팝업 데이터가 개발 마감까지 안 올 가능성이 있다. 기능마다 `api/handlers.ts`에 이 문서의 계약대로 핸들러를 두고 `shared/api/mocks/`가 브라우저 워커와 노드 서버(`instrumentation.ts`)로 모은다. 켜는 조건은 `NEXT_PUBLIC_API_MOCK=true` 하나이고 프로덕션 빌드에서는 값이 없어 코드가 실리지 않는다. 목은 fetch 앞에서 가로채므로 `request`와 화면 코드에 목 분기가 남지 않는다.

## 백엔드 요구 목록

서버에는 인증 세 엔드포인트만 있다. 아래는 이 설계가 백엔드에 요구하는 것이고 계약의 상세(요청과 응답 타입)는 각 기능 문서의 Interface 절에 있다. 응답은 전부 응답 공통 구조를 따르고 목록은 `PageResponse<T>`다.

| 메서드와 경로                          | 인증 | 용도                                              | 기능 문서           |
| -------------------------------------- | ---- | ------------------------------------------------- | ------------------- |
| `GET /api/v1/me`                       | 필요 | 닉네임과 프로필 이미지. 홈 인사 헤더              | `auth.md`           |
| `GET /api/v1/onboarding/options`       | 없음 | 관심 카테고리와 지역, 선호 활동 목록              | `onboarding.md`     |
| `PUT /api/v1/me/preferences`           | 필요 | 온보딩 답 저장                                    | `onboarding.md`     |
| `GET /api/v1/recommendations`          | 필요 | 홈 추천. 준비 중 상태를 값으로 낸다               | `recommendation.md` |
| `GET /api/v1/regions/summary`          | 없음 | 지역별 진행 팝업 수. 홈의 인기 지역               | `recommendation.md` |
| `GET /api/v1/popups`                   | 선택 | 목록. 필터와 검색, 정렬, 커서                     | `popup.md`          |
| `GET /api/v1/popups/{popupId}`         | 선택 | 상세                                              | `popup.md`          |
| `POST /api/v1/bookmarks/{popupId}`     | 필요 | 찜                                                | `bookmark.md`       |
| `DELETE /api/v1/bookmarks/{popupId}`   | 필요 | 찜 해제                                           | `bookmark.md`       |
| `GET /api/v1/me/bookmarks`             | 필요 | 찜 목록                                           | `bookmark.md`       |
| `POST /api/v1/courses`                 | 필요 | 코스 생성 작업 시작. 202와 `jobId`                | `planner.md`        |
| `GET /api/v1/courses/jobs/{jobId}`     | 필요 | 작업 상태와 단계                                  | `planner.md`        |
| `DELETE /api/v1/courses/jobs/{jobId}`  | 필요 | 작업 취소                                         | `planner.md`        |
| `GET /api/v1/courses/{courseId}`       | 필요 | 코스. 팝업과 순서, 도착 시각                      | `course.md`         |
| `GET /api/v1/courses/{courseId}/walks` | 필요 | 구간별 도보 소요시간과 경로 좌표. 카카오를 부른다 | `course.md`         |
| `GET /api/v1/me/courses`               | 필요 | 저장한 코스 목록                                  | `course.md`         |
| `DELETE /api/v1/courses/{courseId}`    | 필요 | 코스 삭제                                         | `course.md`         |
| `PATCH /api/v1/courses/{courseId}`     | 필요 | 캘린더에 보낸 시각 기록                           | `course.md`         |

인증 "선택"은 토큰이 있으면 `isBookmarked` 같은 사용자 상태를 채우고 없으면 `false`로 내는 공개 엔드포인트다. Spring Security 설정이 지금은 `anyRequest`를 인증 필수로 두고 있어 공개 엔드포인트마다 `permitAll`이 필요하다.

엔드포인트 밖의 요구다.

| 항목                                         | 내용                                                                                                                                                                   | 근거                |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 팝업 필드 `expectedStayMinutes`              | 최소와 최대 분. 없으면 플래너 시간표가 성립하지 않는다. `popup` 테이블에 없다                                                                                          | `course.md`         |
| 팝업 필드 `verification`                     | `VERIFIED`와 `PENDING`. 정보 확인 중 배지를 켠다. 지금은 필드별 출처만 있고 점수가 없다                                                                                | `popup.md`          |
| 회원 필드 닉네임과 프로필 이미지             | 공급자에서 받기로 했으나 엔티티에 없다                                                                                                                                 | `auth.md`           |
| `PageResponse`에 `nextCursor`와 `totalCount` | 지금은 `content`와 `hasNext`만이다. 커서 규칙과 "총 N곳" 표기에 필요하다                                                                                               | `popup.md`          |
| 카테고리 enum                                | 기획이 정한 여덟(패션과 브랜드, 뷰티, 캐릭터와 IP, 게임과 엔터, 테크와 가전, F&B, 전시와 아트, 라이프스타일)으로 맞춘다. 백엔드 초안에 있던 ETC가 최종 목록에서 빠졌다 | `popup.md`          |
| 팝업 상세 조회수 집계                        | 인기 정렬이 최근 7일 상세 조회수 내림차순이다. 집계와 `sort=popular` 대응을 백엔드가 맡는다                                                                            | `recommendation.md` |
| 지역과 카테고리 코드 체계                    | 선택지 테이블의 `code`와 팝업 응답의 `region`, `category`가 같은 값이어야 한다. 어긋나면 배지가 빈다                                                                   | `onboarding.md`     |
| 지역 배지 매핑                               | 수집은 주소대로 하고 배지는 조회할 때 매핑해 내려준다. 팝업 응답의 `region`이 그 결과다                                                                                | `popup.md`          |
| 에러 코드 `E1002` 중복                       | `INVALID_EMAIL`이 `MALFORMED_JWT`와 같은 코드다. 멤버 영역 코드로 바꾼다                                                                                               | `auth.md`           |
| 로그인 요청 필드 이름                        | Swagger는 `oauthProvider`, 실제 역직렬화는 `oAuthProvider`. 둘 중 하나로 맞춘다                                                                                        | `auth.md`           |
| 날짜와 시간 포맷                             | 미정(ROADMAP). 이 문서의 타입은 ISO 8601 문자열을 가정하고 포맷이 정해지면 파싱 위치 하나를 고친다                                                                     | `ROADMAP.md`        |

## 미결정 의존

이 설계가 걸려 있는 결정과 결정이 바뀌면 고칠 자리다. 미결정의 정본은 `docs/product/ROADMAP.md`이고 여기는 설계와의 대응만 적는다.

| 항목                         | 설계가 지금 취한 자리                                                                          | 바뀌면 고칠 곳                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 랜딩 노출 조건               | 온보딩 완료 쿠키가 있으면 `proxy.ts`가 `/`를 `/home`으로 보낸다                                | `proxy.ts` 조건 한 줄                                            |
| 지역 목록                    | 지금은 코드의 다섯. 선택지 API가 열리면 서버 목록을 그대로 그린다                              | `shared/model/region.ts`를 지우고 선택지 조회로 바꾼다           |
| 탐색의 지역 선택 UI          | 화면 안에서 지역을 고르는 자리는 없다. 홈 인기 지역 칩에서 들어올 때만 `region`이 URL에 실린다 | `popup.md`의 `ExploreState`                                      |
| 카테고리에 없는 팝업         | 여덟 중 하나로 온다고 보고 짠다. ETC가 없다                                                    | `shared/model/popup.ts`의 값과 카테고리별 대체 이미지, 핀 아이콘 |
| 최근 본 팝업 보관 자리       | 메모리. 새로고침하면 사라진다                                                                  | 기록하는 `features/popup`의 훅 한 곳                             |
| 하단 탭 마지막 라벨          | 화면마다 MY와 내 팝업이 섞여 있어 MY로 둔다                                                    | `shared/ui/BottomTabBar.tsx`의 라벨                              |
| 머무는 시간 선택지           | 둘. 간편 약 2시간과 반나절 4시간에서 5시간                                                     | `planner.md`의 `Duration`                                        |
| 동행을 여러 개 고르나        | 하나만 고른다                                                                                  | `planner.md`의 `CourseRequest.companion`과 온보딩 답 타입        |
| 로그인 완료 화면을 지나는 곳 | 모든 로그인이 완료 화면을 한 번 지난다                                                         | `auth.md`의 로그인 흐름 5단계                                    |
| 연계 카페                    | 코스 항목의 `kind`가 `POPUP` 하나. `PLACE`가 오면 그린다                                       | `course.md`의 `CourseItem`                                       |
| 후기와 평점                  | `reviewSummary`가 `null`이면 그리지 않는다                                                     | `popup.md`의 `PopupDetail`                                       |
| 대기시간 예상                | `waitEstimateMinutes`가 `null`이면 그리지 않는다                                               | `course.md`의 `CourseItem`                                       |
| 폴리라인 좌표를 응답에 싣나  | 구간 응답에 실린다(FE 제안)                                                                    | `course.md`의 `WalkSegment`                                      |
| 구글 API 계정                | 카카오는 한 계정으로 통일됐고 구글은 누구 것으로 할지 남았다                                   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID`와 콘솔의 Redirect URI             |
