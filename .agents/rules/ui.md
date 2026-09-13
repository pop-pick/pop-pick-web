---
description: 기성 UI 라이브러리 없음. 공용 컴포넌트는 src/shared/ui가 주인. 파일 이름과 선언 형식의 정본. 모바일 퍼스트, 키보드로 조작 가능, 토큰만 쓴다
---

# UI 컴포넌트

## 규칙

- 기성 UI 라이브러리를 쓰지 않는다. shadcn 같은 것을 깔지 않는다
- 두 화면 이상이 쓰는 컴포넌트는 `src/shared/ui`에 두고 디자인 시스템 담당 프론트엔드가 주인이다
- 한 화면만 쓰는 컴포넌트는 그 기능의 `ui` 폴더에 둔다. 두 번째 쓰임이 나오면 `src/shared/ui`로 올린다. 폴더 규칙은 `structure.md`에 있다

## 이 규칙이 생긴 이유

디자이너가 Figma로 자체 디자인을 만든다. 기성 라이브러리를 깔면 라이브러리의 디자인 체계와 시안의 체계가 충돌한다. 시안대로 뜯어고치는 비용이 처음부터 만드는 비용보다 크다.

## 파일 이름과 선언 형식

`src/shared/ui`만이 아니라 `src/app`과 `src/features`를 포함한 저장소의 모든 파일에 적용한다.

- 컴포넌트 파일은 PascalCase다. `Button.tsx`, `QueryProvider.tsx`. 컴포넌트가 아닌 파일(`cn.ts`, `client.ts`, `globals.css`)은 소문자 케밥 케이스다
- 훅 파일은 훅 이름을 그대로 파일 이름으로 쓴다. `useKakaoMapSdk.ts`. Zustand 스토어도 `useAuthStore`를 내보내면 파일은 `useAuthStore.ts`다
- `src/app` 아래에는 Next가 이름을 정하는 라우트 파일(`page.tsx`, `layout.tsx`, `error.tsx` 등)만 둔다. 전부 소문자이고 default export를 그대로 쓴다. 컴포넌트와 CSS는 `src/shared`나 `src/features`에 두고 라우트 파일이 import한다. app 폴더를 열면 라우트 구조만 보여야 한다
- 컴포넌트는 `export function Button(props: ButtonProps) { ... }` 형태다. 함수 선언식과 named export만 쓴다. 화살표 함수에 대입하거나 `export default`로 내보내지 않는다
- 파일 하나에 컴포넌트 하나. 파일 이름과 컴포넌트 이름이 같다

훅 파일 이름이 훅 이름과 다르면 import 줄에서 무엇을 가져오는지 한 번 더 확인해야 한다. `auth-store.ts`에서 `useAuthStore`를 가져오는 식이다. 같으면 파일 이름만 보고 안다.

## 만들 때 지키는 것

- 값은 토큰에서 온다. 임의값 금지와 옮기는 방법은 `tailwind.md`
- 375px에서 430px까지의 모바일 웹이 대상이다. 넓은 화면에서는 가운데 고정 폭 컬럼으로 보이고 데스크탑 배치는 따로 만들지 않는다
- 키보드만으로 조작할 수 있고 포커스 표시가 보인다
- 클래스 합치기는 `src/shared/lib/cn.ts`의 `cn()`을 쓴다

## 리뷰에서 볼 것

- `X-[value]` 임의값
- 두 화면이 각자 만든 같은 모양의 컴포넌트
- 마우스로만 되는 조작
- 포커스 스타일을 지운 `outline-none`
- 소문자 파일명의 컴포넌트, 화살표 함수 컴포넌트, `export default` 컴포넌트
- `use`로 시작하는 이름을 내보내는데 파일 이름이 케밥 케이스인 파일
