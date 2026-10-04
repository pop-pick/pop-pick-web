# 코스 화면과 저장, 캘린더 설계

`features/course`. 플래너 첫 화면인 내 일정(플래너 홈), 생성 완료와 저장, 등록 완료와 캘린더, 일정 상세의 공유와 삭제, 구간별 도보 소요시간을 다룬다. 코스를 만드는 것은 `planner.md`다. 데모데이 시연에서 이 화면들을 보인다.

## R. Requirements

**기능.** 화면이 넷이다.

- 플래너 홈은 탭 셋(다가오는 일정, 지난 일정, 취소된 일정)과 생성 배너, 일정 요약 카드 목록이다. 카드를 누르면 일정 상세로 간다
- 생성 완료는 저장 전 코스(`DRAFT`)다. "{지역명} 추천 동선입니다." 제목과 지도, 타임라인, "내 플래너에 저장하기", "다시 생성하기"가 있다. 저장을 연달아 눌러도 확인 요청은 하나다. 요청이 실패해야 다시 받는다
- 등록 완료는 저장 직후 화면이다. "플래너 등록 완료!"와 일정 요약, 캘린더 버튼 둘이 있다
- 일정 상세는 저장한 코스(`SCHEDULED`)나 취소한 코스(`CANCELED`)다. 일정 요약과 지도, 타임라인, 공유하기, 삭제하기가 있다

화면에 무엇이 놓이는지는 `docs/product/SPEC.md`의 원데이 플래너 절과 `docs/design/DESIGN-SPEC.md`의 플래너 절들이 정본이다.

**보장.**

- 코스 화면은 회원만 연다. 코스는 만든 회원에게 귀속되고 남의 코스나 없는 코스는 "삭제되었거나 볼 수 없는 코스입니다." 안내와 플래너로 가는 버튼을 보인다
- 한 주소 `/courses/{id}`가 코스의 `status`로 화면을 가른다. `DRAFT`면 생성 완료, `SCHEDULED`와 `CANCELED`면 일정 상세다
- 등록 완료 주소 `/courses/{id}/saved`는 `SCHEDULED`일 때만 등록 완료를 그리고 다른 상태면 `/courses/{id}`와 같은 규칙으로 그린다
- 저장하면 등록 완료로 주소를 바꾼다(`router.replace`). 생성 완료가 기록에 남지 않아 뒤로 가서 같은 코스를 한 번 더 저장하는 일이 없다
- 등록 완료에서 뒤로 가면 생성 완료로 돌아가지 않고 플래너 홈으로 간다
- 방문일이 지난 `DRAFT`를 저장하면 저장되지 않고 다시 생성하라는 알럿을 보인다
- 공유는 일정 상세에만 있다. 저장 전 코스는 공유할 수 없다
- 삭제는 확인을 거치고 성공하면 플래너 홈으로 간다. 삭제한 일정은 취소된 일정 탭에 남는다. 취소된 일정의 상세에는 삭제하기가 없다
- 캘린더 일정의 시작은 코스 시작 시각, 종료는 코스 끝 시각이고 본문에 방문 순서가 들어간다
- 시작 시각이 늦어 코스가 자정을 넘기면 끝 시각이 시작 시각보다 앞선다. 캘린더의 끝은 다음 날이다(`model/course-time.ts`)
- 탭에 일정이 없으면 빈 목록 대신 탭마다의 안내와 생성 배너가 뜬다
- 목록과 코스 조회가 실패하면 실패 안내와 다시 시도를 보인다. 빈 목록으로 바꾸지 않는다. 캐시에 빈 목록이 있고 재조회가 실패해도 "일정이 없어요" 대신 실패 안내를 보인다
- 지역 이름이 비어 오면 제목과 지도 이름은 지역 없이 뒷말만 쓴다(`prefixRegion`)

**설계를 가르는 질문.**

- 생성과 저장이 따로다. 생성하면 서버에 `DRAFT`가 생기고 저장(`POST /{id}/confirm`)이 `SCHEDULED`로 바꾼다. 확정한 시각 `confirmedAt`이 등록일이다. `DRAFT`는 회원마다 하나이고 내 일정 탭 어디에도 나오지 않는다
- 도보 소요시간은 코스 응답의 방문지마다 `nextTravelMin`, `nextTravelM`으로 들어 있어 구간을 따로 조회하지 않는다. 백엔드가 언제 길찾기를 부르는지는 `planner.md`의 운영 절에 있다
- 캘린더 버튼은 둘이다. 구글 캘린더에 저장하기와 캘린더 파일 다운로드를 둘 다 제공한다. 구글 링크는 일정 작성 화면이 채워진 채로 열려 저장만 누르면 끝이라 모바일에서 단계가 짧다. 다만 구글 전용이라 애플 캘린더와 아웃룩을 쓰는 사람에게는 `.ics`가 필요하다. 둘 다 인증과 백엔드 작업이 없다. 백엔드에도 캘린더 링크와 `.ics` 엔드포인트(`GET /planners/{id}/calendar`, `calendar.ics`)가 있지만 쓰지 않는다. 코스 값으로 프론트가 만들 수 있고 `.ics` 파일 요청은 Bearer가 있어야 해서 `<a download>`로 받을 수 없다. 응답을 파일로 받으려면 `shared/api/client.ts`가 blob 응답을 지원해야 하고 `Course`에 요약이 없어 백엔드 설명 문구도 만들 수 없다. 장소(`LOCATION`)는 백엔드와 같은 규칙으로 첫 방문지 주소를 넣고 주소가 없으면 지역 이름을 넣는다. 구글 링크와 `.ics`가 같다. 구글 캘린더 API로 우리가 일정을 직접 넣는 방식은 `calendar.events`가 민감한 범위라 심사를 받아야 하고 테스트 모드에서 등록한 100명까지만 되어 접었다
- 다시 생성하기는 새 코스를 바로 만들지 않고 조건이 채워진 조건 입력으로 간다. 생성 직후에는 결과 주소에 실린 조건 쿼리를 그대로 넘긴다. 쿼리가 없으면(목록에서 들어왔거나 새로고침으로 쿼리를 잃었을 때) 코스 응답의 지역, 동행 유형, 날짜, 시작 시각, 소요 시간, 요청 메모로 만든다. 코스 응답에 관심 카테고리와 선호 활동이 없어 그 둘은 비어서 간다
- 삭제는 `DELETE /{id}`다. 백엔드가 `SCHEDULED`를 `CANCELED`로 바꿀 뿐 지우지 않는다
- 지도에는 방문지 핀만 두고 경로 선을 그리지 않는다. 도보 경로 좌표가 GPS 오차로 튀어 선이 어지럽게 나온다

**범위 밖.** 코스 편집(팝업 교체, 순서 변경), 코스 공유 링크의 비로그인 열람(코스가 사용자에 귀속이라 로그인 필요), 코스 안 팝업이 아닌 장소(코스에는 팝업만 들어간다), 예상 체류시간 줄(명세와 시안에 없다), 방문 전 알림(넣지 않기로 했다), 대기시간 예상(데이터가 없다), 탭 건수(`GET /counts`), 취소한 일정의 복구.

## A. Architecture

| 상태                   | 원천                                        | 비고                                                                        |
| ---------------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| 코스                   | Server. `["course", "detail", courseId]`    | 기본 `staleTime`. 저장하면 응답으로 캐시를 바꾼다                           |
| 내 일정 목록           | Server. `["course", "list", tab]` 무한 쿼리 | 탭마다 따로. 20건씩. 응답의 `nextCursor`로 다음 페이지                      |
| 코스 식별자            | URL `/courses/[courseId]`                   | 15자리까지의 양의 정수가 아니면 `notFound()`. 더 길면 `Number`가 반올림한다 |
| 다시 생성하기의 조건   | URL `/courses/{id}?{조건}`                  | 키는 `planner.md`와 같다. 없으면 코스 응답에서 만든다                       |
| 생성 완료인가 상세인가 | Derived. `status`                           | `DRAFT`면 생성 완료                                                         |
| 내 일정 탭             | URL `/planner?tab=past\|cancelled`          | 기본 `upcoming`은 쿼리 없이 `/planner`. 탭을 바꾸면 `history.replaceState`  |
| 일정이 어느 탭인가     | Server. 목록 요청의 `tab`                   | 백엔드가 서울 기준 오늘로 가른다. 방문 날짜가 오늘이면 다가오는 일정이다    |
| 등록일                 | Derived. `confirmedAt`의 서울 날짜          | 저장 전이면 `null`이고 그리지 않는다                                        |
| 공유와 삭제 알럿 열림  | 컴포넌트 `useState`                         | `AlertDialog`                                                               |

**무효화.** 저장과 삭제가 `E3000`, `E3001`, `E3005`로 실패하면 화면이 낡은 것이라 `["course", "detail", id]`를 다시 읽는다. 저장이 성공하면 응답 코스로 `["course", "detail", id]`를 바꾸고 `["course", "list"]`를 무효화한다. 삭제가 성공하면 상세 키는 다시 받지 않고 무효 표시만 한다(`refetchType: "none"`). 곧 플래너 홈으로 떠나기 때문이다. `["course", "list"]`도 무효화한다.

**흐름.**

```
/planner?tab=                   GET /planners?tab=&cursor=&size=20   목록 끝이 보이면 다음 페이지
                                카드를 누르면 /courses/{id}
/courses/{id}                   GET /planners/{id}
   DRAFT                        생성 완료
      내 플래너에 저장하기      POST /planners/{id}/confirm 뒤 router.replace(/courses/{id}/saved)
      다시 생성하기             /planner/new?{조건}
   SCHEDULED, CANCELED          일정 상세
      공유하기                  이 페이지 주소를 클립보드에 복사하고 알럿
      삭제하기(SCHEDULED만)     확인 알럿 뒤 DELETE /planners/{id}, 무효화, router.replace(/planner)
/courses/{id}/saved             SCHEDULED면 등록 완료. 뒤로 가면 router.replace(/planner)
   구글 캘린더에 저장하기       템플릿 링크를 새 탭으로 연다
   캘린더 파일 다운로드         .ics 파일을 내려받는다
```

**화면 상태.** 코스 화면과 플래너 홈이 넷을 다 그린다.

| 상태      | 코스 화면                                                                | 플래너 홈                                               |
| --------- | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| 로딩      | 요약 카드와 지도 자리 스켈레톤                                           | 카드 스켈레톤 둘. 다음 페이지는 목록 끝의 스켈레톤 하나 |
| 비어 있음 | 해당 없음                                                                | 탭마다의 안내와 넓은 생성 배너                          |
| 실패      | `E3000`, `E3001`이면 볼 수 없는 코스 안내. 그 밖은 실패 안내와 다시 시도 | 실패 안내와 다시 시도                                   |
| 정상      | 상태에 맞는 화면                                                         | 생성 배너와 카드 목록                                   |

**등록 완료의 뒤로 가기.** `useBackToPlanner`가 화면에 들어올 때 같은 주소의 기록을 하나 더 쌓는다. 뒤로 가기가 그 기록을 벗어나면 `popstate`에서 `router.replace("/planner")`한다. 다른 주소로 바로 돌아가게 두면 Next 라우터의 `popstate` 리스너가 먼저 불리고 React 19가 그 전환을 동기로 그려서 이 화면의 리스너가 불리기 전에 컴포넌트가 언마운트된다.

**공유.** 주소를 `navigator.clipboard`로 복사하고 "링크가 클립보드에 복사되었습니다" 알럿을 띄운다. 복사가 실패하면 로그를 남기고 주소를 읽기 전용 입력칸에 담은 알럿으로 직접 복사하게 한다. 링크를 받은 사람은 남의 코스라 볼 수 없는 코스 안내를 본다.

## D. Data Model

코스 모델은 `features/course/model/course.ts`에 있다. 목록 카드의 `CourseSummary`와 그것을 넓힌 상세 `Course`, 방문지 `CourseStop`, 구간 `CourseLeg`다. 날짜는 `"yyyy-MM-dd"`, 시각은 `"HH:mm"` 문자열이다. 응답을 이 모양으로 바꾸는 것은 `api/get-planner.ts`의 `toCourse`와 `api/get-planners.ts`의 `toCourseSummary`다.

```typescript
type CourseStatus = "DRAFT" | "SCHEDULED" | "CANCELED";

interface CourseSummary {
	id: number; // plannerId
	status: CourseStatus;
	title: string;
	date: string; // visitDate
	startAt: string;
	endAt: string;
	totalMinutes: number; // totalMin. 체류와 이동을 합친 백엔드 값
	stopCount: number;
	registeredAt: string | null; // confirmedAt의 서울 날짜
}

interface Course extends CourseSummary {
	regionLabel: string; // area.name. 없으면 빈 문자열
	areaId: number;
	companion: CompanionType; // accompanyType
	duration: TripDuration; // durationType
	note: string; // requestNote. 없으면 빈 문자열
	stops: CourseStop[];
	legs: CourseLeg[];
}
```

`CourseStop`은 순번과 팝업 id, 이름, 도착 시각, 주소, 좌표다. 방문지 응답의 추천 이유(`reason`)는 화면이 그리지 않아 `toCourse`가 옮기지 않는다. 팝업이 지워진 방문지는 `popupId`가 `null`이고 이름과 좌표는 저장할 때의 값이다. `CourseLeg`는 방문지 응답의 `nextTravelMin`과 `nextTravelM`이 둘 다 있는 것만 모은 것이고 `fromOrder`가 그 구간을 출발하는 방문지 순번이다. 마지막 방문지는 둘 다 `null`이라 구간이 없다.

캘린더 문자열 `buildGoogleCalendarUrl`, `buildCourseIcs`와 자정을 넘는 끝 날짜 `model/course-time.ts`는 분기 있는 순수 함수다. 에러 코드 판정은 `model/course-error.ts`다.

## I. Interface

**컴포넌트와 훅.** 플래너 홈은 `PlannerHome`이고 목록 끝의 공용 `shared/components/ListMoreTrigger`가 화면에 들어오면 다음 페이지를 부른다. 코스 두 라우트는 `CourseView`에 `view`(`detail`, `saved`)를 넘기고 `CourseView`가 코스를 조회해 생성 완료 `CourseRecommendation`, 등록 완료 `CourseSaved`, 일정 상세 `CourseDetail` 중 하나를 그린다. 실패 안내와 다시 시도는 공용 `shared/components/LoadFailure`다. 타임라인의 방문지 카드는 `CourseStopCard`이고 `popupId`가 있을 때만 팝업 상세 링크다. 저장은 `SaveCourseButton`이 `useConfirmCourse`로, 공유와 삭제는 `CourseDetailActions`가 `useCancelCourse`로 한다. 등록 완료의 뒤로 가기는 `useBackToPlanner`가 맡는다. 라우트 `/planner`는 `RequireAuth`와 `Suspense`의 대체 화면으로 `PlannerHomeSkeleton`을 넘긴다. 코스 주소는 다른 기능도 만들므로 `shared/model/course-path.ts`의 `buildCoursePath`와 `buildCourseSavedPath`에 있다.

```typescript
export function courseDetailQueryOptions(courseId: number); // ["course", "detail", courseId]
export function courseListQueryOptions(tab: CourseTab); // ["course", "list", tab]
export function useConfirmCourse(); // useMutation. 변수는 plannerId
export function useCancelCourse(); // useMutation. 변수는 plannerId
```

**`shared/lib/kakao-map`.** `markers`와 `fitTo`를 쓴다. `KakaoMarkerData`의 `variant`가 `"icon"`이면 흰 원 안에 `iconUrl`의 그림을 그리고 원의 가운데가 좌표에 온다(`yAnchor` 0.5). `iconUrl`이 없으면 핀을 만들 때 예외를 낸다. 코스 핀의 그림은 파란 위치 아이콘 `/images/pins/course.svg`이고 `toCourseMarkers`가 넘긴다. `"labeled"`이거나 값이 없으면 이름표가 붙는 탐색 핀이다.

**서버 API.** 전부 인증 필요이고 소유자만 연다.

| 메서드와 경로                        | 요청                                                    | 응답                                              |
| ------------------------------------ | ------------------------------------------------------- | ------------------------------------------------- |
| `GET /api/v1/planners/{id}`          |                                                         | 코스. 상태와 상관없이 돌려준다                    |
| `GET /api/v1/planners`               | `tab`(`UPCOMING`, `PAST`, `CANCELED`), `cursor`, `size` | 요약의 `PageResponse`. `DRAFT`는 어느 탭에도 없다 |
| `POST /api/v1/planners/{id}/confirm` |                                                         | 확정한 코스. `DRAFT`만 된다                       |
| `DELETE /api/v1/planners/{id}`       |                                                         | 204. `SCHEDULED`는 `CANCELED`로, `DRAFT`는 지운다 |

탭의 순서는 백엔드가 정한다. 다가오는 일정은 방문일과 시작 시각 오름차순, 지난 일정은 내림차순, 취소된 일정은 취소 시각 내림차순이다.

**에러 코드와 화면.**

| 코드    | 뜻                                   | 화면                                                  |
| ------- | ------------------------------------ | ----------------------------------------------------- |
| `E3000` | 코스가 없다                          | 볼 수 없는 코스 안내                                  |
| `E3001` | 남의 코스다                          | 볼 수 없는 코스 안내                                  |
| `E3002` | 저장하려는 `DRAFT`의 방문일이 지났다 | 저장 실패 알럿. 방문 날짜가 지나 다시 생성하라는 안내 |
| 그 밖   | 조회, 저장, 삭제 실패                | 조회는 실패 안내와 다시 시도, 저장과 삭제는 실패 알럿 |

**캘린더.** 등록 완료 화면에 버튼이 둘이다. 구글 캘린더에 저장하기는 `buildGoogleCalendarUrl`의 주소를 `<a target="_blank">`로 새 탭에 연다. 캘린더 파일 다운로드는 `buildCourseIcs`의 문자열을 `Blob`으로 만들어 `<a download>`로 내려준다. 캘린더로 보낸 뒤 서버에 기록하는 요청은 없다.

**로그.** `[course]` 접두사. 코스 조회 실패(볼 수 없는 코스는 빼고), 탭 목록 조회 실패, 저장 실패, 삭제 실패, 공유 주소 복사 실패를 남긴다.

**접근성.**

| 요소        | 계약                                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| 내 일정 탭  | `tablist`와 `tab`, `tabpanel`. 방향키와 Home, End로 옮긴다. 선택 탭에 `aria-selected`                           |
| 일정 목록   | `<ul aria-label="저장한 일정">`. 다음 페이지를 불러오는 동안 `aria-busy`와 `role="status"` 안내                 |
| 타임라인    | `<ol aria-label="방문 순서">`. 항목마다 `<time>`으로 도착 시각. 팝업이 남아 있는 카드는 팝업 상세로 가는 링크다 |
| 지도        | `aria-label`에 "{지역명} 코스 지도, 팝업 n곳". 핀은 `aria-hidden`이고 지도 조작 없이도 타임라인이 전체 정보다   |
| 캘린더 버튼 | 구글 버튼에 화면에서 숨긴 "(새 탭에서 열림)"이 붙는다                                                           |
| 공유와 삭제 | `shared/ui`의 `AlertDialog`. 찜 알럿과 같은 컴포넌트다. 확인 버튼에 초기 포커스, Esc는 취소와 같다              |
| 로딩        | 스켈레톤은 `role="status"`와 화면에서 숨긴 안내를 갖는다. 저장과 삭제 버튼은 요청 중 `aria-busy`이고 꺼진다     |

## O. Optimization과 운영

**렌더링.** 코스는 요청 하나로 지도와 타임라인, 구간 소요시간을 다 그린다. 지도는 코스가 오면 `fitTo`로 한 번 맞추고 이후 사용자 조작을 덮지 않는다. 저장 직후 등록 완료는 저장 응답으로 채운 캐시를 읽어 다시 조회하지 않는다.

**장애.** 코스 두 라우트는 `loading.tsx`와 인증 확인 중 대체 화면으로 `CourseViewSkeleton`을 그린다. 목록은 탭마다 따로라 한 탭의 실패가 다른 탭을 막지 않는다.

**재시도와 몰림.** 조회는 `QueryProvider` 기본을 따른다. 4xx는 재시도하지 않아 볼 수 없는 코스는 바로 안내가 뜬다. 저장과 삭제는 뮤테이션이라 자동으로 다시 보내지 않는다.

**지표.** 캘린더는 구글과 파일 각각의 클릭 수를 센다. 한쪽이 거의 안 쓰이면 그 버튼을 뺀다. 생성 완료에서 저장한 비율과 일정 삭제 비율도 센다.

**운영.** 구글 템플릿 링크의 `dates`는 코스 날짜와 시작, 끝 시각을 `YYYYMMDDTHHmmss` 두 개로 `/`로 잇고 `ctz=Asia/Seoul`로 시간대를 준다. `details`에는 방문 순서가 한 줄씩(순번과 도착 시각, 팝업명) 들어간다. `.ics`는 `VEVENT` 하나이고 `UID`에 코스 id를 넣어 다시 내려받아도 캘린더가 같은 일정으로 본다. `VTIMEZONE`(Asia/Seoul, +0900)을 넣고 `DTSTART;TZID=Asia/Seoul`로 적는다. 줄 끝은 CRLF이고 75옥텟을 넘는 줄은 접으며 쉼표와 세미콜론, 줄바꿈은 이스케이프한다. 파일 이름은 `pop-pick-course-{id}.ics`다.
