import type { ReactNode } from "react";

import { ListRow } from "@/shared/ui/ListRow";

interface MyPageMenuProps {
	logoutItem: ReactNode;
}

const PREPARING_LABEL = "준비 중";

export function MyPageMenu({ logoutItem }: MyPageMenuProps) {
	return (
		<ul aria-label="계정과 안내" className="mt-auto -mb-tab-bar-space flex flex-col bg-bg-2 pt-2.5 pb-tab-bar-space">
			<li>{logoutItem}</li>
			<li>
				<ListRow label="FAQ (자주 묻는 질문)" disabledReason={PREPARING_LABEL} />
			</li>
			<li>
				<ListRow label="이용약관 및 개인정보처리방침" disabledReason={PREPARING_LABEL} />
			</li>
		</ul>
	);
}
