import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/shared/ui/Button";

interface CourseLoadFailureProps {
	title: string;
	onRetry: () => void;
}

export function CourseLoadFailure({ title, onRetry }: CourseLoadFailureProps) {
	return (
		<EmptyState
			hasWarningIcon
			title={title}
			description="잠시 뒤 다시 시도해 주세요."
			action={
				<Button variant="secondary" onClick={onRetry}>
					다시 시도
				</Button>
			}
		/>
	);
}
