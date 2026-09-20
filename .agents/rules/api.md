---
description: 층이 넷이다. shared/api는 HTTP만 알고 features/{기능}/api는 엔드포인트를, hooks는 변경을, ui는 화면을 안다. 브라우저는 같은 출처 /api를, 서버는 API_BASE_URL을 부른다
paths:
  - "src/**/api/**"
  - "src/**/hooks/**"
  - "src/app/**/route.ts"
  - "next.config.ts"
---

# API 호출

## 층이 넷이다

한 번의 서버 호출이 넷을 지난다. 각 층은 아래 층만 알고 위를 모른다.

| 층                      | 아는 것                                                     | 모르는 것                                      |
| ----------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| `shared/api`            | HTTP, 주소 만들기, 공통 응답 구조, 실패 분류, Bearer 붙이기 | 어떤 엔드포인트가 있는지, 어떤 기능이 부르는지 |
| `features/{기능}/api`   | 경로와 요청 응답 타입, 쿼리 키                              | 화면이 언제 부르는지, 무엇을 무효화할지        |
| `features/{기능}/hooks` | 변경과 그 뒤 무효화할 키                                    | 마크업                                         |
| `features/{기능}/ui`    | 화면                                                        | HTTP                                           |

**경계를 어긴 신호는 이렇다.** `shared/api`에 기능 이름이 보이면 층이 거꾸로 흐른 것이다. `ui`에 `api.get`이 보이면 두 층을 건너뛴 것이다. `api` 폴더에 `invalidateQueries`가 보이면 무효화가 아래로 샌 것이다.

## shared/api가 하는 일

**HTTP만 안다.** 다섯이다.

- 주소를 만든다. 브라우저면 같은 출처, 서버면 `API_BASE_URL`이다
- 공통 헤더를 붙인다. `accept`와 `content-type`, 그리고 Bearer다
- 타임아웃을 건다. 기본 10초다
- 공통 응답 구조를 벗겨 `data`만 돌려준다
- 실패를 `ApiError`로 바꾼다. `kind`가 `http`, `network`, `timeout`, `invalid-body` 넷이다

**하지 않는 일이 더 중요하다.** 엔드포인트 목록과 쿼리 키, 특정 기능의 타입을 갖지 않는다. 여기에 `popup`이나 `course` 같은 이름이 나타나면 그 코드는 기능 폴더로 내려가야 한다.

`types.ts`는 예외다. `ApiResponse`와 `PageResponse`는 모든 엔드포인트가 같은 모양으로 쓰는 공통 응답 구조라 HTTP 층의 지식이다.

## Bearer는 shared/api가 붙인다

호출하는 자리에서 헤더를 손으로 만들지 않는다. `auth` 옵션 하나로 정한다.

```ts
api.get<Popup[]>("/api/v1/popups"); // Bearer 붙는다
api.post<AuthTokens>("/api/v1/auth/login", { json: body, auth: false }); // 안 붙는다
```

기본값이 `true`인 이유는 백엔드가 `/api/v1/auth/**`만 열어 두고 나머지를 전부 인증으로 막기 때문이다. 열린 쪽이 예외이므로 예외를 적는다.

**토큰을 어디서 읽을지는 `features/auth`가 등록한다.** `shared`는 `features`를 부를 수 없으므로 방향을 뒤집는다.

```ts
// shared/api/auth-token.ts
export function setAccessTokenSource(next: AccessTokenSource | null);

// features/auth/model/useAuthStore.ts 맨 아래
setAccessTokenSource(() => useAuthStore.getState().accessToken);
```

`shared/api`는 함수 하나를 받을 뿐 스토어도 기능도 모른다. 이 구조라서 재발급이 붙을 때 고칠 자리가 `shared/api`의 `request` 하나로 모인다.

## 기능의 api 폴더

**엔드포인트 하나에 파일 하나다.** 파일 이름은 그 동작을 그대로 적은 케밥 케이스다. `login-with-kakao.ts`, `get-popups.ts`, `create-course.ts`처럼 쓴다.

**파일 하나가 담는 것은 셋이다.** 요청과 응답 타입, `shared/api`의 래퍼를 부르는 함수, 그리고 조회면 `queryOptions`다.

```ts
import { queryOptions } from "@tanstack/react-query";

import { api } from "@/shared/api/client";
import type { PageResponse } from "@/shared/api/types";

export interface PopupListFilters {
	region: Region | null;
	category: PopupCategory | null;
}

export function getPopups(filters: PopupListFilters, signal?: AbortSignal) {
	return api.get<PageResponse<PopupSummary>>("/api/v1/popups", { query: filters, signal });
}

export function popupListQuery(filters: PopupListFilters) {
	return queryOptions({
		queryKey: ["popups", "list", filters],
		queryFn: ({ signal }) => getPopups(filters, signal)
	});
}
```

`queryOptions`를 쓰는 이유는 타입 때문이다. 옵션 객체를 그냥 상수로 빼면 TypeScript가 `staleTime` 오타를 잡지 못하고 `getQueryData`의 반환 타입도 `unknown`이 된다.

**`signal`을 받아 넘긴다.** 화면을 떠나면 쿼리가 요청을 끊는다. `queryFn`이 받는 `signal`을 그대로 내려보내면 된다.

**쿼리 키를 모으는 공용 파일을 만들지 않는다.** 키는 그 키를 쓰는 `queryOptions` 옆에 있다. 무효화는 앞 조각을 그대로 적는다.

**키의 첫 조각은 기능 이름, 둘째는 종류, 셋째부터 식별자와 필터다.** `["popups", "list", filters]`와 `["popups", "detail", popupId]` 형태다.

## 변경은 훅이 낸다

`useMutation`을 감싼 훅을 `hooks/use{동작}.ts`에 두고 성공했을 때 무효화할 키를 그 안에 적는다.

```ts
export function useCreateCourse() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createCourse,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] })
	});
}
```

무효화 키와 조회 키가 갈라지는 것이 이 저장소에서 가장 조용히 깨지는 자리다. 변경은 성공하고 화면만 옛 값을 들고 있으며 아무 오류도 남지 않는다. 훅을 쓸 때 조회 쪽 `queryOptions`를 같이 열어 앞 조각을 맞춘다.

**Server Action을 쓰지 않는다.** Next 문서는 변경을 Server Action으로 내고 `useMutation`의 `mutationFn`에 그 액션을 넘기는 흐름을 보여준다. 우리는 `mutationFn`이 브라우저에서 백엔드를 직접 부른다. 이유는 셋이다.

- 액세스 토큰이 Zustand 메모리에 있어 Next 서버가 읽을 수 없다. 인자로 넘기면 토큰이 액션 페이로드에 실린다. 쿠키에 있는 것은 리프레시 토큰뿐이고 그것을 읽는 자리는 `/api/auth` Route Handler 셋으로 한정한다
- Next 서버는 프록시로만 쓰기로 했다
- Server Action의 값은 `updateTag`로 서버 캐시를 비우는 데서 나오는데 우리는 서버 캐시가 없다. 문서도 캐시되지 않은 읽기에는 비울 태그가 없다고 적는다

출처는 https://nextjs.org/docs/app/guides/client-side-data-fetching/tanstack-query 와 https://nextjs.org/docs/app/guides/backend-for-frontend 의 Server Actions 절이다.

## 백엔드 주소는 둘이다

호출하는 자리에 따라 백엔드에 닿는 길이 다르다. 호출자는 어느 쪽이든 `/api/v1/...`를 그대로 넘기고 주소를 가르는 것은 래퍼 몫이다.

| 부르는 곳                                    | 주소                       | 경유                        |
| -------------------------------------------- | -------------------------- | --------------------------- |
| 브라우저                                     | 같은 출처 `/api/v1/...`    | `next.config.ts`의 rewrites |
| 서버 컴포넌트와 Route Handler, Server Action | `process.env.API_BASE_URL` | 백엔드 직접                 |

서버에서 상대 경로를 쓰면 Next가 자기 자신을 부르게 되고 빌드 시점에는 듣는 서버가 없어 실패한다.

환경 변수 이름은 `API_BASE_URL`이고 `NEXT_PUBLIC_` 접두사를 붙이지 않는다. 이유는 셋이다.

- 리프레시 토큰이 httpOnly 쿠키에 있고 요청이 같은 출처라야 쿠키가 자연스럽게 붙는다
- 같은 출처 요청에는 CORS preflight가 없다
- 백엔드 주소가 클라이언트 번들에 들어가지 않는다

`API_BASE_URL`은 `next.config.ts`가 로드될 때 읽히고 비어 있으면 그 자리에서 던진다.

**서버 컴포넌트는 인증이 필요한 요청을 보내지 않는다.** 토큰이 메모리에 있어 서버에 없다. 공개 데이터만 `prefetchQuery`로 받아 `HydrationBoundary`로 넘긴다. `staleTime`이 0이면 마운트 직후 다시 조회하므로 0보다 커야 한다.

**서버 컴포넌트가 Route Handler를 부르지 않는다.** 빌드 시점에 듣는 서버가 없어 실패하고 런타임에도 왕복이 하나 늘 뿐이다.

## Route Handler와 rewrite의 순서

Next는 요청을 headers, redirects, proxy, beforeFiles rewrites, 파일시스템 라우트, afterFiles rewrites, 동적 라우트, fallback rewrites 순서로 본다. `rewrites()`가 배열을 돌려주면 afterFiles다. 그래서 `app/api/auth/session/route.ts` 같은 정적 경로 Route Handler는 rewrite보다 먼저 잡히고, `app/api/[...slug]/route.ts` 같은 동적 세그먼트는 rewrite에 밀려 닿지 않는다.

**`/api` 아래 Route Handler는 정적 경로로만 만든다.** 출처는 https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites 와 https://nextjs.org/docs/app/api-reference/file-conventions/proxy 의 Execution order 절이다.

rewrite 경로는 `/api/v1/:path*`이고 Route Handler는 `/api/auth/**`다. 백엔드 API가 전부 `/api/v1/**`이라 좁혀도 닿지 못하는 엔드포인트가 없고 두 경로가 겹치지 않는다.

Next 서버는 프록시로만 쓴다. Route Handler로 프록시를 손으로 짜지 않고 비즈니스 로직을 두지 않는다. `/api/auth` 셋만 예외이고 그것도 세션 쿠키를 심고 지우는 전달 계층 일이다. 추천 계산이나 코스 순서 같은 것이 그 폴더로 들어오면 원칙이 깨진 것이다. 흐름은 `docs/architecture/auth.md`에 있다.

## 응답 형식은 백엔드가 정한다

프론트가 원하는 모양을 들고 가서 협의하지 않는다. 형식을 두고 다투는 비용이 얻는 것보다 크다. 대신 둘을 요구한다.

- 백엔드 셋이 모든 엔드포인트를 같은 모양으로 내려준다
- Swagger 스펙을 공유한다

응답 필드 이름은 추측하지 않는다. `../pop-pick-server/`의 DTO나 Swagger에서 확인한 것만 쓴다. 한 글자 틀려도 타입 검사와 빌드는 통과하고 런타임에만 깨진다.

## 실패를 감추지 않는다

실패는 TanStack Query의 `error` 상태로 드러낸다. 빈 배열이나 기본값으로 바꾸지 않는다. 기준은 `no-fallback.md`다.

`ApiError`의 `kind`로 네트워크와 타임아웃을 가르고 `errorCode`로 백엔드가 정한 실패를 가른다. 원문 메시지를 화면에 그대로 내지 않고 기능이 가진 문구 표로 옮긴다.

## 정해진 것과 미정

응답 공통 구조와 에러 코드 체계, 커서 기반 페이지네이션, camelCase 필드 이름은 백엔드가 정했다. 상세는 백엔드 Swagger(https://prod.poppick.shop/swagger-ui/index.html)와 백엔드 저장소의 `global/response`, `global/exception` 패키지에 있다.

토큰 보관도 정해졌다. 액세스 토큰은 Zustand 메모리, 리프레시 토큰은 httpOnly 쿠키이고 쿠키는 백엔드가 아니라 Next Route Handler가 심는다. 아직 정해지지 않은 것은 날짜와 시간 포맷이다. 미결정 항목은 `docs/product/ROADMAP.md`의 미결정 절이 갖는다.

## 리뷰에서 볼 것

- 컴포넌트나 훅 안의 `fetch`
- `shared/api`에 나타난 기능 이름
- `api` 폴더 안의 `invalidateQueries`
- 호출하는 자리에서 손으로 만든 `authorization` 헤더
- `?? []`와 `?? 0`, `?? ""`, 빈 `catch`로 실패를 삼키는 자리
- 화면 파일에서 새로 정의한 서버 응답 타입
- 브라우저 코드에서 `API_BASE_URL`을 읽거나 백엔드 절대 주소를 적은 자리
- `app/api` 아래 동적 세그먼트 Route Handler
