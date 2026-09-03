# 기여 안내

팝픽 프론트엔드 저장소에서 브랜치를 따서 PR을 머지하기까지의 순서다. 각 단계의 규칙은 정본 문서에 있고 여기서는 되풀이하지 않는다. 설치와 개발 서버 실행은 `README.md`의 시작하기 절에 있다.

## 순서

1. **브랜치를 딴다.** 원격의 최신 `develop`에서 `feature/{슬러그}`를 만든다. 고치는 일이면 `fix/{슬러그}`다. 브랜치 전략과 이름 규칙은 `.agents/rules/git-workflow.md`에 있다. Claude Code에서는 `/git:branch`가 같은 절차로 만든다
2. **작업한다.** 세션마다 지킬 것은 `AGENTS.md`에 있고 규칙 본문은 `.agents/rules/`에 있다. 어느 규칙이 무엇을 다루는지는 `AGENTS.md`의 룰 표가 답한다
3. **게이트를 돌린다.** 명령과 순서는 `AGENTS.md`의 명령과 게이트 절이 정본이다. 하나라도 실패하면 커밋하지 않는다
4. **커밋한다.** 형식은 `<타입>: <제목>`이고 제목은 한국어다. 타입 목록과 본문 작성법, 훅이 하는 일, 커밋 전에 확인할 것은 `.agents/rules/git-workflow.md`에 있다. `/git:commit`이 같은 규칙으로 커밋을 만든다
5. **PR을 연다.** base는 `develop`이다. GitHub 화면은 `main`으로 잡으니 바꾼다. 본문은 `.github/PULL_REQUEST_TEMPLATE.md`를 채운다. `/git:create-pr`이 base와 템플릿을 맞춰 준다
6. **머지한다.** CI가 초록불이어야 한다. squash 머지를 쓰지 않는다. 이유와 릴리스 뒤 `develop`을 `main`에 맞추는 절차는 `.agents/rules/git-workflow.md`에 있다

## 문서

공개 계약이나 동작 규칙을 바꾸면 `docs/`의 해당 문서를 같은 PR에서 고친다. 어느 문서가 무엇을 답하는지는 `docs/CLAUDE.md`에 있다.
