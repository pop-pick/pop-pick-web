import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { PopupImage } from "@/shared/components/PopupImage";
import { cn } from "@/shared/lib/cn";
import { useSeoulNow } from "@/shared/lib/useSeoulNow";

test("팝업 사진을 받지 못하면 깨진 이미지 대신 카테고리 그림으로 바뀐다", () => {
	render(<PopupImage src="https://img.example/missing.jpg" alt="포스터" category="art" sizes="88px" />);

	fireEvent.error(screen.getByAltText("포스터"));

	expect(screen.queryByAltText("포스터")).not.toBeInTheDocument();
	expect(document.querySelector("[aria-hidden] img")).toBeInTheDocument();
});

test("팝업 사진 주소가 바뀌면 새 주소는 다시 그린다", () => {
	const { rerender } = render(<PopupImage src="https://img.example/a.jpg" alt="포스터" category={null} sizes="88px" />);

	fireEvent.error(screen.getByAltText("포스터"));
	rerender(<PopupImage src="https://img.example/b.jpg" alt="포스터" category={null} sizes="88px" />);

	expect(screen.getByAltText("포스터")).toBeInTheDocument();
});

test("rounded-panel 같은 저장소 반경 토큰은 다른 rounded 클래스와 합칠 때 뒤의 것이 남는다", () => {
	expect(cn("rounded-xl", "rounded-panel")).toBe("rounded-panel");
});

test("같은 분 안에서 다시 그려도 지금 시각 객체가 같다", () => {
	const { result, rerender } = renderHook(() => useSeoulNow());
	const first = result.current;

	rerender();

	expect(result.current).toBe(first);
});
