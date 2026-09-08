# Contributing

Contributions are welcome, especially native-speaker false positives and language-specific rewrite examples.

## Rule requirements

A new rule should include:

1. A stable ID.
2. Locale and category.
3. Severity (`P0`-`P3`).
4. Evidence level (`E0`-`E3`).
5. A detector pattern or documented heuristic.
6. Positive examples.
7. At least one false-positive/exception note when applicable.
8. A rewrite strategy that preserves the source meaning.

Do not add a word to a blacklist merely because its English translation appears in another language pack.

## Tests

Run:

```bash
npm test
```
