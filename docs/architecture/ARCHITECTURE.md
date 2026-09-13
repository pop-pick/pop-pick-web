# 팝픽 프론트엔드 구조

화면을 코드보다 먼저 설계한 문서다. 라우트 트리와 상태의 원천, 데이터 흐름, 폴더 구조, 인증 세션처럼 기능 하나에 가두기 어려운 것을 여기 적고 기능별 보장과 데이터 모델, 계약은 같은 폴더의 기능 문서에 적는다. 기능 문서는 `radio-system-design` 절차(Requirements, Architecture, Data Model, Interface, Optimization)를 따른다.

> 2026-09-13 4차 정기회의 전에 FE가 제안으로 쓴 문서다. 회의에서 정해질 항목은 아래 미결정 의존 절에 표로 모아 두었고 그 표의 결정이 바뀌면 해당 기능 문서만 고친다. 회의 뒤 이 문단을 지운다.

## 기준선

화면과 기능의 정본은 2026-09-12 김혜진 피그마 화면 15장이다. 화면 구조와 문구는 피그마를 따르고 화면 구조를 넘어서는 동작 규칙은 2026-09-10 IA 기능 명세서를 참고한다.

피그마에는 데이터 수집 경로가 없거나 8/30 회의에서 범위 밖으로 뺀 요소 다섯이 들어 있다. 이 다섯은 화면 자리를 두되 데이터 모델에서 `null`을 허용하고 값이 `null`이면 그 요소를 그리지 않는다. 서버가 "없음"을 보낸 것이라 실패를 감추는 것이 아니다. 각 요소가 어느 결정에 걸리는지는 미결정 의존 절에 있다.

| 요소                                     | 화면                 | 의존 |
| ---------------------------------------- | -------------------- | ---- |
| 연계 카페와 제휴 할인                    | 코스 결과 타임라인   | D49  |
| 알림 벨과 방문 전 1시간 푸시             | 모든 헤더, 저장 완료 | D50  |
| 방문 후기 탭과 평점, 리뷰 수, 조회수     | 상세, 비회원 홈 카드 | D51  |
| 대기시간 예상                            | 코스 결과 타임라인   | D52  |
| 마커 미리보기 카드의 현재 위치 도보 시간 | 탐색 지도            | D53  |

9/6에 운영진에 제출한 기능 구현 계획과 피그마가 어긋나는 자리 셋은 이렇게 다룬다. 수료 심사가 제출문과 결과물을 대조하므로 문서에 남긴다.

- 온보딩의 성별 항목은 피그마대로 빼고 동행 유형을 받는다. 제출문에는 성별이 있다
- 플래너 조건 입력에 방문 날짜와 시작 시각을 넣는다. 피그마에는 없고 제출문과 IA에는 있다. 팝업에 운영 기간이 있어 날짜 없이는 어느 날 열린 곳을 고를지 정해지지 않는다(D48)
- 상세의 예약 링크는 `reservationUrl`이 있을 때 정보 영역에 외부 링크로 보인다. 피그마 하단 액션은 찜과 "이 팝업으로 AI 코스 추천받기" 둘이고 제출문은 예약 버튼을 적었다

## 화면과 라우트

Design width 375px, 대상은 모바일 웹이고 반응형 범위는 375px에서 430px까지다. 넓은 화면에서는 루트 레이아웃이 가운데 고정 폭 컬럼으로 그린다. 데스크탑 배치는 따로 만들지 않는다.

라우트 그룹 둘로 하단 탭바 노출을 구조로 정한다. `(tabs)` 그룹의 레이아웃이 탭바를 그리고 `(flow)` 그룹에는 탭바가 없다. 탭바를 어느 화면에 노출할지는 D55에 걸리고 결정이 바뀌면 폴더를 옮기는 것으로 끝난다.

```
src/app/
├── layout.tsx                          루트. QueryProvider, AuthProvider, 고정 폭 컬럼
├── page.tsx                            /                         랜딩(메인)
├── error.tsx                           라우트 오류 경계
├── not-found.tsx
├── (flow)/                             탭바 없음
│   ├── onboarding/[step]/page.tsx      /onboarding/1, 2, 3       온보딩 세 단계
│   ├── onboarding/result/page.tsx      /onboarding/result        추천 미리보기(로그인 전)
│   ├── login/page.tsx                  /login?next=              로그인
│   ├── popups/[popupId]/page.tsx       /popups/{id}?tab=         팝업 상세(전체 화면)
│   ├── planner/generating/[jobId]/page.tsx  /planner/generating/{jobId}  코스 생성 중
│   ├── courses/[courseId]/page.tsx     /courses/{id}             코스 결과
│   └── courses/[courseId]/saved/page.tsx    /courses/{id}/saved  캘린더 저장 완료
├── (tabs)/                             하단 탭바 레이아웃
│   ├── layout.tsx
│   ├── home/page.tsx                   /home                     회원 홈과 비회원 홈
│   ├── explore/page.tsx                /explore?view=&region=&category=&reservation=&ending=&q=&sort=
│   ├── planner/page.tsx                /planner?anchor=          플래너 조건 입력
│   └── my/page.tsx                     /my?tab=popups|courses    내 팝업
├── auth/kakao/callback/page.tsx        (기존)
├── auth/google/callback/page.tsx
└── poc/kakao-map/page.tsx              (기존 PoC. 릴리스 전에 지운다)
```

| 경로                          | 화면             | 로그인    | 데이터를 받는 곳                                                | 기능 문서                  |
| ----------------------------- | ---------------- | --------- | --------------------------------------------------------------- | -------------------------- |
| `/`                           | 랜딩             | 아니오    | 없음. 정적                                                      | `onboarding.md`            |
| `/onboarding/[step]`          | 온보딩 1, 2, 3   | 아니오    | 로컬 스토어                                                     | `onboarding.md`            |
| `/onboarding/result`          | 추천 미리보기    | 아니오    | 클라이언트 쿼리(비인증)                                         | `onboarding.md`            |
| `/login`                      | 로그인           | 아니오    | 없음                                                            | `auth.md`                  |
| `/auth/{provider}/callback`   | 콜백             | 아니오    | 클라이언트 뮤테이션                                             | `auth.md`                  |
| `/home`                       | 홈               | 아니오    | 클라이언트 쿼리. 로그인 여부로 분기                             | `recommendation.md`        |
| `/explore`                    | 탐색 지도와 목록 | 아니오    | 클라이언트 쿼리. 필터는 URL                                     | `popup.md`                 |
| `/popups/[popupId]`           | 팝업 상세        | 아니오    | 서버 컴포넌트가 첫 데이터와 메타 태그, 나머지는 클라이언트 쿼리 | `popup.md`                 |
| `/planner`                    | 조건 입력        | 만들기 때 | 폼                                                              | `planner.md`               |
| `/planner/generating/[jobId]` | 생성 중          | 예        | 클라이언트 폴링                                                 | `planner.md`               |
| `/courses/[courseId]`         | 코스 결과        | 예        | 클라이언트 쿼리 둘(코스, 구간)                                  | `course.md`                |
| `/courses/[courseId]/saved`   | 저장 완료        | 예        | 클라이언트 쿼리                                                 | `course.md`                |
| `/my`                         | 내 팝업          | 예        | 클라이언트 쿼리. 탭은 URL                                       | `bookmark.md`, `course.md` |

로그인 필요 화면과 동작은 클라이언트에서 막는다. 토큰이 메모리에만 있는 동안은 서버가 읽을 세션이 없어 `proxy.ts`가 판단할 근거가 없기 때문이다. 비로그인 사용자가 찜이나 코스 만들기를 누르면 그 시점에 `/login?next={돌아올 경로}`로 보낸다(D45). 로그인 뒤 `next`로 돌아온다.

서버 컴포넌트가 백엔드를 직접 부르는 자리는 상세 하나다. 공유 링크의 메타 태그(제목, 대표 이미지, 기간)를 서버에서 채워야 하고 상세 조회가 인증 없는 공개 API라서 가능하다. 그 밖의 화면은 개인화나 URL 필터에 묶여 있어 클라이언트 쿼리로 통일한다. 서버 컴포넌트는 인증이 필요한 API를 부르지 않는다. 토큰이 서버에 없다.

## 상태의 원천

같은 값을 두 곳에 두지 않는다. 화면에 보이는 값마다 원천이 하나다.

| 분류             | 원천                        | 값                                                                                                     |
| ---------------- | --------------------------- | ------------------------------------------------------------------------------------------------------ |
| Server State     | 백엔드. TanStack Query 캐시 | 팝업 목록과 상세, 추천 결과, 찜 목록, 코스와 구간 소요시간, 코스 작업 상태, 내 정보, 지역 요약         |
| URL State        | 주소창                      | 탐색의 뷰와 필터와 검색어와 정렬, 상세의 탭, 내 팝업의 탭, 온보딩 단계, 로그인 뒤 돌아갈 경로          |
| Local State      | Zustand 스토어(persist)     | 온보딩 답(로그인 전까지), 온보딩 완료 여부                                                             |
| Local State      | Zustand 스토어(메모리)      | 액세스 토큰과 리프레시 토큰, 인증 상태                                                                 |
| Local State      | 컴포넌트 `useState`         | 바텀시트 열림, 선택된 마커, 이미지 갤러리 위치, 폼 입력 중인 값(react-hook-form)                       |
| Optimistic State | 클라이언트의 의도           | 찜 토글. 서버 응답 전에 캐시를 먼저 바꾸고 실패하면 되돌린다                                           |
| Derived State    | 다른 상태의 계산            | 팝업의 진행 중과 종료 임박과 종료, 코스의 총 도보 시간, 온보딩 추천받기 버튼 활성 여부, 도착 시각 라벨 |

플래너에 팝업을 담아 두는 스토어는 만들지 않는다. 피그마 플래너는 조건을 입력해 코스를 통째로 받는 흐름이라 담기 단계가 없다. 상세의 "이 팝업으로 AI 코스 추천받기"는 `/planner?anchor={popupId}`로 조건 입력 화면에 팝업 하나를 미리 채우는 것으로 끝나고 이 값도 URL이다.

## 데이터 흐름

브라우저에서 나가는 요청은 전부 같은 출처 `/api/...`로 가고 `next.config.ts`의 rewrites가 백엔드로 넘긴다. 서버 컴포넌트는 `API_BASE_URL`로 백엔드를 직접 부른다. 어느 쪽이든 `src/shared/api`의 `request<T>`를 거치고 화면 코드는 응답 공통 구조를 모른다. 이 계약은 `.agents/rules/api.md`가 정본이고 프론트 쪽 구현은 `src/shared/api/types.ts`와 `errors.ts`다.

```
화면(클라이언트 컴포넌트)
  useQuery / useMutation      TanStack Query. 캐시와 로딩, 에러 상태
    features/{기능}/api/*.ts  엔드포인트 하나에 함수 하나. queryOptions로 키와 함께 내보낸다
      shared/api/request<T>   Bearer 부착, 재발급 한 번, 타임아웃, ApiError
        /api/v1/...           rewrites가 백엔드로
```

인증이 필요한 요청은 `request`가 액세스 토큰을 `Authorization: Bearer`로 붙인다. 토큰 소스는 auth 기능이 앱 시작 때 `shared/api`에 등록한다. 만료(`E1004`)면 `request`가 재발급을 한 번 부르고 같은 요청을 다시 보낸다. 재발급도 실패하면 스토어를 비우고 `auth:expired` 이벤트를 낸다. `AuthProvider`가 이 이벤트를 받아 `/login?next=`로 보낸다. 재발급이 동시에 여러 번 나가지 않도록 진행 중인 재발급 Promise를 하나만 들고 공유한다. 자세한 것은 `auth.md`에 있다.

읽기는 쿼리, 쓰기는 뮤테이션이다. 뮤테이션이 성공하면 관련 쿼리를 무효화하고 낙관적 갱신이 필요한 자리(찜)만 캐시를 먼저 바꾼다. 서버 데이터를 스토어에 복제하지 않는다.

## 폴더 구조

`features/` 하위 폴더는 기능 하나에 하나이고 이름은 백엔드 `feature/{이름}` 패키지와 맞춘다. 지금 백엔드에는 `auth`와 `member`, `collection`(수집 파이프라인)만 있어 나머지 이름은 FE가 제안하고 백엔드가 사용자향 API 패키지를 만들 때 같은 이름을 쓰도록 요구 목록에 올린다.

| 폴더                      | 담는 것                                                                  | 쓰는 화면                         |
| ------------------------- | ------------------------------------------------------------------------ | --------------------------------- |
| `features/auth`           | 소셜 로그인 둘, 토큰 스토어, 재발급, 내 정보, 로그인 가드                | 로그인, 콜백, 모든 보호 화면      |
| `features/onboarding`     | 랜딩, 온보딩 세 단계 폼, 답 임시 보관, 추천 미리보기                     | `/`, `/onboarding/*`              |
| `features/recommendation` | 홈 추천 섹션, 인기 팝업 섹션, 지역 요약, 추천 실패 축소 동작             | `/home`                           |
| `features/popup`          | 탐색 지도와 목록, 필터, 검색, 상세, 마커 미리보기 카드                   | `/explore`, `/popups/[id]`        |
| `features/bookmark`       | 찜 버튼(낙관적), 찜 목록                                                 | 카드가 있는 모든 화면, `/my`      |
| `features/planner`        | 조건 입력 폼, 코스 생성 작업 시작과 폴링과 취소                          | `/planner`, `/planner/generating` |
| `features/course`         | 코스 결과(지도와 타임라인), 구간 소요시간, 저장 목록과 삭제, 캘린더 저장 | `/courses/*`, `/my`               |

홈과 내 팝업처럼 여러 기능이 한 화면에 놓이는 자리는 `src/app`의 라우트 파일이 조립한다. 홈은 recommendation과 popup과 bookmark를, 내 팝업은 bookmark와 course를 가져다 놓는다. 라우트 파일은 조립만 하고 로직을 갖지 않는다.

기능 폴더 안은 이렇게 나눈다. 저장소에 아직 규칙이 없어 이 문서가 제안한다. `auth` 보강 작업이 배치 결과를 보고하면 그때 둘을 맞춰 `.agents/rules/`에 올린다.

```
features/{기능}/
├── api/            엔드포인트 함수와 queryOptions, MSW handlers.ts
├── model/          이 기능 안에서만 쓰는 타입과 순수 함수(파생값 계산, 검증 스키마)
├── use{이름}.ts    훅과 Zustand 스토어. 파일 이름은 훅 이름
└── {이름}.tsx      컴포넌트. PascalCase, export function
```

여러 기능이 함께 쓰는 것은 `src/shared`에 둔다. 이번 설계로 새로 생기는 것이다.

| 위치                             | 담는 것                                                                                            |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| `shared/types/region.ts`         | `Region` 다섯과 라벨 대응표. 온보딩과 탐색, 플래너, 팝업 필드가 같은 타입을 쓴다                   |
| `shared/types/popup.ts`          | `PopupSummary`와 카테고리, 예약 유형, 확인 상태. 카드가 있는 모든 기능이 쓴다                      |
| `shared/api/query-keys.ts`       | 쿼리 키 규칙                                                                                       |
| `shared/api/auth-token.ts`       | 액세스 토큰 소스 등록과 만료 이벤트. auth 기능이 등록하고 `request`가 읽는다                       |
| `shared/api/schema.d.ts`         | Swagger `/v3/api-docs`에서 생성한 타입. 손으로 고치지 않는다                                       |
| `shared/api/mocks/`              | MSW 브라우저 워커와 노드 서버 설정. 핸들러는 각 기능의 `api/handlers.ts`에서 모은다                |
| `shared/hooks/useCursorQuery.ts` | `PageResponse<T>`를 받는 무한 스크롤 쿼리. 마지막 항목에서 커서를 뽑는 규칙을 한 곳에 둔다         |
| `shared/lib/kakao-map`           | 폴리라인과 번호 마커(CustomOverlay), 경로 좌표를 SDK 좌표로 옮기는 함수, 마커 전체가 보이게 맞추기 |
| `shared/ui`                      | BottomTabBar, PopupCard, Chip, BottomSheet, Tabs, Skeleton, Badge, EmptyState, ErrorState          |

`shared/ui`의 목록은 후보다. 두 화면 이상에서 쓰임이 확인된 것만 올리고 주인은 디자인 시스템 담당이다.

## 공통 계약

### 쿼리 키

첫 조각은 기능 이름, 둘째는 종류, 셋째부터 식별자와 필터다. 무효화는 앞 조각으로 한다.

```typescript
export const queryKeys = {
	me: () => ["me"] as const,
	popups: {
		list: (filters: PopupListFilters) => ["popups", "list", filters] as const,
		detail: (popupId: number) => ["popups", "detail", popupId] as const,
		countByRegion: (filters: PopupCountFilters) => ["popups", "count-by-region", filters] as const
	},
	recommendations: {
		home: () => ["recommendations", "home"] as const,
		preview: (answers: OnboardingAnswers) => ["recommendations", "preview", answers] as const
	},
	regions: { summary: () => ["regions", "summary"] as const },
	bookmarks: { list: () => ["bookmarks", "list"] as const },
	courses: {
		detail: (courseId: number) => ["courses", "detail", courseId] as const,
		walks: (courseId: number) => ["courses", "walks", courseId] as const,
		job: (jobId: string) => ["courses", "job", jobId] as const,
		list: () => ["courses", "list"] as const
	}
};
```

### 커서 페이지네이션

백엔드 `PageResponse<T>`는 `content`와 `hasNext`만 있고 다음 커서 값이 없다. `useCursorQuery`가 마지막 항목의 `id`를 다음 요청의 `cursor`로 쓴다. 한 페이지는 10건이고 백엔드 상한은 50건이다. 응답에 `nextCursor`를 실어 달라고 요구 목록에 올렸고 실리면 그 값을 우선한다.

### 실패의 표면

- 쿼리 실패는 그 섹션의 `ErrorState`로 보인다. 다시 시도 버튼이 `refetch`를 부른다
- 라우트 단위로 던져진 오류는 가장 가까운 `error.tsx`가 받는다. 루트에 하나 두고 코스 결과처럼 지도가 있는 화면은 자기 `error.tsx`를 둔다
- `ApiError.errorCode`로 문구를 가른다. `ApiError.message`는 로그용이라 화면에 그대로 내지 않는다
- 축소 동작은 SPEC에 적힌 둘뿐이다. 도보 소요시간을 못 받은 구간의 "소요시간 모름"과 추천이 준비되기 전이나 실패했을 때의 인기순 대체다. 둘 다 화면에서 구분되고 `console.warn` 로그를 남긴다

### 로그와 지표

수집 도구는 두지 않는다. `console.warn`과 `console.error`에 기능 접두사를 붙여 남기고 지표는 이름만 정해 둔다. 도구를 붙일 때 무엇을 잴지 다시 정하지 않기 위해서다.

| 접두사             | 남기는 사건                                                 |
| ------------------ | ----------------------------------------------------------- |
| `[auth]`           | 재발급 실패로 로그아웃, 콜백 state 불일치, 공급자 오류 코드 |
| `[onboarding]`     | 미리보기 실패, 로그인 뒤 취향 전송 실패                     |
| `[recommendation]` | 추천 실패나 준비 중으로 인기순 대체                         |
| `[popup]`          | 검색 응답 폐기(요청 시점 필터와 다름), 상세 조회 실패       |
| `[bookmark]`       | 낙관적 갱신 되돌림                                          |
| `[planner]`        | 작업 실패, 폴링 상한 초과                                   |
| `[course]`         | 구간 소요시간 모름, 캘린더 파일 생성 실패                   |
| `[walk-route]`     | 구간별 경로 조회 실패 상태(SPEC의 접두사를 그대로 쓴다)     |
| `[kakao-map]`      | SDK 로딩 실패(기존)                                         |

0이어야 정상인 지표다. 0이 아니면 그 기능 문서의 설계가 샌 것이다.

| 지표                       | 뜻                                              | 새면 볼 문서  |
| -------------------------- | ----------------------------------------------- | ------------- |
| 찜 되돌림 횟수             | 낙관적 갱신이 서버와 어긋난 횟수                | `bookmark.md` |
| 검색 응답 폐기 횟수        | 늦게 온 응답이 현재 필터와 달라 버린 횟수       | `popup.md`    |
| 재발급 뒤 재요청 실패 횟수 | 재발급이 성공했는데 원래 요청이 다시 401인 횟수 | `auth.md`     |
| 코스 작업 폴링 상한 초과   | 작업이 상한 시간 안에 끝나지 않은 횟수          | `planner.md`  |
| 코스 결과 항목 순서 불일치 | 응답의 `order`가 1부터 연속이 아닌 횟수         | `course.md`   |

체감 지표는 기능 문서의 보장 문장을 그대로 잰다.

## 개발 의존성 전제

이 설계는 개발 의존성 둘을 전제한다. 설치는 별도로 묻는다.

**openapi-typescript.** Swagger의 `/v3/api-docs`에서 `src/shared/api/schema.d.ts`를 생성한다. `pnpm api:types` 스크립트가 돌린다. 기능의 `api/*.ts`는 요청과 응답 타입을 이 파일의 `components["schemas"]`에서 가져온다. 백엔드 스펙이 바뀌면 타입 검사가 깨져 바로 안다. 백엔드에 아직 없는 엔드포인트는 기능 문서의 타입을 손으로 두고 백엔드가 만들면 생성 타입으로 바꾼다.

**MSW.** 정규화된 팝업 데이터가 4주차에도 없을 가능성이 크다. 기능마다 `api/handlers.ts`에 이 문서의 계약대로 핸들러를 두고 `shared/api/mocks/`가 브라우저 워커와 노드 서버(`instrumentation.ts`)로 모은다. 켜는 조건은 `NEXT_PUBLIC_API_MOCK=true` 하나이고 프로덕션 빌드에서는 값이 없어 코드가 실리지 않는다. 목은 fetch 앞에서 가로채므로 `request`와 화면 코드에 목 분기가 남지 않는다.

## 백엔드 요구 목록

서버에는 인증 세 엔드포인트만 있다. 아래는 이 설계가 백엔드에 요구하는 것이고 계약의 상세(요청과 응답 타입)는 각 기능 문서의 Interface 절에 있다. 응답은 전부 응답 공통 구조를 따르고 목록은 `PageResponse<T>`다.

| 메서드와 경로                          | 인증 | 용도                                                | 기능 문서           |
| -------------------------------------- | ---- | --------------------------------------------------- | ------------------- |
| `GET /api/v1/me`                       | 필요 | 닉네임과 프로필 이미지. 홈 인사 헤더                | `auth.md`           |
| `PUT /api/v1/me/preferences`           | 필요 | 온보딩 답 저장                                      | `onboarding.md`     |
| `POST /api/v1/recommendations/preview` | 없음 | 로그인 전 미리보기. 답을 받아 스코어와 예시를 낸다  | `onboarding.md`     |
| `GET /api/v1/recommendations`          | 필요 | 홈 추천. 준비 중 상태를 값으로 낸다                 | `recommendation.md` |
| `GET /api/v1/regions/summary`          | 없음 | 지역별 진행 팝업 수. 홈의 인기 지역                 | `recommendation.md` |
| `GET /api/v1/popups`                   | 선택 | 목록. 필터와 검색, 정렬, 커서                       | `popup.md`          |
| `GET /api/v1/popups/{popupId}`         | 선택 | 상세                                                | `popup.md`          |
| `GET /api/v1/popups/count-by-region`   | 없음 | 같은 조건의 지역별 건수. 결과 0건 때 인접 지역 제안 | `popup.md`          |
| `POST /api/v1/bookmarks/{popupId}`     | 필요 | 찜                                                  | `bookmark.md`       |
| `DELETE /api/v1/bookmarks/{popupId}`   | 필요 | 찜 해제                                             | `bookmark.md`       |
| `GET /api/v1/me/bookmarks`             | 필요 | 찜 목록                                             | `bookmark.md`       |
| `POST /api/v1/courses`                 | 필요 | 코스 생성 작업 시작. 202와 `jobId`                  | `planner.md`        |
| `GET /api/v1/courses/jobs/{jobId}`     | 필요 | 작업 상태와 단계                                    | `planner.md`        |
| `DELETE /api/v1/courses/jobs/{jobId}`  | 필요 | 작업 취소                                           | `planner.md`        |
| `GET /api/v1/courses/{courseId}`       | 필요 | 코스. 팝업과 순서, 도착 시각                        | `course.md`         |
| `GET /api/v1/courses/{courseId}/walks` | 필요 | 구간별 도보 소요시간과 경로 좌표. 카카오를 부른다   | `course.md`         |
| `GET /api/v1/me/courses`               | 필요 | 저장한 코스 목록                                    | `course.md`         |
| `DELETE /api/v1/courses/{courseId}`    | 필요 | 코스 삭제                                           | `course.md`         |
| `PATCH /api/v1/courses/{courseId}`     | 필요 | 캘린더에 보낸 시각 기록                             | `course.md`         |

인증 "선택"은 토큰이 있으면 `isBookmarked` 같은 사용자 상태를 채우고 없으면 `false`로 내는 공개 엔드포인트다. Spring Security 설정이 지금은 `anyRequest`를 인증 필수로 두고 있어 공개 엔드포인트마다 `permitAll`이 필요하다.

엔드포인트 밖의 요구다.

| 항목                                         | 내용                                                                                                                                                                            | 근거                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 팝업 필드 `expectedStayMinutes`              | 최소와 최대 분. 없으면 플래너 시간표가 성립하지 않는다. `popup` 테이블에 없다                                                                                                   | D29, `course.md`           |
| 팝업 필드 `verification`                     | `VERIFIED`와 `PENDING`. 정보 확인 중 배지를 켠다. 지금은 필드별 출처만 있고 점수가 없다                                                                                         | `popup.md`                 |
| 회원 필드 닉네임과 프로필 이미지             | 9/3에 공급자에서 받기로 했으나 엔티티에 없다                                                                                                                                    | `auth.md`                  |
| `PageResponse`에 `nextCursor`와 `totalCount` | 지금은 `content`와 `hasNext`만이다. 커서 규칙과 "총 N곳" 표기에 필요하다                                                                                                        | `popup.md`                 |
| 카테고리 enum                                | 백엔드 여덟(FASHION, BEAUTY, FNB, CHARACTER_IP, ART, TECH, LIFESTYLE, ETC)과 피그마 일곱(캐릭터/IP, 패션, F&B, 전시/아트, 뷰티, 애니/게임, 기타)이 다르다. 피그마 쪽으로 맞춘다 | `popup.md`                 |
| `areaCode` 값                                | `SEONGSU`, `YEOUIDO`, `HONGDAE`, `SINCHON`, `YONGSAN` 다섯으로 고정                                                                                                             | D47, `shared/types/region` |
| 리프레시 토큰 `Set-Cookie`                   | 로그인과 재발급 응답에서 리프레시 토큰을 httpOnly 쿠키로. `/refresh`와 `/logout`이 쿠키를 읽는다                                                                                | D42, `auth.md`             |
| 에러 코드 `E1002` 중복                       | `INVALID_EMAIL`이 `MALFORMED_JWT`와 같은 코드다. 멤버 영역 코드로 바꾼다                                                                                                        | `auth.md`                  |
| 로그인 요청 필드 이름                        | Swagger는 `oauthProvider`, 실제 역직렬화는 `oAuthProvider`. 둘 중 하나로 맞춘다                                                                                                 | `auth.md`                  |
| 날짜와 시간 포맷                             | 미정(ROADMAP). 이 문서의 타입은 ISO 8601 문자열을 가정하고 포맷이 정해지면 파싱 위치 하나를 고친다                                                                              | `ROADMAP.md`               |

## 미결정 의존

이 설계가 걸려 있는 결정과 결정이 바뀌면 고칠 자리다. 미결정의 정본은 `docs/product/ROADMAP.md`이고 여기는 설계와의 대응만 적는다.

| 결정 | 항목                        | 설계가 지금 취한 자리                                                  | 바뀌면 고칠 곳                         |
| ---- | --------------------------- | ---------------------------------------------------------------------- | -------------------------------------- |
| D44  | 랜딩 노출 조건              | 온보딩 완료 쿠키가 있으면 `proxy.ts`가 `/`를 `/home`으로 보낸다        | `proxy.ts` 조건 한 줄                  |
| D45  | 비로그인 접근 처리          | 찜과 코스 만들기를 누른 시점에 `/login?next=`                          | `auth.md`의 가드                       |
| D47  | 지역 목록                   | 다섯. 피그마의 한남동과 잠실은 뺐다                                    | `shared/types/region.ts`의 값 추가     |
| D48  | 플래너 날짜                 | 날짜와 시작 시각을 받는다                                              | `planner.md`의 폼 필드와 요청 타입     |
| D49  | 연계 카페                   | 코스 항목의 `kind`가 `POPUP` 하나. `PLACE`가 오면 그린다               | `course.md`의 `CourseItem`             |
| D50  | 알림                        | 헤더 벨 자리만, 저장 완료의 알림받기 자리만. 동작 없음                 | 헤더 컴포넌트, `course.md`의 저장 완료 |
| D51  | 후기와 평점, 조회수         | `reviewSummary`와 `viewCount`가 `null`이면 그리지 않는다               | `popup.md`의 `PopupDetail`             |
| D52  | 대기시간 예상               | `waitEstimateMinutes`가 `null`이면 그리지 않는다                       | `course.md`의 `CourseItem`             |
| D53  | 마커 도보 시간 기준점       | `walkFromLandmark`가 `null`이면 그리지 않는다. 위치 권한은 받지 않는다 | `popup.md`의 마커 카드                 |
| D55  | 탭바 노출 화면              | `(tabs)` 넷에만                                                        | 라우트 그룹 폴더 이동                  |
| D56  | 취향 스코어 축              | 서버가 `axis` 문자열로 내려주고 FE는 받은 대로 그린다                  | `onboarding.md`의 `PreviewResult`      |
| D57  | 기준 화면                   | 피그마 15장                                                            | 이 문서 전체                           |
| D39  | 폴리라인 좌표를 응답에 싣나 | 구간 응답에 실린다(FE 제안)                                            | `course.md`의 `WalkSegment`            |
| D40  | 카카오 REST 키 소유         | 백엔드가 부르므로 백엔드 몫. FE 영향 없음                              | 없음                                   |
| D42  | 토큰 보관                   | 메모리. 쿠키가 오면 리프레시 토큰 필드를 스토어에서 뺀다               | `auth.md`                              |
| D34  | 캘린더 방식                 | 구글 URL 템플릿과 .ics(FE 제안)                                        | `course.md`의 캘린더 절                |

이 설계로 닫힌 것도 있다. D37 추천 실패 화면은 인기순 대체와 라벨, D38 마커 상한은 백엔드 페이지 상한 50, D46 온보딩 답 보관은 로컬 persist, D54 온보딩 건너뛰기는 신호 하나 필수로 정했다. 넷 다 FE가 정하는 자리였다.
