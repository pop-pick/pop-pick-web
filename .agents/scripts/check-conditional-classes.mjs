#!/usr/bin/env node
// cn() 인자 안에서 조건으로 클래스를 고르는 자리를 찾는다. 모양이 값에 따라 갈리면 aria 변형이나 @/shared/lib/tv 레시피로 옮긴다

import fs from "node:fs";
import path from "node:path";

const root = process.argv[2] ?? "src";
const CONDITION = /&&|\|\||\?/;
const STRING_LITERAL = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g;
const NON_CONDITION_OPERATORS = /\?\.|\?\?/g;

function listFiles(dir) {
	if (!fs.existsSync(dir)) {
		return [];
	}
	return fs
		.readdirSync(dir, { withFileTypes: true, recursive: true })
		.filter((entry) => entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts"))
		.map((entry) => path.join(entry.parentPath, entry.name));
}

function readCallArguments(source, openIndex) {
	let depth = 0;
	let quote = null;
	for (let i = openIndex; i < source.length; i += 1) {
		const ch = source[i];
		if (quote !== null) {
			if (ch === "\\") {
				i += 1;
			} else if (ch === quote) {
				quote = null;
			}
			continue;
		}
		if (ch === '"' || ch === "'" || ch === "`") {
			quote = ch;
		} else if (ch === "(") {
			depth += 1;
		} else if (ch === ")") {
			depth -= 1;
			if (depth === 0) {
				return source.slice(openIndex + 1, i);
			}
		}
	}
	return "";
}

for (const file of listFiles(root)) {
	const source = fs.readFileSync(file, "utf8");
	for (const match of source.matchAll(/\bcn\(/g)) {
		const args = readCallArguments(source, match.index + 2)
			.replace(STRING_LITERAL, '""')
			.replace(NON_CONDITION_OPERATORS, "");
		if (CONDITION.test(args)) {
			const line = source.slice(0, match.index).split("\n").length;
			console.log(`${file}:${String(line)}: cn() 안에서 조건으로 클래스를 고른다`);
		}
	}
}
