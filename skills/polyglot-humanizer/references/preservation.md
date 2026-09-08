# Preservation and claim discipline

Deterministic invariant checks are necessary but not sufficient. A rewrite can preserve every number and URL while still inventing a new event, example, motive, source, chronology, personal experience, or product detail.

## Build a hidden claim ledger before rewriting

For each factual or attributed claim in the source, record only what the source actually gives:

- actor or subject
- action / state
- object or scope
- result or consequence
- evidence / source attribution
- uncertainty, modality, and time

Do not show this ledger unless the user asks for an audit. Use it as an internal contract for the rewrite.

## Reject unsupported specificity

The rewrite must not introduce any of the following unless present in the source or separately supplied by the user:

- new events or personal experiences
- new chronology such as “上周”, “三年前”, or “recently”
- new named people, organizations, products, diseases, locations, or datasets
- new examples, anecdotes, causes, motives, or mechanisms
- new statistics, counts, dates, rankings, citations, or quotations
- new product features or implementation details

Making vague prose concrete by inventing detail is a preservation failure, even when the invented detail sounds plausible.

## Handle vague source claims

Do not silently replace a vague source claim with a different specific claim. Prefer one of these moves:

1. Keep the underlying claim and remove decorative staging.
2. Attribute the claim when the source itself is vague or promotional.
3. In audit mode, state that the source lacks enough detail.
4. If a claim is only unsupported significance (for example a generic “milestone” closer), remove the significance while preserving the concrete event it refers to.

## Examples of forbidden additions

- A cafe description that only says it is downtown must not become “opened three years ago”, “known for pour-over coffee”, or “inside a renovated historic building”.
- A generic medical-AI abstract must not acquire a disease target, study years, sample size, or dataset.
- A general opinion about AI must not become a first-person story about talking with friends last week.

## Verification order

1. Compare the rewrite against the hidden claim ledger.
2. Run deterministic `verify` for files or repeat the same invariant check mentally for pasted text.
3. Treat either a semantic addition/loss or an invariant addition/loss as a failure.
4. Repair the rewrite once; do not justify an invented detail as “more human”.
