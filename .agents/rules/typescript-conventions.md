---
description: 이 저장소에서 타입스크립트 규칙을 기계로 막는 것과 그 규칙의 본문. 추론되는 반환 타입, props는 interface, return 앞과 블록 뒤 빈 줄, boolean 상태 이름
paths: ["src/**/*.{ts,tsx}", "scripts/**/*.mjs"]
---

# TypeScript 컨벤션

## 기계로 막는 것

`check-conventions.sh`가 막는 것은 넷이다.

- 추론되는 반환 타입. 타입 가드(`x is T`)만 빠진다. `~/.agents/rules/typescript.md`는 넓은 입력을 좁히는 함수와 자기 참조 함수에 반환 타입을 적도록 허용하지만 이 검사는 둘도 막는다. 이 저장소에서는 이 규칙이 `~/.agents/rules/typescript.md` 보다 우선한다
- `type XxxProps =`. 아래 props 선언 절의 합집합만 통과한다
- return 앞과 블록 뒤 빈 줄. 아래 빈 줄 절의 규칙이다
- is, has, can, should가 없는 boolean 상태 이름

`retrieve`, `execute`, `utilize`처럼 격식체 동사로 시작하는 이름과 `on` props에 `handle`이 아닌 이름을 넘기는 곳은 볼것으로 알린다.

파일 이름 규칙과 이벤트 핸들러를 JSX에서 빼는 규칙은 `ui.md`에 있다.

## props 선언

**컴포넌트 props는 `interface`로 선언한다.** HTML 속성이나 variant 타입을 더할 때는 `&` 대신 `extends`로 잇는다.

```tsx
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
```

TypeScript 핸드북은 `type`의 기능이 필요할 때까지 `interface`를 쓰라고 하고, TypeScript 성능 위키는 `A & B` 대신 `interface extends`를 권한다. `interface`는 속성 충돌을 오류로 드러내고 타입 관계가 캐시된다.

**합집합이 필요하면 경우마다 `interface`를 적고 합집합만 `type`으로 잇는다.** `interface`는 합집합을 표현하지 못한다.

```tsx
interface KakaoMapFitProps extends KakaoMapCommonProps {
	fitTo: readonly KakaoLatLngLiteral[];
	center?: never;
	level?: never;
}

interface KakaoMapCenterProps extends KakaoMapCommonProps {
	fitTo?: never;
	center: KakaoLatLngLiteral;
	level?: number;
}

export type KakaoMapProps = KakaoMapFitProps | KakaoMapCenterProps;
```

`check-conventions.sh`가 `type XxxProps =`를 막는다. `interface`로 된 경우를 `|`로만 이은 줄은 통과한다.

## 빈 줄

return 앞 빈 줄은 문맥으로 판단하지 않고 줄 수로 정한다. 누가 써도 같은 모양이 나오고 기계가 검사할 수 있다.

- **return을 담은 블록이 빈 줄을 빼고 3줄 이하면 return 앞에 빈 줄을 두지 않는다.** return 줄도 센다. 3줄을 넘으면 빈 줄을 둔다. return이 블록의 첫 문장이면 두지 않는다
- **JSX를 돌려주는 return 앞에는 블록 길이와 상관없이 빈 줄을 둔다.** 컴포넌트에서 값을 준비하는 부분과 그리는 부분이 갈려 보인다. 첫 문장이면 두지 않는다
- **블록이 닫힌 뒤 다음 문장 앞에는 빈 줄을 둔다.** 이어지는 `if` 둘 사이도 같다. `else`와 `catch`, `finally`처럼 같은 문장이 이어지면 두지 않는다

```tsx
export function buildLoginPath(nextPath: string) {
	const safePath = sanitizeNextPath(nextPath) ?? DEFAULT_NEXT_PATH;
	return `/login?next=${encodeURIComponent(safePath)}`;
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
	const { next } = await searchParams;
	const requestedNext = typeof next === "string" ? next : null;

	return <LoginScreen nextPath={sanitizeNextPath(requestedNext)} />;
}

function hasErrorMessageShape(error: unknown) {
	if (typeof error !== "object" || error === null) {
		return false;
	}

	const { errorCode, message } = error as Record<string, unknown>;

	return typeof errorCode === "string" && typeof message === "string" && "data" in error;
}
```

`check-conventions.sh`가 `check-return-spacing.mjs`로 막는다. `node .agents/scripts/check-return-spacing.mjs src --fix`가 걸린 곳을 고친다.
