# 온보딩 설계

`features/onboarding`. 랜딩과 온보딩 세 단계, 취향 저장을 다룬다. 진입 순서는 랜딩, 로그인, 로그인 완료, 온보딩이다. 로그인이 온보딩보다 먼저이므로 **답을 로컬에 임시 보관했다가 로그인 뒤 보내는 처리가 없다.** 로그인한 사용자가 답하고 마지막 단계에서 서버로 보낸다.

## R. Requirements

**기능.** 랜딩에서 로그인을 거쳐 온보딩 세 단계로 가고 "둘러보기"는 비회원 홈으로 간다. 단계마다 무엇을 받고 어떻게 건너뛰는지는 `docs/product/SPEC.md`의 온보딩 취향 수집 절이 정본이다. 저장한 취향은 코스 조건 입력과 마이페이지에서 고칠 수 있고 세 화면이 같은 입력 컴포넌트를 쓴다.

**보장.**

- 단계를 오가거나 새로고침해도 입력한 답이 남는다
- 단계 이동은 서버를 부르지 않아 즉시다
- 아무것도 고르지 않고 "다음"을 누르면 넘어가지 않는다. "항목을 선택해주세요" 알럿이 뜨고 같은 단계에 머무른다
- 건너뛰기는 언제나 다음 단계로 간다. 그 단계의 값은 저장되지 않는다
- 추가 요청사항은 200자를 넘지 않는다. 남은 글자 수가 실시간으로 보인다
- 온보딩을 마치면 답이 서버에 저장된다. 저장에 실패하면 화면에 드러내고 다시 시도할 길을 준다

**설계를 가르는 질문.**

- 답의 원천은 서버다. 로그인한 사용자가 답하므로 옮기는 단계가 없다
- 입력 중인 값은 폼이 들고 단계를 떠날 때 스토어에 쓴다. 스토어는 온보딩을 마치면 비운다

**범위 밖.** 성별 항목. 추천 미리보기 화면은 존치 여부가 미결정이라 이 문서가 다루지 않는다.

## A. Architecture

| 상태             | 원천                                | 비고                                                                     |
| ---------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| 선택지 목록      | Server. `["onboarding", "options"]` | 관심 카테고리와 지역, 선호 활동 셋. 서버 테이블에서 온다. 공개           |
| 저장된 취향      | Server. `["preferences"]`           | 로그인한 사용자의 답이다. 코스 조건 입력과 마이페이지가 같은 값을 읽는다 |
| 온보딩 완료 여부 | 같은 응답                           | 쿠키로 랜딩 노출을 판단하는 안은 랜딩 노출 조건이 정해지면 따른다        |
| 현재 단계        | URL `/onboarding/[step]`            | 뒤로가기가 이전 단계이고 1단계의 이전은 랜딩이다                         |
| 입력 중인 폼 값  | react-hook-form                     | 단계를 떠날 때 스토어에 쓰고 마치면 비운다                               |

통신은 셋이다. 선택지 조회는 인증이 없고 취향 저장과 조회는 인증이 필요하다.

**선택지를 화면에 박지 않는다.** 관심 카테고리와 자주 가는 지역, 선호 활동은 서버 테이블에 있고 온보딩에 들어갈 때 한 번 조회해 목록을 그린다. 항목을 더하거나 뺄 때 재배포하지 않기 위해서다. 팝업을 수집할 때도 같은 카테고리로 나누므로 서버가 목록을 갖는 편이 맞다.

**흐름.**

```
/                      나에게 맞는 팝업 찾기   /login?next=/onboarding/1
로그인 성공                                    /login/complete 뒤 /onboarding/1
/onboarding/1  다음                            값이 있으면 /onboarding/2, 없으면 알럿
               건너뛰기                        /onboarding/2 (값 저장 안 함)
/onboarding/2  다음, 건너뛰기                  /onboarding/3
/onboarding/3  시작하기                        PUT preferences 뒤 환영 알럿, 확인하면 /home
               건너뛰기                        PUT preferences 뒤 /home
/                      둘러보기                /home (비회원 홈)
```

단계 화면은 저장된 취향을 폼 기본값으로 읽고 "다음"이나 "건너뛰기"에서 폼 값을 스토어에 쓴다. 건너뛰기는 그 단계의 값을 비운 채 다음으로 간다. "다음"은 그 단계에 고른 것이 하나도 없으면 알럿을 띄우고 머무른다. 건너뛰려면 건너뛰기를 눌러야 한다는 것을 알럿이 알려주는 셈이라 문구는 기획이 준 "항목을 선택해주세요"를 그대로 쓴다.

3단계의 "시작하기"는 저장이 성공한 뒤 "POP PICK과 시작하는 여정을 환영합니다" 알럿을 띄우고 확인을 누르면 홈으로 간다. 저장이 실패하면 알럿을 띄우지 않는다.

마지막 단계에서 저장이 실패하면 스토어를 비우지 않고 화면에 다시 시도할 길을 준다. 답을 잃지 않는다.

## D. Data Model

```typescript
// features/onboarding/model/answers.ts
type CompanionType = "ALONE" | "FRIEND" | "COUPLE" | "FAMILY";
/** 4는 4명 이상 */
type PartySize = 1 | 2 | 3 | 4;

interface OnboardingAnswers {
	companionType: CompanionType | null;
	partySize: PartySize | null;
	/** 셋 다 선택지 조회로 받은 code 값이다 */
	categories: string[];
	areas: string[];
	activities: string[];
	/** 최대 200자. 빈 문자열이 기본 */
	freeText: string;
}

// features/onboarding/model/answers.ts
/** 모든 필드가 빈 값인 OnboardingAnswers */
const EMPTY_ANSWERS: OnboardingAnswers;
/** 여섯 필드 중 하나라도 EMPTY_ANSWERS와 다르면 true. freeText는 공백을 지우고 본다 */
function hasAnySignal(answers: OnboardingAnswers): boolean;
```

```typescript
// features/onboarding/model/options.ts. 백엔드 요구
interface OnboardingOption {
	/** 저장할 때 서버로 보내는 값 */
	code: string;
	/** 화면에 그리는 이름 */
	label: string;
}

interface OnboardingOptions {
	categories: OnboardingOption[];
	areas: OnboardingOption[];
	activities: OnboardingOption[];
}
```

**선택지가 서버에서 오면서 세 값의 타입이 문자열이 된다.** 지금 `shared/model/region.ts`와 `shared/model/popup.ts`에 있는 유니온 타입과 라벨 대응표는 서버 목록으로 대체된다. 타입 검사가 잡아 주던 오타를 못 잡게 되므로 화면은 받은 목록만 그리고 목록에 없는 값을 만들지 않는다.

**라벨은 서버, 아이콘은 프론트다.** 지도 핀의 카테고리 아이콘은 정적 이미지라 코드에 `code`와 파일을 잇는 대응표가 남는다. 서버가 새 카테고리를 더하면 아이콘 없는 값이 오므로 기본 아이콘을 하나 둔다.

단계별 zod 스키마는 고른 값이 받은 목록 안에 있는지만 본다. `freeText`에 `max(200)`이 붙는다.

## I. Interface

**컴포넌트와 훅.**

```typescript
export function Landing(); // /. 두 버튼
export function OnboardingStep({ step }: { step: 1 | 2 | 3 });
export function StepProgress({ step, total }: { step: number; total: number });
export function ChoiceChipGroup<T extends string>(props: {
	name: string;
	legend: string;
	options: readonly { value: T; label: string }[];
	mode: "single" | "multiple";
});
export function FreeTextField({ name, maxLength }: { name: string; maxLength: 200 });

export function useOnboardingStore(): {
	answers: OnboardingAnswers;
	completedAt: string | null;
	setStep: (step: 1 | 2 | 3, patch: Partial<OnboardingAnswers>) => void;
	markCompleted: () => void;
	clearAnswers: () => void;
};
export function useOnboardingOptions(): UseQueryResult<OnboardingOptions, ApiError>;
export function useSavePreferences(): UseMutationResult<null, ApiError, OnboardingAnswers>;
/** 값이 하나도 없이 다음을 눌렀는지 본다. true면 알럿을 띄우고 이동하지 않는다 */
export function isStepEmpty(step: 1 | 2 | 3, answers: OnboardingAnswers): boolean;
```

**서버 API.** 백엔드 요구다.

| 메서드와 경로                    | 인증 | 요청                | 응답                |
| -------------------------------- | ---- | ------------------- | ------------------- |
| `GET /api/v1/onboarding/options` | 없음 |                     | `OnboardingOptions` |
| `PUT /api/v1/me/preferences`     | 필요 | `OnboardingAnswers` | `null`              |

**로그.** `[onboarding]` 접두사. 취향 저장 실패와 재시도 결과.

**접근성.** 단일 선택 묶음은 라디오, 다중 선택 묶음은 `<button aria-pressed>`다. 묶음마다 `<fieldset>`과 `<legend>`가 질문 문구를 담는다. 글자 수 카운터는 `aria-live="polite"`이고 상한에 닿으면 문구가 바뀐다. 미입력 알럿과 환영 알럿은 `shared/ui`의 `ConfirmDialog`와 같은 native `<dialog>`이고 확인 버튼 하나만 둔다. 닫으면 눌렀던 버튼으로 포커스가 돌아간다.

## O. Optimization과 운영

**렌더링.** 단계 화면은 정적이라 서버 컴포넌트로 껍데기를 그리고 폼만 클라이언트다. 선택지 조회는 1단계에 들어올 때 한 번이고 세 단계가 같은 캐시를 쓴다. `staleTime`을 길게 둔다. 목록이 자주 바뀌지 않는다.

**장애.** 선택지 조회가 실패하면 고를 것이 없으므로 단계 화면 대신 오류와 다시 시도를 보인다. 목록을 코드에 박아 둔 기본값으로 대신하지 않는다. 서버 목록과 다른 값을 저장하게 된다.

취향 저장 실패는 화면 안 `ErrorState`이고 다시 시도가 `mutate`를 부른다. 저장될 때까지 스토어의 답을 비우지 않는다. 조용히 넘기지 않는다.

**재시도와 몰림.** 취향 저장은 마지막 단계에서 한 번이다. 네트워크 오류만 자동 재시도한다.

**지표.** 취향 저장 실패 횟수와 선택지 조회 실패 횟수를 센다. 조회가 실패하면 온보딩이 통째로 막힌다.

**운영.** 랜딩 노출 조건이 "최초 1회"로 정해지면 `proxy.ts`가 `pp_onboarded` 쿠키를 보고 `/`를 `/home`으로 보낸다. "매번"이면 그 조건을 두지 않는다. 쿠키는 `markCompleted`가 `document.cookie`로 쓰고 값은 날짜 문자열이다.
