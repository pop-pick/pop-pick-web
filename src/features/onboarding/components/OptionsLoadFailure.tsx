import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/shared/ui/Button";

import { OPTIONS_LOAD_FAILURE_DESCRIPTION, OPTIONS_LOAD_FAILURE_TITLE } from "../model/messages";

interface OptionsLoadFailureProps {
	isRetrying: boolean;
	onRetry: () => void;
}

/** disabled로 막으면 누른 버튼이 포커스를 잃어 body로 빠진다. aria-disabled로 두고 누름을 무시한다 */
export function OptionsLoadFailure({ isRetrying, onRetry }: OptionsLoadFailureProps) {
	const handleRetryClick = () => {
		if (!isRetrying) {
			onRetry();
		}
	};

	return (
		<div role="alert" className="flex flex-1 items-center justify-center px-5 py-10">
			<EmptyState
				hasWarningIcon
				title={OPTIONS_LOAD_FAILURE_TITLE}
				description={OPTIONS_LOAD_FAILURE_DESCRIPTION}
				action={
					<Button
						variant="secondary"
						aria-disabled={isRetrying}
						onClick={handleRetryClick}
						className="aria-disabled:opacity-40"
					>
						다시 시도
					</Button>
				}
			/>
		</div>
	);
}
