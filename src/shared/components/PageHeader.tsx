import { tv } from "@/shared/lib/tv";

import { BackButton } from "./BackButton";

const pageHeaderVariants = tv({
	base: "flex h-20 items-end px-5 pb-5",
	variants: {
		isSticky: {
			true: "sticky top-0 z-40 bg-bg-1"
		}
	}
});

interface PageHeaderProps {
	title: string;
	fallbackPath: string;
	isSticky?: boolean;
}

export function PageHeader({ title, fallbackPath, isSticky = false }: PageHeaderProps) {
	return (
		<header className={pageHeaderVariants({ isSticky })}>
			<div className="flex w-full items-center gap-4">
				<BackButton fallbackPath={fallbackPath} />
				<p className="min-w-0 flex-1 truncate text-center text-h3 text-text-1">{title}</p>
				<span aria-hidden className="size-6 shrink-0" />
			</div>
		</header>
	);
}
