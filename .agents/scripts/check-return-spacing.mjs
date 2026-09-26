#!/usr/bin/env node
// 빈 줄 검사. return 을 담은 블록이 빈 줄을 빼고 3줄 이하면 return 앞에 빈 줄이 없어야 하고 넘거나 JSX 를 돌려주면 있어야 한다. 블록이 닫힌 뒤 다음 문장 앞에는 빈 줄을 둔다

import fs from "node:fs";
import path from "node:path";

const MAX_TIGHT_LINES = 3;
const CONTINUES_BLOCK = /^(\/?>|[A-Za-z][\w-]*=|\}|\)|\]|else\b|catch\b|finally\b|while\b|case\b|default\b|\.|,|<\/)/;
const root = process.argv[2] ?? "src";
const shouldFix = process.argv.includes("--fix");

function listFiles(dir) {
	if (!fs.existsSync(dir)) {
		return [];
	}
	return fs
		.readdirSync(dir, { withFileTypes: true, recursive: true })
		.filter((entry) => entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts"))
		.map((entry) => path.join(entry.parentPath, entry.name));
}

function listBraces(line) {
	const braces = [];
	let quote = null;
	for (let i = 0; i < line.length; i += 1) {
		const ch = line[i];
		if (quote !== null) {
			if (ch === "\\") {
				i += 1;
			} else if (ch === quote) {
				quote = null;
			}
			continue;
		}
		if (ch === "/" && line[i + 1] === "/") {
			break;
		}
		if (ch === '"' || ch === "'") {
			quote = ch;
		} else if (ch === "{" || ch === "}") {
			braces.push(ch);
		}
	}
	return braces;
}

function findBlocks(lines) {
	const stack = [];
	const blocks = [];
	lines.forEach((line, index) => {
		for (const brace of listBraces(line)) {
			if (brace === "{") {
				stack.push(index);
				continue;
			}
			const start = stack.pop();
			if (start !== undefined && start !== index) {
				blocks.push({ start, end: index });
			}
		}
	});
	return blocks;
}

function enclosingBlock(blocks, index) {
	return blocks
		.filter((block) => block.start < index && block.end > index)
		.reduce((inner, block) => (inner === null || block.start > inner.start ? block : inner), null);
}

function inspect(file) {
	const lines = fs.readFileSync(file, "utf8").split("\n");
	const blocks = findBlocks(lines);
	const problems = [];
	lines.forEach((line, index) => {
		if (!/^\s*return\b/.test(line)) {
			return;
		}
		const block = enclosingBlock(blocks, index);
		if (block === null) {
			return;
		}
		const body = lines.slice(block.start + 1, block.end).filter((candidate) => candidate.trim() !== "");
		const isFirstStatement =
			index === block.start + 1 || lines.slice(block.start + 1, index).every((l) => l.trim() === "");
		const hasBlankBefore = lines[index - 1].trim() === "";
		const isJsxReturn =
			/^\s*return\s*</.test(line) || (/^\s*return\s*\($/.test(line) && /^\s*</.test(lines[index + 1] ?? ""));
		const wantsBlank = isJsxReturn || body.length > MAX_TIGHT_LINES;
		if (!wantsBlank && hasBlankBefore && !isFirstStatement) {
			problems.push({ index, want: "tight", size: body.length });
		}
		if (wantsBlank && !hasBlankBefore && !isFirstStatement) {
			problems.push({ index, want: "blank", size: isJsxReturn ? "jsx" : body.length });
		}
	});
	lines.forEach((line, index) => {
		const next = lines[index + 1];
		if (line.trim() === "}" && next !== undefined && next.trim() !== "" && !CONTINUES_BLOCK.test(next.trim())) {
			problems.push({ index: index + 1, want: "blank", size: null });
		}
	});
	return { lines, problems };
}

let total = 0;
for (const file of listFiles(root)) {
	const { lines, problems } = inspect(file);
	if (problems.length === 0) {
		continue;
	}
	total += problems.length;
	if (!shouldFix) {
		for (const problem of problems) {
			const reason =
				problem.size === null
					? "블록이 닫힌 뒤 빈 줄 없이 다음 문장이 온다"
					: problem.size === "jsx"
						? "JSX 를 돌려주는 return 앞에 빈 줄이 없다"
						: problem.want === "tight"
							? `블록이 ${problem.size}줄인데 return 앞에 빈 줄이 있다`
							: `블록이 ${problem.size}줄인데 return 앞에 빈 줄이 없다`;
			console.log(`${file}:${problem.index + 1}: ${reason}`);
		}
		continue;
	}
	const next = [...lines];
	for (const problem of [...problems].sort((a, b) => b.index - a.index)) {
		if (problem.want === "tight") {
			next.splice(problem.index - 1, 1);
		} else {
			next.splice(problem.index, 0, "");
		}
	}
	fs.writeFileSync(file, next.join("\n"));
}
if (shouldFix && total > 0) {
	console.log(`고친 곳 ${total}`);
}
if (!shouldFix && total > 0) {
	process.exitCode = 1;
}
