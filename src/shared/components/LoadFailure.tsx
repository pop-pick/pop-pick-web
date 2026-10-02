import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/shared/ui/Button";

interface LoadFailureProps {
	title: string;
	className?: string;
	onRetry: () => void;
}

export function LoadFailure({ title, className, onRetry }: LoadFailureProps) {
	return (
		<EmptyState
			hasWarningIcon
			title={title}
			description="잠시 뒤 다시 시도해 주세요."
			className={className}
			action={
				<Button variant="secondary" onClick={onRetry}>
					다시 시도
				</Button>
			}
		/>
	);
}
