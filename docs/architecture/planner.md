# 플래너 조건 입력과 코스 생성 설계

`features/planner`. 코스 조건 입력 폼과 생성 작업의 시작, 진행 상태 폴링, 취소를 다룬다. 만들어진 코스를 보이는 것과 플래너 첫 화면인 내 일정 목록은 `course.md`다.

## R. Requirements

**기능.** `/planner/new`에서 조건을 입력해 "AI 맞춤 동선 설계하기"를 누르면 생성 중 화면이 단계별 체크리스트와 취소 버튼을 보이고 끝나면 코스 결과로 넘어간다. 플래너에 들어오면 내 일정이 먼저 보이고 거기서 코스 만들기로 들어온다. 팝업 상세에서 들어오면 그 팝업의 지역이 미리 선택되고 코스에 그 팝업이 들어간다. 조건 항목과 시간 규칙은 `docs/product/SPEC.md`의 원데이 플래너 절이 정본이다.

**보장.**

- "설계하기"를 누른 뒤 300ms 안에 생성 중 화면이 보인다. 작업 시작 요청의 응답을 기다리지 않고 화면을 바꾸고 `jobId`를 받으면 URL을 채운다
- 진행 상태는 1초 간격으로 갱신되고 탭이 백그라운드면 멈춘다
- 작업이 60초 안에 끝나지 않으면 실패로 보이고 다시 시도와 조건 수정 둘을 준다. 무한히 기다리는 화면이 없다
- 취소를 누르면 서버 작업이 멈추고 조건 입력으로 돌아간다. 취소 뒤 그 작업의 결과가 화면에 나타나지 않는다
- 생성 중에 새로고침해도 URL의 `jobId`로 같은 작업을 이어 본다
- 코스 만들기는 로그인이 필요하다. 비로그인이면 조건 입력은 보이되 "설계하기"에서 `/login?next=/planner/new?...`로 간다. 입력한 조건은 `next`의 쿼리에 실려 돌아온다

**설계를 가르는 질문.**

- 통신 성질은 비동기 작업과 폴링이다. LLM 호출이 10초를 넘을 수 있고 요청이 rewrites 프록시를 지나므로 요청 하나를 오래 열어 두지 않는다
- 서버에서 받는 것은 끝났는지 여부다. 단계별 진행은 프론트가 시간으로 그린다. 서버가 실제 단계를 보내려면 웹소켓이 필요한데 사용자가 얻는 것이 진행 막대 하나라 그만한 일이 아니다
- 실패는 화면에 남기고 사용자가 정한다. 다시 시도는 같은 조건으로 새 작업이다
- 코스는 만들어지는 순간 저장된다. 임시 상태가 없다. 작업이 `DONE`이면 `courseId`가 있고 `/courses/{id}`가 곧 저장된 코스다
- 날짜와 시작 시각을 받는다. 기획 리뷰에서 달력으로 날짜를 받기로 확정했고 시작 시각은 오전 9시부터 밤 10시까지다. 팝업에 운영 기간이 있어 날짜 없이는 어느 날 열린 곳을 고를지 정해지지 않는다

**범위 밖.** 조건 입력의 요청사항 자유 입력, 여러 지역 코스, 방문 순서 최적화, 코스 안 팝업 교체와 순서 편집.

## A. Architecture

| 상태           | 원천                                | 비고                                                   |
| -------------- | ----------------------------------- | ------------------------------------------------------ |
| 입력 중인 조건 | react-hook-form                     | zod 스키마로 검증                                      |
| 미리 채울 팝업 | URL `/planner/new?anchor={popupId}` | 팝업 조회로 지역을 읽어 폼 기본값에 넣는다             |
| 작업 식별자    | URL `/planner/generating/[jobId]`   | 새로고침에도 이어 본다                                 |
| 작업 상태      | Server. `["courses", "job", jobId]` | `refetchInterval`로 폴링. `DONE`이나 `FAILED`면 멈춘다 |
| 진행 단계 표시 | Derived. 화면에 머문 시간           | 서버가 단계를 보내지 않아 시간으로 차례를 넘긴다       |

**흐름.**

```
/planner          코스 만들기          router.push(/planner/new)
/planner/new      설계하기            POST /courses  202 { jobId }
                                       router.push(/planner/generating/{jobId})
/planner/generating/{jobId}            GET /courses/jobs/{jobId}  1초 간격
   QUEUED, RUNNING                     체크리스트 갱신
   DONE                                router.replace(/courses/{courseId})
   FAILED                              실패 문구, 다시 시도(같은 조건으로 POST), 조건 수정(/planner/new로)
   취소하기 버튼                       DELETE /courses/jobs/{jobId}  뒤 /planner/new로 replace
```

"설계하기"는 `POST` 응답을 기다리기 전에 로컬 상태로 생성 중 화면을 먼저 그린다. 응답이 오면 URL을 `jobId`로 바꾼다. `POST` 자체가 실패하면 조건 입력 화면으로 돌아가 오류를 폼 위에 보인다.

다시 시도는 `course.md`의 "다시 추천받기"와 같은 함수다. 조건을 그대로 `POST`하고 새 `jobId`로 같은 화면을 다시 쓴다.

## D. Data Model

```typescript
// features/planner/model/course-request.ts
type Companion = "ALONE" | "COUPLE" | "FRIEND" | "FAMILY";
/** SHORT는 약 2시간, HALF_DAY는 4시간에서 5시간. 분으로 바꾸는 것은 백엔드 몫 */
type Duration = "SHORT" | "HALF_DAY";

interface CourseRequest {
	region: Region;
	/** 날짜 포맷은 미정(ROADMAP). ISO 8601 날짜 문자열을 가정한다 */
	date: string;
	/** "HH:mm" */
	startAt: string;
	duration: Duration;
	companion: Companion;
	includeActivity: boolean;
	includeFood: boolean;
	/** 상세에서 들어왔을 때 그 팝업. 코스에 반드시 포함된다 */
	anchorPopupId: number | null;
}

// features/planner/model/course-request-schema.ts
const courseRequestSchema: z.ZodType<CourseRequest>; // date는 오늘 이후, startAt은 시각 형식

// features/planner/model/course-job.ts. 백엔드 요구
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

// features/planner/model/job-progress.ts
/** 화면이 그리는 단계. 서버 값이 아니라 프론트가 정한 순서다 */
type ProgressStep = "PICKING" | "ROUTING" | "SCHEDULING";
type ChecklistState = Record<ProgressStep, "done" | "active" | "pending">;
/** 화면에 머문 시간으로 체크리스트를 채운다. 작업이 DONE이면 전부 done */
function toChecklist(elapsedMs: number, status: CourseJobStatus): ChecklistState;
function shouldKeepPolling(job: CourseJob | undefined, elapsedMs: number): boolean;
```

`toChecklist`와 `shouldKeepPolling`은 분기 있는 순수 함수다. 상한 60초는 `shouldKeepPolling`의 상수이고 단계를 넘기는 간격도 같은 파일의 상수다. 실제 진행과 어긋나므로 마지막 단계는 작업이 끝날 때까지 진행 중으로 둔다. 화면이 다 됐다고 해 놓고 기다리게 하지 않는다.

`includeFood`가 켜져도 코스에 카페가 들어가는지는 연계 카페 결정에 걸린다. 요청은 토글 값을 그대로 보내고 결과에 `PLACE` 항목이 없으면 그리지 않는다. 토글이 화면에 있는데 아무 효과가 없으면 사용자를 속이는 것이므로 연계 카페를 넣지 않기로 정해지면 토글 둘을 뺀다.

## I. Interface

**컴포넌트와 훅.**

```typescript
export function PlannerForm({ anchorPopupId }: { anchorPopupId: number | null });
export function RegionChoice({ name }: { name: string }); // 단일 선택 칩
export function DateQuickPick({ name }: { name: string }); // 오늘, 이번 토요일, 이번 일요일 버튼과 날짜 입력
export function TimeSelect({ name }: { name: string });
export function DurationChoice({ name }: { name: string });
export function CompanionChoice({ name }: { name: string });
export function GeneratingView({ jobId }: { jobId: string }); // 제목과 안내, 진행 카드, 취소하기, 실패 처리

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

작업이 `DONE`이 된 뒤 코스가 저장되어 있어야 하고 `courseId`로 `GET /api/v1/courses/{id}`가 바로 응답해야 한다. 취소된 작업은 `FAILED`와 코드 `CANCELLED`로 조회된다.

**로그.** `[planner]` 접두사. 작업 `FAILED`와 그 코드, 폴링 상한 초과, 시작 요청 실패.

**접근성.** 폼은 항목마다 `<fieldset>`과 `<legend>`다. 토글은 `<button role="switch" aria-checked>`다. 날짜는 `<input type="date">`를 기본으로 두고 퀵 선택 버튼이 그 값을 채운다. 생성 중 화면의 문구는 `role="status"`이고 체크리스트는 `<ol>`이며 진행 중 항목에 `aria-current="step"`이다. 취소 버튼은 화면에 들어올 때 포커스를 받지 않는다. 폴링 중 사용자가 실수로 누르지 않게 하기 위해서다.

## O. Optimization과 운영

**렌더링.** 생성 중 화면은 정적 요소가 대부분이라 체크리스트 상태만 바뀐다. 제목은 "코스를 만들고 있어요"이고 그 아래 "10초 정도 소요될 수 있어요" 안내가 있다. 10초는 백엔드가 준 임시값이라 측정이 끝나면 화면과 이 문서를 같이 고친다. 폴링 상한 60초와 다른 값이다. 안내는 사용자에게 보이는 예상치이고 상한은 화면이 기다림을 멈추는 지점이다.

**장애.** 백엔드가 죽으면 `POST`가 실패해 폼 위에 오류가 보인다. 폴링 중 네트워크 오류는 상한 안에서 계속 시도한다. 상한을 넘으면 실패로 보이고 작업은 서버에 남아 있을 수 있으므로 `DELETE`를 한 번 보낸다. 실패해도 로그만 남긴다. 사용자가 조건 수정으로 돌아가면 새 작업이라 옛 작업의 결과는 화면에 오지 않는다.

**재시도와 몰림.** 폴링은 1초 고정이고 오류가 나면 2초, 4초, 5초 상한으로 늘린다. 클라이언트 하나의 폴링이라 무작위 지연은 필요 없다. 다시 시도는 사용자가 누를 때만이다. 자동으로 새 작업을 만들지 않는다. 작업 하나가 카카오 경로 조회를 구간 수만큼 쓰므로 자동 재시도가 쿼터를 깎는다.

**지표.** 폴링 상한 초과 횟수는 0이어야 한다. 작업 `FAILED` 비율과 취소 비율도 센다. 취소가 높으면 생성이 너무 느리다.

**운영.** 카카오 경로 조회 하루 한도와 계산은 `docs/release/RUNBOOK.md`의 쿼터 절에 있다. 작업 하나가 구간 수만큼 쓰고 코스를 다시 열 때 또 쓴다. 한도에 닿으면 구간이 "소요시간 모름"으로 보이고 코스 자체는 만들어진다. 백엔드가 남은 한도를 로그로 남기는 것을 요구한다.
