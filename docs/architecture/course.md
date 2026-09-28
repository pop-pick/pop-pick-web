# 코스 화면과 저장, 캘린더 설계

`features/course`. 플래너 첫 화면인 내 일정(플래너 홈), 생성 완료와 저장, 등록 완료와 캘린더, 일정 상세의 공유와 삭제, 구간별 도보 소요시간을 다룬다. 코스를 만드는 것은 `planner.md`다. 데모데이 시연에서 이 화면들을 보인다.

## R. Requirements

**기능.** 화면이 넷이다.

- 플래너 홈은 탭 셋(다가오는 일정, 지난 일정, 취소된 일정)과 생성 배너, 일정 요약 카드 목록이다. 카드를 누르면 일정 상세로 간다
- 생성 완료는 저장 전 코스다. "{지역명} 추천 동선입니다." 제목과 지도, 타임라인, "내 플래너에 저장하기", "다시 생성하기"가 있다
- 등록 완료는 저장 직후 화면이다. "플래너 등록 완료!"와 일정 요약, 캘린더 버튼 둘이 있다
- 일정 상세는 저장한 코스다. 일정 요약과 지도, 타임라인, 공유하기, 삭제하기가 있다

화면에 무엇이 놓이는지는 `docs/product/SPEC.md`의 원데이 플래너 절과 `docs/design/DESIGN-SPEC.md`의 플래너 절들이 정본이다.

**지금 코드.** 코스 API가 없다. 두 가지로 채운다.

- `/courses/101?{조건}`은 생성 결과 미리보기다. `buildGeneratedCourse`가 임시 성수 코스를 쿼리의 날짜와 시작 시간에 맞춰 옮기고 소요 시간에 따라 팝업 두 곳(간편)이나 세 곳(반나절)만 남긴다. 팝업 수는 `shared/model/trip-preference.ts`의 `TRIP_DURATION_STOP_COUNTS`다. 조건이 없거나 틀리면 `/planner/new?{쿼리}`로 보낸다
- 저장한 일정은 이 브라우저의 `localStorage`에 남는다. `model/useSavedCoursesStore.ts`(Zustand `persist`, 키 `pp-saved-courses`)가 들고 `hooks/useSavedCourses.ts`가 마운트 뒤에 불러온다. 서버 렌더에는 `localStorage`가 없어 첫 렌더를 비워 두고 불러오는 동안 스켈레톤을 그린다. 스토어의 `loadStatus`가 `loading`에서 `ready`나 `failed`로 바뀐다. 복원 전에 `saveCourse`나 `cancelCourse`를 부르면 예외를 낸다. 빈 목록 위에 쓴 값이 저장되어 이전 일정을 지우기 때문이다. 그래서 저장 버튼은 `ready`가 될 때까지 꺼져 있다. 복원이 실패하면 `[course]` 로그를 남기고 플래너 홈과 일정 주소에 `SavedCoursesLoadFailure` 안내를 보인다. 저장하기가 코스를 스토어에 넣고 1000부터 매긴 새 id와 서울 기준 오늘의 `savedAt`을 준다. 삭제하기는 `cancelledAt`을 채워 취소된 일정 탭으로 옮긴다. 다른 브라우저나 기기에서는 보이지 않는다

플래너 홈은 저장한 것이 없으면 빈 상태로 시작한다. 구간 소요시간은 코스 안의 임시 값(분과 미터)을 그대로 그린다. 구간 쿼리와 로딩, "소요시간 모름"은 API가 열리면 만든다.

**보장.**

- 코스의 팝업과 순서, 도착 시각은 p75 1초 안에 그려진다. 구간 소요시간은 별도 요청이라 구간마다 스켈레톤을 먼저 보이고 도착하면 채운다
- 소요시간을 못 받은 구간은 "소요시간 모름"으로 보인다. 0분이나 빈 값으로 바꾸지 않는다. 그 구간 뒤의 도착 시각에는 "예상" 라벨이 붙는다(SPEC)
- 경로 응답을 저장하지 않는다. 코스를 다시 열면 다시 조회한다. 캐시 수명 0이다
- 지도는 코스의 모든 핀이 보이게 맞춰진다
- 캘린더 일정의 시작은 코스 시작 시각, 종료는 코스 끝 시각이고 본문에 방문 순서가 들어간다
- 등록 완료에서 뒤로 가면 생성 완료로 돌아가지 않고 플래너 홈으로 간다
- 공유는 일정 상세에만 있다. 저장 전 코스는 공유할 수 없다
- 삭제는 확인을 거치고 확인하면 플래너 홈으로 간다. 이미 취소된 일정의 상세에는 삭제하기가 없다
- 저장하면 등록 완료로 주소를 바꾼다(`router.replace`). 생성 완료가 기록에 남지 않아 뒤로 가서 같은 코스를 한 번 더 저장하는 일이 없다
- 시작 시각이 늦어 코스가 자정을 넘기면 끝 시각이 시작 시각보다 앞선다. 소요시간은 하루를 더해 세고 캘린더의 끝은 다음 날이다(`model/course-time.ts`)
- 저장한 일정 주소를 열었는데 그 일정이 없으면 "일정을 찾을 수 없어요." 안내와 플래너로 가는 버튼을 보인다
- 탭에 일정이 없으면 빈 목록 대신 탭마다의 안내와 생성 배너가 뜬다
- 타임라인 항목의 `order`는 1부터 빈 곳 없이 이어진다. API가 열리면 어긋난 응답을 그리지 않고 오류로 낸다

**설계를 가르는 질문.**

- 생성과 저장이 따로다. 한 주소 `/courses/{id}`가 코스의 `savedAt`으로 두 화면을 가른다. `null`이면 생성 완료, 값이 있으면 일정 상세다. 저장 전 코스를 서버가 어디에 두는지는 미정이다(ROADMAP). 지금은 id 101이면 미리보기, 나머지는 스토어의 저장한 일정으로 가른다
- 코스와 구간은 다른 수명이다. 코스는 서버 상태라 캐시해도 되고 구간 소요시간은 카카오 응답이라 저장할 수 없다. 그래서 요청이 둘이다. 하나로 합치면 빠른 것이 느린 것을 기다리고 캐시 규칙도 하나로 묶인다
- 캘린더 버튼은 둘이다. 구글 캘린더에 저장하기와 캘린더 파일 다운로드를 둘 다 제공한다. 구글 링크는 일정 작성 화면이 채워진 채로 열려 저장만 누르면 끝이라 모바일에서 단계가 짧다. 다만 구글 전용이라 애플 캘린더와 아웃룩을 쓰는 사람에게는 `.ics`가 필요하다. 둘 다 인증과 백엔드 작업이 없다. 구글 캘린더 API로 우리가 일정을 직접 넣는 방식은 `calendar.events`가 민감한 범위라 심사를 받아야 하고 테스트 모드에서 등록한 100명까지만 되어 접었다
- 다시 생성하기는 새 작업을 바로 만들지 않고 조건이 채워진 조건 입력으로 간다. 코스 응답에 입력 조건이 없어 지금은 미리보기 주소가 받은 조건 쿼리를 `buildRegeneratePath`로 그대로 넘긴다
- 삭제한 일정이 취소된 일정 탭에 남는지는 미정이다(ROADMAP). 지금은 `cancelledAt`을 채워 취소된 일정 탭에 남긴다

**범위 밖.** 코스 편집(팝업 교체, 순서 변경), 코스 공유 링크의 비로그인 열람(코스가 사용자에 귀속이라 로그인 필요), 코스 안 팝업이 아닌 장소(코스에는 팝업만 들어간다), 예상 체류시간 줄(명세와 시안에 없다), 방문 전 알림(넣지 않기로 했다). 대기시간 예상은 값이 `null`이면 그리지 않는다.

## A. Architecture

| 상태                   | 원천                                       | 비고                                                                               |
| ---------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| 코스                   | Server. `["courses", "detail", courseId]`  | 기본 `staleTime`. 지금은 미리보기면 `buildGeneratedCourse`, 저장한 일정이면 스토어 |
| 구간 소요시간과 경로   | Server. `["courses", "walks", courseId]`   | `staleTime` 0, `gcTime` 0. 화면을 떠나면 버린다. 지금은 코스의 `legs`              |
| 내 일정 목록           | Server. `["courses", "list"]` 무한 쿼리    | 탭 셋이 같은 응답을 나눠 쓴다. 지금은 `useSavedCoursesStore`의 `localStorage`      |
| 코스 식별자            | URL `/courses/[courseId]`                  | 양의 정수가 아니면 `notFound()`                                                    |
| 미리보기의 조건        | URL `/courses/101?{조건}`                  | 키는 `planner.md`와 같다                                                           |
| 생성 완료인가 상세인가 | Derived. `savedAt`                         | `null`이면 생성 완료. 지금은 id 101인가                                            |
| 내 일정 탭             | URL `/planner?tab=past\|cancelled`         | 기본 `upcoming`은 쿼리 없이 `/planner`. 탭을 바꾸면 `history.replaceState`         |
| 일정이 어느 탭인가     | Derived. `cancelledAt`과 `date`, 서울 오늘 | `classifyCourseTab`. 방문 날짜가 오늘이면 다가오는 일정                            |
| 총 도보 시간과 거리    | Derived. 구간 중 `OK`인 것의 합            | API가 열리면. `UNKNOWN`이 하나라도 있으면 "일부 구간 제외" 문구를 붙인다           |
| 도착 시각의 예상 라벨  | Derived. 앞 구간 중 `UNKNOWN`이 있는가     | API가 열리면                                                                       |
| 공유와 삭제 알럿 열림  | 컴포넌트 `useState`                        | `AlertDialog`                                                                      |

통신은 요청 응답이다. 코스와 구간, 목록, 저장, 삭제 다섯이다. 지금은 통신이 없고 저장과 삭제가 스토어를 고친다.

**흐름.**

```
/planner?tab=                   GET /me/courses          탭 셋. 카드를 누르면 /courses/{id}
/courses/{id}  savedAt null     생성 완료
   내 플래너에 저장하기         저장 요청 뒤 router.replace(/courses/{id}/saved)
   다시 생성하기                /planner/new?{조건}
/courses/{id}/saved             등록 완료. 뒤로 가면 router.replace(/planner)
   구글 캘린더에 저장하기       템플릿 링크를 새 탭으로 연다
   캘린더 파일 다운로드         .ics 파일을 내려받는다
/courses/{id}  savedAt 있음     일정 상세
   공유하기                     이 페이지 주소를 클립보드에 복사하고 알럿
   삭제하기                     확인 알럿 뒤 DELETE, 목록 무효화, router.replace(/planner)
/courses/{id}  두 화면 공통     GET /courses/{id}, GET /courses/{id}/walks
```

지금은 저장 요청 대신 스토어의 `saveCourse`가 새 id를 돌려주고 `DELETE` 대신 `cancelCourse`가 `cancelledAt`을 채운다. 조회는 없다.

**등록 완료의 뒤로 가기.** `useBackToPlanner`가 화면에 들어올 때 같은 주소의 기록을 하나 더 쌓는다. 뒤로 가기가 그 기록을 벗어나면 `popstate`에서 `router.replace("/planner")`한다. 다른 주소로 바로 돌아가게 두면 Next 라우터의 `popstate` 리스너가 먼저 불리고 React 19가 그 전환을 동기로 그려서 이 화면의 리스너가 불리기 전에 컴포넌트가 언마운트된다.

**공유.** 주소를 `navigator.clipboard`로 복사하고 "링크가 클립보드에 복사되었습니다" 알럿을 띄운다. 복사가 실패하면 로그를 남기고 주소를 읽기 전용 입력칸에 담은 알럿으로 직접 복사하게 한다.

구간 응답은 `fromOrder`로 타임라인 항목 사이에 끼운다. 항목 `i`와 `i + 1` 사이의 구간은 `fromOrder`가 `i`인 것이다. 아직 없으면 스켈레톤, `UNKNOWN`이면 모름 문구, `OK`면 분과 거리다.

## D. Data Model

코스 모델 `Course`와 방문지 `CourseStop`, 구간 `CourseLeg`는 `features/course/model/course.ts`에 있다. 날짜는 `"yyyy-MM-dd"`, 시각은 `"HH:mm"` 문자열이다. `savedAt`이 `null`이면 저장 전, `cancelledAt`이 있으면 취소한 일정이다. `CourseLeg`는 임시 데이터의 분과 미터이고 구간 API가 열리면 아래 `WalkSegment`로 바꾼다.

**API 응답에 요구하는 것.** 백엔드 코스 응답은 위 `Course`를 채울 값을 줘야 한다. 코스명과 지역명, 방문 날짜, 시작과 끝 시각, 방문지(팝업 id와 이름, 도착 시각, 주소, 좌표), 저장 시각, 취소 시각이다. 다시 생성하기가 조건을 채우려면 입력 조건(`CourseRequest`)도 필요하다. 목록 응답은 카드가 쓰는 방문 날짜와 코스명, 시작과 끝 시각, 팝업 수, 등록일만 있으면 된다. 날짜 포맷은 미정(ROADMAP)이라 응답을 읽는 함수 한 곳에서 바꾼다.

```typescript
// features/course/model/walk.ts. 백엔드 요구. API가 열리면 만든다
type WalkSegment =
	| {
			fromOrder: number;
			toOrder: number;
			status: "OK";
			/** 카카오 totalTime. 초 */
			seconds: number;
			/** 카카오 totalDistance. 미터 */
			distanceM: number;
			/** [경도, 위도] 배열. 카카오 steps[].path.points를 이어 붙인 것. 싣는지 미정 */
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
function assertContiguousOrders(stops: CourseStop[]): void; // 어긋나면 예외를 낸다
```

탭 분류 `classifyCourseTab`과 캘린더 문자열 `buildGoogleCalendarUrl`, `buildCourseIcs`, 자정을 넘는 시각 계산 `model/course-time.ts`는 분기 있는 순수 함수다. API가 열리면 `toMinutes`와 `totalWalk`, `isArrivalEstimated`가 더해진다.

## I. Interface

**컴포넌트와 훅.** 플래너 홈은 `PlannerHome`, 생성 완료는 `CourseRecommendation`, 저장한 일정의 두 화면은 `SavedCourseView`가 스토어에서 코스를 찾아 일정 상세 `CourseDetail`이나 등록 완료 `CourseSaved`를 그린다. 저장한 일정은 `useSavedCourses`로 읽고 등록 완료의 뒤로 가기는 `useBackToPlanner`가 맡는다. 라우트 `/planner`는 `RequireAuth`와 `Suspense`의 대체 화면으로 `PlannerHomeSkeleton`을 넘긴다. 공유와 삭제는 `CourseDetailActions`이고 취소된 일정이면 삭제하기를 그리지 않는다.

API가 열리면 더하는 훅이다.

```typescript
export function useCourse(courseId: number): UseQueryResult<Course, ApiError>;
export function useCourseWalks(courseId: number): UseQueryResult<WalkSegment[], ApiError>;
export function useCourseList(): UseInfiniteQueryResult<InfiniteData<PageResponse<Course>>, ApiError>;
export function useSaveCourse(): UseMutationResult<Course, ApiError, number>;
export function useDeleteCourse(): UseMutationResult<null, ApiError, number>;
```

**`shared/lib/kakao-map`.** `markers`와 `fitTo`를 쓴다. `KakaoMarkerData`의 `variant`가 `"icon"`이면 흰 원 안에 `iconUrl`의 그림을 그리고 원의 가운데가 좌표에 온다(`yAnchor` 0.5). `iconUrl`이 없으면 핀을 만들 때 예외를 낸다. 코스 핀의 그림은 파란 위치 아이콘 `/pins/course.svg`이고 `toCourseMarkers`가 넘긴다. `"labeled"`이거나 값이 없으면 이름표가 붙는 탐색 핀이다. 경로 좌표를 응답에 싣기로 정해지면 아래를 더한다.

```typescript
interface KakaoMapProps {
	polylines?: readonly KakaoPolylineData[];
}

interface KakaoPolylineData {
	id: string;
	path: readonly KakaoLatLngLiteral[];
}

/** 카카오 REST의 [경도, 위도]를 SDK의 { lat, lng }로 */
function fromRestPoint(point: [number, number]): KakaoLatLngLiteral;
```

**서버 API.** 전부 백엔드 요구다.

| 메서드와 경로                          | 인증 | 요청 | 응답                                                           |
| -------------------------------------- | ---- | ---- | -------------------------------------------------------------- |
| `GET /api/v1/courses/{courseId}`       | 필요 |      | 코스. 저장 전 코스도 돌려준다                                  |
| `GET /api/v1/courses/{courseId}/walks` | 필요 |      | `WalkSegment[]`. 항목 수 빼기 1개                              |
| `GET /api/v1/me/courses`               | 필요 |      | 저장한 코스의 `PageResponse`. 취소한 것을 넣는지는 미정        |
| 코스 저장(경로 미정)                   | 필요 |      | 저장한 코스. 저장 전 코스를 어디에 두는지 정해지면 같이 정한다 |
| `DELETE /api/v1/courses/{courseId}`    | 필요 |      | `null`. 지우는지 `cancelledAt`을 채우는지 미정                 |

구간 조회는 백엔드가 카카오 경로 조회를 구간마다 한 번씩 부르고 응답을 저장하지 않는다. 프록시로만 쓰는 Next는 이 조합을 갖지 않는다. 실패한 구간은 HTTP 200 안의 `status`로 판정해 `UNKNOWN`으로 낸다. 응답 전체가 실패하는 것과 구간 하나가 실패하는 것을 가른다.

**API가 열리면 할 일.** `placeholder-courses.ts`와 `useSavedCoursesStore.ts`, `useSavedCourses.ts`를 지우고 내 일정 쿼리와 저장, 삭제 뮤테이션으로 바꾼다. `/courses/[courseId]`는 id 101 분기 대신 코스의 `savedAt`으로 두 화면을 가른다. `SaveCourseButton`이 저장 요청을 보낸 뒤 등록 완료로 가고 등록일은 응답의 `savedAt`을 쓴다. `CourseDetailActions`의 삭제가 `DELETE`를 보내고 목록을 무효화한다. 다시 생성하기는 코스 응답의 입력 조건으로 주소를 만들고 결과 주소에 조건 쿼리를 싣던 것을 걷는다. 타임라인의 구간 줄을 구간 쿼리로 바꾸고 로딩과 모름을 더한다.

**캘린더.** 등록 완료 화면에 버튼이 둘이다. 구글 캘린더에 저장하기는 `buildGoogleCalendarUrl`의 주소를 `<a target="_blank">`로 새 탭에 연다. 캘린더 파일 다운로드는 `buildCourseIcs`의 문자열을 `Blob`으로 만들어 `<a download>`로 내려준다. 구글 링크는 브라우저에 이미 있는 구글 세션을 쓸 뿐이라 우리가 권한을 받지 않는다. 캘린더로 보낸 뒤 서버에 기록하는 요청은 없다.

**로그.** `[course]` 접두사. 지금은 공유 주소 복사 실패와 저장한 일정 복원 실패를 남긴다. API가 열리면 구간 응답 전체 실패, `order` 불연속, 캘린더 파일 생성 실패, 저장과 삭제 실패를 더한다. `[walk-route]` 접두사는 구간 하나가 `UNKNOWN`일 때 `reason`과 함께 남긴다. SPEC이 정한 접두사다.

**접근성.**

| 요소        | 계약                                                                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 내 일정 탭  | `tablist`와 `tab`, `tabpanel`. 방향키와 Home, End로 옮긴다. 선택 탭에 `aria-selected`                                             |
| 타임라인    | `<ol aria-label="방문 순서">`. 항목마다 `<time>`으로 도착 시각. 팝업 카드는 팝업 상세로 가는 링크다                               |
| 구간 줄     | API가 열리면 텍스트로 "다음 장소까지 도보 5분, 340m". 모름이면 "다음 장소까지 도보 시간을 알 수 없습니다". 스켈레톤은 `aria-busy` |
| 지도        | `aria-label`에 "{지역명} 코스 지도, 팝업 n곳". 핀은 `aria-hidden`이고 지도 조작 없이도 타임라인이 전체 정보다                     |
| 캘린더 버튼 | 구글 버튼에 화면에서 숨긴 "(새 탭에서 열림)"이 붙는다                                                                             |
| 공유와 삭제 | `shared/ui`의 `AlertDialog`. 찜 알럿과 같은 컴포넌트다. 확인 버튼에 초기 포커스, Esc는 취소와 같다                                |

## O. Optimization과 운영

**렌더링.** 코스 쿼리와 구간 쿼리가 따로라 지도와 타임라인이 먼저 나온다. 폴리라인 좌표를 싣게 되면 구간마다 수십에서 수백이라 코스 하나에 수백 점이고 SDK가 감당한다. 지도는 코스가 오면 `fitTo`로 한 번 맞추고 이후 사용자 조작을 덮지 않는다.

**장애.** 구간 응답 전체가 실패하면 모든 구간이 모름으로 보이고 다시 시도 버튼이 있다. 코스 조회가 실패하면 그 화면의 `error.tsx`가 받는다. 코스가 없거나 남의 코스면 `404`와 `403`을 구분해 "삭제되었거나 볼 수 없는 코스입니다"로 보인다.

**재시도와 몰림.** 구간 쿼리는 네트워크 오류에만 1회 재시도한다. 4xx는 재시도하지 않는다. 구간 하나의 `UNKNOWN`은 재시도 대상이 아니다. 카카오가 같은 답을 돌려준다. 코스를 여는 횟수가 곧 카카오 호출 횟수이므로 뒤로가기로 다시 열 때도 다시 부른다. 하루 한도는 `docs/release/RUNBOOK.md`의 쿼터 절에 있다.

**지표.** `order` 불연속 횟수는 0이어야 한다. 구간 모름 비율이 특정 지역에서 높으면 그 지역 팝업의 좌표 품질을 본다. 캘린더는 구글과 파일 각각의 클릭 수를 센다. 한쪽이 거의 안 쓰이면 그 버튼을 뺀다. 생성 완료에서 저장한 비율과 일정 삭제 비율도 센다.

**운영.** 구글 템플릿 링크의 `dates`는 코스 날짜와 시작, 끝 시각을 `YYYYMMDDTHHmmss` 두 개로 `/`로 잇고 `ctz=Asia/Seoul`로 시간대를 준다. `details`에는 방문 순서가 한 줄씩(순번과 도착 시각, 팝업명) 들어간다. `.ics`는 `VEVENT` 하나이고 `UID`에 코스 id를 넣어 다시 내려받아도 캘린더가 같은 일정으로 본다. `VTIMEZONE`(Asia/Seoul, +0900)을 넣고 `DTSTART;TZID=Asia/Seoul`로 적는다. 줄 끝은 CRLF이고 75옥텟을 넘는 줄은 접으며 쉼표와 세미콜론, 줄바꿈은 이스케이프한다. 파일 이름은 `pop-pick-course-{id}.ics`다.
