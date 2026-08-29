# 운영 안내서

배포와 장애 대응, 운영 절차를 적는다. 첫 Vercel 배포를 하면서 채운다. 지금은 골격과 확정된 사실만 있다.

## 배포

Vercel에 배포한다(8/26 확정). `main`이 프로덕션이다. `develop`과 `feature` 브랜치의 PR에는 미리보기 URL이 만들어진다. 디자이너와 PM이 PR마다 미리보기 URL로 확인한다.

PR은 CI(`.github/workflows/ci.yaml`) 통과 뒤에만 머지되고, Vercel 배포는 CI와 별개로 푸시마다 돈다.

2026-08-29에 첫 배포를 마쳤다.

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
| 빌드             | `pnpm run build`(Turbopack), Node 24.x, 빌드 캐시 사용. 첫 빌드 9초                                         |

배포마다 `pop-pick-{해시}-chan9yus-projects.vercel.app` 형태의 고유 주소도 따로 생긴다. 특정 배포를 가리킬 때만 쓰고 공유에는 브랜치 별칭을 쓴다.

프로젝트가 개인 계정(Hobby)에 있어 대시보드는 계정 주인만 본다.

미리보기 URL은 누구나 열 수 있다. Vercel가 기본으로 켜 두는 미리보기 인증 보호(Vercel Authentication)를 2026-08-29에 껐다. 공개 서비스이고 미리보기에 비밀이 없어서다. 비밀번호 보호와 Trusted IP도 꺼져 있다. 설정 위치는 대시보드의 Settings 아래 Deployment Protection이다.

## 환경 변수

`.env*` 파일은 커밋하지 않는다. `.gitignore`에 있고 예외는 `.env.example` 하나다. 값은 Vercel 프로젝트 설정에 둔다.

Kakao Map JavaScript 키는 카카오 개발자 콘솔에 배포 도메인을 등록해야 동작한다. 프로덕션 URL과 함께 `develop` 브랜치 별칭을 등록하면 통합 브랜치 미리보기에서 지도가 뜬다. 브랜치 별칭은 브랜치가 살아 있는 동안 바뀌지 않는다. 배포마다 생기는 고유 주소는 매번 달라 등록 대상이 아니다. feature 브랜치 미리보기에서도 지도를 봐야 하면 그 브랜치 별칭을 그때 등록한다.

`.env.example`에 같은 이름이 비어 있다. 로컬은 `.env.local`에, 배포는 Vercel 프로젝트 설정에 값을 둔다.

| 변수                        | 용도                     | 어디서 받는가                               |
| --------------------------- | ------------------------ | ------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`  | 백엔드 API 주소. 값 미정 | 백엔드 셋에게 받는다                        |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | Kakao Map JavaScript 키  | 카카오 개발자 콘솔에서 지도 담당이 발급한다 |

## 도메인

미정이다. 팀이 구매한다. 정해지면 DNS 설정과 Vercel 연결 방법을 여기에 적는다.

## 백엔드 API 주소

미정이다. 백엔드 셋이 클라우드와 배포 방식을 정한 뒤 채운다. 미리보기와 프로덕션 환경별 주소를 함께 적는다.

## 롤백

Vercel 대시보드에서 이전 배포를 프로덕션으로 승격한다. 절차 상세는 첫 배포 뒤 채운다.

## 장애가 났을 때 확인 순서

1. Vercel 배포 로그. 빌드가 실패했는지, 어느 커밋이 배포됐는지
2. 브라우저 콘솔. 클라이언트 오류와 실패한 요청
3. 백엔드 상태. API 응답이 오는지
4. 외부 SDK 상태. Kakao Map SDK가 로드되는지, 도메인 등록이 맞는지

각 단계에서 무엇을 보고 어떻게 조치하는지는 첫 배포 뒤 겪은 일을 바탕으로 채운다.

## 데이터 운영

팝업 데이터 출처는 미결정이다. 8/30(일) 정기회의에서 확정한다. 출처가 정해지면 갱신 주기와 담당을 여기 적는다.

팝업은 회전이 빠르다. 데모데이(2026-10-17) 직전에 한 번 갱신하는 일정이 필요하다.

## 보안 헤더

`next.config.ts`에서 설정한다. X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy 넷이다.
