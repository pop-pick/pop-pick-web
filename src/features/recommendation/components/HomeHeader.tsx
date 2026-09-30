import Image from "next/image";

import { HomeSearch } from "./HomeSearch";

const LOGO_WIDTH = 151;
const LOGO_HEIGHT = 26;

export function HomeHeader() {
	return (
		<header className="flex flex-col gap-6 px-5 pt-8 pb-5">
			<h1>
				<Image src="/brand/logo.svg" alt="POP PICK" width={LOGO_WIDTH} height={LOGO_HEIGHT} loading="eager" />
			</h1>
			<HomeSearch />
		</header>
	);
}
