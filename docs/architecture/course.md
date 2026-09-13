# 코스 결과와 저장, 캘린더 설계

`features/course`. 코스 결과 화면(지도와 타임라인), 구간별 도보 소요시간, 저장한 코스 목록과 삭제, 캘린더 저장과 저장 완료 화면을 다룬다. 코스를 만드는 것은 `planner.md`다. 데모데이 시연의 핵심 장면이 이 화면이다.

## R. Requirements

**기능.** 헤더에 날짜와 지역 요약과 다시 만들기 버튼이 있다. AI 추천 이유 두 줄, 카카오맵 위 순서 마커와 도보 경로선, 총 도보 시간과 거리 요약, 타임라인(도착 시각, 이미지, 팝업명, 예상 체류시간, 예약 여부, 다음 장소까지 도보 시간과 거리)이 있다. 하단에 "이 일정 내 캘린더에 저장하기"가 있고 누르면 캘린더로 보낸 뒤 저장 완료 화면으로 간다. 내 팝업의 저장한 코스 탭에서 날짜와 지역, 소요 시간, 방문지 수, 총 도보 시간, 캘린더에 보냄 배지, 삭제 버튼을 본다.

**보장.**

- 코스의 팝업과 순서, 도착 시각은 p75 1초 안에 그려진다. 구간 소요시간은 별도 요청이라 구간마다 스켈레톤을 먼저 보이고 도착하면 채운다
- 소요시간을 못 받은 구간은 "소요시간 모름"으로 보인다. 0분이나 빈 값으로 바꾸지 않는다. 그 구간 뒤의 도착 시각에는 "예상" 라벨이 붙는다(SPEC)
- 경로 응답을 저장하지 않는다. 코스를 다시 열면 다시 조회한다. 캐시 수명 0이다(9/1 결정, R16)
- 지도는 코스의 모든 마커가 보이게 맞춰진다
- 캘린더 링크의 시작 시각은 첫 도착 시각, 종료 시각은 마지막 도착 시각에 예상 체류 최대를 더한 것이다. 본문에 방문 순서가 들어간다
- 삭제는 확인을 거치고 확인 뒤 목록에서 바로 사라진다
- 타임라인 항목의 `order`는 1부터 빈 곳 없이 이어진다. 어긋나면 그리지 않고 오류로 낸다

**설계를 가르는 질문.**

- 코스와 구간은 다른 수명이다. 코스는 저장된 서버 상태라 캐시해도 되고 구간 소요시간은 카카오 응답이라 저장할 수 없다. 그래서 요청이 둘이다. 하나로 합치면 빠른 것이 느린 것을 기다리고 캐시 규칙도 하나로 묶인다
- 캘린더는 구글 URL 템플릿과 .ics 내려받기다(FE 제안, D34). 인증과 백엔드 작업이 없고 카카오 로그인 사용자도 된다. 등록 여부를 우리가 알 수 없어 완료 화면 문구는 "캘린더로 보냈습니다"이고 배지도 "캘린더에 보냄"이다. 피그마의 "등록 완료"와 다르므로 PM 확인 항목이다
- 생성이 곧 저장이라 저장 버튼이 없다. 다시 만들기는 새 코스를 만들고 이전 코스는 목록에 남는다. 지우는 것은 사용자다

**범위 밖.** 코스 편집(팝업 교체, 순서 변경), 코스 공유 링크의 비로그인 열람(코스가 사용자에 귀속이라 로그인 필요), 연계 카페(D49. `kind`가 `PLACE`인 항목이 오면 그리는 자리만 둔다), 대기시간 예상(D52. `waitEstimateMinutes`가 `null`이면 그리지 않는다), 방문 전 알림(D50. 저장 완료의 자리만).

## A. Architecture

| 상태                  | 원천                                         | 비고                                                       |
| --------------------- | -------------------------------------------- | ---------------------------------------------------------- |
| 코스                  | Server. `queryKeys.courses.detail(courseId)` | 기본 `staleTime`                                           |
| 구간 소요시간과 경로  | Server. `queryKeys.courses.walks(courseId)`  | `staleTime` 0, `gcTime` 0. 화면을 떠나면 버린다            |
| 저장한 코스 목록      | Server. `queryKeys.courses.list()` 무한 쿼리 |                                                            |
| 코스 식별자           | URL `/courses/[courseId]`                    |                                                            |
| 총 도보 시간과 거리   | Derived. 구간 중 `OK`인 것의 합              | `UNKNOWN`이 하나라도 있으면 "일부 구간 제외" 문구를 붙인다 |
| 도착 시각의 예상 라벨 | Derived. 앞 구간 중 `UNKNOWN`이 있는가       |                                                            |
| 삭제 확인 열림        | 컴포넌트 `useState`                          | native `<dialog>`                                          |

통신은 요청 응답이다. 코스와 구간, 목록, 삭제, 캘린더 표시 넷다섯이다.

**흐름.**

```
/courses/{id}     GET /courses/{id}         팝업과 순서, 도착 시각을 먼저 그린다
                  GET /courses/{id}/walks   구간마다 스켈레톤을 채운다. 실패 구간은 모름
   다시 만들기    planner의 useStartCourseJob(course.request)  /planner/generating/{jobId}
   캘린더 저장    구글이면 URL 템플릿을 새 탭, 그 외는 .ics 내려받기
                  PATCH /courses/{id} { calendarSentAt }  뒤 /courses/{id}/saved
/courses/{id}/saved   요약과 "저장된 일정 보기"(/my?tab=courses), "홈으로"
/my?tab=courses   GET /me/courses           삭제는 확인 뒤 DELETE, 목록 무효화
```

구간 응답은 `fromOrder`로 타임라인 항목 사이에 끼운다. 항목 `i`와 `i + 1` 사이의 구간은 `fromOrder`가 `i`인 것이다. 아직 없으면 스켈레톤, `UNKNOWN`이면 모름 문구, `OK`면 분과 거리다.

## D. Data Model

```typescript
// features/course/model/course.ts. 백엔드 요구
type CourseItemKind = "POPUP" | "PLACE";

interface CourseItem {
	/** 1부터 연속 */
	order: number;
	/** PLACE는 D49가 정해질 때까지 오지 않는다 */
	kind: CourseItemKind;
	popup: PopupSummary & { lat: number; lng: number; addressRoad: string | null };
	/** 날짜와 시각. 포맷은 미정(ROADMAP) */
	arriveAt: string;
	/** 없으면 체류시간 줄을 그리지 않는다 */
	stay: { minMinutes: number; maxMinutes: number } | null;
	/** D52 */
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
}

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
function toCalendarEvent(course: Course): CalendarEvent;
function buildGoogleCalendarUrl(event: CalendarEvent): string; // calendar.google.com/calendar/render?action=TEMPLATE
function buildIcs(event: CalendarEvent): string;
```

`totalWalkMinutesAtCreation`은 생성 시점의 합계를 백엔드가 저장한 값이다. 카카오 응답을 저장하는 것이 아니라 우리가 계산한 합계 숫자 하나라 저장할 수 있다고 본다. 카카오 데브톡 답변(Q18)에 따라 이 판단이 바뀌면 이 필드를 빼고 목록에서 총 도보 시간을 그리지 않는다.

`toMinutes`, `totalWalk`, `isArrivalEstimated`, `toCalendarEvent`, `buildIcs`는 분기 있는 순수 함수라 `testing.md`의 값이 나는 자리다.

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
export function CalendarSaveButton({ course }: { course: Course });
export function CourseSavedView({ courseId }: { courseId: number });
export function SavedCourseList();

export function useCourse(courseId: number): UseQueryResult<Course, ApiError>;
export function useCourseWalks(courseId: number): UseQueryResult<WalkSegment[], ApiError>;
export function useCourseList(): UseInfiniteQueryResult<InfiniteData<PageResponse<CourseSummary>>, ApiError>;
export function useDeleteCourse(): UseMutationResult<null, ApiError, number>;
export function useMarkCalendarSent(): UseMutationResult<Course, ApiError, number>;
```

**`shared/lib/kakao-map`에 더하는 것.**

```typescript
interface KakaoMapProps {
	markers?: readonly KakaoMarkerData[];
	polylines?: readonly KakaoPolylineData[];
	/** true면 마커와 폴리라인이 모두 보이게 중심과 확대 수준을 맞춘다 */
	fitToContent?: boolean;
}

interface KakaoMarkerData {
	id: string;
	position: KakaoLatLngLiteral;
	title?: string;
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

| 메서드와 경로                          | 인증 | 요청                 | 응답                                        |
| -------------------------------------- | ---- | -------------------- | ------------------------------------------- |
| `GET /api/v1/courses/{courseId}`       | 필요 |                      | `Course`                                    |
| `GET /api/v1/courses/{courseId}/walks` | 필요 |                      | `WalkSegment[]`. 항목 수 빼기 1개           |
| `GET /api/v1/me/courses`               | 필요 |                      | `PageResponse<CourseSummary>`. 최근 생성 순 |
| `DELETE /api/v1/courses/{courseId}`    | 필요 |                      | `null`                                      |
| `PATCH /api/v1/courses/{courseId}`     | 필요 | `{ calendarSentAt }` | `Course`                                    |

구간 조회는 백엔드가 카카오 경로 조회를 구간마다 한 번씩 부르고 응답을 저장하지 않는다(9/3 결정, 프록시로만 쓰는 Next는 이 조합을 갖지 않는다). 실패한 구간은 HTTP 200 안의 `status`로 판정해 `UNKNOWN`으로 낸다. 응답 전체가 실패하는 것과 구간 하나가 실패하는 것을 가른다.

**캘린더.** 구글은 `https://calendar.google.com/calendar/render?action=TEMPLATE&text=&dates=&details=&location=`을 새 탭으로 연다. 그 외는 `buildIcs`의 문자열을 `Blob`으로 만들어 `<a download>`로 내려준다. 어느 쪽을 쓸지는 버튼 둘로 사용자가 고른다. 링크를 열거나 파일을 내려준 직후 `PATCH`로 시각을 기록하고 저장 완료 화면으로 간다. `PATCH`가 실패해도 캘린더 동작은 이미 끝났으므로 완료 화면으로 가고 배지가 안 붙는 것만 로그로 남긴다.

**로그.** `[course]` 접두사. 구간 응답 전체 실패, `order` 불연속, 캘린더 파일 생성 실패, `PATCH` 실패. `[walk-route]` 접두사는 구간 하나가 `UNKNOWN`일 때 `reason`과 함께 남긴다. SPEC이 정한 접두사다.

**접근성.**

| 요소         | 계약                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| 타임라인     | `<ol>`. 항목마다 `<time dateTime>`으로 도착 시각. 예상 라벨은 텍스트                                                 |
| 구간 줄      | 텍스트로 "다음 장소까지 도보 5분, 340m". 모름이면 "다음 장소까지 도보 시간을 알 수 없습니다". 스켈레톤은 `aria-busy` |
| 지도         | `aria-label`에 "코스 지도, 장소 3곳". 마커 번호가 타임라인 순서와 같다. 지도 조작 없이도 타임라인이 전체 정보다      |
| 총 도보 요약 | `role="status"`. 구간이 채워지면 한 번 갱신                                                                          |
| 캘린더 버튼  | 새 탭 링크는 `<a target="_blank" rel="noopener">`와 "새 탭에서 열림" 텍스트. 내려받기는 `<a download>`               |
| 삭제 확인    | native `<dialog>`. 확인 버튼에 초기 포커스, 취소가 기본 동작                                                         |
| 저장 완료    | `<h1>`에 완료 문구. 다음 동작 링크 둘                                                                                |

## O. Optimization과 운영

**렌더링.** 코스 쿼리와 구간 쿼리가 따로라 지도와 타임라인이 먼저 나온다. 폴리라인 좌표는 구간마다 수십에서 수백이라 코스 하나에 수백 점이고 SDK가 감당한다. 지도는 코스가 오면 `fitToContent`로 한 번 맞추고 이후 사용자 조작을 덮지 않는다.

**장애.** 구간 응답 전체가 실패하면 모든 구간이 모름으로 보이고 요약 자리에 다시 시도 버튼이 있다. 코스 조회가 실패하면 그 화면의 `error.tsx`가 받는다. 코스가 없거나 남의 코스면 `404`와 `403`을 구분해 "삭제되었거나 볼 수 없는 코스입니다"로 보인다.

**재시도와 몰림.** 구간 쿼리는 네트워크 오류에만 1회 재시도한다. 4xx는 재시도하지 않는다. 구간 하나의 `UNKNOWN`은 재시도 대상이 아니다. 카카오가 같은 답을 돌려준다. 코스를 여는 횟수가 곧 카카오 호출 횟수이므로 뒤로가기로 다시 열 때도 다시 부른다. 한도는 `planner.md`의 운영 절과 같다.

**지표.** 체감 지표는 "코스 화면 진입부터 타임라인 표시까지"와 "구간 채워지기까지" 둘이다. 시스템 지표는 `order` 불연속 횟수(0이어야 한다)와 구간 모름 비율, 캘린더 버튼 종류별 클릭 수다. 모름 비율이 특정 지역에서 높으면 그 지역 팝업의 좌표 품질을 본다.

**운영.** 구글 캘린더 URL은 길이 제한이 있어 `details`는 방문 순서 한 줄씩과 서비스 주소만 넣는다. `.ics`는 `VEVENT` 하나이고 `UID`에 코스 id를 넣어 다시 내려받아도 캘린더가 같은 일정으로 본다. 타임존은 `Asia/Seoul`을 명시한다.
