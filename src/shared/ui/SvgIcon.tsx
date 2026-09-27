import type { ComponentProps, ComponentType } from "react";

export type IconSize = 16 | 20 | 24 | 32;

interface SvgIconProps extends Omit<
	ComponentProps<"svg">,
	"width" | "height" | "children" | "role" | "aria-label" | "aria-hidden"
> {
	icon: ComponentType<ComponentProps<"svg">>;
	size?: IconSize;
	label?: string;
}

export function SvgIcon({ icon: Icon, size, label, ...props }: SvgIconProps) {
	const accessibilityProps = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
	const sizeProps = size ? { width: size, height: size } : {};

	return <Icon focusable="false" {...sizeProps} {...accessibilityProps} {...props} />;
}
