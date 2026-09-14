import type { ReactNode } from "react";

interface EmptyStateProps {
	title: string;
	description?: string;
	action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center gap-3 rounded-2xl bg-zinc-50 px-6 py-12 text-center">
			<p className="text-base font-semibold text-zinc-800">{title}</p>
			{description === undefined ? null : <p className="text-sm text-zinc-500">{description}</p>}
			{action}
		</div>
	);
}
