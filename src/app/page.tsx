import { Button } from "@/shared/ui/Button";

export default function Home() {
	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-12 px-6 py-16">
			<section className="flex flex-col gap-4">
				<p className="text-sm font-semibold text-blue-600">POP PICK</p>
				<h1 className="text-3xl leading-tight font-bold tracking-tight">
					이번 주말,
					<br />
					어디 갈지 정해 드릴게요
				</h1>
				<p className="text-base leading-relaxed text-zinc-500">
					취향과 시간, 지역에 맞는 서울 팝업을 추천하고 방문 동선까지 짜 드립니다.
				</p>
			</section>
			<section className="flex flex-col gap-3">
				<Button size="lg" disabled>
					팝업 코스 만들기
				</Button>
				<Button variant="secondary" size="lg" disabled>
					지도에서 둘러보기
				</Button>
				<p className="text-center text-sm text-zinc-400">지금 만들고 있어요. 2026년 10월 4일에 열립니다.</p>
			</section>
		</main>
	);
}
