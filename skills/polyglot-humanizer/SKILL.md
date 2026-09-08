---
name: polyglot-humanizer
description: Refine Simplified Chinese (zh-CN) and US English (en-US) prose that sounds model-generated, generic, over-structured, slogan-like, translationese-heavy, or unlike the author's normal voice. Use for humanizing, de-AI editing, style audits, rewriting AI-shaped prose, preserving author voice, or reviewing mixed Chinese/English text. Preserve facts, code, URLs, citations, numbers, dates, and user meaning; never claim to determine whether AI actually authored the text.
---

# Polyglot Humanizer

Refine model-shaped prose into natural, language-native writing without changing what the source says.

## Workflow

1. **Protect non-prose.** Keep code blocks, inline code, commands, paths, URLs, Markdown link targets, structured data, citations, and literal identifiers unchanged unless the user explicitly asks to edit them.
2. **Route by locale.** Detect `zh-CN` or `en-US` block by block. For mixed documents, do not force one language's rules onto the other.
3. **Load the right guidance.** Always read `references/core.md`; read `references/zh-CN.md` for Chinese blocks and `references/en-US.md` for English blocks.
4. **Scan before rewriting when tools are available.** Run `node scripts/cli.mjs scan <file> --format json` for files, or pipe pasted text through stdin. Treat findings as style signals, not proof of AI authorship.
5. **Rewrite semantically.** Rewrite the sentence or paragraph around its actual point. Do not patch a flagged word mechanically. Preserve supported claims, uncertainty, intent, register, and voice.
6. **Prefer the writer's voice.** If the user provides a writing sample, match its sentence length, punctuation, vocabulary, density, openings, and transitions. A genuine voice habit overrides weak (`P2`/`P3`) rules.
7. **Verify preservation.** For file workflows, run `node scripts/cli.mjs verify <before> <after>`. Any lost or invented high-confidence invariant is an error.
8. **Scan once more.** Re-scan the rewrite. If strong `P0`/`P1` patterns still dominate, revise once. Do not loop indefinitely.

## Modes

### Rewrite

Return the final rewritten prose. Do not add a long diagnostic report unless the user asks for one.

### Audit

Return concise findings grouped by severity and locale, explain why each pattern is suspicious in context, and distinguish strong findings from weak lexical hints.

### File edit

Edit prose only. Keep protected spans intact. After writing the file, verify preservation and report a concise summary of the changes.

## Hard constraints

- Never invent a fact, name, number, date, quote, citation, ranking, source, or causal claim to make prose feel more specific.
- Never translate or normalize technical identifiers merely to sound more natural.
- Never use third-party AI-detector scores as ground truth.
- Never state an “AI probability” or assert authorship from these patterns.
- Never treat a language's weak lexical list as a banned-word list.
- Keep legitimate domain language when the register requires it.

## Runtime scripts

- `scripts/cli.mjs scan`: deterministic rule scan with locale routing.
- `scripts/cli.mjs verify`: compare high-confidence invariants before/after rewrite.
- `scripts/cli.mjs validate-rules`: validate bundled rule packs.

Use scripts for repeatable checks; use judgment for semantic rewriting.
