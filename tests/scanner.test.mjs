import test from 'node:test';
import assert from 'node:assert/strict';
import { scanText, detectLocale, protectText } from '../skills/polyglot-humanizer/scripts/lib/runtime.mjs';

test('detects zh-CN and en-US blocks', () => {
  assert.equal(detectLocale('值得注意的是，这个方案仍然需要测试。'), 'zh-CN');
  assert.equal(detectLocale('This implementation still needs testing.'), 'en-US');
});

test('protects code and urls from style rules', () => {
  const input='正文。`值得注意的是` https://example.com/not-only-but';
  const p=protectText(input).text;
  assert.equal(p.includes('值得注意的是'), false);
  assert.equal(p.includes('example.com'), false);
});

test('finds strong Chinese staging and weak jargon separately', () => {
  const r=scanText('值得注意的是，我们要持续推进体系化建设，形成闭环。','zh-CN');
  assert.ok(r.findings.some(f=>f.id==='zh-staging-001' && f.severity==='P1'));
  assert.ok(r.findings.some(f=>f.id==='zh-jargon-001' && f.severity==='P3'));
});

test('finds English staged opener and stock vocabulary', () => {
  const r=scanText("Here's the thing: we need a robust plan that can leverage existing tooling.",'en-US');
  assert.ok(r.findings.some(f=>f.id==='en-staging-001'));
  assert.ok(r.findings.some(f=>f.id==='en-vocab-001'));
});

test('plain technical prose is not forced into findings', () => {
  const r=scanText('The service retries failed requests twice and stores timestamps in UTC.','en-US');
  assert.equal(r.strongFindings,0);
});

test('mixed document routes Chinese and English blocks independently', () => {
  const r=scanText('值得注意的是，这只是第一版。\n\nHere is the thing: this is a robust baseline.','auto');
  assert.ok(r.blocks.some(b=>b.locale==='zh-CN'));
  assert.ok(r.blocks.some(b=>b.locale==='en-US'));
  assert.ok(r.findings.some(f=>f.locale==='zh-CN'));
  assert.ok(r.findings.some(f=>f.locale==='en-US'));
});

test('weak English vocabulary does not become a strong authorship-like signal', () => {
  const r=scanText('The database uses a robust transaction protocol.','en-US');
  assert.equal(r.strongFindings,0);
  assert.ok(r.findings.every(f=>f.severity==='P2'||f.severity==='P3'));
});
