## 변경 사항

<!-- 주요 변경 내용을 항목별로 정리 -->

-

## 관련 문서

<!-- 해당 항목만 남기고 나머지는 삭제 -->

- 제품: `docs/product/PRD.md` 범위 또는 성공 기준
- 기능 명세: `docs/product/SPEC.md` 기능 또는 기술 결정
- 로드맵: `docs/product/ROADMAP.md` 작업 순서 또는 하지 않기로 한 것
- 디자인 방향: `docs/design/DESIGN.md` 토큰 또는 디자인 시스템
- 화면 명세: `docs/design/DESIGN-SPEC.md` 화면 또는 공통 컴포넌트
- 운영: `docs/release/RUNBOOK.md` 배포와 장애 대응, 운영 절차
- 검색 유입: `docs/release/SEO.md` 코드 밖 SEO 작업
- 개인정보: `docs/release/PRIVACY.md` 수집 항목이 바뀌었을 때

공개 계약이나 동작 규칙을 바꿨다면 해당 문서를 이 PR에서 함께 고친다.

## 검증

<!-- CI가 아직 없다. 아래를 로컬에서 돌리고 통과한 항목에 표시한다 -->

- [ ] `pnpm type:check`
- [ ] `pnpm build`
- [ ] `pnpm lint`
- [ ] `pnpm format:check`
- [ ] 개발 서버에서 동작 확인

UI를 건드렸다면 아래도 확인한다.

- [ ] 모바일 세로, 태블릿, PC 폭에서 배치 확인
- [ ] 키보드만으로 조작 가능하고 포커스 표시가 보인다

## 미리보기

<!-- PR마다 생기는 미리보기 URL을 적는다. 형식은 https://pop-pick-web-git-{브랜치 이름}-chan9yus-projects.vercel.app 이고 로그인 없이 열린다. 디자이너와 PM이 이 주소로 확인한다 -->

-

## 머지 방법

**merge commit 또는 rebase merge로 머지해 주세요. squash는 쓰지 않습니다.**

squash로 압축하면 `main`이 `develop`의 조상 관계를 잃어 다음 PR마다 충돌이 반복됩니다. 커밋 단위 이력도 함께 사라집니다.
