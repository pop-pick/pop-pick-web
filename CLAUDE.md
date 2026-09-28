@AGENTS.md

## Claude Code에서

- 훅이 넷이다. guard-git은 Bash의 git 명령에서 금지 패턴을 막고, inject-matching-rules는 Edit와 Write 직전에 그 파일에 맞는 룰 목록을 알린다. turn-changes는 요청마다 바뀐 파일을 떠 두고, check-on-stop은 응답을 끝내기 전에 이번 턴에 바뀐 파일이 컨벤션 검사에 걸리면 한 번 막는다. 명세는 `.agents/hooks/hooks.json`이다
- 슬래시 커맨드는 `.claude/commands/`의 `git/`과 `docs/`에 있다. 전부 `disable-model-invocation: true`라 사용자가 부를 때만 돈다
- 대화를 압축할 때 사용자가 내린 결정과 고친 파일 목록, 돌린 게이트와 그 결과를 남긴다
