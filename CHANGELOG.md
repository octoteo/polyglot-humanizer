# Changelog

## 1.3.0 - 2026-09-09

- Split ordinary consumer/platform appeals from formal legal-writing behavior.
- Add role-fidelity guardrails: a complainant must not be rewritten as a judge, lawyer, or platform reviewer.
- Flag adjudicator-style phrases such as “本案只需要审查以下三个问题” in consumer appeals.
- Prefer first-person chronology and evidence over artificial issue trees.
- Keep legal citations secondary unless the user explicitly requests a formal pleading or legal memorandum.

## 1.2.0 - 2026-09-09

- Add `legal-appeal` register detection for Simplified Chinese consumer complaints and review requests.
- Downgrade genuine legal issue distinctions so “not no-reason return, but non-conforming performance” is not misclassified as fake contrast.
- Downgrade evidence/remedy enumerations in appeal context instead of treating necessary three-item lists as mechanical triads.
- Add regression tests proving ordinary marketing fake contrast remains strong outside legal/appeal context.
- Add appeal-register guidance favoring evidence-first structure over legalese or statute dumping.
- Make deterministic preservation deduplication-safe: repeated mentions may be compressed as long as each unique invariant remains present; semantic claim completeness remains the claim ledger’s responsibility.
- Ignore Markdown/outline numbering such as `1.`, `2.` as structural markers rather than invented factual numbers.

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
