import { PopupMap } from "@/features/popup/ui/PopupMap";
import { PLACEHOLDER_POPUPS } from "@/shared/lib/placeholder-data";
import { isRegion } from "@/shared/model/region";

export default async function ExplorePage({ searchParams }: PageProps<"/explore">) {
	const { region: regionParam } = await searchParams;
	const region = typeof regionParam === "string" && isRegion(regionParam) ? regionParam : null;
	const popups = region === null ? PLACEHOLDER_POPUPS : PLACEHOLDER_POPUPS.filter((popup) => popup.region === region);

	return (
		<main className="flex flex-1 flex-col">
			<header className="flex flex-col gap-1 px-5 py-4">
				<h1 className="text-2xl font-bold tracking-tight">탐색</h1>
			</header>
			<PopupMap popups={popups} region={region} />
		</main>
	);
}
