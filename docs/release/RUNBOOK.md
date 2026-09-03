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

`.env*` 파일은 커밋하지 않는다. `.gitignore`에 있고 예외는 `.env.example` 하나다. `.env.example`에 같은 이름이 비어 있다. 로컬은 `.env.local`에, 배포는 Vercel 프로젝트 설정에 값을 둔다.

| 변수                        | 용도                     | 어디서 받는가                           |
| --------------------------- | ------------------------ | --------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`  | 백엔드 API 주소. 값 미정 | 백엔드 셋에게 받는다                    |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | 카카오맵 JavaScript 키   | 카카오 개발자 콘솔의 팝픽 앱에서 받는다 |

`NEXT_PUBLIC_` 변수는 빌드 시점에 번들에 박힌다. 로컬에서 값을 바꾸면 개발 서버를 다시 띄워야 반영된다.

도보 경로 조회에 쓰는 REST API 키는 브라우저에 노출하면 안 되므로 `NEXT_PUBLIC_` 접두사 없이 서버에만 둔다. 경로 조회를 Next 서버 라우트가 부를지 백엔드가 부를지 정해진 뒤 변수 이름을 정하므로 지금은 표에 없다.

## 카카오 개발자 콘솔

카카오맵용 앱은 팝픽 앱 하나만 쓴다. 무료 쿼터가 계정에서 처음 카카오맵을 켠 앱 하나에만 붙고 한 번 정해지면 비활성화해도 되돌아가지 않는다. 새 앱을 만들면 그 앱은 쿼터를 못 받는다. 팝픽 앱이 쿼터를 갖고 있다.

카카오맵 사용 설정은 앱의 제품 설정에서 켠다. 심사가 없다. 팝픽 앱은 켜져 있다.

JavaScript 키는 등록한 도메인에서만 동작한다. 등록 위치는 플랫폼 키 화면의 JavaScript 키 항목에 있는 JavaScript SDK 도메인이다. 등록할 주소는 셋이다.

- 프로덕션 URL
- `develop` 브랜치 별칭. 브랜치가 살아 있는 동안 바뀌지 않아 통합 브랜치 미리보기에서 지도가 뜬다
- 로컬 개발 주소 `http://localhost:3000`

배포마다 생기는 고유 주소는 매번 달라 등록 대상이 아니다. feature 브랜치 미리보기에서도 지도를 봐야 하면 그 브랜치 별칭을 그때 등록한다.

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

미정이다. 백엔드 클라우드와 배포 방식이 정해지지 않았다.

## 롤백

Vercel 대시보드의 Deployments 목록에서 이전 배포를 프로덕션으로 승격한다.

## 장애가 났을 때 확인 순서

1. Vercel 배포 로그. 빌드가 실패했는지, 어느 커밋이 배포됐는지
2. 브라우저 콘솔. 클라이언트 오류와 실패한 요청
3. 백엔드 상태. API 응답이 오는지
4. 카카오맵 SDK. `NEXT_PUBLIC_KAKAO_MAP_KEY`가 비었는지, 접속한 도메인이 콘솔에 등록됐는지. 개발자 도구 네트워크 탭에서 `sdk.js` 응답 본문의 `errorType`과 `message`를 보면 원인이 나온다

## 데이터 운영

팝업 데이터는 백엔드 파이프라인이 모은다. 원천은 카카오맵 키워드 검색과 Perplexity API, 서울 열린데이터 광장 셋이고 1차 출처는 미정이다. 갱신 주기와 담당도 미정이다.

팝업은 회전이 빠르다. 데모데이(2026-10-17) 직전에 한 번 갱신하는 일정이 필요하다.

## 보안 헤더

`next.config.ts`에서 설정한다. X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy 넷이다. Permissions-Policy로 카메라와 마이크, 위치 권한을 막는다.
