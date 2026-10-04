import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { PopupImage } from "@/shared/components/PopupImage";
import { cn } from "@/shared/lib/cn";
import { resolveRovingIndex } from "@/shared/lib/roving-index";
import { useSeoulNow } from "@/shared/lib/useSeoulNow";

test("팝업 사진을 받지 못하면 깨진 이미지 대신 카테고리 그림으로 바뀐다", () => {
	render(<PopupImage src="https://img.example/missing.jpg" alt="포스터" category="art" sizes="88px" />);

	fireEvent.error(screen.getByAltText("포스터"));

	expect(screen.queryByAltText("포스터")).not.toBeInTheDocument();
	expect(screen.getByRole("presentation", { hidden: true })).toBeInTheDocument();
});

test("팝업 사진 주소가 바뀌면 새 주소는 다시 그린다", () => {
	const { rerender } = render(<PopupImage src="https://img.example/a.jpg" alt="포스터" category={null} sizes="88px" />);

	fireEvent.error(screen.getByAltText("포스터"));
	rerender(<PopupImage src="https://img.example/b.jpg" alt="포스터" category={null} sizes="88px" />);

	expect(screen.getByAltText("포스터")).toBeInTheDocument();
});

test("등록된 출처의 팝업 사진만 최적화 주소로 받고 나머지는 원본 주소로 받는다", () => {
	const listed = "https://cdn.popga.co.kr/spot/1/main/a.webp";
	const unlisted = "https://img.example/a.jpg";
	const { rerender } = render(<PopupImage src={listed} alt="포스터" category={null} sizes="88px" />);

	expect(screen.getByAltText("포스터").getAttribute("src")).toContain("/_next/image?url=");

	rerender(<PopupImage src={unlisted} alt="포스터" category={null} sizes="88px" />);

	expect(screen.getByAltText("포스터")).toHaveAttribute("src", unlisted);

	const outsidePrefix = "https://cdn.popga.co.kr/other/a.webp";

	rerender(<PopupImage src={outsidePrefix} alt="포스터" category={null} sizes="88px" />);

	expect(screen.getByAltText("포스터")).toHaveAttribute("src", outsidePrefix);

	const insecure = "http://cdn.popga.co.kr/spot/1/a.webp";

	rerender(<PopupImage src={insecure} alt="포스터" category={null} sizes="88px" />);

	expect(screen.getByAltText("포스터")).toHaveAttribute("src", insecure);
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

test("방향키는 처음과 끝을 잇고 Home과 End는 양 끝으로 가며 다른 키는 무시한다", () => {
	expect(resolveRovingIndex("ArrowRight", 2, 3)).toBe(0);
	expect(resolveRovingIndex("ArrowLeft", 0, 3)).toBe(2);
	expect(resolveRovingIndex("Home", 1, 3)).toBe(0);
	expect(resolveRovingIndex("End", 1, 3)).toBe(2);
	expect(resolveRovingIndex("a", 1, 3)).toBeNull();
});
