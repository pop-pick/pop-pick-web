declare module "@/shared/assets/icons/*.svg" {
	import type { ComponentType, SVGProps } from "react";

	const SvgComponent: ComponentType<SVGProps<SVGSVGElement>>;
	export default SvgComponent;
}
