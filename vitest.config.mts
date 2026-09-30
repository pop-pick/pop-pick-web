import { defineConfig, type Plugin } from "vitest/config";

const SVG_ICON_PATTERN = /\/src\/shared\/assets\/icons\/[^/]+\.svg$/;

function svgIconStub(): Plugin {
	return {
		name: "svg-icon-stub",
		enforce: "pre",
		load(id) {
			if (!SVG_ICON_PATTERN.test(id)) {
				return null;
			}

			return 'import { createElement } from "react"; export default function SvgIcon(props) { return createElement("svg", props); }';
		}
	};
}

export default defineConfig({
	plugins: [svgIconStub()],
	resolve: { tsconfigPaths: true },
	test: {
		environment: "jsdom",
		env: { TZ: "UTC" },
		include: ["tests/**/*.test.{ts,tsx}"],
		setupFiles: ["./tests/setup.ts"]
	}
});
