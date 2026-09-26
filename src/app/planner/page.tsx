import { RequireAuth } from "@/features/auth/ui/RequireAuth";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LinkButton } from "@/shared/ui/LinkButton";
import { SectionHeader } from "@/shared/ui/SectionHeader";

export default function PlannerPage() {
	return (
		<main className="flex flex-1 flex-col gap-8 px-5 py-6">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold tracking-tight">내 일정</h1>
				<p className="text-sm text-zinc-500">AI가 짠 하루 동선을 모아 봅니다.</p>
			</header>

			<RequireAuth next="/planner">
				<section className="flex flex-col gap-4">
					<SectionHeader title="다가오는 일정" />
					<EmptyState
						title="아직 만든 코스가 없어요"
						description="가고 싶은 지역과 날짜를 고르면 AI가 동선을 짜 줍니다"
						action={<LinkButton href="/planner/new">코스 만들기</LinkButton>}
					/>
				</section>
			</RequireAuth>
		</main>
	);
}
