import type { ComponentProps, ComponentType, ReactNode } from "react";

import { SvgIcon } from "@/shared/ui/SvgIcon";

interface PopupInfoRowProps {
	icon: ComponentType<ComponentProps<"svg">>;
	label: string;
	children: ReactNode;
}

export function PopupInfoRow({ icon, label, children }: PopupInfoRowProps) {
	return (
		<div className="flex items-start gap-2">
			<dt className="flex shrink-0 pt-0.5">
				<SvgIcon icon={icon} size={16} className="text-icon-primary" />
				<span className="sr-only">{label}</span>
			</dt>
			<dd className="text-b3-14 text-text-2">{children}</dd>
		</div>
	);
}
