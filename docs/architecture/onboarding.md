# 온보딩 설계

`features/onboarding`. 랜딩과 온보딩 세 단계, 취향 저장을 다룬다. 진입 순서는 랜딩, 로그인, 온보딩이다. 로그인이 온보딩보다 먼저이므로 **답을 로그인 전에 보관했다가 로그인 뒤 보내는 처리가 없다.** 로그인한 사용자가 답하고 마지막 단계에서 서버로 보낸다.

## R. Requirements

**기능.** 랜딩에서 로그인을 거쳐 온보딩 세 단계로 가고 "둘러보기"는 비회원 홈으로 간다. 단계마다 무엇을 받고 어떻게 건너뛰는지는 `docs/product/SPEC.md`의 온보딩 취향 수집 절이 정본이다. 저장한 취향은 마이페이지에서 고칠 수 있다. 그중 지역과 관심 카테고리, 선호 활동은 코스 조건 입력의 첫 값이 된다. 백엔드가 `GET /api/v1/planners/form`의 기본값으로 내려준다. 동행 유형은 코스 조건 입력과 선택지도 라벨도 같고 인원수는 온보딩에만 있다. 값과 라벨(`COMPANION_TYPE_LABELS`, `PARTY_SIZE_LABELS`)은 `shared/model/trip-preference.ts`에 있고 온보딩이 그대로 쓴다. 선호 활동은 선택지 조회로 받은 id이고 코스 조건 입력도 같은 id를 쓴다.

**보장.**

- "다음"이나 "건너뛰기"로 떠난 단계의 답은 단계를 오가거나 새로고침해도 남는다. 탭을 닫으면 지워진다
- 단계 이동은 서버를 부르지 않는다. 2단계와 3단계는 처음 들어올 때 선택지를 받는다
- 아무것도 고르지 않고 "다음"을 누르면 넘어가지 않는다. "항목을 선택해주세요" 알럿이 뜨고 같은 단계에 머무른다
- 건너뛰기는 1단계와 2단계에만 있고 언제나 다음 단계로 간다. 그 단계의 값은 빈 값으로 돌아간다
- 이외의 좋아하는 것(자유 입력)은 200자를 넘지 않는다. 입력한 글자 수와 상한이 "12/200자"처럼 실시간으로 보인다
- 온보딩을 마치면 답이 서버에 저장된다. 저장에 실패하면 화면에 드러내고 빠져나갈 길을 준다. 같은 요청을 다시 보내도 같은 답이 오는 400이면 다시 시도 대신 이동 링크를 준다
- 저장이 성공하면 홈 추천(`["recommendations", "home"]`)과 플래너 기본값(`["planner", "form"]`) 캐시를 무효화한다. 새 취향이 두 화면에 바로 반영된다
- 로그아웃이나 세션 만료로 세션이 끝나면 입력 중인 답을 비운다. 같은 탭에서 다른 계정으로 로그인했을 때 이전 답이 보이지 않는다

**설계를 가르는 질문.**

- 답의 원천은 서버다. 로그인한 사용자가 답하므로 옮기는 단계가 없다
- 입력 중인 값은 폼이 들고 "다음"이나 "건너뛰기"를 누를 때 스토어에 쓴다. 헤더의 뒤로 가기로 떠나면 그 단계에서 고친 값은 스토어에 가지 않는다. 스토어는 저장이 성공하면 비운다

**범위 밖.** 성별 항목. 추천 미리보기 화면은 존치 여부가 미결정이라 이 문서가 다루지 않는다.

## A. Architecture

| 상태            | 원천                                                                                                            | 비고                                                                                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 선택지 목록     | Server. `["onboarding", "options", "interest-categories"]`와 `"favorite-areas"`, `"preferred-activities"` 키 셋 | 관심 카테고리와 지역, 선호 활동. 서버 테이블에서 온다. `staleTime`은 `Infinity`                                                                            |
| 입력한 답       | Zustand `useOnboardingStore`. `sessionStorage`의 `pp-onboarding-answers` 키에 `answers`만 저장                  | 탭을 닫으면 지워진다. 저장이 성공하거나 세션이 끝나면(`subscribeSessionEnded`) 비운다. 세션이 끝나는 전이는 `docs/architecture/auth.md`의 세션 정리에 있다 |
| 저장된 취향     | Server                                                                                                          | 저장만 붙였다. 조회 엔드포인트를 쓰는 코드가 아직 없어 단계 화면은 서버 값이 아니라 스토어의 답을 폼 기본값으로 쓴다                                       |
| 현재 단계       | URL `/onboarding/[step]`                                                                                        | `parseStep`이 문자열 `"1"`, `"2"`, `"3"`만 받는다. `01`처럼 0이 붙은 값도 `notFound()`다. 헤더의 뒤로 가기가 이전 단계이고 1단계의 이전은 `/`다            |
| 입력 중인 폼 값 | react-hook-form                                                                                                 | 단계 폼마다 `OnboardingStepAnswers[step]` 모양이다                                                                                                         |

통신은 넷이다. 선택지 조회 셋과 취향 저장 하나이고 경로와 모양은 I 절의 서버 API 표에 있다.

**선택지를 화면에 박지 않는다.** 관심 카테고리와 자주 가는 지역, 선호 활동은 서버 테이블에 있고 그 단계에 들어갈 때 조회해 목록을 그린다. 항목을 더하거나 뺄 때 재배포하지 않기 위해서다. 팝업을 수집할 때도 같은 카테고리로 나누므로 서버가 목록을 갖는 편이 맞다.

**답 복원.** 서버 렌더에는 `sessionStorage`가 없어 스토어는 `skipHydration`으로 만들고 `useOnboardingAnswers`가 마운트 뒤에 `persist.rehydrate()`를 부른다. 복원이 끝나기 전 `loadStatus`는 `"loading"`이고 단계 화면은 `OnboardingStepSkeleton`을 그린다. 브라우저가 `sessionStorage`를 막으면 zustand persist가 메모리에만 쓰고 `loadStatus`가 `"failed"`가 된다. 이때 단계 화면 위에 새로고침하면 답이 사라질 수 있다는 안내를 띄우고 폼은 그대로 쓸 수 있다. 복원이 끝나기 전에 스토어를 고치면 이전 단계의 답이 지워지므로 스토어의 세 동작은 `verifyAnswersLoaded`를 거쳐 `loadStatus`가 `"loading"`일 때 부르면 예외를 일으킨다. 세션 종료 구독만 이 검사를 거치지 않고 직접 비운다. 복원 전에도 `sessionStorage`에 이전 답이 남지 않게 하려는 것이다.

**흐름.**

```
/                      나에게 맞는 팝업 찾기   /login?next=/onboarding/1
로그인 성공                                    /onboarding/1
/onboarding/1  다음                            값이 있으면 /onboarding/2, 없으면 알럿
               건너뛰기                        /onboarding/2 (1단계 값을 비움)
/onboarding/2  다음                            값이 있으면 /onboarding/3, 없으면 알럿
               건너뛰기                        /onboarding/3 (2단계 값을 비움)
/onboarding/3  POP PICK 시작하기               값이 있으면 POST onboarding 뒤 환영 알럿, 확인하면 / 로 replace
/                      둘러보기                랜딩 모달을 닫고 홈에 머문다
```

3단계에 건너뛰기가 없는 까닭과 단계마다 무엇이 있어야 넘어가는지는 `docs/product/SPEC.md`의 온보딩 취향 수집 절에 있다.

"다음"과 "시작하기"는 고른 id 중 지금 받은 선택지 목록에 없는 것을 `filterListedIds`로 걸러 낸 뒤 `isStepIncomplete`로 빠진 항목이 있는지 본다. 서버가 항목을 빼면 이전에 고른 id가 스토어에 남아 있을 수 있어서다. 판정에는 항목마다의 선택지 개수(`StepOptionCounts`)를 함께 넘기고 개수가 0인 항목은 필수에서 뺀다. 2단계와 3단계는 선택지 조회가 성공한 뒤의 `data.length`를 넘긴다. 1단계의 선택지는 코드에 박힌 상수라 0이 될 일이 없다. 빈 목록일 때 화면에 무엇이 보이는지는 SPEC의 같은 절에 있다.

3단계의 "시작하기"는 답을 스토어에 쓴 뒤 스토어 전체를 저장한다. 저장이 성공하면 스토어를 비우고 "POP PICK과 시작하는 여정을 환영합니다" 알럿을 띄운다. 확인을 누르면 홈으로 간다. 저장이 실패하면 알럿을 띄우지 않고 버튼 위에 `SaveFailureNotice`를 보인다. 실패는 HTTP 400인지로 가른다.

- 400이 아닌 실패(네트워크, 5xx)는 실패 문구와 다시 시도를 보인다. 저장하는 동안 다시 시도는 포커스를 잃지 않도록 `aria-disabled`로 두고 누름을 무시한다. 다시 시도를 누르는 동안에도 안내가 사라지지 않게 마지막 오류를 컴포넌트 상태로 붙든다. `mutation.error`는 요청 중에 비워지기 때문이다
- 400은 다시 시도를 두지 않는다. 동행 유형과 인원수를 고르지 않은 채 저장한 경우(1단계를 건너뛴 회원)에는 "동행 유형과 인원수를 고르지 않아 저장하지 못했어요"와 `1단계로`, `홈으로` 링크를 준다. 동행 답이 있는 경우는 이미 취향을 저장한 회원으로 보고 "저장할 수 없는 상태예요. 이미 취향을 저장했다면 홈에서 그대로 이용할 수 있어요"와 `홈으로`만 준다

두 경우가 모두 백엔드 400(`E400`)이라 에러 코드로 가를 수 없고, 화면이 분기하는 에러 코드를 늘리지 않으려고 HTTP 400으로만 분기한다(`model/save-rejection.ts`의 `isSaveRejected`). "시작하기" 버튼은 저장하는 동안 `aria-disabled`다.

## D. Data Model

```typescript
// features/onboarding/model/answers.ts
// CompanionType("ALONE" | "WITH_FRIEND" | "COUPLE" | "WITH_FAMILY")과 PartySize(1부터 4, 4는 4명 이상)는
// shared/model/trip-preference.ts에서 가져온다. 동행 유형 값은 백엔드 AccompanyType과 같다

const ONBOARDING_FREE_TEXT_MAX_LENGTH = 200;

interface OnboardingAnswers {
	companionType: CompanionType | null;
	partySize: PartySize | null;
	/** 셋 다 선택지 조회로 받은 id다 */
	categoryIds: number[];
	areaIds: number[];
	activityIds: number[];
	/** 빈 문자열이 기본 */
	freeText: string;
}

/** 단계마다 폼이 드는 필드 */
interface OnboardingStepAnswers {
	1: Pick<OnboardingAnswers, "companionType" | "partySize">;
	2: Pick<OnboardingAnswers, "categoryIds" | "areaIds">;
	3: Pick<OnboardingAnswers, "activityIds" | "freeText">;
}

/** 단계마다의 빈 값. 건너뛰기가 이 값으로 되돌린다 */
const EMPTY_STEP_ANSWERS: { [S in OnboardingStep]: OnboardingStepAnswers[S] };
/** 세 단계의 빈 값을 합친 것 */
const EMPTY_ANSWERS: OnboardingAnswers;

/** 단계마다 고르는 항목. 자유 입력은 선택이라 없다 */
const STEP_CHOICE_FIELDS: {
	1: ["companionType", "partySize"];
	2: ["categoryIds", "areaIds"];
	3: ["activityIds"];
};
/** 그 단계 항목마다의 선택지 개수 */
type StepOptionCounts<S extends OnboardingStep> = Record<(typeof STEP_CHOICE_FIELDS)[S][number], number>;

/** "다음"을 막을지 본다. 선택지 개수가 0인 항목은 필수에서 빠진다. true면 알럿을 띄우고 이동하지 않는다 */
function isStepIncomplete<S extends OnboardingStep>(
	step: S,
	answers: OnboardingStepAnswers[S],
	optionCounts: StepOptionCounts<S>
): boolean;
function toggleSelectedId(selectedIds: readonly number[], id: number): number[];
/** 저장해 둔 id 중 받은 선택지 목록에 없는 것을 뺀다 */
function filterListedIds(selectedIds: readonly number[], options: readonly { id: number }[]): number[];
```

```typescript
// features/onboarding/api/onboarding-options.ts. 서버 응답 그대로다
interface InterestCategoryResponse {
	id: number;
	category: string;
}

interface FavoriteAreaResponse {
	id: number;
	area: string;
}

interface PreferredActivityResponse {
	id: number;
	activity: string;
}
```

**선택지가 서버에서 오면서 세 값의 타입이 숫자 id가 된다.** 지역 유니온 타입과 라벨 대응표(`shared/model/region.ts`)는 서버 목록으로 대체되어 지웠다. 타입 검사가 잡아 주던 오타를 못 잡게 되므로 화면은 받은 목록만 그리고 목록에 없는 id를 보내지 않는다. 지역 선택지는 서버가 주는 일곱 곳(성수, 여의도, 홍대, 잠실, 용산, 종로, 강남)이다.

**라벨은 서버, 아이콘은 프론트다.** 선택지 응답에는 id와 이름 문자열뿐이다. 지도 핀의 카테고리 아이콘은 정적 이미지라 코드에 카테고리와 파일을 잇는 대응표가 남는다. 서버가 새 카테고리를 더하면 아이콘 없는 값이 오므로 기본 아이콘을 하나 둔다. 팝업 응답의 `region`, `category`와 선택지 id를 어떻게 잇는지는 `ARCHITECTURE.md`의 백엔드 요구 목록에 있다.

zod 스키마는 쓰지 않는다. 폼은 react-hook-form이 값을 들고 판정은 `isStepIncomplete`와 `filterListedIds`가 한다. 200자 상한은 `<textarea maxLength>`가 막는다.

## I. Interface

**스토어와 훅.**

```typescript
// features/onboarding/model/useOnboardingStore.ts
type OnboardingAnswersLoadStatus = "loading" | "ready" | "failed";

export const useOnboardingStore: UseBoundStore<{
	answers: OnboardingAnswers;
	loadStatus: OnboardingAnswersLoadStatus;
	/** 그 단계의 답을 덮어쓴다 */
	setStepAnswers: <S extends OnboardingStep>(step: S, patch: OnboardingStepAnswers[S]) => void;
	/** 그 단계의 답을 EMPTY_STEP_ANSWERS로 되돌린다. 건너뛰기가 부른다 */
	clearStepAnswers: (step: OnboardingStep) => void;
	resetAnswers: () => void;
}>;

// features/onboarding/hooks/useOnboardingAnswers.ts
/** 마운트 뒤 sessionStorage에서 답을 복원한다 */
export function useOnboardingAnswers(): { answers: OnboardingAnswers; loadStatus: OnboardingAnswersLoadStatus };

// features/onboarding/hooks/useSaveOnboarding.ts
/** 성공하면 resetAnswers와 홈 추천, 플래너 기본값 캐시 무효화. 실패하면 [onboarding] 로그 */
export function useSaveOnboarding(): UseMutationResult<void, Error, OnboardingAnswers>;

// features/onboarding/hooks/useFocusAfterRetry.ts
/** 선택지 조회를 다시 시도해 성공하면 새로 그린 첫 칩 묶음으로 포커스를 옮긴다 */
export function useFocusAfterRetry<T extends HTMLElement>(): {
	markRetry: () => void;
	focusTargetRef: (node: T | null) => void;
};

// features/onboarding/api/onboarding-options.ts
export function interestCategoriesQueryOptions();
export function favoriteAreasQueryOptions();
export function preferredActivitiesQueryOptions();
```

**컴포넌트.** 전부 `features/onboarding/components/`에 있다.

```typescript
/** 공용 PageHeader에 뒤로 가기와 "취향 분석 온보딩" 제목, 진행 표시 "1/3"을 넘긴다 */
export function OnboardingHeader({ step }: { step: OnboardingStep });
/** 단계 그림과 단계 제목, 설명문(ONBOARDING_STEP_DESCRIPTIONS)을 그린다. 인증 확인 중 화면과 같은 모양이라 OnboardingStepIntro를 같이 쓴다 */
export function OnboardingStepIntro({ step }: { step: OnboardingStep });
/** OnboardingStepIntro 아래에 답 복원 상태를 그리고 단계에 맞는 폼을 고른다 */
export function OnboardingStepScreen({ step }: { step: OnboardingStep });
/** 답 복원 중과 선택지 조회 중에 그린다. 단계마다 막대 높이가 그 단계 폼의 높이와 같다 */
export function OnboardingStepSkeleton({ step, label }: { step: OnboardingStep; label: string });
export function CompanionStepForm({ initialAnswers }: { initialAnswers: OnboardingStepAnswers[1] });
export function InterestStepForm({ initialAnswers }: { initialAnswers: OnboardingStepAnswers[2] });
export function ActivityStepForm({ initialAnswers }: { initialAnswers: OnboardingStepAnswers[3] });
/**
 * fieldset과 legend 안에 공용 ChoiceChipGrid를 둔다. single이면 radio, multiple이면 checkbox. options가 비면 "선택지가 없어요".
 * onSelect는 누른 칩의 값만 넘기고 다중 선택의 넣고 빼기는 부르는 폼이 toggleSelectedId로 한다. ref는 tabIndex={-1}인 fieldset에 붙는다
 */
export function ChoiceChipGroup<T extends string | number>(props: ChoiceChipGroupProps<T>);
/** 라벨과 줄바꿈을 그대로 그리는 설명문, 두 줄 입력칸, "12/200자" 글자 수 카운터 */
export function FreeTextField(props: FreeTextFieldProps);
/** 1단계와 2단계의 공용 BottomActionBar. 다음이 위에 오는 submit 버튼이다 */
export function StepActions({ onSkip }: { onSkip: () => void });
/** 선택지 조회 실패. 다시 시도는 실패한 쿼리만 다시 부른다. 다시 부르는 동안 버튼은 aria-disabled이고 누름을 무시한다 */
export function OptionsLoadFailure({ isRetrying, onRetry }: { isRetrying: boolean; onRetry: () => void });
/** 저장 실패 안내. 400이면 다시 시도 없이 이동 링크를, 그 밖이면 다시 시도를 준다. 분기는 model/save-rejection.ts */
export function SaveFailureNotice(props: {
	error: unknown;
	isRetrying: boolean;
	hasCompanionAnswers: boolean;
	onRetry: () => void;
});
```

라우트 `src/app/onboarding/[step]/page.tsx`가 `OnboardingHeader`와 `RequireAuth`로 감싼 `OnboardingStepScreen`을 조립한다. 인증을 확인하는 동안은 `OnboardingStepIntro`와 `OnboardingStepSkeleton`을 `RequireAuth`의 `fallback`으로 넘겨 도착할 화면과 같은 그림과 제목, 뼈대를 그린다.

**서버 API.**

| 메서드와 경로                                  | 요청                        | 응답                          |
| ---------------------------------------------- | --------------------------- | ----------------------------- |
| `GET /api/v1/onboardings/interest-categories`  |                             | `InterestCategoryResponse[]`  |
| `GET /api/v1/onboardings/favorite-areas`       |                             | `FavoriteAreaResponse[]`      |
| `GET /api/v1/onboardings/preferred-activities` |                             | `PreferredActivityResponse[]` |
| `POST /api/v1/members/me/onboarding`           | `OnboardingRegisterRequest` | `null`                        |

Swagger는 넷 다 전역 Bearer 인증 아래에 둔다. 선택지 조회를 인증 없이 부를 수 있는지는 확인하지 않았다. 단계 화면은 `RequireAuth` 안에 있어 로그인한 상태에서만 부른다.

```typescript
// features/onboarding/api/save-onboarding.ts. 서버 OnboardingRegisterRequest
interface OnboardingRegisterRequest {
	/** 1단계를 건너뛰면 null */
	accompanyType: CompanionType | null;
	/** partySize를 바꾸지 않고 보낸다. 4는 4명 이상이다. 1단계를 건너뛰면 null */
	numOfAccompany: PartySize | null;
	interestCategoryIds: number[];
	favoriteAreaIds: number[];
	preferredActivityIds: number[];
	/** freeText. 최대 200자 */
	additionalInfo: string;
}
```

백엔드 `OnboardingRegisterRequest`는 `accompanyType`과 `numOfAccompany`를 null 없는 타입으로 받는다(`numOfAccompany`는 0부터 4, `additionalInfo`는 최대 200자, id 배열은 중복 불가. id는 토글로 고르므로 중복이 생기지 않는다). 1단계를 건너뛰고 저장하면 400(`E400`)으로 거절되고 위의 400 안내가 뜬다. 이미 온보딩한 회원의 재저장도 `ALREADY_REGISTERED`가 같은 400(`E400`)이다. 온보딩 완료 여부를 알려 주는 조회가 없고 로그인 응답에도 없어서, 랜딩의 "나에게 맞는 팝업 찾기"로 로그인한 기존 회원도 1단계로 와서 저장 때 이 안내를 만난다. 안내에 홈으로 가는 링크가 있어 갇히지 않는다. 프론트는 고르지 않은 답을 기본값으로 채우지 않는다. 프론트는 고르지 않은 답을 기본값으로 채우지 않는다. 백엔드에 바꿔 달라는 요청은 `ARCHITECTURE.md`의 백엔드 요구 목록에 있다.

**로그.** `[onboarding]` 접두사. 취향 저장 실패와 `sessionStorage` 복원 실패.

**접근성.** 선택 칩은 `shared/ui`의 `ChoiceChipGrid`가 그리는 `ChoiceChip`이고 단일 선택 묶음은 radio, 다중 선택 묶음은 checkbox다. 묶음마다 `<fieldset>`과 `<legend>`가 질문 문구를 담고 다중 선택이면 legend에 "복수선택 가능"이 붙는다. 자유 입력칸은 `aria-describedby`로 설명문과 글자 수 카운터 둘을 잇는다. 남은 글자가 20자 이하일 때만 따로 둔 `aria-live="polite"` 영역이 카운터와 같은 "n/200자"를 읽는다. 헤더의 진행 표시 "1/3"은 `aria-hidden`이고 화면 낭독기에는 `sr-only` 문구 "3단계 중 1단계"가 읽힌다. 단계 헤드의 그림은 `public/images/illustrations/onboarding-{1,2,3}.svg`를 `next/image`로 그리고 `alt`가 비어 있다. 선택지 조회를 다시 시도해 성공하면 첫 칩 묶음의 fieldset으로 포커스를 옮긴다. 답 복원과 선택지 조회, 저장 중에는 `role="status"` 문구가 알리고 선택지 조회 실패와 저장 실패는 `role="alert"`다. 미입력 알럿과 환영 알럿은 `shared/ui`의 `AlertDialog`이고 확인 버튼 하나만 둔다.

## O. Optimization과 운영

**렌더링.** 라우트 파일은 서버 컴포넌트이고 `OnboardingStepScreen` 아래가 클라이언트다. 선택지 조회는 2단계가 카테고리와 지역을, 3단계가 선호 활동을 부른다. `staleTime`이 `Infinity`라 한 번 받은 목록은 탭이 살아 있는 동안 다시 부르지 않는다. 목록이 자주 바뀌지 않는다.

스켈레톤에서 폼으로 바뀔 때 아래 내용이 움직이지 않도록 `OnboardingStepSkeleton`의 막대 높이를 단계마다 그 폼의 높이로 맞췄다. 높이는 시안의 선택지 개수(카테고리 일곱, 지역 여섯, 활동 넷. 지금 서버 지역은 일곱 곳이라 칩이 한 줄 더 늘 수 있다)로 잡았다. 서버가 다른 개수를 주면 그 차이만큼 움직인다.

**장애.** 선택지 조회가 실패하면 고를 것이 없으므로 그 단계의 폼 대신 `OptionsLoadFailure`를 보인다. 조회 실패는 빈 목록과 다르다. 빈 목록은 조회가 성공한 결과라 폼을 그리고 그 항목만 필수에서 뺀다. 목록을 코드에 박아 둔 기본값으로 대신하지 않는다. 서버 목록과 다른 값을 저장하게 된다.

취향 저장 실패는 3단계 버튼 위의 실패 문구이고 다시 시도가 스토어의 답으로 `mutate`를 다시 부른다. 저장될 때까지 스토어의 답을 비우지 않는다. 실패를 숨기지 않는다.

**재시도와 몰림.** 선택지 조회는 `QueryProvider`의 기본값을 따라 4xx가 아니면 두 번까지 자동 재시도한다. 취향 저장은 마지막 단계에서 한 번이고 자동 재시도하지 않는다.

**지표.** 취향 저장 실패 횟수와 선택지 조회 실패 횟수를 센다. 조회가 실패하면 온보딩이 통째로 막힌다.

**운영.** 홈은 `/` 하나이고 랜딩은 `src/app/page.tsx`가 홈 화면에 `components/LandingDialog`를 얹는다. `AuthStatusSwitch`의 `anonymous` 칸에 넣어 로그인하지 않은 사용자에게만 뜬다. 닫으면 `model/landing-dismissal.ts`가 `sessionStorage`에 기록해 그 세션 동안 다시 띄우지 않는다. 네이티브 `<dialog>`의 `showModal()`로 열어 포털 없이 top layer에 뜨고 배경 차단과 Esc를 브라우저가 맡는다.
