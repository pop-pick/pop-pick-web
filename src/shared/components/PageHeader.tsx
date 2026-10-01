import Link from "next/link";
import type { ReactNode } from "react";

import ArrowLeftIcon from "@/shared/assets/icons/arrow-left.svg";
import { tv } from "@/shared/lib/tv";
import { iconButtonVariants } from "@/shared/ui/IconButton";
import { SvgIcon } from "@/shared/ui/SvgIcon";

import { BackButton } from "./BackButton";

const pageHeaderVariants = tv({
	base: "flex h-20 items-end px-5 pb-5",
	variants: {
		isSticky: {
			true: "sticky top-0 z-40 bg-bg-1"
		}
	}
});

interface PageHeaderBaseProps {
	title: string;
	trailing?: ReactNode;
	isSticky?: boolean;
}

interface HistoryBackPageHeaderProps extends PageHeaderBaseProps {
	fallbackPath: string;
	backHref?: never;
	backLabel?: never;
}

interface LinkBackPageHeaderProps extends PageHeaderBaseProps {
	fallbackPath?: never;
	backHref: string;
	backLabel: string;
}

type PageHeaderProps = HistoryBackPageHeaderProps | LinkBackPageHeaderProps;

export function PageHeader({ title, fallbackPath, backHref, backLabel, trailing, isSticky = false }: PageHeaderProps) {
	return (
		<header className={pageHeaderVariants({ isSticky })}>
			<div className="flex h-6 w-full items-center gap-4">
				{backHref === undefined ? (
					<BackButton fallbackPath={fallbackPath} />
				) : (
					<Link href={backHref} aria-label={backLabel} className={iconButtonVariants({ class: "-m-3" })}>
						<SvgIcon icon={ArrowLeftIcon} size={24} />
					</Link>
				)}
				<p className="min-w-0 flex-1 truncate text-center text-h3 text-text-1">{title}</p>
				{trailing ?? <span aria-hidden className="size-6 shrink-0" />}
			</div>
		</header>
	);
}
