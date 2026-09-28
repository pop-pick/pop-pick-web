import Image from "next/image";
import Link from "next/link";

import SearchIcon from "@/shared/assets/icons/search.svg";
import { buildExploreListPath } from "@/shared/model/explore-state";
import { SvgIcon } from "@/shared/ui/SvgIcon";

const LOGO_WIDTH = 150;
const LOGO_HEIGHT = 27;

export function HomeHeader() {
	return (
		<header className="flex items-center justify-between px-5 pt-7.5 pb-8.25">
			<h1>
				<Image src="/brand/logo.svg" alt="POP PICK" width={LOGO_WIDTH} height={LOGO_HEIGHT} loading="eager" />
			</h1>
			<Link
				href={buildExploreListPath()}
				aria-label="팝업 검색"
				className="rounded-sm text-icon focus-ring transition-opacity hover:opacity-70"
			>
				<SvgIcon icon={SearchIcon} size={24} />
			</Link>
		</header>
	);
}
