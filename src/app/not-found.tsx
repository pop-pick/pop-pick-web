import { LinkButton } from "@/shared/ui/LinkButton";

export default function NotFound() {
	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
			<div className="flex flex-col gap-2">
				<h1 className="text-xl font-bold tracking-tight">없는 화면이에요</h1>
				<p className="text-sm text-zinc-500">주소가 바뀌었거나 지워진 화면일 수 있어요.</p>
			</div>
			<LinkButton href="/home">홈으로 가기</LinkButton>
		</main>
	);
}
