# docs 안내

어느 문서가 무엇을 답하는지와 지금 무엇이 비어 있는지 적는다. 한국어 작성 규칙은 루트 `AGENTS.md`를 따른다.

## 문서마다 답하는 질문

| 문서                                | 답하는 질문                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `docs/product/PRD.md`               | 누구의 어떤 문제를 왜 푸는가. 1.0에 무엇을 넣고 빼는가                                                                          |
| `docs/product/SPEC.md`              | 각 기능이 정확히 어떻게 동작하는가                                                                                              |
| `docs/product/ROADMAP.md`           | 무엇을 어떤 순서로 만드는가. 무엇을 하지 않기로 했고 무엇이 아직 정해지지 않았는가                                              |
| `docs/design/DESIGN.md`             | 서비스가 어떤 인상을 주는가. 색과 글자, 간격, 아이콘 토큰은 무엇인가                                                            |
| `docs/design/DESIGN-SPEC.md`        | 각 화면에 무엇이 어떻게 놓이는가. 공통 컴포넌트는 무엇이 있는가                                                                 |
| `docs/architecture/ARCHITECTURE.md` | 라우트와 상태의 원천, 데이터 흐름, 폴더는 어떻게 잡았고 백엔드에 무엇을 요구하는가                                              |
| `docs/architecture/{기능}.md`       | 기능 하나가 무엇을 보장하고 어떤 타입과 계약으로 움직이는가. auth, onboarding, recommendation, popup, bookmark, planner, course |
| `docs/release/RUNBOOK.md`           | 배포와 환경 변수, 카카오와 구글 콘솔 설정, 장애 대응을 어떻게 하는가                                                            |
| `docs/release/SEO.md`               | 코드로 할 수 없는 검색 유입 작업은 무엇인가                                                                                     |
| `docs/release/PRIVACY.md`           | 어떤 정보를 모으고 어떻게 다루는가                                                                                              |
| `docs/harness/AI_WORKFLOW.md`       | 에이전트 하네스가 어떻게 돌고 어떻게 고치는가                                                                                   |

서비스 소개와 문서 입구는 루트 `README.md`에, 개발 환경과 명령, 기여 절차는 `CONTRIBUTING.md`에, 에이전트가 세션마다 지킬 것은 `AGENTS.md`에 있다.

## 배치 기준

성격으로 나눈다. 만드는 것은 `product/`, 보이는 것은 `design/`, 어떻게 만드는지는 `architecture/`, 내보내고 운영하는 것은 `release/`, 에이전트 하네스가 어떻게 도는지는 `harness/`다.

`architecture/`는 전체 구조 문서 `ARCHITECTURE.md` 하나와 기능 폴더와 이름이 같은 기능 문서 일곱으로 되어 있다. 기능 문서는 Requirements, Architecture, Data Model, Interface, Optimization 다섯 절을 같은 순서로 가진다. 화면을 만들 때 그 화면의 기능 문서를 먼저 연다.

미결정 항목과 그것을 정하는 사람은 `product/ROADMAP.md` 한 곳에만 적는다. 다른 문서는 미정이라고만 적고 결정 시점을 반복하지 않는다.

## 비어 있는 것

아직 채우지 못한 자리다.

| 문서                             | 비어 있는 것                                                         |
| -------------------------------- | -------------------------------------------------------------------- |
| `product/PRD.md`                 | 성공 기준                                                            |
| `product/SPEC.md`                | 추천 이유 글자 수 상한                                               |
| `design/DESIGN.md`               | 인상과 레퍼런스, 다크 모드                                           |
| `architecture/recommendation.md` | 추천과 인기, 지역 요약 API의 응답 타입. 백엔드가 API를 만들면 정한다 |
| `release/RUNBOOK.md`             | 도메인이 정해진 뒤의 연결 절차                                       |
| `release/SEO.md`                 | 도메인                                                               |
| `release/PRIVACY.md`             | 보관 기간, 문의처, 시행일                                            |

## 새 문서를 추가할 때

기존 파일의 절로 먼저 넣는다. 파일이 길어져 찾기 어렵거나 읽는 사람이 달라지면 그때 분리한다. 분리하면 이 문서의 질문 표에 한 줄 더한다. 문서 첫머리의 안내 문단은 내용을 채우면 지운다.
