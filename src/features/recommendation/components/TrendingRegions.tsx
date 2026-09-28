import Link from "next/link";

import { buildExploreListPath } from "@/shared/model/explore-state";
import { type Region, REGION_LABELS } from "@/shared/model/region";

interface TrendingRegionsProps {
	regions: Region[];
}

export function TrendingRegions({ regions }: TrendingRegionsProps) {
	return (
		<section aria-labelledby="trending-regions-title" className="flex flex-col gap-5">
			<h2 id="trending-regions-title" className="text-b1-18 text-text-1">
				지금 뜨고 있는 지역
			</h2>
			<ul className="flex flex-wrap gap-2">
				{regions.map((region) => (
					<li key={region}>
						<Link
							href={buildExploreListPath(region)}
							className="inline-flex rounded-xl border border-divider-2 bg-bg-1 px-4 py-2 text-b3-14 text-text-1 focus-ring transition-colors hover:bg-bg-2"
						>
							{REGION_LABELS[region]}
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
