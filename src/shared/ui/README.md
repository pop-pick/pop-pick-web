# shared/ui

두 화면 이상이 쓰는 공용 컴포넌트가 사는 폴더다. 기성 UI 라이브러리를 쓰지 않고 디자이너 시안을 따라 직접 만든다(8/28 확정). 이 폴더의 주인은 디자인 시스템 담당 프론트엔드다. 설계 담당은 `src/app`과 `src/features` 뼈대를 잡고, 3주차(9/7~)부터는 둘이 페이지 단위로 나눈다.

컴포넌트 목록과 API는 여기서 정하지 않는다. 어디에 무엇을 두고 어떤 규칙을 따르는지만 적는다.

## 토큰

색과 간격, 글자 크기, 반경은 `src/app/globals.css`의 `@theme inline`에 토큰으로 둔다. 클래스에 `p-[18px]` 같은 임의값을 박지 않는다. 규칙과 옮기는 방법은 `.agents/rules/tailwind.md`에 있다.

디자인 토큰은 디자이너에게 받는 대로 넣고 시안의 이름과 토큰 이름을 1:1로 맞춘다. 지금 `@theme inline`에는 `--color-background`와 `--color-foreground`, `--font-sans`, `--font-mono` 넷뿐이고 전부 create-next-app 보일러플레이트 값이다.

## 시안 전에 시작할 수 있는 것

Button, Input, Modal, Toast가 후보다. 시안이 나와도 구조는 크게 바뀌지 않고 토큰만 바뀐다.

## 파일 배치 (제안)

컴포넌트 하나에 폴더 하나를 두는 방식이다. 파일 이름은 소문자 케밥 케이스, 컴포넌트 이름은 PascalCase다.

```
src/shared/ui/
  button/
    button.tsx        export function Button
  input/
    input.tsx         export function Input
```

파일 하나로 두는 방식(`src/shared/ui/button.tsx`)도 된다. 어느 쪽으로 갈지, 배럴 파일(`index.ts`)을 둘지는 주인이 정한다. 정하면 이 절을 제안에서 규칙으로 바꾼다.

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
