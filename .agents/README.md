# .agents

에이전트가 읽는 본문을 둔다. 특정 도구에 매인 형식을 쓰지 않는다. 도구가 읽는 자리는 이 폴더에서 생성한 복사본이다.

```
.agents/
  README.md            이 파일
  rules/               룰 본문. 원본
  skills/              스킬 본문. 원본
  agents/              서브에이전트 정의. 원본. build, review, qa 하위 폴더
  hooks/               훅 명세 hooks.json 과 훅이 부르는 스크립트. 원본
  scripts/
    check-conventions.sh   룰에 적힌 grep 검사
    agents-sync.mjs        원본을 도구 자리로 복사하고 변환하는 생성기
    harness-test.sh        검사 스크립트와 훅의 회귀 테스트
    harness-check.sh       위 셋을 한 번에. lefthook 과 CI 가 돌린다
.claude/
  rules/               생성. .agents/rules 복사본
  skills/              생성. .agents/skills 복사본
  agents/              생성. .agents/agents 복사본
  settings.json        직접 고친다. hooks 키만 생성이 채운다
  commands/            슬래시 커맨드. Claude 전용
.codex/
  agents/              생성. .agents/agents 를 TOML 로 변환
AGENTS.md              늘 지켜야 하는 것. 룰 절의 표식 사이만 생성
CLAUDE.md              첫 줄 @AGENTS.md. 아래는 Claude Code 전용
```

## 원본과 생성물

`.agents/` 아래와 `AGENTS.md` 표식 밖만 손으로 고친다. 고친 뒤 생성기를 돌리고 생성물을 함께 커밋한다.

```bash
pnpm harness:sync    # 원본을 고친 뒤. 생성물을 갱신한다
pnpm harness:check   # 컨벤션 검사와 생성물 대조, 회귀 테스트. lefthook 과 CI 가 돌린다
```

심볼릭 링크를 쓰지 않는다. 커밋한 링크는 `core.symlinks`가 꺼진 환경에서 대상 경로가 적힌 텍스트 파일로 체크아웃되고 Windows에서는 링크 생성에 권한이 필요하다. 복사본은 clone 직후 어느 OS에서나 동작한다. 대가는 원본을 고칠 때 생성기를 한 번 돌리는 것이고 잊으면 `harness:check`가 커밋과 CI에서 막는다.

`prepare`가 `pnpm install` 때 생성기를 돌린다. clone 뒤 작업 트리가 더러워지면 누군가 생성물을 빼고 커밋한 것이다.

## 도구마다 읽는 것이 다르다

|                    | Claude Code                            | Codex                                              |
| ------------------ | -------------------------------------- | -------------------------------------------------- |
| 진입 파일          | `CLAUDE.md`                            | `AGENTS.md`, `AGENTS.override.md`                  |
| 탐색 범위          | 상위 디렉터리로 올라가며 모은다        | git 루트에서 현재 디렉터리까지, 디렉터리당 한 파일 |
| 다른 파일 끌어오기 | `@경로` 표기로 펼친다                  | 하지 못한다                                        |
| 룰                 | `.claude/rules/*.md`를 자동으로 읽는다 | 없다. `AGENTS.md`의 목록을 보고 직접 연다          |
| 스킬               | `.claude/skills/<이름>`                | `.agents/skills/<이름>`을 직접 읽는다              |
| 서브에이전트       | `.claude/agents/**/*.md`               | `.codex/agents/*.toml`                             |

`CLAUDE.md`는 `@AGENTS.md` 한 줄로 시작하고 아래에 Claude 전용 내용을 둔다. 심볼릭 링크로 두지 않는다. Codex에게 확실히 전달되는 것은 `AGENTS.md`에 직접 적힌 글자뿐이라 어느 도구에서나 지켜야 하는 것은 짧게 줄여 `AGENTS.md`에 적고 자세한 내용은 룰 본문에 둔다. Codex 지침은 합쳐 32 KiB에서 잘리므로 룰 본문을 `AGENTS.md`에 넣지 않고 목록만 생성한다.

## 룰

`.agents/rules/{이름}.md`를 만들고 프론트매터에 `description`을 적는다. 필수다. 한 줄 요약이고 `AGENTS.md` 룰 목록의 그 줄이 된다.

`paths` 머리말이 있는 룰은 그 패턴의 파일을 읽을 때 실리고 없는 룰은 세션 시작 때 실린다. 늘 실리는 것은 `structure.md`와 `git-workflow.md` 둘이고 나머지 여덟은 파일 패턴에 묶여 있다. 세션마다, 그리고 서브에이전트마다 실리는 지침이 곧 비용이라 늘 실릴 자격은 어느 파일을 만져도 필요한 것에만 준다.

## 스킬

`.agents/skills/{이름}/SKILL.md`에 만든다. 프론트매터는 Agent Skills 표준의 여섯 필드(`name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`) 안에서만 쓰고 `name`과 `description`은 둘 다 적는다. Claude Code 전용 필드를 쓰면 다른 도구와 Skills API에서 하드 에러다.

룰과 달리 스킬은 늘 로드되지 않는다. 요청이 스킬 설명과 맞을 때만 붙는다. 어떤 스킬이 있고 언제 쓰는지는 루트 `AGENTS.md`의 하네스 절이 정본이다.

## 서브에이전트

`.agents/agents/{폴더}/{이름}.md`에 Claude Code 형식(프론트매터 `name`, `description`, `tools`, `model`, `skills`)으로 쓴다. Claude 자리에는 그대로 복사되고 Codex 자리에는 `name`, `description`, `developer_instructions` TOML로 변환된다. `skills:`에 적은 스킬 본문은 Codex에 미리 싣는 기능이 없어 `developer_instructions` 끝에 이어 붙는다. `tools`와 `model`은 Codex로 가지 않는다.

## 훅

명세는 `.agents/hooks/hooks.json` 하나다. 생성기가 `.claude/settings.json`의 `hooks` 키에 넣는다. 훅이 부르는 스크립트도 `.agents/hooks/`에 둔다. 지금 둘이다. `guard-git.sh`는 PreToolUse에서 광범위 스테이징과 `--no-verify`, 강제 푸시, main과 develop 직접 커밋을 막고, `check-on-stop.sh`는 Stop에서 컨벤션 검사를 돌린다. Codex 훅은 Stop 이벤트 동작이 확인되지 않아 아직 만들지 않는다.

도구 훅은 빠른 되먹임이고 강제 경계가 아니다. 반드시 통과해야 하는 검사는 lefthook pre-commit과 CI에 있다.

## 처음 clone한 뒤

1. `pnpm install`. `prepare`가 lefthook을 깔고 생성기를 돌린다. 작업 트리가 깨끗해야 한다
2. Claude Code를 열어 `/skills`에 `pop-pick-dev`, `pop-pick-qa`, `pop-pick-git`, `review-protocol`이 뜨는지 본다
3. Codex를 쓰면 저장소를 신뢰로 표시한다. 하지 않으면 `.codex/` 아래가 통째로 무시된다
