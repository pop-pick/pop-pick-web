---
description: src/app은 라우팅, src/features는 기능, src/shared는 공용. 기능 폴더 안은 api와 ui, hooks, model 넷이다. 의존은 한 방향이고 배럴 파일을 만들지 않는다
---

# 폴더 구조

## 규칙

**층은 셋이다.** `src/app`은 라우팅, `src/features`는 기능 단위, `src/shared`는 둘 이상이 쓰는 것이다.

**의존은 한 방향이다.** `shared`에서 `features`로, `features`에서 `app`으로 흐른다. `shared`는 `features`와 `app`을 부르지 않고 기능은 다른 기능을 부르지 않는다. 두 기능을 한 화면에 놓는 것은 `src/app`의 라우트 파일이 한다.

**기능 폴더 안은 넷이다.**

```
features/{기능}/
├── api/      엔드포인트 함수와 queryOptions
├── ui/       컴포넌트
├── hooks/    변경을 내는 훅과 화면이 쓰는 훅
└── model/    그 기능이 무엇인지. 값과 타입, 도메인 규칙, 스토어
```

필요한 것만 만든다. 쓰지 않는 폴더를 미리 만들지 않는다. 지금 넷을 다 쓰는 기능은 `auth` 하나이고 `onboarding`과 `popup`은 둘씩이다.

**루트에 파일을 두지 않는다.** 모든 파일이 세그먼트 폴더 안에 있어야 상대 경로의 깊이가 곧 경계가 된다. `../`는 같은 기능 안이고 `../../`는 밖이다.

**배럴 파일을 만들지 않는다.** `index.ts`로 모아 내보내지 않고 파일을 직접 부른다.

**같은 기능 안은 상대 경로, 밖은 `@/` 별칭을 쓴다.** 상대 경로는 `../{세그먼트}`까지다.

## model이 담는 것

**그 기능이 무엇인지를 담는다.** 화면에 그리는 방법(`ui`)도 서버를 부르는 방법(`api`)도 아닌 나머지다.

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
export const REGIONS = ["seongsu", "yeouido", "hongdae", "sinchon", "yongsan"] as const;
export type Region = (typeof REGIONS)[number];
export const REGION_LABELS: Record<Region, string> = { ... };
```

타입이 값에서 파생되므로 둘을 다른 파일에 두면 지역을 추가할 때 한쪽만 고쳐도 타입 검사가 통과한다. 라벨도 같이 둔다. `Record<Region, string>`이 값을 늘릴 때 라벨을 빠뜨리지 못하게 막는다.

## 기능 폴더에 lib과 types를 두지 않는다

**`lib`은 `src/shared`에만 있다.** 도메인 지식이 없는 도구를 담는다. 지금 셋이다. 클래스 합치기(`cn.ts`), 외부 SDK 어댑터(`kakao-map/`), 화면용 임시 데이터(`placeholder-data.ts`)다.

기능 폴더에 `lib`을 두지 않는 이유는 그 이름이 목적을 말하지 않아서다. `auth/lib/kakao-oauth.ts`에서 `lib`을 빼고 읽어도 아는 것이 같다. 폴더 한 겹이 경로만 늘리고 정보를 더하지 않으면 지운다.

**`types` 세그먼트를 두지 않는다.** 같은 이유다. 타입은 그 타입이 설명하는 값 옆에 있어야 한다. 값과 갈라놓으면 위의 파생 관계가 끊긴다.

이 판단은 갈리는 자리다. Feature-Sliced Design은 `components`와 `hooks`, `types`를 "내용이 무엇인지 말할 뿐 무엇을 위한 것인지 말하지 않는다"는 이유로 나쁜 세그먼트 이름이라고 문서에 적는다. 반대로 bulletproof-react는 `types`와 `utils`를 기능 세그먼트로 그대로 쓴다. 우리는 앞쪽을 골랐고 근거는 위 문단이다. 세그먼트를 몇 개까지 두라는 수치 기준은 어느 쪽 문서에도 없다.

`hooks`는 남겼다. 이름이 본질을 가리키는 것은 같지만 React에서 훅은 호출 규칙이 따로 있는 별개 종류라 파일을 열기 전에 아는 값이 있다.

## 이 규칙이 생긴 이유

**의존 방향을 정하지 않으면 기능이 서로를 부른다.** 프론트엔드 둘이 기능 일곱을 6주에 나눠 만든다. `course`가 `popup`의 내부 함수를 부르기 시작하면 둘 중 하나를 고칠 때마다 다른 하나를 열어야 한다. 한 방향으로 정해 두면 고칠 자리가 예측된다.

**세그먼트가 많으면 파일 하나를 넣으려고 폴더를 만든다.** 여섯이던 때 여섯을 다 쓰는 기능은 하나뿐이었고 나머지는 파일 한둘짜리 폴더를 들고 있었다. 폴더는 파일이 여럿일 때 값이 생긴다.

**배럴 파일은 값보다 비용이 크다.** `index.ts` 하나를 부르면 그 폴더의 모든 파일이 모듈 그래프에 들어온다. 개발 서버가 느려지고 트리 셰이킹이 막히며 순환 import가 생긴다. bulletproof-react도 과거의 배럴 권장을 철회했다.

**Next.js는 이 구조에 개입하지 않는다.** 공식 문서가 `app` 밖의 배치에 대해 unopinionated라고 직접 적는다. 예시에 쓴 `components`와 `lib`은 자리 표시일 뿐이며 다른 이름을 써도 된다고 못 박는다. 그래서 이 규칙은 프레임워크가 정해 준 것이 아니라 우리가 고른 것이다.

**서버와 클라이언트를 폴더로 가르지 않는다.** `"use client"`는 파일 하나에 붙는 모듈 그래프 경계다. 그 파일이 import하는 것이 클라이언트 번들에 들어가고 `children`으로 넘긴 서버 컴포넌트는 들어가지 않는다. 경계를 정하는 것은 파일의 위치가 아니라 import 관계라서 폴더로 나누면 실제 번들 경계와 어긋난다.

## 자주 나오는 실수와 막는 법

lint 규칙으로 막지 않는다. 사람이 읽고 지킨다. 아래 넷이 실제로 반복되는 실수라 코드를 쓰기 전에 한 번 지나간다.

**다른 기능을 직접 부른다.** `features/course`에서 `@/features/popup/...`를 import하는 것이다. 둘이 같이 필요하면 `src/app`의 라우트 파일이 둘을 가져다 놓거나, 공용이 된 조각을 `src/shared`로 올린다.

**기능 밖을 상대 경로로 부른다.** `../../popup/...`처럼 점 둘이 나오면 기능을 벗어난 것이다. 기능 밖은 `@/shared` 별칭으로 부른다.

**shared가 features를 부른다.** 의존이 거꾸로 흐르면 공용 코드가 특정 기능에 묶인다. `shared`에서 기능 이름이 보이면 그 코드는 기능 폴더로 내려가야 한다.

**index.ts를 만든다.** 모아 내보내면 부르는 쪽이 짧아지지만 폴더 전체가 모듈 그래프에 들어온다. 파일을 직접 부른다.

찾을 때는 이렇게 본다.

```bash
grep -rn "@/features/" src/features src/shared --include="*.ts" --include="*.tsx"
grep -rn "from \"\.\./\.\./" src/features --include="*.ts" --include="*.tsx"
find src -name "index.ts" -o -name "index.tsx"
find src/features -mindepth 2 -maxdepth 2 -type d ! -name api ! -name ui ! -name hooks ! -name model
```

네 명령 모두 아무것도 내지 않아야 한다. `src/app`은 검사 대상이 아니다.

## 리뷰에서 볼 것

- 기능 폴더 루트에 있는 파일과 넷 밖의 세그먼트
- 새로 생긴 `index.ts`
- `src/app` 라우트 파일 안의 로직. 조립만 한다
- 값과 그 값에서 파생된 타입이 다른 파일에 있는 자리
- 한 기능에만 있는데 다른 기능도 쓰기 시작한 컴포넌트. `src/shared/ui`로 올린다
