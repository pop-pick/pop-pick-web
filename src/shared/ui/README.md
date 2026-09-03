# shared/ui

두 화면 이상이 쓰는 공용 컴포넌트가 사는 폴더다. 규칙은 `.agents/rules/ui.md`에 있다. 이 문서는 컴포넌트를 만드는 법과 지금 상태를 적는다.

컴포넌트 목록과 API는 여기서 정하지 않는다. 주인인 디자인 시스템 담당 프론트엔드가 정한다.

## 지금 있는 것

`Button.tsx` 하나다. `cva`로 variant와 size를 선언하고 `cn()`으로 className을 합치며 `focus-visible`로 키보드 포커스를 보인다. 홈(`src/app/page.tsx`)에서 쓰는 모습을 볼 수 있다. 구조를 바꾸고 싶으면 주인이 바꾼다.

## 토큰과 디자인 시안

값은 `src/shared/styles/globals.css`의 `@theme inline` 토큰에서 온다. 임의값을 쓰지 않는 규칙과 옮기는 방법은 `.agents/rules/tailwind.md`에 있다.

지금 `@theme inline`에는 `--color-background`(흰색)와 `--color-foreground`(진회색) 둘뿐이다. 글꼴은 Tailwind 기본 `font-sans`(시스템 글꼴)이고 강조색은 Tailwind 기본 `blue-600`을, 보조색은 `zinc`를 임시로 쓴다.

디자이너가 주기로 한 것과 그 상태다.

| 항목     | 상태                                                        |
| -------- | ----------------------------------------------------------- |
| 간격     | 4px 그리드로 온다                                           |
| 타이포   | 정리해서 준다. 아직 받지 않았다                             |
| 컬러     | 미정이다                                                    |
| 컴포넌트 | CTA 버튼 하나가 먼저 온다. 나머지는 화면 디자인과 함께 온다 |

간격과 타이포가 오면 `@theme inline`에 넣고 시안의 이름과 토큰 이름을 1:1로 맞춘다. 컬러는 임시 값으로 두고 시안이 나오면 토큰 한 곳만 바꾼다. 컬러 없이도 공통 컴포넌트 골격은 시작할 수 있다.

## 시안 전에 시작할 수 있는 것

Button, Input, Modal, Toast가 후보다. 시안이 나와도 구조는 크게 바뀌지 않고 토큰만 바뀐다. CTA 버튼 시안이 먼저 오니 Button부터 맞춘다.

## 만드는 법

파일 이름과 선언 형식은 `.agents/rules/ui.md`에 있다. 컴포넌트에 딸린 파일(variant 정의, 하위 부품)이 생겨 폴더가 필요해지면 `Button/Button.tsx`처럼 폴더 이름도 PascalCase로 두고 그 안에서 같은 규칙을 지킨다. 배럴 파일(`index.ts`)을 둘지는 주인이 정한다.

`class-variance-authority`가 설치되어 있다. variant를 `cva`로 선언할지는 주인이 정한다. 클래스 합치기는 어느 쪽이든 `cn()`을 쓴다.

`outline-none`으로 기본 포커스 표시를 지우면 대신 보일 것을 함께 만든다.

## 미정

- 기준 폭. 모바일 퍼스트로 만들고 데스크탑까지 지원한다는 것만 정해졌다
- 다크 모드. 지금은 라이트만 만들고 색은 토큰으로만 쓴다. 정해지면 토큰만 바꿔서 대응한다

## 화면 명세와의 관계

어느 화면이 어떤 컴포넌트를 쓰는지는 `docs/design/DESIGN-SPEC.md`의 공통 컴포넌트 절에 적는다. 처음부터 채우지 않고 두 번째 쓰임이 나올 때 올린다.

## 시작할 때 읽을 문서

`AGENTS.md`, `.agents/rules/ui.md`, `.agents/rules/tailwind.md`, `docs/design/DESIGN.md`
