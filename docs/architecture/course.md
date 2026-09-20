# 코스 결과와 저장, 캘린더 설계

`features/course`. 코스 결과 화면(지도와 타임라인), 구간별 도보 소요시간, 플래너 첫 화면인 내 일정 목록과 삭제, 캘린더 저장과 저장 완료 화면을 다룬다. 코스를 만드는 것은 `planner.md`다. 데모데이 시연의 핵심 장면이 이 화면이다.

## R. Requirements

**기능.** 코스 결과는 지도 위 순서 마커와 경로선, 총 도보 요약, 타임라인, 캘린더 저장 버튼, 공유하기다. 플래너에 들어가면 내 일정이 먼저 보이고 탭 셋(다가오는 일정, 지난 일정, 취소된 일정)에서 코스를 다시 열고 지운다. 화면에 무엇이 놓이는지는 `docs/product/SPEC.md`의 원데이 플래너 절과 `docs/design/DESIGN-SPEC.md`의 코스 결과 절이 정본이다.

**보장.**

- 코스의 팝업과 순서, 도착 시각은 p75 1초 안에 그려진다. 구간 소요시간은 별도 요청이라 구간마다 스켈레톤을 먼저 보이고 도착하면 채운다
- 소요시간을 못 받은 구간은 "소요시간 모름"으로 보인다. 0분이나 빈 값으로 바꾸지 않는다. 그 구간 뒤의 도착 시각에는 "예상" 라벨이 붙는다(SPEC)
- 경로 응답을 저장하지 않는다. 코스를 다시 열면 다시 조회한다. 캐시 수명 0이다
- 지도는 코스의 모든 마커가 보이게 맞춰진다
- 캘린더 링크의 시작 시각은 첫 도착 시각, 종료 시각은 마지막 도착 시각에 예상 체류 최대를 더한 것이다. 본문에 방문 순서가 들어간다
- 삭제는 확인을 거치고 확인 뒤 다가오는 일정에서 사라져 취소된 일정 탭으로 간다
- 일정이 하나도 없으면 빈 목록 대신 코스를 만들러 가는 자리가 뜬다
- 타임라인 항목의 `order`는 1부터 빈 곳 없이 이어진다. 어긋나면 그리지 않고 오류로 낸다

**설계를 가르는 질문.**

- 코스와 구간은 다른 수명이다. 코스는 저장된 서버 상태라 캐시해도 되고 구간 소요시간은 카카오 응답이라 저장할 수 없다. 그래서 요청이 둘이다. 하나로 합치면 빠른 것이 느린 것을 기다리고 캐시 규칙도 하나로 묶인다
- 캘린더는 두 갈래다. 구글 캘린더에 추가와 캘린더 파일 받기를 둘 다 제공한다. 구글 링크는 일정 작성 화면이 채워진 채로 열려 저장만 누르면 끝이라 모바일에서 단계가 짧다. 다만 구글 전용이라 애플 캘린더와 아웃룩을 쓰는 사람에게는 `.ics`가 필요하다. 둘 다 인증과 백엔드 작업이 없다. 구글 캘린더 API로 우리가 일정을 직접 넣는 방식은 `calendar.events`가 민감한 범위라 심사를 받아야 하고 테스트 모드에서 등록한 100명까지만 되어 접었다. 등록 여부를 우리가 알 수 없어 완료 화면 문구는 "캘린더로 보냈습니다"이고 배지도 "캘린더에 보냄"이다
- 생성이 곧 저장이라 저장 버튼이 없다. 코스를 고치거나 되돌리는 기능이 없고 다시 만들기만 있다. 다시 만들기는 새 코스를 만들고 이전 코스는 목록에 남는다. 지우는 것은 사용자다
- 삭제가 목록에서 지우는 것이 아니라 취소된 일정으로 옮기는 것이다. 사용자가 무엇을 취소했는지 되짚을 수 있어야 한다

**범위 밖.** 코스 편집(팝업 교체, 순서 변경), 코스 공유 링크의 비로그인 열람(코스가 사용자에 귀속이라 로그인 필요), 연계 카페(`kind`가 `PLACE`인 항목이 오면 그리는 자리만 둔다), 대기시간 예상(`waitEstimateMinutes`가 `null`이면 그리지 않는다), 방문 전 알림(넣지 않기로 했다).

## A. Architecture

| 상태                  | 원천                                         | 비고                                                       |
| --------------------- | -------------------------------------------- | ---------------------------------------------------------- |
| 코스                  | Server. `["courses", "detail", courseId]`    | 기본 `staleTime`                                           |
| 구간 소요시간과 경로  | Server. `["courses", "walks", courseId]`     | `staleTime` 0, `gcTime` 0. 화면을 떠나면 버린다            |
| 내 일정 목록          | Server. `["courses", "list"]` 무한 쿼리      | 탭 셋이 같은 응답을 나눠 쓴다                              |
| 코스 식별자           | URL `/courses/[courseId]`                    |                                                            |
| 내 일정 탭            | URL `/planner?tab=upcoming\|past\|cancelled` | 기본 `upcoming`                                            |
| 일정이 어느 탭인가    | Derived. `cancelledAt`과 `date`, 오늘        | `resolveCourseTab`                                         |
| 총 도보 시간과 거리   | Derived. 구간 중 `OK`인 것의 합              | `UNKNOWN`이 하나라도 있으면 "일부 구간 제외" 문구를 붙인다 |
| 도착 시각의 예상 라벨 | Derived. 앞 구간 중 `UNKNOWN`이 있는가       |                                                            |
| 삭제 확인 열림        | 컴포넌트 `useState`                          | native `<dialog>`                                          |

통신은 요청 응답이다. 코스와 구간, 목록, 삭제, 캘린더 표시 다섯이다.

**흐름.**

```
/courses/{id}     GET /courses/{id}         팝업과 순서, 도착 시각을 먼저 그린다
                  GET /courses/{id}/walks   구간마다 스켈레톤을 채운다. 실패 구간은 모름
   다시 만들기    planner의 useStartCourseJob(course.request)  /planner/generating/{jobId}
   공유하기       이 페이지 주소를 클립보드에 복사
   구글 캘린더    템플릿 링크를 새 탭으로 연다
   파일 받기      .ics 파일을 내려받는다
                  PATCH /courses/{id} { calendarSentAt }  뒤 /courses/{id}/saved
/courses/{id}/saved   요약과 "저장된 일정 보기"(/planner), "홈으로"
/planner?tab=     GET /me/courses           삭제는 확인 뒤 DELETE, 목록 무효화
```

구간 응답은 `fromOrder`로 타임라인 항목 사이에 끼운다. 항목 `i`와 `i + 1` 사이의 구간은 `fromOrder`가 `i`인 것이다. 아직 없으면 스켈레톤, `UNKNOWN`이면 모름 문구, `OK`면 분과 거리다.

## D. Data Model

```typescript
// features/course/model/course.ts. 백엔드 요구
type CourseItemKind = "POPUP" | "PLACE";

interface CourseItem {
	/** 1부터 연속 */
	order: number;
	/** PLACE는 연계 카페 여부가 정해질 때까지 오지 않는다 */
	kind: CourseItemKind;
	popup: PopupSummary & { lat: number; lng: number; addressRoad: string | null };
	/** 날짜와 시각. 포맷은 미정(ROADMAP) */
	arriveAt: string;
	/** 없으면 체류시간 줄을 그리지 않는다 */
	stay: { minMinutes: number; maxMinutes: number } | null;
	/** 대기시간 출처가 미정이라 null일 수 있다 */
	waitEstimateMinutes: number | null;
}

interface Course {
	id: number;
	request: CourseRequest;
	/** 두 줄 이내 */
	aiReason: string;
	items: CourseItem[];
	createdAt: string;
	calendarSentAt: string | null;
}

interface CourseSummary {
	id: number;
	date: string;
	region: Region;
	duration: Duration;
	itemCount: number;
	/** 구간 조회 없이 목록에 보일 값. 백엔드가 생성 시점 값을 저장한다. 없으면 그리지 않는다 */
	totalWalkMinutesAtCreation: number | null;
	calendarSentAt: string | null;
	/** 사용자가 지운 일정. 목록에서 없어지지 않고 취소된 일정 탭으로 간다 */
	cancelledAt: string | null;
}

// features/course/model/course-tab.ts
type CourseTab = "upcoming" | "past" | "cancelled";
/** cancelledAt이 있으면 cancelled, 없고 date가 오늘 이후면 upcoming, 그 밖은 past */
function resolveCourseTab(course: CourseSummary, today: Date): CourseTab;

// features/course/model/walk.ts. 백엔드 요구
type WalkSegment =
	| {
			fromOrder: number;
			toOrder: number;
			status: "OK";
			/** 카카오 totalTime. 초 */
			seconds: number;
			/** 카카오 totalDistance. 미터 */
			distanceM: number;
			/** [경도, 위도] 배열. 카카오 steps[].path.points를 이어 붙인 것 */
			path: [number, number][];
	  }
	| {
			fromOrder: number;
			toOrder: number;
			status: "UNKNOWN";
			/** 카카오 상태 값. SAME_POINT, TOO_FAR_AWAY 등 */
			reason: string;
	  };

// features/course/model/walk.ts
function toMinutes(seconds: number): number; // Math.round(seconds / 60). 1분 미만은 1
function totalWalk(segments: WalkSegment[]): { minutes: number; distanceM: number; hasUnknown: boolean };
function isArrivalEstimated(itemOrder: number, segments: WalkSegment[]): boolean;
function assertContiguousOrders(items: CourseItem[]): void; // 어긋나면 던진다

// features/course/model/calendar.ts
interface CalendarEvent {
	title: string;
	startAt: Date;
	endAt: Date;
	location: string;
	description: string;
}
type CalendarTarget = "google" | "ics";

function toCalendarEvent(course: Course): CalendarEvent;
function buildGoogleCalendarUrl(event: CalendarEvent): string; // calendar.google.com/calendar/render?action=TEMPLATE
function buildIcs(event: CalendarEvent): string;
```

`totalWalkMinutesAtCreation`은 생성 시점의 합계를 백엔드가 저장한 값이다. 카카오 응답을 저장하는 것이 아니라 우리가 계산한 합계 숫자 하나라 저장할 수 있다고 본다. 카카오 데브톡 답변에 따라 이 판단이 바뀌면 이 필드를 빼고 목록에서 총 도보 시간을 그리지 않는다.

`toMinutes`, `totalWalk`, `isArrivalEstimated`, `resolveCourseTab`, `toCalendarEvent`, `buildGoogleCalendarUrl`, `buildIcs`는 분기 있는 순수 함수라 `testing.md`의 값이 나는 자리다.

## I. Interface

**컴포넌트와 훅.**

```typescript
export function CourseResultView({ courseId }: { courseId: number });
export function CourseHeader({ course, onRegenerate }: { course: Course; onRegenerate: () => void });
export function CourseMap({ items, segments }: { items: CourseItem[]; segments: WalkSegment[] | undefined }); // 번호 마커, 폴리라인, 전체 보기
export function WalkSummary({ segments }: { segments: WalkSegment[] | undefined }); // 총 도보 시간과 거리
export function CourseTimeline({ items, segments }: { items: CourseItem[]; segments: WalkSegment[] | undefined });
export function TimelineItem({ item, estimated }: { item: CourseItem; estimated: boolean });
export function WalkSegmentRow({ segment }: { segment: WalkSegment | undefined }); // undefined면 스켈레톤
export function CalendarSaveButtons({ course }: { course: Course }); // 구글과 파일 둘
export function CourseSavedView({ courseId }: { courseId: number });
export function MyCourseList({ tab }: { tab: CourseTab }); // 플래너 첫 화면. 탭 셋
export function EmptyCourseList(); // 일정이 없을 때. 코스 만들기로 간다

export function useCourse(courseId: number): UseQueryResult<Course, ApiError>;
export function useCourseWalks(courseId: number): UseQueryResult<WalkSegment[], ApiError>;
export function useCourseList(): UseInfiniteQueryResult<InfiniteData<PageResponse<CourseSummary>>, ApiError>;
export function useDeleteCourse(): UseMutationResult<null, ApiError, number>;
export function useMarkCalendarSent(): UseMutationResult<Course, ApiError, number>;
```

**`shared/lib/kakao-map`에 더하는 것.** `markers`와 `onMarkerClick`, 마커 전체가 보이게 맞추는 `fitTo`는 있다. 아래 셋을 더한다.

```typescript
interface KakaoMapProps {
	polylines?: readonly KakaoPolylineData[];
}

interface KakaoMarkerData {
	/** 있으면 기본 마커 대신 번호가 있는 CustomOverlay */
	label?: string;
}

interface KakaoPolylineData {
	id: string;
	path: readonly KakaoLatLngLiteral[];
}

/** 카카오 REST의 [경도, 위도]를 SDK의 { lat, lng }로 */
function fromRestPoint(point: [number, number]): KakaoLatLngLiteral;
```

**서버 API.** 전부 백엔드 요구다.

| 메서드와 경로                          | 인증 | 요청                 | 응답                                                          |
| -------------------------------------- | ---- | -------------------- | ------------------------------------------------------------- |
| `GET /api/v1/courses/{courseId}`       | 필요 |                      | `Course`                                                      |
| `GET /api/v1/courses/{courseId}/walks` | 필요 |                      | `WalkSegment[]`. 항목 수 빼기 1개                             |
| `GET /api/v1/me/courses`               | 필요 |                      | `PageResponse<CourseSummary>`. 최근 생성 순. 취소한 것도 포함 |
| `DELETE /api/v1/courses/{courseId}`    | 필요 |                      | `null`. 지우지 않고 `cancelledAt`을 채운다                    |
| `PATCH /api/v1/courses/{courseId}`     | 필요 | `{ calendarSentAt }` | `Course`                                                      |

구간 조회는 백엔드가 카카오 경로 조회를 구간마다 한 번씩 부르고 응답을 저장하지 않는다. 프록시로만 쓰는 Next는 이 조합을 갖지 않는다. 실패한 구간은 HTTP 200 안의 `status`로 판정해 `UNKNOWN`으로 낸다. 응답 전체가 실패하는 것과 구간 하나가 실패하는 것을 가른다.

**캘린더.** 버튼이 둘이다. 구글 캘린더에 추가는 `buildGoogleCalendarUrl`의 주소를 새 탭으로 열고, 캘린더 파일 받기는 `buildIcs`의 문자열을 `Blob`으로 만들어 `<a download>`로 내려준다. 배치는 `docs/design/DESIGN-SPEC.md`가 정한다. 구글 링크는 브라우저에 이미 있는 구글 세션을 쓸 뿐이라 우리가 권한을 받지 않는다. 구글 로그인 여부와도 무관하다. 어느 쪽이든 직후에 `PATCH`로 시각을 기록하고 저장 완료 화면으로 간다. `PATCH`가 실패해도 동작은 이미 끝났으므로 완료 화면으로 가고 배지가 안 붙는 것만 로그로 남긴다.

**로그.** `[course]` 접두사. 구간 응답 전체 실패, `order` 불연속, 캘린더 파일 생성 실패, `PATCH` 실패. `[walk-route]` 접두사는 구간 하나가 `UNKNOWN`일 때 `reason`과 함께 남긴다. SPEC이 정한 접두사다.

**접근성.**

| 요소         | 계약                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| 타임라인     | `<ol>`. 항목마다 `<time dateTime>`으로 도착 시각. 예상 라벨은 텍스트                                                 |
| 구간 줄      | 텍스트로 "다음 장소까지 도보 5분, 340m". 모름이면 "다음 장소까지 도보 시간을 알 수 없습니다". 스켈레톤은 `aria-busy` |
| 지도         | `aria-label`에 "코스 지도, 장소 3곳". 마커 번호가 타임라인 순서와 같다. 지도 조작 없이도 타임라인이 전체 정보다      |
| 총 도보 요약 | `role="status"`. 구간이 채워지면 한 번 갱신                                                                          |
| 캘린더 버튼  | 버튼 둘의 텍스트에 새 탭에서 열림과 파일 내려받기가 각각 들어간다. 결과는 `role="status"`로 알린다                   |
| 삭제 확인    | `shared/ui`의 `ConfirmDialog`. 찜 알럿과 같은 컴포넌트다. 확인 버튼에 초기 포커스, 취소가 기본 동작                  |

## O. Optimization과 운영

**렌더링.** 코스 쿼리와 구간 쿼리가 따로라 지도와 타임라인이 먼저 나온다. 폴리라인 좌표는 구간마다 수십에서 수백이라 코스 하나에 수백 점이고 SDK가 감당한다. 지도는 코스가 오면 `fitTo`로 한 번 맞추고 이후 사용자 조작을 덮지 않는다.

**장애.** 구간 응답 전체가 실패하면 모든 구간이 모름으로 보이고 요약 자리에 다시 시도 버튼이 있다. 코스 조회가 실패하면 그 화면의 `error.tsx`가 받는다. 코스가 없거나 남의 코스면 `404`와 `403`을 구분해 "삭제되었거나 볼 수 없는 코스입니다"로 보인다.

**재시도와 몰림.** 구간 쿼리는 네트워크 오류에만 1회 재시도한다. 4xx는 재시도하지 않는다. 구간 하나의 `UNKNOWN`은 재시도 대상이 아니다. 카카오가 같은 답을 돌려준다. 코스를 여는 횟수가 곧 카카오 호출 횟수이므로 뒤로가기로 다시 열 때도 다시 부른다. 하루 한도는 `docs/release/RUNBOOK.md`의 쿼터 절에 있다.

**지표.** `order` 불연속 횟수는 0이어야 한다. 구간 모름 비율이 특정 지역에서 높으면 그 지역 팝업의 좌표 품질을 본다. 캘린더는 구글과 파일 각각의 클릭 수를 센다. 한쪽이 거의 안 쓰이면 그 버튼을 뺀다. 일정 취소 비율도 센다.

**운영.** 구글 템플릿 링크는 주소 길이에 제한이 있어 `details`에 방문 순서 한 줄씩과 서비스 주소만 넣는다. `dates`는 UTC 기준 `YYYYMMDDTHHMMSSZ` 두 개를 `/`로 잇는다. `.ics`는 `VEVENT` 하나이고 `UID`에 코스 id를 넣어 다시 내려받아도 캘린더가 같은 일정으로 본다. 타임존은 `Asia/Seoul`을 명시한다. iOS 사파리는 내려받은 `.ics`를 캘린더 앱으로 바로 넘기므로 파일 이름에 코스 날짜를 넣어 무엇을 여는지 보이게 한다.
