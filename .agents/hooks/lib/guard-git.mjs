#!/usr/bin/env node
// guard-git 판정기. 훅 입력 JSON 의 명령을 셸처럼 나눠 git 호출만 git-workflow.md 금지 패턴으로 판정한다

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const COMMIT_PROTECTED = new Set(["main", "develop"]);
const PUSH_PROTECTED = new Set(["main"]);
const KEYWORDS = new Set(["if", "then", "else", "elif", "do", "while", "until", "!", "{", "}", "fi", "done", "time"]);
const HOOK_SKIPPING = new Set(["commit", "push", "merge", "rebase", "cherry-pick", "am", "pull", "revert"]);
const OUTPUT_WRITING = new Set([
	"diff",
	"log",
	"show",
	"whatchanged",
	"diff-tree",
	"diff-index",
	"diff-files",
	"range-diff"
]);
const COMMIT_VALUE_OPTIONS = [
	"--message",
	"--file",
	"--author",
	"--date",
	"--template",
	"--reuse-message",
	"--reedit-message",
	"--fixup",
	"--squash",
	"--cleanup",
	"--trailer",
	"--pathspec-from-file"
];
const PUSH_VALUE_OPTIONS = new Set(["--repo", "--receive-pack", "--exec", "--push-option"]);

class Deny extends Error {}
class ParseError extends Error {}

function deny(reason) {
	throw new Deny(reason);
}

function scanList(state, closer) {
	const { src } = state;
	let words = [];
	let word = null;
	let dropNext = false;
	let depth = 0;

	const appendText = (text, dynamic = false) => {
		word ??= { text: "", dynamic: false };
		word.text += text;
		word.dynamic ||= dynamic;
	};
	const flushWord = () => {
		if (!word) {
			return;
		}
		if (dropNext) {
			dropNext = false;
		} else {
			words.push(word);
		}
		word = null;
	};
	const flushCommand = () => {
		flushWord();
		if (words.length > 0) {
			state.commands.push(words);
		}
		words = [];
	};
	const skipHeredocs = () => {
		for (const heredoc of state.heredocs) {
			while (state.pos < src.length) {
				let end = src.indexOf("\n", state.pos);
				if (end < 0) {
					end = src.length;
				}
				let line = src.slice(state.pos, end);
				state.pos = end + 1;
				if (heredoc.stripTabs) {
					line = line.replace(/^\t+/, "");
				}
				if (line === heredoc.delimiter) {
					break;
				}
			}
		}
		state.heredocs = [];
	};
	const nested = (nestedCloser) => {
		const before = state.commands.length;
		scanList(state, nestedCloser);
		return state.commands.length - before;
	};
	const readDelimiter = () => {
		while (src[state.pos] === " " || src[state.pos] === "\t") {
			state.pos += 1;
		}
		let delimiter = "";
		while (state.pos < src.length && !/[\s;&|<>()]/.test(src[state.pos])) {
			const ch = src[state.pos];
			if (ch === "'" || ch === '"') {
				const end = src.indexOf(ch, state.pos + 1);
				if (end < 0) {
					throw new ParseError("heredoc 구분자의 따옴표가 닫히지 않았다");
				}
				delimiter += src.slice(state.pos + 1, end);
				state.pos = end + 1;
			} else if (ch === "\\") {
				delimiter += src[state.pos + 1] ?? "";
				state.pos += 2;
			} else {
				delimiter += ch;
				state.pos += 1;
			}
		}
		return delimiter;
	};

	while (state.pos < src.length) {
		const ch = src[state.pos];
		const next = src[state.pos + 1];

		if (closer === "`" && ch === "`") {
			state.pos += 1;
			flushCommand();
			return;
		}
		if (ch === ")" && depth === 0 && closer === ")") {
			state.pos += 1;
			flushCommand();
			return;
		}
		if (ch === " " || ch === "\t") {
			flushWord();
			state.pos += 1;
		} else if (ch === "\\") {
			if (next === "\n") {
				state.pos += 2;
			} else {
				appendText(next ?? "");
				state.pos += 2;
			}
		} else if (ch === "'") {
			const end = src.indexOf("'", state.pos + 1);
			if (end < 0) {
				throw new ParseError("작은따옴표가 닫히지 않았다");
			}
			appendText(src.slice(state.pos + 1, end));
			state.pos = end + 1;
		} else if (ch === '"') {
			state.pos += 1;
			appendText("");
			let closed = false;
			while (state.pos < src.length) {
				const c = src[state.pos];
				if (c === '"') {
					state.pos += 1;
					closed = true;
					break;
				}
				if (c === "\\" && /[$`"\\\n]/.test(src[state.pos + 1] ?? "")) {
					if (src[state.pos + 1] !== "\n") {
						appendText(src[state.pos + 1]);
					}
					state.pos += 2;
				} else if (c === "$" && src[state.pos + 1] === "(") {
					state.pos += 2;
					nested(")");
					appendText("$(...)", true);
				} else if (c === "`") {
					state.pos += 1;
					nested("`");
					appendText("$(...)", true);
				} else {
					appendText(c, c === "$");
					state.pos += 1;
				}
			}
			if (!closed) {
				throw new ParseError("큰따옴표가 닫히지 않았다");
			}
		} else if (ch === "`") {
			state.pos += 1;
			nested("`");
			appendText("$(...)", true);
		} else if (ch === "$" && next === "(") {
			state.pos += 2;
			nested(")");
			appendText("$(...)", true);
		} else if (ch === "$") {
			appendText("$", true);
			state.pos += 1;
		} else if (ch === "#" && word === null) {
			const end = src.indexOf("\n", state.pos);
			state.pos = end < 0 ? src.length : end;
		} else if (ch === "\n") {
			flushCommand();
			state.pos += 1;
			skipHeredocs();
		} else if (ch === ";") {
			flushCommand();
			state.pos += 1;
		} else if (ch === "&") {
			if (next === "&") {
				flushCommand();
				state.pos += 2;
			} else if (next === ">") {
				flushWord();
				state.pos += src[state.pos + 2] === ">" ? 3 : 2;
				dropNext = true;
			} else {
				flushCommand();
				state.pos += 1;
			}
		} else if (ch === "|") {
			flushCommand();
			state.pos += next === "|" || next === "&" ? 2 : 1;
		} else if (ch === "(") {
			flushCommand();
			depth += 1;
			state.pos += 1;
		} else if (ch === ")") {
			flushCommand();
			depth = Math.max(0, depth - 1);
			state.pos += 1;
		} else if (ch === "<" || ch === ">") {
			if (word && /^\d+$/.test(word.text) && !word.dynamic) {
				word = null;
			} else {
				flushWord();
			}
			if (next === "(") {
				state.pos += 2;
				nested(")");
				appendText("$(...)", true);
				flushWord();
			} else if (ch === "<" && next === "<" && src[state.pos + 2] === "<") {
				state.pos += 3;
				dropNext = true;
			} else if (ch === "<" && next === "<") {
				state.pos += 2;
				const stripTabs = src[state.pos] === "-";
				if (stripTabs) {
					state.pos += 1;
				}
				state.heredocs.push({ delimiter: readDelimiter(), stripTabs });
			} else {
				state.pos += next === ">" || next === "&" || next === "|" ? 2 : 1;
				dropNext = true;
			}
		} else {
			appendText(ch);
			state.pos += 1;
		}
	}

	if (closer) {
		throw new ParseError("괄호나 백틱이 닫히지 않았다");
	}
	flushCommand();
}

function parse(src) {
	const state = { src, pos: 0, heredocs: [], commands: [] };
	scanList(state, null);
	return state.commands;
}

function assignment(word) {
	const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/s.exec(word.text);
	return match ? [match[1], match[2]] : null;
}

function resolveVariable(argv, ctx) {
	const match = /^\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?$/.exec(argv[0]?.text ?? "");
	if (!match || !(match[1] in ctx.vars)) {
		return argv;
	}
	const replaced = ctx.vars[match[1]]
		.split(/\s+/)
		.filter(Boolean)
		.map((text) => ({ text, dynamic: false }));
	return [...replaced, ...argv.slice(1)];
}

function skipOptions(argv, withValue) {
	let i = 0;
	while (i < argv.length && argv[i].text.startsWith("-") && argv[i].text !== "-") {
		i += withValue.has(argv[i].text) ? 2 : 1;
	}
	return argv.slice(i);
}

function judgeString(src, ctx) {
	for (const words of parse(src)) {
		judgeCommand(words, ctx);
	}
}

function judgeCommand(words, ctx) {
	const env = {};
	let i = 0;
	while (i < words.length) {
		if (KEYWORDS.has(words[i].text)) {
			i += 1;
			continue;
		}
		const pair = assignment(words[i]);
		if (!pair) {
			break;
		}
		env[pair[0]] = pair[1];
		i += 1;
	}
	if (i >= words.length) {
		Object.assign(ctx.vars, env);
		return;
	}

	let argv = words.slice(i);
	for (;;) {
		argv = resolveVariable(argv, ctx);
		if (argv.length === 0) {
			return;
		}
		const name = path.basename(argv[0].text);

		if (name === "export") {
			for (const word of argv.slice(1)) {
				const pair = assignment(word);
				if (pair) {
					ctx.vars[pair[0]] = pair[1];
					ctx.exported[pair[0]] = pair[1];
				} else if (word.text in ctx.vars) {
					ctx.exported[word.text] = ctx.vars[word.text];
				}
			}
			return;
		}
		if (name === "cd" || name === "pushd") {
			const target = argv[1]?.text;
			if (target !== "-") {
				ctx.cwd = path.resolve(ctx.cwd, target ?? os.homedir());
			}
			return;
		}
		if (name === "env") {
			argv = argv.slice(1);
			while (argv.length > 0) {
				const pair = assignment(argv[0]);
				if (pair) {
					env[pair[0]] = pair[1];
					argv = argv.slice(1);
				} else if (["-u", "-C", "-S", "--unset", "--chdir"].includes(argv[0].text)) {
					argv = argv.slice(2);
				} else if (argv[0].text.startsWith("-")) {
					argv = argv.slice(1);
				} else {
					break;
				}
			}
			continue;
		}
		if (["command", "exec", "nohup", "builtin", "time", "nice"].includes(name)) {
			argv = skipOptions(argv.slice(1), new Set(["-n"]));
			continue;
		}
		if (name === "sudo") {
			argv = skipOptions(argv.slice(1), new Set(["-u", "-g", "-h", "-p", "-C", "-D", "-U"]));
			continue;
		}
		if (name === "timeout") {
			argv = skipOptions(argv.slice(1), new Set(["-s", "-k", "--signal", "--kill-after"])).slice(1);
			continue;
		}
		if (name === "xargs") {
			argv = skipOptions(argv.slice(1), new Set(["-I", "-n", "-L", "-P", "-s", "-d", "-E", "-a"]));
			continue;
		}
		if (["bash", "sh", "zsh", "dash"].includes(name)) {
			const flag = argv.findIndex((word, index) => index > 0 && /^-[a-z]*c[a-z]*$/.test(word.text));
			if (flag > 0 && argv[flag + 1]) {
				judgeString(argv[flag + 1].text, ctx);
			}
			return;
		}
		if (name === "eval") {
			judgeString(
				argv
					.slice(1)
					.map((word) => word.text)
					.join(" "),
				ctx
			);
			return;
		}
		if (name === "git") {
			judgeGit(argv.slice(1), env, ctx);
		}
		return;
	}
}

function runGit(dir, args) {
	return spawnSync("git", ["-C", dir, ...args], { encoding: "utf8" });
}

function currentBranch(dir, ctx) {
	if (ctx.branches.has(dir)) {
		return ctx.branches.get(dir);
	}
	if (!fs.existsSync(dir)) {
		return "";
	}
	const result = runGit(dir, ["symbolic-ref", "--quiet", "--short", "HEAD"]);
	return result.status === 0 ? result.stdout.trim() : "";
}

function localBranchExists(dir, name) {
	return fs.existsSync(dir) && runGit(dir, ["show-ref", "--verify", "--quiet", `refs/heads/${name}`]).status === 0;
}

function isAncestorOrSame(target, dir) {
	const relative = path.relative(path.resolve(target), dir);
	return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function isBroadPathspec(word, dir) {
	const text = word.text;
	if (word.dynamic) {
		return true;
	}
	if (text.startsWith(":")) {
		return true;
	}
	if (/[*?[]/.test(text) && !text.includes("/")) {
		return true;
	}
	const normalized = path.posix.normalize(text.replaceAll("\\", "/")).replace(/\/+$/, "");
	if (normalized === "." || normalized === "" || /^\.\.(\/\.\.)*$/.test(normalized)) {
		return true;
	}
	return path.isAbsolute(text) && isAncestorOrSame(text, dir);
}

function isEnvFile(text) {
	const base = path.basename(text);
	return base.startsWith(".env") && base !== ".env.example";
}

function isNoVerify(name) {
	return name.length >= 6 && "--no-verify".startsWith(name);
}

function optionName(text) {
	const eq = text.indexOf("=");
	return eq < 0 ? text : text.slice(0, eq);
}

function judgeAdd(args, dir) {
	let optionsEnded = false;
	for (let k = 0; k < args.length; k += 1) {
		const text = args[k].text;
		if (!optionsEnded && text === "--") {
			optionsEnded = true;
			continue;
		}
		if (!optionsEnded && text.startsWith("--")) {
			const name = optionName(text);
			const value = text.includes("=") ? text.slice(text.indexOf("=") + 1) : null;
			const all = name === "--no-ignore-removal" || (name.length >= 4 && "--all".startsWith(name));
			const update = name.length >= 4 && "--update".startsWith(name);
			if ((all || update) && value !== "false") {
				deny("광범위 스테이징이다. 파일을 하나씩 적는다");
			}
			if ((name === "--chmod" || name === "--pathspec-from-file") && value === null) {
				k += 1;
			}
			continue;
		}
		if (!optionsEnded && text.startsWith("-") && text.length > 1) {
			if (/[Au]/.test(text.slice(1))) {
				deny("광범위 스테이징이다. 파일을 하나씩 적는다");
			}
			continue;
		}
		if (isEnvFile(text)) {
			deny(".env 파일을 스테이징하지 않는다. 비밀값이 들어 있다");
		}
		if (isBroadPathspec(args[k], dir)) {
			deny("광범위 스테이징이다. 파일을 하나씩 적는다");
		}
	}
}

function judgeCommit(args, dir, ctx) {
	let optionsEnded = false;
	for (let k = 0; k < args.length; k += 1) {
		const text = args[k].text;
		if (!optionsEnded && text === "--") {
			optionsEnded = true;
			continue;
		}
		if (!optionsEnded && text.startsWith("--")) {
			const name = optionName(text);
			if (isNoVerify(name)) {
				deny("훅을 건너뛰는 커밋은 하지 않는다. 훅에 걸린 것을 고친다");
			}
			if (name.length >= 4 && "--all".startsWith(name)) {
				deny("commit -a 는 스테이징하지 않은 변경까지 담는다. 파일을 하나씩 스테이징한다");
			}
			if (!text.includes("=") && name.length >= 4 && COMMIT_VALUE_OPTIONS.some((option) => option.startsWith(name))) {
				k += 1;
			}
			continue;
		}
		if (!optionsEnded && text.startsWith("-") && text.length > 1) {
			for (let c = 1; c < text.length; c += 1) {
				const flag = text[c];
				if (flag === "n") {
					deny("훅을 건너뛰는 커밋은 하지 않는다. 훅에 걸린 것을 고친다");
				}
				if (flag === "a") {
					deny("commit -a 는 스테이징하지 않은 변경까지 담는다. 파일을 하나씩 스테이징한다");
				}
				if ("mFCct".includes(flag)) {
					if (c === text.length - 1) {
						k += 1;
					}
					break;
				}
				if (flag === "u" || flag === "S") {
					break;
				}
			}
			continue;
		}
		if (isBroadPathspec(args[k], dir)) {
			deny("경로로 저장소 전체를 커밋한다. 파일을 하나씩 적는다");
		}
	}
	const branch = currentBranch(dir, ctx);
	if (COMMIT_PROTECTED.has(branch)) {
		deny(`${branch} 에서 직접 커밋하지 않는다. feature/ 브랜치를 딴다`);
	}
}

function judgePush(args, dir, ctx) {
	const positional = [];
	let deleting = false;
	let optionsEnded = false;
	for (let k = 0; k < args.length; k += 1) {
		const text = args[k].text;
		if (!optionsEnded && text === "--") {
			optionsEnded = true;
			continue;
		}
		if (!optionsEnded && text.startsWith("--")) {
			const name = optionName(text);
			if (isNoVerify(name)) {
				deny("훅을 건너뛰는 푸시는 하지 않는다. 훅에 걸린 것을 고친다");
			}
			if (name === "--force" || name === "--mirror") {
				deny("강제 푸시다. 필요하면 --force-with-lease 만 쓴다");
			}
			if (name === "--all" || name === "--branches") {
				deny("모든 브랜치를 한 번에 푸시하지 않는다. 브랜치를 적는다");
			}
			if (name === "--delete") {
				deleting = true;
			}
			if (!text.includes("=") && PUSH_VALUE_OPTIONS.has(name)) {
				k += 1;
			}
			continue;
		}
		if (!optionsEnded && text.startsWith("-") && text.length > 1) {
			for (let c = 1; c < text.length; c += 1) {
				const flag = text[c];
				if (flag === "f") {
					deny("강제 푸시다. 필요하면 --force-with-lease 만 쓴다");
				}
				if (flag === "d") {
					deleting = true;
				}
				if (flag === "o") {
					if (c === text.length - 1) {
						k += 1;
					}
					break;
				}
			}
			continue;
		}
		positional.push(text);
	}

	const refspecs = positional.slice(1);
	const protectedTarget = (branch) => {
		if (PUSH_PROTECTED.has(branch)) {
			deny(`${branch} 에 직접 푸시하지 않는다. develop 에서 main 으로 PR 을 연다`);
		}
	};
	if (refspecs.length === 0) {
		protectedTarget(currentBranch(dir, ctx));
		return;
	}
	for (const spec of refspecs) {
		if (spec.startsWith("+")) {
			deny("+refspec 은 강제 푸시다. 필요하면 --force-with-lease 만 쓴다");
		}
		let target = deleting || !spec.includes(":") ? spec : spec.slice(spec.indexOf(":") + 1);
		target = target.replace(/^refs\/heads\//, "");
		if (target === "HEAD") {
			target = currentBranch(dir, ctx);
		}
		protectedTarget(target);
	}
}

function judgeSwitch(sub, args, dir, ctx) {
	const creating = sub === "switch" ? ["-c", "-C", "--create", "--force-create"] : ["-b", "-B", "--orphan"];
	for (let k = 0; k < args.length; k += 1) {
		const text = args[k].text;
		if (text === "--") {
			return;
		}
		if (creating.includes(text)) {
			ctx.branches.set(dir, args[k + 1]?.text ?? "");
			return;
		}
		if (text === "--detach" || text === "-d") {
			ctx.branches.set(dir, "");
			return;
		}
		if (text.startsWith("-")) {
			continue;
		}
		if (localBranchExists(dir, text)) {
			ctx.branches.set(dir, text);
		} else if (sub === "switch") {
			ctx.branches.set(dir, "");
		}
		return;
	}
}

function judgeGit(args, env, ctx) {
	const hookEnv = { ...ctx.exported, ...env };
	if (hookEnv.LEFTHOOK === "0" || hookEnv.LEFTHOOK === "false") {
		deny("LEFTHOOK=0 은 git 훅을 끈다. 훅에 걸린 것을 고친다");
	}
	if ("LEFTHOOK_EXCLUDE" in hookEnv) {
		deny("LEFTHOOK_EXCLUDE 는 git 훅 일부를 끈다. 훅에 걸린 것을 고친다");
	}
	if (Object.keys(hookEnv).some((key) => key.startsWith("GIT_CONFIG"))) {
		deny("GIT_CONFIG 환경 변수로 git 설정을 바꾸지 않는다. 훅 경로를 바꿀 수 있다");
	}

	let dir = ctx.cwd;
	const configs = [];
	let j = 0;
	while (j < args.length) {
		const text = args[j].text;
		if (text === "-c" || text === "--config-env") {
			configs.push(args[j + 1]?.text ?? "");
			j += 2;
		} else if (text.startsWith("--config-env=")) {
			configs.push(text.slice("--config-env=".length));
			j += 1;
		} else if (text.startsWith("-c") && !text.startsWith("--")) {
			configs.push(text.slice(2));
			j += 1;
		} else if (text === "-C") {
			dir = path.resolve(dir, args[j + 1]?.text ?? ".");
			j += 2;
		} else if (["--git-dir", "--work-tree", "--namespace", "--super-prefix"].includes(text)) {
			j += 2;
		} else if (text.startsWith("-")) {
			j += 1;
		} else {
			break;
		}
	}
	if (configs.some((config) => config.split("=")[0].toLowerCase() === "core.hookspath")) {
		deny("core.hooksPath 를 바꿔 git 훅을 끄지 않는다. 훅에 걸린 것을 고친다");
	}

	const sub = args[j]?.text;
	const rest = args.slice(j + 1);
	if (HOOK_SKIPPING.has(sub) && rest.some((word) => word.text.startsWith("--") && isNoVerify(optionName(word.text)))) {
		deny("훅을 건너뛰는 명령은 하지 않는다. 훅에 걸린 것을 고친다");
	}
	if (OUTPUT_WRITING.has(sub) && rest.some((word) => word.text === "--output" || word.text.startsWith("--output="))) {
		deny("읽기 명령의 --output 은 파일을 쓴다. 쓰기는 파일 도구로 한다");
	}

	if (sub === "add") {
		judgeAdd(rest, dir);
	} else if (sub === "commit") {
		judgeCommit(rest, dir, ctx);
	} else if (sub === "push") {
		judgePush(rest, dir, ctx);
	} else if (sub === "switch" || sub === "checkout") {
		judgeSwitch(sub, rest, dir, ctx);
	} else if (sub === "config") {
		const reading = rest.some((word) => ["--get", "--get-all", "--get-regexp", "-l", "--list"].includes(word.text));
		if (!reading && rest.some((word) => /core\.hookspath/i.test(word.text))) {
			deny("core.hooksPath 를 바꿔 git 훅을 끄지 않는다. 훅에 걸린 것을 고친다");
		}
	}
}

let shownCommand = "";

function main() {
	let input;
	try {
		input = JSON.parse(fs.readFileSync(0, "utf8"));
	} catch {
		deny("훅 입력을 JSON 으로 읽지 못했다. 판정하지 못한 명령은 막는다");
	}
	const command = input?.tool_input?.command;
	if (typeof command !== "string" || !command.includes("git")) {
		return;
	}
	shownCommand = command.length > 300 ? `${command.slice(0, 300)}...` : command;
	const ctx = {
		cwd: typeof input.cwd === "string" && input.cwd !== "" ? input.cwd : process.cwd(),
		vars: {},
		exported: {},
		branches: new Map()
	};
	judgeString(command, ctx);
}

try {
	main();
} catch (error) {
	let reason = error.message;
	if (error instanceof ParseError) {
		reason = `명령을 나누지 못했다(${error.message}). 판정하지 못한 git 명령은 막는다`;
	} else if (!(error instanceof Deny)) {
		reason = `판정 중에 오류가 났다(${error.message}). 판정하지 못한 git 명령은 막는다`;
	}
	process.stderr.write(`${reason} (git-workflow.md 금지 패턴)\n막힌 명령: ${shownCommand}\n`);
	process.exit(2);
}
