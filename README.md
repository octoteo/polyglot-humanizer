# Polyglot Humanizer

Language-native AI-writing refinement for humans and agents.

**v1.1.0 supports `zh-CN` and `en-US`.**

Polyglot Humanizer removes model-shaped prose while preserving meaning, facts, register, and author voice. It is designed as an Agent Skill with a deterministic scanner and preservation verifier, not as an AI-authorship detector.

## Principles

- **Style signals, not authorship claims.** A flagged pattern means “this reads like a common model-shaped habit,” not “AI wrote this.”
- **Language-native rules.** `zh-CN` and `en-US` use separate rule packs; English rules are not mechanically translated into Chinese.
- **Preserve facts and claims.** Token invariants must survive rewriting, and a hidden claim ledger blocks invented events, anecdotes, mechanisms, sources, or chronology.
- **Voice beats generic cleanup.** A supplied writing sample overrides weak style heuristics.
- **Detect and rewrite are separate.** Deterministic checks help the Agent find patterns; the Agent performs semantic rewriting.

## Quick start

### As an Agent Skill

Install the `skills/polyglot-humanizer` directory in a compatible Skills environment, then ask the agent to humanize, polish, de-AI, or audit Chinese or English prose.

### Scanner CLI

Requires Node.js 20+ and no third-party runtime dependencies.

```bash
npm test
node skills/polyglot-humanizer/scripts/cli.mjs scan tests/fixtures.zh.txt
node skills/polyglot-humanizer/scripts/cli.mjs scan tests/fixtures.en.txt --format json
```

### Preservation check

```bash
node skills/polyglot-humanizer/scripts/cli.mjs verify before.md after.md
```

A failed preservation check exits non-zero.

## Architecture

```text
Input
  -> protected-span extraction
  -> block locale routing
  -> core + locale rule composition
  -> deterministic scan
  -> Agent semantic audit + claim ledger
  -> voice/register-aware rewrite
  -> semantic + deterministic preservation verification
  -> post-rewrite scan
  -> final
```

The runtime skill is self-contained under `skills/polyglot-humanizer/`.

## Supported locales

| Locale | Status | Focus |
|---|---|---|
| `zh-CN` | Stable | Simplified Chinese, translationese, slogan/business abstraction, forced parallelism, staged emphasis, Chinese punctuation/register |
| `en-US` | Stable | Staged phrasing, false contrast, forced triads, dash overuse, inflated claims, stock model vocabulary, formatting habits |

Mixed Chinese/English documents are routed block by block.

## Rule model

Rules carry two independent dimensions:

- `severity`: `P0` (strong) to `P3` (weak; needs supporting context)
- `evidence`: `E0` (experimental) to `E3` (corpus-backed)

Weak lexical signals are never treated as a blacklist by themselves.

## Commands

```text
scan <file|-> [--locale auto|zh-CN|en-US] [--format text|json]
verify <before> <after> [--format text|json]
validate-rules
```

## Validation

`v1.1.0` adds a real-world `zh-CN` regression pass against four public Humanizer examples spanning business copy, marketing, academic prose, and opinion/blog writing. The regression exposed both scanner recall gaps and preservation failures that simple token checks could miss. See [`EVALS.md`](EVALS.md) for the comparison methodology and results.

Current automated suite: **23 tests**, plus rule-pack validation.

## Non-goals

Polyglot Humanizer does **not** promise to bypass GPTZero, Originality.ai, Turnitin, or any other detector, and it does not output a probability that text was written by AI.

## Acknowledgements

The project is independently implemented and conceptually informed by the open-source work around `blader/humanizer`, `conorbronsdon/avoid-ai-writing`, `hardikpandya/stop-slop`, `op7418/Humanizer-zh`, `holygeek00/humanizer-zh-cn`, `finestructure-ai/humanizer-multilingual`, and `jurigis/avoid-ai-writing-multilingual`.

## License

MIT
