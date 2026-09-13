## 변경 사항

<!-- 주요 변경 내용을 항목별로 적는다 -->

-

## 관련 문서

<!-- 공개 계약이나 동작 규칙을 바꿨다면 `docs/`의 해당 문서를 이 PR에서 함께 고치고 어느 문서를 고쳤는지 적는다. 어느 문서가 무엇을 답하는지는 `docs/README.md`에 있다 -->

-

## 검증

<!-- CI(`.github/workflows/ci.yaml`)가 게이트 넷을 돌린다. 로컬에서도 돌렸으면 표시한다 -->

- [ ] `pnpm type:check`
- [ ] `pnpm build`
- [ ] `pnpm lint`
- [ ] `pnpm format:check`
- [ ] 개발 서버에서 동작 확인

UI를 건드렸다면 아래도 확인한다.

- [ ] 375px에서 430px 폭에서 배치 확인. 넓은 화면에서는 가운데 고정 폭 컬럼
- [ ] 키보드만으로 조작 가능하고 포커스 표시가 보인다

## 미리보기

<!-- 형식은 https://pop-pick-web-git-{브랜치 이름}-chan9yus-projects.vercel.app 이고 로그인 없이 열린다. 디자이너와 PM이 이 주소로 확인한다 -->

-

## 머지 방법

**merge commit 또는 rebase merge로 머지해 주세요. squash는 쓰지 않습니다.**

squash로 압축하면 `main`이 `develop`의 조상 관계를 잃어 다음 PR마다 충돌이 반복되고 커밋 단위 이력도 사라집니다.
