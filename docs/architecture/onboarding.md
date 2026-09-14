# 온보딩 설계

`features/onboarding`. 랜딩과 온보딩 세 단계, 취향 저장을 다룬다. 진입 순서는 랜딩, 로그인, 온보딩이다. 로그인이 온보딩보다 먼저이므로 **답을 로컬에 임시 보관했다가 로그인 뒤 보내는 처리가 없다.** 로그인한 사용자가 답하고 마지막 단계에서 서버로 보낸다. 추천 미리보기 화면이 이 순서에서 어떻게 되는지는 미결정이고 `docs/product/ROADMAP.md`의 미결정 절에 있다.

## R. Requirements

**기능.** 랜딩에서 로그인을 거쳐 온보딩 세 단계로 가고 "둘러보기"는 비회원 홈으로 간다. 단계마다 무엇을 받고 어디를 건너뛸 수 있는지는 `docs/product/SPEC.md`의 온보딩 취향 수집 절이 정본이다. 저장한 취향은 플래너 조건 입력과 마이페이지에서 고칠 수 있고 세 화면이 같은 입력 컴포넌트를 쓴다.

**보장.**

- 단계를 오가거나 새로고침해도 입력한 답이 남는다
- 단계 이동은 서버를 부르지 않아 즉시다
- 자유 입력은 200자를 넘지 않는다. 남은 글자 수가 실시간으로 보인다
- 온보딩을 마치면 답이 서버에 저장된다. 저장에 실패하면 화면에 드러내고 다시 시도할 길을 준다

**설계를 가르는 질문.**

- 답의 원천은 서버다. 로그인한 사용자가 답하므로 옮기는 단계가 없다
- 입력 중인 값은 폼이 들고 단계를 떠날 때 스토어에 쓴다. 스토어는 온보딩을 마치면 비운다

**범위 밖.** 성별 항목(피그마에서 빠짐). 추천 미리보기 화면은 존치 여부가 미결정이라 이 문서가 다루지 않는다.

## A. Architecture

| 상태             | 원천                      | 비고                                                              |
| ---------------- | ------------------------- | ----------------------------------------------------------------- |
| 저장된 취향      | Server. `["preferences"]` | 로그인한 사용자의 답이다. 플래너와 마이페이지가 같은 값을 읽는다  |
| 온보딩 완료 여부 | 같은 응답                 | 쿠키로 랜딩 노출을 판단하는 안은 랜딩 노출 조건이 정해지면 따른다 |
| 현재 단계        | URL `/onboarding/[step]`  | 뒤로가기가 이전 단계이고 1단계의 이전은 랜딩이다                  |
| 입력 중인 폼 값  | react-hook-form           | 단계를 떠날 때 스토어에 쓰고 마치면 비운다                        |

통신은 취향 저장과 조회 둘이고 모두 인증이 필요하다.

**흐름.**

```
/                      나에게 맞는 팝업 찾기   /login?next=/onboarding/1
로그인 성공                                    /onboarding/1
/onboarding/1  다음, 건너뛰기                  /onboarding/2
/onboarding/2  다음, 건너뛰기                  /onboarding/3
/onboarding/3  완료                            PUT preferences 뒤 /home
/                      둘러보기                /home (비회원 홈)
```

단계 화면은 저장된 취향을 폼 기본값으로 읽고 "다음"이나 "건너뛰기"에서 폼 값을 스토어에 쓴다. 건너뛰기는 그 단계의 값을 비운 채 다음으로 간다.

마지막 단계에서 저장이 실패하면 스토어를 비우지 않고 화면에 다시 시도할 길을 준다. 답을 잃지 않는다.

## D. Data Model

```typescript
// features/onboarding/model/answers.ts
type CompanionType = "ALONE" | "FRIEND" | "COUPLE" | "FAMILY";
/** 4는 4명 이상 */
type PartySize = 1 | 2 | 3 | 4;
type Activity = "GOODS" | "PHOTO" | "EXPERIENCE" | "FOOD";

interface OnboardingAnswers {
	companionType: CompanionType | null;
	partySize: PartySize | null;
	categories: PopupCategory[];
	regions: Region[];
	activities: Activity[];
	/** 최대 200자. 빈 문자열이 기본 */
	freeText: string;
}

// features/onboarding/model/answers.ts
/** 모든 필드가 빈 값인 OnboardingAnswers */
const EMPTY_ANSWERS: OnboardingAnswers;
/** 여섯 필드 중 하나라도 EMPTY_ANSWERS와 다르면 true. freeText는 공백을 지우고 본다 */
function hasAnySignal(answers: OnboardingAnswers): boolean;
```

`Region`과 `PopupCategory`는 `shared/model/region.ts`와 `shared/model/popup.ts`에 있다. 값은 `seongsu`와 `character`처럼 소문자이고 라벨 대응표가 같은 파일에 있다. 단계별 zod 스키마는 위 타입을 그대로 좁힌 것이고 `freeText`에 `max(200)`이 붙는다.

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
export function useSavePreferences(): UseMutationResult<null, ApiError, OnboardingAnswers>;
```

**서버 API.** 백엔드 요구다. 추천 미리보기 API는 화면 존치가 정해진 뒤 그 문서가 갖는다.

| 메서드와 경로                | 인증 | 요청                | 응답   |
| ---------------------------- | ---- | ------------------- | ------ |
| `PUT /api/v1/me/preferences` | 필요 | `OnboardingAnswers` | `null` |

**로그.** `[onboarding]` 접두사. 취향 저장 실패와 재시도 결과.

**접근성.** 단일 선택 묶음은 라디오, 다중 선택 묶음은 `<button aria-pressed>`다. 묶음마다 `<fieldset>`과 `<legend>`가 질문 문구를 담는다. 글자 수 카운터는 `aria-live="polite"`이고 상한에 닿으면 문구가 바뀐다.

## O. Optimization과 운영

**렌더링.** 단계 화면은 정적이라 서버 컴포넌트로 껍데기를 그리고 폼만 클라이언트다.

**장애.** 취향 저장 실패는 화면 안 `ErrorState`이고 다시 시도가 `mutate`를 부른다. 저장될 때까지 스토어의 답을 비우지 않는다. 조용히 넘기지 않는다.

**재시도와 몰림.** 취향 저장은 마지막 단계에서 한 번이다. 네트워크 오류만 자동 재시도한다.

**지표.** 취향 저장 실패 횟수를 센다.

**운영.** 랜딩 노출 조건이 "최초 1회"로 정해지면 `proxy.ts`가 `pp_onboarded` 쿠키를 보고 `/`를 `/home`으로 보낸다. "매번"이면 그 조건을 두지 않는다. 쿠키는 `markCompleted`가 `document.cookie`로 쓰고 값은 날짜 문자열이다.
