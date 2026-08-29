---
description: X-[value] 임의값을 쓰지 않는다. 값은 globals.css의 @theme inline 토큰과 @utility에서 온다. 어긋난 값을 옮기는 네 갈래
---

# Tailwind 클래스

## 규칙

**`X-[value]` 형태의 임의값을 쓰지 않는다.** `p-[18px]`과 `text-[13px]`, `max-w-[600px]`, `grid-cols-[minmax(0,1fr)_auto]`이 전부 해당한다.

값은 토큰이나 유틸리티에서 온다. 클래스 안에 직접 박지 않는다.

## 이 규칙이 생긴 이유

디자이너 한 명의 시안을 프론트엔드 둘이 나눠 옮긴다. 각자 시안에서 읽은 값을 클래스에 직접 박으면 같은 값이 두 이름으로 갈리고 형제 화면이 1px씩 어긋나기 쉽다. 한 사람은 `gap-[18px]`을 쓰고 다른 사람은 `gap-[20px]`을 쓰는데 시안에서는 같은 간격인 식이다.

임의값은 그 어긋남을 브라켓 안에 숨긴다. 코드 검색으로 찾아도 값이 제각각이라 같은 의도인지 알 수 없다. 이름이 붙으면 중복과 표류가 토큰 목록에서 보인다.

그래서 디자인 토큰을 받는 시점부터 시안의 이름과 코드의 토큰 이름을 1:1로 맞추고 그 전에 쓰는 코드에도 처음부터 이 규칙을 적용한다. 나중에 걷어내는 것보다 처음부터 안 만드는 편이 싸다.

## 대신 하는 것

순서대로 본다.

**1. 기존 토큰에 같은 값이 있는지 본다.** `src/app/globals.css`의 `@theme inline`이 정본이다. Tailwind v4에서는 `@theme`에 CSS 변수를 선언하면 그 이름으로 유틸리티가 생성된다. `--color-brand`를 선언하면 `bg-brand`와 `text-brand`가 생기는 식이다. Tailwind 기본 토큰도 저장소가 덮어쓰지 않은 것은 살아 있다. `--tracking-tight`가 `-0.025em`이고 `--leading-relaxed`가 `1.625`인 식이다.

지금 `@theme inline`에는 `--color-background`와 `--color-foreground`, `--font-sans`, `--font-mono` 넷뿐이다. create-next-app이 만든 보일러플레이트 값이다. 디자이너에게 디자인 토큰을 받은 뒤 채운다.

**2. 두 곳 이상에서 쓰는 값이면 토큰을 만든다.** 색과 반경, 그림자, 간격, 자간, 줄 높이, 글자 크기가 여기 해당한다. `globals.css`의 `@theme inline`에 선언한다.

**3. Tailwind 네임스페이스로 표현할 수 없으면 `@utility`를 만든다.** grid 템플릿과 뷰포트 단위 최대 높이, transition 속성 목록이 그렇다. `globals.css` 아래쪽에 모아 둔다.

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

## 확인하는 법

남아 있는 임의값을 찾는다.

```bash
grep -rnoE "(^|[\" ])[a-z-]+-\[[^]]+\]" src --include="*.tsx" --include="*.ts"
```

걸리는 것이 없어야 한다. 걸리면 위 네 갈래 중 하나로 옮긴다.
