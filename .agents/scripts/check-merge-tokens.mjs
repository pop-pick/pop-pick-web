import { existsSync, readdirSync, readFileSync } from "node:fs";

const THEME_DIR = "src/shared/styles/tokens";
const MERGE_FILE = "src/shared/lib/cn.ts";

if (existsSync(THEME_DIR) && existsSync(MERGE_FILE)) {
	const theme = readdirSync(THEME_DIR)
		.filter((file) => file.endsWith(".css"))
		.map((file) => readFileSync(`${THEME_DIR}/${file}`, "utf8"))
		.join("\n");
	const merge = readFileSync(MERGE_FILE, "utf8");

	const readThemeNames = (prefix) =>
		[...theme.matchAll(new RegExp(`^\\s*--${prefix}-([a-z0-9-]+?):`, "gm"))]
			.map(([, name]) => name)
			.filter((name) => !name.includes("--"));

	const readMergeNames = (constName) => {
		const match = merge.match(new RegExp(`const ${constName} = \\[([^\\]]*)\\]`));
		return match ? [...match[1].matchAll(/"([^"]+)"/g)].map(([, name]) => name) : null;
	};

	const groups = [
		{ constName: "TEXT_SIZE_TOKENS", themeNames: readThemeNames("text").filter((name) => !name.startsWith("shadow-")) },
		{ constName: "SHADOW_TOKENS", themeNames: readThemeNames("shadow") },
		{ constName: "TEXT_SHADOW_TOKENS", themeNames: readThemeNames("text-shadow") }
	];

	for (const { constName, themeNames } of groups) {
		const mergeNames = readMergeNames(constName);

		if (!mergeNames) {
			console.log(`${MERGE_FILE}: ${constName} 목록이 없다`);
			continue;
		}

		for (const name of themeNames.filter((themeName) => !mergeNames.includes(themeName))) {
			console.log(`${MERGE_FILE}: ${constName}에 ${name}이 없다 (${THEME_DIR}에는 있다)`);
		}

		for (const name of mergeNames.filter((mergeName) => !themeNames.includes(mergeName))) {
			console.log(`${MERGE_FILE}: ${constName}의 ${name}이 ${THEME_DIR}에 없다`);
		}
	}
}
