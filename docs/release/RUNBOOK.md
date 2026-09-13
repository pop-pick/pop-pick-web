# 운영 안내서

배포와 장애 대응, 운영 절차를 적는다.

## 배포

Vercel에 배포한다. `main`이 프로덕션이다. `develop`과 `feature` 브랜치의 PR에는 미리보기 URL이 만들어진다. 디자이너와 PM이 PR마다 미리보기 URL로 확인한다.

PR은 CI(`.github/workflows/ci.yaml`) 통과 뒤에만 머지된다. Vercel 배포는 CI와 별개로 푸시마다 돈다.

| 항목             | 값                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Vercel 프로젝트  | `pop-pick-web` (팀 `chan9yus-projects`, Hobby)                                                              |
| 대시보드         | https://vercel.com/chan9yus-projects/pop-pick-web                                                           |
| GitHub 연결      | `pop-pick/pop-pick-web`. 푸시마다 자동 배포                                                                 |
| 프로덕션 브랜치  | `main`                                                                                                      |
| 프로덕션 URL     | https://pop-pick-web.vercel.app                                                                             |
| `main` 별칭      | https://pop-pick-web-git-main-chan9yus-projects.vercel.app                                                  |
| `develop` 별칭   | https://pop-pick-web-git-develop-chan9yus-projects.vercel.app                                               |
| 브랜치 별칭 규칙 | `pop-pick-web-git-{브랜치 이름}-chan9yus-projects.vercel.app`. 브랜치가 살아 있는 동안 같은 주소를 유지한다 |
| 빌드             | `pnpm run build`(Turbopack), Node 24.x, 빌드 캐시 사용                                                      |

배포마다 `pop-pick-{해시}-chan9yus-projects.vercel.app` 형태의 고유 주소도 따로 생긴다. 특정 배포를 가리킬 때만 쓰고 공유에는 브랜치 별칭을 쓴다.

프로젝트가 개인 계정(Hobby)에 있어 대시보드는 계정 주인만 본다.

미리보기 URL은 누구나 열 수 있다. Vercel이 기본으로 켜 두는 미리보기 인증 보호(Vercel Authentication)를 꺼 뒀다. 공개 서비스이고 미리보기에 비밀이 없어서다. 비밀번호 보호와 Trusted IP도 꺼져 있다. 설정 위치는 대시보드의 Settings 아래 Deployment Protection이다.

## 환경 변수

`.env*` 파일은 커밋하지 않는다. `.gitignore`에 있고 예외는 `.env.example` 하나다. `.env.example`에 같은 이름과 설명이 있다. 로컬은 `.env.local`에, 배포는 Vercel 프로젝트 설정에 값을 둔다.

| 변수                          | 용도                                                                                                                                            | 값과 받는 곳                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `API_BASE_URL`                | 백엔드 API 주소. `next.config.ts`의 `/api` rewrite 목적지와 서버 컴포넌트의 직접 호출에 쓴다. 서버와 빌드에서만 읽히고 브라우저에는 가지 않는다 | `https://prod.poppick.shop`. Vercel 프로젝트 설정에 등록한다 |
| `NEXT_PUBLIC_KAKAO_MAP_KEY`   | 카카오맵 JavaScript 키                                                                                                                          | 카카오 개발자 콘솔의 팝픽 앱에서 받는다                      |
| `NEXT_PUBLIC_KAKAO_CLIENT_ID` | 카카오 로그인 REST API 키. redirect_uri는 `{배포 도메인}/auth/kakao/callback`으로 콘솔에 등록한다                                               | 카카오 개발자 콘솔의 팝픽 앱에서 받는다                      |

`API_BASE_URL`은 Vercel 대시보드의 Settings 아래 Environment Variables에 등록한다. Production과 Preview 둘 다에 넣어야 미리보기 배포도 빌드된다. 등록 전에 rewrites 변경이 머지되면 `next.config.ts`가 로드되는 시점에 던져 Vercel 빌드가 실패한다.

`NEXT_PUBLIC_` 변수는 빌드 시점에 번들에 박힌다. 로컬에서 값을 바꾸면 개발 서버를 다시 띄워야 반영된다. `API_BASE_URL`도 빌드 시점 변수다. 이름에 `NEXT_PUBLIC_`이 없지만 `next.config.ts`가 로드될 때 읽히므로 값을 바꾸면 다시 빌드해야 하고 개발 서버도 다시 띄워야 한다.

`pnpm type:check`의 `next typegen`도 `next.config.ts`를 로드한다. 그래서 lefthook pre-push 훅은 `.env.local`에 `API_BASE_URL`이 없으면 실패한다. CI는 워크플로의 `env`에서 같은 값을 받는다.

도보 경로 조회에 쓰는 REST API 키는 브라우저에 노출하면 안 되므로 `NEXT_PUBLIC_` 접두사 없이 서버에만 둔다. 경로 조회를 Next 서버 라우트가 부를지 백엔드가 부를지 정해진 뒤 변수 이름을 정하므로 지금은 표에 없다.

## 카카오 개발자 콘솔

카카오맵용 앱은 팝픽 앱 하나만 쓴다. 무료 쿼터가 계정에서 처음 카카오맵을 켠 앱 하나에만 붙고 한 번 정해지면 비활성화해도 되돌아가지 않는다. 새 앱을 만들면 그 앱은 쿼터를 못 받는다. 팝픽 앱이 쿼터를 갖고 있다.

카카오맵 사용 설정은 앱의 제품 설정에서 켠다. 심사가 없다. 팝픽 앱은 켜져 있다.

JavaScript 키는 등록한 도메인에서만 동작한다. 등록 위치는 플랫폼 키 화면의 JavaScript 키 항목에 있는 JavaScript SDK 도메인이다. 등록할 주소는 셋이다.

- 프로덕션 URL
- `develop` 브랜치 별칭. 브랜치가 살아 있는 동안 바뀌지 않아 통합 브랜치 미리보기에서 지도가 뜬다
- 로컬 개발 주소 `http://localhost:3000`

배포마다 생기는 고유 주소는 매번 달라 등록 대상이 아니다. feature 브랜치 미리보기에서도 지도를 봐야 하면 그 브랜치 별칭을 그때 등록한다.

### 카카오 로그인 Redirect URI

카카오 로그인은 인가 요청의 `redirect_uri`가 콘솔에 등록된 주소와 글자 단위로 같아야 인가 코드를 돌려준다. 프론트는 `redirect_uri`를 접속한 출처(`window.location.origin`)에 `/auth/kakao/callback`을 붙여 만들므로 사용자가 접속하는 주소마다 등록해야 한다. 등록 위치는 앱의 제품 설정 아래 카카오 로그인 화면의 Redirect URI 항목이다.

등록할 주소는 셋이다.

- `https://pop-pick-web.vercel.app/auth/kakao/callback`
- `https://pop-pick-web-git-develop-chan9yus-projects.vercel.app/auth/kakao/callback`
- `http://localhost:3000/auth/kakao/callback`

배포마다 생기는 고유 주소와 feature 브랜치 별칭은 등록 대상이 아니다. 등록되지 않은 주소에서 로그인을 시작하면 카카오 인가 화면이 KOE006 오류를 내고 콜백으로 돌아오지 않는다. feature 브랜치 미리보기에서 로그인을 확인해야 하면 그 브랜치 별칭을 그때 등록한다. 로컬에서 3000이 아닌 포트를 쓸 때도 그 포트 주소를 따로 등록한다.

### 쿼터

| 대상           | 하루 무료 한도 |
| -------------- | -------------- |
| 도보 경로 조회 | 1,000건        |
| 지도 SDK       | 300,000건      |

경로 조회 1,000건이 플래너의 제약이다. 팝업 세 곳 코스가 구간 둘이라 호출 두 번이고 하루 500코스까지 무료 안에서 돈다. 사용자가 같은 코스를 여러 번 열면 그만큼 깎인다.

경로 조회 응답은 저장하지 않는다. 카카오가 REST API 응답의 임시 저장을 허용하지 않는다고 데브톡에서 답했다. 코스는 팝업 ID와 방문 순서만 저장하고 소요시간은 열 때마다 다시 부른다. 화면 표시 규칙은 `docs/product/SPEC.md`에 있다.

## 도메인

미정이다. 팀이 구매하고 데모데이 전까지 Vercel에 연결한다.

## 백엔드 API 주소

운영 주소는 https://prod.poppick.shop 이다. Swagger UI는 https://prod.poppick.shop/swagger-ui/index.html 에, OpenAPI JSON은 https://prod.poppick.shop/v3/api-docs 에 있다. 브라우저는 이 주소를 직접 부르지 않고 같은 출처 `/api` 경로를 부르며 `next.config.ts`의 rewrite가 이 주소로 넘긴다. 두 경로의 규칙은 `.agents/rules/api.md`에 있다.

## 롤백

Vercel 대시보드의 Deployments 목록에서 이전 배포를 프로덕션으로 승격한다.

## 장애가 났을 때 확인 순서

1. Vercel 배포 로그. 빌드가 실패했는지, 어느 커밋이 배포됐는지
2. 브라우저 콘솔. 클라이언트 오류와 실패한 요청
3. 백엔드 상태. API 응답이 오는지. `curl -i https://prod.poppick.shop/actuator/health`가 200을 돌려주는지 먼저 본다. 인증이 필요한 경로에 토큰 없이 가면 401과 `E1000`이 오는 것이 정상 응답이다
4. 카카오맵 SDK. `NEXT_PUBLIC_KAKAO_MAP_KEY`가 비었는지, 접속한 도메인이 콘솔에 등록됐는지. 개발자 도구 네트워크 탭에서 `sdk.js` 응답 본문의 `errorType`과 `message`를 보면 원인이 나온다

## 데이터 운영

팝업 데이터는 백엔드 파이프라인이 모은다. 원천은 카카오맵 키워드 검색과 Perplexity API, 서울 열린데이터 광장 셋이고 1차 출처는 미정이다. 갱신 주기와 담당도 미정이다.

팝업은 회전이 빠르다. 데모데이(2026-10-17) 직전에 한 번 갱신하는 일정이 필요하다.

## 보안 헤더

`next.config.ts`에서 설정한다. X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy 넷이다. Permissions-Policy로 카메라와 마이크, 위치 권한을 막는다.
