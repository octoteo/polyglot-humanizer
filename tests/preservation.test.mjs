import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyPreservation } from '../skills/polyglot-humanizer/scripts/lib/runtime.mjs';

test('preservation passes when invariants remain', () => {
  const a='Release v1.0.0 on 2026-09-08. See https://example.com. Limit is 128GB.';
  const b='We will release v1.0.0 on 2026-09-08 with a 128GB limit. Details: https://example.com.';
  assert.equal(verifyPreservation(a,b).pass,true);
});

test('preservation fails on changed number', () => {
  const a='The limit is 128GB.'; const b='The limit is 64GB.';
  const r=verifyPreservation(a,b); assert.equal(r.pass,false); assert.ok(r.missing.length>0); assert.ok(r.added.length>0);
});

test('url punctuation is normalized consistently', () => {
  const a='See https://example.com.';
  const b='Details are at https://example.com!';
  assert.equal(verifyPreservation(a,b).pass,true);
});

test('markdown link targets are preserved even if link text changes', () => {
  const a='Read [the guide](https://example.com/guide).';
  const b='See [this guide](https://example.com/guide).';
  assert.equal(verifyPreservation(a,b).pass,true);
});

test('preservation allows deduplicating repeated factual tokens', () => {
  const before = '商品页写服务成功率100。聊天里再次提到服务成功率100。';
  const after = '商品页写服务成功率100。';
  const result = verifyPreservation(before, after);
  assert.equal(result.pass, true);
});

test('preservation ignores added outline numbering', () => {
  const before = '请核验商品描述和聊天记录。';
  const after = '1. 请核验商品描述。\n2. 请核验聊天记录。';
  const result = verifyPreservation(before, after);
  assert.equal(result.pass, true);
});
