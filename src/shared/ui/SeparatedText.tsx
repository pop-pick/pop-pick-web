import { Fragment } from "react";

interface SeparatedTextProps {
	parts: readonly string[];
}

export function SeparatedText({ parts }: SeparatedTextProps) {
	return parts.map((part, index) => (
		<Fragment key={`${String(index)}-${part}`}>
			{index > 0 && (
				<>
					<span aria-hidden className="mx-1 inline-block size-0.5 rounded-full bg-current align-middle" />
					<span className="sr-only">, </span>
				</>
			)}
			{part}
		</Fragment>
	));
}
