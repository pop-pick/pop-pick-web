interface ImageOverlayBadgeProps {
	label: string;
}

export function ImageOverlayBadge({ label }: ImageOverlayBadgeProps) {
	return (
		<span className="rounded-sm bg-black/35 px-2 py-1 text-b2-12 text-text-w backdrop-blur-floating">{label}</span>
	);
}
