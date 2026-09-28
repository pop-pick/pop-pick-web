---
description: 이 저장소에서 먼저 물을 것(미결정 정본, 공개 표면), 게이트 명령과 순서, 훅과 CI가 돌리는 것, 완료 판정
---

# 변경 절차

## 먼저 묻는 것

- 무엇이 미결정인지는 `docs/product/ROADMAP.md`의 미결정 절이 정본이다
- 이 저장소의 공개 표면은 라우트, 공용 컴포넌트 props, `shared/api` 시그니처, 화면이 분기하는 에러 코드다. 바꾸기 전에 묻는다
- 도입이 결정된 도구도 설치는 사용자가 요청할 때 한다
- 백엔드 저장소 `pop-pick-server`는 고치지 않는다. 요청할 것이 보이면 문구를 적어 넘긴다

## 게이트

구현이 끝나면 이 순서로 돌린다. 테스트 실행 명령이 없어 테스트 게이트는 없다.

1. `pnpm type:check`
2. `pnpm build`
3. `pnpm lint`와 `pnpm format:check`

하네스 원본을 고쳤으면 `pnpm harness:check`도 돌린다.

lefthook이 pre-commit에서 스테이징된 파일 종류에 따라 lint와 format:check를, 늘 harness:check를 돌린다. pre-push에서 type:check와 build를 차례로 돌린다. 내가 건드리지 않은 파일 때문에 커밋이 막히면 그 파일을 고치는 커밋을 따로 만든다.

CI(`.github/workflows/ci.yaml`)가 PR마다 type:check와 build, lint, format:check, harness:check를 돌린다.

## 완료 판정

- 게이트 셋이 통과한다
- 공개 표면을 바꿨으면 `docs/architecture/{기능}.md`와 `docs/product/SPEC.md`의 해당 절을 같은 PR에서 고친다
- CI가 빨간불이면 머지하지 않는다
