---
description: 기성 UI 라이브러리 없음. 공용 컴포넌트는 src/shared/ui가 주인. 파일은 PascalCase, export function 선언. 모바일 퍼스트, 키보드로 조작 가능, 토큰만 쓴다
---

# UI 컴포넌트

## 규칙

- 기성 UI 라이브러리를 쓰지 않는다. shadcn 같은 것을 깔지 않는다
- 두 화면 이상이 쓰는 컴포넌트는 `src/shared/ui`에 두고 디자인 시스템 담당 프론트엔드가 주인이다
- 한 화면만 쓰는 컴포넌트는 그 기능 폴더(`src/features/{기능}`)에 둔다. 두 번째 쓰임이 나오면 `src/shared/ui`로 올린다

## 이 규칙이 생긴 이유

디자이너가 Figma로 자체 디자인을 만든다(8/28). 기성 라이브러리를 깔면 라이브러리의 디자인 체계와 시안의 체계가 충돌한다. 시안대로 뜯어고치는 비용이 처음부터 만드는 비용보다 크다.

## 파일 이름과 선언 형식

`src/shared/ui`만이 아니라 저장소의 모든 React 컴포넌트에 적용한다. `src/app`과 `src/features`의 컴포넌트도 같다.

- 컴포넌트 파일은 PascalCase다. `Button.tsx`, `QueryProvider.tsx`. 컴포넌트가 아닌 파일(`cn.ts`, `client.ts`, `globals.css`)은 소문자 케밥 케이스다
- `src/app` 아래에는 Next가 이름을 정하는 라우트 파일(`page.tsx`, `layout.tsx`, `error.tsx` 등)만 둔다. 전부 소문자이고 default export를 그대로 쓴다. 컴포넌트와 CSS는 `src/shared`나 `src/features`에 두고 라우트 파일이 import한다. app 폴더를 열면 라우트 구조만 보이게 한다
- 컴포넌트는 `export function Button(props: ButtonProps) { ... }` 형태다. 함수 선언식과 named export만 쓴다. 화살표 함수에 대입하거나 `export default`로 내보내지 않는다
- 파일 하나에 컴포넌트 하나. 파일 이름과 컴포넌트 이름이 같다

## 만들 때 지키는 것

- 값은 토큰에서 온다. 임의값 금지와 옮기는 방법은 `tailwind.md`
- 모바일 퍼스트로 만들고 데스크탑까지 지원한다
- 키보드만으로 조작할 수 있고 포커스 표시가 보인다
- 클래스 합치기는 `src/shared/lib/cn.ts`의 `cn()`을 쓴다

## 미정

디자인 토큰을 아직 받지 못했다. 다크 모드 지원 여부와 기준 폭도 정해지지 않았다. 정해지면 이 룰을 고친다. 자세한 안내는 `src/shared/ui/README.md`에 있다.

## 리뷰에서 볼 것

- `X-[value]` 임의값
- 두 화면이 각자 만든 같은 모양의 컴포넌트
- 마우스로만 되는 조작
- 포커스 스타일을 지운 `outline-none`
- 소문자 파일명의 컴포넌트, 화살표 함수 컴포넌트, `export default` 컴포넌트
