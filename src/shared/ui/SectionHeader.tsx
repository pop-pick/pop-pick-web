import Link from "next/link";

interface SectionHeaderProps {
	title: string;
	description?: string;
	moreHref?: string;
}

export function SectionHeader({ title, description, moreHref }: SectionHeaderProps) {
	return (
		<div className="flex items-end justify-between gap-4">
			<div className="flex flex-col gap-1">
				<h2 className="text-lg font-bold tracking-tight">{title}</h2>
				{description === undefined ? null : <p className="text-sm text-zinc-500">{description}</p>}
			</div>
			{moreHref === undefined ? null : (
				<Link
					href={moreHref}
					className="shrink-0 rounded-md text-sm font-semibold text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
				>
					전체보기
				</Link>
			)}
		</div>
	);
}
