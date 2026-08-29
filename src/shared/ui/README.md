# shared/ui

두 화면 이상이 쓰는 공용 컴포넌트가 사는 폴더다. 기성 UI 라이브러리를 쓰지 않고 디자이너 시안을 따라 직접 만든다(8/28 확정). 이 폴더의 주인은 디자인 시스템 담당 프론트엔드다. 설계 담당은 `src/app`과 `src/features` 뼈대를 잡고, 3주차(9/7~)부터는 둘이 페이지 단위로 나눈다.

컴포넌트 목록과 API는 여기서 정하지 않는다. 어디에 무엇을 두고 어떤 규칙을 따르는지만 적는다.

## 토큰

색과 간격, 글자 크기, 반경은 `src/shared/styles/globals.css`의 `@theme inline`에 토큰으로 둔다. 클래스에 `p-[18px]` 같은 임의값을 박지 않는다. 규칙과 옮기는 방법은 `.agents/rules/tailwind.md`에 있다.

디자인 토큰은 디자이너에게 받는 대로 넣고 시안의 이름과 토큰 이름을 1:1로 맞춘다. 지금 `@theme inline`에는 `--color-background`(흰색)와 `--color-foreground`(진회색) 둘뿐이다. 글꼴은 Tailwind 기본 `font-sans`(시스템 글꼴)이고 강조색은 Tailwind 기본 `blue-600`을 임시로 쓴다.

## 시안 전에 시작할 수 있는 것

Button, Input, Modal, Toast가 후보다. 시안이 나와도 구조는 크게 바뀌지 않고 토큰만 바뀐다.

`Button.tsx`가 첫 예시로 들어가 있다. `cva`로 variant와 size를 선언하고 `cn()`으로 className을 합치며 `focus-visible`로 키보드 포커스를 보인다. 색은 토큰을 받기 전이라 Tailwind 기본 `blue-600`과 `zinc`를 임시로 쓴다. 홈(`src/app/page.tsx`)에서 쓰는 모습을 볼 수 있다. 구조를 바꾸고 싶으면 주인이 바꾼다.

## 파일 이름과 선언 형식 (규칙)

컴포넌트 파일은 PascalCase이고 파일 하나에 컴포넌트 하나다. 파일 이름과 컴포넌트 이름이 같다. 컴포넌트는 함수 선언식으로 쓰고 named export로 내보낸다.

```
src/shared/ui/
  Button.tsx        export function Button(props: ButtonProps) { ... }
  Input.tsx         export function Input(props: InputProps) { ... }
```

화살표 함수에 대입하거나 `export default`로 내보내지 않는다. 컴포넌트에 딸린 파일(variant 정의, 하위 부품)이 생겨 폴더가 필요해지면 `Button/Button.tsx`처럼 폴더 이름도 PascalCase로 두고 그 안에서 같은 규칙을 지킨다. 배럴 파일(`index.ts`)을 둘지는 주인이 정한다.

## variant와 클래스 합치기

`class-variance-authority`가 설치되어 있다. 클래스를 합치는 `cn()`은 `src/shared/lib/cn.ts`에 있고 `clsx`와 `tailwind-merge`를 이은 함수다. variant를 `cva`로 선언할지는 주인이 정한다. `cn()`은 어느 쪽이든 쓴다.

## 지켜야 할 것

- 모바일 퍼스트로 만들고 데스크탑까지 지원한다(8/28 확정). 기준 폭은 미정이다
- 키보드만으로 조작할 수 있어야 하고 포커스 표시가 보여야 한다. `outline-none`으로 기본 표시를 지우면 대신 보일 것을 함께 만든다
- 다크 모드는 미정이다. 지금은 라이트만 만들고 색은 토큰으로만 쓴다. 그래야 결정 뒤에 토큰만 바꿔서 대응할 수 있다

## 화면 명세와의 관계

어느 화면이 어떤 컴포넌트를 쓰는지는 `docs/design/DESIGN-SPEC.md`의 공통 컴포넌트 표에 적는다. 처음부터 채우지 않고 두 번째 쓰임이 나올 때 올린다.

## 시작할 때 읽을 문서

`AGENTS.md`, `.agents/rules/ui.md`, `.agents/rules/tailwind.md`, `docs/design/DESIGN.md`
