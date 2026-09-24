import { RequireAuth } from "@/features/auth/ui/RequireAuth";
import { SessionPanel } from "@/features/auth/ui/SessionPanel";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LinkButton } from "@/shared/ui/LinkButton";
import { SectionHeader } from "@/shared/ui/SectionHeader";

export default function MyPage() {
	return (
		<main className="flex flex-1 flex-col gap-8 px-5 py-6">
			<header className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold tracking-tight">마이페이지</h1>
				<p className="text-sm text-zinc-500">찜한 팝업과 최근 본 팝업을 모아 봅니다.</p>
			</header>

			<RequireAuth next="/my">
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
					<SectionHeader title="최근 본 팝업" />
					<EmptyState title="아직 본 팝업이 없어요" description="팝업 상세를 열면 최근 다섯 개가 여기 남습니다" />
				</section>
			</RequireAuth>
		</main>
	);
}
