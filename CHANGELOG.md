# Changelog

## 1.1.0 - 2026-09-08

- Harden `zh-CN` against four real-world public Humanizer regression examples.
- Add marketing-adjective and business-jargon clustering so isolated weak words remain weak.
- Add Chinese academic inflation, future-foundation, vague-authority, cross-clause contrast, pseudo-analysis, and positioning patterns.
- Expand Chinese triad detection to forms such as `A、B和C`.
- Add Chinese numeral and relative-time preservation invariants such as `三年` and `上周`.
- Add semantic claim-ledger instructions to prevent invented anecdotes, events, mechanisms, examples, datasets, and chronology that token checks cannot catch.
- Add Chinese false-positive and preservation regression tests.
- Add `EVALS.md` with methodology, limitations, and the v1.1.0 regression summary.

## 1.0.0 - 2026-09-08

- First stable release.
- Add `zh-CN` and `en-US` language-native rule packs.
- Add mixed-document locale routing.
- Add deterministic scanner with severity/evidence metadata.
- Add high-confidence preservation verifier.
- Add Agent Skill workflow for audit, rewrite, voice matching, and post-rewrite checks.
- Add rule validation and Node.js test suite.
