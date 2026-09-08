#!/usr/bin/env node
import fs from 'node:fs';
import { scanText, verifyPreservation, loadManifest, loadRules, validateRuleObject } from './lib/runtime.mjs';

function usage() {
  console.log(`Polyglot Humanizer 1.0.0\n\nCommands:\n  scan <file|-> [--locale auto|zh-CN|en-US] [--format text|json]\n  verify <before> <after> [--format text|json]\n  validate-rules`);
}
function argValue(args, name, fallback) {
  const i=args.indexOf(name); return i>=0 && args[i+1] ? args[i+1] : fallback;
}
function readInput(file) {
  return file==='-' ? fs.readFileSync(0,'utf8') : fs.readFileSync(file,'utf8');
}
function printScan(r, format) {
  if (format==='json') return console.log(JSON.stringify(r,null,2));
  console.log(`score=${r.score} strong=${r.strongFindings} findings=${r.findings.length}`);
  for (const f of r.findings) console.log(`[${f.severity}/${f.evidence}] ${f.locale} ${f.id}: ${f.text || '(structural)'}\n  ${f.message}`);
}

const args=process.argv.slice(2); const cmd=args[0];
if (!cmd || ['-h','--help','help'].includes(cmd)) { usage(); process.exit(0); }
if (cmd==='scan') {
  const file=args[1]; if (!file) { usage(); process.exit(2); }
  const locale=argValue(args,'--locale','auto'); const format=argValue(args,'--format','text');
  if (!['auto','zh-CN','en-US'].includes(locale)) throw new Error(`Unsupported locale: ${locale}`);
  printScan(scanText(readInput(file), locale), format); process.exit(0);
}
if (cmd==='verify') {
  const before=args[1], after=args[2]; if (!before || !after) { usage(); process.exit(2); }
  const format=argValue(args,'--format','text'); const r=verifyPreservation(readInput(before), readInput(after));
  if (format==='json') console.log(JSON.stringify(r,null,2));
  else {
    console.log(r.pass ? 'PASS preservation check' : 'FAIL preservation check');
    for (const x of r.missing) console.log(`missing ${x.token} x${x.count}`);
    for (const x of r.added) console.log(`added ${x.token} x${x.count}`);
  }
  process.exit(r.pass?0:3);
}
if (cmd==='validate-rules') {
  let errors=[]; const manifest=loadManifest();
  for (const loc of manifest.locales) {
    const rules=loadRules(loc.locale); const ids=new Set();
    for (const r of rules) {
      const es=validateRuleObject(r).map(e=>`${r.id||'?'}: ${e}`); errors.push(...es);
      if (ids.has(r.id)) errors.push(`${r.id}: duplicate id`); ids.add(r.id);
    }
  }
  if (errors.length) { console.error(errors.join('\n')); process.exit(4); }
  console.log('PASS rule validation'); process.exit(0);
}
console.error(`Unknown command: ${cmd}`); usage(); process.exit(2);
