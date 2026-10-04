import { ONBOARDING_FIRST_STEP_PATH } from "@/shared/model/onboarding-path";
import { LinkButton } from "@/shared/ui/LinkButton";

import { SAVE_FAILURE_MESSAGE, SAVE_REJECTED_MESSAGE, SAVE_REJECTED_NO_COMPANION_MESSAGE } from "../model/messages";
import { isSaveRejected } from "../model/save-rejection";

const HOME_PATH = "/";

interface SaveFailureNoticeProps {
	error: unknown;
	isRetrying: boolean;
	hasCompanionAnswers: boolean;
	onRetry: () => void;
}

/** 거절된 요청은 다시 보내도 같은 답이 와서 다시 시도 대신 빠져나갈 길을 준다 */
export function SaveFailureNotice({ error, isRetrying, hasCompanionAnswers, onRetry }: SaveFailureNoticeProps) {
	if (isSaveRejected(error)) {
		return (
			<div role="alert" className="flex flex-col gap-3 rounded-xl bg-error-bg px-4 py-3 text-b3-14 text-error">
				<p className="break-keep">{hasCompanionAnswers ? SAVE_REJECTED_MESSAGE : SAVE_REJECTED_NO_COMPANION_MESSAGE}</p>
				<div className="flex gap-2">
					{!hasCompanionAnswers && (
						<LinkButton href={ONBOARDING_FIRST_STEP_PATH} variant="secondary" size="sm" className="flex-1">
							1단계로
						</LinkButton>
					)}
					<LinkButton href={HOME_PATH} variant="secondary" size="sm" className="flex-1">
						홈으로
					</LinkButton>
				</div>
			</div>
		);
	}

	return (
		<div
			role="alert"
			className="flex items-center justify-between gap-3 rounded-xl bg-error-bg px-4 py-3 text-b3-14 text-error"
		>
			<p>{SAVE_FAILURE_MESSAGE}</p>
			<button
				type="button"
				aria-disabled={isRetrying}
				onClick={onRetry}
				className="shrink-0 rounded-lg px-2 py-1 text-b1-14 underline focus-ring transition-colors not-aria-disabled:hover:bg-error/10 aria-disabled:opacity-40"
			>
				다시 시도
			</button>
		</div>
	);
}
