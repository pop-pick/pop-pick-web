---
description: 추론되는 반환 타입을 적지 않는다. 이름은 흔한 동사와 목적어로 짓고 handle, on, is 같은 접두사를 역할대로 쓴다. return 앞과 블록 뒤 빈 줄. 리뷰에서 쓰는 grep
paths:
  - "src/**/*.{ts,tsx}"
  - "scripts/**/*.mjs"
---

# TypeScript

## 규칙

**추론되는 반환 타입을 적지 않는다.** `function resolveUrl(path: string): string`처럼 본문에서 추론되는 반환 타입은 지운다. 지운 뒤 `pnpm type:check`로 추론이 같은 타입을 내는지 확인한다.

## 이 규칙이 생긴 이유

반환 타입을 적으면 같은 정보가 시그니처와 본문 두 곳에 있다. 구현을 고칠 때 한쪽만 바뀌어 어긋난다. 적은 타입이 추론보다 넓으면 호출자는 그만큼 정보를 잃고 좁으면 타입 오류가 난다. 추론에 맡기면 정보가 한 곳에만 남는다.

## 예외

반환 타입을 적는 자리는 둘이다.

- 넓은 입력을 좁히는 함수. 타입 가드와 `validate(input: unknown): Config`처럼 반환 타입이 곧 계약인 자리다. 추론에 맡기면 `unknown`이나 넓은 합집합이 남는다
- 반환식에서 자기 자신을 참조하는 함수. 추론이 순환해 오류가 나거나 선언 파일을 방출할 때 `any`로 떨어진다

## 이름

**동사는 흔한 말로 고른다.** JavaScript를 읽는 사람이 매일 보는 동사가 따로 있고 그 밖의 말은 읽는 속도를 늦춘다.

| 쓰지 않는 동사              | 대신 쓰는 동사       |
| --------------------------- | -------------------- |
| acquire, obtain, retrieve   | get, fetch, load     |
| release, dispose, terminate | stop, close, clear   |
| invoke, execute, perform    | run, call, handle    |
| instantiate, materialize    | create, build, make  |
| initialize                  | init, setup, prepare |
| utilize, leverage           | use                  |
| populate, traverse          | fill, walk           |

**접두사는 역할이 정한다.** TypeScript와 React 코드에서 관용으로 굳은 것이다. 이벤트 핸들러의 `handle`과 이벤트 props의 `on`은 React 공식 문서(react.dev의 Responding to Events)가 적은 관례이고, boolean 상태의 `is`는 같은 문서의 예제(`isSending`, `isSent`)가 쓰는 모양이다.

| 무엇                                   | 접두사                       | 예                                                                            |
| -------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------- |
| 컴포넌트 안에서 이벤트를 처리하는 함수 | `handle` 뒤에 이벤트나 대상  | `handleLogout`, `handleViewChange`, `handleListItemClick`                     |
| 이벤트를 받는 props                    | `on` 뒤에 이벤트             | `onChange`, `onLocate`, `onSwitchToList`                                      |
| boolean 변수와 상태, props             | `is`, `has`, `can`, `should` | `isRetrying`, `isCanceled`, `hasResultType`, `canRefresh`, `shouldShowReason` |
| boolean 상태의 세터                    | `set` 뒤에 상태 이름 그대로  | `setIsRetrying`, `setIsListRevealed`                                          |
| 훅                                     | `use`                        | `useCurrentPosition`                                                          |
| 서버에서 받는 함수                     | `get`, `fetch`               | 아직 없다. 팝업 API를 붙일 때 생긴다                                          |
| 만드는 함수                            | `create`, `build`, `make`    | `createOAuthState`, `buildLoginPath`                                          |
| 모양을 바꾸는 함수                     | `to`, `format`               | `toHref`, `formatClusterText`                                                 |
| 넓은 입력을 좁히는 함수                | `parse`, `sanitize`          | `parseStep`, `sanitizeNextPath`                                               |
| 검증해 던지는 함수                     | `verify`                     | `verifyOAuthState`                                                            |

접두사를 따르지 않는 자리가 셋 있다. DOM과 ARIA 표준 속성을 그대로 받는 props(`disabled`, `checked`, `open`), 라이브러리가 이름을 정한 옵션 키(TanStack Query의 `retry`), 외부 SDK의 타입 선언이다. 이 셋은 원본의 이름을 따른다.

**동사만 있고 목적어가 없는 이름을 쓰지 않는다.** `ensure`와 `clear`, `retry`, `locate`는 무엇을 하는지 말하지 않는다. `ensureAuthenticated`, `clearSession`, `reloadSdk`, `requestCurrentPosition`으로 적는다. 반대로 boolean이 아닌 값에 형용사만 붙이지 않는다. 팝업 배열을 `visible`이라 부르면 참거짓으로 읽힌다. `visiblePopups`로 적는다.

**감싸는 대상이 브라우저나 SDK의 API면 그 API의 동사를 따른다.** `getUserMedia`를 감싸면 `getLocalStream`이다. 원본에서 멀어지면 무엇을 감싼 것인지 한 번 더 짚어야 한다.

**약어는 일반 단어처럼 적는다.** `Http`와 `Id`, `Url`이고 `HTTP`, `ID`, `URL`이 아니다. 상수의 UPPER_SNAKE_CASE는 예외다.

## 빈 줄

return 앞 빈 줄은 문맥으로 판단하지 않고 줄 수로 정한다. 누가 써도 같은 모양이 나오고 기계가 검사할 수 있다.

- **return을 담은 블록이 빈 줄을 빼고 3줄 이하면 return 앞에 빈 줄을 두지 않는다.** return 줄도 센다. 3줄을 넘으면 빈 줄을 둔다. return이 블록의 첫 문장이면 두지 않는다
- **JSX를 돌려주는 return 앞에는 블록 길이와 상관없이 빈 줄을 둔다.** 컴포넌트에서 값을 준비하는 부분과 그리는 부분이 갈려 보인다. 첫 문장이면 두지 않는다
- **블록이 닫힌 뒤 다음 문장 앞에는 빈 줄을 둔다.** 이어지는 `if` 둘 사이도 같다. `else`와 `catch`, `finally`처럼 같은 문장이 이어지면 두지 않는다

```tsx
export function buildLoginPath(next: string) {
	const safePath = sanitizeNextPath(next) ?? DEFAULT_NEXT_PATH;
	return `/login?next=${encodeURIComponent(safePath)}`;
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
	const { next } = await searchParams;
	const requestedNext = typeof next === "string" ? next : null;

	return <LoginScreen next={sanitizeNextPath(requestedNext)} />;
}

function hasErrorMessageShape(error: unknown) {
	if (typeof error !== "object" || error === null) {
		return false;
	}

	const { errorCode, message } = error as Record<string, unknown>;

	return typeof errorCode === "string" && typeof message === "string";
}
```

`check-conventions.sh`가 `check-return-spacing.mjs`로 막는다. `node .agents/scripts/check-return-spacing.mjs src --fix`가 걸린 곳을 고친다.

## 함께 보는 것

타입스크립트 파일을 쓸 때 걸리는 다른 규칙이 둘 있다. 본문은 그쪽에 있다.

- 함수 본문 주석 금지와 허용되는 JSDoc, 지우면 안 되는 지시문 주석은 `comments.md`
- 훅 파일과 스토어 파일을 포함한 파일 이름 규칙, 이벤트 핸들러를 JSX에서 빼는 규칙은 `ui.md`

## 리뷰에서 볼 것

반환 타입 명시를 잡는 ESLint 규칙은 없다. 리뷰에서 grep으로 본다.

```bash
grep -rnE "\)\s*:\s*[A-Za-z<>\[\]| ]+\s*(=>|\{)" src --include="*.ts" --include="*.tsx" | grep -v "\.d\.ts"
```

걸린 줄이 위의 예외 둘에 해당하지 않으면 지운다.

표의 왼쪽 동사로 시작하는 이름은 이렇게 찾는다. SDK를 감싼 자리는 그 SDK의 동사가 맞으니 판단이 필요하다.

```bash
grep -rnE "\b(acquire|obtain|retrieve|release|dispose|terminate|invoke|execute|perform|instantiate|materialize|initialize|utilize|leverage|populate|traverse)[A-Z(]" src --include="*.ts" --include="*.tsx"
```

boolean 상태 이름과 인라인 핸들러, 빈 줄은 `check-conventions.sh`가 막는다. `on` props에 `handle`이 아닌 이름을 넘기는 곳은 볼것으로 알린다. 훅이나 props로 받은 함수를 그대로 넘기는 것이면 그대로 둔다.
