# 플래너 조건 입력과 코스 생성 설계

`features/planner`. 코스 조건 입력 폼과 생성 작업의 시작, 진행 상태 폴링, 취소를 다룬다. 만들어진 코스를 보이고 저장하는 것과 플래너 첫 화면인 내 일정 목록은 `course.md`다.

## R. Requirements

**기능.** 플래너 홈의 생성 배너에서 `/planner/new`로 들어와 조건을 입력하고 "AI 코스 생성하기"를 누르면 생성 중 화면이 단계 셋과 취소 버튼을 보이고 끝나면 생성 완료 화면으로 넘어간다. 생성 완료는 아직 저장하지 않은 코스다. 조건 항목과 시간 규칙은 `docs/product/SPEC.md`의 원데이 플래너 절이 정본이다.

**지금 코드.** 코스 API가 없다. 만들기를 누르면 작업 id 자리에 `pending`을 넣어 생성 중 화면으로 가고 단계 셋을 시간으로 넘긴 뒤 생성 결과 미리보기 `/courses/101?{조건}`으로 `replace`한다. 미리보기가 무엇을 그리는지는 `course.md`에 있다. 서버 작업과 폴링, 실패 화면, 60초 상한은 API가 열리면 만든다. 아래 보장 중 작업과 폴링에 걸린 것은 그때의 계약이다.

**보장.**

- "AI 코스 생성하기"를 누른 뒤 300ms 안에 생성 중 화면이 보인다. 작업 시작 요청의 응답을 기다리지 않고 화면을 바꾸고 `jobId`를 받으면 URL을 채운다
- 진행 상태는 1초 간격으로 갱신되고 탭이 백그라운드면 멈춘다
- 작업이 60초 안에 끝나지 않으면 실패로 보이고 다시 시도와 조건 수정 둘을 준다. 무한히 기다리는 화면이 없다
- 취소를 누르면 서버 작업이 멈추고 조건 입력으로 돌아간다. 입력한 값이 남는다. 취소 뒤 그 작업의 결과가 화면에 나타나지 않는다
- 생성 중에 새로고침해도 URL의 `jobId`로 같은 작업을 이어 본다
- 코스 만들기는 로그인이 필요하다. 비로그인이면 조건 입력은 보이되 만들기를 누르면 로그인 유도 알럿이 뜨고 확인하면 `/login?next=/planner/new?{조건}`으로 간다. 입력한 조건은 `next`의 쿼리에 실려 돌아온다
- 필수 조건 다섯(동행 유형, 인원수, 날짜, 시작 시간, 소요 시간)이 다 차고 `courseRequestSchema`를 통과해야 만들기가 눌린다. 날짜는 서울 기준 오늘이거나 그 뒤여야 한다. 조건이 모자라거나 틀린 쿼리로 생성 중 주소를 열면 조건 입력으로 보낸다

**설계를 가르는 질문.**

- 통신 성질은 비동기 작업과 폴링이다. LLM 호출이 10초를 넘을 수 있고 요청이 rewrites 프록시를 지나므로 요청 하나를 오래 열어 두지 않는다
- 서버에서 받는 것은 끝났는지 여부다. 단계별 진행은 프론트가 시간으로 그린다. 서버가 실제 단계를 보내려면 웹소켓이 필요한데 사용자가 얻는 것이 진행 막대 하나라 그만한 일이 아니다
- 실패는 화면에 남기고 사용자가 정한다. 다시 시도는 같은 조건으로 새 작업이다
- 생성과 저장은 따로다. 작업이 `DONE`이면 `courseId`가 있고 `/courses/{id}`는 저장 전 코스를 생성 완료 화면으로 보인다. 사용자가 저장해야 내 일정에 들어간다. 저장 전 코스를 서버가 어디에 두는지는 미정이다(ROADMAP)
- 조건은 URL 쿼리가 갖는다. 로그인 복귀와 취소 뒤 복원, 다시 생성하기가 같은 주소를 쓴다. 컴포넌트 상태나 스토어에만 두면 로그인 왕복과 새로고침에서 사라진다. 폼 값은 react-hook-form이 들고 `hooks/useCourseDraftUrlSync`가 값이 바뀔 때마다 주소를 `replaceState`로 고친다. 뒤로 가기처럼 바깥에서 주소가 바뀌면 폼 값을 주소에 맞춘다. 자기가 쓴 주소와 바깥에서 바뀐 주소를 가려서 입력 중에 폼을 다시 그리지 않는다
- 날짜와 시작 시간을 받는다. 팝업에 운영 기간이 있어 날짜 없이는 어느 날 열린 곳을 고를지 정해지지 않는다. 달력은 오늘부터 고를 수 있고 시작 시간은 10:00부터 22:00까지 1시간 단위다

**범위 밖.** 조건 입력의 지역(받을지 미정이라 조건에 필드가 없다), 여러 지역 코스, 방문 순서 최적화, 코스 안 팝업 교체와 순서 편집.

## A. Architecture

| 상태           | 원천                                      | 비고                                                                        |
| -------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| 입력 중인 조건 | react-hook-form. 값은 `useWatch`로 읽는다 | 첫 값은 `PlannerFormFromUrl`이 브라우저의 지금 주소에서 읽는다              |
| 넘기는 조건    | URL 쿼리                                  | `/planner/new`와 `/planner/generating/{jobId}`가 같은 키를 쓴다             |
| 작업 식별자    | URL `/planner/generating/[jobId]`         | 새로고침에도 이어 본다. 지금은 `pending`                                    |
| 작업 상태      | Server. `["courses", "job", jobId]`       | `refetchInterval`로 폴링. `DONE`이나 `FAILED`면 멈춘다. API가 열리면 만든다 |
| 진행 단계 표시 | Derived. 화면에 머문 시간                 | 서버가 단계를 보내지 않아 `buildProgressPlan`이 짠 계획으로 차례를 넘긴다   |

**URL 쿼리 키.** 목록에 없는 값과 형식이 틀린 값, 지난 날짜는 읽지 않고 그 칸을 비운다.

| 키          | 값                                                      |
| ----------- | ------------------------------------------------------- |
| `companion` | `ALONE`, `WITH_FRIEND`, `COUPLE`, `WITH_FAMILY` 중 하나 |
| `party`     | `1`부터 `4`. `4`는 4명 이상                             |
| `activity`  | 여러 번 온다. `GOODS`, `PHOTO`, `EXPERIENCE`, `FOOD`    |
| `date`      | `YYYY-MM-DD`. 서울 기준 오늘이거나 그 뒤                |
| `start`     | `10:00`부터 `22:00`까지 정시                            |
| `duration`  | `SHORT`, `HALF_DAY`                                     |
| `note`      | 자유 입력. 200자에서 자른다                             |

**흐름.** API가 열린 뒤의 모습이다.

```
/planner                     AI POP PICK 시작하기   /planner/new
/planner/new?{조건}          AI 코스 생성하기       비회원이면 로그인 알럿, 확인하면 /login?next=/planner/new?{조건}
                                                    회원이면 POST /courses  202 { jobId }
                                                    router.push(/planner/generating/{jobId}?{조건})
/planner/generating/{jobId}  GET /courses/jobs/{jobId}  1초 간격
   QUEUED, RUNNING                                  단계 표시
   DONE                                             router.replace(/courses/{courseId})  생성 완료
   FAILED                                           실패 문구, 다시 시도(같은 조건으로 POST), 조건 수정(/planner/new?{조건})
   취소하기                                         DELETE /courses/jobs/{jobId}  뒤 조건 입력으로
```

지금은 `POST`와 폴링 없이 `/planner/generating/pending?{조건}`으로 가고 단계 셋이 지나면 `/courses/101?{조건}`으로 `replace`한다. 결과 주소에 조건을 실어 두어 생성 완료의 다시 생성하기가 같은 조건을 채운다.

만들기를 누르면 이동하기 전에 지금 기록을 `/planner/new?{조건}`으로 바꾼다. 생성 중에서 뒤로 가도 조건이 남는다. 취소하기는 바로 앞 기록이 조건 입력이면 뒤로 가고 아니면 조건을 실은 조건 입력 주소로 `replace`한다. 조건 입력이 기록에 두 번 쌓이지 않는다. 앞 기록을 알아내는 데 Navigation API를 쓰고 없는 브라우저에서는 `replace`한다.

"AI 코스 생성하기"는 `POST` 응답을 기다리기 전에 생성 중 화면을 먼저 그린다. 응답이 오면 URL을 `jobId`로 바꾼다. `POST` 자체가 실패하면 조건 입력 화면으로 돌아가 오류를 폼 위에 보인다.

다시 시도는 같은 조건으로 새 작업을 만든다. 생성 완료의 "다시 생성하기"는 작업을 바로 만들지 않고 조건이 채워진 조건 입력으로 간다.

## D. Data Model

선택지 값과 라벨, 소요 시간별 팝업 수는 온보딩과 같이 쓰려고 `shared/model/trip-preference.ts`에 있다. 소요 시간 `SHORT`는 2시간 내외로 팝업 두 곳, `HALF_DAY`는 4시간에서 5시간으로 세 곳 이상이고 분으로 바꾸는 것은 백엔드가 한다. 입력 중인 조건 `CourseRequestDraft`와 검증 스키마 `courseRequestSchema`, URL과 오가는 함수는 `features/planner/model/course-request.ts`에 있다. 스키마는 필수 다섯과 날짜 범위, 시작 시간 목록, 자유 입력 200자를 보고 선호 활동은 비어도 된다. 생성 중 화면의 단계 셋과 진행 계획은 `generating-steps.ts`와 `generating-progress.ts`이고 서버 값이 아니라 프론트가 정한 순서와 시간이다.

```typescript
// features/planner/model/course-job.ts. 백엔드 요구. API가 열리면 만든다
type CourseJobStatus = "QUEUED" | "RUNNING" | "DONE" | "FAILED";

interface CourseJob {
	jobId: string;
	status: CourseJobStatus;
	/** DONE일 때만 값이 있다 */
	courseId: number | null;
	/** FAILED일 때만 값이 있다 */
	error: { code: string; message: string } | null;
	request: CourseRequest;
}

function shouldKeepPolling(job: CourseJob | undefined, elapsedMs: number): boolean;
```

폴링이 붙으면 상한 60초는 `shouldKeepPolling`의 상수다. 실제 진행과 어긋나므로 마지막 단계는 작업이 끝날 때까지 진행 중으로 둔다. 화면이 다 됐다고 해 놓고 기다리게 하지 않는다.

**선택지 값.** 동행 유형은 백엔드 온보딩 enum `AccompanyType`과 같은 값이다. 선호 활동은 서버가 id 목록으로 준다(`GET /api/v1/onboardings/preferred-activities`). 지금은 시안 라벨 넷을 코드 값으로 두고 선택지 조회가 붙으면 id로 옮긴다. 쿼리 키 `activity`의 값도 그때 바뀐다.

## I. Interface

**컴포넌트.** 조건 입력은 `PlannerForm`, 생성 중은 `GeneratingView`다. 달력 `CalendarPanel`은 react-day-picker의 `DayPicker`를 서울 시간대와 한국어 요일로 그리고 오늘 전 날짜를 막는다. 열리면 고른 날이나 오늘에 포커스가 간다.

라우트 `/planner/new`는 `AuthStatusSwitch`로 인증 상태마다 `PlannerFormFromUrl`의 `mode`를 고른다. `PlannerFormFromUrl`은 `useSearchParams`로 지금 주소의 조건을 읽어 `PlannerForm`의 첫 값으로 준다. 서버가 처음 준 값을 쓰면 뒤로 가기로 돌아왔을 때 바뀐 주소의 조건이 폼에 들어가지 않는다. 폼 머리는 공용 `shared/components/PageHeader`를 화면 위에 고정한 것이고 뒤로 버튼은 앱 안 기록이 없으면 `/planner`로 간다. 시작 시간은 탐색 지역과 같은 `shared/ui/Select`이고 날짜 칸과 `Select`의 펼침 판은 둘 다 `shared/ui/DropdownPanel`이다.

인증 상태가 `unavailable`(세션 확인 실패)이면 `/planner/new`는 `SessionRetry`를 폼 위에 보이고 폼은 `pending`으로 그린다. 조건은 입력할 수 있고 만들기는 눌리지 않는다.

**API가 열리면 만드는 훅.**

```typescript
export function useStartCourseJob(): UseMutationResult<{ jobId: string }, ApiError, CourseRequest>;
export function useCourseJob(jobId: string): UseQueryResult<CourseJob, ApiError>;
export function useCancelCourseJob(): UseMutationResult<null, ApiError, string>;
```

`useCourseJob`은 `refetchInterval`에 함수를 넘겨 `shouldKeepPolling`이 `false`면 멈춘다. `refetchIntervalInBackground`는 `false`다.

**서버 API.** 전부 백엔드 요구다.

| 메서드와 경로                         | 인증 | 요청            | 응답                                         |
| ------------------------------------- | ---- | --------------- | -------------------------------------------- |
| `POST /api/v1/courses`                | 필요 | `CourseRequest` | 202와 `{ jobId }`                            |
| `GET /api/v1/courses/jobs/{jobId}`    | 필요 |                 | `CourseJob`. 상태와 `courseId`만 있으면 된다 |
| `DELETE /api/v1/courses/jobs/{jobId}` | 필요 |                 | `null`. 이미 끝난 작업이면 그대로 성공       |

작업이 `DONE`이 된 뒤 `courseId`로 `GET /api/v1/courses/{id}`가 저장 전 코스를 바로 돌려줘야 한다. 취소된 작업은 `FAILED`와 코드 `CANCELLED`로 조회된다.

**API가 열리면 할 일.** `PENDING_COURSE_JOB_ID`를 지우고 `POST` 응답의 `jobId`로 생성 중 주소를 만든다. `GeneratingView`의 시간 끝 이동을 작업 `DONE`의 `courseId` 이동으로 바꾸고 실패 화면을 더한다. 회원 취향 조회가 생기면 온보딩에서 답한 동행 유형과 인원수, 선호 활동을 폼 첫 값으로 채운다. URL 쿼리에 값이 있으면 쿼리가 먼저다.

**로그.** `[planner]` 접두사. 작업 `FAILED`와 그 코드, 폴링 상한 초과, 시작 요청 실패.

**접근성.** 조건 묶음은 `<section>`이고 제목을 `aria-labelledby`로 잇는다. 칩은 화면에서 숨긴 `radio`와 `checkbox` 입력을 감싼 `<label>`이라 방향키와 스페이스로 고른다. 시작 시간은 `listbox`다. 달력은 react-day-picker가 그리는 WAI-ARIA 격자다. 방향키와 PageUp, PageDown, Home, End로 날짜를 옮기고 오늘 전 날짜는 고를 수 없다. 생성 중 화면의 단계는 `<ol>`이다. 취소 버튼은 화면에 들어올 때 포커스를 받지 않는다. 사용자가 실수로 누르지 않게 하기 위해서다. 움직임 줄이기 설정이면 진행 막대가 끝난 단계까지만 채워지고 움직이지 않는다.

## O. Optimization과 운영

**렌더링.** 생성 중 화면의 진행 막대는 일정한 속도로 차지 않는다. `buildProgressPlan`이 화면에 들어올 때 한 번 계획을 짠다. 단계마다 2.6초에서 4초 사이 길이를 여러 조각으로 나누고, 조각마다 앞으로 가는 양을 다르게 주고 가끔 멈칫하게 한다. 마지막 단계는 93%에서 버티다 끝에 채운다. 코스 API가 붙으면 서버가 끝났다고 알릴 때까지 이 버티는 구간에 머문다. 로딩 링은 디자이너가 준 Lottie 애니메이션(4초 반복)이고 막대 위로 빛이 지나간다. 링은 `lottie-web`의 경량 빌드(`lottie_light`, SVG 렌더러만 있고 표현식을 돌리지 않는다)로 재생한다. 재생기와 애니메이션 JSON은 생성 중 화면에서만 동적 import로 불러와 다른 화면 번들에 들어가지 않는다. 같은 자리에 애니메이션 23프레임을 뜬 정지 그림(`public/illustrations/planner-generating-ring.svg`)을 포스터로 두고 재생도 23프레임에서 시작해 넘어갈 때 모양이 튀지 않는다. 포스터는 재생기를 불러오는 동안과 움직임 줄이기 설정에서 보이고, 불러오지 못하면 포스터를 둔 채 `[planner]` 로그를 남긴다. 진행 중 단계의 점 셋은 차례로 튀고 끝난 단계의 체크는 튀어나온다. 움직임 줄이기 설정이면 막대는 끝난 단계까지만 채워지고 나머지 움직임은 멈춘다. 제목 아래 "10초 정도 소요될 수 있어요." 안내의 10초는 백엔드가 준 임시값이다(ROADMAP 미결정). 폴링 상한 60초와 다른 값이다. 안내는 사용자에게 보이는 예상치이고 상한은 화면이 기다림을 멈추는 지점이다.

**장애.** 백엔드가 죽으면 `POST`가 실패해 폼 위에 오류가 보인다. 폴링 중 네트워크 오류는 상한 안에서 계속 시도한다. 상한을 넘으면 실패로 보이고 작업은 서버에 남아 있을 수 있으므로 `DELETE`를 한 번 보낸다. 실패해도 로그만 남긴다. 사용자가 조건 수정으로 돌아가면 새 작업이라 옛 작업의 결과는 화면에 오지 않는다.

**재시도와 몰림.** 폴링은 1초 고정이고 오류가 나면 2초, 4초, 5초 상한으로 늘린다. 클라이언트 하나의 폴링이라 무작위 지연은 필요 없다. 다시 시도는 사용자가 누를 때만이다. 자동으로 새 작업을 만들지 않는다. 작업 하나가 카카오 경로 조회를 구간 수만큼 쓰므로 자동 재시도가 쿼터를 깎는다.

**지표.** 폴링 상한 초과 횟수는 0이어야 한다. 작업 `FAILED` 비율과 취소 비율도 센다. 취소가 높으면 생성이 너무 느리다.

**운영.** 카카오 경로 조회 하루 한도와 계산은 `docs/release/RUNBOOK.md`의 쿼터 절에 있다. 작업 하나가 구간 수만큼 쓰고 코스를 다시 열 때 또 쓴다. 한도에 닿으면 구간이 "소요시간 모름"으로 보이고 코스 자체는 만들어진다. 백엔드가 남은 한도를 로그로 남기는 것을 요구한다.
