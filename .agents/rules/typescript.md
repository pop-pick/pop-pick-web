---
description: 추론되는 반환 타입을 적지 않는다. 반환 타입을 적는 예외 둘. 이름은 흔한 동사와 목적어로 짓는다. 리뷰에서 쓰는 grep
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

역할이 정해진 접두사가 있다. 서버에서 받으면 `get`이나 `fetch`, 만들면 `create`, 판정하면 `is`나 `has`, 모양을 바꾸면 `to`나 `format`, 넓은 입력을 좁히면 `parse`나 `sanitize`, 검증해 던지면 `verify`다.

**동사만 있고 목적어가 없는 이름을 쓰지 않는다.** `bind`와 `dispatch`는 무엇을 하는지 말하지 않는다. `bindMapEvents`, `dispatchToHandlers`로 적는다. 반대로 동사가 없는 이름도 쓰지 않는다. 형용사로 시작하면 boolean을 돌려주는 술어로 읽힌다.

**감싸는 대상이 브라우저나 SDK의 API면 그 API의 동사를 따른다.** `getUserMedia`를 감싸면 `getLocalStream`이다. 원본에서 멀어지면 무엇을 감싼 것인지 한 번 더 짚어야 한다.

**약어는 일반 단어처럼 적는다.** `Http`와 `Id`, `Url`이고 `HTTP`, `ID`, `URL`이 아니다. 상수의 UPPER_SNAKE_CASE는 예외다.

## 함께 보는 것

타입스크립트 파일을 쓸 때 걸리는 다른 규칙이 둘 있다. 본문은 그쪽에 있다.

- 함수 본문 주석 금지와 허용되는 JSDoc, 지우면 안 되는 지시문 주석은 `comments.md`
- 훅 파일과 스토어 파일을 포함한 파일 이름 규칙은 `ui.md`

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
