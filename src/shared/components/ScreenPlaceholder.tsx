interface ScreenPlaceholderProps {
	title: string;
	description: string;
}

export function ScreenPlaceholder({ title, description }: ScreenPlaceholderProps) {
	return (
		<main className="flex flex-1 flex-col justify-center gap-3 px-6 py-16">
			<h1 className="text-xl font-bold tracking-tight">{title}</h1>
			<p className="text-sm leading-relaxed text-zinc-500">{description}</p>
			<p className="text-xs text-zinc-400">아직 만들지 않은 화면입니다.</p>
		</main>
	);
}
