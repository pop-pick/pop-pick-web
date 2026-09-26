import type { PopupCardItem } from "@/shared/model/popup";
import { type Region, REGION_LABELS } from "@/shared/model/region";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LinkButton } from "@/shared/ui/LinkButton";
import { PopupCard } from "@/shared/ui/PopupCard";

interface PopupListProps {
	popups: readonly PopupCardItem[];
	region: Region | null;
}

export function PopupList({ popups, region }: PopupListProps) {
	if (popups.length === 0) {
		return (
			<div className="px-5 py-4">
				<EmptyState
					title={region === null ? "보여줄 팝업이 없어요" : `${REGION_LABELS[region]}에 진행 중인 팝업이 없어요`}
					description={region === null ? "잠시 뒤 다시 확인해 주세요" : "다른 지역의 팝업을 둘러보세요"}
					action={region === null ? undefined : <LinkButton href="/explore?view=list">전체 보기</LinkButton>}
				/>
			</div>
		);
	}

	return (
		<ul aria-label="팝업 목록" className="flex flex-col gap-3 px-5 pb-6">
			{popups.map((popup) => (
				<li key={popup.id}>
					<PopupCard popup={popup} />
				</li>
			))}
		</ul>
	);
}
