import mockRouter from "next-router-mock";
import type { AnchorHTMLAttributes, MouseEvent } from "react";

interface TestLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
	href: string;
	replace?: boolean;
}

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
	return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export default function TestLink({ href, replace, onClick, ...props }: TestLinkProps) {
	const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
		onClick?.(event);

		if (event.defaultPrevented || isModifiedClick(event) || props.target === "_blank") {
			return;
		}

		event.preventDefault();
		void (replace ? mockRouter.replace(href) : mockRouter.push(href));
	};

	return <a href={href} onClick={handleClick} {...props} />;
}
