# 인증 세션 설계

`features/auth`. 카카오와 구글 소셜 로그인, 토큰 보관과 재발급, 내 정보, 로그인 필요 동작의 가드를 다룬다.

내 정보(`useMe`와 `GET /api/v1/me`)만 설계이고 나머지는 코드에 있다. 설계인 것은 아래에서 설계라고 표시했다.

## R. Requirements

**기능.** 카카오나 구글로 로그인한다. 로그인이 끝나면 원래 가려던 곳으로 바로 간다. 로그아웃한다. 액세스 토큰이 만료되면 사용자가 모르게 재발급한다. 새로고침해도 로그인 상태가 남는다. 로그인이 필요한 동작을 비로그인 상태에서 누르면 로그인 화면으로 보내고 끝나면 하려던 자리로 돌려보낸다. 홈의 팝업 PICK 제목과 취향 일치 문구에 닉네임을 쓴다.

**보장.**

- 인가 코드 교환 요청은 코드 하나에 한 번만 나간다. 개발 모드 StrictMode의 이펙트 이중 실행에서도 그렇다
- 액세스 토큰 만료가 화면의 실패로 드러나지 않는다. 만료된 요청은 재발급 한 번 뒤 다시 보내 성공한다. 재발급까지 실패하면 3초 안에 로그인 화면이 보인다
- 새로고침해도 로그인 상태가 남는다. 앱 시작 때 재발급을 한 번 불러 액세스 토큰을 되살린다
- 리프레시 토큰이 자바스크립트에서 보이지 않는다. httpOnly 쿠키라 `document.cookie`로 읽히지 않는다
- 액세스 토큰이 `localStorage`와 `sessionStorage`에 남지 않는다. 메모리에만 둔다
- 로그인이 끝나면 `next`에 적힌 경로로 돌아간다. `next`가 없으면 홈(`/`)이다
- 콜백 화면에서 다음 화면으로 넘어가기까지 p75 1초 이하다. 교환 요청 하나가 그 시간의 대부분이다

**설계를 가르는 질문.**

- 주도권은 클라이언트에 있다. 프론트가 공급자에서 인가 코드를 받아 백엔드에 넘기고 백엔드가 교환한다. 지속 연결이 없다
- 토큰을 어디에 두는가. 액세스 토큰은 Zustand 메모리, 리프레시 토큰은 httpOnly 쿠키다. 로컬 스토리지는 XSS에 그대로 노출되고 서버가 읽지 못한다. 메모리에만 두면 새로고침에서 세션이 사라진다. 둘을 갈라 액세스는 짧게 살고 노출돼도 만료되는 값으로, 리프레시는 자바스크립트가 닿지 못하는 값으로 둔다
- 쿠키를 누가 굽는가. 프론트의 Next Route Handler가 백엔드 응답 본문의 토큰을 받아 쿠키로 굽는다. 근거는 아래 "쿠키를 Next가 굽는 이유" 절에 있다
- 실패는 종류마다 다른 문구로 드러낸다. 공급자 화면에서 취소하면 `error=access_denied`로 돌아오고 백엔드 실패는 `errorCode`로 갈린다. 원문 메시지를 화면에 내지 않는다
- 서버 컴포넌트는 인증이 필요한 요청을 보내지 않는다. 쿠키에 있는 것은 리프레시 토큰뿐이고 액세스 토큰은 브라우저 메모리에 있다. `RequireAuth`가 감싼 서버 컴포넌트도 비로그인 사용자에게 RSC 페이로드로 내려가므로 사용자 데이터는 가드 안의 클라이언트 컴포넌트가 받는다
- `src/proxy.ts`가 `/my`와 `/planner`, 온보딩 단계(`/onboarding/1`부터 `/onboarding/3`까지. 다른 단계 번호는 로그인을 거치지 않고 바로 404다), 코스 조건 입력(`/planner/new`), 코스(`/courses/{courseId}`와 그 아래 `/saved`) 요청에 리프레시 쿠키가 없으면 페이지를 그리기 전에 `/login?next=`로 보낸다. 쿠키가 있는지만 보는 검사라 쿠키가 있어도 토큰이 거절되면 `RequireAuth`가 보낸다. 데이터를 지키는 검사는 백엔드가 Bearer로 한다

**범위 밖.** 네이버 로그인, 로컬 회원가입, 프로필 편집, 회원 탈퇴, 약관 동의 화면. 약관은 로그인 버튼 아래 안내 상자의 문구로 갈음한다.

## A. Architecture

| 상태               | 원천                                                     | 비고                                                                                                                                            |
| ------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 액세스 토큰        | Zustand 메모리 스토어                                    | persist 없음. 새로고침하면 사라지고 앱 시작 때 재발급으로 되살린다                                                                              |
| 리프레시 토큰      | httpOnly 쿠키 `pp_refresh`                               | Next Route Handler가 심고 지운다. 브라우저 코드와 화면 코드는 값을 보지 못한다                                                                  |
| 인가 코드 교환     | Server. `["auth", "oauth-login", provider, code, state]` | `hooks/useOAuthLogin.ts`. 코드가 키라 코드 하나에 요청이 한 번만 나간다                                                                         |
| 내 정보(닉네임)    | Server. `["me"]`                                         | 설계. 로그인 상태일 때만 조회                                                                                                                   |
| 돌아갈 경로 `next` | URL `/login?next=`와 `sessionStorage`                    | 같은 출처 경로만 허용하고 절대 주소와 `//`로 시작하는 값은 버린다. 주소 규칙은 `shared/model/login-path.ts`, 세션 저장소는 `model/next-path.ts` |
| OAuth `state`      | `sessionStorage`                                         | 인가 흐름 동안만 산다. `model/oauth-state.ts`                                                                                                   |

통신은 요청 응답이다. 브라우저가 부르는 자리는 셋으로 나뉜다. 인가 코드 교환과 재발급, 로그아웃은 같은 출처 Route Handler를 부르고 내 정보는 rewrite를 지나 백엔드로 간다.

### Route Handler 셋

쿠키를 심고 지우는 자리다. `src/app/api/auth/` 아래 정적 경로로 셋을 만든다. 로그인이 `POST /api/auth/session`, 재발급이 `POST /api/auth/refresh`, 로그아웃이 `DELETE /api/auth/session`이다. 로그인과 로그아웃이 같은 자원이라 경로 하나에 메서드 둘로 묶었다. 쿠키를 심는 자리와 지우는 자리가 갈리지 않는다. 각각의 요청과 응답은 아래 Interface 절의 계약 표에 있다.

`/api` 아래 동적 세그먼트 Route Handler는 rewrite에 밀려 닿지 않으므로 정적 경로만 쓴다(`.agents/rules/api.md`).

"Next 서버는 프록시로만 쓰고 비즈니스 로직을 두지 않는다"는 원칙은 이 셋에도 그대로다. 세션 쿠키를 굽는 것은 도메인 규칙이 아니라 전달 계층 일이다. 추천 계산이나 코스 순서 같은 것이 이 폴더로 들어오면 그때는 원칙이 깨진 것이다.

### rewrite 경로

`next.config.ts`의 rewrite는 `/api/v1/:path*`다. 백엔드 API가 전부 `/api/v1/**`이라 좁혀도 닿지 못하는 엔드포인트가 없고, `/api/auth/**` Route Handler와 경로가 겹치지 않는다.

### 흐름

**로그인.**

1. `/login?next=`에서 공급자 버튼을 누른다. `state`를 만들고 `next`를 각각 `sessionStorage`에 둔 뒤 공급자 인가 주소로 이동한다
2. 공급자가 `/auth/{provider}/callback?code=&state=`로 돌려보낸다. `state`를 대조하고 다르면 교환하지 않는다
3. 교환은 `code`를 키로 하는 쿼리로 `POST /api/auth/session`을 부른다. 같은 키는 한 번만 실행되고 StrictMode 재마운트가 캐시를 다시 쓴다. 재시도는 없다. 인가 코드는 일회용이다
4. Route Handler가 리프레시 토큰을 쿠키로 굽고 액세스 토큰만 돌려준다. 액세스 토큰을 스토어에 넣는다
5. `sessionStorage`에서 꺼낸 `next`로 바로 이동한다. 없거나 같은 출처가 아니면 홈(`/`)이다. 시안에 로그인 완료 화면이 없어 두지 않는다
6. 교환이 실패하면 `next`를 꺼내지 않고 남긴다. 실패 화면의 "다시 로그인"은 남은 `next`를 실어 `/login?next=`로 간다. 다시 누른 공급자 버튼이 같은 값을 다시 둔다. 실패 화면의 두 링크는 `replace`로 이동해 콜백 주소가 방문 기록에 남지 않는다

**앱 시작과 새로고침.** `AuthProvider`가 `POST /api/auth/refresh`를 한 번 부른다. 쿠키가 있으면 액세스 토큰을 받아 스토어에 넣고, 없거나 토큰이 거절되면(401이나 `E1000`, `E1011`) 비로그인으로 시작한다. 네트워크 오류나 5xx로 끝나면 로그인 여부를 모르는 `unavailable`이 된다. 로그인한 사용자를 로그인 화면으로 보내지 않기 위해서다. 보호 화면은 이때 오류 문구와 다시 시도 버튼을 보인다. 재발급이 끝나기 전은 `restoring` 상태이고 보호 화면은 스켈레톤을 보인다. 이 한 번의 호출이 새로고침에서 로그아웃되지 않게 하는 전부다.

**재발급.** 브라우저에서만 돈다. Route Handler가 백엔드를 부를 때는 타지 않는다. `request`가 `auth: true`인 요청에 Bearer를 붙인다. 응답이 `E1004`(만료)면 `POST /api/auth/refresh`를 한 번 부르고 같은 요청을 다시 보낸다. 재발급이 동시에 여러 요청에서 필요해지면 진행 중인 재발급 Promise 하나를 공유해 요청은 한 번만 나간다. 재발급이 토큰 거절로 끝나면 스토어를 비우고, 네트워크나 서버 오류로 끝나면 `unavailable`로 둔다. 어느 쪽이든 만료 이벤트를 낸다. 쿠키를 지우는 것은 토큰이 거절된 경우(401이나 `E1011`, `E1000`)뿐이다. 백엔드 장애로 실패했을 때 멀쩡한 쿠키를 지우면 서버가 돌아온 뒤에도 다시 로그인해야 한다. `AuthProvider`가 그 이벤트를 받아 상태가 비로그인일 때만 현재 경로를 `next`에 실어 `/login`으로 보낸다. `RequireAuth`와 같은 주소로 `replace`를 걸어 history에 로그인 화면이 한 번만 남는다.

**로그아웃.** 마이페이지의 `LogoutMenuItem`이 확인 알럿을 띄우고 확인하면 `useLogout`이 `DELETE /api/auth/session`을 부른다. 응답이 성공하든 실패하든 끝나면 아래 넷을 이 순서로 한다.

1. `clearRecentPopups()`로 최근 본 팝업 기록을 비운다
2. `clearSession()`으로 스토어의 토큰과 인증 상태를 비운다
3. `queryClient.removeQueries()`로 쿼리 캐시를 모두 지운다
4. `router.replace("/")`로 홈에 간다

이동을 `useLogout`이 하므로 `RequireAuth`는 이 전이에서 로그인 화면으로 보내지 않는다. Route Handler는 쿠키를 먼저 지우고 백엔드 로그아웃을 부른다. 백엔드 호출이 실패해도 쿠키는 이미 지워졌다. 서버의 블랙리스트 등록이 안 됐을 수 있지만 사용자의 로그아웃 의도를 되돌리지 않는다. 실패는 `[auth]`로 로그를 남긴다. 이 축소 동작은 로그가 있고 화면 상태(비로그인)가 의도와 같다.

### 쿠키를 Next가 굽는 이유

백엔드가 `Set-Cookie`로 내려주는 방식도 있다. 백엔드는 이미 토큰을 응답 본문으로 주게 만들어져 있고, 바꾸려면 백엔드와 협의하고 고치는 데 며칠이 들어 개발 마감(2026-10-04) 안에 끝나지 않는다.

보안 효과는 같다. 리프레시 토큰이 자바스크립트에서 보이지 않는 것이 핵심이고 그 토큰을 누가 쿠키로 굽든 결과가 다르지 않다. 브라우저가 같은 출처로만 나가기 때문에 쿠키도 자연스럽게 붙는다.

나중에 백엔드가 `Set-Cookie`를 내려주기로 하면 Route Handler 셋을 지우고 브라우저가 백엔드를 rewrite로 직접 부르는 자리로 돌아간다. 화면 코드와 스토어는 그대로다.

## D. Data Model

```typescript
// features/auth/model/useAuthStore.ts. 리프레시 토큰 필드가 빠진다
interface AuthState {
	accessToken: string | null;
	status: AuthStatus;
	setAccessToken: (accessToken: string) => void;
	clearSession: () => void;
	markSessionUnavailable: () => void;
}

/** restoring은 앱 시작 재발급 전, unavailable은 서버를 못 읽어 로그인 여부를 모르는 상태 */
type AuthStatus = "restoring" | "anonymous" | "unavailable" | "authenticated";

// features/auth/model/auth.ts
type OAuthProvider = "KAKAO" | "GOOGLE";

/** Route Handler가 돌려주는 것. 리프레시 토큰은 쿠키로 가고 본문에 없다 */
interface SessionResult {
	accessToken: string;
}

/** 로그인 요청 본문. 브라우저의 loginWithOAuth와 Route Handler가 같이 쓴다 */
interface LoginBody {
	oAuthProvider: OAuthProvider;
	authToken: string;
	redirectUri: string;
}

/** 백엔드가 돌려주는 것. Route Handler 안에서만 쓰인다 */
interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

// 설계. features/auth/api/get-me.ts. 백엔드 요구
interface Me {
	memberKey: string;
	email: string;
	nickname: string | null;
}
```

`AuthTokens`는 Route Handler 안에서만 산다. 브라우저 코드가 이 타입을 import하면 리프레시 토큰이 다시 클라이언트로 내려온 것이다.

콜백이 받는 `code`와 `state`, `error`는 `useSearchParams`로 읽고 실패를 문구로 가르는 것은 `model/login-messages.ts`다. 어떤 코드가 어떤 문구가 되는지는 아래 에러 코드 표에 있다.

`nickname`이 `null`이면 "회원님"으로 쓴다. 팀은 로그인 응답에 닉네임을 넣고 프로필 이미지는 받지 않기로 했다. 백엔드 응답에 닉네임이 없어 지금은 `null`이다. 응답이 나오면 닉네임을 로그인 응답에서 받고 `["me"]` 조회를 남길지 이 절에서 정한다.

## I. Interface

**지금 있는 컴포넌트와 훅.** 로그인 버튼은 공급자마다 하나씩 두고 콜백과 교환 훅은 공급자를 받는 하나다. 버튼을 합치지 않은 것은 사용자 결정이다. 버튼 둘은 `model/oauth-provider.ts`에서 인가 주소를 만드는 함수(`buildOAuthRedirectUri`, `buildOAuthAuthorizeUrl`)를 같이 쓰고, 공급자마다 다른 표시 이름과 인가 주소, 콜백 경로, 클라이언트 ID는 같은 파일의 공급자 표에 있다.

| 이름                                    | 계약                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthProvider`                          | 루트 레이아웃이 감싼다. 시작 재발급과 만료 이벤트 구독을 맡는다                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `AuthStatusSwitch`                      | 인증 상태 넷 중 지금 상태에 해당하는 것을 `views`에서 골라 그린다. 인증 상태를 읽지 못하는 서버 컴포넌트 라우트가 쓴다                                                                                                                                                                                                                                                                                                                                                                                     |
| `RequireAuth`                           | `/my`와 `/planner`처럼 화면 전체가 로그인 필요일 때 본문을 감싼다. 제목은 밖에 둔다. 진입할 때 비로그인이거나 `restoring`, `unavailable`에서 비로그인이 되면 `nextPath`를 실어 `router.replace`로 로그인 화면에 보낸다. 로그인 상태에서 비로그인으로 바뀌는 전이는 보내지 않는다. 그 이동은 원인 쪽이 맡는다. 로그아웃은 `useLogout`이 홈으로, 토큰 만료는 `AuthProvider`가 로그인 화면으로 보낸다. `unavailable`이면 `SessionRetry`를 그린다. 확인하는 동안은 `fallback`을, 없으면 기본 스켈레톤을 그린다 |
| `KakaoLoginButton`, `GoogleLoginButton` | `state`를 만들고 `nextPath`를 보관한 뒤 그 공급자의 인가 주소로 이동한다                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `OAuthCallback`                         | `provider`를 받는다. 교환 중이면 `role="status"`, 실패면 `role="alert"`                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `useOAuthLogin`                         | `provider`와 `code`, `state`를 키로 하는 쿼리. 재시도 없음, `staleTime` Infinity                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `useLogout`                             | 로그아웃 뮤테이션. 응답과 무관하게 최근 본 팝업과 세션, 쿼리 캐시를 비우고 홈으로 `replace`한다. 순서는 위 로그아웃 흐름에 있다. 실패는 `[auth]` 로그를 남긴다                                                                                                                                                                                                                                                                                                                                             |
| `LogoutMenuItem`                        | 마이페이지 하단 메뉴의 로그아웃 행. 누르면 확인 알럿을 띄우고(문구는 `docs/product/SPEC.md`의 소셜 로그인 절) 확인하면 `useLogout`을 실행한다. 요청 중에는 행이 "로그아웃 중"으로 비활성이다. 알럿은 공용 `AlertDialog` 기본값 그대로이고 버튼 순서는 `docs/design/DESIGN-SPEC.md`의 마이페이지 절에 있다                                                                                                                                                                                                  |

**인가 요청 파라미터.** 둘 다 `client_id`와 `redirect_uri`, `response_type=code`, `state`를 싣는다. 구글은 `scope=openid email profile`을 더한다. 구글의 `access_type`과 `prompt`는 붙이지 않는다(사용자 결정). 백엔드는 구글 토큰으로 사용자 정보만 읽으므로 구글 리프레시 토큰이 필요 없다.

**설계.** 아래는 아직 코드에 없다.

```typescript
// 로그인 상태일 때만 조회한다. 비로그인이면 data는 undefined이고 요청이 나가지 않는다
export function useMe(): UseQueryResult<Me, ApiError>;
```

**`shared/api`의 계약.** `auth`는 기본 `true`이고 `false`면 Bearer를 붙이지 않는다. `accessToken`을 넘기면 그 값으로 Bearer를 만든다. 서버에는 토큰 소스가 없어 Route Handler가 브라우저에서 받은 토큰을 이 옵션으로 넘긴다. 토큰 소스와 재발급 함수, 만료 이벤트는 `shared/api/auth-token.ts`가, Route Handler의 응답 조립과 Bearer 읽기는 `shared/api/route-handler.ts`가 갖는다.

`request`가 `auth: true`인데 토큰 소스가 `null`을 돌려주면 요청을 보내지 않고 `ApiError`(`kind` http, `status` 401, `errorCode` `E1000`)를 던진다. 화면이 비로그인 상태에서 인증 요청을 보내는 실수를 서버까지 가지 않고 잡는다.

**Route Handler 계약.**

| 메서드와 경로              | 요청                                        | 응답            | 쿠키                   |
| -------------------------- | ------------------------------------------- | --------------- | ---------------------- |
| `POST /api/auth/session`   | `{ oAuthProvider, authToken, redirectUri }` | `SessionResult` | `pp_refresh` 심음      |
| `POST /api/auth/refresh`   | 없음. 쿠키에서 읽는다                       | `SessionResult` | `pp_refresh` 다시 심음 |
| `DELETE /api/auth/session` | 없음. Bearer는 헤더로 받아 백엔드에 넘긴다  | `null`          | `pp_refresh` 지움      |

쿠키가 없는 상태에서 `POST /api/auth/refresh`를 부르면 백엔드를 부르지 않고 401과 `E1000`을 돌려준다. 앱 시작 때 비로그인 사용자가 이 경로로 들어오는 것이 정상 흐름이라 로그를 남기지 않는다.

**서버 API.** Route Handler가 부르는 백엔드 주소다. 브라우저는 이 셋을 직접 부르지 않는다.

| 메서드와 경로               | 요청                                        | 응답         | 상태                                                            |
| --------------------------- | ------------------------------------------- | ------------ | --------------------------------------------------------------- |
| `POST /api/v1/auth/login`   | `{ oAuthProvider, authToken, redirectUri }` | `AuthTokens` | 붙였다. 필드 이름 불일치는 `ARCHITECTURE.md`의 백엔드 요구 목록 |
| `POST /api/v1/auth/refresh` | `{ refreshToken }`                          | `AuthTokens` | 붙였다                                                          |
| `POST /api/v1/auth/logout`  | Bearer, `{ refreshToken }`                  | `null`       | 붙였다                                                          |
| `GET /api/v1/me`            | Bearer                                      | `Me`         | 백엔드 요구. 브라우저가 rewrite로 직접 부른다                   |

**에러 코드와 문구.**

| 코드나 종류                      | 처리                                                                   |
| -------------------------------- | ---------------------------------------------------------------------- |
| `E1004` 만료                     | 화면에 내지 않는다. `request`가 재발급 뒤 재요청                       |
| `E1011` 리프레시 무효            | 스토어 비움, 만료 이벤트. 로그인 화면에 "다시 로그인해 주세요"         |
| `E1000` 인증 필요                | 만료와 같은 경로. 토큰 없는 요청은 `request`가 먼저 막는다             |
| `E1009` 존재하지 않는 OAuth 유저 | "{공급자} 인증에 실패했습니다". 다시 로그인 링크                       |
| `E1001` 인증 실패                | `E1009`와 같다                                                         |
| `access_denied`                  | "로그인을 취소했습니다". 홈과 로그인 링크                              |
| `access_denied` 밖의 공급자 오류 | "{공급자} 로그인에 실패했습니다". 다시 로그인 링크                     |
| `network`, `timeout`             | "연결이 불안정합니다". 다시 로그인 링크. 같은 코드로 재시도하지 않는다 |

`{공급자}` 자리에는 카카오나 구글이 들어간다. 지금은 `E1001`이 오지 않는다. 백엔드 `KakaoAuthenticator`와 `GoogleAuthenticator`가 공급자 토큰 교환 실패까지 `E1009`로 감싸서 프론트는 둘을 가르지 못한다. 백엔드 쪽 수정이 필요하다.

**이벤트.** 모듈 수준 이벤트 하나다. `auth:expired`. 페이로드 없음. `AuthProvider`만 구독한다.

**로그.** `[auth]` 접두사. 재발급 실패로 로그아웃, `state` 불일치, 공급자 오류 코드, 로그아웃 API 실패. 토큰 값은 절대 남기지 않는다. Route Handler의 로그도 같은 접두사를 쓰고 쿠키 값을 찍지 않는다.

**접근성.** 로그인 버튼 텍스트에 공급자 이름이 들어간다. 콜백 처리 중 문구는 `role="status"`, 실패 문구는 `role="alert"`이고 바로 아래에 포커스 가능한 링크가 있다.

## O. Optimization과 운영

**쿠키 속성.**

| 속성       | 값                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| 이름       | `pp_refresh`                                                                                                  |
| `HttpOnly` | 켬. 자바스크립트가 읽지 못한다                                                                                |
| `Secure`   | 켬. 로컬 개발도 `localhost`가 보안 컨텍스트라 그대로 동작한다                                                 |
| `SameSite` | `Lax`. 브라우저가 같은 출처로만 나가므로 `Strict`까지 조일 이유가 없고 외부에서 돌아오는 콜백이 막히지 않는다 |
| `Path`     | `/`. `proxy.ts`가 보호 라우트의 페이지 요청에서 쿠키가 있는지 본다                                            |
| `Max-Age`  | 백엔드 리프레시 토큰 수명과 같게 둔다. 값은 백엔드에 확인한다                                                 |

**표준과 대조한 결과.** Next.js 인증 가이드(16.3.6)와 RFC 9700(OAuth 2.0 보안 BCP), RFC 10017(브라우저 앱 OAuth BCP), 카카오 로그인 REST API 문서, 구글 웹 서버 앱 OAuth 2.0 문서에 댄 결과다.

| 항목                      | 표준                                                                                    | 우리 구현                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 쿠키 옵션과 서버에서 심기 | Next.js 가이드의 권장값과 같다                                                          | 같다                                                                                                                                              |
| 보호 화면                 | 가이드는 `proxy.ts`의 쿠키 검사를 선택으로 두고 보안 검사는 데이터 가까이에 두라고 한다 | `proxy.ts`가 쿠키를 보고 `RequireAuth`가 상태를 보며 데이터는 백엔드가 지킨다                                                                     |
| CSRF                      | RFC 9700은 PKCE를 확인할 수 없으면 `state`를 반드시 쓰라고 한다                         | `state`를 쓴다. 카카오 문서의 인가 요청 파라미터에는 PKCE가 없고 구글 웹 서버 앱 문서도 PKCE 없이 `state`를 권한다                                |
| 토큰 배치                 | RFC 10017은 개인정보를 다루는 앱에 토큰을 브라우저에 두지 않는 BFF를 강하게 권한다      | 액세스 토큰이 브라우저 메모리에 있는 Token-Mediating Backend 배치다. 백엔드가 토큰을 응답 본문으로 주는 계약이라 프론트만으로 BFF로 옮기지 못한다 |
| 인증 라이브러리           | 가이드는 라이브러리를 권한다                                                            | 백엔드가 자체 JWT를 발급해 쓰지 않는다                                                                                                            |
| client secret             | 카카오는 기본으로 켜 두라고 한다                                                        | 교환은 백엔드가 하므로 시크릿 설정도 백엔드가 바꾼다                                                                                              |
| Redirect URI              | RFC 9700은 글자 그대로 일치를 요구한다                                                  | 브랜치마다 주소가 바뀌는 미리보기는 등록되지 않아 로그인할 수 없다. `docs/release/RUNBOOK.md`에 적은 세 주소에서만 된다                           |

**장애.** 공급자가 죽으면 콜백에 `error`가 실려 오거나 돌아오지 않는다. 돌아오지 않는 경우는 우리가 할 것이 없다. 백엔드가 죽으면 교환이 `network`로 끝나고 같은 코드를 다시 쓸 수 없어 "다시 로그인"만 안내한다. Route Handler가 죽으면 로그인과 재발급이 같이 멈춘다. Next 배포가 곧 이 세 경로의 배포다.

**재시도.** 교환 요청은 재시도하지 않는다. 인가 코드가 일회용이라 두 번째 요청은 반드시 실패한다. 재발급은 한 번이고 동시 요청은 하나로 합친다.

**지표.** 재발급 뒤 재요청이 다시 401인 횟수가 0이어야 한다. 0이 아니면 재발급 응답의 토큰이 스토어에 늦게 들어가거나 재요청이 옛 토큰을 읽고 있다. `state` 불일치 횟수도 0이어야 한다. 앱 시작 재발급이 실패하는 비율은 0이 목표가 아니다. 비로그인 방문자가 그만큼 있다는 뜻이다.

**운영.** 카카오 개발자 콘솔과 구글 클라우드 콘솔에 등록할 주소와 설정은 `docs/release/RUNBOOK.md`에 있다. 백엔드가 `Set-Cookie`를 내려주기로 바뀌면 지우는 곳은 Route Handler 셋과 `next.config.ts`의 rewrite 경로 둘이다.
