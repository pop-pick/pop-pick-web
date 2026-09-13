import { LinkButton } from "@/shared/ui/LinkButton";
import { PlaceholderBox } from "@/shared/ui/PlaceholderBox";

export default function LandingPage() {
	return (
		<main className="flex flex-1 flex-col justify-center gap-10 px-6 py-16">
			<section className="flex flex-col gap-4">
				<p className="text-sm font-semibold text-blue-600">POP PICK</p>
				<h1 className="text-3xl leading-tight font-bold tracking-tight">
					팝업을 찾지 마세요.
					<br />
					오늘 갈 곳을 PICK해 드릴게요
				</h1>
				<p className="text-base leading-relaxed text-zinc-500">
					취향과 시간, 지역에 맞는 서울 팝업을 추천하고 방문 동선까지 짜 드립니다.
				</p>
			</section>

			<PlaceholderBox label="대표 이미지" className="h-48" />

			<section className="flex flex-col gap-3">
				<LinkButton href="/onboarding/1" size="lg">
					나에게 맞는 팝업 찾기
				</LinkButton>
				<LinkButton href="/home" variant="secondary" size="lg">
					둘러보기
				</LinkButton>
			</section>
		</main>
	);
}
