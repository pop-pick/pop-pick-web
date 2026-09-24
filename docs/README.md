# docs 안내

문서를 어디에 두고 지금 무엇이 비어 있는지 적는다. 한국어 작성 규칙은 루트 `AGENTS.md`를 따른다.

## 배치 기준

성격으로 나눈다. 만드는 것은 `product/`, 보이는 것은 `design/`, 어떻게 만드는지는 `architecture/`, 내보내고 운영하는 것은 `release/`, 에이전트 하네스가 어떻게 도는지는 `harness/`다. 파일마다 어떤 질문에 답하는지는 루트 `README.md`의 문서 절에 있다.

`architecture/`는 전체 구조 문서 `ARCHITECTURE.md` 하나와 기능 폴더와 이름이 같은 기능 문서 일곱으로 되어 있다. 기능 문서는 Requirements, Architecture, Data Model, Interface, Optimization 다섯 절을 같은 순서로 가진다. 화면을 만들 때 그 화면의 기능 문서를 먼저 연다.

미결정 항목과 그것을 정하는 자리는 `product/ROADMAP.md`의 미결정 절 하나가 갖는다. 다른 문서는 미정이라고만 적고 결정 시점을 되풀이하지 않는다.

## 비어 있는 것

아직 채우지 못한 자리다.

| 문서                          | 비어 있는 것                               |
| ----------------------------- | ------------------------------------------ |
| `product/PRD.md`              | 성공 기준                                  |
| `product/SPEC.md`             | 추천 이유 글자 수 상한                     |
| `design/DESIGN.md`            | 인상과 레퍼런스, 컬러 값과 글꼴, 다크 모드 |
| `design/DESIGN-SPEC.md`       | 후보 다섯의 규칙. 만들면서 채운다          |
| `architecture/{기능}.md` 일곱 | 백엔드가 API를 만들면 생성 타입으로 교체   |
| `release/RUNBOOK.md`          | 도메인이 정해진 뒤의 연결 절차             |
| `release/SEO.md`              | 도메인                                     |
| `release/PRIVACY.md`          | 보관 기간, 문의처, 시행일                  |

## 새 문서를 추가할 때

기존 파일의 절로 먼저 넣는다. 파일이 길어져 찾기 어렵거나 읽는 사람이 달라지면 그때 분리한다. 분리하면 루트 `README.md`의 문서 표에 한 줄 더한다. 문서 첫머리의 안내 문단은 내용을 채우면 지운다.
