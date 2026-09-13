interface ScreenPlaceholderProps {
	title: string;
	description: string;
}

/** 화면 뼈대만 잡아 둔 자리다. 그 화면을 만들 때 이 컴포넌트를 걷어낸다 */
export function ScreenPlaceholder({ title, description }: ScreenPlaceholderProps) {
	return (
		<main className="flex flex-1 flex-col justify-center gap-3 px-6 py-16">
			<h1 className="text-xl font-bold tracking-tight">{title}</h1>
			<p className="text-sm leading-relaxed text-zinc-500">{description}</p>
			<p className="text-xs text-zinc-400">아직 만들지 않은 화면입니다.</p>
		</main>
	);
}
