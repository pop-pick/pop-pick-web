#!/usr/bin/env python3
"""inject-matching-rules 판정기. 고치려는 파일에 paths 가 맞는 룰 목록을 훅 출력 JSON 으로 낸다"""

import json
import os
import re
import sys
import tempfile


def expand_braces(pattern):
    start = pattern.find("{")
    if start < 0:
        return [pattern]
    depth = 0
    for end in range(start, len(pattern)):
        if pattern[end] == "{":
            depth += 1
        elif pattern[end] == "}":
            depth -= 1
            if depth == 0:
                break
    else:
        return [pattern]

    options = []
    depth = 0
    current = ""
    for ch in pattern[start + 1 : end]:
        if ch == "," and depth == 0:
            options.append(current)
            current = ""
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
        current += ch
    options.append(current)

    head, tail = pattern[:start], pattern[end + 1 :]
    result = []
    for option in options:
        result.extend(expand_braces(head + option + tail))
    return result


def glob_to_regex(pattern):
    out = ""
    i = 0
    while i < len(pattern):
        if pattern.startswith("**/", i):
            out += "(?:.*/)?"
            i += 3
        elif pattern.startswith("**", i):
            out += ".*"
            i += 2
        elif pattern[i] == "*":
            out += "[^/]*"
            i += 1
        elif pattern[i] == "?":
            out += "[^/]"
            i += 1
        elif pattern[i] == "[":
            end = pattern.find("]", i + 1)
            if end < 0:
                out += re.escape(pattern[i])
                i += 1
            else:
                body = pattern[i + 1 : end]
                if body.startswith("!"):
                    body = "^" + body[1:]
                out += "[" + body.replace("\\", "\\\\") + "]"
                i = end + 1
        else:
            out += re.escape(pattern[i])
            i += 1
    return re.compile(out + r"\Z")


def read_paths(text):
    match = re.match(r"^---\r?\n(.*?)\r?\n---", text, re.S)
    if not match:
        return []
    lines = match.group(1).splitlines()
    for index, line in enumerate(lines):
        found = re.match(r"^paths:\s*(.*)$", line)
        if not found:
            continue
        inline = found.group(1).strip()
        if inline.startswith("["):
            return [item.strip().strip("'\"") for item in inline.strip("[]").split(",") if item.strip()]
        if inline:
            return [inline.strip("'\"")]
        items = []
        for item in lines[index + 1 :]:
            listed = re.match(r"^\s+-\s+(.*)$", item)
            if not listed:
                break
            items.append(listed.group(1).strip().strip("'\""))
        return items
    return []


def main():
    try:
        data = json.load(sys.stdin)
    except ValueError:
        return
    tool_input = data.get("tool_input") or {}
    file_path = tool_input.get("file_path") or tool_input.get("notebook_path")
    if not file_path:
        return

    here = os.path.dirname(os.path.abspath(__file__))
    project = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(os.path.dirname(os.path.dirname(here)))
    root = os.path.realpath(project)
    base = data.get("cwd") or root
    target = os.path.realpath(file_path if os.path.isabs(file_path) else os.path.join(base, file_path))
    if not target.startswith(root + os.sep):
        return
    relative = os.path.relpath(target, root).replace(os.sep, "/")

    rules_dir = os.path.join(root, ".agents", "rules")
    if not os.path.isdir(rules_dir):
        return
    matched = []
    for name in sorted(os.listdir(rules_dir)):
        if not name.endswith(".md"):
            continue
        with open(os.path.join(rules_dir, name), encoding="utf-8") as handle:
            patterns = read_paths(handle.read())
        regexes = [glob_to_regex(p) for pattern in patterns for p in expand_braces(pattern)]
        if any(regex.match(relative) for regex in regexes):
            matched.append(".agents/rules/" + name)
    if not matched:
        return

    session = re.sub(r"[^A-Za-z0-9_-]", "", str(data.get("session_id") or "")) or "unknown"
    state = os.path.join(os.environ.get("TMPDIR") or tempfile.gettempdir(), "claude-inject-rules-" + session)
    key = ",".join(matched)
    seen = []
    if os.path.exists(state):
        with open(state, encoding="utf-8") as handle:
            seen = handle.read().splitlines()
    if key in seen:
        return
    with open(state, "a", encoding="utf-8") as handle:
        handle.write(key + "\n")

    message = "파일 {} 는 아래 룰의 paths 에 든다. 이 세션에서 읽지 않은 룰이 있으면 고치기 전에 연다\n{}".format(
        relative, "\n".join("- " + rule for rule in matched)
    )
    output = {"hookSpecificOutput": {"hookEventName": "PreToolUse", "additionalContext": message}}
    print(json.dumps(output, ensure_ascii=False))


main()
