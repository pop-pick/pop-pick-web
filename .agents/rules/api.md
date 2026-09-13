---
description: 서버 호출은 src/shared/api를 거친다. 브라우저는 같은 출처 /api를, 서버는 API_BASE_URL을 부른다. 응답 형식은 백엔드가 정한 것을 그대로 쓰고 실패는 쿼리 에러 상태로 드러낸다
---

# API 호출

## 규칙

**서버 호출은 `src/shared/api`를 거친다.** 컴포넌트와 훅에서 `fetch`를 직접 부르지 않는다. 기능별 엔드포인트 호출은 `src/features/{기능}/api`에 두고 그 안에서 `shared/api`의 래퍼를 쓴다. 기능 폴더를 어떻게 나누는지는 `structure.md`에 있다.

## 이 규칙이 생긴 이유

백엔드 셋이 API를 나눠 짜면 응답 형태가 갈리고 맞추는 비용은 프론트로 온다. 한 곳을 거치면 규약이 바뀌어도 고칠 자리가 하나다. 화면 코드는 `shared/api`가 내보내는 타입만 보고 서버 응답 모양을 모른다.

## 백엔드 주소는 둘이다

호출하는 자리에 따라 백엔드에 닿는 길이 다르다. 호출자는 어느 쪽이든 백엔드 경로 `/api/v1/...`를 그대로 넘기고, 주소를 가르는 것은 `src/shared/api`의 래퍼 몫이다.

| 부르는 곳                                          | 주소                                 | 경유                                                             |
| -------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------- |
| 브라우저. 클라이언트 컴포넌트와 TanStack Query     | 같은 출처 상대 경로 `/api/...`       | `next.config.ts`의 rewrites가 `${API_BASE_URL}/api/...`로 넘긴다 |
| 서버. 서버 컴포넌트와 Route Handler, Server Action | `process.env.API_BASE_URL` 절대 주소 | 백엔드를 직접 부른다                                             |

서버에서 상대 경로를 쓰면 Next가 자기 자신을 부르게 된다. 빌드 시점에는 듣는 서버가 없어 실패한다.

환경 변수 이름은 `API_BASE_URL`이고 `NEXT_PUBLIC_` 접두사를 붙이지 않는다. 브라우저가 이 값을 알 필요가 없기 때문이고 이유는 셋이다.

- 리프레시 토큰을 httpOnly 쿠키로 받을 때 요청이 같은 출처여야 일이 쉽다. 크로스 사이트 쿠키는 SameSite=None과 Secure, CORS credentials를 전부 맞춰야 하고 사파리의 ITP가 막는다
- 같은 출처 요청에는 CORS preflight가 없다
- 백엔드 주소가 클라이언트 번들에 들어가지 않는다. `NEXT_PUBLIC_` 값은 빌드 때 번들에 박혀 재배포 없이 바꿀 수 없다

`API_BASE_URL`은 `next.config.ts`가 로드될 때 읽히고 비어 있으면 그 자리에서 던진다. `next build`와 `next dev`, `next typegen`이 전부 멈춘다. 값을 어디에 두는지는 `docs/release/RUNBOOK.md`의 환경 변수 절에 있다.

Next 서버는 프록시로만 쓴다. Route Handler로 프록시를 손으로 짜지 않고 비즈니스 로직을 두지 않는다. rewrites로 충분하다.

## Route Handler와 rewrite의 순서

Next는 요청을 headers, redirects, proxy, beforeFiles rewrites, 파일시스템 라우트(`public`과 `_next/static`, `app`), afterFiles rewrites, 동적 라우트, fallback rewrites 순서로 본다. `rewrites()`가 배열을 돌려주면 afterFiles다. 그래서 `app/api/auth/callback/route.ts` 같은 정적 경로 Route Handler는 `/api/:path*` rewrite보다 먼저 잡히고 나중에 만들어도 충돌하지 않는다. `app/api/[...slug]/route.ts` 같은 동적 세그먼트 Route Handler는 afterFiles 뒤 순서라 rewrite에 밀려 닿지 않는다.

**`/api` 아래 Route Handler는 정적 경로로만 만든다.** 출처는 https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites 와 https://nextjs.org/docs/app/api-reference/file-conventions/proxy 의 Execution order 절이다.

## 응답 형식은 백엔드가 정한다

응답 형식은 백엔드가 정한 것을 그대로 쓴다. 프론트가 원하는 모양을 들고 가서 협의하지 않는다. 형식을 두고 다투는 비용이 얻는 것보다 크다. 대신 둘을 요구한다.

- 백엔드 셋이 모든 엔드포인트를 같은 모양으로 내려준다
- Swagger 스펙을 공유한다. 스펙에서 타입을 만들면 손으로 옮겨 적지 않아도 되고 스펙이 바뀌면 빌드가 깨져서 바로 안다

## 래퍼가 지키는 것

- fetch 래퍼는 하나다. Next.js `fetch`를 얇게 감싸고 별도 HTTP 라이브러리를 쓰지 않는다
- 서버 응답의 공통 타입은 `shared/api`에 모아 둔다. 화면 파일에서 응답 타입을 새로 정의하지 않는다
- 실패는 TanStack Query의 `error` 상태로 드러낸다. 빈 배열이나 기본값으로 바꾸지 않는다. 기준은 `no-fallback.md`
- 백엔드 주소는 위의 두 경로 표를 따른다

## 기능의 api 폴더

**엔드포인트 하나에 파일 하나다.** 파일 이름은 그 동작을 그대로 적은 케밥 케이스다. `login-with-kakao.ts`, `get-popups.ts`, `create-course.ts`처럼 쓴다. 한 파일에 여러 엔드포인트를 모으면 어느 화면이 무엇을 부르는지 import만 보고 알 수 없다.

**파일 하나가 담는 것은 셋이다.** 요청과 응답 타입, `shared/api`의 래퍼를 부르는 함수, 그리고 조회면 `queryOptions`다. 셋을 한 파일에 두면 키와 함수가 갈라지지 않는다.

```ts
import { queryOptions } from "@tanstack/react-query";

import { api } from "@/shared/api/client";

export interface PopupListFilters {
	region: Region | null;
	category: PopupCategory | null;
}

export function getPopups(filters: PopupListFilters) {
	return api.get<PageResponse<PopupSummary>>("/api/v1/popups", { query: filters });
}

export function popupListQuery(filters: PopupListFilters) {
	return queryOptions({
		queryKey: ["popups", "list", filters],
		queryFn: () => getPopups(filters)
	});
}
```

`queryOptions`를 쓰는 이유는 타입 때문이다. 옵션 객체를 그냥 상수로 빼면 TypeScript가 `staleTime` 오타를 잡지 못하고 `getQueryData`의 반환 타입도 `unknown`이 된다. `queryOptions`로 감싸면 키에 반환 타입이 붙어 `useQuery`와 `prefetchQuery`, `useSuspenseQuery`, `getQueryData`가 전부 같은 타입을 본다.

**쿼리 키를 모으는 공용 파일을 만들지 않는다.** 키는 그 키를 쓰는 `queryOptions` 옆에 있다. 키만 따로 모으면 키를 고칠 때 함수를 같이 고쳐야 하는지 알 수 없다. 무효화는 앞 조각을 그대로 적는다. `queryClient.invalidateQueries({ queryKey: ["popups"] })`처럼 쓴다.

**키의 첫 조각은 기능 이름, 둘째는 종류, 셋째부터 식별자와 필터다.** `["popups", "list", filters]`와 `["popups", "detail", popupId]` 형태다.

**변경은 `queryOptions`가 아니라 훅으로 낸다.** `useMutation`을 감싼 훅을 `hooks/use{동작}.ts`에 두고 성공했을 때 무효화할 키를 그 안에 적는다.

**서버 컴포넌트는 미리 받아 두는 자리다.** 서버 컴포넌트에서 데이터를 받아 화면에 바로 쓰지 않고 `prefetchQuery`로 받아 `HydrationBoundary`로 넘긴다. 그래야 같은 데이터를 클라이언트가 다시 받지 않는다. 이때 `staleTime`이 0이면 마운트 직후 다시 조회하므로 0보다 커야 한다. 저장소 기본값은 `QueryProvider`의 30초다.

**서버 컴포넌트가 Route Handler를 부르지 않는다.** 빌드 시점에는 듣는 서버가 없어 실패하고 런타임에도 왕복이 하나 늘 뿐이다. 원천을 직접 부른다.

## 정해진 것과 미정

응답 공통 구조와 에러 코드 체계, 커서 기반 페이지네이션, camelCase 필드 이름, 스펙 문서 위치는 백엔드가 정했다. 상세는 백엔드 Swagger(https://prod.poppick.shop/swagger-ui/index.html)와 백엔드 저장소의 `global/response`, `global/exception` 패키지에 있다. 프론트 쪽 구현은 `src/shared/api/types.ts`와 `errors.ts`다.

아직 정해지지 않은 것은 날짜와 시간 포맷이다. 지금 스펙에 날짜 필드가 없다. 미결정 항목은 `docs/product/ROADMAP.md`의 미결정 절이 갖는다.

## 리뷰에서 볼 것

- 컴포넌트나 훅 안의 `fetch`
- `?? []`와 `?? 0`, `?? ""`, 빈 `catch`로 실패를 삼키는 자리
- 화면 파일에서 새로 정의한 서버 응답 타입
- 브라우저 코드에서 `API_BASE_URL`을 읽거나 백엔드 절대 주소를 적은 자리
- `app/api` 아래 동적 세그먼트 Route Handler
