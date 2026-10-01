import { animate, useMotionValue } from "motion/react";
import { type PointerEvent, useRef } from "react";

const CLOSE_DISTANCE_PX = 80;

/** `MotionProvider`가 drag 기능을 싣지 않아 포인터 이벤트로 직접 옮긴다 */
export function useDragToClose(onClose: () => void) {
	const offsetY = useMotionValue(0);
	const startYRef = useRef<number | null>(null);

	const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
		startYRef.current = event.clientY;
		event.currentTarget.setPointerCapture(event.pointerId);
	};

	const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
		if (startYRef.current === null) {
			return;
		}

		offsetY.set(Math.max(0, event.clientY - startYRef.current));
	};

	const handlePointerEnd = () => {
		if (startYRef.current === null) {
			return;
		}

		startYRef.current = null;

		if (offsetY.get() > CLOSE_DISTANCE_PX) {
			onClose();
			return;
		}

		void animate(offsetY, 0);
	};

	return {
		offsetY,
		dragHandleProps: {
			onPointerDown: handlePointerDown,
			onPointerMove: handlePointerMove,
			onPointerUp: handlePointerEnd,
			onPointerCancel: handlePointerEnd
		}
	};
}
