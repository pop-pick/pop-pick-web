import { BackButton } from "./BackButton";

interface PopupDetailHeaderProps {
	title: string;
}

export function PopupDetailHeader({ title }: PopupDetailHeaderProps) {
	return (
		<header className="flex h-20 items-end px-5 pb-5">
			<div className="flex w-full items-center gap-4">
				<BackButton />
				<p className="min-w-0 flex-1 truncate text-center text-h3 text-text-1">{title}</p>
				<span aria-hidden className="size-6 shrink-0" />
			</div>
		</header>
	);
}
