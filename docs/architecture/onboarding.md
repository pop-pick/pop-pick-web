# 온보딩과 추천 미리보기 설계

`features/onboarding`. 랜딩, 온보딩 세 단계, 답의 임시 보관, 로그인 전 추천 미리보기, 로그인 뒤 서버 전송을 다룬다. 진입 순서는 랜딩, 온보딩, 미리보기, 로그인이다(9/10 IA).

## R. Requirements

**기능.** 랜딩에서 "나에게 맞는 팝업 찾기"로 온보딩에 들어간다. 1단계에서 동행 유형과 인원수, 2단계에서 관심 카테고리와 자주 가는 지역, 3단계에서 선호 활동과 자유 입력(200자)을 받는다. 1단계와 2단계는 건너뛸 수 있다. 3단계의 "추천받기"를 누르면 미리보기가 카테고리별 취향 스코어와 예시 팝업 셋을 보이고 "POP PICK 시작하기"가 로그인으로 보낸다. 랜딩의 "둘러보기"는 온보딩 없이 비회원 홈으로 간다.

**보장.**

- 단계를 오가거나 새로고침해도 입력한 답이 남는다. 카카오와 구글 인가 화면을 거쳐 돌아와도 남는다
- 단계 이동은 서버를 부르지 않아 즉시다
- "추천받기"는 세 단계를 합쳐 선택이나 입력이 하나라도 있을 때만 활성이다. 전부 비면 비활성이고 이유 문구가 보인다. 취향 없이 미리보기에 도달하는 경로가 없다(D54)
- 자유 입력은 200자를 넘지 않는다. 남은 글자 수가 실시간으로 보인다
- "추천받기"를 누른 뒤 미리보기의 첫 스코어가 그려지기까지 p75 3초 이하다. 서버가 계산한다
- 로그인이 끝나면 답이 서버에 한 번 저장되고 로컬에서 지워진다. 저장 실패 시 로컬을 지우지 않고 다음 앱 시작 때 다시 보낸다

**설계를 가르는 질문.**

- 답의 원천은 로그인 전에는 로컬이고 로그인 뒤에는 서버다. 옮기는 시점이 콜백 성공 직후 한 곳이다
- 미리보기는 클라이언트가 답을 보내고 서버가 답한다. 인증 없는 공개 엔드포인트다. 스코어의 축과 산출은 서버 몫이고 FE는 받은 축을 받은 순서대로 그린다(D56)
- 실패는 미리보기 화면 안에 드러낸다. 다시 시도와 "로그인하고 홈에서 보기" 둘을 준다. 답은 잃지 않는다

**범위 밖.** 온보딩 답 수정 화면, 성별 항목(피그마에서 빠짐), 마이페이지의 취향 편집.

## A. Architecture

| 상태             | 원천                                                 | 비고                                                |
| ---------------- | ---------------------------------------------------- | --------------------------------------------------- |
| 온보딩 답        | Zustand persist(`localStorage`)                      | 키 `pop-pick-onboarding`. 서버 저장 뒤 지운다       |
| 온보딩 완료 여부 | 같은 스토어와 쿠키 `pp_onboarded`                    | 쿠키는 `proxy.ts`가 랜딩 노출을 판단할 때 쓴다(D44) |
| 현재 단계        | URL `/onboarding/[step]`                             | 뒤로가기가 이전 단계다                              |
| 미리보기 결과    | Server. `queryKeys.recommendations.preview(answers)` | 답이 키라 답이 바뀌면 다른 캐시                     |
| 입력 중인 폼 값  | react-hook-form                                      | 단계를 떠날 때 스토어에 쓴다                        |

통신은 요청 응답 둘이다. 미리보기(비인증)와 취향 저장(인증).

**흐름.**

```
/                         나에게 맞는 팝업 찾기       /onboarding/1
/onboarding/1  다음, 건너뛰기                         /onboarding/2
/onboarding/2  다음, 건너뛰기                         /onboarding/3
/onboarding/3  추천받기(신호 하나 이상)               /onboarding/result   POST preview
/onboarding/result  POP PICK 시작하기                 /login?next=/home
콜백 성공      스토어에 답이 있으면 PUT preferences    성공하면 답 삭제, /home
/              둘러보기                               /home (비회원 홈)
```

단계 화면은 스토어의 답을 폼 기본값으로 읽고 "다음"이나 "건너뛰기"에서 폼 값을 스토어에 쓴다. 건너뛰기는 그 단계의 값을 비운 채 다음으로 간다. 3단계 폼은 스토어 전체를 읽어 신호가 있는지 계산한다.

콜백에서 취향 저장이 실패하면 답을 지우지 않는다. `AuthProvider`가 로그인 상태이고 스토어에 답이 남아 있으면 앱 시작 때 저장을 다시 시도한다. 사용자는 홈에서 아무것도 하지 않아도 된다.

## D. Data Model

```typescript
// shared/types/region.ts
export type Region = "SEONGSU" | "YEOUIDO" | "HONGDAE" | "SINCHON" | "YONGSAN";
export const REGIONS: readonly Region[] = ["SEONGSU", "YEOUIDO", "HONGDAE", "SINCHON", "YONGSAN"];
export const REGION_LABEL: Record<Region, string> = {
	SEONGSU: "성수",
	YEOUIDO: "여의도",
	HONGDAE: "홍대",
	SINCHON: "신촌",
	YONGSAN: "용산"
};

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

const EMPTY_ANSWERS: OnboardingAnswers = {
	companionType: null,
	partySize: null,
	categories: [],
	regions: [],
	activities: [],
	freeText: ""
};

function hasAnySignal(answers: OnboardingAnswers) {
	return (
		answers.companionType !== null ||
		answers.partySize !== null ||
		answers.categories.length > 0 ||
		answers.regions.length > 0 ||
		answers.activities.length > 0 ||
		answers.freeText.trim().length > 0
	);
}

// features/onboarding/model/preview.ts. 백엔드 요구
interface PreviewScore {
	/** 축 이름은 서버가 정한다(D56). FE는 받은 순서대로 그린다 */
	axis: string;
	label: string;
	/** 1에서 5 */
	stars: 1 | 2 | 3 | 4 | 5;
	/** 0에서 100 */
	matchPercent: number;
}

interface PreviewResult {
	scores: PreviewScore[];
	samples: RecommendedPopup[];
}
```

`PopupCategory`는 `shared/types/popup.ts`에 있고 `RecommendedPopup`은 `recommendation.md`에 있다. 단계별 zod 스키마는 위 타입을 그대로 좁힌 것이고 `freeText`에 `max(200)`이 붙는다.

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
export function PreviewResultView();

export function useOnboardingStore(): {
	answers: OnboardingAnswers;
	completedAt: string | null;
	setStep: (step: 1 | 2 | 3, patch: Partial<OnboardingAnswers>) => void;
	markCompleted: () => void;
	clearAnswers: () => void;
};
export function usePreview(answers: OnboardingAnswers): UseQueryResult<PreviewResult, ApiError>;
export function useSavePreferences(): UseMutationResult<null, ApiError, OnboardingAnswers>;
```

**서버 API.** 둘 다 백엔드 요구다.

| 메서드와 경로                          | 인증 | 요청                | 응답            |
| -------------------------------------- | ---- | ------------------- | --------------- |
| `POST /api/v1/recommendations/preview` | 없음 | `OnboardingAnswers` | `PreviewResult` |
| `PUT /api/v1/me/preferences`           | 필요 | `OnboardingAnswers` | `null`          |

미리보기는 `POST`지만 읽기다. 답이 바디에 실리는 조회라 `useQuery`로 다루고 키에 답을 넣는다. 재시도는 기본을 따른다.

**로그.** `[onboarding]` 접두사. 미리보기 실패, 취향 저장 실패와 재시도 결과.

**접근성.** 단일 선택 묶음은 `role="radiogroup"`과 `role="radio"`, 다중 선택 묶음은 `<button aria-pressed>`다. 묶음마다 `<fieldset>`과 `<legend>`가 질문 문구를 담는다. 진행 표시는 `role="progressbar"`에 `aria-valuenow`와 `aria-valuemax`다. 글자 수 카운터는 `aria-live="polite"`이고 상한에 닿으면 문구가 바뀐다. 비활성 추천받기 버튼의 이유 문구는 `aria-describedby`로 버튼에 묶는다. 미리보기 스코어의 별은 장식이고 `matchPercent`가 텍스트로 함께 있다.

## O. Optimization과 운영

**렌더링.** 단계 화면은 정적이라 서버 컴포넌트로 껍데기를 그리고 폼만 클라이언트다. 미리보기는 스켈레톤 셋(스코어 넷, 카드 셋, 버튼)을 먼저 그린다.

**장애.** 미리보기 실패는 화면 안 `ErrorState`다. 다시 시도가 `refetch`를 부르고 "로그인하고 홈에서 보기"가 `/login?next=/home`으로 간다. 답은 스토어에 그대로다. `localStorage`가 막힌 환경(사생활 모드 일부)이면 persist가 메모리로만 동작하고 새로고침 때 답이 사라진다. 이 경우를 감지해 3단계에 "이 브라우저는 입력을 저장하지 못합니다" 안내를 보인다. 조용히 넘기지 않는다.

**재시도와 몰림.** 취향 저장은 콜백에서 한 번, 앱 시작 때 한 번이다. 네트워크 오류만 자동 재시도한다.

**지표.** 체감 지표는 "추천받기부터 첫 스코어까지"다. 시스템 지표는 취향 저장 실패 횟수와 스토어에 답이 남은 채 로그인 상태인 세션 수다. 둘째가 0이 아니면 재전송이 돌지 않는 것이다.

**운영.** 랜딩 노출 조건(D44)이 "최초 1회"로 정해지면 `proxy.ts`가 `pp_onboarded` 쿠키를 보고 `/`를 `/home`으로 보낸다. "매번"이면 그 조건을 두지 않는다. 쿠키는 `markCompleted`가 `document.cookie`로 쓰고 값은 날짜 문자열이다.
