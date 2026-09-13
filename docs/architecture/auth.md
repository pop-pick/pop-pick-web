# 인증 세션 설계

`features/auth`. 카카오와 구글 소셜 로그인, 토큰 보관과 재발급, 내 정보, 로그인 필요 동작의 가드를 다룬다. PR 13 골격과 PR 16의 `shared/api` 계약, `auth` 보강 브리프(필드 이름 수정, `state` 파라미터, 콜백 이중 실행 방지, persist 제거) 위에서 쓴다. 그 브리프가 정한 것은 되풀이하지 않고 그 뒤에 남는 구조만 적는다.

## R. Requirements

**기능.** 카카오나 구글로 로그인한다. 로그아웃한다. 액세스 토큰이 만료되면 사용자가 모르게 재발급한다. 로그인이 필요한 동작을 비로그인 상태에서 누르면 로그인 화면으로 보내고 끝나면 하려던 자리로 돌려보낸다. 홈 인사 헤더에 닉네임을 보인다.

**보장.**

- 인가 코드 교환 요청은 코드 하나에 한 번만 나간다. 개발 모드 StrictMode의 이펙트 이중 실행에서도 그렇다
- 액세스 토큰 만료가 화면의 실패로 드러나지 않는다. 만료된 요청은 재발급 한 번 뒤 다시 보내 성공한다. 재발급까지 실패하면 3초 안에 로그인 화면이 보인다
- 로그인이 끝나면 `next`에 적힌 경로로 돌아간다. `next`가 없으면 `/home`이다
- 토큰이 `localStorage`와 `sessionStorage`에 남지 않는다. 리프레시 토큰이 httpOnly 쿠키로 오기 전까지 둘 다 메모리에만 둔다
- 콜백 화면에서 다음 화면으로 넘어가기까지 p75 1초 이하다. 교환 요청 하나가 그 시간의 대부분이다

**설계를 가르는 질문.**

- 주도권은 클라이언트에 있다. 프론트가 공급자에서 인가 코드를 받아 백엔드에 넘기고 백엔드가 교환한다(9/3 결정). 지속 연결이 없다
- 실패는 종류마다 다른 문구로 드러낸다. 공급자 화면에서 취소하면 `error=access_denied`로 돌아오고 백엔드 실패는 `errorCode`로 갈린다. 원문 메시지를 화면에 내지 않는다
- 새로고침하면 로그아웃 상태다. 토큰이 메모리에만 있어서다. 쿠키가 오면 앱 시작 때 재발급 한 번으로 세션을 되살린다. 이 차이가 `AuthProvider`의 시작 단계 하나로 격리된다
- 서버 컴포넌트는 인증이 필요한 요청을 보내지 않는다. 토큰이 서버에 없다

**범위 밖.** 네이버 로그인, 로컬 회원가입, 프로필 편집, 회원 탈퇴, 약관 동의 화면. 약관은 로그인 버튼 아래 고지문으로 갈음한다(9/12 피그마).

## A. Architecture

| 상태                             | 원천                       | 비고                                                               |
| -------------------------------- | -------------------------- | ------------------------------------------------------------------ |
| 액세스 토큰, 리프레시 토큰, 상태 | Zustand 메모리 스토어      | persist 없음. 쿠키가 오면 리프레시 토큰 필드를 뺀다                |
| 내 정보(닉네임, 프로필 이미지)   | Server. `queryKeys.me()`   | 로그인 상태일 때만 조회                                            |
| 돌아갈 경로 `next`               | URL `/login?next=`         | 같은 출처 경로만 허용한다. 절대 주소와 `//`로 시작하는 값은 버린다 |
| OAuth `state`                    | `sessionStorage`           | 인가 흐름 동안만 산다. 브리프 C가 정했다                           |
| 로그인 뒤 보낼 온보딩 답         | onboarding 스토어(persist) | `onboarding.md`                                                    |

통신은 요청 응답이다. 로그인과 재발급, 로그아웃, 내 정보 넷이다.

**로그인 흐름.**

1. `/login?next=`에서 공급자 버튼을 누른다. `state`를 만들어 `sessionStorage`에 두고 `next`도 같은 자리에 함께 둔다. 공급자 인가 주소로 이동한다
2. 공급자가 `/auth/{provider}/callback?code=&state=`로 돌려보낸다. `state`를 대조하고 다르면 교환하지 않는다
3. 교환은 `code`를 키로 하는 쿼리로 부른다. 같은 키는 한 번만 실행되고 StrictMode 재마운트가 캐시를 다시 쓴다. 재시도는 없다. 인가 코드는 일회용이다
4. 토큰을 스토어에 넣는다. onboarding 스토어에 답이 있으면 취향 저장을 부르고 성공하면 로컬을 지운다
5. `sessionStorage`의 `next`로 `router.replace`한다

**재발급 흐름.** `request`가 `auth: true`인 요청에 Bearer를 붙인다. 응답이 `E1004`(만료)면 재발급을 한 번 부르고 같은 요청을 다시 보낸다. 재발급이 동시에 여러 요청에서 필요해지면 진행 중인 재발급 Promise 하나를 공유해 요청은 한 번만 나간다. 재발급이 `E1011`(무효나 재사용된 리프레시 토큰)이나 다른 실패로 끝나면 스토어를 비우고 만료 이벤트를 낸다. `AuthProvider`가 그 이벤트를 받아 현재 경로를 `next`에 실어 `/login`으로 보낸다.

**로그아웃 흐름.** 로그아웃 API를 부르고 응답과 무관하게 스토어를 비운다. API가 실패하면 `[auth]`로 로그를 남긴다. 서버의 블랙리스트 등록이 안 됐을 수 있지만 사용자의 로그아웃 의도를 되돌리지 않는다. 이 축소 동작은 로그가 있고 화면 상태(비로그인)가 의도와 같다.

**시작 흐름.** 지금은 `anonymous`로 시작한다. 쿠키가 오면 `AuthProvider`가 시작 때 재발급을 한 번 시도하는 `restoring` 단계가 생기고 그동안 보호 화면은 스켈레톤을 보인다. 이 단계는 지금 만들지 않는다.

## D. Data Model

```typescript
// features/auth/useAuthStore.ts
type AuthStatus = "anonymous" | "authenticated";

interface AuthState {
	accessToken: string | null;
	/** 리프레시 토큰이 httpOnly 쿠키로 오면 이 필드를 없앤다 */
	refreshToken: string | null;
	status: AuthStatus;
	setTokens: (tokens: AuthTokens) => void;
	clear: () => void;
}

// features/auth/api/auth.ts (PR 16)
interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

type OAuthProvider = "KAKAO" | "GOOGLE";

// features/auth/api/me.ts. 백엔드 요구
interface Me {
	memberKey: string;
	email: string;
	nickname: string | null;
	profileImageUrl: string | null;
}

// features/auth/model/callback.ts
interface OAuthCallbackParams {
	code: string | null;
	state: string | null;
	error: string | null;
	errorDescription: string | null;
}

type AuthFailure =
	| { kind: "provider-cancelled" }
	| { kind: "state-mismatch" }
	| { kind: "unknown-user" } // E1009
	| { kind: "auth-failed" } // E1001
	| { kind: "network" }
	| { kind: "unexpected"; errorCode: string | null };
```

`nickname`이 `null`이면 홈 인사 헤더는 닉네임 없는 문구를 쓴다. 백엔드 엔티티에 닉네임이 아직 없어 `null`이 정상 상태일 수 있다.

## I. Interface

**컴포넌트와 훅.**

```typescript
// 루트 레이아웃이 감싼다. 토큰 소스를 shared/api에 등록하고 만료 이벤트를 구독한다
export function AuthProvider({ children }: { children: ReactNode });

// 공급자 버튼 하나. state 생성과 next 보관, 인가 주소 이동
export function SocialLoginButton({ provider, next }: { provider: OAuthProvider; next: string | null });

// 콜백 화면. status가 exchanging이면 role=status, failed면 role=alert
export function OAuthCallback({ provider }: { provider: OAuthProvider });

export function useAuthStore(): AuthState;

// 로그인 상태일 때만 조회한다. 비로그인이면 data는 undefined이고 요청이 나가지 않는다
export function useMe(): UseQueryResult<Me, ApiError>;

// 비로그인이면 /login?next=로 보내고 false를 돌려준다. 찜 버튼과 코스 만들기 버튼이 부른다
export function useRequireAuth(): { ensure: (next: string) => boolean };

// /my처럼 화면 전체가 로그인 필요일 때 감싼다. 비로그인이면 redirect
export function RequireAuth({ children, next }: { children: ReactNode; next: string });
```

**`shared/api`에 더하는 계약.**

```typescript
// shared/api/auth-token.ts
export function setAccessTokenSource(source: () => string | null): void;
export function setRefreshHandler(handler: () => Promise<boolean>): void;
export function subscribeAuthExpired(listener: () => void): () => void;

// shared/api/client.ts의 RequestOptions에 더한다
interface RequestOptions {
	/** true면 Bearer를 붙이고 E1004에 재발급 한 번 뒤 재요청한다. 기본 false */
	auth?: boolean;
}
```

`request`가 `auth: true`인데 토큰 소스가 `null`을 돌려주면 요청을 보내지 않고 `ApiError`(`kind` http, `status` 401, `errorCode` `E1000`)를 던진다. 화면이 비로그인 상태에서 인증 요청을 보내는 실수를 서버까지 가지 않고 잡는다.

**서버 API.**

| 메서드와 경로               | 요청                                        | 응답         | 상태                               |
| --------------------------- | ------------------------------------------- | ------------ | ---------------------------------- |
| `POST /api/v1/auth/login`   | `{ oAuthProvider, authToken, redirectUri }` | `AuthTokens` | 있음. 필드 이름 불일치는 요구 목록 |
| `POST /api/v1/auth/refresh` | `{ refreshToken }`                          | `AuthTokens` | 있음. 쿠키가 오면 바디 없음        |
| `POST /api/v1/auth/logout`  | Bearer, `{ refreshToken }`                  | `null`       | 있음                               |
| `GET /api/v1/me`            | Bearer                                      | `Me`         | 요구                               |

**에러 코드와 문구.**

| 코드나 종류                      | 처리                                                                   |
| -------------------------------- | ---------------------------------------------------------------------- |
| `E1004` 만료                     | 화면에 내지 않는다. `request`가 재발급 뒤 재요청                       |
| `E1011` 리프레시 무효            | 스토어 비움, 만료 이벤트. 로그인 화면에 "다시 로그인해 주세요"         |
| `E1000` 인증 필요                | 만료와 같은 경로. 토큰 없는 요청은 `request`가 먼저 막는다             |
| `E1009` 존재하지 않는 OAuth 유저 | 콜백 실패 화면 문구. 다시 로그인 링크                                  |
| `E1001` 인증 실패                | 콜백 실패 화면 문구. 다시 로그인 링크                                  |
| `access_denied`                  | "로그인을 취소했습니다". 홈과 로그인 링크                              |
| `network`, `timeout`             | "연결이 불안정합니다". 다시 로그인 링크. 같은 코드로 재시도하지 않는다 |

**이벤트.** 모듈 수준 이벤트 하나다. `auth:expired`. 페이로드 없음. `AuthProvider`만 구독한다.

**로그.** `[auth]` 접두사. 재발급 실패로 로그아웃, `state` 불일치, 공급자 오류 코드, 로그아웃 API 실패. 토큰 값은 절대 남기지 않는다.

**접근성.** 로그인 버튼은 `<button>`이고 텍스트가 공급자 이름을 포함한다. 콜백 처리 중 문구는 `role="status"`와 `aria-live="polite"`다. 실패 문구는 `role="alert"`이고 바로 아래에 포커스 가능한 링크가 있다. 약관 고지문은 버튼과 같은 landmark 안에 둔다.

## O. Optimization과 운영

**장애.** 공급자가 죽으면 콜백에 `error`가 실려 오거나 돌아오지 않는다. 돌아오지 않는 경우는 우리가 할 것이 없다. 백엔드가 죽으면 교환이 `network`로 끝나고 같은 코드를 다시 쓸 수 없어 "다시 로그인"만 안내한다.

**재시도.** 교환 요청은 재시도하지 않는다. 재발급은 한 번이고 동시 요청은 하나로 합친다. `QueryProvider` 기본 재시도(4xx 제외 2회)는 `useMe`에 그대로 적용된다.

**지표.** 재발급 뒤 재요청이 다시 401인 횟수가 0이어야 한다. 0이 아니면 재발급 응답의 토큰이 스토어에 늦게 들어가거나 재요청이 옛 토큰을 읽고 있다. `state` 불일치 횟수도 0이어야 한다.

**운영.** 카카오 개발자 콘솔에 콜백 주소를 프로덕션과 develop 별칭, localhost 셋에 등록한다(RUNBOOK). 구글은 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`를 더하고 콜백 `/auth/google/callback`을 구글 콘솔에 등록한다. 쿠키 전환 때 바뀌는 곳은 스토어의 리프레시 토큰 필드와 재발급 요청 바디, `AuthProvider`의 시작 단계 셋이다. 브리프 C가 요청하는 쿠키 `Path`는 `/api/v1/auth`라 페이지 요청에는 쿠키가 실리지 않는다. `proxy.ts`로 보호 라우트를 옮기려면 `Path`를 `/`로 받아야 하고 그 전까지 가드는 클라이언트에 있다.
