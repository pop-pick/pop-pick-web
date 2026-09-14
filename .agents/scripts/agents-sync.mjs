#!/usr/bin/env node
// agents-sync. `.agents/` 원본을 Claude Code 와 Codex 가 읽는 자리로 복사하고 변환한다.
//
//   pnpm harness:sync                          생성물을 갱신한다
//   node .agents/scripts/agents-sync.mjs --check  생성물이 원본과 맞는지만 본다. harness:check 가 돌린다
//
//   원본                         생성물
//   .agents/skills/<이름>/       .claude/skills/<이름>/        통째로 복사
//   .agents/rules/*.md           .claude/rules/*.md            복사
//                                AGENTS.md 표식 사이           description 으로 목록을 만든다
//   .agents/agents/**/*.md       .claude/agents/**/*.md        복사. 하위 폴더를 유지한다
//                                .codex/agents/<이름>.toml     name, description, developer_instructions 로 변환한다
//   .agents/hooks/hooks.json     .claude/settings.json         hooks 키만 바꿔 넣는다
//
// 심볼릭 링크를 만들지 않는다. 커밋한 링크는 core.symlinks 가 꺼진 환경에서 텍스트 파일로 풀린다.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC = path.join(ROOT, ".agents");
const RULES_BEGIN = "<!-- agents-sync:rules:begin -->";
const RULES_END = "<!-- agents-sync:rules:end -->";
const AGENTS_BEGIN = "<!-- agents-sync:agents:begin -->";
const AGENTS_END = "<!-- agents-sync:agents:end -->";
const GENERATED_DIRS = [".claude/skills", ".claude/rules", ".claude/agents", ".codex/agents"].map((dir) =>
	path.join(ROOT, dir)
);

function frontmatter(text) {
	const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!match) {
		return { meta: {}, body: text };
	}

	const meta = {};
	let key = null;
	for (const line of match[1].split(/\r?\n/)) {
		const item = line.match(/^\s+-\s+(.*)$/);
		const pair = line.match(/^([\w-]+):\s*(.*)$/);
		if (item && key) {
			meta[key].push(item[1].trim());
		} else if (pair) {
			key = pair[1];
			meta[key] = pair[2].trim() === "" ? [] : pair[2].trim();
		}
	}

	return { meta, body: match[2] };
}

function asList(value) {
	if (Array.isArray(value)) {
		return value;
	}
	return typeof value === "string" && value !== "" ? value.split(",").map((s) => s.trim()) : [];
}

function walkFiles(dir) {
	if (!fs.existsSync(dir)) {
		return [];
	}
	return fs
		.readdirSync(dir, { withFileTypes: true, recursive: true })
		.filter((entry) => entry.isFile())
		.map((entry) => path.join(entry.parentPath, entry.name))
		.sort();
}

function tomlInline(text) {
	return `"${text.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll(/\r?\n/g, " ")}"`;
}

function tomlMultiline(text) {
	return `"""\n${text.replaceAll("\\", "\\\\").replaceAll('"""', '""\\"')}"""`;
}

function rulesSection() {
	const lines = [
		RULES_BEGIN,
		"",
		"<!-- 이 표식 사이는 .agents/scripts/agents-sync.mjs 가 .agents/rules/ 의 description 에서 만든다. 손으로 고치지 않는다 -->",
		""
	];
	const copies = new Map();
	for (const file of walkFiles(path.join(SRC, "rules")).filter((f) => f.endsWith(".md"))) {
		const raw = fs.readFileSync(file);
		const { meta } = frontmatter(raw.toString("utf8"));
		if (typeof meta.description !== "string" || meta.description === "") {
			throw new Error(`${path.relative(ROOT, file)} 에 description 이 없다`);
		}
		copies.set(path.join(ROOT, ".claude", "rules", path.basename(file)), raw);
		lines.push(`- \`${path.basename(file)}\`. ${meta.description}`);
	}
	lines.push("", RULES_END);

	return { section: lines.join("\n"), copies };
}

function agentsSection(agentFiles) {
	const groups = new Map();
	for (const file of agentFiles) {
		const relative = path.relative(path.join(SRC, "agents"), file);
		const folder = relative.includes(path.sep) ? relative.split(path.sep)[0] : ".";
		const { meta } = frontmatter(fs.readFileSync(file, "utf8"));
		const name = typeof meta.name === "string" && meta.name !== "" ? meta.name : path.basename(file, ".md");
		if (!groups.has(folder)) {
			groups.set(folder, []);
		}
		groups.get(folder).push(`\`${name}\``);
	}
	const parts = [...groups].map(([folder, names]) => `\`${folder}/\`에 ${names.join(", ")}`);
	const total = agentFiles.length;

	return [
		AGENTS_BEGIN,
		"",
		"<!-- 이 표식 사이는 .agents/scripts/agents-sync.mjs 가 .agents/agents/ 에서 만든다. 손으로 고치지 않는다 -->",
		"",
		`에이전트 ${total}개의 원본이 \`.agents/agents/\` 아래 폴더 ${groups.size}개에 있다. ${parts.join(", ")}다.`,
		"",
		AGENTS_END
	].join("\n");
}

function replaceBetween(text, begin, end, section) {
	if (!text.includes(begin) || !text.includes(end)) {
		throw new Error(`AGENTS.md 에 표식 ${begin} 과 ${end} 가 있어야 한다`);
	}
	const head = text.slice(0, text.indexOf(begin));
	const tail = text.slice(text.indexOf(end) + end.length);
	return head + section + tail;
}

function agentOutputs(file) {
	const raw = fs.readFileSync(file);
	const { meta, body } = frontmatter(raw.toString("utf8"));
	const relative = path.relative(path.join(SRC, "agents"), file);
	const name = typeof meta.name === "string" && meta.name !== "" ? meta.name : path.basename(file, ".md");

	let instructions = body.trim();
	for (const skill of asList(meta.skills)) {
		const skillFile = path.join(SRC, "skills", skill, "SKILL.md");
		if (!fs.existsSync(skillFile)) {
			throw new Error(`${path.relative(ROOT, file)} 가 없는 스킬 ${skill} 을 싣는다`);
		}
		instructions += `\n\n${frontmatter(fs.readFileSync(skillFile, "utf8")).body.trim()}`;
	}

	const toml =
		`# .agents/scripts/agents-sync.mjs 가 .agents/agents/${relative} 에서 만든다. 손으로 고치지 않는다\n` +
		`name = ${tomlInline(name)}\n` +
		`description = ${tomlInline(typeof meta.description === "string" ? meta.description : "")}\n` +
		`developer_instructions = ${tomlMultiline(`${instructions}\n`)}\n`;

	return {
		claude: [path.join(ROOT, ".claude", "agents", relative), raw],
		codex: [path.join(ROOT, ".codex", "agents", `${name}.toml`), Buffer.from(toml, "utf8")]
	};
}

function plan() {
	const files = new Map();
	const dirs = new Map();

	for (const entry of fs.readdirSync(path.join(SRC, "skills"), { withFileTypes: true })) {
		if (entry.isDirectory() && fs.existsSync(path.join(SRC, "skills", entry.name, "SKILL.md"))) {
			dirs.set(path.join(ROOT, ".claude", "skills", entry.name), path.join(SRC, "skills", entry.name));
		}
	}

	const { section, copies } = rulesSection();
	for (const [dst, data] of copies) {
		files.set(dst, data);
	}

	const agentFiles = walkFiles(path.join(SRC, "agents")).filter((f) => f.endsWith(".md"));
	const agentsMd = path.join(ROOT, "AGENTS.md");
	let text = fs.readFileSync(agentsMd, "utf8");
	text = replaceBetween(text, RULES_BEGIN, RULES_END, section);
	text = replaceBetween(text, AGENTS_BEGIN, AGENTS_END, agentsSection(agentFiles));
	files.set(agentsMd, Buffer.from(text, "utf8"));

	for (const file of agentFiles) {
		const { claude, codex } = agentOutputs(file);
		files.set(claude[0], claude[1]);
		files.set(codex[0], codex[1]);
	}

	const hooksFile = path.join(SRC, "hooks", "hooks.json");
	if (fs.existsSync(hooksFile)) {
		const spec = JSON.parse(fs.readFileSync(hooksFile, "utf8"));
		const settingsFile = path.join(ROOT, ".claude", "settings.json");
		const settings = fs.existsSync(settingsFile) ? JSON.parse(fs.readFileSync(settingsFile, "utf8")) : {};
		settings.hooks = spec.hooks ?? {};
		files.set(settingsFile, Buffer.from(`${JSON.stringify(settings, null, "\t")}\n`, "utf8"));
	}

	return { files, dirs };
}

function stale({ files, dirs }) {
	const keep = new Set([...files.keys(), ...dirs.keys()]);
	const result = [];
	for (const dir of GENERATED_DIRS.filter((d) => fs.existsSync(d))) {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			if (entry.name.startsWith(".")) {
				continue;
			}
			const full = path.join(dir, entry.name);
			if (keep.has(full)) {
				continue;
			}
			if (entry.isDirectory() && !entry.isSymbolicLink()) {
				const inside = walkFiles(full).filter((f) => !keep.has(f));
				if (inside.length === walkFiles(full).length) {
					result.push(full);
				} else {
					result.push(...inside);
				}
			} else {
				result.push(full);
			}
		}
	}

	return result;
}

function isSymlink(target) {
	try {
		return fs.lstatSync(target).isSymbolicLink();
	} catch {
		return false;
	}
}

function treeDiff(src, dst) {
	if (isSymlink(dst) || !fs.existsSync(dst)) {
		return [dst];
	}
	const read = (root) => new Map(walkFiles(root).map((f) => [path.relative(root, f), fs.readFileSync(f)]));
	const a = read(src);
	const b = read(dst);
	const names = new Set([...a.keys(), ...b.keys()]);
	return [...names]
		.filter((rel) => !a.has(rel) || !b.has(rel) || !a.get(rel).equals(b.get(rel)))
		.map((rel) => path.join(dst, rel));
}

function remove(target) {
	fs.rmSync(target, { recursive: true, force: true });
}

function apply({ files, dirs }) {
	for (const [dst, src] of dirs) {
		remove(dst);
		fs.cpSync(src, dst, { recursive: true });
	}
	for (const [dst, data] of files) {
		fs.mkdirSync(path.dirname(dst), { recursive: true });
		if (isSymlink(dst)) {
			fs.unlinkSync(dst);
		}
		fs.writeFileSync(dst, data);
	}
	for (const target of stale({ files, dirs })) {
		remove(target);
		console.log(`삭제: ${path.relative(ROOT, target)}`);
	}
}

function check({ files, dirs }) {
	const bad = [];
	for (const [dst, data] of files) {
		if (isSymlink(dst) || !fs.existsSync(dst) || !fs.readFileSync(dst).equals(data)) {
			bad.push(dst);
		}
	}
	for (const [dst, src] of dirs) {
		bad.push(...treeDiff(src, dst));
	}

	return [...bad, ...stale({ files, dirs })];
}

const planned = plan();
if (process.argv.includes("--check")) {
	const bad = check(planned);
	for (const target of bad) {
		console.log(`어긋남: ${path.relative(ROOT, target)}`);
	}
	if (bad.length > 0) {
		console.log(`${bad.length}개가 어긋난다. pnpm harness:sync 를 돌리고 생성물을 함께 커밋한다`);
		process.exit(1);
	}
	console.log("생성물이 원본과 맞는다");
} else {
	apply(planned);
	console.log(`동기화 완료. 파일 ${planned.files.size}개, 스킬 ${planned.dirs.size}개`);
}
