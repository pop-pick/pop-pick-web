@AGENTS.md

## Claude Code에서

- 룰은 `.claude/rules/`로 실린다. `paths`가 없는 `git-workflow.md` 하나만 세션마다 실리고 나머지 열은 그 패턴의 파일을 읽을 때 실린다
- `.claude/skills`와 `.claude/rules`, `.claude/agents`는 생성물이다. 고칠 것은 `.agents/` 원본이고 `pnpm harness:sync`가 복사한다. 손으로 고치면 `pnpm harness:check`가 커밋과 CI에서 막는다
- 에이전트 열하나가 `.claude/agents/` 아래 `builders/`, `verifiers/`, `curators/`, `reviewers/`에 있다. 누구를 언제 부르는지는 `.agents/skills/pop-pick-dev`가 정한다
- 훅이 넷이다. guard-git은 Bash의 git 명령에서 금지 패턴을 막고, inject-matching-rules는 Edit와 Write 직전에 그 파일에 맞는 룰 목록을 알린다. turn-changes는 요청마다 바뀐 파일을 떠 두고, check-on-stop은 응답을 끝내기 전에 이번 턴에 바뀐 파일이 컨벤션 검사에 걸리면 한 번 막는다. 명세는 `.agents/hooks/hooks.json`이다
- 슬래시 커맨드는 `.claude/commands/`의 `git/`과 `docs/`에 있다. 전부 `disable-model-invocation: true`라 사용자가 부를 때만 돈다
- 대화를 압축할 때 사용자가 내린 결정과 고친 파일 목록, 돌린 게이트와 그 결과를 남긴다
