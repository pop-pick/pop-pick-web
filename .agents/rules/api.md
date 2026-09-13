---
description: 서버 호출은 src/shared/api를 거친다. 브라우저는 같은 출처 /api를, 서버는 API_BASE_URL을 부른다. 응답 형식은 백엔드가 정한 것을 그대로 쓰고 실패는 쿼리 에러 상태로 드러낸다
---

# API 호출

## 규칙

**서버 호출은 `src/shared/api`를 거친다.** 컴포넌트와 훅에서 `fetch`를 직접 부르지 않는다. 기능별 엔드포인트 호출은 `src/features/{기능}/api`에 두고 그 안에서 `shared/api`의 래퍼를 쓴다.

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
- 백엔드 주소는 위의 두 경로 표를 따른다. 브라우저 코드가 `API_BASE_URL`을 읽지 않고 서버 코드가 상대 경로를 쓰지 않는다

## 정해진 것과 미정

응답 공통 구조와 에러 코드 체계, 커서 기반 페이지네이션, camelCase 필드 이름, 스펙 문서 위치는 백엔드가 정했다. 상세는 백엔드 Swagger(https://prod.poppick.shop/swagger-ui/index.html)와 백엔드 저장소의 `global/response`, `global/exception` 패키지에 있다. 프론트 쪽 구현은 `src/shared/api/types.ts`와 `errors.ts`다.

날짜와 시간 포맷은 미정이다. 지금 스펙에 날짜 필드가 없다. 정해지기 전에는 그럴듯한 기본값을 채우지 않는다.

## 리뷰에서 볼 것

- 컴포넌트나 훅 안의 `fetch`
- `?? []`와 `?? 0`, `?? ""`, 빈 `catch`로 실패를 삼키는 자리
- 화면 파일에서 새로 정의한 서버 응답 타입
- 브라우저 코드에서 `API_BASE_URL`을 읽거나 백엔드 절대 주소를 적은 자리
- `app/api` 아래 동적 세그먼트 Route Handler
