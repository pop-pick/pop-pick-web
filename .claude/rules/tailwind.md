---
description: X-[value] 임의값을 쓰지 않는다. 값은 src/shared/styles/tokens의 @theme inline 토큰과 utilities.css의 @utility에서 온다. 어긋난 값을 옮기는 네 갈래. 값에 따라 갈리는 모양은 aria 변형과 @/shared/lib/tv 레시피로 적는다
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
---

# Tailwind 클래스

## 규칙

**`X-[value]` 형태의 임의값을 쓰지 않는다.** `p-[18px]`과 `text-[13px]`, `max-w-[600px]`, `grid-cols-[minmax(0,1fr)_auto]`이 전부 해당한다.

값은 토큰이나 유틸리티에서 온다. 클래스 안에 직접 박지 않는다.

## 이 규칙이 생긴 이유

디자이너 한 명의 시안을 프론트엔드 둘이 나눠 옮긴다. 각자 시안에서 읽은 값을 클래스에 직접 박으면 같은 값이 두 이름으로 갈리고 형제 화면이 1px씩 어긋나기 쉽다. 한 사람은 `gap-[18px]`을 쓰고 다른 사람은 `gap-[20px]`을 쓰는데 시안에서는 같은 간격인 식이다.

임의값은 그 어긋남을 브라켓 안에 숨긴다. 코드 검색으로 찾아도 값이 제각각이라 같은 의도인지 알 수 없다. 이름이 붙으면 같은 값이 두 이름으로 갈린 것이 토큰 목록에서 보인다.

## 대신 하는 것

순서대로 본다.

**1. 기존 토큰에 같은 값이 있는지 본다.** `src/shared/styles/tokens/`의 `@theme inline`이 정본이다. 색은 `color-semantic.css`, 글자는 `typography.css`, 그림자는 `shadow.css`, 모서리 반경은 `radius.css`, 컬럼 폭과 바닥 간격 같은 앱 틀 치수는 `layout.css`다. Tailwind v4에서는 `@theme`에 CSS 변수를 선언하면 그 이름으로 유틸리티가 생성된다. `--color-brand`를 선언하면 `bg-brand`와 `text-brand`가 생기는 식이다. Tailwind 기본 토큰도 저장소가 덮어쓰지 않은 것은 살아 있다. `--tracking-tight`가 `-0.025em`이고 `--leading-relaxed`가 `1.625`인 식이다.

화면은 원시 색을 쓰지 않고 의미 토큰을 쓴다. 원시 색과 의미 토큰, 간격과 모서리 토큰, 시안 이름과의 대응표는 `docs/design/DESIGN.md`의 색 절과 간격과 모서리 절에 있다.

**2. 두 곳 이상에서 쓰는 값이면 토큰을 만든다.** 색과 반경, 그림자, 간격, 자간, 줄 높이, 글자 크기가 여기 해당한다. 종류에 맞는 `tokens/` 파일의 `@theme inline`에 선언한다. 새 종류(반경, 간격 같은 것)면 `tokens/`에 파일을 하나 만들고 `globals.css`에서 불러온다.

**3. Tailwind 네임스페이스로 표현할 수 없으면 `@utility`를 만든다.** grid 템플릿과 뷰포트 단위 최대 높이, transition 속성 목록이 그렇다. `src/shared/styles/utilities.css`에 모아 둔다.

```css
@utility grid-course-rail {
	grid-template-columns: var(--rail-course) minmax(0, 1fr);
}
```

**4. 한 번만 쓰는 값이면 인접 토큰으로 맞춘다.** 한 곳에서만 쓰는 토큰은 이름 붙인 임의값일 뿐이다. 차이가 눈에 띌 만하면 그 사실을 적어 사용자 판단을 받는다.

## 글자 크기의 함정

`--text-*` 토큰은 짝이 되는 `--text-*--line-height`가 있으면 `line-height`도 함께 낸다. Tailwind v4의 동작이다.

```css
/* --text-sm과 --text-sm--line-height가 둘 다 있을 때 */
.text-sm {
	font-size: var(--text-sm);
	line-height: var(--tw-leading, var(--text-sm--line-height));
}

/* --text-caption만 있고 --text-caption--line-height가 없을 때 */
.text-caption {
	font-size: var(--text-caption);
}
```

Tailwind 기본 글자 크기 토큰은 전부 `--line-height` 짝을 가지고 있다. 그래서 `--text-sm` 값만 덮어쓰고 짝은 그대로 두면 `text-[13px]`을 `text-sm`으로 바꿀 때 크기만 바뀌는 것이 아니라 없던 줄 높이가 새로 걸린다.

줄 높이를 건드리지 않고 크기만 주려면 짝 없는 토큰을 만든다. `--line-height` 동반 값을 두지 않으면 Tailwind가 `line-height` 선언을 생략한다.

바꾸기 전에 그 요소에 `leading-*`이 함께 있는지 본다. 있으면 `--tw-leading`이 이기므로 어느 토큰을 써도 줄 높이는 안 바뀐다.

시안 글자 토큰(`text-h1`, `text-b1-14` 같은 것)은 `--letter-spacing`과 `--font-weight` 짝도 가지고 있다. `text-sm`을 `text-b1-14`로 바꾸면 `font-*`이 없는 요소에 굵기 600과 자간 -0.2px가 새로 걸린다. `tracking-*`, `font-*`이 있으면 그쪽이 이긴다.

## 값에 따라 모양이 갈릴 때

**모양을 고르는 조건을 `cn()` 안에 적지 않는다.** `cn("...", isOpen ? "border-transparent" : "bg-bg-1")`과 `cn("...", isActive && "bg-bg-2")`가 해당한다. 조건이 클래스 문자열 사이에 흩어지면 어떤 상태에서 어떤 모양이 되는지 한곳에서 읽을 수 없다. 대신 아래 순서로 본다.

**1. 상태가 이미 DOM 속성에 있으면 Tailwind 변형으로 적는다.** 요소에 `aria-pressed`와 `aria-selected`, `aria-checked`, `aria-expanded`, `aria-busy`, `disabled`, `data-*`를 붙였다면 클래스가 그 속성을 읽는다. JS 분기가 사라지고 스크린리더가 읽는 상태와 화면 모양이 같은 속성 하나에서 나온다.

```tsx
<button
	aria-pressed={sort === value}
	className="text-text-5 not-aria-pressed:hover:text-text-3 aria-pressed:text-text-1"
/>
```

고른 항목에는 hover 색을 주지 않으려면 `not-aria-pressed:hover:`처럼 조건을 겹친다.

**2. DOM에 없는 값이면 `@/shared/lib/tv`의 `tv`로 레시피를 만든다.** props로 받는 변형(`variant`, `size`, `tone`)과 속성으로 드러나지 않는 상태(`hasValue`, `isHighlighted`)가 여기 해당한다.

```tsx
const selectVariants = tv({
	slots: {
		button: "flex items-center rounded-xl border border-divider-2",
		option: "flex cursor-pointer items-center rounded-lg aria-selected:text-primary"
	},
	variants: {
		size: {
			compact: { button: "h-9.75", option: "h-7.25 text-b2-14" },
			field: { button: "h-12", option: "h-6 text-b2-16" }
		},
		hasValue: {
			true: { button: "text-text-1" },
			false: { button: "text-text-4" }
		},
		isActive: {
			true: { option: "bg-bg-2" }
		}
	}
});

const styles = selectVariants({ size, hasValue });

<button className={styles.button()} />
<li className={styles.option({ isActive: index === activeIndex })} />
```

- 레시피는 컴포넌트 파일의 모듈 범위에 두고 이름은 `{대상}Variants`로 짓는다. `buttonVariants`, `selectVariants`다
- 한 값에 따라 요소 둘 이상이 함께 바뀌면 `slots`로 한 레시피에 묶는다. 컴포넌트 본문에서 한 번 부르고 슬롯 함수를 쓴다. 항목마다 다른 값은 슬롯 함수에 넘긴다
- boolean 변형은 클래스가 붙는 쪽 키만 적는다. 양쪽 모두 클래스가 다르면 `true`와 `false`를 둘 다 적는다. `false` 키 하나만 남는 이름은 뜻을 뒤집어 `true` 쪽으로 짓는다. `isNoticeVisible: { false: ... }` 대신 `isNoticeHidden: { true: ... }`다
- 바깥에서 받은 `className`은 `cn()`으로 다시 감싸지 않고 레시피에 `class`로 넘긴다. `buttonVariants({ variant, size, class: className })`이다
- props 타입은 레시피에서 끌어온다. 공개할 변형 키가 레시피의 키 전부이고 `defaultVariants`가 있으면 `extends VariantProps<typeof buttonVariants>`로 받는다. 레시피에 `hasValue` 같은 내부 키가 있거나 기본값이 없으면 필요한 키만 `size: NonNullable<VariantProps<typeof selectVariants>["size"]>`로 꺼낸다. 전부 받으면 내부 키가 props에 드러나고 기본값 없는 키가 선택 항목이 되어 모양 없는 컴포넌트를 그려도 타입 검사를 통과한다
- 레시피를 export하는 것은 다른 컴포넌트가 같은 모양을 쓸 때뿐이다. `LinkButton`이 `buttonVariants`를 쓴다
- 변형이 없는 고정 클래스 목록에는 레시피를 만들지 않는다. `className`에 문자열을 그대로 적는다

**`tailwind-variants`를 직접 import하지 않는다.** `@/shared/lib/tv`의 `tv`는 `cn()`과 같은 tailwind-merge 설정으로 만들었다. 설정 없이 만든 `tv`는 `text-b1-16` 같은 저장소 글자 토큰을 글자 색으로 읽는다. 그래서 `text-b1-16 text-primary`를 합치면 `text-b1-16`이 지워진다. 타입은 같은 파일이 다시 내보내는 `VariantProps`를 쓴다.

`cn()`은 고정 클래스와 바깥에서 받은 `className`을 합칠 때만 쓴다.

## 확인하는 법

남아 있는 임의값을 찾는다.

```bash
grep -rnoE "(^|[\" ])[a-z-]+-\[[^]]+\]" src --include="*.tsx" --include="*.ts"
```

걸리는 것이 없어야 한다. 걸리면 위 네 갈래 중 하나로 옮긴다.

`cn()` 안의 조건과 `tailwind-variants` 직접 import는 `check-conventions.sh`가 막는다.
