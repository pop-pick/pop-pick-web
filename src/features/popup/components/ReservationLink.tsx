interface ReservationLinkProps {
	href: string;
}

export function ReservationLink({ href }: ReservationLinkProps) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="flex h-12 flex-1 items-center justify-center rounded-xl bg-primary text-h4 text-text-w focus-ring transition-colors hover:bg-primary-strong"
		>
			예약 사이트로 이동
			<span className="sr-only">(새 창)</span>
		</a>
	);
}
