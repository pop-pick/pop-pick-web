import { useRef } from "react";

/** 다시 시도가 성공하면 실패 화면이 통째로 사라져 포커스가 body로 빠진다. 새로 그려진 첫 칩 묶음으로 옮긴다 */
export function useFocusAfterRetry<T extends HTMLElement>() {
	const shouldFocusRef = useRef(false);

	const markRetry = () => {
		shouldFocusRef.current = true;
	};

	const focusTargetRef = (node: T | null) => {
		if (node !== null && shouldFocusRef.current) {
			shouldFocusRef.current = false;
			node.focus();
		}
	};

	return { markRetry, focusTargetRef };
}
