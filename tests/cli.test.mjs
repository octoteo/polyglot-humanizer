import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const cli='skills/polyglot-humanizer/scripts/cli.mjs';

test('validate-rules CLI succeeds', () => {
  const r=spawnSync(process.execPath,[cli,'validate-rules'],{encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);
  assert.match(r.stdout,/PASS rule validation/);
});

test('scan CLI emits JSON', () => {
  const r=spawnSync(process.execPath,[cli,'scan','tests/fixtures.zh.txt','--format','json'],{encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);
  const data=JSON.parse(r.stdout);
  assert.ok(data.findings.length>0);
  assert.equal(data.version,'1.0.0');
});
