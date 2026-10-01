import { BottomActionBar } from "@/shared/ui/BottomActionBar";
import { Button } from "@/shared/ui/Button";

interface StepActionsProps {
	onSkip: () => void;
}

export function StepActions({ onSkip }: StepActionsProps) {
	return (
		<BottomActionBar>
			<Button type="submit" size="xl" className="w-full">
				다음
			</Button>
			<Button variant="outline" size="xl" onClick={onSkip} className="w-full">
				건너뛰기
			</Button>
		</BottomActionBar>
	);
}
