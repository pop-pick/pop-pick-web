import Link from "next/link";

import { SessionPanel } from "@/features/auth/ui/SessionPanel";
import { PLACEHOLDER_POPUPS } from "@/shared/lib/placeholder-data";
import { REGION_LABELS, REGIONS } from "@/shared/model/region";
import { PlaceholderBox } from "@/shared/ui/PlaceholderBox";
import { PopupCard } from "@/shared/ui/PopupCard";
import { SectionHeader } from "@/shared/ui/SectionHeader";

export default function HomePage() {
	return (
		<main className="flex flex-1 flex-col gap-8 px-5 py-6">
			<header className="flex flex-col gap-1">
				<p className="text-sm font-semibold text-blue-600">POP PICK</p>
				<h1 className="text-2xl font-bold tracking-tight">서울의 가장 트렌디한 공간을 한눈에</h1>
			</header>

			<SessionPanel next="/home" />

			<PlaceholderBox label="검색바" className="h-12" />

			<section className="flex flex-col gap-4">
				<SectionHeader title="오늘의 팝업 PICK" description="취향에 맞춰 고른 팝업이에요" moreHref="/explore" />
				<ul className="flex flex-col gap-3">
					{PLACEHOLDER_POPUPS.slice(0, 3).map((popup) => (
						<li key={popup.id}>
							<PopupCard popup={popup} shouldShowReason />
						</li>
					))}
				</ul>
			</section>

			<Link
				href="/planner/new"
				className="flex flex-col gap-1 rounded-2xl bg-blue-600 p-5 text-white focus-ring transition-colors hover:bg-blue-700"
			>
				<span className="font-bold">AI 코스 생성기</span>
				<span className="text-sm text-blue-100">취향과 동행, 시간에 맞는 하루 동선을 짜 드려요</span>
			</Link>

			<section className="flex flex-col gap-4">
				<SectionHeader title="인기 지역" />
				<ul className="flex flex-wrap gap-2">
					{REGIONS.map((region) => (
						<li key={region}>
							<Link
								href={`/explore?region=${region}`}
								className="inline-flex rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 focus-ring transition-colors hover:bg-zinc-50"
							>
								{REGION_LABELS[region]}
							</Link>
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
