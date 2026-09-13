# src/shared/api

서버 호출이 전부 거치는 폴더다. 규칙과 그 이유는 `.agents/rules/api.md`에 있다. 이 문서는 폴더에 무엇이 있고 요청이 어떻게 처리되는지, 백엔드가 정한 규약이 무엇인지를 적는다.

## 파일

| 파일        | 담는 것                                                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| `client.ts` | fetch 래퍼 `request<T>()`와 `api.get`과 `post`, `put`, `patch`, `delete`                              |
| `errors.ts` | `ApiError`                                                                                            |
| `types.ts`  | 서버 응답의 공통 타입 `ApiResponse<T>`와 `ErrorMessage`, `PageResponse<T>`, 타입 가드 `isApiResponse` |
| `README.md` | 이 문서                                                                                               |

기능별 엔드포인트 호출과 그 응답 타입은 여기 두지 않는다. `src/features/{기능}/api`에 둔다.

## 들어갈 것

- 쿼리 키 규칙 (`query-keys.ts`). 첫 쿼리를 만들 때 함께 만든다

## 주소

주소가 둘이다. 호출자는 어디서 부르든 백엔드 경로 `/api/v1/...`를 그대로 넘긴다. `/`로 시작하지 않으면 `request`가 던진다.

| 부르는 곳                                          | 주소                                 | 경유                                                                 |
| -------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| 브라우저 (클라이언트 컴포넌트, TanStack Query)     | 같은 출처 상대 경로 `/api/...`       | `next.config.ts` rewrites가 `API_BASE_URL` 뒤에 붙여 백엔드로 넘긴다 |
| 서버 (서버 컴포넌트, Route Handler, Server Action) | `process.env.API_BASE_URL` 절대 주소 | 백엔드 직접                                                          |

`request`가 요청 시점에 `typeof window`로 가른다. 서버에서 `API_BASE_URL`이 비어 있으면 설정 오류라 `ApiError`가 아닌 `Error`를 던진다. 로컬은 `.env.local`에, 배포는 Vercel 환경 변수에 채운다.

환경 변수 이름에 `NEXT_PUBLIC_` 접두사를 붙이지 않는다. 접두사가 붙은 값은 빌드 때 클라이언트 번들에 박혀 재배포 없이 바꾸지 못하고 백엔드 주소가 번들에 노출된다. 브라우저가 같은 출처를 부르면 리프레시 토큰을 httpOnly 쿠키로 받을 때 크로스 사이트 쿠키 설정이 필요 없고 CORS preflight도 나가지 않는다.

서버에서 상대 경로를 쓰면 Next가 자기 자신을 부르게 되고 빌드 시점에는 듣는 서버가 없어 실패한다. 그래서 서버 갈래는 절대 주소만 쓴다.

## 요청과 응답 처리

`request<T>(path, options)`가 하는 일이다. `api.get<T>(path, options)`와 `api.post<T>(path, json, options)`, `put`, `patch`, `delete`는 method만 채운 얇은 진입점이다.

- 모든 요청에 `accept: application/json`을 넣는다. Spring은 accept가 `text/html`이면 오류를 HTML로 낸다. 호출자가 `headers`에 accept를 넘기면 그 값을 쓴다
- `json`이 있으면 `JSON.stringify`해서 보내고 `content-type: application/json`을 넣는다
- `query`는 레코드나 `URLSearchParams`를 받는다. path에 이미 `?x=1`이 있으면 어느 쪽이든 합친다. `null`과 `undefined` 값은 뺀다
- 기본 타임아웃은 10초다. `timeoutMs`로 바꾼다. 호출자가 `signal`을 넘기면 `AbortSignal.any`로 둘을 합쳐 어느 쪽이 먼저 발화해도 요청이 끊긴다
- 2xx 본문이 응답 공통 구조(`ApiResponse<T>`)면 `data`만 `T`로 돌려준다. 화면 코드는 공통 구조의 모양을 모른다
- `data`가 `null`인 성공(로그아웃처럼 백엔드가 `ApiResponse<Unit>`을 내는 자리)은 호출자가 `request<null>`로 받는다
- 204와 빈 본문은 `null`을 돌려준다. 런타임에서 `T`를 검사할 수 없어 `request<null>`이 아닌 호출에도 `null`이 간다. 백엔드가 모든 응답을 공통 구조로 내려주기로 했으니 정상 응답에서는 이 경로를 밟지 않는다

## 실패

실패는 전부 `ApiError`로 던진다. TanStack Query는 `queryFn`이 던져야 `error` 상태가 되므로 값으로 돌려주지 않는다.

| `kind`         | 언제                                                               | `status`  | `errorCode`                                         |
| -------------- | ------------------------------------------------------------------ | --------- | --------------------------------------------------- |
| `http`         | 2xx가 아닌 응답. 2xx인데 `resultType`이 `ERROR`인 응답             | 응답 상태 | 본문이 공통 구조면 `error.errorCode`, 아니면 `null` |
| `network`      | fetch 자체가 거절됨. 연결 실패와 DNS 실패, 잘못된 요청 조합        | 0         | `null`                                              |
| `timeout`      | 타임아웃에 걸림                                                    | 0         | `null`                                              |
| `invalid-body` | 2xx인데 본문이 비어 있지 않으면서 JSON이 아니거나 공통 구조가 아님 | 응답 상태 | `null`                                              |

`url`과 `body`(파싱된 본문 또는 원문 문자열)도 담는다. `message`는 로그용 한국어 한 줄이고 화면에 그대로 보여주는 문구가 아니다. 원인 예외는 `cause`에 있다.

화면 코드는 이렇게 가른다.

```ts
if (error instanceof ApiError && error.errorCode === "E1000") {
	redirectToLogin();
}
```

호출자가 넘긴 `signal`로 취소된 요청은 `ApiError`로 감싸지 않고 원래 `AbortError`를 그대로 다시 던진다. TanStack Query가 취소된 쿼리를 `error` 상태로 두지 않고 이전 상태로 되돌리려면 원래 예외가 필요하다.

## QueryClient 기본 옵션

`src/shared/providers/QueryProvider.tsx`의 `makeQueryClient()`가 서버와 브라우저 QueryClient에 같은 옵션을 준다.

- `retry`: `ApiError`이고 `kind`가 `http`이며 `status`가 400 이상 500 미만이면 재시도하지 않는다. 그 외는 브라우저에서 2회까지 재시도한다. 서버에서는 TanStack 기본과 같이 재시도하지 않는다
- `staleTime`: 30초. 서버에서 hydrate한 데이터가 마운트 직후 다시 조회되는 것을 막는다

## 서버 컴포넌트에서 부를 때

Next 16 서버 컴포넌트의 `fetch` 기본값은 `auto no cache`다. 요청 시점 API를 쓰지 않는 정적 라우트에서는 `next build` 때 한 번 조회한 값이 재배포까지 굳는다. 요청마다 새로 받아야 하면 `options`에 `cache: "no-store"`를 넘긴다. `RequestOptions`가 `RequestInit`을 확장하므로 그대로 통과한다.

## 백엔드가 정한 규약

응답 형식은 백엔드가 정한 것을 그대로 쓴다. 백엔드 저장소 `pop-pick-server`의 `global/response`와 `global/exception` 패키지가 정본이고 `types.ts`의 이름은 그쪽 클래스 이름을 그대로 따른다.

| 항목           | 정해진 것                                                                                                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 응답 공통 구조 | 모든 응답이 `resultType`과 `data`, `error` 세 필드를 가진다. `resultType`은 `SUCCESS` 또는 `ERROR`다. 성공은 `data`에 값이 있고 `error`가 `null`이다. 실패는 `data`가 `null`이고 `error`에 `errorCode`와 `message`, `data`가 있다. 백엔드 `ApiResponse.kt`와 `ErrorMessage.kt` |
| 에러 코드 체계 | HTTP 상태는 에러 종류를 따른다 (400, 401, 404, 500). `resultType`이 `ERROR`면 항상 2xx가 아닌 상태와 함께 온다. 코드는 E400과 E404, E500이 공통, E1000부터 E1013이 인증, E2000이 멤버다. 전체 목록은 백엔드 `ErrorType.kt`                                                     |
| 페이지네이션   | 커서 기반. `PageResponse<T>`는 `content: T[]`와 `hasNext: boolean`을 가진다                                                                                                                                                                                                    |
| 필드 이름 규칙 | camelCase                                                                                                                                                                                                                                                                      |
| 스펙 문서 위치 | Swagger UI `https://prod.poppick.shop/swagger-ui/index.html`, OpenAPI JSON `https://prod.poppick.shop/v3/api-docs`                                                                                                                                                             |

## 아직 정해지지 않은 것

날짜와 시간 포맷이 미정이다. 지금 스펙에 날짜 필드가 없다. 정해지면 이 절을 정해진 내용으로 바꾸고 파싱 위치를 정한다. 그 전에는 그럴듯한 기본값을 채우지 않는다.

인증 방식이 정해지면 적을 것이 있다. 리프레시 토큰을 httpOnly 쿠키로 받는지, 액세스 토큰을 어디에 두는지, 만료 시 refresh를 어디서 처리하는지다. 서버 컴포넌트는 렌더 중에 쿠키를 쓸 수 없어 refresh를 이 래퍼에 두는 설계는 서버에서 성립하지 않는다. 어디에 둘지는 인증 방식이 정해질 때 적는다.

## 백엔드에 확인 중인 것

- Swagger는 `LoginRequest.oauthProvider`라고 적지만 실제 역직렬화는 `oAuthProvider`를 요구한다
- 요청 본문 역직렬화 실패와 필수 헤더 누락이 400이 아니라 500 E500으로 온다
- OPTIONS 응답에 CORS 허용 헤더가 없다. 브라우저가 같은 출처를 부르고 rewrites가 넘기는 구조에서는 preflight가 나가지 않아 지금은 걸리지 않는다

## 시작할 때 읽을 문서

- `AGENTS.md`
- `.agents/rules/api.md`, `.agents/rules/state.md`, `.agents/rules/no-fallback.md`
- `docs/product/ROADMAP.md`의 미결정 절
