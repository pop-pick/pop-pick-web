---
description: 이 저장소에서 타입스크립트 규칙을 기계로 막는 것. 추론되는 반환 타입, type XxxProps, return 앞과 블록 뒤 빈 줄, boolean 상태 이름
paths:
  - "src/**/*.{ts,tsx}"
  - "scripts/**/*.mjs"
---

# TypeScript

## 기계로 막는 것

`check-conventions.sh`가 막는 것은 넷이다.

- 추론되는 반환 타입. 타입 가드(`x is T`)만 빠지고 반환 타입을 적어도 되는 좁히는 함수와 자기 참조 함수도 걸린다
- `type XxxProps =`. `interface`로 된 경우를 `|`로만 이은 줄은 통과한다
- return 앞과 블록 뒤 빈 줄. `node .agents/scripts/check-return-spacing.mjs src --fix`가 걸린 곳을 고친다
- is, has, can, should가 없는 boolean 상태 이름

`retrieve`, `execute`, `utilize`처럼 격식체 동사로 시작하는 이름과 `on` props에 `handle`이 아닌 이름을 넘기는 곳은 볼것으로 알린다. 훅이나 props로 받은 함수를 그대로 넘기는 것이면 그대로 둔다.

파일 이름 규칙과 이벤트 핸들러를 JSX에서 빼는 규칙은 `ui.md`에 있다.
