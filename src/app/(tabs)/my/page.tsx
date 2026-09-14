import { SessionPanel } from "@/features/auth/ui/SessionPanel";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LinkButton } from "@/shared/ui/LinkButton";
import { SectionHeader } from "@/shared/ui/SectionHeader";

export default function MyPage() {
	return (
		<main className="flex flex-1 flex-col gap-8 px-5 py-6">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold tracking-tight">내 팝업</h1>
				<p className="text-sm text-zinc-500">찜한 팝업과 저장한 코스를 모아 봅니다.</p>
			</header>

			<SessionPanel next="/my" />

			<section className="flex flex-col gap-4">
				<SectionHeader title="찜한 팝업" />
				<EmptyState
					title="아직 찜한 팝업이 없어요"
					description="마음에 드는 팝업을 찜하면 여기 모입니다"
					action={<LinkButton href="/explore">팝업 둘러보기</LinkButton>}
				/>
			</section>

			<section className="flex flex-col gap-4">
				<SectionHeader title="저장한 코스" />
				<EmptyState
					title="아직 저장한 코스가 없어요"
					description="AI가 짠 하루 동선을 저장하면 여기 모입니다"
					action={<LinkButton href="/planner">코스 만들기</LinkButton>}
				/>
			</section>
		</main>
	);
}
