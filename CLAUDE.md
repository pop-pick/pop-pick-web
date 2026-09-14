@AGENTS.md

## Claude Code에서

- 룰은 `.claude/rules/`로 세션마다 자동으로 실린다
- `.claude/skills`와 `.claude/rules`, `.claude/agents`는 생성물이다. 고칠 것은 `.agents/` 원본이고 `pnpm harness:sync`가 복사한다. 손으로 고치면 `pnpm harness:check`가 커밋과 CI에서 막는다
- 전문 에이전트 열은 `.claude/agents/` 아래 `build/`, `review/`, `qa/`에 복사돼 있다. 누구를 언제 부르는지는 `.agents/skills/pop-pick-dev`가 정한다
- Stop 훅이 응답을 끝내기 전에 `bash .agents/scripts/check-conventions.sh`를 돌린다. 막는 검사에 걸리면 끝내지 못하고 한 번만 막는다. 명세는 `.agents/hooks/hooks.json`이고 `.claude/settings.json`의 `hooks` 키는 생성이 채운다
