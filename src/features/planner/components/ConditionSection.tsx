import type { ReactNode } from "react";

interface ConditionSectionProps {
	titleId: string;
	title: string;
	trailing?: ReactNode;
	children: ReactNode;
}

export function ConditionSection({ titleId, title, trailing, children }: ConditionSectionProps) {
	return (
		<section aria-labelledby={titleId} className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h2 id={titleId} className="text-b1-14 text-text-2">
					{title}
				</h2>
				{trailing}
			</div>
			{children}
		</section>
	);
}
