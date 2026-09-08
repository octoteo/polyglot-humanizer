# Evaluation notes

Polyglot Humanizer is evaluated as a writing-quality and preservation tool, not an AI-authorship detector.

## v1.1.0 real-world Chinese regression

The first v1.1.0 regression pass used four public Chinese “before/after” examples from existing Humanizer projects:

- `holygeek00/humanizer-zh-cn` README: refund/self-service business-copy example
- `op7418/Humanizer-zh` README: cafe marketing example
- `op7418/Humanizer-zh` README: generic medical-AI abstract example
- `op7418/Humanizer-zh` README: generic AI-opinion/blog example

These examples were selected because they cover different failure modes: business abstraction, marketing adjectives, academic inflation, fake contrast, and vague authority.

### Comparison arms

1. **Source** — the AI-shaped input.
2. **Published comparison rewrite** — the output shown in the referenced project README.
3. **Polyglot v1.0.0** — a same-model engineering ablation using the v1.0.0 instructions.
4. **Polyglot v1.1.0** — the revised instructions and guardrails.

This is an engineering regression, not a randomized or blinded human-preference study.

### Results

All scanner scores below use the v1.1.0 rule set so the rows are comparable.

| Case | Source score / strong | Published comparison | v1.0.0 | v1.1.0 |
|---|---:|---|---|---|
| Business abstraction | 12 / 2 | score 0; preservation pass | score 0; pass | score 0; pass |
| Cafe marketing | 12 / 1 | score 0; **preservation fail** (`三年` added; additional semantic details also introduced) | score 2; pass | score 0; pass |
| Academic inflation | 12 / 1 | score 0; **preservation fail** (`2019`, `2023`, `5000` added; disease/dataset details also introduced) | score 0; pass | score 0; pass |
| AI opinion/blog | 5 / 1 | score 0; **preservation fail** (`上周` added; a personal anecdote was also introduced) | score 0; pass | score 0; pass |

### What v1.0.0 missed

The v1.0.0 deterministic scanner detected signals in only one of these four source cases. It missed clustered promotional adjectives, academic framing, cross-clause fake contrast, vague authority, and “奠定基础” significance language.

The v1.0.0 preservation verifier also protected Arabic-digit numbers and dates but could not catch newly invented Chinese-number chronology such as `三年` or relative time such as `上周`.

### v1.1.0 changes driven by this regression

- Add Chinese marketing-adjective clustering instead of banning individual adjectives.
- Add Chinese business-jargon clustering when multiple abstract terms appear in one block.
- Add academic-inflation, future-foundation, vague-authority, cross-clause contrast, and pseudo-analysis patterns.
- Expand triad detection to forms such as `A、B和C`.
- Add Chinese numeral/time invariants to deterministic preservation.
- Add a semantic **claim ledger** because token preservation alone cannot detect invented anecdotes, mechanisms, entities, or examples.
- Add false-positive tests for legitimate transitions, real three-item lists, and named experts.

## Evaluation principles

A useful regression must check both sides of the tradeoff:

- **Recall:** obvious model-shaped patterns should be surfaced.
- **False positives:** ordinary technical, academic, or formal Chinese must not become a strong finding from one normal phrase.
- **Preservation:** the rewrite must not invent details just to sound human.
- **Residual style:** strong findings should fall after rewriting, unless preserving a source claim requires keeping one.
- **Voice/register:** stylistic cleanup must not flatten legitimate domain language or a supplied author voice.

Future releases should add contributed real-world fixtures only when their licensing/privacy status is clear.

## v1.2.0 legal/appeal register regression

A private real-world Chinese consumer appeal was used for a 10-arm rewrite evaluation. The case text and identifiers are intentionally **not** committed to this public repository. Only generalized regression behavior is retained.

The evaluation exposed four framework-level problems:

1. Genuine issue framing such as “not a no-reason return, but whether performance conformed to the agreement” was misclassified as fake contrast.
2. Evidence/remedy lists were misclassified as mechanical triads.
3. Long appeals were routed paragraph-by-paragraph, so short paragraphs lost the document's legal/appeal context.
4. Deterministic preservation treated repeated factual tokens and outline numbering as semantic facts, penalizing legitimate deduplication and formatting.

### Changes

- Add document-level `legal-appeal` register detection with paragraph inheritance.
- Downgrade genuine legal issue distinctions and evidence/remedy triads to weak signals in that register.
- Keep ordinary marketing fake contrast strong outside the legal/appeal register.
- Make invariant verification deduplication-safe.
- Ignore outline numbering such as `1.` and `2.` as structural markers.
- Keep semantic claim preservation in the hidden claim ledger rather than relying on token counts.

### Privacy rule

Real user disputes may be used transiently for local evaluation, but public fixtures should be synthetic or explicitly contributed for publication. Do not commit account identifiers, screenshots, order facts, phone fragments, or private conversations without explicit permission.
