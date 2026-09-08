# Core editing contract

## Goal

Remove generic model priors, not personality. The final prose should keep the source's information while making choices that fit one reader, one subject, one language, and one register.

## Cross-language categories

- **Staging:** announcing importance, honesty, or contrast instead of stating the point.
- **Rhythm by rule:** repeated triads, parallel clauses, identical paragraph shapes, or mechanically varied sentence forms.
- **Inflation:** dressing ordinary facts as pivotal, transformative, profound, or universally important.
- **Formatting by rule:** excessive labels, bold prefixes, title-case headings, or template-like section repetition.
- **Leftovers:** chatbot wrappers, drafting instructions, meta commentary, or conclusions that merely restate the body.
- **Semantic emptiness:** abstract action words with no actor, object, mechanism, result, or evidence.

## Severity

- `P0`: strong enough to justify an edit on one clear occurrence.
- `P1`: strong signal; normally edit unless context makes it purposeful.
- `P2`: contextual; edit when repeated or combined with other signals.
- `P3`: weak; never edit on this signal alone.

## Evidence

- `E3`: supported by comparative corpus evidence.
- `E2`: supported by multiple reliable language/editorial sources or repeated measured observations.
- `E1`: native-speaker/community heuristic with plausible rationale.
- `E0`: experimental; keep conservative.

## Preservation

Treat these as invariants unless the user explicitly changes them: numbers, dates, units, URLs, email addresses, code, commands, paths, Markdown link destinations, literal product/model/version identifiers, and quoted source material.

When the prose is underspecified, simplify it rather than inventing missing specificity.
