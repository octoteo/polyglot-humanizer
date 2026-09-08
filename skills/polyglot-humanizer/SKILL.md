---
name: polyglot-humanizer
description: Refine Simplified Chinese (zh-CN) and US English (en-US) prose that sounds model-generated, generic, over-structured, slogan-like, translationese-heavy, or unlike the author's normal voice. Use for humanizing, de-AI editing, style audits, rewriting AI-shaped prose, preserving author voice, or reviewing mixed Chinese/English text. Preserve facts, claims, code, URLs, citations, numbers, dates, and user meaning; never claim to determine whether AI actually authored the text.
---

# Polyglot Humanizer

Refine model-shaped prose into natural, language-native writing without changing what the source says.

## Workflow

1. **Protect non-prose.** Keep code blocks, inline code, commands, paths, URLs, Markdown link targets, structured data, citations, and literal identifiers unchanged unless the user explicitly asks to edit them.
2. **Route by locale and register.** Detect `zh-CN` or `en-US` block by block, then identify the functional register. For mixed documents, do not force one language's rules onto the other. In legal/appeal writing, preserve genuine issue distinctions, evidence lists, requested remedies, and necessary numbered structure.
3. **Load the right guidance.** Always read `references/core.md` and `references/preservation.md`; read `references/zh-CN.md` for Chinese blocks and `references/en-US.md` for English blocks.
4. **Scan before rewriting when tools are available.** Run `node scripts/cli.mjs scan <file> --format json` for files, or pipe pasted text through stdin. Treat findings as style signals, not proof of AI authorship. Strong patterns justify direct editing; weak patterns need context or clustering.
5. **Build a hidden claim ledger.** Before rewriting, identify every source claim and its actor, action, object, result, attribution, uncertainty, and time. This is an internal preservation contract, not user-facing output unless audit mode is requested.
6. **Rewrite semantically.** Rewrite the sentence or paragraph around its actual point. Do not patch a flagged word mechanically. Preserve source claims, uncertainty, intent, register, and voice. Never create specificity the source did not contain.
7. **Prefer the writer's voice.** If the user provides a writing sample, match its sentence length, punctuation, vocabulary, density, openings, and transitions. A genuine voice habit overrides weak (`P2`/`P3`) rules.
8. **Verify claims and invariants.** Compare the rewrite against the hidden claim ledger. For file workflows, also run `node scripts/cli.mjs verify <before> <after>`. A new or lost event, example, source, chronology, name, number, date, URL, code token, or other high-confidence invariant is an error.
9. **Scan once more.** Re-scan the rewrite. If strong `P0`/`P1` patterns still dominate, revise once. Do not loop indefinitely.

## Modes

### Rewrite

Return the final rewritten prose. Do not add a long diagnostic report unless the user asks for one.

### Audit

Return concise findings grouped by severity and locale. Explain why each pattern is suspicious in context, distinguish strong findings from weak lexical hints, and call out missing source detail without inventing replacements.

### File edit

Edit prose only. Keep protected spans intact. After writing the file, verify semantic claims and deterministic invariants, then report a concise summary of the changes.

## Hard constraints

- Never invent a fact, event, experience, example, mechanism, name, number, date, quote, citation, ranking, source, chronology, or causal claim to make prose feel more specific.
- Never translate or normalize technical identifiers merely to sound more natural.
- Never use third-party AI-detector scores as ground truth.
- Never state an “AI probability” or assert authorship from these patterns.
- Never treat a language's weak lexical list as a banned-word list.
- Keep legitimate domain language when the register requires it.
- Treat deterministic `verify` as a floor, not proof of semantic preservation.

## Runtime scripts

- `scripts/cli.mjs scan`: deterministic rule scan with locale routing and weak-signal clustering.
- `scripts/cli.mjs verify`: compare high-confidence invariants before/after rewrite, including Chinese numeral/time additions.
- `scripts/cli.mjs validate-rules`: validate bundled rule packs.

Use scripts for repeatable checks; use the claim ledger and language guidance for semantic rewriting.
