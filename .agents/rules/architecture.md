---
description: src/app은 라우팅, src/features는 기능, src/shared는 공용. 기능 폴더 안은 api와 components, hooks, model 넷이다. 의존은 한 방향이고 배럴 파일을 만들지 않는다
paths: ["src/**"]
---

# 폴더 구조

## 규칙

**층은 셋이다.** `src/app`은 라우팅, `src/features`는 기능 단위, `src/shared`는 둘 이상이 쓰는 것이다. `src/` 바로 아래 파일은 Next가 이름과 위치를 정한 `proxy.ts` 하나이고 조립만 한다. `src/app`의 라우트 파일과 같이 features와 shared를 부를 수 있다.

**의존은 한 방향이다.** `shared`에서 `features`로, `features`에서 `app`으로 흐른다. `shared`는 `features`와 `app`을 부르지 않고 기능은 다른 기능을 부르지 않는다. 두 기능을 한 화면에 놓는 것은 `src/app`의 라우트 파일이 한다.

**기능 폴더 안은 넷이다.**

```
features/{기능}/
├── api/      엔드포인트 함수와 queryOptions
├── components/ 그 기능의 컴포넌트
├── hooks/    변경을 내는 훅과 화면이 쓰는 훅
└── model/    그 기능이 무엇인지. 값과 타입, 도메인 규칙, 스토어
```

필요한 것만 만든다. 쓰지 않는 세그먼트 폴더를 미리 만들지 않는다.

**기능 안 컴포넌트 폴더는 `components`다.** 기능 안의 컴포넌트는 모두 자기 기능의 도메인을 알아서 `shared/components`와 성격이 같다. `ui`라는 이름은 저장소 전체에서 앱을 모르는 부품(`shared/ui`)에만 쓴다.

**루트에 파일을 두지 않는다.** 모든 파일이 세그먼트 폴더 안에 있어야 상대 경로의 깊이가 곧 경계가 된다. `../`는 같은 기능 안이고 `../../`는 밖이다.

**배럴 파일을 만들지 않는다.** `index.ts`로 모아 내보내지 않고 파일을 직접 부른다.

**같은 기능 안은 상대 경로, 밖은 `@/` 별칭을 쓴다.** 상대 경로는 `../{세그먼트}`까지다.

## app과 features 이름

- `src/app`에는 Next가 이름을 정하는 라우트 파일만 두고 컴포넌트와 CSS는 `src/shared`나 `src/features`에서 import한다. 라우트 그룹을 두지 않는다
- 하단 탭바는 루트 레이아웃이 그리고 탭바가 숨는 경로는 `BottomTabBar`의 `HIDDEN_PATHS`다
- `features/` 하위 폴더는 기능 하나에 하나다. 이름은 백엔드 `feature/{이름}` 패키지와 맞춘다
- 경로 별칭 `@/*`는 `./src/*`다

## shared 안

| 폴더                               | 담는 것                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui`                               | 디자인 시스템 부품. `Button`, `Select`, `DropdownPanel`, `AlertDialog`, `Skeleton`, `SvgIcon`처럼 props와 토큰만으로 그리고 앱을 모른다                                                                                                                                                                                                                                                       |
| `components`                       | `ui`를 조립한 공용 컴포넌트. `BottomTabBar`, `PageHeader`, `BackButton`, `EmptyState`, `PopupImage`처럼 경로와 도메인 타입을 알아도 된다                                                                                                                                                                                                                                                      |
| `assets`                           | 코드가 아닌 원본 파일. `icons/`의 SVG는 SVGR이 빌드할 때 컴포넌트로 바꾸고 `fonts/`의 woff2는 `styles/fonts.ts`가 싣는다. `lottie/`는 동적 import로 싣는다. 색이 고정되거나 그라디언트가 있는 SVG와 사진은 SVGR이 색을 바꾸거나 코드가 될 필요가 없어 `public/images/{brand,illustrations,pins,placeholder}`에 두고 `next/image`로 싣는다. 벡터로 그릴 수 있는 그림은 SVG, 사진만 JPG나 PNG다 |
| `styles`                           | Tailwind 진입점 `globals.css`와 디자인 토큰 `tokens/`                                                                                                                                                                                                                                                                                                                                         |
| `api`, `lib`, `model`, `providers` | HTTP 층, 도메인 지식이 없는 도구, 여러 기능이 쓰는 값과 타입, 루트 레이아웃이 감싸는 Provider                                                                                                                                                                                                                                                                                                 |

**`ui`와 `components`는 무엇을 import하는지로 가른다.** 두 이름 모두 컴포넌트를 뜻해서 이름만 보고는 어디에 둘지 알 수 없다. `ui`는 `next/navigation`과 `@/shared/model`, `@/shared/components`, `@/features`를 부르지 않는다. 새 컴포넌트가 앱의 경로나 도메인 타입을 알아야 하면 `components`에 둔다. 의존은 `ui`에서 `components`로 한 방향이다.

## model이 담는 것

**그 기능이 무엇인지를 담는다.** 화면에 그리는 방법(`components`)도 서버를 부르는 방법(`api`)도 아닌 나머지다.

| 들어가는 것             | 예                                     |
| ----------------------- | -------------------------------------- |
| 값과 거기서 파생된 타입 | `ONBOARDING_STEPS`와 `OnboardingStep`  |
| 사람이 읽는 라벨        | `REGION_LABELS`                        |
| 도메인 규칙과 순수 함수 | `sanitizeNextPath`, `verifyOAuthState` |
| 그 기능만 쓰는 타입     | `AuthTokens`                           |
| Zustand 스토어          | `useAuthStore`                         |
| 그 기능만 쓰는 에러     | `OAuthStateMismatchError`              |

**값과 파생 타입, 라벨은 한 파일에 둔다.** 떼면 안 되는 한 몸이다.

```ts
export const REGIONS = ["yeouido", "hongdae", "jamsil", "yongsan", "seongsu"] as const;
export type Region = (typeof REGIONS)[number];
export const REGION_LABELS: Record<Region, string> = { ... };
```

타입이 값에서 파생되므로 둘을 다른 파일에 두면 지역을 추가할 때 한쪽만 고쳐도 타입 검사가 통과한다. 라벨도 같이 둔다. `Record<Region, string>`이 값을 늘릴 때 라벨을 빠뜨리지 못하게 막는다.

## 기능 폴더에 lib과 types를 두지 않는다

**`lib`은 `src/shared`에만 있다.** 도메인 지식이 없는 도구를 담는다. 클래스 합치기(`cn.ts`), 같은 병합 설정으로 만든 변형 레시피 함수(`tv.ts`), 서울 시간대의 오늘과 엄격한 날짜 읽기(`date.ts`), 렌더 중에 쓰는 분 단위 서울 시각(`useSeoulNow.ts`), 라우트 쿼리를 `URLSearchParams`로 바꾸기(`search-params.ts`), 앱 안에서 뒤로 갈 수 있는지 판정(`navigation.ts`), 외부 SDK 어댑터(`kakao-map/`), 화면용 임시 데이터(`placeholder-data.ts`)와 임시 사진 목록(`placeholder-images.ts`)이다.

기능 폴더에 `lib`을 두지 않는 이유는 그 이름이 목적을 말하지 않아서다. `auth/lib/kakao-oauth.ts`에서 `lib`을 빼고 읽어도 아는 것이 같다. 폴더 한 겹이 경로만 늘리고 정보를 더하지 않으면 지운다.

**`types` 세그먼트를 두지 않는다.** 같은 이유다. 타입은 그 타입이 설명하는 값 옆에 있어야 한다. 값과 갈라놓으면 위의 파생 관계가 끊긴다.

이 판단은 갈리는 자리다. Feature-Sliced Design은 `components`와 `hooks`, `types`를 "내용이 무엇인지 말할 뿐 무엇을 위한 것인지 말하지 않는다"는 이유로 나쁜 세그먼트 이름이라고 문서에 적는다. 반대로 bulletproof-react는 `types`와 `utils`를 기능 세그먼트로 그대로 쓴다. `lib`과 `types`에서는 앞쪽을 골랐고 근거는 위 문단이다. 세그먼트를 몇 개까지 두라는 수치 기준은 어느 쪽 문서에도 없다.

`hooks`는 남겼다. 이름이 본질을 가리키는 것은 같지만 React에서 훅은 호출 규칙이 따로 있는 별개 종류라 파일을 열기 전에 아는 값이 있다.

`components`도 남겼다. FSD는 기능 안 컴포넌트를 `ui`라 부르지만 이 저장소에서 `ui`는 앱을 모르는 부품(`shared/ui`)이다. 기능 안 컴포넌트는 도메인을 알아서 `shared/components`와 성격이 같으니 같은 이름을 쓴다. 한 이름이 두 뜻으로 쓰이지 않게 하려는 것이다.

## 이 규칙이 생긴 이유

**의존 방향을 정하지 않으면 기능이 서로를 부른다.** 프론트엔드 둘이 기능 일곱을 6주에 나눠 만든다. `course`가 `popup`의 내부 함수를 부르기 시작하면 둘 중 하나를 고칠 때마다 다른 하나를 열어야 한다. 한 방향으로 정해 두면 고칠 자리가 예측된다.

**세그먼트가 많으면 파일 하나를 넣으려고 폴더를 만든다.** 여섯이던 때 여섯을 다 쓰는 기능은 하나뿐이었다.

**배럴 파일은 값보다 비용이 크다.** `index.ts` 하나를 부르면 그 폴더의 모든 파일이 모듈 그래프에 들어온다. 개발 서버가 느려지고 트리 셰이킹이 막히며 순환 import가 생긴다. bulletproof-react도 과거의 배럴 권장을 철회했다.

**Next.js는 `app` 밖의 배치를 정하지 않는다.** 공식 문서가 unopinionated라고 적고 예시의 `components`와 `lib`은 다른 이름을 써도 된다고 적는다.

**서버와 클라이언트를 폴더로 가르지 않는다.** `"use client"`는 파일 하나에 붙는 모듈 그래프 경계다. 그 파일이 import하는 것이 클라이언트 번들에 들어가고 `children`으로 넘긴 서버 컴포넌트는 들어가지 않는다. 경계를 정하는 것은 파일의 위치가 아니라 import 관계라서 폴더로 나누면 실제 번들 경계와 어긋난다.

## 기계로 막는 것

다른 기능 import와 기능 밖 상대 경로, 배럴 파일, 기능 폴더 루트의 파일, 넷 밖의 세그먼트, `shared/ui`가 앱을 아는 import는 `check-conventions.sh`가 막는다. `src/app`은 검사 대상이 아니다.

## 리뷰에서 볼 것

- `src/app` 라우트 파일 안의 로직. 조립만 한다
- 값과 그 값에서 파생된 타입이 다른 파일에 있는 자리
- 한 기능에만 있는데 다른 기능도 쓰기 시작한 컴포넌트. 앱을 모르면 `src/shared/ui`, 경로나 도메인 타입을 알면 `src/shared/components`로 올린다
