import { useId } from "react";

import { LinkButton } from "@/shared/ui/LinkButton";

import { DEFAULT_NEXT_PATH } from "../model/next-path";

interface LoginCompleteProps {
	next: string | null;
}

/** 링크가 첫 포커스를 받으므로 제목과 안내를 aria-describedby로 이어 완료 사실이 함께 읽히게 한다 */
export function LoginComplete({ next }: LoginCompleteProps) {
	const destination = next ?? DEFAULT_NEXT_PATH;
	const titleId = useId();
	const descriptionId = useId();

	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
			<div className="flex flex-col gap-2">
				<h1 id={titleId} className="text-2xl font-bold tracking-tight">
					로그인했습니다
				</h1>
				<p id={descriptionId} role="status" className="text-sm leading-relaxed text-zinc-500">
					이제 찜한 팝업과 내 일정을 쓸 수 있습니다.
				</p>
			</div>
			<LinkButton href={destination} size="lg" autoFocus aria-describedby={`${titleId} ${descriptionId}`}>
				이어서 하기
			</LinkButton>
		</main>
	);
}
