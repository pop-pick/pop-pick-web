import type { useDragToClose } from "../hooks/useDragToClose";

interface DragHandleProps {
	dragHandleProps: ReturnType<typeof useDragToClose>["dragHandleProps"];
}

export function DragHandle({ dragHandleProps }: DragHandleProps) {
	return (
		<div aria-hidden {...dragHandleProps} className="flex shrink-0 cursor-grab touch-none justify-center pt-3.5 pb-4.5">
			<span className="h-1 w-10.25 rounded-full bg-divider-3" />
		</div>
	);
}
